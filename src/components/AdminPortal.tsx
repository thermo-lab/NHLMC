import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  KeyRound,
  Sparkles,
  Plus,
  Trash2,
  ExternalLink,
  Layers,
  ArrowRightLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Flame,
  Save,
  RotateCcw,
  Trophy,
} from 'lucide-react';
import { FeaturedTradeProposal } from '../types/featured';
import { fetchFeaturedTrades, saveFeaturedTrade, deleteFeaturedTrade } from '../services/featuredApi';
import { decodeTradeFromUrl } from '../utils/tradeUrl';
import { Player } from '../types/player';
import { NHLProspect } from '../types/prospect';
import { NHL_FRANCHISES } from '../data/nhlFranchises';
import { PlayerSpotlight, SpotlightTradeOption } from '../types/spotlight';
import { INITIAL_PLAYER_SPOTLIGHT } from '../data/playerSpotlights';
import { fetchActiveSpotlight, saveSpotlightToD1 } from '../services/spotlightApi';

interface AdminPortalProps {
  players: Player[];
  prospects: NHLProspect[];
  onLoadTradeIntoMachine: (paramsString: string) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  players,
  prospects,
  onLoadTradeIntoMachine,
}) => {
  const [adminKey, setAdminKey] = useState<string>(
    typeof window !== 'undefined' ? localStorage.getItem('nhlmc_admin_key') || '' : ''
  );
  const [activeAdminSubTab, setActiveAdminSubTab] = useState<'spotlight' | 'featured'>('spotlight');
  const [featuredList, setFeaturedList] = useState<FeaturedTradeProposal[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Player Spotlight State
  const [spotlightConfig, setSpotlightConfig] = useState<PlayerSpotlight>(INITIAL_PLAYER_SPOTLIGHT);
  const [isSavingSpotlight, setIsSavingSpotlight] = useState<boolean>(false);

  // Quick Composer / Importer State
  const [importUrlOrParams, setImportUrlOrParams] = useState('');
  const [composerTitle, setComposerTitle] = useState('');
  const [composerHeadline, setComposerHeadline] = useState('');
  const [composerDescription, setComposerDescription] = useState('');
  const [composerParams, setComposerParams] = useState('');
  const [composerTeamA, setComposerTeamA] = useState('WPG');
  const [composerTeamB, setComposerTeamB] = useState('BUF');
  const [composerOrder, setComposerOrder] = useState<number>(0);
  const [composerStatus, setComposerStatus] = useState<'PUBLISHED' | 'DRAFT'>('PUBLISHED');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCfGuide, setShowCfGuide] = useState(false);

  const loadTrades = async () => {
    setIsLoading(true);
    const data = await fetchFeaturedTrades();
    setFeaturedList(data);
    setIsLoading(false);
  };

  const loadSpotlight = async () => {
    const data = await fetchActiveSpotlight();
    if (data) setSpotlightConfig(data);
  };

  useEffect(() => {
    loadTrades();
    loadSpotlight();
  }, []);

  const handleSaveSpotlight = async () => {
    setIsSavingSpotlight(true);
    setStatusMessage(null);
    const res = await saveSpotlightToD1(spotlightConfig, adminKey);
    setIsSavingSpotlight(false);
    if (res.success) {
      setStatusMessage({ type: 'success', text: '✓ Homepage Player Spotlight successfully saved and published to Cloudflare D1!' });
    } else {
      setStatusMessage({ type: 'error', text: `Failed to save spotlight to D1: ${res.error}` });
    }
  };

  const handleResetSpotlight = () => {
    setSpotlightConfig(INITIAL_PLAYER_SPOTLIGHT);
    setStatusMessage({ type: 'success', text: 'Reset spotlight to default Hellebuyck configuration. Click "Save Spotlight to D1" to persist.' });
  };

  const syncOptionFromTradeParams = (tradeUrlParams: string) => {
    const decoded = decodeTradeFromUrl(tradeUrlParams, players, prospects);
    if (!decoded) {
      return {
        wpgReceives: ['Assets determined by trade scenario'],
        wpgSurrenders: ['Assets determined by trade scenario'],
        capFitSummary: 'Financial cap compliance analyzed by engine.',
      };
    }

    const playersMap = new Map(players.map((p) => [p.nhlId || p.id, p]));
    const prospectsMap = new Map(prospects.map((pr) => [pr.id, pr]));

    const surrenders: string[] = [];
    for (const pid of decoded.teamAPlayerIds) {
      const p = playersMap.get(pid);
      if (p) {
        const ret = decoded.playerRetentions?.[pid];
        const retText = ret ? ` (${ret}% salary retained)` : '';
        surrenders.push(`${p.name} ($${(p.capHit / 1e6).toFixed(2)}M AAV)${retText}`);
      }
    }
    for (const dp of decoded.teamADraftPicks) {
      const prot = dp.protection ? ` - ${dp.protection.replace(/_/g, ' ')}` : '';
      surrenders.push(`${dp.year} Round ${dp.round} (${dp.originalTeamId}${prot})`);
    }

    const receives: string[] = [];
    for (const pid of decoded.teamBPlayerIds) {
      const p = playersMap.get(pid);
      if (p) {
        const ret = decoded.playerRetentions?.[pid];
        const retText = ret ? ` (${ret}% salary retained)` : '';
        receives.push(`${p.name} ($${(p.capHit / 1e6).toFixed(2)}M AAV)${retText}`);
      }
    }
    for (const prId of decoded.teamBProspectIds) {
      const pr = prospectsMap.get(prId);
      if (pr) {
        receives.push(`${pr.name} (${pr.nhlTeam}, ${pr.potential.replace(/_/g, ' ')})`);
      }
    }
    for (const dp of decoded.teamBDraftPicks) {
      const prot = dp.protection ? ` - ${dp.protection.replace(/_/g, ' ')}` : '';
      receives.push(`${dp.year} Round ${dp.round} (${dp.originalTeamId}${prot})`);
    }

    const teamBObj = NHL_FRANCHISES.find((f) => f.id === decoded.teamBId);
    const capFit = teamBObj
      ? `${teamBObj.name} cap space: $${(teamBObj.capSpace / 1e6).toFixed(2)}M under $88.0M cap ceiling.`
      : 'Financial cap compliance analyzed by engine.';

    return {
      wpgReceives: receives.length > 0 ? receives : ['Assets determined by trade scenario'],
      wpgSurrenders: surrenders.length > 0 ? surrenders : ['Assets determined by trade scenario'],
      capFitSummary: capFit,
    };
  };

  const handleSelectSpotlightPlayer = (playerIdStr: string) => {
    const pId = Number(playerIdStr);
    const p = players.find((pl) => (pl.nhlId || pl.id) === pId);
    if (!p) return;
    const teamObj = NHL_FRANCHISES.find((f) => f.id === p.nhlTeam);
    setSpotlightConfig((prev) => ({
      ...prev,
      playerId: p.nhlId || p.id,
      playerName: p.name,
      currentTeamId: p.nhlTeam,
      currentTeamName: teamObj?.name || p.nhlTeam,
      position: p.primaryPosition === 'G' ? 'Goaltender' : p.primaryPosition,
      capHit: p.capHit,
      contractDetails: `$${(p.capHit / 1e6).toFixed(2)}M AAV`,
      headshotUrl: p.headshotUrl || `https://assets.nhle.com/mugs/nhl/latest/${p.nhlId || p.id}.png`,
    }));
  };

  const handleUpdateOption = (index: number, field: keyof SpotlightTradeOption, value: any) => {
    setSpotlightConfig((prev) => {
      const nextOptions = [...prev.options];
      nextOptions[index] = { ...nextOptions[index], [field]: value };
      return { ...prev, options: nextOptions };
    });
  };

  const handleUpdateOptionParams = (index: number, paramsOrUrl: string) => {
    let cleanParams = paramsOrUrl.trim();
    if (cleanParams.includes('?')) {
      cleanParams = cleanParams.split('?')[1];
    }
    const synced = syncOptionFromTradeParams(cleanParams);
    setSpotlightConfig((prev) => {
      const nextOptions = [...prev.options];
      nextOptions[index] = {
        ...nextOptions[index],
        tradeUrlParams: cleanParams,
        wpgReceives: synced.wpgReceives,
        wpgSurrenders: synced.wpgSurrenders,
        capFitSummary: synced.capFitSummary,
      };
      return { ...prev, options: nextOptions };
    });
  };

  const handleAddOption = () => {
    const newOpt: SpotlightTradeOption = {
      id: `opt-${Date.now()}`,
      destinationTeamId: 'TOR',
      destinationTeamName: 'Toronto Maple Leafs',
      title: 'Contender Blockbuster',
      subtitle: 'Playoff Netminding Solution',
      pitch: 'Toronto acquires Hellebuyck to solve their playoff goaltending needs.',
      tradeUrlParams: 'v=1&tA=WPG&tB=TOR&pA=8476945&dpB=tor-2028-rd1',
      wpgReceives: ['2028 1st Round Pick (TOR)', 'Top Prospect'],
      wpgSurrenders: ['Connor Hellebuyck ($8.50M AAV)'],
      capFitSummary: 'Toronto manages cap space with LTIR or retention.',
      projectedCupDeltaWinnipeg: '+0.5%',
      projectedCupDeltaDestination: '+6.0%',
    };
    setSpotlightConfig((prev) => ({ ...prev, options: [...prev.options, newOpt] }));
  };

  const handleDeleteOption = (index: number) => {
    setSpotlightConfig((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  const handleAdminKeyChange = (val: string) => {
    setAdminKey(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('nhlmc_admin_key', val);
    }
  };

  const handleImportParams = () => {
    if (!importUrlOrParams.trim()) return;
    const decoded = decodeTradeFromUrl(importUrlOrParams, players, prospects);
    if (!decoded) {
      setStatusMessage({ type: 'error', text: 'Could not parse trade parameters. Make sure it contains tA and tB.' });
      return;
    }

    const teamAName = NHL_FRANCHISES.find((f) => f.id === decoded.teamAId)?.name || decoded.teamAId;
    const teamBName = NHL_FRANCHISES.find((f) => f.id === decoded.teamBId)?.name || decoded.teamBId;

    let cleanQuery = importUrlOrParams;
    if (cleanQuery.includes('?')) {
      cleanQuery = cleanQuery.split('?')[1];
    }

    setComposerTeamA(decoded.teamAId);
    setComposerTeamB(decoded.teamBId);
    setComposerParams(cleanQuery);
    setComposerTitle(`${teamAName} & ${teamBName} Blockbuster`);
    setComposerHeadline(`Trade scenario featuring ${decoded.teamAPlayerIds.length + decoded.teamBPlayerIds.length} players and future assets.`);
    setComposerDescription(`Monte Carlo simulated proposal between ${teamAName} and ${teamBName}.`);
    setStatusMessage({ type: 'success', text: `✓ Successfully parsed trade between ${decoded.teamAId} and ${decoded.teamBId}!` });
  };

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    const decoded = decodeTradeFromUrl(composerParams, players, prospects);
    const teamAAssetNames = (decoded?.teamAPlayerIds || []).map((id) => {
      const p = players.find((x) => x.id === id);
      return p ? `${p.name} ($${(p.capHit / 1_000_000).toFixed(1)}M)` : `Player #${id}`;
    });
    const teamBAssetNames = (decoded?.teamBPlayerIds || []).map((id) => {
      const p = players.find((x) => x.id === id);
      return p ? `${p.name} ($${(p.capHit / 1_000_000).toFixed(1)}M)` : `Player #${id}`;
    });

    const newProposal: Partial<FeaturedTradeProposal> = {
      id: `featured-${composerTeamA.toLowerCase()}-${composerTeamB.toLowerCase()}-${Date.now().toString(36)}`,
      title: composerTitle,
      headline: composerHeadline,
      description: composerDescription,
      tradeUrlParams: composerParams,
      teamAId: composerTeamA,
      teamBId: composerTeamB,
      teamAAssets: {
        playerNames: teamAAssetNames,
        playerIds: decoded?.teamAPlayerIds,
      },
      teamBAssets: {
        playerNames: teamBAssetNames,
        playerIds: decoded?.teamBPlayerIds,
      },
      status: composerStatus,
      displayOrder: composerOrder,
    };

    const res = await saveFeaturedTrade(newProposal, adminKey);
    setIsSubmitting(false);

    if (res.success) {
      setStatusMessage({ type: 'success', text: '✓ Featured trade proposal published to D1!' });
      setComposerTitle('');
      setComposerHeadline('');
      setComposerDescription('');
      setComposerParams('');
      setImportUrlOrParams('');
      loadTrades();
    } else {
      setStatusMessage({ type: 'error', text: `Failed: ${res.error || 'Access denied'}` });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this featured trade?')) return;
    setStatusMessage(null);
    const res = await deleteFeaturedTrade(id, adminKey);
    if (res.success) {
      setStatusMessage({ type: 'success', text: '✓ Trade proposal deleted.' });
      loadTrades();
    } else {
      setStatusMessage({ type: 'error', text: `Failed: ${res.error}` });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 border border-sky-800/50 p-5 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sky-400 font-bold text-lg mb-1">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>NHLMC Editorial & Admin Portal</span>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl">
            Manage homepage featured trades, curate blockbuster rumors, and inspect Cloudflare D1 proposals. Access can be gated via Cloudflare Zero Trust One-Time PIN.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCfGuide(!showCfGuide)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5"
          >
            <HelpCircle className="w-4 h-4 text-sky-400" />
            <span>Cloudflare OTP Guide</span>
          </button>
          <button
            onClick={loadTrades}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Cloudflare Zero Trust Setup Guide Box */}
      {showCfGuide && (
        <div className="rounded-xl bg-slate-900/90 border border-sky-800/50 p-4 text-xs text-slate-300 space-y-2 animate-in fade-in duration-200">
          <h4 className="font-bold text-sky-400 text-sm flex items-center gap-1.5">
            <KeyRound className="w-4 h-4" />
            Cloudflare Zero Trust One-Time PIN (OTP) Setup
          </h4>
          <ol className="list-decimal pl-4 space-y-1.5 text-slate-300">
            <li>
              In <strong className="text-white">dash.cloudflare.com</strong>, navigate to <strong className="text-white">Zero Trust</strong> &gt; <strong className="text-white">Access</strong> &gt; <strong className="text-white">Applications</strong>.
            </li>
            <li>
              Click <strong className="text-white">Add an Application</strong> &gt; <strong className="text-white">Self-hosted</strong>.
            </li>
            <li>
              Application domain: <code className="text-sky-300 bg-slate-950 px-1 py-0.5 rounded">nhlmc.pages.dev/api/admin*</code> (or <code className="text-sky-300 bg-slate-950 px-1 py-0.5 rounded">nhlmc.pages.dev</code> with path <code className="text-sky-300 bg-slate-950 px-1 py-0.5 rounded">/admin*</code>).
            </li>
            <li>
              Add a Policy: Action = <strong className="text-white">Allow</strong>, Rule = <strong className="text-white">Emails</strong> (enter your email address). Cloudflare will automatically email a 6-digit One-Time PIN when accessing the admin endpoints.
            </li>
            <li>
              For local development or testing, you can also use the Admin Passcode field below.
            </li>
          </ol>
        </div>
      )}

      {/* Admin Passcode Bar */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-amber-400" />
          <span className="font-semibold text-slate-200">Admin Passcode / Token:</span>
          <input
            type="password"
            value={adminKey}
            onChange={(e) => handleAdminKeyChange(e.target.value)}
            placeholder="nhlmc-admin-2026"
            className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-slate-100 font-mono text-xs focus:outline-none focus:border-sky-500 w-48"
          />
        </div>
        <span className="text-slate-400 text-[11px]">
          Saved to browser localStorage for seamless authenticated editing.
        </span>
      </div>

      {statusMessage && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/70 border border-emerald-800 text-emerald-300'
              : 'bg-rose-950/70 border border-rose-800 text-rose-300'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Sub-Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveAdminSubTab('spotlight')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeAdminSubTab === 'spotlight'
              ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40 shadow-lg shadow-sky-500/10'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
          }`}
        >
          <Flame className="w-4 h-4 text-amber-400" />
          <span>Homepage Player Spotlight Manager</span>
        </button>

        <button
          onClick={() => setActiveAdminSubTab('featured')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeAdminSubTab === 'featured'
              ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40 shadow-lg shadow-sky-500/10'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
          }`}
        >
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>Curated Blockbuster Proposals ({featuredList.length})</span>
        </button>
      </div>

      {/* ================= SPOTLIGHT MANAGER ================= */}
      {activeAdminSubTab === 'spotlight' && (
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Player Spotlight Hero Configuration</span>
              </h3>
              <p className="text-xs text-slate-400">
                Configure the top homepage hero card, storyline, and destination trade options stored in Cloudflare D1.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetSpotlight}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Default</span>
              </button>
              <button
                type="button"
                onClick={handleSaveSpotlight}
                disabled={isSavingSpotlight}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-black text-xs shadow-lg shadow-sky-600/30 flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSavingSpotlight ? 'Saving to D1...' : 'Save Spotlight to D1'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Player Selection & Storyline (5 Columns) */}
            <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 text-xs">
              <h4 className="font-bold text-sky-400 text-sm border-b border-slate-800 pb-2">
                1. Select Spotlight Superstar
              </h4>

              {/* Player Selector Dropdown */}
              <div>
                <label className="block text-slate-400 font-medium text-[11px] mb-1">
                  Choose Player from Active League Roster:
                </label>
                <select
                  value={spotlightConfig.playerId}
                  onChange={(e) => handleSelectSpotlightPlayer(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-slate-100 font-bold focus:outline-none focus:border-sky-500"
                >
                  {players.map((p) => (
                    <option key={p.nhlId || p.id} value={p.nhlId || p.id}>
                      {p.name} ({p.nhlTeam} - {p.primaryPosition}, ${(p.capHit / 1e6).toFixed(2)}M)
                    </option>
                  ))}
                </select>
              </div>

              {/* Read-Only Canonical Player Card */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl bg-slate-900 border border-slate-700 p-1 shrink-0 overflow-hidden">
                    <img
                      src={spotlightConfig.headshotUrl}
                      alt={spotlightConfig.playerName}
                      className="w-full h-full object-cover object-top"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          'https://assets.nhle.com/mugs/nhl/latest/8476945.png';
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-mono text-sky-400 uppercase font-semibold">
                      {spotlightConfig.currentTeamName} ({spotlightConfig.currentTeamId})
                    </div>
                    <div className="text-base font-black text-white truncate">
                      {spotlightConfig.playerName}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                      <span>{spotlightConfig.position}</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-mono font-semibold">
                        ${(spotlightConfig.capHit / 1e6).toFixed(2)}M AAV
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 italic bg-black/20 p-2 rounded border border-slate-800/60">
                  ✓ Canonical player data, photo, and official cap hit are locked from the NHL database to ensure analyzer consistency.
                </div>
              </div>

              {/* Editorial Content */}
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-slate-400 font-medium text-[11px] mb-1">Badge Text</label>
                  <input
                    type="text"
                    value={spotlightConfig.badgeText}
                    onChange={(e) => setSpotlightConfig({ ...spotlightConfig, badgeText: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium text-[11px] mb-1">Editorial Headline</label>
                  <input
                    type="text"
                    value={spotlightConfig.headline}
                    onChange={(e) => setSpotlightConfig({ ...spotlightConfig, headline: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 font-bold focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium text-[11px] mb-1">Editorial Storyline</label>
                  <textarea
                    rows={4}
                    value={spotlightConfig.editorialStoryline}
                    onChange={(e) => setSpotlightConfig({ ...spotlightConfig, editorialStoryline: e.target.value })}
                    placeholder="Describe why this player is at a franchise crossroads and needs to move..."
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 leading-relaxed focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                  <input
                    type="checkbox"
                    id="spotlightActiveCheckbox"
                    checked={spotlightConfig.isActive}
                    onChange={(e) => setSpotlightConfig({ ...spotlightConfig, isActive: e.target.checked })}
                    className="rounded bg-slate-950 border-slate-700 text-sky-500 focus:ring-0"
                  />
                  <label htmlFor="spotlightActiveCheckbox" className="text-slate-300 font-semibold cursor-pointer">
                    Hero Spotlight Enabled on Homepage
                  </label>
                </div>
              </div>
            </div>

            {/* Right: Destination Scenarios List (7 Columns) */}
            <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div>
                  <h4 className="font-bold text-sky-400 text-sm">
                    2. Destination Scenarios ({spotlightConfig.options.length})
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Setup trade proposals using trade links or parameters. The analyzer automatically evaluates assets and cap math.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="px-2.5 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white font-bold text-[11px] flex items-center gap-1 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Landing Spot</span>
                </button>
              </div>

              <div className="space-y-4 max-h-[750px] overflow-y-auto pr-1">
                {spotlightConfig.options.map((opt, idx) => (
                  <div
                    key={opt.id || idx}
                    className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                      <span className="font-bold text-sky-300 flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-sky-950 border border-sky-800 font-mono text-[10px]">
                          #{idx + 1}
                        </span>
                        <span>{opt.destinationTeamName} ({opt.destinationTeamId})</span>
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onLoadTradeIntoMachine(opt.tradeUrlParams)}
                          className="text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 text-[11px]"
                        >
                          <span>Test in Trade Machine</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteOption(idx)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                          title="Delete Scenario"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Team Selection */}
                    <div>
                      <label className="block text-slate-400 text-[10px] mb-0.5">Destination Franchise</label>
                      <select
                        value={opt.destinationTeamId}
                        onChange={(e) => {
                          const destId = e.target.value;
                          const teamObj = NHL_FRANCHISES.find((f) => f.id === destId);
                          handleUpdateOption(idx, 'destinationTeamId', destId);
                          handleUpdateOption(idx, 'destinationTeamName', teamObj?.name || destId);
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-100 font-bold text-xs"
                      >
                        {NHL_FRANCHISES.filter((f) => f.id !== spotlightConfig.currentTeamId).map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.name} ({f.abbrev})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Title & Subtitle */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-400 text-[10px] mb-0.5">Scenario Title</label>
                        <input
                          type="text"
                          value={opt.title}
                          onChange={(e) => handleUpdateOption(idx, 'title', e.target.value)}
                          placeholder="e.g. The Core Retool"
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100 font-semibold text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 text-[10px] mb-0.5">Scenario Subtitle</label>
                        <input
                          type="text"
                          value={opt.subtitle}
                          onChange={(e) => handleUpdateOption(idx, 'subtitle', e.target.value)}
                          placeholder="e.g. End the 14-Year Playoff Drought"
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100 text-xs"
                        />
                      </div>
                    </div>

                    {/* Pitch / Narrative */}
                    <div>
                      <label className="block text-slate-400 text-[10px] mb-0.5">Editorial Pitch</label>
                      <textarea
                        rows={2}
                        value={opt.pitch}
                        onChange={(e) => handleUpdateOption(idx, 'pitch', e.target.value)}
                        placeholder="Why does this proposal make sense for both clubs?"
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100 text-xs"
                      />
                    </div>

                    {/* Trade Proposal Link or Params */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between">
                        <label className="block text-sky-400 font-semibold text-[11px]">
                          ⚡ Trade Parameters / Shared Link:
                        </label>
                        <button
                          type="button"
                          onClick={() => handleUpdateOptionParams(idx, opt.tradeUrlParams)}
                          className="text-[10px] text-sky-300 hover:text-white px-1.5 py-0.5 rounded bg-sky-950 border border-sky-800 flex items-center gap-1 cursor-pointer"
                        >
                          <RefreshCw className="w-2.5 h-2.5" />
                          <span>Re-Sync Assets</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        value={opt.tradeUrlParams}
                        onChange={(e) => handleUpdateOptionParams(idx, e.target.value)}
                        placeholder="Paste link: https://nhlmc.pages.dev/?v=1&tA=WPG&tB=BUF..."
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-sky-300 font-mono text-[11px] focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    {/* Live Parsed Trade Assets Preview (Read-Only) */}
                    <div className="p-2.5 rounded-lg bg-black/40 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold border-b border-slate-800 pb-1">
                        <span>Analyzed Trade Assets</span>
                        <span className="text-emerald-400 font-mono">Calculated by Analyzer</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                        <div>
                          <span className="font-bold text-slate-400">{spotlightConfig.currentTeamName} Receives:</span>
                          <div className="space-y-0.5 mt-0.5">
                            {opt.wpgReceives.map((item, i) => (
                              <div key={i} className="text-emerald-300 flex items-start gap-1">
                                <span>•</span>
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <span className="font-bold text-slate-400">{spotlightConfig.currentTeamName} Surrenders:</span>
                          <div className="space-y-0.5 mt-0.5">
                            {opt.wpgSurrenders.map((item, i) => (
                              <div key={i} className="text-rose-300 flex items-start gap-1">
                                <span>•</span>
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800/60 font-mono">
                        {opt.capFitSummary}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= FEATURED PROPOSALS COMPOSER ================= */}
      {activeAdminSubTab === 'featured' && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Compose / Import Proposal */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-sm border-b border-slate-800 pb-3">
            <Plus className="w-4 h-4 text-sky-400" />
            <span>Add / Publish Featured Proposal</span>
          </div>

          {/* Quick URL Importer */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 text-xs">
            <label className="block font-semibold text-sky-400">
              ⚡ Quick Import from Shared Trade Link or Query Params:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={importUrlOrParams}
                onChange={(e) => setImportUrlOrParams(e.target.value)}
                placeholder="Paste link: https://nhlmc.pages.dev/?v=1&tA=WPG&tB=BUF..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500 font-mono"
              />
              <button
                type="button"
                onClick={handleImportParams}
                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded text-xs transition"
              >
                Parse Link
              </button>
            </div>
          </div>

          {/* Composer Form */}
          <form onSubmit={handleCreateOrUpdate} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Title</label>
              <input
                type="text"
                required
                value={composerTitle}
                onChange={(e) => setComposerTitle(e.target.value)}
                placeholder="e.g. Hellebuyck Blockbuster: Jets & Sabres Re-tool"
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Team A</label>
                <select
                  value={composerTeamA}
                  onChange={(e) => setComposerTeamA(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-sky-500 font-bold"
                >
                  {NHL_FRANCHISES.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.abbrev})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Team B</label>
                <select
                  value={composerTeamB}
                  onChange={(e) => setComposerTeamB(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-sky-500 font-bold"
                >
                  {NHL_FRANCHISES.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.abbrev})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Headline Summary</label>
              <input
                type="text"
                value={composerHeadline}
                onChange={(e) => setComposerHeadline(e.target.value)}
                placeholder="e.g. Hellebuyck & Pionk for Thompson, Peterka, Mrtka & 2027 1st"
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Trade URL Query String</label>
              <input
                type="text"
                required
                value={composerParams}
                onChange={(e) => setComposerParams(e.target.value)}
                placeholder="v=1&tA=WPG&tB=BUF&pA=8476883,8477465&pB=8479420,8482149&prB=buf-radim-mrtka&dpB=buf-2027-rd1"
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-sky-300 font-mono text-[11px] focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Editorial Description</label>
              <textarea
                rows={2}
                value={composerDescription}
                onChange={(e) => setComposerDescription(e.target.value)}
                placeholder="Explain the hockey trade logic..."
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-sky-500 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Display Order</label>
                <input
                  type="number"
                  value={composerOrder}
                  onChange={(e) => setComposerOrder(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Status</label>
                <select
                  value={composerStatus}
                  onChange={(e) => setComposerStatus(e.target.value as 'PUBLISHED' | 'DRAFT')}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-sky-500 font-bold"
                >
                  <option value="PUBLISHED">Published (Visible on Home)</option>
                  <option value="DRAFT">Draft</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-sky-600/20"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving to D1...' : 'Save & Publish Featured Proposal'}</span>
            </button>
          </form>
        </div>

        {/* Right: Active Featured Proposals in D1 */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Live Featured Proposals ({featuredList.length})</span>
            </div>
            <span className="text-[11px] text-slate-400">Loaded from Cloudflare D1</span>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[600px] pr-1">
            {featuredList.map((item) => (
              <div
                key={item.id}
                className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2 hover:border-slate-700 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">{item.title}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.status === 'PUBLISHED'
                        ? 'bg-emerald-950 border border-emerald-800 text-emerald-400'
                        : 'bg-amber-950 border border-amber-800 text-amber-400'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-2">{item.headline || item.description}</p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
                  <div className="flex items-center gap-1.5 font-mono text-sky-400">
                    <span>{item.teamAId}</span>
                    <ArrowRightLeft className="w-3 h-3 text-slate-600" />
                    <span>{item.teamBId}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onLoadTradeIntoMachine(item.tradeUrlParams)}
                      className="text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 transition"
                    >
                      <span>Simulate</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      )}
    </div>
  );
};
