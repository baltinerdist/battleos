
import React, { useMemo } from 'react';
import { Match, Participant } from '../types';
import StandingsBoard, { StandingEntry } from './StandingsBoard';
import { ClipboardList, ChevronUp, ChevronDown, History } from 'lucide-react';

interface RoundRobinScoringPanelProps {
  rounds: Match[][];
  participants: Participant[];
  highlightedParticipantId?: number | string | null;
  isExpanded: boolean;
  onToggleExpand: () => void;
  status: 'draft' | 'preparation' | 'active' | 'completed';
}

const RoundRobinScoringPanel: React.FC<RoundRobinScoringPanelProps> = ({
  rounds, participants, highlightedParticipantId, isExpanded, onToggleExpand, status
}) => {
  const standingsData = useMemo(() => {
    const stats: Record<string, { wins: number; played: number; boutsWon: number; p: Participant }> = {};
    
    participants.forEach(p => {
      stats[String(p.id)] = { wins: 0, played: 0, boutsWon: 0, p };
    });
    
    const allMatches = rounds.flat();
    
    allMatches.forEach(m => {
      const p1Id = m.participant1Id;
      const p2Id = m.participant2Id;

      if (p1Id !== null && stats[String(p1Id)]) {
        stats[String(p1Id)].boutsWon += m.participant1Wins;
      }
      if (p2Id !== null && stats[String(p2Id)]) {
        stats[String(p2Id)].boutsWon += m.participant2Wins;
      }

      if (m.winnerId) {
        const winnerKey = String(m.winnerId);
        if (stats[winnerKey]) {
          stats[winnerKey].wins += 1;
        }
        
        if (p1Id !== null && stats[String(p1Id)]) stats[String(p1Id)].played += 1;
        if (p2Id !== null && stats[String(p2Id)]) stats[String(p2Id)].played += 1;
      }
    });
    
    const sorted = Object.values(stats).sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      if (b.boutsWon !== a.boutsWon) return b.boutsWon - a.boutsWon;
      return String(a.p.id).localeCompare(String(b.p.id));
    });

    return sorted.map((stat, idx) => ({
      participant: stat.p,
      rank: idx + 1,
      primaryStat: { label: 'Wins', value: stat.wins },
      secondaryStat: { label: 'Played', value: `${stat.played} | Points: ${stat.boutsWon}` },
      isWinner: idx === 0 && stat.wins > 0 && status === 'completed',
      isHighlighted: highlightedParticipantId === stat.p.id
    } as StandingEntry));
  }, [rounds, participants, status, highlightedParticipantId]);

  return (
    <StandingsBoard 
      entries={standingsData}
      title="Scoreboard"
      subtitle="Tournament Standings"
      icon={<ClipboardList className="w-6 h-6 text-app-primary" />}
      headerActions={
        <button onClick={onToggleExpand} className="lg:hidden p-1.5 hover:bg-app-surface-muted rounded-lg text-app-text-muted transition-colors">
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      }
      footer={<div className="flex items-center gap-2 text-[9px] font-bold uppercase text-app-text-muted"><History className="w-4 h-4" /><span className="truncate">Sealed Combat Ledger</span></div>}
      className={`w-full lg:w-96 border-r border-app-border transition-all duration-300 ${isExpanded ? 'max-h-[60vh]' : 'max-h-[88px] lg:max-h-full overflow-hidden'}`}
    />
  );
};

export default RoundRobinScoringPanel;
