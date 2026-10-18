import { FantasyLeague } from '../types/league';
import rawPlayers from './nhlPlayers.json';
import { Player } from '../types/player';

export const INITIAL_PLAYERS: Player[] = rawPlayers as unknown as Player[];

const getPlayerId = (query: string, fallback: number): number => {
  const match = INITIAL_PLAYERS.find((p) => p.name.toLowerCase().includes(query.toLowerCase()));
  return match ? match.id : fallback;
};

// Edmonton Ice Kings
const pMcDavid = getPlayerId('McDavid', 78);
const pDraisaitl = getPlayerId('Draisaitl', 75);
const pHyman = getPlayerId('Hyman', 72);
const pBouchard = getPlayerId('Bouchard', 84);
const pSkinner = getPlayerId('Stuart Skinner', 351);

// Mile High Snipers
const pMacKinnon = getPlayerId('MacKinnon', 235);
const pRantanen = getPlayerId('Rantanen', 409);
const pMakar = getPlayerId('Makar', 240);

// Bay Street Blueliners
const pMatthews = getPlayerId('Matthews', 591);
const pNylander = getPlayerId('Nylander', 588);
const pMarner = getPlayerId('Marner', 14);

// Broadway Blueshirts
const pPanarin = getPlayerId('Panarin', 769);
const pFox = getPlayerId('Fox', 106);
const pShesterkin = getPlayerId('Shesterkin', 123);

// Sunshine State Rink Rats
const pBarkov = getPlayerId('Barkov', 208);
const pTkachuk = getPlayerId('Matthew Tkachuk', 218);
const pReinhart = getPlayerId('Reinhart', 212);
const pBobrovsky = getPlayerId('Bobrovsky', 601);

// Tampa Bay Bolts
const pKucherov = getPlayerId('Kucherov', 131);
const pPoint = getPlayerId('Brayden Point', 135);
const pHedman = getPlayerId('Hedman', 130);
const pVasilevskiy = getPlayerId('Vasilevskiy', 150);

// Boston Bruins Legacy
const pPastrnak = getPlayerId('Pastrnak', 53);
const pMcAvoy = getPlayerId('McAvoy', 56);
const pSwayman = getPlayerId('Swayman', 70);

// North Star Jets
const pConnor = getPlayerId('Kyle Connor', 337);
const pMorrissey = getPlayerId('Morrissey', 335);
const pHellebuyck = getPlayerId('Hellebuyck', 353);

// Lone Star Outlaws
const pHintz = getPlayerId('Hintz', 410);
const pRobertson = getPlayerId('Jason Robertson', 413);
const pHeiskanen = getPlayerId('Heiskanen', 414);
const pOettinger = getPlayerId('Oettinger', 424);

// Smashville Predators
const pForsberg = getPlayerId('Filip Forsberg', 433);
const pStamkos = getPlayerId('Stamkos', 428);
const pJosi = getPlayerId('Josi', 429);
const pSaros = getPlayerId('Saros', 450);

// Pacific Canucks
const pMiller = getPlayerId('J.T. Miller', 102);
const pQHughes = getPlayerId('Quinn Hughes', 263);
const pDemko = getPlayerId('Demko', 729);

// Motor City Wings
const pJHughes = getPlayerId('Jack Hughes', 544);
const pBTkachuk = getPlayerId('Brady Tkachuk', 220);
const pDahlin = getPlayerId('Dahlin', 363);
const pSeider = getPlayerId('Seider', 566);

