/* ─────────────────────────────────────────────
 *  TwinMind Copilot — Export Utilities
 * ───────────────────────────────────────────── */

import type { SessionState, SessionExport } from '../types';

export function buildSessionExport(state: SessionState): SessionExport {
  return {
    exportedAt: new Date().toISOString(),
    transcript: state.transcript.map((e) => ({
      timestamp: e.timestamp.toISOString(),
      text: e.text,
    })),
    suggestionBatches: state.suggestionBatches.map((b) => ({
      timestamp: b.timestamp.toISOString(),
      suggestions: b.suggestions.map((s) => ({
        type: s.type,
        title: s.title,
        preview: s.preview,
        detailQuery: s.detailQuery,
      })),
    })),
    chatHistory: state.chatMessages.map((m) => ({
      role: m.role,
      content: m.content,
      timestamp: m.timestamp.toISOString(),
    })),
  };
}

export function downloadJson(data: SessionExport, filename: string) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
