import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, fetchAPI } from './supabase';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  avatar: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    checkUser();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        await fetchUser();
      } else if (event === 'SIGNED_OUT') {
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
        await fetchUser();
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchUser() {
    try {
      const response = await fetchAPI('/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  }

  async function login(email: string, password: string) {
    try {
      console.log('🟡 auth-context: Iniciando login...', { email });
      const response = await fetchAPI('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      console.log('🟡 auth-context: Resposta recebida', { status: response.status, ok: response.ok });
      const data = await response.json();
      console.log('🟡 auth-context: Dados da resposta:', data);

      if (!response.ok) {
        console.log('🟡 auth-context: Login falhou no servidor');
        return { success: false, error: data.error };
      }

      console.log('🟡 auth-context: Configurando sessão...');
      // Set session with Supabase
      await supabase.auth.setSession({
        access_token: data.accessToken,
        refresh_token: data.accessToken, // Using same token as refresh
      });

      console.log('🟡 auth-context: Salvando usuário...');
      setUser(data.user);
      console.log('🟡 auth-context: Login completo!');
      return { success: true };
    } catch (error) {
      console.error('🟡 auth-context: Erro capturado:', error);
      return { success: false, error: 'Erro ao fazer login' };
    }
  }

  async function signup(name: string, email: string, password: string) {
    try {
      const response = await fetchAPI('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error };
      }

      return { success: true };
    } catch (error) {
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
