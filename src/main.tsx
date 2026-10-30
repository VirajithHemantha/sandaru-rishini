import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import Memory from './Memory.tsx';
import './index.css';

const isMemoryPage = window.location.pathname.replace(/\/+$/, '') === '/memory';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isMemoryPage ? <Memory /> : <App />}
  </StrictMode>,
);
