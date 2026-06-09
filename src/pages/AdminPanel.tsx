import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';

export default function AdminPanel() {
  const { addCustomGame, addCustomQuiz, customGames, customQuizzes } = useGameStore();
  
  const [contentType, setContentType] = useState<'game' | 'test'>('game');
  const [title, setTitle] = useState('');
  const [reward, setReward] = useState('');
  const [description, setDescription] = useState('');
  
  const [questions, setQuestions] = useState([
    { text: '', options: ['', '', ''], correctIndex: 0 }
  ]);

  const [showSuccess, setShowSuccess] = useState(false);

  const addQuestion = () => {
    setQuestions([...questions, { text: '', options: ['', '', ''], correctIndex: 0 }]);
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const newQuestions = [...questions];
    if (field === 'text') newQuestions[index].text = value;
    if (field === 'option') {
      const [optIndex, optValue] = value.split(',');
      newQuestions[index].options[Number(optIndex)] = optValue;
    }
    if (field === 'correct') newQuestions[index].correctIndex = Number(value);
    setQuestions(newQuestions);
  };

  const handlePublish = () => {
    if (!title || !reward) return;

    if (contentType === 'game') {
      addCustomGame({
        id: Date.now().toString(),
        type: 'game',
        title,
        description,
        reward: Number(reward)
      });
    } else {
      const validQuestions = questions.filter(q => q.text.trim() !== '');
      if (validQuestions.length === 0) return;

      addCustomQuiz({
        id: Date.now().toString(),
        type: 'test',
        title,
        reward: Number(reward),
        questions: validQuestions
      });
    }

    setTitle(''); setReward(''); setDescription('');
    setQuestions([{ text: '', options: ['', '', ''], correctIndex: 0 }]);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 pb-24" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      {/* Уведомление */}
      {showSuccess && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          ✅ Контент опубликован!
        </div>
      )}

      {/* Шапка */}
      <div className="flex justify-between items-center px-8 py-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800 tracking-wide">
          ПАНЕЛЬ МАРКЕТОЛОГА
        </h1>
      </div>

      {/* Основной контент */}
      <div className="max-w-4xl mx-auto px-8 py-10">
        
        {/* Переключатель Мини-игры / Викторина */}
        <div className="flex bg-slate-200 rounded-full p-1 mb-10">
          <button
            onClick={() => setContentType('game')}
            className={`flex-1 py-3 rounded-full font-semibold text-base transition-all ${
              contentType === 'game' 
                ? 'bg-orange-600 text-white shadow-md' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Мини-игры
          </button>
          <button
            onClick={() => setContentType('test')}
            className={`flex-1 py-3 rounded-full font-semibold text-base transition-all ${
              contentType === 'test' 
                ? 'bg-orange-600 text-white shadow-md' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Викторина (тест)
          </button>
        </div>

        {/* Форма в одной общей рамке */}
        <div className="border border-slate-900 rounded-lg p-6 mb-8">
          <div className="space-y-6">
            
            {/* Название */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide mb-2">
                Название
              </label>
              <input
                type="text"
                placeholder="Например: внимательный оценщик"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-200 rounded-lg px-4 py-3 text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-600 transition-all"
              />
            </div>

            {/* Баллы */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide mb-2">
                Баллы
              </label>
              <input
                type="number"
                placeholder="50"
                value={reward}
                onChange={(e) => setReward(e.target.value)}
                className="w-full bg-slate-200 rounded-lg px-4 py-3 text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-600 transition-all"
              />
            </div>

            {/* Описание задания (только для игр) */}
            {contentType === 'game' && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide mb-2">
                  Описание задания
                </label>
                <textarea
                  placeholder="Что нужно сделать пользователю? (например: найти одну фальшивую монету среди трех настоящих)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-200 rounded-lg px-4 py-3 text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-600 transition-all resize-none"
                />
              </div>
            )}

            {/* Вопросы (только для тестов) */}
            {contentType === 'test' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                    Вопросы теста
                  </label>
                  <button 
                    onClick={addQuestion}
                    className="text-sm bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    + Добавить вопрос
                  </button>
                </div>

                {questions.map((q, qIndex) => (
                  <div key={qIndex} className="bg-slate-100 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-orange-600 font-bold">#{qIndex + 1}</span>
                      <input
                        type="text"
                        placeholder="Текст вопроса"
                        value={q.text}
                        onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)}
                        className="flex-1 bg-white border border-slate-300 rounded px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-orange-600"
                      />
                    </div>
                    
                    <div className="space-y-2 pl-6">
                      {q.options.map((opt, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-3">
                          <input
                            type="radio"
                            name={`correct-${qIndex}`}
                            checked={q.correctIndex === optIndex}
                            onChange={() => updateQuestion(qIndex, 'correct', optIndex)}
                            className="accent-orange-600 w-4 h-4"
                          />
                          <input
                            type="text"
                            placeholder={`Вариант ответа ${optIndex + 1}`}
                            value={opt}
                            onChange={(e) => updateQuestion(qIndex, 'option', `${optIndex},${e.target.value}`)}
                            className="flex-1 bg-white border border-slate-300 rounded px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:border-orange-600"
                          />
                        </div>
                      ))}
                      <p className="text-xs text-slate-500">Отметьте правильный ответ</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Кнопка опубликовать */}
        <div className="flex justify-center">
          <button
            onClick={handlePublish}
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-10 rounded-full uppercase tracking-wide transition-all active:scale-95 shadow-md"
          >
            Опубликовать
          </button>
        </div>

        {/* Список созданного контента */}
        {(customGames.length > 0 || customQuizzes.length > 0) && (
          <div className="mt-12 pt-8 border-t border-slate-200">
            <h3 className="text-sm font-bold text-slate-700 uppercase mb-4">Опубликованный контент</h3>
            <div className="space-y-2">
              {customGames.map(g => (
                <div key={g.id} className="border border-slate-300 rounded-lg p-3 flex justify-between items-center bg-white">
                  <div>
                    <span className="text-slate-800 font-medium">{g.title}</span>
                    <span className="text-xs text-slate-500 ml-2">Игра</span>
                  </div>
                  <span className="text-orange-600 font-bold">+{g.reward} б</span>
                </div>
              ))}
              {customQuizzes.map(q => (
                <div key={q.id} className="border border-slate-300 rounded-lg p-3 flex justify-between items-center bg-white">
                  <div>
                    <span className="text-slate-800 font-medium">{q.title}</span>
                    <span className="text-xs text-slate-500 ml-2">Тест ({q.questions.length} вопр.)</span>
                  </div>
                  <span className="text-orange-600 font-bold">+{q.reward} б</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}