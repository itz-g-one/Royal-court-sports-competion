import { t, type Lang } from '@/lib/translations';
import type { Page } from '@/pages/Index';
import { motion } from 'framer-motion';
import { getActiveGames, type Game } from '@/lib/gamesData';
import { Calendar, Info } from 'lucide-react';

interface EventHomeProps {
  lang: Lang;
  setPage: (p: Page) => void;
  customGames?: Game[];
}

const floatingEmojis = ['⚽', '🏸', '🏃‍♂️', '🏐', '♟️', '🚲', '🏁', '🍋'];

export default function EventHome({ lang, setPage, customGames = [] }: EventHomeProps) {
  const allGames = getActiveGames([], customGames);

  return (
    <div className="space-y-8 py-4">
      {/* Hero */}
      <section className="relative text-center py-10 md:py-16 overflow-hidden">
        {/* Floating emojis */}
        <div className="absolute inset-0 pointer-events-none">
          {floatingEmojis.map((emoji, i) => (
            <span
              key={i}
              className="absolute text-2xl md:text-3xl opacity-20 animate-float"
              style={{
                left: `${10 + (i * 11) % 80}%`,
                top: `${5 + (i * 17) % 70}%`,
                animationDelay: `${i * 0.4}s`,
                animationDuration: `${3 + (i % 3)}s`,
              }}
            >
              {emoji}
            </span>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          <span className="text-6xl md:text-7xl block mb-4">🏆</span>
          <h1 className="text-3xl md:text-5xl font-black text-primary leading-tight text-balance mb-3">
            {t('heroTitle', lang)}
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-md mx-auto mb-8">
            {t('heroSub', lang)}
          </p>

          {/* Registration Deadline Alert */}
          <div className="bg-destructive/10 border border-destructive/20 text-destructive-foreground rounded-2xl p-4 mb-8 max-w-sm mx-auto shadow-sm flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <Calendar size={20} className="text-destructive" />
              <span className="font-bold text-sm md:text-base text-destructive">
                {lang === 'EN' ? 'Important Target Dates' : 'महत्वपूर्ण लक्ष्य तिथियाँ'}
              </span>
            </div>
            <p className="text-xs md:text-sm font-semibold text-center text-foreground/80">
              {lang === 'EN' 
                ? 'Competition is on the 29th. You have to register until the 25th.'
                : 'प्रतियोगिता 29 तारीख को है। आपको 25 तारीख तक पंजीकरण करना होगा।'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => setPage('home')}
              className="px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-extrabold text-lg shadow-primary active:scale-[0.98] transition-transform"
            >
              {t('registerNow', lang)}
            </button>
            <button
              onClick={() => setPage('games-detail')}
              className="px-8 py-4 bg-card text-foreground rounded-2xl font-extrabold text-lg border border-border shadow-md active:scale-[0.98] transition-transform"
            >
              {t('viewGames', lang)}
            </button>
          </div>
        </motion.div>
      </section>

      {/* Announcement */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-secondary/10 border-2 border-secondary/30 rounded-3xl p-5 md:p-6"
      >
        <p className="text-sm md:text-base font-medium leading-relaxed">
          {t('announcement', lang)}
        </p>
      </motion.div>

      {/* Rules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {(['rule1', 'rule2', 'rule3'] as const).map((key, i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="bg-card p-4 rounded-2xl shadow-md border border-border"
          >
            <p className="text-sm font-semibold">{t(key, lang)}</p>
          </motion.div>
        ))}
      </div>

      {/* Games overview */}
      <section>
        <h2 className="text-2xl md:text-3xl font-black mb-4">
          {lang === 'EN' ? '🎮 All Games' : '🎮 सभी खेल'}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {allGames.map((game, i) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * i }}
              className="bg-card p-4 rounded-2xl shadow-md border border-border text-center hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer"
              onClick={() => setPage('games-detail')}
            >
              <span className="text-3xl block mb-2">{game.emoji}</span>
              <p className="font-bold text-sm">{lang === 'EN' ? game.nameEn : game.nameHi}</p>
              <span className={`inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                game.gender === 'Male' ? 'bg-male/10 text-male' :
                game.gender === 'Female' ? 'bg-female/10 text-female' :
                'bg-both/10 text-both'
              }`}>
                {game.gender === 'Both' ? t('both', lang) : game.gender === 'Male' ? t('maleOnly', lang) : t('femaleOnly', lang)}
              </span>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
