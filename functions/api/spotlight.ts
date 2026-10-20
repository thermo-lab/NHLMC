import { INITIAL_PLAYER_SPOTLIGHT } from '../../src/data/playerSpotlights';

interface Env {
  DB?: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB;
    const url = new URL(context.request.url);
    const shouldSync = url.searchParams.get('sync') === 'true' || url.searchParams.get('reset') === 'true';

    if (db) {
      // If sync/reset is requested, push the latest code definition into D1
      if (shouldSync) {
        await db.prepare(`
          INSERT INTO player_spotlights (
            id, player_id, player_name, current_team_id, current_team_name,
            position, jersey_number, age, cap_hit, contract_details,
            accolades, headshot_url, badge_text, headline,
            editorial_storyline, options, is_active, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
          ON CONFLICT(id) DO UPDATE SET
            player_name=excluded.player_name,
            headline=excluded.headline,
            editorial_storyline=excluded.editorial_storyline,
            options=excluded.options,
            updated_at=CURRENT_TIMESTAMP;
        `).bind(
          INITIAL_PLAYER_SPOTLIGHT.id,
          INITIAL_PLAYER_SPOTLIGHT.playerId,
          INITIAL_PLAYER_SPOTLIGHT.playerName,
          INITIAL_PLAYER_SPOTLIGHT.currentTeamId,
          INITIAL_PLAYER_SPOTLIGHT.currentTeamName,
          INITIAL_PLAYER_SPOTLIGHT.position,
          INITIAL_PLAYER_SPOTLIGHT.jerseyNumber,
          INITIAL_PLAYER_SPOTLIGHT.age,
          INITIAL_PLAYER_SPOTLIGHT.capHit,
          INITIAL_PLAYER_SPOTLIGHT.contractDetails,
          JSON.stringify(INITIAL_PLAYER_SPOTLIGHT.accolades),
          INITIAL_PLAYER_SPOTLIGHT.headshotUrl,
          INITIAL_PLAYER_SPOTLIGHT.badgeText,
          INITIAL_PLAYER_SPOTLIGHT.headline,
          INITIAL_PLAYER_SPOTLIGHT.editorialStoryline,
          JSON.stringify(INITIAL_PLAYER_SPOTLIGHT.options),
          INITIAL_PLAYER_SPOTLIGHT.isActive ? 1 : 0
        ).run();

        return new Response(JSON.stringify(INITIAL_PLAYER_SPOTLIGHT), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-store',
          },
        });
      }

      const query = `
        SELECT * FROM player_spotlights 
        WHERE is_active = 1 
        ORDER BY updated_at DESC 
        LIMIT 1
      `;
      const result = await db.prepare(query).first<any>();
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
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=10, stale-while-revalidate=30',
          },
        });
      }
    }
  } catch (err: any) {
    console.warn('[API /spotlight] D1 query failed or table missing, using bundled fallback:', err.message);
  }

  // Fallback to bundled data
  return new Response(JSON.stringify(INITIAL_PLAYER_SPOTLIGHT), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=10, stale-while-revalidate=30',
    },
  });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const req = context.request;
  const adminKey = req.headers.get('x-admin-key') || new URL(req.url).searchParams.get('adminKey');
  const configuredSecret = (context.env as any).ADMIN_SECRET || 'nhlmc-admin-2026';

  if (adminKey !== configuredSecret) {
    return new Response(JSON.stringify({ error: 'Unauthorized. Admin key required.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  const db = context.env.DB;
  if (!db) {
    return new Response(JSON.stringify({ error: 'Database not bound' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  try {
    const body = (await req.json()) as any;
    await db
      .prepare(`
        INSERT INTO player_spotlights (
          id, player_id, player_name, current_team_id, current_team_name,
          position, jersey_number, age, cap_hit, contract_details,
          accolades, headshot_url, badge_text, headline,
          editorial_storyline, options, is_active, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(id) DO UPDATE SET
          player_name=excluded.player_name,
          headline=excluded.headline,
          editorial_storyline=excluded.editorial_storyline,
          options=excluded.options,
          updated_at=CURRENT_TIMESTAMP;
      `)
      .bind(
        body.id,
        body.playerId,
        body.playerName,
        body.currentTeamId,
        body.currentTeamName,
        body.position,
        body.jerseyNumber,
        body.age,
        body.capHit,
        body.contractDetails,
        JSON.stringify(body.accolades),
        body.headshotUrl,
        body.badgeText,
        body.headline,
        body.editorialStoryline,
        JSON.stringify(body.options),
        body.isActive ? 1 : 0
      )
      .run();

    return new Response(JSON.stringify({ success: true, message: 'Spotlight saved to D1' }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
};
