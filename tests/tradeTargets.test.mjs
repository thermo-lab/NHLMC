import test from 'node:test';
import assert from 'node:assert';
import { evaluateTradeTargets } from '../src/engine/tradeRipenessEngine.ts';
import fs from 'node:fs';

const rawPlayers = JSON.parse(fs.readFileSync('src/data/nhlPlayers.json', 'utf8'));

test('Trade Targets Engine: Evaluates 805 players and identifies ripeness archetypes', () => {
  const targets = evaluateTradeTargets(rawPlayers);
  assert.ok(targets.length > 20, `Identified ${targets.length} trade targets (> 20 required)`);

  const buyLows = targets.filter((t) => t.archetype === 'BUY_LOW');
  const sellHighs = targets.filter((t) => t.archetype === 'SELL_HIGH');

  assert.ok(buyLows.length > 5, `Identified ${buyLows.length} buy-low candidates`);
  assert.ok(sellHighs.length > 5, `Identified ${sellHighs.length} sell-high candidates`);

  // Verify sorting
  for (let i = 0; i < targets.length - 1; i++) {
    assert.ok(
      targets[i].ripenessScore >= targets[i + 1].ripenessScore,
      'Targets are sorted descending by ripenessScore'
    );
  }

  // Verify candidate properties
  const sample = targets[0];
  assert.ok(sample.player.name, 'Sample has player name');
  assert.ok(sample.ripenessScore >= 50 && sample.ripenessScore <= 100, 'Score is 50-100');
  assert.ok(sample.diagnosis.length > 10, 'Diagnosis is informative');
  assert.ok(sample.recommendedAction.length > 5, 'Has recommended action');
});
