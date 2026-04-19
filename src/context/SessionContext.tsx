/* ─────────────────────────────────────────────
 *  TwinMind Copilot — Session Context
 *
 *  Single React Context + useReducer for all
 *  session-scoped state. No persistence needed.
 * ───────────────────────────────────────────── */

import React, { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react';
import type { SessionState, SessionAction, Settings, TranscriptEntry, SuggestionBatch, ChatMessage } from '../types';
import { DEFAULT_SETTINGS } from '../services/prompts';

/* ── Initial State ─────────────────────────── */

const initialState: SessionState = {
  settings: { ...DEFAULT_SETTINGS },
  transcript: [],
  suggestionBatches: [],
  chatMessages: [],
  isRecording: false,
  isTranscribing: false,
  isGeneratingSuggestions: false,
};

/* ── Reducer ───────────────────────────────── */

function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'SET_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };

    case 'ADD_TRANSCRIPT':
      return { ...state, transcript: [...state.transcript, action.payload] };

    case 'ADD_SUGGESTION_BATCH':
      return {
        ...state,
        suggestionBatches: [action.payload, ...state.suggestionBatches],
      };

    case 'ADD_CHAT_MESSAGE':
      return { ...state, chatMessages: [...state.chatMessages, action.payload] };

    case 'UPDATE_CHAT_MESSAGE':
      return {
        ...state,
        chatMessages: state.chatMessages.map((msg) =>
          msg.id === action.payload.id
            ? { ...msg, content: action.payload.content, isStreaming: action.payload.isStreaming }
            : msg,
        ),
      };

    case 'SET_RECORDING':
      return { ...state, isRecording: action.payload };

    case 'SET_TRANSCRIBING':
      return { ...state, isTranscribing: action.payload };

    case 'SET_GENERATING_SUGGESTIONS':
      return { ...state, isGeneratingSuggestions: action.payload };

    case 'CLEAR_SESSION':
      return { ...initialState, settings: state.settings };

    default:
      return state;
  }
}

/* ── Context ───────────────────────────────── */

interface SessionContextValue {
  state: SessionState;
  dispatch: React.Dispatch<SessionAction>;
  updateSettings: (s: Partial<Settings>) => void;
  addTranscript: (entry: TranscriptEntry) => void;
  addSuggestionBatch: (batch: SuggestionBatch) => void;
  addChatMessage: (msg: ChatMessage) => void;
  updateChatMessage: (id: string, content: string, isStreaming?: boolean) => void;
  getTranscriptText: (maxChars?: number) => string;
}

const SessionContext = createContext<SessionContextValue | null>(null);

/* ── Provider ──────────────────────────────── */

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(sessionReducer, initialState);

  const updateSettings = useCallback(
    (s: Partial<Settings>) => dispatch({ type: 'SET_SETTINGS', payload: s }),
    [],
  );

  const addTranscript = useCallback(
    (entry: TranscriptEntry) => dispatch({ type: 'ADD_TRANSCRIPT', payload: entry }),
    [],
  );

  const addSuggestionBatch = useCallback(
    (batch: SuggestionBatch) => dispatch({ type: 'ADD_SUGGESTION_BATCH', payload: batch }),
    [],
  );

  const addChatMessage = useCallback(
    (msg: ChatMessage) => dispatch({ type: 'ADD_CHAT_MESSAGE', payload: msg }),
    [],
  );

  const updateChatMessage = useCallback(
    (id: string, content: string, isStreaming?: boolean) =>
      dispatch({ type: 'UPDATE_CHAT_MESSAGE', payload: { id, content, isStreaming } }),
    [],
  );

  /** Build a single string from the transcript, optionally trimmed to the last N chars. */
  const getTranscriptText = useCallback(
    (maxChars?: number) => {
      const full = state.transcript.map((e) => e.text).join('\n');
      if (!maxChars || full.length <= maxChars) return full;
      return full.slice(-maxChars);
    },
    [state.transcript],
  );

  return (
    <SessionContext.Provider
      value={{
        state,
        dispatch,
        updateSettings,
        addTranscript,
        addSuggestionBatch,
        addChatMessage,
        updateChatMessage,
        getTranscriptText,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

/* ── Hook ──────────────────────────────────── */

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within a SessionProvider');
  return ctx;
}
