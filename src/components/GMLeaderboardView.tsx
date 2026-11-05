import React, { useState, useEffect, useMemo } from 'react';
import {
  Trophy,
  Award,
  Search,
  X,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Shield,
  Layers,
  ChevronRight,
  ArrowLeft,
  ExternalLink,
  Flame,
  CheckCircle2,
  Calendar,
  Filter,
  User,
  GitBranch,
} from 'lucide-react';
import { GMRatingStats, GMTradeSummary } from '../types/generalManager';
import { HistoricalTrade } from '../types/historicalTrade';
import { HISTORICAL_TRADES, loadAllHistoricalTrades } from '../data/historicalTrades';
import { calculateAllGMRatings } from '../engine/gmRatings';
import { isGMActive } from '../data/nhlGeneralManagers';

interface GMLeaderboardViewProps {
  onNavigateToTrade?: (tradeId: string) => void;
  onNavigateToArchiveWithGM?: (gmName: string) => void;
  initialSelectedGMName?: string;
}

export const GMLeaderboardView: React.FC<GMLeaderboardViewProps> = ({
  onNavigateToTrade,
  onNavigateToArchiveWithGM,
  initialSelectedGMName,
}) => {
  const [allTrades, setAllTrades] = useState<HistoricalTrade[]>(HISTORICAL_TRADES);
  const [isLoadingAll, setIsLoadingAll] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'RETROSPECTIVE' | 'SNAPSHOT' | 'DRIFT'>('RETROSPECTIVE');
  const [search, setSearch] = useState('');
  const [minTradesFilter, setMinTradesFilter] = useState<number>(3);
  const [activeOnly, setActiveOnly] = useState<boolean>(false);
  const [selectedGMName, setSelectedGMName] = useState<string | null>(initialSelectedGMName || null);

  // Background load all historical trades for full GM archive calculation
  useEffect(() => {
    let isMounted = true;
    loadAllHistoricalTrades()
      .then((loaded) => {
        if (isMounted && loaded && loaded.length > 0) {
          setAllTrades(loaded);
          setIsLoadingAll(false);
        }
      })
      .catch((err) => {
        console.warn('Could not load full archive for GM ratings, using marquee set:', err);
        if (isMounted) setIsLoadingAll(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute all GM ratings
  const gmRatings = useMemo(() => calculateAllGMRatings(allTrades), [allTrades]);

  // Filtered and sorted GMs
  const filteredAndSortedGMs = useMemo(() => {
    let list = gmRatings.filter((gm) => gm.totalTrades >= minTradesFilter);

    if (activeOnly) {
      list = list.filter((gm) => gm.isActive);
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (gm) =>
          gm.name.toLowerCase().includes(q) ||
          gm.teamsServed.some((t) => t.toLowerCase().includes(q)) ||
          gm.trades.some((tr) =>
            tr.title.toLowerCase().includes(q) ||
            tr.acquired.some((a) => a.toLowerCase().includes(q)) ||
            tr.tradedAway.some((t) => t.toLowerCase().includes(q))
          )
      );
    }

    if (activeTab === 'RETROSPECTIVE') {
      return [...list].sort((a, b) => {
        if (b.retrospectiveScore !== a.retrospectiveScore) {
          return b.retrospectiveScore - a.retrospectiveScore;
        }
        return b.totalTrades - a.totalTrades;
      });
    }

    if (activeTab === 'SNAPSHOT') {
      return [...list].sort((a, b) => {
        if (b.snapshotScore !== a.snapshotScore) {
          return b.snapshotScore - a.snapshotScore;
        }
        return b.totalTrades - a.totalTrades;
      });
    }

    // Sort by Hindsight Drift (+/-)
    return [...list].sort((a, b) => {
      if (b.hindsightDrift !== a.hindsightDrift) {
        return b.hindsightDrift - a.hindsightDrift;
      }
      return b.retrospectiveScore - a.retrospectiveScore;
    });
  }, [gmRatings, activeTab, search, minTradesFilter, activeOnly]);

  // Selected GM object
  const selectedGM = useMemo(() => {
    if (!selectedGMName) return null;
    return gmRatings.find((g) => g.name === selectedGMName) || null;
  }, [gmRatings, selectedGMName]);

  const getArchetypeBadge = (gm: GMRatingStats) => {
    switch (gm.archetype) {
      case 'VISIONARY_MASTERMIND':
        return 'bg-purple-950/80 text-purple-300 border-purple-700/60';
      case 'CHAMPIONSHIP_ARCHITECT':
        return 'bg-amber-950/80 text-amber-300 border-amber-700/60';
      case 'CONSISTENT_OPERATOR':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60';
      case 'DAY_ONE_MIRAGE':
        return 'bg-rose-950/80 text-rose-300 border-rose-700/60';
      case 'FLEECED':
        return 'bg-red-950/80 text-red-300 border-red-700/60';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getOutcomeBadge = (role: 'WON' | 'LOST' | 'EVEN', lopsidedness: string) => {
    if (lopsidedness === 'ALL_TIME_FLEECING') {
      return role === 'WON'
        ? { label: '⚡ ALL-TIME FLEECING', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' }
        : { label: '⚠️ FLEECED', color: 'bg-red-500/20 text-red-300 border-red-500/40' };
    }
    if (role === 'WON') {
      return { label: 'WON TRADE', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
    }
    if (role === 'LOST') {
      return { label: 'LOST TRADE', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' };
    }
    return { label: 'EVEN / BALANCED', color: 'bg-slate-800 text-slate-300 border-slate-700' };
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Overview */}
      <div className="bg-rink-card border border-rink-border rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-2">
              <Award className="w-4 h-4" />
              NHL General Manager Trade Rating Index
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300">
                Dual-Lens
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              General Manager Trade Ratings &amp; Legacy Dossier
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-3xl leading-relaxed">
              Every trade in NHL history analyzed through two analytical lenses: the perceived value at the moment of the handshake (<span className="text-sky-400 font-semibold">Snapshot</span>), versus how the assets produced, cups won, and careers matured decades later (<span className="text-emerald-400 font-semibold">Retrospective</span>).
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {selectedGM && (
              <button
                onClick={() => {
                  setSelectedGMName(null);
                  if (typeof window !== 'undefined') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>All GMs Leaderboard</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Container: Split or Detailed View */}
      {selectedGM ? (
        /* Detailed GM Dossier View (Deep-Dive into GM's trades) */
        <div className="space-y-6">
          {/* Back button & Quick Switcher bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-rink-card border border-rink-border p-3.5 rounded-xl shadow-md">
            <button
              onClick={() => {
                setSelectedGMName(null);
                if (typeof window !== 'undefined') {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition border border-slate-700 cursor-pointer shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 text-sky-400" />
              <span>← Back to All GMs Leaderboard</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 hidden sm:inline">Jump to another GM:</span>
              <select
                value={selectedGM.name}
                onChange={(e) => setSelectedGMName(e.target.value)}
                className="bg-rink-surface border border-rink-border rounded-lg px-3 py-1.5 text-xs text-white font-semibold focus:outline-none focus:border-amber-400 cursor-pointer max-w-[200px] truncate"
              >
                {gmRatings.map((g) => (
                  <option key={g.name} value={g.name} className="bg-rink-dark text-white">
                    {g.name} ({g.totalTrades} Trades)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* GM Summary Profile Card */}
          <div className="bg-rink-card border border-rink-border rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rink-border pb-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-brand-500/20 to-purple-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 font-black text-lg shadow-inner shrink-0">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      {selectedGM.name}
                    </h2>
                    {selectedGM.isActive && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-700 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        ACTIVE NHL GM
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 flex flex-wrap items-center gap-2 mt-1">
                    <span className="font-semibold text-slate-200">
                      {selectedGM.teamsServed.join(', ')}
                    </span>
                    <span>•</span>
                    <span className="font-mono">{selectedGM.activeSpan}</span>
                    <span>•</span>
                    <span className="font-bold text-amber-400">{selectedGM.totalTrades} Historical Trades</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                <span className={`text-xs px-3 py-1 rounded-full font-bold border ${getArchetypeBadge(selectedGM)}`}>
                  {selectedGM.archetypeLabel}
                </span>

                {onNavigateToArchiveWithGM && (
                  <button
                    onClick={() => onNavigateToArchiveWithGM(selectedGM.name)}
                    className="px-3 py-1 rounded-lg bg-sky-950/80 hover:bg-sky-900 border border-sky-800 text-sky-300 hover:text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                    title="View and filter all trades by this GM in Historical Encyclopedia"
                  >
                    <span>View in Archive</span>
                    <ExternalLink className="w-3 h-3 text-sky-400" />
                  </button>
                )}
              </div>
            </div>

            {/* Metric Score Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Rating 2: Retrospective (Hindsight) */}
              <div className="bg-rink-surface/80 border border-emerald-900/40 rounded-xl p-3.5 space-y-1">
                <div className="text-[10px] text-emerald-400 uppercase font-black tracking-wider flex items-center justify-between">
                  <span>Hindsight Score</span>
                  <Trophy className="w-3.5 h-3.5" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-emerald-300">{selectedGM.retrospectiveGrade}</span>
                  <span className="text-xs font-mono font-bold text-slate-400">{selectedGM.retrospectiveScore}/100</span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center justify-between pt-0.5">
                  <span>Rank: <strong className="text-white">#{selectedGM.retrospectiveRank}</strong></span>
                  <span className="font-mono">{selectedGM.retrospectiveGpa.toFixed(2)} GPA</span>
                </div>
              </div>

              {/* Rating 1: Snapshot (At the Time) */}
              <div className="bg-rink-surface/80 border border-sky-900/40 rounded-xl p-3.5 space-y-1">
                <div className="text-[10px] text-sky-400 uppercase font-black tracking-wider flex items-center justify-between">
                  <span>Day 1 Snapshot</span>
                  <Award className="w-3.5 h-3.5" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-sky-300">{selectedGM.snapshotGrade}</span>
                  <span className="text-xs font-mono font-bold text-slate-400">{selectedGM.snapshotScore}/100</span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center justify-between pt-0.5">
                  <span>Rank: <strong className="text-white">#{selectedGM.snapshotRank}</strong></span>
                  <span className="font-mono">{selectedGM.snapshotGpa.toFixed(2)} GPA</span>
                </div>
              </div>

              {/* Hindsight Drift */}
              <div className="bg-rink-surface/80 border border-purple-900/40 rounded-xl p-3.5 space-y-1">
                <div className="text-[10px] text-purple-400 uppercase font-black tracking-wider flex items-center justify-between">
                  <span>Hindsight Gap</span>
                  {selectedGM.hindsightDrift >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span
                    className={`text-2xl font-black ${
                      selectedGM.hindsightDrift > 0
                        ? 'text-emerald-400'
                        : selectedGM.hindsightDrift < 0
                        ? 'text-rose-400'
                        : 'text-slate-300'
                    }`}
                  >
                    {selectedGM.hindsightDrift > 0 ? '+' : ''}
                    {selectedGM.hindsightDrift}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">drift</span>
                </div>
                <div className="text-[11px] text-slate-400 truncate pt-0.5">
                  {selectedGM.hindsightDrift >= 5
                    ? 'Greatly Aged Up'
                    : selectedGM.hindsightDrift <= -5
                    ? 'Day 1 Mirage'
                    : 'Matched Day 1 Hype'}
                </div>
              </div>

              {/* Trade Record */}
              <div className="bg-rink-surface/80 border border-rink-border rounded-xl p-3.5 space-y-1">
                <div className="text-[10px] text-slate-400 uppercase font-black tracking-wider flex items-center justify-between">
                  <span>Trade Record</span>
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-white">{selectedGM.wins}W</span>
                  <span className="text-xs text-slate-500 font-bold">-</span>
                  <span className="text-xl font-black text-slate-300">{selectedGM.losses}L</span>
                  <span className="text-xs text-slate-500 font-bold">-</span>
                  <span className="text-xl font-black text-slate-400">{selectedGM.evenTrades}E</span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center justify-between pt-0.5 font-mono">
                  <span>{selectedGM.winPctg.toFixed(0)}% Win Rate</span>
                  {selectedGM.fleecingsConducted > 0 && (
                    <span className="text-amber-400 font-bold">⚡ {selectedGM.fleecingsConducted}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Trade Portfolio Header */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <div>
              <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                <span>Trades Executed by {selectedGM.name}</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {selectedGM.trades.length}
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Detailed asset exchange ledger showing players acquired vs. surrendered, outcome grades, and legacy impact.
              </p>
            </div>
          </div>

          {/* Rich Trade Cards List (Optimized for Mobile) */}
          <div className="space-y-4">
            {selectedGM.trades.map((t) => {
              const outcomeBadge = getOutcomeBadge(t.outcomeRole, t.lopsidedness);
              return (
                <div
                  key={t.tradeId}
                  className="bg-rink-card border border-rink-border hover:border-slate-600 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3.5 transition-all"
                >
                  {/* Top Line: Date, Era, Outcome, Dual Grades */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rink-border/60 pb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 font-semibold flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-brand-400" />
                        {t.tradeDate}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${outcomeBadge.color}`}>
                        {outcomeBadge.label}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">
                        {t.seasonEra}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 bg-rink-surface px-3 py-1 rounded-xl border border-rink-border text-xs">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">Day 1:</span>
                        <span className="font-black text-sky-400">{t.snapshotGrade}</span>
                      </div>
                      <span className="text-slate-600 text-[10px]">➔</span>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">Hindsight:</span>
                        <span className="font-black text-emerald-400">{t.retrospectiveGrade}</span>
                      </div>
                    </div>
                  </div>

                  {/* Title & Opposing GM */}
                  <div>
                    <h4 className="text-base sm:text-lg font-black text-white leading-snug">
                      {t.title}
                    </h4>
                    <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-300">
                        {t.teamAbbrev}
                      </span>
                      <span className="text-slate-500 font-bold">⇄</span>
                      <span className="font-semibold text-slate-300">
                        {t.opposingTeamName || t.opposingTeamAbbrev}
                      </span>
                      {t.opposingGM && (
                        <span className="text-slate-400">
                          (Opposing GM: <strong className="text-slate-200">{t.opposingGM}</strong>)
                        </span>
                      )}
                    </div>
                    {t.headline && (
                      <p className="text-xs text-slate-300 mt-2 leading-relaxed italic bg-rink-surface/50 p-2.5 rounded-lg border border-rink-border/40">
                        "{t.headline}"
                      </p>
                    )}
                  </div>

                  {/* Crucial Assets Section: Acquired vs Traded Away */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    {/* Acquired Assets */}
                    <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-xl p-3.5 space-y-2">
                      <div className="flex items-center justify-between text-xs font-black text-emerald-400 uppercase tracking-wide">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          Acquired by {selectedGM.name} ({t.teamAbbrev})
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400/80">
                          {t.acquired.length} Asset{t.acquired.length === 1 ? '' : 's'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {t.acquired.length > 0 ? (
                          t.acquired.map((item, idx) => (
                            <span
                              key={idx}
                              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-900/30 text-emerald-200 border border-emerald-700/50 flex items-center gap-1 shadow-sm"
                            >
                              <span className="text-emerald-400 font-bold">+</span>
                              <span>{item}</span>
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-500 italic">No assets listed</span>
                        )}
                      </div>
                    </div>

                    {/* Traded Away Assets */}
                    <div className="bg-slate-900/60 border border-slate-700/60 rounded-xl p-3.5 space-y-2">
                      <div className="flex items-center justify-between text-xs font-black text-slate-300 uppercase tracking-wide">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-rose-400" />
                          Traded Away / Surrendered
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {t.tradedAway.length} Asset{t.tradedAway.length === 1 ? '' : 's'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {t.tradedAway.length > 0 ? (
                          t.tradedAway.map((item, idx) => (
                            <span
                              key={idx}
                              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1 shadow-sm"
                            >
                              <span className="text-rose-400 font-bold">−</span>
                              <span>{item}</span>
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-500 italic">Future considerations / No assets listed</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Championship impact badge if present */}
                  {t.championshipImpact && (
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold shadow-sm">
                      <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{t.championshipImpact}</span>
                    </div>
                  )}

                  {/* Success summary narrative */}
                  {t.successSummary && (
                    <div className="text-xs text-slate-300 leading-relaxed bg-rink-surface/70 p-3 rounded-xl border border-rink-border/60">
                      <strong className="text-slate-100 font-semibold">{t.teamAbbrev} Outcome: </strong>
                      {t.successSummary}
                    </div>
                  )}

                  {/* Action Link to Full Trade in Time Machine */}
                  {onNavigateToTrade && (
                    <div className="pt-1 flex justify-end">
                      <button
                        onClick={() => onNavigateToTrade(t.tradeId)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-sky-400 hover:text-white font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <span>Inspect in Trade Time-Machine</span>
                        <ChevronRight className="w-3.5 h-3.5 text-sky-400" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Full Leaderboard Directory View */
        <div className="space-y-4">
          {/* Controls Bar: Sorting Lens Tabs + Search + Active Filter */}
          <div className="bg-rink-card border border-rink-border rounded-2xl p-4 sm:p-5 shadow-lg space-y-3.5">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              {/* Sorting Lens Switcher */}
              <div className="flex items-center bg-rink-surface p-1 rounded-xl border border-rink-border text-xs overflow-x-auto shrink-0">
                <button
                  onClick={() => setActiveTab('RETROSPECTIVE')}
                  className={`px-3.5 py-2 rounded-lg font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    activeTab === 'RETROSPECTIVE'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30 ring-1 ring-emerald-400/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Trophy className="w-3.5 h-3.5" />
                  <span>How It Turned Out (Hindsight)</span>
                </button>
                <button
                  onClick={() => setActiveTab('SNAPSHOT')}
                  className={`px-3.5 py-2 rounded-lg font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    activeTab === 'SNAPSHOT'
                      ? 'bg-sky-600 text-white shadow-md shadow-sky-900/30 ring-1 ring-sky-400/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>At the Time (Snapshot)</span>
                </button>
                <button
                  onClick={() => setActiveTab('DRIFT')}
                  className={`px-3.5 py-2 rounded-lg font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    activeTab === 'DRIFT'
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30 ring-1 ring-purple-400/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Hindsight Drift (+/-)</span>
                </button>
              </div>

              {/* Search input & Active Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search GM, team, or player..."
                    className="w-full bg-rink-surface border border-rink-border rounded-lg pl-8 pr-7 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Active GMs Only Button */}
                <button
                  onClick={() => setActiveOnly(!activeOnly)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition border cursor-pointer shrink-0 ${
                    activeOnly
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                      : 'bg-rink-surface text-slate-400 border-rink-border hover:text-white'
                  }`}
                  title="Filter to show only currently active NHL General Managers"
                >
                  <span className={`w-2 h-2 rounded-full ${activeOnly ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                  <span>Active GMs Only</span>
                </button>

                {/* Min Trades Dropdown */}
                <select
                  value={minTradesFilter}
                  onChange={(e) => setMinTradesFilter(parseInt(e.target.value, 10))}
                  className="bg-rink-surface border border-rink-border rounded-lg px-2.5 py-2 text-xs text-slate-300 focus:outline-none cursor-pointer"
                  title="Minimum trades filter"
                >
                  <option value={1}>1+ Trades</option>
                  <option value={3}>3+ Trades</option>
                  <option value={5}>5+ Trades</option>
                  <option value={10}>10+ Trades</option>
                  <option value={20}>20+ Trades</option>
                </select>
              </div>
            </div>

            {/* Active filters summary */}
            <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 border-t border-rink-border/50">
              <div>
                Showing <strong className="text-white">{filteredAndSortedGMs.length}</strong> of{' '}
                <strong className="text-amber-400">{gmRatings.length}</strong> General Managers
                {isLoadingAll && <span className="ml-2 text-slate-500 italic">(Loading full archive...)</span>}
              </div>

              {(search || activeOnly || minTradesFilter !== 3) && (
                <button
                  onClick={() => {
                    setSearch('');
                    setActiveOnly(false);
                    setMinTradesFilter(3);
                  }}
                  className="text-xs text-amber-400 hover:underline cursor-pointer"
                >
                  Reset Leaderboard Filters
                </button>
              )}
            </div>
          </div>

          {/* GM Grid Cards */}
          {filteredAndSortedGMs.length === 0 ? (
            <div className="text-center py-16 bg-rink-card border border-dashed border-rink-border rounded-2xl">
              <Award className="w-10 h-10 text-slate-500 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-bold text-slate-300">No General Managers found matching criteria.</p>
              <p className="text-xs text-slate-500 mt-1">Try clearing your search query or disabling "Active GMs Only".</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAndSortedGMs.map((gm, idx) => {
                return (
                  <div
                    key={gm.name}
                    className="bg-rink-card border border-rink-border hover:border-brand-500/80 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3.5 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Header: Rank, Name, Active Tag, Archetype */}
                      <div className="flex items-start justify-between gap-2 border-b border-rink-border/60 pb-3">
                        <div className="flex items-start gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 shadow-md ${
                              idx === 0
                                ? 'bg-amber-500 text-black shadow-amber-500/30'
                                : idx === 1
                                ? 'bg-slate-300 text-black shadow-slate-300/30'
                                : idx === 2
                                ? 'bg-amber-700 text-white'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}
                          >
                            #{idx + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h3 className="font-extrabold text-base text-white tracking-tight group-hover:text-amber-300 transition-colors">
                                {gm.name}
                              </h3>
                              {gm.isActive && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 shrink-0">
                                  ACTIVE
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-1.5 mt-0.5">
                              <span className="font-semibold text-slate-300">{gm.teamsServed.join(', ')}</span>
                              <span>•</span>
                              <span className="font-mono">{gm.activeSpan}</span>
                              <span>•</span>
                              <span className="font-semibold text-amber-400/90">{gm.totalTrades} Trades</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Archetype Label */}
                      <div className="pt-2">
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border inline-block ${getArchetypeBadge(gm)}`}>
                          {gm.archetypeLabel}
                        </span>
                      </div>

                      {/* Dual-Lens Score Comparison Grid */}
                      <div className="grid grid-cols-3 gap-2 py-3 text-center">
                        {/* Day 1 Snapshot */}
                        <div className="bg-rink-surface/70 border border-sky-900/30 rounded-xl p-2 space-y-0.5">
                          <div className="text-[9px] text-sky-400 uppercase font-black">Day 1</div>
                          <div className="text-lg font-black text-sky-300">{gm.snapshotGrade}</div>
                          <div className="text-[10px] text-slate-400 font-mono font-bold">{gm.snapshotScore}/100</div>
                          <div className="text-[9px] text-slate-500">Rank #{gm.snapshotRank}</div>
                        </div>

                        {/* Hindsight Retrospective */}
                        <div className="bg-rink-surface/70 border border-emerald-900/30 rounded-xl p-2 space-y-0.5">
                          <div className="text-[9px] text-emerald-400 uppercase font-black">Hindsight</div>
                          <div className="text-lg font-black text-emerald-300">{gm.retrospectiveGrade}</div>
                          <div className="text-[10px] text-slate-400 font-mono font-bold">{gm.retrospectiveScore}/100</div>
                          <div className="text-[9px] text-slate-500">Rank #{gm.retrospectiveRank}</div>
                        </div>

                        {/* Hindsight Gap / Drift */}
                        <div className="bg-rink-surface/70 border border-purple-900/30 rounded-xl p-2 space-y-0.5">
                          <div className="text-[9px] text-purple-400 uppercase font-black">Gap (Drift)</div>
                          <div
                            className={`text-lg font-black flex items-center justify-center gap-0.5 ${
                              gm.hindsightDrift > 0
                                ? 'text-emerald-400'
                                : gm.hindsightDrift < 0
                                ? 'text-rose-400'
                                : 'text-slate-300'
                            }`}
                          >
                            {gm.hindsightDrift > 0 ? '+' : ''}
                            {gm.hindsightDrift}
                          </div>
                          <div className="text-[10px] text-slate-400 font-bold">
                            {gm.hindsightDrift >= 4 ? 'Aged Up' : gm.hindsightDrift <= -4 ? 'Aged Down' : 'Even'}
                          </div>
                        </div>
                      </div>

                      {/* Head to Head Record & Fleecings */}
                      <div className="text-xs text-slate-400 font-mono flex items-center justify-between px-1">
                        <span>Record: <strong className="text-white font-bold">{gm.wins}W - {gm.losses}L - {gm.evenTrades}E</strong></span>
                        {gm.fleecingsConducted > 0 && (
                          <span className="text-amber-400 font-bold">⚡ {gm.fleecingsConducted} Fleecing{gm.fleecingsConducted > 1 ? 's' : ''}</span>
                        )}
                        {gm.fleecingsSuffered > 0 && (
                          <span className="text-rose-400 font-bold">⚠️ {gm.fleecingsSuffered} Fleeced</span>
                        )}
                      </div>
                    </div>

                    {/* Action Button: Opens the rich detailed trades view */}
                    <div className="pt-2 border-t border-rink-border/50">
                      <button
                        onClick={() => {
                          setSelectedGMName(gm.name);
                          if (typeof window !== 'undefined') {
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-brand-500/20 to-purple-500/20 hover:from-amber-500/30 hover:via-brand-500/30 hover:to-purple-500/30 border border-amber-500/30 hover:border-amber-400/60 text-amber-300 font-bold text-xs transition shadow-md cursor-pointer active:scale-95"
                      >
                        <span>View {gm.totalTrades} Trades &amp; Dossier</span>
                        <ChevronRight className="w-4 h-4 text-amber-400" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
