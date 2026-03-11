import React from 'react';
import { RouterProvider } from 'react-router';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from './components/ui/sonner';
import { router } from './routes';

export default function App() {
  // Apply dark mode class to document
  React.useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <AuthProvider>
      <AppProvider>
        <RouterProvider router={router} />
        <Toaster position="top-right" />
      </AppProvider>
    </AuthProvider>
  );
}