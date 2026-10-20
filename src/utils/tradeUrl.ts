import { Player } from '../types/player';
import { NHLProspect, DraftPick } from '../types/prospect';
import { NHL_FRANCHISES } from '../data/nhlFranchises';

export interface TradeUrlPayload {
  teamAId: string;
  teamBId: string;
  teamAPlayers: Player[];
  teamBPlayers: Player[];
  teamAProspects: NHLProspect[];
  teamBProspects: NHLProspect[];
  teamADraftPicks: DraftPick[];
  teamBDraftPicks: DraftPick[];
  retainSalary?: boolean;
  retentionPct?: number;
}

export interface DecodedTradeState {
  teamAId: string;
  teamBId: string;
  teamAPlayerIds: number[];
  teamBPlayerIds: number[];
  teamAProspectIds: string[];
  teamBProspectIds: string[];
  teamADraftPicks: DraftPick[];
  teamBDraftPicks: DraftPick[];
  retainSalary: boolean;
  retentionPct: number;
  isAutoSimulate: boolean;
  warnings: string[];
}

const VALID_FRANCHISE_IDS = new Set(NHL_FRANCHISES.map((f) => f.id));

/**
 * Encodes a trade scenario into a durable, versioned URL query string.
 * Example: v=1&tA=WPG&tB=BUF&pA=8476883,8477465&pB=8479420,8482149&prB=buf-radim-mrtka&dpB=buf-2027-rd1
 */
export function encodeTradeToUrl(trade: TradeUrlPayload): string {
  const params = new URLSearchParams();

  // Version 1 protocol
  params.set('v', '1');
  params.set('tA', trade.teamAId);
  params.set('tB', trade.teamBId);

  // Encode Team A players (use official immutable nhlId if available, fallback to id)
  if (trade.teamAPlayers.length > 0) {
    const ids = trade.teamAPlayers.map((p) => (p.nhlId ? p.nhlId : p.id));
    params.set('pA', ids.join(','));
  }

  // Encode Team B players
  if (trade.teamBPlayers.length > 0) {
    const ids = trade.teamBPlayers.map((p) => (p.nhlId ? p.nhlId : p.id));
    params.set('pB', ids.join(','));
  }

  // Encode Team A prospects
  if (trade.teamAProspects.length > 0) {
    const prIds = trade.teamAProspects.map((pr) => pr.id);
    params.set('prA', prIds.join(','));
  }

  // Encode Team B prospects
  if (trade.teamBProspects.length > 0) {
    const prIds = trade.teamBProspects.map((pr) => pr.id);
    params.set('prB', prIds.join(','));
  }

  // Encode Team A draft picks (e.g. wpg-2027-rd1)
  if (trade.teamADraftPicks.length > 0) {
    const dpIds = trade.teamADraftPicks.map((dp) => dp.id);
    params.set('dpA', dpIds.join(','));
  }

  // Encode Team B draft picks (e.g. buf-2027-rd1)
  if (trade.teamBDraftPicks.length > 0) {
    const dpIds = trade.teamBDraftPicks.map((dp) => dp.id);
    params.set('dpB', dpIds.join(','));
  }

  // Encode salary retention if enabled
  if (trade.retainSalary && trade.retentionPct) {
    const clamped = Math.max(1, Math.min(50, Math.round(trade.retentionPct)));
    params.set('ret', `${clamped}`);
  }

  return params.toString();
}

/**
 * Builds a full canonical shareable URL.
 */
export function buildShareableTradeUrl(trade: TradeUrlPayload, baseUrl?: string): string {
  const origin = baseUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://nhlmc.pages.dev');
  const query = encodeTradeToUrl(trade);
  return `${origin}/?${query}`;
}

/**
 * Parses and strictly sanitizes trade parameters from a URL or query string.
 * Protected against injection, prototype pollution, out-of-bounds numbers, and missing assets.
 */
