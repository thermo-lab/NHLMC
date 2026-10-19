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
} from 'lucide-react';
import { FeaturedTradeProposal } from '../types/featured';
import { fetchFeaturedTrades, saveFeaturedTrade, deleteFeaturedTrade } from '../services/featuredApi';
import { decodeTradeFromUrl } from '../utils/tradeUrl';
import { Player } from '../types/player';
import { NHLProspect } from '../types/prospect';
import { NHL_FRANCHISES } from '../data/nhlFranchises';

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
  const [featuredList, setFeaturedList] = useState<FeaturedTradeProposal[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

  useEffect(() => {
    loadTrades();
  }, []);

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

      {/* Two Column Layout: Importer & Composer / Existing Proposals */}
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
    </div>
  );
};
