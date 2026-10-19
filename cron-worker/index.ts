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
  // Scheduled Cron Handler (Runs at 09:00 UTC / 4:00 AM EST)
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    console.log(`[NHLMC Cron] Starting nightly sync at ${new Date(event.scheduledTime).toISOString()}`);
    try {
      // Call the authoritative Pages D1 sync endpoint
      const res = await fetch('https://nhlmc.pages.dev/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Cloudflare-Scheduled-Worker/1.0',
        },
      });
      const data = await res.json();
      console.log(`[NHLMC Cron] Nightly sync completed:`, data);
    } catch (err: any) {
      console.error(`[NHLMC Cron] Sync error:`, err.message);
    }
  },

  // Fallback HTTP Handler (allows manual testing via web browser or curl)
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      const res = await fetch('https://nhlmc.pages.dev/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Cloudflare-Cron-Worker-HTTP/1.0',
        },
      });
      const syncResult = await res.json();
      return new Response(
        JSON.stringify(
          {
            worker: 'nhlmc-nightly-cron',
            cronSchedule: '0 9 * * * (Every night at 4:00 AM EST)',
            status: 'ACTIVE',
            lastSyncResult: syncResult,
          },
          null,
          2
        ),
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
    } catch (err: any) {
      return new Response(
        JSON.stringify({ error: err.message, status: 'FAILED' }, null, 2),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  },
};
