/* ─────────────────────────────────────────────
 *  useAudioRecorder
 *
 *  Manages the MediaRecorder lifecycle and emits
 *  30-second audio blobs for transcription.
 * ───────────────────────────────────────────── */

import { useRef, useCallback, useState } from 'react';
import { getSupportedMimeType } from '../utils/audioUtils';

interface UseAudioRecorderReturn {
  isRecording: boolean;
  startRecording: (onChunk: (blob: Blob) => void) => Promise<void>;
  stopRecording: () => void;
  error: string | null;
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const onChunkRef = useRef<((blob: Blob) => void) | null>(null);

  const startRecording = useCallback(async (onChunk: (blob: Blob) => void) => {
    try {
      setError(null);
      onChunkRef.current = onChunk;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = getSupportedMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
          // Build blob from accumulated chunks and send for transcription
          const blob = new Blob(chunksRef.current, { type: e.data.type || 'audio/webm' });
          onChunkRef.current?.(blob);
          // Reset chunks for next interval
          chunksRef.current = [];
        }
      };

      recorder.onerror = () => {
        setError('Recording error occurred');
        setIsRecording(false);
      };

      recorder.onstop = () => {
        setIsRecording(false);
      };

      // Emit a chunk every 30 seconds
      recorder.start(30000);
      setIsRecording(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Microphone access denied';
      setError(msg);
      setIsRecording(false);
    }
  }, []);

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    mediaRecorderRef.current = null;
    chunksRef.current = [];
    setIsRecording(false);
  }, []);

  return { isRecording, startRecording, stopRecording, error };
}
