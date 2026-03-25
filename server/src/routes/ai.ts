// ============================================================
// src/routes/ai.ts — AI Playlist Generation Routes
// ============================================================
// Handles AI-powered playlist generation using Google Gemini API.
// Generates playlists based on mood, genre preferences, and
// listening history.
// ============================================================

import { Router, Request, Response } from 'express';
import axios from 'axios';
import { SpotifySession } from '../types';
import { requireAuth } from '../middleware/auth';
import { aiLimiter } from '../middleware/rateLimit';
import { config } from '../config/env';
import { logger } from '../utils/logger';

const router = Router();

router.use(requireAuth);
router.use(aiLimiter);

const MOOD_TO_GENRES: Record<string, string[]> = {
  energetic: ['pop', 'dance', 'hip-hop', 'electronic', 'rock'],
  chill: ['ambient', 'lo-fi', 'indie', 'acoustic', 'jazz'],
  focus: ['classical', 'ambient', 'instrumental', 'study', 'minimal'],
  happy: ['pop', 'dance', 'disco', 'soul', 'funk'],
  sad: ['indie', 'alternative', 'acoustic', 'soul', 'r-n-b'],
  romantic: ['r-n-b', 'soul', 'pop', 'slow-jams', 'love-songs'],
  workout: ['hip-hop', 'rock', 'electronic', 'dance', 'workout'],
  party: ['dance', 'edm', 'hip-hop', 'pop', 'house'],
};

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

interface GenerateRequest {
  mood: string;
  genres: string[];
  name?: string;
}

async function callGemini(prompt: string): Promise<string> {
  const apiKey = config.geminiApiKey || process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('Gemini API key not configured');
  }

  try {
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${apiKey}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 500,
        },
      },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    return response.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  } catch (error: any) {
    logger.error('Gemini API call failed:', error.response?.data || error.message);
    throw error;
  }
}

router.post('/generate', async (req: Request, res: Response) => {
  const session = req.session as SpotifySession;
  const { mood, genres = [], name } = req.body as GenerateRequest;

  if (!mood) {
    res.status(400).json({ error: 'Mood is required' });
    return;
  }

  const moodGenres = MOOD_TO_GENRES[mood.toLowerCase()] || [];
  const allGenres = [...new Set([...genres, ...moodGenres])].slice(0, 5);
  const genreString = allGenres.join(', ');

  const prompt = `You are a music curator creating a playlist for someone in a "${mood}" mood.

Return exactly 10 song recommendations in this JSON format only (no other text):
{
  "tracks": [
    {"name": "Song Title", "artist": "Artist Name", "reason": "Why this fits the mood"},
    ...
  ]
}

Requirements:
- Mix of popular and lesser-known tracks
- Each track should fit the "${mood}" mood
- Consider these genres: ${genreString || 'various'}
- Include a brief "reason" for each track`;

  try {
    const geminiResponse = await callGemini(prompt);
    
    let parsedTracks: any[] = [];
    
    try {
      const jsonMatch = geminiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        parsedTracks = parsed.tracks || [];
      }
    } catch (parseError) {
      logger.warn('Failed to parse Gemini response as JSON, using fallback');
    }

    if (parsedTracks.length === 0) {
      parsedTracks = getFallbackTracks(mood);
    }

    const spotifyTracks = await searchSpotifyTracks(
      session.spotifyAccessToken!,
      parsedTracks
    );

    res.json({
      name: name || `Vibe Mix - ${mood}`,
      mood,
      genres: allGenres,
      tracks: spotifyTracks,
    });
  } catch (error: any) {
    logger.error('AI generate failed:', error);
    
    const fallbackTracks = getFallbackTracks(mood);
    const spotifyTracks = await searchSpotifyTracks(
      session.spotifyAccessToken!,
      fallbackTracks
    );

    res.json({
      name: name || `Vibe Mix - ${mood}`,
      mood,
      genres: allGenres,
      tracks: spotifyTracks,
    });
  }
});

