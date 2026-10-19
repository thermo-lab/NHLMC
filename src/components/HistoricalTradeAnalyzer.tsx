import React, { useState, useEffect, useMemo } from 'react';
import {
  History,
  Calendar,
  Clock,
  Award,
  Trophy,
  AlertOctagon,
  Sparkles,
  GitBranch,
  ChevronRight,
  ChevronLeft,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Flame,
  Search,
  X,
  Filter,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { HistoricalTrade } from '../types/historicalTrade';
import { HISTORICAL_TRADES, loadAllHistoricalTrades } from '../data/historicalTrades';

export const HistoricalTradeAnalyzer: React.FC = () => {
  const [allTrades, setAllTrades] = useState<HistoricalTrade[]>(HISTORICAL_TRADES);
  const [isLoadingAll, setIsLoadingAll] = useState<boolean>(true);
  const [selectedTradeId, setSelectedTradeId] = useState<string>(HISTORICAL_TRADES[0].id);
  const [viewMode, setViewMode] = useState<'SNAPSHOT' | 'RETROSPECTIVE'>('SNAPSHOT');
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'MARQUEE'>('ALL');
  const [eraFilter, setEraFilter] = useState<string>('ALL');
  const [teamFilter, setTeamFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 12;

  // Background load all 2,960+ historical trades
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
        console.warn('Could not load full archive, using marquee trades:', err);
        if (isMounted) setIsLoadingAll(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const marqueeIds = useMemo(() => new Set(HISTORICAL_TRADES.map((t) => t.id)), []);

  const CANONICAL_NHL_TEAMS = useMemo(() => [
    { abbrev: 'ANA', name: 'Anaheim Ducks' },
    { abbrev: 'ARI', name: 'Arizona / Phoenix Coyotes' },
    { abbrev: 'BOS', name: 'Boston Bruins' },
    { abbrev: 'BUF', name: 'Buffalo Sabres' },
    { abbrev: 'CGY', name: 'Calgary Flames' },
    { abbrev: 'CAR', name: 'Carolina Hurricanes' },
    { abbrev: 'CHI', name: 'Chicago Blackhawks' },
    { abbrev: 'COL', name: 'Colorado Avalanche' },
    { abbrev: 'CBJ', name: 'Columbus Blue Jackets' },
    { abbrev: 'DAL', name: 'Dallas Stars' },
    { abbrev: 'DET', name: 'Detroit Red Wings' },
    { abbrev: 'EDM', name: 'Edmonton Oilers' },
    { abbrev: 'FLA', name: 'Florida Panthers' },
    { abbrev: 'LAK', name: 'Los Angeles Kings' },
    { abbrev: 'MIN', name: 'Minnesota Wild' },
    { abbrev: 'MTL', name: 'Montreal Canadiens' },
    { abbrev: 'NSH', name: 'Nashville Predators' },
    { abbrev: 'NJD', name: 'New Jersey Devils' },
    { abbrev: 'NYI', name: 'New York Islanders' },
    { abbrev: 'NYR', name: 'New York Rangers' },
    { abbrev: 'OTT', name: 'Ottawa Senators' },
    { abbrev: 'PHI', name: 'Philadelphia Flyers' },
    { abbrev: 'PIT', name: 'Pittsburgh Penguins' },
    { abbrev: 'SJS', name: 'San Jose Sharks' },
    { abbrev: 'SEA', name: 'Seattle Kraken' },
    { abbrev: 'STL', name: 'St. Louis Blues' },
    { abbrev: 'TBL', name: 'Tampa Bay Lightning' },
    { abbrev: 'TOR', name: 'Toronto Maple Leafs' },
    { abbrev: 'UTA', name: 'Utah Hockey Club' },
    { abbrev: 'VAN', name: 'Vancouver Canucks' },
    { abbrev: 'VGK', name: 'Vegas Golden Knights' },
    { abbrev: 'WSH', name: 'Washington Capitals' },
    { abbrev: 'WPG', name: 'Winnipeg Jets' },
    { abbrev: 'ATL', name: 'Atlanta Thrashers' },
    { abbrev: 'CLR', name: 'Colorado Rockies (1976–82)' },
    { abbrev: 'HFD', name: 'Hartford Whalers' },
    { abbrev: 'MNS', name: 'Minnesota North Stars' },
    { abbrev: 'QUE', name: 'Quebec Nordiques' },
  ], []);

  const availableTeams = CANONICAL_NHL_TEAMS;

  const filteredTrades = useMemo(() => {
    return allTrades.filter((t) => {
      // Category filter
      if (activeCategory === 'MARQUEE' && !marqueeIds.has(t.id)) {
        return false;
      }

      // Era filter
      if (eraFilter !== 'ALL') {
        if (!t.seasonEra.toLowerCase().includes(eraFilter.toLowerCase())) {
          return false;
        }
      }

      // Team filter
      if (teamFilter !== 'ALL') {
        const matchesTeam =
          t.teamA.teamAbbrev === teamFilter ||
          t.teamB.teamAbbrev === teamFilter ||
          t.teamA.teamName.toLowerCase().includes(teamFilter.toLowerCase()) ||
          t.teamB.teamName.toLowerCase().includes(teamFilter.toLowerCase());
        if (!matchesTeam) {
          return false;
        }
      }

      // Search Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = t.title.toLowerCase().includes(q);
        const inHeadline = t.headline.toLowerCase().includes(q);
        const inTeamA = t.teamA.teamName.toLowerCase().includes(q) || t.teamA.teamAbbrev.toLowerCase().includes(q);
        const inTeamB = t.teamB.teamName.toLowerCase().includes(q) || t.teamB.teamAbbrev.toLowerCase().includes(q);
        const inDate = t.tradeDate.toLowerCase().includes(q);
        const inPlayers = t.snapshotContext.players?.some((p) => p.name.toLowerCase().includes(q));
        const inGaveUpA = t.teamA.gaveUp.some((item) => item.toLowerCase().includes(q));
        const inReceivedA = t.teamA.received.some((item) => item.toLowerCase().includes(q));

        if (!inTitle && !inHeadline && !inTeamA && !inTeamB && !inDate && !inPlayers && !inGaveUpA && !inReceivedA) {
          return false;
        }
      }

      return true;
    });
  }, [allTrades, activeCategory, eraFilter, teamFilter, searchQuery, marqueeIds]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, eraFilter, teamFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredTrades.length / pageSize));
  const paginatedTrades = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTrades.slice(start, start + pageSize);
  }, [filteredTrades, currentPage, pageSize]);

  const selectedTrade = useMemo(() => {
    return (
      allTrades.find((t) => t.id === selectedTradeId) ??
      filteredTrades[0] ??
      allTrades[0]
    );
  }, [allTrades, selectedTradeId, filteredTrades]);

  const getLopsidedBadge = (rating: string) => {
    switch (rating) {
      case 'ALL_TIME_FLEECING':
        return {
          label: 'All-Time Fleecing',
          color: 'bg-red-500/20 text-red-400 border-red-500/40',
          icon: <Flame className="w-3.5 h-3.5 mr-1" />,
        };
      case 'DECISIVE_WIN':
        return {
          label: 'Decisive Victory',
          color: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
          icon: <TrendingUp className="w-3.5 h-3.5 mr-1" />,
        };
      case 'EVEN_WIN_WIN':
        return {
          label: 'Win-Win / Mutual Fit',
          color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
          icon: <Sparkles className="w-3.5 h-3.5 mr-1" />,
        };
      case 'SLIGHT_EDGE':
        return {
          label: 'Slight Value Edge',
          color: 'bg-sky-500/20 text-sky-400 border-sky-500/40',
          icon: <TrendingUp className="w-3.5 h-3.5 mr-1" />,
        };
      default:
        return {
          label: 'Competitive Handshake',
          color: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
          icon: <Sparkles className="w-3.5 h-3.5 mr-1" />,
        };
    }
  };

  const badge = getLopsidedBadge(selectedTrade.historicalOutcome.lopsidednessRating);

  return (
    <div className="space-y-6">
      {/* Top Header & Overview */}
      <div className="bg-rink-card border border-rink-border rounded-xl p-5 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold mb-2">
              <History className="w-3.5 h-3.5" />
              NHL Time-Machine Trade Retrospective Archive
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Historical Trade Encyclopedia & Retrospective
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Inspect thousands of NHL trades through two analytical lenses: the available information at the moment of the handshake (<span className="text-sky-400 font-semibold">Snapshot</span>), versus how the assets materialized and affected franchises years later (<span className="text-emerald-400 font-semibold">Retrospective</span>).
            </p>
          </div>
        </div>
      </div>

      {/* Search, Category & Filter Controls */}
      <div className="bg-rink-card border border-rink-border rounded-xl p-4 shadow-md space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 4,300+ historical trades by player (e.g. Gretzky, Roy, Domi, Selänne, Tkachuk), team, or year..."
              className="w-full bg-rink-surface border border-rink-border rounded-lg pl-10 pr-9 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Tabs & Era Dropdown */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-rink-surface p-1 rounded-lg border border-rink-border text-xs">
              <button
                onClick={() => setActiveCategory('ALL')}
                className={`px-3 py-1.5 rounded font-semibold transition-all flex items-center gap-1.5 ${
                  activeCategory === 'ALL'
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>All Trades ({allTrades.length})</span>
              </button>
              <button
                onClick={() => setActiveCategory('MARQUEE')}
                className={`px-3 py-1.5 rounded font-semibold transition-all flex items-center gap-1.5 ${
                  activeCategory === 'MARQUEE'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>Marquee Blockbusters ({marqueeIds.size})</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5 bg-rink-surface border border-rink-border rounded-lg px-2.5 py-1.5 text-xs text-slate-300">
              <Filter className="w-3 h-3 text-slate-400" />
              <select
                value={eraFilter}
                onChange={(e) => setEraFilter(e.target.value)}
                className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-rink-surface text-white">All Eras</option>
                <option value="2020s" className="bg-rink-surface text-white">2020s</option>
                <option value="2010s" className="bg-rink-surface text-white">2010s</option>
                <option value="2000s" className="bg-rink-surface text-white">2000s</option>
                <option value="Dead Puck" className="bg-rink-surface text-white">1990s</option>
                <option value="80s" className="bg-rink-surface text-white">1980s</option>
              </select>
            </div>

            {/* Team Filter Dropdown */}
            <div className="flex items-center gap-1.5 bg-rink-surface border border-rink-border rounded-lg px-2.5 py-1.5 text-xs text-slate-300">
              <ShieldAlert className="w-3 h-3 text-brand-400" />
              <select
                value={teamFilter}
                onChange={(e) => setTeamFilter(e.target.value)}
                className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer max-w-[140px] truncate"
              >
                <option value="ALL" className="bg-rink-surface text-white">All Teams ({availableTeams.length})</option>
                {availableTeams.map((team) => (
                  <option key={team.abbrev} value={team.abbrev} className="bg-rink-surface text-white">
                    {team.name} ({team.abbrev})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results summary & Pagination header */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-1 border-t border-rink-border/50">
          <div>
            Showing <span className="font-semibold text-white">{filteredTrades.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</span>–<span className="font-semibold text-white">{Math.min(currentPage * pageSize, filteredTrades.length)}</span> of{' '}
            <span className="font-bold text-brand-400">{filteredTrades.length}</span> trades
            {isLoadingAll && <span className="ml-2 text-slate-500 italic">(Loading full archive...)</span>}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded border border-rink-border hover:bg-rink-surface disabled:opacity-30 disabled:hover:bg-transparent text-slate-300"
                title="Previous Page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-slate-300">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded border border-rink-border hover:bg-rink-surface disabled:opacity-30 disabled:hover:bg-transparent text-slate-300"
                title="Next Page"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Trade Cards Grid */}
        {paginatedTrades.length === 0 ? (
          <div className="text-center py-10 bg-rink-surface/50 rounded-xl border border-dashed border-rink-border">
            <AlertOctagon className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">No trades match your search filters.</p>
            <p className="text-xs text-slate-500 mt-1">Try clearing your search query or selecting "All Teams" / "All Eras".</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setEraFilter('ALL');
                setTeamFilter('ALL');
                setActiveCategory('ALL');
              }}
              className="mt-3 px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded text-xs font-semibold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
            {paginatedTrades.map((t) => {
              const isSelected = t.id === selectedTrade.id;
              const isMarquee = marqueeIds.has(t.id);
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedTradeId(t.id)}
                  className={`text-left p-3 rounded-xl border transition-all relative overflow-hidden ${
                    isSelected
                      ? 'bg-rink-card border-brand-500 shadow-md ring-1 ring-brand-500/50'
                      : 'bg-rink-surface/70 border-rink-border hover:border-slate-600 hover:bg-rink-surface'
                  }`}
                >
                  {isMarquee && (
                    <div className="absolute top-0 right-0 bg-amber-500/20 text-amber-300 border-b border-l border-amber-500/30 text-[9px] font-black uppercase px-1.5 py-0.5 rounded-bl">
                      ⭐ Blockbuster
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <Calendar className="w-3 h-3 text-brand-400" />
                      {t.tradeDate}
                    </span>
                    <span className="text-[10px] uppercase font-semibold px-1 py-0.5 rounded bg-slate-800 text-slate-300">
                      {t.seasonEra.includes('(') ? t.seasonEra.split('(')[1].replace(')', '') : t.seasonEra.split(' ')[0]}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white line-clamp-1">{t.title}</h4>
                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-rink-border/50 text-xs">
                    <div className="flex items-center gap-1.5 font-bold">
                      <span className="text-sky-400">{t.teamA.teamAbbrev}</span>
                      <span className="text-slate-500 text-[10px]">⇄</span>
                      <span className="text-emerald-400">{t.teamB.teamAbbrev}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {viewMode === 'SNAPSHOT' ? `Grades: ${t.teamA.snapshotGrade} / ${t.teamB.snapshotGrade}` : `Outcome: ${t.historicalOutcome.winningTeam.split(' ')[0]}`}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Trade Detail View */}
      <div className="bg-rink-card border border-rink-border rounded-xl p-6 shadow-xl space-y-6">
        {/* Title & Headline */}
        <div className="border-b border-rink-border pb-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300">
                {selectedTrade.tradeDate}
              </span>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.color}`}>
                {badge.icon}
                {badge.label}
              </span>
              {marqueeIds.has(selectedTrade.id) && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Curated Deep-Dive
                </span>
              )}
              <span className="text-xs text-slate-400 font-medium hidden md:inline">
                Era: <span className="text-slate-200">{selectedTrade.seasonEra}</span>
              </span>
            </div>

            {/* Mode Switcher: Positioned right before the trade info */}
            <div className="flex items-center gap-1.5 bg-rink-surface p-1 rounded-lg border border-rink-border self-start sm:self-auto shrink-0 shadow-inner">
              <button
                onClick={() => setViewMode('SNAPSHOT')}
                className={`flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-bold transition-all ${
                  viewMode === 'SNAPSHOT'
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30 ring-1 ring-sky-400/50'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>At the Time (Snapshot)</span>
              </button>
              <button
                onClick={() => setViewMode('RETROSPECTIVE')}
                className={`flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-bold transition-all ${
                  viewMode === 'RETROSPECTIVE'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-1 ring-emerald-400/50'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Trophy className="w-3.5 h-3.5 shrink-0" />
                <span>Hindsight & Legacy (After)</span>
              </button>
            </div>
          </div>

          <h2 className="text-2xl font-black text-white">{selectedTrade.title}</h2>
          <p className="text-slate-300 text-sm mt-2 leading-relaxed">
            {selectedTrade.headline}
          </p>
        </div>

        {/* The Teams & Assets Exchanged */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Team A */}
          <div className="bg-rink-surface border border-rink-border rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-rink-border pb-3">
              <div className="flex items-center gap-2.5">
                {selectedTrade.teamA.teamLogo && (
                  <img
                    src={selectedTrade.teamA.teamLogo}
                    alt={selectedTrade.teamA.teamName}
                    className="w-7 h-7 object-contain"
                  />
                )}
                <div>
                  <h3 className="text-base font-bold text-white">
                    {selectedTrade.teamA.teamName}
                  </h3>
                  <span className="text-xs text-slate-400">
                    Acquired Core Assets
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">
                  {viewMode === 'SNAPSHOT' ? 'Day 1 Grade' : 'Retrospective'}
                </div>
                <div
                  className={`text-lg font-black ${
                    (viewMode === 'SNAPSHOT'
                      ? selectedTrade.teamA.snapshotGrade
                      : selectedTrade.teamA.retrospectiveGrade
                    ).startsWith('A')
                      ? 'text-emerald-400'
                      : (viewMode === 'SNAPSHOT'
                          ? selectedTrade.teamA.snapshotGrade
                          : selectedTrade.teamA.retrospectiveGrade
                        ).startsWith('B')
                      ? 'text-sky-400'
                      : 'text-amber-400'
                  }`}
                >
                  {viewMode === 'SNAPSHOT'
                    ? selectedTrade.teamA.snapshotGrade
                    : selectedTrade.teamA.retrospectiveGrade}
                </div>
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-emerald-400 mb-1 flex items-center gap-1">
                <ChevronRight className="w-3.5 h-3.5" />
                Assets Received:
              </div>
              <ul className="space-y-1">
                {selectedTrade.teamA.received.map((item, idx) => (
                  <li
                    key={idx}
                    className="text-xs text-slate-200 bg-rink-card/60 px-2.5 py-1.5 rounded border border-rink-border/50 font-medium"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1">
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                Assets Traded Away:
              </div>
              <ul className="space-y-1">
                {selectedTrade.teamA.gaveUp.map((item, idx) => (
                  <li
                    key={idx}
                    className="text-xs text-slate-400 bg-rink-card/30 px-2.5 py-1 rounded"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Team B */}
          <div className="bg-rink-surface border border-rink-border rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-rink-border pb-3">
              <div className="flex items-center gap-2.5">
                {selectedTrade.teamB.teamLogo && (
                  <img
                    src={selectedTrade.teamB.teamLogo}
                    alt={selectedTrade.teamB.teamName}
                    className="w-7 h-7 object-contain"
                  />
                )}
                <div>
                  <h3 className="text-base font-bold text-white">
                    {selectedTrade.teamB.teamName}
                  </h3>
                  <span className="text-xs text-slate-400">
                    Acquired Core Assets
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">
                  {viewMode === 'SNAPSHOT' ? 'Day 1 Grade' : 'Retrospective'}
                </div>
                <div
                  className={`text-lg font-black ${
                    (viewMode === 'SNAPSHOT'
                      ? selectedTrade.teamB.snapshotGrade
                      : selectedTrade.teamB.retrospectiveGrade
                    ).startsWith('A')
                      ? 'text-emerald-400'
                      : (viewMode === 'SNAPSHOT'
                          ? selectedTrade.teamB.snapshotGrade
                          : selectedTrade.teamB.retrospectiveGrade
                        ).startsWith('B')
                      ? 'text-sky-400'
                      : 'text-amber-400'
                  }`}
                >
                  {viewMode === 'SNAPSHOT'
                    ? selectedTrade.teamB.snapshotGrade
                    : selectedTrade.teamB.retrospectiveGrade}
                </div>
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-emerald-400 mb-1 flex items-center gap-1">
                <ChevronRight className="w-3.5 h-3.5" />
                Assets Received:
              </div>
              <ul className="space-y-1">
                {selectedTrade.teamB.received.map((item, idx) => (
                  <li
                    key={idx}
                    className="text-xs text-slate-200 bg-rink-card/60 px-2.5 py-1.5 rounded border border-rink-border/50 font-medium"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1">
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                Assets Traded Away:
              </div>
              <ul className="space-y-1">
                {selectedTrade.teamB.gaveUp.map((item, idx) => (
                  <li
                    key={idx}
                    className="text-xs text-slate-400 bg-rink-card/30 px-2.5 py-1 rounded"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Dynamic Dual-Lens Body: Snapshot vs Retrospective */}
        {viewMode === 'SNAPSHOT' ? (
          /* View Mode 1: SNAPSHOT (At The Time) */
          <div className="space-y-6 pt-2">
            {/* Context Box */}
            <div className="bg-sky-950/20 border border-sky-800/40 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
                <Clock className="w-4 h-4" />
                Day 1 Consensus Verdict & Trade-Day Narrative
              </div>
              <p className="text-slate-300 text-sm leading-relaxed font-normal">
                {selectedTrade.snapshotContext.narrative}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-sky-900/40 text-xs">
                <div>
                  <span className="font-semibold text-sky-300">
                    {selectedTrade.teamA.teamName} Day 1 Outlook:
                  </span>
                  <p className="text-slate-400 mt-0.5">
                    {selectedTrade.snapshotContext.teamAOutlook}
                  </p>
                  <div className="mt-1 font-mono text-sky-400 font-bold">
                    Cup Odds Shift: {selectedTrade.snapshotContext.cupOddsDeltaTeamA}
                  </div>
                </div>
                <div>
                  <span className="font-semibold text-sky-300">
                    {selectedTrade.teamB.teamName} Day 1 Outlook:
                  </span>
                  <p className="text-slate-400 mt-0.5">
                    {selectedTrade.snapshotContext.teamBOutlook}
                  </p>
                  <div className="mt-1 font-mono text-sky-400 font-bold">
                    Cup Odds Shift: {selectedTrade.snapshotContext.cupOddsDeltaTeamB}
                  </div>
                </div>
              </div>
            </div>

            {/* Player Snapshots as known that day */}
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
                Key Asset & Player Profiles at Trade Date
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedTrade.snapshotContext.players.map((p, idx) => (
                  <div
                    key={idx}
                    className="bg-rink-surface border border-rink-border rounded-xl p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">{p.name}</span>
                      <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        Age: {p.ageAtTrade}
                      </span>
                    </div>
                    <div className="text-xs text-brand-400 font-mono bg-brand-500/10 px-2 py-1 rounded border border-brand-500/20">
                      {p.seasonPriorStats}
                    </div>
                    <div className="text-xs text-slate-400">
                      <strong className="text-slate-300">Contract:</strong> {p.contractStatus}
                    </div>
                    <div className="text-xs text-slate-400">
                      <strong className="text-slate-300">Perception:</strong> {p.perceivedValue}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* View Mode 2: HINDSIGHT & RETROSPECTIVE */
          <div className="space-y-6 pt-2">
            {/* Verdict Banner */}
            <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-xl p-5">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-2">
                <Trophy className="w-4 h-4" />
                Historical Verdict & Stanley Cup Legacy
              </div>
              <p className="text-slate-200 text-sm leading-relaxed font-medium">
                {selectedTrade.historicalOutcome.verdictToday}
              </p>
              <div className="mt-4 pt-3 border-t border-emerald-900/40 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-slate-400">Decisive Winner:</span>{' '}
                  <strong className="text-emerald-400 text-sm">
                    {selectedTrade.historicalOutcome.winningTeam}
                  </strong>
                </div>
                <div className="font-semibold text-amber-300 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                  🏆 {selectedTrade.historicalOutcome.championshipImpact}
                </div>
              </div>
            </div>

            {/* Team Outcomes Side-by-Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-rink-surface border border-rink-border rounded-xl p-4">
                <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-2">
                  {selectedTrade.teamA.teamName} Post-Trade Outcome
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedTrade.historicalOutcome.teamASuccessSummary}
                </p>
              </div>

              <div className="bg-rink-surface border border-rink-border rounded-xl p-4">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
                  {selectedTrade.teamB.teamName} Post-Trade Outcome
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedTrade.historicalOutcome.teamBSuccessSummary}
                </p>
              </div>
            </div>

            {/* Chronological Milestones Timeline (if present) */}
            {selectedTrade.historicalOutcome.milestones && selectedTrade.historicalOutcome.milestones.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-brand-400" />
                  Key Post-Trade Milestones
                </h3>
                <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-rink-border">
                  {selectedTrade.historicalOutcome.milestones.map((m, idx) => (
                    <div key={idx} className="relative group">
                      <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-brand-500 ring-4 ring-rink-card" />
                      <div className="bg-rink-surface border border-rink-border rounded-xl p-3.5 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-black text-brand-400">{m.year}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              m.tag === 'CHAMPIONSHIP'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : m.tag === 'COLLAPSE'
                                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                : m.tag === 'AWARD'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {m.tag}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white">{m.title}</h4>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {m.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Domino Trade Tree (if present) */}
            {selectedTrade.historicalOutcome.tradeTreeEvents && selectedTrade.historicalOutcome.tradeTreeEvents.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-brand-400" />
                  The Domino Trade Tree & Ripple Events
                </h3>
                <div className="space-y-3">
                  {selectedTrade.historicalOutcome.tradeTreeEvents.map((branch, idx) => (
                    <div
                      key={idx}
                      className="bg-rink-surface border border-rink-border rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-sky-400 px-1.5 py-0.5 rounded bg-sky-950 border border-sky-800">
                            {branch.team}
                          </span>
                          <span className="text-xs text-slate-400 font-semibold">
                            {branch.year}
                          </span>
                          <span className="text-xs font-bold text-white">
                            {branch.event}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">{branch.details}</p>
                      </div>
                      <div className="bg-rink-card px-3 py-1.5 rounded-lg border border-rink-border text-xs text-brand-300 font-medium self-start md:self-auto shrink-0">
                        Result: {branch.result}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
