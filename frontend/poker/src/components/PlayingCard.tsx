export type Suit = "spade" | "heart" | "club" | "diamond" | "star";

const SUITS: Suit[] = ["spade", "heart", "club", "diamond"];

// Inline paths rather than ♠♥♣♦ text, which iOS can swap for emoji.
const SUIT_PATHS: Record<Suit, string> = {
  spade:
    "M12 1.5S2.5 9 2.5 14.6c0 2.9 2.2 5 4.8 5 1.4 0 2.8-.6 3.7-1.7-.2 1.7-.9 3.2-2.2 4.6h6.4c-1.3-1.4-2-2.9-2.2-4.6.9 1.1 2.3 1.7 3.7 1.7 2.6 0 4.8-2.1 4.8-5C21.5 9 12 1.5 12 1.5z",
  heart:
    "M12 21.5S2 14.6 2 8.2C2 4.9 4.5 2.5 7.4 2.5c1.9 0 3.6 1 4.6 2.7 1-1.7 2.7-2.7 4.6-2.7C19.5 2.5 22 4.9 22 8.2c0 6.4-10 13.3-10 13.3z",
  club: "M12 2a5 5 0 0 0-4.5 7.2 5 5 0 1 0 3.4 8.2c-.2 1.7-.9 3.2-2.2 4.6h6.6c-1.3-1.4-2-2.9-2.2-4.6a5 5 0 1 0 3.4-8.2A5 5 0 0 0 12 2z",
  diamond: "M12 1.5c2 4 5 7.5 8.5 10.5-3.5 3-6.5 6.5-8.5 10.5-2-4-5-7.5-8.5-10.5C7 9 10 5.5 12 1.5z",
  star: "M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.3l-6.1 3.3 1.4-6.8-5.1-4.7 6.9-.8z",
};

const [LEFT, CENTER, RIGHT] = [14, 50, 86];

// Traditional pip placement, in percent of the art area.
const PIPS: Record<string, [number, number][]> = {
  "2": [[CENTER, 16], [CENTER, 84]],
  "3": [[CENTER, 16], [CENTER, 50], [CENTER, 84]],
  "4": [[LEFT, 16], [RIGHT, 16], [LEFT, 84], [RIGHT, 84]],
  "5": [[LEFT, 16], [RIGHT, 16], [CENTER, 50], [LEFT, 84], [RIGHT, 84]],
  "6": [[LEFT, 16], [RIGHT, 16], [LEFT, 50], [RIGHT, 50], [LEFT, 84], [RIGHT, 84]],
  "7": [[LEFT, 16], [RIGHT, 16], [CENTER, 33], [LEFT, 50], [RIGHT, 50], [LEFT, 84], [RIGHT, 84]],
  "8": [[LEFT, 16], [RIGHT, 16], [CENTER, 33], [LEFT, 50], [RIGHT, 50], [CENTER, 67], [LEFT, 84], [RIGHT, 84]],
};

export function suitFor(value: string, cards: string[]): Suit {
  if (value === "?") return "star";
  const index = cards.indexOf(value);
  return SUITS[Math.max(index, 0) % SUITS.length];
}

interface SuitIconProps {
  suit: Suit;
  class?: string;
  style?: Record<string, string>;
}

export function SuitIcon({ suit, class: className, style }: SuitIconProps) {
  return (
    <svg class={className} style={style} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d={SUIT_PATHS[suit]} />
    </svg>
  );
}

const isRed = (suit: Suit) => suit === "heart" || suit === "diamond";
const isLong = (value: string) => value.length > 2;

function CardArt({ value, suit }: { value: string; suit: Suit }) {
  if (value === "1") {
    return (
      <span class="card-art">
        <span class="card-ace">
          <SuitIcon suit={suit} />
        </span>
      </span>
    );
  }

  const pips = PIPS[value];

  return (
    <span class="card-art">
      {pips ? (
        pips.map(([x, y]) => (
          <SuitIcon
            key={`${x}-${y}`}
            suit={suit}
            class={`card-pip ${y > 50 ? "is-down" : ""}`}
            style={{ left: `${x}%`, top: `${y}%` }}
          />
        ))
      ) : (
        <span class="card-court">
          <SuitIcon suit={suit} />
        </span>
      )}
    </span>
  );
}

export function CardFace({ value, suit }: { value: string; suit: Suit }) {
  const index = (
    <>
      <span>{value}</span>
      <SuitIcon suit={suit} />
    </>
  );

  return (
    <span class={`card-face ${isRed(suit) ? "is-red" : ""}`}>
      <span class={`card-index ${isLong(value) ? "is-long" : ""}`}>{index}</span>
      <span class={`card-index is-flipped ${isLong(value) ? "is-long" : ""}`}>{index}</span>
      <CardArt value={value} suit={suit} />
    </span>
  );
}

export function SeatFace({ value, suit }: { value: string; suit: Suit }) {
  return (
    <span class={`card-face ${isRed(suit) ? "is-red" : ""}`}>
      <SuitIcon suit={suit} class="card-corner" />
      <span class={`card-value ${isLong(value) ? "is-long" : ""}`}>{value}</span>
    </span>
  );
}

export function CardBack() {
  return (
    <span class="card-back">
      <span class="card-seal">
        <SuitIcon suit="spade" />
      </span>
    </span>
  );
}
