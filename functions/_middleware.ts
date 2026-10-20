import { NHL_FRANCHISES } from '../src/data/nhlFranchises';
import { HISTORICAL_TRADES } from '../src/data/historicalTrades';

const BOT_UA_REGEX =
  /twitterbot|facebookexternalhit|linkedinbot|embedly|quora link preview|showyoubot|outbrain|pinterest\/0\.|bingpreview|slackbot|vkshare|w3c_validator|redditbot|applebot|whatsapp|flipboard|tumblr|bitlybot|skypeuripreview|nuzzel|discordbot|google page speed|qwantify|bitrix link preview|xing-content-crawler|telegrambot/i;

const FRANCHISE_MAP = new Map<string, string>();
for (const f of NHL_FRANCHISES) {
  FRANCHISE_MAP.set(f.id.toUpperCase(), f.name);
  FRANCHISE_MAP.set(f.abbrev.toUpperCase(), f.name);
}

export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  const userAgent = context.request.headers.get('user-agent') || '';

  // Skip API routes so /api/og and other endpoints pass straight through
  if (url.pathname.startsWith('/api/')) {
    return await context.next();
  }

  const isBot = BOT_UA_REGEX.test(userAgent);
  const hasTradeParams =
    url.searchParams.has('tA') ||
    url.searchParams.has('tB') ||
    url.searchParams.has('trade') ||
    url.searchParams.has('v') ||
    url.searchParams.has('id');

  // If this is a bot crawler visiting a trade URL or card path, serve rich OpenGraph HTML
  if (isBot && (hasTradeParams || url.pathname.startsWith('/cards'))) {
    const origin = url.origin;
    const ogImageUrl = `${origin}/api/og?${url.searchParams.toString()}`;

    let title = 'NHL Monte Carlo Trade Evaluator';
    let description = 'Simulate 82-game NHL regular seasons, cap impacts, and Stanley Cup playoff odds with Monte Carlo probabilistic modeling.';

    const tradeId = url.searchParams.get('trade') || url.searchParams.get('id');
    if (tradeId) {
      const match = HISTORICAL_TRADES.find((t) => t.id === tradeId);
      if (match) {
        title = `${match.title} | NHLMC Retrospective`;
        description = match.summary || match.headline || description;
      } else {
        title = 'Historical NHL Trade Retrospective | NHLMC';
      }
    } else if (url.searchParams.has('tA') || url.searchParams.has('tB')) {
      const tA = (url.searchParams.get('tA') || 'WPG').toUpperCase();
      const tB = (url.searchParams.get('tB') || 'BUF').toUpperCase();
      const teamAName = FRANCHISE_MAP.get(tA) || tA;
      const teamBName = FRANCHISE_MAP.get(tB) || tB;
      const customTitle = url.searchParams.get('title');

      title = customTitle
        ? `${decodeURIComponent(customTitle)} | NHLMC`
        : `${teamAName} & ${teamBName} Trade Proposal | NHLMC`;

      description = `Monte Carlo 82-game season simulation, $88.0M cap impact analysis, and Stanley Cup odds impact between the ${teamAName} and ${teamBName}.`;
    }

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- OpenGraph / Facebook / LinkedIn / Discord -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${escapeHtml(url.href)}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${escapeHtml(ogImageUrl)}">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">

  <!-- Twitter / X Cards -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@NHLTradeMachine">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${escapeHtml(ogImageUrl)}">

  <!-- Client-side fast redirect for humans that hit the bot link -->
  <meta http-equiv="refresh" content="0;url=${escapeHtml(url.href)}">
</head>
<body style="background:#080C14;color:#f8fafc;font-family:sans-serif;padding:2rem;">
  <h2>${escapeHtml(title)}</h2>
  <p>${escapeHtml(description)}</p>
  <p><a href="${escapeHtml(url.href)}" style="color:#38bdf8;">Click here to view interactive simulation</a></p>
</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }

  // Pass through to the SPA static Vite assets
  return await context.next();
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
