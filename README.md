# Planning Poker

A real-time Planning Poker application for agile estimation, inspired by Kahoot's playful interface.

## Overview

Planning Poker is a collaborative estimation tool designed for distributed agile teams. It enables teams to conduct sprint planning sessions remotely with real-time voting and instant results.

### Key Features

- **Real-time Collaboration**: Host creates a session, participants join via a session code
- **Multiple Estimation Methods**: Fibonacci, Modified Fibonacci, T-Shirt sizes, Powers of 2
- **Live Updates**: See who has voted in real-time (without revealing values)
- **Statistics**: Automatic calculation of min, max, average, and vote distribution
- **Mobile-First PWA**: Installable on iOS and Android devices
- **No Database Required**: All session data stored in memory
- **Screen-Sharing Friendly**: Host view optimized for sharing on Zoom/Teams

## Tech Stack

### Backend

- **.NET 9.0** - ASP.NET Core with minimal APIs
- **SignalR** - Real-time WebSocket communication
- **In-Memory Storage** - No database required

### Frontend

- **Preact** - Lightweight React alternative
- **TypeScript** - Type-safe code
- **Vite** - Fast build tooling
- **Tailwind CSS** - Utility-first styling
- **PWA Support** - Installable progressive web app

## Project Structure

```
Agile-Planning-Poker/
├── backend/
│   └── Poker.Api/
│       ├── Models/           # Domain models and DTOs
│       ├── Services/         # Business logic and session store
│       ├── Hubs/            # SignalR hubs
│       ├── Endpoints/       # Minimal API endpoints
│       └── Program.cs       # App configuration
├── frontend/
│   └── poker/
│       ├── src/
│       │   ├── components/  # Reusable UI components
│       │   ├── pages/       # Route pages
│       │   ├── lib/         # API client, SignalR, utilities
│       │   └── types.ts     # TypeScript type definitions
│       ├── public/          # Static assets and PWA icons
│       └── vite.config.ts   # Vite and PWA configuration
└── README.md
```

## Getting Started

### Prerequisites

- **.NET 9.0 SDK** or later
- **Node.js 18+** and npm/pnpm

### Running the Backend

1. Navigate to the backend directory:
   ```bash
   cd backend/Poker.Api
   ```

2. Restore dependencies and run:
   ```bash
   dotnet restore
   dotnet run
   ```

3. The API will start on `http://localhost:5000` (HTTP) and `https://localhost:5001` (HTTPS)

4. The SignalR hub is available at `/hub/planning-poker`

### Running the Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend/poker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` if your backend is running on a different port:
   ```env
   VITE_API_URL=http://localhost:5000
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open your browser to `http://localhost:5173`

## Usage Guide

### Creating a Session (Host)

1. Click **"Create Session"**
2. Enter your display name
3. Choose an estimation method (Fibonacci, Modified Fibonacci, T-Shirt, Powers of 2)
4. Click **"Create Session"**
5. Share the session code with participants (visible at the top of the screen)

### Joining a Session (Participant)

1. Click **"Join Session"**
2. Enter the session code provided by the host
3. Enter your display name
4. Click **"Join Session"**

### Estimating

**As a Participant:**
1. Tap a card to cast your vote
2. Wait for the host to reveal votes
3. View the results when revealed

**As a Host:**
1. See who has voted (checkmarks appear as participants vote)
2. Click **"Reveal Votes"** when ready to see results
3. Review statistics (min, max, average, distribution)
4. Click **"Reset Votes"** to start the next estimation round
5. Click **"End Session"** when done

### Estimation Scales

- **Fibonacci**: 0, 1, 2, 3, 5, 8, 13, 21, 34, ?, ☕
- **Modified Fibonacci**: 0, 0.5, 1, 2, 3, 5, 8, 13, 20, 40, 100, ?, ☕
- **T-Shirt**: XS, S, M, L, XL, XXL, ?, ☕
- **Powers of 2**: 1, 2, 4, 8, 16, 32, 64, ?, ☕

**Special cards:**
- `?` - Not sure / Need more information
- `☕` - Need a break

## API Endpoints

### Sessions

- `POST /api/sessions` - Create a new session
- `POST /api/sessions/{code}/join` - Join an existing session
- `POST /api/sessions/{code}/vote` - Cast a vote
- `POST /api/sessions/{code}/reveal` - Reveal all votes
- `POST /api/sessions/{code}/reset` - Reset votes for next round
- `POST /api/sessions/{code}/end` - End the session

### SignalR Events

**Client → Server:**
- `JoinSession(sessionCode, participantId)`
- `CastVote(sessionCode, participantId, value)`
- `RevealVotes(sessionCode)`
- `ResetVotes(sessionCode)`
- `EndSession(sessionCode)`

