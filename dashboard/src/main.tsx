import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import App from './App';
import { queryClient } from './lib/queryClient';
import { AuthContextProvider } from './context/AuthContext';

// Global styles
import './index.css';
// Leaflet map styles for Fleet page and other map views
import 'leaflet/dist/leaflet.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthContextProvider>
        <App />
        <Toaster
          theme='light'
          toastOptions={{
            style: {
              background: 'white',
            },
            classNames: {
              success: '[&_div]:text-green-600!',
              error: '[&_div]:text-red-600!',
              warning: '[&_div]:text-yellow-600!',
              info: '[&_div]:text-blue-600!',
            },
          }}
        />
      </AuthContextProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
