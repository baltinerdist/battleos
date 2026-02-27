import React, { useEffect } from 'react';
import { ClipboardCheck, X } from 'lucide-react';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, isVisible, onClose, duration = 5000 }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose, duration]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="relative bg-zinc-900 border-2 border-emerald-500/50 text-white px-6 py-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-4 max-w-md backdrop-blur-xl overflow-hidden">
        <div className="bg-emerald-500 p-2 rounded-xl">
          <ClipboardCheck className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-bold leading-relaxed">
            {message}
          </p>
        </div>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Progress Bar Countdown */}
        <div 
          className="absolute bottom-0 left-0 h-1 bg-emerald-500 animate-shrink"
          style={{ 
            animationDuration: `${duration}ms` 
          }}
        />
      </div>
    </div>
  );
};

export default Toast;