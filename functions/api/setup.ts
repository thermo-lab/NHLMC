import { NHL_FRANCHISES } from '../../src/data/nhlFranchises';
import rawPlayers from '../../src/data/nhlPlayers.json';
import { INITIAL_PROSPECTS } from '../../src/data/nhlProspects';
import { HISTORICAL_TRADES } from '../../src/data/historicalTrades';
import { INITIAL_FEATURED_TRADES } from '../../src/data/featuredTrades';

interface Env {
  DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const startTime = Date.now();
  try {
    const db = context.env.DB;
    if (!db) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'D1 database binding "DB" is not bound in Cloudflare Pages. Please check Pages -> Settings -> Functions -> D1 Database Bindings.',
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        }
      );
    }

    // 1. Create Schema Tables (Drop first if re-initializing schema)
    const schemaStatements = [
      `DROP TABLE IF EXISTS sync_log;`,
      `DROP TABLE IF EXISTS featured_trades;`,
      `DROP TABLE IF EXISTS historical_trades;`,
      `DROP TABLE IF EXISTS prospects;`,
      `DROP TABLE IF EXISTS players;`,
      `DROP TABLE IF EXISTS franchises;`,
      `CREATE TABLE IF NOT EXISTS franchises (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        common_name TEXT,
        abbrev TEXT NOT NULL,
        conference TEXT NOT NULL,
        division TEXT NOT NULL,
        logo_url TEXT,
        contender_tier TEXT NOT NULL,
        xgf_per_60 REAL NOT NULL DEFAULT 3.0,
        xga_per_60 REAL NOT NULL DEFAULT 3.0,
        power_play_pct REAL DEFAULT 20.0,
        penalty_kill_pct REAL DEFAULT 80.0,
        goalie_gsax REAL DEFAULT 0.0,
        active_payroll INTEGER NOT NULL,
        cap_space INTEGER NOT NULL,
        retained_payroll INTEGER DEFAULT 0,
        record JSON,
        roster_player_ids JSON,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
      `CREATE TABLE IF NOT EXISTS players (
        id INTEGER PRIMARY KEY,
        nhl_id INTEGER,
        name TEXT NOT NULL,
        nhl_team TEXT,
        cap_hit INTEGER NOT NULL,
        positions JSON NOT NULL,
        primary_position TEXT NOT NULL,
        player_type TEXT NOT NULL,
        injury_status TEXT DEFAULT 'ACTIVE',
        headshot_url TEXT,
        actual_stats JSON,
        projections JSON,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
      `CREATE TABLE IF NOT EXISTS prospects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        nhl_team TEXT,
        position TEXT NOT NULL,
        shoots_catches TEXT DEFAULT 'R',
        age INTEGER,
        height TEXT,
        weight INTEGER,
        potential TEXT NOT NULL,
        draft_info TEXT,
        current_team TEXT,
        scout_summary TEXT,
        trade_value_score INTEGER NOT NULL,
        is_custom INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
      `CREATE TABLE IF NOT EXISTS historical_trades (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        season_era TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        trade_tree_description TEXT,
        team_a JSON NOT NULL,
        team_b JSON NOT NULL,
        initial_perspective JSON NOT NULL,
        historical_outcome JSON NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
      `CREATE TABLE IF NOT EXISTS featured_trades (
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
      );`,
      `CREATE TABLE IF NOT EXISTS sync_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        source TEXT NOT NULL,
        teams_updated INTEGER,
        players_updated INTEGER,
        status TEXT NOT NULL,
        execution_time_ms INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`,
      `CREATE INDEX IF NOT EXISTS idx_players_team ON players(nhl_team);`,
      `CREATE INDEX IF NOT EXISTS idx_players_nhl_id ON players(nhl_id);`,
      `CREATE INDEX IF NOT EXISTS idx_prospects_team ON prospects(nhl_team);`,
      `CREATE INDEX IF NOT EXISTS idx_featured_status ON featured_trades(status);`,
    ];

    for (const sql of schemaStatements) {
      await db.prepare(sql).run();
    }

    // 2. Prepare Franchises Statements
    const franchiseStmts: D1PreparedStatement[] = [];
    for (const f of NHL_FRANCHISES) {
      franchiseStmts.push(
        db
          .prepare(
            `INSERT INTO franchises (id, name, common_name, abbrev, conference, division, logo_url, contender_tier, xgf_per_60, xga_per_60, power_play_pct, penalty_kill_pct, goalie_gsax, active_payroll, cap_space, retained_payroll, record, roster_player_ids) ` +
            `VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ` +
            `ON CONFLICT(id) DO UPDATE SET active_payroll=excluded.active_payroll, cap_space=excluded.cap_space, record=excluded.record;`
          )
          .bind(
            f.id,
            f.name,
            f.commonName ?? '',
            f.abbrev,
            f.conference,
            f.division,
            f.logoUrl,
            f.contenderTier,
            f.xgfPer60,
            f.xgaPer60,
            f.powerPlayPct,
            f.penaltyKillPct,
            f.goalieGsax,
            f.activePayroll,
            f.capSpace,
            f.retainedPayroll ?? 0,
            JSON.stringify(f.record),
            JSON.stringify(f.rosterPlayerIds)
          )
      );
    }

    // 3. Prepare Players Statements
    const playersStmts: D1PreparedStatement[] = [];
    const playersList = rawPlayers as any[];
    for (const p of playersList) {
      playersStmts.push(
        db
          .prepare(
            `INSERT INTO players (id, nhl_id, name, nhl_team, cap_hit, positions, primary_position, player_type, injury_status, headshot_url, actual_stats, projections) ` +
            `VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ` +
            `ON CONFLICT(id) DO UPDATE SET actual_stats=excluded.actual_stats, projections=excluded.projections, injury_status=excluded.injury_status;`
          )
          .bind(
            p.id,
            p.nhlId ?? null,
            p.name,
            p.nhlTeam,
            p.capHit,
            JSON.stringify(p.positions),
            p.primaryPosition,
            p.playerType,
            p.injuryStatus ?? 'ACTIVE',
            p.headshotUrl ?? '',
            JSON.stringify(p.actualStats),
            JSON.stringify(p.projections)
          )
      );
    }

    // 4. Prepare Prospects Statements
    const prospectStmts: D1PreparedStatement[] = [];
    for (const pr of INITIAL_PROSPECTS) {
      prospectStmts.push(
        db
          .prepare(
            `INSERT INTO prospects (id, name, nhl_team, position, shoots_catches, age, height, weight, potential, draft_info, current_team, scout_summary, trade_value_score, is_custom) ` +
            `VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0) ` +
            `ON CONFLICT(id) DO UPDATE SET potential=excluded.potential, trade_value_score=excluded.trade_value_score, scout_summary=excluded.scout_summary;`
          )
          .bind(
            pr.id,
            pr.name,
            pr.nhlTeam,
            pr.position,
            pr.shootsCatches ?? 'R',
            pr.age,
            pr.height,
            pr.weight,
            pr.potential,
            pr.draftInfo ?? '',
            pr.currentTeam ?? '',
            pr.scoutSummary ?? '',
            pr.tradeValueScore
          )
      );
    }

    // 5. Prepare Historical Trades Statements
    const historyStmts: D1PreparedStatement[] = [];
    for (const ht of HISTORICAL_TRADES) {
      historyStmts.push(
        db
          .prepare(
            `INSERT INTO historical_trades (id, date, season_era, title, description, trade_tree_description, team_a, team_b, initial_perspective, historical_outcome) ` +
            `VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ` +
            `ON CONFLICT(id) DO UPDATE SET title=excluded.title, historical_outcome=excluded.historical_outcome;`
          )
          .bind(
            ht.id,
            ht.tradeDate,
            ht.seasonEra,
            ht.title ?? '',
            ht.headline ?? '',
            ht.summary ?? '',
            JSON.stringify(ht.teamA),
            JSON.stringify(ht.teamB),
            JSON.stringify(ht.snapshotContext),
            JSON.stringify(ht.historicalOutcome)
          )
      );
    }

    // 6. Prepare Featured Trades Statements
    const featuredStmts: D1PreparedStatement[] = [];
    for (const ft of INITIAL_FEATURED_TRADES) {
      featuredStmts.push(
        db
          .prepare(
            `INSERT INTO featured_trades (id, title, headline, description, trade_url_params, team_a_id, team_b_id, team_a_assets, team_b_assets, status, display_order, created_at) ` +
            `VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ` +
            `ON CONFLICT(id) DO UPDATE SET title=excluded.title, headline=excluded.headline, description=excluded.description, trade_url_params=excluded.trade_url_params;`
          )
          .bind(
            ft.id,
            ft.title,
            ft.headline ?? '',
            ft.description ?? '',
            ft.tradeUrlParams,
            ft.teamAId,
            ft.teamBId,
            JSON.stringify(ft.teamAAssets),
            JSON.stringify(ft.teamBAssets),
            ft.status,
            ft.displayOrder,
            ft.createdAt
          )
      );
    }

    // Execute in batches of 50 to stay within D1 batch limits
    const allStmts = [...franchiseStmts, ...playersStmts, ...prospectStmts, ...historyStmts, ...featuredStmts];
    const BATCH_SIZE = 50;
    for (let i = 0; i < allStmts.length; i += BATCH_SIZE) {
      const batch = allStmts.slice(i, i + BATCH_SIZE);
      await db.batch(batch);
    }

    const elapsed = Date.now() - startTime;

    // Log the setup event
    await db
      .prepare(
        'INSERT INTO sync_log (source, teams_updated, players_updated, status, execution_time_ms) VALUES (?, ?, ?, ?, ?)'
      )
      .bind('setup-seed', franchiseStmts.length, playersStmts.length, 'SUCCESS', elapsed)
      .run();

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Cloudflare D1 schema created and seeded successfully!',
        stats: {
          franchisesSeeded: franchiseStmts.length,
          playersSeeded: playersStmts.length,
          prospectsSeeded: prospectStmts.length,
          historicalTradesSeeded: historyStmts.length,
          featuredTradesSeeded: featuredStmts.length,
          totalStatementsExecuted: allStmts.length + schemaStatements.length,
          executionTimeMs: elapsed,
        },
      }),
      {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
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
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      }
    );
  }
};
