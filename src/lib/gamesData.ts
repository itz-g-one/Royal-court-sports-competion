export interface Game {
  id: string;
  nameEn: string;
  nameHi: string;
  emoji: string;
  gender: 'Male' | 'Female' | 'Both';
  description: string;
  descriptionHi: string;
  minAge?: number;
  maxAge?: number;
}

export const REGISTRATION_AGE_OPTIONS = ['5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18-34', '35+'] as const;
export const ENTRY_GENDERS = ['Male', 'Female'] as const;

export type EntryGender = (typeof ENTRY_GENDERS)[number];

export interface GameEntryBlock {
  blockedGenders: EntryGender[];
  blockedAges: Record<EntryGender, string[]>;
}

export type GameEntryBlocks = Record<string, GameEntryBlock>;

export const GAMES_DB: Game[] = [
  { id: 'kho', nameEn: 'Kho-Kho', nameHi: 'खो-खो', emoji: '🏃‍♂️', gender: 'Both', description: '2 captains per team, ages 13-17', descriptionHi: 'प्रति टीम 2 कप्तान, उम्र 13-17' },
  { id: '100m', nameEn: '100m Race', nameHi: '100 मीटर दौड़', emoji: '⚡', gender: 'Both', description: '7 categories, ages 5-16', descriptionHi: '7 श्रेणियाँ, उम्र 5-16' },
  { id: 'longjump', nameEn: 'Long Jump', nameHi: 'लंबी कूद', emoji: '👟', gender: 'Both', description: 'Boys & Girls 11-16, Men 35+', descriptionHi: 'लड़के और लड़कियाँ 11-16, पुरुष 35+' },
  { id: 'cycle', nameEn: 'Slow Cycle Racing', nameHi: 'स्लो साइकिल रेसिंग', emoji: '🚲', gender: 'Male', description: 'Boys 8-17, feet on ground = DQ', descriptionHi: 'लड़के 8-17, पैर ज़मीन पर = अयोग्य' },
  { id: 'spoon', nameEn: 'Spoon & Lemon Race', nameHi: 'चम्मच और नींबू दौड़', emoji: '🍋', gender: 'Female', description: 'Girls 11+, married women eligible', descriptionHi: 'लड़कियाँ 11+, विवाहित महिलाएं पात्र' },
  { id: 'musical', nameEn: 'Musical Chair', nameHi: 'म्यूजिकल चेयर', emoji: '🪑', gender: 'Female', description: 'Married women 18+ only', descriptionHi: 'केवल विवाहित महिलाएं 18+' },
  { id: 'marathon', nameEn: 'Marathon', nameHi: 'मैराथन', emoji: '🏁', gender: 'Both', description: 'Men & Women 30+', descriptionHi: 'पुरुष और महिलाएं 30+' },
  { id: 'volleyball', nameEn: 'Volleyball', nameHi: 'वॉलीबॉल', emoji: '🏐', gender: 'Male', description: 'Captain select teams, ages 16+', descriptionHi: 'कप्तान द्वारा टीम चयन, उम्र 16+' },
  { id: 'badminton', nameEn: 'Badminton', nameHi: 'बैडमिंटन', emoji: '🏸', gender: 'Both', description: 'Junior 10-15, Open 16+', descriptionHi: 'जूनियर 10-15, ओपन 16+' },
  { id: 'chess', nameEn: 'Chess', nameHi: 'शतरंज', emoji: '♟️', gender: 'Both', description: 'Kids 8-14, Open 15+', descriptionHi: 'बच्चे 8-14, ओपन 15+' },
];

function parseAge(ageStr: string): number {
  if (ageStr === '18-34') return 25;
  if (ageStr === '35+') return 40;
  return Number.parseInt(ageStr, 10);
}

