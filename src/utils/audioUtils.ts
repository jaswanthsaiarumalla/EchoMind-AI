/* ─────────────────────────────────────────────
 *  TwinMind Copilot — Audio Utilities
 * ───────────────────────────────────────────── */

/** Pick the best supported audio MIME type for MediaRecorder. */
export function getSupportedMimeType(): string {
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/mp4',
  ];
  for (const mime of candidates) {
    if (MediaRecorder.isTypeSupported(mime)) return mime;
  }
  return ''; // default — let browser decide
}

/** Generate a unique ID. */
export function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
