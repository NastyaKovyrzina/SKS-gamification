import React, { useState } from 'react';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface DailyQuizProps {
  onComplete: (reward: number) => void;
  onClose: () => void;
}

const questions: Question[] = [
  {
    id: 1,
    question: 'Сколько будет 7 × 8?',
    options: ['54', '56', '48', '63'],
    correctAnswer: 1
  },
  {
    id: 2,
    question: 'Какой газ преобладает в атмосфере Земли?',
    options: ['Кислород', 'Углекислый газ', 'Азот', 'Водород'],
    correctAnswer: 2
  },
  {
    id: 3,
    question: 'Сколько материков на Земле?',
    options: ['5', '6', '7', '4'],
    correctAnswer: 1
  }
];

export default function DailyQuiz({ onComplete, onClose }: DailyQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const handleAnswer = (answerIndex: number) => {
    if (isAnswered) return;
    
    setSelectedAnswer(answerIndex);
    setIsAnswered(true);
    
    const isCorrect = answerIndex === questions[currentQuestion].correctAnswer;
    if (isCorrect) {
      setCorrectAnswers(correctAnswers + 1);
    }

    // Переход к следующему вопросу через 1 секунду
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setIsAnswered(false);
      } else {
        setShowResult(true);
      }
    }, 1000);
  };

  const handleFinish = () => {
    // Начисляем награду только если все ответы правильные
    if (correctAnswers === questions.length) {
      onComplete(50); // 50 coins
    } else {
      // Если есть ошибки - всё равно даём пройти, но меньше монет
      onComplete(25);
    }
  };

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  if (showResult) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            {correctAnswers === questions.length ? 'Отлично!' : 'Хорошая попытка!'}
          </h3>
          <p className="text-gray-600 mb-6">
            Правильных ответов: {correctAnswers} из {questions.length}
          </p>
          
          <div className="bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">Твоя награда:</p>
            <div className="flex items-center justify-center gap-2 text-2xl font-bold text-orange-600">
              <span>🪙</span>
              <span>{correctAnswers === questions.length ? '50' : '25'} coins</span>
            </div>
          </div>

          <button
            onClick={handleFinish}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold shadow-lg hover:from-orange-600 hover:to-red-700 transition-all"
          >
            Продолжить
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
        {/* Заголовок */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            Вопрос {currentQuestion + 1} из {questions.length}
          </h3>
          
          {/* Прогресс бар */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Вопрос */}
        <div className="mb-6">
          <p className="text-lg font-semibold text-gray-800 text-center mb-6">
            {question.question}
          </p>

          {/* Варианты ответов */}
          <div className="space-y-3">
            {question.options.map((option, index) => {
              let buttonStyle = 'bg-gray-50 hover:bg-gray-100 border-2 border-gray-200';
              
              if (isAnswered) {
                if (index === question.correctAnswer) {
                  buttonStyle = 'bg-green-100 border-2 border-green-500';
                } else if (index === selectedAnswer) {
                  buttonStyle = 'bg-red-100 border-2 border-red-500';
                }
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  disabled={isAnswered}
                  className={`w-full py-3 px-4 rounded-xl font-semibold transition-all ${buttonStyle} ${
                    !isAnswered ? 'hover:scale-105 active:scale-95' : ''
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
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