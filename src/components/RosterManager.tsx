import React, { useState, useMemo } from 'react';
import {
  Users,
  Trophy,
  Shield,
  Upload,
  UserCheck,
  Check,
  DollarSign,
  Info,
} from 'lucide-react';
import { FantasyLeague, FantasyTeam } from '../types/league';
import { Player } from '../types/player';

interface RosterManagerProps {
  league: FantasyLeague;
  setLeague: React.Dispatch<React.SetStateAction<FantasyLeague>>;
  players: Player[];
}

export const RosterManager: React.FC<RosterManagerProps> = ({
  league,
  setLeague,
  players,
}) => {
  const [selectedTeamId, setSelectedTeamId] = useState<string>(
    league.teams.find((t) => t.isUserTeam)?.id ?? league.teams[0].id
  );
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [importSuccess, setImportSuccess] = useState(false);

  const playersMap = useMemo(() => {
    const map = new Map<number, Player>();
    for (const p of players) map.set(p.id, p);
    return map;
  }, [players]);

  const selectedTeam = useMemo(
    () => league.teams.find((t) => t.id === selectedTeamId) ?? league.teams[0],
    [league, selectedTeamId]
  );

  const teamPlayers = useMemo(
    () => selectedTeam.playerIds.map((id) => playersMap.get(id)).filter(Boolean) as Player[],
    [selectedTeam, playersMap]
  );

  const skaters = teamPlayers.filter((p) => p.playerType !== 'goalie');
  const goalies = teamPlayers.filter((p) => p.playerType === 'goalie');

  const totalCap = teamPlayers.reduce((sum, p) => sum + p.capHit, 0);
  const capCeiling = league.scoring.salaryCapCeiling;

  const handleSetUserTeam = (teamId: string) => {
    setLeague((prev) => ({
      ...prev,
      teams: prev.teams.map((t) => ({
        ...t,
        isUserTeam: t.id === teamId,
      })),
    }));
  };

  const handleImportRosters = () => {
    if (!importText.trim()) return;

    // Simple parser: lines with "Player Name"
    const lines = importText.split('\n').map((l) => l.trim()).filter(Boolean);
    const matchedIds: number[] = [];

    for (const line of lines) {
      const cleanLine = line.toLowerCase();
      const matched = players.find(
        (p) =>
          cleanLine.includes(p.name.toLowerCase()) ||
          p.name.toLowerCase().includes(cleanLine)
      );
      if (matched && !matchedIds.includes(matched.id)) {
        matchedIds.push(matched.id);
      }
    }

    if (matchedIds.length > 0) {
      setLeague((prev) => ({
        ...prev,
        teams: prev.teams.map((t) =>
          t.id === selectedTeamId ? { ...t, playerIds: matchedIds } : t
        ),
      }));
      setImportSuccess(true);
      setTimeout(() => {
        setImportSuccess(false);
        setShowImportModal(false);
        setImportText('');
      }, 1200);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-rink-card border border-rink-border rounded-xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
            Fantasy League Hub
          </span>
          <h2 className="text-2xl font-black text-white">{league.name}</h2>
          <p className="text-xs text-slate-400 mt-1">
            12-team Rotisserie format • 9 Skater Categories • 5 Goalie Categories • $88M Cap Ceiling
          </p>
        </div>

        <button
          onClick={() => setShowImportModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-rink-surface border border-rink-border hover:border-slate-500 text-slate-200 text-xs font-bold transition shadow-sm"
        >
          <Upload className="w-4 h-4 text-brand-400" />
          <span>Import Custom Rosters / CSV</span>
        </button>
      </div>

      {/* Main Grid: Standings on Left, Roster on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Standings Table (1 Col) */}
        <div className="bg-rink-card border border-rink-border rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-rink-border pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>League Standings</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">12 Teams</span>
          </div>

          <div className="space-y-1.5">
            {league.teams.map((team, idx) => {
              const isSelected = team.id === selectedTeamId;
              return (
                <div
                  key={team.id}
                  onClick={() => setSelectedTeamId(team.id)}
                  className={`flex items-center justify-between p-3 rounded-lg border transition cursor-pointer ${
                    isSelected
                      ? 'bg-sky-950/40 border-sky-500/50 text-white'
                      : 'bg-rink-surface/50 border-rink-border hover:border-slate-600 text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-mono font-bold text-slate-400 w-4">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        <span className="truncate max-w-[140px]">{team.name}</span>
                        {team.isUserTeam && (
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-sky-500 text-black">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">{team.manager}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-sky-400">
                      {team.playerIds.length} players
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Team Roster Inspector (2 Cols) */}
        <div className="lg:col-span-2 bg-rink-card border border-rink-border rounded-xl p-5 shadow-lg space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rink-border pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-white">{selectedTeam.name}</h3>
                {selectedTeam.isUserTeam ? (
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">
                    Your Primary Team
                  </span>
                ) : (
                  <button
                    onClick={() => handleSetUserTeam(selectedTeam.id)}
                    className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Set as My Team</span>
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Managed by <strong className="text-slate-200">{selectedTeam.manager}</strong>
              </p>
            </div>

            {/* Cap Status Box */}
            <div className="bg-rink-surface border border-rink-border rounded-lg px-3 py-2 text-right">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">
                Active Cap Hit
              </span>
              <div className="text-sm font-black font-mono text-emerald-400">
                ${(totalCap / 1e6).toFixed(2)}M / ${(capCeiling / 1e6).toFixed(0)}M
              </div>
            </div>
          </div>

          {/* Skaters Section */}
          <div>
            <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-2.5">
              Skaters ({skaters.length})
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-rink-border text-slate-400 text-[11px] uppercase">
                    <th className="py-2 px-2">Player</th>
                    <th className="py-2 px-2">Team</th>
                    <th className="py-2 px-2">Pos</th>
                    <th className="py-2 px-2 text-right">G</th>
                    <th className="py-2 px-2 text-right">A</th>
                    <th className="py-2 px-2 text-right">PTS</th>
                    <th className="py-2 px-2 text-right">+/-</th>
                    <th className="py-2 px-2 text-right">SOG</th>
                    <th className="py-2 px-2 text-right">HIT</th>
                    <th className="py-2 px-2 text-right">BLK</th>
                    <th className="py-2 px-2 text-right">Cap Hit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rink-border/40">
                  {skaters.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/30">
                      <td className="py-2 px-2 font-bold text-white flex items-center gap-2">
                        {p.headshotUrl && (
                          <img
                            src={p.headshotUrl}
                            alt={p.name}
                            className="w-6 h-6 rounded-full object-cover bg-slate-800"
                          />
                        )}
                        <span>{p.name}</span>
                      </td>
                      <td className="py-2 px-2 text-slate-400 font-mono">{p.nhlTeam}</td>
                      <td className="py-2 px-2 text-sky-400 font-mono">{p.primaryPosition}</td>
                      <td className="py-2 px-2 text-right font-mono">{p.actualStats.skater?.goals ?? 0}</td>
                      <td className="py-2 px-2 text-right font-mono">{p.actualStats.skater?.assists ?? 0}</td>
                      <td className="py-2 px-2 text-right font-mono font-bold text-white">{p.actualStats.skater?.points ?? 0}</td>
                      <td className="py-2 px-2 text-right font-mono">{p.actualStats.skater?.plusMinus ?? 0}</td>
                      <td className="py-2 px-2 text-right font-mono">{p.actualStats.skater?.shots ?? 0}</td>
                      <td className="py-2 px-2 text-right font-mono">{p.actualStats.skater?.hits ?? 0}</td>
                      <td className="py-2 px-2 text-right font-mono">{p.actualStats.skater?.blockedShots ?? 0}</td>
                      <td className="py-2 px-2 text-right font-mono text-emerald-400 font-semibold">
                        ${(p.capHit / 1e6).toFixed(2)}M
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Goalies Section */}
          {goalies.length > 0 && (
            <div className="pt-2">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2.5">
                Goalies ({goalies.length})
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-rink-border text-slate-400 text-[11px] uppercase">
                      <th className="py-2 px-2">Player</th>
                      <th className="py-2 px-2">Team</th>
                      <th className="py-2 px-2 text-right">GP</th>
                      <th className="py-2 px-2 text-right">W</th>
                      <th className="py-2 px-2 text-right">GAA</th>
                      <th className="py-2 px-2 text-right">SV%</th>
                      <th className="py-2 px-2 text-right">Saves</th>
                      <th className="py-2 px-2 text-right">SO</th>
                      <th className="py-2 px-2 text-right">Cap Hit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rink-border/40">
                    {goalies.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-800/30">
                        <td className="py-2 px-2 font-bold text-white flex items-center gap-2">
                          {p.headshotUrl && (
                            <img
                              src={p.headshotUrl}
                              alt={p.name}
                              className="w-6 h-6 rounded-full object-cover bg-slate-800"
                            />
                          )}
                          <span>{p.name}</span>
                        </td>
                        <td className="py-2 px-2 text-slate-400 font-mono">{p.nhlTeam}</td>
                        <td className="py-2 px-2 text-right font-mono">{p.actualStats.goalie?.gamesPlayed ?? 0}</td>
                        <td className="py-2 px-2 text-right font-mono font-bold text-white">{p.actualStats.goalie?.wins ?? 0}</td>
                        <td className="py-2 px-2 text-right font-mono text-amber-400">{p.actualStats.goalie?.goalsAgainstAverage ?? 2.50}</td>
                        <td className="py-2 px-2 text-right font-mono text-emerald-400">{p.actualStats.goalie?.savePercentage ?? 0.910}</td>
                        <td className="py-2 px-2 text-right font-mono">{p.actualStats.goalie?.saves ?? 0}</td>
                        <td className="py-2 px-2 text-right font-mono">{p.actualStats.goalie?.shutouts ?? 0}</td>
                        <td className="py-2 px-2 text-right font-mono text-emerald-400 font-semibold">
                          ${(p.capHit / 1e6).toFixed(2)}M
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom Roster Importer Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-rink-card border border-rink-border rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-rink-border pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-brand-400" />
                <span>Import Custom Roster into {selectedTeam.name}</span>
              </h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Paste your player names (one per line) from Yahoo, ESPN, or Fantrax. The engine will match them to our official NHL database:
            </p>

            <textarea
              rows={6}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Connor McDavid&#10;Leon Draisaitl&#10;Evan Bouchard&#10;Stuart Skinner"
              className="w-full bg-rink-surface border border-rink-border rounded-lg p-3 text-xs text-white font-mono focus:outline-none focus:border-brand-500"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-3.5 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleImportRosters}
                className="px-4 py-2 rounded-lg bg-sky-600 text-white text-xs font-bold hover:bg-sky-500 flex items-center gap-1.5"
              >
                {importSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Roster Updated!</span>
                  </>
                ) : (
                  <span>Match & Update Roster</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
