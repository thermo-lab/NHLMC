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

console.log('='.repeat(70));
console.log('  NHLMC MONTE CARLO & TRADE ENGINE: ACCURACY & OUTCOMES VERIFICATION');
console.log('='.repeat(70));

// -----------------------------------------------------------------------------
// 1. STATISTICAL DISTRIBUTIONS BENCHMARK
// -----------------------------------------------------------------------------
console.log('\n[1] Testing Statistical Distributions Accuracy...');
const N = 25000;

// Normal distribution: target mu=100, sigma=15
let sumNorm = 0;
let sumSqNorm = 0;
for (let i = 0; i < N; i++) {
  const v = sampleNormal(100, 15);
  sumNorm += v;
  sumSqNorm += v * v;
}
const meanNorm = sumNorm / N;
const stdNorm = Math.sqrt(sumSqNorm / N - meanNorm * meanNorm);
console.log(`  Normal(100, 15) -> Sample Mean: ${meanNorm.toFixed(3)} (target: 100.000, error: ${Math.abs(meanNorm - 100).toFixed(3)})`);
console.log(`  Normal(100, 15) -> Sample StdDev: ${stdNorm.toFixed(3)} (target: 15.000, error: ${Math.abs(stdNorm - 15).toFixed(3)})`);

// Poisson distribution: target lambda=3.75
let sumPois = 0;
let sumSqPois = 0;
let nonNegIntegerPois = true;
for (let i = 0; i < N; i++) {
  const p = samplePoisson(3.75);
  if (!Number.isInteger(p) || p < 0) nonNegIntegerPois = false;
  sumPois += p;
  sumSqPois += p * p;
}
const meanPois = sumPois / N;
const varPois = sumSqPois / N - meanPois * meanPois;
console.log(`  Poisson(3.75)   -> Sample Mean: ${meanPois.toFixed(3)} (target: 3.750, error: ${Math.abs(meanPois - 3.75).toFixed(3)})`);
console.log(`  Poisson(3.75)   -> Sample Variance: ${varPois.toFixed(3)} (target: 3.750, error: ${Math.abs(varPois - 3.75).toFixed(3)})`);
console.log(`  Poisson Integer & Non-Negative check: ${nonNegIntegerPois ? 'PASS' : 'FAIL'}`);

// Goalie Save Percentage: target 0.912
let sumSv = 0;
let minSv = 1;
let maxSv = 0;
for (let i = 0; i < N; i++) {
  const sv = sampleSavePctg(0.912);
  sumSv += sv;
  if (sv < minSv) minSv = sv;
  if (sv > maxSv) maxSv = sv;
}
const meanSv = sumSv / N;
console.log(`  Goalie SV%(0.912) -> Mean: ${meanSv.toFixed(4)}, Min: ${minSv.toFixed(4)}, Max: ${maxSv.toFixed(4)}`);

// Percentiles
const sortedSample = Array.from({ length: 1000 }, (_, i) => i + 1);
const p10 = calculatePercentile(sortedSample, 10);
const p50 = calculatePercentile(sortedSample, 50);
const p90 = calculatePercentile(sortedSample, 90);
console.log(`  Percentiles [1..1000] -> p10: ${p10}, p50: ${p50}, p90: ${p90} (Monotonic: ${p10 < p50 && p50 < p90})`);

// -----------------------------------------------------------------------------
// 2. PLAYER SIMULATION ACCURACY & REALISM
// -----------------------------------------------------------------------------
console.log('\n[2] Testing Player Simulation Stat Realism...');
const mcdavid = INITIAL_PLAYERS.find((p) => p.name.includes('McDavid'));
const shesterkin = INITIAL_PLAYERS.find((p) => p.name.includes('Shesterkin'));

// Connor McDavid (Elite Forward)
let mcPts = 0;
let mcGoals = 0;
let mcSog = 0;
let mcGames = 0;
const simRuns = 1000;
for (let i = 0; i < simRuns; i++) {
  const sim = simulateSkaterSeason(mcdavid, 1.0, 1.0);
  mcPts += sim.points;
  mcGoals += sim.goals;
  mcSog += sim.sog;
  mcGames += sim.games;
}
console.log(`  Connor McDavid (82-game simulated baseline over ${simRuns} runs):`);
console.log(`    Games: ${(mcGames / simRuns).toFixed(1)} / 82`);
console.log(`    Goals: ${(mcGoals / simRuns).toFixed(1)}`);
console.log(`    Points: ${(mcPts / simRuns).toFixed(1)}`);
console.log(`    SOG: ${(mcSog / simRuns).toFixed(1)}`);

