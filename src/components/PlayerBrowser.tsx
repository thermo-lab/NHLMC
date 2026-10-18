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
  Sparkles,
  UserPlus,
  Users,
} from 'lucide-react';
import { Player, Position } from '../types/player';
import { NHLProspect, ProspectPotential } from '../types/prospect';
import { INITIAL_PROSPECTS } from '../data/nhlProspects';

interface PlayerBrowserProps {
  players: Player[];
  prospects?: NHLProspect[];
  onCreateProspect?: (newProspect: NHLProspect) => void;
}

export const PlayerBrowser: React.FC<PlayerBrowserProps> = ({
  players,
  prospects = INITIAL_PROSPECTS,
  onCreateProspect,
}) => {
  const [viewMode, setViewMode] = useState<'roster' | 'prospects'>('roster');
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState<string>('ALL');
  const [teamFilter, setTeamFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('POINTS');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [selectedProspect, setSelectedProspect] = useState<NHLProspect | null>(null);

  // Custom Prospect Creation Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTeam, setModalTeam] = useState('BUF');
  const [newProspectName, setNewProspectName] = useState('');
  const [newProspectPos, setNewProspectPos] = useState<'D' | 'C' | 'LW' | 'RW' | 'G'>('D');
  const [newProspectAge, setNewProspectAge] = useState(19);
  const [newProspectHeight, setNewProspectHeight] = useState("6'6\"");
  const [newProspectWeight, setNewProspectWeight] = useState(218);
  const [newProspectShoots, setNewProspectShoots] = useState<'R' | 'L'>('R');
  const [newProspectDraftInfo, setNewProspectDraftInfo] = useState('2025 Round 1, #9 Overall (BUF)');
  const [newProspectCurrentTeam, setNewProspectCurrentTeam] = useState('Rochester Americans (AHL) / Seattle (WHL)');
  const [newProspectPotential, setNewProspectPotential] = useState<ProspectPotential>('ELITE');
  const [newProspectNotes, setNewProspectNotes] = useState('');

  const uniqueTeams = useMemo(() => {
    const set = new Set<string>();
    for (const p of players) if (p.nhlTeam) set.add(p.nhlTeam);
    for (const pr of prospects) if (pr.nhlTeam) set.add(pr.nhlTeam);
    return Array.from(set).sort();
  }, [players, prospects]);

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

  const filteredProspects = useMemo(() => {
    return prospects.filter((pr) => {
      if (teamFilter !== 'ALL' && pr.nhlTeam !== teamFilter) return false;

      const matchesSearch =
        pr.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pr.nhlTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pr.currentTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pr.draftInfo.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      if (positionFilter === 'ALL') return true;
      if (positionFilter === 'G') return pr.position === 'G';
      if (positionFilter === 'D') return pr.position === 'D';
      if (positionFilter === 'F') return ['C', 'LW', 'RW'].includes(pr.position);
      return pr.position === positionFilter;
    });
  }, [prospects, searchTerm, positionFilter, teamFilter]);

  const handleSaveCustomProspect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProspectName.trim()) return;

    const newPr: NHLProspect = {
      id: `custom-${modalTeam.toLowerCase()}-${Date.now()}`,
      name: newProspectName.trim(),
      nhlTeam: modalTeam,
      position: newProspectPos,
      age: Number(newProspectAge),
      height: newProspectHeight.trim() || "6'2\"",
      weight: Number(newProspectWeight) || 200,
      shootsCatches: newProspectShoots,
      currentTeam: newProspectCurrentTeam.trim() || 'AHL / Junior',
      draftInfo: newProspectDraftInfo.trim() || 'Undrafted / Free Agent',
      draftYear: 2025,
      draftRound: 1,
      potential: newProspectPotential,
      potentialDescription: newProspectNotes.trim() || 'High-ceiling developmental prospect',
      scoutingSummary: newProspectNotes.trim() || 'Custom created prospect with NHL potential.',
      tradeValueScore: newProspectPotential === 'FRANCHISE' ? 95 : newProspectPotential === 'ELITE' ? 88 : 75,
      capHit: 950000,
      isCustom: true,
    };

    if (onCreateProspect) {
      onCreateProspect(newPr);
    }

    setIsModalOpen(false);
    setNewProspectName('');
    setNewProspectNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Header & Mode Switcher */}
      <div className="bg-rink-card border border-rink-border rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
              Player & Pipeline Directory
            </span>
            <h2 className="text-2xl font-black text-white">NHL Superstars & Top Prospects</h2>
            <p className="text-xs text-slate-400 mt-1">
              Browse 807 active NHL players and top franchise prospect pipelines across all 32 teams.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center space-x-1 bg-rink-surface p-1 rounded-lg border border-rink-border">
            <button
              onClick={() => setViewMode('roster')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 ${
                viewMode === 'roster' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Active Rosters ({players.length})</span>
            </button>
            <button
              onClick={() => setViewMode('prospects')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 ${
                viewMode === 'prospects' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Prospect Pipeline ({prospects.length})</span>
            </button>
          </div>
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
              placeholder={
                viewMode === 'roster'
                  ? 'Search player or team (e.g. McDavid, EDM, Makar)...'
                  : 'Search prospect, team, or draft (e.g. Radim Mrtka, BUF, Demidov)...'
              }
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
                    ? viewMode === 'prospects'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-sky-600 text-white shadow-sm'
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

          {viewMode === 'roster' && (
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
                <option value="CAP">Cap Hit ($ AAV)</option>
                <option value="WINS">Goalie Wins (W)</option>
              </select>
            </div>
          )}

          {viewMode === 'prospects' && (
            <button
              onClick={() => {
                setModalTeam(teamFilter !== 'ALL' ? teamFilter : 'BUF');
                setIsModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-sm"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Add Prospect</span>
            </button>
          )}
        </div>
      </div>

      {/* ================= PROSPECT PIPELINE VIEW ================= */}
      {viewMode === 'prospects' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProspects.map((pr) => (
            <div
              key={pr.id}
              onClick={() => setSelectedProspect(pr)}
              className="bg-rink-card border border-rink-border hover:border-purple-500/60 rounded-xl p-4 shadow-md transition cursor-pointer flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-base font-black text-white">{pr.name}</h3>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-900/60 text-purple-300">
                        {pr.position} • {pr.shootsCatches === 'R' ? 'RHD/R' : 'LHD/L'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">
                      {pr.nhlTeam} Rights • {pr.age} yrs • {pr.height}, {pr.weight} lbs
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    ⭐️ {pr.potential}
                  </span>
                </div>

                <div className="mt-2.5 pt-2 border-t border-rink-border/60 text-xs text-slate-300 space-y-1">
                  <div className="text-[11px] text-sky-400 font-semibold">{pr.draftInfo}</div>
                  <div className="text-[11px] text-slate-400">{pr.currentTeam}</div>
                  <p className="text-[11px] text-slate-300 line-clamp-2 mt-1.5">{pr.potentialDescription}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-rink-border/60 text-xs text-slate-400">
                <span>Trade Value Score:</span>
                <span className="font-mono font-bold text-purple-300">{pr.tradeValueScore} / 100</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= ACTIVE NHL PLAYERS VIEW ================= */}
      {viewMode === 'roster' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPlayers.map((player) => {
            const isGoalie = player.playerType === 'goalie';
            const skaterStats = player.actualStats.skater;
            const goalieStats = player.actualStats.goalie;

            return (
              <div
                key={player.id}
                onClick={() => setSelectedPlayer(player)}
                className="bg-rink-card border border-rink-border hover:border-slate-500 rounded-xl p-4 shadow-md transition cursor-pointer flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    {player.headshotUrl ? (
                      <img
                        src={player.headshotUrl}
                        alt={player.name}
                        className="w-12 h-12 rounded-full object-cover bg-slate-800"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold">
                        {player.primaryPosition}
                      </div>
                    )}
                    <div>
                      <h3 className="text-sm font-bold text-white hover:text-sky-400 transition">
                        {player.name}
                      </h3>
                      <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-mono mt-0.5">
                        <span className="font-bold text-sky-400">{player.primaryPosition}</span>
                        <span>•</span>
                        <span>{player.nhlTeam}</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                    ${(player.capHit / 1e6).toFixed(2)}M
                  </span>
                </div>

                {/* 2026-2027 Season Statistics */}
                <div className="bg-rink-surface rounded-lg p-2.5 border border-rink-border text-xs">
                  {isGoalie && goalieStats ? (
                    <div className="grid grid-cols-4 gap-1 text-center font-mono">
                      <div>
                        <span className="text-[10px] text-slate-500 block">GP</span>
                        <span className="font-bold text-white">{goalieStats.gamesPlayed}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">W</span>
                        <span className="font-bold text-emerald-400">{goalieStats.wins}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">GAA</span>
                        <span className="font-bold text-white">{goalieStats.goalsAgainstAverage}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">SV%</span>
                        <span className="font-bold text-white">{goalieStats.savePercentage}</span>
                      </div>
                    </div>
                  ) : skaterStats ? (
                    <div className="grid grid-cols-4 gap-1 text-center font-mono">
                      <div>
                        <span className="text-[10px] text-slate-500 block">GP</span>
                        <span className="font-bold text-white">{skaterStats.gamesPlayed}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">G</span>
                        <span className="font-bold text-emerald-400">{skaterStats.goals}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">A</span>
                        <span className="font-bold text-white">{skaterStats.assists}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">PTS</span>
                        <span className="font-bold text-sky-400">{skaterStats.points}</span>
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-rink-border">
                  <span>ROS Baseline:</span>
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
      )}

      {/* Prospect Detail Modal */}
      {selectedProspect && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-rink-card border border-purple-800/60 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-rink-border pb-3">
              <div>
                <h3 className="text-base font-black text-white">{selectedProspect.name}</h3>
                <div className="text-xs text-purple-300 font-mono">
                  {selectedProspect.position} • {selectedProspect.nhlTeam} Rights • {selectedProspect.height}, {selectedProspect.weight} lbs
                </div>
              </div>
              <button onClick={() => setSelectedProspect(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="bg-rink-surface p-3 rounded-lg border border-rink-border space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Draft Pedigree:</span>
                  <span className="font-bold text-white">{selectedProspect.draftInfo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Current Club / League:</span>
                  <span className="font-bold text-sky-400">{selectedProspect.currentTeam}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Projected Ceiling:</span>
                  <span className="font-bold text-amber-300">⭐️ {selectedProspect.potential}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Trade Surplus Value:</span>
                  <span className="font-bold text-purple-300">{selectedProspect.tradeValueScore} / 100</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-white mb-1">Scouting Report:</h4>
                <p className="text-slate-400 text-xs leading-relaxed">{selectedProspect.scoutingSummary}</p>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-rink-border">
              <button
                onClick={() => setSelectedProspect(null)}
                className="px-4 py-2 rounded-lg bg-purple-600 text-white text-xs font-bold hover:bg-purple-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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
              <button onClick={() => setSelectedPlayer(null)} className="text-slate-400 hover:text-white">
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

      {/* Custom Prospect Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-rink-card border border-rink-border rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-rink-border pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-black text-white">Create Custom Prospect</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCustomProspect} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Prospect Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Radim Mrtka, Konsta Helenius, Anton Silayev..."
                  value={newProspectName}
                  onChange={(e) => setNewProspectName(e.target.value)}
                  className="w-full bg-rink-surface border border-rink-border rounded-lg px-3 py-2 text-white font-bold focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Position</label>
                  <select
                    value={newProspectPos}
                    onChange={(e) => setNewProspectPos(e.target.value as any)}
                    className="w-full bg-rink-surface border border-rink-border rounded-lg px-2.5 py-2 text-white font-bold focus:outline-none focus:border-brand-500"
                  >
                    <option value="D">Defense (D)</option>
                    <option value="C">Center (C)</option>
                    <option value="LW">Left Wing (LW)</option>
                    <option value="RW">Right Wing (RW)</option>
                    <option value="G">Goalie (G)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Shoots / Catches</label>
                  <select
                    value={newProspectShoots}
                    onChange={(e) => setNewProspectShoots(e.target.value as any)}
                    className="w-full bg-rink-surface border border-rink-border rounded-lg px-2.5 py-2 text-white font-bold focus:outline-none focus:border-brand-500"
                  >
                    <option value="R">Right (R)</option>
                    <option value="L">Left (L)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">NHL Rights Team</label>
                  <select
                    value={modalTeam}
                    onChange={(e) => setModalTeam(e.target.value)}
                    className="w-full bg-rink-surface border border-rink-border rounded-lg px-2.5 py-2 text-white font-bold focus:outline-none focus:border-brand-500"
                  >
                    {uniqueTeams.map((team) => (
                      <option key={team} value={team}>
                        {team}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Age</label>
                  <input
                    type="number"
                    value={newProspectAge}
                    onChange={(e) => setNewProspectAge(Number(e.target.value))}
                    className="w-full bg-rink-surface border border-rink-border rounded-lg px-3 py-2 text-white font-bold focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Height</label>
                  <input
                    type="text"
                    value={newProspectHeight}
                    onChange={(e) => setNewProspectHeight(e.target.value)}
                    placeholder="6'6&quot;"
                    className="w-full bg-rink-surface border border-rink-border rounded-lg px-3 py-2 text-white font-bold focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Weight (lbs)</label>
                  <input
                    type="number"
                    value={newProspectWeight}
                    onChange={(e) => setNewProspectWeight(Number(e.target.value))}
                    className="w-full bg-rink-surface border border-rink-border rounded-lg px-3 py-2 text-white font-bold focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Draft Pedigree</label>
                  <input
                    type="text"
                    value={newProspectDraftInfo}
                    onChange={(e) => setNewProspectDraftInfo(e.target.value)}
                    placeholder="2025 Round 1, #9 Overall"
                    className="w-full bg-rink-surface border border-rink-border rounded-lg px-3 py-2 text-white font-bold focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Current Club / League</label>
                  <input
                    type="text"
                    value={newProspectCurrentTeam}
                    onChange={(e) => setNewProspectCurrentTeam(e.target.value)}
                    placeholder="Rochester (AHL) / Seattle (WHL)"
                    className="w-full bg-rink-surface border border-rink-border rounded-lg px-3 py-2 text-white font-bold focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Projected NHL Ceiling</label>
                <select
                  value={newProspectPotential}
                  onChange={(e) => setNewProspectPotential(e.target.value as any)}
                  className="w-full bg-rink-surface border border-rink-border rounded-lg px-3 py-2 text-white font-bold focus:outline-none focus:border-brand-500"
                >
                  <option value="FRANCHISE">FRANCHISE — Generational Core Piece (e.g. Celebrini/Demidov)</option>
                  <option value="ELITE">ELITE — Top-Pair D / Top-Line Winger (e.g. Radim Mrtka)</option>
                  <option value="TOP_PAIR_TOP_LINE">TOP_PAIR_TOP_LINE — High-Impact Top-4 D / Top-6 F</option>
                  <option value="REGULAR">REGULAR — Reliable Middle-of-the-Lineup NHLer</option>
                  <option value="DEPTH">DEPTH — Fringe / Bottom-Roster Depth</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Scouting Summary & Toolset</label>
                <textarea
                  rows={2}
                  value={newProspectNotes}
                  onChange={(e) => setNewProspectNotes(e.target.value)}
                  placeholder="Towering two-way defenseman with smooth mobility, high-IQ breakout passes, and shutdown reach..."
                  className="w-full bg-rink-surface border border-rink-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-rink-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-900/30"
                >
                  Save & Add Prospect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
