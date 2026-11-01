import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import { route } from "preact-router";
import { PlanningPokerConnection } from "./signalr";
import { storage } from "./storage";
import { summarizeRound } from "./round";
import type { Ballot, RoundSummary } from "./round";
import type { Participant, RevealResponse, VoteStatus } from "../types";

// Matches the sweep transition in index.css.
const SWEEP_MS = 280;

// The hub ignores unknown tables without an error, so silence after joining means it's gone.
const SEATING_TIMEOUT_MS = 2000;

export type Phase = "voting" | "revealed" | "sweeping";
export type LinkStatus = "connecting" | "live" | "reconnecting" | "failed";

export interface Seat {
  id: string;
  name: string;
  isDealer: boolean;
  isYou: boolean;
  hasVoted: boolean;
  value: string;
}

export function useTable(code?: string, participantId?: string, scaleCards: string[] = []) {
  const connection = useRef<PlanningPokerConnection | null>(null);
  const sweepTimer = useRef<number | undefined>(undefined);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [voteStatuses, setVoteStatuses] = useState<VoteStatus[]>([]);
  const [revealData, setRevealData] = useState<RevealResponse | null>(null);
  const [phase, setPhase] = useState<Phase>("voting");
  const [status, setStatus] = useState<LinkStatus>("connecting");
  const [myVote, setMyVote] = useState<string | undefined>(undefined);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!code || !participantId) {
      route("/");
      return;
    }

    const conn = new PlanningPokerConnection(code, participantId, storage.getHostKey(code));
    connection.current = conn;

    let seated = false;
    let seatingTimer: number | undefined;

    conn.onParticipantsUpdated((updated) => {
      seated = true;
      setParticipants(updated);
    });
    conn.onVotingStatusUpdated(setVoteStatuses);

    conn.onVotesRevealed((data) => {
      window.clearTimeout(sweepTimer.current);
      setRevealData(data);
      setPhase("revealed");
    });

    conn.onVotesReset(() => {
      // Voting status follows immediately, so only the revealed cards wait out the sweep.
      setVoteStatuses([]);
      setMyVote(undefined);
      setPhase("sweeping");
      sweepTimer.current = window.setTimeout(() => {
        setRevealData(null);
        setPhase("voting");
      }, SWEEP_MS);
    });

    conn.onSessionEnded(() => route("/"));
    conn.onReconnecting(() => setStatus("reconnecting"));
    conn.onReconnected(() => {
      // Anything missed while away comes back from the rejoin, including a reveal.
      setRevealData(null);
      setPhase("voting");
      setStatus("live");
    });
    conn.onClose(() => setStatus("failed"));

    conn
      .start()
      .then(() => {
        setStatus("live");
        seatingTimer = window.setTimeout(() => {
          if (!seated) setStatus("failed");
        }, SEATING_TIMEOUT_MS);
      })
      .catch((err) => {
        setStatus("failed");
        console.error(err);
      });

    return () => {
      window.clearTimeout(sweepTimer.current);
      window.clearTimeout(seatingTimer);
      conn.stop();
    };
  }, [code, participantId]);

  const seats = useMemo<Seat[]>(
    () =>
      participants.map((p) => {
        const vote = revealData?.votes.find((v) => v.participantId === p.id);
        const voted = voteStatuses.find((s) => s.participantId === p.id)?.hasVoted ?? false;
        const isYou = p.id === participantId;

        return {
          id: p.id,
          name: p.name,
          isDealer: p.isHost,
          isYou,
          hasVoted: vote ? Boolean(vote.value) : voted || (isYou && myVote !== undefined),
          value: vote?.value ?? "",
        };
      }),
    [participants, voteStatuses, revealData, participantId, myVote]
  );

  const summary = useMemo<RoundSummary | null>(() => {
    if (!revealData) return null;
    const ballots: Ballot[] = revealData.votes.filter((v) => !v.isHost && v.value);
    return summarizeRound(ballots, scaleCards);
  }, [revealData, scaleCards]);

  const attempt = async (action: (conn: PlanningPokerConnection) => Promise<void>, fallback: string) => {
    if (!connection.current) return false;
    setError("");
    try {
      await action(connection.current);
      return true;
    } catch (err) {
      setError(err instanceof Error ? (err.message.split("HubException: ").pop() ?? fallback) : fallback);
      return false;
    }
  };

  const castVote = async (value: string) => {
    if (phase !== "voting") return;
    const previous = myVote;
    setMyVote(value);
    if (!(await attempt((conn) => conn.castVote(value), "Your card didn't reach the table"))) {
      setMyVote(previous);
    }
  };

  return {
    seats,
    summary,
    phase,
    status,
    myVote,
    error,
    castVote,
    reveal: () => attempt((conn) => conn.revealVotes(), "Couldn't turn the cards"),
    reset: () => attempt((conn) => conn.resetVotes(), "Couldn't reset the table"),
    endSession: () => attempt((conn) => conn.endSession(), "Couldn't close the table"),
  };
}
