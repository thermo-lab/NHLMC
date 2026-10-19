import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_FILE = path.join(__dirname, '..', 'src', 'data', 'nhlProspects.ts');

async function generateCompleteProspects() {
  const allProspects = [];

  // Seeded / Top Tier Pipeline Prospects (e.g. Radim Mrtka, Ivan Demidov, Alexander Nikishin)
  const specialProspects = [
    {
      id: 'buf-radim-mrtka',
      name: 'Radim Mrtka',
      nhlTeam: 'BUF',
      position: 'D',
      age: 19,
      height: "6'6\"",
      weight: 218,
      shootsCatches: 'R',
      currentTeam: 'Rochester Americans (AHL) / Seattle Thunderbirds (WHL)',
      draftInfo: '2025 Round 1, #9 Overall (BUF)',
      draftYear: 2025,
      draftRound: 1,
      draftPickOverall: 9,
      potential: 'ELITE',
      potentialDescription: "Towering 6'6\" right-shot blueliner with elite wingspan, smooth transitional mobility, and shutdown poise.",
      scoutingSummary: "Drafted 9th overall in the 2025 NHL Entry Draft by Buffalo. Rare combination of 6-foot-6 frame, poise under heavy forechecking pressure, and booming outlet passing.",
      tradeValueScore: 88,
      capHit: 950000,
    },
    {
      id: 'mtl-ivan-demidov',
      name: 'Ivan Demidov',
      nhlTeam: 'MTL',
      position: 'RW',
      age: 19,
      height: "6'0\"",
      weight: 192,
      shootsCatches: 'L',
      currentTeam: 'SKA Saint Petersburg (KHL)',
      draftInfo: '2024 Round 1, #5 Overall (MTL)',
      draftYear: 2024,
      draftRound: 1,
      draftPickOverall: 5,
      potential: 'FRANCHISE',
      potentialDescription: 'Franchise-altering winger with jaw-dropping 1v1 dangles, vision, and release.',
      scoutingSummary: 'Electrifying offensive dynamo with world-class puck protection and creative playmaking.',
      tradeValueScore: 95,
      capHit: 950000,
    },
    {
      id: 'car-alexander-nikishin',
      name: 'Alexander Nikishin',
      nhlTeam: 'CAR',
      position: 'D',
      age: 23,
      height: "6'4\"",
      weight: 220,
      shootsCatches: 'L',
      currentTeam: 'SKA Saint Petersburg (KHL)',
      draftInfo: '2020 Round 3, #69 Overall (CAR)',
      draftYear: 2020,
      draftRound: 3,
      draftPickOverall: 69,
      potential: 'ELITE',
      potentialDescription: 'KHL defenseman of the year with monster open-ice hits, booming shot, and #1 blueline upside.',
      scoutingSummary: 'Widely considered the best blueliner outside the NHL. Dominates the KHL in ice time, hits, and points.',
      tradeValueScore: 91,
      capHit: 950000,
    }
  ];

  allProspects.push(...specialProspects);
  const seenNames = new Set(specialProspects.map(p => p.name.toLowerCase()));

  console.log('Fetching official NHL draft picks from NHL API for 2024 and 2023...');
  const years = [2024, 2023];
  
  for (const year of years) {
    for (let round = 1; round <= 3; round++) {
      try {
        const res = await fetch(`https://api-web.nhle.com/v1/draft/picks/${year}/${round}`, {
          headers: { 'User-Agent': 'NHLMC-DataEngine/2.0' }
        });
        if (!res.ok) continue;
        const data = await res.json();
        const picks = data.picks || [];

        for (const pick of picks) {
          const fName = typeof pick.firstName === 'object' ? pick.firstName.default : pick.firstName;
          const lName = typeof pick.lastName === 'object' ? pick.lastName.default : pick.lastName;
          const fullName = `${fName} ${lName}`.trim();
          if (seenNames.has(fullName.toLowerCase())) continue;
          seenNames.add(fullName.toLowerCase());

          const teamAbbrev = pick.teamAbbrev || pick.displayAbbrev?.default || 'NHL';
          const pos = pick.positionCode || 'F';
          const overall = pick.overallPick || (round * 32);
          
          const htInches = pick.height || 72;
          const feet = Math.floor(htInches / 12);
          const inches = htInches % 12;
          const htStr = `${feet}'${inches}"`;
          const wt = pick.weight || 190;
          const currentClub = pick.amateurClubName ? `${pick.amateurClubName} (${pick.amateurLeague || 'Junior'})` : 'Junior / Development';

          let potential = 'REGULAR';
          let tradeValue = 65;

          if (overall <= 3) {
            potential = 'FRANCHISE';
            tradeValue = 94;
          } else if (overall <= 12) {
            potential = 'ELITE';
            tradeValue = 88;
          } else if (overall <= 32) {
            potential = 'TOP_PAIR_TOP_LINE';
            tradeValue = 80;
          } else if (overall <= 64) {
            // High second rounder like Carter George (#57)
            potential = pos === 'G' ? 'TOP_PAIR_TOP_LINE' : 'TOP_PAIR_TOP_LINE';
            tradeValue = 74;
          } else {
            potential = 'REGULAR';
            tradeValue = 62;
          }

          // Specific notes for standout prospects like Carter George
          let scouting = `${fullName} was selected ${overall}th overall (Round ${round}) in the ${year} NHL Draft by ${teamAbbrev}. Developed with ${currentClub}.`;
          if (fullName === 'Carter George') {
            potential = 'TOP_PAIR_TOP_LINE';
            tradeValue = 82;
            scouting = "Standout Canadian goaltender drafted 57th overall in 2024 by Los Angeles. Starred for Team Canada at the U18 World Championship (Gold Medal, Best Goaltender) and Owen Sound (OHL). Known for elite battle level, calm positional tracking, and puckhandling prowess.";
          }

          const id = `${teamAbbrev.toLowerCase()}-${fName.toLowerCase()}-${lName.toLowerCase()}`.replace(/[^a-z0-9-]/g, '');

          allProspects.push({
            id,
            name: fullName,
            nhlTeam: teamAbbrev,
            position: pos,
            age: 2026 - (year - 18),
            height: htStr,
            weight: wt,
            shootsCatches: pos === 'G' ? 'L' : 'R',
            currentTeam: currentClub,
            draftInfo: `${year} Round ${round}, #${overall} Overall (${teamAbbrev})`,
            draftYear: year,
            draftRound: round,
            draftPickOverall: overall,
            potential,
            potentialDescription: `${potential.replace(/_/g, ' ')} caliber prospect drafted by ${teamAbbrev}.`,
            scoutingSummary: scouting,
            tradeValueScore: tradeValue,
            capHit: 950000,
          });
        }
      } catch (err) {
        console.warn(`Error on ${year} Rd ${round}:`, err.message);
      }
    }
  }

  // Sort prospects by team then by trade value descending
  allProspects.sort((a, b) => {
    if (a.nhlTeam !== b.nhlTeam) return a.nhlTeam.localeCompare(b.nhlTeam);
    return b.tradeValueScore - a.tradeValueScore;
  });

  console.log(`Writing ${allProspects.length} total prospects to ${OUTPUT_FILE}...`);

  const tsContent = `import { NHLProspect, DraftPick } from '../types/prospect';

export const INITIAL_PROSPECTS: NHLProspect[] = ${JSON.stringify(allProspects, null, 2)};

/**
 * Generate default future draft picks (2025, 2026, 2027) for any franchise
 */
export function generateDefaultDraftPicks(teamAbbrev: string): DraftPick[] {
  const years = [2025, 2026, 2027];
  const rounds: (1 | 2 | 3)[] = [1, 2, 3];
  const picks: DraftPick[] = [];

  for (const year of years) {
    for (const round of rounds) {
      const baseValue = round === 1 ? 80 : round === 2 ? 48 : 28;
      picks.push({
        id: \`\${teamAbbrev.toLowerCase()}-\${year}-rd\${round}\`,
        year,
        round,
        owningTeamId: teamAbbrev,
        originalTeamId: teamAbbrev,
        protection: round === 1 ? 'TOP_10_PROTECTED' : 'UNPROTECTED',
        tradeValueScore: baseValue,
      });
    }
  }
  return picks;
}
`;

  fs.writeFileSync(OUTPUT_FILE, tsContent, 'utf-8');
  console.log('Done!');
}

generateCompleteProspects();
