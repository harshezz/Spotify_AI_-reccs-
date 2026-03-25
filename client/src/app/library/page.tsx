'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import AppShell from '@/components/layout/AppShell';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

interface Playlist {
  id: string;
  name: string;
  description: string;
  images: { url: string }[];
  tracks: { total: number };
  owner: { display_name: string };
}

interface Album {
  id: string;
  name: string;
  artists: { name: string }[];
  images: { url: string }[];
  album_type: string;
  release_date: string;
}

interface Artist {
  id: string;
  name: string;
  images: { url: string }[];
  genres: string[];
  followers: { total: number };
}

interface SavedTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { images: { url: string }[]; name: string };
  duration_ms: number;
  added_at: string;
}

type TabType = 'playlists' | 'albums' | 'artists' | 'songs';

export default function LibraryPage() {
  const router = useRouter();
  const { accentHex } = useTheme();
  const { isAuthenticated, isLoading } = useAuth();
  
  const [activeTab, setActiveTab] = useState<TabType>('playlists');
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [savedTracks, setSavedTracks] = useState<SavedTrack[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    const fetchLibraryData = async () => {
      if (!isAuthenticated) return;
      
      setIsLoadingData(true);
      try {
        const { api } = await import('@/services/api');
        
        const [playlistsRes, albumsRes, artistsRes, tracksRes] = await Promise.allSettled([
          api.get('/api/spotify/me/playlists', { params: { limit: 50 } }),
          api.get('/api/spotify/me/albums', { params: { limit: 50 } }),
          api.get('/api/spotify/me/following', { params: { type: 'artist', limit: 50 } }),
          api.get('/api/spotify/me/tracks', { params: { limit: 50 } }),
        ]);

        if (playlistsRes.status === 'fulfilled') {
          setPlaylists(playlistsRes.value.data.items || []);
        }
        if (albumsRes.status === 'fulfilled') {
          setAlbums(albumsRes.value.data.items?.map((item: any) => item.album) || []);
        }
        if (artistsRes.status === 'fulfilled') {
          setArtists(artistsRes.value.data.artists?.items || []);
        }
        if (tracksRes.status === 'fulfilled') {
          setSavedTracks(tracksRes.value.data.items || []);
        }
      } catch (error) {
        console.error('Failed to fetch library data:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchLibraryData();
  }, [isAuthenticated]);

  const tabs: { id: TabType; label: string; count?: number }[] = [
    { id: 'playlists', label: 'Playlists', count: playlists.length },
    { id: 'albums', label: 'Albums', count: albums.length },
    { id: 'artists', label: 'Artists', count: artists.length },
    { id: 'songs', label: 'Liked Songs', count: savedTracks.length },
  ];

  if (isLoading || !isAuthenticated) {
    return (
      <AppShell>
        <div className="min-h-screen flex items-center justify-center">
          <motion.div
            className="w-12 h-12 rounded-full border-2 border-transparent border-t-current"
            style={{ borderColor: `${accentHex}40`, borderTopColor: accentHex }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="min-h-screen pb-32">
        <div className="px-6 lg:px-12 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-black text-white mb-8">Your Library</h1>
            
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2"
                  style={{
                    background: activeTab === tab.id ? accentHex : 'var(--bg-card)',
                    color: activeTab === tab.id ? 'white' : 'var(--fg-secondary)',
                    border: `1px solid ${activeTab === tab.id ? accentHex : 'var(--border)'}`
                  }}
                >
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span 
                      className="px-2 py-0.5 rounded-full text-xs"
                      style={{ 
                        background: activeTab === tab.id ? 'rgba(255,255,255,0.2)' : 'var(--bg-hover)',
                        color: activeTab === tab.id ? 'white' : 'var(--fg-muted)'
                      }}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {isLoadingData ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5"
                >
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-square rounded-xl mb-3" style={{ background: 'var(--bg-card)' }} />
                      <div className="h-4 w-3/4 rounded mb-2" style={{ background: 'var(--bg-card)' }} />
                      <div className="h-3 w-1/2 rounded" style={{ background: 'var(--bg-card)' }} />
                    </div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {activeTab === 'playlists' && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                      {playlists.length > 0 ? (
                        playlists.map((playlist, i) => (
                          <motion.div
                            key={playlist.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="p-4 rounded-2xl cursor-pointer group transition-all hover:scale-[1.02]"
                            style={{ 
                              background: 'var(--bg-card)',
                              border: '1px solid var(--border)'
                            }}
                          >
                            <div className="relative aspect-square rounded-xl overflow-hidden mb-4" style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
                              {playlist.images[0] ? (
                                <Image
                                  src={playlist.images[0].url}
                                  alt={playlist.name}
                                  fill
                                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center" style={{ background: `${accentHex}20` }}>
                                  <svg viewBox="0 0 24 24" fill={accentHex} className="w-12 h-12">
                                    <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/>
                                  </svg>
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: accentHex }}>
                                  <svg viewBox="0 0 20 20" fill="white" className="w-6 h-6 ml-0.5">
                                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
                                  </svg>
                                </div>
                              </div>
                            </div>
                            <h3 className="text-sm font-bold text-white truncate mb-1">{playlist.name}</h3>
                            <p className="text-xs truncate" style={{ color: 'var(--fg-muted)' }}>
                              By {playlist.owner.display_name} • {playlist.tracks.total} tracks
                            </p>
                          </motion.div>
                        ))
                      ) : (
                        <EmptyState 
                          emoji="🎵" 
                          title="No playlists yet" 
                          description="Create your first playlist to organize your favorite music"
                          accentHex={accentHex}
                        />
                      )}
                    </div>
                  )}

                  {activeTab === 'albums' && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                      {albums.length > 0 ? (
                        albums.map((album, i) => (
                          <motion.div
                            key={album.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="p-4 rounded-2xl cursor-pointer group transition-all hover:scale-[1.02]"
                            style={{ 
                              background: 'var(--bg-card)',
                              border: '1px solid var(--border)'
                            }}
                          >
                            <div className="relative aspect-square rounded-xl overflow-hidden mb-4" style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
                              {album.images[0] && (
                                <Image
                                  src={album.images[0].url}
                                  alt={album.name}
                                  fill
                                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                              )}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: accentHex }}>
                                  <svg viewBox="0 0 20 20" fill="white" className="w-6 h-6 ml-0.5">
                                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
                                  </svg>
                                </div>
                              </div>
                            </div>
                            <h3 className="text-sm font-bold text-white truncate mb-1">{album.name}</h3>
                            <p className="text-xs truncate" style={{ color: 'var(--fg-muted)' }}>
                              {album.artists.map(a => a.name).join(', ')}
                            </p>
                          </motion.div>
                        ))
                      ) : (
                        <EmptyState 
                          emoji="💿" 
                          title="No saved albums" 
                          description="Save albums to find them here"
                          accentHex={accentHex}
                        />
                      )}
                    </div>
                  )}

                  {activeTab === 'artists' && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5">
                      {artists.length > 0 ? (
                        artists.map((artist, i) => (
                          <motion.div
                            key={artist.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="p-4 rounded-2xl cursor-pointer group transition-all hover:scale-[1.02]"
                            style={{ 
                              background: 'var(--bg-card)',
                              border: '1px solid var(--border)'
                            }}
                          >
                            <div className="relative w-full aspect-square rounded-full overflow-hidden mb-4" style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
                              {artist.images[0] ? (
                                <Image
                                  src={artist.images[0].url}
                                  alt={artist.name}
                                  fill
                                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center" style={{ background: `${accentHex}20` }}>
                                  <svg viewBox="0 0 24 24" fill={accentHex} className="w-12 h-12">
                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                  </svg>
                                </div>
                              )}
                            </div>
                            <h3 className="text-sm font-bold text-white text-center truncate mb-1">{artist.name}</h3>
                            <p className="text-xs text-center truncate" style={{ color: 'var(--fg-muted)' }}>
                              Artist
                            </p>
                          </motion.div>
                        ))
                      ) : (
                        <EmptyState 
                          emoji="⭐" 
                          title="No followed artists" 
                          description="Follow artists to see them here"
                          accentHex={accentHex}
                        />
                      )}
                    </div>
                  )}

                  {activeTab === 'songs' && (
                    <div>
                      {savedTracks.length > 0 ? (
                        <div className="space-y-2">
                          {savedTracks.map((track, i) => (
                            <motion.div
                              key={track.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.02 }}
                              className="flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-colors group"
                              style={{ 
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border)'
                              }}
                            >
                              <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                                {track.album.images[0] && (
                                  <Image
                                    src={track.album.images[0].url}
                                    alt={track.name}
                                    fill
                                    className="object-cover"
                                  />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-white truncate">{track.name}</p>
                                <p className="text-xs truncate" style={{ color: 'var(--fg-muted)' }}>
                                  {track.artists.map(a => a.name).join(', ')}
                                </p>
                              </div>
                              <div className="text-xs" style={{ color: 'var(--fg-muted)' }}>
                                {formatDuration(track.duration_ms)}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <EmptyState 
                          emoji="❤️" 
                          title="No liked songs" 
                          description="Songs you like will appear here"
                          accentHex={accentHex}
                        />
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </AppShell>
  );
}

function EmptyState({ emoji, title, description, accentHex }: { emoji: string; title: string; description: string; accentHex: string }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20">
      <div 
        className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
        style={{ background: `${accentHex}15` }}
      >
        <span className="text-4xl">{emoji}</span>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>{description}</p>
    </div>
  );
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}