router.post('/save', async (req: Request, res: Response) => {
  const session = req.session as SpotifySession;
  const { name, tracks = [] } = req.body;

  if (!tracks.length) {
    res.status(400).json({ error: 'No tracks to save' });
    return;
  }

  try {
    const meResponse = await axios.get('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${session.spotifyAccessToken}` },
    });

    const playlistResponse = await axios.post(
      `https://api.spotify.com/v1/users/${meResponse.data.id}/playlists`,
      {
        name: name || 'Vibe AI Mix',
        description: 'Created with Vibe AI',
        public: false,
      },
      {
        headers: {
          Authorization: `Bearer ${session.spotifyAccessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const trackUris = tracks.map((track: any) => track.uri || track.id);

    await axios.post(
      `https://api.spotify.com/v1/playlists/${playlistResponse.data.id}/tracks`,
      { uris: trackUris },
      {
        headers: {
          Authorization: `Bearer ${session.spotifyAccessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json({
      success: true,
      playlist: playlistResponse.data,
    });
  } catch (error: any) {
    logger.error('Save playlist failed:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to save playlist',
      message: error.response?.data?.error?.message || 'Unknown error',
    });
  }
});

async function searchSpotifyTracks(accessToken: string, trackList: any[]): Promise<any[]> {
  const results: any[] = [];

  for (const track of trackList.slice(0, 10)) {
    try {
      const searchQuery = `${track.name} ${track.artist}`.substring(0, 100);
      const response = await axios.get('https://api.spotify.com/v1/search', {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { q: searchQuery, type: 'track', limit: 1 },
      });

      if (response.data.tracks?.items?.length > 0) {
        const spotifyTrack = response.data.tracks.items[0];
        results.push({
          id: spotifyTrack.id,
          uri: spotifyTrack.uri,
          name: spotifyTrack.name,
          artists: spotifyTrack.artists,
          album: spotifyTrack.album,
          duration_ms: spotifyTrack.duration_ms,
          reason: track.reason || '',
        });
      }
    } catch (error) {
      logger.warn(`Failed to find track: ${track.name}`);
    }
  }

  return results;
}

function getFallbackTracks(mood: string): any[] {
  const fallbacks: Record<string, any[]> = {
    energetic: [
      { name: 'Blinding Lights', artist: 'The Weeknd', reason: 'High energy synth-pop' },
      { name: 'Levitating', artist: 'Dua Lipa', reason: 'Upbeat dance track' },
      { name: 'Don\'t Start Now', artist: 'Dua Lipa', reason: 'Funky disco vibes' },
      { name: 'Circles', artist: 'Post Malone', reason: 'Catchy pop melody' },
      { name: 'Watermelon Sugar', artist: 'Harry Styles', reason: 'Feel-good summer anthem' },
      { name: 'Dance Monkey', artist: 'Tones and I', reason: 'Irresistible rhythm' },
      { name: 'Thunder', artist: 'Imagine Dragons', reason: 'Powerful beats' },
      { name: 'Uptown Funk', artist: 'Bruno Mars', reason: 'Non-stop energy' },
      { name: 'Shut Up and Dance', artist: 'WALK THE MOON', reason: 'Pure dance rock' },
      { name: 'Can\'t Stop the Feeling', artist: 'Justin Timberlake', reason: 'Feel-good pop' },
    ],
    chill: [
      { name: 'Sunflower', artist: 'Post Malone', reason: 'Relaxed vibes' },
      { name: 'Ocean Eyes', artist: 'Billie Eilish', reason: 'Dreamy atmosphere' },
      { name: 'Let Her Go', artist: 'Passenger', reason: 'Gentle folk' },
      { name: 'Fix You', artist: 'Coldplay', reason: 'Soothing melody' },
      { name: 'The Night We Met', artist: 'Lord Huron', reason: 'Nostalgic indie' },
      { name: 'Banana Pancakes', artist: 'Jack Johnson', reason: 'Laid-back groove' },
      { name: 'Put Your Records On', artist: 'Corinne Bailey Rae', reason: 'Easy listening' },
      { name: 'Budapest', artist: 'George Ezra', reason: 'Warm acoustic' },
      { name: 'Riptide', artist: 'Vance Joy', reason: 'Sweet indie folk' },
      { name: 'Better Together', artist: 'Jack Johnson', reason: 'Relaxed Hawaii vibes' },
    ],
    focus: [
      { name: 'Experience', artist: 'Ludovico Einaudi', reason: 'Concentration enhancer' },
      { name: 'River Flows in You', artist: 'Yiruma', reason: 'Calming piano' },
      { name: 'Clair de Lune', artist: 'Debussy', reason: 'Classical clarity' },
      { name: 'Weightless', artist: 'Marconi Union', reason: 'Scientifically relaxing' },
      { name: 'Gymnopédie No. 1', artist: 'Erik Satie', reason: 'Minimalist focus' },
      { name: 'Comptine d\'un autre été', artist: 'Yann Tiersen', reason: 'Peaceful melody' },
      { name: 'Intro', artist: 'The xx', reason: 'Ambient indie' },
      { name: 'Midnight City', artist: 'M83', reason: 'Atmospheric synths' },
      { name: 'Pure Shores', artist: 'All Saints', reason: 'Calm electronic' },
      { name: 'Teardrop', artist: 'Massive Attack', reason: 'Hypnotic beats' },
    ],
    happy: [
      { name: 'Happy', artist: 'Pharrell Williams', reason: 'Pure joy' },
      { name: 'Good Time', artist: 'Owl City', reason: 'Uplifting melody' },
      { name: 'Walking on Sunshine', artist: 'Katrina and The Waves', reason: 'Feel-good classic' },
      { name: 'Three Little Birds', artist: 'Bob Marley', reason: 'Positive reggae' },
      { name: 'Best Day of My Life', artist: 'American Authors', reason: 'Optimistic rock' },
      { name: 'Can You Feel It', artist: 'Jackie Jackson', reason: 'Feel-good dance' },
      { name: 'I Gotta Feeling', artist: 'Black Eyed Peas', reason: 'Party anthem' },
      { name: 'Shut Up and Dance', artist: 'WALK THE MOON', reason: 'Joyful energy' },
      { name: 'Love Shot', artist: 'EXO', reason: 'Upbeat pop' },
      { name: 'Dance The Night', artist: 'Dua Lipa', reason: 'Empowering anthem' },
    ],
    sad: [
      { name: 'Someone Like You', artist: 'Adele', reason: 'Heartbreaking ballad' },
      { name: 'All I Want', artist: 'Kodaline', reason: 'Emotional indie' },
      { name: 'Happier', artist: 'Olivia Rodrigo', reason: 'Bittersweet pop' },
      { name: 'Skinny Love', artist: 'Bon Iver', reason: 'Haunting beauty' },
      { name: 'The Night We Met', artist: 'Lord Huron', reason: 'Melancholic indie' },
      { name: 'Let It Be', artist: 'The Beatles', reason: 'Comforting classic' },
      { name: 'Everybody\'s Gotta Learn Sometime', artist: 'Beck', reason: 'Somber beauty' },
      { name: 'Into You', artist: 'Ari Lennox', reason: 'Wistful R&B' },
      { name: 'Fast Car', artist: 'Tracy Chapman', reason: 'Poignant story' },
      { name: 'Creep', artist: 'Radiohead', reason: 'Deeply emotional' },
    ],
    romantic: [
      { name: 'Perfect', artist: 'Ed Sheeran', reason: 'Love ballad' },
      { name: 'All of Me', artist: 'John Legend', reason: 'Heartfelt devotion' },
      { name: 'Can\'t Help Falling in Love', artist: 'Elvis Presley', reason: 'Timeless romance' },
      { name: 'Thinking Out Loud', artist: 'Ed Sheeran', reason: 'Beautiful love song' },
      { name: 'At Last', artist: 'Etta James', reason: 'Classic romance' },
      { name: 'Lush Life', artist: 'Zara Larsson', reason: 'Joyful love' },
      { name: 'Say You Won\'t Let Go', artist: 'James Arthur', reason: 'Emotional commitment' },
      { name: 'A Thousand Years', artist: 'Christina Perri', reason: 'Devoted love' },
      { name: 'Can\'t Take My Eyes Off You', artist: 'Louise', reason: 'Enchanting romance' },
      { name: 'Nothing Compares 2 U', artist: 'Sinéad O\'Connor', reason: 'Deep love' },
    ],
    workout: [
      { name: 'Lose Yourself', artist: 'Eminem', reason: 'Maximum motivation' },
      { name: 'Stronger', artist: 'Kanye West', reason: 'Powerful beats' },
      { name: 'Eye of the Tiger', artist: 'Survivor', reason: 'Workout classic' },
      { name: 'Till I Collapse', artist: 'Eminem', reason: 'Endurance anthem' },
      { name: 'Power', artist: 'Kanye West', reason: 'High energy' },
      { name: 'Remember The Name', artist: 'Fort Minor', reason: 'Motivation' },
      { name: 'Believer', artist: 'Imagine Dragons', reason: 'Building intensity' },
      { name: 'Legendary', artist: 'Welshly Arms', reason: 'Powerful rock' },
      { name: 'Turks', artist: 'Ice Cube', reason: 'Driving hip-hop' },
      { name: 'Pump It', artist: 'Black Eyed Peas', reason: 'High energy workout' },
    ],
    party: [
      { name: 'Blinding Lights', artist: 'The Weeknd', reason: 'Party essential' },
      { name: 'Levitating', artist: 'Dua Lipa', reason: 'Dance floor hit' },
      { name: 'Uptown Funk', artist: 'Bruno Mars', reason: 'Party anthem' },
      { name: 'Don\'t Start Now', artist: 'Dua Lipa', reason: 'Dance track' },
      { name: 'Dance Monkey', artist: 'Tones and I', reason: 'Crowd pleaser' },
      { name: 'Physical', artist: 'Dua Lipa', reason: 'High energy dance' },
      { name: 'Turn Down for What', artist: 'DJ Snake', reason: 'Bass heavy' },
      { name: 'One More Time', artist: 'Daft Punk', reason: 'Party classic' },
      { name: 'Titanium', artist: 'David Guetta', reason: 'Club banger' },
      { name: 'Levels', artist: 'Avicii', reason: 'Dance anthem' },
    ],
  };

  return fallbacks[mood.toLowerCase()] || fallbacks.happy;
}

export default router;
