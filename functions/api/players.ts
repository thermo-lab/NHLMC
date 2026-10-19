interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB;
    if (!db) {
      return new Response(JSON.stringify({ error: 'D1 binding DB not configured' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(context.request.url);
    const team = url.searchParams.get('team');
    const pos = url.searchParams.get('pos');
    const search = url.searchParams.get('search');

    let query = 'SELECT * FROM players WHERE 1=1';
    const params: any[] = [];

    if (team) {
      query += ' AND nhl_team = ?';
      params.push(team.toUpperCase());
    }

    if (pos && pos !== 'ALL') {
      query += ' AND primary_position = ?';
      params.push(pos.toUpperCase());
    }

    if (search) {
      query += ' AND name LIKE ?';
      params.push(`%${search}%`);
    }

    query += ' ORDER BY id ASC';

    const stmt = params.length > 0 ? db.prepare(query).bind(...params) : db.prepare(query);
    const { results } = await stmt.all();

    const players = (results || []).map((row: any) => ({
      id: row.id,
      nhlId: row.nhl_id,
      name: row.name,
      nhlTeam: row.nhl_team,
      capHit: row.cap_hit,
      positions: typeof row.positions === 'string' ? JSON.parse(row.positions) : row.positions,
      primaryPosition: row.primary_position,
      playerType: row.player_type,
      injuryStatus: row.injury_status,
      headshotUrl: row.headshot_url,
      actualStats: typeof row.actual_stats === 'string' ? JSON.parse(row.actual_stats) : row.actual_stats,
      projections: typeof row.projections === 'string' ? JSON.parse(row.projections) : row.projections,
    }));

    return new Response(JSON.stringify(players), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=1800, s-maxage=3600',
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