export function decodeTradeFromUrl(
  queryStringOrUrl: string,
  allPlayers: Player[],
  allProspects: NHLProspect[]
): DecodedTradeState | null {
  if (!queryStringOrUrl) return null;

  try {
    let search = queryStringOrUrl;
    if (search.includes('?')) {
      search = search.substring(search.indexOf('?') + 1);
    }
    const params = new URLSearchParams(search);

    // Only proceed if at least tA or tB is present
    const rawTeamA = params.get('tA')?.toUpperCase().trim();
    const rawTeamB = params.get('tB')?.toUpperCase().trim();

    if (!rawTeamA && !rawTeamB) {
      return null;
    }

    const warnings: string[] = [];

    // 1. Validate Teams (Strict Whitelist against 32 NHL franchises)
    const teamAId = rawTeamA && VALID_FRANCHISE_IDS.has(rawTeamA) ? rawTeamA : 'WPG';
    let teamBId = rawTeamB && VALID_FRANCHISE_IDS.has(rawTeamB) ? rawTeamB : 'BUF';
    if (teamAId === teamBId) {
      teamBId = teamAId === 'BUF' ? 'WPG' : 'BUF';
    }

    // Index players by official nhlId and internal id for fast O(1) resolution
    const playersByNhlId = new Map<number, Player>();
    const playersById = new Map<number, Player>();
    for (const p of allPlayers) {
      if (p.nhlId) playersByNhlId.set(p.nhlId, p);
      playersById.set(p.id, p);
    }

    // Index prospects by lowercase id and name
    const prospectsById = new Map<string, NHLProspect>();
    for (const pr of allProspects) {
      prospectsById.set(pr.id.toLowerCase(), pr);
      prospectsById.set(pr.name.toLowerCase().replace(/[^a-z0-9]/g, '-'), pr);
    }

    // Helper to resolve player tokens (numbers)
    const parsePlayerTokens = (rawParam: string | null): number[] => {
      if (!rawParam) return [];
      const tokens = rawParam.split(',').map((s) => s.trim()).filter(Boolean);
      const matchedIds: number[] = [];

      for (const token of tokens) {
        const num = parseInt(token, 10);
        if (isNaN(num) || num <= 0) continue;

        // Try matching official NHL API ID first (immutable across seasons)
        let matched = playersByNhlId.get(num);
        if (!matched) {
          // Fallback to internal ID
          matched = playersById.get(num);
        }

        if (matched) {
          matchedIds.push(matched.id);
        } else {
          warnings.push(`Player with ID ${token} could not be resolved in the database.`);
        }
      }
      return Array.from(new Set(matchedIds));
    };

    // Helper to resolve prospect tokens
    const parseProspectTokens = (rawParam: string | null): string[] => {
      if (!rawParam) return [];
      const tokens = rawParam.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
      const matchedIds: string[] = [];

      for (const token of tokens) {
        // Direct ID match
        let matched = prospectsById.get(token);
        if (!matched) {
          // Fuzzy match on slug (e.g. "radim-mrtka-buf" -> "buf-radim-mrtka")
          for (const [key, pr] of prospectsById.entries()) {
            if (key.includes(token) || token.includes(key)) {
              matched = pr;
              break;
            }
          }
        }

        if (matched) {
          matchedIds.push(matched.id);
        } else {
          warnings.push(`Prospect "${token}" could not be resolved.`);
        }
      }
      return Array.from(new Set(matchedIds));
    };

    // Helper to resolve draft pick tokens (e.g. "buf-2027-rd1" or "2027-1-BUF")
    const parseDraftPickTokens = (rawParam: string | null, defaultTeam: string): DraftPick[] => {
      if (!rawParam) return [];
      const tokens = rawParam.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
      const picks: DraftPick[] = [];

      for (const token of tokens) {
        // Match standard format: "buf-2027-rd1" or "wpg-2026-rd2"
        const standardMatch = token.match(/^([a-z]{3})-(\d{4})-rd([1-3])$/i);
        // Match alternate format: "2027-1-buf"
        const altMatch = token.match(/^(\d{4})-([1-3])-([a-z]{3})$/i);

        let team = defaultTeam;
        let year = 2027;
        let round: 1 | 2 | 3 = 1;

        if (standardMatch) {
          team = standardMatch[1].toUpperCase();
          year = parseInt(standardMatch[2], 10);
          round = parseInt(standardMatch[3], 10) as 1 | 2 | 3;
        } else if (altMatch) {
          year = parseInt(altMatch[1], 10);
          round = parseInt(altMatch[2], 10) as 1 | 2 | 3;
          team = altMatch[3].toUpperCase();
        } else {
          continue;
        }

        // Allow historical and reasonable future window (2025..2035)
        if (year < 2025 || year > 2035) continue;
        if (!VALID_FRANCHISE_IDS.has(team)) team = defaultTeam;

        const baseValue = round === 1 ? 80 : round === 2 ? 48 : 28;
        picks.push({
          id: `${team.toLowerCase()}-${year}-rd${round}`,
          year,
          round,
          owningTeamId: team,
          originalTeamId: team,
          protection: round === 1 ? 'TOP_10_PROTECTED' : 'UNPROTECTED',
          tradeValueScore: baseValue,
        });
      }
      return picks;
    };

    // 2. Parse assets for Team A and Team B
    const teamAPlayerIds = parsePlayerTokens(params.get('pA'));
    const teamBPlayerIds = parsePlayerTokens(params.get('pB'));
    const teamAProspectIds = parseProspectTokens(params.get('prA'));
    const teamBProspectIds = parseProspectTokens(params.get('prB'));
    const teamADraftPicks = parseDraftPickTokens(params.get('dpA'), teamAId);
    const teamBDraftPicks = parseDraftPickTokens(params.get('dpB'), teamBId);

    // 3. Parse salary retention (clamped between 0 and 50)
    const rawRet = params.get('ret');
    let retainSalary = false;
    let retentionPct = 25;
    if (rawRet) {
      const parsedRet = parseInt(rawRet, 10);
      if (!isNaN(parsedRet) && parsedRet > 0) {
        retainSalary = true;
        retentionPct = Math.max(1, Math.min(50, parsedRet));
      }
    }

    const hasAnyAssets =
      teamAPlayerIds.length > 0 ||
      teamBPlayerIds.length > 0 ||
      teamAProspectIds.length > 0 ||
      teamBProspectIds.length > 0 ||
      teamADraftPicks.length > 0 ||
      teamBDraftPicks.length > 0;

    return {
      teamAId,
      teamBId,
      teamAPlayerIds,
      teamBPlayerIds,
      teamAProspectIds,
      teamBProspectIds,
      teamADraftPicks,
      teamBDraftPicks,
      retainSalary,
      retentionPct,
      isAutoSimulate: hasAnyAssets,
      warnings,
    };
  } catch (err) {
    console.warn('Failed to decode trade URL parameters:', err);
    return null;
  }
}
