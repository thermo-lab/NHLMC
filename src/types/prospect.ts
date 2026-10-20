export type ProspectPotential =
  | 'FRANCHISE' // Generational / Franchise Cornerstone (e.g. Celebrini, Bedard)
  | 'ELITE' // Elite Top-Line / Top-Pair (e.g. Radim Mrtka, Ivan Demidov, Artyom Levshunov)
  | 'TOP_PAIR_TOP_LINE' // Solid Top-4 D / Top-6 Forward (e.g. Konsta Helenius, Zeev Buium)
  | 'REGULAR' // Mid-lineup NHL regular
  | 'DEPTH'; // Depth / fringe NHLer

export interface NHLProspect {
  id: string; // e.g. "buf-radim-mrtka"
  name: string; // "Radim Mrtka"
  nhlTeam: string; // "BUF"
  position: 'D' | 'C' | 'LW' | 'RW' | 'G';
  age: number; // e.g. 19
  height: string; // "6'6\""
  weight: number; // 218 lbs
  shootsCatches: 'R' | 'L';
  currentTeam: string; // "Rochester Americans (AHL) / Seattle Thunderbirds (WHL)"
  draftInfo: string; // "2025 Round 1, #9 Overall (BUF)"
  draftYear: number;
  draftRound: number;
  draftPickOverall?: number;
  potential: ProspectPotential;
  potentialDescription: string;
  scoutingSummary: string;
  tradeValueScore: number; // 1-100 relative asset value
  capHit: number; // Typically 950000 on ELC
  headshotUrl?: string;
  isCustom?: boolean;
}

export interface DraftPick {
  id: string; // e.g. "buf-2027-rd1"
  year: number; // 2027, 2028, 2029, 2030
  round: 1 | 2 | 3;
  owningTeamId: string; // "BUF"
  originalTeamId: string; // "BUF"
  protection: 'UNPROTECTED' | 'TOP_10_PROTECTED' | 'TOP_5_PROTECTED' | 'CONDITIONAL';
  conditionNote?: string;
  tradeValueScore: number; // 1-100 relative asset value
}
