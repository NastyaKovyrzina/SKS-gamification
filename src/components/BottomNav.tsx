import React from 'react';
import gameIcon from '../assets/icons/game.png';
import wheelIcon from '../assets/icons/wheel.png';
import trophyIcon from '../assets/icons/trophy.png';
import adminIcon from '../assets/icons/admin.png';
import catalogIcon from '../assets/icons/catalog.png';

type TabType = 'game' | 'wheel' | 'leaderboard' | 'admin' | 'catalog';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

interface NavItem {
  id: TabType;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { id: 'game', label: 'Игра', icon: gameIcon },
  { id: 'wheel', label: 'Колесо', icon: wheelIcon },
  { id: 'catalog', label: 'Призы', icon: catalogIcon },
  { id: 'leaderboard', label: 'Топ', icon: trophyIcon },
  { id: 'admin', label: 'Админ', icon: adminIcon },
];

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-2 flex justify-around items-center"
           style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
        {navItems.map((item) => {
          const active = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-3 px-2 rounded-xl transition-all duration-300 ${
                active
                  ? 'bg-gradient-to-br from-orange-400 to-red-600 text-white shadow-lg scale-105'
                  : 'text-gray-600 hover:bg-gray-100 hover:scale-105'
              }`}
            >
              <img 
                src={item.icon} 
                alt={item.label}
                className="w-7 h-7 mb-1 object-contain"
              />
              
              <span className={`text-xs font-semibold ${active ? 'text-white' : 'text-gray-600'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}