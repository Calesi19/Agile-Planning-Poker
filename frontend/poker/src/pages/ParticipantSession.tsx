import { useState, useEffect } from "preact/hooks";
import { route } from "preact-router";
import type { RoutableProps } from "preact-router";
import { PlanningPokerConnection } from "../lib/signalr";
import { CardGrid } from "../components/CardGrid";
import { RevealCard } from "../components/RevealCard";
import type { RevealResponse, EstimationScale } from "../types";

interface ParticipantSessionProps extends RoutableProps {
  code?: string;
  participantId?: string;
  scale?: string;
}

const SCALE_CARDS: Record<EstimationScale, string[]> = {
  fibonacci: ["0", "1", "2", "3", "5", "8", "13", "21", "34", "?", "☕"],
  modifiedFibonacci: ["0", "0.5", "1", "2", "3", "5", "8", "13", "20", "40", "100", "?", "☕"],
  tshirt: ["XS", "S", "M", "L", "XL", "XXL", "?", "☕"],
  powersOf2: ["1", "2", "4", "8", "16", "32", "64", "?", "☕"],
};

export function ParticipantSession({ code, participantId, scale }: ParticipantSessionProps) {
  const [connection, setConnection] = useState<PlanningPokerConnection | null>(null);
  const [selectedCard, setSelectedCard] = useState<string | undefined>(undefined);
  const [revealData, setRevealData] = useState<RevealResponse | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [participantName, setParticipantName] = useState("");

  const cards = scale ? SCALE_CARDS[scale as EstimationScale] : [];

  useEffect(() => {
    if (!code || !participantId || !scale) {
      route("/");
      return;
    }

    const conn = new PlanningPokerConnection(code, participantId);

    conn.onParticipantsUpdated((participants) => {
      const self = participants.find((p) => p.id === participantId);
      if (self) {
        setParticipantName(self.name);
      }
    });

    conn.onVotesRevealed((data) => {
      setRevealData(data);
      setRevealed(true);
    });

    conn.onVotesReset(() => {
      setRevealed(false);
      setRevealData(null);
      setSelectedCard(undefined);
    });

    conn.onSessionEnded(() => {
      route("/");
    });

    conn
      .start()
      .then(() => {
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to connect to session");
        console.error(err);
      });

    setConnection(conn);

    return () => {
      conn.stop();
    };
  }, [code, participantId]);

  const handleSelectCard = async (value: string) => {
    if (revealed || !connection) return;

    setSelectedCard(value);

    try {
      await connection.castVote(value);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cast vote");
      setSelectedCard(undefined);
    }
  };

  if (loading) {
    return (
      <div class="min-h-screen poker-table-bg flex items-center justify-center">
        <div class="text-white text-2xl">Connecting...</div>
      </div>
    );
  }

  const myVote = revealData?.votes.find((v) => v.participantId === participantId);

  return (
    <div class="min-h-screen poker-table-bg p-4">
      <div class="max-w-4xl mx-auto">
        {/* Header */}
        <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-6 text-white">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div>
                <span class="text-xs opacity-80">Session</span>
                <div class="text-2xl font-bold tracking-wider">{code}</div>
              </div>
              {participantName && (
                <div class="border-l border-white/30 pl-4">
                  <span class="text-xs opacity-80">You</span>
                  <div class="text-lg font-semibold">{participantName}</div>
                </div>
              )}
            </div>
            <button
              onClick={() => {
                if (confirm("Are you sure you want to leave this session?")) {
                  route("/");
                }
              }}
              class="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              Leave
            </button>
          </div>
        </div>

        {error && (
          <div class="bg-red-500 text-white px-4 py-3 rounded-xl mb-6">{error}</div>
        )}

        {/* Status Banner */}
        <div class="text-center mb-8">
          {revealed ? (
            <div class="bg-white rounded-2xl shadow-xl p-6 inline-block max-w-md w-full">
              <div class="text-2xl font-bold text-green-600 mb-4">Votes Revealed!</div>
              <div class="grid grid-cols-4 gap-3 text-center">
                {myVote && myVote.value && (
                  <div>
                    <div class="text-xs text-gray-500 mb-1">You</div>
                    <div class="text-2xl font-bold text-indigo-600">{myVote.value}</div>
                  </div>
                )}
                {revealData?.stats.min && (
                  <div>
                    <div class="text-xs text-gray-500 mb-1">Min</div>
                    <div class="text-2xl font-bold text-blue-600">{revealData.stats.min}</div>
                  </div>
                )}
                {revealData?.stats.max && (
                  <div>
                    <div class="text-xs text-gray-500 mb-1">Max</div>
                    <div class="text-2xl font-bold text-purple-600">{revealData.stats.max}</div>
                  </div>
                )}
                {revealData?.stats.average && (
                  <div>
                    <div class="text-xs text-gray-500 mb-1">Avg</div>
                    <div class="text-2xl font-bold text-green-600">
                      {revealData.stats.average.toFixed(1)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : selectedCard ? (
            <div class="bg-white rounded-2xl shadow-xl p-6 inline-block">
              <div class="text-xl font-semibold text-gray-700 mb-2">
                You voted: <span class="text-indigo-600 text-3xl">{selectedCard}</span>
              </div>
              <div class="text-gray-500">Waiting for host to reveal...</div>
            </div>
          ) : (
            <div class="bg-white rounded-2xl shadow-xl p-6 inline-block">
              <div class="text-xl font-bold text-gray-700">Choose your estimate</div>
              <div class="text-gray-500 mt-1">Tap a card below</div>
            </div>
          )}
        </div>

        {/* Cards */}
        {!revealed && (
          <div class="mb-8">
            <CardGrid
              cards={cards}
              selectedCard={selectedCard}
              onSelectCard={handleSelectCard}
              disabled={revealed}
            />
          </div>
        )}

        {/* Revealed Results */}
        {revealed && revealData && (
          <div>
            {/* Cards Grid */}
            <div class="grid grid-cols-4 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {revealData.votes
                .filter((vote) => !vote.isHost)
                .map((vote, index) => (
                  <div
                    key={vote.participantId}
                    class={vote.participantId === participantId ? "ring-4 ring-yellow-400 rounded-2xl" : ""}
                  >
                    <RevealCard
                      name={vote.name}
                      value={vote.value}
                      isHost={vote.isHost}
                      hasVoted={true}
                      revealed={revealed}
                      delay={index * 100}
                    />
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
