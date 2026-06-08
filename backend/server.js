const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = Number(process.env.PORT || 3001);
const DB_PATH = path.join(__dirname, 'data', 'db.json');
const DAILY_BONUS = 5;

function readDb() {
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(raw);
}

function writeDb(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
}

function todayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
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
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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

function recalculateLeaderboard(db) {
  db.leaderboard = db.users
    .map(user => ({
      userId: user.id,
      name: user.name,
      score: user.balance,
      level: user.level
    }))
    .sort((a, b) => b.score - a.score);
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
    completedToday: db.userProgress.some(progress =>
      progress.userId === user.id &&
      progress.questId === quest.id &&
      progress.completedAt.slice(0, 10) === todayKey()
    )
  }));
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
      endpoints: [
        'GET /api/users',
        'POST /api/daily-checkin',
        'GET /api/quests/today?userId=u50',
        'POST /api/quest/complete',
        'POST /api/wheel/spin',
        'GET /api/leaderboard',
        'GET /api/transactions?userId=u50'
      ]
    });
  }

  if (req.method === 'GET' && url.pathname === '/api/users') {
    return sendJson(res, 200, { ok: true, users: db.users });
  }

  if (req.method === 'GET' && url.pathname === '/api/leaderboard') {
    recalculateLeaderboard(db);
    writeDb(db);
    return sendJson(res, 200, { ok: true, leaderboard: db.leaderboard });
  }

  if (req.method === 'GET' && url.pathname === '/api/transactions') {
    const userId = url.searchParams.get('userId');
    const transactions = userId
      ? db.transactions.filter(item => item.userId === userId)
      : db.transactions;

    return sendJson(res, 200, { ok: true, transactions });
  }

  if (req.method === 'GET' && url.pathname === '/api/quests/today') {
    const userId = url.searchParams.get('userId');
    if (!userId) return sendError(res, 400, 'Передай userId: /api/quests/today?userId=u50');

    const user = findUser(db, userId);
    if (!user) return sendError(res, 404, 'Пользователь не найден');

    return sendJson(res, 200, {
      ok: true,
      user,
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
        user
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
      user
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

    db.userProgress.push({
      id: crypto.randomUUID(),
      userId: user.id,
      questId: quest.id,
      completedAt: new Date().toISOString(),
      reward: quest.reward
    });

    user.balance += quest.reward;
    user.level = levelFromBalance(user.balance);

    addTransaction(db, user.id, 'quest_complete', quest.reward, {
      questId: quest.id,
      questTitle: quest.title
    });
    recalculateLeaderboard(db);
    writeDb(db);

    return sendJson(res, 200, {
      ok: true,
      reward: quest.reward,
      newBalance: user.balance,
      user,
      quest
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
      user
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
