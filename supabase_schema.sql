-- Run this script in your Supabase SQL Editor to create the necessary tables

-- 1. Create Players Table
CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  tower TEXT NOT NULL,
  flat TEXT NOT NULL,
  age TEXT NOT NULL,
  gender TEXT NOT NULL,
  "maritalStatus" TEXT,
  games JSONB NOT NULL DEFAULT '[]'::jsonb,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Custom Games Table
CREATE TABLE IF NOT EXISTS custom_games (
  id TEXT PRIMARY KEY,
  "nameEn" TEXT NOT NULL,
  "nameHi" TEXT NOT NULL,
  emoji TEXT NOT NULL,
  gender TEXT NOT NULL,
  description TEXT,
  "descriptionHi" TEXT,
  "minAge" INTEGER,
  "maxAge" INTEGER
);

-- 3. Create Disabled Games Table
-- We'll just store strings representing the game IDs that are disabled
CREATE TABLE IF NOT EXISTS disabled_games (
  id TEXT PRIMARY KEY
);

-- Disable Row Level Security (RLS) for public access
-- (Since this is a simple public registration app without user auth)
ALTER TABLE players DISABLE ROW LEVEL SECURITY;
ALTER TABLE custom_games DISABLE ROW LEVEL SECURITY;
ALTER TABLE disabled_games DISABLE ROW LEVEL SECURITY;
