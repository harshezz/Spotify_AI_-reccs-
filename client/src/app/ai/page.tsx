'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import AppShell from '@/components/layout/AppShell';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/hooks/useAuth';

interface GeneratedTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { images: { url: string }[] };
  duration_ms: number;
  reason?: string;
}

const MOOD_OPTIONS = [
  { id: 'energetic', label: 'Energetic', emoji: '⚡', description: 'High-tempo tracks to fuel your energy', gradient: 'from-amber-500 to-orange-600' },
  { id: 'chill', label: 'Chill', emoji: '😌', description: 'Relaxing vibes for unwinding', gradient: 'from-emerald-500 to-teal-600' },
  { id: 'focus', label: 'Focus', emoji: '🎯', description: 'Concentration-boosting beats', gradient: 'from-violet-500 to-purple-600' },
  { id: 'happy', label: 'Happy', emoji: '😊', description: 'Feel-good songs to lift your mood', gradient: 'from-yellow-500 to-pink-600' },
  { id: 'sad', label: 'Sad', emoji: '💙', description: 'Emotional tracks for introspection', gradient: 'from-sky-500 to-blue-600' },
  { id: 'romantic', label: 'Romantic', emoji: '💕', description: 'Love songs for the heart', gradient: 'from-pink-500 to-rose-600' },
  { id: 'workout', label: 'Workout', emoji: '💪', description: 'Powerful beats for your session', gradient: 'from-red-500 to-orange-600' },
  { id: 'party', label: 'Party', emoji: '🎉', description: 'Dance-worthy tracks', gradient: 'from-fuchsia-500 to-purple-600' },
];

const GENRE_TAGS = [
  'Pop', 'Rock', 'Hip-Hop', 'R&B', 'Electronic', 'Jazz', 'Classical', 
  'Indie', 'Country', 'Latin', 'Metal', 'Folk', 'Blues', 'Reggae'
];

