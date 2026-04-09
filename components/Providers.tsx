'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { queryClient } from '@/lib/query-client';
import { useAuthStore } from '@/lib/store';
import { authApi, setAccessToken } from '@/lib/api';
import { SettingsProvider } from '@/lib/settings-context';
import { I18nProvider } from '@/lib/i18n';

interface ProvidersProps {
  children: ReactNode;
}

function AuthProvider({ children }: { children: ReactNode }) {
  const { user, setUser, setLoading } = useAuthStore();
  const initRef = useRef(false);

  useEffect(() => {
    // Prevent double initialization in StrictMode
    if (initRef.current) return;
    initRef.current = true;

    const initAuth = async () => {
      // Check if user had a session before (survives page refresh)
      const hadSession = typeof window !== 'undefined' &&
        (localStorage.getItem('joyride-has-session') === '1' || user !== null);

      if (!hadSession) {
        // Never logged in, skip refresh attempt
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Try to refresh the token using the httpOnly cookie
        const { accessToken } = await authApi.refresh();
        setAccessToken(accessToken);
        const freshUser = await authApi.getMe();
        setUser(freshUser);
      } catch (error: any) {
        // Only clear user if it's a real auth failure (401), not a network/CORS error
        const status = error?.response?.status;
        if (status === 401 || status === 403) {
          // Token truly expired or revoked
          setUser(null);
        } else {
          // Network error, CORS, server down - keep the cached user from localStorage
          // so the UI doesn't flash to logged-out state
          setLoading(false);
        }
      }
    };

    initAuth();
  }, [setUser, setLoading, user]);

  return <>{children}</>;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
      <SettingsProvider>
        <AuthProvider>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              className: 'toast-custom',
              success: {
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </AuthProvider>
      </SettingsProvider>
      </I18nProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default Providers;
