
import React from 'react';
import * as ReactDOMClient from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

const container = document.getElementById('root');

// Robustly resolve createRoot: check named export first, then default export
// This handles variations in how different CDNs package react-dom/client
const createRoot = ReactDOMClient.createRoot || (ReactDOMClient as any).default?.createRoot;

if (container && createRoot) {
  try {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <AuthProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </AuthProvider>
      </React.StrictMode>
    );
  } catch (err) {
    console.error("Error during React root render:", err);
    container.innerHTML = '<div style="color:red; padding: 20px;">Failed to initialize application. Check console for details.</div>';
  }
} else {
  console.error("Failed to initialize application. Root element missing or createRoot could not be resolved.");
  if (container) {
    container.innerHTML = '<div style="color:red; padding: 20px;">Failed to initialize application. Root element missing or createRoot could not be resolved.</div>';
  }
}
