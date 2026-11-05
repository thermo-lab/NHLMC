import { HistoricalTrade } from '../types/historicalTrade';
import { GMRatingStats, GMTradeSummary, GMArchetype } from '../types/generalManager';
import { enrichTradeWithGMs, isGMActive } from '../data/nhlGeneralManagers';

export const GRADE_GPA_MAP: Record<string, number> = {
  'A+': 4.30,
  'A':  4.00,
  'A-': 3.70,
  'B+': 3.30,
  'B':  3.00,
  'B-': 2.70,
  'C+': 2.30,
  'C':  2.00,
  'C-': 1.70,
  'D+': 1.30,
  'D':  1.00,
  'D-': 0.70,
  'F':  0.00,
};

export function gpaToLetter(gpa: number): string {
  if (gpa >= 4.15) return 'A+';
  if (gpa >= 3.85) return 'A';
  if (gpa >= 3.50) return 'A-';
  if (gpa >= 3.15) return 'B+';
  if (gpa >= 2.85) return 'B';
  if (gpa >= 2.50) return 'B-';
  if (gpa >= 2.15) return 'C+';
  if (gpa >= 1.85) return 'C';
  if (gpa >= 1.50) return 'C-';
  if (gpa >= 1.15) return 'D+';
  if (gpa >= 0.85) return 'D';
  if (gpa >= 0.40) return 'D-';
  return 'F';
}

export function gpaToNormalizedScore(gpa: number): number {
  return Number(Math.min(100, Math.max(0, (gpa / 4.30) * 100)).toFixed(1));
}

/**
 * Calculates comprehensive GM ratings across both lenses:
 * 1. At the Time of the Trade (Snapshot Consensus & Perceived Value)
 * 2. How It Turned Out (Retrospective & Legacy Impact)
 */
