import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import jewelryBg from '../assets/jewelry-bg.jpg';
import wbLogo from '../assets/icons/wb-logo.png';
import ozonLogo from '../assets/icons/ozon-logo.png';

interface Prize {
  id: number;
  name: string;
  value: string;
  color: string;
  label: string;
  icon?: string;
  weight: number;
}

const prizes: Prize[] = [
  { id: 1, name: 'WB сертификат', value: 'wb', color: '#ef4444', label: 'WB', icon: wbLogo, weight: 25 },
  { id: 2, name: 'Ozon сертификат', value: 'ozon', color: '#3b82f6', label: 'OZON', icon: ozonLogo, weight: 25 },
  { id: 3, name: '150 бонусов', value: '150', color: '#10b981', label: '150', weight: 20 },
  { id: 4, name: '300 бонусов', value: '300', color: '#f59e0b', label: '300', weight: 20 },
  { id: 5, name: 'Мерч', value: 'merch', color: '#8b5cf6', label: 'MERCH', weight: 10 },
];

export default function WheelOfFortune({ onWin }: { onWin?: (prize: Prize) => void }) {
  const { currentUser, addCoins, useFreeSpin } = useGameStore();
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonPrize, setWonPrize] = useState<Prize | null>(null);
  const [showWinModal, setShowWinModal] = useState(false);

  const spinWheel = () => {
    if (isSpinning) return;

    // Если есть бесплатная прокрутка - используем её
    if (currentUser.freeSpins > 0) {
      useFreeSpin();
    }

    setIsSpinning(true);
    setWonPrize(null);

    const totalWeight = prizes.reduce((sum, prize) => sum + prize.weight, 0);
    let random = Math.random() * totalWeight;
    let selectedPrize = prizes[0];

    for (const prize of prizes) {
      random -= prize.weight;
      if (random <= 0) {
        selectedPrize = prize;
        break;
      }
    }

    const prizeIndex = prizes.findIndex(p => p.id === selectedPrize.id);
    const sectorAngle = 360 / prizes.length;
    const targetAngle = 360 - (prizeIndex * sectorAngle + sectorAngle / 2);
    const spins = 5 + Math.floor(Math.random() * 3);
    const newRotation = rotation + (spins * 360) + targetAngle;

    setRotation(newRotation);

    setTimeout(() => {
      setWonPrize(selectedPrize);
      setIsSpinning(false);
      setShowWinModal(true);
      
      if (selectedPrize.value === '150') {
        addCoins(150);
      } else if (selectedPrize.value === '300') {
        addCoins(300);
      }
      
      if (onWin) {
        onWin(selectedPrize);
      }
    }, 3000);
  };

  const closeWinModal = () => {
    setShowWinModal(false);
    setWonPrize(null);
  };

  const hasFreeSpins = currentUser.freeSpins > 0;

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
      {/* Верхняя панель */}
      <div className="relative z-10 flex justify-center gap-6 pt-6 px-4 flex-wrap">
        <div 
          className="bg-gradient-to-br from-orange-400 to-orange-600 text-white px-8 py-3 rounded-2xl font-bold text-lg shadow-xl flex items-center gap-2"
          style={{ boxShadow: '0 6px 20px rgba(234, 88, 12, 0.5), inset 0 2px 4px rgba(255,255,255,0.3)' }}
        >
          <span className="text-2xl">🪙</span>
          <span>{currentUser.balance} баллов</span>
        </div>
        
        <div 
          className="bg-gradient-to-br from-red-500 to-red-700 text-white px-8 py-3 rounded-2xl font-bold text-lg shadow-xl flex items-center gap-2"
          style={{ boxShadow: '0 6px 20px rgba(220, 38, 38, 0.5), inset 0 2px 4px rgba(255,255,255,0.3)' }}
        >
          <span>XP: {currentUser.hp}</span>
        </div>

        {hasFreeSpins && (
          <div 
            className="bg-gradient-to-br from-purple-500 to-pink-600 text-white px-8 py-3 rounded-2xl font-bold text-lg shadow-xl flex items-center gap-2"
            style={{ boxShadow: '0 6px 20px rgba(168, 85, 247, 0.5), inset 0 2px 4px rgba(255,255,255,0.3)' }}
          >
            <span className="text-2xl">🎡</span>
            <span>{currentUser.freeSpins} free spins</span>
          </div>
        )}
      </div>

      {/* Основной контент */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center gap-8 px-4 mt-8 max-w-6xl mx-auto">
        
        {/* Колесо */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-lg flex flex-col items-center"
             style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Колесо Фортуны</h2>
          
          <div className="relative w-80 h-80">
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-20">
              <div className="w-6 h-10 bg-gradient-to-b from-red-500 to-red-700 rounded-t-full shadow-lg border-2 border-yellow-400"/>
            </div>

            <div 
              className="relative w-full h-full rounded-full border-8 border-yellow-500 shadow-2xl overflow-hidden"
              style={{ 
                background: `conic-gradient(
                  from 0deg, 
                  ${prizes[0].color} 0deg 72deg, 
                  ${prizes[1].color} 72deg 144deg, 
                  ${prizes[2].color} 144deg 216deg, 
                  ${prizes[3].color} 216deg 288deg, 
                  ${prizes[4].color} 288deg 360deg
                )`,
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning ? 'transform 3s cubic-bezier(0.25, 0.1, 0.25, 1)' : 'none'
              }}
            >
              {prizes.map((prize, index) => {
                const angle = (index * 72 + 36) * (Math.PI / 180);
                const radius = 110;
                const x = Math.sin(angle) * radius;
                const y = -Math.cos(angle) * radius;
                return (
                  <div
                    key={prize.id}
                    className="absolute text-white font-bold text-sm text-center"
                    style={{
                      left: `calc(50% + ${x}px)`,
                      top: `calc(50% + ${y}px)`,
                      transform: 'translate(-50%, -50%)',
                      textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                      width: '80px'
                    }}
                  >
                    {prize.icon ? (
                      <img 
                        src={prize.icon} 
                        alt={prize.label}
                        className="w-10 h-10 object-contain mx-auto drop-shadow-md"
                        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}
                      />
                    ) : (
                      prize.label
                    )}
                  </div>
                );
              })}
            </div>

            <div className="absolute inset-0 rounded-full border-4 border-yellow-400 pointer-events-none"/>
            
            <div 
              className="absolute w-16 h-16 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-full shadow-lg border-4 border-yellow-500 z-10"
              style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
            />
          </div>

          <button
            onClick={spinWheel}
            disabled={isSpinning}
            className={`mt-8 px-12 py-4 rounded-2xl font-bold text-white text-2xl transition-all active:scale-95 ${
              isSpinning
                ? 'bg-gray-400 cursor-not-allowed opacity-60'
                : hasFreeSpins
                ? 'bg-gradient-to-br from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700'
                : 'bg-gradient-to-br from-red-500 to-red-700 hover:from-red-600 hover:to-red-800'
            }`}
            style={!isSpinning ? { 
              boxShadow: hasFreeSpins 
                ? '0 6px 20px rgba(168, 85, 247, 0.5), inset 0 2px 4px rgba(255,255,255,0.3)'
                : '0 6px 20px rgba(220, 38, 38, 0.5), inset 0 2px 4px rgba(255,255,255,0.3)'
            } : {}}
          >
            {isSpinning ? 'Крутим...' : hasFreeSpins ? 'Бесплатно! 🎡' : 'Крутить!'}
          </button>

          {hasFreeSpins && !isSpinning && (
            <p className="mt-3 text-purple-600 font-semibold text-sm">
              Бесплатная прокрутка доступна!
            </p>
          )}
        </div>

        {/* Список призов */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm"
             style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Призы</h3>
          <div className="space-y-4">
            {prizes.map((prize) => (
              <div 
                key={prize.id} 
                className="flex items-center gap-4 p-3 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 transition-colors shadow-sm"
              >
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center shadow-md overflow-hidden"
                  style={{ backgroundColor: prize.icon ? 'white' : prize.color }}
                >
                  {prize.icon ? (
                    <img src={prize.icon} alt={prize.label} className="w-10 h-10 object-contain" />
                  ) : (
                    <span className="text-white font-bold text-xs">{prize.label}</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 font-semibold">{prize.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Модальное окно выигрыша */}
      {showWinModal && wonPrize && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center">
            <div 
              className="w-24 h-24 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-xl overflow-hidden"
              style={{ backgroundColor: wonPrize.icon ? 'white' : wonPrize.color }}
            >
              {wonPrize.icon ? (
                <img src={wonPrize.icon} alt={wonPrize.label} className="w-20 h-20 object-contain" />
              ) : (
                <span className="text-white text-3xl font-bold">{wonPrize.label}</span>
              )}
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">🎉 Поздравляем!</h2>
            <p className="text-xl text-gray-600 mb-4">Вы выиграли:</p>
            <div className="bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl p-6 mb-6">
              <p className="text-3xl font-bold text-gray-800">{wonPrize.name}</p>
            </div>
            <button
              onClick={closeWinModal}
              className="w-full bg-gradient-to-br from-green-500 to-green-600 text-white px-8 py-3 rounded-2xl font-bold text-lg shadow-lg hover:from-green-600 hover:to-green-700 transition-all"
            >
              Забрать приз
            </button>
          </div>
        </div>
      )}
    </div>
  );
}