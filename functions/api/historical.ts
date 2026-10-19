import { HISTORICAL_TRADES } from '../../src/data/historicalTrades';

interface Env {
  DB?: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const q = (url.searchParams.get('q') || '').toLowerCase().trim();
  const era = url.searchParams.get('era') || 'ALL';
  const id = url.searchParams.get('id');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10), 100);
  const page = Math.max(parseInt(url.searchParams.get('page') || '1', 10), 1);
  const offset = (page - 1) * limit;

  try {
    const db = context.env.DB;
    if (db) {
      if (id) {
        const stmt = db.prepare('SELECT * FROM historical_trades WHERE id = ?').bind(id);
        const result = await stmt.first();
        if (result) {
          return new Response(JSON.stringify(formatRow(result)), {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          });
        }
      } else {
        let whereClauses = [];
        let params: any[] = [];

        if (era !== 'ALL') {
          whereClauses.push('season_era LIKE ?');
          params.push(`%${era}%`);
        }

        if (q) {
          whereClauses.push('(title LIKE ? OR description LIKE ? OR team_a LIKE ? OR team_b LIKE ?)');
          const wildcard = `%${q}%`;
          params.push(wildcard, wildcard, wildcard, wildcard);
        }

        const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
        const countQuery = `SELECT COUNT(*) as total FROM historical_trades ${whereSql}`;
        const countRes = await db.prepare(countQuery).bind(...params).first<{ total: number }>();
        const total = countRes?.total ?? 0;

        const listQuery = `SELECT * FROM historical_trades ${whereSql} ORDER BY date DESC LIMIT ? OFFSET ?`;
        const listRes = await db.prepare(listQuery).bind(...params, limit, offset).all();

        return new Response(
          JSON.stringify({
            total,
            page,
            limit,
            trades: (listRes.results || []).map(formatRow),
          }),
          {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          }
        );
      }
    }
  } catch (err: any) {
    console.warn('[API /historical] D1 query failed, falling back to bundled dataset:', err.message);
  }

  // Fallback to static data
  let filtered = HISTORICAL_TRADES;
  if (id) {
    const found = filtered.find((t) => t.id === id);
    return new Response(JSON.stringify(found || null), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  if (era !== 'ALL') {
    filtered = filtered.filter((t) => t.seasonEra.includes(era));
  }
  if (q) {
    filtered = filtered.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.headline.toLowerCase().includes(q) ||
        t.teamA.teamName.toLowerCase().includes(q) ||
        t.teamB.teamName.toLowerCase().includes(q)
    );
  }

  const paginated = filtered.slice(offset, offset + limit);
  return new Response(
    JSON.stringify({
      total: filtered.length,
      page,
      limit,
      trades: paginated,
    }),
    {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    }
  );
};

function formatRow(row: any) {
  return {
    id: row.id,
    tradeDate: row.date,
    seasonEra: row.season_era,
    title: row.title,
    headline: row.description,
    summary: row.trade_tree_description,
    teamA: typeof row.team_a === 'string' ? JSON.parse(row.team_a) : row.team_a,
    teamB: typeof row.team_b === 'string' ? JSON.parse(row.team_b) : row.team_b,
    snapshotContext: typeof row.initial_perspective === 'string' ? JSON.parse(row.initial_perspective) : row.initial_perspective,
    historicalOutcome: typeof row.historical_outcome === 'string' ? JSON.parse(row.historical_outcome) : row.historical_outcome,
  };
}
