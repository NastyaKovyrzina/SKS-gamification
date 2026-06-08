import React, { useState } from 'react';

export default function MiniGameModal({ quest, onClose, onSuccess }: any) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const handleAnswer = (index: number) => {
    setSelectedOption(index);
    const correct = index === quest.correctIndex;
    setIsCorrect(correct);
    if (correct) {
      setTimeout(() => onSuccess(), 800); 
    }
  };

  return (
    // Затемнение фона
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      {/* Контейнер модалки с красным градиентом */}
      <div className="bg-gradient-to-b from-red-900 to-slate-900 border-2 border-red-500 rounded-2xl p-6 max-w-md w-full relative shadow-[0_0_50px_rgba(220,38,38,0.4)]">
        <button onClick={onClose} className="absolute top-4 right-4 text-red-400 hover:text-white transition-colors text-xl font-bold">✕</button>
        
        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          🎯 {quest.title}
        </h3>
        
        {/* Логика для текстового квеста (Бизнес) */}
        {quest.type === 'business' && (
          <div className="text-red-100 mb-6 leading-relaxed bg-black/40 border border-red-800 p-4 rounded-lg">
            {quest.content}
          </div>
        )}

        {/* Логика для задачи или викторины */}
        {(quest.type === 'math' || quest.type === 'attention') && (
          <div className="mb-6">
            <p className="text-red-200 mb-5 font-medium text-lg">{quest.question}</p>
            
            {/* Если это игра на внимательность с картинками */}
            {quest.type === 'attention' ? (
              <div className="grid grid-cols-2 gap-4 mb-4">
                {quest.images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    className={`text-6xl p-4 rounded-xl border-2 transition-all transform active:scale-95 ${
                      selectedOption === idx 
                        ? (isCorrect ? 'border-green-500 bg-green-900/20 shadow-[0_0_15px_rgba(34,197,94,0.5)]' : 'border-red-500 bg-red-900/40')
                        : 'border-red-800 hover:border-red-400 bg-red-900/20 hover:bg-red-800/40'
                    }`}
                  >
                    {img}
                  </button>
                ))}
              </div>
            ) : (
              // Если это текстовые варианты ответов
              <div className="space-y-3">
                {quest.options.map((option: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    disabled={selectedOption !== null}
                    className={`w-full p-4 rounded-lg text-left border transition-all font-medium ${
                      selectedOption === idx
                        ? (isCorrect ? 'border-green-500 bg-green-900/20 text-green-400' : 'border-red-500 bg-red-900/40 text-red-400')
                        : 'border-red-800 hover:bg-red-800 hover:border-red-500 text-red-100'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Кнопка забрать награду для бизнес-квестов */}
        {quest.type === 'business' && (
          <button 
            onClick={onSuccess}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-red-900/50 active:scale-[0.98]"
          >
            Забрать +{quest.reward} бонусов
          </button>
        )}

        {/* Сообщение об успехе/ошибке */}
        {isCorrect === true && (
          <div className="mt-4 text-center text-green-400 font-bold text-lg animate-bounce">
            ✅ Верно! Бонусы начислены!
          </div>
        )}
        {isCorrect === false && (
          <div className="mt-4 text-center text-red-400 font-bold text-lg">
            ❌ Ошибка. Попробуйте завтра!
          </div>
        )}
      </div>
    </div>
  );
}