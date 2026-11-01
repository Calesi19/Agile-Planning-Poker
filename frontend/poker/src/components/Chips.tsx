export function CrownIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3.2 17.5 1.6 7.2l5.6 3.9L12 3.5l4.8 7.6 5.6-3.9-1.6 10.3zM3.4 19.2h17.2v1.8H3.4z" />
    </svg>
  );
}

const STACK = [34, 26, 18, 10];

export function ChipStack() {
  return (
    <svg class="chip-stack" viewBox="0 0 56 44" aria-hidden="true">
      {STACK.map((y, i) => (
        <g key={y} style={{ "--i": i }}>
          <ellipse cx="28" cy={y + 3} rx="24" ry="7" fill="var(--color-brass-deep)" />
          <ellipse cx="28" cy={y} rx="24" ry="7" fill="var(--color-brass)" />
          <ellipse cx="28" cy={y} rx="16" ry="4.4" fill="none" stroke="var(--color-brass-deep)" stroke-width="1.2" />
        </g>
      ))}
    </svg>
  );
}

const SPARKS = Array.from({ length: 14 }, (_, i) => ({
  angle: (360 / 14) * i,
  reach: 44 + ((i * 37) % 30),
}));

export function Burst() {
  return (
    <div class="burst" aria-hidden="true">
      {SPARKS.map(({ angle, reach }) => (
        <i key={angle} style={{ "--a": `${angle}deg`, "--r": `${reach}px` }} />
      ))}
    </div>
  );
}
