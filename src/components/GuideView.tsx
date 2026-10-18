import React from 'react';
import {
  HelpCircle,
  TrendingUp,
  AlertTriangle,
  History,
  Zap,
  Shield,
  Trophy,
  GitBranch,
} from 'lucide-react';

export const GuideView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Hero Guide Banner */}
      <div className="bg-rink-card border border-rink-border rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold mb-2 inline-flex">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>NHLMC Manager & Retrospective Guide</span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">
          Why Monte Carlo Simulation Outperforms Static Trade Calculators
        </h1>
        <p className="text-slate-300 text-sm mt-2 leading-relaxed">
          Traditional trade calculators simply add up rest-of-season projections: <br />
          <em className="text-sky-300 font-mono">"Player A has 25 Goals and Player B has 18 Goals, so you gain +7 Goals."</em><br />
          In competitive hockey leagues—especially Rotisserie (Roto) and Category leagues—that calculation is dangerously misleading.
        </p>
      </div>

      {/* 3 Core Analytical Traps in Hockey */}
      <div className="space-y-4">
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          <span>The Three Flaws of Static Trade Calculators</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-rink-surface border border-rink-border rounded-xl p-4 space-y-2">
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              1. The Category Surplus Trap
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              If your fantasy roster is already 35 Goals ahead of 2nd place, acquiring 15 more Goals earns you <strong>zero</strong> extra standings points. You sacrificed assets for stats you couldn't monetize.
            </p>
          </div>

          <div className="bg-rink-surface border border-rink-border rounded-xl p-4 space-y-2">
            <div className="text-xs font-bold text-sky-400 uppercase tracking-wider">
              2. Peripheral Standings Cliffs
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Categories like <strong>Hits (HIT)</strong>, <strong>Blocked Shots (BLK)</strong>, and <strong>Shots on Goal (SOG)</strong> often cluster tightly. Acquiring a banger defenseman can leapfrog your team 3 to 4 whole points in the standings overnight.
            </p>
          </div>

          <div className="bg-rink-surface border border-rink-border rounded-xl p-4 space-y-2">
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              3. The Goalie Volatility Paradox
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Goaltending is the most volatile position in fantasy sports. Small sample cold streaks can tank your GAA and SV%. Monte Carlo simulation models this distribution of outcomes instead of assuming flat averages.
            </p>
          </div>
        </div>
      </div>

      {/* Historical Retrospective Feature */}
      <div className="bg-rink-card border border-rink-border rounded-xl p-6 shadow-xl space-y-4">
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <History className="w-5 h-5 text-brand-400" />
          <span>Analyzing Historical Blockbusters: The Time-Machine Lens</span>
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          NHLMC includes a dual-perspective time-machine to stress-test historical trades:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="bg-rink-surface border border-rink-border rounded-lg p-4 space-y-2">
            <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>🕰️ At the Time (Snapshot Mode)</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Examines the trade solely with the information available on the day of the handshake. Review player stats leading up to the deal, contract demands, and the immediate perceived Stanley Cup odds.
            </p>
          </div>

          <div className="bg-rink-surface border border-rink-border rounded-lg p-4 space-y-2">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>🔮 Hindsight & Legacy (After Mode)</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Shows what actually unfolded: championships won, individual hardware (Conn Smythe, Hart, Norris), catastrophic production declines, and the full <strong>Domino Trade Tree</strong> showing how draft picks and subsequent trades evolved.
            </p>
          </div>
        </div>
      </div>

      {/* Mathematical Engine Formulation */}
      <div className="bg-rink-card border border-rink-border rounded-xl p-6 shadow-xl space-y-4">
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-brand-400" />
          <span>Stochastic Engine Methodology</span>
        </h2>

        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <div>
            <strong className="text-white">Discrete Event Counting Stats (Poisson Sampling):</strong>
            <p className="text-slate-400 mt-0.5">
              Goals, Assists, Power Play Points, Shots, Hits, Blocks, PIM, Goalie Wins, and Shutouts are modeled as discrete Poisson arrivals:
              <code className="text-sky-300 font-mono ml-1">P(k) = (λ^k * e^(-λ)) / k!</code>
              where λ is the player's rest-of-season expected rate scaled by health and playing time shocks.
            </p>
          </div>

          <div>
            <strong className="text-white">Goalie Rate Metrics (Beta-Binomial & Normal Sampling):</strong>
            <p className="text-slate-400 mt-0.5">
              Save Percentage (SV%) and Goals Against Average (GAA) fluctuate according to shots faced:
              <code className="text-sky-300 font-mono ml-1">σ² = (p * (1 - p)) / n</code>
              modeling the exact variance of facing 30 shots per game across rest-of-season starts.
            </p>
          </div>

          <div>
            <strong className="text-white">Value-at-Risk Percentiles (Floor / Median / Ceiling):</strong>
            <p className="text-slate-400 mt-0.5">
              By simulating thousands of seasons, NHLMC extracts your 10th percentile floor (unlucky slumps/injuries) and 90th percentile ceiling (championship run), giving you true asymmetric risk analysis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
