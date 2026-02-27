
import React, { useMemo } from 'react';
import { Participant, Tournament, ParticipantStats } from '../types';
import StandingsBoard, { StandingEntry } from './StandingsBoard';
import { Crown, Trophy, History, Zap, ChevronUp, ChevronDown } from 'lucide-react';

interface IronmanScoringPanelProps {
  tournament: Tournament;
  highlightedParticipantId?: number | string | null;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const IronmanScoringPanel: React.FC<IronmanScoringPanelProps> = ({
  tournament, highlightedParticipantId, isExpanded, onToggleExpand
}) => {
  const standingsData = useMemo(() => {
    const stats = Object.values(tournament.ironmanStats || {}) as ParticipantStats[];
    const progressed = new Set((tournament.progressedIds || []).map(String));
    return [...stats]
      .sort((a, b) => {
        const aProg = progressed.has(String(a.participantId)) ? 1 : 0;
        const bProg = progressed.has(String(b.participantId)) ? 1 : 0;
        if (bProg !== aProg) return bProg - aProg;
        return b.wins - a.wins || b.maxStreak - a.maxStreak;
      })
      .map((stat, idx) => {
        const participant = tournament.participants.find(p => p.id === stat.participantId);
        if (!participant) return null;
        const isProg = progressed.has(String(participant.id));
        return {
          participant,
          rank: idx + 1,
          primaryStat: { label: 'Wins', value: stat.wins },
          secondaryStat: { label: isProg ? <Trophy className="w-3 h-3 text-app-accent" /> : 'Streak', value: isProg ? 'PROGRESSED' : `${stat.currentStreak} (Max: ${stat.maxStreak})` },
          isWinner: idx === 0 && stat.wins > 0,
          isHighlighted: highlightedParticipantId === participant.id || isProg
        } as StandingEntry;
      }).filter(Boolean) as StandingEntry[];
  }, [tournament.ironmanStats, tournament.participants, tournament.progressedIds, highlightedParticipantId]);

  return (
    <StandingsBoard 
      entries={standingsData} 
      title="Standings" 
      subtitle="Tournament Stats" 
      icon={<Crown className="w-6 h-6 text-app-accent" />} 
      headerActions={
        <button onClick={onToggleExpand} className="md:hidden p-1.5 hover:bg-app-surface-muted rounded-lg text-app-text-muted transition-colors">
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      } 
      footer={<div className="flex items-center gap-2 text-[9px] font-bold uppercase text-app-text-muted"><History className="w-4 h-4" /><span className="truncate">Sealed Combat Record</span></div>} 
      className={`w-full md:w-96 border-l border-app-border transition-all duration-300 ${isExpanded ? 'max-h-[60vh]' : 'max-h-[88px] md:max-h-full overflow-hidden'}`} 
    />
  );
};

export default IronmanScoringPanel;
