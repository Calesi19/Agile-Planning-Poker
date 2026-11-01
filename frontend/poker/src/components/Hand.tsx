import { useMedia } from "../lib/useMedia";
import { CardFace, suitFor } from "./PlayingCard";

interface HandProps {
  cards: string[];
  selectedCard?: string;
  onSelectCard: (value: string) => void;
  disabled?: boolean;
}

// Phones hold two tiers past this count: one row would leave strips under 44px wide.
const MAX_SINGLE_ROW = 6;
const COMPACT = "(max-width: 639px), (max-height: 520px) and (orientation: landscape)";

export function Hand({ cards, selectedCard, onSelectCard, disabled }: HandProps) {
  const compact = useMedia(COMPACT);
  const split = compact && cards.length > MAX_SINGLE_ROW ? Math.ceil(cards.length / 2) : cards.length;
  const rows = split < cards.length ? [cards.slice(0, split), cards.slice(split)] : [cards];
  const cardWidth = compact ? "min(3.875rem, 17.5vw)" : "clamp(4.75rem, 7.5vw, 6.25rem)";

  return (
    <div
      class={`hand ${disabled ? "is-resting" : ""}`}
      role="group"
      aria-label="Your hand"
      style={{ "--hand-card": cardWidth }}
    >
      {rows.map((row) => {
        const sagAt = (fromCenter: number) => fromCenter * fromCenter * (compact ? 0.5 : 0.7);
        const edge = (row.length - 1) / 2;

        return (
          <div class="hand-row" key={row[0]} style={{ "--count": row.length, "--sag": `${sagAt(edge)}px` }}>
            {row.map((card, index) => {
              const isSelected = selectedCard === card;
              const fromCenter = index - edge;

              return (
                <button
                  key={card}
                  type="button"
                  class="hand-slot group"
                  onClick={() => onSelectCard(card)}
                  disabled={disabled}
                  aria-pressed={isSelected}
                  aria-label={card === "?" ? "Estimate: not sure" : `Estimate: ${card}`}
                  style={{
                    "--tilt": `${fromCenter * (compact ? 1 : 1.6)}deg`,
                    "--arc": `${sagAt(fromCenter)}px`,
                  }}
                >
                  <span
                    class={`card hand-card transition-transform duration-200 ${
                      isSelected
                        ? "is-selected -translate-y-6"
                        : disabled
                          ? ""
                          : "group-hover:-translate-y-2 group-active:-translate-y-1"
                    }`}
                  >
                    <CardFace value={card} suit={suitFor(card, cards)} />
                  </span>
                </button>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
