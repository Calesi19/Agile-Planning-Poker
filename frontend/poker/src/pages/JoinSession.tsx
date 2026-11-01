import { useState, useEffect } from "preact/hooks";
import { route } from "preact-router";
import type { RoutableProps } from "preact-router";
import { api } from "../lib/api";
import { storage } from "../lib/storage";
import { Room } from "../components/Room";

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

    if (!sessionCode.trim()) {
      setError("Enter the table code from your dealer.");
      return;
    }

    if (!name.trim()) {
      setError("Enter a name so the table knows who's playing.");
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
      setError(err instanceof Error ? err.message : "Couldn't join that table");
      setLoading(false);
    }
  };

  return (
    <Room title="Join a table · Planning Poker">
      <div class="panel-page">
        <div class="panel">
          <button type="button" class="back-link mb-2" onClick={() => route("/")}>
            ← Back
          </button>

          <h1 class="t-title mb-1">Take a seat</h1>
          <p class="mb-6 text-ivory-dim">Your dealer has the table code.</p>

          <form onSubmit={handleSubmit} class="flex flex-col gap-5" noValidate>
            <div>
              <label class="field-label t-label" for="table-code">
                Table code
              </label>
              <input
                id="table-code"
                type="text"
                value={sessionCode}
                onInput={(e) =>
                  setSessionCode((e.target as HTMLInputElement).value.toUpperCase())
                }
                placeholder="4K9ZPQ"
                class="field field-code"
                maxLength={8}
                disabled={loading}
                autoComplete="off"
                autoCapitalize="characters"
                spellcheck={false}
              />
            </div>

            <div>
              <label class="field-label t-label" for="display-name">
                Your name
              </label>
              <input
                id="display-name"
                type="text"
                value={name}
                onInput={(e) => setName((e.target as HTMLInputElement).value)}
                placeholder="What the table calls you"
                class="field"
                maxLength={32}
                disabled={loading}
                autoComplete="nickname"
              />
            </div>

            {error && (
              <div class="notice" role="alert">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} class="btn btn-primary w-full">
              {loading ? "Finding your seat…" : "Take a seat"}
            </button>
          </form>
        </div>
      </div>
    </Room>
  );
}
