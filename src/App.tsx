import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { FranchiseTradeMachine } from './components/FranchiseTradeMachine';
import { HistoricalTradeAnalyzer } from './components/HistoricalTradeAnalyzer';
import { TeamsHub } from './components/TeamsHub';
import { PlayerBrowser } from './components/PlayerBrowser';
import { GuideView } from './components/GuideView';
import { NHL_FRANCHISES } from './data/nhlFranchises';
import { INITIAL_PLAYERS } from './data/sampleLeague';

export function App() {
  const [activeTab, setActiveTab] = useState<'trade' | 'historical' | 'teams' | 'players' | 'guide'>('trade');
  const [franchises, setFranchises] = useState(NHL_FRANCHISES);
  const [players, setPlayers] = useState(INITIAL_PLAYERS);

  return (
    <div className="min-h-screen flex flex-col bg-[#080C14] text-slate-100 selection:bg-sky-500 selection:text-black">
      {/* Top Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6">
        {activeTab === 'trade' && (
          <FranchiseTradeMachine
            franchises={franchises}
            players={players}
          />
        )}

        {activeTab === 'historical' && (
          <HistoricalTradeAnalyzer />
        )}

        {activeTab === 'teams' && (
          <TeamsHub
            franchises={franchises}
            players={players}
            onSelectTeamForTrade={() => setActiveTab('trade')}
          />
        )}

        {activeTab === 'players' && (
          <PlayerBrowser players={players} />
        )}

        {activeTab === 'guide' && (
          <GuideView />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-rink-border/60 py-6 text-center text-xs text-slate-500 bg-[#060910]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-300">NHLMC</span>
            <span>•</span>
            <span>National Hockey League Monte Carlo & Historical Retrospective Engine</span>
          </div>
          <div className="text-[11px] text-slate-600">
            Official NHL statistics provided via NHL Web API. Simulates regular season points, \$88M salary cap, and Stanley Cup odds.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
