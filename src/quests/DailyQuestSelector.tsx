import React, { useState } from 'react';
import { DAILY_QUESTS_POOL } from '../data/mockData';
import MiniGameModal from './MiniGameModal';

export default function DailyQuestSelector({ onComplete }: { onComplete: (reward: number) => void }) {
  const [selectedQuest, setSelectedQuest] = useState<any>(null);

  return (
    <div className="p-5 bg-gradient-to-b from-red-950 to-slate-950 rounded-2xl border border-red-900 shadow-[0_0_20px_rgba(220,38,38,0.3)]">
      <h3 className="text-xl font-bold text-red-500 mb-4 flex items-center gap-2">
        🔥 Ежедневные задания
      </h3>
      <p className="text-red-200/60 text-sm mb-6">
        Выберите одно задание, чтобы получить бонусы. Новые доступны каждый день!
      </p>
      
      <div className="space-y-4">
        {DAILY_QUESTS_POOL.map((quest) => (
          <button
            key={quest.id}
            onClick={() => setSelectedQuest(quest)}
            className="w-full text-left p-4 bg-red-900/30 hover:bg-red-800/50 border border-red-800 hover:border-red-500 rounded-xl transition-all duration-300 group relative overflow-hidden"
          >
            {/* Эффект блика при наведении */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            
            <div className="flex justify-between items-center relative z-10">
              <div>
                <h4 className="font-bold text-white group-hover:text-red-400 transition-colors">
                  {quest.title}
                </h4>
                <p className="text-sm text-red-200/50 mt-1">{quest.description}</p>
              </div>
              {/* Яркий бейдж награды */}
              <span className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg shadow-red-900/50">
                +{quest.reward} Б
              </span>
            </div>
          </button>
        ))}
      </div>

      {selectedQuest && (
        <MiniGameModal 
          quest={selectedQuest} 
          onClose={() => setSelectedQuest(null)}
          onSuccess={() => {
            setSelectedQuest(null);
            onComplete(selectedQuest.reward);
          }}
        />
      )}
    </div>
  );
}