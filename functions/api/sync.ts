interface Env {
  DB: D1Database;
  SYNC_SECRET?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const startTime = Date.now();
  try {
    const db = context.env.DB;
    if (!db) {
      return new Response(JSON.stringify({ error: 'D1 binding DB not configured' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Optional secret check if configured
    const authHeader = context.request.headers.get('X-Sync-Secret');
    if (context.env.SYNC_SECRET && authHeader !== context.env.SYNC_SECRET) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Fetch live standings from NHL API
    const standingsRes = await fetch('https://api-web.nhle.com/v1/standings/now', {
      headers: { 'User-Agent': 'NHLMC-Cloudflare-D1-Sync/1.0' },
    });

    let teamsUpdated = 0;
    if (standingsRes.ok) {
      const standingsData = (await standingsRes.json()) as any;
      if (standingsData?.standings) {
        for (const s of standingsData.standings) {
          const abbrev = s.teamAbbrev?.default;
          if (!abbrev) continue;

          const record = {
            gamesPlayed: s.gamesPlayed ?? 0,
            wins: s.wins ?? 0,
            losses: s.losses ?? 0,
            otLosses: s.otLosses ?? 0,
            points: s.points ?? 0,
            goalsFor: s.goalFor ?? 0,
            goalsAgainst: s.goalAgainst ?? 0,
            goalDifferential: s.goalDifferential ?? 0,
            pointPctg: s.pointPctg ?? 0,
          };

          await db
            .prepare(
              'UPDATE franchises SET record = ?, updated_at = CURRENT_TIMESTAMP WHERE abbrev = ?'
            )
            .bind(JSON.stringify(record), abbrev)
            .run();

          teamsUpdated++;
        }
      }
    }

    const elapsed = Date.now() - startTime;

    // Log the sync event
    await db
      .prepare(
        'INSERT INTO sync_log (source, teams_updated, players_updated, status, execution_time_ms) VALUES (?, ?, ?, ?, ?)'
      )
      .bind('api-web.nhle.com', teamsUpdated, 0, 'SUCCESS', elapsed)
      .run();

    return new Response(
      JSON.stringify({
        success: true,
        teamsUpdated,
        executionTimeMs: elapsed,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (err: any) {
    const elapsed = Date.now() - startTime;
    return new Response(
      JSON.stringify({
        success: false,
        error: err.message,
        executionTimeMs: elapsed,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB;
    if (!db) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'D1 database binding "DB" is not bound',
        }),
        {
          status: 503,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    const { results } = await db
      .prepare('SELECT * FROM sync_log ORDER BY created_at DESC LIMIT 10')
      .all();

    const latest = results && results.length > 0 ? results[0] : null;

    return new Response(
      JSON.stringify({
        success: true,
        lastSync: latest,
        history: results || [],
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: err.message,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
};
