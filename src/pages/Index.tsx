import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { t, type Lang } from '@/lib/translations';
import { getEligibleGames, getActiveGames } from '@/lib/gamesData';
import { fetchGamesInfo, fetchPlayers, addPlayer, generateRegId, sanitizeFormData, type Registration } from '@/lib/storage';
import Navbar from '@/components/Navbar';
import HomeForm from '@/components/HomeForm';
import GameSelection from '@/components/GameSelection';
import Confirmation from '@/components/Confirmation';
import AdminLogin from '@/components/AdminLogin';
import AdminDashboard from '@/components/AdminDashboard';
import EventHome from '@/components/EventHome';
import GamesDetail from '@/components/GamesDetail';
import { toast } from 'sonner';

export type Page = 'event' | 'home' | 'games-select' | 'success' | 'games-detail' | 'admin-login' | 'admin-dash';

export interface FormData {
  name: string; phone: string; tower: string; flat: string; age: string; gender: string; maritalStatus: string;
}

const Index = () => {
  const [page, setPage] = useState<Page>('event');
  const [lang, setLang] = useState<Lang>('EN');
  const [formData, setFormData] = useState<FormData>({
    name: '', phone: '', tower: '', flat: '', age: '', gender: '', maritalStatus: ''
  });
  const [selectedGames, setSelectedGames] = useState<string[]>([]);
  const [lastReg, setLastReg] = useState<{ id: string } | null>(null);

  const queryClient = useQueryClient();

  const { data: gamesInfo } = useQuery({
    queryKey: ['gamesInfo'],
    queryFn: fetchGamesInfo,
  });

  const { data: players } = useQuery({
    queryKey: ['players'],
    queryFn: fetchPlayers,
  });

  const registerMutation = useMutation({
    mutationFn: addPlayer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
    }
  });

  const disabledGames = gamesInfo?.disabledGames || [];
  const customGames = gamesInfo?.customGames || [];

  const eligibleGames = useMemo(() =>
    getEligibleGames(formData.age, formData.gender, formData.maritalStatus, disabledGames, customGames),
    [formData.age, formData.gender, formData.maritalStatus, disabledGames, customGames]
  );

  const handleFormNext = useCallback(() => {
    const clean = sanitizeFormData(formData);
    if (!clean.name || !clean.phone || !clean.age || !clean.gender || !clean.tower || !clean.flat) {
      toast.error(t('fillRequired', lang));
      return;
    }
    if (clean.name.length < 2 || clean.name.length > 100) {
      toast.error(t('invalidName', lang));
      return;
    }
    if (clean.phone.length !== 10) {
      toast.error(t('invalidPhone', lang));
      return;
    }
    if (!clean.flat || clean.flat.length > 20) {
      toast.error(t('invalidFlat', lang));
      return;
    }
    setFormData(clean);
    setSelectedGames([]);
    setPage('games-select');
  }, [formData, lang]);

  const handleRegister = useCallback(() => {
    if (selectedGames.length === 0) {
      toast.error(t('selectMin1', lang));
      return;
    }
    
    // Check dupe locally against fetched players
    const dup = players?.find(r =>
      r.name.trim().toLowerCase() === formData.name.trim().toLowerCase() &&
      r.flat.trim().toLowerCase() === formData.flat.trim().toLowerCase() &&
      r.tower.trim().toLowerCase() === formData.tower.trim().toLowerCase()
    );

    if (dup) {
      toast.error(`${t('alreadyRegistered', lang)} ${t('yourRegId', lang)} #${dup.id}`);
      return;
    }

    const regId = generateRegId();
    const reg: Registration = {
      ...formData,
      id: regId,
      games: selectedGames,
      timestamp: new Date().toISOString()
    };

    const promise = registerMutation.mutateAsync(reg).then(() => {
      setLastReg({ id: regId });
      setPage('success');
    });

    toast.promise(promise, {
      loading: lang === 'EN' ? 'Registering...' : 'पंजीकरण हो रहा है...',
      success: lang === 'EN' ? 'Registration Successful!' : 'पंजीकरण सफल!',
      error: lang === 'EN' ? 'Registration Failed' : 'पंजीकरण विफल'
    });
  }, [formData, selectedGames, lang, players, registerMutation]);

  const handleGameToggle = useCallback((gameId: string) => {
    setSelectedGames(prev => {
      if (prev.includes(gameId)) return prev.filter(id => id !== gameId);
      
      const hasMarathon = prev.includes('marathon') || gameId === 'marathon';
      const maxAllowed = hasMarathon ? 3 : 2;
      
      if (prev.length >= maxAllowed) {
        toast.warning(hasMarathon ? t('max2Games', lang) + ' (+ Marathon)' : t('max2Games', lang));
        return prev;
      }
      return [...prev, gameId];
    });
  }, [lang]);

  const resetForm = useCallback(() => {
    setFormData({ name: '', phone: '', tower: '', flat: '', age: '', gender: '', maritalStatus: '' });
    setSelectedGames([]);
    setLastReg(null);
    setPage('event');
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar
        lang={lang}
        setLang={setLang}
        page={page}
        setPage={setPage}
      />

      <main className="max-w-3xl mx-auto px-4 pb-24 pt-4">
        <AnimatePresence mode="wait">
          {page === 'event' && (
            <motion.div key="event" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <EventHome lang={lang} setPage={setPage} />
            </motion.div>
          )}
          {page === 'home' && (
            <motion.div key="home" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <HomeForm lang={lang} formData={formData} setFormData={setFormData} onNext={handleFormNext} />
            </motion.div>
          )}
          {page === 'games-select' && (
            <motion.div key="games" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <GameSelection
                lang={lang}
                formData={formData}
                eligibleGames={eligibleGames}
                selectedGames={selectedGames}
                onToggle={handleGameToggle}
                onRegister={handleRegister}
                onBack={() => setPage('home')}
              />
            </motion.div>
          )}
          {page === 'success' && lastReg && (
            <motion.div key="success" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}>
              <Confirmation lang={lang} formData={formData} selectedGames={selectedGames} regId={lastReg.id} customGames={customGames} onReset={resetForm} />
            </motion.div>
          )}
          {page === 'games-detail' && (
            <motion.div key="games-detail" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <GamesDetail lang={lang} disabledGames={disabledGames} customGames={customGames} />
            </motion.div>
          )}
          {page === 'admin-login' && (
            <motion.div key="admin-login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AdminLogin lang={lang} onSuccess={() => setPage('admin-dash')} />
            </motion.div>
          )}
          {page === 'admin-dash' && (
            <motion.div key="admin-dash" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <AdminDashboard lang={lang} onLogout={() => setPage('event')} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Hidden admin trigger */}
      {page !== 'admin-login' && page !== 'admin-dash' && (
        <footer className="p-8 text-center opacity-10 hover:opacity-30 transition-opacity">
          <button onClick={() => setPage('admin-login')} className="text-xs text-muted-foreground">
            Admin Access
          </button>
        </footer>
      )}
    </div>
  );
};

export default Index;
