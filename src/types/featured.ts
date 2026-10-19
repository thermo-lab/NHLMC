export interface FeaturedTradeAssetSummary {
  playerIds?: number[];
  playerNames?: string[];
  prospectIds?: string[];
  prospectNames?: string[];
  draftPicks?: string[];
}

export interface FeaturedTradeProposal {
  id: string;
  title: string;
  headline: string;
  description: string;
  tradeUrlParams: string; // e.g. "v=1&tA=WPG&tB=BUF&pA=8476883,8477465&pB=8479420,8482149&prB=buf-radim-mrtka&dpB=buf-2027-rd1"
  teamAId: string;
  teamBId: string;
  teamAAssets: FeaturedTradeAssetSummary;
  teamBAssets: FeaturedTradeAssetSummary;
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  displayOrder: number;
  createdAt: string;
  updatedAt?: string;
}
