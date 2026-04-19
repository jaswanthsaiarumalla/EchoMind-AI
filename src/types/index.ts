/* ─────────────────────────────────────────────
 *  TwinMind Copilot — Shared TypeScript types
 * ───────────────────────────────────────────── */

// ── Transcript ────────────────────────────────

export interface TranscriptEntry {
  id: string;
  timestamp: Date;
  text: string;
}

// ── Suggestions ───────────────────────────────

export type SuggestionType =
  | 'question'
  | 'answer'
  | 'fact-check'
  | 'talking-point'
  | 'action-item'
  | 'clarification'
  | 'follow-up'
  | 'counter-argument'
  | 'resource';

export interface Suggestion {
  id: string;
  type: SuggestionType;
  title: string;
  preview: string;
  detailQuery: string;
}

export interface SuggestionBatch {
  id: string;
  timestamp: Date;
  suggestions: Suggestion[];
}

// ── Chat ──────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  suggestionSource?: Suggestion; // which suggestion triggered it
}

// ── Settings ──────────────────────────────────

export interface Settings {
  apiKey: string;
  suggestionsPrompt: string;
  detailPrompt: string;
  chatPrompt: string;
  suggestionsContextWindow: number; // characters
  chatContextWindow: number;       // characters
  refreshInterval: number;         // seconds
}

// ── Session State ─────────────────────────────

export interface SessionState {
  settings: Settings;
  transcript: TranscriptEntry[];
  suggestionBatches: SuggestionBatch[];
  chatMessages: ChatMessage[];
  isRecording: boolean;
  isTranscribing: boolean;
  isGeneratingSuggestions: boolean;
}

// ── Session Actions ───────────────────────────

export type SessionAction =
  | { type: 'SET_SETTINGS'; payload: Partial<Settings> }
  | { type: 'ADD_TRANSCRIPT'; payload: TranscriptEntry }
  | { type: 'ADD_SUGGESTION_BATCH'; payload: SuggestionBatch }
  | { type: 'ADD_CHAT_MESSAGE'; payload: ChatMessage }
  | { type: 'UPDATE_CHAT_MESSAGE'; payload: { id: string; content: string; isStreaming?: boolean } }
  | { type: 'SET_RECORDING'; payload: boolean }
  | { type: 'SET_TRANSCRIBING'; payload: boolean }
  | { type: 'SET_GENERATING_SUGGESTIONS'; payload: boolean }
  | { type: 'CLEAR_SESSION' };

// ── Export ─────────────────────────────────────

export interface SessionExport {
  exportedAt: string;
  transcript: { timestamp: string; text: string }[];
  suggestionBatches: {
    timestamp: string;
    suggestions: {
      type: string;
      title: string;
      preview: string;
      detailQuery: string;
    }[];
  }[];
  chatHistory: {
    role: string;
    content: string;
    timestamp: string;
  }[];
}
