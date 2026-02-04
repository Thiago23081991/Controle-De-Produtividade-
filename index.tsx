
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from './contexts/ThemeContext';
import './index.css';

// Global Error Handler to show errors on screen
window.addEventListener('error', (e) => {
  const errDiv = document.createElement('div');
  errDiv.style.position = 'fixed';
  errDiv.style.top = '0';
  errDiv.style.left = '0';
  errDiv.style.width = '100%';
  errDiv.style.padding = '20px';
  errDiv.style.backgroundColor = 'red';
  errDiv.style.color = 'white';
  errDiv.style.zIndex = '9999';
  errDiv.innerHTML = `<h1>Runtime Error</h1><pre>${e.message}</pre>`;
  document.body.appendChild(errDiv);
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </React.StrictMode>
  );
} catch (err: any) {
  document.body.innerHTML = `<div style="color:red; font-size: 20px; padding: 20px;">Render Error: ${err.message}</div>`;
}
