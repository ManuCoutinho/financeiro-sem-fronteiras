import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { env } from './config/env';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element #root not found');

document.documentElement.style.setProperty('--app-theme-color', env.themeColor);

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
