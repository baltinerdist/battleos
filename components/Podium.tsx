
import React from 'react';
import { Trophy } from 'lucide-react';
import { Participant } from '../types';

interface PodiumProps {
  winner: Participant | null;
  accentColor: 'sky' | 'blue';
}

const Podium: React.FC<PodiumProps> = ({ winner, accentColor }) => {
  const accentText = 'text-app-primary';
  const accentBg = 'bg-app-surface';
  const accentBorder = 'border-app-primary/20';
  const glow = 'bg-app-primary';

  return (
    <div className={`w-80 p-12 ${accentBg} border-2 ${accentBorder} rounded-[2.5rem] flex flex-col items-center gap-12 text-center shadow-2xl backdrop-blur-md transform hover:scale-105 transition-all duration-1000 ease-out`}>
      <div className={`p-10 bg-app-surface-muted rounded-full border-2 ${accentBorder} relative shadow-inner`}>
        <Trophy className={`w-24 h-24 ${accentText} relative z-10 drop-shadow-lg`} />
        <div className={`absolute inset-0 rounded-full blur-[48px] opacity-20 ${glow}`}></div>
      </div>
      <div className="space-y-6 w-full">
        <p className={`text-sm uppercase tracking-[0.7em] ${accentText} font-black opacity-60`}>Glorious Champion</p>
        <div className="h-[3px] w-28 mx-auto bg-app-border my-8 rounded-full"></div>
        <p className="text-4xl font-medieval text-app-text drop-shadow-sm transition-all leading-tight">
          {winner ? winner.name : 'Awaiting Finalist'}
        </p>
      </div>
    </div>
  );
};

export default Podium;
