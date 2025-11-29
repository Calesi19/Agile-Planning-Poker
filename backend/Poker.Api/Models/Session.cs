using System.Collections.Concurrent;

namespace Poker.Api.Models;

public class Session
{
    public string Code { get; set; } = string.Empty;
    public EstimationScale Scale { get; set; }
    public ConcurrentDictionary<string, Participant> Participants { get; set; } = new();
    public ConcurrentDictionary<string, string> Votes { get; set; } = new();
    public bool Revealed { get; set; }
    public DateTime LastActivityUtc { get; set; } = DateTime.UtcNow;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public void UpdateActivity()
    {
        LastActivityUtc = DateTime.UtcNow;
    }

    public List<Participant> GetParticipantsList()
    {
        return Participants.Values.OrderBy(p => p.JoinedAtUtc).ToList();
    }

    public Dictionary<string, string> GetVotesSnapshot()
    {
        return new Dictionary<string, string>(Votes);
    }

    public void ClearVotes()
    {
        Votes.Clear();
        Revealed = false;
        UpdateActivity();
    }
}
