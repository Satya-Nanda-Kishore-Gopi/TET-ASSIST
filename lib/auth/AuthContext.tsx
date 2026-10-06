'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { formatMobileNumber } from './authUtils';

export interface AuthUser {
  id: string;
  mobile: string;
  formattedMobile: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (mobile: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (mobile: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => ({ success: false, error: 'Not initialized' }),
  register: async () => ({ success: false, error: 'Not initialized' }),
  logout: async () => {},
  refreshSession: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/session', { cache: 'no-store' });
      const data = await res.json();
      if (data.authenticated && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();

    // Listen to Supabase client auth events
    const supabase = createClient();
    if (supabase) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const rawPhone =
            session.user.user_metadata?.phone_number ||
            session.user.email?.replace(/^candidate_/, '').replace(/@.*$/, '') ||
            '';
          setUser({
            id: session.user.id,
            mobile: rawPhone,
            formattedMobile: formatMobileNumber(rawPhone),
          });
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [refreshSession]);

  const login = async (mobile: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, password }),
      });
      const data = await res.json();

      if (res.ok && data.success && data.user) {
        setUser(data.user);
        return { success: true };
      }

      return {
        success: false,
        error: data.error || 'Mobile number or password is incorrect.',
      };
    } catch {
      return {
        success: false,
        error: 'Something went wrong. Please try again.',
      };
    }
  };

  const register = async (mobile: string, password: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, password }),
      });
      const data = await res.json();

      if (res.ok && data.success && data.user) {
        setUser(data.user);
        return { success: true };
      }

      return {
        success: false,
        error: data.error || 'Unable to create your account. Please try again.',
      };
    } catch {
      return {
        success: false,
        error: 'Something went wrong. Please try again.',
      };
    }
  };

  const logout = async () => {
    try {
      // 1. Client Supabase sign out
      const supabase = createClient();
      if (supabase) {
        await supabase.auth.signOut();
      }

      // 2. Clear server session cookie
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      setUser(null);
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
