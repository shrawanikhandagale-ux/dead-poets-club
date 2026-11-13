import { createClient } from '@supabase/supabase-js';
import { SEED_BOOKS } from '../data/seedBooks';
import { Book, ShelfItem, ShelfStatus } from '../types/book';
import { Profile, DEFAULT_AVATAR_CONFIG, AvatarConfig } from '../types/profile';
import { User, Session, SignupResult } from '../types/auth';

export function getArchetypeAvatarConfig(archetypeId?: string): Partial<AvatarConfig> {
  switch (archetypeId) {
    case 'romantic_poet':
      return {
        baseId: 'romantic_poet',
        outerwear: 'cozy_cardigan',
        outerwearColor: '#6E3E44',
        accessories: ['neck_scarf'],
        heldItem: 'leather_journal',
      };
    case 'nocturnal_archivist':
      return {
        baseId: 'nocturnal_archivist',
        outerwear: 'trench_coat',
        outerwearColor: '#1A1614',
        accessories: ['wire_rims'],
        heldItem: 'antique_book',
      };
    case 'classic_scholar':
    default:
      return {
        baseId: 'classic_scholar',
        outerwear: 'tweed_blazer',
        outerwearColor: '#72583E',
        accessories: ['round_spectacles'],
        heldItem: 'antique_book',
      };
  }
}

