/* ─────────────────────────────────────────────
 *  ChatPanel — Right column
 *
 *  Shows chat messages and a text input.
 * ───────────────────────────────────────────── */

import { useState, useRef, useEffect } from 'react';
import {
  Input,
  Button,
  Text,
} from '@fluentui/react-components';
import { Send24Regular } from '@fluentui/react-icons';
import { useSession } from '../context/SessionContext';
import { ChatMessageBubble } from './ChatMessage';

interface ChatPanelProps {
  onSend: (text: string) => void;
}

export function ChatPanel({ onSend }: ChatPanelProps) {
  const { state } = useSession();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const isAnyStreaming = state.chatMessages.some((m) => m.isStreaming);

  // Auto-scroll to latest message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [state.chatMessages, state.chatMessages[state.chatMessages.length - 1]?.content]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isAnyStreaming) return;
    setInput('');
    onSend(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <section className="panel chat-panel">
      <div className="panel-header">
        <Text size={400} weight="semibold">
          Chat
        </Text>
        <Text size={200} className="text-muted">
          {state.chatMessages.length} messages
        </Text>
      </div>

      <div className="chat-scroll" ref={scrollRef}>
        {state.chatMessages.length === 0 ? (
          <div className="chat-empty">
            <Text size={300} className="text-muted">
              Click a suggestion or type a question to start chatting.
            </Text>
          </div>
        ) : (
          state.chatMessages.map((msg) => (
            <ChatMessageBubble key={msg.id} message={msg} />
          ))
        )}
      </div>

      <div className="chat-input-container">
        <Input
          placeholder="Ask about the meeting…"
          value={input}
          onChange={(_, d) => setInput(d.value)}
          onKeyDown={handleKeyDown}
          disabled={!state.settings.apiKey}
          className="chat-input"
          id="chat-input-field"
        />
        <Button
          appearance="primary"
          icon={<Send24Regular />}
          onClick={handleSend}
          disabled={!input.trim() || isAnyStreaming || !state.settings.apiKey}
          className="chat-send-button"
          id="chat-send-button"
        />
      </div>
    </section>
  );
}
