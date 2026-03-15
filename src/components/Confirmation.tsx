import { t, type Lang } from '@/lib/translations';
import type { FormData } from '@/pages/Index';
import { GAMES_DB } from '@/lib/gamesData';

interface ConfirmationProps {
  lang: Lang;
  formData: FormData;
  selectedGames: string[];
  regId: string;
  onReset: () => void;
}

export default function Confirmation({ lang, formData, selectedGames, regId, onReset }: ConfirmationProps) {
  const handleShare = async () => {
    const text = `🏆 I registered for Royal Court Sports 2026!\nID: ${regId}\nGames: ${selectedGames.map(id => GAMES_DB.find(g => g.id === id)?.nameEn).join(', ')}`;
    if (navigator.share) {
      try { await navigator.share({ title: 'Royal Court Sports 2026', text }); } catch {}
    } else {
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <div className="text-center space-y-6 py-8">
      <div className="text-6xl animate-bounce">🎊</div>
      <h2 className="text-3xl md:text-4xl font-black text-success">{t('registered', lang)}</h2>

      <div className="bg-card p-6 md:p-8 rounded-3xl shadow-lg border-t-4 border-secondary text-left space-y-4">
        <div className="flex justify-between items-start border-b border-dashed border-border pb-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t('regId', lang)}</p>
            <p className="text-xl font-black font-mono">#{regId}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t('towerFlat', lang)}</p>
            <p className="font-bold text-sm">{formData.tower} - {formData.flat}</p>
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{t('fullName', lang)}</p>
          <p className="font-bold">{formData.name}</p>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">{t('selectedGames', lang)}</p>
          <div className="flex flex-wrap gap-2">
            {selectedGames.map(id => {
              const g = GAMES_DB.find(x => x.id === id);
              return g ? (
                <span key={id} className="bg-background px-3 py-1 rounded-full border border-border font-bold text-xs">
                  {g.emoji} {lang === 'EN' ? g.nameEn : g.nameHi}
                </span>
              ) : null;
            })}
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">{t('noteRegNumber', lang)}</p>

      <div className="flex flex-col gap-3">
        <button onClick={handleShare} className="w-full bg-card border border-border text-foreground py-3 rounded-xl font-bold shadow-sm active:scale-[0.98] transition-transform">
          📤 {t('share', lang)}
        </button>
        <button onClick={onReset} className="w-full bg-foreground text-background py-3 rounded-xl font-bold active:scale-[0.98] transition-transform">
          {t('registerAnother', lang)}
        </button>
      </div>
    </div>
  );
}
