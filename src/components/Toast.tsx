import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[200] animate-slideDown">
      <div 
        className={`px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 ${
          type === 'success' 
            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' 
            : 'bg-gradient-to-r from-red-500 to-red-700 text-white'
        }`}
        style={{ 
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          minWidth: '280px'
        }}
      >
        <span className="text-2xl">
          {type === 'success' ? '✅' : ''}
        </span>
        <span className="font-semibold text-sm">
          {message}
        </span>
      </div>
    </div>
  );
}