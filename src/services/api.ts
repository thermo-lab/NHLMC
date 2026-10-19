import { NHLTeam } from '../types/franchise';
import { Player } from '../types/player';
import { NHLProspect } from '../types/prospect';
import { NHL_FRANCHISES } from '../data/nhlFranchises';
import { INITIAL_PLAYERS } from '../data/sampleLeague';
import { INITIAL_PROSPECTS } from '../data/nhlProspects';

const CACHE_KEY_TEAMS = 'nhlmc_cached_teams_v1';
const CACHE_KEY_PLAYERS = 'nhlmc_cached_players_v1';
const CACHE_KEY_PROSPECTS = 'nhlmc_cached_prospects_v1';
const CACHE_KEY_TIME = 'nhlmc_cached_time_v1';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour cache

/**
 * Fetches all 32 NHL Franchises from Cloudflare D1 (/api/franchises)
 * Falls back seamlessly to local cache or bundled data if D1 is offline / initializing.
 */
export async function fetchFranchises(): Promise<NHLTeam[]> {
  try {
    const res = await fetch('/api/franchises');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        try {
          localStorage.setItem(CACHE_KEY_TEAMS, JSON.stringify(data));
          localStorage.setItem(CACHE_KEY_TIME, String(Date.now()));
        } catch {
          // Ignore localStorage quota errors
        }
        return data;
      }
    }
  } catch (err) {
    console.warn('[D1 API] /api/franchises unavailable, using local cache/fallback:', err);
  }

  // Check LocalStorage cache
  try {
    const cached = localStorage.getItem(CACHE_KEY_TEAMS);
    if (cached) return JSON.parse(cached);
  } catch {}

  return NHL_FRANCHISES;
}

/**
 * Fetches Active NHL Players from Cloudflare D1 (/api/players)
 */
export async function fetchPlayers(): Promise<Player[]> {
  try {
    const res = await fetch('/api/players');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        try {
          localStorage.setItem(CACHE_KEY_PLAYERS, JSON.stringify(data));
        } catch {}
        return data;
      }
    }
  } catch (err) {
    console.warn('[D1 API] /api/players unavailable, using local cache/fallback:', err);
  }

  try {
    const cached = localStorage.getItem(CACHE_KEY_PLAYERS);
    if (cached) return JSON.parse(cached);
  } catch {}

  return INITIAL_PLAYERS;
}

/**
 * Fetches Top Prospects from Cloudflare D1 (/api/prospects)
 */
export async function fetchProspects(): Promise<NHLProspect[]> {
  try {
    const res = await fetch('/api/prospects');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        try {
          localStorage.setItem(CACHE_KEY_PROSPECTS, JSON.stringify(data));
        } catch {}
        return data;
      }
    }
  } catch (err) {
    console.warn('[D1 API] /api/prospects unavailable, using local cache/fallback:', err);
  }

  try {
    const cached = localStorage.getItem(CACHE_KEY_PROSPECTS);
    if (cached) return JSON.parse(cached);
  } catch {}

  return INITIAL_PROSPECTS;
}

/**
 * Creates a new prospect in Cloudflare D1 via POST /api/prospects
 */
export async function saveProspectToD1(newProspect: NHLProspect): Promise<boolean> {
  try {
    const res = await fetch('/api/prospects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProspect),
    });
    return res.ok;
  } catch (err) {
    console.warn('[D1 API] Failed to persist custom prospect to D1:', err);
    return false;
  }
}
