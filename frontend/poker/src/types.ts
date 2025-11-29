export interface Participant {
  id: string;
  name: string;
  isHost: boolean;
}

export interface SessionResponse {
  sessionCode: string;
  participantId: string;
  scale: string;
  cards: string[];
  participants: Participant[];
  revealed: boolean;
}

export interface VoteStatus {
  participantId: string;
  name: string;
  hasVoted: boolean;
  isHost: boolean;
}

export interface RevealedVote {
  participantId: string;
  name: string;
  value: string;
  isHost: boolean;
}

export interface VoteStats {
  min: string | null;
  max: string | null;
  average: number | null;
  counts: Record<string, number>;
  totalVotes: number;
}

export interface RevealResponse {
  votes: RevealedVote[];
  stats: VoteStats;
}

export type EstimationScale = "fibonacci" | "modifiedFibonacci" | "tshirt" | "powersOf2";
