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
  Sparkles,
  Ticket,
  UserPlus,
  Layers,
  Share2,
  Copy,
  Check,
} from 'lucide-react';
import { NHLTeam, FranchiseTradeProposal, FranchiseTradeEvaluation } from '../types/franchise';
import { Player } from '../types/player';
import { NHLProspect, DraftPick, ProspectPotential } from '../types/prospect';
import { INITIAL_PROSPECTS, generateDefaultDraftPicks } from '../data/nhlProspects';
import { evaluateFranchiseTrade } from '../engine/franchiseSimulation';
import { FeaturedTradesTray } from './FeaturedTradesTray';
import { ShareTradeModal } from './ShareTradeModal';
import { decodeTradeFromUrl, encodeTradeToUrl } from '../utils/tradeUrl';
import { fetchFeaturedTrades } from '../services/featuredApi';
import { FeaturedTradeProposal } from '../types/featured';

interface FranchiseTradeMachineProps {
  franchises: NHLTeam[];
  players: Player[];
  prospects?: NHLProspect[];
  onCreateProspect?: (newProspect: NHLProspect) => void;
  initialTeamAId?: string;
  initialTeamBId?: string;
  initialTradeParams?: string;
}

export const FranchiseTradeMachine: React.FC<FranchiseTradeMachineProps> = ({
  franchises,
  players,
  prospects = INITIAL_PROSPECTS,
  onCreateProspect,
  initialTeamAId = 'EDM',
  initialTeamBId = 'BUF', // Default to Buffalo so Radim Mrtka is immediately front and center!
  initialTradeParams,
}) => {
  const [teamAId, setTeamAId] = useState<string>(initialTeamAId);
  const [teamBId, setTeamBId] = useState<string>(initialTeamBId);

  // Selected asset state for Team A
  const [teamAPlayerIds, setTeamAPlayerIds] = useState<number[]>([]);
  const [teamAProspectIds, setTeamAProspectIds] = useState<string[]>([]);
  const [teamADraftPicks, setTeamADraftPicks] = useState<DraftPick[]>([]);
  const [teamAAssetTab, setTeamAAssetTab] = useState<'roster' | 'prospects' | 'picks'>('roster');

  // Selected asset state for Team B
  const [teamBPlayerIds, setTeamBPlayerIds] = useState<number[]>([]);
  const [teamBProspectIds, setTeamBProspectIds] = useState<string[]>([]);
  const [teamBDraftPicks, setTeamBDraftPicks] = useState<DraftPick[]>([]);
  const [teamBAssetTab, setTeamBAssetTab] = useState<'roster' | 'prospects' | 'picks'>('roster');

  // Salary retention
  const [playerRetentions, setPlayerRetentions] = useState<Record<number, number>>({});
  const [retainSalary, setRetainSalary] = useState<boolean>(false);
  const [retentionPct, setRetentionPct] = useState<number>(25);

  const [iterations, setIterations] = useState<number>(2500);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [evaluation, setEvaluation] = useState<FranchiseTradeEvaluation | null>(null);

  // Featured Proposals & Share State
  const [featuredProposals, setFeaturedProposals] = useState<FeaturedTradeProposal[]>([]);
  const [activeFeaturedProposalId, setActiveFeaturedProposalId] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [quickCopiedToast, setQuickCopiedToast] = useState(false);

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

  const playersMap = useMemo(() => {
    const map = new Map<number, Player>();
    for (const p of players) map.set(p.id, p);
    return map;
  }, [players]);

  const prospectsMap = useMemo(() => {
    const map = new Map<string, NHLProspect>();
    for (const pr of prospects) map.set(pr.id, pr);
    return map;
  }, [prospects]);

  const teamA = useMemo(
    () => franchises.find((t) => t.id === teamAId) ?? franchises[0],
    [franchises, teamAId]
  );
  const teamB = useMemo(
    () => franchises.find((t) => t.id === teamBId) ?? franchises.find(t => t.id === 'BUF') ?? franchises[1],
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

  const teamAProspects = useMemo(
    () => prospects.filter((pr) => pr.nhlTeam === teamA.abbrev),
    [prospects, teamA]
  );
  const teamBProspects = useMemo(
    () => prospects.filter((pr) => pr.nhlTeam === teamB.abbrev),
    [prospects, teamB]
  );

  const teamAPickPool = useMemo(() => generateDefaultDraftPicks(teamA.abbrev), [teamA]);
  const teamBPickPool = useMemo(() => generateDefaultDraftPicks(teamB.abbrev), [teamB]);

  React.useEffect(() => {
    if (initialTeamAId) setTeamAId(initialTeamAId);
  }, [initialTeamAId]);

  React.useEffect(() => {
    if (initialTeamBId) setTeamBId(initialTeamBId);
  }, [initialTeamBId]);

  const isHydratingRef = React.useRef(false);

  // Clean selections if team changes manually
  React.useEffect(() => {
    if (isHydratingRef.current) return;
    setTeamAPlayerIds([]);
    setTeamAProspectIds([]);
    setTeamADraftPicks([]);
    setActiveFeaturedProposalId(null);
  }, [teamAId]);

  React.useEffect(() => {
    if (isHydratingRef.current) return;
    setTeamBPlayerIds([]);
    setTeamBProspectIds([]);
    setTeamBDraftPicks([]);
    setActiveFeaturedProposalId(null);
  }, [teamBId]);

  const teamASendingPlayers = teamAPlayerIds.map((id) => playersMap.get(id)).filter(Boolean) as Player[];
  const teamBSendingPlayers = teamBPlayerIds.map((id) => playersMap.get(id)).filter(Boolean) as Player[];

  const teamASendingProspects = teamAProspectIds.map((id) => prospectsMap.get(id)).filter(Boolean) as NHLProspect[];
  const teamBSendingProspects = teamBProspectIds.map((id) => prospectsMap.get(id)).filter(Boolean) as NHLProspect[];

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      try {
        const retList: { playerId: number; retainedPct: number; retainingTeamId: string }[] = [];
        for (const pid of teamAPlayerIds) {
          if (playerRetentions[pid]) {
            retList.push({ playerId: pid, retainedPct: playerRetentions[pid], retainingTeamId: teamA.id });
          }
        }
        for (const pid of teamBPlayerIds) {
          if (playerRetentions[pid]) {
            retList.push({ playerId: pid, retainedPct: playerRetentions[pid], retainingTeamId: teamB.id });
          }
        }
        if (retList.length === 0 && retainSalary && teamAPlayerIds.length > 0) {
          retList.push({ playerId: teamAPlayerIds[0], retainedPct: retentionPct || 25, retainingTeamId: teamA.id });
        }

        const proposal: FranchiseTradeProposal = {
          teamAId: teamA.id,
          teamBId: teamB.id,
          teamAPlayerIds,
          teamBPlayerIds,
          teamAProspectIds,
          teamBProspectIds,
          teamADraftPicks: teamADraftPicks.map((p) => ({
            id: p.id,
            year: p.year,
            round: p.round,
            originalTeam: p.originalTeamId,
            isProtected: p.protection !== 'UNPROTECTED',
            protection: p.protection,
          })),
          teamBDraftPicks: teamBDraftPicks.map((p) => ({
            id: p.id,
            year: p.year,
            round: p.round,
            originalTeam: p.originalTeamId,
            isProtected: p.protection !== 'UNPROTECTED',
            protection: p.protection,
          })),
          salaryRetention: retList.length > 0 ? retList : undefined,
        };

        const result = evaluateFranchiseTrade(franchises, players, proposal, iterations, prospects);
        setEvaluation(result);
      } catch (err) {
        console.error('Franchise simulation error:', err);
      } finally {
        setIsSimulating(false);
      }
    }, 60);
  };

  // Load initial featured proposals
  React.useEffect(() => {
    fetchFeaturedTrades().then((data) => {
      if (data && data.length > 0) setFeaturedProposals(data);
    });
  }, []);

  const loadTradeFromQuery = (query: string, proposalId?: string) => {
    const decoded = decodeTradeFromUrl(query, players, prospects);
    if (!decoded) return;

    isHydratingRef.current = true;
    if (proposalId) {
      setActiveFeaturedProposalId(proposalId);
    }
    setTeamAId(decoded.teamAId);
    setTeamBId(decoded.teamBId);
    setTeamAPlayerIds(decoded.teamAPlayerIds);
    setTeamBPlayerIds(decoded.teamBPlayerIds);
    setTeamAProspectIds(decoded.teamAProspectIds);
    setTeamBProspectIds(decoded.teamBProspectIds);
    setTeamADraftPicks(decoded.teamADraftPicks);
    setTeamBDraftPicks(decoded.teamBDraftPicks);
    setPlayerRetentions(decoded.playerRetentions || {});
    setRetainSalary(decoded.retainSalary);
    setRetentionPct(decoded.retentionPct);

    // Auto-evaluate
    setTimeout(() => {
      isHydratingRef.current = false;
      try {
        const teamAObj = franchises.find((t) => t.id === decoded.teamAId) || franchises[0];
        const teamBObj = franchises.find((t) => t.id === decoded.teamBId) || franchises[1];

        const retList: { playerId: number; retainedPct: number; retainingTeamId: string }[] = [];
        const pRets = decoded.playerRetentions || {};
        for (const pid of decoded.teamAPlayerIds) {
          if (pRets[pid]) {
            retList.push({ playerId: pid, retainedPct: pRets[pid], retainingTeamId: teamAObj.id });
          }
        }
        for (const pid of decoded.teamBPlayerIds) {
          if (pRets[pid]) {
            retList.push({ playerId: pid, retainedPct: pRets[pid], retainingTeamId: teamBObj.id });
          }
        }
        if (retList.length === 0 && decoded.retainSalary && decoded.teamAPlayerIds.length > 0) {
          retList.push({ playerId: decoded.teamAPlayerIds[0], retainedPct: decoded.retentionPct || 25, retainingTeamId: teamAObj.id });
        }

        const proposal: FranchiseTradeProposal = {
          teamAId: teamAObj.id,
          teamBId: teamBObj.id,
          teamAPlayerIds: decoded.teamAPlayerIds,
          teamBPlayerIds: decoded.teamBPlayerIds,
          teamAProspectIds: decoded.teamAProspectIds,
          teamBProspectIds: decoded.teamBProspectIds,
          teamADraftPicks: decoded.teamADraftPicks.map((p) => ({
            id: p.id,
            year: p.year,
            round: p.round,
            originalTeam: p.originalTeamId,
            isProtected: p.protection !== 'UNPROTECTED',
            protection: p.protection,
          })),
          teamBDraftPicks: decoded.teamBDraftPicks.map((p) => ({
            id: p.id,
            year: p.year,
            round: p.round,
            originalTeam: p.originalTeamId,
            isProtected: p.protection !== 'UNPROTECTED',
            protection: p.protection,
          })),
          salaryRetention: retList.length > 0 ? retList : undefined,
        };

        const result = evaluateFranchiseTrade(franchises, players, proposal, iterations, prospects);
        setEvaluation(result);
      } catch (err) {
        console.error('Error auto-evaluating trade:', err);
      }
    }, 60);
  };

  React.useEffect(() => {
    if (initialTradeParams) {
      loadTradeFromQuery(initialTradeParams);
    } else {
      handleRunSimulation();
    }
  }, [initialTradeParams]);

  // Automatically re-run simulation whenever trade assets change (debounced 200ms)
  const isInitialMount = React.useRef(true);
  React.useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (isHydratingRef.current) return;

    const timer = setTimeout(() => {
      handleRunSimulation();
    }, 200);

    return () => clearTimeout(timer);
  }, [
    teamAId,
    teamBId,
    teamAPlayerIds,
    teamBPlayerIds,
    teamAProspectIds,
    teamBProspectIds,
    teamADraftPicks,
    teamBDraftPicks,
    playerRetentions,
    retainSalary,
    retentionPct,
    iterations,
  ]);

  const handleSelectFeaturedProposal = (proposal: FeaturedTradeProposal) => {
    loadTradeFromQuery(proposal.tradeUrlParams, proposal.id);
  };

  const currentTradePayload = {
    teamAId: teamA.id,
    teamBId: teamB.id,
    teamAPlayers: teamASendingPlayers,
    teamBPlayers: teamBSendingPlayers,
    teamAProspects: teamASendingProspects,
    teamBProspects: teamBSendingProspects,
    teamADraftPicks,
    teamBDraftPicks,
    retainSalary,
    retentionPct,
    playerRetentions,
  };

  const handleOpenShareModal = () => {
    const query = encodeTradeToUrl(currentTradePayload);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `/?${query}`);
    }
    setIsShareModalOpen(true);
  };

  const handleQuickCopy = async () => {
    const query = encodeTradeToUrl(currentTradePayload);
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://nhlmc.pages.dev';
    const fullUrl = `${origin}/?${query}`;
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `/?${query}`);
    }
    await navigator.clipboard.writeText(fullUrl);
    setQuickCopiedToast(true);
    setTimeout(() => setQuickCopiedToast(false), 2500);
  };

  const formatProb = (val: number) => {
    const pct = val * 100;
    if (pct > 0 && pct < 0.1) return `${pct.toFixed(2)}%`;
    return `${pct.toFixed(1)}%`;
  };

  const formatDelta = (val: number, isPercent: boolean = false) => {
    const sign = val > 0 ? '+' : '';
    if (isPercent) {
      const pct = val * 100;
      if (Math.abs(pct) > 0 && Math.abs(pct) < 0.1) {
        return `${sign}${pct.toFixed(2)}%`;
      }
      return `${sign}${pct.toFixed(1)}%`;
    }
    return `${sign}${val.toFixed(1)}`;
  };

  const handleToggleDraftPick = (pick: DraftPick, isTeamA: boolean) => {
    if (isTeamA) {
      const exists = teamADraftPicks.some((p) => p.id === pick.id);
      if (exists) {
        setTeamADraftPicks(teamADraftPicks.filter((p) => p.id !== pick.id));
      } else {
        setTeamADraftPicks([...teamADraftPicks, pick]);
      }
    } else {
      const exists = teamBDraftPicks.some((p) => p.id === pick.id);
      if (exists) {
        setTeamBDraftPicks(teamBDraftPicks.filter((p) => p.id !== pick.id));
      } else {
        setTeamBDraftPicks([...teamBDraftPicks, pick]);
      }
    }
  };

  const handleCyclePickProtection = (pickId: string, isTeamA: boolean) => {
    const cycle = (current: DraftPick['protection']): DraftPick['protection'] => {
      if (current === 'TOP_10_PROTECTED') return 'TOP_5_PROTECTED';
      if (current === 'TOP_5_PROTECTED') return 'UNPROTECTED';
      return 'TOP_10_PROTECTED';
    };

    if (isTeamA) {
      setTeamADraftPicks((prev) =>
        prev.map((p) => {
          if (p.id !== pickId) return p;
          const nextProt = cycle(p.protection);
          const nextScore =
            p.round === 1
              ? nextProt === 'UNPROTECTED'
                ? 88
                : nextProt === 'TOP_5_PROTECTED'
                ? 82
                : 76
              : p.tradeValueScore;
          return { ...p, protection: nextProt, tradeValueScore: nextScore };
        })
      );
    } else {
      setTeamBDraftPicks((prev) =>
        prev.map((p) => {
          if (p.id !== pickId) return p;
          const nextProt = cycle(p.protection);
          const nextScore =
            p.round === 1
              ? nextProt === 'UNPROTECTED'
                ? 88
                : nextProt === 'TOP_5_PROTECTED'
                ? 82
                : 76
              : p.tradeValueScore;
          return { ...p, protection: nextProt, tradeValueScore: nextScore };
        })
      );
    }
  };

  const handleCycleSalaryRetention = (playerId: number) => {
    setPlayerRetentions((prev) => {
      const current = prev[playerId] || 0;
      // Cycle: 0% -> 25% -> 50% (NHL CBA Max) -> 0%
      const next = current === 0 ? 25 : current === 25 ? 50 : 0;
      const updated = { ...prev };
      if (next === 0) {
        delete updated[playerId];
      } else {
        updated[playerId] = next;
      }
      return updated;
    });
  };

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

    // Auto-select for the active team if matching
    if (modalTeam === teamA.abbrev) {
      setTeamAProspectIds((prev) => [...prev, newPr.id]);
    } else if (modalTeam === teamB.abbrev) {
      setTeamBProspectIds((prev) => [...prev, newPr.id]);
    }

    setIsModalOpen(false);
    setNewProspectName('');
    setNewProspectNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-rink-card border border-rink-border rounded-xl p-5 shadow-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold mb-2">
              <Trophy className="w-3.5 h-3.5" />
              <span>NHL Franchise Monte Carlo Trade Evaluator</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              NHL Trade Machine: Roster, Prospects & Draft Picks
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
              Model blockbusters involving active NHL players, elite top prospects (e.g. Buffalo's <span className="text-purple-300 font-bold">Radim Mrtka</span>, Montreal's <span className="text-purple-300 font-bold">Ivan Demidov</span>), and future 1st/2nd/3rd round draft picks with lottery protections.
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
            </select>
          </div>
        </div>
      </div>

      {/* Featured Blockbusters & Rumors Showcase */}
      <FeaturedTradesTray
        proposals={featuredProposals}
        onSelectProposal={handleSelectFeaturedProposal}
        activeProposalId={activeFeaturedProposalId}
      />

      {/* Dual Team Trade Builder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ================= TEAM A ================= */}
        <div className="bg-rink-card border border-rink-border rounded-xl p-5 shadow-lg flex flex-col justify-between space-y-4">
          <div>
            {/* Team Header */}
            <div className="flex flex-wrap sm:flex-nowrap items-start sm:items-center justify-between gap-2.5 border-b border-rink-border pb-3">
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <img src={teamA.logoUrl} alt={teamA.name} className="w-9 h-9 object-contain shrink-0" />
                <div className="min-w-0 flex-1">
                  <select
                    value={teamAId}
                    onChange={(e) => setTeamAId(e.target.value)}
                    className="w-full max-w-[210px] xs:max-w-[260px] sm:max-w-none bg-rink-surface border border-rink-border text-white text-base font-black rounded-lg px-2.5 py-1 focus:outline-none focus:border-brand-500 truncate"
                  >
                    {franchises.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.conference})
                      </option>
                    ))}
                  </select>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
                    {teamA.record.wins}-{teamA.record.losses}-{teamA.record.otLosses} ({teamA.record.points} pts) • Cap Space: ${(teamA.capSpace / 1e6).toFixed(2)}M
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30 shrink-0 self-start sm:self-center whitespace-nowrap">
                {teamA.contenderTier.replace(/_/g, ' ')}
              </span>
            </div>

            {/* Assets Sending Away Box */}
            <div className="mt-4 space-y-2 min-h-[90px]">
              <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider block">
                {teamA.name} Sends Away ({teamASendingPlayers.length + teamASendingProspects.length + teamADraftPicks.length} Assets):
              </span>

              {teamASendingPlayers.length === 0 && teamASendingProspects.length === 0 && teamADraftPicks.length === 0 ? (
                <div className="border border-dashed border-slate-700 rounded-lg p-4 text-center text-xs text-slate-500">
                  Select roster players, prospects, or draft picks below to trade from {teamA.name}.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {/* Roster Players */}
                  {teamASendingPlayers.map((p) => {
                    const retPct = playerRetentions[p.id] || 0;
                    const retainedAmt = (p.capHit * retPct) / 100;
                    return (
                      <div
                        key={p.id}
                        className="flex items-center justify-between bg-rink-surface border border-rink-border rounded-lg p-2 gap-2"
                      >
                        <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                          {p.headshotUrl && (
                            <img src={p.headshotUrl} alt={p.name} className="w-8 h-8 rounded-full object-cover bg-slate-800 shrink-0" />
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-white flex flex-wrap items-center gap-1.5">
                              <span className="truncate">{p.name}</span>
                              <span className="text-[9px] px-1 py-0.2 bg-slate-800 text-sky-400 rounded shrink-0">
                                {p.primaryPosition}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap mt-0.5">
                              <span className="text-[10px] text-emerald-400 font-mono">
                                ${((p.capHit - retainedAmt) / 1e6).toFixed(2)}M AAV
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCycleSalaryRetention(p.id);
                                }}
                                className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold border transition flex items-center gap-1 cursor-pointer shrink-0 ${
                                  retPct === 50
                                    ? 'bg-amber-950/80 text-amber-300 border-amber-600/80 hover:bg-amber-900'
                                    : retPct > 0
                                    ? 'bg-sky-950/80 text-sky-300 border-sky-600/80 hover:bg-sky-900'
                                    : 'bg-slate-900/80 text-slate-400 border-slate-700 hover:text-slate-200 hover:border-slate-500'
                                }`}
                                title="Click to cycle retention: 0% ↔ 25% ↔ 50% (CBA Max)"
                              >
                                <Percent className="w-2.5 h-2.5" />
                                <span>
                                  {retPct > 0
                                    ? `Retain ${retPct}% (-$${(retainedAmt / 1e6).toFixed(2)}M)`
                                    : 'Retain 0%'}
                                </span>
                                <span className="text-[8px] opacity-60">⇄</span>
                              </button>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setTeamAPlayerIds(teamAPlayerIds.filter((id) => id !== p.id));
                            setPlayerRetentions((prev) => {
                              const updated = { ...prev };
                              delete updated[p.id];
                              return updated;
                            });
                          }}
                          className="text-slate-500 hover:text-red-400 p-1 shrink-0"
                          title="Remove player"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}

                  {/* Prospects */}
                  {teamASendingProspects.map((pr) => (
                    <div
                      key={pr.id}
                      className="flex items-center justify-between bg-purple-950/30 border border-purple-800/40 rounded-lg p-2 gap-2"
                    >
                      <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-full bg-purple-900/60 border border-purple-500/40 flex items-center justify-center text-purple-300 font-black text-xs shrink-0">
                          {pr.position}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-purple-200 flex flex-wrap items-center gap-1.5">
                            <span className="truncate">{pr.name}</span>
                            <span className="text-[9px] px-1 py-0.2 bg-purple-900/80 text-purple-300 rounded font-bold whitespace-nowrap shrink-0">
                              ⭐️ {pr.potential}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {pr.height}, {pr.weight} lbs • {pr.draftInfo}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setTeamAProspectIds(teamAProspectIds.filter((id) => id !== pr.id))}
                        className="text-slate-500 hover:text-red-400 p-1 shrink-0"
                        title="Remove prospect"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {/* Draft Picks */}
                  {teamADraftPicks.map((pick) => (
                    <div
                      key={pick.id}
                      className="flex items-center justify-between bg-amber-950/30 border border-amber-800/40 rounded-lg p-2 text-xs gap-2"
                    >
                      <div className="flex items-center space-x-2 min-w-0 flex-1">
                        <Ticket className="w-4 h-4 text-amber-400 shrink-0" />
                        <div className="min-w-0 flex-1 flex flex-wrap items-center gap-1.5">
                          <span className="font-bold text-amber-300 truncate">
                            {pick.year} Round {pick.round} ({pick.originalTeamId})
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCyclePickProtection(pick.id, true);
                            }}
                            className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold border transition flex items-center gap-1 cursor-pointer shrink-0 ${
                              pick.protection === 'UNPROTECTED'
                                ? 'bg-rose-950/70 text-rose-300 border-rose-800 hover:bg-rose-900/80'
                                : pick.protection === 'TOP_5_PROTECTED'
                                ? 'bg-purple-950/70 text-purple-300 border-purple-800 hover:bg-purple-900/80'
                                : 'bg-amber-950/70 text-amber-300 border-amber-800 hover:bg-amber-900/80'
                            }`}
                            title="Click to toggle: Top 10 Protected ↔ Top 5 Protected ↔ Unprotected"
                          >
                            <Shield className="w-2.5 h-2.5 shrink-0" />
                            <span>{pick.protection.replace(/_/g, ' ')}</span>
                            <span className="text-[8px] opacity-60">⇄</span>
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => setTeamADraftPicks(teamADraftPicks.filter((p) => p.id !== pick.id))}
                        className="text-slate-500 hover:text-red-400 p-1 shrink-0"
                        title="Remove pick"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Asset Selection Tabs */}
          <div className="border-t border-rink-border pt-3 space-y-3">
            <div className="flex items-center space-x-1 bg-rink-surface p-1 rounded-lg border border-rink-border">
              <button
                onClick={() => setTeamAAssetTab('roster')}
                className={`flex-1 py-1.5 rounded text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  teamAAssetTab === 'roster' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🏒 Roster</span>
                <span className="text-[10px] opacity-75">({teamARoster.length})</span>
              </button>
              <button
                onClick={() => setTeamAAssetTab('prospects')}
                className={`flex-1 py-1.5 rounded text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  teamAAssetTab === 'prospects' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3 h-3 text-purple-300" />
                <span>Prospects</span>
                <span className="text-[10px] opacity-75">({teamAProspects.length})</span>
              </button>
              <button
                onClick={() => setTeamAAssetTab('picks')}
                className={`flex-1 py-1.5 rounded text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  teamAAssetTab === 'picks' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Ticket className="w-3 h-3 text-amber-300" />
                <span>Draft Picks</span>
              </button>
            </div>

            {/* Tab 1: Active Roster Dropdown */}
            {teamAAssetTab === 'roster' && (
              <div className="space-y-2">
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
                  className="w-full bg-rink-surface border border-rink-border text-slate-200 text-xs rounded-lg p-2.5 focus:outline-none focus:border-brand-500"
                >
                  <option value="">+ Add {teamA.name} active player...</option>
                  {teamARoster
                    .filter((p) => !teamAPlayerIds.includes(p.id))
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.primaryPosition}) — ${(p.capHit / 1e6).toFixed(2)}M AAV ({p.actualStats.skater?.points ?? p.actualStats.goalie?.wins ?? 0} pts/w)
                      </option>
                    ))}
                </select>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span className="flex items-center gap-1.5 text-sky-400/90 font-medium">
                    <Percent className="w-3 h-3 text-sky-400" />
                    <span>Click the <strong>Retain</strong> chip on any traded player to cycle 0% ↔ 25% ↔ 50%</span>
                  </span>
                </div>
              </div>
            )}

            {/* Tab 2: Top Prospects */}
            {teamAAssetTab === 'prospects' && (
              <div className="space-y-2">
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {teamAProspects.length === 0 ? (
                    <div className="text-center py-3 text-xs text-slate-500 border border-dashed border-slate-700 rounded-lg">
                      No seeded prospects for {teamA.name}. Click below to add one!
                    </div>
                  ) : (
                    teamAProspects.map((pr) => {
                      const isSelected = teamAProspectIds.includes(pr.id);
                      return (
                        <div
                          key={pr.id}
                          className={`flex items-center justify-between p-2 rounded-lg border text-xs transition ${
                            isSelected
                              ? 'bg-purple-900/30 border-purple-500/50'
                              : 'bg-rink-surface border-rink-border hover:border-purple-500/40'
                          }`}
                        >
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span>{pr.name}</span>
                              <span className="text-[10px] px-1 py-0.2 bg-purple-900/60 text-purple-300 rounded">
                                {pr.position} • {pr.height}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {pr.draftInfo} • {pr.potential}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              if (isSelected) {
                                setTeamAProspectIds(teamAProspectIds.filter((id) => id !== pr.id));
                              } else {
                                setTeamAProspectIds([...teamAProspectIds, pr.id]);
                              }
                            }}
                            className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                              isSelected
                                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                : 'bg-purple-600 hover:bg-purple-500 text-white'
                            }`}
                          >
                            {isSelected ? 'Remove' : '+ Add'}
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>

                <button
                  onClick={() => {
                    setModalTeam(teamA.abbrev);
                    setIsModalOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-dashed border-purple-700/60 hover:border-purple-400 text-purple-300 hover:text-white text-xs font-bold transition"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Create Custom Prospect for {teamA.name}</span>
                </button>
              </div>
            )}

            {/* Tab 3: Draft Picks */}
            {teamAAssetTab === 'picks' && (
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  {teamAPickPool.map((pick) => {
                    const isSelected = teamADraftPicks.some((p) => p.id === pick.id);
                    return (
                      <button
                        key={pick.id}
                        onClick={() => handleToggleDraftPick(pick, true)}
                        className={`p-2 rounded-lg border text-center transition font-bold ${
                          isSelected
                            ? 'bg-amber-500 text-black border-amber-400 shadow-sm'
                            : 'bg-rink-surface border-rink-border text-slate-300 hover:border-amber-400'
                        }`}
                      >
                        <div className="text-[10px] uppercase opacity-75">{pick.year}</div>
                        <div className="text-xs">Round {pick.round}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ================= TEAM B ================= */}
        <div className="bg-rink-card border border-rink-border rounded-xl p-5 shadow-lg flex flex-col justify-between space-y-4">
          <div>
            {/* Team Header */}
            <div className="flex flex-wrap sm:flex-nowrap items-start sm:items-center justify-between gap-2.5 border-b border-rink-border pb-3">
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <img src={teamB.logoUrl} alt={teamB.name} className="w-9 h-9 object-contain shrink-0" />
                <div className="min-w-0 flex-1">
                  <select
                    value={teamBId}
                    onChange={(e) => setTeamBId(e.target.value)}
                    className="w-full max-w-[210px] xs:max-w-[260px] sm:max-w-none bg-rink-surface border border-rink-border text-white text-base font-black rounded-lg px-2.5 py-1 focus:outline-none focus:border-brand-500 truncate"
                  >
                    {franchises.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.conference})
                      </option>
                    ))}
                  </select>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
                    {teamB.record.wins}-{teamB.record.losses}-{teamB.record.otLosses} ({teamB.record.points} pts) • Cap Space: ${(teamB.capSpace / 1e6).toFixed(2)}M
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0 self-start sm:self-center whitespace-nowrap">
                {teamB.contenderTier.replace(/_/g, ' ')}
              </span>
            </div>

            {/* Assets Sending Away Box */}
            <div className="mt-4 space-y-2 min-h-[90px]">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                {teamB.name} Sends Away ({teamBSendingPlayers.length + teamBSendingProspects.length + teamBDraftPicks.length} Assets):
              </span>

              {teamBSendingPlayers.length === 0 && teamBSendingProspects.length === 0 && teamBDraftPicks.length === 0 ? (
                <div className="border border-dashed border-slate-700 rounded-lg p-4 text-center text-xs text-slate-500">
                  Select roster players, prospects (e.g. Radim Mrtka), or draft picks below from {teamB.name}.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {/* Roster Players */}
                  {teamBSendingPlayers.map((p) => {
                    const retPct = playerRetentions[p.id] || 0;
                    const retainedAmt = (p.capHit * retPct) / 100;
                    return (
                      <div
                        key={p.id}
                        className="flex items-center justify-between bg-rink-surface border border-rink-border rounded-lg p-2 gap-2"
                      >
                        <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                          {p.headshotUrl && (
                            <img src={p.headshotUrl} alt={p.name} className="w-8 h-8 rounded-full object-cover bg-slate-800 shrink-0" />
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-white flex flex-wrap items-center gap-1.5">
                              <span className="truncate">{p.name}</span>
                              <span className="text-[9px] px-1 py-0.2 bg-slate-800 text-emerald-400 rounded shrink-0">
                                {p.primaryPosition}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap mt-0.5">
                              <span className="text-[10px] text-emerald-400 font-mono">
                                ${((p.capHit - retainedAmt) / 1e6).toFixed(2)}M AAV
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCycleSalaryRetention(p.id);
                                }}
                                className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold border transition flex items-center gap-1 cursor-pointer shrink-0 ${
                                  retPct === 50
                                    ? 'bg-amber-950/80 text-amber-300 border-amber-600/80 hover:bg-amber-900'
                                    : retPct > 0
                                    ? 'bg-sky-950/80 text-sky-300 border-sky-600/80 hover:bg-sky-900'
                                    : 'bg-slate-900/80 text-slate-400 border-slate-700 hover:text-slate-200 hover:border-slate-500'
                                }`}
                                title="Click to cycle retention: 0% ↔ 25% ↔ 50% (CBA Max)"
                              >
                                <Percent className="w-2.5 h-2.5" />
                                <span>
                                  {retPct > 0
                                    ? `Retain ${retPct}% (-$${(retainedAmt / 1e6).toFixed(2)}M)`
                                    : 'Retain 0%'}
                                </span>
                                <span className="text-[8px] opacity-60">⇄</span>
                              </button>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setTeamBPlayerIds(teamBPlayerIds.filter((id) => id !== p.id));
                            setPlayerRetentions((prev) => {
                              const updated = { ...prev };
                              delete updated[p.id];
                              return updated;
                            });
                          }}
                          className="text-slate-500 hover:text-red-400 p-1 shrink-0"
                          title="Remove player"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}

                  {/* Prospects (e.g. Radim Mrtka) */}
                  {teamBSendingProspects.map((pr) => (
                    <div
                      key={pr.id}
                      className="flex items-center justify-between bg-purple-950/30 border border-purple-800/40 rounded-lg p-2 gap-2"
                    >
                      <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-full bg-purple-900/60 border border-purple-500/40 flex items-center justify-center text-purple-300 font-black text-xs shrink-0">
                          {pr.position}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-purple-200 flex flex-wrap items-center gap-1.5">
                            <span className="truncate">{pr.name}</span>
                            <span className="text-[9px] px-1 py-0.2 bg-purple-900/80 text-purple-300 rounded font-bold whitespace-nowrap shrink-0">
                              ⭐️ {pr.potential}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {pr.height}, {pr.weight} lbs • {pr.draftInfo}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setTeamBProspectIds(teamBProspectIds.filter((id) => id !== pr.id))}
                        className="text-slate-500 hover:text-red-400 p-1 shrink-0"
                        title="Remove prospect"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {/* Draft Picks */}
                  {teamBDraftPicks.map((pick) => (
                    <div
                      key={pick.id}
                      className="flex items-center justify-between bg-amber-950/30 border border-amber-800/40 rounded-lg p-2 text-xs gap-2"
                    >
                      <div className="flex items-center space-x-2 min-w-0 flex-1">
                        <Ticket className="w-4 h-4 text-amber-400 shrink-0" />
                        <div className="min-w-0 flex-1 flex flex-wrap items-center gap-1.5">
                          <span className="font-bold text-amber-300 truncate">
                            {pick.year} Round {pick.round} ({pick.originalTeamId})
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCyclePickProtection(pick.id, false);
                            }}
                            className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold border transition flex items-center gap-1 cursor-pointer shrink-0 ${
                              pick.protection === 'UNPROTECTED'
                                ? 'bg-rose-950/70 text-rose-300 border-rose-800 hover:bg-rose-900/80'
                                : pick.protection === 'TOP_5_PROTECTED'
                                ? 'bg-purple-950/70 text-purple-300 border-purple-800 hover:bg-purple-900/80'
                                : 'bg-amber-950/70 text-amber-300 border-amber-800 hover:bg-amber-900/80'
                            }`}
                            title="Click to toggle: Top 10 Protected ↔ Top 5 Protected ↔ Unprotected"
                          >
                            <Shield className="w-2.5 h-2.5 shrink-0" />
                            <span>{pick.protection.replace(/_/g, ' ')}</span>
                            <span className="text-[8px] opacity-60">⇄</span>
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => setTeamBDraftPicks(teamBDraftPicks.filter((p) => p.id !== pick.id))}
                        className="text-slate-500 hover:text-red-400 p-1 shrink-0"
                        title="Remove pick"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Asset Selection Tabs */}
          <div className="border-t border-rink-border pt-3 space-y-3">
            <div className="flex items-center space-x-1 bg-rink-surface p-1 rounded-lg border border-rink-border">
              <button
                onClick={() => setTeamBAssetTab('roster')}
                className={`flex-1 py-1.5 rounded text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  teamBAssetTab === 'roster' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🏒 Roster</span>
                <span className="text-[10px] opacity-75">({teamBRoster.length})</span>
              </button>
              <button
                onClick={() => setTeamBAssetTab('prospects')}
                className={`flex-1 py-1.5 rounded text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  teamBAssetTab === 'prospects' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3 h-3 text-purple-300" />
                <span>Prospects</span>
                <span className="text-[10px] opacity-75">({teamBProspects.length})</span>
              </button>
              <button
                onClick={() => setTeamBAssetTab('picks')}
                className={`flex-1 py-1.5 rounded text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  teamBAssetTab === 'picks' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Ticket className="w-3 h-3 text-amber-300" />
                <span>Draft Picks</span>
              </button>
            </div>

            {/* Tab 1: Active Roster Dropdown */}
            {teamBAssetTab === 'roster' && (
              <div className="space-y-2">
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
                  className="w-full bg-rink-surface border border-rink-border text-slate-200 text-xs rounded-lg p-2.5 focus:outline-none focus:border-brand-500"
                >
                  <option value="">+ Add {teamB.name} active player...</option>
                  {teamBRoster
                    .filter((p) => !teamBPlayerIds.includes(p.id))
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.primaryPosition}) — ${(p.capHit / 1e6).toFixed(2)}M AAV
                      </option>
                    ))}
                </select>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span className="flex items-center gap-1.5 text-emerald-400/90 font-medium">
                    <Percent className="w-3 h-3 text-emerald-400" />
                    <span>Click the <strong>Retain</strong> chip on any traded player to cycle 0% ↔ 25% ↔ 50%</span>
                  </span>
                </div>
              </div>
            )}

            {/* Tab 2: Top Prospects (Shows Radim Mrtka for BUF) */}
            {teamBAssetTab === 'prospects' && (
              <div className="space-y-2">
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {teamBProspects.length === 0 ? (
                    <div className="text-center py-3 text-xs text-slate-500 border border-dashed border-slate-700 rounded-lg">
                      No seeded prospects for {teamB.name}. Click below to add one!
                    </div>
                  ) : (
                    teamBProspects.map((pr) => {
                      const isSelected = teamBProspectIds.includes(pr.id);
                      return (
                        <div
                          key={pr.id}
                          className={`flex items-center justify-between p-2 rounded-lg border text-xs transition ${
                            isSelected
                              ? 'bg-purple-900/30 border-purple-500/50'
                              : 'bg-rink-surface border-rink-border hover:border-purple-500/40'
                          }`}
                        >
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span>{pr.name}</span>
                              <span className="text-[10px] px-1 py-0.2 bg-purple-900/60 text-purple-300 rounded font-mono">
                                {pr.position} • {pr.height}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {pr.draftInfo} • {pr.potential}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              if (isSelected) {
                                setTeamBProspectIds(teamBProspectIds.filter((id) => id !== pr.id));
                              } else {
                                setTeamBProspectIds([...teamBProspectIds, pr.id]);
                              }
                            }}
                            className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                              isSelected
                                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                : 'bg-purple-600 hover:bg-purple-500 text-white'
                            }`}
                          >
                            {isSelected ? 'Remove' : '+ Add'}
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>

                <button
                  onClick={() => {
                    setModalTeam(teamB.abbrev);
                    setIsModalOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-dashed border-purple-700/60 hover:border-purple-400 text-purple-300 hover:text-white text-xs font-bold transition"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Create Custom Prospect for {teamB.name}</span>
                </button>
              </div>
            )}

            {/* Tab 3: Draft Picks */}
            {teamBAssetTab === 'picks' && (
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  {teamBPickPool.map((pick) => {
                    const isSelected = teamBDraftPicks.some((p) => p.id === pick.id);
                    return (
                      <button
                        key={pick.id}
                        onClick={() => handleToggleDraftPick(pick, false)}
                        className={`p-2 rounded-lg border text-center transition font-bold ${
                          isSelected
                            ? 'bg-amber-500 text-black border-amber-400 shadow-sm'
                            : 'bg-rink-surface border-rink-border text-slate-300 hover:border-amber-400'
                        }`}
                      >
                        <div className="text-[10px] uppercase opacity-75">{pick.year}</div>
                        <div className="text-xs">Round {pick.round}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Execute Simulation & Share Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 px-2">
        <button
          onClick={handleRunSimulation}
          disabled={isSimulating}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 rounded-xl bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-white font-black text-xs sm:text-sm shadow-xl shadow-sky-900/40 active:scale-95 transition disabled:opacity-50 text-center"
        >
          {isSimulating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin shrink-0" />
              <span>Simulating 82 Games & Stanley Cup Playoffs...</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 shrink-0" />
              <span>Run Monte Carlo Trade Evaluation</span>
            </>
          )}
        </button>

        <button
          onClick={handleOpenShareModal}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-sky-500/60 text-slate-100 font-bold text-xs sm:text-sm shadow-lg transition active:scale-95"
          title="Share Trade via Durable Link"
        >
          <Share2 className="w-4 h-4 text-sky-400" />
          <span>Share Trade</span>
        </button>

        <button
          onClick={handleQuickCopy}
          className="p-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition shrink-0"
          title="Quick Copy Link"
        >
          {quickCopiedToast ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      {quickCopiedToast && (
        <div className="flex justify-center -mt-2">
          <div className="px-3.5 py-1.5 rounded-full bg-emerald-950/90 border border-emerald-800 text-emerald-300 text-xs font-semibold shadow-xl animate-in fade-in duration-150 flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" />
            <span>Trade link copied to clipboard!</span>
          </div>
        </div>
      )}

      {/* Simulation Results Section */}
      {evaluation && (
        <div className="space-y-6">
          {/* Executive Verdict Banner */}
          <div className="bg-rink-card border border-rink-border rounded-xl p-4 sm:p-5 shadow-lg space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rink-border pb-3">
              <div className="flex items-center space-x-2.5">
                <Trophy className="w-5 h-5 text-amber-400 shrink-0" />
                <h3 className="text-base font-black text-white">Executive GM Trade Verdict</h3>
                <span className="text-xs text-slate-500">({evaluation.executionTimeMs}ms)</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <div className="flex items-center gap-1.5">
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
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 sm:ml-2">{teamB.abbrev} Recommendation:</span>
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
            </div>

            <p className="text-sm font-semibold text-white">{evaluation.verdict.summary}</p>

            <div className="space-y-1.5 pt-1">
              {evaluation.verdict.strategicAnalysisBullets.map((bullet, idx) => (
                <div key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                  <span className="text-sky-400 font-bold">•</span>
                  <span>{bullet}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Future Pipeline & Draft Capital Card (If Prospects or Picks Involved) */}
          {evaluation.futureCapital &&
            (evaluation.futureCapital.teamAAssetsAcquired.length > 0 ||
              evaluation.futureCapital.teamBAssetsAcquired.length > 0) && (
              <div className="bg-gradient-to-r from-purple-950/40 via-slate-900 to-amber-950/40 border border-purple-800/40 rounded-xl p-5 shadow-lg space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-1 text-purple-300 border-b border-purple-800/30 pb-2.5">
                  <div className="flex items-center space-x-2 font-bold text-sm">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Future Franchise Capital & Pipeline Balance</span>
                  </div>
                  <span className="text-[10px] text-purple-400/80 font-normal">
                    Draft pick &amp; prospect asset equity (distinct from regular season standings)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Team A Futures */}
                  <div className="bg-black/30 p-3.5 rounded-lg border border-purple-900/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{teamA.name} Acquired Futures:</span>
                      <span
                        title="Net trade equity rating of future draft picks and prospects exchanged"
                        className={`font-mono text-[10px] font-semibold px-2 py-0.5 rounded border ${
                          evaluation.futureCapital.teamANetCapitalScore > 0
                            ? 'text-emerald-300 bg-emerald-950/40 border-emerald-700/50'
                            : evaluation.futureCapital.teamANetCapitalScore < 0
                            ? 'text-rose-300 bg-rose-950/40 border-rose-700/50'
                            : 'text-purple-300 bg-purple-950/30 border-purple-800/30'
                        }`}
                      >
                        Futures Value: {evaluation.futureCapital.teamANetCapitalScore > 0 ? '+' : ''}
                        {evaluation.futureCapital.teamANetCapitalScore}
                      </span>
                    </div>
                    {evaluation.futureCapital.teamAAssetsAcquired.length === 0 ? (
                      <span className="text-slate-500 text-[11px] italic">No future assets acquired.</span>
                    ) : (
                      <div className="space-y-1">
                        {evaluation.futureCapital.teamAAssetsAcquired.map((asset, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-purple-200">
                            <span className="text-amber-400">★</span>
                            <span>{asset}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Team B Futures */}
                  <div className="bg-black/30 p-3.5 rounded-lg border border-purple-900/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{teamB.name} Acquired Futures:</span>
                      <span
                        title="Net trade equity rating of future draft picks and prospects exchanged"
                        className={`font-mono text-[10px] font-semibold px-2 py-0.5 rounded border ${
                          evaluation.futureCapital.teamBNetCapitalScore > 0
                            ? 'text-emerald-300 bg-emerald-950/40 border-emerald-700/50'
                            : evaluation.futureCapital.teamBNetCapitalScore < 0
                            ? 'text-rose-300 bg-rose-950/40 border-rose-700/50'
                            : 'text-purple-300 bg-purple-950/30 border-purple-800/30'
                        }`}
                      >
                        Futures Value: {evaluation.futureCapital.teamBNetCapitalScore > 0 ? '+' : ''}
                        {evaluation.futureCapital.teamBNetCapitalScore}
                      </span>
                    </div>
                    {evaluation.futureCapital.teamBAssetsAcquired.length === 0 ? (
                      <span className="text-slate-500 text-[11px] italic">No future assets acquired.</span>
                    ) : (
                      <div className="space-y-1">
                        {evaluation.futureCapital.teamBAssetsAcquired.map((asset, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-purple-200">
                            <span className="text-amber-400">★</span>
                            <span>{asset}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

          {/* Side-by-Side Impact Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Team A Metrics */}
            <div className="bg-rink-card border border-rink-border rounded-xl p-5 shadow-lg space-y-4">
              <div className="flex flex-wrap sm:flex-nowrap items-start sm:items-center justify-between gap-2 border-b border-rink-border pb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <img src={teamA.logoUrl} alt={teamA.name} className="w-6 h-6 object-contain shrink-0" />
                  <h4 className="text-sm font-bold text-white truncate">{teamA.name} Impact</h4>
                </div>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded shrink-0 ${
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
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Stanley Cup Win Prob</span>
                  <div className="text-lg font-black text-white mt-0.5">
                    {formatProb(evaluation.teamA.postTrade.stanleyCupWinProb)}
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
                    Baseline: {formatProb(evaluation.teamA.baseline.stanleyCupWinProb)}
                  </div>
                </div>

                <div className="bg-rink-surface p-3 rounded-lg border border-rink-border">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Playoff Qualification</span>
                  <div className="text-lg font-black text-white mt-0.5">
                    {formatProb(evaluation.teamA.postTrade.playoffProbability)}
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
                    Baseline: {formatProb(evaluation.teamA.baseline.playoffProbability)}
                  </div>
                </div>

                <div className="bg-rink-surface p-3 rounded-lg border border-rink-border">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Expected Regular Pts</span>
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
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Net Goal Diff / 60</span>
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
              <div className="flex flex-wrap sm:flex-nowrap items-start sm:items-center justify-between gap-2 border-b border-rink-border pb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <img src={teamB.logoUrl} alt={teamB.name} className="w-6 h-6 object-contain shrink-0" />
                  <h4 className="text-sm font-bold text-white truncate">{teamB.name} Impact</h4>
                </div>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded shrink-0 ${
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
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Stanley Cup Win Prob</span>
                  <div className="text-lg font-black text-white mt-0.5">
                    {formatProb(evaluation.teamB.postTrade.stanleyCupWinProb)}
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
                    Baseline: {formatProb(evaluation.teamB.baseline.stanleyCupWinProb)}
                  </div>
                </div>

                <div className="bg-rink-surface p-3 rounded-lg border border-rink-border">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Playoff Qualification</span>
                  <div className="text-lg font-black text-white mt-0.5">
                    {formatProb(evaluation.teamB.postTrade.playoffProbability)}
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
                    Baseline: {formatProb(evaluation.teamB.baseline.playoffProbability)}
                  </div>
                </div>

                <div className="bg-rink-surface p-3 rounded-lg border border-rink-border">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Expected Regular Pts</span>
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
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Net Goal Diff / 60</span>
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

      {/* ================= CUSTOM PROSPECT CREATION MODAL ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-rink-card border border-rink-border rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-rink-border pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-black text-white">Create Custom Prospect</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
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
                    {franchises.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.abbrev} - {t.commonName}
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

      {/* Share Trade Modal */}
      <ShareTradeModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        teamA={teamA}
        teamB={teamB}
        teamAPlayers={teamASendingPlayers}
        teamBPlayers={teamBSendingPlayers}
        teamAProspects={teamASendingProspects}
        teamBProspects={teamBSendingProspects}
        teamADraftPicks={teamADraftPicks}
        teamBDraftPicks={teamBDraftPicks}
        retainSalary={retainSalary || Object.keys(playerRetentions).length > 0}
        retentionPct={retentionPct}
        playerRetentions={playerRetentions}
        evaluation={evaluation}
        onFeatureSaved={() => {
          fetchFeaturedTrades().then((data) => {
            if (data && data.length > 0) setFeaturedProposals(data);
          });
        }}
      />
    </div>
  );
};
