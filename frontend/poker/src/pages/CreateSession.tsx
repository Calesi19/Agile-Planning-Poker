import { useState } from "preact/hooks";
import { route } from "preact-router";
import type { RoutableProps } from "preact-router";
import { api } from "../lib/api";
import { storage } from "../lib/storage";
import { SCALE_CARDS, SCALE_LABELS } from "../lib/scales";
import { Room } from "../components/Room";
import type { EstimationScale } from "../types";

const SCALE_ORDER = Object.keys(SCALE_LABELS) as EstimationScale[];

export function CreateSession(_props: RoutableProps) {
  const [scale, setScale] = useState<EstimationScale>("fibonacci");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // The host deals rather than votes, so they're shown as "Dealer", not by name
      const session = await api.createSession(scale, "Host");
      storage.setHostKey(session.sessionCode, session.hostKey ?? "");

      route(
        `/host/${session.sessionCode}?participantId=${session.participantId}&scale=${session.scale}`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't open the table");
      setLoading(false);
    }
  };

  return (
    <Room title="Open a table · Planning Poker">
      <div class="panel-page">
        <div class="panel" style={{ "--panel-width": "32rem" }}>
          <button type="button" class="back-link mb-2" onClick={() => route("/")}>
            ← Back
          </button>

          <h1 class="t-title mb-1">Open a table</h1>
          <p class="mb-6 text-ivory-dim">You deal. Your team plays the cards.</p>

          <form onSubmit={handleSubmit} class="flex flex-col gap-6">
            <fieldset class="m-0 border-0 p-0">
              <legend class="t-label mb-3 p-0">Choose a deck</legend>
              <div class="flex flex-col gap-2">
                {SCALE_ORDER.map((option) => (
                  <label key={option} class={`deck-option ${scale === option ? "is-selected" : ""}`}>
                    <input
                      type="radio"
                      name="scale"
                      value={option}
                      checked={scale === option}
                      onChange={() => setScale(option)}
                      class="sr-only"
                      disabled={loading}
                    />
                    <span class="deck-tick" aria-hidden="true" />
                    <span class="min-w-0">
                      <span class="block font-semibold">{SCALE_LABELS[option]}</span>
                      <span class="block text-[0.8125rem] text-ivory-dim">
                        {SCALE_CARDS[option].join("  ·  ")}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            {error && (
              <div class="notice" role="alert">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} class="btn btn-primary w-full">
              {loading ? "Setting the table…" : "Open the table"}
            </button>
          </form>
        </div>
      </div>
    </Room>
  );
}
