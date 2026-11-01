import type { RoundSummary } from "../lib/round";

const EMPTY = "—";

export function Ticker({ summary }: { summary: RoundSummary | null }) {
  const agreement = summary?.votes ? `${summary.agreement}%` : null;
  const metrics = [
    ["Average", summary?.average],
    ["Median", summary?.median],
    ["Agreement", agreement],
    ["Range", summary?.range],
  ];

  return (
    <dl class={`ticker ${summary ? "is-live" : ""}`} aria-label="Round statistics">
      {metrics.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd class={value && value.length > 5 ? "is-long" : ""}>{value ?? EMPTY}</dd>
        </div>
      ))}
    </dl>
  );
}
