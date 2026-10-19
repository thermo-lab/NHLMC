import test from 'node:test';
import assert from 'node:assert/strict';

import {
  sampleNormal,
  samplePoisson,
  sampleTruncatedNormal,
  sampleSavePctg,
  calculatePercentile,
} from '../src/engine/distributions.ts';

import {
  simulateSkaterSeason,
  simulateGoalieSeason,
} from '../src/engine/simulationEngine.ts';

import { evaluateFranchiseTrade } from '../src/engine/franchiseSimulation.ts';
import { NHL_FRANCHISES } from '../src/data/nhlFranchises.ts';
import { INITIAL_PLAYERS } from '../src/data/sampleLeague.ts';
import { INITIAL_PROSPECTS } from '../src/data/nhlProspects.ts';

test('Accuracy Benchmark: Normal distribution mean and variance convergence', () => {
  const n = 20000;
  let sum = 0;
  let sumSq = 0;
  for (let i = 0; i < n; i++) {
    const v = sampleNormal(100, 15);
    sum += v;
    sumSq += v * v;
  }
  const mean = sum / n;
  const std = Math.sqrt(sumSq / n - mean * mean);

  assert.ok(Math.abs(mean - 100) < 0.25, `Expected mean ~100, got ${mean}`);
  assert.ok(Math.abs(std - 15) < 0.35, `Expected std ~15, got ${std}`);
});

test('Accuracy Benchmark: Poisson distribution mean equals variance', () => {
  const n = 20000;
  const lambda = 4.0;
  let sum = 0;
  let sumSq = 0;
  for (let i = 0; i < n; i++) {
    const v = samplePoisson(lambda);
    assert.ok(Number.isInteger(v) && v >= 0, 'Must be non-negative integer');
    sum += v;
    sumSq += v * v;
  }
  const mean = sum / n;
  const variance = sumSq / n - mean * mean;

  assert.ok(Math.abs(mean - lambda) < 0.1, `Mean should be ~${lambda}, got ${mean}`);
  assert.ok(Math.abs(variance - lambda) < 0.25, `Variance should be ~${lambda}, got ${variance}`);
});

test('Accuracy Benchmark: Goalie Save Percentage realism and boundedness', () => {
  for (let i = 0; i < 1000; i++) {
    const sv = sampleSavePctg(0.915, 1200);
    assert.ok(sv >= 0.850 && sv <= 0.965, `SV% out of realistic NHL range: ${sv}`);
  }
});

test('Accuracy Benchmark: Skater season simulation capped at 82 games and realistic superstar production', () => {
  const mcdavid = INITIAL_PLAYERS.find((p) => p.name.includes('McDavid'));
  assert.ok(mcdavid, 'Connor McDavid must exist');

  let totalGames = 0;
  let totalPts = 0;
  const runs = 200;
  for (let i = 0; i < runs; i++) {
    const sim = simulateSkaterSeason(mcdavid, 1.0, 1.0);
    assert.ok(sim.games <= 82, `Games played cannot exceed 82: got ${sim.games}`);
    assert.ok(sim.points === sim.goals + sim.assists, 'Points must equal goals + assists');
    assert.ok(sim.sog >= sim.goals, 'SOG must be >= goals');
    totalGames += sim.games;
    totalPts += sim.points;
  }

  const avgGames = totalGames / runs;
  const avgPts = totalPts / runs;
  assert.ok(avgGames >= 65 && avgGames <= 82, `Average games should be 65-82: ${avgGames}`);
  assert.ok(avgPts >= 90 && avgPts <= 155, `Superstar expected points should be 90-155: ${avgPts}`);
});

test('Accuracy Benchmark: Asymmetric fleecing trade expected outcomes', () => {
  const mcdavid = INITIAL_PLAYERS.find((p) => p.name.includes('McDavid'));
  const verhaeghe = INITIAL_PLAYERS.find((p) => p.name.includes('Verhaeghe'));
  assert.ok(mcdavid && verhaeghe);

  const proposal = {
    teamAId: 'EDM', // Edmonton gives McDavid
    teamBId: 'FLA', // Florida gives Verhaeghe
    teamAPlayerIds: [mcdavid.id],
    teamBPlayerIds: [verhaeghe.id],
  };

  const result = evaluateFranchiseTrade(NHL_FRANCHISES, INITIAL_PLAYERS, proposal, 500);

  // Edmonton loses points and Cup equity
  assert.ok(result.teamA.deltas.pointsDelta < 0, 'Edmonton expected points must decline');
  assert.ok(result.teamA.deltas.stanleyCupDelta < 0, 'Edmonton Stanley Cup probability must decline');
  assert.equal(result.verdict.actionRecommendationTeamA, 'WALK_AWAY', 'Edmonton GM must decline trade');
});

