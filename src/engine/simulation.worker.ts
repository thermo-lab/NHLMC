import { runMonteCarloSimulation } from './simulationEngine';
import { FantasyLeague } from '../types/league';
import { Player } from '../types/player';
import { SimulationConfig, TradeProposal } from '../types/simulation';

export interface WorkerInputMessage {
  type: 'RUN_SIMULATION';
  league: FantasyLeague;
  players: Player[];
  tradeProposal: TradeProposal;
  config: SimulationConfig;
}

self.onmessage = (event: MessageEvent<WorkerInputMessage>) => {
  const { type, league, players, tradeProposal, config } = event.data;

  if (type === 'RUN_SIMULATION') {
    try {
      const result = runMonteCarloSimulation(league, players, tradeProposal, config);
      self.postMessage({ type: 'SIMULATION_SUCCESS', result });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      self.postMessage({ type: 'SIMULATION_ERROR', error: message });
    }
  }
};
