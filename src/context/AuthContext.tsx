import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '../types/auth';
import { Profile } from '../types/profile';
import { ShelfItem, ShelfStatus } from '../types/book';
import { localService, isSupabaseConfigured, supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  shelves: ShelfItem[];
  isLoading: boolean;
  login: (emailOrUsername: string, password?: string) => Promise<{ user: User; session: Session }>;
  signup: (email: string, username: string, displayName: string, password?: string) => Promise<{ user: User; session: Session }>;
  logout: () => void;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  updateBookShelf: (bookId: string, status: ShelfStatus) => Promise<void>;
  refreshProfile: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [shelves, setShelves] = useState<ShelfItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize session from Supabase or storage
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        if (isSupabaseConfigured && supabase) {
          const { data: { session: sbSession } } = await supabase.auth.getSession();
          if (sbSession?.user) {
            const p = await localService.getProfile(sbSession.user.id);
            const userObj: User = {
              id: sbSession.user.id,
              email: sbSession.user.email || '',
              username: p?.username || sbSession.user.user_metadata?.username || 'poet',
              displayName: p?.display_name || sbSession.user.user_metadata?.display_name || 'Fellow Poet',
              createdAt: sbSession.user.created_at,
            };
            if (isMounted) {
              setUser(userObj);
              setSession({
                user: userObj,
                token: sbSession.access_token,
                expiresAt: (sbSession.expires_at || 0) * 1000,
              });
              setProfile(p);
              const sh = await localService.getUserShelves(sbSession.user.id);
              setShelves(sh);
              setIsLoading(false);
              return;
            }
          }
        }

        const storedSession = localService.getSession();
        if (storedSession && isMounted) {
          setSession(storedSession);
          setUser(storedSession.user);
          const p = await localService.getProfile(storedSession.user.id);
          setProfile(p);
          const sh = await localService.getUserShelves(storedSession.user.id);
          setShelves(sh);
        }
      } catch (err) {
        console.error('Failed to restore auth session:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initAuth();

    // Listen for auth state changes if Supabase is configured
    let subscription: { unsubscribe: () => void } | null = null;
    if (isSupabaseConfigured && supabase) {
      const { data } = supabase.auth.onAuthStateChange(async (event, sbSession) => {
        if (!isMounted) return;
        if (event === 'SIGNED_OUT' || !sbSession) {
          setUser(null);
          setSession(null);
          setProfile(null);
          setShelves([]);
        } else if (event === 'SIGNED_IN' && sbSession.user) {
          const p = await localService.getProfile(sbSession.user.id);
          const userObj: User = {
            id: sbSession.user.id,
            email: sbSession.user.email || '',
            username: p?.username || sbSession.user.user_metadata?.username || 'poet',
            displayName: p?.display_name || sbSession.user.user_metadata?.display_name || 'Fellow Poet',
            createdAt: sbSession.user.created_at,
          };
          setUser(userObj);
          setSession({
            user: userObj,
            token: sbSession.access_token,
            expiresAt: (sbSession.expires_at || 0) * 1000,
          });
          setProfile(p);
          const sh = await localService.getUserShelves(sbSession.user.id);
          setShelves(sh);
        }
      });
      subscription = data.subscription;
    }

    return () => {
      isMounted = false;
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const login = async (emailOrUsername: string, password?: string) => {
    setIsLoading(true);
    try {
      const res = await localService.login(emailOrUsername, password);
      setUser(res.user);
      setSession(res.session);
      const p = await localService.getProfile(res.user.id);
      setProfile(p);
      const sh = await localService.getUserShelves(res.user.id);
      setShelves(sh);
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, username: string, displayName: string, password?: string) => {
    setIsLoading(true);
    try {
      const res = await localService.signup(email, username, displayName, password);
      setUser(res.user);
      setSession(res.session);
      const p = await localService.getProfile(res.user.id);
      setProfile(p);
      const sh = await localService.getUserShelves(res.user.id);
      setShelves(sh);
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Supabase signOut warning:', err);
      }
    }
    localService.clearSession();
    setUser(null);
    setSession(null);
    setProfile(null);
    setShelves([]);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;
    const updated = await localService.updateProfile(user.id, updates);
    setProfile(updated);
  };

  const updateBookShelf = async (bookId: string, status: ShelfStatus) => {
    if (!user) return;
    const updated = await localService.setBookShelf(user.id, bookId, status);
    setShelves(prev => {
      const idx = prev.findIndex(s => s.book_id === bookId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updated;
        return copy;
      }
      return [...prev, updated];
    });
  };

  const refreshProfile = async () => {
    if (!user) return;
    const p = await localService.getProfile(user.id);
    setProfile(p);
    const sh = await localService.getUserShelves(user.id);
    setShelves(sh);
  };

  const resetPassword = async (email: string) => {
    await localService.resetPassword(email);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        shelves,
        isLoading,
        login,
        signup,
        logout,
        updateProfile,
        updateBookShelf,
        refreshProfile,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
