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
  X,
  Zap,
  TrendingUp,
  Clock,
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
  const [newProspectDraftInfo, setNewProspectDraftInfo] = useState('2026 Round 1, #9 Overall (BUF)');
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
      draftYear: 2026,
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
          <div className="flex items-center space-x-1 bg-rink-surface p-1 rounded-lg border border-rink-border w-full sm:w-auto">
            <button
              onClick={() => setViewMode('roster')}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-md text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                viewMode === 'roster' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5 shrink-0" />
              <span>Active Rosters ({players.length})</span>
            </button>
            <button
              onClick={() => setViewMode('prospects')}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-md text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                viewMode === 'prospects' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span>Prospect Pipeline ({prospects.length})</span>
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2 border-t border-rink-border">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 shrink-0 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                viewMode === 'roster'
                  ? 'Search player or team (e.g. McDavid, EDM, Makar)...'
                  : 'Search prospect, team, or draft (e.g. Radim Mrtka, BUF, Demidov)...'
              }
              className="w-full bg-rink-surface border border-rink-border text-white text-xs rounded-lg pl-9 pr-8 py-2.5 focus:outline-none focus:border-brand-500 transition-colors"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-700/50 transition-colors"
                title="Clear search text"
                aria-label="Clear search text"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Position Pills & Selectors Group */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Position Pills */}
            <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0 max-w-full">
              {['ALL', 'F', 'C', 'LW', 'RW', 'D', 'G'].map((pos) => (
                <button
                  key={pos}
                  onClick={() => setPositionFilter(pos)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap shrink-0 ${
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
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-sm shrink-0"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Add Prospect</span>
              </button>
            )}
          </div>
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
      {selectedPlayer && (() => {
        const isGoalie = selectedPlayer.playerType === 'goalie';
        const skaterActual = selectedPlayer.actualStats?.skater;
        const goalieActual = selectedPlayer.actualStats?.goalie;
        const proj = selectedPlayer.projections;

        // Skater Stats
        const actualGp = skaterActual?.gamesPlayed || 0;
        const actualGoals = skaterActual?.goals || 0;
        const actualAssists = skaterActual?.assists || 0;
        const actualPoints = skaterActual?.points ?? (actualGoals + actualAssists);
        const actualPPP = skaterActual?.powerPlayPoints || 0;
        const actualPPG = skaterActual?.powerPlayGoals || 0;
        const actualPlusMinus = skaterActual?.plusMinus || 0;
        const actualShots = skaterActual?.shots || 0;
        const actualHits = skaterActual?.hits || 0;
        const actualBlocks = skaterActual?.blockedShots || 0;
        const actualPim = skaterActual?.penaltyMinutes || 0;
        const actualToi = skaterActual?.avgTimeOnIce || '18:00';
        const actualShPct = skaterActual?.shootingPctg ? (skaterActual.shootingPctg * 100).toFixed(1) : '10.0';

        const rosGp = proj?.rosGamesRemaining || 0;
        const rosGoals = proj?.rosGoals || 0;
        const rosAssists = proj?.rosAssists || 0;
        const rosPoints = proj?.rosPoints ?? (rosGoals + rosAssists);
        const rosPPP =
          proj?.rosPPP !== undefined && proj.rosPPP > 0
            ? proj.rosPPP
            : Math.round(rosPoints * (selectedPlayer.primaryPosition === 'D' ? 0.20 : 0.25));
        const rosPlusMinus = proj?.rosPlusMinus || 0;
        const rosSOG = proj?.rosSOG || 0;
        const rosHits = proj?.rosHits || 0;
        const rosBlocks = proj?.rosBlocks || 0;
        const rosPim = proj?.rosPIM || 0;

        // Full-Season 82-Game Totals
        const totalGp = actualGp + rosGp;
        const totalGoals = actualGoals + rosGoals;
        const totalAssists = actualAssists + rosAssists;
        const totalPoints = actualPoints + rosPoints;
        const totalPPP = actualPPP + rosPPP;

        // Goalie Stats
        const gActualGp = goalieActual?.gamesPlayed || 0;
        const gActualGs = goalieActual?.gamesStarted || 0;
        const gWins = goalieActual?.wins || 0;
        const gLosses = goalieActual?.losses || 0;
        const gOtLosses = goalieActual?.otLosses || 0;
        const gSvPct = goalieActual?.savePercentage ? goalieActual.savePercentage.toFixed(3) : '.905';
        const gGaa = goalieActual?.goalsAgainstAverage ? goalieActual.goalsAgainstAverage.toFixed(2) : '2.85';
        const gShutouts = goalieActual?.shutouts || 0;
        const gSaves = goalieActual?.saves || 0;
        const gShots = goalieActual?.shotsAgainst || 0;

        const gRosGs = proj?.rosGamesStarted || 0;
        const gRosSvPct = proj?.rosSavePctg ? proj.rosSavePctg.toFixed(3) : gSvPct;

        return (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
            <div className="bg-rink-card border border-rink-border rounded-2xl max-w-xl w-full p-5 sm:p-6 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-rink-border pb-3.5">
                <div className="flex items-center space-x-3.5 min-w-0">
                  {selectedPlayer.headshotUrl ? (
                    <img
                      src={selectedPlayer.headshotUrl}
                      alt={selectedPlayer.name}
                      className="w-13 h-13 rounded-full object-cover bg-slate-800 border border-slate-700 shrink-0"
                    />
                  ) : (
                    <div className="w-13 h-13 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white shrink-0">
                      {selectedPlayer.primaryPosition}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base sm:text-lg font-bold text-white truncate">
                        {selectedPlayer.name}
                      </h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-sky-400 border border-slate-700">
                        {selectedPlayer.injuryStatus}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">
                      <span className="font-bold text-slate-300">{selectedPlayer.primaryPosition}</span> •{' '}
                      <span className="text-sky-400 font-semibold">{selectedPlayer.nhlTeam}</span> •{' '}
                      <span className="text-emerald-400 font-semibold">
                        ${(selectedPlayer.capHit / 1e6).toFixed(2)}M AAV
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPlayer(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors shrink-0"
                  title="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 82-Game Projected Summary Banner */}
              <div className="bg-gradient-to-r from-sky-950/50 via-slate-900 to-indigo-950/40 border border-sky-800/40 rounded-xl p-3 space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>82-Game Season Projected Pace</span>
                  </span>
                  <span className="font-mono text-slate-400">
                    {totalGp > 0 ? `${totalGp} Total GP` : 'Full Season'}
                  </span>
                </div>
                {!isGoalie ? (
                  <div className="flex items-center justify-between text-xs sm:text-sm font-mono font-bold pt-0.5">
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                      <span className="text-white text-sm sm:text-base">{totalPoints} PTS</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-300">{totalGoals} G</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-300">{totalAssists} A</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-amber-400">{totalPPP} PPP</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-normal">
                      {(totalPoints / Math.max(1, totalGp)).toFixed(2)} P/GP
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-xs sm:text-sm font-mono font-bold pt-0.5">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="text-white">{gActualGs + gRosGs} Expected Starts</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-emerald-400">{gRosSvPct} SV%</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-300">{gGaa} GAA</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Dual Column: Current Season Actuals vs Rest-of-Season Projections */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Column 1: Current Season (Actuals) */}
                <div className="bg-rink-surface p-3.5 rounded-xl border border-rink-border space-y-2.5">
                  <div className="flex items-center justify-between pb-2 border-b border-rink-border/70">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      <Activity className="w-3.5 h-3.5" />
                      <span>Current Season</span>
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                      {!isGoalie ? `${actualGp} GP` : `${gActualGp} GP`}
                    </span>
                  </div>

                  {!isGoalie ? (
                    <div className="space-y-1.5 text-xs font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Goals / Assists:</span>
                        <span className="font-bold text-white">
                          {actualGoals} G • {actualAssists} A
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total Points:</span>
                        <span className="font-bold text-emerald-400">
                          {actualPoints} PTS{' '}
                          <span className="text-slate-500 font-normal text-[11px]">
                            ({actualGp > 0 ? (actualPoints / actualGp).toFixed(2) : '0.00'} P/GP)
                          </span>
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Power Play:</span>
                        <span className="font-bold text-amber-400">
                          {actualPPP} PPP{' '}
                          <span className="text-slate-500 font-normal text-[11px]">
                            ({actualPPG} PPG)
                          </span>
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Plus / Minus:</span>
                        <span
                          className={`font-bold ${
                            actualPlusMinus > 0
                              ? 'text-emerald-400'
                              : actualPlusMinus < 0
                              ? 'text-rose-400'
                              : 'text-slate-300'
                          }`}
                        >
                          {actualPlusMinus > 0 ? `+${actualPlusMinus}` : actualPlusMinus}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Shots on Goal:</span>
                        <span className="font-bold text-white">
                          {actualShots} SOG{' '}
                          <span className="text-slate-500 font-normal text-[11px]">
                            ({actualShPct}%)
                          </span>
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Time on Ice (TOI):</span>
                        <span className="font-bold text-sky-300">{actualToi}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-800/80 pt-1 text-[11px]">
                        <span className="text-slate-500">Hits / Blocks / PIM:</span>
                        <span className="text-slate-300">
                          {actualHits}H • {actualBlocks}B • {actualPim}M
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5 text-xs font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Record:</span>
                        <span className="font-bold text-white">
                          {gWins}-{gLosses}-{gOtLosses}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Games Started:</span>
                        <span className="font-bold text-white">{gActualGs} GS</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Save %:</span>
                        <span className="font-bold text-emerald-400">{gSvPct}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Goals Against Avg:</span>
                        <span className="font-bold text-white">{gGaa}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Shutouts:</span>
                        <span className="font-bold text-sky-400">{gShutouts} SO</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-800/80 pt-1 text-[11px]">
                        <span className="text-slate-500">Saves / Shots Faced:</span>
                        <span className="text-slate-300">
                          {gSaves} / {gShots}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Column 2: Rest-of-Season (Projected) */}
                <div className="bg-rink-surface p-3.5 rounded-xl border border-sky-800/40 space-y-2.5">
                  <div className="flex items-center justify-between pb-2 border-b border-sky-800/40">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400 uppercase tracking-wider">
                      <Zap className="w-3.5 h-3.5" />
                      <span>Projected (ROS)</span>
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 font-bold border border-sky-500/20">
                      {!isGoalie ? `${rosGp} Rem GP` : `${gRosGs} Starts`}
                    </span>
                  </div>

                  {!isGoalie ? (
                    <div className="space-y-1.5 text-xs font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Projected Goals:</span>
                        <span className="font-bold text-white">{rosGoals} G</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Projected Assists:</span>
                        <span className="font-bold text-white">{rosAssists} A</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Projected Points:</span>
                        <span className="font-bold text-sky-400">
                          {rosPoints} PTS{' '}
                          <span className="text-slate-500 font-normal text-[11px]">
                            ({rosGp > 0 ? (rosPoints / rosGp).toFixed(2) : '0.00'} P/GP)
                          </span>
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Projected Power Play:</span>
                        <span className="font-bold text-amber-400">{rosPPP} PPP</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Projected Plus / Minus:</span>
                        <span
                          className={`font-bold ${
                            rosPlusMinus > 0
                              ? 'text-emerald-400'
                              : rosPlusMinus < 0
                              ? 'text-rose-400'
                              : 'text-slate-300'
                          }`}
                        >
                          {rosPlusMinus > 0 ? `+${rosPlusMinus}` : rosPlusMinus}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Projected SOG:</span>
                        <span className="font-bold text-white">{rosSOG} SOG</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-800/80 pt-1 text-[11px]">
                        <span className="text-slate-500">Volatility (SD):</span>
                        <span className="text-amber-400 font-bold">
                          ±{(proj?.sdPlayingTimePct ? proj.sdPlayingTimePct * 100 : 12).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5 text-xs font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Expected Starts:</span>
                        <span className="font-bold text-white">{gRosGs} Starts</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Projected Save %:</span>
                        <span className="font-bold text-emerald-400">{gRosSvPct}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Projected Tier:</span>
                        <span className="font-bold text-sky-300">Franchise Starter</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-800/80 pt-1 text-[11px]">
                        <span className="text-slate-500">Playing Time Volatility:</span>
                        <span className="text-amber-400 font-bold">
                          ±{(proj?.sdPlayingTimePct ? proj.sdPlayingTimePct * 100 : 12).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end pt-1">
                <button
                  onClick={() => setSelectedPlayer(null)}
                  className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}

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
                    placeholder="2026 Round 1, #9 Overall"
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
