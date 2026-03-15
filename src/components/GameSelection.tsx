import { t, type Lang } from '@/lib/translations';
import type { FormData } from '@/pages/Index';
import type { Game } from '@/lib/gamesData';

interface GameSelectionProps {
  lang: Lang;
  formData: FormData;
  eligibleGames: Game[];
  selectedGames: string[];
  onToggle: (id: string) => void;
  onRegister: () => void;
  onBack: () => void;
}

export default function GameSelection({ lang, formData, eligibleGames, selectedGames, onToggle, onRegister, onBack }: GameSelectionProps) {
  return (
    <div className="space-y-5 py-4">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl md:text-3xl font-black">{t('chooseGames', lang)}</h2>
          <p className="text-muted-foreground text-sm">
            {t('hiUser', lang)} {formData.name}! {t('selectGamesMsg', lang)}
          </p>
        </div>
        <button onClick={onBack} className="text-primary font-bold text-xs underline underline-offset-4 shrink-0">
          {t('editDetails', lang)}
        </button>
      </div>

      {eligibleGames.length === 0 ? (
        <div className="bg-card rounded-2xl p-8 text-center border border-border shadow-md">
          <span className="text-4xl block mb-3">😕</span>
          <p className="font-bold text-muted-foreground">
            {lang === 'EN' ? 'No eligible games found for your profile' : 'आपकी प्रोफ़ाइल के लिए कोई पात्र खेल नहीं मिला'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {eligibleGames.map(game => {
            const isSelected = selectedGames.includes(game.id);
            return (
              <button
                key={game.id}
                onClick={() => onToggle(game.id)}
                className={`relative flex flex-col items-center p-4 rounded-3xl border-2 transition-all text-center ${
                  isSelected
                    ? 'border-primary bg-card shadow-lg scale-[1.02]'
                    : 'border-transparent bg-card/60 hover:bg-card hover:shadow-md'
                }`}
              >
                <span className="text-4xl mb-2">{game.emoji}</span>
                <span className="font-bold text-sm leading-tight">{lang === 'EN' ? game.nameEn : game.nameHi}</span>
                <span className="text-[10px] text-muted-foreground mt-1">{lang === 'EN' ? game.description : game.descriptionHi}</span>
                {isSelected && (
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M20 6L9 17l-5-5" /></svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      <button
        disabled={selectedGames.length === 0}
        onClick={onRegister}
        className={`w-full py-4 rounded-2xl font-extrabold text-lg transition-all ${
          selectedGames.length > 0
            ? 'bg-success text-success-foreground shadow-lg active:scale-[0.98]'
            : 'bg-border text-muted-foreground cursor-not-allowed'
        }`}
      >
        {t('registerNowBtn', lang)}
      </button>
    </div>
  );
}
