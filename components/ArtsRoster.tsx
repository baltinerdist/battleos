
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Participant, Player } from '../types';
import { UserPlus, UserMinus, Palette, Brush, PanelLeftClose, PanelLeftOpen, GripVertical, Check, CheckCircle2, PlusCircle, Plus, Zap, StickyNote, Search } from 'lucide-react';

interface ArtsRosterProps {
  participants: Participant[];
  masterPlayers?: Player[];
  onImportPlayer?: (player: Player) => void;
  onAdd: (name: string) => void;
  onRemove: (id: number | string) => void;
  onUpdateName?: (id: number | string, newName: string) => void;
  onOpenNotes?: (participant: Participant) => void;
  onReorder?: (newOrder: Participant[]) => void;
  onAddBulk?: (count: number) => void;
  onHighlight?: (id: number | string | null) => void;
  onToggleParticipant?: (id: number | string) => void;
  activeParticipantIds?: Set<number | string>;
  disabled: boolean;
  isOpen: boolean;
  onToggle: (() => void) | null;
  layout?: 'list' | 'grid';
}

const getContrastColor = (bgColor: string) => {
  const blackTextColors = ['#facc15', '#84cc16'];
  return blackTextColors.includes(bgColor) ? '#000000' : '#ffffff';
};

const ArtsRoster: React.FC<ArtsRosterProps> = ({ 
  participants, 
  masterPlayers = [],
  onImportPlayer,
  onAdd, 
  onRemove,
  onUpdateName,
  onOpenNotes,
  onReorder,
  onAddBulk, 
  onHighlight,
  onToggleParticipant,
  activeParticipantIds,
  disabled,
  isOpen,
  onToggle,
  layout = 'list'
}) => {
  const [newName, setNewName] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [lockedHighlightId, setLockedHighlightId] = useState<number | string | null>(null);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [tempName, setTempName] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

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
    if (newName.trim() && !disabled) {
      onAdd(newName.trim());
      setNewName('');
      setShowSuggestions(false);
    }
  };

  const handleStartEdit = (p: Participant) => {
    if (disabled) return;
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

  const filteredSuggestions = useMemo(() => {
    if (!newName.trim() || !masterPlayers) return [];
    const query = newName.toLowerCase();
    return masterPlayers.filter(p => 
      p.roles.includes('artisan') && 
      p.name.toLowerCase().includes(query) &&
      !participants.some(artisan => artisan.name.toLowerCase() === p.name.toLowerCase())
    ).slice(0, 5);
  }, [newName, masterPlayers, participants]);

  const handleSelectSuggestion = (player: Player) => {
    if (onImportPlayer) {
      onImportPlayer(player);
    } else {
      onAdd(player.name);
    }
    setNewName('');
    setShowSuggestions(false);
  };

  return (
    <div className="relative h-full flex flex-col overflow-hidden bg-zinc-950">
      <div className={`flex-1 transition-all duration-500 flex flex-col ${isOpen ? 'p-6 opacity-100' : 'p-4 items-center'}`}>
        {isOpen ? (
          <>
            <div className="flex flex-col gap-4 mb-6 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Palette className="w-7 h-7 text-violet-400" />
                  <h2 className="text-2xl font-medieval text-violet-400 uppercase tracking-wider">Arts Roster</h2>
                </div>
                <div className="flex items-center gap-2">
                  {onAddBulk && !disabled && (
                    <div className="flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-zinc-600 fill-current" />
                      {[8, 12, 16].map(count => (
                        <button key={count} onClick={() => onAddBulk(count)} className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-[9px] text-zinc-500 hover:text-white">+{count}</button>
                      ))}
                    </div>
                  )}
                  {onToggle && (
                    <button onClick={onToggle} className="p-2 text-zinc-500 hover:text-zinc-200"><PanelLeftClose className="w-5 h-5" /></button>
                  )}
                </div>
              </div>
            </div>

            {!disabled && (
              <div className="relative mb-6 z-50">
                <form onSubmit={handleSubmit} className="flex gap-3">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => {
                      setNewName(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Artisan name..."
                    className="flex-1 bg-zinc-950 border-2 border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50"
                  />
                  <button type="submit" className="bg-violet-500 hover:bg-violet-400 text-white p-2.5 rounded-xl transition-all shadow-xl shadow-violet-900/20">
                    <UserPlus className="w-5 h-5" />
                  </button>
                </form>

                {showSuggestions && filteredSuggestions.length > 0 && (
                  <div ref={suggestionsRef} className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border-2 border-zinc-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="p-2 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between">
                      <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Registry Matches</span>
                      <Search className="w-3 h-3 text-zinc-700" />
                    </div>
                    {filteredSuggestions.map(player => (
                      <button 
                        key={player.id} 
                        onClick={() => handleSelectSuggestion(player)}
                        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-violet-500/10 text-left group transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded flex items-center justify-center text-[8px] font-black text-white shadow-sm" style={{ backgroundColor: player.color }}>{player.name.charAt(0)}</div>
                          <span className="text-xs font-bold text-zinc-300 group-hover:text-violet-400 transition-colors">{player.name}</span>
                        </div>
                        <UserPlus className="w-3 h-3 text-zinc-600 group-hover:text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className={`flex-1 overflow-y-auto pr-2 custom-scrollbar ${layout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-3' : 'space-y-2'}`}>
              {participants.length === 0 ? (
                <div className="text-center py-12 text-zinc-600 italic text-sm">No artisans enlisted yet...</div>
              ) : (
                participants.map((p, idx) => {
                  const isEditing = editingId === p.id;
                  const isActive = activeParticipantIds?.has(p.id);
                  const hasNotes = p.artsNotes && p.artsNotes.trim().length > 0;
                  const hasRecs = p.artsRecommendations && p.artsRecommendations.length > 0;

                  return (
                    <div
                      key={p.id}
                      draggable={!disabled && !isEditing}
                      onDragStart={(e) => onDragStart(e, idx)}
                      onDragOver={(e) => onDragOver(e, idx)}
                      onDragEnd={onDragEnd}
                      onMouseEnter={() => handleMouseEnter(p.id)}
                      onMouseLeave={handleMouseLeave}
                      className={`group flex flex-col items-stretch bg-zinc-950 border-2 rounded-xl px-3 py-2.5 transition-all ${lockedHighlightId === p.id ? 'border-violet-500' : 'border-zinc-800'}`}
                    >
                      {/* Identity row content remains the same */}
                      <div className="flex items-center gap-3 w-full">
                        {!disabled && <div className="text-zinc-700 shrink-0"><GripVertical className="w-4 h-4" /></div>}
                        <div className="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-lg font-bold text-[10px]" style={{ backgroundColor: p.color, color: getContrastColor(p.color) }}>{p.id}</div>
                        <div className="flex-1 overflow-hidden">
                          {isEditing ? (
                            <input ref={editInputRef} type="text" value={tempName} onChange={(e) => setTempName(e.target.value)} onBlur={handleSaveEdit} onKeyDown={e => e.key === 'Enter' && handleSaveEdit()} className="bg-zinc-900 border border-violet-500/50 rounded px-2 py-0.5 text-sm text-white focus:outline-none w-full" />
                          ) : (
                            <div className="flex items-center gap-2">
                               <span onClick={() => handleStartEdit(p)} className="text-sm font-bold truncate text-zinc-200 hover:text-violet-400 cursor-text block">{p.name}</span>
                               {hasRecs && <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" title="Recommended for Award" />}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Bottom Row content remains the same */}
                      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-zinc-800/30">
                        <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Enrollment Order {idx + 1}</span>
                        
                        <div className="flex items-center gap-2">
                           <button 
                            onClick={(e) => { e.stopPropagation(); onOpenNotes?.(p); }}
                            className={`p-1.5 transition-colors ${hasNotes ? 'text-violet-400' : 'text-zinc-700 hover:text-violet-400'}`}
                            title="Artisan Notes"
                           >
                              <StickyNote className="w-4 h-4" />
                           </button>
                           {onToggleParticipant ? (
                             <button 
                               onClick={() => !disabled && onToggleParticipant(p.id)} 
                               className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isActive ? 'bg-violet-500/10 text-violet-400' : 'bg-zinc-900 text-zinc-600'}`}
                             >
                               {isActive ? <CheckCircle2 className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
                             </button>
                           ) : (
                             !disabled && (
                               <button 
                                 onClick={(e) => { e.stopPropagation(); onRemove(p.id); }} 
                                 className="text-zinc-700 hover:text-red-500 p-1.5 transition-colors"
                                 title="Remove Artisan"
                               >
                                 <UserMinus className="w-4 h-4" />
                               </button>
                             )
                           )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-800 flex justify-between items-center text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
               <div className="flex items-center gap-2"><Brush className="w-3.5 h-3.5" /> Artisans: {participants.length}</div>
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-4 items-center">
             <button onClick={onToggle} className="w-12 h-12 flex items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-violet-400"><PanelLeftOpen className="w-6 h-6" /></button>
             {participants.map(p => (
               <div key={p.id} className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs" style={{ backgroundColor: p.color, color: getContrastColor(p.color) }}>{p.id}</div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtsRoster;
