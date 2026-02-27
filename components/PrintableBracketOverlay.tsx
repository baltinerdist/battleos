import React, { useCallback, useLayoutEffect, useRef, useState, useMemo } from 'react';
import { Match, Participant, Tournament, Reeve, APP_VERSION } from '../types';
import { X, Printer, RefreshCw, ShieldCheck } from 'lucide-react';

interface PrintableBracketOverlayProps {
  tournament: Tournament;
  participants: Participant[];
  onClose: () => void;
  eventDate: string;
  kingdom: string;
  parkName: string;
  allReeves: Reeve[];
}

interface ConnectionPath {
  d: string;
  isActive: boolean;
}

/**
 * Sub-component for a single bracket page to encapsulate localized measurements
 */
const BracketPage: React.FC<{
  title: string;
  rounds: Match[][];
  participants: Participant[];
  eventDate: string;
  location: string;
  reeveList: string;
  finalMatch?: Match | null;
  thirdPlaceMatch?: Match | null;
  isLoserBracket?: boolean;
}> = ({ title, rounds, participants, eventDate, location, reeveList, finalMatch, thirdPlaceMatch, isLoserBracket }) => {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const [paths, setPaths] = useState<ConnectionPath[]>([]);
  const [svgSize, setSvgSize] = useState({ w: 0, h: 0 });

  const getParticipantName = (id: number | string | null) => {
    if (id === null) return 'BYE';
    const p = participants.find((part) => part.id === id);
    return p ? p.name : 'TBD';
  };

  const getRoundName = (roundIdx: number, totalRounds: number): string => {
    if (isLoserBracket) return `L-Round ${roundIdx + 1}`;
    const dist = totalRounds - 1 - roundIdx;
    if (dist === 0) return 'Finals';
    if (dist === 1) return 'Semi-Finals';
    if (dist === 2) return 'Quarter-Finals';
    return `Round ${roundIdx + 1}`;
  };

  const calculatePaths = useCallback(() => {
    const surface = surfaceRef.current;
    if (!surface) return;

    const w = Math.max(1, surface.scrollWidth);
    const h = Math.max(1, surface.scrollHeight);
    setSvgSize({ w, h });

    const surfaceRect = surface.getBoundingClientRect();
    const matchElements = Array.from(surface.querySelectorAll('[data-match-id]')) as HTMLElement[];
    const rectById = new Map<string, DOMRect>();
    
    for (const el of matchElements) {
      const id = el.getAttribute('data-match-id');
      if (id) rectById.set(id, el.getBoundingClientRect());
    }

    const newPaths: ConnectionPath[] = [];
    const allMatches = [...rounds.flat(), finalMatch, thirdPlaceMatch].filter(Boolean) as Match[];

    for (const match of allMatches) {
      if (!match.nextMatchId) continue;
      const startRect = rectById.get(match.id);
      const endRect = rectById.get(match.nextMatchId);

      if (startRect && endRect) {
        const startX = startRect.right - surfaceRect.left;
        const startY = startRect.top + startRect.height / 2 - surfaceRect.top;
        const endX = endRect.left - surfaceRect.left;
        const endY = endRect.top + endRect.height / 2 - surfaceRect.top;

        const minLeg = 14;
        const rawMidX = startX + (endX - startX) / 2;
        const midX = Math.max(startX + minLeg, Math.min(rawMidX, endX - minLeg));

        const d = `M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${endY} L ${endX} ${endY}`;
        newPaths.push({ d, isActive: !!match.winnerId });
      }
    }
    setPaths(newPaths);
  }, [rounds, finalMatch, thirdPlaceMatch]);

  useLayoutEffect(() => {
    calculatePaths();
    window.addEventListener('resize', calculatePaths);
    const t = setTimeout(calculatePaths, 300);
    return () => {
      window.removeEventListener('resize', calculatePaths);
      clearTimeout(t);
    };
  }, [calculatePaths]);

  return (
    <div className="bracket-page-container bg-white text-black p-4 sm:p-8 print:p-0 print:m-0 break-after-page min-h-screen flex flex-col">
      {/* Tactical Header */}
      <div className="border-b-2 border-black pb-4 mb-6 flex flex-col gap-2">
        <div className="flex items-end justify-between">
          <h1 className="text-3xl font-medieval uppercase tracking-wider leading-none">{title}</h1>
          <div className="text-right text-[10px] font-bold uppercase tracking-widest">
            {eventDate} | {location}
          </div>
        </div>
        {reeveList && (
          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-zinc-600 border-t border-zinc-100 pt-2">
            <ShieldCheck className="w-3.5 h-3.5 text-black" />
            <span className="flex-1">Reeves: {reeveList}</span>
          </div>
        )}
      </div>

      {/* Main Bracket Surface */}
      <div ref={surfaceRef} className="relative flex-1 min-w-max">
        <svg
          className="absolute inset-0 pointer-events-none z-0 overflow-visible"
          width={svgSize.w}
          height={svgSize.h}
          viewBox={`0 0 ${svgSize.w} ${svgSize.h}`}
        >
          {paths.map((path, i) => (
            <path
              key={i}
              d={path.d}
              fill="none"
              stroke="black"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ opacity: path.isActive ? 1 : 0.2 }}
            />
          ))}
        </svg>

        <div className="flex gap-x-0 items-stretch relative z-10 h-full">
          {rounds.map((round, rIdx) => (
            <div key={rIdx} className="flex flex-col min-w-[180px] flex-1">
              <div className="text-center py-1 border-b border-black mb-4 mx-2">
                <h3 className="text-[9px] font-black uppercase tracking-[0.2em]">{getRoundName(rIdx, rounds.length)}</h3>
              </div>
              <div className="flex-1 flex flex-col justify-around">
                {round.map((match) => (
                  <div key={match.id} className="flex items-center justify-center py-1.5 relative">
                    <div data-match-id={match.id} className="match-box w-36 border border-black rounded p-1.5 bg-white shadow-sm">
                      <div className={`flex justify-between items-center text-[10px] pb-1 border-b border-zinc-100 ${match.winnerId === match.participant1Id ? 'font-black' : ''}`}>
                        <span className="truncate flex-1 pr-1.5">{getParticipantName(match.participant1Id)}</span>
                        {match.participant1Wins > 0 && <span>{'•'.repeat(match.participant1Wins)}</span>}
                      </div>
                      <div className={`flex justify-between items-center text-[10px] pt-1 ${match.winnerId === match.participant2Id ? 'font-black' : ''}`}>
                        <span className="truncate flex-1 pr-1.5">{getParticipantName(match.participant2Id)}</span>
                        {match.participant2Wins > 0 && <span>{'•'.repeat(match.participant2Wins)}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Finals/Grand Final logic for the main bracket page */}
          {(finalMatch || thirdPlaceMatch) && !isLoserBracket && (
            <div className="flex flex-col min-w-[200px] flex-1">
              <div className="text-center py-1 border-b border-black mb-4 mx-2">
                <h3 className="text-[9px] font-black uppercase tracking-[0.2em]">Exhibition Final</h3>
              </div>
              <div className="flex-1 flex flex-col justify-around">
                {finalMatch && (
                  <div className="flex items-center justify-center py-4">
                    <div data-match-id={finalMatch.id} className="match-box w-40 border-2 border-black rounded-lg p-2 bg-white shadow-md">
                      <div className="text-[8px] font-black uppercase tracking-widest text-center mb-1 pb-1 border-b border-zinc-100">Championship</div>
                      <div className={`flex justify-between items-center text-[11px] pb-1.5 border-b border-zinc-100 ${finalMatch.winnerId === finalMatch.participant1Id ? 'font-black' : ''}`}>
                        <span className="truncate flex-1">{getParticipantName(finalMatch.participant1Id)}</span>
                      </div>
                      <div className={`flex justify-between items-center text-[11px] pt-1.5 ${finalMatch.winnerId === finalMatch.participant2Id ? 'font-black' : ''}`}>
                        <span className="truncate flex-1">{getParticipantName(finalMatch.participant2Id)}</span>
                      </div>
                    </div>
                  </div>
                )}
                {thirdPlaceMatch && (
                  <div className="flex items-center justify-center py-4 border-t border-zinc-100 mt-4">
                    <div data-match-id={thirdPlaceMatch.id} className="match-box w-36 border border-zinc-400 rounded p-1.5 bg-white opacity-80">
                      <div className="text-[7px] font-black uppercase tracking-widest text-center mb-1">Bronze Match</div>
                      <div className="flex justify-between items-center text-[9px] pb-1 border-b border-zinc-50 font-bold">
                        <span>{getParticipantName(thirdPlaceMatch.participant1Id)}</span>
                      </div>
                      <div className="flex justify-between items-center text-[9px] pt-1 font-bold">
                        <span>{getParticipantName(thirdPlaceMatch.participant2Id)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer per page */}
      <div className="mt-auto pt-4 border-t border-zinc-200 text-center text-[7px] font-mono uppercase tracking-[0.4em] text-zinc-400">
        BattleOS V{APP_VERSION} :: Manifest Authenticated :: Sealed {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};

const PrintableBracketOverlay: React.FC<PrintableBracketOverlayProps> = ({
  tournament,
  participants,
  onClose,
  eventDate,
  kingdom,
  parkName,
  allReeves
}) => {
  const handlePrint = () => {
    window.print();
  };

  // Fix: Added useMemo to React import above and using it here to calculate reeveNames
  const reeveNames = useMemo(() => {
    const selectedIds = tournament.config.selectedReeveIds || [];
    return allReeves
      .filter(r => selectedIds.includes(r.id))
      .map(r => r.name)
      .join(' — ');
  }, [tournament, allReeves]);

  const locationStr = `${kingdom}${parkName ? ` — ${parkName}` : ''}`;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-2 sm:p-6 overflow-hidden print:p-0 print:block print:bg-white transition-all">
      <div className="absolute inset-0 bg-zinc-950/90 backdrop-blur-xl print:hidden" onClick={onClose} />

      <style>{`
        @media print {
          @page { size: landscape; margin: 0.5cm; }
          body { background: white !important; color: black !important; }
          .print-hidden { display: none !important; }
          .printable-root { overflow: visible !important; height: auto !important; width: 100% !important; background: white !important; }
          .break-after-page { break-after: page; page-break-after: always; }
        }
      `}</style>

      <div className="printable-root relative w-full max-w-7xl h-full bg-zinc-100 text-black border border-zinc-300 rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300 print:shadow-none print:border-none print:h-auto print:static print:rounded-none">
        {/* Modal Toolbar - Hidden during print */}
        <div className="px-6 py-3 bg-white border-b border-zinc-200 flex items-center justify-between print:hidden shrink-0">
          <div className="flex flex-col text-left">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Combat Manifest</h2>
            <h1 className="text-lg font-medieval text-zinc-900">{tournament.name}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-6 py-2.5 bg-zinc-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all shadow-lg active:scale-95"
            >
              <Printer className="w-4 h-4" /> Print Tactical Record
            </button>
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-auto custom-scrollbar bg-zinc-100 print:overflow-visible print:bg-white">
          <div className="flex flex-col print:w-full">
            {/* Page 1: Winners Bracket / Main Rounds */}
            <BracketPage 
              title={tournament.name}
              rounds={tournament.rounds}
              participants={participants}
              eventDate={eventDate}
              location={locationStr}
              reeveList={reeveNames}
              finalMatch={tournament.grandFinal}
              thirdPlaceMatch={tournament.thirdPlaceMatch}
            />

            {/* Page 2: Losers Bracket (if double-elim) */}
            {tournament.loserRounds && tournament.loserRounds.length > 0 && (
              <BracketPage 
                title={`${tournament.name} - Underworld Bracket`}
                rounds={tournament.loserRounds}
                participants={participants}
                eventDate={eventDate}
                location={locationStr}
                reeveList={reeveNames}
                isLoserBracket={true}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintableBracketOverlay;