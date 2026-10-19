import { Player } from '../types/player';
import { FantasyLeague, FantasyTeam, LeagueScoringSettings } from '../types/league';
import {
  SimulationConfig,
  TradeProposal,
  SimulationResult,
  CategoryDelta,
  PercentileStats,
  CapImpact,
} from '../types/simulation';
import {
  sampleNormal,
  sampleTruncatedNormal,
  samplePoisson,
  sampleSavePctg,
  calculatePercentile,
} from './distributions';

export interface SimulatedSkaterOutcome {
  games: number;
  goals: number;
  assists: number;
  points: number;
  plusMinus: number;
  ppp: number;
  sog: number;
  hits: number;
  blocks: number;
  pim: number;
}

export interface SimulatedGoalieOutcome {
  games: number;
  wins: number;
  ga: number;
  saves: number;
  shotsAgainst: number;
  gaa: number;
  savePctg: number;
  shutouts: number;
}

export function simulateSkaterSeason(
  player: Player,
  volatilityMultiplier: number = 1.0,
  remainingSeasonPct: number = 0.85
): SimulatedSkaterOutcome {
  const proj = player.projections;
  const baseGames = (proj.rosGamesRemaining ?? 70) * (remainingSeasonPct / 0.85);

  // Health and ice-time volatility shock
  const playingTimeFactor = sampleTruncatedNormal(
    1.0,
    proj.sdPlayingTimePct * volatilityMultiplier,
    0.1,
    1.3
  );

  const actualGames = Math.min(82, Math.max(0, Math.round(baseGames * playingTimeFactor)));
  if (actualGames <= 0) {
    return { games: 0, goals: 0, assists: 0, points: 0, plusMinus: 0, ppp: 0, sog: 0, hits: 0, blocks: 0, pim: 0 };
  }

  // Regression to prevent small-sample unregressed pace distortion (e.g. 23 pts in 8 GP -> 236 pts)
  const rawGRate = (proj.rosGoals ?? 20) / Math.max(1, baseGames);
  const rawARate = (proj.rosAssists ?? 30) / Math.max(1, baseGames);
  const rawPtsRate = rawGRate + rawARate;
  const rateScale = rawPtsRate * 82 > 155 ? 155 / (rawPtsRate * 82) : 1.0;

  const gRate = rawGRate * rateScale;
  const sampledGoals = samplePoisson(actualGames * gRate);

  const aRate = rawARate * rateScale;
  const sampledAssists = samplePoisson(actualGames * aRate);

  const sampledPoints = sampledGoals + sampledAssists;

  const pppRate = (proj.rosPPP ?? 15) / Math.max(1, baseGames);
  const sampledPPP = samplePoisson(actualGames * pppRate);

  const sogRate = (proj.rosSOG ?? 160) / Math.max(1, baseGames);
  const sampledSOG = samplePoisson(actualGames * sogRate);

  const hitRate = (proj.rosHits ?? 80) / Math.max(1, baseGames);
  const sampledHits = samplePoisson(actualGames * hitRate);

  const blkRate = (proj.rosBlocks ?? 50) / Math.max(1, baseGames);
  const sampledBlocks = samplePoisson(actualGames * blkRate);

  const pimRate = (proj.rosPIM ?? 30) / Math.max(1, baseGames);
  const sampledPIM = samplePoisson(actualGames * pimRate);

  const pmRate = (proj.rosPlusMinus ?? 5) / Math.max(1, baseGames);
  const pmStdDev = (proj.sdPlusMinus ?? 10) * Math.sqrt(actualGames / 70) * volatilityMultiplier;
  const sampledPlusMinus = Math.round(sampleNormal(actualGames * pmRate, pmStdDev));

  return {
    games: actualGames,
    goals: sampledGoals,
    assists: sampledAssists,
    points: sampledPoints,
    plusMinus: sampledPlusMinus,
    ppp: sampledPPP,
    sog: sampledSOG,
    hits: sampledHits,
    blocks: sampledBlocks,
    pim: sampledPIM,
  };
}

