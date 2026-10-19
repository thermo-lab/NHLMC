/**
 * Cloudflare Scheduled Worker (Cron)
 * Automatically fires every night at 4:00 AM EST (09:00 UTC)
 * Queries the official NHL API and updates standings and stats directly in Cloudflare D1.
 * 100% Free on Cloudflare Workers Free Tier.
 */

export interface Env {
  DB: D1Database;
}

export default {
  // Scheduled Cron Handler
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    const startTime = Date.now();
    console.log(`[NHLMC Cron] Starting nightly NHL data sync at ${new Date(event.scheduledTime).toISOString()}`);

    try {
      const res = await fetch('https://api-web.nhle.com/v1/standings/now', {
        headers: { 'User-Agent': 'NHLMC-Scheduled-Worker/1.0' },
      });

      if (!res.ok) {
        throw new Error(`NHL API responded with status ${res.status}`);
      }

      const data = (await res.json()) as any;
      let teamsUpdated = 0;

      if (data?.standings && env.DB) {
        for (const s of data.standings) {
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

          await env.DB
            .prepare('UPDATE franchises SET record = ?, updated_at = CURRENT_TIMESTAMP WHERE abbrev = ?')
            .bind(JSON.stringify(record), abbrev)
            .run();

          teamsUpdated++;
        }

        const elapsed = Date.now() - startTime;
        await env.DB
          .prepare(
            'INSERT INTO sync_log (source, teams_updated, players_updated, status, execution_time_ms) VALUES (?, ?, ?, ?, ?)'
          )
          .bind('cron:api-web.nhle.com', teamsUpdated, 0, 'SUCCESS', elapsed)
          .run();

        console.log(`[NHLMC Cron] Nightly sync finished successfully in ${elapsed}ms: ${teamsUpdated} teams updated.`);
      }
    } catch (err: any) {
      console.error(`[NHLMC Cron] Sync error:`, err.message);
      if (env.DB) {
        const elapsed = Date.now() - startTime;
        await env.DB
          .prepare(
            'INSERT INTO sync_log (source, teams_updated, players_updated, status, execution_time_ms) VALUES (?, ?, ?, ?, ?)'
          )
          .bind('cron:api-web.nhle.com', 0, 0, `FAILED: ${err.message}`, elapsed)
          .run();
      }
    }
  },

  // Fallback HTTP Handler (allows manual testing via web browser / curl)
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return new Response(JSON.stringify({
      message: 'NHLMC Cloudflare Cron Worker is active.',
      cronSchedule: '0 9 * * * (Every night at 4:00 AM EST)',
      status: 'HEALTHY'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
