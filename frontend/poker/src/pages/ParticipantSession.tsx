import { useMemo } from "preact/hooks";
import { route } from "preact-router";
import type { RoutableProps } from "preact-router";
import { cardsFor } from "../lib/scales";
import { useTable } from "../lib/useTable";
import { Hand } from "../components/Hand";
import { SessionFrame } from "../components/SessionFrame";

interface ParticipantSessionProps extends RoutableProps {
  code?: string;
  participantId?: string;
  scale?: string;
}

export function ParticipantSession({ code, participantId, scale }: ParticipantSessionProps) {
  const cards = useMemo(() => cardsFor(scale), [scale]);
  const table = useTable(code, participantId, cards);

  const revealed = table.phase !== "voting";

  return (
    <SessionFrame
      table={table}
      code={code}
      scale={scale}
      cards={cards}
      isDealer={false}
      leaveLabel="Leave"
      leaveSheet={(close) => (
        <>
          <p class="mb-5">You can rejoin with the table code while the session is open.</p>
          <div class="flex gap-2">
            <button type="button" class="btn btn-primary flex-1" onClick={() => route("/")}>
              Leave table
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
          ? "Waiting for the dealer to reset."
          : table.myVote
            ? `You played ${table.myVote}. Change it any time before the turn.`
            : "Pick a card. It stays face down."}
      </p>
      <Hand
        cards={cards}
        selectedCard={table.myVote}
        onSelectCard={table.castVote}
        disabled={revealed}
      />
    </SessionFrame>
  );
}
