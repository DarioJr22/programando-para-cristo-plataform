import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase, fetchAPI } from './supabase';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  avatar: string | null;
  level?: string;
  points?: number;
  rank?: string;
  username?: string;
  bio?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string, role?: string, secretCode?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchingUser = useRef(false);

  useEffect(() => {
    // Check for existing session
    checkUser();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function checkUser() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await fetchUser(session.access_token);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchUser(accessToken?: string) {
    if (fetchingUser.current) return;
    
    try {
      fetchingUser.current = true;
      const token = accessToken || (await supabase.auth.getSession()).data.session?.access_token;
      
      if (!token) return;

      // Import projectId from info
      const { projectId } = await import('../utils/supabase/info');
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-fe860986/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      fetchingUser.current = false;
    }
  }

  async function login(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: 'Email ou senha incorretos' };
      }

      if (data.session) {
        await fetchUser(data.session.access_token);
        return { success: true };
      }

      return { success: false, error: 'Erro ao fazer login' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Erro ao fazer login' };
    }
  }

  async function signup(name: string, email: string, password: string, role: string = 'student', secretCode?: string) {
    try {
      const response = await fetchAPI('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role, secretCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error };
      }

      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'Erro ao criar conta' };
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
  }

  async function refreshUser() {
    await fetchUser();
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
