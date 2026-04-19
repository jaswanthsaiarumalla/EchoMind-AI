/* ─────────────────────────────────────────────
 *  TranscriptPanel — Left column
 *
 *  Mic button + live transcript view.
 * ───────────────────────────────────────────── */

import { useRef, useEffect } from 'react';
import {
  Button,
  Text,
  Spinner,
  Badge,
} from '@fluentui/react-components';
import {
  Mic24Filled,
  MicOff24Filled,
} from '@fluentui/react-icons';
import { useSession } from '../context/SessionContext';

interface TranscriptPanelProps {
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  recorderError: string | null;
}

export function TranscriptPanel({
  isRecording,
  onStartRecording,
  onStopRecording,
  recorderError,
}: TranscriptPanelProps) {
  const { state } = useSession();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest transcript
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [state.transcript]);

  const hasApiKey = !!state.settings.apiKey;

  return (
    <section className="panel transcript-panel">
      <div className="panel-header">
        <Text size={400} weight="semibold">
          Transcript
        </Text>
        {isRecording && (
          <Badge appearance="filled" color="danger" className="recording-badge">
            <span className="recording-dot" /> REC
          </Badge>
        )}
        {state.isTranscribing && (
          <Spinner size="tiny" label="Transcribing…" labelPosition="after" />
        )}
      </div>

      <div className="transcript-scroll" ref={scrollRef}>
        {state.transcript.length === 0 ? (
          <div className="transcript-empty">
            <Text size={300} className="text-muted">
              {isRecording
                ? 'Listening… transcript will appear shortly.'
                : 'Click the mic button to start recording.'}
            </Text>
          </div>
        ) : (
          state.transcript.map((entry) => (
            <div key={entry.id} className="transcript-entry">
              <Text size={100} className="transcript-time">
                {entry.timestamp.toLocaleTimeString()}
              </Text>
              <Text size={300} className="transcript-text">
                {entry.text}
              </Text>
            </div>
          ))
        )}
      </div>

      {recorderError && (
        <Text size={200} className="text-error">
          {recorderError}
        </Text>
      )}

      <div className="mic-button-container">
        <Button
          appearance={isRecording ? 'subtle' : 'primary'}
          shape="circular"
          size="large"
          icon={isRecording ? <MicOff24Filled /> : <Mic24Filled />}
          onClick={isRecording ? onStopRecording : onStartRecording}
          disabled={!hasApiKey}
          className={`mic-button ${isRecording ? 'mic-recording' : ''}`}
          id="mic-toggle-button"
        >
          {isRecording ? 'Stop' : 'Start'}
        </Button>
        {!hasApiKey && (
          <Text size={200} className="text-muted" style={{ marginTop: 8 }}>
            Set your Groq API key in Settings first
          </Text>
        )}
      </div>
    </section>
  );
}
