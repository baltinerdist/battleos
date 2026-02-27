
import React, { useState, useEffect, useRef } from 'react';
import { Timer as TimerIcon, Play, Pause, Plus, Square } from 'lucide-react';

interface IronmanTimerProps {
  durationMinutes: number;
  onComplete: () => void;
  status: 'draft' | 'preparation' | 'active' | 'completed';
}

const IronmanTimer: React.FC<IronmanTimerProps> = ({ durationMinutes, onComplete, status }) => {
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  const [isActive, setIsActive] = useState(false);
  const [isConfirmingEnd, setIsConfirmingEnd] = useState(false);
  
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  useEffect(() => {
    if (status === 'preparation' || status === 'draft') {
      setTimeLeft(durationMinutes * 60);
    }
  }, [durationMinutes, status]);

  useEffect(() => {
    if (isActive) setIsConfirmingEnd(false);
  }, [isActive]);

  useEffect(() => {
    let interval: any;
    if (isActive) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            onCompleteRef.current();
            setIsActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndEarly = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isConfirmingEnd) {
      onCompleteRef.current();
      setIsActive(false);
      setIsConfirmingEnd(false);
      setTimeLeft(0);
    } else {
      setIsConfirmingEnd(true);
    }
  };

  return (
    <div className="flex items-center gap-1.5 sm:gap-3">
      <div className="flex items-center gap-2 sm:gap-4 bg-app-surface px-3 sm:px-5 py-2.5 rounded-2xl border border-app-border shadow-xl ring-1 ring-app-border transition-colors">
        <div className={`p-2 rounded-xl transition-all duration-300 ${isActive ? 'bg-app-primary shadow-[0_0_15px_rgba(var(--primary),0.3)] animate-pulse' : 'bg-app-surface-muted'}`}>
          <TimerIcon className={`w-4 h-4 sm:w-5 h-5 ${isActive ? 'text-white' : 'text-app-text-muted'}`} />
        </div>
        <div className="min-w-[45px] sm:min-w-[80px]">
          <h3 className="text-[7px] sm:text-[8px] uppercase tracking-widest text-app-text-muted font-black leading-none mb-1">Time Remaining</h3>
          <div className={`text-base sm:text-2xl font-medieval tracking-[0.1em] tabular-nums leading-none transition-colors ${timeLeft < 60 && isActive ? 'text-rose-600 animate-pulse' : 'text-app-text'}`}>
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <button 
          onClick={(e) => { e.stopPropagation(); setIsActive(!isActive); }} 
          disabled={status === 'preparation' || status === 'completed' || (timeLeft === 0 && !isActive)}
          className={`
            group flex items-center justify-center gap-2 w-12 sm:w-auto px-0 sm:px-6 py-3 rounded-2xl font-black uppercase tracking-[0.15em] transition-all transform active:scale-95 shadow-xl text-[10px] border-b-4 h-[52px]
            ${status === 'preparation' || status === 'completed' || (timeLeft === 0 && !isActive) ? 'bg-app-surface-muted border-app-border text-app-text-muted opacity-50 cursor-not-allowed' : 
              isActive ? 'bg-app-surface-muted border-app-border text-app-primary hover:text-app-primary/80' : 
              'bg-app-primary border-app-primary/80 text-white hover:bg-app-primary/90'}
          `}
        >
          {isActive ? <Pause className="w-5 h-5 sm:w-4 sm:h-4 fill-current" /> : <Play className="w-5 h-5 sm:w-4 sm:h-4 fill-current" />}
          <span className="hidden sm:inline">{isActive ? 'Pause' : 'Start'}</span>
        </button>

        <button 
          onClick={(e) => { e.stopPropagation(); setTimeLeft(p => p + 60); }}
          disabled={status === 'completed'}
          className="group flex flex-col items-center justify-center w-10 sm:w-12 h-[52px] bg-app-surface border border-app-border hover:border-app-text-muted text-app-text-muted hover:text-app-primary rounded-2xl transition-all shadow-lg active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
          title="Add 1 Minute"
        >
          <Plus className="w-3 h-3 mb-0.5" />
          <span className="text-[7px] sm:text-[9px] font-black">1M</span>
        </button>

        {!isActive && status === 'active' && (
          <button 
            onClick={handleEndEarly}
            className={`
              group flex flex-col items-center justify-center w-12 sm:w-auto px-0 sm:px-4 h-[52px] border transition-all shadow-lg active:scale-95 rounded-2xl animate-in fade-in slide-in-from-left-2 duration-300
              ${isConfirmingEnd 
                ? 'bg-rose-600 border-rose-800 text-white shadow-rose-900/20' 
                : 'bg-rose-500/10 border-rose-500/20 text-rose-500 hover:bg-rose-600 hover:text-white'}
            `}
            title="Terminate Match Early"
          >
            <Square className={`w-5 h-5 sm:w-3 sm:h-3 sm:mb-0.5 ${isConfirmingEnd ? 'fill-current' : ''}`} />
            <span className="hidden sm:inline text-[9px] font-black uppercase tracking-widest">{isConfirmingEnd ? 'Confirm?' : 'End Early'}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default IronmanTimer;
