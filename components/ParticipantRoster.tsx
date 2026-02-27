import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Participant, Player } from '../types';
import { UserPlus, UserMinus, Shield, Sword, PanelLeftClose, PanelLeftOpen, GripVertical, CheckCircle2, Plus, Zap, Palette, Swords, Minus, StickyNote, ListTree, Shuffle, Search, User, Users } from 'lucide-react';

interface ParticipantRosterProps {
  participants: Participant[];
  masterPlayers?: Player[];
  onImportPlayer?: (player: Player) => void;
  onAdd: (name: string) => void;
  onRemove: (id: number | string) => void;
  onUpdateName?: (id: number | string, newName: string) => void;
  onUpdateWarriorRank?: (id: number | string, rank: number) => void;
  onOpenNotes?: (participant: Participant) => void;
  onReorder?: (newOrder: Participant[]) => void;
  onAddBulk?: (count: number) => void;
  onRegenerate?: () => void;
  onHighlight?: (id: number | string | null) => void;
  onToggleParticipant?: (id: number | string) => void;
  onRepopulateBracket?: (mode: 'seeded' | 'random') => void;
  activeParticipantIds?: Set<number | string>;
  rankings?: Map<number | string, number>;
  disabled: boolean;
  isOpen: boolean;
  onToggle: (() => void) | null;
  accentColor?: 'sky' | 'blue';
  layout?: 'list' | 'grid';
  artsMode?: boolean;
  showWarriorRank?: boolean;
}

const getContrastColor = (bgColor: string) => {
  const blackTextColors = ['#facc15', '#84cc16'];
  return blackTextColors.includes(bgColor) ? '#000000' : '#ffffff';
};

const formatWarriorRank = (rank: number) => {
  if (rank === 11) return 'W';
  if (rank === 12) return 'KSw';
  return rank.toString();
};

