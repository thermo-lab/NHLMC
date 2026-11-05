import React, { useState, useMemo } from 'react';
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
  ExternalLink,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { GMRatingStats } from '../types/generalManager';

interface GMLeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  gmRatings: GMRatingStats[];
  onSelectGM: (gmName: string) => void;
}

export const GMLeaderboardModal: React.FC<GMLeaderboardModalProps> = ({
  isOpen,
  onClose,
  gmRatings,
  onSelectGM,
}) => {
  const [activeTab, setActiveTab] = useState<'RETROSPECTIVE' | 'SNAPSHOT' | 'DRIFT'>('RETROSPECTIVE');
  const [search, setSearch] = useState('');
  const [selectedGM, setSelectedGM] = useState<GMRatingStats | null>(null);
  const [minTradesFilter, setMinTradesFilter] = useState<number>(3);
  const [activeOnly, setActiveOnly] = useState<boolean>(false);

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
          gm.teamsServed.some((t) => t.toLowerCase().includes(q))
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

  if (!isOpen) return null;

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

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400';
    if (score >= 75) return 'text-sky-400';
    if (score >= 65) return 'text-amber-400';
    return 'text-rose-400';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-rink-dark border border-brand-500/40 rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-rink-border bg-rink-card/60 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white tracking-tight">
                  NHL General Manager Trade Rating Index
                </h2>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  Dual-Lens
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Comparing Day 1 Consensus (<span className="text-sky-400 font-semibold">Snapshot</span>) against how trades materialized decades later (<span className="text-emerald-400 font-semibold">Retrospective</span>).
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection & Search Filters */}
        <div className="p-4 border-b border-rink-border bg-rink-surface/40 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shrink-0">
          {/* Sorting Lens Tabs */}
          <div className="flex items-center bg-rink-card p-1 rounded-xl border border-rink-border text-xs shrink-0">
            <button
              onClick={() => setActiveTab('RETROSPECTIVE')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === 'RETROSPECTIVE'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>How It Turned Out (Hindsight)</span>
            </button>
            <button
              onClick={() => setActiveTab('SNAPSHOT')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === 'SNAPSHOT'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-900/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>At the Time (Snapshot)</span>
            </button>
            <button
              onClick={() => setActiveTab('DRIFT')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === 'DRIFT'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Hindsight Drift (+/-)</span>
            </button>
          </div>

          {/* Search & Min Trades Filter */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex-1 md:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search GM or Team..."
                className="w-full bg-rink-surface border border-rink-border rounded-lg pl-8 pr-7 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
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

            <select
              value={minTradesFilter}
              onChange={(e) => setMinTradesFilter(parseInt(e.target.value, 10))}
              className="bg-rink-surface border border-rink-border rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none cursor-pointer"
              title="Minimum trades filter"
            >
              <option value={1}>1+ Trades</option>
              <option value={3}>3+ Trades</option>
              <option value={5}>5+ Trades</option>
              <option value={10}>10+ Trades</option>
              <option value={20}>20+ Trades</option>
            </select>

            {/* Active Only Filter */}
            <button
              onClick={() => setActiveOnly(!activeOnly)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition border cursor-pointer shrink-0 ${
                activeOnly
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                  : 'bg-rink-surface text-slate-400 border-rink-border hover:text-white'
              }`}
              title="Show only currently active NHL General Managers"
            >
              <span className={`w-2 h-2 rounded-full ${activeOnly ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              <span>Active GMs Only</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {filteredAndSortedGMs.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              No General Managers found matching criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredAndSortedGMs.map((gm, idx) => {
                const isSelected = selectedGM?.name === gm.name;
                return (
                  <div
                    key={gm.name}
                    className={`bg-rink-card border rounded-xl p-4 transition shadow-sm space-y-3 ${
                      isSelected
                        ? 'border-brand-400 ring-1 ring-brand-400/40 bg-brand-500/5'
                        : 'border-rink-border hover:border-slate-600'
                    }`}
                  >
                    {/* Top Row: Rank, Name, Franchises & Era */}
                    <div className="flex items-start justify-between gap-2 border-b border-rink-border/60 pb-2.5">
                      <div className="flex items-start gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                            idx === 0
                              ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30'
                              : idx === 1
                              ? 'bg-slate-300 text-black'
                              : idx === 2
                              ? 'bg-amber-700 text-white'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          #{idx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-extrabold text-sm text-white tracking-tight">
                              {gm.name}
                            </h3>
                            {gm.isActive && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-1.5 mt-0.5">
                            <span className="font-semibold text-slate-300">
                              {gm.teamsServed.join(', ')}
                            </span>
                            <span>•</span>
                            <span className="font-mono">{gm.activeSpan}</span>
                            <span>•</span>
                            <span>{gm.totalTrades} Trades</span>
                          </div>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold border shrink-0 ${getArchetypeBadge(
                          gm
                        )}`}
                      >
                        {gm.archetypeLabel}
                      </span>
                    </div>

                    {/* Dual-Lens Ratings Display */}
                    <div className="grid grid-cols-3 gap-2 text-center bg-rink-surface/60 p-2.5 rounded-lg border border-rink-border/40">
                      {/* Rating 1: Snapshot */}
                      <div className="space-y-0.5">
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">
                          Day 1 Snapshot
                        </div>
                        <div className={`text-base font-black ${getScoreColor(gm.snapshotScore)}`}>
                          {gm.snapshotScore}
                          <span className="text-xs ml-1 font-bold opacity-80">({gm.snapshotGrade})</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">Rank #{gm.snapshotRank}</div>
                      </div>

                      {/* Rating 2: Retrospective */}
                      <div className="space-y-0.5 border-x border-rink-border/60">
                        <div className="text-[10px] text-emerald-400 uppercase font-semibold">
                          Hindsight Legacy
                        </div>
                        <div className={`text-base font-black ${getScoreColor(gm.retrospectiveScore)}`}>
                          {gm.retrospectiveScore}
                          <span className="text-xs ml-1 font-bold opacity-80">({gm.retrospectiveGrade})</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">Rank #{gm.retrospectiveRank}</div>
                      </div>

                      {/* Hindsight Drift */}
                      <div className="space-y-0.5">
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">
                          Hindsight Gap
                        </div>
                        <div
                          className={`text-base font-black flex items-center justify-center gap-0.5 ${
                            gm.hindsightDrift > 0
                              ? 'text-emerald-400'
                              : gm.hindsightDrift < 0
                              ? 'text-rose-400'
                              : 'text-slate-300'
                          }`}
                        >
                          {gm.hindsightDrift > 0 ? (
                            <TrendingUp className="w-3.5 h-3.5" />
                          ) : gm.hindsightDrift < 0 ? (
                            <TrendingDown className="w-3.5 h-3.5" />
                          ) : null}
                          <span>
                            {gm.hindsightDrift > 0 ? '+' : ''}
                            {gm.hindsightDrift}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {gm.hindsightDrift >= 4 ? 'Aged Great' : gm.hindsightDrift <= -4 ? 'Aged Poorly' : 'Matched Hype'}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action & Record Row */}
                    <div className="flex items-center justify-between text-xs pt-1">
                      <div className="text-slate-400 font-mono text-[11px] flex items-center gap-2">
                        <span>
                          Record:{' '}
                          <span className="font-bold text-white">
                            {gm.wins}W - {gm.losses}L - {gm.evenTrades}E
                          </span>
                        </span>
                        {gm.fleecingsConducted > 0 && (
                          <span className="text-amber-400 font-bold">
                            ⚡ {gm.fleecingsConducted} Fleecing{gm.fleecingsConducted > 1 ? 's' : ''}
                          </span>
                        )}
                        {gm.fleecingsSuffered > 0 && (
                          <span className="text-rose-400 font-bold">
                            ⚠️ {gm.fleecingsSuffered} Fleeced
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setSelectedGM(isSelected ? null : gm)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-semibold transition"
                        >
                          {isSelected ? 'Hide Trades' : `View ${gm.totalTrades} Trades`}
                        </button>
                        <button
                          onClick={() => {
                            onSelectGM(gm.name);
                            onClose();
                          }}
                          className="px-2.5 py-1 rounded bg-brand-600 hover:bg-brand-500 text-white text-[11px] font-bold transition flex items-center gap-1 shadow-sm"
                          title="Filter encyclopedia to this GM"
                        >
                          <span>Filter</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Expandable Trade List for Selected GM */}
                    {isSelected && (
                      <div className="pt-2 border-t border-rink-border/60 space-y-1.5 animate-in fade-in">
                        <div className="text-[11px] uppercase font-bold text-slate-400">
                          Trades Executed by {gm.name}:
                        </div>
                        <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                          {gm.trades.map((t) => (
                            <div
                              key={t.tradeId}
                              className="p-2 rounded bg-rink-surface/80 border border-rink-border/50 text-[11px] space-y-1"
                            >
                              <div className="flex items-center justify-between font-bold">
                                <span className="text-white truncate max-w-[240px]">{t.title}</span>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <span className="text-sky-400 font-mono text-[10px]">
                                    Day 1: {t.snapshotGrade}
                                  </span>
                                  <span>⇄</span>
                                  <span className="text-emerald-400 font-mono text-[10px]">
                                    Hindsight: {t.retrospectiveGrade}
                                  </span>
                                </div>
                              </div>
                              <div className="text-slate-400 text-[10px] flex items-center justify-between">
                                <span>{t.tradeDate} • vs {t.opposingTeamAbbrev} {t.opposingGM ? `(${t.opposingGM})` : ''}</span>
                                <span
                                  className={`font-semibold ${
                                    t.outcomeRole === 'WON'
                                      ? 'text-emerald-400'
                                      : t.outcomeRole === 'LOST'
                                      ? 'text-rose-400'
                                      : 'text-slate-400'
                                  }`}
                                >
                                  {t.outcomeRole === 'WON' ? '✓ Win' : t.outcomeRole === 'LOST' ? '✕ Loss' : '⚖ Even'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-rink-border bg-rink-card/60 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 shrink-0">
          <div>
            Showing <span className="text-white font-bold">{filteredAndSortedGMs.length}</span> General Managers with at least {minTradesFilter} trade(s).
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition"
          >
            Close Index
          </button>
        </div>
      </div>
    </div>
  );
};
