import React from 'react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InfoModal({ isOpen, onClose }: InfoModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        zIndex: '9999'
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: '360px',
          maxHeight: '80vh',
          backgroundColor: '#450a0a', // red-950
          border: '2px solid #dc2626', // red-600
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()} // Чтобы клик внутри не закрывал модалку
      >
        {/* Шапка */}
        <div style={{ padding: '16px', borderBottom: '1px solid #7f1d1d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: '0', fontSize: '18px', fontWeight: 'bold', color: 'white' }}>
            ℹ️ Как играть
          </h2>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#fca5a5', fontSize: '24px', cursor: 'pointer', lineHeight: '1' }}
          >
            ×
          </button>
        </div>

        {/* Контент с прокруткой */}
        <div style={{ padding: '20px', overflowY: 'auto', color: '#fecaca', fontSize: '14px', lineHeight: '1.5' }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: '#fbbf24', marginTop: '0' }}>🎮 Суть игры</h3>
            <p style={{ margin: '0' }}>Играйте каждый день, выполняйте задания и получайте бонусы!</p>
          </div>

          <div style={{ background: 'rgba(127, 29, 29, 0.3)', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
            <h3 style={{ color: '#fbbf24', marginTop: '0' }}>💰 Зачем бонусы?</h3>
            <ul style={{ paddingLeft: '20px', margin: '0' }}>
              <li>Покупка золота со скидкой</li>
              <li>Снижение комиссии по займу</li>
              <li>Подарки от партнёров</li>
            </ul>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: '#f87171', marginTop: '0' }}>📅 Ежедневные задания</h3>
            <p style={{ margin: '0 0 8px 0' }}>Каждый день 2 задания на выбор:</p>
            <ul style={{ paddingLeft: '20px', margin: '0' }}>
              <li> Математика — задачи на проценты</li>
              <li>👁️ Внимательность — найдите отличия</li>
            </ul>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: '#c084fc', marginTop: '0' }}> Викторина</h3>
            <p style={{ margin: '0' }}>Раз в неделю: вопросы про кино, историю, финансы.</p>
            <p style={{ margin: '8px 0 0 0', color: '#fbbf24' }}>🎁 100 бонусов + сундук!</p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: '#facc15', marginTop: '0' }}>🎡 Колесо Фортуны</h3>
            <p style={{ margin: '0' }}>Раз в неделю крутите колесо и выигрывайте призы.</p>
          </div>

          <div>
            <h3 style={{ color: '#fb923c', marginTop: '0' }}>🏆 Лиги</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
              <div>🥉 Бронза: 0-2999</div>
              <div>🥈 Серебро: 3000-4999</div>
              <div>🥇 Золото: 5000-6999</div>
              <div>💎 Платина: 7000+</div>
            </div>
          </div>
        </div>

        {/* Кнопка внизу */}
        <div style={{ padding: '16px', borderTop: '1px solid #7f1d1d' }}>
          <button
            onClick={onClose}
            style={{
              width: '100%',
              background: '#dc2626',
              border: 'none',
              color: 'white',
              fontWeight: 'bold',
              padding: '12px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Понятно!
          </button>
        </div>
      </div>
    </div>
  );
}