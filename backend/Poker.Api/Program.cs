using Poker.Api.Endpoints;
using Poker.Api.Hubs;
using Poker.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddSingleton<InMemorySessionStore>();
builder.Services.AddHostedService<SessionCleanupService>();

// Add SignalR
builder.Services.AddSignalR();

// Add CORS - Allow All Origins
// WARNING: This is permissive and should be restricted in production
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.SetIsOriginAllowed(_ => true)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

builder.Services.AddOpenApi();

var app = builder.Build();

// Configure middleware
app.UseCors("AllowAll");

// Serve static files from wwwroot
app.UseDefaultFiles();
app.UseStaticFiles();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

// Map endpoints
app.MapSessionEndpoints();

// Map SignalR hub
app.MapHub<PlanningPokerHub>("/hub/planning-poker");

// Health check endpoint
app.MapGet("/api/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }))
    .WithName("HealthCheck")
    .WithOpenApi();

// SPA fallback - serve index.html for all non-API routes
app.MapFallback(async context =>
{
    // Don't fallback for API routes or SignalR hub
    if (context.Request.Path.StartsWithSegments("/api") ||
        context.Request.Path.StartsWithSegments("/hub"))
    {
        context.Response.StatusCode = 404;
        return;
    }

    context.Response.ContentType = "text/html";
    await context.Response.SendFileAsync(Path.Combine(app.Environment.WebRootPath ?? "wwwroot", "index.html"));
});

app.Run();
