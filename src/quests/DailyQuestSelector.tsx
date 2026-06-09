import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { DAILY_QUESTS_POOL } from '../data/mockData';

// Единый тип для всех квестов
interface QuestItem {
  id: string;
  type: string;
  title: string;
  description?: string;
  reward: number;
  source: 'standard' | 'custom';
  question?: string;
  options?: string[];
  correctIndex?: number;
  questions?: Array<{
    text: string;
    options: string[];
    correctIndex: number;
  }>;
}

export default function DailyQuestSelector({ onComplete }: { onComplete: (reward: number, questId: string) => void }) {
  const { customGames, customQuizzes } = useGameStore();
  const [selectedQuest, setSelectedQuest] = useState<QuestItem | null>(null);

  // Объединяем все квесты с единым типом
  const allQuests: QuestItem[] = [
    ...DAILY_QUESTS_POOL.map(q => ({ 
      ...q, 
      source: 'standard' as const,
      type: q.type || 'game'
    })),
    ...customGames.map(g => ({ 
      ...g, 
      source: 'custom' as const,
      type: 'game'
    })),
    ...customQuizzes.map(q => ({ 
      ...q, 
      source: 'custom' as const,
      type: 'test'
    }))
  ];

  return (
    <div className="p-5 bg-gradient-to-b from-red-950 to-slate-950 rounded-2xl border border-red-900 shadow-[0_0_20px_rgba(220,38,38,0.3)]">
      <h3 className="text-xl font-bold text-red-500 mb-4 flex items-center gap-2">
        🔥 Выберите задание
      </h3>
      <p className="text-red-200/60 text-sm mb-6">
        Выберите одно задание, чтобы получить бонусы
      </p>
      
      <div className="space-y-3">
        {allQuests.map((quest) => (
          <button
            key={quest.id}
            onClick={() => setSelectedQuest(quest)}
            className="w-full text-left p-4 bg-red-900/30 hover:bg-red-800/50 border border-red-800 hover:border-red-500 rounded-xl transition-all duration-300 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            
            <div className="flex justify-between items-center relative z-10">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-white group-hover:text-red-400 transition-colors">
                    {quest.title}
                  </h4>
                  {quest.source === 'custom' && (
                    <span className="text-[10px] bg-purple-900/50 text-purple-300 px-2 py-0.5 rounded border border-purple-800">
                      NEW
                    </span>
                  )}
                </div>
                <p className="text-sm text-red-200/50">
                  {quest.type === 'test' 
                    ? `Викторина (${quest.questions?.length || 0} вопросов)` 
                    : quest.description || 'Мини-игра'}
                </p>
              </div>
              <span className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg shadow-red-900/50 ml-3">
                +{quest.reward} Б
              </span>
            </div>
          </button>
        ))}
      </div>

      {selectedQuest && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-b from-red-900 to-slate-900 border-2 border-red-500 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">{selectedQuest.title}</h3>
              <button 
                onClick={() => setSelectedQuest(null)}
                className="text-red-400 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Если это тест - показываем вопросы */}
            {selectedQuest.type === 'test' && selectedQuest.questions ? (
              <CustomQuizPlayer 
                quiz={selectedQuest}
                onComplete={() => {
                  setSelectedQuest(null);
                  onComplete(selectedQuest.reward, selectedQuest.id);
                }}
              />
            ) : (
              /* Если это игра - показываем описание */
              <div>
                <p className="text-red-200 mb-6">{selectedQuest.description || 'Выполните задание'}</p>
                <button
                  onClick={() => {
                    setSelectedQuest(null);
                    onComplete(selectedQuest.reward, selectedQuest.id);
                  }}
                  className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-bold py-3 rounded-xl transition-all active:scale-95"
                >
                  Выполнить задание (+{selectedQuest.reward} Б)
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Компонент для прохождения кастомного теста
// Компонент для прохождения кастомного теста
function CustomQuizPlayer({ quiz, onComplete }: { quiz: QuestItem; onComplete: () => void }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  // Явно проверяем и приводим тип
  const questions = quiz.questions;
  if (!questions || questions.length === 0) {
    return <p className="text-red-200 text-center py-8">Вопросы не найдены</p>;
  }

  const question = questions[currentQuestion];

  const handleAnswer = () => {
    if (selectedAnswer === null) return;

    const newScore = selectedAnswer === question.correctIndex ? score + 1 : score;
    setScore(newScore);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      // Тест завершен
      onComplete();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-red-300">Вопрос {currentQuestion + 1} из {questions.length}</span>
        <span className="text-sm text-yellow-500">Правильно: {score}</span>
      </div>

      <h4 className="text-lg font-bold text-white mb-6">{question.text}</h4>

      <div className="space-y-3 mb-6">
        {question.options.map((option: string, idx: number) => (
          <button
            key={idx}
            onClick={() => setSelectedAnswer(idx)}
            className={`w-full p-4 rounded-xl text-left transition-all border-2 ${
              selectedAnswer === idx
                ? 'bg-red-800/50 border-red-500 text-white'
                : 'bg-red-950/30 border-red-900 text-red-100 hover:border-red-700'
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      <button
        onClick={handleAnswer}
        disabled={selectedAnswer === null}
        className={`w-full py-3 rounded-xl font-bold transition-all ${
          selectedAnswer === null
            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white active:scale-95'
        }`}
      >
        {currentQuestion < questions.length - 1 ? 'Следующий вопрос' : 'Завершить тест'}
      </button>
    </div>
  );
}