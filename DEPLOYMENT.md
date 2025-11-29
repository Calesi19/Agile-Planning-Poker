# Deployment Guide - Fly.io

This guide explains how to deploy the Agile Planning Poker app to Fly.io.

## Prerequisites

1. Install the Fly.io CLI:
   ```bash
   # macOS
   brew install flyctl

   # Linux
   curl -L https://fly.io/install.sh | sh

   # Windows
   pwsh -Command "iwr https://fly.io/install.ps1 -useb | iex"
   ```

2. Sign up or log in to Fly.io:
   ```bash
   fly auth signup
   # or
   fly auth login
   ```

## Initial Deployment

1. **Launch the app** (first time only):
   ```bash
   fly launch
   ```

   When prompted:
   - Choose an app name (or use the default)
   - Select a region (default: `iad` - Ashburn, Virginia)
   - Don't add PostgreSQL or Redis (we use in-memory storage)
   - Say **no** to deploying now (we need to set the app name in fly.toml first)

2. **Update fly.toml** with your app name:

   Edit `fly.toml` and update the first line:
   ```toml
   app = 'your-app-name-here'
   ```

3. **Deploy the app**:
   ```bash
   fly deploy
   ```

## Subsequent Deployments

After the initial setup, deploy updates with:

```bash
fly deploy
```

## Configuration

### Environment Variables

Set environment variables (if needed):

```bash
fly secrets set VARIABLE_NAME=value
```

### Scaling

Adjust resources as needed:

```bash
# Scale VM size
fly scale vm shared-cpu-1x --memory 1024

# Set min/max machines
fly scale count 1 --max-per-region 3
```

### Regions

Add more regions for global coverage:

```bash
fly regions add syd lhr fra
```

## Monitoring

- **View logs**: `fly logs`
- **Check status**: `fly status`
- **SSH into machine**: `fly ssh console`
- **View dashboard**: `fly dashboard`

## Architecture

The deployment uses a multi-stage Docker build:

1. **Stage 1**: Builds the Preact frontend with Node.js 22
2. **Stage 2**: Builds the .NET backend with SDK 9.0
3. **Stage 3**: Creates runtime image with ASP.NET 9.0, serving both API and static frontend

The backend serves:
- REST API endpoints at `/api/*`
- SignalR hub at `/hub/planning-poker`
- Static frontend files from `/wwwroot`
- SPA fallback for client-side routing

## CORS Configuration

**IMPORTANT**: The app currently allows all origins (`AllowAll` CORS policy).

For production, update `backend/Poker.Api/Program.cs`:

```csharp
policy.WithOrigins("https://your-app-name.fly.dev")
    .AllowAnyHeader()
    .AllowAnyMethod()
    .AllowCredentials();
```

## WebSocket Support

SignalR uses WebSockets, which are fully supported by Fly.io. No additional configuration needed.

## Troubleshooting

### Build fails
- Check Docker build locally: `docker build -t poker-app .`
- View build logs: `fly logs --app your-app-name`

### App won't start
- Check runtime logs: `fly logs`
- Verify health check: `fly checks list`
- SSH into machine: `fly ssh console`

### SignalR connection issues
- Ensure WebSocket support is enabled
- Check CORS policy includes your domain
- Verify `/hub/planning-poker` endpoint is accessible

## Cost Optimization

Fly.io free tier includes:
- 3 shared-cpu-1x VMs (256MB RAM each)
- 3GB persistent storage

The app is configured for auto-stop/start to minimize costs:
- Machines stop when idle
- Start automatically on incoming requests
- `min_machines_running = 0` to stop all when idle

## Useful Commands

```bash
# View current deployments
fly releases

# Rollback to previous version
fly releases rollback <version>

# Restart all machines
fly machine restart

# Destroy app (careful!)
fly apps destroy your-app-name
```

## Frontend Configuration

The frontend build needs to know the API URL. For Fly.io deployment:

1. The frontend is built during Docker build (no dynamic env vars)
2. API calls use relative URLs (same origin)
3. No `VITE_API_URL` needed since frontend and backend are served together

If you need to change this, update the Dockerfile build args.
