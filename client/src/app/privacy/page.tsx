'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import { useTheme } from '@/context/ThemeContext';

const sections = [
  {
    title: '1. Information We Collect',
    content: `When you connect your Spotify account to Vibe, we collect:
    
• Your Spotify profile information (name, email, profile picture)
• Your playlists and library content
• Listening history and playback data
• Device information and usage analytics

We do NOT collect or store your Spotify passwords or payment information.`,
  },
  {
    title: '2. How We Use Your Data',
    content: `We use your information to:

• Provide personalized music recommendations
• Generate AI-curated playlists based on your listening habits
• Sync your preferences across devices
• Display your listening statistics and top artists
• Improve our services and user experience`,
  },
  {
    title: '3. Data Storage & Security',
    content: `All sensitive data is stored securely using Supabase, a trusted backend-as-a-service platform.

• Session tokens are stored in HTTP-only cookies
• Access tokens are encrypted and stored server-side
• Your data is encrypted in transit using TLS/SSL
• We never share your personal data with third parties`,
  },
  {
    title: '4. Spotify Integration',
    content: `Vibe uses the official Spotify Web API to access your music data. By using Vibe, you agree to Spotify's Terms of Service and Privacy Policy.

We only request the minimum permissions necessary to provide our services:
• Read your profile and public playlists
• Access your recently played tracks
• Create and modify your playlists`,
  },
  {
    title: '5. Your Rights',
    content: `You have full control over your data:

• Disconnect your Spotify account at any time
• Request deletion of all your data
• Export your listening history
• Opt out of analytics tracking

To exercise these rights, visit your Profile settings or contact us.`,
  },
  {
    title: '6. Cookies & Tracking',
    content: `We use minimal cookies for:

• Authentication sessions (required)
• Theme preferences (optional)
• Analytics to improve our service (optional, anonymized)

You can disable non-essential cookies in your browser settings.`,
  },
  {
    title: '7. Data Retention',
    content: `We retain your data for as long as your account is active or as needed to provide services.

• Account data: Until you delete your account
• Analytics: 90 days (anonymized)
• Session logs: 30 days

You can request immediate deletion at any time.`,
  },
  {
    title: '8. Contact Us',
    content: `For privacy concerns or data requests:

Email: privacy@vibemusic.app
Last updated: March 2026

We respond to all privacy requests within 48 hours.`,
  },
];

export default function PrivacyPage() {
  const { accentHex } = useTheme();

  return (
    <AppShell>
      <div className="min-h-screen pb-32">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link 
              href="/"
              className="inline-flex items-center gap-2 text-sm mb-8 transition-colors"
              style={{ color: 'var(--fg-muted)' }}
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd"/>
              </svg>
              Back to Home
            </Link>

            <div className="mb-12">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                style={{ background: `${accentHex}15` }}
              >
                <svg viewBox="0 0 24 24" fill={accentHex} className="w-8 h-8">
                  <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-11v6h2v-6h-2zm0-4v2h2V7h-2z"/>
                </svg>
              </div>
              <h1 className="text-4xl font-black text-white mb-4">Privacy Policy</h1>
              <p style={{ color: 'var(--fg-secondary)' }}>
                Your privacy matters to us. This policy explains how Vibe collects, uses, and protects your data when you connect your Spotify account.
              </p>
            </div>

            <div className="space-y-8">
              {sections.map((section, index) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  className="p-6 rounded-2xl"
                  style={{ 
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)'
                  }}
                >
                  <h2 className="text-lg font-bold text-white mb-3">{section.title}</h2>
                  <p 
                    className="text-sm leading-relaxed whitespace-pre-line"
                    style={{ color: 'var(--fg-secondary)' }}
                  >
                    {section.content}
                  </p>
                </motion.div>
              ))}
            </div>

            <div 
              className="mt-12 p-6 rounded-2xl"
              style={{ 
                background: `${accentHex}08`,
                border: `1px solid ${accentHex}20`
              }}
            >
              <h3 className="text-sm font-semibold text-white mb-2">Questions about privacy?</h3>
              <p className="text-sm mb-4" style={{ color: 'var(--fg-secondary)' }}>
                We're here to help. Reach out to our team for any privacy-related questions.
              </p>
              <a 
                href="mailto:privacy@vibemusic.app"
                className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
                style={{ color: accentHex }}
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z"/>
                  <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z"/>
                </svg>
                privacy@vibemusic.app
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </AppShell>
  );
}