function isStandardGameEligible(gameId: string, age: number, gender: string, maritalStatus: string): boolean {
  if (gender === 'Male') {
    if (age >= 5 && age <= 7) return ['100m'].includes(gameId);
    if (age >= 8 && age <= 9) return ['100m', 'cycle', 'chess'].includes(gameId);
    if (age === 10) return ['100m', 'cycle', 'chess', 'badminton'].includes(gameId);
    if (age >= 11 && age <= 12) return ['100m', 'longjump', 'cycle', 'chess', 'badminton'].includes(gameId);
    if (age >= 13 && age <= 15) return ['100m', 'longjump', 'cycle', 'chess', 'badminton', 'kho'].includes(gameId);
    if (age === 16) return ['100m', 'longjump', 'cycle', 'chess', 'badminton', 'kho', 'volleyball'].includes(gameId);
    if (age === 17) return ['cycle', 'chess', 'badminton', 'kho', 'volleyball'].includes(gameId);
    if (age >= 18 && age < 30) return ['chess', 'badminton', 'volleyball'].includes(gameId);
    if (age >= 30 && age < 35) return ['chess', 'badminton', 'marathon', 'volleyball'].includes(gameId);
    if (age >= 35) return ['longjump', 'chess', 'badminton', 'marathon', 'volleyball'].includes(gameId);
  }

  if (gender === 'Female') {
    if (age >= 5 && age <= 7) return ['100m'].includes(gameId);
    if (age >= 8 && age <= 9) return ['100m', 'chess'].includes(gameId);
    if (age === 10) return ['100m', 'chess', 'badminton'].includes(gameId);
    if (age >= 11 && age <= 12) return ['100m', 'longjump', 'chess', 'spoon', 'badminton'].includes(gameId);
    if (age >= 13 && age <= 14) return ['100m', 'longjump', 'chess', 'spoon', 'badminton', 'kho'].includes(gameId);
    if (age >= 15 && age <= 16) {
      const eligible = ['100m', 'longjump', 'chess', 'badminton', 'kho'];
      if (maritalStatus !== 'Married') eligible.push('spoon');
      return eligible.includes(gameId);
    }
    if (age === 17) {
      const eligible = ['chess', 'badminton', 'kho'];
      if (maritalStatus !== 'Married') eligible.push('spoon');
      return eligible.includes(gameId);
    }
    if (age >= 18 && age < 30) {
      const eligible = ['chess', 'badminton'];
      if (maritalStatus === 'Married') {
        eligible.push('spoon', 'musical');
      } else {
        eligible.push('spoon');
      }
      return eligible.includes(gameId);
    }
    if (age >= 30) {
      const eligible = ['chess', 'badminton', 'marathon'];
      if (maritalStatus === 'Married') {
        eligible.push('spoon', 'musical');
      } else {
        eligible.push('spoon');
      }
      return eligible.includes(gameId);
    }
  }

  return false;
}

function isGameEligibleByBaseRules(game: Game, ageStr: string, gender: string, maritalStatus: string): boolean {
  const age = parseAge(ageStr);
  if (Number.isNaN(age)) return false;

  if (game.id.startsWith('custom_')) {
    if (game.gender !== 'Both' && game.gender !== gender) return false;
    if (game.minAge !== undefined && age < game.minAge) return false;
    if (game.maxAge !== undefined && age > game.maxAge) return false;
    return true;
  }

  return isStandardGameEligible(game.id, age, gender, maritalStatus);
}

export function getGameAllowedGenders(game: Game): EntryGender[] {
  if (game.gender === 'Both') return ['Male', 'Female'];
  if (game.gender === 'Male') return ['Male'];
  return ['Female'];
}

export function getGameAllowedAgeOptions(game: Game, gender: EntryGender): string[] {
  if (!getGameAllowedGenders(game).includes(gender)) return [];

  return REGISTRATION_AGE_OPTIONS.filter(ageOption => {
    const maritalStatuses = gender === 'Female' ? ['', 'Unmarried', 'Married'] : [''];
    return maritalStatuses.some(status => isGameEligibleByBaseRules(game, ageOption, gender, status));
  });
}

function isBlockedByAdmin(game: Game, ageStr: string, gender: string, entryBlocks?: GameEntryBlocks): boolean {
  if (gender !== 'Male' && gender !== 'Female') return false;

  const gameBlock = entryBlocks?.[game.id];
  if (!gameBlock) return false;
  if (gameBlock.blockedGenders.includes(gender)) return true;
  return gameBlock.blockedAges[gender].includes(ageStr);
}

export function getActiveGames(disabled: string[], custom: Game[] = []): Game[] {
  return [...GAMES_DB, ...custom].filter(g => !disabled.includes(g.id));
}

export function getEligibleGames(
  ageStr: string,
  gender: string,
  maritalStatus: string,
  disabled: string[],
  custom: Game[] = [],
  entryBlocks?: GameEntryBlocks,
): Game[] {
  if (!ageStr || !gender) return [];

  const activeGames = getActiveGames(disabled, custom);

  if (gender === 'Other') return activeGames;

  return activeGames.filter(game => isGameEligibleByBaseRules(game, ageStr, gender, maritalStatus) && !isBlockedByAdmin(game, ageStr, gender, entryBlocks));
}
