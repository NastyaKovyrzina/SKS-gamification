import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import jewelryBg from '../assets/jewelry-bg.jpg';
import Toast from './Toast';

// Импорты картинок призов
import loanPercentImg from '../assets/prizes/loan-percent.png';
import loanFullImg from '../assets/prizes/loan-full.png';
import jewelry10Img from '../assets/prizes/jewelry-10.png';
import jewelry25Img from '../assets/prizes/jewelry-25.png';
import jewelry50Img from '../assets/prizes/jewelry-50.png';
import merchPenImg from '../assets/prizes/merch-pen.png';
import merchNotebookImg from '../assets/prizes/merch-notebook.png';
import merchCardholderImg from '../assets/prizes/merch-cardholder.png';
import merchMugImg from '../assets/prizes/merch-mug.png';
import merchDiaryImg from '../assets/prizes/merch-diary.png';

interface PrizeItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: 'loan' | 'jewelry' | 'merch';
  icon: string;
  image?: string;
}

const prizes: PrizeItem[] = [
  {
    id: 1,
    name: 'Оплата процентов по займу',
    description: '1 бонус = 1 рубль. Оплатите часть процентов бонусами.',
    price: 500,
    category: 'loan',
    icon: '💰',
    image: loanPercentImg
  },
  {
    id: 2,
    name: 'Полная оплата процентов',
    description: 'Погасите все проценты по текущему займу бонусами.',
    price: 2000,
    category: 'loan',
    icon: '💎',
    image: loanFullImg
  },
  {
    id: 3,
    name: 'Скидка на украшение 10%',
    description: 'Оплатите 10% стоимости украшения бонусами.',
    price: 300,
    category: 'jewelry',
    icon: '💍',
    image: jewelry10Img
  },
  {
    id: 4,
    name: 'Скидка на украшение 25%',
    description: 'Оплатите 25% стоимости украшения бонусами.',
    price: 800,
    category: 'jewelry',
    icon: '👑',
    image: jewelry25Img
  },
  {
    id: 5,
    name: 'Скидка на украшение 50%',
    description: 'Оплатите половину стоимости украшения бонусами.',
    price: 1500,
    category: 'jewelry',
    icon: '',
    image: jewelry50Img
  },
  {
    id: 6,
    name: 'Ручка с логотипом',
    description: 'Качественная шариковая ручка с фирменным логотипом.',
    price: 100,
    category: 'merch',
    icon: '🖊️',
    image: merchPenImg
  },
  {
    id: 7,
    name: 'Тетрадь А5',
    description: 'Стильная тетрадь в фирменном дизайне, 96 листов.',
    price: 200,
    category: 'merch',
    icon: '📓',
    image: merchNotebookImg
  },
  {
    id: 8,
    name: 'Картхолдер',
    description: 'Кожаный картхолдер с тиснением логотипа.',
    price: 500,
    category: 'merch',
    icon: '💳',
    image: merchCardholderImg
  },
  {
    id: 9,
    name: 'Кружка',
    description: 'Керамическая кружка 350мл с дизайном SKS.',
    price: 300,
    category: 'merch',
    icon: '',
    image: merchMugImg
  },
  {
    id: 10,
    name: 'Ежедневник',
    description: 'Премиум ежедневник в кожаном переплёте.',
    price: 800,
    category: 'merch',
    icon: '📔',
    image: merchDiaryImg
  },
];

type Category = 'all' | 'loan' | 'jewelry' | 'merch';

