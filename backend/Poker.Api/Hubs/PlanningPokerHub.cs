using Microsoft.AspNetCore.SignalR;
using Poker.Api.Models;
using Poker.Api.Services;

namespace Poker.Api.Hubs;

public class PlanningPokerHub : Hub
{
    private readonly InMemorySessionStore _sessionStore;
    private readonly ILogger<PlanningPokerHub> _logger;

    public PlanningPokerHub(InMemorySessionStore sessionStore, ILogger<PlanningPokerHub> logger)
    {
        _sessionStore = sessionStore;
        _logger = logger;
    }

    public async Task JoinSession(string sessionCode, string participantId)
    {
        var session = _sessionStore.GetSession(sessionCode);
        if (session == null)
        {
            _logger.LogWarning("Attempt to join non-existent session: {SessionCode}", sessionCode);
            return;
        }

        await Groups.AddToGroupAsync(Context.ConnectionId, sessionCode);
        session.UpdateActivity();

        _logger.LogInformation(
            "Participant {ParticipantId} joined session {SessionCode}",
            participantId,
            sessionCode
        );

        // Broadcast updated participant list to all clients in the session
        await BroadcastParticipants(sessionCode, session);
    }

    public async Task CastVote(string sessionCode, string participantId, string value)
    {
        var session = _sessionStore.GetSession(sessionCode);
        if (session == null || !session.Participants.ContainsKey(participantId))
        {
            return;
        }

        // Don't allow voting if session is revealed
        if (session.Revealed)
        {
            _logger.LogWarning(
                "Attempt to vote in revealed session: {SessionCode} by {ParticipantId}",
                sessionCode,
                participantId
            );
            return;
        }

        session.Votes[participantId] = value;
        session.UpdateActivity();

        _logger.LogInformation(
            "Participant {ParticipantId} voted in session {SessionCode}",
            participantId,
            sessionCode
        );

        // Broadcast voting status (who has voted, but not the values)
        await BroadcastVotingStatus(sessionCode, session);
    }

    public async Task RevealVotes(string sessionCode)
    {
        var session = _sessionStore.GetSession(sessionCode);
        if (session == null)
        {
            return;
        }

        session.Revealed = true;
        session.UpdateActivity();

        _logger.LogInformation("Votes revealed for session {SessionCode}", sessionCode);

        // Broadcast revealed votes and stats
        var votes = BuildRevealedVotes(session);
        var stats = CalculateStats(session);

        await Clients.Group(sessionCode).SendAsync("VotesRevealed", new RevealResponse(votes, stats));
    }

    public async Task ResetVotes(string sessionCode)
    {
        var session = _sessionStore.GetSession(sessionCode);
        if (session == null)
        {
            return;
        }

        session.ClearVotes();

        _logger.LogInformation("Votes reset for session {SessionCode}", sessionCode);

        await Clients.Group(sessionCode).SendAsync("VotesReset");
        await BroadcastVotingStatus(sessionCode, session);
    }

    public async Task EndSession(string sessionCode)
    {
        var session = _sessionStore.GetSession(sessionCode);
        if (session == null)
        {
            return;
        }

        _logger.LogInformation("Session {SessionCode} ended", sessionCode);

        await Clients.Group(sessionCode).SendAsync("SessionEnded");
        _sessionStore.RemoveSession(sessionCode);
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        _logger.LogInformation("Client disconnected: {ConnectionId}", Context.ConnectionId);
        await base.OnDisconnectedAsync(exception);
    }

    private async Task BroadcastParticipants(string sessionCode, Session session)
    {
        var participants = session.GetParticipantsList()
            .Select(p => new ParticipantDto(p.Id, p.Name, p.IsHost))
            .ToList();

        await Clients.Group(sessionCode).SendAsync("ParticipantsUpdated", participants);
    }

    private async Task BroadcastVotingStatus(string sessionCode, Session session)
    {
        var statuses = session.GetParticipantsList()
            .Select(p => new VoteStatusDto(
                p.Id,
                p.Name,
                session.Votes.ContainsKey(p.Id),
                p.IsHost
            ))
            .ToList();

        await Clients.Group(sessionCode).SendAsync("VotingStatusUpdated", statuses);
    }

    private List<RevealedVoteDto> BuildRevealedVotes(Session session)
    {
        return session.GetParticipantsList()
            .Select(p => new RevealedVoteDto(
                p.Id,
                p.Name,
                session.Votes.TryGetValue(p.Id, out var vote) ? vote : "",
                p.IsHost
            ))
            .ToList();
    }

    private VoteStatsDto CalculateStats(Session session)
    {
        var votes = session.GetVotesSnapshot();
        if (votes.Count == 0)
        {
            return new VoteStatsDto(null, null, null, new Dictionary<string, int>(), 0);
        }

        // Count votes by value
        var counts = votes.Values
            .GroupBy(v => v)
            .ToDictionary(g => g.Key, g => g.Count());

        // Try to calculate numeric stats (exclude "?", "☕", and non-numeric values)
        var numericVotes = votes.Values
            .Where(v => double.TryParse(v, out _))
            .Select(double.Parse)
            .ToList();

        string? min = null;
        string? max = null;
        double? average = null;

        if (numericVotes.Count > 0)
        {
            min = numericVotes.Min().ToString();
            max = numericVotes.Max().ToString();
            average = Math.Round(numericVotes.Average(), 2);
        }

        return new VoteStatsDto(min, max, average, counts, votes.Count);
    }
}
