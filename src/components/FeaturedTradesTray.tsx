import React, { useState } from 'react';
import { Flame, Sparkles, ChevronRight, ArrowRightLeft } from 'lucide-react';
import { FeaturedTradeProposal } from '../types/featured';

interface FeaturedTradesTrayProps {
  proposals: FeaturedTradeProposal[];
  onSelectProposal: (proposal: FeaturedTradeProposal) => void;
  activeProposalId?: string | null;
}

export const FeaturedTradesTray: React.FC<FeaturedTradesTrayProps> = ({
  proposals,
  onSelectProposal,
  activeProposalId,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  if (!proposals || proposals.length === 0) return null;

  return (
    <div className="mb-6 rounded-2xl bg-gradient-to-r from-sky-950/40 via-slate-900/60 to-purple-950/40 border border-sky-800/40 p-4 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
            <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              Featured Blockbusters &amp; Rumor Proposals
            </h3>
            <p className="text-xs text-slate-400">
              Select an editorial trade proposal to instantly simulate its Monte Carlo playoff and salary cap impact.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-slate-400 hover:text-white transition px-2 py-1 rounded bg-slate-800/60 border border-slate-700/50"
        >
          {isExpanded ? 'Collapse' : 'Show All'}
        </button>
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {proposals.map((item) => {
            const isSelected = activeProposalId === item.id;
            return (
              <div
                key={item.id}
                onClick={() => onSelectProposal(item)}
                className={`group cursor-pointer text-left p-3.5 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-sky-950/80 border-sky-400 shadow-md shadow-sky-500/20 ring-1 ring-sky-400'
                    : 'bg-slate-900/80 hover:bg-slate-800/80 border-slate-800 hover:border-sky-500/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="font-bold text-white group-hover:text-sky-300 transition flex items-center gap-1.5">
                      <span className="text-xs px-1.5 py-0.5 rounded bg-slate-800 font-mono text-sky-400 border border-slate-700">
                        {item.teamAId}
                      </span>
                      <ArrowRightLeft className="w-3 h-3 text-slate-500" />
                      <span className="text-xs px-1.5 py-0.5 rounded bg-slate-800 font-mono text-sky-400 border border-slate-700">
                        {item.teamBId}
                      </span>
                    </span>
                    <span className="text-[11px] text-amber-400/90 font-medium flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Featured
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-100 group-hover:text-sky-200 line-clamp-1 mb-1">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {item.headline || item.description}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 truncate max-w-[170px]">
                    {item.teamBAssets.playerNames?.[0] || 'Multi-asset trade'}
                  </span>
                  <span className="text-sky-400 group-hover:translate-x-0.5 transition flex items-center font-semibold">
                    Simulate <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
