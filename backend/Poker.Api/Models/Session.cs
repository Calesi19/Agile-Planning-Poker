using System.Collections.Concurrent;
using System.Security.Cryptography;
using System.Text;

namespace Poker.Api.Models;

public class Session
{
    public string Code { get; set; } = string.Empty;

    // Authorizes dealer actions. Participant ids can't: they're broadcast to the whole table.
    public string HostKey { get; } = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));

    public EstimationScale Scale { get; set; }
    public ConcurrentDictionary<string, Participant> Participants { get; set; } = new();
    public ConcurrentDictionary<string, string> Votes { get; set; } = new();
    public bool Revealed { get; set; }
    public DateTime LastActivityUtc { get; set; } = DateTime.UtcNow;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public bool IsHostKey(string? key)
    {
        return key != null && CryptographicOperations.FixedTimeEquals(
            Encoding.UTF8.GetBytes(key),
            Encoding.UTF8.GetBytes(HostKey)
        );
    }

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
