/* ─────────────────────────────────────────────
 *  SuggestionCard — Individual suggestion
 * ───────────────────────────────────────────── */

import {
  Card,
  Text,
} from '@fluentui/react-components';
import {
  QuestionCircle16Regular,
  Lightbulb16Regular,
  CheckmarkCircle16Regular,
  ShieldCheckmark16Regular,
  TaskListSquareLtr16Regular,
  Info16Regular,
  ArrowForward16Regular,
  ArrowReply16Regular,
  BookOpen16Regular,
} from '@fluentui/react-icons';
import type { Suggestion, SuggestionType } from '../types';

interface SuggestionCardProps {
  suggestion: Suggestion;
  onClick: (suggestion: Suggestion) => void;
}

const TYPE_CONFIG: Record<SuggestionType, { icon: React.ReactNode; label: string; color: string }> =
  {
    question:          { icon: <QuestionCircle16Regular />,    label: 'Question',         color: 'var(--suggestion-question)' },
    answer:            { icon: <CheckmarkCircle16Regular />,   label: 'Answer',           color: 'var(--suggestion-answer)' },
    'fact-check':      { icon: <ShieldCheckmark16Regular />,   label: 'Fact Check',       color: 'var(--suggestion-factcheck)' },
    'talking-point':   { icon: <Lightbulb16Regular />,         label: 'Talking Point',    color: 'var(--suggestion-talking)' },
    'action-item':     { icon: <TaskListSquareLtr16Regular />, label: 'Action Item',      color: 'var(--suggestion-action)' },
    clarification:     { icon: <Info16Regular />,              label: 'Clarification',    color: 'var(--suggestion-clarification)' },
    'follow-up':       { icon: <ArrowForward16Regular />,      label: 'Follow-Up',        color: 'var(--suggestion-followup)' },
    'counter-argument':{ icon: <ArrowReply16Regular />,        label: 'Counter-Argument', color: 'var(--suggestion-counter)' },
    resource:          { icon: <BookOpen16Regular />,          label: 'Resource',         color: 'var(--suggestion-resource)' },
  };

export function SuggestionCard({ suggestion, onClick }: SuggestionCardProps) {
  const config = TYPE_CONFIG[suggestion.type] ?? TYPE_CONFIG['talking-point'];

  return (
    <Card
      className="suggestion-card"
      onClick={() => onClick(suggestion)}
      style={{ '--card-accent': config.color } as React.CSSProperties}
      id={`suggestion-${suggestion.id}`}
    >
      <div className="suggestion-card-header">
        <span
          className="suggestion-type-badge"
          style={{ borderColor: config.color, color: config.color }}
        >
          {config.icon} {config.label}
        </span>
      </div>
      <Text size={300} weight="semibold" className="suggestion-title">
        {suggestion.title}
      </Text>
      <Text size={200} className="suggestion-preview">
        {suggestion.preview}
      </Text>
    </Card>
  );
}
