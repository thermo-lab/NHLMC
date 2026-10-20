import { renderTradeCardPng, TradeCardData } from '../../src/utils/ogImageGenerator';
import { NHL_FRANCHISES } from '../../src/data/nhlFranchises';
import rawPlayers from '../../src/data/nhlPlayers.json';
import { INITIAL_PROSPECTS } from '../../src/data/nhlProspects';
import { HISTORICAL_TRADES } from '../../src/data/historicalTrades';

interface Env {
  DB?: D1Database;
}

// Build index maps for fast lookup
const PLAYERS_BY_ID = new Map<number, string>();
for (const p of rawPlayers as Array<{ id: number; nhlId?: number; name: string }>) {
  PLAYERS_BY_ID.set(p.id, p.name);
  if (p.nhlId) {
    PLAYERS_BY_ID.set(p.nhlId, p.name);
  }
}

const FRANCHISE_MAP = new Map<string, string>();
for (const f of NHL_FRANCHISES) {
  FRANCHISE_MAP.set(f.id.toUpperCase(), f.name);
  FRANCHISE_MAP.set(f.abbrev.toUpperCase(), f.name);
}

const PROSPECTS_MAP = new Map<string, string>();
for (const pr of INITIAL_PROSPECTS) {
  PROSPECTS_MAP.set(pr.id.toLowerCase(), pr.name);
}

function formatDraftPickToken(token: string): string {
  // Format tokens like 'buf-2027-rd1' or 'buf-2028-rd1-unprot' -> '2028 1st Rd (BUF [Unprot])'
  const parts = token.split('-');
  if (parts.length >= 3) {
    const team = parts[0].toUpperCase();
    const year = parts[1];
    const rd = parts[2].toLowerCase();
    const rdNum = rd.replace('rd', '');
    const suffix = rdNum === '1' ? 'st' : rdNum === '2' ? 'nd' : rdNum === '3' ? 'rd' : 'th';
    let prot = '';
    if (parts.includes('unprot')) prot = ' [Unprot]';
    else if (parts.includes('top5')) prot = ' [Top 5]';
    return `${year} ${rdNum}${suffix} Rd (${team}${prot})`;
  }
  return token.toUpperCase();
}

