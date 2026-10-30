
import React from 'react';
import * as ReactDOMClient from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './contexts/AuthContext';

const container = document.getElementById('root');

// Add global mouse tracking for liquid effects
if (typeof window !== 'undefined') {
  // Update mouse position CSS variables on move
  window.addEventListener('mousemove', (e) => {
    const target = e.target as HTMLElement;
    const clickable = target.closest('button, a, .nav-tab, .back-btn');

    if (clickable) {
      const rect = (clickable as HTMLElement).getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      (clickable as HTMLElement).style.setProperty('--mouse-x', `${x}%`);
      (clickable as HTMLElement).style.setProperty('--mouse-y', `${y}%`);
    }
  });

  // Update click origin CSS variables on click
  window.addEventListener('mousedown', (e) => {
    const target = e.target as HTMLElement;
    const clickable = target.closest('button:not([disabled]), a:not(.no-hover), .nav-tab, .back-btn');

    if (clickable) {
      const rect = (clickable as HTMLElement).getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      (clickable as HTMLElement).style.setProperty('--ripple-x', `${x}px`);
      (clickable as HTMLElement).style.setProperty('--ripple-y', `${y}px`);

      // Reset animation
      if (clickable.classList.contains('active-ripple')) {
        clickable.classList.remove('active-ripple');
      }
      void (clickable as HTMLElement).offsetWidth; // Trigger reflow
      clickable.classList.add('active-ripple');
    }
  });

  // Remove animation class on transition end
  window.addEventListener('animationend', (e) => {
    if (e.animationName === 'click-ripple') {
      (e.target as HTMLElement).classList.remove('active-ripple');
    }
  });
}

// Robustly resolve createRoot: check named export first, then default export
// This handles variations in how different CDNs package react-dom/client
const createRoot = ReactDOMClient.createRoot || (ReactDOMClient as any).default?.createRoot;

if (container && createRoot) {
  try {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <HelmetProvider>
          <AuthProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </AuthProvider>
        </HelmetProvider>
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
