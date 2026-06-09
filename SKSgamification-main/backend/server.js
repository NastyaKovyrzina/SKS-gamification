const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = Number(process.env.PORT || 3001);
const DB_PATH = path.join(__dirname, 'data', 'db.json');
const DAILY_BONUS = 5;

const CLUB_TIERS = [
  { id: 'bronze', title: 'Бронзовый клуб', minXp: 0, multiplier: 1 },
  { id: 'silver', title: 'Серебряный клуб', minXp: 100, multiplier: 1.1 },
  { id: 'gold', title: 'Золотой клуб', minXp: 250, multiplier: 1.2 },
  { id: 'platinum', title: 'Платиновый клуб', minXp: 500, multiplier: 1.35 }
];

function readDb() {
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  const db = JSON.parse(raw);
  normalizeDb(db);
  return db;
}

function writeDb(db) {
  normalizeDb(db);
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
}

function normalizeDb(db) {
  db.users ||= [];
  db.quests ||= [];
  db.userProgress ||= [];
  db.weeklyQuizzes ||= [];
  db.weeklyQuizProgress ||= [];
  db.shopItems ||= [];
  db.redemptions ||= [];
  db.leaderboard ||= [];
  db.transactions ||= [];

  for (const user of db.users) {
    user.xp = Number(user.xp || 0);
    user.clubTier = getClubTier(user.xp).id;
  }
}

function todayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function weekKey(date = new Date()) {
  const current = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = current.getUTCDay() || 7;
  current.setUTCDate(current.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(current.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((current - yearStart) / 86400000) + 1) / 7);
  return `${current.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

function daysBetween(dateA, dateB) {
  const oneDay = 24 * 60 * 60 * 1000;
  const a = new Date(`${dateA}T00:00:00.000Z`).getTime();
  const b = new Date(`${dateB}T00:00:00.000Z`).getTime();
  return Math.round((b - a) / oneDay);
}

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload, null, 2);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(body);
}

function sendError(res, statusCode, message, details = null) {
  sendJson(res, statusCode, {
    ok: false,
    error: message,
    details
  });
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1_000_000) {
        req.destroy();
        reject(new Error('Слишком большой JSON body'));
      }
    });
    req.on('end', () => {
      if (!body.trim()) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

function findUser(db, userId) {
  return db.users.find(user => user.id === userId);
}

function getClubTier(xp = 0) {
  return [...CLUB_TIERS]
    .sort((a, b) => b.minXp - a.minXp)
    .find(tier => xp >= tier.minXp) || CLUB_TIERS[0];
}

function getNextClubTier(xp = 0) {
  return CLUB_TIERS.find(tier => tier.minXp > xp) || null;
}

function enrichUser(user) {
  const tier = getClubTier(user.xp || 0);
  const nextTier = getNextClubTier(user.xp || 0);
  return {
    ...user,
    clubTier: tier.id,
    clubTitle: tier.title,
    bonusMultiplier: tier.multiplier,
    nextClubTier: nextTier
  };
}

function updateClub(user, xpToAdd = 0) {
  user.xp = Number(user.xp || 0) + xpToAdd;
  user.clubTier = getClubTier(user.xp).id;
}

function calculateReward(baseReward, user) {
  const tier = getClubTier(user.xp || 0);
  return Math.round(baseReward * tier.multiplier);
}

function recalculateLeaderboard(db) {
  db.leaderboard = db.users
    .map(user => ({
      userId: user.id,
      name: user.name,
      score: user.balance,
      level: user.level,
      xp: user.xp || 0,
      clubTier: getClubTier(user.xp || 0).id,
      clubTitle: getClubTier(user.xp || 0).title
    }))
    .sort((a, b) => b.score - a.score);
}

function getExperienceLeaderboard(db) {
  return db.users
    .map(user => {
      const tier = getClubTier(user.xp || 0);
      return {
        userId: user.id,
        name: user.name,
        xp: user.xp || 0,
        balance: user.balance,
        level: user.level,
        clubTier: tier.id,
        clubTitle: tier.title
      };
    })
    .sort((a, b) => b.xp - a.xp);
}

function publicShopItem(item) {
  const { stock, ...publicItem } = item;
  return publicItem;
}

function addTransaction(db, userId, type, amount, meta = {}) {
  db.transactions.unshift({
    id: crypto.randomUUID(),
    userId,
    type,
    amount,
    meta,
    createdAt: new Date().toISOString()
  });
}

function levelFromBalance(balance) {
  return Math.max(1, Math.floor(balance / 100) + 1);
}

function getDailyQuests(db, user) {
  const available = db.quests.filter(quest => user.age >= quest.minAge && user.age <= quest.maxAge);
  const seed = todayKey().split('-').join('') + user.id;
  const sorted = [...available].sort((a, b) => {
    const hashA = crypto.createHash('sha1').update(seed + a.id).digest('hex');
    const hashB = crypto.createHash('sha1').update(seed + b.id).digest('hex');
    return hashA.localeCompare(hashB);
  });

  return sorted.slice(0, 3).map(quest => ({
    ...quest,
    finalReward: calculateReward(quest.reward, user),
    completedToday: db.userProgress.some(progress =>
      progress.userId === user.id &&
      progress.questId === quest.id &&
      progress.completedAt.slice(0, 10) === todayKey()
    )
  }));
}

function getWeeklyQuiz(db, user) {
  const available = db.weeklyQuizzes.filter(quiz => user.age >= quiz.minAge && user.age <= quiz.maxAge);
  const seed = weekKey() + user.id;
  const sorted = [...available].sort((a, b) => {
    const hashA = crypto.createHash('sha1').update(seed + a.id).digest('hex');
    const hashB = crypto.createHash('sha1').update(seed + b.id).digest('hex');
    return hashA.localeCompare(hashB);
  });
  const quiz = sorted[0];
  if (!quiz) return null;

  const alreadyCompletedThisWeek = db.weeklyQuizProgress.some(progress =>
    progress.userId === user.id &&
    progress.quizId === quiz.id &&
    progress.week === weekKey()
  );

  return {
    ...quiz,
    finalReward: calculateReward(quiz.reward, user),
    week: weekKey(),
    completedThisWeek: alreadyCompletedThisWeek,
    questions: quiz.questions.map(({ correctIndex, ...publicQuestion }) => publicQuestion)
  };
}

function checkWeeklyQuizAnswers(quiz, answers = []) {
  let correct = 0;
  quiz.questions.forEach((question, index) => {
    if (answers[index] === question.correctIndex) correct += 1;
  });
  return {
    correct,
    total: quiz.questions.length,
    passed: correct >= Math.ceil(quiz.questions.length * 0.6)
  };
}

function weightedWheelPrize() {
  const prizes = [
    { label: '+3 бонуса', amount: 3, weight: 35 },
    { label: '+5 бонусов', amount: 5, weight: 30 },
    { label: '+10 бонусов', amount: 10, weight: 20 },
    { label: '+20 бонусов', amount: 20, weight: 10 },
    { label: 'джекпот +50', amount: 50, weight: 5 }
  ];

  const totalWeight = prizes.reduce((sum, prize) => sum + prize.weight, 0);
  let random = Math.random() * totalWeight;

  for (const prize of prizes) {
    random -= prize.weight;
    if (random <= 0) return prize;
  }

  return prizes[0];
}

async function handleRequest(req, res) {
  if (req.method === 'OPTIONS') {
    return sendJson(res, 200, { ok: true });
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const db = readDb();

  if (req.method === 'GET' && url.pathname === '/api/health') {
    return sendJson(res, 200, {
      ok: true,
      service: 'SKS Gamification Backend',
      date: todayKey(),
      week: weekKey(),
      endpoints: [
        'GET /api/users',
        'POST /api/daily-checkin',
        'GET /api/quests/today?userId=u50',
        'POST /api/quest/complete',
        'GET /api/weekly-quiz?userId=u50',
        'POST /api/weekly-quiz/complete',
        'GET /api/shop/items',
        'POST /api/shop/redeem',
        'GET /api/club?userId=u50',
        'POST /api/wheel/spin',
        'GET /api/leaderboard',
        'GET /api/leaderboard/xp',
        'GET /api/transactions?userId=u50'
      ]
    });
  }

  if (req.method === 'GET' && url.pathname === '/api/users') {
    return sendJson(res, 200, { ok: true, users: db.users.map(enrichUser) });
  }

  if (req.method === 'GET' && url.pathname === '/api/leaderboard') {
    recalculateLeaderboard(db);
    writeDb(db);
    return sendJson(res, 200, { ok: true, leaderboard: db.leaderboard });
  }

  if (req.method === 'GET' && url.pathname === '/api/leaderboard/xp') {
    return sendJson(res, 200, { ok: true, leaderboard: getExperienceLeaderboard(db) });
  }

  if (req.method === 'GET' && url.pathname === '/api/transactions') {
    const userId = url.searchParams.get('userId');
    const transactions = userId
      ? db.transactions.filter(item => item.userId === userId)
      : db.transactions;

    return sendJson(res, 200, { ok: true, transactions });
  }

  if (req.method === 'GET' && url.pathname === '/api/club') {
    const userId = url.searchParams.get('userId');
    if (!userId) return sendError(res, 400, 'Передай userId: /api/club?userId=u50');

    const user = findUser(db, userId);
    if (!user) return sendError(res, 404, 'Пользователь не найден');

    return sendJson(res, 200, {
      ok: true,
      user: enrichUser(user),
      tiers: CLUB_TIERS
    });
  }

  if (req.method === 'GET' && url.pathname === '/api/quests/today') {
    const userId = url.searchParams.get('userId');
    if (!userId) return sendError(res, 400, 'Передай userId: /api/quests/today?userId=u50');

    const user = findUser(db, userId);
    if (!user) return sendError(res, 404, 'Пользователь не найден');

    return sendJson(res, 200, {
      ok: true,
      user: enrichUser(user),
      date: todayKey(),
      quests: getDailyQuests(db, user)
    });
  }

  if (req.method === 'POST' && url.pathname === '/api/daily-checkin') {
    const body = await parseBody(req);
    const user = findUser(db, body.userId);
    if (!user) return sendError(res, 404, 'Пользователь не найден');

    const today = todayKey();
    const lastLoginDate = user.lastLoginDate;

    if (lastLoginDate === today) {
      return sendJson(res, 200, {
        ok: true,
        alreadyCheckedIn: true,
        message: 'Бонус за сегодня уже получен',
        user: enrichUser(user)
      });
    }

    if (!lastLoginDate) {
      user.streak = 1;
    } else if (daysBetween(lastLoginDate, today) === 1) {
      user.streak += 1;
    } else {
      user.streak = 1;
    }

    user.lastLoginDate = today;
    user.balance += DAILY_BONUS;
    user.level = levelFromBalance(user.balance);

    addTransaction(db, user.id, 'daily_checkin', DAILY_BONUS, {
      streak: user.streak,
      date: today
    });
    recalculateLeaderboard(db);
    writeDb(db);

    return sendJson(res, 200, {
      ok: true,
      alreadyCheckedIn: false,
      bonus: DAILY_BONUS,
      message: `Daily check-in: +${DAILY_BONUS} бонусов`,
      user: enrichUser(user)
    });
  }

  if (req.method === 'POST' && url.pathname === '/api/quest/complete') {
    const body = await parseBody(req);
    const user = findUser(db, body.userId);
    if (!user) return sendError(res, 404, 'Пользователь не найден');

    const quest = db.quests.find(item => item.id === body.questId);
    if (!quest) return sendError(res, 404, 'Квест не найден');

    if (user.age < quest.minAge || user.age > quest.maxAge) {
      return sendError(res, 403, 'Квест не подходит по возрасту пользователя');
    }

    const alreadyCompletedToday = db.userProgress.some(progress =>
      progress.userId === user.id &&
      progress.questId === quest.id &&
      progress.completedAt.slice(0, 10) === todayKey()
    );

    if (alreadyCompletedToday) {
      return sendError(res, 409, 'Этот квест уже выполнен сегодня');
    }

    const reward = calculateReward(quest.reward, user);
    const xpReward = Number(quest.xpReward || quest.reward);

    db.userProgress.push({
      id: crypto.randomUUID(),
      userId: user.id,
      questId: quest.id,
      completedAt: new Date().toISOString(),
      reward,
      baseReward: quest.reward,
      xpReward
    });

    user.balance += reward;
    updateClub(user, xpReward);
    user.level = levelFromBalance(user.balance);

    addTransaction(db, user.id, 'quest_complete', reward, {
      questId: quest.id,
      questTitle: quest.title,
      baseReward: quest.reward,
      xpReward,
      clubTier: user.clubTier
    });
    recalculateLeaderboard(db);
    writeDb(db);

    return sendJson(res, 200, {
      ok: true,
      reward,
      baseReward: quest.reward,
      xpReward,
      newBalance: user.balance,
      user: enrichUser(user),
      quest
    });
  }

  if (req.method === 'GET' && url.pathname === '/api/weekly-quiz') {
    const userId = url.searchParams.get('userId');
    if (!userId) return sendError(res, 400, 'Передай userId: /api/weekly-quiz?userId=u50');

    const user = findUser(db, userId);
    if (!user) return sendError(res, 404, 'Пользователь не найден');

    return sendJson(res, 200, {
      ok: true,
      user: enrichUser(user),
      quiz: getWeeklyQuiz(db, user)
    });
  }

  if (req.method === 'POST' && url.pathname === '/api/weekly-quiz/complete') {
    const body = await parseBody(req);
    const user = findUser(db, body.userId);
    if (!user) return sendError(res, 404, 'Пользователь не найден');

    const quiz = db.weeklyQuizzes.find(item => item.id === body.quizId);
    if (!quiz) return sendError(res, 404, 'Еженедельный квиз не найден');

    if (user.age < quiz.minAge || user.age > quiz.maxAge) {
      return sendError(res, 403, 'Квиз не подходит по возрасту пользователя');
    }

    const week = weekKey();
    const alreadyCompletedThisWeek = db.weeklyQuizProgress.some(progress =>
      progress.userId === user.id &&
      progress.quizId === quiz.id &&
      progress.week === week
    );

    if (alreadyCompletedThisWeek) {
      return sendError(res, 409, 'Еженедельный квиз уже пройден на этой неделе');
    }

    const result = checkWeeklyQuizAnswers(quiz, body.answers || []);
    if (!result.passed) {
      db.weeklyQuizProgress.push({
        id: crypto.randomUUID(),
        userId: user.id,
        quizId: quiz.id,
        week,
        completedAt: new Date().toISOString(),
        passed: false,
        correct: result.correct,
        total: result.total,
        reward: 0,
        xpReward: 0
      });
      writeDb(db);
      return sendError(res, 400, `Квиз не пройден: ${result.correct}/${result.total}. Нужно набрать минимум 60%.`);
    }

    const reward = calculateReward(quiz.reward, user);
    const xpReward = Number(quiz.xpReward || quiz.reward);

    db.weeklyQuizProgress.push({
      id: crypto.randomUUID(),
      userId: user.id,
      quizId: quiz.id,
      week,
      completedAt: new Date().toISOString(),
      passed: true,
      correct: result.correct,
      total: result.total,
      reward,
      baseReward: quiz.reward,
      xpReward
    });

    user.balance += reward;
    updateClub(user, xpReward);
    user.level = levelFromBalance(user.balance);

    addTransaction(db, user.id, 'weekly_quiz_complete', reward, {
      quizId: quiz.id,
      quizTitle: quiz.title,
      correct: result.correct,
      total: result.total,
      baseReward: quiz.reward,
      xpReward,
      clubTier: user.clubTier
    });
    recalculateLeaderboard(db);
    writeDb(db);

    return sendJson(res, 200, {
      ok: true,
      reward,
      baseReward: quiz.reward,
      xpReward,
      result,
      newBalance: user.balance,
      user: enrichUser(user),
      quiz: { ...quiz, questions: quiz.questions.map(({ correctIndex, ...q }) => q) }
    });
  }

  if (req.method === 'GET' && url.pathname === '/api/shop/items') {
    return sendJson(res, 200, { ok: true, items: db.shopItems.filter(item => item.isActive !== false).map(publicShopItem) });
  }

  if (req.method === 'POST' && url.pathname === '/api/shop/redeem') {
    const body = await parseBody(req);
    const user = findUser(db, body.userId);
    if (!user) return sendError(res, 404, 'Пользователь не найден');

    const item = db.shopItems.find(entry => entry.id === body.itemId && entry.isActive !== false);
    if (!item) return sendError(res, 404, 'Товар магазина не найден');

    if (item.stock <= 0) return sendError(res, 409, 'Товар закончился');
    if (user.balance < item.price) return sendError(res, 409, 'Недостаточно бонусов для обмена');

    user.balance -= item.price;
    user.level = levelFromBalance(user.balance);
    item.stock -= 1;

    const redemption = {
      id: crypto.randomUUID(),
      userId: user.id,
      itemId: item.id,
      itemTitle: item.title,
      price: item.price,
      status: 'reserved',
      createdAt: new Date().toISOString()
    };
    db.redemptions.unshift(redemption);

    addTransaction(db, user.id, 'shop_redeem', -item.price, {
      itemId: item.id,
      itemTitle: item.title,
      category: item.category
    });
    recalculateLeaderboard(db);
    writeDb(db);

    return sendJson(res, 200, {
      ok: true,
      message: `Покупка оформлена: ${item.title}`,
      redemption,
      item: publicShopItem(item),
      newBalance: user.balance,
      user: enrichUser(user)
    });
  }

  if (req.method === 'POST' && url.pathname === '/api/wheel/spin') {
    const body = await parseBody(req);
    const user = findUser(db, body.userId);
    if (!user) return sendError(res, 404, 'Пользователь не найден');

    const alreadySpunToday = db.transactions.some(transaction =>
      transaction.userId === user.id &&
      transaction.type === 'wheel_spin' &&
      transaction.createdAt.slice(0, 10) === todayKey()
    );

    if (alreadySpunToday) {
      return sendError(res, 409, 'Колесо уже было использовано сегодня');
    }

    const prize = weightedWheelPrize();
    user.balance += prize.amount;
    user.level = levelFromBalance(user.balance);

    addTransaction(db, user.id, 'wheel_spin', prize.amount, {
      prize: prize.label,
      probabilityWeight: prize.weight
    });
    recalculateLeaderboard(db);
    writeDb(db);

    return sendJson(res, 200, {
      ok: true,
      prize,
      newBalance: user.balance,
      user: enrichUser(user)
    });
  }

  return sendError(res, 404, 'Такого эндпоинта нет');
}

const server = http.createServer((req, res) => {
  handleRequest(req, res).catch(error => {
    console.error(error);
    sendError(res, 500, 'Ошибка сервера', error.message);
  });
});

server.listen(PORT, () => {
  console.log(`Backend API started: http://localhost:${PORT}`);
});
