// ============================================================
// src/types/ai.ts — AI Feature Type Definitions
// ============================================================

export interface TrackSeed {
  name:   string;
  artist: string;
}

export interface AiSuggestion {
  title:  string;
  artist: string;
}

export interface AiGenerateRequest {
  tracks: TrackSeed[];
  mood?:  string;
  count?: number;
}

export interface AiGenerateResponse {
  playlistId:   string;
  playlistUrl:  string;
  trackCount:   number;
  suggestions:  AiSuggestion[];
}
