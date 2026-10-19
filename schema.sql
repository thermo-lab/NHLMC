-- NHLMC Cloudflare D1 Database Schema
-- Serverless relational SQLite schema for teams, players, prospects, and historical blockbusters

DROP TABLE IF EXISTS sync_log;
DROP TABLE IF EXISTS prospects;
DROP TABLE IF EXISTS players;
DROP TABLE IF EXISTS franchises;
DROP TABLE IF EXISTS historical_trades;

-- 1. NHL Franchises Table
CREATE TABLE IF NOT EXISTS franchises (
  id TEXT PRIMARY KEY,               -- e.g. 'EDM', 'FLA', 'VGK'
  name TEXT NOT NULL,
  common_name TEXT,
  abbrev TEXT NOT NULL,
  conference TEXT NOT NULL,
  division TEXT NOT NULL,
  logo_url TEXT,
  contender_tier TEXT NOT NULL,
  xgf_per_60 REAL NOT NULL DEFAULT 3.0,
  xga_per_60 REAL NOT NULL DEFAULT 3.0,
  power_play_pct REAL DEFAULT 20.0,
  penalty_kill_pct REAL DEFAULT 80.0,
  goalie_gsax REAL DEFAULT 0.0,
  active_payroll INTEGER NOT NULL,
  cap_space INTEGER NOT NULL,
  retained_payroll INTEGER DEFAULT 0,
  record JSON,                       -- { gamesPlayed, wins, losses, otLosses, points, goalsFor, goalsAgainst, goalDifferential, pointPctg }
  roster_player_ids JSON,            -- array of player IDs
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Active NHL Players Table
CREATE TABLE IF NOT EXISTS players (
  id INTEGER PRIMARY KEY,            -- Internal ID (1..807)
  nhl_id INTEGER UNIQUE,             -- Official NHL API ID (e.g. 8478402 for McDavid)
  name TEXT NOT NULL,
  nhl_team TEXT REFERENCES franchises(id),
  cap_hit INTEGER NOT NULL,
  positions JSON NOT NULL,           -- ['C', 'F', 'UTIL']
  primary_position TEXT NOT NULL,
  player_type TEXT NOT NULL,         -- 'skater' | 'goalie'
  injury_status TEXT DEFAULT 'ACTIVE', -- 'ACTIVE' | 'DTD' | 'IR' | 'LTIR'
  headshot_url TEXT,
  actual_stats JSON,                 -- skater or goalie current season stats
  projections JSON,                  -- ros projections and volatility standard deviations
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Top Prospects & Drafted Pipeline Table
CREATE TABLE IF NOT EXISTS prospects (
  id TEXT PRIMARY KEY,               -- e.g. 'buf-radim-mrtka', 'lak-carter-george'
  name TEXT NOT NULL,
  nhl_team TEXT REFERENCES franchises(id),
  position TEXT NOT NULL,
  shoots_catches TEXT DEFAULT 'R',
  age INTEGER,
  height TEXT,
  weight INTEGER,
  potential TEXT NOT NULL,           -- 'FRANCHISE_CORNERSTONE', 'ELITE', 'TOP_PAIR_TOP_LINE', etc.
  draft_info TEXT,
  current_team TEXT,
  scout_summary TEXT,
  trade_value_score INTEGER NOT NULL,
  is_custom INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Historical Blockbuster Trades Archive
CREATE TABLE IF NOT EXISTS historical_trades (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  season_era TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  trade_tree_description TEXT,
  team_a JSON NOT NULL,
  team_b JSON NOT NULL,
  initial_perspective JSON NOT NULL,
  historical_outcome JSON NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Automated Sync Log Table
CREATE TABLE IF NOT EXISTS sync_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source TEXT NOT NULL,              -- 'api-web.nhle.com'
  players_updated INTEGER,
  teams_updated INTEGER,
  status TEXT NOT NULL,              -- 'SUCCESS' | 'FAILED'
  execution_time_ms INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for lightning-fast edge reads
CREATE INDEX IF NOT EXISTS idx_players_team ON players(nhl_team);
CREATE INDEX IF NOT EXISTS idx_players_pos ON players(primary_position);
CREATE INDEX IF NOT EXISTS idx_prospects_team ON prospects(nhl_team);
CREATE INDEX IF NOT EXISTS idx_prospects_potential ON prospects(potential);
