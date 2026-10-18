import { Position } from './player';

export type ScoringType = 'ROTO' | 'H2H_CATEGORIES' | 'H2H_POINTS';

export type SkaterCategory =
  | 'G'
  | 'A'
  | 'PTS'
  | 'PLUS_MINUS'
  | 'PPP'
  | 'SOG'
  | 'HIT'
  | 'BLK'
  | 'PIM';

export type GoalieCategory =
  | 'W'
  | 'GAA'
  | 'SV_PCT'
  | 'SV'
  | 'SO';

export interface LeagueScoringSettings {
  type: ScoringType;
  skaterCategories: SkaterCategory[];
  goalieCategories: GoalieCategory[];
  // For points leagues (if enabled)
  pointsConfig?: Record<string, number>;
  // Categories where lower value is better (e.g. GAA)
  inverseCategories: string[];
  // Salary cap enforcement (optional)
  salaryCapEnabled: boolean;
  salaryCapCeiling: number; // e.g. 88,000,000 ($88M NHL cap)
}

export interface RosterSlotRequirement {
  position: Position;
  count: number;
}

export interface FantasyTeam {
  id: string;
  name: string;
  manager: string;
  isUserTeam: boolean;
  playerIds: number[]; // All drafted players on this team
  activeSkaterIds: number[];
  activeGoalieIds: number[];
  benchPlayerIds: number[];
  // Actual accumulated season stats up to today
  seasonTotals: {
    // Skater totals
    g: number;
    a: number;
    pts: number;
    plusMinus: number;
    ppp: number;
    sog: number;
    hit: number;
    blk: number;
    pim: number;
    // Goalie totals
    w: number;
    ga: number;
    saves: number;
    shotsAgainst: number;
    so: number;
    goalieGamesPlayed: number;
  };
}

export interface FantasyLeague {
  id: string;
  name: string;
  totalTeams: number;
  remainingSeasonPct: number; // e.g. 0.85 = 85% of season remaining
  scoring: LeagueScoringSettings;
  teams: FantasyTeam[];
}
