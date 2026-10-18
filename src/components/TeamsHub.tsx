import React, { useState } from 'react';
import {
  Shield,
  Trophy,
  DollarSign,
  TrendingUp,
  Award,
  Users,
} from 'lucide-react';
import { NHLTeam } from '../types/franchise';
import { Player } from '../types/player';

interface TeamsHubProps {
  franchises: NHLTeam[];
  players: Player[];
  onSelectTeamForTrade?: (teamId: string) => void;
}

export const TeamsHub: React.FC<TeamsHubProps> = ({ franchises, players, onSelectTeamForTrade }) => {
  const [selectedConference, setSelectedConference] = useState<'ALL' | 'Eastern' | 'Western'>('ALL');

  const filteredTeams = franchises.filter((t) => {
    if (selectedConference === 'ALL') return true;
    return t.conference === selectedConference;
  });

  const playersMap = new Map<number, Player>();
  for (const p of players) playersMap.set(p.id, p);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-rink-card border border-rink-border rounded-xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
            Franchise Directory & Standings
          </span>
          <h2 className="text-2xl font-black text-white">NHL Teams & Payroll Matrix</h2>
          <p className="text-xs text-slate-400 mt-1">
            Official 2026–2027 standings, 5v5 goal differential, and \$88.0M salary cap payroll tracking.
          </p>
        </div>

        {/* Conference Filter */}
        <div className="flex items-center space-x-1 bg-rink-surface p-1 rounded-lg border border-rink-border">
          <button
            onClick={() => setSelectedConference('ALL')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${
              selectedConference === 'ALL'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Teams
          </button>
          <button
            onClick={() => setSelectedConference('Eastern')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${
              selectedConference === 'Eastern'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Eastern
          </button>
          <button
            onClick={() => setSelectedConference('Western')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${
              selectedConference === 'Western'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Western
          </button>
        </div>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTeams.map((team) => {
          const roster = players.filter((p) => p.nhlTeam === team.abbrev);
          return (
            <div
              key={team.id}
              className="bg-rink-card border border-rink-border rounded-xl p-5 shadow-md flex flex-col justify-between space-y-4 hover:border-slate-500 transition"
            >
              <div>
                {/* Team Info */}
                <div className="flex items-center justify-between border-b border-rink-border pb-3">
                  <div className="flex items-center space-x-3">
                    <img
                      src={team.logoUrl}
                      alt={team.name}
                      className="w-10 h-10 object-contain"
                    />
                    <div>
                      <h3 className="text-base font-black text-white">{team.name}</h3>
                      <span className="text-xs text-slate-400 font-mono">
                        {team.division} Division • {team.conference}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-sky-400 border border-slate-700">
                    {team.contenderTier.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Record and Cap Stats */}
                <div className="grid grid-cols-3 gap-2 text-center bg-rink-surface p-2.5 rounded-lg border border-rink-border mt-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Record</span>
                    <span className="font-bold font-mono text-white">
                      {team.record.wins}-{team.record.losses}-{team.record.otLosses}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Points</span>
                    <span className="font-bold font-mono text-sky-400">{team.record.points} pts</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Goal Diff</span>
                    <span
                      className={`font-bold font-mono ${
                        team.record.goalDifferential > 0
                          ? 'text-emerald-400'
                          : team.record.goalDifferential < 0
                          ? 'text-red-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {team.record.goalDifferential > 0
                        ? `+${team.record.goalDifferential}`
                        : team.record.goalDifferential}
                    </span>
                  </div>
                </div>

                {/* Team Ratings */}
                <div className="mt-3 space-y-1.5 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Offense (xGF/60):</span>
                    <span className="font-mono font-bold text-white">{team.xgfPer60}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Defense (xGA/60):</span>
                    <span className="font-mono font-bold text-white">{team.xgaPer60}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Cap Payroll / Ceiling:</span>
                    <span className="font-mono font-bold text-emerald-400">
                      ${(team.activePayroll / 1e6).toFixed(1)}M / $88.0M
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Cap Space:</span>
                    <span className="font-mono font-bold text-sky-400">
                      ${(team.capSpace / 1e6).toFixed(2)}M
                    </span>
                  </div>
                </div>

                {/* Key Franchise Stars */}
                {roster.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-rink-border/50">
                    <span className="text-[10px] text-slate-500 block uppercase font-semibold mb-2">
                      Franchise Core:
                    </span>
                    <div className="flex items-center -space-x-2">
                      {roster.slice(0, 4).map((p) => (
                        <div key={p.id} title={`${p.name} (${p.primaryPosition})`}>
                          {p.headshotUrl ? (
                            <img
                              src={p.headshotUrl}
                              alt={p.name}
                              className="w-8 h-8 rounded-full object-cover bg-slate-800 border-2 border-rink-card shadow-sm"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-rink-card flex items-center justify-center text-[10px] font-bold text-slate-400">
                              {p.name.substring(0, 2)}
                            </div>
                          )}
                        </div>
                      ))}
                      {roster.length > 4 && (
                        <span className="pl-3 text-[11px] text-slate-400 font-mono">
                          +{roster.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Trade Button */}
                <div className="mt-4 pt-3 border-t border-rink-border/50">
                  <button
                    onClick={() => onSelectTeamForTrade?.(team.id)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-sky-600/20 hover:bg-sky-600/30 text-sky-400 border border-sky-500/30 text-xs font-bold transition"
                  >
                    <span>Trade Machine with {team.commonName} ⇄</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
