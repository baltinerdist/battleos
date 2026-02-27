import React, { useState } from 'react';
import { 
  X, Book, Sword, Shield, Users, Trophy, Zap, 
  RefreshCw, Layers, Clock, HelpCircle, ChevronRight, 
  Info, Award, Swords, PanelLeftOpen, Share2, 
  Target, Hash, ListOrdered, Printer, Save, 
  RotateCcw, MousePointer2, Smartphone,
  GripVertical, ScrollText, Crown, Plus,
  Lock, Palette, Gavel, UserCheck, EyeOff, Timer,
  ShieldCheck, ShieldAlert, FileText, Mail, 
  History, Archive, LayoutGrid, List,
  PlusCircle, Maximize2, ExternalLink,
  LayoutList, CheckCircle2, Settings, UserPlus, Sparkles,
  Heart, MessageSquare, ArrowUpRight
} from 'lucide-react';
import { APP_VERSION } from '../types';

interface TabConfig {
  id: string;
  label: string;
  icon: React.ElementType;
}

const TABS: TabConfig[] = [
  { id: 'roster', label: 'Roster', icon: Users },
  { id: 'martial', label: 'Combat', icon: Swords },
  { id: 'arts', label: 'Arts & Sci', icon: Palette },
  { id: 'controls', label: 'Overrides', icon: Settings },
  { id: 'data', label: 'Archiving', icon: Archive },
  { id: 'interface', label: 'Navigation', icon: LayoutGrid },
  { id: 'about', label: 'About', icon: Info },
];

