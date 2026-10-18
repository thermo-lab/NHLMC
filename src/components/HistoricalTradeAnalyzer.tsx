import React, { useState } from 'react';
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
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Flame,
} from 'lucide-react';
import { HistoricalTrade } from '../types/historicalTrade';
import { HISTORICAL_TRADES } from '../data/historicalTrades';

export const HistoricalTradeAnalyzer: React.FC = () => {
  const [selectedTradeId, setSelectedTradeId] = useState<string>(HISTORICAL_TRADES[0].id);
  const [viewMode, setViewMode] = useState<'SNAPSHOT' | 'RETROSPECTIVE'>('SNAPSHOT');
  const [eraFilter, setEraFilter] = useState<string>('ALL');

  const selectedTrade =
    HISTORICAL_TRADES.find((t) => t.id === selectedTradeId) ?? HISTORICAL_TRADES[0];

  const filteredTrades = HISTORICAL_TRADES.filter((t) => {
    if (eraFilter === 'ALL') return true;
    return t.seasonEra.includes(eraFilter);
  });

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
          label: 'Win-Win / Cultural Classic',
          color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
          icon: <Sparkles className="w-3.5 h-3.5 mr-1" />,
        };
      default:
        return {
          label: 'Competitive',
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
              NHL Time-Machine Trade Retrospective
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Historical Blockbuster Analyzer
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Inspect famous franchise-altering trades through two lenses: the available information at the moment of the handshake, versus the true legacy, domino trade tree, and championships won after it.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-2 bg-rink-surface p-1.5 rounded-lg border border-rink-border self-start md:self-auto">
            <button
              onClick={() => setViewMode('SNAPSHOT')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-bold transition-all ${
                viewMode === 'SNAPSHOT'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              At the Time (Snapshot)
            </button>
            <button
              onClick={() => setViewMode('RETROSPECTIVE')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-bold transition-all ${
                viewMode === 'RETROSPECTIVE'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              Hindsight & Legacy (After)
            </button>
          </div>
        </div>
      </div>

      {/* Trade Selector Carousel / Pills */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Select Blockbuster Trade Archive:</span>
          <div className="flex items-center gap-2">
            <span>Filter Era:</span>
            <select
              value={eraFilter}
              onChange={(e) => setEraFilter(e.target.value)}
              className="bg-rink-surface border border-rink-border text-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-brand-500"
            >
              <option value="ALL">All Eras</option>
              <option value="Salary Cap">Salary Cap Era</option>
              <option value="Dead Puck">1990s</option>
              <option value="80s">1980s</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredTrades.map((t) => {
            const isSelected = t.id === selectedTrade.id;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedTradeId(t.id)}
                className={`text-left p-3.5 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-rink-card border-brand-500 shadow-md ring-1 ring-brand-500/50'
                    : 'bg-rink-card/60 border-rink-border hover:border-slate-600 hover:bg-rink-card'
                }`}
              >
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                  <span className="flex items-center gap-1 font-mono">
                    <Calendar className="w-3 h-3 text-brand-400" />
                    {t.tradeDate}
                  </span>
                  <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                    {t.seasonEra.split(' ')[0]}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white line-clamp-1">{t.title}</h4>
                <div className="flex items-center gap-2 mt-2 text-xs font-semibold">
                  <span className="text-sky-400">{t.teamA.teamAbbrev}</span>
                  <span className="text-slate-500">⇄</span>
                  <span className="text-emerald-400">{t.teamB.teamAbbrev}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Trade Detail View */}
      <div className="bg-rink-card border border-rink-border rounded-xl p-6 shadow-xl space-y-6">
        {/* Title & Headline */}
        <div className="border-b border-rink-border pb-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300">
                {selectedTrade.tradeDate}
              </span>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.color}`}>
                {badge.icon}
                {badge.label}
              </span>
            </div>
            <div className="text-xs text-slate-400 font-medium">
              Era: <span className="text-slate-200">{selectedTrade.seasonEra}</span>
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
                      : (viewMode === 'SNAPSHOT'
                          ? selectedTrade.teamB.snapshotGrade
                          : selectedTrade.teamB.retrospectiveGrade
                        ).startsWith('C')
                      ? 'text-amber-400'
                      : 'text-red-400'
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

        {/* View Mode 1: SNAPSHOT IN TIME */}
        {viewMode === 'SNAPSHOT' ? (
          <div className="space-y-6 pt-2">
            <div className="bg-sky-950/20 border border-sky-800/40 rounded-xl p-5">
              <div className="flex items-center gap-2 text-sky-400 font-bold text-sm mb-2">
                <Clock className="w-4 h-4" />
                Snapshot Perspective: How the Trade Looked on {selectedTrade.tradeDate}
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                {selectedTrade.snapshotContext.narrative}
              </p>
              <div className="mt-4 pt-3 border-t border-sky-900/40 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-semibold text-sky-300">
                    {selectedTrade.teamA.teamName} Day 1 Outlook:
                  </span>
                  <p className="text-slate-400 mt-0.5">
                    {selectedTrade.snapshotContext.teamAOutlook}
                  </p>
                  <div className="mt-1 font-mono text-emerald-400 font-bold">
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
                Key Player Profiles at Trade Date
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

            {/* Chronological Milestones Timeline */}
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

            {/* Domino Trade Tree */}
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
          </div>
        )}
      </div>
    </div>
  );
};
