namespace Poker.Api.Models;

// Request DTOs
public record CreateSessionRequest(string Scale, string HostName);
public record JoinSessionRequest(string Name);
public record VoteRequest(string ParticipantId, string Value);

// Response DTOs
public record ParticipantDto(string Id, string Name, bool IsHost);

public record SessionResponse(
    string SessionCode,
    string ParticipantId,
    string Scale,
    string[] Cards,
    List<ParticipantDto> Participants,
    bool Revealed
);

public record VoteStatusDto(string ParticipantId, string Name, bool HasVoted, bool IsHost);

public record RevealedVoteDto(string ParticipantId, string Name, string Value, bool IsHost);

public record VoteStatsDto(
    string? Min,
    string? Max,
    double? Average,
    Dictionary<string, int> Counts,
    int TotalVotes
);

public record RevealResponse(
    List<RevealedVoteDto> Votes,
    VoteStatsDto Stats
);
