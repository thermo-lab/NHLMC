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

    let query = 'SELECT * FROM prospects';
    let stmt;
    if (team) {
      query += ' WHERE nhl_team = ? ORDER BY trade_value_score DESC';
      stmt = db.prepare(query).bind(team.toUpperCase());
    } else {
      query += ' ORDER BY trade_value_score DESC';
      stmt = db.prepare(query);
    }

    const { results } = await stmt.all();

    const prospects = (results || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      nhlTeam: row.nhl_team,
      position: row.position,
      shootsCatches: row.shoots_catches,
      age: row.age,
      height: row.height,
      weight: row.weight,
      potential: row.potential,
      draftInfo: row.draft_info,
      currentTeam: row.current_team,
      scoutSummary: row.scout_summary,
      tradeValueScore: row.trade_value_score,
      isCustom: Boolean(row.is_custom),
    }));

    return new Response(JSON.stringify(prospects), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// POST: Add new prospect directly to D1
export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const db = context.env.DB;
    if (!db) {
      return new Response(JSON.stringify({ error: 'D1 binding DB not configured' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const newProspect = (await context.request.json()) as any;
    if (!newProspect.id || !newProspect.name || !newProspect.nhlTeam) {
      return new Response(JSON.stringify({ error: 'Missing required prospect fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await db
      .prepare(
        `INSERT INTO prospects (id, name, nhl_team, position, shoots_catches, age, height, weight, potential, draft_info, current_team, scout_summary, trade_value_score, is_custom) ` +
        `VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1) ` +
        `ON CONFLICT(id) DO UPDATE SET potential=excluded.potential, trade_value_score=excluded.trade_value_score, scout_summary=excluded.scout_summary`
      )
      .bind(
        newProspect.id,
        newProspect.name,
        newProspect.nhlTeam,
        newProspect.position || 'D',
        newProspect.shootsCatches || 'R',
        newProspect.age || 18,
        newProspect.height || "6'2\"",
        newProspect.weight || 200,
        newProspect.potential || 'ELITE',
        newProspect.draftInfo || 'Draft Prospect',
        newProspect.currentTeam || 'AHL / Juniors',
        newProspect.scoutSummary || '',
        newProspect.tradeValueScore || 65
      )
      .run();

    return new Response(JSON.stringify({ success: true, prospect: newProspect }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