export const DEFAULT_LEAGUE: FantasyLeague = {
  id: 'league-stanley-dynasty',
  name: 'Lord Stanley Fantasy Roto (12-Team)',
  totalTeams: 12,
  remainingSeasonPct: 0.85, // ~65 games remaining
  scoring: {
    type: 'ROTO',
    skaterCategories: ['G', 'A', 'PTS', 'PLUS_MINUS', 'PPP', 'SOG', 'HIT', 'BLK', 'PIM'],
    goalieCategories: ['W', 'GAA', 'SV_PCT', 'SV', 'SO'],
    inverseCategories: ['GAA'],
    salaryCapEnabled: true,
    salaryCapCeiling: 88000000, // $88M NHL Cap
  },
  teams: [
    {
      id: 'team-user',
      name: 'Edmonton Ice Kings (Your Team)',
      manager: 'Mike / User',
      isUserTeam: true,
      playerIds: [pMcDavid, pDraisaitl, pHyman, pBouchard, pSkinner],
      activeSkaterIds: [pMcDavid, pDraisaitl, pHyman, pBouchard],
      activeGoalieIds: [pSkinner],
      benchPlayerIds: [],
      seasonTotals: {
        g: 52,
        a: 84,
        pts: 136,
        plusMinus: 18,
        ppp: 38,
        sog: 420,
        hit: 280,
        blk: 210,
        pim: 104,
        w: 9,
        ga: 44,
        saves: 430,
        shotsAgainst: 474,
        so: 1,
        goalieGamesPlayed: 16,
      },
    },
    {
      id: 'team-2',
      name: 'Mile High Snipers',
      manager: 'Nathan',
      isUserTeam: false,
      playerIds: [pMacKinnon, pRantanen, pMakar],
      activeSkaterIds: [pMacKinnon, pRantanen, pMakar],
      activeGoalieIds: [],
      benchPlayerIds: [],
      seasonTotals: {
        g: 58,
        a: 88,
        pts: 146,
        plusMinus: 12,
        ppp: 42,
        sog: 460,
        hit: 240,
        blk: 220,
        pim: 88,
        w: 10,
        ga: 42,
        saves: 450,
        shotsAgainst: 492,
        so: 2,
        goalieGamesPlayed: 16,
      },
    },
    {
      id: 'team-3',
      name: 'Bay Street Blueliners',
      manager: 'Auston',
      isUserTeam: false,
      playerIds: [pMatthews, pNylander, pMarner],
      activeSkaterIds: [pMatthews, pNylander, pMarner],
      activeGoalieIds: [],
      benchPlayerIds: [],
      seasonTotals: {
        g: 54,
        a: 76,
        pts: 130,
        plusMinus: 8,
        ppp: 34,
        sog: 440,
        hit: 220,
        blk: 200,
        pim: 72,
        w: 8,
        ga: 48,
        saves: 420,
        shotsAgainst: 468,
        so: 1,
        goalieGamesPlayed: 15,
      },
    },
    {
      id: 'team-4',
      name: 'Broadway Blueshirts',
      manager: 'Igor',
      isUserTeam: false,
      playerIds: [pPanarin, pFox, pShesterkin],
      activeSkaterIds: [pPanarin, pFox],
      activeGoalieIds: [pShesterkin],
      benchPlayerIds: [],
      seasonTotals: {
        g: 46,
        a: 78,
        pts: 124,
        plusMinus: 14,
        ppp: 36,
        sog: 390,
        hit: 260,
        blk: 240,
        pim: 92,
        w: 11,
        ga: 36,
        saves: 480,
        shotsAgainst: 516,
        so: 3,
        goalieGamesPlayed: 17,
      },
    },
    {
      id: 'team-5',
      name: 'Sunshine State Rink Rats',
      manager: 'Aleksander',
      isUserTeam: false,
      playerIds: [pBarkov, pTkachuk, pReinhart, pBobrovsky],
      activeSkaterIds: [pBarkov, pTkachuk, pReinhart],
      activeGoalieIds: [pBobrovsky],
      benchPlayerIds: [],
      seasonTotals: {
        g: 50,
        a: 80,
        pts: 130,
        plusMinus: 16,
        ppp: 35,
        sog: 430,
        hit: 340,
        blk: 215,
        pim: 120,
        w: 10,
        ga: 41,
        saves: 440,
        shotsAgainst: 481,
        so: 2,
        goalieGamesPlayed: 16,
      },
    },
    {
      id: 'team-6',
      name: 'Tampa Bay Bolts',
      manager: 'Nikita',
      isUserTeam: false,
      playerIds: [pKucherov, pPoint, pHedman, pVasilevskiy],
      activeSkaterIds: [pKucherov, pPoint, pHedman],
      activeGoalieIds: [pVasilevskiy],
      benchPlayerIds: [],
      seasonTotals: {
        g: 56,
        a: 90,
        pts: 146,
        plusMinus: 6,
        ppp: 45,
        sog: 410,
        hit: 250,
        blk: 230,
        pim: 98,
        w: 10,
        ga: 43,
        saves: 460,
        shotsAgainst: 503,
        so: 1,
        goalieGamesPlayed: 16,
      },
    },
    {
      id: 'team-7',
      name: 'Boston Bruins Legacy',
      manager: 'David',
      isUserTeam: false,
      playerIds: [pPastrnak, pMcAvoy, pSwayman],
      activeSkaterIds: [pPastrnak, pMcAvoy],
      activeGoalieIds: [pSwayman],
      benchPlayerIds: [],
      seasonTotals: {
        g: 48,
        a: 70,
        pts: 118,
        plusMinus: 10,
        ppp: 30,
        sog: 450,
        hit: 310,
        blk: 250,
        pim: 112,
        w: 9,
        ga: 39,
        saves: 445,
        shotsAgainst: 484,
        so: 2,
        goalieGamesPlayed: 16,
      },
    },
    {
      id: 'team-8',
      name: 'North Star Jets',
      manager: 'Connor H.',
      isUserTeam: false,
      playerIds: [pConnor, pMorrissey, pHellebuyck],
      activeSkaterIds: [pConnor, pMorrissey],
      activeGoalieIds: [pHellebuyck],
      benchPlayerIds: [],
      seasonTotals: {
        g: 44,
        a: 68,
        pts: 112,
        plusMinus: 15,
        ppp: 28,
        sog: 380,
        hit: 270,
        blk: 260,
        pim: 84,
        w: 12,
        ga: 34,
        saves: 490,
        shotsAgainst: 524,
        so: 3,
        goalieGamesPlayed: 17,
      },
    },
    {
      id: 'team-9',
      name: 'Lone Star Outlaws',
      manager: 'Jason',
      isUserTeam: false,
      playerIds: [pHintz, pRobertson, pHeiskanen, pOettinger],
      activeSkaterIds: [pHintz, pRobertson, pHeiskanen],
      activeGoalieIds: [pOettinger],
      benchPlayerIds: [],
      seasonTotals: {
        g: 47,
        a: 75,
        pts: 122,
        plusMinus: 11,
        ppp: 32,
        sog: 405,
        hit: 265,
        blk: 235,
        pim: 80,
        w: 9,
        ga: 40,
        saves: 435,
        shotsAgainst: 475,
        so: 1,
        goalieGamesPlayed: 16,
      },
    },
    {
      id: 'team-10',
      name: 'Smashville Predators',
      manager: 'Roman',
      isUserTeam: false,
      playerIds: [pForsberg, pStamkos, pJosi, pSaros],
      activeSkaterIds: [pForsberg, pStamkos, pJosi],
      activeGoalieIds: [pSaros],
      benchPlayerIds: [],
      seasonTotals: {
        g: 45,
        a: 72,
        pts: 117,
        plusMinus: 2,
        ppp: 34,
        sog: 415,
        hit: 295,
        blk: 245,
        pim: 95,
        w: 8,
        ga: 45,
        saves: 460,
        shotsAgainst: 505,
        so: 1,
        goalieGamesPlayed: 16,
      },
    },
    {
      id: 'team-11',
      name: 'Pacific Canucks',
      manager: 'Quinn',
      isUserTeam: false,
      playerIds: [pMiller, pQHughes, pDemko],
      activeSkaterIds: [pMiller, pQHughes],
      activeGoalieIds: [pDemko],
      benchPlayerIds: [],
      seasonTotals: {
        g: 46,
        a: 79,
        pts: 125,
        plusMinus: 9,
        ppp: 37,
        sog: 395,
        hit: 285,
        blk: 215,
        pim: 89,
        w: 8,
        ga: 43,
        saves: 438,
        shotsAgainst: 481,
        so: 1,
        goalieGamesPlayed: 16,
      },
    },
    {
      id: 'team-12',
      name: 'Motor City Wings',
      manager: 'Moritz',
      isUserTeam: false,
      playerIds: [pJHughes, pBTkachuk, pDahlin, pSeider],
      activeSkaterIds: [pJHughes, pBTkachuk, pDahlin, pSeider],
      activeGoalieIds: [],
      benchPlayerIds: [],
      seasonTotals: {
        g: 49,
        a: 74,
        pts: 123,
        plusMinus: 3,
        ppp: 33,
        sog: 435,
        hit: 380, // Heavy banger team
        blk: 290,
        pim: 145,
        w: 7,
        ga: 49,
        saves: 410,
        shotsAgainst: 459,
        so: 0,
        goalieGamesPlayed: 15,
      },
    },
  ],
};
