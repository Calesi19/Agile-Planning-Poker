# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Backend (.NET 9.0)
```bash
# From backend/Poker.Api directory
dotnet restore              # Restore dependencies
dotnet build                # Build the project
dotnet run                  # Run the API (http://localhost:5000, https://localhost:5001)
```

### Frontend (Preact + Vite)
```bash
# From frontend/poker directory
npm install                 # Install dependencies
npm run dev                 # Start dev server (http://localhost:5173)
npm run build               # Build for production (outputs to dist/)
npm run preview             # Preview production build
```

### Environment Setup
- Backend requires .NET 9.0 SDK
- Frontend requires Node.js 18+
- Frontend needs `.env` file with `VITE_API_URL=http://localhost:5000` (copy from `.env.example`)

## Architecture Overview

### Real-Time Communication Model
The app uses a **dual-channel architecture** for optimal performance:

1. **HTTP REST API** (initial setup): Used for session creation, joining, and one-off actions
2. **SignalR WebSocket Hub** (real-time updates): Used for live voting updates, reveals, and broadcasts

Both channels interact with the same `InMemorySessionStore` singleton. REST endpoints modify state, while SignalR hub broadcasts changes to all connected clients in a session.

### Backend Architecture

**Core Pattern: Minimal APIs + SignalR Hub**

The backend uses ASP.NET Core Minimal APIs (not Controllers) with SignalR for real-time features:

- **Program.cs** - Application entry point, middleware configuration, endpoint mapping
- **Services/InMemorySessionStore.cs** - Singleton session storage using `ConcurrentDictionary`
- **Hubs/PlanningPokerHub.cs** - SignalR hub for real-time WebSocket communication
- **Endpoints/SessionEndpoints.cs** - Extension method that maps all REST endpoints
- **Models/** - Domain models (Session, Participant) and DTOs

**Key Architectural Decisions:**
- **In-memory storage only**: All sessions stored in `ConcurrentDictionary`, no database
- **SignalR groups**: Each session code maps to a SignalR group for targeted broadcasts
- **Thread-safe collections**: `ConcurrentDictionary` used for Participants and Votes
- **Session cleanup**: Background service (`SessionCleanupService`) removes inactive sessions every 10 minutes (2-hour inactivity threshold)

**Session Code Generation:**
- 6-character codes using `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (excludes ambiguous characters like O/0, I/1)
- Uses `RandomNumberGenerator` for cryptographic randomness
- Participant IDs are 12-character truncated GUIDs

### Frontend Architecture

**Core Pattern: Preact + SignalR Client + Local Storage**

- **Router**: `preact-router` for client-side routing
- **State Management**: Component-level state (no global store like Redux)
- **Styling**: Tailwind CSS v4 with `@tailwindcss/vite`
- **Real-time**: `@microsoft/signalr` for WebSocket connection
- **PWA**: `vite-plugin-pwa` with Workbox for offline support

**Key Files:**
- **lib/api.ts** - REST API client functions
- **lib/signalr.ts** - `PlanningPokerConnection` class wrapping SignalR hub connection
- **lib/storage.ts** - LocalStorage helpers for persisting participant info
- **types.ts** - TypeScript interfaces matching backend DTOs
- **pages/** - Route components (Home, CreateSession, JoinSession, HostSession, ParticipantSession)

**SignalR Connection Lifecycle:**
1. After joining/creating via REST API, component creates `PlanningPokerConnection`
2. Connection auto-joins the session's SignalR group
3. Event handlers registered for broadcasts (ParticipantsUpdated, VotingStatusUpdated, etc.)
4. Automatic reconnection handled by SignalR client
5. Connection cleaned up in component unmount

### State Synchronization Flow

**Example: Casting a Vote**
1. Participant clicks card → `PlanningPokerConnection.castVote()` invokes SignalR hub method
2. Hub validates and updates `Session.Votes[participantId]`
3. Hub broadcasts `VotingStatusUpdated` to all clients in session group
4. All connected clients receive update and re-render with voting status (checkmarks)
5. Values remain hidden until host calls `RevealVotes()`

**Example: Revealing Votes**
1. Host clicks "Reveal" → Hub sets `Session.Revealed = true`
2. Hub calculates stats (min, max, average, distribution)
3. Hub broadcasts `VotesRevealed` with full vote data + stats
4. All clients render revealed cards and statistics

### CORS Configuration
**IMPORTANT:** The backend currently allows all origins for development:
```csharp
policy.SetIsOriginAllowed(_ => true)
```
**For production**, update `Program.cs` to restrict origins:
```csharp
policy.WithOrigins("https://your-production-domain.com")
```

### Estimation Scales
Scales are defined in `Models/EstimationScale.cs` as enums. Each scale has a `GetCards()` extension method that returns the valid card values. Special cards `?` (unsure) and `☕` (break) are available in all scales and excluded from numeric statistics.

### Session Lifecycle
1. **Create** - Host creates session via POST `/api/sessions`, gets session code + participant ID
2. **Join** - Participants join via POST `/api/sessions/{code}/join`, get participant ID
3. **Connect** - All participants connect to SignalR hub and join session group
4. **Vote** - Participants cast votes via SignalR (hidden from others)
5. **Reveal** - Host reveals votes, stats calculated server-side
6. **Reset** - Host resets for next round (clears votes, sets Revealed = false)
7. **End** - Host ends session, removed from store, all clients disconnected

### PWA Configuration
PWA settings in `vite.config.ts`:
- Auto-update strategy for new versions
- Standalone display mode
- Icons at 192x192 and 512x512
- Service worker handles offline caching
- See `frontend/poker/public/ICONS.md` for icon generation instructions

## Build Vite Override
The frontend uses `rolldown-vite@7.2.5` instead of standard Vite (specified in `package.json` overrides). This is an experimental Rust-based Vite fork. If you encounter build issues, this is a key area to investigate.
