import { QRCodeSVG } from "qrcode.react";
import type { Ballot, RoundSummary } from "../lib/round";
import type { Phase, Seat } from "../lib/useTable";
import { Burst, ChipStack } from "./Chips";

interface TableCenterProps {
  seats: Seat[];
  phase: Phase;
  summary: RoundSummary | null;
  isDealer: boolean;
  joinUrl: string;
  onInvite: () => void;
}

function nameList(names: string[]): string {
  if (names.length <= 2) return names.join(" and ");
  return `${names[0]}, ${names[1]} and ${names.length - 2} more`;
}

const outliers = (ballots: Ballot[]) => {
  const names = nameList(ballots.map((b) => b.name));
  return `${names} (${ballots[0].value})`;
};

function Spread({ summary }: { summary: RoundSummary }) {
  return (
    <ul class="spread" aria-label="Votes by card">
      {summary.counts.map(([value, count]) => (
        <li key={value}>
          <strong class="font-semibold">{value}</strong> ×{count}
        </li>
      ))}
    </ul>
  );
}

function Verdict({ summary }: { summary: RoundSummary }) {
  const { verdict } = summary;

  switch (verdict.kind) {
    case "consensus":
      return (
        <div class="verdict">
          <Burst />
          <ChipStack />
          <div class="t-label verdict-title">Consensus reached</div>
          <div class="center-figure">Everyone's on {verdict.value}</div>
        </div>
      );
    case "debate":
      return (
        <div class="verdict">
          <div class="verdict-debate">High Stakes Debate</div>
          <div class="center-note">
            {outliers(verdict.low)} and {outliers(verdict.high)}, make your case.
          </div>
          <Spread summary={summary} />
        </div>
      );
    case "split":
      return (
        <div class="verdict">
          <div class="t-label verdict-title is-debate">Close call</div>
          <div class="center-note">Near enough to settle it in a sentence.</div>
          <Spread summary={summary} />
        </div>
      );
    default:
      return (
        <div class="verdict">
          <div class="t-label verdict-title is-debate">{summary.votes ? "No clear read" : "No cards played"}</div>
          {summary.votes > 0 && <Spread summary={summary} />}
        </div>
      );
  }
}

export function TableCenter({ seats, phase, summary, isDealer, joinUrl, onInvite }: TableCenterProps) {
  if (phase !== "voting" && summary) {
    return phase === "revealed" ? <Verdict summary={summary} /> : null;
  }

  const players = seats.filter((seat) => !seat.isDealer);
  const waiting = players.filter((seat) => !seat.hasVoted);

  if (players.length === 0) {
    return (
      <>
        <button type="button" class="invite-plate" onClick={onInvite} aria-label="Show the invite">
          <QRCodeSVG value={joinUrl} size={84} level="M" bgColor="#f7f3ea" fgColor="#14201c" />
        </button>
        <div class="center-note">Scan to take a seat</div>
      </>
    );
  }

  if (waiting.length === 0) {
    return (
      <>
        <div class="t-label">All cards in</div>
        <div class="center-figure">{isDealer ? "Your call" : "Dealer's call"}</div>
      </>
    );
  }

  return (
    <>
      <div class="t-label">Cards in</div>
      <div class="center-figure">
        {players.length - waiting.length} of {players.length}
      </div>
      <div class="center-note">Waiting on {nameList(waiting.map((seat) => seat.name))}</div>
    </>
  );
}