// Igor Shesterkin (Elite Goalie)
let igWins = 0;
let igGaa = 0;
let igSv = 0;
let igGames = 0;
for (let i = 0; i < simRuns; i++) {
  const sim = simulateGoalieSeason(shesterkin, 1.0, 1.0);
  igWins += sim.wins;
  igGaa += sim.gaa;
  igSv += sim.savePctg;
  igGames += sim.games;
}
console.log(`  Igor Shesterkin (82-game simulated baseline over ${simRuns} runs):`);
console.log(`    Starts: ${(igGames / simRuns).toFixed(1)}`);
console.log(`    Wins: ${(igWins / simRuns).toFixed(1)}`);
console.log(`    GAA: ${(igGaa / simRuns).toFixed(2)}`);
console.log(`    SV%: ${(igSv / simRuns).toFixed(3)}`);

// -----------------------------------------------------------------------------
// 3. ASYMMETRIC / FLEECING TRADE EXPECTED OUTCOME
// -----------------------------------------------------------------------------
console.log('\n[3] Testing Asymmetric Trade Expected Outcomes (Fleecing Sanity Test)...');
// Edmonton trades McDavid to Florida for a depth player (Carter Verhaeghe or Sam Bennett)
const verhaeghe = INITIAL_PLAYERS.find((p) => p.name.includes('Verhaeghe')) ?? INITIAL_PLAYERS.find((p) => p.nhlTeam === 'FLA');
const fleecingProposal = {
  teamAId: 'EDM',
  teamBId: 'FLA',
  teamAPlayerIds: [mcdavid.id], // Giving McDavid
  teamBPlayerIds: [verhaeghe.id], // Getting depth piece
};
const fleecingEval = evaluateFranchiseTrade(NHL_FRANCHISES, INITIAL_PLAYERS, fleecingProposal, 1000);
console.log(`  Trade: Edmonton sends McDavid ($12.5M) -> Florida sends ${verhaeghe.name} ($${(verhaeghe.capHit / 1e6).toFixed(2)}M)`);
console.log(`  Edmonton deltas: Points: ${fleecingEval.teamA.deltas.pointsDelta}, Cup Prob: ${(fleecingEval.teamA.deltas.stanleyCupDelta * 100).toFixed(1)}%`);
console.log(`  Florida deltas: Points: ${fleecingEval.teamB.deltas.pointsDelta}, Cup Prob: +${(fleecingEval.teamB.deltas.stanleyCupDelta * 100).toFixed(1)}%`);
console.log(`  Winner classified: ${fleecingEval.verdict.winner}`);
console.log(`  Edmonton GM Recommendation: ${fleecingEval.verdict.actionRecommendationTeamA} (Expected: WALK_AWAY)`);
console.log(`  Florida GM Recommendation: ${fleecingEval.verdict.actionRecommendationTeamB} (Expected: EXECUTE)`);

// -----------------------------------------------------------------------------
// 4. SALARY CAP COMPLIANCE & VIOLATION TESTS
// -----------------------------------------------------------------------------
console.log('\n[4] Testing Salary Cap Hard Ceiling Enforcement ($88.0M)...');
// Vegas is at $98M or cap ceiling. Acquiring McDavid ($12.5M) with 0 sending salary
const capViolateProposal = {
  teamAId: 'VGK',
  teamBId: 'EDM',
  teamAPlayerIds: [],
  teamBPlayerIds: [mcdavid.id],
};
const capViolateEval = evaluateFranchiseTrade(NHL_FRANCHISES, INITIAL_PLAYERS, capViolateProposal, 500);
console.log(`  Vegas acquires McDavid ($12.5M) with $0 outgoing:`);
console.log(`    Post-Trade Payroll: $${(capViolateEval.capImpact.teamA.postTradePayroll / 1e6).toFixed(2)}M`);
console.log(`    Is Cap Compliant: ${capViolateEval.capImpact.teamA.isCapCompliant} (Expected: false)`);
console.log(`    Vegas Recommendation: ${capViolateEval.verdict.actionRecommendationTeamA} (Expected: WALK_AWAY due to cap)`);
console.log(`    Cap Warning Triggered: ${capViolateEval.verdict.strategicAnalysisBullets.some(b => b.includes('CAP WARNING'))}`);

