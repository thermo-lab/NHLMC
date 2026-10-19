/**
 * D1 Seed Generator Script
 * Reads existing TypeScript/JSON data and produces a complete seed.sql file for Cloudflare D1.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_FILE = path.join(__dirname, '..', 'seed.sql');

async function main() {
  console.log('Generating seed.sql for Cloudflare D1...');

  // 1. Load data
  const { NHL_FRANCHISES } = await import('../src/data/nhlFranchises.ts');
  const playersRaw = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'nhlPlayers.json'), 'utf8'));
  const { INITIAL_PROSPECTS } = await import('../src/data/nhlProspects.ts');
  const { HISTORICAL_TRADES } = await import('../src/data/historicalTrades.ts');

  const statements = [];

  statements.push('-- Seed file generated automatically from NHLMC master data');
  statements.push('BEGIN TRANSACTION;');

  // Franchises
  for (const f of NHL_FRANCHISES) {
    const recordJson = JSON.stringify(f.record).replace(/'/g, "''");
    const rosterJson = JSON.stringify(f.rosterPlayerIds).replace(/'/g, "''");
    const name = f.name.replace(/'/g, "''");
    const commonName = (f.commonName ?? '').replace(/'/g, "''");

    statements.push(
      `INSERT INTO franchises (id, name, common_name, abbrev, conference, division, logo_url, contender_tier, xgf_per_60, xga_per_60, power_play_pct, penalty_kill_pct, goalie_gsax, active_payroll, cap_space, retained_payroll, record, roster_player_ids) ` +
      `VALUES ('${f.id}', '${name}', '${commonName}', '${f.abbrev}', '${f.conference}', '${f.division}', '${f.logoUrl}', '${f.contenderTier}', ${f.xgfPer60}, ${f.xgaPer60}, ${f.powerPlayPct}, ${f.penaltyKillPct}, ${f.goalieGsax}, ${f.activePayroll}, ${f.capSpace}, ${f.retainedPayroll}, '${recordJson}', '${rosterJson}') ` +
      `ON CONFLICT(id) DO UPDATE SET active_payroll=excluded.active_payroll, cap_space=excluded.cap_space, record=excluded.record;`
    );
  }

  // Players
  for (const p of playersRaw) {
    const name = p.name.replace(/'/g, "''");
    const positionsJson = JSON.stringify(p.positions).replace(/'/g, "''");
    const actualStatsJson = JSON.stringify(p.actualStats).replace(/'/g, "''");
    const projJson = JSON.stringify(p.projections).replace(/'/g, "''");

    statements.push(
      `INSERT INTO players (id, nhl_id, name, nhl_team, cap_hit, positions, primary_position, player_type, injury_status, headshot_url, actual_stats, projections) ` +
      `VALUES (${p.id}, ${p.nhlId ?? 'NULL'}, '${name}', '${p.nhlTeam}', ${p.capHit}, '${positionsJson}', '${p.primaryPosition}', '${p.playerType}', '${p.injuryStatus ?? 'ACTIVE'}', '${p.headshotUrl ?? ''}', '${actualStatsJson}', '${projJson}') ` +
      `ON CONFLICT(id) DO UPDATE SET actual_stats=excluded.actual_stats, projections=excluded.projections, injury_status=excluded.injury_status;`
    );
  }

  // Prospects
  for (const pr of INITIAL_PROSPECTS) {
    const name = pr.name.replace(/'/g, "''");
    const draftInfo = (pr.draftInfo ?? '').replace(/'/g, "''");
    const currentTeam = (pr.currentTeam ?? '').replace(/'/g, "''");
    const scoutSummary = (pr.scoutSummary ?? '').replace(/'/g, "''");

    statements.push(
      `INSERT INTO prospects (id, name, nhl_team, position, shoots_catches, age, height, weight, potential, draft_info, current_team, scout_summary, trade_value_score, is_custom) ` +
      `VALUES ('${pr.id}', '${name}', '${pr.nhlTeam}', '${pr.position}', '${pr.shootsCatches ?? 'R'}', ${pr.age}, '${pr.height}', ${pr.weight}, '${pr.potential}', '${draftInfo}', '${currentTeam}', '${scoutSummary}', ${pr.tradeValueScore}, 0) ` +
      `ON CONFLICT(id) DO UPDATE SET potential=excluded.potential, trade_value_score=excluded.trade_value_score, scout_summary=excluded.scout_summary;`
    );
  }

  // Historical Trades
  for (const ht of HISTORICAL_TRADES) {
    const title = (ht.title ?? '').replace(/'/g, "''");
    const headline = (ht.headline ?? '').replace(/'/g, "''");
    const summary = (ht.summary ?? '').replace(/'/g, "''");
    const teamAJson = JSON.stringify(ht.teamA).replace(/'/g, "''");
    const teamBJson = JSON.stringify(ht.teamB).replace(/'/g, "''");
    const snapJson = JSON.stringify(ht.snapshotContext).replace(/'/g, "''");
    const outcomeJson = JSON.stringify(ht.historicalOutcome).replace(/'/g, "''");

    statements.push(
      `INSERT INTO historical_trades (id, date, season_era, title, description, trade_tree_description, team_a, team_b, initial_perspective, historical_outcome) ` +
      `VALUES ('${ht.id}', '${ht.tradeDate}', '${ht.seasonEra}', '${title}', '${headline}', '${summary}', '${teamAJson}', '${teamBJson}', '${snapJson}', '${outcomeJson}') ` +
      `ON CONFLICT(id) DO UPDATE SET title=excluded.title, historical_outcome=excluded.historical_outcome;`
    );
  }

  statements.push('COMMIT;');

  fs.writeFileSync(OUTPUT_FILE, statements.join('\n'), 'utf8');
  console.log(`Successfully generated ${statements.length} SQL statements in ${OUTPUT_FILE}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
