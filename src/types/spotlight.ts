export interface SpotlightTradeOption {
  id: string;
  destinationTeamId: string; // e.g. "BUF"
  destinationTeamName: string; // e.g. "Buffalo Sabres"
  title: string; // e.g. "The Core Retool"
  subtitle: string; // e.g. "End the 14-year playoff drought"
  pitch: string; // Editorial narrative
  tradeUrlParams: string; // Fully hydrated URL params
  wpgReceives: string[]; // ['Tage Thompson ($7.14M)', 'JJ Peterka ($3.5M)', "Radim Mrtka (6'6\" D)", '2028 1st (Top 10 Prot)']
  wpgSurrenders: string[]; // ['Connor Hellebuyck ($8.5M)', 'Neal Pionk ($6.5M)']
  capFitSummary: string; // Cap space impact breakdown
  projectedCupDeltaWinnipeg: string; // e.g. "-1.2%"
  projectedCupDeltaDestination: string; // e.g. "+5.4%"
}

export interface PlayerSpotlight {
  id: string;
  playerId: number;
  playerName: string;
  currentTeamId: string;
  currentTeamName: string;
  position: string;
  jerseyNumber: string;
  age: number;
  capHit: number;
  contractDetails: string;
  accolades: string[];
  headshotUrl: string;
  badgeText: string;
  headline: string;
  editorialStoryline: string;
  options: SpotlightTradeOption[];
  isActive: boolean;
  updatedAt?: string;
}
