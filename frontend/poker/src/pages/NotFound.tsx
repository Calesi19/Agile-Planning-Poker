import { route } from "preact-router";
import type { RoutableProps } from "preact-router";
import { Room } from "../components/Room";

export function NotFound(_props: RoutableProps) {
  return (
    <Room title="Misdeal · Planning Poker">
      <div class="panel-page">
        <div class="panel text-center">
          <h1 class="t-title mb-2">Misdeal</h1>
          <p class="mb-6 text-ivory-dim">That page isn't in the deck.</p>
          <button type="button" class="btn btn-primary" onClick={() => route("/")}>
            Back to the lobby
          </button>
        </div>
      </div>
    </Room>
  );
}
