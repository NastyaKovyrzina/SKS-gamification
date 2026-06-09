import React, { useState } from 'react';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface WeeklySovietQuizProps {
  onComplete: (reward: number) => void;
  onClose: () => void;
}

const questions: Question[] = [
  {
    id: 1,
    question: 'Кто сыграл главную роль в фильме "Ирония судьбы, или С лёгким паром!"?',
    options: ['Андрей Мягков', 'Олег Басилашвили', 'Александр Ширвиндт', 'Сергей Юрский'],
    correctAnswer: 0
  },
  {
    id: 2,
    question: 'В каком фильме звучит фраза "Наши люди в булочную на такси не ездят"?',
    options: ['Бриллиантовая рука', 'Кавказская пленница', 'Операция Ы', 'Джентльмены удачи'],
    correctAnswer: 0
  },
  {
    id: 3,
    question: 'Как звали собаку в фильме "Белый Бим Чёрное ухо"?',
    options: ['Рекс', 'Бим', 'Дружок', 'Шарик'],
    correctAnswer: 1
  },
  {
    id: 4,
    question: 'Кто режиссёр фильма "Москва слезам не верит"?',
    options: ['Эльдар Рязанов', 'Леонид Гайдай', 'Владимир Меньшов', 'Георгий Данелия'],
    correctAnswer: 2
  },
  {
    id: 5,
    question: 'В каком фильме герой говорит "Лёгких денег не бывает"?',
    options: ['Джентльмены удачи', 'Бриллиантовая рука', 'Кавказская пленница', 'Иван Васильевич меняет профессию'],
    correctAnswer: 0
  }
];

export default function WeeklySovietQuiz({ onComplete, onClose }: WeeklySovietQuizProps) {
  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const handleStart = () => {
    setStarted(true);
  };

  const handleAnswer = (answerIndex: number) => {
    if (isAnswered) return;
    
    setSelectedAnswer(answerIndex);
    setIsAnswered(true);
    
    const isCorrect = answerIndex === questions[currentQuestion].correctAnswer;
    if (isCorrect) {
      setCorrectAnswers(correctAnswers + 1);
    }

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setIsAnswered(false);
      } else {
        setShowResult(true);
      }
    }, 1200);
  };

  const handleFinish = () => {
    const reward = correctAnswers * 20; // 20 coins за каждый правильный ответ
    onComplete(reward);
  };

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  // Экран приветствия
  if (!started) {
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
          <div className="absolute bottom-4 left-4 w-8 h-8 opacity-40">
            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 rounded-full shadow-lg"/>
          </div>

          {/* Заголовок */}
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">🎬</div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
              Викторина недели
            </h3>
            <p className="text-gray-600 text-sm">
              Тест на знание советских фильмов
            </p>
          </div>

          {/* Описание */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-4 mb-6 border-2 border-orange-200">
            <div className="flex items-start gap-3">
              <span className="text-2xl"></span>
              <div className="flex-1">
                <p className="text-sm text-gray-700 mb-2">
                  Пройди тест из 5 вопросов по культовым советским фильмам и получи:
                </p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li className="flex items-center gap-2">
                    <span className="text-orange-500">•</span>
                    <span>До <strong>100 coins</strong> за правильные ответы</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-orange-500">•</span>
                    <span><strong>+50 HP</strong> к здоровью</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-orange-500">•</span>
                    <span><strong>Скидку 10%</strong> на украшения в магазине</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Кнопки */}
          <div className="space-y-3">
            <button
              onClick={handleStart}
              className="w-full py-4 rounded-2xl font-bold text-white text-lg transition-all hover:scale-105 active:scale-95 shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #f97316 0%, #dc2626 100%)',
                boxShadow: '0 6px 20px rgba(220, 38, 38, 0.4), inset 0 2px 4px rgba(255,255,255,0.3)'
              }}
            >
              Начать тест
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 font-semibold hover:from-gray-200 hover:to-gray-300 transition-all"
            >
              Отмена
            </button>
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

  // Экран результатов
  if (showResult) {
    const reward = correctAnswers * 20;
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center relative overflow-hidden">
          {/* Декоративные элементы */}
          <div className="absolute top-4 left-4 w-12 h-12 opacity-40">
            <div className="w-full h-full bg-gradient-to-br from-red-400 to-red-600 rounded-full shadow-lg"/>
          </div>
          <div className="absolute top-4 right-4 w-8 h-8 opacity-40">
            <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full shadow-lg"/>
          </div>

          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            {correctAnswers >= 4 ? 'Отлично!' : correctAnswers >= 2 ? 'Хорошо!' : 'Неплохо!'}
          </h3>
          <p className="text-gray-600 mb-6">
            Правильных ответов: {correctAnswers} из {questions.length}
          </p>
          
          <div className="bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl p-4 mb-6 border-2 border-orange-200">
            <p className="text-sm text-gray-600 mb-2">Твои награды:</p>
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-xl font-bold text-orange-600">
                <span>🪙</span>
                <span>{reward} coins</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-lg font-bold text-red-600">
                <span>+50 HP</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-lg font-bold text-purple-600">
                <span>Скидка 10% на украшения</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleFinish}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold shadow-lg hover:from-orange-600 hover:to-red-700 transition-all"
          >
            Забрать награды
          </button>
        </div>
      </div>
    );
  }

  // Экран вопросов
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl relative">
        {/* Заголовок */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-2">
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