import { useState } from "preact/hooks";
import { route } from "preact-router";
import type { ComponentChildren } from "preact";
import { QRCodeSVG } from "qrcode.react";
import { labelFor } from "../lib/scales";
import type { useTable } from "../lib/useTable";
import { PokerTable } from "./PokerTable";
import { TableCenter } from "./TableCenter";
import { Ticker } from "./Ticker";
import { Sheet } from "./Sheet";
import { Room } from "./Room";

interface SessionFrameProps {
  table: ReturnType<typeof useTable>;
  code?: string;
  scale?: string;
  cards: string[];
  isDealer: boolean;
  leaveLabel: string;
  leaveSheet: (close: () => void) => ComponentChildren;
  children: ComponentChildren;
}

function RoundAnnouncement({ table }: { table: SessionFrameProps["table"] }) {
  const { phase, summary } = table;
  let message = "";

  if (phase === "revealed" && summary) {
    const verdict =
      summary.verdict.kind === "consensus"
        ? `Consensus on ${summary.verdict.value}.`
        : summary.verdict.kind === "debate"
          ? "High stakes debate."
          : "";
    message = `Cards turned. ${verdict} Average ${summary.average ?? "not available"}, median ${
      summary.median ?? "not available"
    }, agreement ${summary.agreement} percent.`;
  }

  return (
    <div class="sr-only" role="status">
      {message}
    </div>
  );
}

export function SessionFrame({
  table,
  code,
  scale,
  cards,
  isDealer,
  leaveLabel,
  leaveSheet,
  children,
}: SessionFrameProps) {
  const [sheet, setSheet] = useState<"invite" | "leave" | null>(null);
  const [copied, setCopied] = useState(false);
  const joinUrl = `${window.location.origin}${window.location.pathname}#/join/${code}`;
  const title = `Table ${code} · Planning Poker`;

  const closeSheet = () => {
    setSheet(null);
    setCopied(false);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(joinUrl);
    setCopied(true);
  };

  if (table.status === "connecting") {
    return (
      <Room title={title}>
        <div class="panel-page" role="status">
          <p class="t-title">Taking your seat…</p>
        </div>
      </Room>
    );
  }

  if (table.status === "failed") {
    return (
      <Room title={title}>
        <div class="panel-page">
          <div class="panel text-center">
            <h1 class="t-title mb-2">This table's gone quiet</h1>
            <p class="mb-6 text-ivory-dim">We lost the connection, or this table has closed.</p>
            <button type="button" class="btn btn-primary" onClick={() => route("/")}>
              Back to the lobby
            </button>
          </div>
        </div>
      </Room>
    );
  }

  return (
    <Room title={title} flare={table.phase === "revealed"}>
      <div class="session">
        <header class="session-bar">
          <div class="min-w-0">
            <h1 class="session-title truncate font-display text-lg font-semibold leading-tight sm:text-xl">
              <span class="max-[360px]:sr-only">Table </span>
              {code}
            </h1>
            <p class="truncate text-[0.8125rem] text-ivory-dim">{labelFor(scale)} deck</p>
          </div>
          {table.status === "reconnecting" && (
            <span class="link-status" role="status">
              Reconnecting…
            </span>
          )}
          <div class="flex flex-none gap-2">
            <button type="button" class="btn btn-quiet btn-small" onClick={() => setSheet("invite")}>
              Invite
            </button>
            <button type="button" class="btn btn-quiet btn-small" onClick={() => setSheet("leave")}>
              {leaveLabel}
            </button>
          </div>
        </header>

        <Ticker summary={table.summary} />

        <section class="table-stage session-stage" aria-label="Poker table">
          <PokerTable seats={table.seats} cards={cards} phase={table.phase} verdict={table.summary?.verdict}>
            <TableCenter
              seats={table.seats}
              phase={table.phase}
              summary={table.summary}
              isDealer={isDealer}
              joinUrl={joinUrl}
              onInvite={() => setSheet("invite")}
            />
          </PokerTable>
        </section>

        <div class="dock">
          {table.error && (
            <div class="notice" role="alert">
              {table.error}
            </div>
          )}
          {children}
        </div>
      </div>

      <RoundAnnouncement table={table} />

      {sheet === "invite" && (
        <Sheet title="Invite the team" onClose={closeSheet}>
          <div class="flex flex-col items-center gap-4">
            <div class="invite-plate">
              <QRCodeSVG value={joinUrl} size={196} level="H" bgColor="#f7f3ea" fgColor="#14201c" />
            </div>
            <div class="text-center">
              <div class="t-label">Table code</div>
              <div class="font-display text-4xl font-semibold tracking-[0.14em]">{code}</div>
            </div>
            <div class="flex w-full gap-2">
              <button type="button" class="btn btn-primary flex-1" onClick={copyLink}>
                {copied ? "Link copied" : "Copy link"}
              </button>
              <button type="button" class="btn btn-quiet flex-1" onClick={closeSheet}>
                Done
              </button>
            </div>
          </div>
        </Sheet>
      )}

      {sheet === "leave" && <Sheet title={`${leaveLabel}?`} onClose={closeSheet}>{leaveSheet(closeSheet)}</Sheet>}
    </Room>
  );
}
