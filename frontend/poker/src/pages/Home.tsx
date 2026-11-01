import { useEffect, useState } from "preact/hooks";
import { route } from "preact-router";
import type { RoutableProps } from "preact-router";
import { Room } from "../components/Room";
import { CardBack, CardFace, suitFor } from "../components/PlayingCard";

const SAMPLE = ["1", "2", "3", "5", "8"];
const FAN = [
  { x: -1.08, y: 0.1, tilt: -16 },
  { x: -0.56, y: 0.02, tilt: -8 },
  { x: 0, y: 0, tilt: 0 },
  { x: 0.56, y: 0.02, tilt: 8 },
  { x: 1.08, y: 0.1, tilt: 16 },
];

const FIRST_TURN_MS = 700;

export function Home(_props: RoutableProps) {
  const [turned, setTurned] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setTurned(true), FIRST_TURN_MS);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <Room title="Planning Poker">
      <div class="home">
        <button
          type="button"
          class="home-fan"
          onClick={() => setTurned(!turned)}
          aria-label={turned ? "Turn the sample cards face down" : "Turn the sample cards face up"}
        >
          {SAMPLE.map((value, i) => (
            <span
              key={value}
              class={`card ${turned ? "is-turned" : ""}`}
              style={{ "--x": FAN[i].x, "--y": FAN[i].y, "--tilt": `${FAN[i].tilt}deg` }}
            >
              <span class="flip">
                <span class="flip-inner block">
                  <CardBack />
                  <CardFace value={value} suit={suitFor(value, SAMPLE)} />
                </span>
              </span>
            </span>
          ))}
        </button>

        <div class="home-copy">
          <p class="t-label mb-3">Planning Poker</p>
          <h1 class="t-display mb-5">Nobody shows their hand early.</h1>
          <p class="mb-8 max-w-[34rem] text-lg text-ivory-dim">
            Real-time estimation for distributed teams. Every card stays face down until the dealer
            turns them all at once.
          </p>
          <div class="flex flex-col gap-3 sm:flex-row">
            <button type="button" class="btn btn-primary sm:min-w-44" onClick={() => route("/create")}>
              Open a table
            </button>
            <button type="button" class="btn btn-quiet sm:min-w-44" onClick={() => route("/join")}>
              Join a table
            </button>
          </div>
        </div>
      </div>
    </Room>
  );
}
