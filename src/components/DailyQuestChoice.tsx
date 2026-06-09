import React from 'react';
import dragon from '../assets/dragon.png';

interface DailyQuestChoiceProps {
  onSelectQuestions: () => void;
  onSelectAttention: () => void;
  onClose: () => void;
}

export default function DailyQuestChoice({ onSelectQuestions, onSelectAttention, onClose }: DailyQuestChoiceProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
        {/* Декоративные элементы */}
        <div className="absolute top-4 left-4 w-12 h-12 opacity-40">
          <div className="w-full h-full bg-gradient-to-br from-red-400 to-red-600 rounded-full shadow-lg"/>
        </div>
        <div className="absolute top-4 right-4 w-8 h-8 opacity-40">
          <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full shadow-lg"/>
        </div>

        {/* Заголовок */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            Выбери задание
          </h3>
          <p className="text-gray-600 text-sm">
            на сегодня
          </p>
        </div>

        {/* Две кнопки */}
        <div className="space-y-4 mb-6">
          {/* Кнопка Вопросы */}
          <button
            onClick={onSelectQuestions}
            className="w-full py-4 px-6 rounded-2xl font-bold text-white text-lg transition-all hover:scale-105 active:scale-95 shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              boxShadow: '0 6px 20px rgba(234, 88, 12, 0.4), inset 0 2px 4px rgba(255,255,255,0.3)'
            }}
          >
            ВОПРОСЫ
          </button>

          {/* Кнопка Внимательность */}
          <button
            onClick={onSelectAttention}
            className="w-full py-4 px-6 rounded-2xl font-bold text-white text-lg transition-all hover:scale-105 active:scale-95 shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #991b1b 0%, #7f1d1d 100%)',
              boxShadow: '0 6px 20px rgba(127, 29, 29, 0.4), inset 0 2px 4px rgba(255,255,255,0.3)'
            }}
          >
            ВНИМАТЕЛЬНОСТЬ
          </button>
        </div>

        {/* Дракон внизу */}
        <div className="flex justify-center mt-6">
          <img 
            src={dragon} 
            alt="Dragon"
            className="w-40 h-40 object-contain drop-shadow-xl"
          />
        </div>

        {/* Кнопка закрыть */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600"
        >
          ✕
        </button>
      </div>
    </div>
  );
}