import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { FranchiseTradeMachine } from './components/FranchiseTradeMachine';
import { HistoricalTradeAnalyzer } from './components/HistoricalTradeAnalyzer';
import { TeamsHub } from './components/TeamsHub';
import { PlayerBrowser } from './components/PlayerBrowser';
import { GuideView } from './components/GuideView';
import { AdminPortal } from './components/AdminPortal';
import { NHL_FRANCHISES } from './data/nhlFranchises';
import { INITIAL_PLAYERS } from './data/sampleLeague';
import { INITIAL_PROSPECTS } from './data/nhlProspects';
import { NHLProspect } from './types/prospect';
import { fetchFranchises, fetchPlayers, fetchProspects, saveProspectToD1 } from './services/api';

export function App() {
  const [activeTab, setActiveTab] = useState<'trade' | 'historical' | 'teams' | 'players' | 'guide' | 'admin'>('trade');
  const [franchises, setFranchises] = useState(NHL_FRANCHISES);
  const [players, setPlayers] = useState(INITIAL_PLAYERS);
  const [prospects, setProspects] = useState<NHLProspect[]>(INITIAL_PROSPECTS);
  const [selectedTradeTeamAId, setSelectedTradeTeamAId] = useState<string>('EDM');
  const [initialTradeParams, setInitialTradeParams] = useState<string>('');

  // Check URL query parameters on initial page load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const search = window.location.search;
      const params = new URLSearchParams(search);
      if (params.has('tA') || params.has('v') || params.has('pA') || params.has('pB')) {
        setInitialTradeParams(search);
        setActiveTab('trade');
      } else if (params.has('trade') || params.get('tab') === 'historical') {
        setActiveTab('historical');
      } else if (
        params.get('tab') === 'admin' ||
        params.has('admin') ||
        window.location.hash === '#admin' ||
        window.location.pathname.startsWith('/admin')
      ) {
        setActiveTab('admin');
      }

      const handleHashChange = () => {
        if (window.location.hash === '#admin') {
          setActiveTab('admin');
        }
      };
      window.addEventListener('hashchange', handleHashChange);
      return () => window.removeEventListener('hashchange', handleHashChange);
    }
  }, []);

  // Background hydration from Cloudflare D1
  useEffect(() => {
    fetchFranchises().then((f) => {
      if (f && f.length > 0) setFranchises(f);
    });
    fetchPlayers().then((p) => {
      if (p && p.length > 0) setPlayers(p);
    });
    fetchProspects().then((pr) => {
      if (pr && pr.length > 0) setProspects(pr);
    });
  }, []);

  const handleSelectTeamForTrade = (teamId: string) => {
    setSelectedTradeTeamAId(teamId);
    setActiveTab('trade');
  };

  const handleCreateProspect = (newProspect: NHLProspect) => {
    setProspects((prev) => [newProspect, ...prev]);
    saveProspectToD1(newProspect);
  };

  const handleLoadTradeIntoMachine = (paramsString: string) => {
    let clean = paramsString;
    if (clean.includes('?')) clean = clean.split('?')[1];
    setInitialTradeParams(`?${clean}`);
    setActiveTab('trade');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080C14] text-slate-100 selection:bg-sky-500 selection:text-black overflow-x-hidden w-full max-w-full">
      {/* Top Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6">
        {activeTab === 'trade' && (
          <FranchiseTradeMachine
            franchises={franchises}
            players={players}
            prospects={prospects}
            onCreateProspect={handleCreateProspect}
            initialTeamAId={selectedTradeTeamAId}
            initialTradeParams={initialTradeParams}
          />
        )}

        {activeTab === 'historical' && (
          <HistoricalTradeAnalyzer />
        )}

        {activeTab === 'teams' && (
          <TeamsHub
            franchises={franchises}
            players={players}
            onSelectTeamForTrade={handleSelectTeamForTrade}
          />
        )}

        {activeTab === 'players' && (
          <PlayerBrowser
            players={players}
            prospects={prospects}
            onCreateProspect={handleCreateProspect}
          />
        )}

        {activeTab === 'guide' && (
          <GuideView />
        )}

        {activeTab === 'admin' && (
          <AdminPortal
            players={players}
            prospects={prospects}
            onLoadTradeIntoMachine={handleLoadTradeIntoMachine}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-rink-border/60 py-6 text-center text-xs text-slate-500 bg-[#060910]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setActiveTab('trade');
                if (typeof window !== 'undefined') {
                  if (window.location.search || window.location.hash) {
                    window.history.pushState({}, '', window.location.pathname);
                  }
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="font-bold text-slate-300 hover:text-sky-400 transition-colors cursor-pointer"
              title="Return to Home (Trade Machine)"
            >
              NHLMC
            </button>
            <span>•</span>
            <span>National Hockey League Monte Carlo &amp; Historical Retrospective Engine</span>
          </div>
          <div className="text-[11px] text-slate-600">
            <span>Official NHL statistics via NHL Web API. Simulates regular season points, $88M salary cap, and Stanley Cup odds.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
