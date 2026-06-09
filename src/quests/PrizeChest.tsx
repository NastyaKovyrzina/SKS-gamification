import React, { useState } from 'react';

interface Prize {
  id: string;
  title: string;
  description: string;
  icon: string;
  value: string;
}

const POSSIBLE_PRIZES: Prize[] = [
  {
    id: 'cashback',
    title: 'Повышенный кэшбэк',
    description: 'Двойной кэшбэк на следующие 3 займа',
    icon: '',
    value: 'x2'
  },
  {
    id: 'discount',
    title: 'Скидка на комиссию',
    description: 'Скидка 20% на комиссию при следующем займе',
    icon: '',
    value: '-20%'
  },
  {
    id: 'bonus',
    title: 'Бонусные баллы',
    description: '500 бонусов на ваш счёт',
    icon: '',
    value: '500 Б'
  },
  {
    id: 'gift',
    title: 'Подарок от партнёра',
    description: 'Сертификат на 500₽ в магазине-партнёре',
    icon: '',
    value: '500 ₽'
  }
];

export default function PrizeChest({ onClose, onClaim }: { 
  onClose: () => void; 
  onClaim: (prize: Prize) => void;
}) {
  const [stage, setStage] = useState<'closed' | 'shaking' | 'open'>('closed');
  const [prize, setPrize] = useState<Prize | null>(null);

  const handleOpen = () => {
    setStage('shaking');
    
    // Через 1.5 секунды "открываем" сундук
    setTimeout(() => {
      const randomPrize = POSSIBLE_PRIZES[Math.floor(Math.random() * POSSIBLE_PRIZES.length)];
      setPrize(randomPrize);
      setStage('open');
    }, 1500);
  };

  return (
    <div className="text-center">
      {/* Закрытый сундук */}
      {stage === 'closed' && (
        <div className="py-8">
          <div className="text-8xl mb-6 animate-pulse">🎁</div>
          <h4 className="text-xl font-bold text-white mb-2">Поздравляем!</h4>
          <p className="text-purple-200 mb-6">Вы прошли викторину и получаете сундук с призом!</p>
          <button
            onClick={handleOpen}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-slate-900 font-bold px-8 py-3 rounded-xl shadow-lg shadow-yellow-500/30 transition-all active:scale-95"
          >
            Открыть сундук
          </button>
        </div>
      )}

      {/* Трясущийся сундук */}
      {stage === 'shaking' && (
        <div className="py-8">
          <div className="text-8xl animate-bounce" style={{ animationDuration: '0.3s' }}>🎁</div>
          <p className="text-yellow-400 font-bold mt-4 animate-pulse">Открываем...</p>
        </div>
      )}

      {/* Открытый сундук с призом */}
      {stage === 'open' && prize && (
        <div className="py-6">
          <div className="text-7xl mb-4">{prize.icon}</div>
          <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/50 rounded-2xl p-5 mb-4">
            <p className="text-xs text-yellow-400 uppercase tracking-widest mb-1">Ваш приз</p>
            <h4 className="text-2xl font-bold text-white mb-2">{prize.title}</h4>
            <p className="text-purple-200 text-sm mb-3">{prize.description}</p>
            <div className="inline-block bg-yellow-500 text-slate-900 font-bold px-4 py-1.5 rounded-lg text-lg">
              {prize.value}
            </div>
          </div>
          <button
            onClick={() => onClaim(prize)}
            className="w-full bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-500 hover:to-red-500 text-white font-bold py-3 rounded-xl transition-all"
          >
            Забрать приз
          </button>
        </div>
      )}
    </div>
  );
}