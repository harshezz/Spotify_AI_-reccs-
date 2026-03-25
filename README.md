# Vibe Music

A modern music companion app powered by Spotify and AI. Connect your Spotify account to unlock personalized playlists, music discovery, and AI-curated recommendations.

## Features

- **AI Playlist Generator**: Create custom playlists based on your mood using Google's Gemini AI
- **Music Discovery**: Browse and search through millions of tracks
- **Your Library**: Access your saved tracks, albums, and playlists
- **Personalized Dashboard**: See your recently played, featured playlists, and new releases
- **Beautiful UI**: Dark/light themes with customizable accent colors

## Tech Stack

### Frontend
- Next.js 16
- TypeScript
- Tailwind CSS
- Framer Motion (animations)
- Spotify Web API

### Backend
- Express.js
- Spotify OAuth (Authorization Code Flow)
- Google Gemini AI

## Getting Started

### Prerequisites

1. Node.js 18+
2. A Spotify Developer account
3. A Google AI (Gemini) API key

### Spotify Setup

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Add `http://localhost:3000/callback` as a Redirect URI
4. Copy your Client ID and Client Secret

### Configuration

**Server (.env)**
```
cd server
cp .env.example .env  # or create .env manually
```

Edit `server/.env`:
```
PORT=5000
FRONTEND_URL=http://localhost:3000
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:3000/callback
SESSION_SECRET=your_random_session_secret
GEMINI_API_KEY=your_gemini_api_key
```

**Client (.env.local)**
```
cd client
```

Create `client/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=http://localhost:3000/callback
```

### Running the App

**Terminal 1 - Backend**
```bash
cd server
npm install
npm run dev
```

**Terminal 2 - Frontend**
```bash
cd client
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Pages

- `/` - Landing (redirects to login or dashboard)
- `/login` - Spotify OAuth login
- `/dashboard` - Main home with featured content
- `/browse` - Search and explore music
- `/library` - Your saved music
- `/ai` - AI playlist generator
- `/profile` - Account settings and stats
- `/privacy` - Privacy policy
- `/terms` - Terms of service

## Project Structure

```
vibe-music/
├── client/                 # Next.js frontend
│   ├── src/
│   │   ├── app/           # Pages
│   │   ├── components/    # React components
│   │   │   ├── layout/    # Sidebar, AppShell, MobileNav
│   │   │   ├── player/    # Audio player components
│   │   │   └── ui/        # Reusable UI components
│   │   ├── context/       # React context providers
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API service layers
│   │   ├── types/         # TypeScript type definitions
│   │   └── lib/           # Utilities
│   └── public/            # Static assets
│
└── server/                # Express backend
    └── src/
        ├── routes/         # API routes
        ├── middleware/    # Express middleware
        ├── services/       # Business logic
        ├── config/         # Configuration
        └── types/          # TypeScript types
```

## Environment Variables

### Server

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `FRONTEND_URL` | Frontend URL for CORS |
| `SPOTIFY_CLIENT_ID` | Spotify app client ID |
| `SPOTIFY_CLIENT_SECRET` | Spotify app client secret |
| `SPOTIFY_REDIRECT_URI` | OAuth redirect URI |
| `SESSION_SECRET` | Session encryption key |
| `GEMINI_API_KEY` | Google Gemini API key |

### Client

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API URL |
| `NEXT_PUBLIC_SPOTIFY_REDIRECT_URI` | Spotify redirect URI |

## License

MIT
