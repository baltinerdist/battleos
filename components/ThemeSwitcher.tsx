
import React, { useState } from 'react';
import { Sun, Moon, Waves, Trees, Palette, Check } from 'lucide-react';
import { useTheme, ThemeType } from '../context/ThemeContext';

const themes: { id: ThemeType; label: string; icon: React.ElementType; color: string }[] = [
  { id: 'light', label: 'Imperial (Light)', icon: Sun, color: 'bg-blue-100 text-blue-600' },
  { id: 'dark', label: 'Void (Dark)', icon: Moon, color: 'bg-zinc-800 text-zinc-100' },
  { id: 'midnight', label: 'Midnight', icon: Waves, color: 'bg-blue-900 text-cyan-400' },
  { id: 'forest', label: 'Iron Woods', icon: Trees, color: 'bg-emerald-900 text-emerald-400' },
];

const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-app-text-muted hover:text-app-primary transition-colors flex items-center gap-2"
        title="Change Visual Theme"
      >
        <Palette className="w-5 h-5" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full right-0 mt-2 w-56 bg-app-surface border border-app-border rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-4 py-3 bg-app-surface-muted border-b border-app-border">
              <span className="text-[10px] font-black uppercase tracking-widest text-app-text-muted">Visual Protocols</span>
            </div>
            <div className="p-1">
              {themes.map((t) => {
                const Icon = t.icon;
                const isActive = theme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => { setTheme(t.id); setIsOpen(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${isActive ? 'bg-app-primary-muted text-app-primary' : 'text-app-text-muted hover:bg-app-surface-muted hover:text-app-text'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg ${t.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span>{t.label}</span>
                    </div>
                    {isActive && <Check className="w-4 h-4" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ThemeSwitcher;
