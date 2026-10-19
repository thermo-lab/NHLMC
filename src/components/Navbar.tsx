import React from 'react';
import {
  Sparkles,
  Shield,
  Search,
  BookOpen,
  History,
  ShieldCheck,
  Building2,
  Trophy,
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'trade' | 'historical' | 'teams' | 'players' | 'guide';
  setActiveTab: (tab: 'trade' | 'historical' | 'teams' | 'players' | 'guide') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <header className="border-b border-rink-border bg-[#080C14]/95 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          {/* Brand & Subtitle */}
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-gradient-to-tr from-sky-600 via-blue-500 to-cyan-300 p-0.5 shadow-md shadow-sky-950/50 flex items-center justify-center shrink-0">
                <span className="font-black text-black text-xs sm:text-sm tracking-tighter">NHL</span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-1.5">
                  <span className="font-black text-base sm:text-lg tracking-tight text-white shrink-0">
                    NHL<span className="text-sky-400">MC</span>
                  </span>
                  <span className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded uppercase">
                    Franchise Engine
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 truncate max-w-[140px] xs:max-w-[200px] sm:max-w-none">
                  National Hockey League Trade Machine & Retrospectives
                </div>
              </div>
            </div>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden md:flex items-center space-x-1 pl-4 border-l border-rink-border">
              <button
                onClick={() => setActiveTab('trade')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'trade'
                    ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Trade Machine</span>
              </button>

              <button
                onClick={() => setActiveTab('historical')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'historical'
                    ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <History className="w-4 h-4 text-brand-400" />
                <span>Historical Blockbusters</span>
              </button>

              <button
                onClick={() => setActiveTab('teams')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'teams'
                    ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Building2 className="w-4 h-4 text-sky-400" />
                <span>32 Teams & Payroll</span>
              </button>

              <button
                onClick={() => setActiveTab('players')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'players'
                    ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Search className="w-4 h-4" />
                <span>Player Directory</span>
              </button>

              <button
                onClick={() => setActiveTab('guide')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'guide'
                    ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Analytics Guide</span>
              </button>
            </nav>
          </div>

          {/* Right Status Badges */}
          <div className="flex items-center space-x-2 shrink-0">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-[11px] font-mono text-slate-300">
              <span className="text-emerald-400 font-bold">$88.0M</span>
              <span className="text-slate-500">Cap Ceiling</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-sky-950/40 border border-sky-800/40 text-[11px] font-mono text-sky-300 shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="hidden xs:inline">Official NHL API</span>
              <span className="xs:hidden">NHL API</span>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center border-t border-rink-border py-2 overflow-x-auto space-x-1 max-w-full">
          <button
            onClick={() => setActiveTab('trade')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap shrink-0 ${
              activeTab === 'trade'
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                : 'text-slate-400'
            }`}
          >
            <Trophy className="w-3 h-3 text-amber-400" />
            <span>Trade Machine</span>
          </button>
          <button
            onClick={() => setActiveTab('historical')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap shrink-0 ${
              activeTab === 'historical'
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                : 'text-slate-400'
            }`}
          >
            <History className="w-3 h-3 text-brand-400" />
            <span>Historical</span>
          </button>
          <button
            onClick={() => setActiveTab('teams')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap shrink-0 ${
              activeTab === 'teams'
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                : 'text-slate-400'
            }`}
          >
            <Building2 className="w-3 h-3 text-sky-400" />
            <span>Teams</span>
          </button>
          <button
            onClick={() => setActiveTab('players')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap shrink-0 ${
              activeTab === 'players'
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                : 'text-slate-400'
            }`}
          >
            <Search className="w-3 h-3" />
            <span>Players</span>
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap shrink-0 ${
              activeTab === 'guide'
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                : 'text-slate-400'
            }`}
          >
            <BookOpen className="w-3 h-3" />
            <span>Guide</span>
          </button>
        </div>
      </div>
    </header>
  );
};
