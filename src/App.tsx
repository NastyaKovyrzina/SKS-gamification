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
};

type Quest = {
  id: string;
  title: string;
  description: string;
  reward: number;
  minAge: number;
  maxAge: number;
  type: string;
  difficulty: string;
  completedToday?: boolean;
};

type LeaderboardItem = {
  userId: string;
  name: string;
  score: number;
  level: number;
};

type ApiResult = {
  ok?: boolean;
  error?: string;
  message?: string;
  users?: User[];
  user?: User;
  quests?: Quest[];
  leaderboard?: LeaderboardItem[];
  reward?: number;
  bonus?: number;
  newBalance?: number;
  prize?: {
    label: string;
    amount: number;
    weight: number;
  };
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
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
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

  async function loadLeaderboard() {
    const data = await requestApi("/api/leaderboard");
    setLeaderboard(data.leaderboard || []);
  }

  async function refreshAll(userId = currentUserId) {
    await loadUsers(userId);
    await loadTodayQuests(userId);
    await loadLeaderboard();
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
    <main style={{ maxWidth: "900px", margin: "0 auto", padding: "24px" }}>
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
                  <p>Награда: {quest.reward} бонусов</p>
                  <button onClick={() => handleCompleteQuest(quest.id)} disabled={quest.completedToday}>
                    {quest.completedToday ? "Уже выполнен" : "Выполнить"}
                  </button>
                </article>
              ))
            )}
          </section>

          <section>
            <h2>Колесо удачи</h2>
            <button onClick={handleSpinWheel}>Крутить колесо</button>
          </section>

          <section>
            <h2>Leaderboard</h2>
            {leaderboard.map((item, index) => (
              <p key={item.userId}>
                {index + 1}. {item.name} — {item.score} бонусов, уровень {item.level}
              </p>
            ))}
          </section>
        </>
      )}
    </main>
  );
}

export default App;
