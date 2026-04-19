/* ─────────────────────────────────────────────
 *  useTranscription
 *
 *  Takes audio blobs, sends them to Groq Whisper,
 *  and appends the result to the session transcript.
 * ───────────────────────────────────────────── */

import { useCallback, useRef } from 'react';
import { useSession } from '../context/SessionContext';
import { transcribeAudio } from '../services/groqApi';
import { uid } from '../utils/audioUtils';

interface UseTranscriptionReturn {
  transcribe: (blob: Blob) => Promise<string>;
}

export function useTranscription(): UseTranscriptionReturn {
  const { state, addTranscript, dispatch } = useSession();
  const busyRef = useRef(false);

  const transcribe = useCallback(
    async (blob: Blob): Promise<string> => {
      const apiKey = state.settings.apiKey;
      if (!apiKey) throw new Error('No API key configured');
      if (busyRef.current) return '';

      busyRef.current = true;
      dispatch({ type: 'SET_TRANSCRIBING', payload: true });

      try {
        const text = await transcribeAudio(blob, apiKey);
        if (text && text.length > 0) {
          addTranscript({ id: uid(), timestamp: new Date(), text });
        }
        return text;
      } finally {
        busyRef.current = false;
        dispatch({ type: 'SET_TRANSCRIBING', payload: false });
      }
    },
    [state.settings.apiKey, addTranscript, dispatch],
  );

  return { transcribe };
}
