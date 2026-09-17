import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import App from './App';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource-variable/outfit';
import './index.css';
import { I18nProvider } from './i18n';
import { isDemoMode } from './demo/config';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});

const Router = isDemoMode ? HashRouter : BrowserRouter;

// The demo build ships without a service worker: the in-memory store changes
// nothing on the network, and a stale SW would only risk caching old markup.
if ('serviceWorker' in navigator && import.meta.env.PROD && !isDemoMode) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {});
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <Router>
          <App />
        </Router>
      </I18nProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
