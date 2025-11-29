namespace Poker.Api.Services;

public class SessionCleanupService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<SessionCleanupService> _logger;
    private readonly TimeSpan _cleanupInterval = TimeSpan.FromMinutes(10);
    private readonly TimeSpan _sessionTimeout = TimeSpan.FromHours(2);

    public SessionCleanupService(IServiceProvider serviceProvider, ILogger<SessionCleanupService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Session cleanup service started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await Task.Delay(_cleanupInterval, stoppingToken);
                CleanupInactiveSessions();
            }
            catch (OperationCanceledException)
            {
                // Expected when stopping
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during session cleanup");
            }
        }

        _logger.LogInformation("Session cleanup service stopped");
    }

    private void CleanupInactiveSessions()
    {
        using var scope = _serviceProvider.CreateScope();
        var sessionStore = scope.ServiceProvider.GetRequiredService<InMemorySessionStore>();

        var inactiveSessions = sessionStore.GetInactiveSessions(_sessionTimeout);

        foreach (var session in inactiveSessions)
        {
            if (sessionStore.RemoveSession(session.Code))
            {
                _logger.LogInformation(
                    "Removed inactive session {SessionCode} (last activity: {LastActivity})",
                    session.Code,
                    session.LastActivityUtc
                );
            }
        }

        if (inactiveSessions.Count > 0)
        {
            _logger.LogInformation(
                "Cleaned up {Count} inactive sessions. Active sessions: {ActiveCount}",
                inactiveSessions.Count,
                sessionStore.GetActiveSessionCount()
            );
        }
    }
}
