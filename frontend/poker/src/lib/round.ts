// Cards apart on the scale before a spread counts as a debate, e.g. 2 vs 8 on Fibonacci.
const DEBATE_SPREAD = 3;

const UNSURE = "?";

export interface Ballot {
  participantId: string;
  name: string;
  value: string;
}

export type Verdict =
  | { kind: "none" }
  | { kind: "consensus"; value: string }
  | { kind: "split" }
  | { kind: "debate"; low: Ballot[]; high: Ballot[] };

export interface RoundSummary {
  average: string | null;
  median: string | null;
  agreement: number;
  range: string | null;
  votes: number;
  counts: [string, number][];
  verdict: Verdict;
}

const formatNumber = (value: number) => String(Math.round(value * 10) / 10);

function middle(sorted: number[]): number {
  const mid = sorted.length / 2;
  return Number.isInteger(mid) ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[Math.floor(mid)];
}

function byScaleOrder(cards: string[]) {
  return (a: string, b: string) => cards.indexOf(a) - cards.indexOf(b);
}

function verdictFor(ballots: Ballot[], estimates: Ballot[], rankOf: (b: Ballot) => number): Verdict {
  if (estimates.length === 0) return { kind: "none" };

  const lowest = Math.min(...estimates.map(rankOf));
  const highest = Math.max(...estimates.map(rankOf));

  if (ballots.length >= 2 && estimates.length === ballots.length && lowest === highest) {
    return { kind: "consensus", value: estimates[0].value };
  }

  if (highest - lowest >= DEBATE_SPREAD) {
    return {
      kind: "debate",
      low: estimates.filter((b) => rankOf(b) === lowest),
      high: estimates.filter((b) => rankOf(b) === highest),
    };
  }

  return estimates.length >= 2 ? { kind: "split" } : { kind: "none" };
}

// `cards` is the scale in order, so ranks work for T-shirt sizes as well as numbers.
export function summarizeRound(ballots: Ballot[], cards: string[]): RoundSummary {
  const estimates = ballots.filter((b) => b.value !== UNSURE && cards.includes(b.value));
  const rankOf = (b: Ballot) => cards.indexOf(b.value);

  const tally = new Map<string, number>();
  ballots.forEach((b) => tally.set(b.value, (tally.get(b.value) ?? 0) + 1));

  const counts = [...tally.entries()].sort(([a], [b]) => byScaleOrder(cards)(a, b));
  const topEstimate = Math.max(0, ...counts.filter(([v]) => v !== UNSURE).map(([, n]) => n));

  let average: string | null = null;
  let median: string | null = null;
  let range: string | null = null;

  if (estimates.length > 0) {
    const numeric = cards.every((c) => c === UNSURE || !Number.isNaN(Number(c)));
    const points = estimates.map((b) => (numeric ? Number(b.value) : rankOf(b))).sort((a, b) => a - b);
    const label = numeric ? formatNumber : (point: number) => cards[Math.round(point)];

    average = label(points.reduce((sum, p) => sum + p, 0) / points.length);
    median = label(middle(points));

    const ordered = estimates.map((b) => b.value).sort(byScaleOrder(cards));
    const [min, max] = [ordered[0], ordered[ordered.length - 1]];
    range = min === max ? min : `${min}–${max}`;
  }

  return {
    average,
    median,
    range,
    agreement: ballots.length ? Math.round((topEstimate / ballots.length) * 100) : 0,
    votes: ballots.length,
    counts,
    verdict: verdictFor(ballots, estimates, rankOf),
  };
}
