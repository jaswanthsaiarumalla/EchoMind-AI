/* ─────────────────────────────────────────────
 *  ChatMessage — Individual chat bubble
 * ───────────────────────────────────────────── */

import { Text } from '@fluentui/react-components';
import {
  PersonChat20Regular,
  Bot20Regular,
} from '@fluentui/react-icons';
import type { ChatMessage as ChatMessageType } from '../types';

interface ChatMessageProps {
  message: ChatMessageType;
}

/** Simple markdown-to-HTML — handles bold, italic, headers, bullets, code. */
function renderMarkdown(text: string): string {
  return text
    // Code blocks
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // H3
    .replace(/^### (.+)$/gm, '<h4>$1</h4>')
    // H2
    .replace(/^## (.+)$/gm, '<h3>$1</h3>')
    // H1
    .replace(/^# (.+)$/gm, '<h2>$1</h2>')
    // Bullet lists
    .replace(/^[-*] (.+)$/gm, '<li>$1</li>')
    // Newlines
    .replace(/\n/g, '<br/>');
}

export function ChatMessageBubble({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`chat-message ${isUser ? 'chat-user' : 'chat-assistant'}`}>
      <div className="chat-avatar">
        {isUser ? <PersonChat20Regular /> : <Bot20Regular />}
      </div>
      <div className="chat-bubble">
        <div className="chat-bubble-header">
          <Text size={100} weight="semibold">
            {isUser ? 'You' : 'TwinMind'}
          </Text>
          <Text size={100} className="text-muted">
            {message.timestamp.toLocaleTimeString()}
          </Text>
        </div>
        <div
          className="chat-content"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
        />
        {message.isStreaming && <span className="streaming-cursor">▊</span>}
      </div>
    </div>
  );
}
