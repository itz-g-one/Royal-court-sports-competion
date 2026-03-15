import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { t, type Lang } from '@/lib/translations';
import { deletePlayer, exportToCSV, fetchPlayers, fetchGamesInfo, toggleGameDisabledApi, addCustomGameApi } from '@/lib/storage';
import { GAMES_DB, type Game } from '@/lib/gamesData';
import { toast } from 'sonner';
import { Trash2, Download, LogOut, Search, ToggleLeft, ToggleRight, PlusCircle } from 'lucide-react';

interface AdminDashboardProps {
  lang: Lang;
  onLogout: () => void;
}

type Tab = 'players' | 'games';

export default function AdminDashboard({ lang, onLogout }: AdminDashboardProps) {
  const [tab, setTab] = useState<Tab>('players');
  const [search, setSearch] = useState('');
  const [filterGender, setFilterGender] = useState('All');
  const [filterTower, setFilterTower] = useState('All');
  const [filterGame, setFilterGame] = useState('All');

  // Form state for custom game
  const [newGame, setNewGame] = useState({ nameEn: '', nameHi: '', emoji: '🎯', gender: 'Both', minAge: '', maxAge: '', description: '', descriptionHi: '' });

  const queryClient = useQueryClient();

  const { data: players = [], isLoading: playersLoading } = useQuery({ queryKey: ['players'], queryFn: fetchPlayers });
  const { data: gamesInfo, isLoading: gamesLoading } = useQuery({ queryKey: ['gamesInfo'], queryFn: fetchGamesInfo });

  const deletePlayerMut = useMutation({
    mutationFn: deletePlayer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
      toast.success('Deleted');
    }
  });

  const toggleDisabledMut = useMutation({
    mutationFn: toggleGameDisabledApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gamesInfo'] });
      toast.success(t('gameToggled', lang));
    }
  });

  const addCustomGameMut = useMutation({
    mutationFn: addCustomGameApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gamesInfo'] });
      toast.success('Game added / खेल जोड़ा गया');
      setNewGame({ nameEn: '', nameHi: '', emoji: '🎯', gender: 'Both', minAge: '', maxAge: '', description: '', descriptionHi: '' });
    }
  });

  const customGames: Game[] = gamesInfo?.customGames || [];
  const disabledGames: string[] = gamesInfo?.disabledGames || [];
  const allGamesList = [...GAMES_DB, ...customGames];

  const filtered = useMemo(() => {
    return players.filter(r => {
      const q = search.toLowerCase();
      const matchSearch = !q || r.name.toLowerCase().includes(q) || r.flat.toLowerCase().includes(q) || r.tower.toLowerCase().includes(q) || r.id.toLowerCase().includes(q);
      const matchGender = filterGender === 'All' || r.gender === filterGender;
      const matchTower = filterTower === 'All' || r.tower === filterTower;
      const matchGame = filterGame === 'All' || r.games.includes(filterGame);
      return matchSearch && matchGender && matchTower && matchGame;
    });
  }, [players, search, filterGender, filterTower, filterGame]);

  const handleDelete = (id: string) => {
    if (confirm(t('deleteConfirm', lang))) {
      deletePlayerMut.mutate(id);
    }
  };

  const handleToggleGame = (gameId: string) => {
    toggleDisabledMut.mutate(gameId);
  };

  const handleAddGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGame.nameEn || !newGame.nameHi) return toast.error('Names are required');
    const customId = `custom_${Date.now()}`;
    addCustomGameMut.mutate({
      id: customId,
      nameEn: newGame.nameEn,
      nameHi: newGame.nameHi,
      emoji: newGame.emoji,
      gender: newGame.gender,
      description: newGame.description,
      descriptionHi: newGame.descriptionHi,
      minAge: newGame.minAge ? parseInt(newGame.minAge) : undefined,
      maxAge: newGame.maxAge ? parseInt(newGame.maxAge) : undefined,
    });
  };

  const stats = useMemo(() => ({
    total: players.length,
    male: players.filter(r => r.gender === 'Male').length,
    female: players.filter(r => r.gender === 'Female').length,
    games: new Set(players.flatMap(r => r.games)).size,
  }), [players]);

  const towers = [...new Set(players.map(r => r.tower))].sort();

  const gameRegCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    players.forEach(r => r.games.forEach(g => { counts[g] = (counts[g] || 0) + 1; }));
    return counts;
  }, [players]);

  return (
    <div className="space-y-5 py-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl md:text-2xl font-black">🛡️ {t('admin', lang)}</h2>
        <button onClick={onLogout} className="flex items-center gap-1.5 text-sm font-bold text-destructive">
          <LogOut size={16} /> {t('logout', lang)}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab('players')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            tab === 'players' ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground'
          }`}
        >
          👥 {t('players', lang)}
        </button>
        <button
          onClick={() => setTab('games')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            tab === 'games' ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground'
          }`}
        >
          🎮 {t('gameManagement', lang)}
        </button>
      </div>

      {tab === 'games' && (
        <div className="space-y-6">
          <div className="bg-card border border-border p-5 rounded-2xl shadow-sm">
            <h3 className="font-bold mb-3 flex items-center gap-2"><PlusCircle size={18} /> Add New Game</h3>
            <form onSubmit={handleAddGame} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input required placeholder="Name (EN)" value={newGame.nameEn} onChange={e=>setNewGame({...newGame,nameEn:e.target.value})} className="border border-border p-2 rounded-lg text-sm bg-background" />
                <input required placeholder="Name (HI)" value={newGame.nameHi} onChange={e=>setNewGame({...newGame,nameHi:e.target.value})} className="border border-border p-2 rounded-lg text-sm bg-background" />
              </div>
              <div className="grid grid-cols-4 gap-3">
                <input placeholder="Emoji (⚽)" value={newGame.emoji} onChange={e=>setNewGame({...newGame,emoji:e.target.value})} className="border border-border p-2 rounded-lg text-sm bg-background" />
                <select value={newGame.gender} onChange={e=>setNewGame({...newGame,gender:e.target.value})} className="border border-border p-2 rounded-lg text-sm bg-background">
                  <option value="Both">Both Genders</option>
                  <option value="Male">Male Only</option>
                  <option value="Female">Female Only</option>
                </select>
                <input type="number" placeholder="Min Age" value={newGame.minAge} onChange={e=>setNewGame({...newGame,minAge:e.target.value})} className="border border-border p-2 rounded-lg text-sm bg-background" />
                <input type="number" placeholder="Max Age" value={newGame.maxAge} onChange={e=>setNewGame({...newGame,maxAge:e.target.value})} className="border border-border p-2 rounded-lg text-sm bg-background" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Desc (EN)" value={newGame.description} onChange={e=>setNewGame({...newGame,description:e.target.value})} className="border border-border p-2 rounded-lg text-sm bg-background" />
                <input placeholder="Desc (HI)" value={newGame.descriptionHi} onChange={e=>setNewGame({...newGame,descriptionHi:e.target.value})} className="border border-border p-2 rounded-lg text-sm bg-background" />
              </div>
              <button type="submit" disabled={addCustomGameMut.isPending} className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-bold text-sm">
                {addCustomGameMut.isPending ? 'Adding...' : 'Add Game'}
              </button>
            </form>
          </div>

          <div className="grid gap-3">
            {gamesLoading ? <p>Loading games...</p> : allGamesList.map(game => {
              const isDisabled = disabledGames.includes(game.id);
              const regCount = gameRegCounts[game.id] || 0;
              return (
                <div
                  key={game.id}
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                    isDisabled ? 'border-border bg-muted/30 opacity-60' : 'border-border bg-card shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{game.emoji}</span>
                    <div>
                      <p className="font-bold text-sm">{lang === 'EN' ? game.nameEn : game.nameHi}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {game.id.startsWith('custom_') && <span className="text-primary font-bold mr-1">[CUSTOM]</span>}
                        {lang === 'EN' ? game.description : game.descriptionHi} · {regCount} {t('players', lang).toLowerCase()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleGame(game.id)}
                    disabled={toggleDisabledMut.isPending}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isDisabled ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'
                    }`}
                  >
                    {isDisabled ? <ToggleLeft size={16} /> : <ToggleRight size={16} />}
                    {isDisabled ? t('gameDisabled', lang) : t('gameEnabled', lang)}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === 'players' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: t('totalPlayers', lang), value: stats.total, emoji: '👥' },
              { label: t('malePlayers', lang), value: stats.male, emoji: '🔵' },
              { label: t('femalePlayers', lang), value: stats.female, emoji: '🔴' },
              { label: t('totalGames', lang), value: stats.games, emoji: '🎮' },
            ].map(s => (
              <div key={s.label} className="bg-card p-4 rounded-2xl shadow-md border border-border text-center">
                <span className="text-2xl block">{s.emoji}</span>
                <p className="text-2xl font-black mt-1">{s.value}</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="space-y-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('search', lang)} className="w-full bg-card border border-border rounded-xl pl-9 pr-3 py-2.5 text-sm focus:border-primary outline-none" />
            </div>
            <div className="flex gap-2 flex-wrap">
              <select value={filterGender} onChange={e => setFilterGender(e.target.value)} className="bg-card border border-border rounded-lg px-2 py-1.5 text-xs font-bold">
                <option value="All">{t('all', lang)} {t('gender', lang)}</option>
                <option value="Male">{t('male', lang)}</option>
                <option value="Female">{t('female', lang)}</option>
                <option value="Other">{t('other', lang)}</option>
              </select>
              <select value={filterTower} onChange={e => setFilterTower(e.target.value)} className="bg-card border border-border rounded-lg px-2 py-1.5 text-xs font-bold">
                <option value="All">{t('all', lang)} {t('tower', lang)}</option>
                {towers.map(tw => <option key={tw} value={tw}>{tw}</option>)}
              </select>
              <select value={filterGame} onChange={e => setFilterGame(e.target.value)} className="bg-card border border-border rounded-lg px-2 py-1.5 text-xs font-bold">
                <option value="All">{t('all', lang)} {t('games', lang)}</option>
                {allGamesList.map(g => <option key={g.id} value={g.id}>{g.emoji} {lang === 'EN' ? g.nameEn : g.nameHi}</option>)}
              </select>
              <button
                onClick={() => exportToCSV(filtered)}
                className="ml-auto flex items-center gap-1.5 bg-success text-success-foreground px-3 py-1.5 rounded-lg text-xs font-bold active:scale-95 transition-transform"
              >
                <Download size={14} /> {t('exportCSV', lang)}
              </button>
            </div>
          </div>

          {/* Table */}
          {playersLoading ? (
            <div className="bg-card rounded-2xl p-10 text-center border border-border"><p className="font-bold">Loading...</p></div>
          ) : filtered.length === 0 ? (
            <div className="bg-card rounded-2xl p-10 text-center border border-border"><span className="text-4xl block mb-3">📋</span><p className="font-bold text-muted-foreground">{t('noPlayers', lang)}</p></div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-border">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-card border-b border-border">
                    <th className="text-left p-3 font-bold text-muted-foreground">{t('regId', lang)}</th>
                    <th className="text-left p-3 font-bold text-muted-foreground">{t('name', lang)}</th>
                    <th className="text-left p-3 font-bold text-muted-foreground">{t('age', lang)}</th>
                    <th className="text-left p-3 font-bold text-muted-foreground">{t('gender', lang)}</th>
                    <th className="text-left p-3 font-bold text-muted-foreground">{t('tower', lang)}/{t('flatNo', lang)}</th>
                    <th className="text-left p-3 font-bold text-muted-foreground">{t('game1', lang)}</th>
                    <th className="text-left p-3 font-bold text-muted-foreground">{t('game2', lang)}</th>
                    <th className="text-left p-3 font-bold text-muted-foreground">{t('actions', lang)}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r => (
                    <tr key={r.id} className={`border-b border-border last:border-0 ${r.gender==='Male'?'bg-male/5':r.gender==='Female'?'bg-female/5':'bg-card'}`}>
                      <td className="p-3 font-mono font-bold">{r.id}</td>
                      <td className="p-3 font-semibold">{r.name}</td>
                      <td className="p-3">{r.age}</td>
                      <td className="p-3">{r.gender}</td>
                      <td className="p-3">{r.tower}-{r.flat}</td>
                      <td className="p-3">{allGamesList.find(g => g.id === r.games[0])?.emoji} {lang === 'EN' ? allGamesList.find(g => g.id === r.games[0])?.nameEn : allGamesList.find(g => g.id === r.games[0])?.nameHi}</td>
                      <td className="p-3">{r.games[1] ? `${allGamesList.find(g => g.id === r.games[1])?.emoji} ${lang === 'EN' ? allGamesList.find(g => g.id === r.games[1])?.nameEn : allGamesList.find(g => g.id === r.games[1])?.nameHi}` : '-'}</td>
                      <td className="p-3">
                        <button onClick={() => handleDelete(r.id)} disabled={deletePlayerMut.isPending} className="text-destructive hover:bg-destructive/10 p-1.5 rounded-lg transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
