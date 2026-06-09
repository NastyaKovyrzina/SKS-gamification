import { useEffect, useState } from "react";

const API_URL = "http://localhost:3001";

type User = {
  id: string;
  name: string;
  age: number;
  level: number;
  balance: number;
  streak: number;
  lastLoginDate: string | null;
  xp: number;
  clubTier: string;
  clubTitle?: string;
  bonusMultiplier?: number;
};

type Quest = {
  id: string;
  title: string;
  description: string;
  reward: number;
  finalReward?: number;
  minAge: number;
  maxAge: number;
  type: string;
  difficulty: string;
  completedToday?: boolean;
};

type WeeklyQuiz = {
  id: string;
  title: string;
  description: string;
  reward: number;
  finalReward?: number;
  xpReward: number;
  week: string;
  completedThisWeek?: boolean;
  questions: {
    text: string;
    options: string[];
  }[];
};

type ShopItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  stock?: number;
};

type LeaderboardItem = {
  userId: string;
  name: string;
  score: number;
  level: number;
  xp?: number;
  clubTitle?: string;
};

type ClubTier = {
  id: string;
  title: string;
  minXp: number;
  multiplier: number;
};

type ApiResult = {
  ok?: boolean;
  error?: string;
  message?: string;
  users?: User[];
  user?: User;
  quests?: Quest[];
  quiz?: WeeklyQuiz | null;
  items?: ShopItem[];
  tiers?: ClubTier[];
  leaderboard?: LeaderboardItem[];
  reward?: number;
  bonus?: number;
  newBalance?: number;
  prize?: {
    label: string;
    amount: number;
    weight: number;
  };
  quest?: Quest;
  item?: ShopItem;
};

