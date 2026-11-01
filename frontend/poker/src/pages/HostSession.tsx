import { useMemo, useRef } from "preact/hooks";
import { route } from "preact-router";
import type { RoutableProps } from "preact-router";
import { cardsFor } from "../lib/scales";
import { useTable } from "../lib/useTable";
import { SessionFrame } from "../components/SessionFrame";

interface HostSessionProps extends RoutableProps {
  code?: string;
  participantId?: string;
  scale?: string;
}

export function HostSession({ code, participantId, scale }: HostSessionProps) {
  const cards = useMemo(() => cardsFor(scale), [scale]);
  const table = useTable(code, participantId, cards);
  const resetButton = useRef<HTMLButtonElement>(null);

  const revealed = table.phase !== "voting";
  const anyVotes = table.seats.some((seat) => !seat.isDealer && seat.hasVoted);

  // Reveal disables itself once pressed, so keyboard focus moves on to the next action.
  const handleReveal = async () => {
    if (await table.reveal()) resetButton.current?.focus();
  };

  const handleEndSession = async () => {
    if (await table.endSession()) route("/");
  };

  return (
    <SessionFrame
      table={table}
      code={code}
      scale={scale}
      cards={cards}
      isDealer
      leaveLabel="End session"
      leaveSheet={(close) => (
        <>
          <p class="mb-5">This closes the table for everyone seated at it.</p>
          <div class="flex gap-2">
            <button type="button" class="btn btn-primary flex-1" onClick={handleEndSession}>
              End session
            </button>
            <button type="button" class="btn btn-quiet flex-1" onClick={close}>
              Stay
            </button>
          </div>
        </>
      )}
    >
      <p class="dock-note" aria-live="polite">
        {revealed
          ? "Talk it through, then deal the next story."
          : anyVotes
            ? "Only you can turn the cards."
            : "The first card lands when someone votes."}
      </p>
      <div class="dock-actions">
        <button
          type="button"
          class={`btn ${revealed ? "btn-quiet" : "btn-primary"}`}
          onClick={handleReveal}
          disabled={revealed || !anyVotes}
        >
          Reveal Votes
        </button>
        <button
          ref={resetButton}
          type="button"
          class={`btn ${revealed ? "btn-primary" : "btn-quiet"}`}
          onClick={table.reset}
        >
          Reset for Next Story
        </button>
      </div>
    </SessionFrame>
  );
}
