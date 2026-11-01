const SAMPLES = 720;

// Equal angles bunch seats at the ends of an oval, so seats are spaced by arc length.
// Returns unit-circle positions, the first at the bottom (the viewer's seat), going clockwise.
export function ovalSeats(count: number, aspect: number): { cos: number; sin: number }[] {
  const step = (Math.PI * 2) / SAMPLES;
  const lengths = [0];

  for (let i = 1; i <= SAMPLES; i++) {
    const t = Math.PI / 2 + (i - 0.5) * step;
    lengths.push(lengths[i - 1] + Math.hypot(aspect * Math.sin(t), Math.cos(t)) * step);
  }

  const total = lengths[SAMPLES];
  let sample = 0;

  return Array.from({ length: count }, (_, seat) => {
    const target = (seat / count) * total;
    while (lengths[sample] < target) sample++;
    const t = Math.PI / 2 + sample * step;
    return { cos: Math.cos(t), sin: Math.sin(t) };
  });
}

// Shrinks seats once they'd crowd each other on the rail or outgrow a short table.
export function seatScale(count: number, width: number, height: number): number {
  const perimeter = Math.PI * (width + height) * 0.42;
  return Math.min(1, Math.max(0.62, Math.min(perimeter / count / 96, height / 520, width / 340)));
}

// Pushes diagonal seats' cards further inward, clear of the seat chip's corner.
export function inwardOffset(component: number): number {
  return Math.sign(component) * Math.sqrt(Math.abs(component));
}
