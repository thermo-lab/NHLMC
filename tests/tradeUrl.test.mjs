import { test } from 'node:test';
import assert from 'node:assert';
import { encodeTradeToUrl, decodeTradeFromUrl, buildShareableTradeUrl } from '../src/utils/tradeUrl.ts';

// Sample mock data with official NHL API IDs
const mockPlayers = [
  { id: 8476945, nhlId: 8476945, name: 'Connor Hellebuyck', nhlTeam: 'WPG', capHit: 8500000 },
  { id: 8480145, nhlId: 8480145, name: 'Neal Pionk', nhlTeam: 'WPG', capHit: 6500000 },
  { id: 8479420, nhlId: 8479420, name: 'Tage Thompson', nhlTeam: 'BUF', capHit: 7142857 },
  { id: 8482175, nhlId: 8482175, name: 'JJ Peterka', nhlTeam: 'BUF', capHit: 3500000 },
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
  assert.deepStrictEqual(decoded.teamAPlayerIds, [8476945, 8480145], 'Resolves Hellebuyck and Pionk by NHL ID');
  assert.deepStrictEqual(decoded.teamBPlayerIds, [8479420, 8482175], 'Resolves Thompson and Peterka by NHL ID');
  assert.deepStrictEqual(decoded.teamBProspectIds, ['buf-radim-mrtka'], 'Resolves Radim Mrtka');
  assert.strictEqual(decoded.teamBDraftPicks.length, 1);
  assert.strictEqual(decoded.teamBDraftPicks[0].year, 2027);
  assert.strictEqual(decoded.teamBDraftPicks[0].round, 1);
  assert.strictEqual(decoded.teamBDraftPicks[0].protection, 'TOP_10_PROTECTED');
  assert.strictEqual(decoded.retainSalary, true);
  assert.strictEqual(decoded.retentionPct, 25);
  assert.strictEqual(decoded.playerRetentions[8476945], 25, 'Maps retention to player ID');
  assert.strictEqual(decoded.isAutoSimulate, true);
});