export default function PrizeCatalog() {
  const { currentUser, addCoins } = useGameStore();
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState<PrizeItem | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const filteredPrizes = selectedCategory === 'all' 
    ? prizes 
    : prizes.filter(p => p.category === selectedCategory);

  const handlePurchase = (prize: PrizeItem) => {
    if (currentUser.balance < prize.price) {
      setToast({ message: 'Недостаточно бонусов!', type: 'error' });
      return;
    }
    setSelectedPrize(prize);
    setShowPurchaseModal(true);
  };

  const confirmPurchase = () => {
    if (selectedPrize) {
      addCoins(-selectedPrize.price);
      setShowPurchaseModal(false);
      setSelectedPrize(null);
      setToast({ message: `Куплено: ${selectedPrize.name}`, type: 'success' });
    }
  };

  const categories = [
    { id: 'all' as Category, label: 'Все призы', icon: '' },
    { id: 'loan' as Category, label: 'Займ', icon: '' },
    { id: 'jewelry' as Category, label: 'Украшения', icon: '' },
    { id: 'merch' as Category, label: 'Мерч', icon: '' },
  ];

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
      {/* Уведомление о покупке */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* Верхняя панель */}
      <div className="relative z-10 flex justify-center gap-6 pt-6 px-4">
        <div 
          className="bg-gradient-to-br from-orange-400 to-orange-600 text-white px-8 py-3 rounded-2xl font-bold text-lg shadow-xl flex items-center gap-2"
          style={{ boxShadow: '0 6px 20px rgba(234, 88, 12, 0.5), inset 0 2px 4px rgba(255,255,255,0.3)' }}
        >
          <span className="text-2xl">🪙</span>
          <span>{currentUser.balance} coins</span>
        </div>
        
        <div 
          className="bg-gradient-to-br from-red-500 to-red-700 text-white px-8 py-3 rounded-2xl font-bold text-lg shadow-xl flex items-center gap-2"
          style={{ boxShadow: '0 6px 20px rgba(220, 38, 38, 0.5), inset 0 2px 4px rgba(255,255,255,0.3)' }}
        >
          <span>XP: {currentUser.hp}</span>
        </div>
      </div>

      {/* Основной контент */}
      <div className="relative z-10 flex flex-col items-center px-4 mt-8 max-w-6xl mx-auto">
        
        {/* Заголовок */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
            Каталог призов
          </h2>
          <p className="text-white/90 text-lg" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>
            Тратьте бонусы на полезные призы
          </p>
        </div>

        {/* Фильтры категорий */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2 w-full justify-center flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-6 py-3 rounded-2xl font-semibold transition-all whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-br from-orange-400 to-red-600 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
              }`}
              style={selectedCategory === cat.id ? {
                boxShadow: '0 6px 20px rgba(234, 88, 12, 0.4)'
              } : {}}
            >
              <span className="mr-2">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Сетка призов */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          {filteredPrizes.map((prize) => {
            const canAfford = currentUser.balance >= prize.price;
            
            return (
              <div 
                key={prize.id}
                className="bg-white rounded-3xl shadow-2xl overflow-hidden hover:shadow-3xl transition-all hover:scale-105"
                style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}
              >
                {/* Картинка или иконка */}
                <div className="h-48 flex items-center justify-center p-4 bg-white">
                  {prize.image ? (
                    <img 
                      src={prize.image} 
                      alt={prize.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-6xl">{prize.icon}</span>
                  )}
                </div>

                {/* Контент */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {prize.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {prize.description}
                  </p>

                  {/* Цена и кнопка */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🪙</span>
                      <span className="text-2xl font-bold text-orange-600">
                        {prize.price}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => handlePurchase(prize)}
                      disabled={!canAfford}
                      className={`px-6 py-2 rounded-xl font-bold text-white transition-all ${
                        canAfford
                          ? 'bg-gradient-to-br from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-lg hover:scale-105'
                          : 'bg-gray-300 cursor-not-allowed'
                      }`}
                      style={canAfford ? {
                        boxShadow: '0 4px 15px rgba(234, 88, 12, 0.4)'
                      } : {}}
                    >
                      {canAfford ? 'Купить' : 'Не хватает'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Модалка подтверждения покупки */}
      {showPurchaseModal && selectedPrize && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center">
            <div className="text-6xl mb-4">{selectedPrize.icon}</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Подтверждение покупки
            </h3>
            <p className="text-gray-600 mb-6">
              Вы хотите приобрести <strong>{selectedPrize.name}</strong> за {selectedPrize.price} бонусов?
            </p>
            
            <div className="bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl p-4 mb-6">
              <div className="flex items-center justify-center gap-2 text-2xl font-bold text-orange-600">
                <span>🪙</span>
                <span>{selectedPrize.price} coins</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                После покупки останется: {currentUser.balance - selectedPrize.price} coins
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 font-semibold hover:from-gray-300 hover:to-gray-400 transition-all"
              >
                Отмена
              </button>
              <button
                onClick={confirmPurchase}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold shadow-lg hover:from-orange-600 hover:to-red-700 transition-all"
              >
                Купить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}