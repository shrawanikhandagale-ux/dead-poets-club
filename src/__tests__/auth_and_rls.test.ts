import { describe, it, expect, beforeEach } from 'vitest';
import { localService } from '../lib/supabase';
import { SEED_BOOKS } from '../data/seedBooks';

describe('Phase 1: Auth, Profiles, Catalogue & RLS Access Boundaries', () => {
  beforeEach(() => {
    localService.resetStorage();
  });

  describe('1. Catalogue & Books Accessibility (Guest & Member Read)', () => {
    it('allows anyone (guest or member) to access the curated book catalogue', async () => {
      const books = await localService.getBooks();
      expect(books).toBeDefined();
      expect(books.length).toBeGreaterThanOrEqual(30);

      const secretHistory = await localService.getBookById('b1');
      expect(secretHistory).toBeDefined();
      expect(secretHistory?.title).toBe('The Secret History');
      expect(secretHistory?.author).toBe('Donna Tartt');
      expect(secretHistory?.pages).toBe(559);
    });

    it('returns null when querying a non-existent volume ID', async () => {
      const unknown = await localService.getBookById('non_existent_book_999');
      expect(unknown).toBeNull();
    });
  });

  describe('2. Username Uniqueness & Handle Verification', () => {
    it('detects taken usernames in a case-insensitive manner', async () => {
      // 'keats_apprentice' is the default seeded user
      const isTakenLower = await localService.checkUsernameAvailable('keats_apprentice');
      expect(isTakenLower).toBe(false);

      const isTakenUpper = await localService.checkUsernameAvailable('KEATS_APPRENTICE');
      expect(isTakenUpper).toBe(false);

      const isTakenMixed = await localService.checkUsernameAvailable('Keats_Apprentice');
      expect(isTakenMixed).toBe(false);
    });

    it('approves untaken poet handles', async () => {
      const isAvailable = await localService.checkUsernameAvailable('virginias_lighthouse');
      expect(isAvailable).toBe(true);
    });

    it('rejects duplicate username during signup', async () => {
      await expect(
        localService.signup('byron@club.org', 'keats_apprentice', 'Lord Byron')
      ).rejects.toThrow(/already taken/i);
    });
  });

  describe('3. Registration & Profile Initialization', () => {
    it('creates user and initializes a profile with defaults on signup', async () => {
      const { user, session } = await localService.signup(
        'sylvia@plath.org',
        'bell_jar_reader',
        'Sylvia P.'
      );

      expect(user).toBeDefined();
      expect(user.username).toBe('bell_jar_reader');
      expect(session.token).toBeDefined();

      const profile = await localService.getProfile(user.id);
      expect(profile).toBeDefined();
      expect(profile?.display_name).toBe('Sylvia P.');
      expect(profile?.reading_goal).toBe(12);
      expect(profile?.privacy_settings.profile_public).toBe(true);
      expect(profile?.privacy_settings.shelves_public).toBe(true);
      expect(profile?.avatar_config.baseId).toBe('classic_scholar');
    });
  });

  describe('4. Profile RLS & Mutation Security', () => {
    it('allows owner to update their bio and reading goal', async () => {
      const updated = await localService.updateProfile('demo_poet_001', {
        bio: 'Drinking black coffee and rereading Rimbaud.',
        reading_goal: 30,
      });

      expect(updated.bio).toBe('Drinking black coffee and rereading Rimbaud.');
      expect(updated.reading_goal).toBe(30);

      // Verify persistence in subsequent fetch
      const profile = await localService.getProfile('demo_poet_001');
      expect(profile?.reading_goal).toBe(30);
    });

    it('rejects update on a non-existent profile', async () => {
      await expect(
        localService.updateProfile('unregistered_user_id', { bio: 'Ghost' })
      ).rejects.toThrow(/not found/i);
    });
  });

  describe('5. Shelves Lifecycle & Status Tracking', () => {
    it('supports shelving a book and manages started_at / finished_at dates', async () => {
      const userId = 'demo_poet_001';

      // 1. Want to read
      const shelf1 = await localService.setBookShelf(userId, 'b4', 'want_to_read');
      expect(shelf1.status).toBe('want_to_read');
      expect(shelf1.started_at).toBeUndefined();

      // 2. Currently reading sets started_at timestamp
      const shelf2 = await localService.setBookShelf(userId, 'b4', 'currently_reading');
      expect(shelf2.status).toBe('currently_reading');
      expect(shelf2.started_at).toBeDefined();

      // 3. Finished read sets finished_at timestamp
      const shelf3 = await localService.setBookShelf(userId, 'b4', 'read');
      expect(shelf3.status).toBe('read');
      expect(shelf3.finished_at).toBeDefined();

      // Retrieve all shelves for user
      const userShelves = await localService.getUserShelves(userId);
      const b4Shelf = userShelves.find(s => s.book_id === 'b4');
      expect(b4Shelf).toBeDefined();
      expect(b4Shelf?.status).toBe('read');
    });
  });
});
