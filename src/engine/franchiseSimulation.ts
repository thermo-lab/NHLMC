import { NHLTeam, FranchiseTradeProposal, FranchiseTradeEvaluation, FranchiseSimulationSummary } from '../types/franchise';
import { Player } from '../types/player';
import { NHLProspect } from '../types/prospect';
import { INITIAL_PROSPECTS } from '../data/nhlProspects';
import { samplePoisson, sampleNormal } from './distributions';

export function evaluateFranchiseTrade(
  franchises: NHLTeam[],
  players: Player[],
  proposal: FranchiseTradeProposal,
  iterations: number = 2000,
  prospectsList: NHLProspect[] = INITIAL_PROSPECTS
): FranchiseTradeEvaluation {
  const startTime = performance.now();
  const playersMap = new Map<number, Player>();
  for (const p of players) playersMap.set(p.id, p);

  const teamA = franchises.find((t) => t.id === proposal.teamAId) ?? franchises[0];
  const teamB = franchises.find((t) => t.id === proposal.teamBId) ?? franchises[1];

  // Calculate Cap Impacts
  const capCeiling = 88000000; // $88M NHL Salary Cap
  let teamASendingSalary = 0;
  for (const pid of proposal.teamAPlayerIds) {
    teamASendingSalary += playersMap.get(pid)?.capHit ?? 0;
  }

  let teamBSendingSalary = 0;
  for (const pid of proposal.teamBPlayerIds) {
    teamBSendingSalary += playersMap.get(pid)?.capHit ?? 0;
  }

  // Handle salary retention if present
  let teamARetainedSalary = 0;
  let teamBRetainedSalary = 0;
  if (proposal.salaryRetention) {
    for (const ret of proposal.salaryRetention) {
      const p = playersMap.get(ret.playerId);
      if (p) {
        const retainedAmt = p.capHit * (ret.retainedPct / 100);
        if (ret.retainingTeamId === teamA.id) {
          teamARetainedSalary += retainedAmt;
        } else if (ret.retainingTeamId === teamB.id) {
          teamBRetainedSalary += retainedAmt;
        }
      }
    }
  }

  // Exact conservation of salary cap across both franchises under retention
  const teamAPostTradePayroll =
    teamA.activePayroll - (teamASendingSalary - teamARetainedSalary) + (teamBSendingSalary - teamBRetainedSalary);
  const teamBPostTradePayroll =
    teamB.activePayroll - (teamBSendingSalary - teamBRetainedSalary) + (teamASendingSalary - teamARetainedSalary);

  const teamACapDelta = teamAPostTradePayroll - teamA.activePayroll;
  const teamBCapDelta = teamBPostTradePayroll - teamB.activePayroll;

  // Calculate On-Ice Rating Shifts for Team A and Team B
  const calculatePlayerImpact = (p: Player) => {
    if (p.playerType === 'goalie') {
      const g = p.actualStats.goalie;
      const gp = g?.gamesPlayed ?? 0;
      let svPct = 0.905;
      if (gp >= 5 && g?.savePercentage) {
        svPct = g.savePercentage;
      } else if (p.projections?.rosSavePctg && p.projections.rosSavePctg > 0.905) {
        svPct = p.projections.rosSavePctg;
      } else if (p.capHit >= 6000000) {
        // Elite franchise starter (Hellebuyck, Shesterkin, Swayman, Vasilevskiy, Sorokin)
        svPct = 0.917;
      } else if (p.capHit >= 3500000) {
        svPct = 0.910;
      }
      // League average SV% is ~0.902. Each 0.010 above league average is ~0.30 goals per 60 saved
      const gsaxPer60 = (svPct - 0.902) * 30.0;
      const xgaReduction = Math.max(0.10, Math.min(0.65, gsaxPer60));
      return { xgf: 0, xga: -Number(xgaReduction.toFixed(2)), isGoalie: true };
    }

    const skater = p.actualStats.skater;
    const gp = skater?.gamesPlayed && skater.gamesPlayed > 0 ? skater.gamesPlayed : 20;
    const rawPts = skater?.points ?? 20;
    const rawGoals = skater?.goals ?? 10;

    // Bayesian regression to 82-game pace:
    // weight actual sample by gp / (gp + 15), regressing the rest to league average (45 pts, 18 goals)
    const weight = Math.min(1.0, gp / (gp + 15));
    const pacePts = ((rawPts / gp) * 82) * weight + 45 * (1 - weight);
    const paceGoals = ((rawGoals / gp) * 82) * weight + 18 * (1 - weight);

    const isDef = p.primaryPosition === 'D';

    const xgf = (pacePts / 82) * 0.35 + (paceGoals / 82) * 0.15;
    const xga = isDef ? -0.22 : -0.06;
    return { xgf, xga, isGoalie: false };
  };

  let teamANetXgfShift = 0;
  let teamANetXgaShift = 0;
  for (const pid of proposal.teamBPlayerIds) {
    const p = playersMap.get(pid);
    if (p) {
      const imp = calculatePlayerImpact(p);
      teamANetXgfShift += imp.xgf;
      teamANetXgaShift += imp.xga;
    }
  }
  for (const pid of proposal.teamAPlayerIds) {
    const p = playersMap.get(pid);
    if (p) {
      const imp = calculatePlayerImpact(p);
      teamANetXgfShift -= imp.xgf;
      teamANetXgaShift -= imp.xga;
    }
  }

  const teamBNetXgfShift = -teamANetXgfShift;
  const teamBNetXgaShift = -teamANetXgaShift;

  const teamAPostXgf = Math.max(1.8, Number((teamA.xgfPer60 + teamANetXgfShift).toFixed(2)));
  const teamAPostXga = Math.max(1.8, Number((teamA.xgaPer60 + teamANetXgaShift).toFixed(2)));
  const teamBPostXgf = Math.max(1.8, Number((teamB.xgfPer60 + teamBNetXgfShift).toFixed(2)));
  const teamBPostXga = Math.max(1.8, Number((teamB.xgaPer60 + teamBNetXgaShift).toFixed(2)));

  // Monte Carlo Simulation of 82-Game Season & 4-Round Stanley Cup Playoffs
  let teamABaselineWins = 0;
  let teamABaselinePointsSum = 0;
  let teamABaselinePlayoffCount = 0;
  let teamABaselineCupCount = 0;

  let teamAPostTradeWins = 0;
  let teamAPostTradePointsSum = 0;
  let teamAPostTradePlayoffCount = 0;
  let teamAPostTradeCupCount = 0;

  let teamBBaselinePointsSum = 0;
  let teamBBaselinePlayoffCount = 0;
  let teamBBaselineCupCount = 0;

  let teamBPostTradePointsSum = 0;
  let teamBPostTradePlayoffCount = 0;
  let teamBPostTradeCupCount = 0;

  const remainingGames = 70;

  for (let iter = 0; iter < iterations; iter++) {
    // 1. Simulate Baseline Season Points for Team A & B
    const basePtsA =
      teamA.record.points +
      simulateRemainingGames(teamA.xgfPer60, teamA.xgaPer60, remainingGames);
    const basePtsB =
      teamB.record.points +
      simulateRemainingGames(teamB.xgfPer60, teamB.xgaPer60, remainingGames);

    teamABaselinePointsSum += basePtsA;
    teamBBaselinePointsSum += basePtsB;

    // In the NHL, wildcard bubble cutoffs fluctuate from season to season (mean ~93.5 pts, sd ~2.2 pts)
    const playoffCutoffA = sampleNormal(93.5, 2.2);
    const playoffCutoffB = sampleNormal(93.5, 2.2);

    const madePlayoffsBaseA = basePtsA >= playoffCutoffA;
    const madePlayoffsBaseB = basePtsB >= playoffCutoffB;
    if (madePlayoffsBaseA) teamABaselinePlayoffCount++;
    if (madePlayoffsBaseB) teamBBaselinePlayoffCount++;

    // Cup simulation if in playoffs
    if (madePlayoffsBaseA) {
      if (simulatePlayoffRun(teamA.xgfPer60, teamA.xgaPer60)) {
        teamABaselineCupCount++;
      }
    }
    if (madePlayoffsBaseB) {
      if (simulatePlayoffRun(teamB.xgfPer60, teamB.xgaPer60)) {
        teamBBaselineCupCount++;
      }
    }

    // 2. Simulate Post-Trade Season Points
    const postPtsA =
      teamA.record.points + simulateRemainingGames(teamAPostXgf, teamAPostXga, remainingGames);
    const postPtsB =
      teamB.record.points + simulateRemainingGames(teamBPostXgf, teamBPostXga, remainingGames);

    teamAPostTradePointsSum += postPtsA;
    teamBPostTradePointsSum += postPtsB;

    const madePlayoffsPostA = postPtsA >= playoffCutoffA;
    const madePlayoffsPostB = postPtsB >= playoffCutoffB;
    if (madePlayoffsPostA) teamAPostTradePlayoffCount++;
    if (madePlayoffsPostB) teamBPostTradePlayoffCount++;

    if (madePlayoffsPostA) {
      if (simulatePlayoffRun(teamAPostXgf, teamAPostXga)) {
        teamAPostTradeCupCount++;
      }
    }
    if (madePlayoffsPostB) {
      if (simulatePlayoffRun(teamBPostXgf, teamBPostXga)) {
        teamBPostTradeCupCount++;
      }
    }
  }

  const teamABaselineExpPts = teamABaselinePointsSum / iterations;
  const teamAPostExpPts = teamAPostTradePointsSum / iterations;
  const teamABasePlayoffProb = teamABaselinePlayoffCount / iterations;
  const teamAPostPlayoffProb = teamAPostTradePlayoffCount / iterations;
  const teamABaseCupProb = teamABaselineCupCount / iterations;
  const teamAPostCupProb = teamAPostTradeCupCount / iterations;

  const teamBBaselineExpPts = teamBBaselinePointsSum / iterations;
  const teamBPostExpPts = teamBPostTradePointsSum / iterations;
  const teamBBasePlayoffProb = teamBBaselinePlayoffCount / iterations;
  const teamBPostPlayoffProb = teamBPostTradePlayoffCount / iterations;
  const teamBBaseCupProb = teamBBaselineCupCount / iterations;
  const teamBPostCupProb = teamBPostTradeCupCount / iterations;

  const summaryTeamA: FranchiseSimulationSummary = {
    teamId: teamA.id,
    teamName: teamA.name,
    baseline: {
      expectedPoints: Number(teamABaselineExpPts.toFixed(1)),
      playoffProbability: Number(teamABasePlayoffProb.toFixed(3)),
      divisionTitleProb: Number((teamABasePlayoffProb * 0.45).toFixed(3)),
      stanleyCupFinalProb: Number((teamABaseCupProb * 2.2).toFixed(3)),
      stanleyCupWinProb: Number(teamABaseCupProb.toFixed(3)),
      xgfPer60: teamA.xgfPer60,
      xgaPer60: teamA.xgaPer60,
    },
    postTrade: {
      expectedPoints: Number(teamAPostExpPts.toFixed(1)),
      playoffProbability: Number(teamAPostPlayoffProb.toFixed(3)),
      divisionTitleProb: Number((teamAPostPlayoffProb * 0.45).toFixed(3)),
      stanleyCupFinalProb: Number((teamAPostCupProb * 2.2).toFixed(3)),
      stanleyCupWinProb: Number(teamAPostCupProb.toFixed(3)),
      xgfPer60: teamAPostXgf,
      xgaPer60: teamAPostXga,
    },
    deltas: {
      pointsDelta: Number((teamAPostExpPts - teamABaselineExpPts).toFixed(1)),
      playoffProbDelta: Number((teamAPostPlayoffProb - teamABasePlayoffProb).toFixed(3)),
      stanleyCupDelta: Number((teamAPostCupProb - teamABaseCupProb).toFixed(3)),
      goalDiffDeltaPer60: Number(((teamAPostXgf - teamAPostXga) - (teamA.xgfPer60 - teamA.xgaPer60)).toFixed(2)),
    },
  };

  const summaryTeamB: FranchiseSimulationSummary = {
    teamId: teamB.id,
    teamName: teamB.name,
    baseline: {
      expectedPoints: Number(teamBBaselineExpPts.toFixed(1)),
      playoffProbability: Number(teamBBasePlayoffProb.toFixed(3)),
      divisionTitleProb: Number((teamBBasePlayoffProb * 0.45).toFixed(3)),
      stanleyCupFinalProb: Number((teamBBaseCupProb * 2.2).toFixed(3)),
      stanleyCupWinProb: Number(teamBBaseCupProb.toFixed(3)),
      xgfPer60: teamB.xgfPer60,
      xgaPer60: teamB.xgaPer60,
    },
    postTrade: {
      expectedPoints: Number(teamBPostExpPts.toFixed(1)),
      playoffProbability: Number(teamBPostPlayoffProb.toFixed(3)),
      divisionTitleProb: Number((teamBPostPlayoffProb * 0.45).toFixed(3)),
      stanleyCupFinalProb: Number((teamBPostCupProb * 2.2).toFixed(3)),
      stanleyCupWinProb: Number(teamBPostCupProb.toFixed(3)),
      xgfPer60: teamBPostXgf,
      xgaPer60: teamBPostXga,
    },
    deltas: {
      pointsDelta: Number((teamBPostExpPts - teamBBaselineExpPts).toFixed(1)),
      playoffProbDelta: Number((teamBPostPlayoffProb - teamBBasePlayoffProb).toFixed(3)),
      stanleyCupDelta: Number((teamBPostCupProb - teamBBaseCupProb).toFixed(3)),
      goalDiffDeltaPer60: Number(((teamBPostXgf - teamBPostXga) - (teamB.xgfPer60 - teamB.xgaPer60)).toFixed(2)),
    },
  };

  // Calculate Future Capital Assets (Prospects and Draft Picks)
  const prospectsMap = new Map<string, NHLProspect>();
  for (const pr of prospectsList) prospectsMap.set(pr.id, pr);

  let teamACapitalReceived = 0;
  let teamBCapitalReceived = 0;
  const teamAAssetsAcquired: string[] = [];
  const teamBAssetsAcquired: string[] = [];

  // Team A receives Team B's prospects
  if (proposal.teamBProspectIds) {
    for (const prId of proposal.teamBProspectIds) {
      const pr = prospectsMap.get(prId);
      if (pr) {
        teamACapitalReceived += pr.tradeValueScore;
        teamAAssetsAcquired.push(`${pr.name} (${pr.position}, ${pr.potential.replace(/_/g, ' ')})`);
      }
    }
  }

  // Team B receives Team A's prospects
  if (proposal.teamAProspectIds) {
    for (const prId of proposal.teamAProspectIds) {
      const pr = prospectsMap.get(prId);
      if (pr) {
        teamBCapitalReceived += pr.tradeValueScore;
        teamBAssetsAcquired.push(`${pr.name} (${pr.position}, ${pr.potential.replace(/_/g, ' ')})`);
      }
    }
  }

  // Team A receives Team B's draft picks
  if (proposal.teamBDraftPicks) {
    for (const dp of proposal.teamBDraftPicks) {
      const pickVal = dp.round === 1 ? 80 : dp.round === 2 ? 48 : 28;
      teamACapitalReceived += pickVal;
      teamAAssetsAcquired.push(`${dp.year} Round ${dp.round} (${dp.originalTeam}${dp.isProtected ? ' - Protected' : ''})`);
    }
  }

  // Team B receives Team A's draft picks
  if (proposal.teamADraftPicks) {
    for (const dp of proposal.teamADraftPicks) {
      const pickVal = dp.round === 1 ? 80 : dp.round === 2 ? 48 : 28;
      teamBCapitalReceived += pickVal;
      teamBAssetsAcquired.push(`${dp.year} Round ${dp.round} (${dp.originalTeam}${dp.isProtected ? ' - Protected' : ''})`);
    }
  }

  const teamANetCapitalScore = teamACapitalReceived - teamBCapitalReceived;
  const teamBNetCapitalScore = teamBCapitalReceived - teamACapitalReceived;

  // Strategic Analysis and Recommendations
  const isCapCompliantA = teamAPostTradePayroll <= capCeiling;
  const isCapCompliantB = teamBPostTradePayroll <= capCeiling;

  const cupDeltaA = summaryTeamA.deltas.stanleyCupDelta;
  const cupDeltaB = summaryTeamB.deltas.stanleyCupDelta;

  let winner: 'TEAM_A' | 'TEAM_B' | 'EVEN' | 'WIN_WIN' = 'EVEN';
  let actionA: 'EXECUTE' | 'FAVORABLE' | 'LATERAL' | 'WALK_AWAY' = 'LATERAL';
  let actionB: 'EXECUTE' | 'FAVORABLE' | 'LATERAL' | 'WALK_AWAY' = 'LATERAL';

  // Contender vs Rebuilder Win-Win Dynamic
  if (cupDeltaA >= 0.015 && teamBNetCapitalScore >= 50) {
    winner = 'WIN_WIN';
    actionA = 'EXECUTE';
    actionB = 'EXECUTE';
  } else if (cupDeltaB >= 0.015 && teamANetCapitalScore >= 50) {
    winner = 'WIN_WIN';
    actionA = 'EXECUTE';
    actionB = 'EXECUTE';
  } else if (cupDeltaA >= 0.03 && cupDeltaB >= 0.01) {
    winner = 'WIN_WIN';
    actionA = 'EXECUTE';
    actionB = 'EXECUTE';
  } else if (((cupDeltaA >= 0.015 && cupDeltaB < -0.01) || (cupDeltaA >= 0.01 && cupDeltaB <= -0.02)) && teamBNetCapitalScore < 40) {
    winner = 'TEAM_A';
    actionA = 'EXECUTE';
    actionB = 'WALK_AWAY';
  } else if (((cupDeltaB >= 0.015 && cupDeltaA < -0.01) || (cupDeltaB >= 0.01 && cupDeltaA <= -0.02)) && teamANetCapitalScore < 40) {
    winner = 'TEAM_B';
    actionA = 'WALK_AWAY';
    actionB = 'EXECUTE';
  } else if (teamANetCapitalScore >= 70 && cupDeltaA >= -0.01) {
    winner = 'TEAM_A';
    actionA = 'EXECUTE';
    actionB = 'LATERAL';
  } else if (teamBNetCapitalScore >= 70 && cupDeltaB >= -0.01) {
    winner = 'TEAM_B';
    actionA = 'LATERAL';
    actionB = 'EXECUTE';
  } else {
    winner = 'EVEN';
    actionA = cupDeltaA >= 0 ? 'FAVORABLE' : 'LATERAL';
    actionB = cupDeltaB >= 0 ? 'FAVORABLE' : 'LATERAL';
  }

  if (!isCapCompliantA) actionA = 'WALK_AWAY';
  if (!isCapCompliantB) actionB = 'WALK_AWAY';

  const bullets: string[] = [];
  if (cupDeltaA > 0.01) {
    bullets.push(
      `${teamA.name} enhances Stanley Cup championship equity by +${(cupDeltaA * 100).toFixed(1)}% (projected +${summaryTeamA.deltas.pointsDelta} regular season standings points).`
    );
  } else if (cupDeltaA < -0.01 && teamANetCapitalScore <= 0) {
    bullets.push(
      `${teamA.name} compromises immediate Cup window (-${(Math.abs(cupDeltaA) * 100).toFixed(1)}% title probability).`
    );
  }

  if (cupDeltaB > 0.01) {
    bullets.push(
      `${teamB.name} boosts Cup probability by +${(cupDeltaB * 100).toFixed(1)}%.`
    );
  } else if (cupDeltaB < -0.01 && teamBNetCapitalScore <= 0) {
    bullets.push(
      `${teamB.name} compromises immediate Cup window (-${(Math.abs(cupDeltaB) * 100).toFixed(1)}% title probability).`
    );
  }

  if (teamBAssetsAcquired.length > 0) {
    bullets.push(
      `Futures Infusion: ${teamB.name} captures premium pipeline assets [${teamBAssetsAcquired.join(', ')}] — injecting immense surplus value into their franchise timeline.`
    );
  }

  if (teamAAssetsAcquired.length > 0) {
    bullets.push(
      `Futures Infusion: ${teamA.name} acquires key future capital [${teamAAssetsAcquired.join(', ')}].`
    );
  }

  if (!isCapCompliantA) {
    bullets.push(
      `CRITICAL CAP WARNING: ${teamA.name} would be $${((teamAPostTradePayroll - capCeiling) / 1e6).toFixed(2)}M over the $88.0M salary cap!`
    );
  }
  if (!isCapCompliantB) {
    bullets.push(
      `CRITICAL CAP WARNING: ${teamB.name} would be $${((teamBPostTradePayroll - capCeiling) / 1e6).toFixed(2)}M over the $88.0M salary cap!`
    );
  }

  const executionTimeMs = Math.round(performance.now() - startTime);

  return {
    executionTimeMs,
    iterations,
    teamA: summaryTeamA,
    teamB: summaryTeamB,
    capImpact: {
      teamA: {
        postTradePayroll: teamAPostTradePayroll,
        capDelta: teamACapDelta,
        isCapCompliant: isCapCompliantA,
        remainingSpace: capCeiling - teamAPostTradePayroll,
      },
      teamB: {
        postTradePayroll: teamBPostTradePayroll,
        capDelta: teamBCapDelta,
        isCapCompliant: isCapCompliantB,
        remainingSpace: capCeiling - teamBPostTradePayroll,
      },
    },
    futureCapital: {
      teamANetCapitalScore,
      teamBNetCapitalScore,
      teamAAssetsAcquired,
      teamBAssetsAcquired,
    },
    verdict: {
      winner,
      actionRecommendationTeamA: actionA,
      actionRecommendationTeamB: actionB,
      summary:
        winner === 'TEAM_A'
          ? `${teamA.name} captures decisive trade surplus value.`
          : winner === 'TEAM_B'
          ? `${teamB.name} captures significant trade surplus value.`
          : winner === 'WIN_WIN'
          ? 'Classic win-win blockbuster: one team boosts immediate Cup odds while the other lands premium future cornerstone assets.'
          : 'Balanced trade redistributing team flavor with modest net shift in championship odds.',
      strategicAnalysisBullets: bullets,
      contentionWindowAlignment: `${teamA.name} (${teamA.contenderTier.replace(/_/g, ' ')}) ⇄ ${teamB.name} (${teamB.contenderTier.replace(/_/g, ' ')})`,
    },
  };
}

