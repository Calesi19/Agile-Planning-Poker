using System.Collections.Concurrent;
using System.Security.Cryptography;
using Poker.Api.Models;

namespace Poker.Api.Services;

public class InMemorySessionStore
{
    private readonly ConcurrentDictionary<string, Session> _sessions = new();
    private const string CodeCharacters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Excluding ambiguous characters

    public Session CreateSession(EstimationScale scale, string hostName)
    {
        var session = new Session
        {
            Code = GenerateSessionCode(),
            Scale = scale,
            LastActivityUtc = DateTime.UtcNow
        };

        var hostId = GenerateParticipantId();
        var host = new Participant
        {
            Id = hostId,
            Name = hostName,
            IsHost = true
        };

        session.Participants.TryAdd(hostId, host);

        if (!_sessions.TryAdd(session.Code, session))
        {
            // Extremely unlikely collision, retry
            return CreateSession(scale, hostName);
        }

        return session;
    }

    public Session? GetSession(string code)
    {
        _sessions.TryGetValue(code.ToUpperInvariant(), out var session);
        return session;
    }

    public bool RemoveSession(string code)
    {
        return _sessions.TryRemove(code.ToUpperInvariant(), out _);
    }

    public List<Session> GetInactiveSessions(TimeSpan inactivityThreshold)
    {
        var cutoff = DateTime.UtcNow - inactivityThreshold;
        return _sessions.Values
            .Where(s => s.LastActivityUtc < cutoff)
            .ToList();
    }

    public int GetActiveSessionCount()
    {
        return _sessions.Count;
    }

    private string GenerateSessionCode(int length = 6)
    {
        var code = new char[length];
        for (int i = 0; i < length; i++)
        {
            code[i] = CodeCharacters[RandomNumberGenerator.GetInt32(CodeCharacters.Length)];
        }
        return new string(code);
    }

    private string GenerateParticipantId()
    {
        return Guid.NewGuid().ToString("N")[..12];
    }
}