function resolveAssetNames(
  playerIdsStr: string | null,
  prospectIdsStr: string | null,
  draftPickIdsStr: string | null,
  retMap?: Map<number, number>
): string[] {
  const assets: string[] = [];

  // 1. Players
  if (playerIdsStr) {
    const tokens = playerIdsStr.split(',').map((s) => s.trim()).filter(Boolean);
    for (const token of tokens) {
      const num = parseInt(token, 10);
      const retPct = !isNaN(num) && retMap?.get(num);
      const retLabel = retPct ? ` (${retPct}% Ret)` : '';
      if (!isNaN(num) && PLAYERS_BY_ID.has(num)) {
        assets.push(`${PLAYERS_BY_ID.get(num)!}${retLabel}`);
      } else if (token) {
        if (isNaN(num)) {
          assets.push(`${decodeURIComponent(token)}${retLabel}`);
        } else {
          assets.push(`Player #${token}${retLabel}`);
        }
      }
    }
  }

  // 2. Prospects
  if (prospectIdsStr) {
    const tokens = prospectIdsStr.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
    for (const token of tokens) {
      if (PROSPECTS_MAP.has(token)) {
        assets.push(`${PROSPECTS_MAP.get(token)} (Prospect)`);
      } else {
        const readable = token.replace(/^[a-z]+-/, '').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        assets.push(`${readable} (Prospect)`);
      }
    }
  }

  // 3. Draft Picks
  if (draftPickIdsStr) {
    const tokens = draftPickIdsStr.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
    for (const token of tokens) {
      assets.push(formatDraftPickToken(token));
    }
  }

  return assets;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const tradeId = url.searchParams.get('trade') || url.searchParams.get('id');

  let cardData: TradeCardData;

  // 1. Historical Trade Preview Mode
  if (tradeId) {
    let historicalTrade: any = null;

    // Check D1 database first if available
    if (context.env.DB) {
      try {
        const row: any = await context.env.DB.prepare(
          'SELECT * FROM historical_trades WHERE id = ?'
        ).bind(tradeId).first();
        if (row) {
          historicalTrade = {
            id: row.id,
            title: row.title,
            tradeDate: row.date,
            seasonEra: row.season_era,
            teamA: typeof row.team_a === 'string' ? JSON.parse(row.team_a) : row.team_a,
            teamB: typeof row.team_b === 'string' ? JSON.parse(row.team_b) : row.team_b,
            retrospectiveVerdict: typeof row.retrospective_verdict === 'string'
              ? JSON.parse(row.retrospective_verdict)
              : row.retrospective_verdict,
          };
        }
      } catch (err) {
        console.warn('Error reading historical trade from D1:', err);
      }
    }

    // Fallback to static marquee trades
    if (!historicalTrade) {
      historicalTrade = HISTORICAL_TRADES.find((t) => t.id === tradeId);
    }

    if (historicalTrade) {
      const teamAName = historicalTrade.teamA?.teamName || historicalTrade.teamA?.name || 'Team A';
      const teamBName = historicalTrade.teamB?.teamName || historicalTrade.teamB?.name || 'Team B';

      // Assets Team A acquired
      const rawAssetsA = historicalTrade.teamA?.received || historicalTrade.teamA?.assetsReceived || [];
      const teamAAssets = rawAssetsA.map((a: any) =>
        typeof a === 'string' ? a : (a.futureNote ? `${a.name} (${a.futureNote})` : a.name)
      );

      // Assets Team B acquired
      const rawAssetsB = historicalTrade.teamB?.received || historicalTrade.teamB?.assetsReceived || [];
      const teamBAssets = rawAssetsB.map((a: any) =>
        typeof a === 'string' ? a : (a.futureNote ? `${a.name} (${a.futureNote})` : a.name)
      );

      const gradeA = historicalTrade.teamA?.retrospectiveGrade || historicalTrade.teamA?.snapshotGrade || 'B+';
      const gradeB = historicalTrade.teamB?.retrospectiveGrade || historicalTrade.teamB?.snapshotGrade || 'B';
      const winner = historicalTrade.retrospectiveVerdict?.winner;
      const verdict = winner ? (winner === 'EVEN' ? 'FAIR TRADE' : `WINNER: ${winner}`) : 'BLOCKBUSTER';

      cardData = {
        title: historicalTrade.title || `${teamAName} & ${teamBName} Trade`,
        teamAName,
        teamAAbbrev: historicalTrade.teamA?.teamAbbrev,
        teamAAssets: teamAAssets.length > 0 ? teamAAssets : ['Multiple Assets'],
        teamAMetrics: `GRADE: ${gradeA}  •  ${historicalTrade.seasonEra || 'NHL ARCHIVE'}`,
        teamBName,
        teamBAbbrev: historicalTrade.teamB?.teamAbbrev,
        teamBAssets: teamBAssets.length > 0 ? teamBAssets : ['Multiple Assets'],
        teamBMetrics: `GRADE: ${gradeB}  •  ${historicalTrade.tradeDate || 'HISTORICAL'}`,
        verdict,
      };
    } else {
      // Fallback if trade ID not found
      cardData = {
        title: 'NHL HISTORICAL TRADE ARCHIVE',
        teamAName: 'Team A',
        teamAAssets: ['Selected Assets'],
        teamBName: 'Team B',
        teamBAssets: ['Selected Assets'],
        verdict: 'ARCHIVED TRADE',
      };
    }
  } else {
    // 2. Custom Trade Proposal Mode
    const rawTeamA = (url.searchParams.get('tA') || 'WPG').toUpperCase();
    const rawTeamB = (url.searchParams.get('tB') || 'BUF').toUpperCase();

    const teamAName = FRANCHISE_MAP.get(rawTeamA) || rawTeamA;
    const teamBName = FRANCHISE_MAP.get(rawTeamB) || rawTeamB;

    const retMap = new Map<number, number>();
    const rawRets = url.searchParams.get('rets');
    if (rawRets) {
      for (const entry of rawRets.split(',')) {
        const [idStr, pctStr] = entry.split(':');
        const pId = parseInt(idStr, 10);
        const pPct = parseInt(pctStr, 10);
        if (!isNaN(pId) && !isNaN(pPct)) retMap.set(pId, pPct);
      }
    }
    const legacyRet = url.searchParams.get('ret');
    if (legacyRet && retMap.size === 0) {
      const pRet = parseInt(legacyRet, 10);
      const firstA = url.searchParams.get('pA')?.split(',')[0];
      if (firstA && !isNaN(pRet)) retMap.set(parseInt(firstA, 10), pRet);
    }

    // Team A receives assets sent by Team B (pB, prB, dpB)
    const teamAAssets = resolveAssetNames(
      url.searchParams.get('pB'),
      url.searchParams.get('prB'),
      url.searchParams.get('dpB'),
      retMap
    );

    // Team B receives assets sent by Team A (pA, prA, dpA)
    const teamBAssets = resolveAssetNames(
      url.searchParams.get('pA'),
      url.searchParams.get('prA'),
      url.searchParams.get('dpA'),
      retMap
    );

    const titleParam = url.searchParams.get('title');
    const defaultTitle = `${teamAName} & ${teamBName} Proposal`;
    const title = titleParam ? decodeURIComponent(titleParam) : defaultTitle;

    const teamAMetrics = url.searchParams.get('mA')
      ? decodeURIComponent(url.searchParams.get('mA')!)
      : '+3.4 PTS  |  +4.1% CUP ODDS';

    const teamBMetrics = url.searchParams.get('mB')
      ? decodeURIComponent(url.searchParams.get('mB')!)
      : '-1.2 PTS  |  +$6.5M CAP ROOM';

    const verdict = url.searchParams.get('verdict')
      ? decodeURIComponent(url.searchParams.get('verdict')!)
      : 'FAIR TRADE';

    cardData = {
      title,
      teamAName,
      teamAAbbrev: rawTeamA,
      teamAAssets: teamAAssets.length > 0 ? teamAAssets : ['Future Draft Assets'],
      teamAMetrics,
      teamBName,
      teamBAbbrev: rawTeamB,
      teamBAssets: teamBAssets.length > 0 ? teamBAssets : ['Future Draft Assets'],
      teamBMetrics,
      verdict,
    };
  }

  try {
    const pngBytes = await renderTradeCardPng(cardData);

    return new Response(pngBytes, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err: any) {
    return new Response(`Error rendering card image: ${err.message}`, {
      status: 500,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
};
