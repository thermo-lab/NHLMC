import React, { useState, useMemo } from 'react';
import {
  Trophy,
  Shield,
  Zap,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Flame,
  ArrowRight,
  Trash2,
  Plus,
  Percent,
} from 'lucide-react';
import { NHLTeam, FranchiseTradeProposal, FranchiseTradeEvaluation } from '../types/franchise';
import { Player } from '../types/player';
import { evaluateFranchiseTrade } from '../engine/franchiseSimulation';

interface FranchiseTradeMachineProps {
  franchises: NHLTeam[];
  players: Player[];
}

export const FranchiseTradeMachine: React.FC<FranchiseTradeMachineProps> = ({
  franchises,
  players,
}) => {
  const [teamAId, setTeamAId] = useState<string>('EDM');
  const [teamBId, setTeamBId] = useState<string>('FLA');

  // Trade proposals: player IDs
  const [teamAPlayerIds, setTeamAPlayerIds] = useState<number[]>([26]); // Zach Hyman ($5.5M)
  const [teamBPlayerIds, setTeamBPlayerIds] = useState<number[]>([20]); // Sam Reinhart ($8.625M)

  // Draft pick additions
  const [teamADraftPick, setTeamADraftPick] = useState<string>('2025 1st Round Pick');
  const [includeTeamAPick, setIncludeTeamAPick] = useState<boolean>(false);

  // Salary retention
  const [retainSalary, setRetainSalary] = useState<boolean>(false);
  const [retentionPct, setRetentionPct] = useState<number>(25);

  const [iterations, setIterations] = useState<number>(2500);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [evaluation, setEvaluation] = useState<FranchiseTradeEvaluation | null>(null);

  const playersMap = useMemo(() => {
    const map = new Map<number, Player>();
    for (const p of players) map.set(p.id, p);
    return map;
  }, [players]);

  const teamA = useMemo(
    () => franchises.find((t) => t.id === teamAId) ?? franchises[0],
    [franchises, teamAId]
  );
  const teamB = useMemo(
    () => franchises.find((t) => t.id === teamBId) ?? franchises[1],
    [franchises, teamBId]
  );

  const teamARoster = useMemo(
    () => players.filter((p) => p.nhlTeam === teamA.abbrev),
    [players, teamA]
  );
  const teamBRoster = useMemo(
    () => players.filter((p) => p.nhlTeam === teamB.abbrev),
    [players, teamB]
  );

  const teamASendingPlayers = teamAPlayerIds.map((id) => playersMap.get(id)).filter(Boolean) as Player[];
  const teamBSendingPlayers = teamBPlayerIds.map((id) => playersMap.get(id)).filter(Boolean) as Player[];

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      try {
        const proposal: FranchiseTradeProposal = {
          teamAId: teamA.id,
          teamBId: teamB.id,
          teamAPlayerIds,
          teamBPlayerIds,
          salaryRetention: retainSalary && teamAPlayerIds.length > 0
            ? [{ playerId: teamAPlayerIds[0], retainedPct: retentionPct, retainingTeamId: teamA.id }]
            : undefined,
        };

        const result = evaluateFranchiseTrade(franchises, players, proposal, iterations);
        setEvaluation(result);
      } catch (err) {
        console.error('Franchise simulation error:', err);
      } finally {
        setIsSimulating(false);
      }
    }, 60);
  };

  // Run initial trade evaluation on mount
  React.useEffect(() => {
    handleRunSimulation();
  }, []);

  const formatDelta = (val: number, isPercent: boolean = false) => {
    const sign = val > 0 ? '+' : '';
    return isPercent ? `${sign}${(val * 100).toFixed(1)}%` : `${sign}${val.toFixed(1)}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-rink-card border border-rink-border rounded-xl p-5 shadow-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold mb-2">
              <Trophy className="w-3.5 h-3.5" />
              <span>NHL Franchise Competitiveness & Stanley Cup Simulator</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Real NHL Trade Machine
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
              Model authentic trades between real NHL franchises. Simulates 82-game regular season standings points, 5v5 goal differential, the \$88.0M salary cap, and true 4-round Stanley Cup Playoff win probabilities.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-rink-surface p-2.5 rounded-xl border border-rink-border text-xs text-slate-300">
            <span>Sim Iterations:</span>
            <select
              value={iterations}
              onChange={(e) => setIterations(Number(e.target.value))}
              className="bg-slate-900 border border-slate-700 text-sky-400 font-bold rounded px-2 py-1 text-xs focus:outline-none"
            >
              <option value={1000}>1,000</option>
              <option value={2500}>2,500</option>
              <option value={5000}>5,000</option>
              <option value={10000}>10,000</option>
            </select>
          </div>
        </div>
      </div>

      {/* Dual Team Trade Builder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team A */}
        <div className="bg-rink-card border border-rink-border rounded-xl p-5 shadow-lg flex flex-col justify-between space-y-4">
          <div>
            {/* Team Header */}
            <div className="flex items-center justify-between border-b border-rink-border pb-3">
              <div className="flex items-center space-x-3">
                <img
                  src={teamA.logoUrl}
                  alt={teamA.name}
                  className="w-9 h-9 object-contain"
                />
                <div>
                  <select
                    value={teamAId}
                    onChange={(e) => {
                      setTeamAId(e.target.value);
                      setTeamAPlayerIds([]);
                    }}
                    className="bg-rink-surface border border-rink-border text-white text-base font-black rounded-lg px-2.5 py-1 focus:outline-none focus:border-brand-500"
                  >
                    {franchises.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.conference})
                      </option>
                    ))}
                  </select>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {teamA.record.wins}-{teamA.record.losses}-{teamA.record.otLosses} ({teamA.record.points} pts) • Cap Space: ${(teamA.capSpace / 1e6).toFixed(2)}M
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">
                {teamA.contenderTier.replace(/_/g, ' ')}
              </span>
            </div>

            {/* Assets Sending Away */}
            <div className="mt-4 space-y-2 min-h-[90px]">
              <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider block">
                {teamA.name} Sends Away:
              </span>
              {teamASendingPlayers.length === 0 ? (
                <div className="border border-dashed border-slate-700 rounded-lg p-4 text-center text-xs text-slate-500">
                  Select players below to trade from {teamA.name}.
                </div>
              ) : (
                teamASendingPlayers.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between bg-rink-surface border border-rink-border rounded-lg p-2.5"
                  >
                    <div className="flex items-center space-x-2.5">
                      {p.headshotUrl && (
                        <img
                          src={p.headshotUrl}
                          alt={p.name}
                          className="w-9 h-9 rounded-full object-cover bg-slate-800"
                        />
                      )}
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{p.name}</span>
                          <span className="text-[9px] px-1 py-0.2 bg-slate-800 text-sky-400 rounded">
                            {p.primaryPosition}
                          </span>
                        </div>
                        <div className="text-[11px] text-emerald-400 font-mono">
                          ${(p.capHit / 1e6).toFixed(2)}M AAV
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        setTeamAPlayerIds(teamAPlayerIds.filter((id) => id !== p.id))
                      }
                      className="text-slate-500 hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}

              {/* Draft Pick Inclusion */}
              {includeTeamAPick && (
                <div className="flex items-center justify-between bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-300">
                  <span>Draft Pick: {teamADraftPick} ({teamA.abbrev})</span>
                  <button
                    onClick={() => setIncludeTeamAPick(false)}
                    className="text-slate-500 hover:text-red-400"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Add Players / Assets */}
          <div className="border-t border-rink-border pt-3 space-y-2">
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  const id = Number(e.target.value);
                  if (!teamAPlayerIds.includes(id)) {
                    setTeamAPlayerIds([...teamAPlayerIds, id]);
                  }
                }
              }}
              className="w-full bg-rink-surface border border-rink-border text-slate-200 text-xs rounded-lg p-2 focus:outline-none focus:border-brand-500"
            >
              <option value="">+ Add {teamA.name} player to trade...</option>
              {teamARoster
                .filter((p) => !teamAPlayerIds.includes(p.id))
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.primaryPosition}) - ${(p.capHit / 1e6).toFixed(2)}M
                  </option>
                ))}
            </select>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeTeamAPick}
                  onChange={(e) => setIncludeTeamAPick(e.target.checked)}
                  className="rounded bg-slate-800 text-sky-500"
                />
                <span>Include Future 1st Round Pick</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={retainSalary}
                  onChange={(e) => setRetainSalary(e.target.checked)}
                  className="rounded bg-slate-800 text-sky-500"
                />
                <span>Retain 25% Salary</span>
              </label>
            </div>
          </div>
        </div>

        {/* Team B */}
        <div className="bg-rink-card border border-rink-border rounded-xl p-5 shadow-lg flex flex-col justify-between space-y-4">
          <div>
            {/* Team Header */}
            <div className="flex items-center justify-between border-b border-rink-border pb-3">
              <div className="flex items-center space-x-3">
                <img
                  src={teamB.logoUrl}
                  alt={teamB.name}
                  className="w-9 h-9 object-contain"
                />
                <div>
                  <select
                    value={teamBId}
                    onChange={(e) => {
                      setTeamBId(e.target.value);
                      setTeamBPlayerIds([]);
                    }}
                    className="bg-rink-surface border border-rink-border text-white text-base font-black rounded-lg px-2.5 py-1 focus:outline-none focus:border-brand-500"
                  >
                    {franchises.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.conference})
                      </option>
                    ))}
                  </select>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {teamB.record.wins}-{teamB.record.losses}-{teamB.record.otLosses} ({teamB.record.points} pts) • Cap Space: ${(teamB.capSpace / 1e6).toFixed(2)}M
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {teamB.contenderTier.replace(/_/g, ' ')}
              </span>
            </div>

            {/* Assets Sending Away */}
            <div className="mt-4 space-y-2 min-h-[90px]">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                {teamB.name} Sends Away:
              </span>
              {teamBSendingPlayers.length === 0 ? (
                <div className="border border-dashed border-slate-700 rounded-lg p-4 text-center text-xs text-slate-500">
                  Select players below to trade from {teamB.name}.
                </div>
              ) : (
                teamBSendingPlayers.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between bg-rink-surface border border-rink-border rounded-lg p-2.5"
                  >
                    <div className="flex items-center space-x-2.5">
                      {p.headshotUrl && (
                        <img
                          src={p.headshotUrl}
                          alt={p.name}
                          className="w-9 h-9 rounded-full object-cover bg-slate-800"
                        />
                      )}
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{p.name}</span>
                          <span className="text-[9px] px-1 py-0.2 bg-slate-800 text-emerald-400 rounded">
                            {p.primaryPosition}
                          </span>
                        </div>
                        <div className="text-[11px] text-emerald-400 font-mono">
                          ${(p.capHit / 1e6).toFixed(2)}M AAV
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        setTeamBPlayerIds(teamBPlayerIds.filter((id) => id !== p.id))
                      }
                      className="text-slate-500 hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Add Players / Assets */}
          <div className="border-t border-rink-border pt-3 space-y-2">
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  const id = Number(e.target.value);
                  if (!teamBPlayerIds.includes(id)) {
                    setTeamBPlayerIds([...teamBPlayerIds, id]);
                  }
                }
              }}
              className="w-full bg-rink-surface border border-rink-border text-slate-200 text-xs rounded-lg p-2 focus:outline-none focus:border-brand-500"
            >
              <option value="">+ Add {teamB.name} player to trade...</option>
              {teamBRoster
                .filter((p) => !teamBPlayerIds.includes(p.id))
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.primaryPosition}) - ${(p.capHit / 1e6).toFixed(2)}M
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* Execute Simulation Button */}
      <div className="flex justify-center">
        <button
          onClick={handleRunSimulation}
          disabled={isSimulating}
          className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-white font-black text-sm shadow-xl shadow-sky-900/40 active:scale-95 transition disabled:opacity-50"
        >
          {isSimulating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <span>Simulating 82 Games & Stanley Cup Playoffs...</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              <span>Run NHL Franchise Monte Carlo Simulation</span>
            </>
          )}
        </button>
      </div>

      {/* Simulation Results Section */}
      {evaluation && (
        <div className="space-y-6">
          {/* Executive Verdict Banner */}
          <div className="bg-rink-card border border-rink-border rounded-xl p-5 shadow-lg space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rink-border pb-3">
              <div className="flex items-center space-x-2.5">
                <Trophy className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-black text-white">
                  Executive GM Trade Verdict
                </h3>
                <span className="text-xs text-slate-500">
                  ({evaluation.executionTimeMs}ms)
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">{teamA.abbrev} Recommendation:</span>
                <span
                  className={`font-black px-2 py-0.5 rounded ${
                    evaluation.verdict.actionRecommendationTeamA === 'EXECUTE'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {evaluation.verdict.actionRecommendationTeamA}
                </span>

                <span className="text-slate-400 ml-2">{teamB.abbrev} Recommendation:</span>
                <span
                  className={`font-black px-2 py-0.5 rounded ${
                    evaluation.verdict.actionRecommendationTeamB === 'EXECUTE'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {evaluation.verdict.actionRecommendationTeamB}
                </span>
              </div>
            </div>

            <p className="text-sm font-semibold text-white">
              {evaluation.verdict.summary}
            </p>

            <div className="space-y-1 pt-1">
              {evaluation.verdict.strategicAnalysisBullets.map((bullet, idx) => (
                <div key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                  <span className="text-sky-400 font-bold">•</span>
                  <span>{bullet}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Side-by-Side Impact Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Team A Metrics */}
            <div className="bg-rink-card border border-rink-border rounded-xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-rink-border pb-3">
                <div className="flex items-center gap-2">
                  <img src={teamA.logoUrl} alt={teamA.name} className="w-6 h-6 object-contain" />
                  <h4 className="text-sm font-bold text-white">{teamA.name} Impact</h4>
                </div>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded ${
                    evaluation.capImpact.teamA.isCapCompliant
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}
                >
                  {evaluation.capImpact.teamA.isCapCompliant ? 'CAP COMPLIANT' : 'OVER $88M CAP'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-rink-surface p-3 rounded-lg border border-rink-border">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Stanley Cup Win Prob
                  </span>
                  <div className="text-lg font-black text-white mt-0.5">
                    {(evaluation.teamA.postTrade.stanleyCupWinProb * 100).toFixed(1)}%
                    <span
                      className={`text-xs ml-1.5 font-bold ${
                        evaluation.teamA.deltas.stanleyCupDelta > 0
                          ? 'text-emerald-400'
                          : evaluation.teamA.deltas.stanleyCupDelta < 0
                          ? 'text-red-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {formatDelta(evaluation.teamA.deltas.stanleyCupDelta, true)}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Baseline: {(evaluation.teamA.baseline.stanleyCupWinProb * 100).toFixed(1)}%
                  </div>
                </div>

                <div className="bg-rink-surface p-3 rounded-lg border border-rink-border">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Playoff Qualification
                  </span>
                  <div className="text-lg font-black text-white mt-0.5">
                    {(evaluation.teamA.postTrade.playoffProbability * 100).toFixed(1)}%
                    <span
                      className={`text-xs ml-1.5 font-bold ${
                        evaluation.teamA.deltas.playoffProbDelta > 0
                          ? 'text-emerald-400'
                          : evaluation.teamA.deltas.playoffProbDelta < 0
                          ? 'text-red-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {formatDelta(evaluation.teamA.deltas.playoffProbDelta, true)}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Baseline: {(evaluation.teamA.baseline.playoffProbability * 100).toFixed(1)}%
                  </div>
                </div>

                <div className="bg-rink-surface p-3 rounded-lg border border-rink-border">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Expected Regular Pts
                  </span>
                  <div className="text-lg font-black text-white mt-0.5">
                    {evaluation.teamA.postTrade.expectedPoints} pts
                    <span
                      className={`text-xs ml-1.5 font-bold ${
                        evaluation.teamA.deltas.pointsDelta > 0
                          ? 'text-emerald-400'
                          : evaluation.teamA.deltas.pointsDelta < 0
                          ? 'text-red-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {formatDelta(evaluation.teamA.deltas.pointsDelta)}
                    </span>
                  </div>
                </div>

                <div className="bg-rink-surface p-3 rounded-lg border border-rink-border">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Net Goal Diff / 60
                  </span>
                  <div className="text-lg font-black text-white mt-0.5">
                    {(evaluation.teamA.postTrade.xgfPer60 - evaluation.teamA.postTrade.xgaPer60).toFixed(2)}
                    <span
                      className={`text-xs ml-1.5 font-bold ${
                        evaluation.teamA.deltas.goalDiffDeltaPer60 > 0
                          ? 'text-emerald-400'
                          : evaluation.teamA.deltas.goalDiffDeltaPer60 < 0
                          ? 'text-red-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {formatDelta(evaluation.teamA.deltas.goalDiffDeltaPer60)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cap Financials */}
              <div className="pt-2 border-t border-rink-border text-xs text-slate-300 flex items-center justify-between">
                <span>Post-Trade Payroll:</span>
                <span className="font-mono font-bold text-white">
                  ${(evaluation.capImpact.teamA.postTradePayroll / 1e6).toFixed(2)}M / $88.0M
                </span>
              </div>
            </div>

            {/* Team B Metrics */}
            <div className="bg-rink-card border border-rink-border rounded-xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-rink-border pb-3">
                <div className="flex items-center gap-2">
                  <img src={teamB.logoUrl} alt={teamB.name} className="w-6 h-6 object-contain" />
                  <h4 className="text-sm font-bold text-white">{teamB.name} Impact</h4>
                </div>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded ${
                    evaluation.capImpact.teamB.isCapCompliant
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}
                >
                  {evaluation.capImpact.teamB.isCapCompliant ? 'CAP COMPLIANT' : 'OVER $88M CAP'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-rink-surface p-3 rounded-lg border border-rink-border">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Stanley Cup Win Prob
                  </span>
                  <div className="text-lg font-black text-white mt-0.5">
                    {(evaluation.teamB.postTrade.stanleyCupWinProb * 100).toFixed(1)}%
                    <span
                      className={`text-xs ml-1.5 font-bold ${
                        evaluation.teamB.deltas.stanleyCupDelta > 0
                          ? 'text-emerald-400'
                          : evaluation.teamB.deltas.stanleyCupDelta < 0
                          ? 'text-red-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {formatDelta(evaluation.teamB.deltas.stanleyCupDelta, true)}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Baseline: {(evaluation.teamB.baseline.stanleyCupWinProb * 100).toFixed(1)}%
                  </div>
                </div>

                <div className="bg-rink-surface p-3 rounded-lg border border-rink-border">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Playoff Qualification
                  </span>
                  <div className="text-lg font-black text-white mt-0.5">
                    {(evaluation.teamB.postTrade.playoffProbability * 100).toFixed(1)}%
                    <span
                      className={`text-xs ml-1.5 font-bold ${
                        evaluation.teamB.deltas.playoffProbDelta > 0
                          ? 'text-emerald-400'
                          : evaluation.teamB.deltas.playoffProbDelta < 0
                          ? 'text-red-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {formatDelta(evaluation.teamB.deltas.playoffProbDelta, true)}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Baseline: {(evaluation.teamB.baseline.playoffProbability * 100).toFixed(1)}%
                  </div>
                </div>

                <div className="bg-rink-surface p-3 rounded-lg border border-rink-border">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Expected Regular Pts
                  </span>
                  <div className="text-lg font-black text-white mt-0.5">
                    {evaluation.teamB.postTrade.expectedPoints} pts
                    <span
                      className={`text-xs ml-1.5 font-bold ${
                        evaluation.teamB.deltas.pointsDelta > 0
                          ? 'text-emerald-400'
                          : evaluation.teamB.deltas.pointsDelta < 0
                          ? 'text-red-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {formatDelta(evaluation.teamB.deltas.pointsDelta)}
                    </span>
                  </div>
                </div>

                <div className="bg-rink-surface p-3 rounded-lg border border-rink-border">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Net Goal Diff / 60
                  </span>
                  <div className="text-lg font-black text-white mt-0.5">
                    {(evaluation.teamB.postTrade.xgfPer60 - evaluation.teamB.postTrade.xgaPer60).toFixed(2)}
                    <span
                      className={`text-xs ml-1.5 font-bold ${
                        evaluation.teamB.deltas.goalDiffDeltaPer60 > 0
                          ? 'text-emerald-400'
                          : evaluation.teamB.deltas.goalDiffDeltaPer60 < 0
                          ? 'text-red-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {formatDelta(evaluation.teamB.deltas.goalDiffDeltaPer60)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cap Financials */}
              <div className="pt-2 border-t border-rink-border text-xs text-slate-300 flex items-center justify-between">
                <span>Post-Trade Payroll:</span>
                <span className="font-mono font-bold text-white">
                  ${(evaluation.capImpact.teamB.postTradePayroll / 1e6).toFixed(2)}M / $88.0M
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
