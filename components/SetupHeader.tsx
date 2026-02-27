
import React from 'react';
import { Sword, LogOut, HelpCircle, Save } from 'lucide-react';
import ThemeSwitcher from './ThemeSwitcher';

interface SetupHeaderProps {
  eventName: string;
  onLeaveEvent: () => void;
  onShowHelp: () => void;
  dataManagerSlot: React.ReactNode;
  isAutoSaving?: boolean;
}

const SetupHeader: React.FC<SetupHeaderProps> = ({
  eventName,
  onLeaveEvent,
  onShowHelp,
  dataManagerSlot,
  isAutoSaving = false,
}) => {
  return (
    <header className="bg-app-surface border-b border-app-border px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm transition-all duration-300">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-app-primary rounded-lg shadow-lg shadow-app-primary/20">
            <Sword className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col text-left">
            <h1 className="text-2xl font-medieval tracking-widest leading-none text-app-text">
              Battle<span className="text-app-primary">OS</span>
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-widest text-app-text-muted mt-1">{eventName}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {isAutoSaving && (
          <div className="flex items-center gap-2 px-3 py-1 bg-app-primary-muted border border-app-primary/20 rounded-full animate-pulse">
            <Save className="w-3 h-3 text-app-primary" />
            <span className="hidden sm:inline text-[8px] font-black text-app-primary uppercase tracking-widest">Autosaving...</span>
          </div>
        )}

        <ThemeSwitcher />
        
        <button 
          onClick={onLeaveEvent}
          className="p-2 text-app-text-muted hover:text-app-primary transition-colors"
          title="Leave Event"
        >
          <LogOut className="w-5 h-5" />
        </button>
        
        {dataManagerSlot}
        
        <button 
          onClick={onShowHelp} 
          className="p-2 text-app-text-muted hover:text-app-text transition-colors"
          title="Marshal's Manual"
        >
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default SetupHeader;