export function simulateGoalieSeason(
  player: Player,
  volatilityMultiplier: number = 1.0,
  remainingSeasonPct: number = 0.85
): SimulatedGoalieOutcome {
  const proj = player.projections;
  const baseStarts = (proj.rosGamesStarted ?? 50) * (remainingSeasonPct / 0.85);

  const startShareFactor = sampleTruncatedNormal(
    1.0,
    proj.sdPlayingTimePct * volatilityMultiplier,
    0.1,
    1.3
  );

  const actualStarts = Math.round(baseStarts * startShareFactor);
  if (actualStarts <= 0) {
    return { games: 0, wins: 0, ga: 0, saves: 0, shotsAgainst: 0, gaa: 3.0, savePctg: 0.900, shutouts: 0 };
  }

  // Average 29.5 shots faced per 60 minutes
  const shotsFaced = Math.round(actualStarts * sampleTruncatedNormal(29.5, 2.5 * volatilityMultiplier, 22, 38));
  const meanSavePct = proj.rosSavePctg ?? 0.910;
  const sampledSavePct = sampleSavePctg(meanSavePct, shotsFaced);

  const sampledSaves = Math.round(shotsFaced * sampledSavePct);
  const sampledGA = shotsFaced - sampledSaves;
  const sampledGAA = (sampledGA / Math.max(1, actualStarts));

  const winP = (proj.rosWins ?? 28) / Math.max(1, baseStarts);
  const sampledWins = Math.min(actualStarts, samplePoisson(actualStarts * winP));

  const soP = (proj.rosShutouts ?? 3) / Math.max(1, baseStarts);
  const sampledShutouts = Math.min(sampledWins, samplePoisson(actualStarts * soP));

  return {
    games: actualStarts,
    wins: sampledWins,
    ga: sampledGA,
    saves: sampledSaves,
    shotsAgainst: shotsFaced,
    gaa: sampledGAA,
    savePctg: sampledSavePct,
    shutouts: sampledShutouts,
  };
}

interface TeamAggregateTotals {
  teamId: string;
  g: number;
  a: number;
  pts: number;
  plusMinus: number;
  ppp: number;
  sog: number;
  hit: number;
  blk: number;
  pim: number;
  w: number;
  ga: number;
  saves: number;
  shotsAgainst: number;
  gaa: number;
  savePctg: number;
  so: number;
}

export function calculateTeamSeasonTotals(
  team: FantasyTeam,
  playersMap: Map<number, Player>,
  volatilityMultiplier: number,
  remainingSeasonPct: number
): TeamAggregateTotals {
  let g = team.seasonTotals.g;
  let a = team.seasonTotals.a;
  let pts = team.seasonTotals.pts;
  let plusMinus = team.seasonTotals.plusMinus;
  let ppp = team.seasonTotals.ppp;
  let sog = team.seasonTotals.sog;
  let hit = team.seasonTotals.hit;
  let blk = team.seasonTotals.blk;
  let pim = team.seasonTotals.pim;

  let w = team.seasonTotals.w;
  let ga = team.seasonTotals.ga;
  let saves = team.seasonTotals.saves;
  let shotsAgainst = team.seasonTotals.shotsAgainst;
  let so = team.seasonTotals.so;

  for (const pid of team.playerIds) {
    const player = playersMap.get(pid);
    if (!player) continue;

    if (player.playerType === 'goalie') {
      const gSim = simulateGoalieSeason(player, volatilityMultiplier, remainingSeasonPct);
      w += gSim.wins;
      ga += gSim.ga;
      saves += gSim.saves;
      shotsAgainst += gSim.shotsAgainst;
      so += gSim.shutouts;
    } else {
      const sSim = simulateSkaterSeason(player, volatilityMultiplier, remainingSeasonPct);
      g += sSim.goals;
      a += sSim.assists;
      pts += sSim.points;
      plusMinus += sSim.plusMinus;
      ppp += sSim.ppp;
      sog += sSim.sog;
      hit += sSim.hits;
      blk += sSim.blocks;
      pim += sSim.pim;
    }
  }

  const gaa = shotsAgainst > 0 ? (ga * 60) / Math.max(1, (shotsAgainst / 29.5) * 60) : 2.50;
  const savePctg = shotsAgainst > 0 ? saves / shotsAgainst : 0.910;

  return {
    teamId: team.id,
    g,
    a,
    pts,
    plusMinus,
    ppp,
    sog,
    hit,
    blk,
    pim,
    w,
    ga,
    saves,
    shotsAgainst,
    gaa,
    savePctg,
    so,
  };
}

