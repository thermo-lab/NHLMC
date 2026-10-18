import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Trash2,
  BarChart3,
  Trophy,
  Zap,
  DollarSign,
  Flame,
  ArrowRight,
  Award,
} from 'lucide-react';
import { Player } from '../types/player';
import { FantasyLeague } from '../types/league';
import { TradeProposal, SimulationConfig, SimulationResult } from '../types/simulation';

interface TradeSimulatorProps {
  league: FantasyLeague;
  players: Player[];
  config: SimulationConfig;
  simulationResult: SimulationResult | null;
  isSimulating: boolean;
  onRunSimulation: (proposal: TradeProposal) => void;
}

export const TradeSimulator: React.FC<TradeSimulatorProps> = ({
  league,
  players,
  config,
  simulationResult,
  isSimulating,
  onRunSimulation,
}) => {
  const userTeam = useMemo(
    () => league.teams.find((t) => t.isUserTeam) ?? league.teams[0],
    [league]
  );
  const otherTeams = useMemo(
    () => league.teams.filter((t) => t.id !== userTeam.id),
    [league, userTeam]
  );

  const [selectedTargetTeamId, setSelectedTargetTeamId] = useState<string>(
    otherTeams[0]?.id ?? ''
  );
  // Default: Zach Hyman (26, $5.5M) for Mikko Rantanen (13, $9.25M)
  const [givingPlayerIds, setGivingPlayerIds] = useState<number[]>([26]);
  const [receivingPlayerIds, setReceivingPlayerIds] = useState<number[]>([13]);

  const targetTeam = useMemo(
    () => league.teams.find((t) => t.id === selectedTargetTeamId),
    [league, selectedTargetTeamId]
  );

  const playersMap = useMemo(() => {
    const map = new Map<number, Player>();
    for (const p of players) map.set(p.id, p);
    return map;
  }, [players]);

  const userRosterPlayers = useMemo(
    () => userTeam.playerIds.map((id) => playersMap.get(id)).filter(Boolean) as Player[],
    [userTeam, playersMap]
  );

  const targetRosterPlayers = useMemo(
    () =>
      targetTeam
        ? (targetTeam.playerIds.map((id) => playersMap.get(id)).filter(Boolean) as Player[])
        : [],
    [targetTeam, playersMap]
  );

  const handleAddGiving = (id: number) => {
    if (!givingPlayerIds.includes(id)) {
      setGivingPlayerIds([...givingPlayerIds, id]);
    }
  };

  const handleRemoveGiving = (id: number) => {
    setGivingPlayerIds(givingPlayerIds.filter((pid) => pid !== id));
  };

  const handleAddReceiving = (id: number) => {
    if (!receivingPlayerIds.includes(id)) {
      setReceivingPlayerIds([...receivingPlayerIds, id]);
    }
  };

  const handleRemoveReceiving = (id: number) => {
    setReceivingPlayerIds(receivingPlayerIds.filter((pid) => pid !== id));
  };

  const handleRun = () => {
    if (!targetTeam) return;
    onRunSimulation({
      targetTeamId: targetTeam.id,
      givingPlayerIds,
      receivingPlayerIds,
    });
  };

  const givingPlayers = givingPlayerIds.map((id) => playersMap.get(id)).filter(Boolean) as Player[];
  const receivingPlayers = receivingPlayerIds.map((id) => playersMap.get(id)).filter(Boolean) as Player[];

  const formatDelta = (val: number, percent: boolean = false) => {
    const sign = val > 0 ? '+' : '';
    return percent ? `${sign}${(val * 100).toFixed(1)}%` : `${sign}${val.toFixed(2)}`;
  };

  const getVerdictStyle = (action: string) => {
    switch (action) {
      case 'STRONG_ACCEPT':
        return {
          bg: 'bg-emerald-950/40 border-emerald-500/50 text-emerald-400',
          badge: 'bg-emerald-500 text-black',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
          title: 'STRONG ACCEPT',
        };
      case 'ACCEPT':
        return {
          bg: 'bg-sky-950/40 border-sky-500/50 text-sky-400',
          badge: 'bg-sky-500 text-black',
          icon: <CheckCircle2 className="w-5 h-5 text-sky-400" />,
          title: 'ACCEPT / FAVORABLE',
        };
      case 'NEUTRAL':
        return {
          bg: 'bg-slate-900 border-slate-700 text-slate-300',
          badge: 'bg-slate-700 text-slate-200',
          icon: <HelpCircle className="w-5 h-5 text-slate-400" />,
          title: 'LATERAL / NEUTRAL',
        };
      case 'DECLINE':
        return {
          bg: 'bg-amber-950/40 border-amber-500/50 text-amber-400',
          badge: 'bg-amber-500 text-black',
          icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
          title: 'DECLINE / UNFAVORABLE',
        };
      case 'STRONG_DECLINE':
      default:
        return {
          bg: 'bg-red-950/40 border-red-500/50 text-red-400',
          badge: 'bg-red-600 text-white',
          icon: <XCircle className="w-5 h-5 text-red-400" />,
          title: 'DO NOT ACCEPT',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Trade Builder Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: You Give */}
        <div className="bg-rink-card border border-rink-border rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-rink-border pb-3 mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
                  Sending Away
                </span>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>{userTeam.name}</span>
                  <span className="text-xs font-normal text-slate-400">(Your Team)</span>
                </h3>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono text-slate-400">Total Outgoing Cap:</span>
                <div className="text-sm font-black text-sky-400 font-mono">
                  ${(givingPlayers.reduce((sum, p) => sum + p.capHit, 0) / 1e6).toFixed(2)}M
                </div>
              </div>
            </div>

            {/* Selected Giving Players */}
            <div className="space-y-2 mb-4 min-h-[100px]">
              {givingPlayers.length === 0 ? (
                <div className="border border-dashed border-slate-700 rounded-lg p-6 text-center text-xs text-slate-500">
                  Select players below to add to your trade offer.
                </div>
              ) : (
                givingPlayers.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between bg-rink-surface border border-rink-border rounded-lg p-2.5 group hover:border-slate-600 transition"
                  >
                    <div className="flex items-center space-x-3">
                      {player.headshotUrl ? (
                        <img
                          src={player.headshotUrl}
                          alt={player.name}
                          className="w-10 h-10 rounded-full object-cover bg-slate-800 border border-slate-700"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
                          {player.name.substring(0, 2)}
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-2">
                          <span>{player.name}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-sky-400 border border-slate-700">
                            {player.primaryPosition}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                          <span>{player.nhlTeam}</span>
                          <span>•</span>
                          <span className="text-emerald-400 font-semibold">
                            ${(player.capHit / 1e6).toFixed(2)}M
                          </span>
                          <span>•</span>
                          <span>
                            {player.playerType === 'goalie'
                              ? `${player.actualStats.goalie?.wins ?? 0}W | ${player.actualStats.goalie?.goalsAgainstAverage ?? 2.50} GAA`
                              : `${player.actualStats.skater?.goals ?? 0}G | ${player.actualStats.skater?.assists ?? 0}A | ${player.actualStats.skater?.points ?? 0}P`}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveGiving(player.id)}
                      className="text-slate-500 hover:text-red-400 p-1.5 rounded transition"
                      title="Remove player"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Add Player Dropdown */}
          <div className="pt-3 border-t border-rink-border">
            <label className="text-xs font-semibold text-slate-400 block mb-1.5">
              Add player from your roster:
            </label>
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) handleAddGiving(Number(e.target.value));
              }}
              className="w-full bg-rink-surface border border-rink-border text-slate-200 text-xs rounded-lg p-2.5 focus:outline-none focus:border-brand-500"
            >
              <option value="">-- Choose player to send --</option>
              {userRosterPlayers
                .filter((p) => !givingPlayerIds.includes(p.id))
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.primaryPosition} - {p.nhlTeam}) - ${(p.capHit / 1e6).toFixed(2)}M AAV
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Right: You Receive */}
        <div className="bg-rink-card border border-rink-border rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-rink-border pb-3 mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Target Acquisition
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <select
                    value={selectedTargetTeamId}
                    onChange={(e) => {
                      setSelectedTargetTeamId(e.target.value);
                      setReceivingPlayerIds([]);
                    }}
                    className="bg-rink-surface border border-rink-border text-white text-sm font-bold rounded-lg px-2.5 py-1 focus:outline-none focus:border-brand-500"
                  >
                    {otherTeams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.manager})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono text-slate-400">Incoming Cap:</span>
                <div className="text-sm font-black text-emerald-400 font-mono">
                  ${(receivingPlayers.reduce((sum, p) => sum + p.capHit, 0) / 1e6).toFixed(2)}M
                </div>
              </div>
            </div>

            {/* Selected Receiving Players */}
            <div className="space-y-2 mb-4 min-h-[100px]">
              {receivingPlayers.length === 0 ? (
                <div className="border border-dashed border-slate-700 rounded-lg p-6 text-center text-xs text-slate-500">
                  Select players from {targetTeam?.name ?? 'opposing team'} to receive.
                </div>
              ) : (
                receivingPlayers.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between bg-rink-surface border border-rink-border rounded-lg p-2.5 group hover:border-slate-600 transition"
                  >
                    <div className="flex items-center space-x-3">
                      {player.headshotUrl ? (
                        <img
                          src={player.headshotUrl}
                          alt={player.name}
                          className="w-10 h-10 rounded-full object-cover bg-slate-800 border border-slate-700"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
                          {player.name.substring(0, 2)}
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-2">
                          <span>{player.name}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                            {player.primaryPosition}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                          <span>{player.nhlTeam}</span>
                          <span>•</span>
                          <span className="text-emerald-400 font-semibold">
                            ${(player.capHit / 1e6).toFixed(2)}M
                          </span>
                          <span>•</span>
                          <span>
                            {player.playerType === 'goalie'
                              ? `${player.actualStats.goalie?.wins ?? 0}W | ${player.actualStats.goalie?.goalsAgainstAverage ?? 2.50} GAA`
                              : `${player.actualStats.skater?.goals ?? 0}G | ${player.actualStats.skater?.assists ?? 0}A | ${player.actualStats.skater?.points ?? 0}P`}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveReceiving(player.id)}
                      className="text-slate-500 hover:text-red-400 p-1.5 rounded transition"
                      title="Remove player"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Add Target Player Dropdown */}
          <div className="pt-3 border-t border-rink-border">
            <label className="text-xs font-semibold text-slate-400 block mb-1.5">
              Add player from {targetTeam?.name}:
            </label>
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) handleAddReceiving(Number(e.target.value));
              }}
              className="w-full bg-rink-surface border border-rink-border text-slate-200 text-xs rounded-lg p-2.5 focus:outline-none focus:border-brand-500"
            >
              <option value="">-- Choose player to receive --</option>
              {targetRosterPlayers
                .filter((p) => !receivingPlayerIds.includes(p.id))
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.primaryPosition} - {p.nhlTeam}) - ${(p.capHit / 1e6).toFixed(2)}M AAV
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* Action Bar / Simulation Launcher */}
      <div className="bg-rink-card border border-rink-border rounded-xl p-4 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3 text-xs text-slate-400">
          <Zap className="w-4 h-4 text-brand-400" />
          <span>
            Simulating <strong className="text-white font-mono">{config.iterations.toLocaleString()}</strong> full season rollouts in background Web Worker.
          </span>
        </div>

        <button
          onClick={handleRun}
          disabled={isSimulating || givingPlayers.length === 0 || receivingPlayers.length === 0}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-500 text-white font-black text-sm shadow-lg shadow-sky-900/40 hover:from-sky-500 hover:to-cyan-400 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isSimulating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <span>Simulating {config.iterations} Seasons...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Run Monte Carlo Trade Simulation</span>
            </>
          )}
        </button>
      </div>

      {/* Simulation Results Section */}
      {simulationResult && (
        <div className="space-y-6 animate-fadeIn">
          {/* Executive Verdict Banner */}
          {(() => {
            const style = getVerdictStyle(simulationResult.verdict.action);
            return (
              <div className={`border rounded-xl p-5 ${style.bg} transition-all`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    {style.icon}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded text-xs font-black tracking-wide ${style.badge}`}>
                          {style.title}
                        </span>
                        <span className="text-xs font-semibold text-slate-400">
                          Risk Assessment: <strong className="text-white">{simulationResult.verdict.riskScore}</strong>
                        </span>
                        <span className="text-xs font-mono text-slate-500">
                          ({simulationResult.executionTimeMs}ms)
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-white mt-1.5">
                        {simulationResult.verdict.summary}
                      </p>
                    </div>
                  </div>
                </div>

                {simulationResult.verdict.analysisBullets.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-700/50 space-y-1">
                    {simulationResult.verdict.analysisBullets.map((bullet, idx) => (
                      <div key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                        <span className="text-sky-400 font-bold">•</span>
                        <span>{bullet}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {/* The Big 3 Delta Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Title Odds */}
            <div className="bg-rink-card border border-rink-border rounded-xl p-4 shadow-md">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Championship Win Prob (1st)</span>
                <Trophy className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-black text-white">
                  {(simulationResult.userTeam.postTradeWinProb * 100).toFixed(1)}%
                </span>
                <span
                  className={`text-sm font-bold font-mono ${
                    simulationResult.userTeam.deltaWinProb > 0
                      ? 'text-emerald-400'
                      : simulationResult.userTeam.deltaWinProb < 0
                      ? 'text-red-400'
                      : 'text-slate-400'
                  }`}
                >
                  {formatDelta(simulationResult.userTeam.deltaWinProb, true)}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Baseline: {(simulationResult.userTeam.baselineWinProb * 100).toFixed(1)}%
              </div>
            </div>

            {/* Podium (Top 3) */}
            <div className="bg-rink-card border border-rink-border rounded-xl p-4 shadow-md">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Top-3 Finish Prob</span>
                <Award className="w-4 h-4 text-sky-400" />
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-black text-white">
                  {(simulationResult.userTeam.postTradeTop3Prob * 100).toFixed(1)}%
                </span>
                <span
                  className={`text-sm font-bold font-mono ${
                    simulationResult.userTeam.deltaTop3Prob > 0
                      ? 'text-emerald-400'
                      : simulationResult.userTeam.deltaTop3Prob < 0
                      ? 'text-red-400'
                      : 'text-slate-400'
                  }`}
                >
                  {formatDelta(simulationResult.userTeam.deltaTop3Prob, true)}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Baseline: {(simulationResult.userTeam.baselineTop3Prob * 100).toFixed(1)}%
              </div>
            </div>

            {/* Roto Points */}
            <div className="bg-rink-card border border-rink-border rounded-xl p-4 shadow-md">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Expected Standings Points</span>
                <BarChart3 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-black text-white">
                  {simulationResult.userTeam.postTradeExpectedPoints.toFixed(1)}
                </span>
                <span
                  className={`text-sm font-bold font-mono ${
                    simulationResult.userTeam.deltaExpectedPoints > 0
                      ? 'text-emerald-400'
                      : simulationResult.userTeam.deltaExpectedPoints < 0
                      ? 'text-red-400'
                      : 'text-slate-400'
                  }`}
                >
                  {formatDelta(simulationResult.userTeam.deltaExpectedPoints)} pts
                </span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Baseline: {simulationResult.userTeam.baselineExpectedPoints.toFixed(1)} pts
              </div>
            </div>
          </div>

          {/* Salary Cap Status Box */}
          {simulationResult.capImpact && (
            <div className="bg-rink-card border border-rink-border rounded-xl p-4 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <div>
                  <div className="text-xs text-slate-400 font-semibold uppercase">
                    NHL Salary Cap Compliance ($88.0M Ceiling)
                  </div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    Team Payroll: ${(simulationResult.capImpact.postTradeCap / 1e6).toFixed(2)}M
                    <span className="text-slate-400 font-normal">
                      {' '}(Cap Space Remaining: ${(simulationResult.capImpact.postTradeSpace / 1e6).toFixed(2)}M)
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-semibold text-slate-400">Net Cap Delta:</span>
                <span
                  className={`text-xs font-mono font-bold px-2.5 py-1 rounded ${
                    simulationResult.capImpact.capDelta > 0
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}
                >
                  {simulationResult.capImpact.capDelta > 0 ? '+' : ''}$
                  {(simulationResult.capImpact.capDelta / 1e6).toFixed(2)}M
                </span>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded ${
                    simulationResult.capImpact.isCompliant
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-red-500/20 text-red-300 border border-red-500/30'
                  }`}
                >
                  {simulationResult.capImpact.isCompliant ? 'CAP COMPLIANT' : 'OVER CAP'}
                </span>
              </div>
            </div>
          )}

          {/* Category Impact Matrix */}
          <div className="bg-rink-card border border-rink-border rounded-xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-rink-border pb-3">
              <div>
                <h3 className="text-base font-bold text-white">
                  14-Category Impact Breakdown
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Raw production deltas mapped against resulting Roto standings points.
                </p>
              </div>
              <span className="text-xs font-mono text-sky-400 bg-sky-950/40 px-2 py-1 rounded border border-sky-800">
                9 Skater • 5 Goalie
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-rink-border text-slate-400 uppercase tracking-wider text-[11px]">
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3 text-right">Baseline Stat</th>
                    <th className="py-2.5 px-3 text-right">Post-Trade Stat</th>
                    <th className="py-2.5 px-3 text-right">Stat Delta</th>
                    <th className="py-2.5 px-3 text-right">Roto Points Delta</th>
                    <th className="py-2.5 px-3">Category Insight</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rink-border/50">
                  {simulationResult.userTeam.categoryBreakdown.map((cat) => {
                    const isPositive = cat.deltaPoints > 0;
                    const isNegative = cat.deltaPoints < 0;
                    const isSurplusTrap =
                      Math.abs(cat.deltaRawStat) > 8 && Math.abs(cat.deltaPoints) < 0.25;

                    return (
                      <tr key={cat.category} className="hover:bg-slate-800/30 transition">
                        <td className="py-2.5 px-3 font-bold text-white flex items-center gap-1.5">
                          <span>{cat.name}</span>
                          {cat.isInverse && (
                            <span className="text-[10px] text-amber-400 font-normal">
                              (Lower is better)
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-300 font-mono">
                          {cat.baselineRawStat}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-200 font-mono font-semibold">
                          {cat.postTradeRawStat}
                        </td>
                        <td
                          className={`py-2.5 px-3 text-right font-mono font-bold ${
                            (cat.isInverse ? cat.deltaRawStat < 0 : cat.deltaRawStat > 0)
                              ? 'text-emerald-400'
                              : cat.deltaRawStat === 0
                              ? 'text-slate-400'
                              : 'text-red-400'
                          }`}
                        >
                          {cat.deltaRawStat > 0 ? `+${cat.deltaRawStat}` : cat.deltaRawStat}
                        </td>
                        <td
                          className={`py-2.5 px-3 text-right font-mono font-bold ${
                            isPositive
                              ? 'text-emerald-400'
                              : isNegative
                              ? 'text-red-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {cat.deltaPoints > 0 ? `+${cat.deltaPoints}` : cat.deltaPoints} pts
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">
                          {isSurplusTrap ? (
                            <span className="inline-flex items-center text-[11px] text-amber-400 font-semibold bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                              Diminishing Returns (Trapped Surplus)
                            </span>
                          ) : isPositive ? (
                            <span className="text-emerald-400">Gains position</span>
                          ) : isNegative ? (
                            <span className="text-red-400">Slips position</span>
                          ) : (
                            <span className="text-slate-500">Unchanged</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Standings Finish Rank Distribution Bar Chart */}
          <div className="bg-rink-card border border-rink-border rounded-xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-rink-border pb-3">
              <div>
                <h3 className="text-base font-bold text-white">
                  Final Standings Rank Probability
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Probability distribution for finishing 1st through 12th place.
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-3 h-3 rounded bg-slate-600 inline-block" /> Baseline
                </span>
                <span className="flex items-center gap-1.5 text-sky-400">
                  <span className="w-3 h-3 rounded bg-sky-500 inline-block" /> Post-Trade
                </span>
              </div>
            </div>

            <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 pt-2">
              {simulationResult.userTeam.postTradeRankDist.map((postProb, idx) => {
                const rankNum = idx + 1;
                const baseProb = simulationResult.userTeam.baselineRankDist[idx] ?? 0;
                const maxProb = Math.max(...simulationResult.userTeam.postTradeRankDist, 0.35);
                const heightPost = `${Math.min(100, Math.round((postProb / maxProb) * 100))}%`;
                const heightBase = `${Math.min(100, Math.round((baseProb / maxProb) * 100))}%`;

                return (
                  <div key={rankNum} className="flex flex-col items-center space-y-2">
                    <div className="h-28 w-full flex items-end justify-center gap-1 px-1">
                      {/* Baseline bar */}
                      <div
                        style={{ height: heightBase }}
                        className="w-1/2 bg-slate-600 rounded-t transition-all"
                        title={`Baseline: ${(baseProb * 100).toFixed(1)}%`}
                      />
                      {/* Post-Trade bar */}
                      <div
                        style={{ height: heightPost }}
                        className="w-1/2 bg-sky-500 rounded-t transition-all shadow-sm shadow-sky-500/50"
                        title={`Post-Trade: ${(postProb * 100).toFixed(1)}%`}
                      />
                    </div>
                    <div className="text-[11px] font-mono font-bold text-slate-300">
                      #{rankNum}
                    </div>
                    <div className="text-[10px] font-mono text-sky-400">
                      {(postProb * 100).toFixed(0)}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Value-at-Risk Floor / Ceiling Percentiles */}
          <div className="bg-rink-card border border-rink-border rounded-xl p-5 shadow-lg space-y-4">
            <div className="border-b border-rink-border pb-3">
              <h3 className="text-base font-bold text-white">
                Value-at-Risk Profile (Floor vs Ceiling)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Evaluates risk exposure across 10th percentile floor (injuries, slumps) up to 90th percentile championship ceiling.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-rink-surface border border-rink-border rounded-xl p-4">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                  10th Percentile (Floor)
                </span>
                <div className="text-xl font-black text-white mt-1">
                  {simulationResult.userTeam.pointsPercentilesPostTrade.p10.toFixed(1)} pts
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Baseline: {simulationResult.userTeam.pointsPercentilesBaseline.p10.toFixed(1)} pts
                </div>
              </div>

              <div className="bg-rink-surface border border-rink-border rounded-xl p-4">
                <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider">
                  50th Percentile (Median Expected)
                </span>
                <div className="text-xl font-black text-white mt-1">
                  {simulationResult.userTeam.pointsPercentilesPostTrade.p50.toFixed(1)} pts
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Baseline: {simulationResult.userTeam.pointsPercentilesBaseline.p50.toFixed(1)} pts
                </div>
              </div>

              <div className="bg-rink-surface border border-rink-border rounded-xl p-4">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                  90th Percentile (Ceiling Upside)
                </span>
                <div className="text-xl font-black text-white mt-1">
                  {simulationResult.userTeam.pointsPercentilesPostTrade.p90.toFixed(1)} pts
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Baseline: {simulationResult.userTeam.pointsPercentilesBaseline.p90.toFixed(1)} pts
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