export function calculateAllGMRatings(rawTrades: HistoricalTrade[]): GMRatingStats[] {
  // 1. Ensure all trades have resolved GM names
  const trades = rawTrades.map((t) => enrichTradeWithGMs(t));

  // 2. Accumulate trades per GM
  const gmMap = new Map<
    string,
    {
      name: string;
      teams: Set<string>;
      years: Set<number>;
      snapshotGpaSum: number;
      retrospectiveGpaSum: number;
      tradeSummaries: GMTradeSummary[];
      wins: number;
      losses: number;
      evens: number;
      fleecingsConducted: number;
      fleecingsSuffered: number;
    }
  >();

  for (const trade of trades) {
    const processParty = (isTeamA: boolean) => {
      const party = isTeamA ? trade.teamA : trade.teamB;
      const oppParty = isTeamA ? trade.teamB : trade.teamA;
      const gmName = party.generalManager;
      if (!gmName || gmName.includes('Front Office')) return;

      if (!gmMap.has(gmName)) {
        gmMap.set(gmName, {
          name: gmName,
          teams: new Set<string>(),
          years: new Set<number>(),
          snapshotGpaSum: 0,
          retrospectiveGpaSum: 0,
          tradeSummaries: [],
          wins: 0,
          losses: 0,
          evens: 0,
          fleecingsConducted: 0,
          fleecingsSuffered: 0,
        });
      }

      const gmEntry = gmMap.get(gmName)!;
      gmEntry.teams.add(party.teamAbbrev);

      const yrMatch = trade.tradeDate.match(/\b(19\d{2}|20\d{2})\b/);
      if (yrMatch) {
        gmEntry.years.add(parseInt(yrMatch[1], 10));
      }

      const snapGpa = GRADE_GPA_MAP[party.snapshotGrade] ?? 3.0;
      const retroGpa = GRADE_GPA_MAP[party.retrospectiveGrade] ?? 3.0;

      gmEntry.snapshotGpaSum += snapGpa;
      gmEntry.retrospectiveGpaSum += retroGpa;

      // Determine outcome role
      const winTeam = trade.historicalOutcome.winningTeam || '';
      let outcomeRole: 'WON' | 'LOST' | 'EVEN' = 'EVEN';

      if (winTeam.includes(party.teamName) || winTeam.includes(party.teamAbbrev)) {
        outcomeRole = 'WON';
        gmEntry.wins++;
        if (trade.historicalOutcome.lopsidednessRating === 'ALL_TIME_FLEECING') {
          gmEntry.fleecingsConducted++;
        }
      } else if (winTeam.includes(oppParty.teamName) || winTeam.includes(oppParty.teamAbbrev)) {
        outcomeRole = 'LOST';
        gmEntry.losses++;
        if (trade.historicalOutcome.lopsidednessRating === 'ALL_TIME_FLEECING') {
          gmEntry.fleecingsSuffered++;
        }
      } else {
        gmEntry.evens++;
      }

      gmEntry.tradeSummaries.push({
        tradeId: trade.id,
        title: trade.title,
        tradeDate: trade.tradeDate,
        seasonEra: trade.seasonEra,
        teamAbbrev: party.teamAbbrev,
        teamName: party.teamName,
        opposingTeamAbbrev: oppParty.teamAbbrev,
        opposingTeamName: oppParty.teamName,
        opposingGM: oppParty.generalManager,
        snapshotGrade: party.snapshotGrade,
        retrospectiveGrade: party.retrospectiveGrade,
        lopsidedness: trade.historicalOutcome.lopsidednessRating,
        outcomeRole,
        headline: trade.headline,
        acquired: party.received || [],
        tradedAway: party.gaveUp || [],
        winningTeam: trade.historicalOutcome.winningTeam,
        championshipImpact: trade.historicalOutcome.championshipImpact,
        successSummary: isTeamA
          ? trade.historicalOutcome.teamASuccessSummary
          : trade.historicalOutcome.teamBSuccessSummary,
      });
    };

    processParty(true);
    processParty(false);
  }

  // 3. Build statistics array
  const results: GMRatingStats[] = [];

  for (const [name, data] of gmMap.entries()) {
    const total = data.tradeSummaries.length;
    if (total === 0) continue;

    const snapshotGpa = Number((data.snapshotGpaSum / total).toFixed(2));
    const retrospectiveGpa = Number((data.retrospectiveGpaSum / total).toFixed(2));
    const snapshotScore = gpaToNormalizedScore(snapshotGpa);
    const retrospectiveScore = gpaToNormalizedScore(retrospectiveGpa);
    const hindsightDrift = Number((retrospectiveScore - snapshotScore).toFixed(1));

    const sortedYears = Array.from(data.years).sort((a, b) => a - b);
    const minYr = sortedYears[0] || 2000;
    const maxYr = sortedYears[sortedYears.length - 1] || 2026;
    const activeSpan = minYr === maxYr ? `${minYr}` : `${minYr} - ${maxYr}`;
    const isActive = isGMActive(name) || maxYr >= 2024;

    const winPctg = total > 0 ? Number(((data.wins / total) * 100).toFixed(1)) : 50.0;

    // Determine Archetype
    let archetype: GMArchetype = 'BALANCED_DEALMAKER';
    let archetypeLabel = 'Balanced Dealmaker';

    if (hindsightDrift >= 6.0 && retrospectiveScore >= 74) {
      archetype = 'VISIONARY_MASTERMIND';
      archetypeLabel = 'Visionary Mastermind';
    } else if (data.fleecingsConducted >= 2 || (retrospectiveScore >= 82 && winPctg >= 60)) {
      archetype = 'CHAMPIONSHIP_ARCHITECT';
      archetypeLabel = 'Championship Architect';
    } else if (retrospectiveScore >= 76 && winPctg >= 52) {
      archetype = 'CONSISTENT_OPERATOR';
      archetypeLabel = 'Consistent Operator';
    } else if (hindsightDrift <= -7.0 && data.fleecingsSuffered > 0) {
      archetype = 'FLEECED';
      archetypeLabel = 'Frequently Fleeced';
    } else if (hindsightDrift <= -6.0) {
      archetype = 'DAY_ONE_MIRAGE';
      archetypeLabel = 'Day-1 Press Conference Mirage';
    }

    results.push({
      name,
      totalTrades: total,
      teamsServed: Array.from(data.teams),
      activeSpan,
      isActive,
      snapshotGpa,
      snapshotScore,
      snapshotGrade: gpaToLetter(snapshotGpa),
      snapshotRank: 0,
      retrospectiveGpa,
      retrospectiveScore,
      retrospectiveGrade: gpaToLetter(retrospectiveGpa),
      retrospectiveRank: 0,
      hindsightDrift,
      archetype,
      archetypeLabel,
      wins: data.wins,
      losses: data.losses,
      evenTrades: data.evens,
      winPctg,
      fleecingsConducted: data.fleecingsConducted,
      fleecingsSuffered: data.fleecingsSuffered,
      trades: data.tradeSummaries,
    });
  }

  // 4. Assign ranks
  // Retrospective ranking
  results.sort((a, b) => {
    if (b.retrospectiveScore !== a.retrospectiveScore) {
      return b.retrospectiveScore - a.retrospectiveScore;
    }
    return b.totalTrades - a.totalTrades;
  });
  results.forEach((gm, idx) => {
    gm.retrospectiveRank = idx + 1;
  });

  // Snapshot ranking
  const bySnapshot = [...results].sort((a, b) => {
    if (b.snapshotScore !== a.snapshotScore) {
      return b.snapshotScore - a.snapshotScore;
    }
    return b.totalTrades - a.totalTrades;
  });
  bySnapshot.forEach((gm, idx) => {
    const target = results.find((r) => r.name === gm.name);
    if (target) target.snapshotRank = idx + 1;
  });

  return results;
}
