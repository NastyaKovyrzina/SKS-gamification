import React, { useState } from 'react';
import { useGameStore, CLUBS } from '../store/gameStore';
import DailyQuestSelector from '../quests/DailyQuestSelector';
import WeeklyQuiz from '../quests/WeeklyQuiz';
import InfoModal from '../components/InfoModal';
import jewelryBg from '../assets/jewelry-bg.jpg';
import bronzeMedal from '../assets/bronze-medal.png';
import silverMedal from '../assets/silver-medal.png';
import dragon from '../assets/dragon.png';
import coinCurrent from '../assets/coin-current.png';
import coinsReward from '../assets/coins-reward.png';
import DailyQuestChoice from '../components/DailyQuestChoice';
import DailyQuiz from '../components/DailyQuiz';
import AttentionGame from '../components/AttentionGame';
import BonusHint from '../components/BonusHint';

export default function GameHub() {
  const { 
    currentUser, 
    currentLevelIndex, 
    addCoins, 
    addHP,
    advanceLevel, 
    resetProgress,
    weeklyQuizCompleted,
    completeWeeklyQuest,
    updateStreak,
    addFreeSpin
  } = useGameStore();
  
  const [showDailyModal, setShowDailyModal] = useState(false);
  const [showWeeklyModal, setShowWeeklyModal] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showRewardAnimation, setShowRewardAnimation] = useState(false);
  const [rewardAmount, setRewardAmount] = useState(0);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showAttentionModal, setShowAttentionModal] = useState(false);
  const [showStreakReward, setShowStreakReward] = useState(false);
  const [streakRewardData, setStreakRewardData] = useState<{ days: number; reward: string } | null>(null);
  
  const currentDay = currentLevelIndex + 1;
  const totalDays = 30;
  const monthName = "Июнь 2025";

  const handleDailyComplete = (reward: number) => {
    if (currentDay > currentLevelIndex + 1) return;
    
    addCoins(reward);
    addHP(10);
    advanceLevel();
    
    // Обновляем серию
    const newStreak = updateStreak();
    
    // Проверяем награды за серию
    if (newStreak === 10) {
      setStreakRewardData({ days: 10, reward: '3 бесплатные прокрутки колеса!' });
      addFreeSpin();
      addFreeSpin();
      addFreeSpin();
      setShowStreakReward(true);
    } else if (newStreak === 20) {
      setStreakRewardData({ days: 20, reward: '5 бесплатных прокруток + 500 бонусов!' });
      for (let i = 0; i < 5; i++) addFreeSpin();
      addCoins(500);
      setShowStreakReward(true);
    } else if (newStreak === 30) {
      setStreakRewardData({ days: 30, reward: '10 бесплатных прокруток + 1000 бонусов!' });
      for (let i = 0; i < 10; i++) addFreeSpin();
      addCoins(1000);
      setShowStreakReward(true);
    }
    
    setShowDailyModal(false);
    
    // Показываем анимацию монеток
    setRewardAmount(reward);
    setShowRewardAnimation(true);
    setTimeout(() => setShowRewardAnimation(false), 2000);
  };

  const handleWeeklyComplete = () => {
    addCoins(100);
    addHP(50);
    completeWeeklyQuest();
    setShowWeeklyModal(false);
    
    // Показываем анимацию монеток
    setRewardAmount(100);
    setShowRewardAnimation(true);
    setTimeout(() => setShowRewardAnimation(false), 2000);
  };

  const handleDayClick = (day: number) => {
    if (day === currentDay) {
        setShowDailyModal(true);
    } else if (day < currentDay) {
        alert(`День ${day} уже пройден! ✅`);
    } else {
        alert(`Ещё рано! Приходите ${day} июня`);
    }
  };

  const currentClub = CLUBS[currentUser.club];
  const nextClub = Object.entries(CLUBS).find(([key, club]) => 
    club.minHP > currentUser.hp
  );
  const progressToNextClub = nextClub 
    ? ((currentUser.hp - currentClub.minHP) / (nextClub[1].minHP - currentClub.minHP)) * 100
    : 100;

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
        <BonusHint />

      {/* Верхняя панель с монетами и HP */}
      <div className="relative z-10 flex justify-center gap-6 pt-6 px-4">
        <button 
            className="bg-gradient-to-br from-orange-400 to-orange-600 text-white px-8 py-3 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all active:scale-95"
            style={{ 
              boxShadow: '0 6px 20px rgba(234, 88, 12, 0.5), inset 0 2px 4px rgba(255,255,255,0.3)',
              minWidth: '160px'
            }}
        >
            {currentUser.balance} бонусов
        </button>
        
        <button 
            className="bg-gradient-to-br from-red-500 to-red-700 text-white px-8 py-3 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all active:scale-95"
            style={{ 
              boxShadow: '0 6px 20px rgba(220, 38, 38, 0.5), inset 0 2px 4px rgba(255,255,255,0.3)',
              minWidth: '120px'
            }}
        >
            XP: {currentUser.hp}
        </button>
      </div>

      {/* Индикатор серии */}
      {currentUser.streak > 0 && (
        <div className="relative z-10 flex justify-center mt-4 px-4">
          <div 
            className="bg-gradient-to-br from-purple-500 to-pink-600 text-white px-6 py-2 rounded-2xl font-bold shadow-xl flex items-center gap-3 flex-wrap justify-center"
            style={{ boxShadow: '0 6px 20px rgba(168, 85, 247, 0.5)' }}
          >
            <span className="flex items-center gap-2">
              <span className="text-xl">🔥</span>
              <span>Серия: {currentUser.streak} дней</span>
            </span>
            {currentUser.freeSpins > 0 && (
              <span className="flex items-center gap-2">
                <span className="text-xl">🎡</span>
                <span>{currentUser.freeSpins} free spins</span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Основной контент */}
      <div className="relative z-10 flex flex-col items-center px-4 mt-6">
        
        <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md"
            style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
          
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">{monthName} - День {currentDay} из {totalDays}</h2>
          </div>

          {/* Шкала прогресса клуба */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <img src={bronzeMedal} alt="Bronze" className="w-16 h-16 object-contain" />
                  <span className="text-xl font-bold text-gray-800">{currentClub.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold text-gray-800">
                      {nextClub ? nextClub[1].name : 'MAX'}
                  </span>
                  <img src={silverMedal} alt="Silver" className="w-16 h-16 object-contain" />
                </div>
            </div>
            
            <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div 
                      className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(progressToNextClub, 100)}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-gray-700 w-14 text-right">
                  {Math.round(progressToNextClub)}%
                </span>
            </div>
          </div>

          {/* Список дней */}
          <div 
            className="relative overflow-y-auto px-4"
            style={{ maxHeight: '240px', paddingTop: '80px', paddingBottom: '20px' }}
          >
            <div className="absolute left-1/2 top-[80px] bottom-[20px] w-1 bg-gradient-to-b from-orange-400 via-orange-500 to-red-500 transform -translate-x-1/2 rounded-full"/>

            <div className="relative flex flex-col items-center gap-3">
              {Array.from({ length: totalDays }, (_, i) => i + 1).map((day) => {
                const isCurrentDay = day === currentDay;
                const isPastDay = day < currentDay;
                const isFutureDay = day > currentDay;

                return (
                  <div key={day} className="relative flex items-center gap-3 z-10 w-full justify-center">
                    <span className={`text-base font-bold w-14 text-right ${
                      isCurrentDay ? 'text-red-600' : isPastDay ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      День {day}
                    </span>

                    <div className="relative w-20 h-20 flex items-center justify-center">
                      {isPastDay ? (
                        <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-md">
                          <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                          </svg>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => handleDayClick(day)}
                            disabled={isFutureDay}
                            className={`relative transition-all duration-300 ${
                              isCurrentDay ? 'scale-110' : ''
                            } ${isFutureDay ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <img 
                                src={coinCurrent}
                                alt={`Day ${day}`}
                                className="w-16 h-16 object-contain drop-shadow-md"
                            />
                            
                            {isFutureDay && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <svg className="w-6 h-6 text-gray-600 drop-shadow-sm" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                                </svg>
                              </div>
                            )}
                          </button>

                          {isCurrentDay && (
                            <div 
                                className="absolute animate-bounce" 
                                style={{ 
                                top: '-70px',
                                left: '50%',
                                transform: 'translateX(-50%) scale(3)',
                                zIndex: 100
                                }}
                            >
                                <div className="relative flex flex-col items-center">
                                <img 
                                    src={dragon} 
                                    alt="Dragon" 
                                    style={{ 
                                    width: '80px', 
                                    height: '80px', 
                                    objectFit: 'contain',
                                    filter: 'drop-shadow(0 3px 5px rgba(0,0,0,0.3))'
                                    }}
                                />
                                <div 
                                    className="bg-red-600 text-white font-bold px-4 py-1.5 rounded-full whitespace-nowrap shadow-lg" 
                                    style={{ fontSize: '14px', marginTop: '-18px' }}
                                >
                                    Сегодня!
                                </div>
                              </div>
                            </div>
                            )}
                        </>
                      )}
                    </div>

                    <div className="w-14"/>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <button
                onClick={() => setShowWeeklyModal(true)}
                disabled={weeklyQuizCompleted}
                className={`px-10 py-4 rounded-2xl font-bold text-white text-lg transition-all active:scale-95 ${
                  weeklyQuizCompleted
                      ? 'bg-gray-400 cursor-not-allowed opacity-60'
                      : 'bg-gradient-to-br from-red-500 to-red-700 hover:from-red-600 hover:to-red-800'
                }`}
                style={!weeklyQuizCompleted ? { 
                  boxShadow: '0 6px 20px rgba(220, 38, 38, 0.5), inset 0 2px 4px rgba(255,255,255,0.3)'
                } : {}}
            >
                {weeklyQuizCompleted ? 'Пройдено' : 'Еженедельный тест'}
            </button>
          </div>
        </div>
      </div>

      {/* Модалка выбора задания */}
      {showDailyModal && (
        <DailyQuestChoice
            onSelectQuestions={() => {
                setShowDailyModal(false);
                setShowQuizModal(true);
            }}
            onSelectAttention={() => {
                setShowDailyModal(false);
                setShowAttentionModal(true);
            }}
            onClose={() => setShowDailyModal(false)}
        />
      )}

      {/* Модалка с тестом */}
      {showQuizModal && (
        <DailyQuiz
          onComplete={(reward) => {
            addCoins(reward);
            addHP(10);
            advanceLevel();
            setShowQuizModal(false);
            
            setRewardAmount(reward);
            setShowRewardAnimation(true);
            setTimeout(() => setShowRewardAnimation(false), 2000);
          }}
          onClose={() => setShowQuizModal(false)}
        />
      )}

      {/* Модалка игры на внимательность */}
      {showAttentionModal && (
        <AttentionGame
          onComplete={(reward) => {
            addCoins(reward);
            addHP(10);
            advanceLevel();
            setShowAttentionModal(false);
            
            setRewardAmount(reward);
            setShowRewardAnimation(true);
            setTimeout(() => setShowRewardAnimation(false), 2000);
          }}
          onClose={() => setShowAttentionModal(false)}
        />
      )}

      {/* Модалка еженедельного теста */}
      {showWeeklyModal && !weeklyQuizCompleted && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border-2 border-red-500 rounded-2xl p-5 max-w-md w-full">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-bold text-gray-800">Викторина недели</h3>
              <button onClick={() => setShowWeeklyModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <p className="text-gray-600 text-sm mb-4">Проверь свою эрудицию!</p>
            <WeeklyQuiz onComplete={handleWeeklyComplete} />
          </div>
        </div>
      )}

      {/* Модалка информации */}
      <InfoModal isOpen={showInfo} onClose={() => setShowInfo(false)} />

      {/* Кнопка сброса */}
      <div className="fixed bottom-20 right-4 z-30">
        <button 
          onClick={resetProgress}
          className="bg-gray-200 hover:bg-gray-300 text-gray-600 text-[10px] px-3 py-1.5 rounded-lg border border-gray-300"
        >
          Сброс прогресса
        </button>
      </div>

      {/* АНИМАЦИЯ ПОЛУЧЕНИЯ МОНЕТОК */}
      {/* АНИМАЦИЯ ПОЛУЧЕНИЯ МОНЕТОК */}
      {showRewardAnimation && (
        <div className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center">
            <div 
            className="relative flex flex-col items-center"
            style={{ animation: 'floatUpFade 2s ease-out forwards' }}
            >
            <img 
                src={coinsReward} 
                alt="Reward"
                className="w-48 h-48 object-contain drop-shadow-2xl"
                style={{ filter: 'drop-shadow(0 10px 20px rgba(234, 179, 8, 0.5))' }}
            />
            </div>
        </div>
      )}

      {/* Модалка награды за серию */}
      {showStreakReward && streakRewardData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[150]">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center relative overflow-hidden">
            <div className="absolute top-4 left-4 w-12 h-12 opacity-40">
              <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-lg"/>
            </div>
            <div className="absolute top-4 right-4 w-8 h-8 opacity-40">
              <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-500 rounded-full shadow-lg"/>
            </div>

            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Невероятно!
            </h3>
            <p className="text-2xl font-bold text-gray-800 mb-4">
              {streakRewardData.days} дней подряд!
            </p>
            
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-6 mb-6 border-2 border-purple-300">
              <p className="text-sm text-gray-600 mb-2">Твоя награда:</p>
              <p className="text-xl font-bold text-purple-700">
                {streakRewardData.reward}
              </p>
            </div>

            <button
              onClick={() => setShowStreakReward(false)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold shadow-lg hover:from-purple-600 hover:to-pink-700 transition-all"
            >
              Забрать награду!
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes floatUpFade {
          0% { opacity: 0; transform: translateY(50px) scale(0.5); }
          20% { opacity: 1; transform: translateY(0) scale(1.1); }
          40% { transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-100px) scale(0.8); }
        }
      `}</style>
    </div>
  );
}