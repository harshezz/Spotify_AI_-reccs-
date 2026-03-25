'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import AppShell from '@/components/layout/AppShell';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

interface SearchResult {
  id: string;
  name: string;
  type: 'track' | 'album' | 'artist' | 'playlist';
  artists?: { name: string }[];
  images?: { url: string }[];
  owner?: { display_name: string };
  duration_ms?: number;
  tracks?: { total: number };
}

const BROWSE_CATEGORIES = [
  { id: 'pop', label: 'Pop', emoji: '🎵', gradient: 'from-pink-500 to-rose-600' },
  { id: 'hiphop', label: 'Hip-Hop', emoji: '🎤', gradient: 'from-amber-500 to-orange-600' },
  { id: 'rock', label: 'Rock', emoji: '🎸', gradient: 'from-red-500 to-rose-600' },
  { id: 'latin', label: 'Latin', emoji: '💃', gradient: 'from-yellow-500 to-amber-600' },
  { id: 'electronic', label: 'Electronic', emoji: '🎹', gradient: 'from-cyan-500 to-blue-600' },
  { id: 'indie', label: 'Indie', emoji: '✨', gradient: 'from-violet-500 to-purple-600' },
  { id: 'mood', label: 'Mood', emoji: '🎭', gradient: 'from-emerald-500 to-teal-600' },
  { id: 'workout', label: 'Workout', emoji: '💪', gradient: 'from-orange-500 to-red-600' },
  { id: 'chill', label: 'Chill', emoji: '😌', gradient: 'from-sky-500 to-blue-600' },
  { id: 'focus', label: 'Focus', emoji: '🎯', gradient: 'from-indigo-500 to-violet-600' },
];

type TabType = 'all' | 'tracks' | 'albums' | 'artists' | 'playlists';

