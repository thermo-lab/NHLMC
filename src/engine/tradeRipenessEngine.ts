import { Player } from '../types/player';
import { NHLTeam } from '../types/franchise';
import { NHL_FRANCHISES } from '../data/nhlFranchises';

export type RipenessArchetype =
  | 'BUY_LOW'
  | 'SELL_HIGH'
  | 'EXPIRING_RENTAL'
  | 'BURIED_TALENT'
  | 'CAP_CASUALTY';

export interface TradeTarget {
  player: Player;
  archetype: RipenessArchetype;
  ripenessScore: number; // 0 - 100
  urgencyLabel: 'CRITICAL' | 'HIGH' | 'MODERATE';
  currentPacePts: number;
  expectedPacePts: number;
  paceDelta: number;
  actualShootingPct: number;
  expectedShootingPct: number;
  shootingPctDelta: number;
  diagnosis: string;
  recommendedAction: string;
  keyMetric: {
    label: string;
    value: string;
    subtext: string;
  };
}

export function evaluateTradeTargets(
  players: Player[],
  franchises: NHLTeam[] = []
): TradeTarget[] {
  const teamList = franchises && franchises.length > 0 ? franchises : NHL_FRANCHISES;
  const teamMap = new Map<string, NHLTeam>();
  for (const t of teamList) {
    teamMap.set(t.id, t);
    teamMap.set(t.abbrev, t);
  }

  const targets: TradeTarget[] = [];

  for (const p of players) {
    const cap = p.capHit || 950000;
    const team = teamMap.get(p.nhlTeam);
    const isContender = team?.contenderTier === 'STANLEY_CUP_CONTENDER';
    const isRebuilder = team?.contenderTier === 'REBUILDING';
    const teamCapSpace = team ? team.capSpace : 2000000;
    const teamPayroll = team?.activePayroll || 0;
    const isCapConstrained = teamCapSpace <= 2000000 || teamPayroll >= 87000000;

    // 1. Skater Evaluation
    if (p.playerType === 'skater') {
      const s = p.actualStats?.skater;
      const proj = p.projections;
      if (!s || !proj) continue;

      const gp = s.gamesPlayed || 0;
      if (gp < 4) continue; // Minimum sample of 4 games

      const goals = s.goals || 0;
      const assists = s.assists || 0;
      const pts = s.points ?? (goals + assists);
      const shots = s.shots || 0;
      const isDef = p.primaryPosition === 'D';

      let toiMin = 16.0;
      if (typeof s.avgTimeOnIce === 'string' && s.avgTimeOnIce.includes(':')) {
        const [m, sec] = s.avgTimeOnIce.split(':').map(Number);
        toiMin = (m || 0) + (sec || 0) / 60;
      }

      const currentPacePts = Number(((pts / gp) * 82).toFixed(1));
      const baselineExpectedPts = isDef
        ? Math.max(16, Math.round(toiMin * 1.6 + (cap / 1e6) * 2.0))
        : Math.max(25, Math.round(toiMin * 3.0 + (cap / 1e6) * 3.2));
      const expectedPacePts = baselineExpectedPts;
      const paceDelta = Number((currentPacePts - expectedPacePts).toFixed(1));

      const actualShootingPct = shots > 0 ? Number(((goals / shots) * 100).toFixed(1)) : 10.0;
      const expectedShootingPct = isDef ? 6.2 : 12.4;
      const shootingPctDelta = Number((actualShootingPct - expectedShootingPct).toFixed(1));

      // ARCHETYPE A: BUY_LOW (Unlucky Puck Slump & Underperformance)
      // High shots / ice time or high cap hit, but conversion rate is frozen cold
      if (shots >= 14 && actualShootingPct <= 4.5 && cap >= 3500000) {
        // Ripeness score driven by shot volume and bad-luck gap
        const volumeFactor = Math.min(25, shots);
        const luckFactor = Math.min(35, (expectedShootingPct - actualShootingPct) * 3);
        const pedigreeFactor = Math.min(25, (cap / 1e6) * 2.5);
        const ripenessScore = Math.min(99, Math.round(35 + volumeFactor + luckFactor + pedigreeFactor));

        const projectedGoalSurge = Math.round(((expectedShootingPct - actualShootingPct) / 100) * shots * 2.5);

        targets.push({
          player: p,
          archetype: 'BUY_LOW',
          ripenessScore,
          urgencyLabel: ripenessScore >= 90 ? 'CRITICAL' : ripenessScore >= 80 ? 'HIGH' : 'MODERATE',
          currentPacePts,
          expectedPacePts,
          paceDelta,
          actualShootingPct,
          expectedShootingPct,
          shootingPctDelta,
          diagnosis: `Shooting an ice-cold ${actualShootingPct}% on ${shots} SOG (${expectedShootingPct}% expected). Expected goals model projects a +${Math.max(4, projectedGoalSurge)} goal positive regression surge.`,
          recommendedAction: 'Acquire at discounted valuation before the inevitable scoring correction.',
          keyMetric: {
            label: 'Shooting % Deficit',
            value: `${actualShootingPct}%`,
            subtext: `vs ${expectedShootingPct}% career exp (${shots} SOG)`,
          },
        });
        continue;
      }

      // ARCHETYPE B: SELL_HIGH (Unsustainable Hot Streak)
      // Firing way above expected pace with sky-high shooting %
      if (shots >= 14 && actualShootingPct >= 22.0 && pts >= 6) {
        const streakFactor = Math.min(30, (actualShootingPct - expectedShootingPct) * 1.5);
        const productionFactor = Math.min(30, (pts / gp) * 25);
        const ripenessScore = Math.min(98, Math.round(35 + streakFactor + productionFactor));

        targets.push({
          player: p,
          archetype: 'SELL_HIGH',
          ripenessScore,
          urgencyLabel: ripenessScore >= 88 ? 'CRITICAL' : ripenessScore >= 78 ? 'HIGH' : 'MODERATE',
          currentPacePts,
          expectedPacePts,
          paceDelta,
          actualShootingPct,
          expectedShootingPct,
          shootingPctDelta,
          diagnosis: `Scoring at a scorching ${currentPacePts}-pt pace backed by a ${actualShootingPct}% shooting percentage. Statistical cooling is imminent; asset value is peaked.`,
          recommendedAction: 'Float to trade market immediately to extract maximum future assets or 1st-round draft capital.',
          keyMetric: {
            label: 'Inflated Shooting %',
            value: `${actualShootingPct}%`,
            subtext: `vs ${expectedShootingPct}% expected (+${shootingPctDelta}%)`,
          },
        });
        continue;
      }

      // ARCHETYPE C: EXPIRING_RENTAL (Timeline Mismatch / Seller Inevitability)
      // Quality productive veteran playing for a rebuilding club
      if (isRebuilder && cap >= 4000000 && (pts / gp >= 0.55 || (isDef && toiMin >= 20.0))) {
        const rebuilderFactor = 40;
        const productiveFactor = Math.min(30, (pts / gp) * 35);
        const capFactor = Math.min(20, (cap / 1e6) * 2);
        const ripenessScore = Math.min(95, Math.round(25 + rebuilderFactor + productiveFactor + capFactor));

        targets.push({
          player: p,
          archetype: 'EXPIRING_RENTAL',
          ripenessScore,
          urgencyLabel: ripenessScore >= 85 ? 'HIGH' : 'MODERATE',
          currentPacePts,
          expectedPacePts,
          paceDelta,
          actualShootingPct,
          expectedShootingPct,
          shootingPctDelta,
          diagnosis: `Prime deadline rental asset for ${p.nhlTeam}. Rebuilding timeline dictates liquidating veteran production for high-round draft capital and prospect futures.`,
          recommendedAction: 'Target for contender championship push; seller strongly incentivized to retain salary.',
          keyMetric: {
            label: 'Seller Urgency',
            value: 'High UFA Risk',
            subtext: `${p.nhlTeam} (${team?.contenderTier.replace(/_/g, ' ')})`,
          },
        });
        continue;
      }

      // ARCHETYPE D: BURIED_TALENT (Underutilized Top-Line Upside)
      // High talent / high cap hit playing sheltered or 3rd-line minutes on a deep contender
      if (isContender && cap >= 3500000 && toiMin <= 15.5 && (pts / gp >= 0.40)) {
        const buriedFactor = Math.min(35, (16.0 - toiMin) * 15);
        const pedigreeFactor = Math.min(30, (cap / 1e6) * 4);
        const ripenessScore = Math.min(92, Math.round(30 + buriedFactor + pedigreeFactor));

        targets.push({
          player: p,
          archetype: 'BURIED_TALENT',
          ripenessScore,
          urgencyLabel: ripenessScore >= 82 ? 'HIGH' : 'MODERATE',
          currentPacePts,
          expectedPacePts,
          paceDelta,
          actualShootingPct,
          expectedShootingPct,
          shootingPctDelta,
          diagnosis: `Averaging only ${toiMin.toFixed(1)} TOI on a stacked ${p.nhlTeam} roster. High-efficiency underlying playmaking primed for top-6 breakout on an acquiring club.`,
          recommendedAction: 'Target as cost-effective middle-six trade acquisition with top-line ceiling.',
          keyMetric: {
            label: 'Suppressed Ice Time',
            value: `${toiMin.toFixed(1)} TOI`,
            subtext: `Blocked behind contender depth`,
          },
        });
        continue;
      }

      // ARCHETYPE E: CAP_CASUALTY (Hard Cap Ceiling Squeeze)
      // Big cap hit on a team facing severe cap crunch with suboptimal cost efficiency
      const costPerPoint = cap / Math.max(12, currentPacePts);
      const isUnderperformingAAV =
        (!isDef && cap >= 4000000 && currentPacePts <= 42) ||
        (isDef && cap >= 4000000 && currentPacePts <= 22) ||
        (cap >= 5000000 && (!isDef ? toiMin <= 15.5 : toiMin <= 18.5)) ||
        (cap >= 4500000 && costPerPoint >= 125000);

      if (isCapConstrained && isUnderperformingAAV) {
        const crunchFactor = Math.min(30, Math.max(10, Math.round((2500000 - teamCapSpace) / 80000)));
        const capWeight = Math.min(35, (cap / 1e6) * 3.5);
        const inefficiencyFactor = Math.min(25, Math.round(costPerPoint / 10000));
        const ripenessScore = Math.min(94, Math.max(60, Math.round(20 + crunchFactor + capWeight + inefficiencyFactor * 0.5)));

        targets.push({
          player: p,
          archetype: 'CAP_CASUALTY',
          ripenessScore,
          urgencyLabel: ripenessScore >= 85 ? 'HIGH' : 'MODERATE',
          currentPacePts,
          expectedPacePts,
          paceDelta,
          actualShootingPct,
          expectedShootingPct,
          shootingPctDelta,
          diagnosis: `${p.nhlTeam} has only $${(teamCapSpace / 1e6).toFixed(2)}M cap cushion against the ceiling with an active payroll of $${((teamPayroll) / 1e6).toFixed(1)}M. Carrying a $${(cap / 1e6).toFixed(2)}M AAV cap hit on a ${currentPacePts} pt pace ($${Math.round(costPerPoint).toLocaleString()}/pt) forces management to explore trade relief.`,
          recommendedAction: 'Acquiring franchise holds supreme leverage to demand retention or draft sweeteners.',
          keyMetric: {
            label: 'Cap Hit vs Pace',
            value: `$${(cap / 1e6).toFixed(2)}M AAV`,
            subtext: `${currentPacePts} pt pace ($${(teamCapSpace / 1e6).toFixed(2)}M team space)`,
          },
        });
        continue;
      }
    }

    // 2. Goalie Evaluation
    if (p.playerType === 'goalie') {
      const g = p.actualStats?.goalie;
      const proj = p.projections;
      if (!g || !proj) continue;

      const gp = g.gamesPlayed || 0;
      if (gp < 3) continue;

      const svPct = g.savePercentage || 0.900;
      const rosSvPct = proj.rosSavePctg || 0.910;
      const cap = p.capHit || 1000000;

      // Goalie Buy-Low (Pedigree starter in temporary bad stretch)
      if (cap >= 4000000 && svPct <= 0.895 && rosSvPct >= 0.908) {
        const slumpGap = (rosSvPct - svPct) * 1000;
        const ripenessScore = Math.min(96, Math.round(55 + slumpGap));

        targets.push({
          player: p,
          archetype: 'BUY_LOW',
          ripenessScore,
          urgencyLabel: ripenessScore >= 88 ? 'CRITICAL' : 'HIGH',
          currentPacePts: 0,
          expectedPacePts: 0,
          paceDelta: 0,
          actualShootingPct: 0,
          expectedShootingPct: 0,
          shootingPctDelta: 0,
          diagnosis: `Elite starter enduring a temporary .${Math.round(svPct * 1000)} SV% slump over ${gp} starts. Historically a .${Math.round(rosSvPct * 1000)} cornerstone; defensive breakdowns on ${p.nhlTeam} mask elite underlying technique.`,
          recommendedAction: 'Buy low before baseline save mechanics restore high-danger stabilization.',
          keyMetric: {
            label: 'Save % Slump',
            value: `.${Math.round(svPct * 1000)}`,
            subtext: `vs .${Math.round(rosSvPct * 1000)} baseline (${gp} starts)`,
          },
        });
        continue;
      }

      // Goalie Expiring / Rebuilder Target
      if (isRebuilder && cap >= 3500000 && svPct >= 0.908) {
        const ripenessScore = Math.min(94, Math.round(50 + (svPct - 0.900) * 1500));

        targets.push({
          player: p,
          archetype: 'EXPIRING_RENTAL',
          ripenessScore,
          urgencyLabel: 'HIGH',
          currentPacePts: 0,
          expectedPacePts: 0,
          paceDelta: 0,
          actualShootingPct: 0,
          expectedShootingPct: 0,
          shootingPctDelta: 0,
          diagnosis: `Top-tier goaltender on a rebuilding roster. Contenders needing playoff netminding stability will compete aggressively for services.`,
          recommendedAction: 'Rebuilder should trade for top-round draft capital or elite prospect package.',
          keyMetric: {
            label: 'Netminding Equity',
            value: `.${Math.round(svPct * 1000)} SV%`,
            subtext: `Prime rental for Cup contender`,
          },
        });
        continue;
      }

      // Goalie Cap Casualty (Expensive goalie on tight team)
      if (isCapConstrained && cap >= 3500000 && svPct <= 0.895) {
        const ripenessScore = Math.min(93, Math.round(55 + (cap / 1e6) * 3));

        targets.push({
          player: p,
          archetype: 'CAP_CASUALTY',
          ripenessScore,
          urgencyLabel: ripenessScore >= 85 ? 'HIGH' : 'MODERATE',
          currentPacePts: 0,
          expectedPacePts: 0,
          paceDelta: 0,
          actualShootingPct: 0,
          expectedShootingPct: 0,
          shootingPctDelta: 0,
          diagnosis: `${p.nhlTeam} carries a $${(cap / 1e6).toFixed(2)}M cap hit in net while constrained to $${(teamCapSpace / 1e6).toFixed(2)}M space. Sub-.900 save percentage creates urgent pressure to reallocate salary.`,
          recommendedAction: 'Target for buy-out rehabilitation trade or package with sweetening draft capital.',
          keyMetric: {
            label: 'Goaltender Cap Pressure',
            value: `$${(cap / 1e6).toFixed(2)}M AAV`,
            subtext: `.${Math.round(svPct * 1000)} SV% ($${(teamCapSpace / 1e6).toFixed(2)}M team space)`,
          },
        });
        continue;
      }
    }
  }

  // Sort descending by ripenessScore
  return targets.sort((a, b) => b.ripenessScore - a.ripenessScore);
}
