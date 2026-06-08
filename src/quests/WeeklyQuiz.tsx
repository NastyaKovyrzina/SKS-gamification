import React, { useState } from 'react';
import { WEEKLY_QUIZ_50_PLUS } from '../data/mockData';

export default function WeeklyQuiz({ onComplete }: { onComplete: () => void }) {
  // Жестко берем вопросы для нашей ЦА
  const questions = WEEKLY_QUIZ_50_PLUS;
  
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);

  const handleAnswer = (index: number) => {
    if (index === questions[currentQ].correctIndex) {
      setScore(score + 1);
    }
    
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      // Тест завершен, вызываем колбэк для начисления награды
      onComplete();
    }
  };

  const question = questions[currentQ];

  return (
    <div className="bg-gradient-to-b from-red-900 to-slate-900 border-2 border-red-500/50 rounded-2xl p-6 max-w-md mx-auto shadow-[0_0_30px_rgba(220,38,38,0.2)]">
      <div className="flex justify-between items-center mb-6">
        <span className="text-red-400 font-bold uppercase tracking-widest text-sm">Вип Испытание</span>
        <span className="text-white bg-red-900/50 px-3 py-1 rounded-full text-sm border border-red-700">
          {currentQ + 1} / {questions.length}
        </span>
      </div>

      <h3 className="text-xl text-white font-semibold mb-6 leading-snug">{question.question}</h3>

      <div className="space-y-3">
        {question.options.map((option: string, idx: number) => (
          <button
            key={idx}
            onClick={() => handleAnswer(idx)}
            className="w-full p-4 bg-red-950/50 hover:bg-red-800 border border-red-800 hover:border-red-400 rounded-xl text-left text-red-100 transition-all font-medium active:scale-[0.98]"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}