import test from 'node:test';
import assert from 'node:assert/strict';

import {
  lookupGeneralManager,
  enrichTradeWithGMs,
} from '../src/data/nhlGeneralManagers.ts';

import {
  calculateAllGMRatings,
  gpaToLetter,
  gpaToNormalizedScore,
  GRADE_GPA_MAP,
} from '../src/engine/gmRatings.ts';

import { HISTORICAL_TRADES } from '../src/data/historicalTrades.ts';

test('GM Resolution: Resolves iconic historical trades to correct GMs', () => {
  // Gretzky Trade 1988-08-09
  assert.equal(lookupGeneralManager('EDM', '1988-08-09'), 'Glen Sather');
  assert.equal(lookupGeneralManager('LAK', '1988-08-09'), 'Rogie Vachon');

  // Patrick Roy Trade 1995-12-06
  assert.equal(lookupGeneralManager('MTL', '1995-12-06'), 'Rejean Houle');
  assert.equal(lookupGeneralManager('COL', '1995-12-06'), 'Pierre Lacroix');

  // Matthew Tkachuk Trade 2022-07-22
  assert.equal(lookupGeneralManager('FLA', '2022-07-22'), 'Bill Zito');
  assert.equal(lookupGeneralManager('CGY', '2022-07-22'), 'Brad Treliving');

  // Lindros Trade 1992-06-30
  assert.equal(lookupGeneralManager('PHI', '1992-06-30'), 'Russ Farwell');
  assert.equal(lookupGeneralManager('QUE', '1992-06-30'), 'Pierre Page');
});

test('GM Resolution: Correctly resolves active contemporary NHL GMs', () => {
  assert.equal(lookupGeneralManager('BOS', '2025-01-15'), 'Don Sweeney');
  assert.equal(lookupGeneralManager('CAR', '2025-01-15'), 'Eric Tulsky');
  assert.equal(lookupGeneralManager('CGY', '2025-01-15'), 'Craig Conroy');
  assert.equal(lookupGeneralManager('TBL', '2025-01-15'), 'Julien BriseBois');
  assert.equal(lookupGeneralManager('VGK', '2025-01-15'), 'Kelly McCrimmon');
});

test('GM Enrichment: Attaches GM names to trade objects', () => {
  const sampleTrade = {
    id: 'test-trade-1',
    title: 'Test Trade',
    headline: 'Testing GM enrichment',
    tradeDate: '2022-07-22',
    seasonEra: 'Salary Cap Era (2020s)',
    teamA: {
      teamAbbrev: 'FLA',
      teamName: 'Florida Panthers',
      snapshotGrade: 'B+',
      retrospectiveGrade: 'A+',
      gaveUp: ['Jonathan Huberdeau'],
      received: ['Matthew Tkachuk'],
    },
    teamB: {
      teamAbbrev: 'CGY',
      teamName: 'Calgary Flames',
      snapshotGrade: 'A',
      retrospectiveGrade: 'D+',
      gaveUp: ['Matthew Tkachuk'],
      received: ['Jonathan Huberdeau'],
    },
    snapshotContext: { marketConsensus: '', contextBullets: [] },
    historicalOutcome: {
      lopsidednessRating: 'DECISIVE_WIN',
      winningTeam: 'Florida Panthers',
      teamASuccessSummary: '',
      teamBSuccessSummary: '',
      championshipImpact: '',
    },
  };

  const enriched = enrichTradeWithGMs(sampleTrade);
  assert.equal(enriched.teamA.generalManager, 'Bill Zito');
  assert.equal(enriched.teamB.generalManager, 'Brad Treliving');
});

test('GM Ratings Engine: Correctly calculates dual ratings and drift', () => {
  const sampleTrades = [
    {
      id: 'trade-1',
      title: 'Trade 1',
      headline: '',
      tradeDate: '2022-07-22',
      seasonEra: '2020s',
      teamA: {
        teamAbbrev: 'FLA',
        teamName: 'Florida Panthers',
        generalManager: 'Bill Zito',
        snapshotGrade: 'B+', // 3.30
        retrospectiveGrade: 'A+', // 4.30
        gaveUp: [],
        received: [],
      },
      teamB: {
        teamAbbrev: 'CGY',
        teamName: 'Calgary Flames',
        generalManager: 'Brad Treliving',
        snapshotGrade: 'A', // 4.00
        retrospectiveGrade: 'D', // 1.00
        gaveUp: [],
        received: [],
      },
      snapshotContext: { marketConsensus: '', contextBullets: [] },
      historicalOutcome: {
        lopsidednessRating: 'ALL_TIME_FLEECING',
        winningTeam: 'Florida Panthers',
        teamASuccessSummary: '',
        teamBSuccessSummary: '',
        championshipImpact: 'Won 2024 Stanley Cup',
      },
    },
  ];

  const ratings = calculateAllGMRatings(sampleTrades);
  const zito = ratings.find((r) => r.name === 'Bill Zito');
  const treliving = ratings.find((r) => r.name === 'Brad Treliving');

  assert.ok(zito, 'Bill Zito must have a rating');
  assert.ok(treliving, 'Brad Treliving must have a rating');

  // Zito: Snapshot GPA = 3.30 (76.7), Retro GPA = 4.30 (100.0) -> Drift = +23.3
  assert.equal(zito.snapshotGpa, 3.30);
  assert.equal(zito.retrospectiveGpa, 4.30);
  assert.equal(zito.retrospectiveGrade, 'A+');
  assert.equal(zito.wins, 1);
  assert.equal(zito.losses, 0);
  assert.ok(zito.hindsightDrift > 0, 'Zito should have positive hindsight drift');
  assert.equal(zito.archetype, 'VISIONARY_MASTERMIND');

  // Treliving: Snapshot GPA = 4.00, Retro GPA = 1.00 -> Drift = negative
  assert.equal(treliving.snapshotGpa, 4.00);
  assert.equal(treliving.retrospectiveGpa, 1.00);
  assert.equal(treliving.wins, 0);
  assert.equal(treliving.losses, 1);
  assert.ok(treliving.hindsightDrift < 0, 'Treliving should have negative hindsight drift');
});

test('GM Ratings Engine: Processes all marquee historical trades cleanly', () => {
  const ratings = calculateAllGMRatings(HISTORICAL_TRADES);
  assert.ok(ratings.length >= 15, `Expected at least 15 GMs in marquee set, found ${ratings.length}`);

  for (const gm of ratings) {
    assert.ok(gm.name.length > 0);
    assert.ok(gm.totalTrades > 0);
    assert.ok(gm.snapshotScore >= 0 && gm.snapshotScore <= 100);
    assert.ok(gm.retrospectiveScore >= 0 && gm.retrospectiveScore <= 100);
    assert.ok(gm.snapshotRank > 0);
    assert.ok(gm.retrospectiveRank > 0);
    assert.ok(gm.archetype);
  }
});
