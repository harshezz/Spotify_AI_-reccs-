// ============================================================
// src/services/aiService.ts — AI Playlist Generation Service
// ============================================================
// Communicates with the Express backend's AI routes.
// Stub for Phase 2 — structure is in place.
// ============================================================

import api from './api';
import { AiGenerateRequest, AiGenerateResponse } from '@/types/ai';

export const aiService = {
  // ── Generate an AI-curated playlist ─────────────────────────
  async generatePlaylist(request: AiGenerateRequest): Promise<AiGenerateResponse> {
    const { data } = await api.post('/api/ai/generate', request);
    return data;
  },
};
