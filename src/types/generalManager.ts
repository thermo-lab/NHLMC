import { HistoricalTrade } from './historicalTrade';

export interface GMTenure {
  teamAbbrev: string;
  teamName: string;
  startDate: string; // ISO format "YYYY-MM-DD"
  endDate: string;   // ISO format "YYYY-MM-DD" or "2099-12-31" for active
}

export interface GMInfo {
  name: string;
  tenures: GMTenure[];
}

export interface GMTradeSummary {
  tradeId: string;
  title: string;
  tradeDate: string;
  teamAbbrev: string;
  opposingTeamAbbrev: string;
  opposingGM?: string;
  snapshotGrade: string;
  retrospectiveGrade: string;
  lopsidedness: string;
  outcomeRole: 'WON' | 'LOST' | 'EVEN';
  headline: string;
}

export type GMArchetype =
  | 'VISIONARY_MASTERMIND' // Greatly out-performed Day 1 expectations in hindsight
  | 'CHAMPIONSHIP_ARCHITECT' // Trades repeatedly led to Stanley Cups
  | 'CONSISTENT_OPERATOR'   // Strong, steady positive trade record
  | 'BALANCED_DEALMAKER'    // Fair trades, win-win partner
  | 'DAY_ONE_MIRAGE'        // Won the press conference, lost the future
  | 'FLEECED';              // Severe negative retrospective drift

export interface GMRatingStats {
  name: string;
  totalTrades: number;
  teamsServed: string[];
  activeSpan: string; // e.g. "1987 - 2024"
  isActive: boolean;

  // Rating 1: Snapshot ("At the Time" Consensus & Value)
  snapshotGpa: number; // 0.00 - 4.30 scale
  snapshotScore: number; // 0 - 100 normalized score
  snapshotGrade: string; // "A+", "A", "B+", etc.
  snapshotRank: number;

  // Rating 2: Retrospective ("How It Turned Out" Legacy)
  retrospectiveGpa: number; // 0.00 - 4.30 scale
  retrospectiveScore: number; // 0 - 100 normalized score
  retrospectiveGrade: string; // "A+", "A", "B+", etc.
  retrospectiveRank: number;

  // Delta: Hindsight Edge vs Day-1 Perception
  hindsightDrift: number; // retrospectiveScore - snapshotScore (e.g. +14.2 or -22.5)
  archetype: GMArchetype;
  archetypeLabel: string;

  // Head-to-Head Record
  wins: number;
  losses: number;
  evenTrades: number;
  winPctg: number; // 0 - 100%

  // Fleecing Stats
  fleecingsConducted: number;
  fleecingsSuffered: number;

  trades: GMTradeSummary[];
}
