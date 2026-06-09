// src/api/gameApi.ts
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const gameApi = {
  // Получить состояние пользователя
  getUserState: async () => {
    const res = await fetch(`${API_BASE}/user/me`);
    return res.json();
  },

  // Выполнить ежедневный квест
  completeDailyQuest: async (questId: string) => {
    const res = await fetch(`${API_BASE}/quests/daily/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questId }),
    });
    return res.json();
  },

  // Пройти недельную викторину
  completeWeeklyQuiz: async () => {
    const res = await fetch(`${API_BASE}/quizzes/weekly/complete`, { method: 'POST' });
    return res.json();
  },

  // Крутить колесо фортуны
  spinWheel: async () => {
    const res = await fetch(`${API_BASE}/wheel/spin`, { method: 'POST' });
    return res.json();
  },

  // Получить лидерборд
  getLeaderboard: async () => {
    const res = await fetch(`${API_BASE}/leaderboard`);
    return res.json();
  },

  // Админка: создать квест
  createQuest: async (questData: any) => {
    const res = await fetch(`${API_BASE}/admin/quests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(questData),
    });
    return res.json();
  }
};