# 🏒 Welcome to NHLMC: National Hockey League Monte Carlo
### An NHL Front-Office & Historical Trade Retrospective Guide

---

## 1. What Makes NHLMC Unique?

Most sports trade calculators were designed around static fantasy points or basic point additions. In real NHL hockey, front offices must weigh complex interrelated variables:

1. **The Stanley Cup Objective**: Winning 2 extra games in January is meaningless if your roster doesn't match up in a 7-game playoff war.
2. **The \$88.0M Hard Salary Cap**: Cap space is a finite strategic currency. Overpaying for past production restricts roster depth.
3. **5v5 Goal Share ($xGF\%$) & Defensive Suppression**: An elite two-way center or shutdown defenseman alters the ice for 22+ minutes a game, suppressing opponent scoring chances.
4. **Asymmetric Contention Timelines**: A Stanley Cup contender trading future 1st round draft picks for immediate rental scoring vs. a rebuilding franchise harvesting draft equity.

**NHLMC simulates 1,000 to 10,000 full 82-game regular seasons and 4-round Stanley Cup Playoff tournaments in under a second**, quantifying the true shift in championship equity.

---

## 2. Navigating the App

### 🏆 Tab 1: Real NHL Trade Machine
This is the live front-office workspace:
- **Select Any Two Real NHL Franchises**: Choose from real NHL clubs (Edmonton Oilers, Florida Panthers, Colorado Avalanche, New York Rangers, Toronto Maple Leafs, Dallas Stars, etc.).
- **Build the Deal**:
  - Choose active players from both rosters.
  - Attach future **1st Round Draft Picks**.
  - Toggle **Salary Retention** (e.g., retaining 25% or 50% of an outgoing cap hit to facilitate a trade under the cap).
- **Hit "Run NHL Franchise Monte Carlo Simulation"**:
  - The stochastic engine simulates thousands of seasons and 7-game playoff series matchups.
- **Reading the Output**:
  - **Stanley Cup Championship Probability ($\Delta P(\text{Cup})$)**: Net shift in odds of winning the Cup.
  - **Playoff Qualification Odds ($\Delta P(\text{Playoffs})$)**: Probability of making the postseason.
  - **Expected Standings Points ($xPTS$)**: Projected 82-game regular season points.
  - **Net Goal Differential ($xGF - xGA$ per 60)**: On-ice 5v5 impact.
  - **Salary Cap Status Meter**: Checks payroll against the hard \$88.0M ceiling.
  - **Executive GM Trade Verdict**: Clear recommendations (`EXECUTE`, `FAVORABLE`, `LATERAL`, `WALK AWAY`).

---

### 📜 Tab 2: Historical Blockbusters (The Time-Machine)
Inspect iconic franchise-altering trades through two distinct lenses:

#### 🕰️ 1. At the Time of the Trade (Snapshot Mode)
- **Day 1 Headlines**: The narrative context on the day of the handshake.
- **Handshake Grades**: What journalists and analysts thought that day.
- **Player Profiles**: Age, prior season stats, contract demands, and market perception.
- **Initial Cup Odds Shift**: How the trade moved the needle at that moment.

#### 🔮 2. Hindsight & Legacy (After Mode)
- **Today's Retrospective Grade**: Evaluates the trade years later.
- **Lopsidedness Rating**: (`ALL-TIME FLEECING`, `DECISIVE WIN`, `EVEN / WIN-WIN`).
- **Championship Impact**: Stanley Cups won or playoff runs made.
- **Key Milestones Timeline**: Chronological events showing awards, collapses, and contract extensions.
- **The Domino Trade Tree**: Follows the draft picks and subsequent trades (e.g. San Jose's pick becoming Tim Stützle #3 overall, or Jimmy Carson being flipped for the players who won Edmonton the 1990 Cup).

---

### 🏢 Tab 3: 32 Teams & Payroll Hub
- Browse all NHL teams with active 2026–2027 records, goal differentials, and cap spaces.
- Inspect team ratings ($xGF/60$, $xGA/60$), power play %, penalty kill %, and franchise core rosters.

---

### 🔍 Tab 4: Player Directory
- Browse 50 active NHL superstars with official headshots, contract cap hits, 2026–2027 stats, and rest-of-season projections.

---

## 3. Mathematical Engine Formulation

- **Regular Season Game Outcomes**: Modeled using Poisson goal arrival processes:
  $$G_{\text{team}} \sim \text{Poisson}(xGF)$$
  scaled by opponent defensive strength.
- **Best-of-7 Playoff Series Win Probabilities**: Calculated via the log5 / Pythagorean head-to-head formula:
  $$P(A \text{ beats } B) = \frac{xGF_A / xGA_B}{(xGF_A / xGA_B) + (xGF_B / xGA_A)}$$
  simulated across all four rounds of the Stanley Cup Playoffs.
- **Zero Server Lag**: Everything runs directly on your device inside a Web Worker.

Enjoy exploring the trades that shaped hockey history and testing new blockbusters! 🏆
