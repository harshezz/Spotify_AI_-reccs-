'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // We landed here from Spotify with ?code=123.
    // Forward the exact url query direct to the backend auth endpoint to set cookies:
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    window.location.href = `${backendUrl}/api/auth/callback${window.location.search}`;
  }, []);

  return (
    <main 
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'var(--bg)', color: 'var(--fg)' }}
    >
      <motion.div
        className="text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative w-16 h-16 mx-auto mb-6">
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-violet-500/30"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-violet-500"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        </div>

        <h2 className="text-xl font-semibold text-white mb-2">Connecting to Spotify...</h2>
        <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>Setting up your Vibe experience</p>
      </motion.div>
    </main>
  );
}
