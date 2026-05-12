'use client';

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser, SupabaseClient } from '@supabase/supabase-js';

export type UserRole = 'user' | 'admin' | 'guest';

export interface AppUser {
  id: string;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  role: UserRole;
  createdAt: Date;
  skillsProgress: Record<string, { roundsCompleted: number[] }>;
}

interface AuthContextType {
  user: AppUser | null;
  supabaseUser: SupabaseUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isGuest: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  enterGuestMode: () => void;
  exitGuestMode: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);

  // Initialize Supabase client on mount (client-side only)
  useEffect(() => {
    try {
      const client = createClient();
      setSupabase(client);
    } catch (error) {
      console.error('Failed to initialize Supabase client:', error);
      setIsLoading(false);
    }
  }, []);

  const fetchUserProfile = useCallback(async (supabaseUser: SupabaseUser, client: SupabaseClient): Promise<AppUser | null> => {
    try {
      const { data, error } = await client
        .from('users')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        // User might not exist in public.users yet (trigger might be pending)
        // Return a basic user object
        return {
          id: supabaseUser.id,
          email: supabaseUser.email ?? null,
          displayName: supabaseUser.user_metadata?.display_name ?? supabaseUser.email?.split('@')[0] ?? null,
          avatarUrl: supabaseUser.user_metadata?.avatar_url ?? null,
          role: 'user',
          createdAt: new Date(supabaseUser.created_at),
          skillsProgress: {},
        };
      }

      return {
        id: data.id,
        email: data.email,
        displayName: data.display_name,
        avatarUrl: data.avatar_url,
        role: data.role as UserRole,
        createdAt: new Date(data.created_at),
        skillsProgress: data.skills_progress ?? {},
      };
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  }, []);

  const refreshUser = useCallback(async () => {
    if (supabaseUser && supabase) {
      const appUser = await fetchUserProfile(supabaseUser, supabase);
      setUser(appUser);
    }
  }, [supabaseUser, supabase, fetchUserProfile]);

  useEffect(() => {
    if (!supabase) return;

    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setSupabaseUser(session.user);
          const appUser = await fetchUserProfile(session.user, supabase);
          setUser(appUser);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setSupabaseUser(session.user);
          const appUser = await fetchUserProfile(session.user, supabase);
          setUser(appUser);
          setIsGuest(false);
        } else {
          setSupabaseUser(null);
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, fetchUserProfile]);

  const signInWithGoogle = useCallback(async () => {
    if (!supabase) throw new Error('Supabase not initialized');
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
            `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error('Google sign in error:', error);
      setIsLoading(false);
      throw error;
    }
  }, [supabase]);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase not initialized');
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      
      if (data.user) {
        setSupabaseUser(data.user);
        const appUser = await fetchUserProfile(data.user, supabase);
        setUser(appUser);
        setIsGuest(false);
      }
    } catch (error) {
      console.error('Email sign in error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [supabase, fetchUserProfile]);

  const signUpWithEmail = useCallback(
    async (email: string, password: string, displayName: string) => {
      if (!supabase) throw new Error('Supabase not initialized');
      setIsLoading(true);
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
              `${window.location.origin}/auth/callback`,
            data: {
              display_name: displayName,
            },
          },
        });
        if (error) throw error;
        
        // User needs to confirm email before they can sign in
        // The trigger will create the user profile
        if (data.user) {
          setSupabaseUser(data.user);
          // For users who don't need email confirmation:
          if (data.session) {
            const appUser = await fetchUserProfile(data.user, supabase);
            setUser(appUser);
            setIsGuest(false);
          }
        }
      } catch (error) {
        console.error('Email sign up error:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [supabase, fetchUserProfile]
  );

  const signOut = useCallback(async () => {
    if (!supabase) throw new Error('Supabase not initialized');
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setSupabaseUser(null);
      setIsGuest(false);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  const enterGuestMode = useCallback(() => {
    setUser({
      id: 'guest',
      email: null,
      displayName: 'Guest User',
      avatarUrl: null,
      role: 'guest' as UserRole,
      createdAt: new Date(),
      skillsProgress: {},
    });
    setIsGuest(true);
  }, []);

  const exitGuestMode = useCallback(() => {
    setUser(null);
    setIsGuest(false);
  }, []);

  const value: AuthContextType = useMemo(() => ({
    user,
    supabaseUser,
    isLoading,
    isAuthenticated: !!user && !isGuest,
    isAdmin: user?.role === 'admin',
    isGuest,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    enterGuestMode,
    exitGuestMode,
    refreshUser,
  }), [
    user,
    supabaseUser,
    isLoading,
    isGuest,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    enterGuestMode,
    exitGuestMode,
    refreshUser,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
