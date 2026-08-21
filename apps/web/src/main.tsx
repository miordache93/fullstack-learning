// WHAT: StrictMode exposes unsafe render-side behavior during development.
import { StrictMode } from 'react';
// BOUNDARY: One router owns browser history for the entire application.
import { BrowserRouter } from 'react-router-dom';
import * as ReactDOM from 'react-dom/client';
import App from './app/app';
import './styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // WHY: Reuse recent task data briefly instead of refetching on every mount.
      staleTime: 15_000,
      // WHY: Retry one transient read failure without hiding a persistent outage.
      retry: 1,
    },
  },
});

// CHECK: Fail visibly during development if the HTML shell loses its root node.
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <StrictMode>
    {/* BOUNDARY: Every query hook below this point shares one cache. */}
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);