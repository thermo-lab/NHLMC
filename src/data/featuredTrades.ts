import { FeaturedTradeProposal } from '../types/featured';

export const INITIAL_FEATURED_TRADES: FeaturedTradeProposal[] = [
  {
    id: 'wpg-buf-hellebuyck-blockbuster',
    title: 'Hellebuyck Blockbuster: Jets & Sabres Core Swap',
    headline: 'Connor Hellebuyck & Neal Pionk to Buffalo for Tage Thompson, JJ Peterka, Radim Mrtka & 2027 1st',
    description:
      'Winnipeg re-tools around a dynamic young offensive core featuring Tage Thompson, JJ Peterka, 6\'6" top prospect Radim Mrtka, and a future 1st round pick, while Buffalo secures reigning Vezina Trophy goaltender Connor Hellebuyck to end their playoff drought.',
    tradeUrlParams: 'v=1&tA=WPG&tB=BUF&pA=8476945,8480145&pB=8479420,8482175&prB=buf-radim-mrtka&dpB=buf-2027-rd1',
    teamAId: 'WPG',
    teamBId: 'BUF',
    teamAAssets: {
      playerNames: ['Connor Hellebuyck ($8.5M)', 'Neal Pionk ($6.5M)'],
      playerIds: [353, 342],
    },
    teamBAssets: {
      playerNames: ['Tage Thompson ($7.14M)', 'JJ Peterka ($3.5M)'],
      prospectNames: ['Radim Mrtka (BUF, Top D Prospect)'],
      draftPicks: ['2027 Round 1 (BUF)'],
      playerIds: [358, 62],
      prospectIds: ['buf-radim-mrtka'],
    },
    status: 'PUBLISHED',
    displayOrder: 1,
    createdAt: '2026-10-18T22:00:00Z',
  },
  {
    id: 'edm-bos-draisaitl-swayman-rumor',
    title: 'Edmonton & Boston Blockbuster Speculation',
    headline: 'Leon Draisaitl to Boston for Jeremy Swayman, Fabian Lysell & 2027 1st',
    description:
      'Boston acquires a marquee #1 center to succeed Patrice Bergeron, while Edmonton solves their netminding question mark for the next decade with Jeremy Swayman plus future draft capital.',
    tradeUrlParams: 'v=1&tA=EDM&tB=BOS&pA=8477934&pB=8480280&prB=bos-fabian-lysell&dpB=bos-2027-rd1',
    teamAId: 'EDM',
    teamBId: 'BOS',
    teamAAssets: {
      playerNames: ['Leon Draisaitl ($14.0M)'],
      playerIds: [75],
    },
    teamBAssets: {
      playerNames: ['Jeremy Swayman ($8.25M)'],
      prospectNames: ['Fabian Lysell (BOS, RW)'],
      draftPicks: ['2027 Round 1 (BOS)'],
      playerIds: [70],
      prospectIds: ['bos-fabian-lysell'],
    },
    status: 'PUBLISHED',
    displayOrder: 2,
    createdAt: '2026-10-18T22:00:00Z',
  },
  {
    id: 'tor-cgy-nylander-huberdeau-shakeup',
    title: 'Maple Leafs & Flames Superstar Shakeup',
    headline: 'William Nylander to Calgary for Jonathan Huberdeau, Matt Coronato & 2027 1st',
    description:
      'Calgary brings dynamic offensive engine William Nylander to Alberta, while Toronto retools their wing depth with playmaking veteran Jonathan Huberdeau, Matt Coronato, and future 1st round draft capital.',
    tradeUrlParams: 'v=1&tA=TOR&tB=CGY&pA=8477939&pB=8476456,8482679&prB=cgy-matt-coronato&dpB=cgy-2027-rd1',
    teamAId: 'TOR',
    teamBId: 'CGY',
    teamAAssets: {
      playerNames: ['William Nylander ($11.5M)'],
      playerIds: [588],
    },
    teamBAssets: {
      playerNames: ['Jonathan Huberdeau ($10.5M)', 'Matt Coronato ($3.5M)'],
      prospectNames: ['Matt Coronato (CGY, RW)'],
      draftPicks: ['2027 Round 1 (CGY)'],
      playerIds: [807, 795],
      prospectIds: ['cgy-matt-coronato'],
    },
    status: 'PUBLISHED',
    displayOrder: 3,
    createdAt: '2026-10-18T22:00:00Z',
  },
];
