import { INITIAL_PLAYER_SPOTLIGHT } from '../../src/data/playerSpotlights';

interface Env {
  DB?: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB;
    if (db) {
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
            'Cache-Control': 'public, max-age=60',
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
      'Cache-Control': 'public, max-age=60',
    },
  });
};