test('URL Engine: Encodes and decodes custom pick protections and multi-player salary retentions', () => {
  const query = encodeTradeToUrl({
    teamAId: 'WPG',
    teamBId: 'BUF',
    teamAPlayers: [mockPlayers[0]],
    teamBPlayers: [mockPlayers[2]],
    teamAProspects: [],
    teamBProspects: [],
    teamADraftPicks: [
      {
        id: 'wpg-2028-rd1',
        year: 2028,
        round: 1,
        owningTeamId: 'WPG',
        originalTeamId: 'WPG',
        protection: 'UNPROTECTED',
        tradeValueScore: 88,
      },
      {
        id: 'wpg-2029-rd1',
        year: 2029,
        round: 1,
        owningTeamId: 'WPG',
        originalTeamId: 'WPG',
        protection: 'TOP_5_PROTECTED',
        tradeValueScore: 82,
      },
    ],
    teamBDraftPicks: [
      {
        id: 'buf-2028-rd1',
        year: 2028,
        round: 1,
        owningTeamId: 'BUF',
        originalTeamId: 'BUF',
        protection: 'TOP_10_PROTECTED',
        tradeValueScore: 76,
      },
    ],
    playerRetentions: {
      8476945: 50, // 50% max retention on Hellebuyck
      8479420: 25, // 25% retention on Thompson
    },
  });

  assert.ok(query.includes('dpA=wpg-2028-rd1-unprot%2Cwpg-2029-rd1-top5') || query.includes('dpA=wpg-2028-rd1-unprot,wpg-2029-rd1-top5'), 'Encodes custom protection suffixes');
  assert.ok(query.includes('dpB=buf-2028-rd1'), 'Encodes default top10 protection without redundant suffix');
  assert.ok(query.includes('rets='), 'Includes rets parameter');

  const decoded = decodeTradeFromUrl(query, mockPlayers, mockProspects);
  assert.ok(decoded !== null);
  assert.strictEqual(decoded.teamADraftPicks[0].protection, 'UNPROTECTED');
  assert.strictEqual(decoded.teamADraftPicks[0].tradeValueScore, 88);
  assert.strictEqual(decoded.teamADraftPicks[1].protection, 'TOP_5_PROTECTED');
  assert.strictEqual(decoded.teamADraftPicks[1].tradeValueScore, 82);
  assert.strictEqual(decoded.teamBDraftPicks[0].protection, 'TOP_10_PROTECTED');
  assert.strictEqual(decoded.teamBDraftPicks[0].tradeValueScore, 76);

  assert.strictEqual(decoded.playerRetentions[8476945], 50, '50% retention on Hellebuyck');
  assert.strictEqual(decoded.playerRetentions[8479420], 25, '25% retention on Thompson');
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

test('Player Spotlight: Validates Hellebuyck options and ensures all URL query strings decode cleanly', async () => {
  const { INITIAL_PLAYER_SPOTLIGHT } = await import('../src/data/playerSpotlights.ts');
  assert.strictEqual(INITIAL_PLAYER_SPOTLIGHT.playerName, 'Connor Hellebuyck');
  assert.strictEqual(INITIAL_PLAYER_SPOTLIGHT.currentTeamId, 'WPG');
  assert.strictEqual(INITIAL_PLAYER_SPOTLIGHT.options.length, 4, 'Must feature exactly 4 landing spot options');

  for (const opt of INITIAL_PLAYER_SPOTLIGHT.options) {
    assert.ok(opt.destinationTeamId, `Option has destination team: ${opt.destinationTeamId}`);
    assert.ok(opt.tradeUrlParams, `Option has tradeUrlParams: ${opt.title}`);
    const decoded = decodeTradeFromUrl(opt.tradeUrlParams, mockPlayers, mockProspects);
    assert.ok(decoded !== null, `Option ${opt.id} must decode cleanly`);
    assert.strictEqual(decoded.teamAId, 'WPG');
    assert.strictEqual(decoded.teamBId, opt.destinationTeamId);
  }
});

test('URL Engine: Correctly resolves Connor Hellebuyck (8476945) and Ryan McLeod (8480802) without ID collisions', async () => {
  const { INITIAL_PLAYERS } = await import('../src/data/sampleLeague.ts');
  const { INITIAL_PROSPECTS } = await import('../src/data/nhlProspects.ts');

  const testUrl = 'https://nhlmc.pages.dev/?v=1&tA=WPG&tB=BUF&pA=8476945&pB=8480802&prB=buf-radim-mrtka&dpB=buf-2028-rd1';
  const decoded = decodeTradeFromUrl(testUrl, INITIAL_PLAYERS, INITIAL_PROSPECTS);

  assert.ok(decoded !== null, 'Decodes cleanly');
  assert.strictEqual(decoded.teamAId, 'WPG');
  assert.strictEqual(decoded.teamBId, 'BUF');
  assert.deepStrictEqual(decoded.teamAPlayerIds, [8476945], 'Team A contains Connor Hellebuyck NHL ID');
  assert.deepStrictEqual(decoded.teamBPlayerIds, [8480802], 'Team B contains Ryan McLeod NHL ID');

  const playerMap = new Map();
  for (const p of INITIAL_PLAYERS) {
    playerMap.set(p.id, p);
    if (p.nhlId) playerMap.set(p.nhlId, p);
  }

  const teamAPlayers = decoded.teamAPlayerIds.map(id => playerMap.get(id)?.name);
  const teamBPlayers = decoded.teamBPlayerIds.map(id => playerMap.get(id)?.name);

  assert.deepStrictEqual(teamAPlayers, ['Connor Hellebuyck'], 'Must resolve Connor Hellebuyck on Team A');
  assert.deepStrictEqual(teamBPlayers, ['Ryan McLeod'], 'Must resolve Ryan McLeod on Team B');
  assert.ok(!teamAPlayers.includes('Bradly Nadeau'), 'Bradly Nadeau must NOT appear on Team A');
});

test('URL Engine: Encodes and decodes acquired draft picks preserving original and owning teams', () => {
  const acquiredPick = {
    id: 'chi-2027-rd1-fla',
    year: 2027,
    round: 1,
    owningTeamId: 'CHI',
    originalTeamId: 'FLA',
    protection: 'UNPROTECTED',
    tradeValueScore: 85,
  };

  const encoded = encodeTradeToUrl({
    teamAId: 'CHI',
    teamBId: 'NJD',
    teamAPlayers: [],
    teamBPlayers: [],
    teamAProspects: [],
    teamBProspects: [],
    teamADraftPicks: [acquiredPick],
    teamBDraftPicks: [],
  });

  assert.ok(encoded.includes('dpA=chi-2027-rd1-fla-unprot'), 'Encodes acquired pick with original team and protection');

  const decoded = decodeTradeFromUrl(encoded, mockPlayers, mockProspects);
  assert.ok(decoded !== null);
  assert.strictEqual(decoded.teamADraftPicks.length, 1);
  const dp = decoded.teamADraftPicks[0];
  assert.strictEqual(dp.year, 2027);
  assert.strictEqual(dp.round, 1);
  assert.strictEqual(dp.owningTeamId, 'CHI');
  assert.strictEqual(dp.originalTeamId, 'FLA');
  assert.strictEqual(dp.protection, 'UNPROTECTED');
});
