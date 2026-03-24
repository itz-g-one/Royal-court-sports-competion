import { createClient } from '@supabase/supabase-js';
import type { EntryGender, GameEntryBlock, GameEntryBlocks } from '@/lib/gamesData';

// IMPORTANT: The user must provide these in their .env.local file or Vercel Environment Variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Only create the client if the URL is provided, otherwise it throws an error and crashes the app
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null as any;

export interface Registration {
  id: string;
  name: string;
  phone: string;
  tower: string;
  flat: string;
  age: string;
  gender: string;
  maritalStatus: string;
  games: string[];
  timestamp: string;
}

const BLOCK_GENDER_PREFIX = 'block:gender:';
const BLOCK_AGE_PREFIX = 'block:age:';

function emptyGameEntryBlock(): GameEntryBlock {
  return {
    blockedGenders: [],
    blockedAges: {
      Male: [],
      Female: [],
    },
  };
}

function parseGameEntryBlocks(ids: string[]): GameEntryBlocks {
  const entryBlocks: GameEntryBlocks = {};

  ids.forEach(id => {
    if (id.startsWith(BLOCK_GENDER_PREFIX)) {
      const [, , gameId, gender] = id.split(':');
      if (!gameId || (gender !== 'Male' && gender !== 'Female')) return;
      const block = entryBlocks[gameId] || emptyGameEntryBlock();
      if (!block.blockedGenders.includes(gender)) block.blockedGenders.push(gender);
      entryBlocks[gameId] = block;
      return;
    }

    if (id.startsWith(BLOCK_AGE_PREFIX)) {
      const [, , gameId, gender, ...ageParts] = id.split(':');
      const age = ageParts.join(':');
      if (!gameId || (gender !== 'Male' && gender !== 'Female') || !age) return;
      const block = entryBlocks[gameId] || emptyGameEntryBlock();
      if (!block.blockedAges[gender].includes(age)) block.blockedAges[gender].push(age);
      entryBlocks[gameId] = block;
    }
  });

  return entryBlocks;
}

// --- Input Sanitization ---
function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .replace(/&/g, '&amp;')
    .trim();
}

function sanitizePhone(input: string): string {
  return input.replace(/\D/g, '').slice(0, 10);
}

export function sanitizeFormData(data: {
  name: string; phone: string; tower: string; flat: string;
  age: string; gender: string; maritalStatus: string;
}): typeof data {
  return {
    name: sanitizeString(data.name).slice(0, 100),
    phone: sanitizePhone(data.phone),
    tower: sanitizeString(data.tower).slice(0, 10),
    flat: sanitizeString(data.flat).slice(0, 20),
    age: sanitizeString(data.age).slice(0, 5),
    gender: ['Male', 'Female', 'Other'].includes(data.gender) ? data.gender : '',
    maritalStatus: ['Married', 'Unmarried', ''].includes(data.maritalStatus) ? data.maritalStatus : '',
  };
}

export function generateRegId(): string {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `RC2026-${rand}`;
}

// --- Async API Methods for React Query (Supabase version) ---

export async function fetchPlayers(): Promise<Registration[]> {
  if (!supabaseUrl) return []; // Graceful failure if no DB connected yet
  const { data, error } = await supabase.from('players').select('*');
  if (error) throw new Error(error.message);
  return data as Registration[];
}

export async function addPlayer(reg: Registration): Promise<Registration> {
  const { data, error } = await supabase.from('players').insert([reg]).select();
  if (error) throw new Error(error.message);
  return data[0];
}

export async function deletePlayer(id: string): Promise<void> {
  const { error } = await supabase.from('players').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function fetchGamesInfo(): Promise<{ customGames: any[], disabledGames: string[], entryBlocks: GameEntryBlocks }> {
  if (!supabaseUrl) return { customGames: [], disabledGames: [], entryBlocks: {} };
  
  const { data: cGames, error: cErr } = await supabase.from('custom_games').select('*');
  if (cErr) throw new Error(cErr.message);

  const { data: dGames, error: dErr } = await supabase.from('disabled_games').select('*');
  if (dErr) throw new Error(dErr.message);

  return {
    customGames: cGames || [],
    disabledGames: dGames ? dGames.map(d => d.id).filter((id: string) => !id.includes(':')) : [],
    entryBlocks: parseGameEntryBlocks(dGames ? dGames.map(d => d.id) : []),
  };
}

export async function toggleGameDisabledApi(gameId: string): Promise<string[]> {
  if (!supabaseUrl) return [];

  // Check if it exists
  const { data } = await supabase.from('disabled_games').select('id').eq('id', gameId).maybeSingle();
  
  if (data) {
    // Exists, so remove it
    await supabase.from('disabled_games').delete().eq('id', gameId);
  } else {
    // Insert it
    await supabase.from('disabled_games').insert([{ id: gameId }]);
  }
  
  // Return the new list
  const { data: list } = await supabase.from('disabled_games').select('id');
  return list ? list.map(l => l.id) : [];
}

export async function toggleGameEntryBlockApi(gameId: string, type: 'gender' | 'age', gender: EntryGender, age?: string): Promise<GameEntryBlocks> {
  if (!supabaseUrl) return {};

  const blockId = type === 'gender'
    ? `${BLOCK_GENDER_PREFIX}${gameId}:${gender}`
    : `${BLOCK_AGE_PREFIX}${gameId}:${gender}:${age}`;

  const { data } = await supabase.from('disabled_games').select('id').eq('id', blockId).maybeSingle();

  if (data) {
    await supabase.from('disabled_games').delete().eq('id', blockId);
  } else {
    await supabase.from('disabled_games').insert([{ id: blockId }]);
  }

  const { data: list } = await supabase.from('disabled_games').select('id');
  return parseGameEntryBlocks(list ? list.map(item => item.id) : []);
}

export async function addCustomGameApi(game: any): Promise<any[]> {
  const { error } = await supabase.from('custom_games').insert([game]);
  if (error) throw new Error(error.message);

  const { data } = await supabase.from('custom_games').select('*');
  return data || [];
}

// --- CSV Export ---
export function exportToCSV(registrations: Registration[]): void {
  const headers = ['Reg ID', 'Name', 'Age', 'Gender', 'Tower', 'Flat', 'Marital Status', 'Game 1', 'Game 2', 'Phone', 'Registered At'];
  const rows = registrations.map(r => [
    r.id, r.name, r.age, r.gender, r.tower, r.flat, r.maritalStatus || '-',
    r.games[0] || '-', r.games[1] || '-', r.phone, new Date(r.timestamp).toLocaleString()
  ]);

  const csvContent = [headers, ...rows].map(row =>
    row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
  ).join('\n');

  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Royal_Court_Sports_2026_Players_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
