
import React, { useState, useMemo, useEffect } from 'react';
import { Participant, Judge, Reeve, LocalTournamentConfig, Tournament, Team, Player } from '../types';
import ParticipantRoster from './ParticipantRoster';
import ArtsRoster from './ArtsRoster';
import ArtsSetupCard from './ArtsSetupCard';
import JudgesRoster from './JudgesRoster';
import ReevesRoster from './ReevesRoster';
import { 
  Sword, Swords, Shield, Target, 
  ChevronDown, ChevronUp, Layers, Package,
  ScrollText, Calendar, PenTool, CheckCircle2, Circle, Trash2, RefreshCw,
  Brush, Palette, Trophy, Activity, Clock, Edit2, X,
  ListOrdered, Medal, PlusCircle, UserPlus, UserMinus, Play, MapPin, Mountain,
  LayoutList, Users, BookOpen, Utensils, Music, Scissors, Shirt, Wrench, Gavel, Sparkles,
  ArrowUpRight, Box, Zap, Timer, GitMerge, Hash, Scale
} from 'lucide-react';

export const DIVISIONS = [
  { 
    id: 'owl', label: 'Owl', icon: BookOpen, color: 'text-sky-600', desc: 'Construction & Crafting',
    subcategories: [
      { id: 'weapon', label: 'Weapon Construction', icon: Sword },
      { id: 'shield', label: 'Shield Construction', icon: Shield },
      { id: 'armor', label: 'Armor Smithing', icon: Shirt },
      { id: 'other-eq', label: 'Other Equipment', icon: Wrench },
    ]
  },
  { 
    id: 'garber', label: 'Garber', icon: Scissors, color: 'text-emerald-600', desc: 'Sewing & Fabric Arts',
    subcategories: [
      { id: 'costume', label: 'Costuming', icon: Shirt },
      { id: 'needlework', label: 'Needlework', icon: Scissors },
      { id: 'heraldry', label: 'Heraldic Display', icon: Shield },
    ]
  },
  { 
    id: 'dragon', label: 'Dragon', icon: Brush, color: 'text-orange-600', desc: 'Visual & Creative Arts',
    subcategories: [
      { id: 'finearts', label: 'Fine Arts', icon: Palette },
      { id: 'writing', label: 'Writing', icon: PenTool },
      { id: 'brewing', label: 'Brewing', icon: Utensils },
      { id: 'cooking', label: 'Cooking', icon: Utensils },
      { id: 'performance', label: 'Performance', icon: Music },
    ]
  },
  { 
    id: 'smith', label: 'Smith', icon: Gavel, color: 'text-zinc-500', desc: 'Game Design & Education',
    subcategories: [
      { id: 'battlegame', label: 'Battlegame Design', icon: Swords },
      { id: 'quest', label: 'Quest Writing', icon: ScrollText },
      { id: 'class', label: 'Instructional', icon: BookOpen },
    ]
  },
];

const COLOR_PALETTE = [
  { bg: '#e11d48', text: '#ffffff' }, { bg: '#2563eb', text: '#ffffff' },
  { bg: '#16a34a', text: '#ffffff' }, { bg: '#facc15', text: '#000000' },
  { bg: '#ea580c', text: '#ffffff' }, { bg: '#9333ea', text: '#ffffff' },
  { bg: '#0d9488', text: '#ffffff' }, { bg: '#4f46e5', text: '#ffffff' },
  { bg: '#db2777', text: '#ffffff' }, { bg: '#0891b2', text: '#ffffff' },
  { bg: '#84cc16', text: '#000000' }, { bg: '#d97706', text: '#ffffff' },
  { bg: '#7c3aed', text: '#ffffff' }, { bg: '#059669', text: '#ffffff' },
  { bg: '#475569', text: '#ffffff' }, { bg: '#92400e', text: '#ffffff' },
];

const AMTGARD_KINGDOMS = [
  "13 Roads", "Blackspire", "Burning Lands", "Celestial Kingdom", "Crystal Groves",
  "Desert Winds", "Dragonspine", "Emerald Hills", "Freeholds", "Golden Plains", "Goldenvale",
  "Iron Mountains", "Neverwinter", "Nine Blades", "Northern Lights", "Northreach",
  "Polaris", "Rising Winds", "Rivermoor", "Tal Dagore", "Viridian Outlands",
  "Westmarch", "Wetlands", "Winter's Edge", "Principality / Alliance", "Traveling / Other"
];

const PARK_TITLES = ["Freehold of", "Shire of", "Barony of", "Duchy of", "Grand Duchy of", "Principality of"];

