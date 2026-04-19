/* ─────────────────────────────────────────────
 *  useChat
 *
 *  Handles chat interactions — both suggestion
 *  clicks and free-form user messages — with
 *  streaming responses from Groq.
 * ───────────────────────────────────────────── */

import { useCallback } from 'react';
import { useSession } from '../context/SessionContext';
import { streamChatResponse } from '../services/groqApi';
import { uid } from '../utils/audioUtils';
import type { Suggestion } from '../types';

export function useChat() {
  const {
    state,
    addChatMessage,
    updateChatMessage,
    getTranscriptText,
  } = useSession();

  /** Stream a response from the assistant and update the chat message in real-time. */
  const streamResponse = useCallback(
    async (messages: { role: string; content: string }[]) => {
      const assistantId = uid();
      addChatMessage({
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isStreaming: true,
      });

      let accumulated = '';
      try {
        for await (const chunk of streamChatResponse(messages, state.settings.apiKey)) {
          accumulated += chunk;
          updateChatMessage(assistantId, accumulated, true);
        }
      } catch (err) {
        accumulated += `\n\n⚠️ Error: ${err instanceof Error ? err.message : 'Unknown error'}`;
      }

      updateChatMessage(assistantId, accumulated, false);
    },
    [state.settings.apiKey, addChatMessage, updateChatMessage],
  );

  /** Handle clicking a suggestion — adds it to chat and fetches a detailed answer. */
  const handleSuggestionClick = useCallback(
    async (suggestion: Suggestion) => {
      // Add user message (the suggestion)
      addChatMessage({
        id: uid(),
        role: 'user',
        content: `**${suggestion.title}**\n\n${suggestion.preview}`,
        timestamp: new Date(),
        suggestionSource: suggestion,
      });

      // Build the detail prompt
      const transcript = getTranscriptText(state.settings.chatContextWindow);
      const detailPrompt = state.settings.detailPrompt
        .replace('{transcript}', transcript)
        .replace('{suggestionType}', suggestion.type)
        .replace('{suggestionTitle}', suggestion.title)
        .replace('{detailQuery}', suggestion.detailQuery);

      const messages = [
        { role: 'system', content: detailPrompt },
        { role: 'user', content: suggestion.detailQuery },
      ];

      await streamResponse(messages);
    },
    [state.settings, getTranscriptText, addChatMessage, streamResponse],
  );

  /** Handle free-form user message in chat. */
  const sendMessage = useCallback(
    async (text: string) => {
      addChatMessage({
        id: uid(),
        role: 'user',
        content: text,
        timestamp: new Date(),
      });

      const transcript = getTranscriptText(state.settings.chatContextWindow);
      const systemPrompt = state.settings.chatPrompt.replace('{transcript}', transcript);

      // Build conversation history for context
      const recentMessages = state.chatMessages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const messages = [
        { role: 'system', content: systemPrompt },
        ...recentMessages,
        { role: 'user', content: text },
      ];

      await streamResponse(messages);
    },
    [state.settings, state.chatMessages, getTranscriptText, addChatMessage, streamResponse],
  );

  return { handleSuggestionClick, sendMessage };
}