const DEFAULT_SUPABASE_URL = 'https://qdnleqyiymddxoesicvj.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkbmxlcXlpeW1kZHhvZXNpY3ZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMxMjIzMTIsImV4cCI6MjEwODY5ODMxMn0.zuCRfIMco_uh6jN0QjLLuNDpaYUGpDz8mD628FHL17s';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

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
    // Visitors start as unauthenticated guests. Demo sessions are created explicitly on demand.
  }

  private workIdToLegacyMap = new Map<string, string>();
  private legacyToWorkIdMap = new Map<string, string>();
  private mappingLoaded = false;

  public resetStorage() {
    safeStorage.clear();
    this.workIdToLegacyMap.clear();
    this.legacyToWorkIdMap.clear();
    this.mappingLoaded = false;
    this.init();
  }

  public async getWorkUuidForBookId(bookId: string): Promise<string | null> {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(bookId);
    if (isUUID) return bookId;

    if (this.legacyToWorkIdMap.has(bookId)) {
      return this.legacyToWorkIdMap.get(bookId)!;
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('works')
          .select('id, legacy_code')
          .eq('legacy_code', bookId)
          .maybeSingle();

        if (!error && data?.id) {
          this.legacyToWorkIdMap.set(bookId, data.id);
          this.workIdToLegacyMap.set(data.id, bookId);
          return data.id;
        }
      } catch (err) {
        console.warn(`Error resolving UUID for bookId "${bookId}":`, err);
      }
    }

    return null;
  }

  public async getLegacyCodeForWorkId(workId: string): Promise<string> {
    if (this.workIdToLegacyMap.has(workId)) {
      return this.workIdToLegacyMap.get(workId)!;
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('works')
          .select('id, legacy_code')
          .eq('id', workId)
          .maybeSingle();

        if (!error && data?.legacy_code) {
          this.workIdToLegacyMap.set(workId, data.legacy_code);
          this.legacyToWorkIdMap.set(data.legacy_code, workId);
          return data.legacy_code;
        }
      } catch (err) {
        console.warn(`Error resolving legacy code for workId "${workId}":`, err);
      }
    }

    return workId;
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
    const clean = username.trim().toLowerCase();
    const profiles = this.getProfiles();
    if (profiles.some(p => p.username.toLowerCase() === clean)) {
      return false;
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .ilike('username', clean)
          .limit(1);
        if (!error && data) {
          return data.length === 0;
        }
      } catch (err) {
        console.warn('Supabase username check fallback:', err);
      }
    }
    return true;
  }

  public async signup(
    email: string,
    username: string,
    displayName: string,
    password?: string,
    avatarPreset?: string
  ): Promise<SignupResult> {
    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();
    const cleanDisplayName = displayName.trim();

    const isAvail = await this.checkUsernameAvailable(cleanUsername);
    if (!isAvail) {
      throw new Error(`Username "@${cleanUsername}" is already taken by another poet.`);
    }

    const archetypeConfig = getArchetypeAvatarConfig(avatarPreset);
    const initialAvatarConfig: AvatarConfig = {
      ...DEFAULT_AVATAR_CONFIG,
      ...archetypeConfig,
      configured: false,
    };

    if (isSupabaseConfigured && supabase && password) {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            username: cleanUsername,
            display_name: cleanDisplayName,
            avatar_config: initialAvatarConfig,
          },
        },
      });
      if (error) throw error;
      if (data.user) {
        // When email confirmation is required, Supabase returns null session
        if (!data.session) {
          const pendingUser: User = {
            id: data.user.id,
            email: data.user.email || cleanEmail,
            username: cleanUsername,
            displayName: cleanDisplayName,
            createdAt: data.user.created_at,
          };
          return {
            user: pendingUser,
            session: null,
            emailConfirmationRequired: true,
          };
        }

        // When autoconfirm is enabled or session is active, retrieve genuine profile
        let assignedUsername = cleanUsername;
        let assignedDisplayName = cleanDisplayName;
        try {
          const profile = await this.getProfile(data.user.id);
          if (profile) {
            assignedUsername = profile.username;
            assignedDisplayName = profile.display_name;
          }
        } catch {
          // fallback
        }

        const newUser: User = {
          id: data.user.id,
          email: data.user.email || cleanEmail,
          username: assignedUsername,
          displayName: assignedDisplayName,
          createdAt: data.user.created_at,
        };
        const session: Session = {
          user: newUser,
          token: data.session.access_token,
          expiresAt: data.session.expires_at ? data.session.expires_at * 1000 : Date.now() + 86400000 * 7,
        };
        this.setSession(session);
        return { user: newUser, session, emailConfirmationRequired: false };
      }
    }

    const newUser: User = {
      id: 'poet_' + Math.random().toString(36).substring(2, 9),
      email: cleanEmail,
      username: cleanUsername,
      displayName: cleanDisplayName,
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
      avatar_config: initialAvatarConfig,
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

    return { user: newUser, session, emailConfirmationRequired: false };
  }

  public async resendConfirmationEmail(email: string): Promise<void> {
    const cleanEmail = email.trim().toLowerCase();
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: cleanEmail,
      });
      if (error) throw error;
    }
  }

  public async login(
    emailOrUsername: string,
    password?: string
  ): Promise<{ user: User; session: Session }> {
    const cleanIdentifier = emailOrUsername.trim();

    // 1. Explicit Instant Demo Login
    if (cleanIdentifier === 'keats_apprentice' && !password) {
      const demoSession: Session = {
        user: DEFAULT_DEMO_USER,
        token: 'dpc_mock_jwt_token',
        expiresAt: Date.now() + 86400000 * 7,
      };
      this.setSession(demoSession);
      return { user: DEFAULT_DEMO_USER, session: demoSession };
    }

    // 2. Real Supabase Auth (Email + Password)
    if (isSupabaseConfigured && supabase && password) {
      if (!cleanIdentifier.includes('@')) {
        throw new Error(
          'Supabase authentication requires your registered email address to sign in. Please enter your email, or use the Instant Demo below.'
        );
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanIdentifier.toLowerCase(),
        password,
      });
      if (error) throw error;
      if (data.user) {
        if (!data.session?.access_token) {
          throw new Error('Authentication completed but no session was established.');
        }

        const p = await this.getProfile(data.user.id);

        // Sync initial avatar archetype from signup metadata if DB profile still has default
        if (
          data.user.user_metadata?.avatar_config &&
          (!p?.avatar_config?.configured || p.avatar_config.baseId !== data.user.user_metadata.avatar_config.baseId)
        ) {
          try {
            await supabase.from('profiles').update({ avatar_config: data.user.user_metadata.avatar_config }).eq('id', data.user.id);
          } catch {
            // sync warning
          }
        }

        const user: User = {
          id: data.user.id,
          email: data.user.email || cleanIdentifier.toLowerCase(),
          username: p?.username || data.user.user_metadata?.username || cleanIdentifier.split('@')[0],
          displayName: p?.display_name || data.user.user_metadata?.display_name || 'Fellow Poet',
          createdAt: data.user.created_at,
        };
        const session: Session = {
          user,
          token: data.session.access_token,
          expiresAt: data.session.expires_at ? data.session.expires_at * 1000 : Date.now() + 86400000 * 7,
        };
        this.setSession(session);
        return { user, session };
      }
    }

    // 3. Local Mock Fallback
    const users = this.getUsers();
    const query = cleanIdentifier.toLowerCase();
    let user = users.find(u => u.email.toLowerCase() === query || u.username.toLowerCase() === query);

    if (!user) {
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
    const isMock = userIdOrUsername.startsWith('demo_') || userIdOrUsername.startsWith('poet_');
    if (!isMock && isSupabaseConfigured && supabase) {
      try {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userIdOrUsername);
        const query = supabase.from('profiles').select('id, username, display_name, avatar_config, created_at, updated_at');
        const { data: profileData, error: profileError } = isUUID
          ? await query.eq('id', userIdOrUsername).maybeSingle()
          : await query.ilike('username', userIdOrUsername).maybeSingle();

        if (!profileError && profileData) {
          // Check if current user is the owner to query private user_settings
          const { data: sessionData } = await supabase.auth.getSession();
          const currentUserId = sessionData?.session?.user?.id;
          let userSettings: any = null;

          if (currentUserId && currentUserId === profileData.id) {
            const { data: settingsData } = await supabase
              .from('user_settings')
              .select('bio, reading_goal, favorite_genres, shelves_public, stats_public')
              .eq('user_id', profileData.id)
              .maybeSingle();
            userSettings = settingsData;
          }

          return {
            id: profileData.id,
            username: profileData.username,
            display_name: profileData.display_name,
            bio: userSettings?.bio || '',
            reading_goal: userSettings?.reading_goal ?? 12,
            books_read_count: 0,
            favorite_genres: userSettings?.favorite_genres || [],
            privacy_settings: {
              profile_public: true,
              shelves_public: userSettings?.shelves_public ?? true,
              stats_public: userSettings?.stats_public ?? false,
            },
            avatar_config: { ...DEFAULT_AVATAR_CONFIG, ...(profileData.avatar_config || {}) },
            created_at: profileData.created_at,
            updated_at: profileData.updated_at,
          };
        }
      } catch (err) {
        console.warn('Supabase getProfile fallback:', err);
      }
    }

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

    let existing = index >= 0 ? profiles[index] : null;
    const mergedAvatar = updates.avatar_config
      ? { ...DEFAULT_AVATAR_CONFIG, ...(existing?.avatar_config || {}), ...updates.avatar_config }
      : (existing?.avatar_config || DEFAULT_AVATAR_CONFIG);

    if (existing) {
      profiles[index] = {
        ...existing,
        ...updates,
        avatar_config: mergedAvatar,
        updated_at: new Date().toISOString(),
      };
      safeStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
    }

    if (isSupabaseConfigured && supabase) {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
      if (isUUID) {
        try {
          const profilePayload: any = { updated_at: new Date().toISOString() };
          if (updates.display_name) profilePayload.display_name = updates.display_name;
          if (updates.username) profilePayload.username = updates.username.toLowerCase().trim();
          if (updates.avatar_config) profilePayload.avatar_config = mergedAvatar;

          const settingsPayload: any = { updated_at: new Date().toISOString() };
          let hasSettingsUpdate = false;
          if (updates.bio !== undefined) {
            settingsPayload.bio = updates.bio;
            hasSettingsUpdate = true;
          }
          if (updates.reading_goal !== undefined) {
            settingsPayload.reading_goal = updates.reading_goal;
            hasSettingsUpdate = true;
          }
          if (updates.favorite_genres !== undefined) {
            settingsPayload.favorite_genres = updates.favorite_genres;
            hasSettingsUpdate = true;
          }
          if (updates.privacy_settings?.shelves_public !== undefined) {
            settingsPayload.shelves_public = updates.privacy_settings.shelves_public;
            hasSettingsUpdate = true;
          }
          if (updates.privacy_settings?.stats_public !== undefined) {
            settingsPayload.stats_public = updates.privacy_settings.stats_public;
            hasSettingsUpdate = true;
          }

          const profilePromise = Object.keys(profilePayload).length > 1
            ? supabase.from('profiles').update(profilePayload).eq('id', userId)
            : Promise.resolve({ error: null });

          const settingsPromise = hasSettingsUpdate
            ? supabase.from('user_settings').update(settingsPayload).eq('user_id', userId)
            : Promise.resolve({ error: null });

          await Promise.all([profilePromise, settingsPromise]);

          const refreshed = await this.getProfile(userId);
          if (refreshed) return refreshed;
        } catch (err) {
          console.warn('Supabase profile remote update warning:', err);
        }
      }
    }

    if (index === -1) throw new Error('Profile not found');
    return profiles[index];
  }

  public async resetPassword(email: string): Promise<void> {
    const cleanEmail = email.trim().toLowerCase();
    if (isSupabaseConfigured && supabase) {
      const redirectTo = `${window.location.origin}/login?reset=true`;
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo,
      });
      if (error) throw error;
    }
  }

  // --- Books & Shelves Operations ---
  public async getBooks(): Promise<Book[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('works')
          .select(`
            id,
            legacy_code,
            title,
            subtitle,
            description,
            first_published_year,
            benchmark_rating,
            benchmark_review_count,
            featured_quote_text,
            featured_quote_speaker,
            is_club_select,
            editions (
              id,
              publisher,
              isbn_13,
              isbn_10,
              language_code,
              page_count,
              cover_url,
              is_canonical_edition
            ),
            work_authors (
              role,
              display_order,
              author:authors (
                id,
                display_name
              )
            ),
            work_genres (
              genre:genres (
                name,
                slug
              )
            ),
            collection_works (
              position,
              collection:collections (
                slug,
                name
              )
            )
          `);

        if (!error && data && data.length > 0) {
          for (const w of data) {
            if (w.id && w.legacy_code) {
              this.workIdToLegacyMap.set(w.id, w.legacy_code);
              this.legacyToWorkIdMap.set(w.legacy_code, w.id);
            }
          }
          this.mappingLoaded = true;

          const mapped: Book[] = data.map((w: any) => {
            // Select canonical edition deterministically; fallback to first available edition
            const canonicalEdition =
              (w.editions || []).find((e: any) => e.is_canonical_edition) ||
              w.editions?.[0];

            // Select primary author deterministically by display_order
            const sortedAuthors = (w.work_authors || [])
              .slice()
              .sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0));
            const primaryAuthor = sortedAuthors[0];

            // Map genres
            const genres = (w.work_genres || [])
              .map((wg: any) => wg.genre?.name)
              .filter(Boolean);

            // Map collections sorted by position
            const collections = (w.collection_works || [])
              .slice()
              .sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0))
              .map((cw: any) => cw.collection?.slug)
              .filter(Boolean);

            return {
              id: w.legacy_code || w.id,
              title: w.title,
              subtitle: w.subtitle || undefined,
              author: primaryAuthor?.author?.display_name || 'Unknown Author',
              author_id: primaryAuthor?.author?.id,
              description: w.description || '',
              cover_url: canonicalEdition?.cover_url || '',
              publication_year: w.first_published_year || 0,
              publisher: canonicalEdition?.publisher || undefined,
              isbn: canonicalEdition?.isbn_13 || canonicalEdition?.isbn_10 || undefined,
              language: canonicalEdition?.language_code || 'en',
              genres,
              rating_avg: Number(w.benchmark_rating) || 0,
              rating_count: Number(w.benchmark_review_count) || 0,
              pages: canonicalEdition?.page_count || 320,
              quote: w.featured_quote_text
                ? {
                    text: w.featured_quote_text,
                    speaker: w.featured_quote_speaker || undefined,
                  }
                : undefined,
              featured: Boolean(w.is_club_select),
              homepage_collections: collections,
            };
          });

          // Sort deterministically to match canonical order b1..b34
          mapped.sort((a, b) => {
            const numA = parseInt(a.id.replace(/\D/g, ''), 10) || 0;
            const numB = parseInt(b.id.replace(/\D/g, ''), 10) || 0;
            return numA - numB;
          });

          return mapped;
        }
      } catch (err) {
        console.warn('Supabase getBooks fallback:', err);
      }
    }
    return SEED_BOOKS;
  }

  public async getBookById(id: string): Promise<Book | null> {
    const books = await this.getBooks();
    return books.find(b => b.id === id) || null;
  }

  public async getUserShelves(userId: string): Promise<ShelfItem[]> {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
    if (isUUID && isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('shelves')
          .select('id, user_id, work_id, edition_id, status, started_at, finished_at, progress_pages, created_at, works(legacy_code)')
          .eq('user_id', userId);

        if (!error && data) {
          return data.map((row: any) => {
            const legacyCode = row.works?.legacy_code || this.workIdToLegacyMap.get(row.work_id) || row.work_id;
            return {
              id: row.id,
              user_id: row.user_id,
              book_id: legacyCode,
              status: row.status as ShelfStatus,
              started_at: row.started_at || undefined,
              finished_at: row.finished_at || undefined,
              progress_pages: row.progress_pages || 0,
              created_at: row.created_at,
            };
          });
        }
        if (error) {
          console.warn('Supabase getUserShelves query warning:', error.message);
        }
      } catch (err) {
        console.warn('Supabase getUserShelves fallback:', err);
      }
    }

    try {
      const all: ShelfItem[] = JSON.parse(safeStorage.getItem(STORAGE_KEYS.SHELVES) || '[]');
      return all.filter(s => s.user_id === userId);
    } catch {
      return [];
    }
  }

  public async setBookShelf(userId: string, bookId: string, status: ShelfStatus): Promise<ShelfItem> {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);

    // If authenticated Supabase user, persist to remote database
    if (isUUID && isSupabaseConfigured && supabase) {
      const workUuid = await this.getWorkUuidForBookId(bookId);
      if (!workUuid) {
        throw new Error(`Cannot shelve volume: could not resolve canonical work for identifier "${bookId}".`);
      }

      const todayDate = new Date().toISOString().split('T')[0];
      const payload: any = {
        user_id: userId,
        work_id: workUuid,
        status,
        updated_at: new Date().toISOString(),
      };

      if (status === 'currently_reading') {
        payload.started_at = todayDate;
        payload.finished_at = null;
      } else if (status === 'read') {
        payload.finished_at = todayDate;
      } else if (status === 'want_to_read' || status === 'abandoned') {
        payload.finished_at = null;
      }

      const { error } = await supabase
        .from('shelves')
        .upsert(payload, { onConflict: 'user_id,work_id' });

      if (error) {
        console.error('Supabase setBookShelf remote upsert error:', error);
        throw new Error(`Sanctuary archive error: ${error.message}`);
      }
    }

    // Keep safeStorage cache synchronized for instant UI rendering and guest mode
    const all: ShelfItem[] = JSON.parse(safeStorage.getItem(STORAGE_KEYS.SHELVES) || '[]');
    const existingIndex = all.findIndex(s => s.user_id === userId && s.book_id === bookId);

    let updated: ShelfItem;
    if (existingIndex >= 0) {
      all[existingIndex].status = status;
      if (status === 'currently_reading') {
        if (!all[existingIndex].started_at) {
          all[existingIndex].started_at = new Date().toISOString().split('T')[0];
        }
        delete all[existingIndex].finished_at;
      } else if (status === 'read') {
        all[existingIndex].finished_at = new Date().toISOString().split('T')[0];
      } else if (status === 'want_to_read' || status === 'abandoned') {
        delete all[existingIndex].finished_at;
      }
      updated = all[existingIndex];
    } else {
      updated = {
        id: 'sh_' + Math.random().toString(36).substring(2, 9),
        user_id: userId,
        book_id: bookId,
        status,
        started_at: status === 'currently_reading' ? new Date().toISOString().split('T')[0] : undefined,
        finished_at: status === 'read' ? new Date().toISOString().split('T')[0] : undefined,
        progress_pages: 0,
        created_at: new Date().toISOString(),
      };
      all.push(updated);
    }

    safeStorage.setItem(STORAGE_KEYS.SHELVES, JSON.stringify(all));
    return updated;
  }

  public async removeBookShelf(userId: string, bookId: string): Promise<void> {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);

    if (isUUID && isSupabaseConfigured && supabase) {
      const workUuid = await this.getWorkUuidForBookId(bookId);
      if (workUuid) {
        const { error } = await supabase
          .from('shelves')
          .delete()
          .eq('user_id', userId)
          .eq('work_id', workUuid);

        if (error) {
          console.error('Supabase removeBookShelf error:', error);
          throw new Error(`Sanctuary archive error: ${error.message}`);
        }
      }
    }

    const all: ShelfItem[] = JSON.parse(safeStorage.getItem(STORAGE_KEYS.SHELVES) || '[]');
    const filtered = all.filter(s => !(s.user_id === userId && s.book_id === bookId));
    safeStorage.setItem(STORAGE_KEYS.SHELVES, JSON.stringify(filtered));
  }
}

export const localService = new LocalService();
