import { INITIAL_FEATURED_TRADES } from '../../src/data/featuredTrades';

interface Env {
  DB?: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB;
    if (db) {
      // Try to query featured_trades from D1
      const query = `
        SELECT * FROM featured_trades 
        WHERE status = 'PUBLISHED' 
        ORDER BY display_order ASC, created_at DESC 
        LIMIT 20
      `;
      const result = await db.prepare(query).all();
      if (result && result.results && result.results.length > 0) {
        const formatted = result.results.map((row: any) => ({
          id: row.id,
          title: row.title,
          headline: row.headline,
          description: row.description,
          tradeUrlParams: row.trade_url_params,
          teamAId: row.team_a_id,
          teamBId: row.team_b_id,
          teamAAssets: typeof row.team_a_assets === 'string' ? JSON.parse(row.team_a_assets) : row.team_a_assets,
          teamBAssets: typeof row.team_b_assets === 'string' ? JSON.parse(row.team_b_assets) : row.team_b_assets,
          status: row.status,
          displayOrder: row.display_order,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        }));
        return new Response(JSON.stringify(formatted), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=60',
          },
        });
      }
    }
  } catch (err: any) {
    console.warn('[API /featured] D1 query failed or table missing, returning bundled fallback:', err.message);
  }

  // Graceful fallback to initial curated featured trades
  return new Response(JSON.stringify(INITIAL_FEATURED_TRADES), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=60',
    },
  });
};
