/* ─────────────────────────────────────────────
 *  TwinMind Copilot — App Root
 *
 *  Orchestrates all three columns and wires
 *  audio → transcription → suggestions → chat.
 * ───────────────────────────────────────────── */

import { useState, useCallback, useRef } from 'react';
import { useSession } from './context/SessionContext';
import { useAudioRecorder } from './hooks/useAudioRecorder';
import { useTranscription } from './hooks/useTranscription';
import { useSuggestions } from './hooks/useSuggestions';
import { useChat } from './hooks/useChat';
import { useAutoRefresh } from './hooks/useAutoRefresh';
import { Header } from './components/Header';
import { TranscriptPanel } from './components/TranscriptPanel';
import { SuggestionsPanel } from './components/SuggestionsPanel';
import { ChatPanel } from './components/ChatPanel';
import { SettingsDialog } from './components/SettingsDialog';
import './App.css';

export default function App() {
  const { state, dispatch } = useSession();
  const [settingsOpen, setSettingsOpen] = useState(!state.settings.apiKey);

  // ── Hooks ──────────────────────────────────
  const { isRecording, startRecording, stopRecording, error: recorderError } = useAudioRecorder();
  const { transcribe } = useTranscription();
  const { refreshSuggestions } = useSuggestions();
  const { handleSuggestionClick, sendMessage } = useChat();
  const autoRefresh = useAutoRefresh(state.settings.refreshInterval);

  // Keep a ref to the latest audio blob for manual refresh
  const latestBlobRef = useRef<Blob | null>(null);

  // ── Audio chunk handler ────────────────────
  const handleAudioChunk = useCallback(
    async (blob: Blob) => {
      latestBlobRef.current = blob;
      try {
        const text = await transcribe(blob);
        if (text && text.trim()) {
          // After transcription, auto-generate suggestions
          await refreshSuggestions();
        }
      } catch (err) {
        console.error('Transcription/suggestion pipeline error:', err);
      }
    },
    [transcribe, refreshSuggestions],
  );

  // ── Recording controls ─────────────────────
  const handleStartRecording = useCallback(async () => {
    dispatch({ type: 'SET_RECORDING', payload: true });
    await startRecording(handleAudioChunk);
    autoRefresh.start(async () => {
      // Auto-refresh tick: if we have transcript, refresh suggestions
      if (state.transcript.length > 0) {
        await refreshSuggestions();
      }
    });
  }, [dispatch, startRecording, handleAudioChunk, autoRefresh, state.transcript.length, refreshSuggestions]);

  const handleStopRecording = useCallback(() => {
    stopRecording();
    dispatch({ type: 'SET_RECORDING', payload: false });
    autoRefresh.stop();
  }, [stopRecording, dispatch, autoRefresh]);

  // ── Manual refresh ─────────────────────────
  const handleManualRefresh = useCallback(async () => {
    autoRefresh.manualRefresh();
  }, [autoRefresh]);

  return (
    <div className="app-root">
      <Header onOpenSettings={() => setSettingsOpen(true)} />

      <main className="app-layout">
        <TranscriptPanel
          isRecording={isRecording}
          onStartRecording={handleStartRecording}
          onStopRecording={handleStopRecording}
          recorderError={recorderError}
        />
        <SuggestionsPanel
          onRefresh={handleManualRefresh}
          onSuggestionClick={handleSuggestionClick}
          secondsLeft={autoRefresh.secondsLeft}
          isTimerActive={autoRefresh.isActive}
        />
        <ChatPanel onSend={sendMessage} />
      </main>

      <SettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}
