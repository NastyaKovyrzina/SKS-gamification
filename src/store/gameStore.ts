import { create } from 'zustand';
import { CURRENT_USER } from '../data/mockData';

export interface CustomGame {
  id: string;
  type: 'game';
  title: string;
  description: string;
  reward: number;
}

export interface CustomQuiz {
  id: string;
  type: 'test';
  title: string;
  reward: number;
  questions: {
    text: string;
    options: string[];
    correctIndex: number;
  }[];
}

// Система клубов
export const CLUBS = {
  bronze: { name: 'Бронзовый клуб', minHP: 0, icon: '🥉', color: '#cd7f32' },
  silver: { name: 'Серебряный клуб', minHP: 100, icon: '', color: '#c0c0c0' },
  gold: { name: 'Золотой клуб', minHP: 300, icon: '🥇', color: '#ffd700' },
  platinum: { name: 'Платиновый клуб', minHP: 600, icon: '💎', color: '#e5e4e2' },
};

export type ClubType = keyof typeof CLUBS;

interface GameState {
  currentUser: { 
    id: number; 
    name: string; 
    age: number; 
    balance: number; 
    hp: number;
    club: ClubType;
    streak: number; 
    lastQuestDate: string;
    freeSpins: number;
    avatar: string 
  };
  currentLevelIndex: number;
  weeklyQuizCompleted: boolean;
  customGames: CustomGame[];
  customQuizzes: CustomQuiz[];

  addCoins: (amount: number) => void;
  addHP: (amount: number) => void;
  advanceLevel: () => void;
  completeWeeklyQuest: () => void;
  resetProgress: () => void;
  addCustomGame: (game: CustomGame) => void;
  addCustomQuiz: (quiz: CustomQuiz) => void;
  updateStreak: () => number;
  addFreeSpin: () => void;
  useFreeSpin: () => boolean;
}

const getClubByHP = (hp: number): ClubType => {
  if (hp >= 600) return 'platinum';
  if (hp >= 300) return 'gold';
  if (hp >= 100) return 'silver';
  return 'bronze';
};

export const useGameStore = create<GameState>((set, get) => ({
  currentUser: { 
    ...CURRENT_USER, 
    hp: 0, 
    club: 'bronze',
    streak: 0,
    lastQuestDate: '',
    freeSpins: 0
  },
  currentLevelIndex: 0,
  weeklyQuizCompleted: false,
  customGames: [],
  customQuizzes: [],

  addCoins: (amount) => set((state) => ({
    currentUser: { ...state.currentUser, balance: state.currentUser.balance + amount }
  })),

  addHP: (amount) => set((state) => {
    const newHP = state.currentUser.hp + amount;
    const newClub = getClubByHP(newHP);
    return {
      currentUser: { 
        ...state.currentUser, 
        hp: newHP,
        club: newClub
      }
    };
  }),

  advanceLevel: () => set((state) => ({ currentLevelIndex: state.currentLevelIndex + 1 })),
  completeWeeklyQuest: () => set({ weeklyQuizCompleted: true }),
  
  resetProgress: () => set({ 
    currentLevelIndex: 0, 
    weeklyQuizCompleted: false,
    currentUser: { 
      ...CURRENT_USER, 
      hp: 0, 
      club: 'bronze',
      streak: 0,
      lastQuestDate: '',
      freeSpins: 0
    }
  }),

  addCustomGame: (game) => set((state) => ({ customGames: [...state.customGames, game] })),
  addCustomQuiz: (quiz) => set((state) => ({ customQuizzes: [...state.customQuizzes, quiz] })),

  updateStreak: () => {
    const today = new Date().toDateString();
    const lastDate = get().currentUser.lastQuestDate;
    let newStreak = get().currentUser.streak;

    if (lastDate) {
      const lastQuest = new Date(lastDate);
      const todayDate = new Date();
      const diffDays = Math.floor(
        (todayDate.getTime() - lastQuest.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 1) {
        newStreak += 1;
      } else if (diffDays > 1) {
        newStreak = 1;
      } else {
        // Тот же день - не меняем
        return newStreak;
      }
    } else {
      newStreak = 1;
    }

    set((state) => ({
      currentUser: {
        ...state.currentUser,
        streak: newStreak,
        lastQuestDate: today
      }
    }));

    return newStreak;
  },

  addFreeSpin: () => {
    set((state) => ({
      currentUser: {
        ...state.currentUser,
        freeSpins: state.currentUser.freeSpins + 1
      }
    }));
  },

  useFreeSpin: () => {
    if (get().currentUser.freeSpins > 0) {
      set((state) => ({
        currentUser: {
          ...state.currentUser,
          freeSpins: state.currentUser.freeSpins - 1
        }
      }));
      return true;
    }
    return false;
  },
}));