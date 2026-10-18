export interface TradeProposal {
  targetTeamId: string; // The opposing team in the trade
  givingPlayerIds: number[]; // Players the user team sends away
  receivingPlayerIds: number[]; // Players the user team gets in return
}

export interface SimulationConfig {
  iterations: number; // e.g. 1000, 2500, 5000, 10000
  injuryVolatility: 'LOW' | 'NORMAL' | 'HIGH';
  remainingSeasonPct: number; // 0.10 to 1.00
}

export interface CategoryDelta {
  category: string;
  name: string;
  isInverse: boolean;
  baselinePoints: number;
  postTradePoints: number;
  deltaPoints: number;
  baselineRawStat: number;
  postTradeRawStat: number;
  deltaRawStat: number;
}

export interface PercentileStats {
  p10: number; // 10th percentile (floor / bad health / cold streaks)
  p25: number;
  p50: number; // Median expected outcome
  p75: number;
  p90: number; // 90th percentile (ceiling / heater)
  mean: number;
}

export interface CapImpact {
  baselineCap: number;
  postTradeCap: number;
  capDelta: number;
  salaryCapCeiling: number;
  baselineSpace: number;
  postTradeSpace: number;
  isCompliant: boolean;
}

export interface TeamSimulationSummary {
  teamId: string;
  teamName: string;
  isUserTeam: boolean;
  baseline: {
    winPct: number; // % finish in 1st
    top3Pct: number; // % finish in top 3
    avgRank: number;
    avgRotoPoints: number;
    rotoPointsDist: PercentileStats;
    rankDistribution: number[]; // probability of each rank
  };
  postTrade?: {
    winPct: number;
    top3Pct: number;
    avgRank: number;
    avgRotoPoints: number;
    rotoPointsDist: PercentileStats;
    rankDistribution: number[];
  };
}

export interface SimulationResult {
  executionTimeMs: number;
  iterations: number;
  userTeam: {
    baselineWinProb: number;
    postTradeWinProb: number;
    deltaWinProb: number;

    baselineTop3Prob: number;
    postTradeTop3Prob: number;
    deltaTop3Prob: number;

    baselineExpectedPoints: number;
    postTradeExpectedPoints: number;
    deltaExpectedPoints: number;

    baselineRankDist: number[];
    postTradeRankDist: number[];

    pointsPercentilesBaseline: PercentileStats;
    pointsPercentilesPostTrade: PercentileStats;

    categoryBreakdown: CategoryDelta[];
  };
  otherTeams: Array<{
    teamId: string;
    teamName: string;
    baselineWinProb: number;
    postTradeWinProb: number;
    deltaWinProb: number;
    deltaExpectedPoints: number;
  }>;
  capImpact?: CapImpact;
  verdict: {
    action: 'STRONG_ACCEPT' | 'ACCEPT' | 'NEUTRAL' | 'DECLINE' | 'STRONG_DECLINE';
    summary: string;
    analysisBullets: string[];
    riskScore: 'LOW' | 'MEDIUM' | 'HIGH';
  };
}
