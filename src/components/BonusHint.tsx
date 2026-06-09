import React, { useState } from 'react';

export default function BonusHint() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      {/* Мигающая кнопка */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed top-6 right-6 z-50 px-4 py-2 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-bold text-sm shadow-2xl hover:scale-110 transition-transform"
        style={{
          boxShadow: '0 0 20px rgba(220, 38, 38, 0.8), 0 0 40px rgba(220, 38, 38, 0.4)',
          animation: 'pulseStrong 1s ease-in-out infinite'
        }}
      >
        НАЖМИ НА МЕНЯ
      </button>

      {/* Модалка с информацией */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[200]">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
            {/* Декоративные элементы */}
            <div className="absolute top-4 left-4 w-12 h-12 opacity-40">
              <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-lg"/>
            </div>
            <div className="absolute top-4 right-4 w-8 h-8 opacity-40">
              <div className="w-full h-full bg-gradient-to-br from-red-400 to-red-600 rounded-full shadow-lg"/>
            </div>

            {/* Заголовок */}
            <div className="text-center mb-6">
              <div className="text-6xl mb-3">🪙</div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
                Что такое бонусы?
              </h3>
              <p className="text-gray-600 text-sm">
                Твоя игровая валюта в приложении SKS Ломбард
              </p>
            </div>

            {/* Описание */}
            <div className="space-y-4 mb-6">
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-4 border-2 border-orange-200">
                <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <span className="text-xl">💰</span>
                  <span>Как заработать?</span>
                </h4>
                <ul className="text-sm text-gray-700 space-y-1 ml-6">
                  <li>• Проходи ежедневные квесты (+50 бонусов)</li>
                  <li>• Отвечай на вопросы викторин (+50 бонусов)</li>
                  <li>• Крути колесо фортуны (до 300 бонусов)</li>
                  <li>• Поддерживай серию дней подряд</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border-2 border-purple-200">
                <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <span className="text-xl">🎁</span>
                  <span>На что потратить?</span>
                </h4>
                <ul className="text-sm text-gray-700 space-y-1 ml-6">
                  <li>• Оплата процентов по займу (1 бонус = 1 рубль)</li>
                  <li>• Скидки на украшения (до 50%)</li>
                  <li>• Фирменный мерч (ручки, кружки, картхолдеры)</li>
                  <li>• Сертификаты WB и Ozon</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border-2 border-green-200">
                <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <span className="text-xl">⭐</span>
                  <span>Зачем они нужны?</span>
                </h4>
                <p className="text-sm text-gray-700">
                  Бонусы — это твоя выгода! Чем больше бонусов, тем больше скидок и подарков ты получаешь. 
                  Копи бонусы и обменивай их на реальные призы!
                </p>
              </div>
            </div>

            {/* Кнопка закрыть */}
            <button
              onClick={() => setShowModal(false)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold shadow-lg hover:from-orange-600 hover:to-red-700 transition-all"
            >
              Понятно!
            </button>

            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* CSS анимация */}
      <style>{`
        @keyframes pulseStrong {
            0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 20px rgba(220, 38, 38, 0.8), 0 0 40px rgba(220, 38, 38, 0.4);
            }
            50% {
            transform: scale(1.15);
            box-shadow: 0 0 30px rgba(220, 38, 38, 1), 0 0 60px rgba(220, 38, 38, 0.6);
            }
        }
      `}</style>
    </>
  );
}