async function requestApi(path: string, options?: RequestInit): Promise<ApiResult> {
  const response = await fetch(`${API_URL}${path}`, options);
  const data = await response.json();

  if (!response.ok || data.ok === false) {
    throw new Error(data.error || `Ошибка backend: ${response.status}`);
  }

  return data;
}

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserId, setCurrentUserId] = useState("u50");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [weeklyQuiz, setWeeklyQuiz] = useState<WeeklyQuiz | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [clubTiers, setClubTiers] = useState<ClubTier[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [experienceLeaderboard, setExperienceLeaderboard] = useState<LeaderboardItem[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadUsers(selectedUserId = currentUserId) {
    const data = await requestApi("/api/users");
    const usersList = Array.isArray(data) ? data : data.users;

    if (!Array.isArray(usersList)) {
      throw new Error("Backend вернул пользователей не в виде массива");
    }

    setUsers(usersList);

    const selectedUser = usersList.find((user) => user.id === selectedUserId) || usersList[0];

    if (selectedUser) {
      setCurrentUserId(selectedUser.id);
      setCurrentUser(selectedUser);
    }
  }

  async function loadTodayQuests(userId = currentUserId) {
    const data = await requestApi(`/api/quests/today?userId=${userId}`);
    setQuests(data.quests || []);
  }

  async function loadWeeklyQuiz(userId = currentUserId) {
    const data = await requestApi(`/api/weekly-quiz?userId=${userId}`);
    setWeeklyQuiz(data.quiz || null);
    setQuizAnswers([]);
  }

  async function loadShopItems() {
    const data = await requestApi("/api/shop/items");
    setShopItems(data.items || []);
  }

  async function loadClub(userId = currentUserId) {
    const data = await requestApi(`/api/club?userId=${userId}`);
    if (data.user) setCurrentUser(data.user);
    setClubTiers(data.tiers || []);
  }

  async function loadLeaderboard() {
    const data = await requestApi("/api/leaderboard");
    setLeaderboard(data.leaderboard || []);
  }

  async function loadExperienceLeaderboard() {
    const data = await requestApi("/api/leaderboard/xp");
    setExperienceLeaderboard(data.leaderboard || []);
  }

  async function refreshAll(userId = currentUserId) {
    await loadUsers(userId);
    await loadTodayQuests(userId);
    await loadWeeklyQuiz(userId);
    await loadShopItems();
    await loadClub(userId);
    await loadLeaderboard();
    await loadExperienceLeaderboard();
  }

  async function handleSelectUser(userId: string) {
    try {
      setCurrentUserId(userId);
      await refreshAll(userId);
      setMessage("Пользователь переключен");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Не удалось переключить пользователя");
    }
  }

  async function handleDailyCheckin() {
    try {
      const data = await requestApi("/api/daily-checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUserId }),
      });

      if (data.user) setCurrentUser(data.user);

      setMessage(data.message || `Начислено +${data.bonus || 0} бонусов`);
      await refreshAll(currentUserId);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Не удалось получить ежедневный бонус");
    }
  }

  async function handleCompleteQuest(questId: string) {
    try {
      const data = await requestApi("/api/quest/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUserId, questId }),
      });

      if (data.user) setCurrentUser(data.user);

      setMessage(`Квест выполнен: +${data.reward || 0} бонусов`);
      await refreshAll(currentUserId);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Не удалось выполнить квест");
    }
  }

  async function handleCompleteWeeklyQuiz() {
    if (!weeklyQuiz) return;

    try {
      const data = await requestApi("/api/weekly-quiz/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUserId, quizId: weeklyQuiz.id, answers: quizAnswers }),
      });

      if (data.user) setCurrentUser(data.user);

      setMessage(`Еженедельный квиз пройден: +${data.reward || 0} бонусов`);
      await refreshAll(currentUserId);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Не удалось пройти еженедельный квиз");
    }
  }

  async function handleRedeemShopItem(itemId: string) {
    try {
      const data = await requestApi("/api/shop/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUserId, itemId }),
      });

      if (data.user) setCurrentUser(data.user);

      setMessage(data.message || "Покупка оформлена");
      await refreshAll(currentUserId);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Не удалось обменять бонусы");
    }
  }

  async function handleSpinWheel() {
    try {
      const data = await requestApi("/api/wheel/spin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUserId }),
      });

      if (data.user) setCurrentUser(data.user);

      setMessage(`Колесо удачи: ${data.prize?.label || "приз"}. Новый баланс: ${data.newBalance}`);
      await refreshAll(currentUserId);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Не удалось покрутить колесо");
    }
  }

  useEffect(() => {
    async function initApp() {
      try {
        await refreshAll("u50");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Не удалось подключиться к backend");
      } finally {
        setLoading(false);
      }
    }

    initApp();
  }, []);

  return (
    <main style={{ maxWidth: "1000px", margin: "0 auto", padding: "24px" }}>
      <h1>SKS Quest</h1>

      {message && (
        <section style={{ padding: "12px", borderRadius: "8px", background: "#ffffff" }}>
          <strong>Статус:</strong> {message}
        </section>
      )}

      {loading ? (
        <p>Загрузка данных...</p>
      ) : (
        <>
          <section>
            <h2>Выбор пользователя</h2>
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => handleSelectUser(user.id)}
                disabled={user.id === currentUserId}
                style={{ marginRight: "8px", marginBottom: "8px" }}
              >
                {user.name}, {user.age} лет
              </button>
            ))}
          </section>

          <section>
            <h2>Текущий пользователь</h2>
            {currentUser ? (
              <div style={{ border: "1px solid #d1d5db", borderRadius: "12px", padding: "16px", background: "#ffffff" }}>
                <h3>{currentUser.name}</h3>
                <p>Возраст: {currentUser.age}</p>
                <p>Баланс: {currentUser.balance} бонусов</p>
                <p>Уровень: {currentUser.level}</p>
                <p>Streak: {currentUser.streak}</p>
                <p>Опыт клуба: {currentUser.xp}</p>
                <p>Клуб: {currentUser.clubTitle || currentUser.clubTier}</p>
                <p>Множитель бонусов за задания: ×{currentUser.bonusMultiplier || 1}</p>
                <p>Последний вход: {currentUser.lastLoginDate || "ещё не было"}</p>
              </div>
            ) : (
              <p>Пользователь не выбран</p>
            )}
          </section>

          <section>
            <h2>Daily Check-in</h2>
            <button onClick={handleDailyCheckin}>Получить ежедневный бонус</button>
          </section>

          <section>
            <h2>Квесты на сегодня</h2>
            {quests.length === 0 ? (
              <p>Квесты не найдены</p>
            ) : (
              quests.map((quest) => (
                <article
                  key={quest.id}
                  style={{ border: "1px solid #d1d5db", borderRadius: "12px", padding: "16px", marginBottom: "12px", background: "#ffffff" }}
                >
                  <h3>{quest.title}</h3>
                  <p>{quest.description}</p>
                  <p>Базовая награда: {quest.reward} бонусов</p>
                  <p>С учетом клуба: {quest.finalReward || quest.reward} бонусов</p>
                  <button onClick={() => handleCompleteQuest(quest.id)} disabled={quest.completedToday}>
                    {quest.completedToday ? "Уже выполнен" : "Выполнить"}
                  </button>
                </article>
              ))
            )}
          </section>

          <section>
            <h2>Еженедельный квиз</h2>
            {weeklyQuiz ? (
              <article style={{ border: "1px solid #d1d5db", borderRadius: "12px", padding: "16px", background: "#ffffff" }}>
                <h3>{weeklyQuiz.title}</h3>
                <p>{weeklyQuiz.description}</p>
                <p>Неделя: {weeklyQuiz.week}</p>
                <p>Награда: {weeklyQuiz.finalReward || weeklyQuiz.reward} бонусов, опыт: {weeklyQuiz.xpReward}</p>
                {weeklyQuiz.questions.map((question, questionIndex) => (
                  <div key={question.text} style={{ marginBottom: "12px" }}>
                    <strong>{question.text}</strong>
                    {question.options.map((option, optionIndex) => (
                      <label key={option} style={{ display: "block" }}>
                        <input
                          type="radio"
                          name={`quiz-${questionIndex}`}
                          checked={quizAnswers[questionIndex] === optionIndex}
                          onChange={() => {
                            const nextAnswers = [...quizAnswers];
                            nextAnswers[questionIndex] = optionIndex;
                            setQuizAnswers(nextAnswers);
                          }}
                          disabled={weeklyQuiz.completedThisWeek}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                ))}
                <button onClick={handleCompleteWeeklyQuiz} disabled={weeklyQuiz.completedThisWeek}>
                  {weeklyQuiz.completedThisWeek ? "Квиз уже пройден на этой неделе" : "Пройти квиз"}
                </button>
              </article>
            ) : (
              <p>Еженедельный квиз не найден</p>
            )}
          </section>

          <section>
            <h2>Магазин бонусов</h2>
            {shopItems.map((item) => (
              <article
                key={item.id}
                style={{ border: "1px solid #d1d5db", borderRadius: "12px", padding: "16px", marginBottom: "12px", background: "#ffffff" }}
              >
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <p>Категория: {item.category}</p>
                <p>Цена: {item.price} бонусов</p>
                <button onClick={() => handleRedeemShopItem(item.id)} disabled={!currentUser || currentUser.balance < item.price}>
                  Обменять бонусы
                </button>
              </article>
            ))}
          </section>

          <section>
            <h2>Лига / клуб</h2>
            {clubTiers.map((tier) => (
              <p key={tier.id}>
                {tier.title}: от {tier.minXp} опыта, множитель ×{tier.multiplier}
              </p>
            ))}
          </section>

          <section>
            <h2>Колесо удачи</h2>
            <button onClick={handleSpinWheel}>Крутить колесо</button>
          </section>

          <section>
            <h2>Leaderboard</h2>
            {leaderboard.map((item, index) => (
              <p key={item.userId}>
                {index + 1}. {item.name} — {item.score} бонусов, уровень {item.level}, {item.clubTitle || "клуб"}
              </p>
            ))}
          </section>

          <section>
            <h2>Рейтинг по опыту</h2>
            {experienceLeaderboard.map((item, index) => (
              <p key={item.userId}>
                {index + 1}. {item.name} — {item.xp || 0} XP, уровень {item.level}, {item.clubTitle || "клуб"}
              </p>
            ))}
          </section>
        </>
      )}
    </main>
  );
}

export default App;