// Simulates remaining games points
function simulateRemainingGames(xgf: number, xga: number, games: number): number {
  let pts = 0;
  for (let g = 0; g < games; g++) {
    const oppXgf = sampleNormal(2.95, 0.35);
    const gf = samplePoisson(xgf);
    const ga = samplePoisson(xga * (oppXgf / 2.95));

    if (gf > ga) {
      pts += 2;
    } else if (gf === ga) {
      // Overtime / Shootout
      pts += Math.random() > 0.48 ? 2 : 1;
    }
  }
  return pts;
}

// Simulates 4-Round Stanley Cup Playoff run (Round 1, Round 2, Conf Final, Cup Final)
function simulatePlayoffRun(xgf: number, xga: number): boolean {
  for (let round = 1; round <= 4; round++) {
    // Playoff opponents average 3.20 xgf / 2.60 xga
    const oppXgf = 3.20 + (round - 1) * 0.1;
    const oppXga = 2.60 - (round - 1) * 0.05;

    const probWinGame = (xgf / oppXga) / ((xgf / oppXga) + (oppXgf / xga));
    
    // Best of 7
    let teamWins = 0;
    let oppWins = 0;
    while (teamWins < 4 && oppWins < 4) {
      if (Math.random() < probWinGame) teamWins++;
      else oppWins++;
    }
    if (teamWins < 4) return false;
  }
  return true;
}