interface TournamentSetupProps {
  masterParticipants: Participant[];
  judges: Judge[];
  reeves: Reeve[];
  masterPlayers: Player[];
  onImportPlayer: (player: Player, target: 'participant' | 'judge' | 'reeve') => void;
  onAddParticipant: (name: string) => void;
  onRemoveParticipant: (id: number | string) => void;
  onAddJudge: (name: string) => void;
  onRemoveJudge: (id: number) => void;
  onAddBulkJudges: (count: number) => void;
  onAddReeve: (name: string) => void;
  onRemoveReeve: (id: number) => void;
  onAddBulkReeves: (count: number) => void;
  onUpdateParticipantName?: (id: number | string, newName: string) => void;
  onUpdateWarriorRank?: (id: number | string, rank: number) => void;
  onOpenNotes?: (participant: Participant) => void;
  onReorderParticipants: (newOrder: Participant[]) => void;
  onAddBulk: (count: number) => void;
  onHighlight: (id: number | string | null) => void;
  rankings: Map<number | string, number>;
  onStart: (configs: any[]) => void;
  eventName: string;
  onEventNameChange: (val: string) => void;
  eventDate: string;
  onEventDateChange: (val: string) => void;
  kingdom: string;
  onKingdomChange: (val: string) => void;
  parkTitle: string;
  onParkTitleChange: (val: string) => void;
  parkName: string;
  onParkNameChange: (val: string) => void;
  pendingTournaments: LocalTournamentConfig[];
  onPendingTournamentsChange: (configs: LocalTournamentConfig[]) => void;
  activeTournaments?: Tournament[];
  onDeleteActiveTournament?: (id: string) => void;
  onReopenActiveTournament?: (id: string) => void;
  eventType: 'martial' | 'arts';
  onEventTypeChange: (type: 'martial' | 'arts') => void;
}

const WIN_CONDITIONS = [
  { label: 'Best 2 of 3', required: 2, winMode: 'rounds' as const },
  { label: 'Best 3 of 5', required: 3, winMode: 'rounds' as const },
  { label: 'Best 5 of 9', required: 5, winMode: 'rounds' as const },
  { label: 'Points Match', required: 0, winMode: 'points' as const },
];

const DURATIONS = [
  { label: '10 Minutes', value: 10 },
  { label: '15 Minutes', value: 15 },
  { label: '20 Minutes', value: 20 },
  { label: 'Custom', value: -1 },
];

export const WEAPON_CLASSES = [
  { id: 'single', label: 'Single Sword', icon: Sword },
  { id: 'florentine', label: 'Florentine', icon: Swords },
  { id: 'shield', label: 'Sword & Shield', icon: Shield },
  { id: 'reach', label: 'Great Weapons', icon: ArrowUpRight },
  { id: 'archery', label: 'Archery / Projectiles', icon: Target },
  { id: 'open', label: 'Open Class', icon: Package },
  { id: 'other', label: 'Other / Mixed', icon: Sparkles },
];

export const TOURNAMENT_FORMATS = [
  { id: 'open-format', label: 'Open Showcase', icon: Palette },
  { id: 'dragonmaster', label: 'Dragonmaster', icon: Trophy },
  { id: 'novice', label: 'Novice Art', icon: Brush },
];

