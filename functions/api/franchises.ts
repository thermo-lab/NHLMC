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

    const { results } = await db
      .prepare('SELECT * FROM franchises ORDER BY name ASC')
      .all();

    const franchises = (results || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      commonName: row.common_name,
      abbrev: row.abbrev,
      conference: row.conference,
      division: row.division,
      logoUrl: row.logo_url,
      contenderTier: row.contender_tier,
      xgfPer60: row.xgf_per_60,
      xgaPer60: row.xga_per_60,
      powerPlayPct: row.power_play_pct,
      penaltyKillPct: row.penalty_kill_pct,
      goalieGsax: row.goalie_gsax,
      activePayroll: row.active_payroll,
      capSpace: row.cap_space,
      retainedPayroll: row.retained_payroll,
      record: typeof row.record === 'string' ? JSON.parse(row.record) : row.record,
      rosterPlayerIds: typeof row.roster_player_ids === 'string' ? JSON.parse(row.roster_player_ids) : row.roster_player_ids,
    }));

    return new Response(JSON.stringify(franchises), {
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
