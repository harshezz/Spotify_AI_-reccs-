// ============================================================
// src/routes/spotify.ts — Spotify API Proxy Routes
// ============================================================
// Proxies requests from the Next.js frontend to the Spotify
// Web API, attaching the stored access token from the session.
// This keeps tokens completely server-side.
// ============================================================

import { Router, Request, Response } from 'express';
import axios from 'axios';
import { SpotifySession } from '../types';
import { requireAuth } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimit';
import { logger } from '../utils/logger';

const router = Router();
const SPOTIFY_API = 'https://api.spotify.com/v1';
const BROWSE_API = 'https://api.spotify.com/v1/browse';

router.use(requireAuth);
router.use(apiLimiter);


async function spotifyRequest(
  accessToken: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  endpoint: string,
  data?: any,
  params?: Record<string, any>
) {
  const response = await axios({
    method,
    url: `${SPOTIFY_API}${endpoint}`,
    headers: { Authorization: `Bearer ${accessToken}` },
    data,
    params,
  });
  return response.data;
}

async function spotifyBrowseRequest(
  accessToken: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  endpoint: string,
  data?: any,
  params?: Record<string, any>
) {
  const response = await axios({
    method,
    url: `${BROWSE_API}${endpoint}`,
    headers: { Authorization: `Bearer ${accessToken}` },
    data,
    params,
  });
  return response.data;
}

router.get('/me', async (req: Request, res: Response) => {
  const session = req.session as SpotifySession;
  try {
    const data = await spotifyRequest(session.spotifyAccessToken!, 'GET', '/me');
    res.json(data);
  } catch (error: any) {
    logger.error('GET /me failed:', error.response?.data);
    res.status(error.response?.status || 500).json(error.response?.data);
  }
});

router.get('/me/playlists', async (req: Request, res: Response) => {
  const session = req.session as SpotifySession;
  const { limit = 50, offset = 0 } = req.query;
  try {
    const data = await spotifyRequest(
      session.spotifyAccessToken!, 'GET', '/me/playlists',
      undefined,
      { limit, offset }
    );
    res.json(data);
  } catch (error: any) {
    logger.error('GET /me/playlists failed:', error.response?.data);
    res.status(error.response?.status || 500).json(error.response?.data);
  }
});

router.get('/me/tracks', async (req: Request, res: Response) => {
  const session = req.session as SpotifySession;
  const { limit = 50, offset = 0 } = req.query;
  try {
    const data = await spotifyRequest(
      session.spotifyAccessToken!, 'GET', '/me/tracks',
      undefined,
      { limit, offset }
    );
    res.json(data);
  } catch (error: any) {
    logger.error('GET /me/tracks failed:', error.response?.data);
    res.status(error.response?.status || 500).json(error.response?.data);
  }
});

router.get('/me/albums', async (req: Request, res: Response) => {
  const session = req.session as SpotifySession;
  const { limit = 50, offset = 0 } = req.query;
  try {
    const data = await spotifyRequest(
      session.spotifyAccessToken!, 'GET', '/me/albums',
      undefined,
      { limit, offset }
    );
    res.json(data);
  } catch (error: any) {
    logger.error('GET /me/albums failed:', error.response?.data);
    res.status(error.response?.status || 500).json(error.response?.data);
  }
});

router.get('/me/following', async (req: Request, res: Response) => {
  const session = req.session as SpotifySession;
  const { type = 'artist', limit = 50, after } = req.query;
  try {
    const data = await spotifyRequest(
      session.spotifyAccessToken!, 'GET', '/me/following',
      undefined,
      { type, limit, after }
    );
    res.json(data);
  } catch (error: any) {
    logger.error('GET /me/following failed:', error.response?.data);
    res.status(error.response?.status || 500).json(error.response?.data);
  }
});

router.get('/me/player/recently-played', async (req: Request, res: Response) => {
  const session = req.session as SpotifySession;
  const { limit = 50 } = req.query;
  try {
    const data = await spotifyRequest(
      session.spotifyAccessToken!, 'GET', '/me/player/recently-played',
      undefined,
      { limit }
    );
    res.json(data);
  } catch (error: any) {
    logger.error('GET /me/player/recently-played failed:', error.response?.data);
    res.status(error.response?.status || 500).json(error.response?.data);
  }
});

