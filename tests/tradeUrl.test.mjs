import { test } from 'node:test';
import assert from 'node:assert';
import { encodeTradeToUrl, decodeTradeFromUrl, buildShareableTradeUrl } from '../src/utils/tradeUrl.ts';

// Sample mock data with official NHL API IDs
const mockPlayers = [
  { id: 353, nhlId: 8476945, name: 'Connor Hellebuyck', nhlTeam: 'WPG', capHit: 8500000 },
  { id: 342, nhlId: 8480145, name: 'Neal Pionk', nhlTeam: 'WPG', capHit: 6500000 },
  { id: 358, nhlId: 8479420, name: 'Tage Thompson', nhlTeam: 'BUF', capHit: 7142857 },
  { id: 62, nhlId: 8482175, name: 'JJ Peterka', nhlTeam: 'BUF', capHit: 3500000 },
];

const mockProspects = [
  { id: 'buf-radim-mrtka', name: 'Radim Mrtka', nhlTeam: 'BUF', tradeValueScore: 88 },
  { id: 'lak-carter-george', name: 'Carter George', nhlTeam: 'LAK', tradeValueScore: 82 },
];

test('URL Engine: Encodes Winnipeg & Buffalo trade into durable URL query string', () => {
  const query = encodeTradeToUrl({
    teamAId: 'WPG',
    teamBId: 'BUF',
    teamAPlayers: [mockPlayers[0], mockPlayers[1]],
    teamBPlayers: [mockPlayers[2], mockPlayers[3]],
    teamAProspects: [],
    teamBProspects: [mockProspects[0]],
    teamADraftPicks: [],
    teamBDraftPicks: [
      {
        id: 'buf-2027-rd1',
        year: 2027,
        round: 1,
        owningTeamId: 'BUF',
        originalTeamId: 'BUF',
        protection: 'TOP_10_PROTECTED',
        tradeValueScore: 80,
      },
    ],
    retainSalary: true,
    retentionPct: 25,
  });

  assert.ok(query.includes('v=1'), 'Includes protocol version 1');
  assert.ok(query.includes('tA=WPG'), 'Includes team A WPG');
  assert.ok(query.includes('tB=BUF'), 'Includes team B BUF');
  assert.ok(query.includes('pA=8476945%2C8480145') || query.includes('pA=8476945,8480145'), 'Includes immutable NHL IDs for Team A');
  assert.ok(query.includes('pB=8479420%2C8482175') || query.includes('pB=8479420,8482175'), 'Includes immutable NHL IDs for Team B');
  assert.ok(query.includes('prB=buf-radim-mrtka'), 'Includes Radim Mrtka prospect ID');
  assert.ok(query.includes('dpB=buf-2027-rd1'), 'Includes 2027 Round 1 draft pick');
  assert.ok(query.includes('ret=25'), 'Includes salary retention');
});

test('URL Engine: Decodes durable URL back to exact trade state', () => {
  const url = 'https://nhlmc.pages.dev/?v=1&tA=WPG&tB=BUF&pA=8476945,8480145&pB=8479420,8482175&prB=buf-radim-mrtka&dpB=buf-2027-rd1&ret=25';
  const decoded = decodeTradeFromUrl(url, mockPlayers, mockProspects);

  assert.ok(decoded !== null, 'Decoded state should not be null');
  assert.strictEqual(decoded.teamAId, 'WPG');
  assert.strictEqual(decoded.teamBId, 'BUF');
  assert.deepStrictEqual(decoded.teamAPlayerIds, [353, 342], 'Resolves Hellebuyck and Pionk by NHL ID');
  assert.deepStrictEqual(decoded.teamBPlayerIds, [358, 62], 'Resolves Thompson and Peterka by NHL ID');
  assert.deepStrictEqual(decoded.teamBProspectIds, ['buf-radim-mrtka'], 'Resolves Radim Mrtka');
  assert.strictEqual(decoded.teamBDraftPicks.length, 1);
  assert.strictEqual(decoded.teamBDraftPicks[0].year, 2027);
  assert.strictEqual(decoded.teamBDraftPicks[0].round, 1);
  assert.strictEqual(decoded.retainSalary, true);
  assert.strictEqual(decoded.retentionPct, 25);
  assert.strictEqual(decoded.isAutoSimulate, true);
});

test('Anti-Exploitation: Sanitizes rogue teams, out-of-bounds numbers, and XSS attempts', () => {
  const maliciousUrl = 'https://nhlmc.pages.dev/?v=1&tA=<script>alert(1)</script>&tB=FAKE_TEAM&pA=-99,abc,999999999&ret=999999';
  const decoded = decodeTradeFromUrl(maliciousUrl, mockPlayers, mockProspects);

  assert.ok(decoded !== null);
  // Rogue teams fall back to safe official defaults
  assert.strictEqual(decoded.teamAId, 'WPG');
  assert.strictEqual(decoded.teamBId, 'BUF');
  // Invalid player numbers are cleanly discarded
  assert.deepStrictEqual(decoded.teamAPlayerIds, []);
  // Retention is clamped to max 50%
  assert.strictEqual(decoded.retentionPct, 50);
});
