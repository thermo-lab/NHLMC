import test from 'node:test';
import assert from 'node:assert/strict';

import {
  randomStandardNormal,
  sampleNormal,
  samplePoisson,
  sampleTruncatedNormal,
  sampleSavePctg,
  calculatePercentile,
} from '../src/engine/distributions.ts';

import {
  simulateSkaterSeason,
  simulateGoalieSeason,
  scoreRotoStandings,
  runMonteCarloSimulation,
} from '../src/engine/simulationEngine.ts';

import { evaluateFranchiseTrade } from '../src/engine/franchiseSimulation.ts';
import { NHL_FRANCHISES } from '../src/data/nhlFranchises.ts';
import { DEFAULT_LEAGUE, INITIAL_PLAYERS } from '../src/data/sampleLeague.ts';

test('Distributions: Normal sampling produces approximately expected mean', () => {
  const n = 5000;
  let sum = 0;
  for (let i = 0; i < n; i++) {
    sum += sampleNormal(100, 15);
  }
  const mean = sum / n;
  assert.ok(Math.abs(mean - 100) < 1.0, `Expected mean ~100, got ${mean}`);
});

test('Distributions: Poisson sampling yields non-negative integers', () => {
  for (let i = 0; i < 500; i++) {
    const s = samplePoisson(5.5);
    assert.ok(Number.isInteger(s), 'Poisson sample must be an integer');
    assert.ok(s >= 0, 'Poisson sample must be non-negative');
  }
});

test('Distributions: calculatePercentile produces monotonically increasing values', () => {
  const arr = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  const p10 = calculatePercentile(arr, 10);
  const p50 = calculatePercentile(arr, 50);
  const p90 = calculatePercentile(arr, 90);

  assert.ok(p10 < p50);
  assert.ok(p50 < p90);
});

test('Engine: Simulating skater produces valid hockey stat lines', () => {
  const mcdavid = INITIAL_PLAYERS.find((p) => p.name.includes('McDavid'));
  assert.ok(mcdavid, 'Connor McDavid must exist');

  const sim = simulateSkaterSeason(mcdavid, 1.0, 0.85);
  assert.ok(sim.games > 20, `Games should be reasonable: ${sim.games}`);
  assert.ok(sim.goals >= 0, `Goals cannot be negative: ${sim.goals}`);
  assert.ok(sim.points >= sim.goals, `Points must be >= goals: ${sim.points} >= ${sim.goals}`);
  assert.ok(sim.sog >= sim.goals, `SOG must be >= goals: ${sim.sog} >= ${sim.goals}`);
});

test('Engine: Simulating goalie produces realistic GAA and SV%', () => {
  const shesterkin = INITIAL_PLAYERS.find((p) => p.name.includes('Shesterkin'));
  assert.ok(shesterkin, 'Igor Shesterkin must exist');

  const sim = simulateGoalieSeason(shesterkin, 1.0, 0.85);
  assert.ok(sim.games > 15, `Games started should be positive: ${sim.games}`);
  assert.ok(sim.gaa >= 1.2 && sim.gaa <= 5.0, `GAA should be realistic: ${sim.gaa}`);
  assert.ok(sim.savePctg >= 0.850 && sim.savePctg <= 0.960, `SV% should be realistic: ${sim.savePctg}`);
  assert.ok(sim.wins >= 0, `Wins cannot be negative: ${sim.wins}`);
});

test('Engine: Monte Carlo simulation executes and evaluates trade proposal with cap impact', () => {
  const userTeam = DEFAULT_LEAGUE.teams.find((t) => t.id === 'team-user');
  const targetTeam = DEFAULT_LEAGUE.teams.find((t) => t.id === 'team-2');
  const givingId = userTeam?.playerIds[2] ?? 72; // Zach Hyman ($5.5M)
  const receivingId = targetTeam?.playerIds[1] ?? 409; // Mikko Rantanen ($9.25M)

  const tradeProposal = {
    targetTeamId: 'team-2',
    givingPlayerIds: [givingId],
    receivingPlayerIds: [receivingId],
  };

  const result = runMonteCarloSimulation(DEFAULT_LEAGUE, INITIAL_PLAYERS, tradeProposal, {
    iterations: 300,
    injuryVolatility: 'NORMAL',
    remainingSeasonPct: 0.85,
  });

  assert.ok(result.executionTimeMs > 0);
  assert.equal(result.iterations, 300);
  assert.ok(result.userTeam.baselineWinProb >= 0 && result.userTeam.baselineWinProb <= 1);
  assert.ok(result.userTeam.postTradeWinProb >= 0 && result.userTeam.postTradeWinProb <= 1);
  assert.equal(result.userTeam.categoryBreakdown.length, 14);
  assert.ok(result.verdict.summary.length > 0);
  assert.ok(result.capImpact);
  assert.ok(result.capImpact.capDelta > 0, 'Acquiring Rantanen for Hyman should increase payroll');
});

test('Franchise Engine: Evaluates real NHL trade with 82-game regular season and Stanley Cup playoff simulation', () => {
  const hyman = INITIAL_PLAYERS.find((p) => p.name.includes('Hyman'));
  const reinhart = INITIAL_PLAYERS.find((p) => p.name.includes('Reinhart'));
  assert.ok(hyman, 'Hyman must exist in active NHL players');
  assert.ok(reinhart, 'Reinhart must exist in active NHL players');

  const proposal = {
    teamAId: 'EDM', // Edmonton Oilers
    teamBId: 'FLA', // Florida Panthers
    teamAPlayerIds: [hyman.id], // Zach Hyman ($5.5M)
    teamBPlayerIds: [reinhart.id], // Sam Reinhart ($8.625M)
  };

  const result = evaluateFranchiseTrade(NHL_FRANCHISES, INITIAL_PLAYERS, proposal, 500);

  assert.ok(result.executionTimeMs > 0);
  assert.equal(result.iterations, 500);
  assert.equal(result.teamA.teamId, 'EDM');
  assert.equal(result.teamB.teamId, 'FLA');
  assert.ok(result.teamA.baseline.playoffProbability > 0.5);
  assert.ok(result.teamA.postTrade.stanleyCupWinProb >= 0);
  assert.ok(result.capImpact.teamA.postTradePayroll > 0);
  assert.ok(result.verdict.summary.length > 0);
  assert.ok(result.verdict.strategicAnalysisBullets.length > 0);
});