const ParticipantRoster: React.FC<ParticipantRosterProps> = ({ 
  participants, masterPlayers = [], onImportPlayer, onAdd, onRemove, onUpdateName, onUpdateWarriorRank, onOpenNotes, onReorder, onAddBulk, onHighlight, onToggleParticipant, onRepopulateBracket, activeParticipantIds, rankings, disabled, isOpen, onToggle, accentColor = 'sky', layout = 'list', artsMode = false, showWarriorRank = false
}) => {
  const [newName, setNewName] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [lockedHighlightId, setLockedHighlightId] = useState<number | string | null>(null);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [tempName, setTempName] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const isTeamMode = participants.length > 0 && typeof participants[0].id === 'string';

  useEffect(() => {
    if (editingId !== null && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim() && !disabled && !isTeamMode) {
      onAdd(newName.trim());
      setNewName('');
      setShowSuggestions(false);
    }
  };

  const handleStartEdit = (p: Participant) => {
    if (disabled || isTeamMode) return;
    setEditingId(p.id);
    setTempName(p.name);
  };

  const handleSaveEdit = () => {
    if (editingId !== null && tempName.trim() && onUpdateName && !disabled) {
      onUpdateName(editingId, tempName.trim());
    }
    setEditingId(null);
  };

  const handleMouseEnter = (id: number | string) => {
    if (onHighlight && !lockedHighlightId) onHighlight(id);
  };

  const handleMouseLeave = () => {
    if (onHighlight && !lockedHighlightId) onHighlight(null);
  };

  const handleClick = (id: number | string) => {
    if (onHighlight) {
      if (lockedHighlightId === id) {
        setLockedHighlightId(null);
        onHighlight(null);
      } else {
        setLockedHighlightId(id);
        onHighlight(id);
      }
    }
    if (onToggleParticipant && !editingId && !disabled && !isTeamMode) {
      onToggleParticipant(id);
    }
  };

  const triggerReorder = (fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx || disabled) return;
    const newOrder = [...participants];
    const draggedItem = newOrder[fromIdx];
    newOrder.splice(fromIdx, 1);
    newOrder.splice(toIdx, 0, draggedItem);
    setDraggedIdx(toIdx);
    if (onReorder) onReorder(newOrder);
  };

  const onDragStart = (e: React.DragEvent, index: number) => {
    if (disabled || editingId !== null) return;
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (e: React.DragEvent, index: number) => {
    if (disabled || draggedIdx === null || draggedIdx === index) return;
    e.preventDefault();
    triggerReorder(draggedIdx, index);
  };

  const onDragEnd = () => setDraggedIdx(null);

  const handleUpdateRank = (p: Participant, delta: number) => {
    if (!onUpdateWarriorRank || disabled || isTeamMode) return;
    const current = p.warriorRank ?? 0;
    const next = Math.max(0, Math.min(12, current + delta));
    onUpdateWarriorRank(p.id, next);
  };

  const filteredSuggestions = useMemo(() => {
    if (!newName.trim() || !masterPlayers) return [];
    const query = newName.toLowerCase();
    const roleToFind = artsMode ? 'artisan' : 'fighter';
    return masterPlayers.filter(p => 
      p.roles.includes(roleToFind) && 
      p.name.toLowerCase().includes(query) &&
      !participants.some(participant => participant.name.toLowerCase() === p.name.toLowerCase())
    ).slice(0, 5);
  }, [newName, masterPlayers, participants, artsMode]);

  const handleSelectSuggestion = (player: Player) => {
    if (onImportPlayer) {
      onImportPlayer(player);
    } else {
      onAdd(player.name);
    }
    setNewName('');
    setShowSuggestions(false);
  };

  const accentText = artsMode ? 'text-violet-600' : 'text-app-primary';
  const accentBg = artsMode ? 'bg-violet-500' : 'bg-app-primary';
  const RosterIcon = artsMode ? Palette : (isTeamMode ? Shield : Users);

  return (
    <div className="relative h-full flex flex-col overflow-hidden bg-app-surface-muted transition-colors">
      <div 
        ref={containerRef}
        className={`flex-1 transition-all duration-500 flex flex-col h-full ${isOpen ? 'p-4 sm:p-6 opacity-100 overflow-hidden' : 'p-3 items-center opacity-100 overflow-hidden'}`}
      >
        {isOpen ? (
          <>
            <div className="flex flex-col gap-3 mb-4 pb-2 relative z-50 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <RosterIcon className={`w-5 h-5 sm:w-7 sm:h-7 ${accentText}`} />
                  <h2 className={`text-lg sm:text-2xl font-medieval ${accentText} uppercase tracking-wider`}>
                    {artsMode ? 'Artisans' : (isTeamMode ? 'Squadrons' : 'Roster')}
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  {!isTeamMode && onAddBulk && !disabled && (
                    <div className="flex items-center gap-2">
                      <div className="relative group/zap">
                        <div className="p-2 bg-app-surface rounded-lg border border-app-border text-app-text-muted shadow-sm">
                          <Zap className="w-4 h-4 fill-current" />
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        {[8, 12, 16].map(count => (
                          <button key={count} onClick={() => onAddBulk(count)} className="px-2.5 py-1.5 bg-app-surface border border-app-border rounded-lg font-black text-[10px] text-app-text-muted hover:text-app-primary hover:bg-app-surface-muted transition-colors shadow-sm">+{count}</button>
                        ))}
                      </div>
                    </div>
                  )}
                  {onToggle && (
                    <button onClick={onToggle} className="p-1.5 text-app-text-muted hover:text-app-text transition-colors">
                      <PanelLeftClose className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {!disabled && !isTeamMode && (
              <div className="relative mb-4 z-50 shrink-0">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <input 
                    type="text" 
                    value={newName} 
                    onChange={(e) => {
                      setNewName(e.target.value);
                      setShowSuggestions(true);
                    }} 
                    onFocus={() => setShowSuggestions(true)}
                    placeholder={artsMode ? "Enter name..." : "Add fighter..."} 
                    className="flex-1 bg-app-surface border-2 border-app-border rounded-xl px-3 py-2 text-xs text-app-text placeholder:text-app-text-muted focus:outline-none focus:border-app-primary/50 shadow-inner transition-colors" 
                  />
                  <button type="submit" className={`${accentBg} text-white p-2 rounded-xl transition-all shadow-lg active:scale-95`}><UserPlus className="w-4 h-4" /></button>
                </form>

                {showSuggestions && filteredSuggestions.length > 0 && (
                  <div ref={suggestionsRef} className="absolute top-full left-0 right-0 mt-1 bg-app-surface border-2 border-app-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="p-2 border-b border-app-border bg-app-surface-muted flex items-center justify-between">
                      <span className="text-[8px] font-black uppercase tracking-widest text-app-text-muted">Registry Matches</span>
                      <Search className="w-3 h-3 text-app-text-muted opacity-30" />
                    </div>
                    {filteredSuggestions.map(player => (
                      <button 
                        key={player.id} 
                        onClick={() => handleSelectSuggestion(player)}
                        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-app-primary-muted text-left group transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded flex items-center justify-center text-[8px] font-black text-white shadow-sm" style={{ backgroundColor: player.color }}>{player.name.charAt(0)}</div>
                          <div>
                            <span className="text-xs font-bold text-app-text group-hover:text-app-primary">{player.name}</span>
                            {!artsMode && <span className="text-[7px] text-app-text-muted font-black ml-2 uppercase">Rank {player.warriorRank}</span>}
                          </div>
                        </div>
                        <UserPlus className="w-3 h-3 text-app-text-muted group-hover:text-app-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className={`flex-1 overflow-y-auto pr-1.5 custom-scrollbar touch-none ${layout === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 gap-2' : 'space-y-1.5'}`}>
              {participants.length === 0 ? (
                <div className="text-center py-8 text-app-text-muted italic text-[11px] font-bold uppercase tracking-widest col-span-full">Deployment records empty</div>
              ) : (
                participants.map((p, idx) => {
                  const isEditing = editingId === p.id;
                  const isActive = activeParticipantIds?.has(p.id);
                  const warriorRankVal = p.warriorRank ?? 0;
                  const hasNotes = (artsMode ? p.artsNotes : p.martialNotes)?.trim().length ?? 0 > 0;

                  return (
                    <div
                      key={p.id}
                      data-idx={idx}
                      draggable={!disabled && !isEditing}
                      onDragStart={(e) => onDragStart(e, idx)}
                      onDragOver={(e) => onDragOver(e, idx)}
                      onDragEnd={onDragEnd}
                      onMouseEnter={() => handleMouseEnter(p.id)}
                      onMouseLeave={handleMouseLeave}
                      onClick={() => !isEditing && handleClick(p.id)}
                      className={`group flex flex-col items-stretch bg-app-surface border rounded-xl px-2.5 py-2 transition-all shadow-sm
                          ${disabled ? 'cursor-default border-transparent' : 'cursor-grab active:cursor-grabbing hover:border-app-primary/40'}
                          ${lockedHighlightId === p.id ? `border-app-accent ring-2 ring-app-accent/10` : 'border-app-border'}
                          ${draggedIdx === idx ? 'opacity-40 scale-95 border-dashed bg-app-primary-muted' : ''}
                      `}
                    >
                      <div className="flex items-center gap-2.5 w-full">
                        {!disabled && !isEditing && <div className="text-app-text-muted/30 shrink-0"><GripVertical className="w-3.5 h-3.5" /></div>}
                        <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-lg font-black text-[9px] shadow-sm" style={{ backgroundColor: p.color, color: getContrastColor(p.color) }}>
                          <span className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]">{p.id}</span>
                        </div>
                        <div className="flex-1 overflow-hidden">
                          {isEditing ? (
                            <input ref={editInputRef} type="text" value={tempName} onChange={(e) => setTempName(e.target.value)} onBlur={handleSaveEdit} className="bg-app-surface-muted border border-app-primary/30 rounded px-2 py-0.5 text-xs text-app-text focus:outline-none w-full shadow-inner transition-colors" />
                          ) : (
                            <div className="flex items-center gap-2">
                               <span onClick={() => !disabled && !isTeamMode && handleStartEdit(p)} className={`text-xs font-bold truncate block ${!disabled && !isTeamMode ? 'cursor-text hover:text-app-primary' : ''} ${lockedHighlightId === p.id ? 'text-app-accent' : 'text-app-text'}`}>{p.name}</span>
                               {hasNotes && <div className="w-1.5 h-1.5 rounded-full bg-app-accent shadow-[0_0_8px_rgba(245,158,11,0.5)]" />}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-app-border transition-colors">
                        <div className="flex items-center gap-1.5">
                           <span className="text-[7px] font-black text-app-text-muted uppercase tracking-widest">{idx + 1}</span>
                           {!artsMode && (
                             <div className="flex items-center gap-1 ml-1">
                                <span className="text-sm font-black uppercase tracking-widest text-app-primary/60 flex items-center gap-1.5">| <Swords className="w-3.5 h-3.5" /> {formatWarriorRank(warriorRankVal)}</span>
                                {!disabled && !isTeamMode && (
                                  <div className="flex items-center gap-1.5 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={(e) => { e.stopPropagation(); handleUpdateRank(p, -1); }} className="p-1 bg-app-surface-muted hover:bg-app-border text-app-text-muted rounded shadow-sm transition-colors"><Minus className="w-3.5 h-3.5" /></button>
                                    <button onClick={(e) => { e.stopPropagation(); handleUpdateRank(p, 1); }} className="p-1 bg-app-surface-muted hover:bg-app-border text-app-text-muted rounded shadow-sm transition-colors"><Plus className="w-3.5 h-3.5" /></button>
                                  </div>
                                )}
                             </div>
                           )}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {!isTeamMode && <button onClick={(e) => { e.stopPropagation(); onOpenNotes?.(p); }} className={`p-1 transition-colors ${hasNotes ? 'text-app-primary' : 'text-app-text-muted/30 hover:text-app-primary'}`} title="Notes"><StickyNote className="w-3.5 h-3.5" /></button>}
                          {!isTeamMode && onToggleParticipant ? (
                            <button onClick={(e) => { e.stopPropagation(); if (!disabled) onToggleParticipant(p.id); }} className={`flex items-center justify-center w-6 h-6 rounded-lg transition-all ${isActive ? `${accentBg}/10 ${accentText}` : 'bg-app-surface-muted text-app-text-muted/30'}`}><CheckCircle2 className="w-3.5 h-3.5" /></button>
                          ) : (!disabled && !isTeamMode && <button onClick={(e) => { e.stopPropagation(); onRemove(p.id); }} className="text-app-text-muted/30 hover:text-rose-500 p-1 transition-colors"><UserMinus className="w-3.5 h-3.5" /></button>)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="mt-4 pt-3 border-t border-app-border flex flex-col gap-3 shrink-0">
              <div className="flex justify-between items-center"><div className="flex items-center gap-2 text-[8px] text-app-text-muted font-black uppercase tracking-widest"><span>Active Units: {participants.length}</span></div></div>
              {!disabled && onRepopulateBracket && !artsMode && (
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => onRepopulateBracket('seeded')} className="flex items-center justify-center gap-2 py-2 px-3 bg-app-surface border border-app-border rounded-xl text-[9px] font-black uppercase tracking-widest text-app-primary hover:bg-app-surface-muted shadow-sm transition-all active:scale-95"><ListTree className="w-3.5 h-3.5" />Seeded</button>
                  <button onClick={() => onRepopulateBracket('random')} className="flex items-center justify-center gap-2 py-2 px-3 bg-app-surface border border-app-border rounded-xl text-[9px] font-black uppercase tracking-widest text-emerald-600 hover:bg-app-surface-muted shadow-sm transition-all active:scale-95"><Shuffle className="w-3.5 h-3.5" />Random</button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-3 items-center w-full h-full overflow-y-auto no-scrollbar">
            {onToggle && <button onClick={onToggle} className="w-10 h-10 flex items-center justify-center rounded-xl bg-app-surface border border-app-border text-app-text-muted hover:text-app-primary mb-1 shrink-0 shadow-sm transition-colors"><PanelLeftOpen className="w-5 h-5" /></button>}
            {participants.map(p => <div key={p.id} className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-[10px] shadow-md border border-app-border shrink-0 transition-colors" style={{ backgroundColor: p.color, color: getContrastColor(p.color) }}>{p.id}</div>)}
          </div>
        )}
      </div>
    </div>
  );
};

export default ParticipantRoster;