test('Accuracy Benchmark: Salary cap hard ceiling ($88.0M) enforcement', () => {
  const mcdavid = INITIAL_PLAYERS.find((p) => p.name.includes('McDavid'));
  assert.ok(mcdavid);

  // Vegas acquires McDavid ($12.5M) with $0 outgoing, putting them well over $88.0M
  const proposal = {
    teamAId: 'VGK',
    teamBId: 'EDM',
    teamAPlayerIds: [],
    teamBPlayerIds: [mcdavid.id],
  };

  const result = evaluateFranchiseTrade(NHL_FRANCHISES, INITIAL_PLAYERS, proposal, 300);

  assert.equal(result.capImpact.teamA.isCapCompliant, false, 'Must flag cap non-compliance');
  assert.equal(result.verdict.actionRecommendationTeamA, 'WALK_AWAY', 'Must force WALK_AWAY on illegal cap');
  assert.ok(
    result.verdict.strategicAnalysisBullets.some((b) => b.includes('CAP WARNING')),
    'Must include cap warning bullet'
  );
});

test('Accuracy Benchmark: Exact conservation of salary cap under salary retention', () => {
  const mcdavid = INITIAL_PLAYERS.find((p) => p.name.includes('McDavid'));
  const teamA = NHL_FRANCHISES.find((t) => t.id === 'EDM');
  const teamB = NHL_FRANCHISES.find((t) => t.id === 'FLA');
  assert.ok(mcdavid && teamA && teamB);

  const proposal = {
    teamAId: 'EDM',
    teamBId: 'FLA',
    teamAPlayerIds: [mcdavid.id],
    teamBPlayerIds: [],
    salaryRetention: [
      {
        playerId: mcdavid.id,
        retainingTeamId: 'EDM',
        retainedPct: 50, // 50% of $12.5M = $6.25M
      },
    ],
  };

  const result = evaluateFranchiseTrade(NHL_FRANCHISES, INITIAL_PLAYERS, proposal, 200);

  const expectedEdmPayroll = teamA.activePayroll - 12500000 + 6250000;
  const expectedFlaPayroll = teamB.activePayroll + 6250000;

  assert.equal(result.capImpact.teamA.postTradePayroll, expectedEdmPayroll);
  assert.equal(result.capImpact.teamB.postTradePayroll, expectedFlaPayroll);

  // Total league cap conservation check
  const netLeagueChange =
    (result.capImpact.teamA.postTradePayroll - teamA.activePayroll) +
    (result.capImpact.teamB.postTradePayroll - teamB.activePayroll);
  assert.equal(netLeagueChange, 0, 'League-wide net payroll change under one-for-none trade must equal 0');
});

test('Accuracy Benchmark: 32-team standings hierarchy aligns with contender tiers', () => {
  const tiers = {
    STANLEY_CUP_CONTENDER: [],
    REBUILDING: [],
  };

  for (const f of NHL_FRANCHISES) {
    if (f.contenderTier === 'STANLEY_CUP_CONTENDER' || f.contenderTier === 'REBUILDING') {
      const dummyEval = evaluateFranchiseTrade(
        NHL_FRANCHISES,
        INITIAL_PLAYERS,
        {
          teamAId: f.id,
          teamBId: f.id === 'EDM' ? 'FLA' : 'EDM',
          teamAPlayerIds: [],
          teamBPlayerIds: [],
        },
        150
      );
      tiers[f.contenderTier].push(dummyEval.teamA.baseline.expectedPoints);
    }
  }

  const avgContenderPts =
    tiers.STANLEY_CUP_CONTENDER.reduce((a, b) => a + b, 0) / tiers.STANLEY_CUP_CONTENDER.length;
  const avgRebuilderPts =
    tiers.REBUILDING.reduce((a, b) => a + b, 0) / tiers.REBUILDING.length;

  assert.ok(avgContenderPts > 98, `Contenders must average > 98 pts: got ${avgContenderPts}`);
  assert.ok(avgRebuilderPts < 70, `Rebuilders must average < 70 pts: got ${avgRebuilderPts}`);
  assert.ok(avgContenderPts - avgRebuilderPts > 35, 'Contender vs rebuilder point spread must be > 35 pts');
});
