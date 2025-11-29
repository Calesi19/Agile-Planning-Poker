import { useState, useEffect } from "preact/hooks";
import { route } from "preact-router";
import type { RoutableProps } from "preact-router";
import { PlanningPokerConnection } from "../lib/signalr";
import { api } from "../lib/api";
import type { Participant, VoteStatus, RevealResponse } from "../types";

interface HostSessionProps extends RoutableProps {
  code?: string;
  participantId?: string;
  scale?: string;
}

export function HostSession({ code, participantId, scale }: HostSessionProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [voteStatuses, setVoteStatuses] = useState<VoteStatus[]>([]);
  const [revealData, setRevealData] = useState<RevealResponse | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!code || !participantId || !scale) {
      route("/");
      return;
    }

    const conn = new PlanningPokerConnection(code, participantId);

    conn.onParticipantsUpdated((updatedParticipants) => {
      setParticipants(updatedParticipants);
    });

    conn.onVotingStatusUpdated((statuses) => {
      setVoteStatuses(statuses);
    });

    conn.onVotesRevealed((data) => {
      setRevealData(data);
      setRevealed(true);
    });

    conn.onVotesReset(() => {
      setRevealed(false);
      setRevealData(null);
      setVoteStatuses([]);
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

    return () => {
      conn.stop();
    };
  }, [code, participantId]);

  const handleReveal = async () => {
    if (!code) return;
    try {
      await api.reveal(code);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reveal votes");
    }
  };

  const handleReset = async () => {
    if (!code) return;
    try {
      await api.reset(code);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset votes");
    }
  };

  const handleEndSession = async () => {
    if (!code) return;
    if (confirm("Are you sure you want to end this session? All participants will be disconnected.")) {
      try {
        await api.endSession(code);
        route("/");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to end session");
      }
    }
  };

  const votedCount = voteStatuses.filter((s) => s.hasVoted).length;
  const totalCount = participants.length;
  const canReveal = !revealed && votedCount > 0;

  if (loading) {
    return (
      <div class="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center">
        <div class="text-white text-2xl">Connecting...</div>
      </div>
    );
  }

  return (
    <div class="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 p-4 md:p-8">
      <div class="max-w-6xl mx-auto">
        {/* Header */}
        <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6 text-white">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 class="text-3xl font-bold mb-2">Host View</h1>
              <div class="flex items-center gap-4">
                <div>
                  <span class="text-sm opacity-80">Session Code:</span>
                  <div class="text-4xl font-bold tracking-wider">{code}</div>
                </div>
                <div>
                  <span class="text-sm opacity-80">Method:</span>
                  <div class="text-xl font-semibold capitalize">
                    {scale?.replace(/([A-Z])/g, " $1").trim()}
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={handleEndSession}
              class="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              End Session
            </button>
          </div>
        </div>

        {error && (
          <div class="bg-red-500 text-white px-4 py-3 rounded-xl mb-6">{error}</div>
        )}

        <div class="grid md:grid-cols-3 gap-6">
          {/* Participants Panel */}
          <div class="md:col-span-2">
            <div class="bg-white rounded-2xl shadow-xl p-6">
              <h2 class="text-2xl font-bold text-gray-800 mb-4">
                Participants ({totalCount})
              </h2>

              <div class="space-y-2">
                {(revealed ? revealData?.votes || [] : voteStatuses).map((item) => {
                  const hasVoted = "hasVoted" in item ? item.hasVoted : true;
                  const value = "value" in item ? item.value : "";

                  return (
                    <div
                      key={item.participantId}
                      class="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                    >
                      <div class="flex items-center gap-3">
                        <div class="text-lg font-semibold text-gray-800">
                          {item.name}
                          {item.isHost && (
                            <span class="ml-2 text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                              HOST
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        {revealed && value ? (
                          <div class="text-2xl font-bold text-indigo-600 bg-indigo-100 px-4 py-2 rounded-lg">
                            {value}
                          </div>
                        ) : hasVoted ? (
                          <span class="text-green-600 font-semibold flex items-center gap-2">
                            <span class="w-3 h-3 bg-green-500 rounded-full"></span>
                            Voted
                          </span>
                        ) : (
                          <span class="text-gray-400 font-semibold flex items-center gap-2">
                            <span class="w-3 h-3 bg-gray-300 rounded-full"></span>
                            Waiting
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Controls & Stats Panel */}
          <div class="space-y-6">
            {/* Status Card */}
            <div class="bg-white rounded-2xl shadow-xl p-6">
              <h3 class="text-lg font-bold text-gray-800 mb-3">Status</h3>
              <div class="text-center">
                {revealed ? (
                  <div class="text-green-600 font-bold text-xl">Votes Revealed</div>
                ) : (
                  <>
                    <div class="text-4xl font-bold text-indigo-600 mb-2">
                      {votedCount}/{totalCount}
                    </div>
                    <div class="text-sm text-gray-600">votes cast</div>
                  </>
                )}
              </div>
            </div>

            {/* Stats Card */}
            {revealed && revealData && (
              <div class="bg-white rounded-2xl shadow-xl p-6">
                <h3 class="text-lg font-bold text-gray-800 mb-3">Statistics</h3>
                <div class="space-y-3">
                  {revealData.stats.min && (
                    <div class="flex justify-between">
                      <span class="text-gray-600">Min:</span>
                      <span class="font-bold text-gray-800">
                        {revealData.stats.min}
                      </span>
                    </div>
                  )}
                  {revealData.stats.max && (
                    <div class="flex justify-between">
                      <span class="text-gray-600">Max:</span>
                      <span class="font-bold text-gray-800">
                        {revealData.stats.max}
                      </span>
                    </div>
                  )}
                  {revealData.stats.average && (
                    <div class="flex justify-between">
                      <span class="text-gray-600">Average:</span>
                      <span class="font-bold text-gray-800">
                        {revealData.stats.average.toFixed(1)}
                      </span>
                    </div>
                  )}
                  <div class="pt-3 border-t border-gray-200">
                    <div class="text-sm font-semibold text-gray-700 mb-2">
                      Distribution:
                    </div>
                    {Object.entries(revealData.stats.counts).map(([value, count]) => (
                      <div key={value} class="flex justify-between text-sm mb-1">
                        <span class="text-gray-600">{value}:</span>
                        <span class="font-semibold text-gray-800">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Controls */}
            <div class="space-y-3">
              <button
                onClick={handleReveal}
                disabled={!canReveal}
                class="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg shadow-lg transition-all"
              >
                Reveal Votes
              </button>
              <button
                onClick={handleReset}
                class="w-full bg-amber-500 hover:bg-amber-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg transition-all"
              >
                Reset Votes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
