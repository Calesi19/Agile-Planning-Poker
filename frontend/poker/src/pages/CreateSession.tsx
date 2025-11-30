import { useState } from "preact/hooks";
import { route } from "preact-router";
import type { RoutableProps } from "preact-router";
import { api } from "../lib/api";
import type { EstimationScale } from "../types";

const SCALE_OPTIONS: { value: EstimationScale; label: string; description: string }[] = [
  {
    value: "fibonacci",
    label: "Fibonacci",
    description: "0, 1, 2, 3, 5, 8, 13, 21, 34, ?, ☕",
  },
  {
    value: "modifiedFibonacci",
    label: "Modified Fibonacci",
    description: "0, 0.5, 1, 2, 3, 5, 8, 13, 20, 40, 100, ?, ☕",
  },
  {
    value: "tshirt",
    label: "T-Shirt Sizes",
    description: "XS, S, M, L, XL, XXL, ?, ☕",
  },
  {
    value: "powersOf2",
    label: "Powers of 2",
    description: "1, 2, 4, 8, 16, 32, 64, ?, ☕",
  },
];

export function CreateSession(_props: RoutableProps) {
  const [scale, setScale] = useState<EstimationScale>("fibonacci");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Host doesn't need a display name since they won't appear in the participant grid
      const session = await api.createSession(scale, "Host");

      route(
        `/host/${session.sessionCode}?participantId=${session.participantId}&scale=${session.scale}`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create session");
      setLoading(false);
    }
  };

  return (
    <div class="min-h-screen poker-table-bg flex items-center justify-center p-4">
      <div class="max-w-2xl w-full">
        <button
          onClick={() => route("/")}
          class="mb-6 text-white/80 hover:text-white flex items-center gap-2 text-lg"
        >
          ← Back
        </button>

        <div class="bg-white rounded-3xl shadow-2xl p-8">
          <h1 class="text-4xl font-bold text-gray-800 mb-2">Create Session</h1>
          <p class="text-gray-600 mb-8">Set up a new planning poker session</p>

          <form onSubmit={handleSubmit} class="space-y-6">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-3">
                Estimation Method
              </label>
              <div class="space-y-3">
                {SCALE_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    class={`
                      block p-4 rounded-xl border-2 cursor-pointer transition-all
                      ${
                        scale === option.value
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-gray-200 hover:border-emerald-300"
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name="scale"
                      value={option.value}
                      checked={scale === option.value}
                      onChange={() => setScale(option.value)}
                      class="sr-only"
                      disabled={loading}
                    />
                    <div class="flex items-start">
                      <div
                        class={`
                        w-5 h-5 rounded-full border-2 mr-3 mt-0.5 flex items-center justify-center
                        ${
                          scale === option.value
                            ? "border-emerald-500 bg-emerald-500"
                            : "border-gray-300"
                        }
                      `}
                      >
                        {scale === option.value && (
                          <div class="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                      <div class="flex-1">
                        <div class="font-semibold text-gray-800">{option.label}</div>
                        <div class="text-sm text-gray-600 mt-1">
                          {option.description}
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {error && (
              <div class="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              class="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl py-4 px-8 text-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? "Creating..." : "Create Session"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
