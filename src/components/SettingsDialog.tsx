
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  Button,
  Input,
  Textarea,
  Label,
  SpinButton,
  Divider,
  Text,
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionPanel,
} from '@fluentui/react-components';
import { Dismiss24Regular } from '@fluentui/react-icons';
import { useSession } from '../context/SessionContext';
import { DEFAULT_SETTINGS } from '../services/prompts';
import type { Settings } from '../types';

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsDialog({ open, onClose }: SettingsDialogProps) {
  const { state, updateSettings } = useSession();
  const [local, setLocal] = useState<Settings>({ ...state.settings });

  useEffect(() => {
    if (open) setLocal({ ...state.settings });
  }, [open, state.settings]);

  const handleSave = () => {
    updateSettings(local);
    onClose();
  };

  const handleResetPrompts = () => {
    setLocal((prev) => ({
      ...prev,
      suggestionsPrompt: DEFAULT_SETTINGS.suggestionsPrompt,
      detailPrompt: DEFAULT_SETTINGS.detailPrompt,
      chatPrompt: DEFAULT_SETTINGS.chatPrompt,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={(_, d) => { if (!d.open) onClose(); }}>
      <DialogSurface className="settings-dialog">
        <DialogTitle
          action={
            <Button appearance="subtle" icon={<Dismiss24Regular />} onClick={onClose} />
          }
        >
          Settings
        </DialogTitle>

        <DialogBody>
          <DialogContent className="settings-content">
            {/* ── API Key ─────────────────────── */}
            <div className="settings-field">
              <Label htmlFor="api-key-input" weight="semibold">
                Groq API Key
              </Label>
              <Input
                id="api-key-input"
                type="password"
                placeholder="gsk_..."
                value={local.apiKey}
                onChange={(_, d) => setLocal((p) => ({ ...p, apiKey: d.value }))}
                className="settings-input"
              />
              <Text size={200} className="text-muted">
                Get your free key at{' '}
                <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer">
                  console.groq.com
                </a>
              </Text>
            </div>

            <Divider />

            {/* ── Parameters ──────────────────── */}
            <div className="settings-row">
              <div className="settings-field">
                <Label htmlFor="suggestion-ctx" weight="semibold">
                  Suggestion Context Window
                </Label>
                <SpinButton
                  id="suggestion-ctx"
                  value={local.suggestionsContextWindow}
                  min={1000}
                  max={20000}
                  step={500}
                  onChange={(_, d) =>
                    setLocal((p) => ({
                      ...p,
                      suggestionsContextWindow: d.value ?? p.suggestionsContextWindow,
                    }))
                  }
                />
                <Text size={100} className="text-muted">characters</Text>
              </div>
              <div className="settings-field">
                <Label htmlFor="chat-ctx" weight="semibold">
                  Chat Context Window
                </Label>
                <SpinButton
                  id="chat-ctx"
                  value={local.chatContextWindow}
                  min={2000}
                  max={30000}
                  step={1000}
                  onChange={(_, d) =>
                    setLocal((p) => ({
                      ...p,
                      chatContextWindow: d.value ?? p.chatContextWindow,
                    }))
                  }
                />
                <Text size={100} className="text-muted">characters</Text>
              </div>
              <div className="settings-field">
                <Label htmlFor="refresh-interval" weight="semibold">
                  Refresh Interval
                </Label>
                <SpinButton
                  id="refresh-interval"
                  value={local.refreshInterval}
                  min={10}
                  max={120}
                  step={5}
                  onChange={(_, d) =>
                    setLocal((p) => ({
                      ...p,
                      refreshInterval: d.value ?? p.refreshInterval,
                    }))
                  }
                />
                <Text size={100} className="text-muted">seconds</Text>
              </div>
            </div>

            <Divider />

            {/* ── Prompts ─────────────────────── */}
            <Accordion collapsible>
              <AccordionItem value="suggestions-prompt">
                <AccordionHeader>Live Suggestions Prompt</AccordionHeader>
                <AccordionPanel>
                  <Textarea
                    value={local.suggestionsPrompt}
                    onChange={(_, d) => setLocal((p) => ({ ...p, suggestionsPrompt: d.value }))}
                    resize="vertical"
                    rows={12}
                    className="settings-textarea"
                  />
                </AccordionPanel>
              </AccordionItem>

              <AccordionItem value="detail-prompt">
                <AccordionHeader>Detail Answer Prompt (on click)</AccordionHeader>
                <AccordionPanel>
                  <Textarea
                    value={local.detailPrompt}
                    onChange={(_, d) => setLocal((p) => ({ ...p, detailPrompt: d.value }))}
                    resize="vertical"
                    rows={10}
                    className="settings-textarea"
                  />
                </AccordionPanel>
              </AccordionItem>

              <AccordionItem value="chat-prompt">
                <AccordionHeader>Chat Prompt</AccordionHeader>
                <AccordionPanel>
                  <Textarea
                    value={local.chatPrompt}
                    onChange={(_, d) => setLocal((p) => ({ ...p, chatPrompt: d.value }))}
                    resize="vertical"
                    rows={8}
                    className="settings-textarea"
                  />
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </DialogContent>
        </DialogBody>

        <DialogActions>
          <Button appearance="subtle" onClick={handleResetPrompts}>
            Reset Prompts
          </Button>
          <Button appearance="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button appearance="primary" onClick={handleSave} id="settings-save-button">
            Save
          </Button>
        </DialogActions>
      </DialogSurface>
    </Dialog>
  );
}
