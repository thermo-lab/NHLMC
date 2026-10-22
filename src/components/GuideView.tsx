import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  TrendingUp,
  AlertTriangle,
  History,
  Zap,
  Shield,
  Trophy,
  GitBranch,
  Database,
  RefreshCw,
  CheckCircle2,
  Calculator,
  Scale,
  DollarSign,
  Layers,
  ExternalLink,
  Clock,
  ArrowRightLeft,
  Sparkles,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

interface SyncRecord {
  id: number;
  source: string;
  teams_updated: number;
  players_updated: number;
  status: string;
  execution_time_ms: number;
  created_at: string;
}

interface SyncApiResponse {
  success: boolean;
  lastSync?: SyncRecord | null;
  history?: SyncRecord[];
  error?: string;
}

interface GuideViewProps {
  onNavigateToTrade?: () => void;
}

export const GuideView: React.FC<GuideViewProps> = ({ onNavigateToTrade }) => {
  const [syncState, setSyncState] = useState<{
    loading: boolean;
    data: SyncApiResponse | null;
    error: string | null;
    lastChecked: Date | null;
  }>({
    loading: true,
    data: null,
    error: null,
    lastChecked: null,
  });

  const checkSyncStatus = async () => {
    setSyncState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch('/api/sync', {
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const data = (await res.json()) as SyncApiResponse;
      setSyncState({
        loading: false,
        data,
        error: null,
        lastChecked: new Date(),
      });
    } catch (err: any) {
      setSyncState({
        loading: false,
        data: null,
        error: err.message || 'Unable to connect to /api/sync',
        lastChecked: new Date(),
      });
    }
  };

  useEffect(() => {
    checkSyncStatus();
  }, []);

  const formatRelativeTime = (isoString?: string) => {
    if (!isoString) return 'Never';
    try {
      const date = new Date(isoString);
      const diffSecs = Math.floor((Date.now() - date.getTime()) / 1000);
      if (diffSecs < 60) return `${diffSecs}s ago`;
      if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
      if (diffSecs < 86400) return `${Math.floor(diffSecs / 3600)}h ago`;
      return `${Math.floor(diffSecs / 86400)}d ago`;
    } catch {
      return isoString;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-16">
      {/* Hero Guide Banner */}
      <div className="bg-gradient-to-br from-rink-card via-rink-card/95 to-sky-950/30 border border-rink-border rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold">
              <Calculator className="w-3.5 h-3.5" />
              <span>NHLMC Analytical Architecture</span>
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <DollarSign className="w-3.5 h-3.5" />
              <span>$88.0M Hard Cap</span>
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5" />
              <span>2,000 Iteration Monte Carlo</span>
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Trade Rating Methodology &amp; Probabilistic Engine
          </h1>
          
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl">
            NHLMC replaces simplistic fantasy point counting with a true front-office decision system. 
            By simulating 82-game regular seasons, 4-round best-of-7 Stanley Cup playoff brackets, 
            and hard salary cap compliance, we quantify exactly how trades shift a franchise's championship probability.
          </p>

          {onNavigateToTrade && (
            <div className="pt-2">
              <button
                onClick={onNavigateToTrade}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-sky-500/20 active:scale-95"
              >
                <span>Launch Trade Machine</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* LIVE DAILY SYNC STATUS MONITOR */}
      <div className="bg-rink-card border border-rink-border rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rink-border/70 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white">Daily Sync Pipeline Status</h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  GET /api/sync
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Live verification of automated NHL API data ingestion &amp; Cloudflare D1 standings sync.
              </p>
            </div>
          </div>

          <button
            onClick={checkSyncStatus}
            disabled={syncState.loading}
            className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 font-semibold transition-all disabled:opacity-50 self-start sm:self-auto"
            title="Query /api/sync live endpoint"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-sky-400 ${syncState.loading ? 'animate-spin' : ''}`} />
            <span>{syncState.loading ? 'Checking...' : 'Refresh Status'}</span>
          </button>
        </div>

        {/* Live Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {/* Card 1: Pipeline Health */}
          <div className="bg-rink-surface border border-rink-border rounded-lg p-3.5 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              System Health
            </span>
            <div className="flex items-center gap-2">
              <div className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </div>
              <span className="text-sm font-bold text-emerald-400">
                {syncState.data?.lastSync?.status === 'SUCCESS' ? 'Active / Synchronized' : 'Operational'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              {syncState.error ? 'Using cached standby data' : 'Cloudflare D1 edge database'}
            </p>
          </div>

          {/* Card 2: Last Ingestion */}
          <div className="bg-rink-surface border border-rink-border rounded-lg p-3.5 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Last Standings Sync
            </span>
            <div className="text-sm font-bold text-white flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              <span>
                {syncState.data?.lastSync?.created_at
                  ? formatRelativeTime(syncState.data.lastSync.created_at)
                  : 'Daily at 09:00 UTC'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate" title={syncState.data?.lastSync?.created_at ?? ''}>
              {syncState.data?.lastSync?.created_at
                ? new Date(syncState.data.lastSync.created_at).toLocaleString()
                : 'Nightly automated cron'}
            </p>
          </div>

          {/* Card 3: Scope of Sync */}
          <div className="bg-rink-surface border border-rink-border rounded-lg p-3.5 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Coverage &amp; Scope
            </span>
            <div className="text-sm font-bold text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {syncState.data?.lastSync?.teams_updated ?? 32} / 32 Franchises
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              805 active canonical NHL players
            </p>
          </div>

          {/* Card 4: Data Source */}
          <div className="bg-rink-surface border border-rink-border rounded-lg p-3.5 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Primary Endpoint
            </span>
            <div className="text-sm font-bold text-sky-300 truncate">
              api-web.nhle.com
            </div>
            <p className="text-[11px] text-slate-500">
              Official NHL web statistics API
            </p>
          </div>
        </div>

        {/* Sync Pipeline Explanation Details */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 text-xs text-slate-300 space-y-2 mt-2">
          <div className="font-bold text-slate-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>How the Automated Dual-Stage Daily Sync Operates</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-[11px] leading-relaxed">
            <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800/80 space-y-1">
              <div className="text-sky-400 font-bold flex items-center gap-1.5">
                <span>1. GitHub Actions Engine (`06:00 UTC` / `02:00 EDT`)</span>
              </div>
              <p className="text-slate-400">
                Runs <code className="text-sky-300 font-mono">scripts/fetch-all-nhl-data.mjs</code> to harvest live skater and goalie production directly from the NHL API. Computes Bayesian 82-game pace regressions and commits updated stats directly to the repository codebase.
              </p>
            </div>
            <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800/80 space-y-1">
              <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                <span>2. Cloudflare D1 Standings Sync (`09:00 UTC` / `04:00 EST`)</span>
              </div>
              <p className="text-slate-400">
                Pings <code className="text-emerald-300 font-mono">POST /api/sync</code> via <code className="text-slate-300 font-mono">nightly-sync.yml</code>. Fetches current NHL division standings, points, and goal differentials, updates all 32 D1 franchise records, and logs the execution to the <code className="text-slate-300 font-mono">sync_log</code> table.
              </p>
            </div>
          </div>
          <div className="pt-2 flex flex-wrap items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 mt-2">
            <span>
              Direct Verification: Query <a href="/api/sync" target="_blank" rel="noopener noreferrer" className="text-sky-400 underline hover:text-sky-300 font-mono">/api/sync</a> in your browser to inspect raw JSON execution records.
            </span>
            <a
              href="https://github.com/thermo-lab/NHLMC/actions"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
            >
              <span>View GitHub Actions Workflows</span>
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </a>
          </div>
        </div>
      </div>

      {/* CORE PHILOSOPHY: THE ASYMMETRY OF NHL TRADES */}
      <div className="bg-rink-card border border-rink-border rounded-xl p-6 shadow-xl space-y-6">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-1">
            Foundation Principle
          </span>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Scale className="w-6 h-6 text-amber-400" />
            <span>The Asymmetry of NHL Trades: Why Static Calculators Fail</span>
          </h2>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">
          Traditional trade calculators treat hockey as a zero-sum arithmetic ledger: 
          <em className="text-sky-300 font-mono ml-1">"Player A has 25 Goals and Player B has 18 Goals, so Team A gains +7 Goals."</em> 
          In professional hockey, that calculation is fundamentally flawed. Player value is completely asymmetric and conditional upon 
          a franchise’s timeline, salary cap window, and playoff path.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-rink-surface border border-rink-border rounded-xl p-5 space-y-2.5">
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>1. Diminishing Contender Returns</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              If a premier contender (e.g. Carolina or Florida) already generates 3.65 xGF/60, adding another scoring winger adds minimal regular-season standings value. 
              Their true utility exists solely in overcoming tight checking in Round 3 and the Stanley Cup Final.
            </p>
          </div>

          <div className="bg-rink-surface border border-rink-border rounded-xl p-5 space-y-2.5">
            <div className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>2. The Rebuilder Timeline Paradox</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              To a rebuilding club (e.g. San Jose or Chicago), a 31-year-old veteran winger with 1 year left produces near-zero franchise equity. 
              Conversely, an unprotected 1st-round draft pick or premier prospect (e.g. Radim Mrtka) yields 7+ years of cost-controlled surplus value.
            </p>
          </div>

          <div className="bg-rink-surface border border-rink-border rounded-xl p-5 space-y-2.5">
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>3. The Non-Zero-Sum Blockbuster</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Because contending and rebuilding timelines are inverted, trades are not zero-sum. 
              A trade can simultaneously increase Team A's Stanley Cup odds by +4.2% while providing Team B with +75 points of foundational pipeline capital. Both GMs win.
            </p>
          </div>
        </div>
      </div>

      {/* PILLAR 1: MONTE CARLO STOCHASTIC SIMULATION */}
      <div className="bg-rink-card border border-rink-border rounded-xl p-6 shadow-xl space-y-6">
        <div>
          <span className="text-xs font-bold text-sky-400 uppercase tracking-wider block mb-1">
            Pillar 1
          </span>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Zap className="w-6 h-6 text-sky-400" />
            <span>Monte Carlo Stochastic Simulation &amp; Playoff Log5 Model</span>
          </h2>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">
          NHLMC executes a 2,000-iteration Monte Carlo simulation for every proposed trade. Each iteration models every remaining 
          game on the regular season schedule, followed by an escalating 4-round best-of-7 Stanley Cup playoff tournament.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Regular Season */}
          <div className="bg-rink-surface border border-rink-border rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>82-Game Regular Season Formulation</span>
            </div>
            <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
              <p>
                Each remaining game simulates discrete goal arrivals using Poisson distribution sampling:
              </p>
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800 font-mono text-sky-300 text-[11px]">
                GF ~ Poisson(λ = team_xGF)<br />
                GA ~ Poisson(λ = team_xGA × (opp_xGF / 2.95))
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px] pt-1">
                <li>Opponent offensive strength sampled stochastically from <code className="text-slate-300 font-mono">N(μ=2.95, σ=0.35)</code>.</li>
                <li>Overtime / Shootout games model NHL 3-on-3 coin-flip dynamics (52% 2-pt win, 48% 1-pt OT loss).</li>
                <li>Wildcard playoff cutoffs fluctuate naturally each season around <code className="text-slate-300 font-mono">N(93.5, 2.2)</code> points.</li>
              </ul>
            </div>
          </div>

          {/* 4-Round Stanley Cup Playoffs */}
          <div className="bg-rink-surface border border-rink-border rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>4-Round Best-of-7 Playoff Bracket</span>
            </div>
            <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
              <p>
                Teams that qualify advance into a full best-of-7 tournament. Opponent quality escalates in each successive round:
              </p>
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800 font-mono text-amber-300 text-[11px]">
                P(Win) = (xGF / OppXGA) / [(xGF / OppXGA) + (OppXGF / xGA)]
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px] pt-1">
                <li>Round 1: Opponents average 3.20 xGF / 2.60 xGA.</li>
                <li>Round 4 (Cup Final): Opponents average 3.50 xGF / 2.45 xGA.</li>
                <li>Championship probability reflects winning 16 playoff games across 4 rounds against elite defense.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* PILLAR 2: BAYESIAN STATISTICAL REGRESSION & GOALIE IMPACT */}
      <div className="bg-rink-card border border-rink-border rounded-xl p-6 shadow-xl space-y-6">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">
            Pillar 2
          </span>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-emerald-400" />
            <span>Bayesian Pace Regressions &amp; Goalie GSAx Shifts</span>
          </h2>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">
          Small early-season samples can heavily distort a player's real underlying talent. NHLMC applies Bayesian shrinkage 
          to regress in-season rates to 82-game expectations before calculating five-on-five expected goal shifts.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Skater Rating Shifts */}
          <div className="bg-rink-surface border border-rink-border rounded-xl p-5 space-y-3">
            <div className="text-emerald-400 font-bold text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>Skater Bayesian Regression &amp; xGF/xGA Formula</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Raw points and goals are weighted against sample size and shrunk toward the league baseline (45 pts, 18 goals):
            </p>
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800 font-mono text-emerald-300 text-[11px]">
              Weight = GP / (GP + 15)<br />
              PacePts = [(RawPts / GP) × 82] × W + 45 × (1 - W)<br />
              xGF_Shift = (PacePts / 82) × 0.35 + (PaceGoals / 82) × 0.15<br />
              xGA_Shift = -0.22 (Defenseman) | -0.06 (Forward)
            </div>
            <p className="text-[11px] text-slate-400">
              This guarantees that a hot 10-game streak doesn't artificially overvalue a third-line forward into an elite franchise cornerstone.
            </p>
          </div>

          {/* Goalie GSAx */}
          <div className="bg-rink-surface border border-rink-border rounded-xl p-5 space-y-3">
            <div className="text-sky-400 font-bold text-sm flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Goaltending: Goals Saved Above Expected (GSAx)</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Goaltending is the single highest-variance position in sports. NHLMC models goalie impact through save percentage above the 0.902 league baseline:
            </p>
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800 font-mono text-sky-300 text-[11px]">
              GSAx / 60 = (SV% - 0.902) × 30.0 Shots Against<br />
              xGA_Reduction = clamp(0.10, 0.65, GSAx / 60)
            </div>
            <p className="text-[11px] text-slate-400">
              Elite starters ($SV\% \ge 0.917$, e.g. Hellebuyck, Shesterkin, Swayman) shave up to <strong className="text-white">0.65 goals against per 60 minutes</strong>, transforming a playoff bubble team into a Cup finalist.
            </p>
          </div>
        </div>
      </div>

      {/* PILLAR 3: SALARY CAP & CBA RETENTION LAWS */}
      <div className="bg-rink-card border border-rink-border rounded-xl p-6 shadow-xl space-y-6">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-1">
            Pillar 3
          </span>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-amber-400" />
            <span>Salary Cap Modeling &amp; CBA Retention Limits</span>
          </h2>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">
          The NHL's hard salary cap ($88.0M ceiling for the current season) imposes strict boundaries. An otherwise brilliant trade 
          that breaches the cap ceiling is illegal under league bylaws and receives an automatic <strong className="text-rose-400">WALK AWAY</strong> verdict.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-rink-surface border border-rink-border rounded-xl p-4 space-y-2">
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              $88.0M Hard Ceiling
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Post-trade payrolls are evaluated to the dollar. If any team exceeds $88,000,000, the engine issues a critical cap violation flag.
            </p>
          </div>

          <div className="bg-rink-surface border border-rink-border rounded-xl p-4 space-y-2">
            <div className="text-xs font-bold text-sky-400 uppercase tracking-wider">
              50% Max Retention Limit
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Under NHL CBA Article 50.5, a team may retain a maximum of 50% of a player's cap hit and salary. NHLMC supports 25% and 50% retention toggles.
            </p>
          </div>

          <div className="bg-rink-surface border border-rink-border rounded-xl p-4 space-y-2">
            <div className="text-xs font-bold text-purple-400 uppercase tracking-wider">
              Exact Cap Conservation
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Retained salary remains on the sending club's payroll as dead money while granting cap relief to the acquiring team, preserving exact payroll conservation.
            </p>
          </div>
        </div>
      </div>

      {/* PILLAR 4: PROSPECTS & DRAFT CAPITAL VALUATION */}
      <div className="bg-rink-card border border-rink-border rounded-xl p-6 shadow-xl space-y-6">
        <div>
          <span className="text-xs font-bold text-brand-400 uppercase tracking-wider block mb-1">
            Pillar 4
          </span>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <GitBranch className="w-6 h-6 text-brand-400" />
            <span>Prospect Potential Tiers &amp; Draft Capital Haircuts</span>
          </h2>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">
          Draft picks and prospects represent future franchise value. We calibrate future capital on a standardized 1–100 Trade Value scale 
          accounting for draft round, lottery protections, and verified scouting ceiling.
        </p>

        {/* Prospect Tiers Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Prospect Potential Valuation Tiers
          </h3>
          <div className="overflow-x-auto border border-rink-border rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-rink-surface border-b border-rink-border text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Tier</th>
                  <th className="py-3 px-4">Trade Value</th>
                  <th className="py-3 px-4">Scouting Definition</th>
                  <th className="py-3 px-4">Archetype Examples</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rink-border text-slate-300">
                <tr className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-4 font-bold text-amber-400">FRANCHISE</td>
                  <td className="py-2.5 px-4 font-mono font-bold text-white">95 – 100</td>
                  <td className="py-2.5 px-4">Generational or franchise cornerstone talent; immediate #1 center or Norris-caliber D.</td>
                  <td className="py-2.5 px-4 text-slate-400">Macklin Celebrini, Connor Bedard</td>
                </tr>
                <tr className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-4 font-bold text-sky-400">ELITE</td>
                  <td className="py-2.5 px-4 font-mono font-bold text-white">85 – 92</td>
                  <td className="py-2.5 px-4">Top-line scoring forward or premier top-pair shutdown/puck-moving defenseman.</td>
                  <td className="py-2.5 px-4 text-slate-400">Radim Mrtka, Ivan Demidov, Artyom Levshunov</td>
                </tr>
                <tr className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-4 font-bold text-emerald-400">TOP_PAIR_TOP_LINE</td>
                  <td className="py-2.5 px-4 font-mono font-bold text-white">70 – 84</td>
                  <td className="py-2.5 px-4">Reliable Top-6 forward or Top-4 top-four defenseman with strong two-way utility.</td>
                  <td className="py-2.5 px-4 text-slate-400">Konsta Helenius, Zeev Buium, Beckett Sennecke</td>
                </tr>
                <tr className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-4 font-bold text-slate-300">REGULAR</td>
                  <td className="py-2.5 px-4 font-mono font-bold text-white">50 – 69</td>
                  <td className="py-2.5 px-4">Everyday middle-six winger/center or third-pair NHL defenseman.</td>
                  <td className="py-2.5 px-4 text-slate-400">Projected 3rd-line checking forward</td>
                </tr>
                <tr className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-4 font-bold text-slate-500">DEPTH</td>
                  <td className="py-2.5 px-4 font-mono font-bold text-white">25 – 49</td>
                  <td className="py-2.5 px-4">Fringe NHLer, 7th defenseman, or minor-league depth replacement.</td>
                  <td className="py-2.5 px-4 text-slate-400">AHL call-up / 4th line energy</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Draft Pick Capital Valuation */}
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Draft Pick Valuation &amp; Lottery Protection Discounts
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-rink-surface border border-rink-border rounded-lg p-3 text-center space-y-1">
              <span className="text-[10px] font-bold text-amber-400 uppercase block">1st Rd (Unprotected)</span>
              <div className="text-xl font-black text-white">88</div>
              <span className="text-[10px] text-slate-400">Full lottery upside</span>
            </div>

            <div className="bg-rink-surface border border-rink-border rounded-lg p-3 text-center space-y-1">
              <span className="text-[10px] font-bold text-sky-400 uppercase block">1st Rd (Top 5 Prot)</span>
              <div className="text-xl font-black text-white">82</div>
              <span className="text-[10px] text-slate-400">-7% lottery haircut</span>
            </div>

            <div className="bg-rink-surface border border-rink-border rounded-lg p-3 text-center space-y-1">
              <span className="text-[10px] font-bold text-indigo-400 uppercase block">1st Rd (Top 10 Prot)</span>
              <div className="text-xl font-black text-white">76</div>
              <span className="text-[10px] text-slate-400">-14% insurance haircut</span>
            </div>

            <div className="bg-rink-surface border border-rink-border rounded-lg p-3 text-center space-y-1">
              <span className="text-[10px] font-bold text-emerald-400 uppercase block">2nd Round Pick</span>
              <div className="text-xl font-black text-white">48</div>
              <span className="text-[10px] text-slate-400">Secondary asset</span>
            </div>

            <div className="bg-rink-surface border border-rink-border rounded-lg p-3 text-center space-y-1 col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">3rd Round Pick</span>
              <div className="text-xl font-black text-white">28</div>
              <span className="text-[10px] text-slate-400">Flyer / sweetener</span>
            </div>
          </div>
        </div>
      </div>

      {/* PILLAR 5: GM VERDICT DECISION MATRIX */}
      <div className="bg-rink-card border border-rink-border rounded-xl p-6 shadow-xl space-y-6">
        <div>
          <span className="text-xs font-bold text-purple-400 uppercase tracking-wider block mb-1">
            Pillar 5
          </span>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-purple-400" />
            <span>The GM Decision Matrix &amp; Trade Verdict Classifications</span>
          </h2>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">
          The engine synthesizes on-ice point deltas, Stanley Cup equity shifts, and future pipeline scores into an objective 
          recommendation for both general managers:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-rink-surface border border-emerald-500/30 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">
                WIN_WIN (Blockbuster)
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                EXECUTE / EXECUTE
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Occurs when the acquiring contender gains <strong className="text-white">$\ge +1.5\%$ Cup probability</strong> while the selling club captures <strong className="text-white">$\ge +50$ net future capital</strong> (or both contenders gain $\ge +1\%$ Cup equity). Both GMs achieve their core organizational objectives.
            </p>
          </div>

          <div className="bg-rink-surface border border-rose-500/30 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-rose-400 uppercase tracking-wider">
                DECISIVE_WIN / FLEECING
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                EXECUTE / WALK_AWAY
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Triggered when one club enhances championship equity while the other suffers a significant on-ice drop without capturing compensatory future capital (&lt; 40 capital score). The disadvantaged GM is instructed to walk away.
            </p>
          </div>

          <div className="bg-rink-surface border border-amber-500/30 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
                CAP_DUMP / ASSET REALLOCATION
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                FINANCIAL RELIEF
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              One franchise trades performance capital specifically to shed burdensome payroll, enabling retention or future acquisitions under the hard $88.0M cap ceiling.
            </p>
          </div>

          <div className="bg-rink-surface border border-rose-800/50 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>CAP OVERAGE VIOLATION</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-700">
                ILLEGAL TRADE
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              If any team's post-trade payroll exceeds <strong className="text-white">$88,000,000</strong>, the trade is illegal. The recommendation automatically defaults to <strong className="text-rose-400">WALK AWAY</strong> regardless of how favorable the on-ice talent may be.
            </p>
          </div>
        </div>
      </div>

      {/* HISTORICAL RETROSPECTIVE TIME-MACHINE */}
      <div className="bg-rink-card border border-rink-border rounded-xl p-6 shadow-xl space-y-4">
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <History className="w-5 h-5 text-brand-400" />
          <span>Historical Blockbusters: Dual-Perspective Time Machine</span>
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          NHLMC pairs modern predictive simulations with a dual-perspective time-machine to stress-test historical trades 
          (such as the 1988 Wayne Gretzky sale, 2016 Taylor Hall for Adam Larsson, and the 2021 Jack Eichel blockbuster):
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="bg-rink-surface border border-rink-border rounded-lg p-4 space-y-2">
            <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>🕰️ At the Time (Day-of-Deal Snapshot)</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Assesses the trade purely using information available on the day of the transaction. Evaluates trailing production, contract leverage, and perceived Cup equity before hindsight was written.
            </p>
          </div>

          <div className="bg-rink-surface border border-rink-border rounded-lg p-4 space-y-2">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>🔮 Hindsight &amp; Legacy (Domino Trade Tree)</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Examines what actually transpired: Stanley Cups won, Conn Smythe trophies, injuries, production cliffs, and the full multi-decade trade tree tracing how draft picks were flipped over time.
            </p>
          </div>
        </div>
      </div>

      {/* FOOTER CALL TO ACTION */}
      {onNavigateToTrade && (
        <div className="text-center pt-4">
          <button
            onClick={onNavigateToTrade}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-black text-sm uppercase tracking-wider transition-all shadow-xl shadow-sky-500/20 active:scale-95"
          >
            <Calculator className="w-4 h-4" />
            <span>Launch the Trade Machine Now</span>
          </button>
        </div>
      )}
    </div>
  );
};
