'use client';

import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { spotifyService } from '@/services/spotifyService';
import { useAuth } from '@/hooks/useAuth';
import ASCIIText from './ASCIIText';
import GooeyNav from './GooeyNav';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const error = searchParams.get('error');

  const errorMessages: Record<string, string> = {
    access_denied: 'Access denied to Spotify account.',
    no_code: 'No authorization code received.',
    token_exchange_failed: 'Authentication failed. Please retry.',
  };

  if (!authLoading && isAuthenticated) {
    router.replace('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center p-6 bg-black text-white selection:bg-white/20 relative overflow-hidden">
      
      {/* Background Graphic: ASCII Waves */}
      <ASCIIText text="RAAG" enableWaves asciiFontSize={8} />
      
      {/* Glowing Orbs for ambiance */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center z-0">
        <div className="w-[800px] h-[800px] border-[1px] border-white/5 rounded-full absolute mix-blend-screen animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="w-[600px] h-[600px] border-[1px] border-white/5 rounded-full absolute mix-blend-screen delay-75" />
      </div>

      {/* Main Content Centered */}
      <div className="flex-1 flex w-full items-center justify-center relative z-10">
        <div className="flex flex-col items-center justify-center gap-6 w-full max-w-sm mx-auto">
          
          {/* Subtle Radial Glow purely for text legibility against ASCII backrop */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-black/80 blur-[60px] rounded-full pointer-events-none -z-10" />

          {/* Custom Swirl Logo */}
          <motion.div 
            className="w-20 h-20 flex items-center justify-center cursor-pointer mb-2"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ rotate: 180, scale: 1.1 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            <svg className="w-full h-full text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.9)] overflow-visible" viewBox="0.5 2.5 22 22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 15.5a3.5 3.5 0 1 1 3.5-3.5v1.5a3 3 0 0 0 6 0 10 10 0 1 0-3 8"/>
            </svg>
          </motion.div>

          <div className="flex flex-col items-center text-center mt-2 relative z-10 w-full">
            <motion.h1 
              className="text-4xl font-bold tracking-tight mb-4 text-white drop-shadow-[0_4px_8px_rgba(0,0,0,1)] text-center w-full"
              initial={{ y: 10 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              Initialize Connection
            </motion.h1>
            
            <motion.p 
              className="text-base text-zinc-300 max-w-[280px] mx-auto text-center leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,1)]"
              initial={{ y: 10 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            >
              Authenticate via Spotify to access your decentralized audio hub.
            </motion.p>
          </div>

          <div className="relative w-full h-[120px] mx-auto mt-2">
            <GooeyNav
              items={[
                {
                  label: "Connect Spotify",
                  onClick: () => spotifyService.login(),
                  icon: (
                    <svg viewBox="0 0 24 24" fill="#1DB954" className="w-6 h-6 group-hover:drop-shadow-[0_0_12px_rgba(29,185,84,0.8)] group-hover:scale-110 transition-all duration-300 flex-shrink-0">
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                    </svg>
                  )
                }
              ]}
              particleCount={18}
              particleDistances={[90, 40]}
              particleR={40}
              initialActiveIndex={0}
              animationTime={600}
              timeVariance={300}
              colors={[1, 2, 3, 1, 2, 3, 1, 4]}
            />
          </div>
        </div>
      </div>

      {/* Footer Elements Anchored to Bottom */}
      <div className="mt-auto w-full max-w-sm mx-auto relative z-10 flex flex-col items-center">
        <motion.div 
          className="w-full grid grid-cols-3 gap-[1px] bg-zinc-800/50 p-[1px] rounded-lg overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {[
            { id: '1', label: 'Nodes' },
            { id: '2', label: 'Sync' },
            { id: '3', label: 'Data' },
          ].map(feature => (
            <div key={feature.id} className="bg-black p-3 text-center">
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 block mb-1">MODULE</span>
              <span className="text-xs text-zinc-300">{feature.label}</span>
            </div>
          ))}
        </motion.div>

        <motion.div 
          className="text-[10px] uppercase tracking-widest text-zinc-600 space-x-4 pt-6 pb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Link href="/terms" className="hover:text-zinc-300 transition-colors">Terms</Link>
          <span>/</span>
          <Link href="/privacy" className="hover:text-zinc-300 transition-colors">Privacy</Link>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
