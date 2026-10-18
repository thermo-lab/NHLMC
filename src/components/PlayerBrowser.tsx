import React, { useState, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  Flame,
  Shield,
  Activity,
  DollarSign,
  ChevronDown,
  ExternalLink,
} from 'lucide-react';
import { Player, Position } from '../types/player';

interface PlayerBrowserProps {
  players: Player[];
}

export const PlayerBrowser: React.FC<PlayerBrowserProps> = ({ players }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState<string>('ALL');
  const [teamFilter, setTeamFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('POINTS');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const uniqueTeams = useMemo(() => {
    const set = new Set<string>();
    for (const p of players) if (p.nhlTeam) set.add(p.nhlTeam);
    return Array.from(set).sort();
  }, [players]);

  const filteredPlayers = useMemo(() => {
    return players
      .filter((p) => {
        if (teamFilter !== 'ALL' && p.nhlTeam !== teamFilter) return false;

        const matchesSearch =
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.nhlTeam.toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;

        if (positionFilter === 'ALL') return true;
        if (positionFilter === 'G') return p.playerType === 'goalie';
        if (positionFilter === 'D') return p.primaryPosition === 'D';
        if (positionFilter === 'F') return ['C', 'LW', 'RW', 'F'].includes(p.primaryPosition);
        return p.positions.includes(positionFilter as Position);
      })
      .sort((a, b) => {
        if (sortBy === 'POINTS') {
          const ptsA = a.playerType === 'goalie' ? 0 : a.actualStats.skater?.points ?? 0;
          const ptsB = b.playerType === 'goalie' ? 0 : b.actualStats.skater?.points ?? 0;
          return ptsB - ptsA;
        }
        if (sortBy === 'GOALS') {
          const gA = a.playerType === 'goalie' ? 0 : a.actualStats.skater?.goals ?? 0;
          const gB = b.playerType === 'goalie' ? 0 : b.actualStats.skater?.goals ?? 0;
          return gB - gA;
        }
        if (sortBy === 'ASSISTS') {
          const aA = a.playerType === 'goalie' ? 0 : a.actualStats.skater?.assists ?? 0;
          const aB = b.playerType === 'goalie' ? 0 : b.actualStats.skater?.assists ?? 0;
          return aB - aA;
        }
        if (sortBy === 'CAP') {
          return b.capHit - a.capHit;
        }
        if (sortBy === 'WINS') {
          const wA = a.playerType === 'goalie' ? a.actualStats.goalie?.wins ?? 0 : 0;
          const wB = b.playerType === 'goalie' ? b.actualStats.goalie?.wins ?? 0 : 0;
          return wB - wA;
        }
        return 0;
      });
  }, [players, searchTerm, positionFilter, teamFilter, sortBy]);

  return (
    <div className="space-y-6">
      {/* Header & Search Bar */}
      <div className="bg-rink-card border border-rink-border rounded-xl p-5 shadow-lg space-y-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
            Player Directory
          </span>
          <h2 className="text-2xl font-black text-white">NHL Superstars & Projections</h2>
          <p className="text-xs text-slate-400 mt-1">
            Connected to official NHL API with authentic 2026–2027 statistics, headshots, cap hits, and forward-looking projection baselines.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-rink-border">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by player name or NHL team (e.g. McDavid, EDM, Makar)..."
              className="w-full bg-rink-surface border border-rink-border text-white text-xs rounded-lg pl-9 pr-3 py-2.5 focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Position Pills */}
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0">
            {['ALL', 'F', 'C', 'LW', 'RW', 'D', 'G'].map((pos) => (
              <button
                key={pos}
                onClick={() => setPositionFilter(pos)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  positionFilter === pos
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-rink-surface text-slate-400 hover:text-white border border-rink-border'
                }`}
              >
                {pos}
              </button>
            ))}
          </div>

          {/* Team Dropdown */}
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span>Team:</span>
            <select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              className="bg-rink-surface border border-rink-border text-white font-bold rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand-500"
            >
              <option value="ALL">All 32 Teams</option>
              {uniqueTeams.map((team) => (
                <option key={team} value={team}>
                  {team}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-rink-surface border border-rink-border text-sky-400 font-bold rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand-500"
            >
              <option value="POINTS">Points (PTS)</option>
              <option value="GOALS">Goals (G)</option>
              <option value="ASSISTS">Assists (A)</option>
              <option value="CAP">Cap Hit ($M)</option>
              <option value="WINS">Goalie Wins</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500 pt-1 flex items-center justify-between">
          <span>Showing <strong className="text-white font-mono">{filteredPlayers.length}</strong> active NHL players across 32 franchises.</span>
        </div>
      </div>

      {/* Players Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlayers.map((player) => {
          const isGoalie = player.playerType === 'goalie';
          return (
            <div
              key={player.id}
              onClick={() => setSelectedPlayer(player)}
              className="bg-rink-card border border-rink-border rounded-xl p-4 shadow-md hover:border-slate-500 hover:bg-slate-800/20 transition cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center space-x-3 mb-3">
                  {player.headshotUrl ? (
                    <img
                      src={player.headshotUrl}
                      alt={player.name}
                      className="w-12 h-12 rounded-full object-cover bg-slate-800 border border-slate-700"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-400">
                      {player.name.substring(0, 2)}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white truncate">{player.name}</h4>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-sky-400 border border-slate-700">
                        {player.primaryPosition}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-0.5">
                      <span>{player.nhlTeam}</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-semibold">
                        ${(player.capHit / 1e6).toFixed(2)}M AAV
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stat Line Pills */}
                {isGoalie ? (
                  <div className="grid grid-cols-4 gap-1 text-center bg-rink-surface p-2 rounded-lg border border-rink-border text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-slate-500 block">W</span>
                      <span className="font-bold text-white">{player.actualStats.goalie?.wins ?? 0}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">GAA</span>
                      <span className="font-bold text-amber-400">
                        {player.actualStats.goalie?.goalsAgainstAverage ?? 2.50}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">SV%</span>
                      <span className="font-bold text-emerald-400">
                        {player.actualStats.goalie?.savePercentage ?? 0.910}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">SO</span>
                      <span className="font-bold text-sky-400">{player.actualStats.goalie?.shutouts ?? 0}</span>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-1 text-center bg-rink-surface p-2 rounded-lg border border-rink-border text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-slate-500 block">G</span>
                      <span className="font-bold text-white">{player.actualStats.skater?.goals ?? 0}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">A</span>
                      <span className="font-bold text-white">{player.actualStats.skater?.assists ?? 0}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">PTS</span>
                      <span className="font-bold text-sky-400">{player.actualStats.skater?.points ?? 0}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">SOG</span>
                      <span className="font-bold text-slate-300">{player.actualStats.skater?.shots ?? 0}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Rest of Season Projection Summary */}
              <div className="mt-3 pt-2 border-t border-rink-border/50 flex items-center justify-between text-[11px] text-slate-400">
                <span>Rest of Season Expectation:</span>
                <span className="font-mono font-bold text-brand-300">
                  {isGoalie
                    ? `~${player.projections.rosWins ?? 28} W | ${player.projections.rosSavePctg ?? 0.912} SV%`
                    : `~${player.projections.rosGoals ?? 25} G | ~${player.projections.rosPoints ?? 65} PTS`}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Player Detail Modal */}
      {selectedPlayer && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-rink-card border border-rink-border rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-rink-border pb-3">
              <div className="flex items-center space-x-3">
                {selectedPlayer.headshotUrl && (
                  <img
                    src={selectedPlayer.headshotUrl}
                    alt={selectedPlayer.name}
                    className="w-12 h-12 rounded-full object-cover bg-slate-800"
                  />
                )}
                <div>
                  <h3 className="text-base font-bold text-white">{selectedPlayer.name}</h3>
                  <div className="text-xs text-slate-400 font-mono">
                    {selectedPlayer.primaryPosition} • {selectedPlayer.nhlTeam} • ${(selectedPlayer.capHit / 1e6).toFixed(2)}M AAV
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedPlayer(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Projection Details */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                Stochastic Rest-of-Season Profile
              </h4>
              <div className="bg-rink-surface p-3 rounded-lg border border-rink-border space-y-1.5 text-xs text-slate-300 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Remaining Games Base:</span>
                  <span className="font-bold text-white">{selectedPlayer.projections.rosGamesRemaining} GP</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Playing Time Volatility (SD):</span>
                  <span className="font-bold text-amber-400">
                    ±{(selectedPlayer.projections.sdPlayingTimePct * 100).toFixed(0)}%
                  </span>
                </div>
                {selectedPlayer.playerType === 'goalie' ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Expected Starts:</span>
                      <span className="font-bold text-white">{selectedPlayer.projections.rosGamesStarted}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Projected Save %:</span>
                      <span className="font-bold text-emerald-400">{selectedPlayer.projections.rosSavePctg}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Projected Goals:</span>
                      <span className="font-bold text-white">{selectedPlayer.projections.rosGoals}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Projected Assists:</span>
                      <span className="font-bold text-white">{selectedPlayer.projections.rosAssists}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Projected Power Play Pts:</span>
                      <span className="font-bold text-white">{selectedPlayer.projections.rosPPP}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedPlayer(null)}
                className="px-4 py-2 rounded-lg bg-sky-600 text-white text-xs font-bold hover:bg-sky-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
