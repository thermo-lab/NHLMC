export type Position =
  | 'C'
  | 'LW'
  | 'RW'
  | 'F'
  | 'D'
  | 'UTIL'
  | 'G';

export type PlayerType = 'skater' | 'goalie';

export type InjuryStatus = 'ACTIVE' | 'DTD' | 'IR' | 'LTIR';

export interface SkaterStats {
  gamesPlayed: number;
  goals: number;
  assists: number;
  points: number;
  plusMinus: number;
  powerPlayGoals: number;
  powerPlayPoints: number;
  shortHandedPoints: number;
  shots: number; // SOG
  hits: number;
  blockedShots: number;
  penaltyMinutes: number; // PIM
  shootingPctg: number;
  faceoffWins?: number;
  avgTimeOnIce?: string; // e.g. "21:34"
}

export interface GoalieStats {
  gamesPlayed: number;
  gamesStarted: number;
  wins: number;
  losses: number;
  otLosses: number;
  shutouts: number;
  goalsAgainst: number;
  saves: number;
  shotsAgainst: number;
  goalsAgainstAverage: number; // GAA (inverse)
  savePercentage: number; // SV%
}

export interface PlayerProjections {
  rosGamesRemaining: number;
  // Skaters Rest of Season expectations
  rosGoals?: number;
  rosAssists?: number;
  rosPoints?: number;
  rosPlusMinus?: number;
  rosPPP?: number;
  rosSOG?: number;
  rosHits?: number;
  rosBlocks?: number;
  rosPIM?: number;
  
  // Goalies Rest of Season expectations
  rosGamesStarted?: number;
  rosWins?: number;
  rosGAA?: number;
  rosSavePctg?: number;
  rosSaves?: number;
  rosShutouts?: number;

  // Stochastic Uncertainty / Standard Deviations
  sdPlayingTimePct: number; // e.g. 0.15 (15% standard deviation for line shifts/rest/health)
  sdGoalRate?: number;
  sdAssistRate?: number;
  sdSOGRate?: number;
  sdHitRate?: number;
  sdBlockRate?: number;
  sdPIMRate?: number;
  sdPlusMinus?: number;
  sdSavePctg?: number;
  sdGAARate?: number;
  sdWinRate?: number;
}

export interface Player {
  id: number;
  nhlId: number;
  name: string;
  nhlTeam: string; // e.g. "EDM", "COL", "TOR", "NYR"
  capHit: number; // e.g. 12500000 ($12.5M AAV)
  positions: Position[];
  primaryPosition: Position;
  playerType: PlayerType;
  injuryStatus: InjuryStatus;
  headshotUrl?: string;
  actualStats: {
    skater?: SkaterStats;
    goalie?: GoalieStats;
  };
  projections: PlayerProjections;
}
