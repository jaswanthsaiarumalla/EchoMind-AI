/* ─────────────────────────────────────────────
 *  useSuggestions
 *
 *  Generates contextual suggestions from the
 *  transcript using Groq GPT-OSS 120B.
 * ───────────────────────────────────────────── */

import { useCallback } from 'react';
import { useSession } from '../context/SessionContext';
import { generateSuggestions } from '../services/groqApi';
import { uid } from '../utils/audioUtils';
import type { Suggestion, SuggestionType } from '../types';

const VALID_TYPES: SuggestionType[] = [
  'question', 'answer', 'fact-check', 'talking-point',
  'action-item', 'clarification', 'follow-up', 'counter-argument', 'resource',
];

function isValidType(t: string): t is SuggestionType {
  return VALID_TYPES.includes(t as SuggestionType);
}

export function useSuggestions() {
  const { state, addSuggestionBatch, dispatch, getTranscriptText } = useSession();

  const refreshSuggestions = useCallback(async () => {
    const { apiKey, suggestionsPrompt, suggestionsContextWindow } = state.settings;
    if (!apiKey) return;

    const transcript = getTranscriptText(suggestionsContextWindow);
    if (!transcript.trim()) return;

    dispatch({ type: 'SET_GENERATING_SUGGESTIONS', payload: true });

    try {
      const prompt = suggestionsPrompt.replace('{transcript}', transcript);
      const raw = await generateSuggestions(prompt, apiKey);

      // Parse the JSON response — handle markdown code fences
      let cleaned = raw.trim();
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      }

      const parsed: unknown[] = JSON.parse(cleaned);
      if (!Array.isArray(parsed)) throw new Error('Response is not an array');

      const suggestions: Suggestion[] = parsed.slice(0, 3).map((item: any) => ({
        id: uid(),
        type: isValidType(item.type) ? item.type : 'talking-point',
        title: String(item.title || 'Suggestion'),
        preview: String(item.preview || ''),
        detailQuery: String(item.detailQuery || item.title || ''),
      }));

      if (suggestions.length > 0) {
        addSuggestionBatch({
          id: uid(),
          timestamp: new Date(),
          suggestions,
        });
      }
    } catch (err) {
      console.error('Failed to generate suggestions:', err);
    } finally {
      dispatch({ type: 'SET_GENERATING_SUGGESTIONS', payload: false });
    }
  }, [state.settings, getTranscriptText, addSuggestionBatch, dispatch]);

  return {
    refreshSuggestions,
    isGenerating: state.isGeneratingSuggestions,
  };
}
