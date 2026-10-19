/**
 * Statistical distributions and random sampling functions for Monte Carlo hockey simulations.
 */

// Box-Muller transform for generating standard normal random variables
let spareRandom: number | null = null;

export function randomStandardNormal(): number {
  if (spareRandom !== null) {
    const val = spareRandom;
    spareRandom = null;
    return val;
  }

  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();

  const r = Math.sqrt(-2.0 * Math.log(u));
  const theta = 2.0 * Math.PI * v;

  spareRandom = r * Math.sin(theta);
  return r * Math.cos(theta);
}

export function sampleNormal(mean: number, stdDev: number): number {
  return mean + stdDev * randomStandardNormal();
}

export function sampleTruncatedNormal(mean: number, stdDev: number, min: number = 0, max?: number): number {
  let sample = sampleNormal(mean, stdDev);
  if (sample < min) sample = min;
  if (max !== undefined && sample > max) sample = max;
  return sample;
}

/**
 * Poisson random variable sampling.
 * Used for discrete event counts like Goals, Assists, SOG, Hits, Blocks, PIM, Wins, Shutouts.
 */
export function samplePoisson(lambda: number): number {
  if (lambda <= 0) return 0;
  if (lambda < 30) {
    // Knuth's algorithm for moderate lambda
    const L = Math.exp(-lambda);
    let k = 0;
    let p = 1;
    do {
      k++;
      p *= Math.random();
    } while (p > L);
    return k - 1;
  } else {
    // Gaussian approximation for large lambda
    const normal = sampleNormal(lambda, Math.sqrt(lambda));
    return Math.max(0, Math.round(normal));
  }
}

/**
 * Save Percentage sampling via Gaussian approximation of binomial proportion.
 * Used for goalie SV% (bounded realistically between 0.820 and 0.970).
 */
export function sampleSavePctg(meanSavePct: number, totalShots: number = 1000): number {
  const shots = (!totalShots || totalShots <= 0) ? 1000 : totalShots;
  const variance = (meanSavePct * (1 - meanSavePct)) / shots;
  const stdDev = Math.sqrt(Math.max(1e-6, variance));
  return sampleTruncatedNormal(meanSavePct, stdDev, 0.820, 0.970);
}

/**
 * Calculates percentile from an array of numbers.
 */
export function calculatePercentile(sortedArray: number[], percentile: number): number {
  if (sortedArray.length === 0) return 0;
  const index = (percentile / 100) * (sortedArray.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  if (upper >= sortedArray.length) return sortedArray[sortedArray.length - 1];
  return sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight;
}
