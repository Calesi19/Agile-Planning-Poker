import { useState, useEffect } from "preact/hooks";
import { route } from "preact-router";
import type { RoutableProps } from "preact-router";
import { PlanningPokerConnection } from "../lib/signalr";
import { RevealCard } from "../components/RevealCard";
import type { Participant, VoteStatus, RevealResponse } from "../types";
import { QRCodeSVG } from "qrcode.react";

interface HostSessionProps extends RoutableProps {
  code?: string;
  participantId?: string;
  scale?: string;
}

export function HostSession({ code, participantId, scale }: HostSessionProps) {
  const [connection, setConnection] = useState<PlanningPokerConnection | null>(null);
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
        setConnection(conn);
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
    if (!connection) return;
    try {
      await connection.revealVotes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reveal votes");
    }
  };

  const handleReset = async () => {
    if (!connection) return;
    try {
      await connection.resetVotes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset votes");
    }
  };

  const handleEndSession = async () => {
    if (!connection) return;
    if (confirm("Are you sure you want to end this session? All participants will be disconnected.")) {
      try {
        await connection.endSession();
        route("/");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to end session");
      }
    }
  };

  const votedCount = voteStatuses.filter((s) => s.hasVoted && !s.isHost).length;
  const totalCount = participants.filter((p) => !p.isHost).length;
  const canReveal = !revealed;
  const joinUrl = `${window.location.origin}/#/join/${code}`;
  const [showQRModal, setShowQRModal] = useState(false);

  if (loading) {
    return (
      <div class="min-h-screen poker-table-bg flex items-center justify-center">
        <div class="text-white text-2xl">Connecting...</div>
      </div>
    );
  }

  return (
    <div class="min-h-screen poker-table-bg p-4 md:p-8">
      <div class="max-w-6xl mx-auto">
        {/* Header */}
        <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6 text-white">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div class="flex items-center gap-6">
              {/* QR Code - Clickable */}
              <button
                onClick={() => setShowQRModal(true)}
                class="bg-white p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                title="Click to view QR code"
              >
                <QRCodeSVG
                  value={joinUrl}
                  size={60}
                  level="M"
                  includeMargin={false}
                />
              </button>
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

        {/* Cards Grid - Always visible */}
        <div class="mb-6">
          <h2 class="text-3xl font-bold text-white mb-6">
            {revealed ? "Revealed Votes" : "Participants"}
          </h2>
          <div class="grid grid-cols-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {revealed && revealData ? (
              revealData.votes
                .filter((vote) => !vote.isHost)
                .map((vote, index) => (
                  <RevealCard
                    key={vote.participantId}
                    name={vote.name}
                    value={vote.value}
                    isHost={vote.isHost}
                    hasVoted={true}
                    revealed={revealed}
                    delay={index * 100}
                  />
                ))
            ) : (
              voteStatuses
                .filter((status) => !status.isHost)
                .map((status, index) => (
                  <RevealCard
                    key={status.participantId}
                    name={status.name}
                    value=""
                    isHost={status.isHost}
                    hasVoted={status.hasVoted}
                    revealed={revealed}
                    delay={index * 100}
                  />
                ))
            )}
          </div>
        </div>

        {/* Controls & Stats */}
        <div class="max-w-6xl mx-auto">
          <div class="grid md:grid-cols-2 gap-6">
            {/* Status & Statistics Card */}
            <div class="bg-white rounded-2xl shadow-xl p-6">
              <h3 class="text-lg font-bold text-gray-800 mb-3">
                {revealed ? "Statistics" : "Status"}
              </h3>
              {revealed && revealData ? (
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
              ) : (
                <div class="text-center">
                  <div class="text-4xl font-bold text-indigo-600 mb-2">
                    {votedCount}/{totalCount}
                  </div>
                  <div class="text-sm text-gray-600">votes cast</div>
                </div>
              )}
            </div>

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

        {/* QR Code Modal */}
        {showQRModal && (
          <div
            class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowQRModal(false)}
          >
            <div
              class="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-gray-800">Join Session</h2>
                <button
                  onClick={() => setShowQRModal(false)}
                  class="text-gray-400 hover:text-gray-600 text-3xl leading-none"
                >
                  ×
                </button>
              </div>

              <div class="flex flex-col items-center gap-6">
                {/* Large QR Code */}
                <div class="bg-white p-4 rounded-2xl border-4 border-gray-200">
                  <QRCodeSVG
                    value={joinUrl}
                    size={256}
                    level="H"
                    includeMargin={true}
                  />
                </div>

                {/* Session Code */}
                <div class="text-center">
                  <p class="text-sm text-gray-600 mb-2">Session Code:</p>
                  <div class="text-5xl font-bold text-indigo-600 tracking-wider">
                    {code}
                  </div>
                </div>

                {/* Instructions */}
                <div class="text-center text-sm text-gray-500 max-w-sm">
                  <p>Scan the QR code or share the session code with participants to join</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
