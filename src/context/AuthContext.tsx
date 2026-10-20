import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '../types/auth';
import { Profile } from '../types/profile';
import { ShelfItem, ShelfStatus } from '../types/book';
import { localService } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  shelves: ShelfItem[];
  isLoading: boolean;
  login: (emailOrUsername: string) => Promise<void>;
  signup: (email: string, username: string, displayName: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  updateBookShelf: (bookId: string, status: ShelfStatus) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [shelves, setShelves] = useState<ShelfItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize session from storage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedSession = localService.getSession();
        if (storedSession) {
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
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (emailOrUsername: string) => {
    setIsLoading(true);
    try {
      const res = await localService.login(emailOrUsername);
      setUser(res.user);
      setSession(res.session);
      const p = await localService.getProfile(res.user.id);
      setProfile(p);
      const sh = await localService.getUserShelves(res.user.id);
      setShelves(sh);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, username: string, displayName: string) => {
    setIsLoading(true);
    try {
      const res = await localService.signup(email, username, displayName);
      setUser(res.user);
      setSession(res.session);
      const p = await localService.getProfile(res.user.id);
      setProfile(p);
      const sh = await localService.getUserShelves(res.user.id);
      setShelves(sh);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
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
