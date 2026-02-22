import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { initWebMCP } from './webmcp/tools';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Inicializa WebMCP (tools para agentes de IA)
initWebMCP().catch(console.warn);
