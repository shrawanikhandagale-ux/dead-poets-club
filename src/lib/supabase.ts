import { createClient } from '@supabase/supabase-js';
import { SEED_BOOKS } from '../data/seedBooks';
import { Book, ShelfItem, ShelfStatus } from '../types/book';
import { Profile, DEFAULT_AVATAR_CONFIG } from '../types/profile';
import { User, Session } from '../types/auth';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ==========================================
// LOCAL PERSISTENT STORAGE SERVICE (FALLBACK & DEV)
// ==========================================
const STORAGE_KEYS = {
  SESSION: 'dpc_session',
  USERS: 'dpc_users',
  PROFILES: 'dpc_profiles',
  SHELVES: 'dpc_shelves',
  CUSTOM_BOOKS: 'dpc_custom_books',
};

// Universal storage wrapper that seamlessly works in Browser, SSR, and Vitest/Node
const memoryStore = new Map<string, string>();
export const safeStorage = {
  getItem: (key: string): string | null => {
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return memoryStore.get(key) ?? null;
      }
    }
    return memoryStore.get(key) ?? null;
  },
  setItem: (key: string, value: string): void => {
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      try {
        window.localStorage.setItem(key, value);
      } catch {}
    }
    memoryStore.set(key, value);
  },
  removeItem: (key: string): void => {
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      try {
        window.localStorage.removeItem(key);
      } catch {}
    }
    memoryStore.delete(key);
  },
  clear: (): void => {
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      try {
        window.localStorage.clear();
      } catch {}
    }
    memoryStore.clear();
  },
};

// Initialize default seed profile for instant demo/exploration
const DEFAULT_DEMO_USER: User = {
  id: 'demo_poet_001',
  email: 'schillinger@deadpoets.club',
  username: 'keats_apprentice',
  displayName: 'Lord Byron\'s Raven',
  createdAt: new Date().toISOString(),
};

