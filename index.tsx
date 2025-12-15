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

// Inject the API Key provided in the configuration
// Note: In a real production build, this should be handled by the bundler (Vite/Webpack)
if (!win.process.env.API_KEY) {
  win.process.env.API_KEY = 'sk-0f2650b9f3384bd288f46137cfe37ae7';
}

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