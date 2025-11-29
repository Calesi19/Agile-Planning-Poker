namespace Poker.Api.Models;

public class Participant
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public bool IsHost { get; set; }
    public DateTime JoinedAtUtc { get; set; } = DateTime.UtcNow;
}