router.get('/me/top/:type', async (req: Request, res: Response) => {
  const session = req.session as SpotifySession;
  const { type } = req.params;
  const { limit = 20, time_range = 'medium_term' } = req.query;
  
  if (!['tracks', 'artists'].includes(type as string)) {
    res.status(400).json({ error: 'Type must be "tracks" or "artists"' });
    return;
  }
  
  try {
    const data = await spotifyRequest(
      session.spotifyAccessToken!, 'GET', `/me/top/${type}`,
      undefined,
      { limit, time_range }
    );
    res.json(data);
  } catch (error: any) {
    logger.error(`GET /me/top/${type} failed:`, error.response?.data);
    res.status(error.response?.status || 500).json(error.response?.data);
  }
});

router.get('/featured', async (req: Request, res: Response) => {
  const session = req.session as SpotifySession;
  const { limit = 20, offset = 0 } = req.query;
  try {
    const data = await spotifyBrowseRequest(
      session.spotifyAccessToken!, 'GET', '/featured-playlists',
      undefined,
      { limit, offset }
    );
    res.json(data);
  } catch (error: any) {
    logger.error('GET /featured failed:', error.response?.data);
    res.status(error.response?.status || 500).json(error.response?.data);
  }
});

router.get('/new-releases', async (req: Request, res: Response) => {
  const session = req.session as SpotifySession;
  const { limit = 20, offset = 0 } = req.query;
  try {
    const data = await spotifyBrowseRequest(
      session.spotifyAccessToken!, 'GET', '/new-releases',
      undefined,
      { limit, offset }
    );
    res.json(data);
  } catch (error: any) {
    logger.error('GET /new-releases failed:', error.response?.data);
    res.status(error.response?.status || 500).json(error.response?.data);
  }
});

router.get('/categories', async (req: Request, res: Response) => {
  const session = req.session as SpotifySession;
  const { limit = 50, offset = 0 } = req.query;
  try {
    const data = await spotifyBrowseRequest(
      session.spotifyAccessToken!, 'GET', '/categories',
      undefined,
      { limit, offset }
    );
    res.json(data);
  } catch (error: any) {
    logger.error('GET /categories failed:', error.response?.data);
    res.status(error.response?.status || 500).json(error.response?.data);
  }
});

router.get('/categories/:id', async (req: Request, res: Response) => {
  const session = req.session as SpotifySession;
  const { id } = req.params;
  const { limit = 20, offset = 0 } = req.query;
  try {
    const data = await spotifyBrowseRequest(
      session.spotifyAccessToken!, 'GET', `/categories/${id}/playlists`,
      undefined,
      { limit, offset }
    );
    res.json(data);
  } catch (error: any) {
    logger.error(`GET /categories/${id} failed:`, error.response?.data);
    res.status(error.response?.status || 500).json(error.response?.data);
  }
});

router.get('/recommendations', async (req: Request, res: Response) => {
  const session = req.session as SpotifySession;
  const { seed_tracks, seed_artists, seed_genres, limit = 20 } = req.query;
  
  try {
    const params: any = { limit };
    if (seed_tracks) params.seed_tracks = seed_tracks;
    if (seed_artists) params.seed_artists = seed_artists;
    if (seed_genres) params.seed_genres = seed_genres;
    
    const data = await spotifyRequest(
      session.spotifyAccessToken!, 'GET', '/recommendations',
      undefined,
      params
    );
    res.json(data);
  } catch (error: any) {
    logger.error('GET /recommendations failed:', error.response?.data);
    res.status(error.response?.status || 500).json(error.response?.data);
  }
});

router.get('/search', async (req: Request, res: Response) => {
  const session = req.session as SpotifySession;
  const { q, type = 'track', limit = 20 } = req.query;

  if (!q) {
    res.status(400).json({ error: 'Missing search query parameter "q"' });
    return;
  }

  try {
    const data = await spotifyRequest(
      session.spotifyAccessToken!, 'GET', '/search',
      undefined,
      { q, type, limit }
    );
    res.json(data);
  } catch (error: any) {
    logger.error('GET /search failed:', error.response?.data);
    res.status(error.response?.status || 500).json(error.response?.data);
  }
});

router.get('/playlists/:id', async (req: Request, res: Response) => {
  const session = req.session as SpotifySession;
  try {
    const data = await spotifyRequest(
      session.spotifyAccessToken!, 'GET', `/playlists/${req.params.id}`
    );
    res.json(data);
  } catch (error: any) {
    logger.error(`GET /playlists/${req.params.id} failed:`, error.response?.data);
    res.status(error.response?.status || 500).json(error.response?.data);
  }
});

