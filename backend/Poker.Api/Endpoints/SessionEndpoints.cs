using Microsoft.AspNetCore.Mvc;
using Poker.Api.Models;
using Poker.Api.Services;

namespace Poker.Api.Endpoints;

public static class SessionEndpoints
{
    public static void MapSessionEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/sessions");

        group.MapPost("/", CreateSession)
            .WithName("CreateSession")
            .WithOpenApi();

        group.MapPost("/{code}/join", JoinSession)
            .WithName("JoinSession")
            .WithOpenApi();

        group.MapPost("/{code}/vote", CastVote)
            .WithName("CastVote")
            .WithOpenApi();

        group.MapPost("/{code}/reveal", RevealVotes)
            .WithName("RevealVotes")
            .WithOpenApi();

        group.MapPost("/{code}/reset", ResetVotes)
            .WithName("ResetVotes")
            .WithOpenApi();

        group.MapPost("/{code}/end", EndSession)
            .WithName("EndSession")
            .WithOpenApi();
    }

    private static IResult CreateSession(
        [FromBody] CreateSessionRequest request,
        InMemorySessionStore sessionStore,
        ILogger<Program> logger)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.HostName))
            {
                return Results.BadRequest(new { error = "Host name is required" });
            }

            var scale = EstimationScaleExtensions.FromString(request.Scale);
            var session = sessionStore.CreateSession(scale, request.HostName.Trim());
            var host = session.Participants.Values.First(p => p.IsHost);

            logger.LogInformation(
                "Created session {SessionCode} with scale {Scale}",
                session.Code,
                scale
            );

            var response = new SessionResponse(
                session.Code,
                host.Id,
                scale.ToDisplayString(),
                scale.GetCards(),
                session.GetParticipantsList()
                    .Select(p => new ParticipantDto(p.Id, p.Name, p.IsHost))
                    .ToList(),
                session.Revealed
            );

            return Results.Ok(response);
        }
        catch (ArgumentException ex)
        {
            return Results.BadRequest(new { error = ex.Message });
        }
    }

    private static IResult JoinSession(
        string code,
        [FromBody] JoinSessionRequest request,
        InMemorySessionStore sessionStore,
        ILogger<Program> logger)
    {
        var session = sessionStore.GetSession(code);
        if (session == null)
        {
            return Results.NotFound(new { error = "Session not found" });
        }

        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return Results.BadRequest(new { error = "Name is required" });
        }

        var participantId = Guid.NewGuid().ToString("N")[..12];
        var participant = new Participant
        {
            Id = participantId,
            Name = request.Name.Trim(),
            IsHost = false
        };

        if (!session.Participants.TryAdd(participantId, participant))
        {
            return Results.Problem("Failed to add participant");
        }

        session.UpdateActivity();

        logger.LogInformation(
            "Participant {ParticipantId} ({Name}) joined session {SessionCode}",
            participantId,
            participant.Name,
            session.Code
        );

        var response = new SessionResponse(
            session.Code,
            participantId,
            session.Scale.ToDisplayString(),
            session.Scale.GetCards(),
            session.GetParticipantsList()
                .Select(p => new ParticipantDto(p.Id, p.Name, p.IsHost))
                .ToList(),
            session.Revealed
        );

        return Results.Ok(response);
    }

    private static IResult CastVote(
        string code,
        [FromBody] VoteRequest request,
        InMemorySessionStore sessionStore)
    {
        var session = sessionStore.GetSession(code);
        if (session == null)
        {
            return Results.NotFound(new { error = "Session not found" });
        }

        if (!session.Participants.ContainsKey(request.ParticipantId))
        {
            return Results.NotFound(new { error = "Participant not found" });
        }

        if (session.Revealed)
        {
            return Results.BadRequest(new { error = "Cannot vote after votes are revealed" });
        }

        session.Votes[request.ParticipantId] = request.Value;
        session.UpdateActivity();

        return Results.Ok(new { success = true });
    }

    private static IResult RevealVotes(
        string code,
        InMemorySessionStore sessionStore)
    {
        var session = sessionStore.GetSession(code);
        if (session == null)
        {
            return Results.NotFound(new { error = "Session not found" });
        }

        session.Revealed = true;
        session.UpdateActivity();

        return Results.Ok(new { success = true });
    }

    private static IResult ResetVotes(
        string code,
        InMemorySessionStore sessionStore)
    {
        var session = sessionStore.GetSession(code);
        if (session == null)
        {
            return Results.NotFound(new { error = "Session not found" });
        }

        session.ClearVotes();

        return Results.Ok(new { success = true });
    }

    private static IResult EndSession(
        string code,
        InMemorySessionStore sessionStore,
        ILogger<Program> logger)
    {
        var session = sessionStore.GetSession(code);
        if (session == null)
        {
            return Results.NotFound(new { error = "Session not found" });
        }

        sessionStore.RemoveSession(code);

        logger.LogInformation("Session {SessionCode} ended", code);

        return Results.Ok(new { success = true });
    }
}
