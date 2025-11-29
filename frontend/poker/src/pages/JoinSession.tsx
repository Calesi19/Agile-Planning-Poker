import { useState, useEffect } from "preact/hooks";
import { route } from "preact-router";
import type { RoutableProps } from "preact-router";
import { api } from "../lib/api";
import { storage } from "../lib/storage";

interface JoinSessionProps extends RoutableProps {
  code?: string;
}

export function JoinSession({ code }: JoinSessionProps) {
  const [name, setName] = useState(storage.getDisplayName());
  const [sessionCode, setSessionCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Pre-fill session code if provided in URL
  useEffect(() => {
    if (code) {
      setSessionCode(code.toUpperCase());
    }
  }, [code]);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    if (!sessionCode.trim()) {
      setError("Please enter a session code");
      return;
    }

    setLoading(true);

    try {
      storage.setDisplayName(name.trim());
      const session = await api.joinSession(sessionCode.trim().toUpperCase(), name.trim());

      route(
        `/participant/${session.sessionCode}?participantId=${session.participantId}&scale=${session.scale}`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join session");
      setLoading(false);
    }
  };

  return (
    <div class="min-h-screen bg-gradient-to-br from-orange-500 via-rose-500 to-pink-500 flex items-center justify-center p-4">
      <div class="max-w-md w-full">
        <button
          onClick={() => route("/")}
          class="mb-6 text-white/80 hover:text-white flex items-center gap-2 text-lg"
        >
          ← Back
        </button>

        <div class="bg-white rounded-3xl shadow-2xl p-8">
          <h1 class="text-4xl font-bold text-gray-800 mb-2">Join Session</h1>
          <p class="text-gray-600 mb-8">Enter the session code to join</p>

          <form onSubmit={handleSubmit} class="space-y-6">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Session Code
              </label>
              <input
                type="text"
                value={sessionCode}
                onInput={(e) =>
                  setSessionCode((e.target as HTMLInputElement).value.toUpperCase())
                }
                placeholder="e.g., 4K9ZPQ"
                class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-rose-500 focus:outline-none text-2xl font-bold text-center tracking-wider uppercase"
                maxLength={8}
                disabled={loading}
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onInput={(e) => setName((e.target as HTMLInputElement).value)}
                placeholder="Enter your display name"
                class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-rose-500 focus:outline-none text-lg"
                disabled={loading}
              />
            </div>

            {error && (
              <div class="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              class="w-full bg-rose-500 hover:bg-rose-600 text-white rounded-xl py-4 px-8 text-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? "Joining..." : "Join Session"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
