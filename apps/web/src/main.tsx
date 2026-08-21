// WHAT: StrictMode exposes unsafe render-side behavior during development.
import { StrictMode } from 'react';
// BOUNDARY: One router owns browser history for the entire application.
import { BrowserRouter } from 'react-router-dom';
import * as ReactDOM from 'react-dom/client';
import App from './app/app';
import './styles.css';

// CHECK: Fail visibly during development if the HTML shell loses its root node.
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);