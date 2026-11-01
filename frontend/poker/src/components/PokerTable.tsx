import { useLayoutEffect, useMemo, useRef, useState } from "preact/hooks";
import type { ComponentChildren } from "preact";
import { inwardOffset, ovalSeats, seatScale } from "../lib/geometry";
import type { Phase, Seat } from "../lib/useTable";
import type { Verdict } from "../lib/round";
import { CardBack, SeatFace, suitFor } from "./PlayingCard";
import { CrownIcon } from "./Chips";

interface PokerTableProps {
  seats: Seat[];
  cards: string[];
  phase: Phase;
  verdict?: Verdict;
  children: ComponentChildren;
}

const FALLBACK_SIZE = { width: 800, height: 450 };

// Seats above this line label outward, away from the card in front of them.
const NORTH = -0.25;

const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

// Fixed per seat, so a card doesn't change its resting angle between renders.
const jitterFor = (id: string) => `${[...id].reduce((sum, c) => sum + c.charCodeAt(0), 0) % 7 - 3}deg`;

export function PokerTable({ seats, cards, phase, verdict, children }: PokerTableProps) {
  const table = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(FALLBACK_SIZE);

  useLayoutEffect(() => {
    const element = table.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Every client rotates the same circle so that its own seat sits at the bottom.
  const ordered = useMemo(() => {
    const you = Math.max(seats.findIndex((seat) => seat.isYou), 0);
    return [...seats.slice(you), ...seats.slice(0, you)];
  }, [seats]);

  const positions = useMemo(
    () => ovalSeats(ordered.length, size.width / size.height),
    [ordered.length, size.width, size.height]
  );

  const outliers = useMemo(() => {
    const tags = new Map<string, "Low" | "High">();
    if (verdict?.kind === "debate") {
      verdict.low.forEach((b) => tags.set(b.participantId, "Low"));
      verdict.high.forEach((b) => tags.set(b.participantId, "High"));
    }
    return tags;
  }, [verdict]);

  const turned = phase !== "voting";

  return (
    <div class="table" ref={table} style={{ "--s": seatScale(ordered.length, size.width, size.height) }}>
      <div class="table-rail">
        <div class="table-felt" />
      </div>
      <div class="table-line" aria-hidden="true" />

      <div class="table-center">{children}</div>

      <ul class="contents" aria-label="Players at the table">
        {ordered.map((seat, index) => {
          const { cos, sin } = positions[index];
          const tag = outliers.get(seat.id);
          const agreed = verdict?.kind === "consensus" && seat.hasVoted;
          const position = {
            "--cos": cos,
            "--sin": sin,
            "--ox": inwardOffset(cos),
            "--oy": inwardOffset(sin),
          };
          const label = seat.isDealer ? "Dealer" : seat.name;

          return (
            <li key={seat.id} class="contents">
              <div
                class={`seat ${seat.isDealer ? "is-dealer" : ""} ${seat.isYou ? "is-you" : ""} ${
                  sin < NORTH ? "is-north" : ""
                }`}
                style={position}
              >
                <div class="seat-chip" aria-hidden="true">
                  {seat.isDealer ? <CrownIcon /> : initials(seat.name)}
                </div>
                <span class="seat-name">
                  {seat.isYou ? `You${seat.isDealer ? " · Dealer" : ""}` : label}
                </span>
                <span class="sr-only">
                  {seat.isDealer
                    ? ", deals this table"
                    : turned
                      ? seat.value
                        ? `, played ${seat.value}${tag ? `, ${tag.toLowerCase()} outlier` : ""}`
                        : ", no card played"
                      : seat.hasVoted
                        ? ", card played"
                        : ", still choosing"}
                </span>
              </div>

              {seat.isDealer ? (
                <div class="dealer-puck" style={position} aria-hidden="true">
                  D
                </div>
              ) : (
                <div
                  class={`seat-card ${turned && seat.value ? "is-turned" : ""} ${
                    phase === "sweeping" ? "is-swept" : ""
                  } ${tag && phase === "revealed" ? "is-outlier" : ""} ${agreed ? "is-agreed" : ""}`}
                  style={{
                    ...position,
                    "--jitter": jitterFor(seat.id),
                    "--sweep-x": `${-cos * size.width * 0.3}px`,
                    "--sweep-y": `${-sin * size.height * 0.26}px`,
                  }}
                  aria-hidden="true"
                >
                  <div class={`seat-slot ${phase === "revealed" && !seat.value ? "is-empty" : ""}`} />
                  {tag && phase === "revealed" && <span class="seat-tag">{tag}</span>}
                  {seat.hasVoted && (
                    <div class="card card--seat">
                      <div class="flip">
                        <div class="flip-inner">
                          <CardBack />
                          {seat.value && <SeatFace value={seat.value} suit={suitFor(seat.value, cards)} />}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