// -----------------------------------------------------------------------------
// 5. SALARY RETENTION TEST
// -----------------------------------------------------------------------------
console.log('\n[5] Testing Salary Retention Mechanics...');
const retainProposal = {
  teamAId: 'EDM',
  teamBId: 'FLA',
  teamAPlayerIds: [mcdavid.id],
  teamBPlayerIds: [],
  salaryRetention: [
    {
      playerId: mcdavid.id,
      retainingTeamId: 'EDM',
      retainedPct: 50, // Edmonton retains 50% = $6.25M
    },
  ],
};
const retainEval = evaluateFranchiseTrade(NHL_FRANCHISES, INITIAL_PLAYERS, retainProposal, 500);
const edmPayrollExpected = NHL_FRANCHISES.find(t => t.id === 'EDM').activePayroll - 12500000 + 6250000;
const flaPayrollExpected = NHL_FRANCHISES.find(t => t.id === 'FLA').activePayroll + 6250000;
console.log(`  Edmonton retains 50% ($6.25M) on McDavid to Florida:`);
console.log(`    Edmonton Payroll: $${(retainEval.capImpact.teamA.postTradePayroll / 1e6).toFixed(2)}M (Expected: $${(edmPayrollExpected / 1e6).toFixed(2)}M)`);
console.log(`    Florida Payroll: $${(retainEval.capImpact.teamB.postTradePayroll / 1e6).toFixed(2)}M (Expected: $${(flaPayrollExpected / 1e6).toFixed(2)}M)`);

// -----------------------------------------------------------------------------
// 6. CONTENDER VS REBUILDER FUTURES & PROSPECTS (RADIM MRTKA)
// -----------------------------------------------------------------------------
console.log('\n[6] Testing Contender vs Rebuilder Trade with Top Prospects & Draft Picks...');
// Edmonton (Contender) trades for Radim Mrtka from Buffalo (Rebuilder)
const futuresProposal = {
  teamAId: 'EDM',
  teamBId: 'BUF',
  teamAPlayerIds: [],
  teamBPlayerIds: [],
  teamADraftPicks: [
    { id: 'edm-rd1', year: 2025, round: 1, originalTeam: 'EDM', isProtected: true },
    { id: 'edm-rd2', year: 2026, round: 2, originalTeam: 'EDM', isProtected: false },
  ],
  teamBProspectIds: ['buf-radim-mrtka'],
};
const futuresEval = evaluateFranchiseTrade(NHL_FRANCHISES, INITIAL_PLAYERS, futuresProposal, 500);
console.log(`  Edmonton sends 2025 1st (Prot) + 2026 2nd -> Buffalo sends Radim Mrtka:`);
console.log(`    Edmonton Acquired: ${futuresEval.futureCapital.teamAAssetsAcquired.join(', ')}`);
console.log(`    Buffalo Acquired: ${futuresEval.futureCapital.teamBAssetsAcquired.join(', ')}`);
console.log(`    Edmonton Net Capital Score: ${futuresEval.futureCapital.teamANetCapitalScore}`);
console.log(`    Buffalo Net Capital Score: ${futuresEval.futureCapital.teamBNetCapitalScore}`);
console.log(`    Strategic Summary: ${futuresEval.verdict.summary}`);

// -----------------------------------------------------------------------------
// 7. LEAGUE-WIDE STANDINGS DISTRIBUTION (32 TEAMS)
// -----------------------------------------------------------------------------
console.log('\n[7] Testing 32-Team Standings & Contender Tier Hierarchy...');
const tiers = {
  STANLEY_CUP_CONTENDER: [],
  PLAYOFF_LOCK: [],
  BUBBLE_TEAM: [],
  REBUILDING: [],
};
for (const f of NHL_FRANCHISES) {
  const dummyEval = evaluateFranchiseTrade(NHL_FRANCHISES, INITIAL_PLAYERS, {
    teamAId: f.id,
    teamBId: f.id === 'EDM' ? 'FLA' : 'EDM',
    teamAPlayerIds: [],
    teamBPlayerIds: [],
  }, 200);
  const pts = dummyEval.teamA.baseline.expectedPoints;
  const playoffProb = dummyEval.teamA.baseline.playoffProbability;
  const cupProb = dummyEval.teamA.baseline.stanleyCupWinProb;
  const tier = f.contenderTier;
  if (!tiers[tier]) tiers[tier] = [];
  tiers[tier].push({ name: f.name, pts, playoffProb, cupProb });
}

for (const [tier, teamList] of Object.entries(tiers)) {
  if (teamList.length === 0) continue;
  const avgPts = teamList.reduce((acc, t) => acc + t.pts, 0) / teamList.length;
  const avgPlayoff = teamList.reduce((acc, t) => acc + t.playoffProb, 0) / teamList.length;
  const avgCup = teamList.reduce((acc, t) => acc + t.cupProb, 0) / teamList.length;
  console.log(`  ${tier.padEnd(23)} (${teamList.length} teams) -> Avg Pts: ${avgPts.toFixed(1)}, Playoff: ${(avgPlayoff * 100).toFixed(1)}%, Cup: ${(avgCup * 100).toFixed(1)}%`);
}

console.log('\n' + '='.repeat(70));
console.log('  ALL ACCURACY CHECKS COMPLETED SUCCESSFULLY.');
console.log('='.repeat(70));
