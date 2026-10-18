export type Conference = 'Eastern' | 'Western';
export type Division = 'Atlantic' | 'Metropolitan' | 'Central' | 'Pacific';
export type ContenderTier = 'STANLEY_CUP_CONTENDER' | 'PLAYOFF_BUBBLE' | 'REBUILDING';

export interface FranchiseRecord {
  gamesPlayed: number;
  wins: number;
  losses: number;
  otLosses: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifferential: number;
  pointPctg: number;
}

export interface NHLTeam {
  id: string; // e.g. "EDM", "FLA", "COL"
  name: string; // "Edmonton Oilers"
  commonName: string; // "Oilers"
  abbrev: string;
  conference: Conference;
  division: Division;
  logoUrl: string;
  contenderTier: ContenderTier;
  
  // Advanced Team Ratings (Per 60 minutes)
  xgfPer60: number; // Expected Goals For per 60 (e.g. 3.40)
  xgaPer60: number; // Expected Goals Against per 60 (e.g. 2.70)
  powerPlayPct: number; // e.g. 25.5%
  penaltyKillPct: number; // e.g. 82.0%
  goalieGsax: number; // Goals Saved Above Expected (e.g. +12.5)

  // Salary Cap Financials ($88.0M Ceiling)
  activePayroll: number; // e.g. 86,500,000
  capSpace: number; // e.g. 1,500,000
  retainedPayroll: number; // e.g. 0

  // Current Standings Record
  record: FranchiseRecord;

  // Active roster player IDs
  rosterPlayerIds: number[];
}

export interface DraftPickAsset {
  id: string;
  year: number; // e.g. 2025, 2026, 2027
  round: 1 | 2 | 3;
  originalTeam: string;
  isProtected?: boolean; // e.g. "Top-10 Lottery Protected"
}

export interface FranchiseTradeProposal {
  teamAId: string; // e.g. "FLA"
  teamBId: string; // e.g. "CGY"
  teamAPlayerIds: number[]; // Players Team A sends to Team B
  teamBPlayerIds: number[]; // Players Team B sends to Team A
  teamADraftPicks?: DraftPickAsset[];
  teamBDraftPicks?: DraftPickAsset[];
  salaryRetention?: {
    playerId: number;
    retainedPct: number; // e.g. 25 or 50%
    retainingTeamId: string;
  }[];
}

export interface FranchiseSimulationSummary {
  teamId: string;
  teamName: string;
  baseline: {
    expectedPoints: number;
    playoffProbability: number; // % make playoffs (0 to 1)
    divisionTitleProb: number;
    stanleyCupFinalProb: number;
    stanleyCupWinProb: number; // % win Stanley Cup (0 to 1)
    xgfPer60: number;
    xgaPer60: number;
  };
  postTrade: {
    expectedPoints: number;
    playoffProbability: number;
    divisionTitleProb: number;
    stanleyCupFinalProb: number;
    stanleyCupWinProb: number;
    xgfPer60: number;
    xgaPer60: number;
  };
  deltas: {
    pointsDelta: number;
    playoffProbDelta: number;
    stanleyCupDelta: number;
    goalDiffDeltaPer60: number;
  };
}

export interface FranchiseTradeEvaluation {
  executionTimeMs: number;
  iterations: number;
  teamA: FranchiseSimulationSummary;
  teamB: FranchiseSimulationSummary;
  capImpact: {
    teamA: {
      postTradePayroll: number;
      capDelta: number;
      isCapCompliant: boolean;
      remainingSpace: number;
    };
    teamB: {
      postTradePayroll: number;
      capDelta: number;
      isCapCompliant: boolean;
      remainingSpace: number;
    };
  };
  verdict: {
    winner: 'TEAM_A' | 'TEAM_B' | 'EVEN' | 'WIN_WIN';
    actionRecommendationTeamA: 'EXECUTE' | 'FAVORABLE' | 'LATERAL' | 'WALK_AWAY';
    actionRecommendationTeamB: 'EXECUTE' | 'FAVORABLE' | 'LATERAL' | 'WALK_AWAY';
    summary: string;
    strategicAnalysisBullets: string[];
    contentionWindowAlignment: string;
  };
}
