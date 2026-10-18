# 🏒 NHLMC: National Hockey League Monte Carlo & Trade Retrospectives

**NHLMC** is a high-performance NHL trade machine, franchise competitiveness evaluator, and historical retrospective simulator powered by stochastic Monte Carlo rollouts (1,000–10,000 iterations).

Unlike static point calculators or fantasy-only tools, NHLMC evaluates trades through the lens of **real NHL front-office decision making**: 5v5 goal differential ($xGF/60$, $xGA/60$), the **\$88.0M salary cap**, salary retention, draft capital, regular season standings points ($xPTS$), and **Stanley Cup Championship probability ($\Delta P(\text{Cup})$)**.

In addition, NHLMC features the **Historical Trade Time-Machine**: an analytical retrospective platform that evaluates iconic NHL blockbusters through a dual-perspective lens—examining the trade with the info available at the moment of the handshake, versus the true legacy, championships won, and subsequent domino trade trees.

---

## Key Capabilities

- **Stochastic Franchise Simulation Engine**: Simulates 1,000 to 10,000 full 82-game regular seasons and 4-round best-of-7 Stanley Cup Playoff tournaments in $< 500\text{ ms}$ entirely in the browser using multi-threaded Web Workers.
- **Real NHL Franchise Competitiveness**: Evaluates 5v5 expected goal generation ($xGF/60$), defensive suppression ($xGA/60$), special teams ($PP\%$, $PK\%$), and goaltending Goals Saved Above Expected ($GSAx$).
- **The \$88.0M Salary Cap Machine**: Tracks active payroll, cap space absorbed/created, salary retention (up to 50%), and long-term contract term alignment (Contender vs Rebuilder).
- **Historical Trade Time-Machine & Domino Trees**:
  - **At the Time (Snapshot Mode)**: Day-of-trade headlines, consensus grades, contract status, and perceived Cup odds shift as known on the day of the trade.
  - **Hindsight & Legacy (After Mode)**: Today's retrospective verdict, championships won, individual trophies (Conn Smythe, Hart, Norris), catastrophic collapses, and the **Domino Trade Tree** showing what draft picks and subsequent trades became.
  - Featured blockbusters: *Matthew Tkachuk / Jonathan Huberdeau (2022)*, *Patrick Roy to Colorado (1995)*, *Wayne Gretzky to LA (1988)*, *Jack Eichel to Vegas (2021)*, *Erik Karlsson / Tim Stützle (2018)*, *Filip Forsberg / Martin Erat (2013)*, *Ryan O'Reilly to St. Louis (2018)*.
- **Official NHL Data Integration**: Live connectivity to the official unauthenticated NHL Web API (`api-web.nhle.com`) for active 2026–2027 season statistics, team logos, and authentic player headshots (`assets.nhle.com/mugs/...`).
- **Zero-Cost Edge Hosting**: Pre-configured for free static hosting on Cloudflare Pages.

---

## Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons
- **Simulation Engine**: Client-side Web Worker, Poisson game draws, log5 / Pythagorean head-to-head playoff series modeling, Box-Muller transforms
- **Data Ingestion**: Node.js script querying official NHL Web API (`api-web.nhle.com/v1/...`)
- **Hosting & CI/CD**: Cloudflare Pages + GitHub Actions

---

## Local Development Setup

### Prerequisites
- Node.js 20+ (Node 22 recommended)
- npm 10+

### Installation & Run

```bash
# Clone the repository
git clone https://github.com/thermo-lab/NHLMC.git
cd NHLMC

# Install dependencies
npm install

# Run unit tests
npm test

# Launch development server
npm run dev
```

The application will launch locally at `http://localhost:5174`.

### Refreshing Live NHL Stats

```bash
npm run fetch-data
```

---

## Zero-Cost Cloudflare Pages Deployment

NHLMC is pre-configured for free static edge deployment on Cloudflare Pages:

1. Go to the [Cloudflare Dashboard](https://dash.cloudflare.com/) > **Compute (Workers & Pages)** > **Create application** > **Pages** > **Connect to Git**.
2. Select your repository `NHLMC`.
3. Set build settings:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. Click **Save and Deploy**. Every push will automatically build and deploy globally.

---

## License
MIT License.
Official NHL data provided via NHL Web API according to fair use.