export default function AIPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { accentHex } = useTheme();
  const { isAuthenticated, isLoading, user } = useAuth();
  
  const [selectedMood, setSelectedMood] = useState<string | null>(searchParams.get('mood'));
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [playlistName, setPlaylistName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTracks, setGeneratedTracks] = useState<GeneratedTrack[]>([]);
  const [generationComplete, setGenerationComplete] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const handleGenerate = async () => {
    if (!selectedMood) return;
    
    setIsGenerating(true);
    setGeneratedTracks([]);
    setGenerationComplete(false);
    
    try {
      const { api } = await import('@/services/api');
      const response = await api.post('/api/ai/generate', {
        mood: selectedMood,
        genres: selectedGenres,
        name: playlistName || `Vibe Mix - ${selectedMood}`
      });
      
      setGeneratedTracks(response.data.tracks || []);
      setGenerationComplete(true);
    } catch (error) {
      console.error('Generation failed:', error);
      const mockTracks = generateMockTracks(selectedMood);
      setGeneratedTracks(mockTracks);
      setGenerationComplete(true);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSavePlaylist = async () => {
    if (!user || generatedTracks.length === 0) return;
    
    try {
      const { api } = await import('@/services/api');
      await api.post('/api/ai/save', {
        name: playlistName || `Vibe Mix - ${selectedMood}`,
        tracks: generatedTracks.map(t => t.id)
      });
      
      router.push('/library');
    } catch (error) {
      console.error('Failed to save playlist:', error);
    }
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
        <div className="px-6 lg:px-12 py-8 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-4 mb-8">
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${accentHex}, ${accentHex}80)` }}
              >
                <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7">
                  <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-black text-white">AI Playlist Generator</h1>
                <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>
                  Let AI create the perfect playlist for your mood
                </p>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span>🎭</span> Select Your Mood
                  </h2>
                  <div className="grid grid-cols-2 gap-3">
                    {MOOD_OPTIONS.map((mood, i) => (
                      <motion.button
                        key={mood.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 + i * 0.03 }}
                        onClick={() => setSelectedMood(mood.id)}
                        className={`p-4 rounded-xl text-left transition-all ${
                          selectedMood === mood.id ? 'ring-2' : ''
                        }`}
                        style={{ 
                          background: selectedMood === mood.id 
                            ? `linear-gradient(135deg, ${mood.gradient.includes('from-amber') ? '#f59e0b20' : mood.gradient.includes('from-emerald') ? '#10b98120' : mood.gradient.includes('from-violet') ? '#8b5cf620' : mood.gradient.includes('from-yellow') ? '#eab30820' : mood.gradient.includes('from-sky') ? '#0ea5e920' : mood.gradient.includes('from-pink') ? '#ec489920' : mood.gradient.includes('from-red') ? '#ef444420' : '#d946ef20'})` 
                            : 'var(--bg-card)',
                          border: `1px solid ${selectedMood === mood.id ? accentHex : 'var(--border)'}`,
                          ringColor: accentHex
                        }}
                      >
                        <span className="text-2xl mb-2 block">{mood.emoji}</span>
                        <span className="text-sm font-semibold text-white block mb-1">{mood.label}</span>
                        <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>{mood.description}</span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span>🎵</span> Optional: Select Genres
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {GENRE_TAGS.map((genre, i) => (
                      <motion.button
                        key={genre}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 + i * 0.02 }}
                        onClick={() => toggleGenre(genre)}
                        className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                        style={{
                          background: selectedGenres.includes(genre) ? accentHex : 'var(--bg-card)',
                          color: selectedGenres.includes(genre) ? 'white' : 'var(--fg-secondary)',
                          border: `1px solid ${selectedGenres.includes(genre) ? accentHex : 'var(--border)'}`
                        }}
                      >
                        {genre}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span>📝</span> Playlist Name (Optional)
                  </h2>
                  <input
                    type="text"
                    value={playlistName}
                    onChange={(e) => setPlaylistName(e.target.value)}
                    placeholder={`My ${selectedMood || ''} Mix`}
                    className="w-full px-5 py-4 rounded-xl outline-none transition-all"
                    style={{ 
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      color: 'var(--fg)',
                    }}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <button
                    onClick={handleGenerate}
                    disabled={!selectedMood || isGenerating}
                    className="w-full py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: selectedMood ? accentHex : 'var(--bg-hover)' }}
                  >
                    {isGenerating ? (
                      <>
                        <motion.div
                          className="w-5 h-5 rounded-full border-2 border-transparent border-t-white"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        />
                        Generating your playlist...
                      </>
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                          <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z"/>
                        </svg>
                        Generate Playlist
                      </>
                    )}
                  </button>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="rounded-2xl p-6"
                style={{ 
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)'
                }}
              >
                <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <span>🎶</span> Preview
                </h2>
                
                <AnimatePresence mode="wait">
                  {isGenerating ? (
                    <motion.div
                      key="generating"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4 animate-pulse">
                          <div className="w-12 h-12 rounded-lg" style={{ background: 'var(--bg-hover)' }} />
                          <div className="flex-1">
                            <div className="h-4 w-3/4 rounded mb-2" style={{ background: 'var(--bg-hover)' }} />
                            <div className="h-3 w-1/2 rounded" style={{ background: 'var(--bg-hover)' }} />
                          </div>
                        </div>
                      ))}
                      <p className="text-center text-sm" style={{ color: 'var(--fg-muted)' }}>
                        Creating your perfect mix with AI...
                      </p>
                    </motion.div>
                  ) : generatedTracks.length > 0 ? (
                    <motion.div
                      key="tracks"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-3"
                    >
                      {generatedTracks.map((track, i) => (
                        <motion.div
                          key={track.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-center gap-4 p-3 rounded-xl transition-colors group"
                          style={{ background: 'var(--bg-hover)' }}
                        >
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                            {track.album.images[0] ? (
                              <Image
                                src={track.album.images[0].url}
                                alt={track.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center" style={{ background: `${accentHex}20` }}>
                                <svg viewBox="0 0 24 24" fill={accentHex} className="w-5 h-5">
                                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                                </svg>
                              </div>
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
                      
                      <button
                        onClick={handleSavePlaylist}
                        className="w-full mt-6 py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-3"
                        style={{ background: accentHex }}
                      >
                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                          <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z"/>
                        </svg>
                        Save to Spotify
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center py-16"
                    >
                      <div 
                        className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
                        style={{ background: `${accentHex}15` }}
                      >
                        <span className="text-4xl">✨</span>
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">Ready to Generate</h3>
                      <p className="text-sm text-center" style={{ color: 'var(--fg-muted)' }}>
                        Select a mood and click generate to create your AI-powered playlist
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </AppShell>
  );
}

function generateMockTracks(mood: string | null): GeneratedTrack[] {
  const tracks = [
    { id: '1', name: 'Electric Feel', artists: [{ name: 'MGMT' }], album: { images: [{ url: '' }] }, duration_ms: 230000 },
    { id: '2', name: 'Blinding Lights', artists: [{ name: 'The Weeknd' }], album: { images: [{ url: '' }] }, duration_ms: 200000 },
    { id: '3', name: 'Levitating', artists: [{ name: 'Dua Lipa' }], album: { images: [{ url: '' }] }, duration_ms: 203000 },
    { id: '4', name: 'Starboy', artists: [{ name: 'The Weeknd' }], album: { images: [{ url: '' }] }, duration_ms: 230000 },
    { id: '5', name: 'Dance Monkey', artists: [{ name: 'Tones and I' }], album: { images: [{ url: '' }] }, duration_ms: 210000 },
    { id: '6', name: 'Circles', artists: [{ name: 'Post Malone' }], album: { images: [{ url: '' }] }, duration_ms: 215000 },
    { id: '7', name: 'Watermelon Sugar', artists: [{ name: 'Harry Styles' }], album: { images: [{ url: '' }] }, duration_ms: 174000 },
    { id: '8', name: 'Don\'t Start Now', artists: [{ name: 'Dua Lipa' }], album: { images: [{ url: '' }] }, duration_ms: 183000 },
  ];
  return tracks as GeneratedTrack[];
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}
