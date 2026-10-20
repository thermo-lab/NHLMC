import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  Share2,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  ArrowRightLeft,
  CheckCircle2,
  Download,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';
import { NHLTeam, FranchiseTradeEvaluation } from '../types/franchise';
import { Player } from '../types/player';
import { NHLProspect, DraftPick } from '../types/prospect';
import { buildShareableTradeUrl } from '../utils/tradeUrl';
import { saveFeaturedTrade } from '../services/featuredApi';
import { renderTradeCardPng } from '../utils/ogImageGenerator';

interface ShareTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamA: NHLTeam;
  teamB: NHLTeam;
  teamAPlayers: Player[];
  teamBPlayers: Player[];
  teamAProspects: NHLProspect[];
  teamBProspects: NHLProspect[];
  teamADraftPicks: DraftPick[];
  teamBDraftPicks: DraftPick[];
  retainSalary: boolean;
  retentionPct: number;
  playerRetentions?: Record<number, number>;
  evaluation?: FranchiseTradeEvaluation | null;
  onFeatureSaved?: () => void;
}

export const ShareTradeModal: React.FC<ShareTradeModalProps> = ({
  isOpen,
  onClose,
  teamA,
  teamB,
  teamAPlayers,
  teamBPlayers,
  teamAProspects,
  teamBProspects,
  teamADraftPicks,
  teamBDraftPicks,
  retainSalary,
  retentionPct,
  playerRetentions,
  evaluation,
  onFeatureSaved,
}) => {
  const [copied, setCopied] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [featureTitle, setFeatureTitle] = useState(`${teamA.name} & ${teamB.name} Proposal`);
  const [featureHeadline, setFeatureHeadline] = useState('');
  const [featureDescription, setFeatureDescription] = useState('');
  const [adminPasscode, setAdminPasscode] = useState(
    typeof window !== 'undefined' ? localStorage.getItem('nhlmc_admin_key') || '' : ''
  );
  const [isSubmittingFeature, setIsSubmittingFeature] = useState(false);
  const [featureMessage, setFeatureMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Live Card Preview states
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [isGeneratingCard, setIsGeneratingCard] = useState(false);

  const hasAdminAccess = Boolean(
    adminPasscode ||
    (typeof window !== 'undefined' && (
      new URLSearchParams(window.location.search).has('admin') ||
      window.location.hash === '#admin' ||
      window.location.pathname.startsWith('/admin')
    ))
  );

  const tradePayload = {
    teamAId: teamA.id,
    teamBId: teamB.id,
    teamAPlayers,
    teamBPlayers,
    teamAProspects,
    teamBProspects,
    teamADraftPicks,
    teamBDraftPicks,
    retainSalary,
    retentionPct,
    playerRetentions,
  };

  const shareableUrl = buildShareableTradeUrl(tradePayload);

  // Generate live high-resolution OpenGraph preview PNG when trade changes
  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    setIsGeneratingCard(true);

    // Format received assets
    const teamAAssetNames = [
      ...teamBPlayers.map((p) => {
        const ret = playerRetentions?.[p.id];
        return ret && ret > 0 ? `${p.name} (${ret}% Ret)` : p.name;
      }),
      ...teamBProspects.map((pr) => `${pr.name} (Prospect)`),
      ...teamBDraftPicks.map((dp) => {
        const prot =
          dp.protection === 'UNPROTECTED'
            ? 'Unprot'
            : dp.protection === 'TOP_5_PROTECTED'
            ? 'Top 5'
            : 'Top 10';
        return `${dp.year} Rd ${dp.round} (${prot})`;
      }),
    ];

    const teamBAssetNames = [
      ...teamAPlayers.map((p) => {
        const ret = playerRetentions?.[p.id];
        return ret && ret > 0 ? `${p.name} (${ret}% Ret)` : p.name;
      }),
      ...teamAProspects.map((pr) => `${pr.name} (Prospect)`),
      ...teamADraftPicks.map((dp) => {
        const prot =
          dp.protection === 'UNPROTECTED'
            ? 'Unprot'
            : dp.protection === 'TOP_5_PROTECTED'
            ? 'Top 5'
            : 'Top 10';
        return `${dp.year} Rd ${dp.round} (${prot})`;
      }),
    ];

    let teamAMetrics = '+3.4 PTS  |  +4.1% CUP ODDS';
    let teamBMetrics = '-1.2 PTS  |  +$6.5M CAP ROOM';
    let verdict = 'FAIR TRADE';

    if (evaluation) {
      const pDeltaA = evaluation.teamA.deltas.pointsDelta;
      const cupDeltaA = evaluation.teamA.deltas.stanleyCupDelta * 100;
      teamAMetrics = `${pDeltaA >= 0 ? '+' : ''}${pDeltaA.toFixed(1)} PTS  |  ${cupDeltaA >= 0 ? '+' : ''}${cupDeltaA.toFixed(1)}% CUP ODDS`;

      const pDeltaB = evaluation.teamB.deltas.pointsDelta;
      const cupDeltaB = evaluation.teamB.deltas.stanleyCupDelta * 100;
      teamBMetrics = `${pDeltaB >= 0 ? '+' : ''}${pDeltaB.toFixed(1)} PTS  |  ${cupDeltaB >= 0 ? '+' : ''}${cupDeltaB.toFixed(1)}% CUP ODDS`;

      if (evaluation.verdict.winner === 'TEAM_A') {
        verdict = `WINNER: ${teamA.abbrev}`;
      } else if (evaluation.verdict.winner === 'TEAM_B') {
        verdict = `WINNER: ${teamB.abbrev}`;
      } else if (evaluation.verdict.winner === 'WIN_WIN') {
        verdict = 'WIN-WIN TRADE';
      } else {
        verdict = 'FAIR / EVEN';
      }
    }

    renderTradeCardPng({
      title: `${teamA.name} & ${teamB.name} Proposal`,
      teamAName: teamA.name,
      teamAAbbrev: teamA.abbrev,
      teamAAssets: teamAAssetNames.length > 0 ? teamAAssetNames : ['Draft Pick Assets'],
      teamAMetrics,
      teamBName: teamB.name,
      teamBAbbrev: teamB.abbrev,
      teamBAssets: teamBAssetNames.length > 0 ? teamBAssetNames : ['Draft Pick Assets'],
      teamBMetrics,
      verdict,
    })
      .then((pngBytes) => {
        if (!active) return;
        const blob = new Blob([pngBytes.buffer as ArrayBuffer], { type: 'image/png' });
        const url = URL.createObjectURL(blob);
        setPreviewBlobUrl(url);
        setIsGeneratingCard(false);
      })
      .catch((err) => {
        console.error('Error rendering social card:', err);
        if (active) setIsGeneratingCard(false);
      });

    return () => {
      active = false;
      if (previewBlobUrl) {
        URL.revokeObjectURL(previewBlobUrl);
      }
    };
  }, [
    isOpen,
    teamA,
    teamB,
    teamAPlayers,
    teamBPlayers,
    teamAProspects,
    teamBProspects,
    teamADraftPicks,
    teamBDraftPicks,
    evaluation,
  ]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy trade link:', err);
    }
  };

  const handleDownloadCard = () => {
    if (!previewBlobUrl) return;
    const a = document.createElement('a');
    a.href = previewBlobUrl;
    a.download = `nhlmc-${teamA.abbrev.toLowerCase()}-${teamB.abbrev.toLowerCase()}-trade.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleSaveToFeatured = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingFeature(true);
    setFeatureMessage(null);

    const teamAAssetNames = [
      ...teamAPlayers.map((p) => {
        const ret = playerRetentions?.[p.id];
        const cap = ret && ret > 0 ? p.capHit * (1 - ret / 100) : p.capHit;
        const retLabel = ret && ret > 0 ? ` [${ret}% Retained]` : '';
        return `${p.name} ($${(cap / 1_000_000).toFixed(2)}M)${retLabel}`;
      }),
      ...teamAProspects.map((pr) => `${pr.name} (Prospect)`),
      ...teamADraftPicks.map((dp) => `${dp.year} Rd ${dp.round} (${dp.originalTeamId} - ${dp.protection.replace(/_/g, ' ')})`),
    ];

    const teamBAssetNames = [
      ...teamBPlayers.map((p) => {
        const ret = playerRetentions?.[p.id];
        const cap = ret && ret > 0 ? p.capHit * (1 - ret / 100) : p.capHit;
        const retLabel = ret && ret > 0 ? ` [${ret}% Retained]` : '';
        return `${p.name} ($${(cap / 1_000_000).toFixed(2)}M)${retLabel}`;
      }),
      ...teamBProspects.map((pr) => `${pr.name} (Prospect)`),
      ...teamBDraftPicks.map((dp) => `${dp.year} Rd ${dp.round} (${dp.originalTeamId} - ${dp.protection.replace(/_/g, ' ')})`),
    ];

    const query = shareableUrl.includes('?') ? shareableUrl.split('?')[1] : '';

    const res = await saveFeaturedTrade(
      {
        id: `featured-${teamA.id.toLowerCase()}-${teamB.id.toLowerCase()}-${Date.now().toString(36)}`,
        title: featureTitle,
        headline: featureHeadline || `${teamA.name} and ${teamB.name} asset swap`,
        description: featureDescription || `Monte Carlo simulated trade between ${teamA.name} and ${teamB.name}.`,
        tradeUrlParams: query,
        teamAId: teamA.id,
        teamBId: teamB.id,
        teamAAssets: {
          playerNames: teamAAssetNames,
          playerIds: teamAPlayers.map((p) => p.id),
        },
        teamBAssets: {
          playerNames: teamBAssetNames,
          playerIds: teamBPlayers.map((p) => p.id),
        },
        status: 'PUBLISHED',
        displayOrder: 0,
      },
      adminPasscode
    );

    setIsSubmittingFeature(false);

    if (res.success) {
      if (adminPasscode) localStorage.setItem('nhlmc_admin_key', adminPasscode);
      setFeatureMessage({ type: 'success', text: '✓ Trade published to Featured Proposals successfully!' });
      if (onFeatureSaved) onFeatureSaved();
      setTimeout(() => {
        setShowAdminPanel(false);
      }, 2000);
    } else {
      setFeatureMessage({ type: 'error', text: `Failed: ${res.error || 'Access denied. Check Cloudflare OTP or Admin Key.'}` });
    }
  };

  const shareText = encodeURIComponent(`Check out this NHL trade scenario on NHLMC: ${teamA.abbrev} & ${teamB.abbrev} simulated trade!`);
  const twitterUrl = `https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(shareableUrl)}`;
  const redditUrl = `https://reddit.com/submit?url=${encodeURIComponent(shareableUrl)}&title=${shareText}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0b1322] border border-sky-800/60 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2 text-sky-400 font-bold text-base">
            <Share2 className="w-5 h-5 text-sky-400" />
            <span>Share Trade Proposal</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Live Twitter / OpenGraph Card Preview */}
          <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-3 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-bold text-slate-200">
                <ImageIcon className="w-4 h-4 text-sky-400" />
                <span>On-Demand Social Card Preview</span>
                <span className="text-[10px] bg-sky-950 text-sky-400 border border-sky-800/80 px-1.5 py-0.5 rounded font-mono">
                  1200×630 PNG
                </span>
              </div>
              <button
                onClick={handleDownloadCard}
                disabled={!previewBlobUrl || isGeneratingCard}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-300 hover:text-white transition text-[11px] font-semibold border border-slate-700 disabled:opacity-50"
                title="Download 1200x630 PNG card to attach to your post"
              >
                <Download className="w-3.5 h-3.5 text-sky-400" />
                <span>Download PNG</span>
              </button>
            </div>

            <div className="relative aspect-[1200/630] w-full rounded-lg overflow-hidden border border-slate-800 bg-slate-900 shadow-inner flex items-center justify-center">
              {isGeneratingCard ? (
                <div className="flex flex-col items-center gap-2 text-slate-400 text-xs">
                  <Loader2 className="w-6 h-6 animate-spin text-sky-400" />
                  <span>Rendering preview thumbnail...</span>
                </div>
              ) : previewBlobUrl ? (
                <img
                  src={previewBlobUrl}
                  alt="NHLMC Social Trade Card Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs text-slate-500">Generating preview...</span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              When shared on X / Twitter, Discord, Slack, or Reddit, this 1200×630 preview card will automatically display in timelines.
            </p>
          </div>

          {/* Trade Snapshot Summary */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs">
            <div className="flex-1 pr-2">
              <span className="font-bold text-white block text-sm">{teamA.name}</span>
              <span className="text-slate-400 text-[11px]">
                {teamAPlayers.length} players, {teamAProspects.length} prospects, {teamADraftPicks.length} picks
              </span>
            </div>
            <ArrowRightLeft className="w-4 h-4 text-sky-400 shrink-0 mx-2" />
            <div className="flex-1 pl-2 text-right">
              <span className="font-bold text-white block text-sm">{teamB.name}</span>
              <span className="text-slate-400 text-[11px]">
                {teamBPlayers.length} players, {teamBProspects.length} prospects, {teamBDraftPicks.length} picks
              </span>
            </div>
          </div>

          {/* Copyable Link Box */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Durable Shareable Link (Versioned Protocol)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareableUrl}
                className="flex-1 bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-xs font-mono text-sky-300 focus:outline-none select-all"
              />
              <button
                onClick={handleCopy}
                className={`px-3.5 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition shrink-0 ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white shadow-sm'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
              <span className="text-emerald-400">✓</span> Links use official immutable NHL IDs and will remain valid indefinitely.
            </p>
          </div>

          {/* Quick Social Shares */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Quick share:</span>
            <div className="flex items-center gap-2">
              <a
                href={twitterUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition flex items-center gap-1.5"
              >
                <span>X / Twitter</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
              <a
                href={redditUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition flex items-center gap-1.5"
              >
                <span>Reddit</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>
          </div>

          {/* Admin Publish Accordion (only for authorized admin sessions) */}
          {hasAdminAccess && (
            <div className="pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowAdminPanel(!showAdminPanel)}
                className="w-full flex items-center justify-between py-2 text-xs font-semibold text-slate-400 hover:text-amber-300 transition"
              >
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Admin: Feature on Homepage</span>
                </span>
                <span>{showAdminPanel ? '▲ Close' : '▼ Expand'}</span>
              </button>

              {showAdminPanel && (
                <form onSubmit={handleSaveToFeatured} className="mt-3 p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Featured Title
                    </label>
                    <input
                      type="text"
                      required
                      value={featureTitle}
                      onChange={(e) => setFeatureTitle(e.target.value)}
                      placeholder="e.g. Hellebuyck Blockbuster: Jets & Sabres Re-tool"
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Headline Summary
                    </label>
                    <input
                      type="text"
                      value={featureHeadline}
                      onChange={(e) => setFeatureHeadline(e.target.value)}
                      placeholder="e.g. Hellebuyck & Pionk for Thompson, Peterka, Mrtka & 2027 1st"
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Editorial Rationale / Notes
                    </label>
                    <textarea
                      rows={2}
                      value={featureDescription}
                      onChange={(e) => setFeatureDescription(e.target.value)}
                      placeholder="Explain why this trade makes strategic sense for both clubs..."
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-sky-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Cloudflare OTP / Admin Passcode
                    </label>
                    <input
                      type="password"
                      value={adminPasscode}
                      onChange={(e) => setAdminPasscode(e.target.value)}
                      placeholder="Enter admin passcode (or leave blank if on CF Zero Trust)"
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-sky-500 font-mono"
                    />
                  </div>

                  {featureMessage && (
                    <div
                      className={`p-2.5 rounded text-xs ${
                        featureMessage.type === 'success'
                          ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'
                          : 'bg-rose-950/60 border border-rose-800 text-rose-300'
                      }`}
                    >
                      {featureMessage.text}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmittingFeature}
                    className="w-full py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-bold rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isSubmittingFeature ? 'Publishing...' : 'Publish to Featured Proposals'}</span>
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
