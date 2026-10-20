import { INITIAL_PLAYER_SPOTLIGHT } from '../../../src/data/playerSpotlights';

interface Env {
  DB: D1Database;
  ADMIN_SECRET?: string;
}

// Verification helper for Cloudflare One-Time PIN (Zero Trust) or Admin Key
function isAuthorized(context: EventContext<Env, any, any>): { authorized: boolean; email?: string } {
  const req = context.request;
  const cfEmail = req.headers.get('cf-access-authenticated-user-email');
  if (cfEmail) {
    return { authorized: true, email: cfEmail };
  }

  // Check admin token / pin fallback for dev or direct API access
  const adminKey = req.headers.get('x-admin-key') || new URL(req.url).searchParams.get('adminKey');
  const configuredSecret = context.env.ADMIN_SECRET || 'nhlmc-admin-2026';

  if (adminKey && adminKey === configuredSecret) {
    return { authorized: true, email: 'admin-token-holder' };
  }

  return { authorized: false };
}

async function ensureTable(db: D1Database) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS player_spotlights (
      id TEXT PRIMARY KEY,
      player_id INTEGER NOT NULL,
      player_name TEXT NOT NULL,
      current_team_id TEXT NOT NULL,
      current_team_name TEXT NOT NULL,
      position TEXT NOT NULL,
      jersey_number TEXT,
      age INTEGER,
      cap_hit INTEGER,
      contract_details TEXT,
      accolades JSON,
      headshot_url TEXT,
      badge_text TEXT,
      headline TEXT NOT NULL,
      editorial_storyline TEXT NOT NULL,
      options JSON NOT NULL,
      is_active INTEGER DEFAULT 1,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `).run();
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const auth = isAuthorized(context);
  if (!auth.authorized) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized. Cloudflare Access One-Time PIN or X-Admin-Key required.' }),
      { status: 401, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }

  try {
    const db = context.env.DB;
    if (!db) {
      return new Response(JSON.stringify(INITIAL_PLAYER_SPOTLIGHT), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    await ensureTable(db);
    const result = await db.prepare('SELECT * FROM player_spotlights WHERE is_active = 1 LIMIT 1').first<any>();
    if (result) {
      const formatted = {
        id: result.id,
        playerId: result.player_id,
        playerName: result.player_name,
        currentTeamId: result.current_team_id,
        currentTeamName: result.current_team_name,
        position: result.position,
        jerseyNumber: result.jersey_number,
        age: result.age,
        capHit: result.cap_hit,
        contractDetails: result.contract_details,
        accolades: typeof result.accolades === 'string' ? JSON.parse(result.accolades) : result.accolades,
        headshotUrl: result.headshot_url,
        badgeText: result.badge_text,
        headline: result.headline,
        editorialStoryline: result.editorial_storyline,
        options: typeof result.options === 'string' ? JSON.parse(result.options) : result.options,
        isActive: Boolean(result.is_active),
        updatedAt: result.updated_at,
      };
      return new Response(JSON.stringify(formatted), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }
  } catch (err: any) {
    console.error('Error fetching admin spotlight:', err);
  }

  return new Response(JSON.stringify(INITIAL_PLAYER_SPOTLIGHT), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const auth = isAuthorized(context);
  if (!auth.authorized) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized. Cloudflare Access One-Time PIN or X-Admin-Key required.' }),
      { status: 401, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }

  try {
    const db = context.env.DB;
    if (!db) {
      return new Response(JSON.stringify({ error: 'D1 database not bound' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    await ensureTable(db);
    const body: any = await context.request.json();
    if (!body || !body.headline || !body.options) {
      return new Response(JSON.stringify({ error: 'Invalid spotlight payload' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const id = body.id || `spotlight-${Date.now()}`;
    const now = new Date().toISOString();

    await db.prepare(`
      INSERT INTO player_spotlights (
        id, player_id, player_name, current_team_id, current_team_name,
        position, jersey_number, age, cap_hit, contract_details,
        accolades, headshot_url, badge_text, headline,
        editorial_storyline, options, is_active, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        player_id = excluded.player_id,
        player_name = excluded.player_name,
        current_team_id = excluded.current_team_id,
        current_team_name = excluded.current_team_name,
        position = excluded.position,
        jersey_number = excluded.jersey_number,
        age = excluded.age,
        cap_hit = excluded.cap_hit,
        contract_details = excluded.contract_details,
        accolades = excluded.accolades,
        headshot_url = excluded.headshot_url,
        badge_text = excluded.badge_text,
        headline = excluded.headline,
        editorial_storyline = excluded.editorial_storyline,
        options = excluded.options,
        is_active = excluded.is_active,
        updated_at = excluded.updated_at
    `).bind(
      id,
      body.playerId || 8476945,
      body.playerName || 'Connor Hellebuyck',
      body.currentTeamId || 'WPG',
      body.currentTeamName || 'Winnipeg Jets',
      body.position || 'G',
      body.jerseyNumber || '#37',
      body.age || 31,
      body.capHit || 8500000,
      body.contractDetails || '',
      JSON.stringify(body.accolades || []),
      body.headshotUrl || '',
      body.badgeText || 'Blockbuster Trade Spotlight',
      body.headline,
      body.editorialStoryline || '',
      JSON.stringify(body.options || []),
      body.isActive !== false ? 1 : 0,
      now
    ).run();

    return new Response(JSON.stringify({ success: true, id, message: 'Spotlight saved to Cloudflare D1' }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (err: any) {
    console.error('Error saving spotlight to D1:', err);
    return new Response(JSON.stringify({ error: err.message || 'Database error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
};