router.get('/playlists/:id/tracks', async (req: Request, res: Response) => {
  const session = req.session as SpotifySession;
  const { limit = 50, offset = 0 } = req.query;
  try {
    const data = await spotifyRequest(
      session.spotifyAccessToken!, 'GET', `/playlists/${req.params.id}/tracks`,
      undefined,
      { limit, offset }
    );
    res.json(data);
  } catch (error: any) {
    logger.error(`GET /playlists/${req.params.id}/tracks failed:`, error.response?.data);
    res.status(error.response?.status || 500).json(error.response?.data);
  }
});

router.put('/me/player/play', async (req: Request, res: Response) => {
  const session = req.session as SpotifySession;
  try {
    await spotifyRequest(
      session.spotifyAccessToken!, 'PUT', '/me/player/play',
      req.body
    );
    res.json({ success: true });
  } catch (error: any) {
    logger.error('PUT /me/player/play failed:', error.response?.data);
    res.status(error.response?.status || 500).json(error.response?.data);
  }
});

router.put('/me/player/pause', async (req: Request, res: Response) => {
  const session = req.session as SpotifySession;
  try {
    await spotifyRequest(session.spotifyAccessToken!, 'PUT', '/me/player/pause');
    res.json({ success: true });
  } catch (error: any) {
    logger.error('PUT /me/player/pause failed:', error.response?.data);
    res.status(error.response?.status || 500).json(error.response?.data);
  }
});

router.post('/me/player/next', async (req: Request, res: Response) => {
  const session = req.session as SpotifySession;
  try {
    await spotifyRequest(session.spotifyAccessToken!, 'POST', '/me/player/next');
    res.json({ success: true });
  } catch (error: any) {
    logger.error('POST /me/player/next failed:', error.response?.data);
    res.status(error.response?.status || 500).json(error.response?.data);
  }
});

router.post('/me/player/previous', async (req: Request, res: Response) => {
  const session = req.session as SpotifySession;
  try {
    await spotifyRequest(session.spotifyAccessToken!, 'POST', '/me/player/previous');
    res.json({ success: true });
  } catch (error: any) {
    logger.error('POST /me/player/previous failed:', error.response?.data);
    res.status(error.response?.status || 500).json(error.response?.data);
  }
});

router.put('/me/player/volume', async (req: Request, res: Response) => {
  const session = req.session as SpotifySession;
  const { volume_percent } = req.query;
  try {
    await spotifyRequest(
      session.spotifyAccessToken!, 'PUT', '/me/player/volume',
      undefined,
      { volume_percent }
    );
    res.json({ success: true });
  } catch (error: any) {
    logger.error('PUT /me/player/volume failed:', error.response?.data);
    res.status(error.response?.status || 500).json(error.response?.data);
  }
});

router.get('/me/player', async (req: Request, res: Response) => {
  const session = req.session as SpotifySession;
  try {
    const data = await spotifyRequest(
      session.spotifyAccessToken!, 'GET', '/me/player'
    );
    res.json(data);
  } catch (error: any) {
    if (error.response?.status === 204) {
      res.json(null);
      return;
    }
    logger.error('GET /me/player failed:', error.response?.data);
    res.status(error.response?.status || 500).json(error.response?.data);
  }
});

router.post('/users/:userId/playlists', async (req: Request, res: Response) => {
  const session = req.session as SpotifySession;
  try {
    const data = await spotifyRequest(
      session.spotifyAccessToken!, 'POST',
      `/users/${req.params.userId}/playlists`,
      req.body
    );
    res.json(data);
  } catch (error: any) {
    logger.error('POST /users/:id/playlists failed:', error.response?.data);
    res.status(error.response?.status || 500).json(error.response?.data);
  }
});

router.post('/playlists/:id/tracks', async (req: Request, res: Response) => {
  const session = req.session as SpotifySession;
  try {
    const data = await spotifyRequest(
      session.spotifyAccessToken!, 'POST',
      `/playlists/${req.params.id}/tracks`,
      req.body
    );
    res.json(data);
  } catch (error: any) {
    logger.error('POST /playlists/:id/tracks failed:', error.response?.data);
    res.status(error.response?.status || 500).json(error.response?.data);
  }
});

export default router;