export interface StandingsScore {
  teamId: string;
  totalPoints: number;
  rank: number;
  categoryPoints: Record<string, number>;
}

export function scoreRotoStandings(
  teamsTotals: TeamAggregateTotals[],
  scoring: LeagueScoringSettings
): Map<string, StandingsScore> {
  const numTeams = teamsTotals.length;
  const pointsMap = new Map<string, { totalPoints: number; categoryPoints: Record<string, number> }>();

  for (const t of teamsTotals) {
    pointsMap.set(t.teamId, { totalPoints: 0, categoryPoints: {} });
  }

  const allCategories = [
    ...scoring.skaterCategories.map((c) => ({ key: c, isInverse: scoring.inverseCategories.includes(c) })),
    ...scoring.goalieCategories.map((c) => ({ key: c, isInverse: scoring.inverseCategories.includes(c) })),
  ];

  for (const cat of allCategories) {
    const sorted = [...teamsTotals].sort((a, b) => {
      let valA = 0;
      let valB = 0;
      switch (cat.key) {
        case 'G': valA = a.g; valB = b.g; break;
        case 'A': valA = a.a; valB = b.a; break;
        case 'PTS': valA = a.pts; valB = b.pts; break;
        case 'PLUS_MINUS': valA = a.plusMinus; valB = b.plusMinus; break;
        case 'PPP': valA = a.ppp; valB = b.ppp; break;
        case 'SOG': valA = a.sog; valB = b.sog; break;
        case 'HIT': valA = a.hit; valB = b.hit; break;
        case 'BLK': valA = a.blk; valB = b.blk; break;
        case 'PIM': valA = a.pim; valB = b.pim; break;
        case 'W': valA = a.w; valB = b.w; break;
        case 'GAA': valA = a.gaa; valB = b.gaa; break;
        case 'SV_PCT': valA = a.savePctg; valB = b.savePctg; break;
        case 'SV': valA = a.saves; valB = b.saves; break;
        case 'SO': valA = a.so; valB = b.so; break;
      }
      return cat.isInverse ? valA - valB : valB - valA;
    });

    let i = 0;
    while (i < sorted.length) {
      let j = i;
      let currentVal = getCategoryValue(sorted[i], cat.key);
      while (j < sorted.length && Math.abs(getCategoryValue(sorted[j], cat.key) - currentVal) < 1e-6) {
        j++;
      }

      // Roto points from 1 (last) to numTeams (first)
      let sumRoto = 0;
      for (let k = i; k < j; k++) {
        sumRoto += (numTeams - k);
      }
      const avgPoints = sumRoto / (j - i);

      for (let k = i; k < j; k++) {
        const tEntry = pointsMap.get(sorted[k].teamId)!;
        tEntry.categoryPoints[cat.key] = avgPoints;
        tEntry.totalPoints += avgPoints;
      }

      i = j;
    }
  }

  // Calculate final team rank
  const ranked = [...pointsMap.entries()].sort((a, b) => b[1].totalPoints - a[1].totalPoints);
  const result = new Map<string, StandingsScore>();

  ranked.forEach(([teamId, data], idx) => {
    result.set(teamId, {
      teamId,
      totalPoints: data.totalPoints,
      rank: idx + 1,
      categoryPoints: data.categoryPoints,
    });
  });

  return result;
}

