import React, { useState, useEffect } from 'react';

interface AttentionGameProps {
  onComplete: (reward: number) => void;
  onClose: () => void;
}

export default function AttentionGame({ onComplete, onClose }: AttentionGameProps) {
  const [gridSize, setGridSize] = useState(16); // 4x4 сетка
  const [targetIndex, setTargetIndex] = useState<number>(-1);
  const [selected, setSelected] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Смайлики
  const commonEmoji = '😀'; // Обычный смайлик
  const targetEmoji = '😎'; // Целевой (отличается)

  // Генерируем сетку при загрузке
  useEffect(() => {
    const target = Math.floor(Math.random() * gridSize);
    setTargetIndex(target);
  }, [gridSize]);

  const handleClick = (index: number) => {
    if (selected !== null) return; // Уже выбрал
    
    setSelected(index);
    const correct = index === targetIndex;
    setIsCorrect(correct);

    // Если правильно - закрываем через 1.5 секунды
    if (correct) {
      setTimeout(() => {
        onComplete(50); // 50 coins
      }, 1500);
    }
  };

  const handleRetry = () => {
    setSelected(null);
    setIsCorrect(null);
    const target = Math.floor(Math.random() * gridSize);
    setTargetIndex(target);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl relative">
        {/* Заголовок */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            Найди отличия
          </h3>
          <p className="text-gray-600 text-sm">
            Найди смайлик {targetEmoji} среди остальных
          </p>
        </div>

        {/* Пример целевого смайлика */}
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl p-4 flex flex-col items-center shadow-lg">
            <span className="text-xs text-gray-600 mb-1">Ищи этого:</span>
            <span className="text-5xl">{targetEmoji}</span>
          </div>
        </div>

        {/* Сетка смайликов */}
        <div 
          className="grid gap-2 mb-6"
          style={{ 
            gridTemplateColumns: `repeat(${Math.sqrt(gridSize)}, 1fr)` 
          }}
        >
          {Array.from({ length: gridSize }).map((_, index) => {
            const isTarget = index === targetIndex;
            const isSelected = selected === index;
            const emoji = isTarget ? targetEmoji : commonEmoji;

            let bgColor = 'bg-gray-50';
            let border = 'border-2 border-gray-200';
            
            if (isSelected) {
              if (isCorrect) {
                bgColor = 'bg-green-100';
                border = 'border-2 border-green-500';
              } else {
                bgColor = 'bg-red-100';
                border = 'border-2 border-red-500';
              }
            }

            return (
              <button
                key={index}
                onClick={() => handleClick(index)}
                disabled={selected !== null}
                className={`aspect-square rounded-xl ${bgColor} ${border} flex items-center justify-center text-3xl transition-all ${
                  selected === null ? 'hover:scale-110 hover:shadow-md' : ''
                }`}
              >
                {emoji}
              </button>
            );
          })}
        </div>

        {/* Результат */}
        {selected !== null && !isCorrect && (
          <div className="text-center mb-4">
            <p className="text-red-600 font-semibold mb-2">Неправильно! Попробуй ещё раз</p>
            <button
              onClick={handleRetry}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold shadow-lg hover:from-orange-600 hover:to-red-700 transition-all"
            >
              Ещё раз
            </button>
          </div>
        )}

        {selected !== null && isCorrect && (
          <div className="text-center">
            <p className="text-green-600 font-bold text-lg">Отлично! +50 coins</p>
          </div>
        )}

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