import { test } from 'node:test';
import assert from 'node:assert';
import { renderTradeCardPng } from '../src/utils/ogImageGenerator.ts';

test('OG Engine: Generates valid RFC 2083 PNG byte stream for Twitter/X cards', async () => {
  const t0 = performance.now();
  const pngBytes = await renderTradeCardPng({
    title: 'Edmonton & Calgary Blockbuster Trade',
    teamAName: 'Edmonton Oilers',
    teamAAbbrev: 'EDM',
    teamAAssets: ['Matthew Tkachuk', '2027 1st Rd Pick (FLA)'],
    teamAMetrics: '+4.2 PTS  |  +5.1% CUP ODDS',
    teamBName: 'Calgary Flames',
    teamBAbbrev: 'CGY',
    teamBAssets: ['Jonathan Huberdeau', 'MacKenzie Weegar'],
    teamBMetrics: '-1.8 PTS  |  +$5.2M CAP ROOM',
    verdict: 'WINNER: EDM',
  });
  const elapsed = performance.now() - t0;

  // 1. Verify PNG magic number signature [137, 80, 78, 71, 13, 10, 26, 10]
  assert.strictEqual(pngBytes[0], 137, 'PNG byte 0');
  assert.strictEqual(pngBytes[1], 80, 'PNG byte 1 (P)');
  assert.strictEqual(pngBytes[2], 78, 'PNG byte 2 (N)');
  assert.strictEqual(pngBytes[3], 71, 'PNG byte 3 (G)');
  assert.strictEqual(pngBytes[4], 13, 'PNG byte 4 (\r)');
  assert.strictEqual(pngBytes[5], 10, 'PNG byte 5 (\n)');
  assert.strictEqual(pngBytes[6], 26, 'PNG byte 6');
  assert.strictEqual(pngBytes[7], 10, 'PNG byte 7 (\n)');

  // 2. Verify IHDR chunk presence and 1200x630 dimensions
  // Bytes 8-11: chunk length (13)
  // Bytes 12-15: "IHDR"
  const chunkType = String.fromCharCode(pngBytes[12], pngBytes[13], pngBytes[14], pngBytes[15]);
  assert.strictEqual(chunkType, 'IHDR', 'First chunk is IHDR');

  const width = (pngBytes[16] << 24) | (pngBytes[17] << 16) | (pngBytes[18] << 8) | pngBytes[19];
  const height = (pngBytes[20] << 24) | (pngBytes[21] << 16) | (pngBytes[22] << 8) | pngBytes[23];
  assert.strictEqual(width, 1200, 'Image width is exactly 1200px');
  assert.strictEqual(height, 630, 'Image height is exactly 630px');

  // Bit depth 8, Color type 6 (RGBA)
  assert.strictEqual(pngBytes[24], 8, 'Bit depth is 8-bit per channel');
  assert.strictEqual(pngBytes[25], 6, 'Color type is 6 (Truecolor with alpha / RGBA)');

  // 3. Verify compact file size (must be under 50KB for blazing fast edge CDN delivery)
  assert.ok(pngBytes.length > 5000, `Image size (${pngBytes.length} bytes) is non-trivial`);
  assert.ok(pngBytes.length < 50000, `Image size (${pngBytes.length} bytes) is lightweight (<50KB)`);

  // 4. Verify speed (< 250ms on edge/CPU)
  assert.ok(elapsed < 250, `Generation elapsed time ${elapsed.toFixed(1)}ms < 250ms`);
});

test('OG Engine: Bot crawler User-Agent detection pattern', () => {
  const BOT_UA_REGEX =
    /twitterbot|facebookexternalhit|linkedinbot|embedly|quora link preview|showyoubot|outbrain|pinterest\/0\.|bingpreview|slackbot|vkshare|w3c_validator|redditbot|applebot|whatsapp|flipboard|tumblr|bitlybot|skypeuripreview|nuzzel|discordbot|google page speed|qwantify|bitrix link preview|xing-content-crawler|telegrambot/i;

  const validBots = [
    'Twitterbot/1.0',
    'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
    'Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)',
    'Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)',
    'LinkedInBot/1.0 (compatible; Mozilla/5.0; Apache-HttpClient +http://www.linkedin.com)',
    'TelegramBot (like TwitterBot)',
    'WhatsApp/2.21.12.21 A',
    'redditbot/1.0 (+https://www.reddit.com/feedback)',
  ];

  for (const bot of validBots) {
    assert.ok(BOT_UA_REGEX.test(bot), `Should match crawler UA: ${bot}`);
  }

  const humanBrowsers = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0',
  ];

  for (const human of humanBrowsers) {
    assert.strictEqual(BOT_UA_REGEX.test(human), false, `Should NOT match human UA: ${human}`);
  }
});
