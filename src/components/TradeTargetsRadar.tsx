import React, { useState, useMemo } from 'react';
import {
  Flame,
  TrendingDown,
  TrendingUp,
  Clock,
  DollarSign,
  Layers,
  Search,
  X,
  Sparkles,
  ArrowRightLeft,
  ChevronRight,
  ShieldAlert,
  Info,
  Filter,
  SlidersHorizontal,
  Activity,
  CheckCircle2,
  ArrowUpDown,
} from 'lucide-react';
import { Player } from '../types/player';
import { NHLTeam } from '../types/franchise';
import {
  evaluateTradeTargets,
  TradeTarget,
  RipenessArchetype,
} from '../engine/tradeRipenessEngine';

interface TradeTargetsRadarProps {
  players: Player[];
  franchises: NHLTeam[];
  onLoadPlayerIntoTradeMachine?: (player: Player) => void;
}

export const TradeTargetsRadar: React.FC<TradeTargetsRadarProps> = ({
  players,
  franchises,
  onLoadPlayerIntoTradeMachine,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArchetype, setSelectedArchetype] = useState<string>('ALL');
  const [positionFilter, setPositionFilter] = useState<string>('ALL');
  const [teamFilter, setTeamFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('RIPENESS_DESC');

  // Compute all targets
  const allTargets = useMemo(() => {
    return evaluateTradeTargets(players, franchises);
  }, [players, franchises]);

  // Aggregate stats
  const aggregateStats = useMemo(() => {
    const buyLows = allTargets.filter((t) => t.archetype === 'BUY_LOW');
    const sellHighs = allTargets.filter((t) => t.archetype === 'SELL_HIGH');
    const rentals = allTargets.filter((t) => t.archetype === 'EXPIRING_RENTAL');
    const buried = allTargets.filter((t) => t.archetype === 'BURIED_TALENT');
    const capSqueezes = allTargets.filter((t) => t.archetype === 'CAP_CASUALTY');

    const topBuyLow = buyLows.length > 0 ? buyLows[0] : null;
    const topSellHigh = sellHighs.length > 0 ? sellHighs[0] : null;

    return {
      total: allTargets.length,
      buyLowCount: buyLows.length,
      sellHighCount: sellHighs.length,
      rentalCount: rentals.length,
      buriedCount: buried.length,
      capSqueezeCount: capSqueezes.length,
      topBuyLow,
      topSellHigh,
    };
  }, [allTargets]);

  // Filtered & Sorted targets
  const filteredTargets = useMemo(() => {
    return allTargets
      .filter((t) => {
        // Archetype Filter
        if (selectedArchetype !== 'ALL' && t.archetype !== selectedArchetype) {
          return false;
        }

        // Position Filter
        if (positionFilter !== 'ALL') {
          if (positionFilter === 'G') {
            if (t.player.playerType !== 'goalie') return false;
          } else if (positionFilter === 'F') {
            if (!['C', 'LW', 'RW'].includes(t.player.primaryPosition)) return false;
          } else if (t.player.primaryPosition !== positionFilter) {
            return false;
          }
        }

        // Team Filter
        if (teamFilter !== 'ALL') {
          if (teamFilter === 'CONTENDERS') {
            const team = franchises.find((f) => f.id === t.player.nhlTeam || f.abbrev === t.player.nhlTeam);
            if (team?.contenderTier !== 'STANLEY_CUP_CONTENDER') return false;
          } else if (teamFilter === 'REBUILDERS') {
            const team = franchises.find((f) => f.id === t.player.nhlTeam || f.abbrev === t.player.nhlTeam);
            if (team?.contenderTier !== 'REBUILDING') return false;
          } else if (t.player.nhlTeam !== teamFilter) {
            return false;
          }
        }

        // Search Term
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matches =
            t.player.name.toLowerCase().includes(q) ||
            t.player.nhlTeam.toLowerCase().includes(q) ||
            t.diagnosis.toLowerCase().includes(q);
          if (!matches) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'RIPENESS_DESC') return b.ripenessScore - a.ripenessScore;
        if (sortBy === 'CAP_DESC') return b.player.capHit - a.player.capHit;
        if (sortBy === 'SHOT_DEFICIT_DESC') return a.shootingPctDelta - b.shootingPctDelta;
        if (sortBy === 'PACE_GAP_DESC') return a.paceDelta - b.paceDelta;
        return 0;
      });
  }, [allTargets, selectedArchetype, positionFilter, teamFilter, searchTerm, sortBy, franchises]);

  // Archetype Badge Styles
  const getArchetypeBadge = (arch: RipenessArchetype) => {
    switch (arch) {
      case 'BUY_LOW':
        return {
          label: 'BUY LOW',
          color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          dot: 'bg-emerald-400',
        };
      case 'SELL_HIGH':
        return {
          label: 'SELL HIGH',
          color: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          dot: 'bg-amber-400',
        };
      case 'EXPIRING_RENTAL':
        return {
          label: 'EXPIRING RENTAL',
          color: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
          dot: 'bg-purple-400',
        };
      case 'BURIED_TALENT':
        return {
          label: 'BURIED TALENT',
          color: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
          dot: 'bg-sky-400',
        };
      case 'CAP_CASUALTY':
        return {
          label: 'CAP SQUEEZE',
          color: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
          dot: 'bg-rose-400',
        };
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-rink-card via-rink-card/95 to-sky-950/30 border border-rink-border rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Front-Office Market Intelligence</span>
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>PDO Luck Slump Detection</span>
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold">
              <Clock className="w-3.5 h-3.5" />
              <span>Contract &amp; Window Mismatch</span>
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Trade Target Radar
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl">
            Scan active NHL players ripe for acquisition or trade liquidation. The engine cross-references 
            extreme shooting percentage luck slumps, unsustainable sell-high heaters, buried top-line talent, 
            and rebuilder timeline mismatches to isolate high-leverage trade opportunities.
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 max-w-4xl">
            <div className="bg-rink-surface/80 border border-rink-border rounded-xl p-3 space-y-0.5">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Active Targets</span>
              <div className="text-xl font-black text-white">{aggregateStats.total}</div>
              <span className="text-[10px] text-slate-500">Across 32 NHL franchises</span>
            </div>

            <div className="bg-rink-surface/80 border border-rink-border rounded-xl p-3 space-y-0.5">
              <span className="text-[11px] text-emerald-400 uppercase tracking-wider font-semibold flex items-center gap-1">
                <span>🎯 Buy Low Slumps</span>
              </span>
              <div className="text-xl font-black text-emerald-400">{aggregateStats.buyLowCount}</div>
              <span className="text-[10px] text-slate-500">Sub-5% shooting rates</span>
            </div>

            <div className="bg-rink-surface/80 border border-rink-border rounded-xl p-3 space-y-0.5">
              <span className="text-[11px] text-amber-400 uppercase tracking-wider font-semibold flex items-center gap-1">
                <span>📈 Peak Sell Highs</span>
              </span>
              <div className="text-xl font-black text-amber-400">{aggregateStats.sellHighCount}</div>
              <span className="text-[10px] text-slate-500">&gt;22% shooting heaters</span>
            </div>

            <div className="bg-rink-surface/80 border border-rink-border rounded-xl p-3 space-y-0.5">
              <span className="text-[11px] text-purple-400 uppercase tracking-wider font-semibold flex items-center gap-1">
                <span>⏳ Expiring Rentals</span>
              </span>
              <div className="text-xl font-black text-purple-400">{aggregateStats.rentalCount}</div>
              <span className="text-[10px] text-slate-500">Rebuilder liquidation assets</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Control Console */}
      <div className="bg-rink-card border border-rink-border rounded-xl p-5 shadow-xl space-y-4">
        {/* Row 1: Archetype Pills */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Target Archetype Focus
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'ALL', label: `All Targets (${allTargets.length})` },
              { id: 'BUY_LOW', label: `🎯 Buy Low (${aggregateStats.buyLowCount})` },
              { id: 'SELL_HIGH', label: `📈 Sell High (${aggregateStats.sellHighCount})` },
              { id: 'EXPIRING_RENTAL', label: `⏳ Expiring Rentals (${aggregateStats.rentalCount})` },
              { id: 'BURIED_TALENT', label: `🧊 Buried Talent (${aggregateStats.buriedCount})` },
              { id: 'CAP_CASUALTY', label: `💸 Cap Squeeze (${aggregateStats.capSqueezeCount})` },
            ].map((arch) => (
              <button
                key={arch.id}
                onClick={() => setSelectedArchetype(arch.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  selectedArchetype === arch.id
                    ? 'bg-sky-500 text-slate-950 font-black shadow-lg shadow-sky-500/20'
                    : 'bg-rink-surface text-slate-300 border border-rink-border hover:bg-slate-800'
                }`}
              >
                {arch.label}
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: Search, Position, Team, Sort */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2 border-t border-rink-border">
          {/* Search Box */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search target by name, team, diagnosis..."
              className="w-full bg-rink-surface border border-rink-border text-white text-xs rounded-lg pl-9 pr-8 py-2.5 focus:outline-none focus:border-brand-500 transition-colors"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-700/50 transition-colors"
                title="Clear search text"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Position Select */}
          <div className="md:col-span-2">
            <select
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
              className="w-full bg-rink-surface border border-rink-border text-white text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-brand-500 font-bold"
            >
              <option value="ALL">All Positions</option>
              <option value="F">Forwards (F)</option>
              <option value="C">Centers (C)</option>
              <option value="LW">Left Wing (LW)</option>
              <option value="RW">Right Wing (RW)</option>
              <option value="D">Defense (D)</option>
              <option value="G">Goalies (G)</option>
            </select>
          </div>

          {/* Team / Window Filter */}
          <div className="md:col-span-3">
            <select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              className="w-full bg-rink-surface border border-rink-border text-white text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-brand-500 font-bold"
            >
              <option value="ALL">All 32 Franchises</option>
              <option value="CONTENDERS">Contenders Only (Playoff Clubs)</option>
              <option value="REBUILDERS">Rebuilders &amp; Sellers Only</option>
              <option disabled>──────────</option>
              {franchises.map((f) => (
                <option key={f.id} value={f.abbrev || f.id}>
                  {f.name} ({f.abbrev})
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Selector */}
          <div className="md:col-span-3 relative">
            <ArrowUpDown className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-sky-400 pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-rink-surface border border-rink-border text-white text-xs rounded-lg pl-9 pr-3 py-2.5 focus:outline-none focus:border-brand-500 font-bold cursor-pointer"
              aria-label="Sort Candidates By"
              title="Sort Candidates"
            >
              <option value="RIPENESS_DESC">Sort: Highest Ripeness</option>
              <option value="SHOT_DEFICIT_DESC">Sort: Coldest Shooting % (Buy Low)</option>
              <option value="PACE_GAP_DESC">Sort: Largest Pace Slump Gap</option>
              <option value="CAP_DESC">Sort: Highest Cap Hit AAV</option>
            </select>
          </div>
        </div>
      </div>

      {/* Target Results Count */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <div>
          Showing <span className="font-bold text-white">{filteredTargets.length}</span> high-ripeness candidates
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-slate-500">
          <Info className="w-3.5 h-3.5" />
          <span>Click "Load into Trade Machine" to evaluate offers</span>
        </div>
      </div>

      {/* Targets Grid */}
      {filteredTargets.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredTargets.map((target) => {
            const badge = getArchetypeBadge(target.archetype);
            const p = target.player;
            const s = p.actualStats?.skater;
            const g = p.actualStats?.goalie;
            const isGoalie = p.playerType === 'goalie';

            return (
              <div
                key={p.id}
                className="bg-rink-card border border-rink-border hover:border-slate-700 rounded-2xl p-5 space-y-4 shadow-xl transition-all relative overflow-hidden flex flex-col justify-between"
              >
                {/* Top Row: Headshot + Info + Score Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center space-x-3.5 min-w-0">
                    {p.headshotUrl ? (
                      <img
                        src={p.headshotUrl}
                        alt={p.name}
                        className="w-14 h-14 min-w-[3.5rem] rounded-full object-cover bg-slate-800 border border-slate-700 shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 min-w-[3.5rem] rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white shrink-0">
                        {p.primaryPosition}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-white leading-snug">{p.name}</h3>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${badge.color}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          <span>{badge.label}</span>
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">
                        <span className="font-bold text-slate-300">{p.primaryPosition}</span> •{' '}
                        <span className="text-sky-400 font-semibold">{p.nhlTeam}</span> •{' '}
                        <span className="text-emerald-400 font-semibold">
                          ${(p.capHit / 1e6).toFixed(2)}M AAV
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Ripeness Score Hex / Pill */}
                  <div className="shrink-0 text-right">
                    <div className="inline-flex flex-col items-end">
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-700">
                        <Flame className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-base font-black text-white">{target.ripenessScore}</span>
                        <span className="text-[10px] text-slate-400">/ 100</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1 block">
                        {target.urgencyLabel} RIPENESS
                      </span>
                    </div>
                  </div>
                </div>

                {/* Key Divergence Metric Bar */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                      {target.keyMetric.label}
                    </span>
                    <span className="text-sm font-bold text-white">{target.keyMetric.value}</span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {target.keyMetric.subtext}
                    </span>
                  </div>

                  {!isGoalie ? (
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                        Pace vs Projected
                      </span>
                      <span className="text-sm font-bold text-sky-400">
                        {target.currentPacePts} PTS{' '}
                        <span className="text-slate-400 font-normal text-xs">
                          (vs {target.expectedPacePts} exp)
                        </span>
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {s?.gamesPlayed || 0} GP • {s?.goals || 0}G • {s?.assists || 0}A • {s?.shots || 0} SOG
                      </span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                        Current Record
                      </span>
                      <span className="text-sm font-bold text-sky-400">
                        {g?.wins}-{g?.losses}-{g?.otLosses}{' '}
                        <span className="text-slate-400 font-normal text-xs">
                          ({g?.gamesPlayed} GP)
                        </span>
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {g?.goalsAgainstAverage ? g.goalsAgainstAverage.toFixed(2) : '2.80'} GAA
                      </span>
                    </div>
                  )}
                </div>

                {/* Analytical Diagnosis & Recommendation */}
                <div className="space-y-1.5 text-xs">
                  <p className="text-slate-300 leading-relaxed bg-rink-surface p-3 rounded-lg border border-rink-border text-[11px]">
                    <strong className="text-slate-200 block mb-0.5 font-bold">Scouting &amp; Statistical Diagnosis:</strong>
                    {target.diagnosis}
                  </p>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 px-1">
                    <span className="font-bold text-sky-400">Strategy:</span>
                    <span>{target.recommendedAction}</span>
                  </div>
                </div>

                {/* Footer Action */}
                {onLoadPlayerIntoTradeMachine && (
                  <div className="pt-2 border-t border-rink-border/60 flex justify-end">
                    <button
                      onClick={() => onLoadPlayerIntoTradeMachine(p)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all active:scale-95 shadow-md shadow-sky-500/20"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      <span>Test in Trade Machine</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-rink-card border border-rink-border rounded-2xl p-12 text-center space-y-3">
          <Filter className="w-8 h-8 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Matching Trade Targets</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No players currently match the selected archetype, position, or team filters.
          </p>
          <button
            onClick={() => {
              setSelectedArchetype('ALL');
              setPositionFilter('ALL');
              setTeamFilter('ALL');
              setSearchTerm('');
            }}
            className="px-4 py-2 rounded-lg bg-slate-800 text-slate-200 text-xs font-bold hover:bg-slate-700 transition"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
