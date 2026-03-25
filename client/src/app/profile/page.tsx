'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import AppShell from '@/components/layout/AppShell';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/hooks/useAuth';

interface TopArtist {
  id: string;
  name: string;
  genres: string[];
  images: { url: string }[];
}

interface TopTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { images: { url: string }[] };
  duration_ms: number;
}

interface UserStats {
  followers: number;
  product: string;
  country: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { mode, toggleMode, accent, setAccent, accentHex } = useTheme();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'top' | 'settings'>('overview');
  const [topArtists, setTopArtists] = useState<TopArtist[]>([]);
  const [topTracks, setTopTracks] = useState<TopTrack[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!isAuthenticated) return;
      
      setIsLoadingData(true);
      try {
        const { api } = await import('@/services/api');
        
        const [profileRes, topArtistsRes, topTracksRes] = await Promise.allSettled([
          api.get('/api/spotify/me'),
          api.get('/api/spotify/me/top/artists', { params: { limit: 10 } }),
          api.get('/api/spotify/me/top/tracks', { params: { limit: 10 } }),
        ]);

        if (profileRes.status === 'fulfilled') {
          const data = profileRes.value.data;
          setUserStats({
            followers: data.followers?.total || 0,
            product: data.product || 'unknown',
            country: data.country || 'US',
          });
        }
        
        if (topArtistsRes.status === 'fulfilled') {
          setTopArtists(topArtistsRes.value.data.items || []);
        }
        
        if (topTracksRes.status === 'fulfilled') {
          setTopTracks(topTracksRes.value.data.items || []);
        }
      } catch (error) {
        console.error('Failed to fetch profile data:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchProfileData();
  }, [isAuthenticated]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

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
        <div className="max-w-4xl mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-5 mb-8">
              {user?.imageUrl ? (
                <div className="relative w-20 h-20 rounded-full overflow-hidden" style={{ boxShadow: `0 0 30px ${accentHex}40` }}>
                  <Image
                    src={user.imageUrl}
                    alt={user.displayName || 'Profile'}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold"
                  style={{ background: `${accentHex}20`, color: accentHex }}
                >
                  {user?.displayName?.charAt(0) || 'U'}
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-white">{user?.displayName || 'User'}</h1>
                <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>{user?.email}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase"
                    style={{ 
                      background: user?.product === 'premium' ? '#1DB95420' : 'var(--bg-card)',
                      color: user?.product === 'premium' ? '#1DB954' : 'var(--fg-muted)',
                      border: `1px solid ${user?.product === 'premium' ? '#1DB95430' : 'var(--border)'}`
                    }}
                  >
                    {user?.product === 'premium' ? 'Premium' : 'Free'}
                  </span>
                  {userStats && (
                    <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>
                      {userStats.followers.toLocaleString()} followers
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-1 mb-8 p-1 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              {(['overview', 'top', 'settings'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium capitalize transition-all"
                  style={{
                    background: activeTab === tab ? accentHex : 'transparent',
                    color: activeTab === tab ? 'white' : 'var(--fg-secondary)',
                  }}
                >
                  {tab === 'top' ? 'Top Artists & Tracks' : tab}
                </button>
              ))}
            </div>

            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {[
                    { label: 'Followers', value: userStats?.followers?.toLocaleString() || '—' },
                    { label: 'Account Type', value: user?.product === 'premium' ? 'Premium' : 'Free' },
                    { label: 'Country', value: userStats?.country || '—' },
                    { label: 'Top Genre', value: topArtists[0]?.genres[0] || '—' },
                  ].map(stat => (
                    <div
                      key={stat.label}
                      className="p-5 rounded-2xl"
                      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                    >
                      <p className="text-2xl font-bold" style={{ color: accentHex }}>{stat.value}</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--fg-muted)' }}>{stat.label}</p>
                    </div>
                  ))}
                </div>

                <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--fg-secondary)' }}>Quick Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'AI Playlist Generator', desc: 'Create a playlist based on your mood', icon: '✨', path: '/ai' },
                    { label: 'Browse Music', desc: 'Search and discover new tracks', icon: '🔍', path: '/browse' },
                    { label: 'Your Library', desc: 'View saved tracks and playlists', icon: '📚', path: '/library' },
                    { label: 'Dashboard', desc: 'View your personalized home', icon: '🏠', path: '/dashboard' },
                  ].map(action => (
                    <button
                      key={action.label}
                      onClick={() => router.push(action.path)}
                      className="flex items-start gap-4 p-5 rounded-2xl text-left transition-all hover:scale-[1.02]"
                      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                    >
                      <span className="text-2xl">{action.icon}</span>
                      <div>
                        <p className="text-sm font-semibold text-white">{action.label}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--fg-muted)' }}>{action.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'top' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {isLoadingData ? (
                  <div className="space-y-8">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="aspect-square rounded-full mb-3" style={{ background: 'var(--bg-card)' }} />
                          <div className="h-4 w-3/4 mx-auto rounded" style={{ background: 'var(--bg-card)' }} />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="text-lg font-bold text-white mb-6">Top Artists</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-10">
                      {topArtists.slice(0, 10).map((artist, i) => (
                        <motion.div
                          key={artist.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="text-center"
                        >
                          <div className="relative w-full aspect-square rounded-full overflow-hidden mb-3" style={{ boxShadow: `0 8px 24px ${accentHex}30` }}>
                            {artist.images[0] ? (
                              <Image
                                src={artist.images[0].url}
                                alt={artist.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center" style={{ background: `${accentHex}20` }}>
                                <span className="text-2xl">🎵</span>
                              </div>
                            )}
                          </div>
                          <p className="text-sm font-semibold text-white truncate">{artist.name}</p>
                          <p className="text-xs truncate" style={{ color: 'var(--fg-muted)' }}>
                            {artist.genres[0] || 'Artist'}
                          </p>
                        </motion.div>
                      ))}
                    </div>

                    <h3 className="text-lg font-bold text-white mb-6">Top Tracks</h3>
                    <div className="space-y-2">
                      {topTracks.slice(0, 10).map((track, i) => (
                        <motion.div
                          key={track.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className="flex items-center gap-4 p-4 rounded-xl"
                          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                        >
                          <span className="text-lg font-bold w-6" style={{ color: 'var(--fg-muted)' }}>{i + 1}</span>
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
                          <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>
                            {formatDuration(track.duration_ms)}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="p-6 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  <h3 className="text-sm font-semibold mb-4 text-white">Appearance</h3>
                  <div className="flex gap-3">
                    {(['dark', 'light'] as const).map(m => (
                      <button
                        key={m}
                        onClick={() => { if (mode !== m) toggleMode(); }}
                        className="flex-1 p-4 rounded-xl text-sm font-medium capitalize transition-all flex flex-col items-center gap-2"
                        style={{
                          background: mode === m ? `${accentHex}15` : 'var(--bg-hover)',
                          border: mode === m ? `2px solid ${accentHex}` : '2px solid transparent',
                          color: mode === m ? accentHex : 'var(--fg-secondary)',
                        }}
                      >
                        {m === 'dark' ? '🌙' : '☀️'}
                        <span>{m === 'dark' ? 'Dark' : 'Light'}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-6 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  <h3 className="text-sm font-semibold mb-4 text-white">Accent Color</h3>
                  <div className="flex gap-4">
                    {(['violet', 'emerald', 'rose', 'amber', 'sky'] as const).map(color => (
                      <button
                        key={color}
                        onClick={() => setAccent(color)}
                        className="flex flex-col items-center gap-2"
                      >
                        <div
                          className="w-10 h-10 rounded-full transition-all"
                          style={{
                            background: {
                              violet: '#8B5CF6',
                              emerald: '#10B981',
                              rose: '#F43F5E',
                              amber: '#F59E0B',
                              sky: '#0EA5E9',
                            }[color],
                            transform: accent === color ? 'scale(1.2)' : 'scale(1)',
                            boxShadow: accent === color ? `0 0 20px ${accentHex}50` : 'none',
                            border: accent === color ? '3px solid white' : '3px solid transparent',
                          }}
                        />
                        <span className="text-[10px] capitalize" style={{ color: accent === color ? accentHex : 'var(--fg-muted)' }}>
                          {color}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-6 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  <h3 className="text-sm font-semibold mb-4 text-white">Legal</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => router.push('/privacy')}
                      className="w-full flex items-center justify-between p-3 rounded-lg transition-colors hover:bg-[var(--bg-hover)]"
                    >
                      <div className="flex items-center gap-3">
                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" style={{ color: 'var(--fg-muted)' }}>
                          <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                        </svg>
                        <span className="text-sm">Privacy Policy</span>
                      </div>
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" style={{ color: 'var(--fg-muted)' }}>
                        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd"/>
                      </svg>
                    </button>
                    <button
                      onClick={() => router.push('/terms')}
                      className="w-full flex items-center justify-between p-3 rounded-lg transition-colors hover:bg-[var(--bg-hover)]"
                    >
                      <div className="flex items-center gap-3">
                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" style={{ color: 'var(--fg-muted)' }}>
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2v-2z" clipRule="evenodd"/>
                        </svg>
                        <span className="text-sm">Terms of Service</span>
                      </div>
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" style={{ color: 'var(--fg-muted)' }}>
                        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="p-6 rounded-2xl" style={{ background: '#F43F5E08', border: '1px solid #F43F5E20' }}>
                  <h3 className="text-sm font-semibold mb-1 text-red-400">Account</h3>
                  <p className="text-xs mb-4" style={{ color: 'var(--fg-muted)' }}>
                    Disconnect your Spotify account from Vibe.
                  </p>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                  >
                    Log Out
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </AppShell>
  );
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}
