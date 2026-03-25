'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import { useTheme } from '@/context/ThemeContext';

const sections = [
  {
    title: '1. Acceptance of Terms',
    content: `By accessing or using Vibe Music ("Vibe," "we," "our," or "us"), you agree to be bound by these Terms of Service and all applicable laws and regulations.

If you do not agree with any part of these terms, you may not use our services.`,
  },
  {
    title: '2. Description of Service',
    content: `Vibe is a music companion application that integrates with Spotify. Our services include:

• AI-powered playlist generation based on your mood and preferences
• Personalized music recommendations
• Listening statistics and analytics
• Playlist management and organization
• Real-time music playback visualization

Vibe is not affiliated with, endorsed by, or connected to Spotify in any official capacity.`,
  },
  {
    title: '3. User Account & Eligibility',
    content: `To use Vibe, you must:

• Have a valid Spotify account (free or premium)
• Be at least 13 years old
• Not be prohibited from using Spotify's services
• Provide accurate and complete information

You are responsible for maintaining the security of your account and all activities that occur under it.`,
  },
  {
    title: '4. Spotify Integration',
    content: `Vibe accesses your Spotify data through the official Spotify Web API. Your use of Spotify through Vibe is also subject to Spotify's Terms of Service and Privacy Policy.

Vibe will:

• Only access data you've authorized through Spotify's OAuth flow
• Never modify or delete your existing Spotify content without permission
• Store your access tokens securely on our servers
• Allow you to disconnect your account at any time

Spotify Premium is NOT required to use Vibe, but some features may be limited for free accounts.`,
  },
  {
    title: '5. AI Features',
    content: `Our AI playlist generation uses Google's Gemini API to analyze your preferences and create personalized playlists.

When you use AI features:

• You grant us permission to analyze your listening history
• Generated playlists are saved to your Spotify account (with your approval)
• AI suggestions are based on algorithmic analysis, not human curation
• We store minimal analytics about AI usage for service improvement`,
  },
  {
    title: '6. User Conduct',
    content: `You agree NOT to:

• Use Vibe for any illegal or unauthorized purpose
• Attempt to gain unauthorized access to our systems
• Use automated tools to scrape or extract data from Vibe
• Interfere with or disrupt Vibe's servers or networks
• Impersonate any person or entity
• Share your account access with others

We reserve the right to suspend or terminate accounts that violate these terms.`,
  },
  {
    title: '7. Intellectual Property',
    content: `Vibe's branding, design, and original content are owned by us and protected by intellectual property laws.

Your Generated Content:

• AI-generated playlists created through Vibe become part of your Spotify library
• You retain rights to any playlists you manually create using our tools
• We may use anonymized usage data for service improvement`,
  },
  {
    title: '8. Limitation of Liability',
    content: `VIBE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND.

To the fullest extent permitted by law:

• We make no guarantees about uptime, accuracy of recommendations, or error-free operation
• We are not liable for any indirect, incidental, or consequential damages
• We are not liable for any loss of data, profits, or goodwill
• Our total liability shall not exceed $100 USD

This does not affect your statutory rights as a consumer.`,
  },
  {
    title: '9. Changes to Terms',
    content: `We may update these terms at any time. Changes will be effective immediately upon posting on this page.

For significant changes, we will:

• Provide notice via email or in-app notification
• Request renewed consent if required
• Update the "Last updated" date at the top

Your continued use of Vibe after changes constitutes acceptance of the new terms.`,
  },
  {
    title: '10. Contact Information',
    content: `For questions about these terms:

Email: legal@vibemusic.app
Address: Vibe Music, Privacy & Legal Team

We aim to respond to all inquiries within 48 hours.

Last updated: March 2026`,
  },
];

export default function TermsPage() {
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
                  <path fillRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H8l4-6v4h1l-4 6h1z" clipRule="evenodd"/>
                </svg>
              </div>
              <h1 className="text-4xl font-black text-white mb-4">Terms of Service</h1>
              <p style={{ color: 'var(--fg-secondary)' }}>
                Please read these terms carefully before using Vibe Music. By using our service, you agree to be bound by these terms.
              </p>
            </div>

            <div className="space-y-8">
              {sections.map((section, index) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08, duration: 0.4 }}
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
              <h3 className="text-sm font-semibold text-white mb-2">Need to discuss these terms?</h3>
              <p className="text-sm mb-4" style={{ color: 'var(--fg-secondary)' }}>
                If you have questions or concerns about our Terms of Service, we're here to help.
              </p>
              <a 
                href="mailto:legal@vibemusic.app"
                className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
                style={{ color: accentHex }}
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z"/>
                  <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z"/>
                </svg>
                legal@vibemusic.app
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </AppShell>
  );
}
