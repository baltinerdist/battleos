import React from 'react';
import { Participant, Tournament, Match, Reeve, Judge, ParticipantStats, Team, APP_VERSION } from '../types';
import { WEAPON_CLASSES, DIVISIONS } from './TournamentSetup';
import { calculateEntryScore } from './ArtsListingView';
import { X, Trophy, Shield, Calendar, Users, Swords, Award, Info, Printer, ListOrdered, Palette, LayoutList, UserCheck, Mail, Zap, Crown, StickyNote, Scissors, BookOpen, MapPin, Mountain, Star } from 'lucide-react';

interface TournamentReportProps {
  data: {
    eventName: string;
    eventDate: string;
    kingdom: string;
    parkTitle: string;
    parkName: string;
    tournaments: Tournament[];
    participants: Participant[];
  };
  onClose: () => void;
}

const AWARD_LABELS: Record<string, string> = {
  griffon: 'Griffon',
  warrior: 'Warrior',
  battle: 'Battle',
  owl: 'Owl',
  dragon: 'Dragon',
  garber: 'Garber',
  smith: 'Smith'
};

const TournamentReport: React.FC<TournamentReportProps> = ({ data, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleEmail = () => {
    const firstTourneyName = data.tournaments[0]?.name || data.eventName;
    const subject = encodeURIComponent(`${firstTourneyName} Tournament Report`);
    
    let bodyText = `*** OFFICIAL BATTLEOS TOURNAMENT RECORD ***\n\n`;
    bodyText += `EVENT: ${data.eventName}\n`;
    bodyText += `DATE: ${data.eventDate}\n`;
    bodyText += `PROVENANCE: Kingdom of ${data.kingdom} | ${data.parkTitle} ${data.parkName || '[Unnamed Park]'}\n`;
    bodyText += `TOTAL REGISTRANTS: ${data.participants.length}\n`;
    bodyText += `\n==========================================\n\n`;

    data.tournaments.forEach((t, idx) => {
      const isArts = t.config.eventType === 'arts';
      bodyText += `${idx + 1}. ${t.name.toUpperCase()}\n`;
      bodyText += `FORMAT: ${t.config.type}\n`;
      bodyText += `STATUS: ${t.status.toUpperCase()}\n`;
      if (t.config.isTeams) bodyText += `MODE: SQUAD COMBAT\n`;
      if (t.notes) {
        bodyText += `FIELD NOTES: ${t.notes}\n`;
      }
      bodyText += `\n`;

      if (t.config.isTeams && t.config.teams) {
        bodyText += `SQUAD ROSTERS:\n`;
        t.config.teams.forEach(team => {
          const fighters = team.fighterIds.map(id => data.participants.find(p => p.id === id));
          const names = fighters.map(p => p?.name || 'Unknown').join(', ');
          const teamStrength = fighters.reduce((sum, p) => sum + (p?.warriorRank || 0), 0);
          bodyText += `- [Team ${team.id}] ${team.name} (Strength: ${teamStrength}): ${names}\n`;
        });
        bodyText += `\n`;
      }

      if (isArts) {
        bodyText += `ARTISAN STANDINGS:\n`;
        const entries = (t.rounds[0] || []).map(e => {
          const p = data.participants.find(part => part.id === e.participant1Id);
          const name = t.config.isAnonymous ? `Artisan #${e.participant1Id}` : (p?.name || 'Unassigned');
          
          let feedbackStr = '';
          if (e.judgeNotes) {
            const draftedJudges = (t.config as any).draftedJudges as Judge[] || [];
            Object.entries(e.judgeNotes).forEach(([jId, note]) => {
              const noteStr = note as string;
              if (noteStr && noteStr.trim()) {
                const judgeName = draftedJudges.find(j => j.id === parseInt(jId))?.name || `Judge ${jId}`;
                feedbackStr += `  - [${judgeName}]: ${noteStr.trim()}\n`;
              }
            });
          }

          return {
            name,
            title: e.title || 'Untitled',
            score: calculateEntryScore(e.judgeScores, e.judgePasses, t.config.scoringCondition),
            feedback: feedbackStr
          };
        });
        entries.sort((a, b) => b.score - a.score).forEach(e => {
          bodyText += `- ${e.name}: "${e.title}" | Score: ${e.score}\n`;
          if (e.feedback) bodyText += `${e.feedback}`;
        });
      } else if (t.config.type === 'ironman') {
        bodyText += `IRONMAN STANDINGS:\n`;
        const stats = Object.values(t.ironmanStats || {}) as ParticipantStats[];
        const sorted = stats.sort((a, b) => b.wins - a.wins || b.maxStreak - a.maxStreak);
        sorted.forEach((s, rank) => {
          const unit = t.participants.find(part => part.id === s.participantId);
          bodyText += `${rank + 1}. ${unit?.name || 'Unknown'}: ${s.wins} Wins | Max Streak: ${s.maxStreak}\n`;
        });
      } else {
        bodyText += `COMBAT STANDINGS:\n`;
        const stats: Record<string | number, number> = {};
        t.participants.forEach(p => stats[p.id] = 0);
        [...t.rounds.flat(), ...t.loserRounds.flat(), t.grandFinal, t.thirdPlaceMatch].forEach(m => {
          if (m && m.winnerId) stats[m.winnerId] = (stats[m.winnerId] || 0) + 1;
        });
        const sorted = Object.entries(stats)
          .map(([id, wins]) => {
            const pId = isNaN(Number(id)) ? id : Number(id);
            const unit = t.participants.find(p => p.id === pId);
            return { name: unit?.name || 'Unknown', id: pId, wins };
          })
          .sort((a, b) => b.wins - a.wins);
        
        sorted.forEach((s, rank) => {
          bodyText += `${rank + 1}. ${s.name} (${s.id}): ${s.wins} Victories\n`;
        });
      }

      const participantsInTourney = isArts 
        ? (t.rounds[0] || []).map(e => data.participants.find(p => p.id === e.participant1Id)).filter(Boolean) as Participant[]
        : t.participants;

      const logsWithContent = participantsInTourney.filter(p => {
        const notes = isArts ? p.artsNotes : p.martialNotes;
        const recs = isArts ? p.artsRecommendations : p.martialRecommendations;
        return (notes && notes.trim().length > 0) || (recs && recs.length > 0);
      });

      if (logsWithContent.length > 0) {
        bodyText += `\nCOMPETITOR LOGS:\n`;
        logsWithContent.forEach(p => {
          const notes = isArts ? p.artsNotes : p.martialNotes;
          const recs = isArts ? p.artsRecommendations : p.martialRecommendations;
          bodyText += `- ${p.name}:\n`;
          if (recs && recs.length > 0) bodyText += `  RECS: ${recs.map(r => AWARD_LABELS[r] || r).join(', ')}\n`;
          if (notes && notes.trim()) bodyText += `  NOTES: ${notes.trim()}\n`;
        });
      }

      bodyText += `\n------------------------------------------\n\n`;
    });

    bodyText += `\nRECORD SEALED VIA BATTLEOS V${APP_VERSION}\nGENERATED AT: ${new Date().toLocaleString()}`;
    
    const mailtoLink = `mailto:?subject=${subject}&body=${encodeURIComponent(bodyText)}`;
    window.location.href = mailtoLink;
  };

  const getWeaponLabel = (wcId?: string) => {
    return WEAPON_CLASSES.find(w => w.id === wcId)?.label || 'Open Class';
  };

  const renderParticipantLogs = (participants: Participant[], isArts: boolean) => {
    const logs = participants.filter(p => {
      const notes = isArts ? p.artsNotes : p.martialNotes;
      const recs = isArts ? p.artsRecommendations : p.martialRecommendations;
      return (notes && notes.trim().length > 0) || (recs && recs.length > 0);
    });

    if (logs.length === 0) return null;

    return (
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-app-text-muted uppercase tracking-widest flex items-center gap-2 print:text-black">
          <span className="p-1 bg-app-surface rounded print:hidden border border-app-border"><StickyNote className="w-3.5 h-3.5" /></span> Competitor Logs & Awards
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {logs.map(p => {
            const notes = isArts ? p.artsNotes : p.martialNotes;
            const recs = isArts ? p.artsRecommendations : p.martialRecommendations;
            return (
              <div key={p.id} className="bg-app-surface-muted border border-app-border rounded-2xl p-4 print:border-black print:bg-transparent transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-app-text print:text-black">{p.name}</span>
                  <span className="text-[9px] font-black text-app-text-muted uppercase tracking-widest print:text-black">ID: {p.id}</span>
                </div>
                {recs && recs.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {recs.map(r => (
                      <div key={r} className="flex items-center gap-1 px-2 py-0.5 bg-app-accent/10 border border-app-accent/20 rounded-lg text-[8px] font-black text-app-accent uppercase tracking-widest print:text-black print:border-black">
                        <Star className="w-2.5 h-2.5 fill-current" /> {AWARD_LABELS[r] || r}
                      </div>
                    ))}
                  </div>
                )}
                {notes && notes.trim() && (
                  <div className="text-xs text-app-text-muted print:text-black leading-relaxed italic bg-app-surface p-3 rounded-xl border border-app-border print:border-black transition-colors">
                    "{notes}"
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderCombatStandings = (t: Tournament) => {
    const stats: Record<string | number, number> = {};
    t.participants.forEach(p => stats[p.id] = 0);
    [...t.rounds.flat(), ...t.loserRounds.flat(), t.grandFinal, t.thirdPlaceMatch].forEach(m => {
      if (m && m.winnerId) stats[m.winnerId] = (stats[m.winnerId] || 0) + 1;
    });

    const sorted = Object.entries(stats)
      .map(([id, wins]) => {
        const pId = isNaN(Number(id)) ? id : Number(id);
        const unit = t.participants.find(p => p.id === pId);
        return { unit, id: pId, wins };
      })
      .sort((a, b) => b.wins - a.wins);

    return (
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-app-text-muted uppercase tracking-widest flex items-center gap-2 print:text-black">
          <span className="p-1 bg-app-surface border border-app-border rounded print:hidden"><Swords className="w-3.5 h-3.5" /></span> Combat Standings
        </h3>
        <div className="overflow-x-auto rounded-2xl border border-app-border print:border-black transition-colors">
          <table className="w-full text-left border-collapse">
            <thead className="bg-app-surface print:bg-transparent transition-colors">
              <tr>
                <th className="px-4 py-3 text-[9px] font-black text-app-text-muted uppercase tracking-[0.2em] border-b border-app-border print:border-black print:text-black">ID</th>
                <th className="px-4 py-3 text-[9px] font-black text-app-text-muted uppercase tracking-[0.2em] border-b border-app-border print:border-black print:text-black">{t.config.isTeams ? 'Team' : 'Combatant'}</th>
                <th className="px-4 py-3 text-[9px] font-black text-app-primary uppercase tracking-[0.2em] border-b border-app-border print:border-black print:text-black text-right">Victories</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-border print:divide-black transition-colors">
              {sorted.map((s) => (
                <tr key={s.id} className="hover:bg-app-surface-muted transition-colors">
                  <td className="px-4 py-3 text-xs text-app-text-muted font-mono print:text-black">{s.id}</td>
                  <td className="px-4 py-3 text-sm font-bold text-app-text print:text-black">{s.unit?.name || 'Unknown'}</td>
                  <td className="px-4 py-3 text-right text-sm font-medieval text-app-primary print:text-black">{s.wins}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderIronmanTable = (t: Tournament) => {
    const stats = Object.values(t.ironmanStats || {}) as ParticipantStats[];
    const sorted = stats.sort((a, b) => b.wins - a.wins || b.maxStreak - a.maxStreak);

    return (
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-app-text-muted uppercase tracking-widest flex items-center gap-2 print:text-black">
          <span className="p-1 bg-app-surface border border-app-border rounded print:hidden"><Crown className="w-3.5 h-3.5" /></span> Ironman Field Stats
        </h3>
        <div className="overflow-x-auto rounded-2xl border border-app-border print:border-black transition-colors">
          <table className="w-full text-left border-collapse">
            <thead className="bg-app-surface print:bg-transparent transition-colors">
              <tr>
                <th className="px-4 py-3 text-[9px] font-black text-app-text-muted uppercase tracking-[0.2em] border-b border-app-border print:border-black print:text-black">Rank</th>
                <th className="px-4 py-3 text-[9px] font-black text-app-text-muted uppercase tracking-[0.2em] border-b border-app-border print:border-black print:text-black">{t.config.isTeams ? 'Team' : 'Combatant'}</th>
                <th className="px-4 py-3 text-[9px] font-black text-app-primary uppercase tracking-[0.2em] border-b border-app-border print:border-black print:text-black text-center">Wins</th>
                <th className="px-4 py-3 text-[9px] font-black text-app-accent uppercase tracking-[0.2em] border-b border-app-border print:border-black print:text-black text-center">Max Streak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-border print:divide-black transition-colors">
              {sorted.map((s, idx) => {
                const unit = t.participants.find(part => part.id === s.participantId);
                return (
                  <tr key={s.participantId} className="hover:bg-app-surface-muted transition-colors">
                    <td className="px-4 py-3 text-xs text-app-text-muted font-mono print:text-black">#{idx + 1}</td>
                    <td className="px-4 py-3 text-sm font-bold text-app-text print:text-black">{unit?.name || 'Unknown'} <span className="text-[10px] text-app-text-muted">({s.participantId})</span></td>
                    <td className="px-4 py-3 text-center text-sm font-medieval text-app-primary print:text-black">{s.wins}</td>
                    <td className="px-4 py-3 text-center text-sm font-medieval text-app-accent print:text-black">{s.maxStreak}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderArtsTables = (t: Tournament) => {
    const entries = (t.rounds[0] || []).map(e => ({
      ...e,
      mean: calculateEntryScore(e.judgeScores, e.judgePasses, t.config.scoringCondition)
    }));
    const draftedJudges = (t.config as any).draftedJudges as Judge[] || [];
    const isAnon = t.config.isAnonymous;

    const divisionWinners: Record<string, { entry: any; artisan: Participant | undefined }> = {};
    entries.forEach(e => {
      if (!e.division) return;
      if (!divisionWinners[e.division] || e.mean > divisionWinners[e.division].entry.mean) {
        divisionWinners[e.division] = {
          entry: e,
          artisan: data.participants.find(p => p.id === e.participant1Id)
        };
      }
    });

    const artisanCombinedScores: Record<string | number, { total: number; breakdown: Record<string, number>; participant: Participant }> = {};
    entries.forEach(e => {
      if (e.participant1Id === null || !e.division) return;
      if (!artisanCombinedScores[e.participant1Id]) {
        const p = data.participants.find(part => part.id === e.participant1Id);
        if (!p) return;
        artisanCombinedScores[e.participant1Id] = { total: 0, breakdown: {}, participant: p };
      }
      const currentArtisan = artisanCombinedScores[e.participant1Id];
      currentArtisan.breakdown[e.division] = Math.max(currentArtisan.breakdown[e.division] || 0, e.mean);
    });

    const combinedStandings = Object.values(artisanCombinedScores).map(art => {
      const total = Object.values(art.breakdown).reduce((sum, val) => sum + val, 0);
      return { ...art, total: Number(total.toFixed(2)) };
    }).sort((a, b) => b.total - a.total);

    return (
      <div className="space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="space-y-4">
              <h3 className="text-xs font-bold text-app-text-muted uppercase tracking-widest flex items-center gap-2 print:text-black">
                <span className="p-1 bg-app-surface border border-app-border rounded print:hidden"><Award className="w-3.5 h-3.5" /></span> Best in Division
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {DIVISIONS.map(div => {
                  const win = divisionWinners[div.id];
                  return (
                    <div key={div.id} className="flex items-center justify-between p-3 bg-app-surface-muted border border-app-border rounded-xl print:border-black transition-colors">
                      <div className="flex items-center gap-3">
                         <div className={`p-2 rounded-lg ${div.color} bg-app-surface border border-app-border print:border-black print:bg-transparent print:text-black transition-colors`}>
                           <div.icon className="w-4 h-4" />
                         </div>
                         <div>
                            <p className="text-[7px] font-black text-app-text-muted uppercase tracking-widest leading-none mb-1 print:text-black">Division: {div.label}</p>
                            <p className="text-sm font-bold text-app-text truncate max-w-[150px] print:text-black">
                              {win ? (isAnon ? `Artisan #${win.artisan?.id}` : win.artisan?.name) : 'No entries'}
                            </p>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-lg font-medieval text-app-text print:text-black leading-none">{win ? win.entry.mean : '0.0'}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
           </div>

           <div className="space-y-4">
              <h3 className="text-xs font-bold text-app-text-muted uppercase tracking-widest flex items-center gap-2 print:text-black">
                <span className="p-1 bg-app-surface border border-app-border rounded print:hidden"><Trophy className="w-3.5 h-3.5 text-app-accent" /></span> Grand Championship
              </h3>
              <div className="overflow-x-auto rounded-2xl border border-app-border print:border-black transition-colors">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-app-surface print:bg-transparent transition-colors">
                    <tr>
                      <th className="px-4 py-3 text-[8px] font-black text-app-text-muted uppercase tracking-[0.2em] border-b border-app-border print:border-black print:text-black">Rank</th>
                      <th className="px-4 py-3 text-[8px] font-black text-app-text-muted uppercase tracking-[0.2em] border-b border-app-border print:border-black print:text-black">Artisan</th>
                      <th className="px-4 py-3 text-[8px] font-black text-app-accent uppercase tracking-[0.2em] border-b border-app-border print:border-black print:text-black text-right">Combined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-app-border print:divide-black transition-colors">
                    {combinedStandings.slice(0, 5).map((stand, idx) => (
                      <tr key={stand.participant.id} className="hover:bg-app-surface-muted transition-colors">
                        <td className="px-4 py-2 text-xs text-app-text-muted font-mono print:text-black">#{idx + 1}</td>
                        <td className="px-4 py-2 text-xs font-bold text-app-text print:text-black">
                          {isAnon ? `Artisan #${stand.participant.id}` : stand.participant.name}
                        </td>
                        <td className="px-4 py-2 text-right font-medieval text-sm text-app-accent print:text-black">{stand.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
           </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-bold text-app-text-muted uppercase tracking-widest flex items-center gap-2 print:text-black">
            <span className="p-1 bg-app-surface border border-app-border rounded print:hidden"><LayoutList className="w-3.5 h-3.5" /></span> Individual Entry Log
          </h3>
          <div className="overflow-x-auto rounded-2xl border border-app-border print:border-black transition-colors">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="bg-app-surface print:bg-transparent transition-colors">
                <tr>
                  <th className="px-4 py-3 text-[9px] font-black text-app-text-muted uppercase tracking-[0.2em] border-b border-app-border print:border-black print:text-black">Artisan</th>
                  <th className="px-4 py-3 text-[9px] font-black text-app-text-muted uppercase tracking-[0.2em] border-b border-app-border print:border-black print:text-black">Title</th>
                  {draftedJudges.map(j => (
                    <th key={j.id} className="px-4 py-3 text-[9px] font-black text-violet-400 uppercase tracking-[0.2em] border-b border-app-border print:border-black print:text-black text-center">{j.name}</th>
                  ))}
                  <th className="px-4 py-3 text-[9px] font-black text-app-text uppercase tracking-[0.2em] border-b border-app-border print:border-black print:text-black text-right">Mean</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app-border print:divide-black transition-colors">
                {entries.sort((a, b) => b.mean - a.mean).map((e) => {
                  const p = data.participants.find(part => part.id === e.participant1Id);
                  const entryNotes = draftedJudges.map(j => ({ judge: j, note: e.judgeNotes?.[j.id] })).filter(n => n.note && (n.note as string).trim());
                  
                  return (
                    <React.Fragment key={e.id}>
                      <tr className="hover:bg-app-surface-muted transition-colors">
                        <td className="px-4 py-3 text-sm font-bold text-app-text print:text-black">
                          {isAnon ? `Artisan #${p?.id}` : (p?.name || 'Unassigned')}
                        </td>
                        <td className="px-4 py-3 text-sm text-app-text print:text-black">{e.title || 'Untitled'}</td>
                        {draftedJudges.map(j => (
                          <td key={j.id} className="px-4 py-3 text-xs text-center text-app-text-muted print:text-black">
                            {e.judgePasses?.[j.id] ? <span className="opacity-40 italic">PASS</span> : (e.judgeScores?.[j.id] ?? '-')}
                          </td>
                        ))}
                        <td className="px-4 py-3 text-right font-medieval text-lg text-app-text print:text-black">{e.mean}</td>
                      </tr>
                      {entryNotes.length > 0 && (
                        <tr className="bg-app-surface/30">
                          <td colSpan={3 + draftedJudges.length} className="px-8 py-2 border-b border-app-border print:border-black">
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                {entryNotes.map((n, nIdx) => (
                                  <div key={nIdx} className="text-[10px] text-app-text-muted print:text-black italic">
                                    <strong className="text-app-text-muted">[{n.judge.name}]:</strong> {n.note as string}
                                  </div>
                                ))}
                             </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-8 overflow-hidden print:p-0 print:block print:bg-white transition-all">
      <div className="absolute inset-0 bg-app-bg/95 backdrop-blur-xl print:hidden" onClick={onClose} />
      
      <style>{`
        @media print {
          body { background: white !important; color: black !important; }
          .print-hidden, button, .modal-overlay { display: none !important; }
          #root { background: white !important; }
          .fixed { position: static !important; }
          .overflow-hidden { overflow: visible !important; }
          .overflow-y-auto { overflow: visible !important; }
          .rounded-[2rem] { border-radius: 0 !important; }
          .bg-app-bg, .bg-app-surface, .bg-app-surface-muted { background: white !important; }
          .border-app-border { border-color: #ddd !important; }
          .text-app-text, .text-app-text-muted { color: #222 !important; }
          .text-app-primary, .text-app-accent { color: black !important; font-weight: bold !important; }
        }
      `}</style>

      <div className="relative w-full max-w-6xl h-full bg-app-surface border border-app-border rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300 print:shadow-none print:border-none print:bg-white print:text-black print:h-auto print:static print:rounded-none transition-colors">
        
        <div className="px-8 py-6 bg-app-surface-muted border-b border-app-border flex items-center justify-between print:bg-transparent print:border-black transition-colors">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-app-primary rounded-xl print:hidden shadow-lg">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-medieval text-app-text print:text-black uppercase tracking-widest">{data.eventName}</h1>
              <div className="flex flex-col gap-1 mt-1">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-app-text-muted uppercase tracking-widest print:text-black">
                    <Calendar className="w-3.5 h-3.5" /> {data.eventDate}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-bold text-app-text-muted uppercase tracking-widest print:text-black">
                    <Users className="w-3.5 h-3.5" /> {data.participants.length} Registrants
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-1">
                   <span className="flex items-center gap-1.5 text-[10px] font-black text-app-primary uppercase tracking-widest print:text-black">
                    <Mountain className="w-3 h-3" /> {data.kingdom}
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] font-black text-app-primary uppercase tracking-widest print:text-black">
                    <MapPin className="w-3 h-3" /> {data.parkTitle} {data.parkName || '[Unnamed Park]'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 print:hidden">
            <button onClick={handleEmail} className="p-3 bg-app-surface hover:bg-app-surface-muted text-app-text-muted border border-app-border rounded-xl transition-all shadow-sm" title="Email Report"><Mail className="w-5 h-5" /></button>
            <button onClick={handlePrint} className="p-3 bg-app-surface hover:bg-app-surface-muted text-app-text-muted border border-app-border rounded-xl transition-all shadow-sm" title="Print Report"><Printer className="w-5 h-5" /></button>
            <button onClick={onClose} className="p-3 bg-app-surface hover:bg-app-surface-muted text-app-text-muted border border-app-border rounded-xl transition-all shadow-sm"><X className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-16 custom-scrollbar print:overflow-visible bg-app-bg transition-colors">
          {data.tournaments.length === 0 ? (
            <div className="text-center py-20 text-app-text-muted italic">No events recorded.</div>
          ) : (
            data.tournaments.map((t, idx) => {
              const isArts = t.config.eventType === 'arts';
              const isIronman = t.config.type === 'ironman';
              const participantsInTourney = isArts 
                ? (t.rounds[0] || []).map(e => data.participants.find(p => p.id === e.participant1Id)).filter(Boolean) as Participant[]
                : t.participants;

              return (
                <section key={t.id} className="space-y-8 break-inside-avoid pt-4 first:pt-0">
                  <div className="flex flex-col gap-4 border-b border-app-border pb-4 print:border-black transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-app-surface border border-app-border rounded-lg print:border print:border-black print:bg-transparent transition-colors">
                        {isArts ? <Palette className="w-5 h-5 text-violet-400 print:text-black" /> : <Shield className="w-5 h-5 text-app-primary print:text-black" />}
                      </div>
                      <div>
                        <h2 className="text-xl font-medieval text-app-text print:text-black uppercase tracking-widest">{idx + 1}. {t.name}</h2>
                        <p className="text-[10px] font-black text-app-text-muted uppercase tracking-[0.2em] print:text-black">
                          {isArts ? 'Arts & Sciences' : `${t.config.type.replace('-', ' ')} • ${getWeaponLabel(t.config.weaponClass)}`}
                          {t.config.isTeams && ' • SQUAD COMBAT'}
                        </p>
                      </div>
                    </div>
                    
                    {t.config.isTeams && t.config.teams && (
                      <div className="bg-app-surface-muted p-4 rounded-xl border border-app-border print:border-black print:bg-transparent transition-colors">
                        <div className="flex items-center gap-2 text-[9px] font-black text-app-text-muted uppercase tracking-widest mb-3 print:text-black">
                          <Users className="w-3 h-3" /> Deployment Manifests
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {t.config.teams.map(team => {
                            const fighters = team.fighterIds.map(fid => data.participants.find(p => p.id === fid));
                            const teamStrength = fighters.reduce((sum, p) => sum + (p?.warriorRank || 0), 0);
                            return (
                              <div key={team.id} className="text-[10px] text-app-text-muted print:text-black leading-relaxed">
                                <span className="font-bold text-app-primary print:text-black">Team {team.id} ({team.name}) [Str: {teamStrength}]:</span> {fighters.map(p => p?.name).join(', ')}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {t.notes && (
                      <div className="bg-app-surface-muted p-4 rounded-xl border border-app-border print:bg-transparent print:border-black transition-colors">
                        <div className="flex items-center gap-2 text-[9px] font-black text-app-text-muted uppercase tracking-widest mb-1 print:text-black">
                          <StickyNote className="w-3 h-3" /> Field Marshal's Log
                        </div>
                        <p className="text-xs text-app-text-muted print:text-black leading-relaxed italic">"{t.notes}"</p>
                      </div>
                    )}
                  </div>

                  {isArts ? renderArtsTables(t) : (
                    isIronman ? renderIronmanTable(t) : renderCombatStandings(t)
                  )}

                  {renderParticipantLogs(participantsInTourney, isArts)}
                </section>
              );
            })
          )}
        </div>

        <div className="px-8 py-4 bg-app-surface-muted border-t border-app-border text-[10px] font-mono text-app-text-muted uppercase tracking-[0.4em] text-center print:text-black print:border-black print:bg-transparent transition-colors">
          Record Sealed :: BattleOS V{APP_VERSION} :: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default TournamentReport;