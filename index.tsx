import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Polyfill process.env for the browser environment
// This ensures that services accessing process.env.API_KEY can find it
const win = window as any;
if (typeof win.process === 'undefined') {
  win.process = {};
}
if (typeof win.process.env === 'undefined') {
  win.process.env = {};
}

// Note: The API_KEY must be provided via the environment. 
// If you are running this locally, ensure your build tool injects it.
// Do not hardcode invalid keys here.

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);