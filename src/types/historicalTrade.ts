export interface TradeParty {
  teamName: string;
  teamAbbrev: string;
  teamLogo?: string;
  gaveUp: string[];
  received: string[];
  snapshotGrade: 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D+' | 'D' | 'D-' | 'F';
  retrospectiveGrade: 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D+' | 'D' | 'D-' | 'F';
}

export interface PlayerSnapshotInfo {
  name: string;
  team: string;
  ageAtTrade: number;
  seasonPriorStats: string; // e.g. "82 GP | 42 G | 62 A | 104 PTS"
  contractStatus: string; // e.g. "RFA seeking $9.5M+ / 8-year extension"
  perceivedValue: string; // e.g. "Top-5 power winger in prime"
}

export interface MilestoneEvent {
  year: string;
  dateStr?: string;
  title: string;
  description: string;
  tag: 'CHAMPIONSHIP' | 'AWARD' | 'COLLAPSE' | 'TRADE_TREE' | 'EXTENSION' | 'MILESTONE';
}

export interface TradeTreeEvent {
  team: string;
  year: string;
  event: string;
  details: string;
  result: string;
}

export interface HistoricalTrade {
  id: string;
  title: string;
  tradeDate: string;
  seasonEra: string; // e.g. "Salary Cap Era", "Dead Puck Era", "80s Dynasty Era"
  headline: string;
  summary: string;
  teamA: TradeParty;
  teamB: TradeParty;
  snapshotContext: {
    narrative: string;
    teamAOutlook: string;
    teamBOutlook: string;
    consensusVerdictAtTime: string;
    cupOddsDeltaTeamA: string;
    cupOddsDeltaTeamB: string;
    players: PlayerSnapshotInfo[];
  };
  historicalOutcome: {
    verdictToday: string;
    lopsidednessRating: 'EVEN_WIN_WIN' | 'SLIGHT_EDGE' | 'DECISIVE_WIN' | 'ALL_TIME_FLEECING';
    winningTeam: string;
    teamASuccessSummary: string;
    teamBSuccessSummary: string;
    championshipImpact: string;
    milestones: MilestoneEvent[];
    tradeTreeEvents: TradeTreeEvent[];
  };
}
