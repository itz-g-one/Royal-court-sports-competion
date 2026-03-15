import { getActiveGames, type Game } from '@/lib/gamesData';
import { t, type Lang } from '@/lib/translations';

interface GamesDetailProps {
  lang: Lang;
  disabledGames?: string[];
  customGames?: Game[];
}

const gameDetails: Record<string, { categories: string[]; categoriesHi: string[]; rules: string; rulesHi: string }> = {
  kho: { categories: ['Boys & Girls: 13-17 yrs'], categoriesHi: ['लड़के और लड़कियाँ: 13-17 वर्ष'], rules: '2 captains per team', rulesHi: 'प्रति टीम 2 कप्तान' },
  '100m': { categories: ['Boys+Girls: 5-7', 'Boys: 8-10, 11-13, 14-16', 'Girls: 8-10, 11-13, 14-16'], categoriesHi: ['लड़के+लड़कियाँ: 5-7', 'लड़के: 8-10, 11-13, 14-16', 'लड़कियाँ: 8-10, 11-13, 14-16'], rules: '7 categories total', rulesHi: 'कुल 7 श्रेणियाँ' },
  longjump: { categories: ['Boys: 11-13, 14-16', 'Men: 35+', 'Girls: 11-13, 14-16'], categoriesHi: ['लड़के: 11-13, 14-16', 'पुरुष: 35+', 'लड़कियाँ: 11-13, 14-16'], rules: 'Senior men category included', rulesHi: 'वरिष्ठ पुरुष श्रेणी शामिल' },
  cycle: { categories: ['Boys: 8-12', 'Boys: 13-17'], categoriesHi: ['लड़के: 8-12', 'लड़के: 13-17'], rules: 'Feet on ground = Disqualified', rulesHi: 'पैर ज़मीन पर = अयोग्य' },
  spoon: { categories: ['Girls: 11-14', 'Girls 15+ (Unmarried)', 'Married Women'], categoriesHi: ['लड़कियाँ: 11-14', 'लड़कियाँ 15+ (अविवाहित)', 'विवाहित महिलाएं'], rules: 'Marital status matters for eligibility', rulesHi: 'पात्रता के लिए वैवाहिक स्थिति महत्वपूर्ण' },
  musical: { categories: ['Married Women 18+'], categoriesHi: ['विवाहित महिलाएं 18+'], rules: 'QF: (T1+T2+T6) vs (T5+T7+T8+Plot) — 10 women each. Final: Group 1 vs Group 2', rulesHi: 'क्वार्टर फाइनल: (T1+T2+T6) vs (T5+T7+T8+प्लॉट) — प्रत्येक 10 महिलाएं' },
  marathon: { categories: ['Men 30+', 'Women 30+'], categoriesHi: ['पुरुष 30+', 'महिलाएं 30+'], rules: 'Route: 4 Bigha → 52 Bigha Hanuman Murti → back', rulesHi: 'रूट: 4 बीघा → 52 बीघा हनुमान मूर्ति → वापसी' },
  volleyball: { categories: ['Adult Men'], categoriesHi: ['वयस्क পুরুষ'], rules: 'Captain A: Mr. Sachin | Captain B: Mr. Rohtas (T6)', rulesHi: 'कप्तान A: श्री सचिन | कप्तान B: श्री रोहतास (T6)' },
  badminton: { categories: ['Junior Boys/Girls: 10-15', 'Open Men/Women: 16+'], categoriesHi: ['जूनियर लड़के/लड़कियाँ: 10-15', 'ओपन पुरुष/महिलाएं: 16+'], rules: 'Singles & Doubles available', rulesHi: 'सिंगल्स और डबल्स दोनों उपलब्ध' },
  chess: { categories: ['Kids: 8-14', 'Open: 15+'], categoriesHi: ['बच्चे: 8-14', 'ओपन: 15+'], rules: 'All ages welcome', rulesHi: 'सभी उम्र के लिए' },
};

const gameColors: Record<string, string> = {
  kho: 'border-t-primary', '100m': 'border-t-secondary', longjump: 'border-t-success',
  cycle: 'border-t-male', spoon: 'border-t-female', musical: 'border-t-female',
  marathon: 'border-t-foreground', volleyball: 'border-t-male', badminton: 'border-t-success', chess: 'border-t-secondary',
};

export default function GamesDetail({ lang, disabledGames = [], customGames = [] }: GamesDetailProps) {
  const allGames = getActiveGames(disabledGames, customGames);

  return (
    <div className="space-y-6 py-4">
      <h2 className="text-2xl md:text-3xl font-black">{lang === 'EN' ? '🎮 All Games Details' : '🎮 सभी खेलों का विवरण'}</h2>

      <div className="space-y-4">
        {allGames.map(game => {
          const details = gameDetails[game.id];
          return (
            <div key={game.id} className={`bg-card rounded-2xl shadow-md border border-border border-t-4 ${gameColors[game.id] || 'border-t-primary'} overflow-hidden`}>
              <div className="p-4 md:p-5">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{game.emoji}</span>
                  <div>
                    <h3 className="font-black text-base">{lang === 'EN' ? game.nameEn : game.nameHi}</h3>
                    <span className={`inline-block mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      game.gender === 'Male' ? 'bg-male/10 text-male' :
                      game.gender === 'Female' ? 'bg-female/10 text-female' :
                      'bg-both/10 text-both'
                    }`}>
                      {game.gender === 'Both' ? t('both', lang) : game.gender === 'Male' ? t('maleOnly', lang) : t('femaleOnly', lang)}
                    </span>
                  </div>
                </div>

                {details ? (
                  <>
                    <div className="mb-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                        {lang === 'EN' ? 'Age Categories' : 'आयु श्रेणियाँ'}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {(lang === 'EN' ? details.categories : details.categoriesHi).map((cat, i) => (
                          <span key={i} className="bg-background px-2.5 py-1 rounded-lg text-xs font-medium border border-border">{cat}</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      📌 {lang === 'EN' ? details.rules : details.rulesHi}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                      {lang === 'EN' ? 'Age Categories' : 'आयु श्रेणियाँ'}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      <span className="bg-background px-2.5 py-1 rounded-lg text-xs font-medium border border-border">
                        {game.minAge || 0} - {game.maxAge || '100+'} {lang === 'EN' ? 'yrs' : 'वर्ष'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      📌 {lang === 'EN' ? game.description : game.descriptionHi}
                    </p>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