const HelpSystem: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('roster');

  const renderContent = () => {
    switch (activeTab) {
      case 'roster':
        return (
          <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-lg font-medieval text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> Building Your Army
                </h3>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  The Master Roster is the backbone of BattleOS. It persists across all tournaments in your session, allowing you to draft specific fighters into different events without re-entering data.
                </p>
                <div className="bg-zinc-50 dark:bg-zinc-950 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-inner">
                  <div className="flex gap-4">
                    <div className="p-2 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 text-emerald-500 shrink-0 h-fit shadow-sm">
                      <UserPlus className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-[10px] sm:text-xs font-black text-zinc-700 dark:text-zinc-200 uppercase tracking-widest mb-1">Individual Enrollment</h4>
                      <p className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-500 leading-relaxed">Add name records manually or use bulk recruitment to populate the roster with fantasy combatants.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 pt-2 border-t border-zinc-100 dark:border-zinc-900">
                    <div className="p-2 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 text-sky-500 shrink-0 h-fit shadow-sm">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-[10px] sm:text-xs font-black text-zinc-700 dark:text-zinc-200 uppercase tracking-widest mb-1">Squadron Assembly</h4>
                      <p className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-500 leading-relaxed">During setup, toggle "Squad Combat" to group individuals into permanent teams for the duration of that specific event.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-lg font-medieval text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <LayoutList className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> Tactical Intelligence
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <Swords className="w-5 h-5 text-sky-600 dark:text-sky-500 mt-1 shrink-0" />
                    <div>
                      <span className="text-[10px] sm:text-xs font-bold text-zinc-700 dark:text-zinc-200 block uppercase tracking-widest">Warrior Ranks</span>
                      <p className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-500 leading-relaxed">Ranks (0-12) denote combat experience. In squad mode, individual ranks are <strong>aggregated</strong> to calculate total team strength for seeding.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <GripVertical className="w-5 h-5 text-zinc-400 dark:text-zinc-600 mt-1 shrink-0" />
                    <div>
                      <span className="text-[10px] sm:text-xs font-bold text-zinc-700 dark:text-zinc-200 block uppercase tracking-widest">Seeding Order</span>
                      <p className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-500 leading-relaxed">The vertical order of the Master Roster determines initial bracket placement. Use "Seed by Warriors" to auto-sort the strongest entrants to the top.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'martial':
        return (
          <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-lg font-medieval text-zinc-900 dark:text-white uppercase tracking-wider">Combat Disciplines</h3>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { label: 'Single / Florentine / Shield', icon: Sword, color: 'text-sky-600 dark:text-sky-400', desc: 'Standard melee classes including sword-and-board or two-weapon styles.' },
                    { label: 'Great Weapons', icon: ArrowUpRight, color: 'text-emerald-600 dark:text-emerald-400', desc: 'Long-reach weaponry like polearms, spears, and greatswords.' },
                    { label: 'Archery / Projectiles', icon: Target, color: 'text-amber-600 dark:text-amber-400', desc: 'Ranged specialists, bow-combat, and thrown projectiles.' },
                    { label: 'Other / Mixed', icon: Sparkles, color: 'text-rose-600 dark:text-rose-400', desc: 'Non-standard classes or tournaments allowing varied weapon types.' },
                  ].map(format => (
                    <div key={format.label} className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex gap-4 items-start shadow-sm transition-colors">
                      <div className={`p-2 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 ${format.color}`}>
                        <format.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div>
                        <h4 className="text-[10px] sm:text-xs font-black text-zinc-900 dark:text-white uppercase tracking-widest mb-0.5">{format.label}</h4>
                        <p className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-500 leading-tight">{format.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-6 sm:space-y-8">
                <div className="bg-zinc-50 dark:bg-zinc-950/50 border-2 border-zinc-200 dark:border-zinc-800 p-6 rounded-[2rem] space-y-4 shadow-inner">
                   <h3 className="text-[11px] sm:text-sm font-black text-zinc-900 dark:text-white uppercase tracking-[0.3em] flex items-center gap-2">
                     <Timer className="w-4 h-4 text-sky-600 dark:text-sky-500" /> Ironman Protocols
                   </h3>
                   <div className="space-y-4">
                      <div>
                        <span className="text-sky-600 dark:text-sky-400 font-bold uppercase tracking-widest text-[9px] sm:text-[10px] block mb-1">Tactical Duration</span>
                        <p className="text-[10px] sm:text-[11px] text-zinc-500 leading-relaxed">Unlike brackets, Ironman matches use <strong>Timer Increments</strong> (10, 15, 20m). Victory protocols are replaced by a global match timer.</p>
                      </div>
                      <div>
                        <span className="text-sky-600 dark:text-sky-400 font-bold uppercase tracking-widest text-[9px] sm:text-[10px] block mb-1">Pool Progression</span>
                        <p className="text-[10px] sm:text-[11px] text-zinc-500 leading-relaxed">If Ironman is a Pool, you can set <strong>Victories to Advance</strong> or <strong>Streak Goals</strong> to auto-populate a Finalist Bracket.</p>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'arts':
        return (
          <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-lg font-medieval text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Palette className="w-5 h-5 text-violet-600 dark:text-violet-400" /> Exhibition Management
                </h3>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  The Arts & Sciences module supports multi-judge evaluation across specialized domains.
                </p>
                <div className="space-y-4">
                  <div className="bg-violet-50 dark:bg-violet-500/5 border border-violet-100 dark:border-violet-500/20 p-5 rounded-[1.5rem] flex gap-4 transition-colors shadow-sm">
                    <EyeOff className="w-6 h-6 text-violet-500 dark:text-violet-400 shrink-0" />
                    <div>
                      <h4 className="text-[10px] sm:text-xs font-black text-violet-600 dark:text-violet-400 uppercase tracking-widest mb-1">Anonymous Mode</h4>
                      <p className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-500 leading-relaxed">Toggling "Anonymous" masks artisan names as "Artisan #ID" to eliminate bias during evaluation.</p>
                    </div>
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-950 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-inner">
                    <h4 className="text-[10px] sm:text-xs font-black text-zinc-900 dark:text-white uppercase tracking-widest mb-1 flex items-center gap-2">
                       <ShieldCheck className="w-4 h-4 text-emerald-500" /> Division Hierarchy
                    </h4>
                    <p className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-500 leading-relaxed">
                      Entries are categorized into <strong>Major Divisions</strong> (Owl, Garber, Dragon, Smith). Organizers can enable specific <strong>Sub-disciplines</strong> to restrict exhibition scope.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-lg font-medieval text-zinc-900 dark:text-white uppercase tracking-wider">Evaluation Protocols</h3>
                <div className="bg-white dark:bg-zinc-950 border-2 border-zinc-100 dark:border-zinc-800 p-6 rounded-[2rem] space-y-6 shadow-sm">
                  <div className="space-y-2">
                    <span className="text-violet-600 dark:text-violet-400 font-bold uppercase tracking-widest text-[9px] sm:text-[10px] block">Mean Scoring Architecture</span>
                    <p className="text-[10px] sm:text-[11px] text-zinc-500 leading-relaxed">The system calculates a mean average for every entry. Specific "Scoring Conditions" allow you to auto-drop outliers or toggle whether zeros count.</p>
                  </div>
                  <div className="space-y-2 border-t border-zinc-50 dark:border-zinc-900 pt-4">
                    <span className="text-violet-600 dark:text-violet-400 font-bold uppercase tracking-widest text-[9px] sm:text-[10px] block text-right">Judge Feedback</span>
                    <p className="text-[10px] sm:text-[11px] text-zinc-500 leading-relaxed text-right">Click the feedback icon on any exhibition entry to record text-based critiques from the judging panel.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'controls':
        return (
          <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
              <div className="space-y-6">
                <div className="bg-rose-50 dark:bg-rose-500/5 border border-rose-100 dark:border-rose-500/20 p-6 rounded-[2rem] space-y-3 shadow-sm transition-colors">
                  <div className="flex items-center gap-3 text-rose-600 dark:text-rose-500">
                    <Lock className="w-5 h-5 sm:w-6 sm:h-6" />
                    <h3 className="text-[11px] sm:text-sm font-black uppercase tracking-widest">Active Lockdown</h3>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                     Completed tournaments initiate a <strong>10-second warning</strong> before locking engagement zones to prevent late entry accidents.
                  </p>
                </div>
              </div>
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-lg font-medieval text-zinc-900 dark:text-white uppercase tracking-wider">Marshal's Decrees</h3>
                <div className="bg-zinc-50 dark:bg-zinc-950 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex gap-4 items-start shadow-inner">
                    <Timer className="w-5 h-5 sm:w-6 sm:h-6 text-sky-600 dark:text-sky-400 shrink-0" />
                    <div>
                      <h4 className="text-[10px] sm:text-xs font-black text-zinc-900 dark:text-white uppercase tracking-widest mb-1">Match Swapping</h4>
                      <p className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-500 leading-relaxed">While in "Preparation", click participant slots to initiate a swap and adjust pairings before beginning.</p>
                    </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'data':
        return (
          <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-lg font-medieval text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-sky-600 dark:text-sky-400" /> Persistence Ledger
                </h3>
                <div className="bg-white dark:bg-zinc-950/80 border-2 border-amber-200 dark:border-amber-500/20 p-6 rounded-[2rem] space-y-3 shadow-sm transition-colors">
                  <h4 className="text-[10px] sm:text-xs font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4" /> Ephemeral Data
                  </h4>
                  <p className="text-[10px] sm:text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    BattleOS runs locally. Saves sync every 10 seconds, but clearing cache will erase this ledger permanently. Use <strong>Exports</strong> for safe-keeping.
                  </p>
                </div>
              </div>
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-lg font-medieval text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Printer className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> Archives
                </h3>
                <div className="bg-zinc-50 dark:bg-zinc-950 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex gap-4 items-start shadow-inner">
                  <FileText className="w-5 h-5 sm:w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <h4 className="text-[10px] sm:text-xs font-black text-zinc-900 dark:text-white uppercase tracking-widest mb-1">The Sovereign Report</h4>
                    <p className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-500 leading-relaxed">Generates summaries of all events, podium finishers, and artisan feedback for print or digital distribution.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'interface':
        return (
          <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {[
                { icon: GripVertical, label: 'Swap', desc: 'Pre-match pairing' },
                { icon: Zap, label: 'Simulate', desc: 'Mock results' },
                { icon: Maximize2, label: 'Condense', desc: 'Focus view' },
                { icon: RotateCcw, label: 'Reset', desc: 'Refight bout' },
                { icon: LayoutGrid, label: 'View Mode', desc: 'Toggle timeline' },
                { icon: PanelLeftOpen, label: 'Peeking', desc: 'Roster overlay' },
                { icon: Sword, label: 'War Mode', desc: 'Martial system' },
                { icon: Palette, label: 'Arts Mode', desc: 'A&S system' },
              ].map(item => (
                <div key={item.label} className="flex flex-col items-center text-center gap-2 p-4 sm:p-6 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group">
                  <div className="p-2 sm:p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 group-hover:bg-zinc-100 dark:group-hover:bg-zinc-800 transition-colors">
                    <item.icon className="w-4 h-4 sm:w-5 sm:h-5 text-sky-600 dark:text-sky-400" />
                  </div>
                  <div>
                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-zinc-800 dark:text-zinc-200 block">{item.label}</span>
                    <p className="hidden sm:block text-[9px] text-zinc-500 leading-tight uppercase font-bold mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'about':
        return (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex flex-col items-center text-center mb-4">
              <div className="w-16 h-16 bg-sky-50 dark:bg-sky-500/10 rounded-2xl flex items-center justify-center mb-4 border border-sky-200 dark:border-sky-500/20 shadow-sm"><Shield className="w-8 h-8 text-sky-600 dark:text-sky-500" /></div>
              <h2 className="text-2xl font-medieval text-zinc-900 dark:text-white uppercase tracking-widest mb-1">System Provenance</h2>
              <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.4em]">BattleOS Protocol</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
              <div className="bg-zinc-50 dark:bg-zinc-950/50 p-6 rounded-[2rem] border border-zinc-200 dark:border-zinc-800/50 flex flex-col justify-center items-center text-center shadow-inner">
                 <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed italic">"To the heralds who record our deeds, and the reeves who ensure our honor."</p>
                 <div className="h-px w-12 bg-zinc-200 dark:bg-zinc-800 my-4" />
                 <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">BattleOS is a project from <span className="text-sky-600 dark:text-sky-400 font-bold">Brother Tobias of Heraldsbridge</span>, mundanely known as Avery W. Krouse. <span className="text-zinc-400 dark:text-zinc-600">&copy; 2025.</span></p>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                  <div className="p-2 indigo-50 dark:bg-indigo-500/10 rounded-lg shrink-0 shadow-sm"><MessageSquare className="text-indigo-600 dark:text-indigo-400" /></div>
                  <div><p className="text-[10px] font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-widest mb-1">Feedback & Support</p><p className="text-[11px] text-zinc-500">Reach out to Tobias on Discord: <span className="text-sky-600 dark:text-sky-400 font-mono select-all font-bold">baltinerdist</span></p></div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg shrink-0"><Heart className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /></div>
                  <div><p className="text-[10px] font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-widest mb-1">Open Protocol</p><p className="text-[11px] text-zinc-500 leading-relaxed">BattleOS is free software. If this system improved your event, please share your experience.</p></div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-2 sm:p-4 sm:p-8 overflow-hidden">
      <div className="absolute inset-0 bg-zinc-950/40 dark:bg-zinc-950/95 backdrop-blur-xl" onClick={onClose} />
      <div className="relative w-full max-w-6xl h-full max-h-[96vh] sm:max-h-[92vh] bg-white dark:bg-zinc-900 border sm:border-2 border-zinc-200 dark:border-zinc-800 rounded-[2rem] sm:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300 transition-colors">
        <div className="px-4 sm:px-10 pt-6 sm:pt-8 pb-0 bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 shrink-0 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="p-3 sm:p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl sm:rounded-2xl shadow-xl transition-colors"><Book className="w-6 h-6 sm:w-8 sm:h-8 text-sky-600 dark:text-sky-400" /></div>
              <div><h1 className="text-xl sm:text-3xl font-medieval text-zinc-900 dark:text-white uppercase tracking-[0.1em] sm:tracking-[0.2em] leading-none mb-1 sm:mb-2">Marshal's Manual</h1><div className="flex items-center gap-2 sm:gap-3"><span className="px-1.5 py-0.5 bg-sky-600 dark:bg-sky-500 text-white text-[7px] sm:text-[8px] font-black uppercase tracking-widest rounded shadow-sm">System V{APP_VERSION}</span><span className="text-[8px] sm:text-[10px] text-zinc-400 dark:text-zinc-600 font-black uppercase tracking-widest hidden sm:inline">Tactical Protocol</span></div></div>
            </div>
            <button onClick={onClose} className="absolute top-4 right-4 sm:static p-3 sm:p-4 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-300 rounded-xl sm:rounded-2xl transition-all shadow-lg active:scale-95 transition-colors"><X className="w-5 h-5" /></button>
          </div>
          <div className="flex items-end gap-1 overflow-x-auto no-scrollbar mask-fade-right sm:mask-none -mx-4 px-4 sm:mx-0 sm:px-0">
            {TABS.map(tab => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`group relative flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 rounded-t-xl sm:rounded-t-2xl transition-all duration-300 border-x border-t sm:border-x-2 sm:border-t-2 ${isActive ? 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-sky-600 dark:text-sky-400 translate-y-[2px] z-10 shadow-sm' : 'bg-transparent border-transparent text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 translate-y-[4px]'}`}><Icon className={`w-3.5 h-3.5 sm:w-4 h-4 transition-colors ${isActive ? 'text-sky-600 dark:text-sky-400' : 'text-zinc-400 dark:text-zinc-700 group-hover:text-zinc-500'}`} /><span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest whitespace-nowrap`}>{tab.label}</span>{isActive && <div className="absolute -bottom-[4px] left-0 right-0 h-1.5 bg-white dark:bg-zinc-900 z-20" />}</button>
              );
            })}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 sm:p-12 custom-scrollbar bg-white dark:bg-zinc-900 transition-colors"><div className="max-w-5xl mx-auto pb-12">{renderContent()}</div></div>
        <div className="px-6 sm:px-10 py-4 sm:py-5 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[8px] sm:text-[10px] font-mono text-zinc-400 dark:text-zinc-600 uppercase tracking-widest shrink-0 transition-colors"><div className="flex items-center gap-3"><Info className="w-3.5 h-3.5 sm:w-4 h-4 text-sky-600 dark:text-sky-500" /><span className="truncate max-w-[120px] sm:max-w-none">Unified Standard V{APP_VERSION}</span></div><button onClick={onClose} className="text-sky-600 dark:text-sky-500 font-bold hover:text-sky-700 dark:hover:text-sky-400 transition-colors border-l border-zinc-200 dark:border-zinc-800 pl-4 sm:pl-6"><span className="hidden sm:inline">ACKNOWLEDGE & </span>RESUME</button></div>
      </div>
    </div>
  );
};

export default HelpSystem;