import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { FluentProvider, webDarkTheme } from '@fluentui/react-components';
import { SessionProvider } from './context/SessionContext';
import App from './App';
import './App.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FluentProvider theme={webDarkTheme}>
      <SessionProvider>
        <App />
      </SessionProvider>
    </FluentProvider>
  </StrictMode>,
);
