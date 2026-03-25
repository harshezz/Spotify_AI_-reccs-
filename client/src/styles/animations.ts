// ============================================================
// src/styles/animations.ts — Framer Motion Animation Variants
// ============================================================
// Centralized animation variants inspired by Apple Music's
// smooth, fluid transitions. Import these in any component
// instead of defining inline motion props.
// ============================================================

import { Variants, Transition } from 'framer-motion';

// ---------------------------------------------------------------------------
// Shared Transitions
// ---------------------------------------------------------------------------
export const springTransition: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
};

export const smoothTransition: Transition = {
  type: 'tween',
  ease: [0.25, 0.1, 0.25, 1], // cubic-bezier (Apple-style ease)
  duration: 0.4,
};

export const gentleSpring: Transition = {
  type: 'spring',
  stiffness: 150,
  damping: 20,
  mass: 0.8,
};

// ---------------------------------------------------------------------------
// Fade In/Out
// ---------------------------------------------------------------------------
export const fadeIn: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } },
  exit:    { opacity: 0, transition: { duration: 0.3, ease: 'easeIn' } },
};

// ---------------------------------------------------------------------------
// Slide Up — used for modals, cards, bottom sheets
// ---------------------------------------------------------------------------
export const slideUp: Variants = {
  hidden:  { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { ...smoothTransition, duration: 0.5 },
  },
  exit: {
    opacity: 0,
    y: 20,
    transition: { duration: 0.3, ease: 'easeIn' },
  },
};

// ---------------------------------------------------------------------------
// Scale In — used for buttons, cards on hover
// ---------------------------------------------------------------------------
export const scaleIn: Variants = {
  hidden:  { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: gentleSpring,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
};

// ---------------------------------------------------------------------------
// Stagger Container — staggers children's entry animations
// ---------------------------------------------------------------------------
export const staggerContainer: Variants = {
  hidden:  { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

// ---------------------------------------------------------------------------
// Stagger Item — used as children inside stagger containers
// ---------------------------------------------------------------------------
export const staggerItem: Variants = {
  hidden:  { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: smoothTransition,
  },
};

// ---------------------------------------------------------------------------
// Now Playing Bar — slides up from bottom
// ---------------------------------------------------------------------------
export const nowPlayingBar: Variants = {
  hidden:  { opacity: 0, y: 100 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 25,
    },
  },
  exit: {
    opacity: 0,
    y: 100,
    transition: { duration: 0.3 },
  },
};

// ---------------------------------------------------------------------------
// Equalizer Bar — individual bar bounce animation
// ---------------------------------------------------------------------------
export const equalizerBar: Variants = {
  idle:    { scaleY: 0.15 },
  active:  {
    scaleY: [0.2, 1, 0.4, 0.8, 0.3],
    transition: {
      duration: 1.2,
      repeat: Infinity,
      repeatType: 'reverse',
      ease: 'easeInOut',
    },
  },
};

// ---------------------------------------------------------------------------
// Pulse Glow — used for the playing indicator
// ---------------------------------------------------------------------------
export const pulseGlow: Variants = {
  animate: {
    boxShadow: [
      '0 0 0 0 rgba(139, 92, 246, 0.4)',
      '0 0 0 12px rgba(139, 92, 246, 0)',
    ],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeOut',
    },
  },
};

// ---------------------------------------------------------------------------
// Hover Scale — simple hover interaction
// ---------------------------------------------------------------------------
export const hoverScale = {
  whileHover: { scale: 1.03 },
  whileTap:   { scale: 0.97 },
  transition: springTransition,
};

// ---------------------------------------------------------------------------
// Album Art Rotation — vinyl spin effect
// ---------------------------------------------------------------------------
export const vinylSpin: Variants = {
  playing: {
    rotate: 360,
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'linear',
    },
  },
  paused: {
    rotate: 0,
    transition: { duration: 0.5 },
  },
};
