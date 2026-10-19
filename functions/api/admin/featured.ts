import { INITIAL_FEATURED_TRADES } from '../../../src/data/featuredTrades';

interface Env {
  DB: D1Database;
  ADMIN_SECRET?: string;
}

// Verification helper for Cloudflare One-Time PIN (Zero Trust) or Admin Token
function isAuthorized(context: EventContext<Env, any, any>): { authorized: boolean; email?: string } {
  const req = context.request;
  const cfEmail = req.headers.get('cf-access-authenticated-user-email');
  if (cfEmail) {
    return { authorized: true, email: cfEmail };
  }

  // Also check admin token / pin fallback for dev or direct API access
  const adminKey = req.headers.get('x-admin-key') || new URL(req.url).searchParams.get('adminKey');
  const configuredSecret = context.env.ADMIN_SECRET || 'nhlmc-admin-2026';

  if (adminKey && adminKey === configuredSecret) {
    return { authorized: true, email: 'admin-token-holder' };
  }

  return { authorized: false };
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const auth = isAuthorized(context);
  if (!auth.authorized) {
    return new Response(
      JSON.stringify({
        error: 'Unauthorized. Cloudflare Access One-Time PIN or X-Admin-Key required.',
      }),
      { status: 401, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }

  try {
    const db = context.env.DB;
    if (!db) {
      return new Response(JSON.stringify(INITIAL_FEATURED_TRADES), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Ensure table exists
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS featured_trades (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        headline TEXT,
        description TEXT,
        trade_url_params TEXT NOT NULL,
        team_a_id TEXT NOT NULL,
        team_b_id TEXT NOT NULL,
        team_a_assets JSON NOT NULL,
        team_b_assets JSON NOT NULL,
        status TEXT DEFAULT 'PUBLISHED',
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `).run();

    const result = await db
      .prepare('SELECT * FROM featured_trades ORDER BY display_order ASC, created_at DESC')
      .all();

    const list = (result?.results || []).map((row: any) => ({
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

    return new Response(JSON.stringify(list), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const auth = isAuthorized(context);
  if (!auth.authorized) {
    return new Response(
      JSON.stringify({
        error: 'Unauthorized. Cloudflare Access One-Time PIN or X-Admin-Key required.',
      }),
      { status: 401, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }

  try {
    const db = context.env.DB;
    if (!db) {
      return new Response(JSON.stringify({ error: 'D1 database not bound' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const payload = (await context.request.json()) as any;
    const id = payload.id || `trade-${Date.now()}`;
    const title = payload.title || 'Untitled Trade Proposal';
    const headline = payload.headline || '';
    const description = payload.description || '';
    const tradeUrlParams = payload.tradeUrlParams || '';
    const teamAId = payload.teamAId || 'WPG';
    const teamBId = payload.teamBId || 'BUF';
    const teamAAssets = JSON.stringify(payload.teamAAssets || {});
    const teamBAssets = JSON.stringify(payload.teamBAssets || {});
    const status = payload.status || 'PUBLISHED';
    const displayOrder = typeof payload.displayOrder === 'number' ? payload.displayOrder : 0;

    // Ensure table exists
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS featured_trades (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        headline TEXT,
        description TEXT,
        trade_url_params TEXT NOT NULL,
        team_a_id TEXT NOT NULL,
        team_b_id TEXT NOT NULL,
        team_a_assets JSON NOT NULL,
        team_b_assets JSON NOT NULL,
        status TEXT DEFAULT 'PUBLISHED',
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `).run();

    await db
      .prepare(`
        INSERT INTO featured_trades (id, title, headline, description, trade_url_params, team_a_id, team_b_id, team_a_assets, team_b_assets, status, display_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          title=excluded.title,
          headline=excluded.headline,
          description=excluded.description,
          trade_url_params=excluded.trade_url_params,
          status=excluded.status,
          display_order=excluded.display_order,
          updated_at=CURRENT_TIMESTAMP;
      `)
      .bind(
        id,
        title,
        headline,
        description,
        tradeUrlParams,
        teamAId,
        teamBId,
        teamAAssets,
        teamBAssets,
        status,
        displayOrder
      )
      .run();

    return new Response(JSON.stringify({ success: true, id, message: 'Featured trade saved successfully!' }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const auth = isAuthorized(context);
  if (!auth.authorized) {
    return new Response(
      JSON.stringify({
        error: 'Unauthorized. Cloudflare Access One-Time PIN or X-Admin-Key required.',
      }),
      { status: 401, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }

  try {
    const db = context.env.DB;
    if (!db) {
      return new Response(JSON.stringify({ error: 'D1 database not bound' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const url = new URL(context.request.url);
    const id = url.searchParams.get('id');
    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing trade id parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    await db.prepare('DELETE FROM featured_trades WHERE id = ?').bind(id).run();

    return new Response(JSON.stringify({ success: true, message: `Trade ${id} deleted.` }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
};
