import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const playersPath = path.join(__dirname, '..', 'src', 'data', 'nhlPlayers.json');

const players = JSON.parse(fs.readFileSync(playersPath, 'utf8'));

let updatedCount = 0;

for (const p of players) {
  if (p.playerType !== 'skater') continue;

  const s = p.actualStats?.skater;
  const proj = p.projections;
  if (!s || !proj) continue;

  const gp = s.gamesPlayed || 1;
  const goals = s.goals || 0;
  const pts = s.points || 0;
  const ppg = s.powerPlayGoals || 0;
  const isDef = p.primaryPosition === 'D';
  const cap = p.capHit || 950000;

  let toiMin = 16.0;
  if (typeof s.avgTimeOnIce === 'string' && s.avgTimeOnIce.includes(':')) {
    const [m, sec] = s.avgTimeOnIce.split(':').map(Number);
    toiMin = (m || 0) + (sec || 0) / 60;
  }

  const ptsPerGame = pts / gp;
  const rosPoints = proj.rosPoints || 0;

  // Realistic Power Play Share (% of total points scored on PP)
  let ppShare = 0.10;
  if (!isDef) {
    if (toiMin >= 19.0 || ptsPerGame >= 0.85 || cap >= 7000000) {
      // Top-line / PP1 staple (Scheifele, McDavid, Eichel, MacKinnon, Kucherov, Draisaitl)
      ppShare = 0.28;
    } else if (toiMin >= 17.0 || ptsPerGame >= 0.65 || cap >= 4500000) {
      // Top-6 / PP2 staple
      ppShare = 0.22;
    } else if (toiMin >= 14.5 || ptsPerGame >= 0.40) {
      // Middle-six forward
      ppShare = 0.14;
    } else {
      // Bottom-six checking forward
      ppShare = 0.05;
    }
  } else {
    if ((toiMin >= 21.0 && ptsPerGame >= 0.50) || cap >= 7000000) {
      // Elite PP1 quarterback (Fox, Makar, Hedman, Hughes, Josi, Dahlin)
      ppShare = 0.32;
    } else if (toiMin >= 19.5 || ptsPerGame >= 0.35 || cap >= 4500000) {
      // Top-4 offensive / secondary PP defenseman
      ppShare = 0.20;
    } else if (toiMin >= 17.5 && ptsPerGame >= 0.20) {
      // Two-way defenseman
      ppShare = 0.10;
    } else {
      // Shutdown / 3rd-pair defenseman
      ppShare = 0.03;
    }
  }

  // If observed power play goals exist, blend observed with baseline
  if (ppg > 0) {
    const observedPpgRate = (ppg * 2.5) / Math.max(1, pts);
    ppShare = Math.min(0.45, Math.max(ppShare, observedPpgRate * 0.6 + ppShare * 0.4));
  }

  // Actual and Projected Power Play Points
  let actualPPP = 0;
  if (ppg > 0) {
    actualPPP = Math.max(ppg, Math.round(ppg * 2.4));
  } else if (ppShare >= 0.20 && pts >= 2) {
    actualPPP = Math.max(0, Math.round(pts * ppShare));
  }

  const rosPPP = Math.round(rosPoints * ppShare);

  if (s.powerPlayPoints !== actualPPP || proj.rosPPP !== rosPPP) {
    s.powerPlayPoints = actualPPP;
    proj.rosPPP = rosPPP;
    updatedCount++;
  }
}

fs.writeFileSync(playersPath, JSON.stringify(players, null, 2) + '\n', 'utf8');

console.log(`Successfully updated Power Play Points and Projections for ${updatedCount} skaters.`);
