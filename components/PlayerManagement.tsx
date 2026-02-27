
import React, { useState } from 'react';
import { Player, PlayerRole } from '../types';
import { 
  Users, UserPlus, Trash2, ArrowLeft, Shield, Sword, 
  Palette, Gavel, Award, TrendingUp, Search, X, 
  CheckCircle2, Plus, Minus, User, UserCheck
} from 'lucide-react';

interface PlayerManagementProps {
  players: Player[];
  onAdd: (player: Omit<Player, 'id' | 'color' | 'createdAt'>) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Player>) => void;
  onBack: () => void;
}

const ROLE_CONFIG: Record<PlayerRole, { label: string; icon: React.ElementType; color: string }> = {
  fighter: { label: 'Fighter', icon: Sword, color: 'text-sky-500' },
  reeve: { label: 'Reeve', icon: Shield, color: 'text-emerald-500' },
  artisan: { label: 'Artisan', icon: Palette, color: 'text-violet-500' },
  judge: { label: 'Judge', icon: Gavel, color: 'text-amber-500' }
};

const PlayerManagement: React.FC<PlayerManagementProps> = ({ players, onAdd, onRemove, onUpdate, onBack }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [newPlayer, setNewPlayer] = useState<{
    name: string;
    roles: PlayerRole[];
    warriorRank: number;
    recentPerformance: string;
  }>({
    name: '',
    roles: ['fighter'],
    warriorRank: 0,
    recentPerformance: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlayer.name.trim()) {
      onAdd(newPlayer);
      setNewPlayer({ name: '', roles: ['fighter'], warriorRank: 0, recentPerformance: '' });
      setShowAddForm(false);
    }
  };

  const toggleRole = (role: PlayerRole) => {
    setNewPlayer(prev => ({
      ...prev,
      roles: prev.roles.includes(role) 
        ? prev.roles.filter(r => r !== role) 
        : [...prev.roles, role]
    }));
  };

  const filteredPlayers = players.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col bg-app-bg overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Header */}
      <header className="bg-app-surface border-b border-app-border px-6 py-5 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="p-2 text-app-text-muted hover:text-app-text transition-colors hover:bg-app-surface-muted rounded-xl">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-sky-500 rounded-xl shadow-lg shadow-sky-500/20">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-medieval text-app-text uppercase tracking-widest leading-none">Player Directory</h1>
              <p className="text-[10px] font-black text-app-text-muted uppercase tracking-[0.3em] mt-1">Registry Enrollment</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-app-text-muted" />
            <input 
              type="text" 
              placeholder="Search registry..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-app-surface-muted border-2 border-app-border rounded-xl pl-10 pr-4 py-2 text-xs text-app-text focus:outline-none focus:border-app-primary/50 transition-all w-64 shadow-inner"
            />
          </div>
          <button 
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-app-primary hover:bg-sky-500 text-white rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg transition-all active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Player</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {filteredPlayers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center space-y-6">
              <div className="p-8 bg-app-surface-muted rounded-full border-2 border-dashed border-app-border opacity-30">
                <Users className="w-16 h-16 text-app-text-muted" />
              </div>
              <div>
                <h3 className="text-xl font-medieval text-app-text-muted uppercase">Registry Empty</h3>
                <p className="text-sm text-app-text-muted/60 mt-2">Add players to the global registry to begin</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlayers.map(player => (
                <div key={player.id} className="bg-app-surface border-2 border-app-border rounded-[2rem] p-6 shadow-lg hover:border-app-primary/30 transition-all group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-app-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-lg shadow-lg" style={{ backgroundColor: player.color }}>
                        {player.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-app-text">{player.name}</h3>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {player.roles.map(role => {
                            const Config = ROLE_CONFIG[role];
                            return (
                              <div key={role} className={`flex items-center gap-1 px-2 py-0.5 bg-app-surface-muted rounded-lg text-[8px] font-black uppercase tracking-widest ${Config.color}`}>
                                <Config.icon className="w-2.5 h-2.5" />
                                {Config.label}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => onRemove(player.id)}
                      className="p-2 text-app-text-muted/30 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-app-surface-muted rounded-xl border border-app-border">
                      <div className="flex items-center gap-2 text-app-text-muted">
                        <Award className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Warrior Rank</span>
                      </div>
                      <span className="text-lg font-medieval text-app-primary">{player.warriorRank}</span>
                    </div>

                    <div className="p-4 bg-app-surface-muted rounded-xl border border-app-border">
                      <div className="flex items-center gap-2 text-app-text-muted mb-2">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Combat Record</span>
                      </div>
                      <p className="text-xs text-app-text italic leading-relaxed">
                        {player.recentPerformance || 'No combat performance recorded.'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between pt-4 border-t border-app-border">
                    <span className="text-[8px] font-mono text-app-text-muted uppercase tracking-widest">ID: {player.id}</span>
                    <span className="text-[8px] font-mono text-app-text-muted uppercase tracking-widest">Added {new Date(player.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Add Player Overlay */}
      {showAddForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          <div className="absolute inset-0 bg-app-bg/80 backdrop-blur-xl" onClick={() => setShowAddForm(false)} />
          <div className="relative w-full max-w-xl bg-app-surface border border-app-border rounded-[3rem] shadow-2xl animate-in zoom-in-95 duration-300 transition-colors">
            <div className="p-8 sm:p-10">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-app-primary-muted rounded-2xl border border-app-primary/20">
                    <UserPlus className="w-6 h-6 text-app-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-medieval text-app-text uppercase tracking-widest">Enroll New Player</h2>
                    <p className="text-[10px] font-black text-app-text-muted uppercase tracking-[0.2em] mt-1">Player Enrollment</p>
                  </div>
                </div>
                <button onClick={() => setShowAddForm(false)} className="p-2 text-app-text-muted hover:text-app-text rounded-xl transition-all">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-app-text-muted ml-1">Personal Identifier (Name)</label>
                  <input 
                    type="text" 
                    required
                    value={newPlayer.name}
                    onChange={(e) => setNewPlayer(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter player name..."
                    className="w-full bg-app-surface-muted border-2 border-app-border rounded-2xl px-6 py-4 text-app-text focus:outline-none focus:border-app-primary/50 transition-all shadow-inner font-bold"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-app-text-muted ml-1">Designated Roles</label>
                  <div className="grid grid-cols-2 gap-3">
                    {(Object.keys(ROLE_CONFIG) as PlayerRole[]).map(role => {
                      const Config = ROLE_CONFIG[role];
                      const isActive = newPlayer.roles.includes(role);
                      return (
                        <button
                          key={role}
                          type="button"
                          onClick={() => toggleRole(role)}
                          className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${isActive ? 'bg-app-primary-muted border-app-primary text-app-primary shadow-sm' : 'bg-app-surface border-app-border text-app-text-muted opacity-50 hover:opacity-100'}`}
                        >
                          <div className="flex items-center gap-3">
                            <Config.icon className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">{Config.label}</span>
                          </div>
                          {isActive && <CheckCircle2 className="w-4 h-4" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-app-text-muted ml-1">Warrior Rank</label>
                    <div className="flex items-center justify-between bg-app-surface-muted p-2 rounded-2xl border-2 border-app-border shadow-inner">
                      <button type="button" onClick={() => setNewPlayer(p => ({ ...p, warriorRank: Math.max(0, p.warriorRank - 1) }))} className="w-10 h-10 flex items-center justify-center bg-app-surface rounded-lg text-app-text-muted border border-app-border shadow-sm"><Minus className="w-4 h-4" /></button>
                      <span className="text-xl font-medieval text-app-primary">{newPlayer.warriorRank}</span>
                      <button type="button" onClick={() => setNewPlayer(p => ({ ...p, warriorRank: Math.min(12, p.warriorRank + 1) }))} className="w-10 h-10 flex items-center justify-center bg-app-surface rounded-lg text-app-text-muted border border-app-border shadow-sm"><Plus className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <div className="flex flex-col justify-end">
                    <p className="text-[9px] text-app-text-muted italic leading-relaxed">
                      Warrior Ranks determine seeding strength in martial tournaments. Max rank is 12 (Knight of the Sword).
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-app-text-muted ml-1">Combat Performance Log</label>
                  <textarea 
                    value={newPlayer.recentPerformance}
                    onChange={(e) => setNewPlayer(prev => ({ ...prev, recentPerformance: e.target.value }))}
                    placeholder="Notes on recent tournaments, exhibition scores, or combat prowess..."
                    className="w-full h-24 bg-app-surface-muted border-2 border-app-border rounded-2xl px-6 py-4 text-xs text-app-text focus:outline-none focus:border-app-primary/50 transition-all shadow-inner resize-none custom-scrollbar"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-[0.2em] text-sm rounded-[1.5rem] shadow-xl shadow-emerald-900/20 transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  <UserCheck className="w-6 h-6" />
                  Confirm Player
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerManagement;
