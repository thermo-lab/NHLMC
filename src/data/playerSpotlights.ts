import { PlayerSpotlight } from '../types/spotlight';

export const INITIAL_PLAYER_SPOTLIGHT: PlayerSpotlight = {
  id: 'hellebuyck-trade-block-2026',
  playerId: 8476945,
  playerName: 'Connor Hellebuyck',
  currentTeamId: 'WPG',
  currentTeamName: 'Winnipeg Jets',
  position: 'Goaltender',
  jerseyNumber: '#37',
  age: 31,
  capHit: 8500000,
  contractDetails: '7 Years remaining @ $8.50M AAV (Signed through 2030-31)',
  accolades: [
    '2× Vezina Trophy Winner (2020, 2024)',
    'Hart Memorial Trophy Finalist',
    'William M. Jennings Trophy',
    '4× NHL All-Star',
  ],
  headshotUrl: 'https://assets.nhle.com/mugs/nhl/latest/8476945.png',
  badgeText: 'Blockbuster Trade Spotlight',
  headline: 'Franchise Crossroads: Why Connor Hellebuyck Has To Move',
  editorialStoryline:
    'Despite posting back-to-back world-class regular seasons, Winnipeg has suffered consecutive first-round playoff exits while averaging under 2.4 goals per game in postseason action. With Hellebuyck in his prime at age 31 and signed to a franchise-record $8.5M cap commitment through 2031, Winnipeg faces an agonizing dilemma: ride out low-event playoff stalemates or cash in their franchise cornerstone for a historic offensive haul and replenish their timeline.',
  isActive: true,
  options: [
    {
      id: 'opt-buf-retool',
      destinationTeamId: 'BUF',
      destinationTeamName: 'Buffalo Sabres',
      title: 'The Core Retool',
      subtitle: 'End the 14-Year Playoff Drought',
      pitch:
        'Buffalo possesses the NHL\'s deepest pool of young offensive talent and draft equity, but desperately needs a proven Vezina-caliber anchor to stabilize their net. Winnipeg solves their scoring woes by landing 6\'6" center Tage Thompson and dynamic winger JJ Peterka.',
      tradeUrlParams:
        'v=1&tA=WPG&tB=BUF&pA=8476945,8480145&pB=8479420,8482175&prB=buf-radim-mrtka&dpB=buf-2028-rd1',
      wpgReceives: [
        'Tage Thompson ($7.14M AAV)',
        'JJ Peterka ($3.50M AAV)',
        'Radim Mrtka (6\'6" Top D Prospect)',
        '2028 1st Round Pick (BUF - Top 10 Protected)',
      ],
      wpgSurrenders: [
        'Connor Hellebuyck ($8.50M AAV)',
        'Neal Pionk ($6.50M AAV)',
      ],
      capFitSummary:
        'Buffalo absorbs +$4.36M in active cap payroll, remaining fully cap compliant under the $88.0M ceiling.',
      projectedCupDeltaWinnipeg: '-0.4% (Immediate retool with long-term offensive core)',
      projectedCupDeltaDestination: '+6.8% (Buffalo vaults directly into Eastern playoff seed)',
    },
    {
      id: 'opt-car-contender',
      destinationTeamId: 'CAR',
      destinationTeamName: 'Carolina Hurricanes',
      title: 'The Missing Championship Piece',
      subtitle: 'Solve Carolina’s Perpetual Goaltending Question',
      pitch:
        'Carolina regularly dominates 5v5 expected goals metrics across the league, but has repeatedly been undone in the Eastern Conference Finals by untimely playoff soft goals. Hellebuyck turns Rod Brind\'Amour\'s squad into the undisputed Stanley Cup favorite.',
      tradeUrlParams:
        'v=1&tA=WPG&tB=CAR&pA=8476945&pB=8478427&prB=car-alexander-nikishin&dpB=car-2028-rd1-unprot,car-2028-rd2&rets=8476945:25',
      wpgReceives: [
        'Sebastian Aho ($9.75M AAV Elite #1 Center)',
        'Alexander Nikishin (Premier KHL Defenseman Prospect)',
        '2028 1st Round Pick (CAR - Unprotected)',
        '2028 2nd Round Pick (CAR)',
      ],
      wpgSurrenders: [
        'Connor Hellebuyck ($8.50M with 25% salary retained by WPG $\\to$ $6.38M net to CAR)',
      ],
      capFitSummary:
        'Winnipeg retains 25% ($2.125M) of Hellebuyck\'s salary, enabling Carolina to absorb his cap hit seamlessly.',
      projectedCupDeltaWinnipeg: '+1.1% (Massive upgrade at 1C with high-end draft capital)',
      projectedCupDeltaDestination: '+8.2% (Eliminates Carolina’s lone playoff vulnerability)',
    },
    {
      id: 'opt-det-accelerator',
      destinationTeamId: 'DET',
      destinationTeamName: 'Detroit Red Wings',
      title: 'The Yzerplan Fast-Forward',
      subtitle: 'Accelerate Detroit’s Contention Window',
      pitch:
        'Steve Yzerman has accumulated an enviable farm system of blue-chip defensive prospects, but the Red Wings have plateaued on the playoff bubble. Hellebuyck provides an immediate top-3 world netminder to anchor Detroit alongside Moritz Seider.',
      tradeUrlParams:
        'v=1&tA=WPG&tB=DET&pA=8476945&pB=8481542&prB=det-axel-sandin-pellikka,det-nate-danielson&dpB=det-2028-rd1-top5',
      wpgReceives: [
        'Moritz Seider ($8.55M AAV Calder Winner)',
        'Axel Sandin-Pellikka (Elite SHL Puck-Moving D)',
        'Nate Danielson (Top-6 200ft Center Prospect)',
        '2028 1st Round Pick (DET - Top 5 Protected)',
      ],
      wpgSurrenders: [
        'Connor Hellebuyck ($8.50M AAV)',
      ],
      capFitSummary:
        'Direct 1-for-1 salary balance: Hellebuyck ($8.5M) for Seider ($8.55M). Pure cap neutral blockbuster.',
      projectedCupDeltaWinnipeg: '+0.2% (Establishes an impenetrable young defensive spine)',
      projectedCupDeltaDestination: '+5.5% (Detroit clinches Wild Card contention tier)',
    },
    {
      id: 'opt-njd-powerhouse',
      destinationTeamId: 'NJD',
      destinationTeamName: 'New Jersey Devils',
      title: 'The Metropolitan Heavyweight',
      subtitle: 'Lock Down New Jersey’s Championship Window',
      pitch:
        'The Devils boast high-octane offensive superstars in Jack Hughes, Nico Hischier, and Jesper Bratt, but inconsistent netminding has stalled their deep playoff aspirations. Landing Hellebuyck gives GM Tom Fitzgerald the final piece to dominate the Metro Division.',
      tradeUrlParams:
        'v=1&tA=WPG&tB=NJD&pA=8476945&prB=njd-anton-silayev&dpB=njd-2028-rd1,njd-2028-rd3',
      wpgReceives: [
        'Anton Silayev (6\'7" #10 Overall Defensive Anchor)',
        '2028 1st Round Pick (NJD)',
        '2028 3rd Round Pick (NJD)',
      ],
      wpgSurrenders: [
        'Connor Hellebuyck ($8.50M AAV)',
      ],
      capFitSummary:
        'New Jersey leverages $6.45M in existing cap space plus LTIR flexibility to absorb Hellebuyck.',
      projectedCupDeltaWinnipeg: '-0.8% (Massive injection of +104 future pipeline equity)',
      projectedCupDeltaDestination: '+7.4% (Transforms Devils into East juggernaut)',
    },
  ],
};
