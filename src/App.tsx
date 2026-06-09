import React, { useState } from 'react';
import GameHub from './pages/GameHub';
import BottomNav from './components/BottomNav';
import WheelOfFortune from './components/WheelOfFortune';
import Leaderboard from './pages/Leaderboard';
import AdminPanel from './pages/AdminPanel';
import PrizeCatalog from './components/PrizeCatalog';

export default function App() {
  const [activeTab, setActiveTab] = useState<'game' | 'wheel' | 'leaderboard' | 'admin' | 'catalog'>('game');

  const handleWheelWin = (prize: any) => {
    console.log('Выигрыш:', prize);
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      {activeTab === 'game' && <GameHub />}
      {activeTab === 'wheel' && (
        <div className="min-h-screen bg-gradient-to-b from-red-950 to-slate-950 p-4">
          <WheelOfFortune onWin={handleWheelWin} />
        </div>
      )}
      {activeTab === 'leaderboard' && <Leaderboard />}
      {activeTab === 'admin' && <AdminPanel />}
      {activeTab === 'catalog' && <PrizeCatalog />}
      
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}