**Server → Client:**
- `ParticipantsUpdated(participants[])`
- `VotingStatusUpdated(statuses[])`
- `VotesRevealed(revealResponse)`
- `VotesReset()`
- `SessionEnded()`

## PWA Installation

### iOS (Safari)

1. Open the app in Safari
2. Tap the Share button
3. Scroll down and tap **"Add to Home Screen"**
4. Tap **"Add"**

### Android (Chrome)

1. Open the app in Chrome
2. Tap the menu (three dots)
3. Tap **"Add to Home Screen"**
4. Tap **"Add"**

### Desktop (Chrome/Edge)

1. Open the app in Chrome or Edge
2. Click the install icon in the address bar
3. Click **"Install"**

## Production Deployment

### Backend

1. Build the backend:
   ```bash
   cd backend/Poker.Api
   dotnet publish -c Release -o ./publish
   ```

2. Deploy to your hosting platform (Azure App Service, AWS, etc.)

3. **IMPORTANT:** Update CORS configuration in `Program.cs` to restrict to your frontend domain(s):
   ```csharp
   policy.WithOrigins("https://your-production-domain.com")
   ```

4. Ensure the following settings:
   - HTTPS is enabled
   - Environment variables are set appropriately

### Frontend

#### Option 1: GitHub Pages (Recommended)

This repository includes automated deployment to GitHub Pages:

1. See [`.github/DEPLOY.md`](.github/DEPLOY.md) for detailed setup instructions
2. Enable GitHub Pages in repository settings (Settings → Pages → Source: GitHub Actions)
3. (Optional) Set `VITE_API_URL` variable in repository settings to point to your backend
4. Push to main branch or manually trigger the workflow
5. Your app will be deployed to `https://[username].github.io/Agile-Planning-Poker/`

#### Option 2: Manual Deployment

1. Update `.env` with your production backend URL:
   ```env
   VITE_API_URL=https://your-api-domain.com
   ```

2. Generate PWA icons (see `frontend/poker/public/ICONS.md`)

3. Build the frontend:
   ```bash
   cd frontend/poker
   npm run build
   ```

4. Deploy the `dist` folder to your hosting platform (Vercel, Netlify, Azure Static Web Apps, etc.)

5. Ensure the site is served over HTTPS (required for PWA)

## Session Management

- **In-Memory Storage**: All sessions are stored in memory (no database)
- **Automatic Cleanup**: Inactive sessions (no activity for 2 hours) are automatically removed every 10 minutes
- **Session Codes**: 6-character alphanumeric codes (excluding ambiguous characters)
- **Participant IDs**: Auto-generated 12-character unique identifiers

## Configuration

### Backend Configuration

Edit `backend/Poker.Api/appsettings.json` for application settings:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

### Frontend Configuration

Set environment variables in `frontend/poker/.env`:

```env
VITE_API_URL=http://localhost:5000
```

### CORS Configuration

**Current Setting:** The backend is configured to **allow all origins** for maximum flexibility during development.

⚠️ **SECURITY WARNING:** For production deployments, you should restrict CORS to specific origins.

**Current configuration** in `backend/Poker.Api/Program.cs`:
```csharp
// Allow all origins (current setting)
policy.SetIsOriginAllowed(_ => true)
    .AllowAnyHeader()
    .AllowAnyMethod()
    .AllowCredentials();
```

**Recommended for production:**
```csharp
// Restrict to specific origins
policy.WithOrigins(
    "https://your-production-domain.com",
    "https://your-app.com"
)
    .AllowAnyHeader()
    .AllowAnyMethod()
    .AllowCredentials();
```

## Browser Support

- **Modern Browsers**: Chrome 90+, Edge 90+, Safari 14+, Firefox 88+
- **Mobile**: iOS 14+ (Safari), Android 8+ (Chrome)
- **PWA Support**: All modern browsers with service worker support

## Future Enhancements

This app is designed to be minimal but extensible. Potential enhancements:

- **Native App Packaging**: Use Capacitor to package as iOS/Android app
- **Persistent Sessions**: Add optional database for session persistence
- **Timer**: Add countdown timer for voting rounds
- **Custom Scales**: Allow hosts to create custom estimation scales
- **User Accounts**: Optional authentication for recurring users
- **Session History**: Track estimation history within a session
- **Export Results**: Export voting results as CSV/PDF

## License

This project is provided as-is for educational and commercial use.

## Contributing

This is a self-contained project. Feel free to fork and customize for your needs.

## Support

For issues or questions, please create an issue in the repository.