function getCategoryValue(totals: TeamAggregateTotals, key: string): number {
  switch (key) {
    case 'G': return totals.g;
    case 'A': return totals.a;
    case 'PTS': return totals.pts;
    case 'PLUS_MINUS': return totals.plusMinus;
    case 'PPP': return totals.ppp;
    case 'SOG': return totals.sog;
    case 'HIT': return totals.hit;
    case 'BLK': return totals.blk;
    case 'PIM': return totals.pim;
    case 'W': return totals.w;
    case 'GAA': return totals.gaa;
    case 'SV_PCT': return totals.savePctg;
    case 'SV': return totals.saves;
    case 'SO': return totals.so;
    default: return 0;
  }
}

export function runMonteCarloSimulation(
  league: FantasyLeague,
  players: Player[],
  proposal: TradeProposal,
  config: SimulationConfig
): SimulationResult {
  const startTime = performance.now();
  const playersMap = new Map<number, Player>();
  for (const p of players) {
    playersMap.set(p.id, p);
  }

  const volatilityMultiplier =
    config.injuryVolatility === 'LOW' ? 0.7 : config.injuryVolatility === 'HIGH' ? 1.4 : 1.0;

  const userTeam = league.teams.find((t) => t.isUserTeam) ?? league.teams[0];
  const targetTeam = league.teams.find((t) => t.id === proposal.targetTeamId) ?? league.teams[1];

  // Post-trade rosters
  const postTradeUserPlayerIds = userTeam.playerIds
    .filter((id) => !proposal.givingPlayerIds.includes(id))
    .concat(proposal.receivingPlayerIds);

  const postTradeTargetPlayerIds = targetTeam.playerIds
    .filter((id) => !proposal.receivingPlayerIds.includes(id))
    .concat(proposal.givingPlayerIds);

  const postTradeLeagueTeams = league.teams.map((t) => {
    if (t.id === userTeam.id) {
      return { ...t, playerIds: postTradeUserPlayerIds };
    }
    if (t.id === targetTeam.id) {
      return { ...t, playerIds: postTradeTargetPlayerIds };
    }
    return t;
  });

  // Calculate Cap Impact
  const salaryCapCeiling = league.scoring.salaryCapCeiling || 88000000;
  let baselineCap = 0;
  for (const id of userTeam.playerIds) {
    baselineCap += playersMap.get(id)?.capHit ?? 0;
  }
  let postTradeCap = 0;
  for (const id of postTradeUserPlayerIds) {
    postTradeCap += playersMap.get(id)?.capHit ?? 0;
  }
  const capDelta = postTradeCap - baselineCap;
  const capImpact: CapImpact = {
    baselineCap,
    postTradeCap,
    capDelta,
    salaryCapCeiling,
    baselineSpace: salaryCapCeiling - baselineCap,
    postTradeSpace: salaryCapCeiling - postTradeCap,
    isCompliant: postTradeCap <= salaryCapCeiling,
  };

  const totalTeams = league.teams.length;
  const userBaselinePoints: number[] = [];
  const userPostTradePoints: number[] = [];
  const userBaselineRanks = new Array(totalTeams + 1).fill(0);
  const userPostTradeRanks = new Array(totalTeams + 1).fill(0);

  const baselineTeamWins = new Map<string, number>();
  const postTradeTeamWins = new Map<string, number>();
  const baselineTeamExpectedPoints = new Map<string, number>();
  const postTradeTeamExpectedPoints = new Map<string, number>();

  for (const t of league.teams) {
    baselineTeamWins.set(t.id, 0);
    postTradeTeamWins.set(t.id, 0);
    baselineTeamExpectedPoints.set(t.id, 0);
    postTradeTeamExpectedPoints.set(t.id, 0);
  }

  // Tracking category totals for user team
  const catBaselineTotals: Record<string, { raw: number; pts: number }> = {};
  const catPostTradeTotals: Record<string, { raw: number; pts: number }> = {};
  const categoriesList = [
    ...league.scoring.skaterCategories,
    ...league.scoring.goalieCategories,
  ];

  for (const c of categoriesList) {
    catBaselineTotals[c] = { raw: 0, pts: 0 };
    catPostTradeTotals[c] = { raw: 0, pts: 0 };
  }

  // Monte Carlo Iteration Loop
  for (let iter = 0; iter < config.iterations; iter++) {
    // 1. Simulate baseline
    const baselineTotals = league.teams.map((t) =>
      calculateTeamSeasonTotals(t, playersMap, volatilityMultiplier, config.remainingSeasonPct)
    );
    const baselineScores = scoreRotoStandings(baselineTotals, league.scoring);

    for (const [tId, score] of baselineScores.entries()) {
      if (score.rank === 1) {
        baselineTeamWins.set(tId, (baselineTeamWins.get(tId) ?? 0) + 1);
      }
      baselineTeamExpectedPoints.set(
        tId,
        (baselineTeamExpectedPoints.get(tId) ?? 0) + score.totalPoints
      );
    }

    const userBScore = baselineScores.get(userTeam.id)!;
    userBaselinePoints.push(userBScore.totalPoints);
    userBaselineRanks[userBScore.rank]++;

    const userBTotals = baselineTotals.find((t) => t.teamId === userTeam.id)!;
    for (const c of categoriesList) {
      catBaselineTotals[c].raw += getCategoryValue(userBTotals, c);
      catBaselineTotals[c].pts += userBScore.categoryPoints[c] ?? 0;
    }

    // 2. Simulate post-trade
    const postTradeTotals = postTradeLeagueTeams.map((t) =>
      calculateTeamSeasonTotals(t, playersMap, volatilityMultiplier, config.remainingSeasonPct)
    );
    const postTradeScores = scoreRotoStandings(postTradeTotals, league.scoring);

    for (const [tId, score] of postTradeScores.entries()) {
      if (score.rank === 1) {
        postTradeTeamWins.set(tId, (postTradeTeamWins.get(tId) ?? 0) + 1);
      }
      postTradeTeamExpectedPoints.set(
        tId,
        (postTradeTeamExpectedPoints.get(tId) ?? 0) + score.totalPoints
      );
    }

    const userPTScore = postTradeScores.get(userTeam.id)!;
    userPostTradePoints.push(userPTScore.totalPoints);
    userPostTradeRanks[userPTScore.rank]++;

    const userPTTotals = postTradeTotals.find((t) => t.teamId === userTeam.id)!;
    for (const c of categoriesList) {
      catPostTradeTotals[c].raw += getCategoryValue(userPTTotals, c);
      catPostTradeTotals[c].pts += userPTScore.categoryPoints[c] ?? 0;
    }
  }

  // Sort simulated points for percentile evaluation
  userBaselinePoints.sort((a, b) => a - b);
  userPostTradePoints.sort((a, b) => a - b);

  const baselineWinProb = (baselineTeamWins.get(userTeam.id) ?? 0) / config.iterations;
  const postTradeWinProb = (postTradeTeamWins.get(userTeam.id) ?? 0) / config.iterations;

  let baselineTop3Count = 0;
  let postTradeTop3Count = 0;
  for (let r = 1; r <= 3; r++) {
    baselineTop3Count += userBaselineRanks[r];
    postTradeTop3Count += userPostTradeRanks[r];
  }
  const baselineTop3Prob = baselineTop3Count / config.iterations;
  const postTradeTop3Prob = postTradeTop3Count / config.iterations;

  const baselineExpectedPoints =
    (baselineTeamExpectedPoints.get(userTeam.id) ?? 0) / config.iterations;
  const postTradeExpectedPoints =
    (postTradeTeamExpectedPoints.get(userTeam.id) ?? 0) / config.iterations;

  const baselineRankDist = userBaselineRanks.slice(1).map((cnt) => cnt / config.iterations);
  const postTradeRankDist = userPostTradeRanks.slice(1).map((cnt) => cnt / config.iterations);

  const pointsPercentilesBaseline: PercentileStats = {
    p10: calculatePercentile(userBaselinePoints, 10),
    p25: calculatePercentile(userBaselinePoints, 25),
    p50: calculatePercentile(userBaselinePoints, 50),
    p75: calculatePercentile(userBaselinePoints, 75),
    p90: calculatePercentile(userBaselinePoints, 90),
    mean: baselineExpectedPoints,
  };

  const pointsPercentilesPostTrade: PercentileStats = {
    p10: calculatePercentile(userPostTradePoints, 10),
    p25: calculatePercentile(userPostTradePoints, 25),
    p50: calculatePercentile(userPostTradePoints, 50),
    p75: calculatePercentile(userPostTradePoints, 75),
    p90: calculatePercentile(userPostTradePoints, 90),
    mean: postTradeExpectedPoints,
  };

  // Category breakdown
  const categoryNames: Record<string, string> = {
    G: 'Goals',
    A: 'Assists',
    PTS: 'Points',
    PLUS_MINUS: 'Plus/Minus (+/-)',
    PPP: 'Power Play Points',
    SOG: 'Shots on Goal',
    HIT: 'Hits',
    BLK: 'Blocked Shots',
    PIM: 'Penalty Minutes',
    W: 'Goalie Wins',
    GAA: 'Goals Against Avg',
    SV_PCT: 'Save Percentage',
    SV: 'Saves',
    SO: 'Shutouts',
  };

  const categoryBreakdown: CategoryDelta[] = categoriesList.map((catKey) => {
    const isInverse = league.scoring.inverseCategories.includes(catKey);
    const bPts = catBaselineTotals[catKey].pts / config.iterations;
    const ptPts = catPostTradeTotals[catKey].pts / config.iterations;
    const bRaw = catBaselineTotals[catKey].raw / config.iterations;
    const ptRaw = catPostTradeTotals[catKey].raw / config.iterations;

    return {
      category: catKey,
      name: categoryNames[catKey] ?? catKey,
      isInverse,
      baselinePoints: Number(bPts.toFixed(2)),
      postTradePoints: Number(ptPts.toFixed(2)),
      deltaPoints: Number((ptPts - bPts).toFixed(2)),
      baselineRawStat: Number(bRaw.toFixed(1)),
      postTradeRawStat: Number(ptRaw.toFixed(1)),
      deltaRawStat: Number((ptRaw - bRaw).toFixed(1)),
    };
  });

  // Other teams summary
  const otherTeams = league.teams
    .filter((t) => t.id !== userTeam.id)
    .map((t) => {
      const bWin = (baselineTeamWins.get(t.id) ?? 0) / config.iterations;
      const ptWin = (postTradeTeamWins.get(t.id) ?? 0) / config.iterations;
      const bExp = (baselineTeamExpectedPoints.get(t.id) ?? 0) / config.iterations;
      const ptExp = (postTradeTeamExpectedPoints.get(t.id) ?? 0) / config.iterations;

      return {
        teamId: t.id,
        teamName: t.name,
        baselineWinProb: bWin,
        postTradeWinProb: ptWin,
        deltaWinProb: ptWin - bWin,
        deltaExpectedPoints: ptExp - bExp,
      };
    });

  // Generate Verdict
  const deltaPoints = postTradeExpectedPoints - baselineExpectedPoints;
  const deltaWin = postTradeWinProb - baselineWinProb;
  const deltaTop3 = postTradeTop3Prob - baselineTop3Prob;

  let action: 'STRONG_ACCEPT' | 'ACCEPT' | 'NEUTRAL' | 'DECLINE' | 'STRONG_DECLINE';
  let summary = '';
  const analysisBullets: string[] = [];
  let riskScore: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';

  if (deltaPoints >= 3.5 || deltaWin >= 0.08) {
    action = 'STRONG_ACCEPT';
    summary = 'Significant championship equity upgrade. Clear positive value across critical categories.';
  } else if (deltaPoints >= 1.0 || deltaWin >= 0.02) {
    action = 'ACCEPT';
    summary = 'Favorable trade. Improves expected standings finish and addresses key category needs.';
  } else if (Math.abs(deltaPoints) < 1.0 && Math.abs(deltaWin) < 0.02) {
    action = 'NEUTRAL';
    summary = 'Lateral trade. Shifts category profile without materially improving your championship odds.';
  } else if (deltaPoints >= -3.5 || deltaWin >= -0.08) {
    action = 'DECLINE';
    summary = 'Unfavorable trade. Sacrifices standings equity or weakens your category floor.';
  } else {
    action = 'STRONG_DECLINE';
    summary = 'Damaging trade. Severely erodes your playoff positioning or championship probability.';
  }

  // Risk Score
  const floorDelta = pointsPercentilesPostTrade.p10 - pointsPercentilesBaseline.p10;
  if (floorDelta < -3.0) {
    riskScore = 'HIGH';
  } else if (floorDelta < -1.0) {
    riskScore = 'MEDIUM';
  } else {
    riskScore = 'LOW';
  }

  // Bullet analysis
  const topGainer = [...categoryBreakdown].sort((a, b) => b.deltaPoints - a.deltaPoints)[0];
  const topLoser = [...categoryBreakdown].sort((a, b) => a.deltaPoints - b.deltaPoints)[0];

  if (topGainer && topGainer.deltaPoints > 0.5) {
    analysisBullets.push(`Surges in ${topGainer.name} (+${topGainer.deltaPoints} standings pts, +${topGainer.deltaRawStat} stat delta).`);
  }
  if (topLoser && topLoser.deltaPoints < -0.5) {
    analysisBullets.push(`Costs position in ${topLoser.name} (${topLoser.deltaPoints} standings pts).`);
  }

  // Check for trapped surplus
  for (const c of categoryBreakdown) {
    if (Math.abs(c.deltaRawStat) > 10 && Math.abs(c.deltaPoints) < 0.3) {
      analysisBullets.push(`Category Surplus Warning: Gaining ${c.deltaRawStat} in ${c.name} produces only +${c.deltaPoints} Roto points due to standings clustering.`);
    }
  }

  if (capImpact.capDelta !== 0) {
    analysisBullets.push(
      `Cap Impact: ${capImpact.capDelta > 0 ? '+' : ''}$${(capImpact.capDelta / 1e6).toFixed(2)}M AAV. ${
        capImpact.isCompliant ? 'Remains under $88M ceiling.' : 'WARNING: Exceeds $88M salary cap!'
      }`
    );
  }

  const executionTimeMs = Math.round(performance.now() - startTime);

  return {
    executionTimeMs,
    iterations: config.iterations,
    userTeam: {
      baselineWinProb,
      postTradeWinProb,
      deltaWinProb: deltaWin,
      baselineTop3Prob,
      postTradeTop3Prob,
      deltaTop3Prob: deltaTop3,
      baselineExpectedPoints,
      postTradeExpectedPoints,
      deltaExpectedPoints: deltaPoints,
      baselineRankDist,
      postTradeRankDist,
      pointsPercentilesBaseline,
      pointsPercentilesPostTrade,
      categoryBreakdown,
    },
    otherTeams,
    capImpact,
    verdict: {
      action,
      summary,
      analysisBullets,
      riskScore,
    },
  };
}
