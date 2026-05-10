'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import {
  type AppUser,
  type UserRole,
  subscribeToAuthState,
  getUserDocument,
  signInWithGoogle as authSignInWithGoogle,
  signInWithEmail as authSignInWithEmail,
  signUpWithEmail as authSignUpWithEmail,
  signOut as authSignOut,
} from '@/lib/auth';

interface AuthContextType {
  user: AppUser | null;
  firebaseUser: FirebaseUser | null;
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState(async (fbUser) => {
      setFirebaseUser(fbUser);

      if (fbUser) {
        try {
          const appUser = await getUserDocument(fbUser.uid);
          setUser(appUser);
          setIsGuest(false);
        } catch (error) {
          console.error('Error fetching user document:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }

      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setIsLoading(true);
    try {
      const appUser = await authSignInWithGoogle();
      setUser(appUser);
      setIsGuest(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const appUser = await authSignInWithEmail(email, password);
      setUser(appUser);
      setIsGuest(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signUpWithEmail = useCallback(
    async (email: string, password: string, displayName: string) => {
      setIsLoading(true);
      try {
        const appUser = await authSignUpWithEmail(email, password, displayName);
        setUser(appUser);
        setIsGuest(false);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const signOut = useCallback(async () => {
    setIsLoading(true);
    try {
      await authSignOut();
      setUser(null);
      setIsGuest(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const enterGuestMode = useCallback(() => {
    setUser({
      uid: 'guest',
      email: null,
      displayName: 'Guest User',
      photoURL: null,
      role: 'guest' as UserRole,
      createdAt: new Date(),
      skills: {},
    });
    setIsGuest(true);
  }, []);

  const exitGuestMode = useCallback(() => {
    setUser(null);
    setIsGuest(false);
  }, []);

  const value: AuthContextType = {
    user,
    firebaseUser,
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
