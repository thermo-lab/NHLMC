import React, { useState, useEffect } from 'react';
import {
  Flame,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ArrowRightLeft,
  Shield,
  Trophy,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { PlayerSpotlight, SpotlightTradeOption } from '../types/spotlight';
import { FranchiseTradeEvaluation } from '../types/franchise';

interface PlayerSpotlightHeroProps {
  spotlight: PlayerSpotlight;
  onSelectOption: (option: SpotlightTradeOption) => void;
  activeDestinationTeamId?: string | null;
  currentEvaluation?: FranchiseTradeEvaluation | null;
}

export const PlayerSpotlightHero: React.FC<PlayerSpotlightHeroProps> = ({
  spotlight,
  onSelectOption,
  activeDestinationTeamId,
  currentEvaluation,
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('nhlmc_spotlight_collapsed') === 'true';
    }
    return false;
  });

  const [selectedOptionId, setSelectedOptionId] = useState<string>(() => {
    if (spotlight.options && spotlight.options.length > 0) {
      if (activeDestinationTeamId) {
        const matching = spotlight.options.find(
          (o) => o.destinationTeamId.toUpperCase() === activeDestinationTeamId.toUpperCase()
        );
        if (matching) return matching.id;
      }
      return spotlight.options[0].id;
    }
    return '';
  });

  useEffect(() => {
    if (activeDestinationTeamId && spotlight.options) {
      const matching = spotlight.options.find(
        (o) => o.destinationTeamId.toUpperCase() === activeDestinationTeamId.toUpperCase()
      );
      if (matching) {
        setSelectedOptionId(matching.id);
      }
    }
  }, [activeDestinationTeamId, spotlight.options]);

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('nhlmc_spotlight_collapsed', String(next));
    }
  };

  const currentOption =
    spotlight.options.find((o) => o.id === selectedOptionId) || spotlight.options[0];

  if (!spotlight || !spotlight.isActive) return null;

  return (
    <section className="mb-8 rounded-2xl bg-gradient-to-b from-[#0B1528] via-[#08101E] to-[#050B14] border border-sky-800/40 shadow-2xl overflow-hidden backdrop-blur-md transition-all duration-300">
      {/* Top Banner Bar */}
      <div className="px-4 py-3 sm:px-6 bg-gradient-to-r from-sky-950/60 via-slate-900/80 to-purple-950/60 border-b border-sky-800/30 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
            <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
          </div>
          <div className="flex items-center gap-2 min-w-0 flex-wrap">
            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-300 border border-amber-500/20">
              {spotlight.badgeText || 'Trade Block Spotlight'}
            </span>
            <span className="text-xs sm:text-sm font-bold text-white truncate">
              {spotlight.playerName} ({spotlight.currentTeamId})
            </span>
          </div>
        </div>

        <button
          onClick={toggleCollapse}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 rounded-lg transition-colors cursor-pointer shrink-0"
          aria-expanded={!isCollapsed}
        >
          <span>{isCollapsed ? 'Expand Spotlight' : 'Hide Spotlight'}</span>
          {isCollapsed ? (
            <ChevronDown className="w-3.5 h-3.5 text-sky-400" />
          ) : (
            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
          )}
        </button>
      </div>

      {/* Main Content Area */}
      {!isCollapsed && (
        <div className="p-4 sm:p-6 lg:p-7 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Player Profile & Storyline (5 Columns) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-slate-900/60 border border-sky-900/40 rounded-xl p-4 sm:p-5 relative overflow-hidden">
                {/* Glow Backdrop */}
                <div className="absolute -top-12 -left-12 w-44 h-44 bg-sky-600/15 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-start gap-4">
                  {/* Headshot */}
                  <div className="relative shrink-0">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-sky-950 via-slate-800 to-sky-900 border-2 border-sky-500/40 p-1 shadow-lg shadow-sky-950/60 overflow-hidden flex items-center justify-center">
                      <img
                        src={spotlight.headshotUrl}
                        alt={spotlight.playerName}
                        className="w-full h-full object-cover object-top scale-105"
                        onError={(e) => {
                          // Fallback to default avatar if mugshot fails
                          (e.currentTarget as HTMLImageElement).src =
                            'https://assets.nhle.com/mugs/nhl/latest/8476945.png';
                        }}
                      />
                    </div>
                    <span className="absolute -bottom-2 -right-1.5 px-2 py-0.5 rounded-full bg-sky-500 text-black font-black text-[10px] tracking-tight shadow">
                      {spotlight.jerseyNumber || '#37'}
                    </span>
                  </div>

                  {/* Vitals */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-sky-400 text-xs font-semibold uppercase tracking-wide">
                      <Shield className="w-3.5 h-3.5 text-sky-400" />
                      <span>{spotlight.currentTeamName}</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight mt-0.5">
                      {spotlight.playerName}
                    </h2>
                    <p className="text-xs text-slate-400 font-medium">
                      {spotlight.position} • Age {spotlight.age}
                    </p>

                    <div className="mt-2.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono">
                      <DollarSign className="w-3 h-3 text-emerald-400" />
                      <span>$8.50M AAV (through 2031)</span>
                    </div>
                  </div>
                </div>

                {/* Accolades */}
                {spotlight.accolades && spotlight.accolades.length > 0 && (
                  <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                    {spotlight.accolades.map((acc, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20"
                      >
                        <Trophy className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                        <span>{acc}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Editorial Headline & Storyline */}
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 space-y-2">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>{spotlight.headline}</span>
                </h3>
                <p className="text-xs text-slate-300/90 leading-relaxed">
                  {spotlight.editorialStoryline}
                </p>
              </div>
            </div>

            {/* Right: Interactive Destination Scenarios (7 Columns) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Option Selector Tabs */}
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Pick a Destination Scenario ({spotlight.options.length} Landing Spots)</span>
                  <span className="text-[10px] text-sky-400 font-normal">Click to preview package</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {spotlight.options.map((opt) => {
                    const isSelected = opt.id === selectedOptionId;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => setSelectedOptionId(opt.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? 'bg-sky-950/80 border-sky-400 shadow-md shadow-sky-500/20 ring-1 ring-sky-400'
                            : 'bg-slate-900/60 hover:bg-slate-800/70 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-bold text-white mb-0.5">
                          <span className="font-mono text-sky-300">{opt.destinationTeamId}</span>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />}
                        </div>
                        <div className="text-[11px] font-semibold text-slate-200 truncate">
                          {opt.destinationTeamName.replace(/^(The |Team )/, '')}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate mt-0.5">
                          {opt.title}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Option Detail Card */}
              {currentOption && (
                <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-sky-800/50 rounded-xl p-4 sm:p-5 space-y-4 shadow-xl">
                  {/* Destination Header */}
                  <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <div>
                      <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                        Scenario: {currentOption.destinationTeamName}
                      </span>
                      <h4 className="text-base sm:text-lg font-black text-white">
                        {currentOption.title} — <span className="text-slate-300 font-medium text-sm">{currentOption.subtitle}</span>
                      </h4>
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-sky-950/60 text-sky-300 border border-sky-800/50">
                      WPG ⇄ {currentOption.destinationTeamId}
                    </span>
                  </div>

                  {/* Editorial Pitch */}
                  <p className="text-xs text-slate-300 leading-relaxed bg-black/20 p-3 rounded-lg border border-slate-800/60">
                    {currentOption.pitch}
                  </p>

                  {/* Asset Exchange Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {/* Winnipeg Receives */}
                    <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between font-bold text-emerald-300 text-[11px] border-b border-emerald-900/30 pb-1.5">
                        <span>Winnipeg Receives:</span>
                        <span className="font-mono text-[10px] text-emerald-400">Futures &amp; Roster</span>
                      </div>
                      <div className="space-y-1 text-slate-200 text-[11px]">
                        {currentOption.wpgReceives.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-1.5">
                            <span className="text-emerald-400 font-bold text-xs">✓</span>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Winnipeg Surrenders */}
                    <div className="bg-slate-950/40 border border-slate-800/60 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between font-bold text-rose-300 text-[11px] border-b border-slate-800/60 pb-1.5">
                        <span>Winnipeg Surrenders:</span>
                        <span className="font-mono text-[10px] text-slate-400">Outbound Assets</span>
                      </div>
                      <div className="space-y-1 text-slate-300 text-[11px]">
                        {currentOption.wpgSurrenders.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-1.5">
                            <span className="text-rose-400 font-bold text-xs">−</span>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Financial & Cap Impact Note */}
                  {(() => {
                    const isLoadedScenario =
                      Boolean(currentEvaluation) &&
                      currentEvaluation?.teamA.teamId === spotlight.currentTeamId &&
                      currentEvaluation?.teamB.teamId === currentOption.destinationTeamId;

                    const destCupDeltaVal = isLoadedScenario
                      ? currentEvaluation!.teamB.deltas.stanleyCupDelta * 100
                      : parseFloat(currentOption.projectedCupDeltaDestination.split(' ')[0]);

                    const wpgCupDeltaVal = isLoadedScenario
                      ? currentEvaluation!.teamA.deltas.stanleyCupDelta * 100
                      : parseFloat(currentOption.projectedCupDeltaWinnipeg.split(' ')[0]);

                    const destCupDeltaStr = isLoadedScenario
                      ? (destCupDeltaVal > 0 ? '+' : '') + destCupDeltaVal.toFixed(1) + '%'
                      : currentOption.projectedCupDeltaDestination.split(' ')[0];

                    const wpgCupDeltaStr = isLoadedScenario
                      ? (wpgCupDeltaVal > 0 ? '+' : '') + wpgCupDeltaVal.toFixed(1) + '%'
                      : currentOption.projectedCupDeltaWinnipeg.split(' ')[0];

                    return (
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-2.5 rounded-lg bg-black/30 border border-slate-800/60 text-[11px]">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{currentOption.capFitSummary}</span>
                        </div>
                        <div className="flex items-center gap-2.5 shrink-0 text-slate-400 font-mono text-[10px]">
                          {isLoadedScenario && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
                              LIVE MC
                            </span>
                          )}
                          <span>
                            {spotlight.currentTeamId} Cup Δ:{' '}
                            <strong className={wpgCupDeltaVal > 0 ? 'text-emerald-400' : wpgCupDeltaVal < 0 ? 'text-rose-400' : 'text-slate-300'}>
                              {wpgCupDeltaStr}
                            </strong>
                          </span>
                          <span>•</span>
                          <span>
                            {currentOption.destinationTeamId} Cup Δ:{' '}
                            <strong className={destCupDeltaVal > 0 ? 'text-emerald-400' : destCupDeltaVal < 0 ? 'text-rose-400' : 'text-slate-300'}>
                              {destCupDeltaStr}
                            </strong>
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Simulation CTA */}
                  <button
                    onClick={() => onSelectOption(currentOption)}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-black font-black text-sm tracking-wide shadow-lg shadow-sky-600/25 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 fill-black text-black" />
                    <span>Simulate {currentOption.title} in Trade Machine</span>
                    <ArrowRightLeft className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
