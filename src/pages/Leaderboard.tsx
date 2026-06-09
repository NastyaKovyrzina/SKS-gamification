import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import jewelryBg from '../assets/jewelry-bg.jpg';

interface Participant {
  id: number;
  name: string;
  avatar: string;
  score: number;
  rank: number;
}

const participants: Participant[] = [
  { id: 1, name: 'Анастасия К.', avatar: '', score: 10250, rank: 1 },
  { id: 2, name: 'Елена Р.', avatar: '👩', score: 9842, rank: 2 },
  { id: 3, name: 'Кенджи Т.', avatar: '👨', score: 9715, rank: 3 },
  { id: 4, name: 'Алёша В.', avatar: '👩', score: 9630, rank: 4 },
  { id: 5, name: 'Иван С.', avatar: '👨', score: 9520, rank: 5 },
  { id: 6, name: 'Алёша Т.', avatar: '👩', score: 9410, rank: 24 },
  { id: 7, name: 'Елена Р.', avatar: '👩', score: 9250, rank: 38 },
  { id: 8, name: 'Алёна Т.', avatar: '👱', score: 9100, rank: 10 },
  { id: 9, name: 'Михаил И.', avatar: '👨', score: 8950, rank: 12 },
  { id: 10, name: 'Сара К.', avatar: '👩', score: 8800, rank: 15 },
];

export default function Leaderboard() {
  const { currentUser } = useGameStore();
  const [activeTab, setActiveTab] = useState<'coins' | 'hp'>('hp');

  const getMedalColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-400 to-yellow-600';
    if (rank === 2) return 'from-gray-300 to-gray-500';
    if (rank === 3) return 'from-amber-600 to-amber-800';
    return 'from-gray-200 to-gray-400';
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div 
      className="min-h-screen relative overflow-hidden pb-24 bg-cover bg-center bg-no-repeat"
      style={{ 
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        backgroundImage: `url(${jewelryBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Верхняя панель с монетами и HP */}
      <div className="relative z-10 flex justify-center gap-6 pt-6 px-4">
        {/* Coins */}
        <button 
          onClick={() => setActiveTab('coins')}
          className={`px-8 py-3 rounded-2xl font-bold text-lg shadow-xl transition-all ${
            activeTab === 'coins'
              ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white'
              : 'bg-gray-200 text-gray-600'
          }`}
          style={activeTab === 'coins' ? { 
            boxShadow: '0 6px 20px rgba(234, 88, 12, 0.5), inset 0 2px 4px rgba(255,255,255,0.3)'
          } : {}}
        >
          <span className="flex items-center gap-2">
            <span className="text-2xl">🪙</span>
            <span>Баллы</span>
          </span>
        </button>
        
        {/* HP */}
        <button 
          onClick={() => setActiveTab('hp')}
          className={`px-8 py-3 rounded-2xl font-bold text-lg shadow-xl transition-all ${
            activeTab === 'hp'
              ? 'bg-gradient-to-br from-red-500 to-red-700 text-white'
              : 'bg-gray-200 text-gray-600'
          }`}
          style={activeTab === 'hp' ? { 
            boxShadow: '0 6px 20px rgba(220, 38, 38, 0.5), inset 0 2px 4px rgba(255,255,255,0.3)'
          } : {}}
        >
          <span className="flex items-center gap-2">
            <span>XP</span>
          </span>
        </button>
      </div>

      {/* Основной контент */}
      <div className="relative z-10 flex flex-col items-center px-4 mt-8">
        
        {/* Белая карточка с топом */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md"
             style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
          
          {/* Заголовок */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Топ игроков</h2>
            <p className="text-gray-600 text-sm mt-1">
              Топ игроков по {activeTab === 'coins' ? 'баллам' : 'HP'}
            </p>
          </div>

          {/* Список участников */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto px-2">
            {participants.map((participant, index) => {
              const isTop3 = participant.rank <= 3;
              const isCurrentUser = participant.id === currentUser.id;
              
              return (
                <div 
                  key={participant.id}
                  className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
                    isCurrentUser 
                      ? 'bg-gradient-to-r from-orange-100 to-amber-100 border-2 border-orange-400' 
                      : isTop3 
                      ? 'bg-gradient-to-r from-yellow-50 to-amber-50' 
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  {/* Ранг/Медаль */}
                  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                    {isTop3 ? (
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getMedalColor(participant.rank)} flex items-center justify-center text-2xl shadow-lg`}>
                        {getRankBadge(participant.rank)}
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-400 flex items-center justify-center text-lg font-bold text-gray-600 shadow-md">
                        {getRankBadge(participant.rank)}
                      </div>
                    )}
                  </div>

                  {/* Аватар и имя */}
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-2xl shadow-md">
                      {participant.avatar}
                    </div>
                    <div className="flex-1">
                      <p className={`font-bold ${
                        isCurrentUser ? 'text-orange-700' : 'text-gray-800'
                      }`}>
                        {participant.name}
                        {isCurrentUser && ' (Вы)'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {activeTab === 'coins' ? 'Баллы' : 'XP'}
                      </p>
                    </div>
                  </div>

                  {/* Очки */}
                  <div className="flex-shrink-0 text-right">
                    <p className={`text-xl font-bold ${
                      isCurrentUser ? 'text-orange-700' : 'text-gray-800'
                    }`}>
                      {participant.score.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {activeTab === 'coins' ? '🪙' : '⭐'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Текущий пользователь (если не в топе) */}
          {!participants.find(p => p.id === currentUser.id) && (
            <div className="mt-4 pt-4 border-t-2 border-gray-200">
              <p className="text-sm text-gray-600 text-center mb-2">Your position:</p>
              <div className="flex items-center gap-4 p-3 rounded-xl bg-gradient-to-r from-orange-100 to-amber-100 border-2 border-orange-400">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-400 flex items-center justify-center text-lg font-bold text-gray-600">
                  #156
                </div>
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-2xl shadow-md">
                    👤
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-orange-700">
                      {currentUser.name || 'You'} (You)
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-orange-700">
                    {currentUser.balance.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}