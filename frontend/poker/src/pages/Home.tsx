import { route } from "preact-router";
import type { RoutableProps } from "preact-router";

export function Home(_props: RoutableProps) {
  return (
    <div class="min-h-screen poker-table-bg flex items-center justify-center p-4">
      <div class="max-w-md w-full">
        <div class="text-center mb-12">
          <h1 class="text-6xl font-bold text-white mb-4 drop-shadow-lg">
            Planning Poker
          </h1>
          <p class="text-xl text-white/90 drop-shadow">
            Real-time agile estimation for distributed teams
          </p>
        </div>

        <div class="space-y-4">
          <button
            onClick={() => route("/create")}
            class="w-full bg-white text-indigo-600 rounded-2xl py-6 px-8 text-2xl font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 active:scale-95"
          >
            Create Session
          </button>

          <button
            onClick={() => route("/join")}
            class="w-full bg-white/10 backdrop-blur-sm text-white border-2 border-white rounded-2xl py-6 px-8 text-2xl font-bold shadow-xl hover:bg-white/20 transform hover:scale-105 transition-all duration-200 active:scale-95"
          >
            Join Session
          </button>
        </div>

        <div class="mt-12 text-center text-white/70 text-sm">
          <p>Created for agile teams doing sprint planning</p>
        </div>
      </div>
    </div>
  );
}