export default function BrowsePage() {
  const router = useRouter();
  const { accentHex } = useTheme();
  const { isAuthenticated, isLoading } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const { api } = await import('@/services/api');
      const response = await api.get('/api/spotify/search', {
        params: { q: query, type: 'track,album,artist,playlist', limit: 20 }
      });
      
      const items: SearchResult[] = [];
      
      if (response.data.tracks?.items) {
        response.data.tracks.items.forEach((track: any) => {
          items.push({
            id: track.id,
            name: track.name,
            type: 'track',
            artists: track.artists,
            images: track.album?.images,
            duration_ms: track.duration_ms,
          });
        });
      }
      
      if (response.data.albums?.items) {
        response.data.albums.items.forEach((album: any) => {
          items.push({
            id: album.id,
            name: album.name,
            type: 'album',
            artists: album.artists,
            images: album.images,
          });
        });
      }
      
      if (response.data.artists?.items) {
        response.data.artists.items.forEach((artist: any) => {
          items.push({
            id: artist.id,
            name: artist.name,
            type: 'artist',
            images: artist.images,
          });
        });
      }
      
      if (response.data.playlists?.items) {
        response.data.playlists.items.forEach((playlist: any) => {
          items.push({
            id: playlist.id,
            name: playlist.name,
            type: 'playlist',
            images: playlist.images,
            owner: playlist.owner,
            tracks: playlist.tracks,
          });
        });
      }
      
      setResults(items);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      handleSearch(searchQuery);
    }, 500);
    
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchQuery, handleSearch]);

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSearchQuery(categoryId);
    searchInputRef.current?.focus();
  };

  const filteredResults = activeTab === 'all' 
    ? results 
    : results.filter(r => r.type === activeTab.slice(0, -1) as SearchResult['type']);

  const tabs: { id: TabType; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'tracks', label: 'Tracks' },
    { id: 'albums', label: 'Albums' },
    { id: 'artists', label: 'Artists' },
    { id: 'playlists', label: 'Playlists' },
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
            <h1 className="text-3xl font-black text-white mb-8">Browse</h1>
            
            <div className="relative mb-8">
              <div 
                className="flex items-center rounded-2xl px-5"
                style={{ 
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)'
                }}
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-4" style={{ color: 'var(--fg-muted)' }}>
                  <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd"/>
                </svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for songs, albums, artists, or playlists..."
                  className="flex-1 py-4 bg-transparent text-white placeholder-white/30 outline-none"
                  style={{ color: 'var(--fg)' }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-2 rounded-full transition-colors hover:bg-white/10"
                    style={{ color: 'var(--fg-muted)' }}
                  >
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"/>
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {!searchQuery && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-10"
              >
                <h2 className="text-lg font-bold text-white mb-5">Browse Categories</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {BROWSE_CATEGORIES.map((category, i) => (
                    <motion.button
                      key={category.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 + i * 0.03 }}
                      onClick={() => handleCategoryClick(category.label)}
                      className="relative p-5 rounded-2xl text-left overflow-hidden group"
                      style={{ 
                        background: `linear-gradient(135deg, var(--bg-card), var(--bg-hover))`,
                        border: '1px solid var(--border)'
                      }}
                    >
                      <div className="relative z-10">
                        <span className="text-3xl mb-2 block">{category.emoji}</span>
                        <span className="text-sm font-semibold text-white">{category.label}</span>
                      </div>
                      <div 
                        className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-20 transform translate-x-4 -translate-y-4 group-hover:scale-150 transition-transform duration-500"
                        style={{ background: `linear-gradient(135deg, ${category.gradient.split(' ')[0].replace('from-', '')}, ${category.gradient.split(' ')[1].replace('to-', '')})` }}
                      />
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {searchQuery && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-2 mb-6 overflow-x-auto pb-2"
                >
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all"
                      style={{
                        background: activeTab === tab.id ? accentHex : 'var(--bg-card)',
                        color: activeTab === tab.id ? 'white' : 'var(--fg-secondary)',
                        border: `1px solid ${activeTab === tab.id ? accentHex : 'var(--border)'}`
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </motion.div>

                <AnimatePresence mode="wait">
                  {isSearching ? (
                    <motion.div
                      key="searching"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center py-20"
                    >
                      <motion.div
                        className="w-10 h-10 rounded-full border-2 border-transparent border-t-current"
                        style={{ borderColor: `${accentHex}40`, borderTopColor: accentHex }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      />
                    </motion.div>
                  ) : filteredResults.length > 0 ? (
                    <motion.div
                      key="results"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-2"
                    >
                      {filteredResults.map((result, i) => (
                        <motion.div
                          key={`${result.type}-${result.id}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className="flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-colors group"
                          style={{ 
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border)'
                          }}
                        >
                          <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                            {result.images?.[0] ? (
                              <Image
                                src={result.images[0].url}
                                alt={result.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center" style={{ background: `${accentHex}20` }}>
                                <svg viewBox="0 0 24 24" fill={accentHex} className="w-6 h-6">
                                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                                </svg>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <svg viewBox="0 0 20 20" fill="white" className="w-6 h-6">
                                <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
                              </svg>
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{result.name}</p>
                            <p className="text-xs mt-0.5" style={{ color: 'var(--fg-muted)' }}>
                              {result.type === 'artist' 
                                ? 'Artist'
                                : result.artists?.map(a => a.name).join(', ') || result.owner?.display_name
                              }
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <span 
                              className="px-2 py-1 rounded text-[10px] font-semibold uppercase"
                              style={{ background: `${accentHex}15`, color: accentHex }}
                            >
                              {result.type}
                            </span>
                            {result.duration_ms && (
                              <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>
                                {formatDuration(result.duration_ms)}
                              </span>
                            )}
                            {result.tracks && (
                              <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>
                                {result.tracks.total} tracks
                              </span>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center py-20"
                    >
                      <div 
                        className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                        style={{ background: `${accentHex}15` }}
                      >
                        <svg viewBox="0 0 24 24" fill={accentHex} className="w-10 h-10">
                          <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd"/>
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">No results found</h3>
                      <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>
                        Try searching for something else or browse categories
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
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