const StatusBadge = ({ status }: { status: 'draft' | 'preparation' | 'active' | 'completed' }) => {
  const styles = {
    preparation: "bg-app-primary-muted border-app-primary/20 text-app-primary",
    active: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 animate-pulse",
    completed: "bg-app-accent/10 border-app-accent/20 text-app-accent",
    draft: "bg-app-surface-muted border-app-border text-app-text-muted"
  };
  const labels = { preparation: "NEW", active: "LIVE", completed: "DONE", draft: "DRAFT" };
  const icons = { preparation: Clock, active: Activity, completed: Trophy, draft: Edit2 };
  const Icon = icons[status];
  
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-0.5 border rounded-full ${styles[status]} transition-colors`}>
      <Icon className="w-2.5 h-2.5" />
      <span className="text-[8px] font-black uppercase tracking-widest">{labels[status]}</span>
    </div>
  );
};

const TournamentSetup: React.FC<TournamentSetupProps> = ({
  masterParticipants, judges, reeves, masterPlayers, onImportPlayer, onAddParticipant, onRemoveParticipant, onAddJudge, onRemoveJudge, onAddBulkJudges, onAddReeve, onRemoveReeve, onAddBulkReeves, onUpdateParticipantName, onUpdateWarriorRank, onOpenNotes, onReorderParticipants,
  onAddBulk, onHighlight, rankings, onStart, eventName, onEventNameChange, eventDate, onEventDateChange, kingdom, onKingdomChange, parkTitle, onParkTitleChange, parkName, onParkNameChange,
  pendingTournaments, onPendingTournamentsChange, activeTournaments = [],
  onDeleteActiveTournament, onReopenActiveTournament,
  eventType, onEventTypeChange
}) => {
  const [detailsExpanded, setDetailsExpanded] = useState(true);
  const [rosterExpanded, setRosterExpanded] = useState(true);

  const calculateSwissRounds = (count: number) => {
    return count > 0 ? Math.ceil(Math.log2(count)) : 0;
  };

  const generateDefaultConfig = (type: 'martial' | 'arts'): LocalTournamentConfig => {
    const swissRounds = calculateSwissRounds(masterParticipants.length);
    return {
      id: Math.random().toString(36).substr(2, 9),
      name: type === 'martial' ? 'Single Sword Tournament' : 'A&S Exhibition',
      eventType: type,
      type: type === 'martial' ? 'single-elimination' : 'listing',
      winConditionIdx: type === 'martial' ? 0 : 3,
      durationIdx: 1,
      customDuration: 20,
      weaponClass: type === 'martial' ? 'single' : 'open-format',
      winMode: type === 'martial' ? 'rounds' : 'points',
      requiredWins: type === 'martial' ? 2 : 0,
      swissRounds: swissRounds > 0 ? swissRounds : 3,
      swissTiebreak: 'round-points',
      includeThirdPlaceMatch: false,
      isSeeded: false,
      selectedFighterIds: masterParticipants.map(p => p.id as number),
      selectedJudgeIds: judges.map(j => j.id),
      selectedReeveIds: reeves.map(r => r.id),
      isExpanded: true,
      isPoolsToBracket: false,
      poolType: 'round-robin',
      autoProgressionWins: 5,
      autoProgressionStreak: 3,
      finalistCount: 8,
      scoringCondition: 'full',
      isAnonymous: false,
      isPartialRounds: false,
      maxRounds: 1,
      enabledSubcategories: [],
      isTeams: false,
      teams: []
    };
  };

  useEffect(() => {
    if (pendingTournaments.length === 0 && activeTournaments.length === 0) {
      onPendingTournamentsChange([generateDefaultConfig('martial')]);
    }
  }, [pendingTournaments.length, activeTournaments.length]);

  const visibleTournaments = useMemo(() => pendingTournaments.filter(t => t.eventType === eventType), [pendingTournaments, eventType]);

  const handleStartEvent = () => {
    const finalConfigs = visibleTournaments
      .filter(t => t.isTeams ? (t.teams?.length || 0) >= 1 : t.selectedFighterIds.length >= 1)
      .map(t => ({
        ...t,
        draftedFighters: masterParticipants.filter(p => t.selectedFighterIds.includes(p.id as number)),
        draftedJudges: judges.filter(j => t.selectedJudgeIds.includes(j.id)),
        draftedReeves: reeves.filter(r => t.selectedReeveIds.includes(r.id))
      }));
    onStart(finalConfigs);
  };

  const updateConfig = (id: string, updates: Partial<LocalTournamentConfig>) => {
    onPendingTournamentsChange(pendingTournaments.map(t => (t.id === id ? { ...t, ...updates } : t)));
  };

  const handleWeaponClassChange = (configId: string, wcId: string) => {
    const wc = WEAPON_CLASSES.find(w => w.id === wcId);
    if (!wc) return;
    updateConfig(configId, { 
      weaponClass: wcId,
      name: `${wc.label} Tournament`
    });
  };

  const addTeam = (configId: string) => {
    const config = pendingTournaments.find(c => c.id === configId);
    if (!config) return;
    const currentTeams = config.teams || [];
    const colorIdx = currentTeams.length % COLOR_PALETTE.length;
    const newTeam: Team = {
      id: String.fromCharCode(65 + currentTeams.length),
      name: `Team ${String.fromCharCode(65 + currentTeams.length)}`,
      fighterIds: [],
      color: COLOR_PALETTE[colorIdx].bg 
    };
    updateConfig(configId, { teams: [...currentTeams, newTeam] });
  };

  const getWeaponIcon = (id: string) => {
    return WEAPON_CLASSES.find(w => w.id === id)?.icon || Sword;
  };

  return (
    <div className="flex-1 w-full flex flex-col items-center bg-app-bg overflow-y-auto custom-scrollbar relative transition-colors">
      <div className="w-full max-w-7xl flex flex-col gap-6 sm:gap-8 p-4 sm:p-8 pb-40">
        
        {/* Proclamation / Global Details */}
        <div className="w-full">
          <div className="bg-app-surface rounded-[2rem] border border-app-border shadow-xl overflow-hidden transition-all duration-300">
            <div className="p-5 sm:p-7 flex items-center justify-between border-b border-app-border bg-app-surface transition-colors">
              <button onClick={() => setDetailsExpanded(!detailsExpanded)} className="flex items-center gap-4 hover:opacity-80 transition-opacity text-left">
                <div className="p-3 bg-app-accent/10 rounded-2xl">
                  {eventType === 'arts' ? <Palette className="w-6 h-6 text-app-accent" /> : <ScrollText className="w-6 h-6 text-app-accent" />}
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-medieval text-app-text uppercase tracking-wider">Proclamation</h2>
                  <p className="text-[10px] text-app-text-muted font-black uppercase tracking-widest">Event Registry</p>
                </div>
              </button>
              <div className="flex items-center gap-1.5 bg-app-surface-muted p-1.5 rounded-2xl border border-app-border shadow-inner transition-colors">
                <button onClick={() => onEventTypeChange('martial')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${eventType === 'martial' ? 'bg-app-primary text-white shadow-lg' : 'text-app-text-muted hover:text-app-text'}`}>
                  <Swords className="w-3.5 h-3.5" /> 
                  <span className="hidden sm:inline">Martial</span>
                </button>
                <button onClick={() => onEventTypeChange('arts')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${eventType === 'arts' ? 'bg-violet-600 text-white shadow-lg' : 'text-app-text-muted hover:text-app-text'}`}>
                  <Brush className="w-3.5 h-3.5" /> 
                  <span className="hidden sm:inline">A&S</span>
                </button>
              </div>
            </div>
            {detailsExpanded && (
              <div className="p-6 sm:p-10 grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="space-y-2.5">
                  <label className="text-[10px] uppercase tracking-widest text-app-text-muted font-black ml-1 flex items-center gap-2"><PenTool className="w-3 h-3" /> Event Label</label>
                  <input type="text" value={eventName} onChange={(e) => onEventNameChange(e.target.value)} className="w-full bg-app-surface-muted border border-app-border rounded-2xl px-5 py-4 text-app-text focus:outline-none focus:ring-2 focus:ring-app-primary/20 transition-all font-medieval tracking-wider shadow-inner" />
                </div>
                <div className="space-y-2.5">
                  <label className="text-[10px] uppercase tracking-widest text-app-text-muted font-black ml-1 flex items-center gap-2"><Calendar className="w-3 h-3" /> Date Of Record</label>
                  <input type="date" value={eventDate} onChange={(e) => onEventDateChange(e.target.value)} className="w-full bg-app-surface-muted border border-app-border rounded-2xl px-5 py-4 text-app-text focus:outline-none focus:ring-2 focus:ring-app-primary/20 transition-all font-mono shadow-inner" />
                </div>
                <div className="space-y-2.5">
                  <label className="text-[10px] uppercase tracking-widest text-app-text-muted font-black ml-1 flex items-center gap-2"><Mountain className="w-3 h-3" /> Kingdom</label>
                  <select value={kingdom} onChange={(e) => onKingdomChange(e.target.value)} className="w-full bg-app-surface-muted border border-app-border rounded-2xl px-5 py-4 text-app-text focus:outline-none shadow-inner font-medieval tracking-wide">
                    {AMTGARD_KINGDOMS.map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>
                <div className="space-y-2.5">
                  <label className="text-[10px] uppercase tracking-widest text-app-text-muted font-black ml-1 flex items-center gap-2"><MapPin className="w-3 h-3" /> Province Designation</label>
                  <div className="flex gap-2">
                    <select value={parkTitle} onChange={(e) => onParkTitleChange(e.target.value)} className="w-1/3 bg-app-surface-muted border border-app-border rounded-2xl px-3 py-4 text-app-text focus:outline-none text-[10px] font-black uppercase shadow-inner">
                      {PARK_TITLES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <input type="text" value={parkName} onChange={(e) => onParkNameChange(e.target.value)} placeholder="Park name..." className="flex-1 bg-app-surface-muted border border-app-border rounded-2xl px-5 py-4 text-app-text focus:outline-none shadow-inner font-medieval tracking-wider" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Global Hub */}
        <div className="w-full">
          <div className="bg-app-surface rounded-[2rem] border border-app-border shadow-xl overflow-hidden flex flex-col transition-all duration-300">
            <button onClick={() => setRosterExpanded(!rosterExpanded)} className="w-full p-5 sm:p-7 flex items-center justify-between hover:bg-app-surface-muted transition-colors text-left">
              <div className="flex items-center gap-4">
                <div className={`p-3 ${eventType === 'arts' ? 'bg-violet-100' : 'bg-emerald-100'} rounded-2xl`}>
                  {eventType === 'arts' ? <Palette className="w-6 h-6 text-violet-600" /> : <Users className="w-6 h-6 text-emerald-600" />}
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-medieval text-app-text uppercase tracking-wider">{eventType === 'arts' ? 'Arts Enrollment' : 'Combatant Pool'}</h2>
                  <p className="text-[10px] text-app-text-muted font-black uppercase tracking-widest">Unified Registry</p>
                </div>
              </div>
              <div className="text-app-text-muted">{rosterExpanded ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}</div>
            </button>
            {rosterExpanded && (
              <div className="p-6 sm:p-10 pt-0 grid grid-cols-1 lg:grid-cols-4 gap-8 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="lg:col-span-3 space-y-6">
                  {eventType === 'arts' ? (
                    <ArtsRoster participants={masterParticipants} masterPlayers={masterPlayers} onImportPlayer={(p) => onImportPlayer(p, 'participant')} onAdd={onAddParticipant} onRemove={onRemoveParticipant} onUpdateName={onUpdateParticipantName} onOpenNotes={onOpenNotes} onReorder={onReorderParticipants} onAddBulk={onAddBulk} onHighlight={onHighlight} disabled={false} isOpen={true} onToggle={null} layout="grid" />
                  ) : (
                    <ParticipantRoster participants={masterParticipants} masterPlayers={masterPlayers} onImportPlayer={(p) => onImportPlayer(p, 'participant')} onAdd={onAddParticipant} onRemove={onRemoveParticipant} onUpdateName={onUpdateParticipantName} onUpdateWarriorRank={onUpdateWarriorRank} onOpenNotes={onOpenNotes} onReorder={onReorderParticipants} onAddBulk={onAddBulk} onHighlight={onHighlight} rankings={new Map()} disabled={false} isOpen={true} onToggle={null} layout="grid" showWarriorRank={true} />
                  )}
                </div>
                <div className="lg:col-span-1 bg-app-surface-muted p-6 rounded-3xl border border-app-border h-full shadow-inner transition-colors">
                  {eventType === 'arts' ? (
                    <JudgesRoster judges={judges} masterPlayers={masterPlayers} onImportPlayer={(p) => onImportPlayer(p, 'judge')} onAdd={onAddJudge} onRemove={onRemoveJudge} onAddBulk={onAddBulkJudges} disabled={false} />
                  ) : (
                    <ReevesRoster reeves={reeves} masterPlayers={masterPlayers} onImportPlayer={(p) => onImportPlayer(p, 'reeve')} onAdd={onAddReeve} onRemove={onRemoveReeve} onAddBulk={onAddBulkReeves} disabled={false} />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tournament Manifest */}
        <div className="w-full space-y-8">
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-app-primary-muted rounded-lg border border-app-primary/10">
                <GitMerge className="w-5 h-5 text-app-primary" />
              </div>
              <div>
                <h2 className="text-xl font-medieval text-app-text uppercase tracking-wider">Event List</h2>
                <p className="text-[9px] font-black text-app-text-muted uppercase tracking-widest">Active Brackets & Competitions</p>
              </div>
            </div>
            <button 
              onClick={() => onPendingTournamentsChange([...pendingTournaments, generateDefaultConfig(eventType)])} 
              className="flex items-center gap-2 px-6 py-3 bg-app-primary hover:bg-sky-500 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] shadow-lg transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" /> Add Tournament
            </button>
          </div>

          <div className="space-y-8">
            {visibleTournaments.map((config, idx) => {
              const isIronmanSetup = config.type === 'ironman' || (config.isPoolsToBracket && config.poolType === 'ironman');
              const projectedSwissRounds = calculateSwissRounds(config.selectedFighterIds.length);

              if (eventType === 'arts') {
                return (
                  <ArtsSetupCard 
                    key={config.id} 
                    config={config} 
                    onUpdate={(updates) => updateConfig(config.id, updates)} 
                    onRemove={() => onPendingTournamentsChange(pendingTournaments.filter(t => t.id !== config.id))} 
                    masterParticipants={masterParticipants} 
                    judges={judges} 
                    index={idx} 
                  />
                );
              }

              return (
                <div key={config.id} className="bg-app-surface rounded-[2.5rem] border border-app-border shadow-2xl overflow-hidden transition-all duration-500">
                  <div className="p-6 sm:p-8 flex items-center justify-between border-b border-app-border transition-colors bg-app-surface">
                    <div className="flex items-center gap-5">
                      <div className="p-3 bg-app-surface-muted rounded-2xl border border-app-border shadow-inner transition-colors">
                        {React.createElement(getWeaponIcon(config.weaponClass), { className: "w-6 h-6 text-app-primary" })}
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-medieval text-app-text uppercase tracking-wider">{config.name}</h2>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-black text-app-primary uppercase tracking-widest">Tournament {idx + 1}</span>
                          <span className="text-[10px] font-black text-app-text-muted uppercase tracking-widest">{config.selectedFighterIds.length} Drafted Competitors</span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => onPendingTournamentsChange(pendingTournaments.filter(p => p.id !== config.id))} className="p-3 text-app-text-muted hover:text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="p-8 sm:p-12 space-y-10 animate-in fade-in duration-700 bg-app-surface">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                      <div className="space-y-4">
                        <label className="text-[11px] font-black text-app-text-muted uppercase tracking-widest flex items-center gap-2 px-1"><Edit2 className="w-3.5 h-3.5" /> Tournament Title</label>
                        <input 
                          type="text" 
                          value={config.name} 
                          onChange={(e) => updateConfig(config.id, { name: e.target.value })} 
                          className="w-full bg-app-surface-muted border-2 border-app-border rounded-2xl px-5 py-4 text-sm text-app-text focus:outline-none focus:border-app-primary/50 shadow-inner font-bold uppercase tracking-widest transition-colors"
                          placeholder="e.g. Single Sword Open"
                        />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[11px] font-black text-app-text-muted uppercase tracking-widest flex items-center gap-2 px-1"><Sword className="w-3.5 h-3.5" /> Combat Class</label>
                        <div className="grid grid-cols-7 gap-2">
                          {WEAPON_CLASSES.map(wc => (
                            <div key={wc.id} className="relative group">
                              <button 
                                onClick={() => handleWeaponClassChange(config.id, wc.id)}
                                className={`w-full p-4 rounded-2xl border-2 flex items-center justify-center transition-all ${config.weaponClass === wc.id ? 'bg-app-primary border-app-primary text-white shadow-lg' : 'bg-app-surface-muted border-app-border text-app-text-muted hover:border-app-text-muted'}`}
                              >
                                <wc.icon className="w-6 h-6" />
                              </button>
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-2 bg-app-surface border border-app-border rounded-xl text-[9px] font-black uppercase tracking-widest text-app-text whitespace-nowrap shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-75 z-50">
                                {wc.label}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-app-border" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                      <div className="space-y-4">
                        <label className="text-[11px] font-black text-app-text-muted uppercase tracking-widest flex items-center gap-2 px-1"><LayoutList className="w-3.5 h-3.5" /> Tournament Format</label>
                        <div className="grid grid-cols-2 gap-2.5">
                          {['single-elimination', 'double-elimination', 'swiss', 'ironman', 'round-robin'].map(type => (
                            <button key={type} onClick={() => updateConfig(config.id, { type: type as any })} className={`px-4 py-3 rounded-2xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${config.type === type ? 'bg-app-primary border-app-primary text-white shadow-lg' : 'bg-app-surface-muted border-app-border text-app-text-muted hover:border-app-text-muted'}`}>{type.replace('-elimination', '')}</button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        {config.type === 'swiss' ? (
                          <div className="animate-in slide-in-from-right-4 duration-500 bg-app-primary-muted/10 p-6 rounded-[2rem] border-2 border-app-primary/10">
                            <label className="text-[11px] font-black text-app-primary uppercase tracking-widest flex items-center gap-2 px-1 mb-4"><Hash className="w-3.5 h-3.5" /> Swiss Configuration</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-3">
                                <div className="flex items-center justify-between px-1">
                                  <span className="text-[8px] font-black text-app-text-muted uppercase tracking-widest">Phases</span>
                                  <button onClick={() => updateConfig(config.id, { swissRounds: projectedSwissRounds })} className="p-1 hover:bg-app-surface-muted text-app-primary rounded transition-all" title="Reset to Log2"><RefreshCw className="w-2.5 h-2.5" /></button>
                                </div>
                                <input type="number" value={config.swissRounds} min={1} onChange={(e) => updateConfig(config.id, { swissRounds: parseInt(e.target.value) || 1 })} className="w-full bg-app-surface border-2 border-app-border rounded-xl px-4 py-2 text-sm font-medieval text-app-text focus:outline-none focus:border-app-primary/50 transition-colors" />
                              </div>
                              <div className="space-y-3">
                                <span className="text-[8px] font-black text-app-text-muted uppercase tracking-widest px-1">Tiebreak Rule</span>
                                <div className="flex gap-1 p-1 bg-app-surface border-2 border-app-border rounded-xl transition-colors">
                                  <button onClick={() => updateConfig(config.id, { swissTiebreak: 'round-points' })} className={`flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all ${config.swissTiebreak === 'round-points' ? 'bg-app-primary text-white shadow-sm' : 'text-app-text-muted hover:text-app-text'}`}>Round Pts</button>
                                  <button onClick={() => updateConfig(config.id, { swissTiebreak: 'buchholz' })} className={`flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all ${config.swissTiebreak === 'buchholz' ? 'bg-app-primary text-white shadow-sm' : 'text-app-text-muted hover:text-app-text'}`}>Buchholz</button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : isIronmanSetup ? (
                          <div className="animate-in slide-in-from-right-4 duration-500">
                            <label className="text-[11px] font-black text-app-text-muted uppercase tracking-widest flex items-center gap-2 px-1"><Timer className="w-3.5 h-3.5" /> Match Duration</label>
                            <div className="grid grid-cols-2 gap-2.5">
                              {DURATIONS.map((dur, i) => (
                                <button key={i} onClick={() => updateConfig(config.id, { durationIdx: i, duration: dur.value })} className={`px-4 py-3 rounded-2xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${config.durationIdx === i ? 'bg-app-accent border-app-accent text-white shadow-lg' : 'bg-app-surface-muted border-app-border text-app-text-muted hover:border-app-text-muted'}`}>{dur.label}</button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="animate-in slide-in-from-left-4 duration-500">
                            <label className="text-[11px] font-black text-app-text-muted uppercase tracking-widest flex items-center gap-2 px-1"><Trophy className="w-3.5 h-3.5" /> Victory Protocols</label>
                            <div className="grid grid-cols-2 gap-2.5">
                              {WIN_CONDITIONS.map((cond, i) => (
                                <button key={i} onClick={() => updateConfig(config.id, { winConditionIdx: i, requiredWins: cond.required, winMode: cond.winMode })} className={`px-4 py-3 rounded-2xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${config.winConditionIdx === i ? 'bg-app-accent border-app-accent text-white shadow-lg' : 'bg-app-surface-muted border-app-border text-app-text-muted hover:border-app-text-muted'}`}>{cond.label}</button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Conditional Ironman Progression Row */}
                    {config.isPoolsToBracket && config.poolType === 'ironman' && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-app-border animate-in slide-in-from-top-2 duration-300">
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-app-text-muted uppercase tracking-widest flex items-center gap-2 px-1"><Trophy className="w-3 h-3 text-app-accent" /> Victories to Advance</label>
                          <input type="number" value={config.autoProgressionWins} onChange={(e) => updateConfig(config.id, { autoProgressionWins: parseInt(e.target.value) || 0 })} className="w-full bg-app-surface-muted border border-app-border rounded-xl px-4 py-3 text-xs text-app-text focus:outline-none focus:border-app-primary/50 shadow-inner font-bold transition-colors" />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-app-text-muted uppercase tracking-widest flex items-center gap-2 px-1"><Zap className="w-3 h-3 text-amber-500" /> Streak to Advance</label>
                          <input type="number" value={config.autoProgressionStreak} onChange={(e) => updateConfig(config.id, { autoProgressionStreak: parseInt(e.target.value) || 0 })} className="w-full bg-app-surface-muted border border-app-border rounded-xl px-4 py-3 text-xs text-app-text focus:outline-none focus:border-app-primary/50 shadow-inner font-bold transition-colors" />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-app-text-muted uppercase tracking-widest flex items-center gap-2 px-1"><Users className="w-3 h-3 text-sky-500" /> Finalist Slots</label>
                          <input type="number" value={config.finalistCount} onChange={(e) => updateConfig(config.id, { finalistCount: parseInt(e.target.value) || 0 })} className="w-full bg-app-surface-muted border border-app-border rounded-xl px-4 py-3 text-xs text-app-text focus:outline-none focus:border-app-primary/50 shadow-inner font-bold transition-colors" />
                        </div>
                      </div>
                    )}

                    {/* Advanced Toggles */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <button onClick={() => updateConfig(config.id, { isTeams: !config.isTeams })} className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${config.isTeams ? 'bg-app-primary-muted border-app-primary text-app-primary' : 'bg-app-surface border-app-border text-app-text-muted opacity-60'}`}>
                        <div className="flex items-center gap-3">
                          <Users className="w-5 h-5" />
                          <span className="text-[11px] font-black uppercase tracking-widest">Squads</span>
                        </div>
                        {config.isTeams && <CheckCircle2 className="w-5 h-5" />}
                      </button>
                      <button onClick={() => updateConfig(config.id, { isSeeded: !config.isSeeded })} className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${config.isSeeded ? 'bg-app-primary-muted border-app-primary text-app-primary' : 'bg-app-surface border-app-border text-app-text-muted opacity-60'}`}>
                        <div className="flex items-center gap-3">
                          <ListOrdered className="w-5 h-5" />
                          <span className="text-[11px] font-black uppercase tracking-widest">Seeded</span>
                        </div>
                        {config.isSeeded && <CheckCircle2 className="w-5 h-5" />}
                      </button>
                      <button onClick={() => updateConfig(config.id, { isPoolsToBracket: !config.isPoolsToBracket })} className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${config.isPoolsToBracket ? 'bg-app-primary-muted border-app-primary text-app-primary' : 'bg-app-surface border-app-border text-app-text-muted opacity-60'}`}>
                        <div className="flex items-center gap-3">
                          <GitMerge className="w-5 h-5" />
                          <span className="text-[11px] font-black uppercase tracking-widest">Pools</span>
                        </div>
                        {config.isPoolsToBracket && <CheckCircle2 className="w-5 h-5" />}
                      </button>
                      {config.type === 'single-elimination' && (
                        <button onClick={() => updateConfig(config.id, { includeThirdPlaceMatch: !config.includeThirdPlaceMatch })} className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${config.includeThirdPlaceMatch ? 'bg-app-primary-muted border-app-primary text-app-primary' : 'bg-app-surface border-app-border text-app-text-muted opacity-60'}`}>
                          <div className="flex items-center gap-3">
                            <Medal className="w-5 h-5" />
                            <span className="text-[11px] font-black uppercase tracking-widest">Bronze</span>
                          </div>
                          {config.includeThirdPlaceMatch && <CheckCircle2 className="w-5 h-5" />}
                        </button>
                      )}
                    </div>

                    {config.isPoolsToBracket && (
                      <div className="p-6 bg-app-surface-muted border-2 border-app-border rounded-3xl animate-in slide-in-from-bottom-2 duration-300 transition-colors">
                        <label className="text-[10px] font-black text-app-text-muted uppercase tracking-widest block mb-4">Phase 1: Initial Pool Selection</label>
                        <div className="flex gap-4">
                          <button onClick={() => updateConfig(config.id, { poolType: 'round-robin' })} className={`flex-1 py-3 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${config.poolType === 'round-robin' ? 'bg-app-primary text-white border-app-primary shadow-lg' : 'bg-app-surface border-app-border text-app-text-muted'}`}>Round Robin Pool</button>
                          <button onClick={() => updateConfig(config.id, { poolType: 'ironman' })} className={`flex-1 py-3 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${config.poolType === 'ironman' ? 'bg-app-primary text-white border-app-primary shadow-lg' : 'bg-app-surface border-app-border text-app-text-muted'}`}>Ironman Pool</button>
                        </div>
                      </div>
                    )}

                    {config.isTeams && (
                      <div className="space-y-6 pt-6 border-t border-app-border animate-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-black text-app-text-muted uppercase tracking-widest flex items-center gap-2"><Sparkles className="w-4 h-4 text-app-primary" /> Squad Manifests</label>
                          <button onClick={() => addTeam(config.id)} className="flex items-center gap-2 px-4 py-2 bg-app-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"><PlusCircle className="w-4 h-4" /> Assemble Squad</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {(config.teams || []).map(team => (
                            <div key={team.id} className="p-5 bg-app-surface-muted border border-app-border rounded-3xl shadow-inner space-y-4 transition-colors">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white shadow-lg" style={{ backgroundColor: team.color }}>{team.id}</div>
                                  <span className="text-xs font-bold text-app-text uppercase">{team.name}</span>
                                </div>
                                <button onClick={() => { const next = config.teams?.filter(t => t.id !== team.id); updateConfig(config.id, { teams: next }); }} className="text-app-text-muted hover:text-rose-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                              </div>
                              <div className="min-h-[60px] flex flex-wrap gap-2">
                                {team.fighterIds.length === 0 ? <p className="text-[10px] text-app-text-muted italic py-4 w-full text-center">Unpopulated</p> : team.fighterIds.map(fid => {
                                  const p = masterParticipants.find(x => x.id === fid);
                                  return <div key={fid} className="px-3 py-1.5 bg-app-surface border border-app-border rounded-xl text-[10px] font-bold text-app-text flex items-center gap-2 shadow-sm transition-colors">{p?.name}<button onClick={() => { const nextTeams = config.teams?.map(t => t.id === team.id ? { ...t, fighterIds: t.fighterIds.filter(id => id !== fid) } : t); updateConfig(config.id, { teams: nextTeams }); }} className="text-app-text-muted hover:text-rose-500 transition-colors"><X className="w-3.5 h-3.5" /></button></div>
                                })}
                              </div>
                              <div className="flex flex-col gap-2">
                                <select 
                                  onChange={(e) => { const fid = parseInt(e.target.value); if (isNaN(fid)) return; const nextTeams = config.teams?.map(t => t.id === team.id ? { ...t, fighterIds: [...t.fighterIds, fid] } : t); updateConfig(config.id, { teams: nextTeams }); }}
                                  className="w-full bg-app-surface border border-app-border rounded-xl px-3 py-2 text-[10px] font-bold text-app-text-muted focus:outline-none transition-colors"
                                  value=""
                                >
                                  <option value="" disabled>Recruit to Squad...</option>
                                  {masterParticipants.filter(p => !(config.teams || []).some(t => t.fighterIds.includes(p.id as number))).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-8 border-t border-app-border">
                      <div className="flex items-center justify-between mb-6 px-1">
                        <label className="text-[11px] font-black text-app-text-muted uppercase tracking-widest flex items-center gap-2"><Users className="w-4 h-4" /> Draft Selection ({config.selectedFighterIds.length})</label>
                        <button onClick={() => updateConfig(config.id, { selectedFighterIds: masterParticipants.map(p => p.id as number) })} className="text-[10px] font-black text-app-primary uppercase tracking-widest hover:underline">Select All</button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-60 overflow-y-auto pr-3 custom-scrollbar p-1.5 bg-app-surface-muted border border-app-border rounded-[2rem] shadow-inner transition-colors">
                        {masterParticipants.map(p => {
                          const isSelected = config.selectedFighterIds.includes(p.id as number);
                          return (
                            <button key={p.id} onClick={() => { const next = isSelected ? config.selectedFighterIds.filter(id => id !== p.id) : [...config.selectedFighterIds, p.id as number]; updateConfig(config.id, { selectedFighterIds: next }); }} className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all text-left shadow-sm ${isSelected ? 'bg-app-surface border-app-primary text-app-text' : 'bg-app-surface border-transparent text-app-text-muted opacity-60 hover:opacity-100 hover:border-app-border'}`}>
                              <CheckCircle2 className={`w-4 h-4 shrink-0 ${isSelected ? 'text-app-primary' : 'text-app-border'}`} />
                              <span className="text-[11px] font-bold truncate uppercase">{p.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Global Tournament Footer */}
        <div className="mt-12 flex justify-center pb-24">
          <button 
            onClick={handleStartEvent}
            className="group relative flex items-center gap-6 px-16 py-8 bg-emerald-600 hover:bg-emerald-500 text-white rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-sm shadow-2xl shadow-emerald-900/30 transition-all active:scale-95 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <Play className="w-8 h-8 fill-current" />
            <span>Commence Tournament</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default TournamentSetup;