const DEFAULT_DEMO_PROFILE: Profile = {
  id: 'demo_poet_001',
  username: 'keats_apprentice',
  display_name: 'Lord Byron\'s Raven',
  bio: 'Haunting old libraries, drinking black tea, and whispering verse to gargoyles.',
  reading_goal: 24,
  books_read_count: 7,
  favorite_genres: ['Dark Academia', 'Gothic', 'Poetry', 'Literary Fiction'],
  privacy_settings: {
    profile_public: true,
    shelves_public: true,
    stats_public: false,
  },
  avatar_config: {
    ...DEFAULT_AVATAR_CONFIG,
    configured: true,
    mbti: 'INTJ',
    heldItem: 'antique_book',
    equippedBadge: 'secret_society_key',
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Seed initial shelves
const DEFAULT_DEMO_SHELVES: ShelfItem[] = [
  {
    id: 'sh_1',
    user_id: 'demo_poet_001',
    book_id: 'b1', // The Secret History
    status: 'currently_reading',
    started_at: '2026-10-01',
    progress_pages: 312,
    created_at: '2026-10-01',
  },
  {
    id: 'sh_2',
    user_id: 'demo_poet_001',
    book_id: 'b2', // Dead Poets Society
    status: 'read',
    finished_at: '2026-09-15',
    progress_pages: 176,
    created_at: '2026-09-10',
  },
  {
    id: 'sh_3',
    user_id: 'demo_poet_001',
    book_id: 'b3', // Dorian Gray
    status: 'want_to_read',
    created_at: '2026-10-12',
  },
];

class LocalService {
  constructor() {
    this.init();
  }

  public init() {
    if (!safeStorage.getItem(STORAGE_KEYS.PROFILES)) {
      safeStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify([DEFAULT_DEMO_PROFILE]));
    }
    if (!safeStorage.getItem(STORAGE_KEYS.USERS)) {
      safeStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([DEFAULT_DEMO_USER]));
    }
    if (!safeStorage.getItem(STORAGE_KEYS.SHELVES)) {
      safeStorage.setItem(STORAGE_KEYS.SHELVES, JSON.stringify(DEFAULT_DEMO_SHELVES));
    }
    // Auto-login demo user on first visit if no session exists
    if (!safeStorage.getItem(STORAGE_KEYS.SESSION)) {
      const demoSession: Session = {
        user: DEFAULT_DEMO_USER,
        token: 'dpc_mock_jwt_token',
        expiresAt: Date.now() + 86400000 * 7,
      };
      safeStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(demoSession));
    }
  }

  public resetStorage() {
    safeStorage.clear();
    this.init();
  }

  // --- Auth Operations ---
  public getSession(): Session | null {
    try {
      const data = safeStorage.getItem(STORAGE_KEYS.SESSION);
      if (!data) return null;
      const session: Session = JSON.parse(data);
      if (session.expiresAt < Date.now()) {
        this.clearSession();
        return null;
      }
      return session;
    } catch {
      return null;
    }
  }

  public setSession(session: Session) {
    safeStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
  }

  public clearSession() {
    safeStorage.removeItem(STORAGE_KEYS.SESSION);
  }

  public async checkUsernameAvailable(username: string): Promise<boolean> {
    const profiles = this.getProfiles();
    const clean = username.trim().toLowerCase();
    return !profiles.some(p => p.username.toLowerCase() === clean);
  }

  public async signup(email: string, username: string, displayName: string): Promise<{ user: User; session: Session }> {
    const isAvail = await this.checkUsernameAvailable(username);
    if (!isAvail) {
      throw new Error(`Username "@${username}" is already taken by another poet.`);
    }

    const newUser: User = {
      id: 'poet_' + Math.random().toString(36).substring(2, 9),
      email,
      username: username.toLowerCase().trim(),
      displayName: displayName.trim(),
      createdAt: new Date().toISOString(),
    };

    const newProfile: Profile = {
      id: newUser.id,
      username: newUser.username,
      display_name: newUser.displayName,
      bio: 'A passionate reader who wanders through dusty stacks and ink-stained pages.',
      reading_goal: 12,
      books_read_count: 0,
      favorite_genres: ['Dark Academia', 'Classics'],
      privacy_settings: {
        profile_public: true,
        shelves_public: true,
        stats_public: false,
      },
      avatar_config: {
        ...DEFAULT_AVATAR_CONFIG,
        configured: false,
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const users = this.getUsers();
    users.push(newUser);
    safeStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

    const profiles = this.getProfiles();
    profiles.push(newProfile);
    safeStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));

    const session: Session = {
      user: newUser,
      token: 'jwt_' + Math.random().toString(36),
      expiresAt: Date.now() + 86400000 * 7,
    };
    this.setSession(session);

    return { user: newUser, session };
  }

  public async login(emailOrUsername: string): Promise<{ user: User; session: Session }> {
    const users = this.getUsers();
    const query = emailOrUsername.trim().toLowerCase();
    let user = users.find(u => u.email.toLowerCase() === query || u.username.toLowerCase() === query);

    if (!user) {
      // Create user automatically for painless testing if not found
      user = {
        id: 'poet_' + Math.random().toString(36).substring(2, 9),
        email: query.includes('@') ? query : `${query}@deadpoets.club`,
        username: query.replace(/[^a-z0-9_]/g, ''),
        displayName: query.includes('@') ? query.split('@')[0] : query,
        createdAt: new Date().toISOString(),
      };
      users.push(user);
      safeStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

      const newProfile: Profile = {
        id: user.id,
        username: user.username,
        display_name: user.displayName,
        bio: 'A wanderer between poetry and prose.',
        reading_goal: 12,
        books_read_count: 0,
        favorite_genres: ['Dark Academia'],
        privacy_settings: { profile_public: true, shelves_public: true, stats_public: false },
        avatar_config: { ...DEFAULT_AVATAR_CONFIG, configured: false },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const profiles = this.getProfiles();
      profiles.push(newProfile);
      safeStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
    }

    const session: Session = {
      user,
      token: 'jwt_' + Math.random().toString(36),
      expiresAt: Date.now() + 86400000 * 7,
    };
    this.setSession(session);

    return { user, session };
  }

  // --- Profile Operations ---
  public getProfiles(): Profile[] {
    try {
      const raw = JSON.parse(safeStorage.getItem(STORAGE_KEYS.PROFILES) || '[]');
      return raw.map((p: Profile) => ({
        ...p,
        avatar_config: {
          ...DEFAULT_AVATAR_CONFIG,
          ...(p.avatar_config || {}),
        },
      }));
    } catch {
      return [];
    }
  }

  public getUsers(): User[] {
    try {
      return JSON.parse(safeStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    } catch {
      return [];
    }
  }

  public async getProfile(userIdOrUsername: string): Promise<Profile | null> {
    const profiles = this.getProfiles();
    const found = profiles.find(p => p.id === userIdOrUsername || p.username.toLowerCase() === userIdOrUsername.toLowerCase());
    if (!found) return null;
    return {
      ...found,
      avatar_config: {
        ...DEFAULT_AVATAR_CONFIG,
        ...(found.avatar_config || {}),
      },
    };
  }

  public async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    const profiles = this.getProfiles();
    const index = profiles.findIndex(p => p.id === userId);
    if (index === -1) throw new Error('Profile not found');

    const existing = profiles[index];
    const mergedAvatar = updates.avatar_config
      ? { ...DEFAULT_AVATAR_CONFIG, ...existing.avatar_config, ...updates.avatar_config }
      : existing.avatar_config;

    profiles[index] = {
      ...existing,
      ...updates,
      avatar_config: mergedAvatar,
      updated_at: new Date().toISOString(),
    };
    safeStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('profiles')
          .update({
            ...updates,
            avatar_config: mergedAvatar,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);
      } catch (err) {
        console.warn('Supabase profile remote update warning:', err);
      }
    }

    return profiles[index];
  }

  // --- Books & Shelves Operations ---
  public async getBooks(): Promise<Book[]> {
    return SEED_BOOKS;
  }

  public async getBookById(id: string): Promise<Book | null> {
    return SEED_BOOKS.find(b => b.id === id) || null;
  }

  public async getUserShelves(userId: string): Promise<ShelfItem[]> {
    try {
      const all: ShelfItem[] = JSON.parse(safeStorage.getItem(STORAGE_KEYS.SHELVES) || '[]');
      return all.filter(s => s.user_id === userId);
    } catch {
      return [];
    }
  }

  public async setBookShelf(userId: string, bookId: string, status: ShelfStatus): Promise<ShelfItem> {
    const all: ShelfItem[] = JSON.parse(safeStorage.getItem(STORAGE_KEYS.SHELVES) || '[]');
    const existingIndex = all.findIndex(s => s.user_id === userId && s.book_id === bookId);

    let updated: ShelfItem;
    if (existingIndex >= 0) {
      all[existingIndex].status = status;
      if (status === 'currently_reading' && !all[existingIndex].started_at) {
        all[existingIndex].started_at = new Date().toISOString();
      }
      if (status === 'read' && !all[existingIndex].finished_at) {
        all[existingIndex].finished_at = new Date().toISOString();
      }
      updated = all[existingIndex];
    } else {
      updated = {
        id: 'sh_' + Math.random().toString(36).substring(2, 9),
        user_id: userId,
        book_id: bookId,
        status,
        started_at: status === 'currently_reading' ? new Date().toISOString() : undefined,
        finished_at: status === 'read' ? new Date().toISOString() : undefined,
        progress_pages: 0,
        created_at: new Date().toISOString(),
      };
      all.push(updated);
    }

    safeStorage.setItem(STORAGE_KEYS.SHELVES, JSON.stringify(all));
    return updated;
  }
}

export const localService = new LocalService();
