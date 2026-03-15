import { useState } from 'react';
import { t, type Lang } from '@/lib/translations';
import type { Page } from '@/pages/Index';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  lang: Lang;
  setLang: (l: Lang) => void;
  page: Page;
  setPage: (p: Page) => void;
}

export default function Navbar({ lang, setLang, page, setPage }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems: { key: Page; label: string }[] = [
    { key: 'event', label: t('home', lang) },
    { key: 'games-detail', label: t('games', lang) },
    { key: 'home', label: t('register', lang) },
  ];

  const handleNav = (p: Page) => {
    setPage(p);
    setMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border px-4 md:px-6 py-3">
      <div className="max-w-3xl mx-auto flex justify-between items-center">
        <button onClick={() => handleNav('event')} className="flex items-center gap-2">
          <span className="text-2xl">🏆</span>
          <span className="font-extrabold text-sm md:text-base tracking-tight">{t('siteTitle', lang)}</span>
        </button>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map(item => (
            <button
              key={item.key}
              onClick={() => handleNav(item.key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                page === item.key
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => setLang(lang === 'EN' ? 'HI' : 'EN')}
            className="ml-2 px-3 py-1.5 rounded-full text-xs font-bold border border-border bg-card shadow-sm active:scale-95 transition-transform"
          >
            {lang === 'EN' ? 'हिंदी' : 'English'}
          </button>
        </div>

        {/* Mobile */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setLang(lang === 'EN' ? 'HI' : 'EN')}
            className="px-2.5 py-1 rounded-full text-xs font-bold border border-border bg-card"
          >
            {lang === 'EN' ? 'हिंदी' : 'EN'}
          </button>
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-1.5">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden mt-2 pb-2 border-t border-border pt-2 space-y-1">
          {navItems.map(item => (
            <button
              key={item.key}
              onClick={() => handleNav(item.key)}
              className={`block w-full text-left px-4 py-2.5 rounded-lg text-sm font-bold transition-colors ${
                page === item.key
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}
