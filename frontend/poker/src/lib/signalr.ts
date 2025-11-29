import * as signalR from "@microsoft/signalr";
import { HUB_URL } from "./api";
import type { Participant, VoteStatus, RevealResponse } from "../types";

export class PlanningPokerConnection {
  private connection: signalR.HubConnection;
  private sessionCode: string;
  private participantId: string;

  constructor(sessionCode: string, participantId: string) {
    this.sessionCode = sessionCode;
    this.participantId = participantId;

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL)
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();
  }

  async start(): Promise<void> {
    try {
      await this.connection.start();
      console.log("SignalR connected");
      await this.connection.invoke("JoinSession", this.sessionCode, this.participantId);
      console.log("Joined session:", this.sessionCode);
    } catch (err) {
      console.error("Error starting connection:", err);
      throw err;
    }
  }

  async stop(): Promise<void> {
    if (this.connection.state !== signalR.HubConnectionState.Disconnected) {
      await this.connection.stop();
      console.log("SignalR disconnected");
    }
  }

  async castVote(value: string): Promise<void> {
    try {
      await this.connection.invoke("CastVote", this.sessionCode, this.participantId, value);
    } catch (err) {
      console.error("Error casting vote:", err);
      throw err;
    }
  }

  async revealVotes(): Promise<void> {
    try {
      await this.connection.invoke("RevealVotes", this.sessionCode);
    } catch (err) {
      console.error("Error revealing votes:", err);
      throw err;
    }
  }

  async resetVotes(): Promise<void> {
    try {
      await this.connection.invoke("ResetVotes", this.sessionCode);
    } catch (err) {
      console.error("Error resetting votes:", err);
      throw err;
    }
  }

  async endSession(): Promise<void> {
    try {
      await this.connection.invoke("EndSession", this.sessionCode);
    } catch (err) {
      console.error("Error ending session:", err);
      throw err;
    }
  }

  onParticipantsUpdated(callback: (participants: Participant[]) => void): void {
    this.connection.on("ParticipantsUpdated", callback);
  }

  onVotingStatusUpdated(callback: (statuses: VoteStatus[]) => void): void {
    this.connection.on("VotingStatusUpdated", callback);
  }

  onVotesRevealed(callback: (response: RevealResponse) => void): void {
    this.connection.on("VotesRevealed", callback);
  }

  onVotesReset(callback: () => void): void {
    this.connection.on("VotesReset", callback);
  }

  onSessionEnded(callback: () => void): void {
    this.connection.on("SessionEnded", callback);
  }

  onReconnecting(callback: (error?: Error) => void): void {
    this.connection.onreconnecting(callback);
  }

  onReconnected(callback: (connectionId?: string) => void): void {
    this.connection.onreconnected(callback);
  }

  onClose(callback: (error?: Error) => void): void {
    this.connection.onclose(callback);
  }
}
