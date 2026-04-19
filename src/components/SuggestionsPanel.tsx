
import {
  Button,
  Text,
  Spinner,
  Divider,
} from '@fluentui/react-components';
import {
  ArrowSync24Regular,
} from '@fluentui/react-icons';
import { useSession } from '../context/SessionContext';
import { SuggestionCard } from './SuggestionCard';
import type { Suggestion } from '../types';

interface SuggestionsPanelProps {
  onRefresh: () => void;
  onSuggestionClick: (suggestion: Suggestion) => void;
  secondsLeft: number;
  isTimerActive: boolean;
}

export function SuggestionsPanel({
  onRefresh,
  onSuggestionClick,
  secondsLeft,
  isTimerActive,
}: SuggestionsPanelProps) {
  const { state } = useSession();
  const { isGeneratingSuggestions, suggestionBatches, transcript } = state;
  const hasTranscript = transcript.length > 0;

  return (
    <section className="panel suggestions-panel">
      <div className="panel-header">
        <Text size={400} weight="semibold">
          Live Suggestions
        </Text>
        <div className="suggestions-controls">
          {isTimerActive && (
            <Text size={200} className="countdown-text">
              {secondsLeft}s
            </Text>
          )}
          <Button
            appearance="subtle"
            icon={isGeneratingSuggestions ? <Spinner size="tiny" /> : <ArrowSync24Regular />}
            onClick={onRefresh}
            disabled={isGeneratingSuggestions || !hasTranscript}
            size="small"
            className="refresh-button"
            id="refresh-suggestions-button"
          >
            Refresh
          </Button>
        </div>
      </div>

      <div className="suggestions-scroll">
        {suggestionBatches.length === 0 ? (
          <div className="suggestions-empty">
            <Text size={300} className="text-muted">
              {hasTranscript
                ? 'Generating suggestions…'
                : 'Start recording to see live suggestions.'}
            </Text>
          </div>
        ) : (
          suggestionBatches.map((batch, batchIndex) => (
            <div
              key={batch.id}
              className={`suggestion-batch ${batchIndex === 0 ? 'batch-latest' : ''}`}
            >
              <div className="batch-time">
                <Text size={100} className="text-muted">
                  {batch.timestamp.toLocaleTimeString()}
                </Text>
              </div>
              <div className="batch-cards">
                {batch.suggestions.map((suggestion) => (
                  <SuggestionCard
                    key={suggestion.id}
                    suggestion={suggestion}
                    onClick={onSuggestionClick}
                  />
                ))}
              </div>
              {batchIndex < suggestionBatches.length - 1 && (
                <Divider className="batch-divider" />
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
