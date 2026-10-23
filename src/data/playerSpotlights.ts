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
    'After completely missing the 2026 Stanley Cup Playoffs in a brutally competitive Central Division, Winnipeg’s championship window has officially slammed shut. With Hellebuyck now 31 years old and committed to an $8.5M cap hit through 2031, keeping a generational netminder on a retooling roster is an unsustainable luxury. Winnipeg faces an inevitable mandate: cash in their franchise cornerstone for a historic haul of blue-chip youth, top-line scoring, and premium draft equity to ignite the next era.',
  isActive: true,
  options: [
    {
      id: 'opt-buf-championship',
      destinationTeamId: 'BUF',
      destinationTeamName: 'Buffalo Sabres',
      title: 'The Championship Leap',
      subtitle: 'From Game 7 Heartbreak to Stanley Cup Favorite',
      pitch:
        'Coming off an electric playoff run where they eliminated Boston in six games and pushed Montreal to the brink in Game 7 of Round 2, Buffalo proved their core is ready to win right now. Surrendering dynamic two-way center Ryan McLeod, 6\'6" top blueliner Radim Mrtka, and a 2028 1st round pick lands the two-time Vezina winner to finish the job.',
      tradeUrlParams:
        'v=1&tA=WPG&tB=BUF&pA=8476945&pB=8480802&prB=buf-radim-mrtka&dpB=buf-2028-rd1',
      wpgReceives: [
        'Ryan McLeod ($3.50M AAV)',
        'Radim Mrtka (6\'6" Top D Prospect)',
        '2028 1st Round Pick (BUF - Top 10 Protected)',
      ],
      wpgSurrenders: [
        'Connor Hellebuyck ($8.50M AAV)',
      ],
      capFitSummary:
        'Buffalo absorbs net +$5.00M in salary commitment ($8.50M Hellebuyck vs $3.50M McLeod outgoing), remaining safely cap compliant under the $88.0M ceiling.',
      projectedCupDeltaWinnipeg: '+0.2% (Acquires dynamic 2-way C McLeod, 6\'6" D Radim Mrtka, and 2028 1st)',
      projectedCupDeltaDestination: '+0.2% (Crease stabilization boosts Buffalo into Eastern playoff race)',
    },
    {
      id: 'opt-car-contender',
      destinationTeamId: 'CAR',
      destinationTeamName: 'Carolina Hurricanes',
      title: 'The Dynasty Repeat',
      subtitle: 'Solidify the Reigning Champions’ Throne',
      pitch:
        'Fresh off lifting the 2026 Stanley Cup in dominant fashion, the Hurricanes are primed to build a modern NHL dynasty. While their crease battled bravely through the championship run, landing a two-time Vezina winner like Hellebuyck provides Rod Brind\'Amour with an impenetrable fortress to mount a historic back-to-back title defense.',
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
      projectedCupDeltaWinnipeg: '+0.8% (Massive injection of 1C Sebastian Aho, elite prospect Nikishin, and 1st round pick)',
      projectedCupDeltaDestination: '-5.9% (Surrendering 1C Sebastian Aho creates major scoring vacuum despite netminding upgrade)',
    },
    {
      id: 'opt-det-accelerator',
      destinationTeamId: 'DET',
      destinationTeamName: 'Detroit Red Wings',
      title: 'The Yzerplan Fast-Forward',
      subtitle: 'Stop Watching Atlantic Rivals Pull Away',
      pitch:
        'While Atlantic rivals Buffalo (Game 7, Round 2) and Montreal (Eastern Conference Finals) made electric playoff runs last spring, Steve Yzerman\'s Red Wings were left watching from home. Detroit\'s deep prospect pool means nothing if they remain perpetually on the outside looking in—Hellebuyck provides the world-class anchor needed to vault into contention immediately.',
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
      projectedCupDeltaWinnipeg: '+0.4% (Establishes an impenetrable young defensive spine with Seider, Sandin-Pellikka, Danielson)',
      projectedCupDeltaDestination: '0.0% (Detroit locks in franchise netminder for future window; +0.2 pts in 2026-27)',
    },
    {
      id: 'opt-njd-powerhouse',
      destinationTeamId: 'NJD',
      destinationTeamName: 'New Jersey Devils',
      title: 'The Metropolitan Heavyweight',
      subtitle: 'Lock Down New Jersey’s Championship Window',
      pitch:
        'The Devils boast an enviable offensive arsenal in Jack Hughes, Nico Hischier, and Jesper Bratt, but missing the 2026 postseason made one thing crystal clear: inconsistent crease performance will continue to squander their prime years. Landing Hellebuyck gives GM Tom Fitzgerald the final piece to go toe-to-toe with reigning champion Carolina.',
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
      projectedCupDeltaWinnipeg: '-0.4% (Massive injection of +104 future pipeline equity in Anton Silayev and 1st)',
      projectedCupDeltaDestination: '+2.0% (Transforms Devils into East powerhouse with +2.0% Cup surge)',
    },
  ],
};
