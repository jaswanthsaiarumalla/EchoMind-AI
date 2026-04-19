/* ─────────────────────────────────────────────
 *  Header — Top app bar with controls
 * ───────────────────────────────────────────── */

import {
  Toolbar,
  ToolbarButton,
  ToolbarDivider,
  Text,
  Badge,
  Tooltip,
} from '@fluentui/react-components';
import {
  Settings24Regular,
  ArrowDownload24Regular,
  BrainCircuit24Regular,
  Delete24Regular,
} from '@fluentui/react-icons';
import { useSession } from '../context/SessionContext';
import { buildSessionExport, downloadJson } from '../utils/export';

interface HeaderProps {
  onOpenSettings: () => void;
}

export function Header({ onOpenSettings }: HeaderProps) {
  const { state, dispatch } = useSession();
  const hasApiKey = !!state.settings.apiKey;
  const entryCount = state.transcript.length;

  const handleExport = () => {
    const data = buildSessionExport(state);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    downloadJson(data, `twinmind-session-${timestamp}.json`);
  };

  const handleClear = () => {
    dispatch({ type: 'CLEAR_SESSION' });
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <BrainCircuit24Regular className="header-logo" />
        <Text as="h1" size={500} weight="bold" className="header-title">
          TwinMind Copilot
        </Text>
        {!hasApiKey && (
          <Badge appearance="filled" color="danger" className="header-badge">
            API Key Required
          </Badge>
        )}
      </div>

      <Toolbar size="small" className="header-toolbar">
        {entryCount > 0 && (
          <Text size={200} className="header-stat">
            {entryCount} transcript{entryCount !== 1 ? 's' : ''}
          </Text>
        )}
        <ToolbarDivider />
        <Tooltip content="Export session" relationship="label">
          <ToolbarButton
            icon={<ArrowDownload24Regular />}
            onClick={handleExport}
            disabled={entryCount === 0}
          />
        </Tooltip>
        <Tooltip content="Clear session" relationship="label">
          <ToolbarButton
            icon={<Delete24Regular />}
            onClick={handleClear}
            disabled={entryCount === 0}
          />
        </Tooltip>
        <Tooltip content="Settings" relationship="label">
          <ToolbarButton
            icon={<Settings24Regular />}
            onClick={onOpenSettings}
          />
        </Tooltip>
      </Toolbar>
    </header>
  );
}
