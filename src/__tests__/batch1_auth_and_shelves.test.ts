import { describe, it, expect, beforeEach, vi } from 'vitest';
import { localService, getArchetypeAvatarConfig, supabase, isSupabaseConfigured } from '../lib/supabase';

describe('Batch 1: Authentication & Shelf Cloud Persistence', () => {
  beforeEach(() => {
    localService.resetStorage();
    vi.restoreAllMocks();
  });

  describe('1. Archetype Preset Mapping', () => {
    it('maps "classic_scholar" to tweed blazer and spectacles', () => {
      const config = getArchetypeAvatarConfig('classic_scholar');
      expect(config.baseId).toBe('classic_scholar');
      expect(config.outerwear).toBe('tweed_blazer');
      expect(config.outerwearColor).toBe('#72583E');
      expect(config.accessories).toContain('round_spectacles');
      expect(config.heldItem).toBe('antique_book');
    });

    it('maps "romantic_poet" to cozy cardigan and journal', () => {
      const config = getArchetypeAvatarConfig('romantic_poet');
      expect(config.baseId).toBe('romantic_poet');
      expect(config.outerwear).toBe('cozy_cardigan');
      expect(config.outerwearColor).toBe('#6E3E44');
      expect(config.accessories).toContain('neck_scarf');
      expect(config.heldItem).toBe('leather_journal');
    });

    it('maps "nocturnal_archivist" to trench coat and wire rims', () => {
      const config = getArchetypeAvatarConfig('nocturnal_archivist');
      expect(config.baseId).toBe('nocturnal_archivist');
      expect(config.outerwear).toBe('trench_coat');
      expect(config.outerwearColor).toBe('#1A1614');
      expect(config.accessories).toContain('wire_rims');
      expect(config.heldItem).toBe('antique_book');
    });

    it('defaults to "classic_scholar" when archetype is omitted or unrecognized', () => {
      const config = getArchetypeAvatarConfig(undefined);
      expect(config.baseId).toBe('classic_scholar');
      expect(config.outerwear).toBe('tweed_blazer');
    });
  });

  describe('2. Signup & Email Confirmation Flow', () => {
    it('creates user with selected archetype preset in local fallback mode', async () => {
      const result = await localService.signup(
        'percy@shelley.org',
        'percy_shelley',
        'Percy Bysshe Shelley',
        undefined,
        'romantic_poet'
      );

      expect(result.user).toBeDefined();
      expect(result.user.username).toBe('percy_shelley');
      expect(result.session).toBeDefined();
      expect(result.session?.token).toMatch(/^jwt_/);
      expect(result.emailConfirmationRequired).toBe(false);

      const profile = await localService.getProfile(result.user.id);
      expect(profile).toBeDefined();
      expect(profile?.avatar_config.baseId).toBe('romantic_poet');
      expect(profile?.avatar_config.outerwear).toBe('cozy_cardigan');
      expect(profile?.avatar_config.configured).toBe(false);
    });

    it('returns emailConfirmationRequired=true and null session when Supabase requires confirmation', async () => {
      if (!isSupabaseConfigured || !supabase) return;

      // Mock supabase.auth.signUp returning user with null session (mailer_autoconfirm: false)
      const mockUserId = '11111111-2222-3333-4444-555555555555';
      const signUpSpy = vi.spyOn(supabase.auth, 'signUp').mockResolvedValueOnce({
        data: {
          user: {
            id: mockUserId,
            email: 'new_poet@deadpoets.club',
            created_at: new Date().toISOString(),
            app_metadata: {},
            user_metadata: {
              username: 'new_poet',
              display_name: 'New Poet',
            },
            aud: 'authenticated',
          } as any,
          session: null,
        },
        error: null,
      });

      // Mock checkUsernameAvailable
      vi.spyOn(localService, 'checkUsernameAvailable').mockResolvedValueOnce(true);

      const result = await localService.signup(
        'new_poet@deadpoets.club',
        'new_poet',
        'New Poet',
        'secret_pass_123',
        'nocturnal_archivist'
      );

      expect(signUpSpy).toHaveBeenCalled();
      const calledOptions = signUpSpy.mock.calls[0][0].options?.data as any;
      expect(calledOptions?.avatar_config?.baseId).toBe('nocturnal_archivist');

      expect(result.emailConfirmationRequired).toBe(true);
      expect(result.session).toBeNull();
      expect(result.user.id).toBe(mockUserId);
      expect(result.user.username).toBe('new_poet');

      // Verify no fake token was stored in local storage
      const storedSession = localService.getSession();
      expect(storedSession).toBeNull();
    });

    it('returns real session and syncs assigned profile when session is provided immediately', async () => {
      if (!isSupabaseConfigured || !supabase) return;

      const mockUserId = '22222222-3333-4444-5555-666666666666';
      vi.spyOn(supabase.auth, 'signUp').mockResolvedValueOnce({
        data: {
          user: {
            id: mockUserId,
            email: 'instant@deadpoets.club',
            created_at: new Date().toISOString(),
            app_metadata: {},
            user_metadata: { username: 'instant_poet', display_name: 'Instant Poet' },
            aud: 'authenticated',
          } as any,
          session: {
            access_token: 'genuine_supabase_jwt_token',
            expires_at: Math.floor(Date.now() / 1000) + 3600,
            token_type: 'bearer',
            user: {} as any,
          } as any,
        },
        error: null,
      });

      // Simulate profile where trigger appended collision suffix `instant_poet_9a2b`
      vi.spyOn(localService, 'getProfile').mockResolvedValueOnce({
        id: mockUserId,
        username: 'instant_poet_9a2b',
        display_name: 'Instant Poet',
        bio: '',
        reading_goal: 12,
        books_read_count: 0,
        favorite_genres: [],
        privacy_settings: { profile_public: true, shelves_public: true, stats_public: false },
        avatar_config: getArchetypeAvatarConfig('classic_scholar') as any,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      vi.spyOn(localService, 'checkUsernameAvailable').mockResolvedValueOnce(true);

      const result = await localService.signup(
        'instant@deadpoets.club',
        'instant_poet',
        'Instant Poet',
        'secret_pass_123'
      );

      expect(result.emailConfirmationRequired).toBe(false);
      expect(result.session).not.toBeNull();
      expect(result.session?.token).toBe('genuine_supabase_jwt_token');
      // Assigned username picked up the collision suffix from DB profile
      expect(result.user.username).toBe('instant_poet_9a2b');
    });
  });

  describe('3. Work UUID and Legacy Code Resolution', () => {
    it('resolves legacy code "b1" to canonical UUID "1adf1d09-65fe-5899-90e2-ecb3d558be9f"', async () => {
      const uuid = await localService.getWorkUuidForBookId('b1');
      expect(uuid).toBe('1adf1d09-65fe-5899-90e2-ecb3d558be9f');
    });

    it('passes through an already-valid UUID without alteration', async () => {
      const existingUuid = '1adf1d09-65fe-5899-90e2-ecb3d558be9f';
      const resolved = await localService.getWorkUuidForBookId(existingUuid);
      expect(resolved).toBe(existingUuid);
    });

    it('resolves canonical UUID back to legacy code "b1"', async () => {
      const legacy = await localService.getLegacyCodeForWorkId('1adf1d09-65fe-5899-90e2-ecb3d558be9f');
      expect(legacy).toBe('b1');
    });
  });

  describe('4. Shelves CRUD & Date Tracking', () => {
    it('sets started_at date when status becomes currently_reading', async () => {
      const userId = 'demo_poet_001';
      const item = await localService.setBookShelf(userId, 'b2', 'currently_reading');

      expect(item.status).toBe('currently_reading');
      expect(item.started_at).toBeDefined();
      expect(item.started_at).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('sets finished_at date when status becomes read', async () => {
      const userId = 'demo_poet_001';
      const item = await localService.setBookShelf(userId, 'b2', 'read');

      expect(item.status).toBe('read');
      expect(item.finished_at).toBeDefined();
      expect(item.finished_at).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('resets finished_at when moving from read back to want_to_read', async () => {
      const userId = 'demo_poet_001';
      await localService.setBookShelf(userId, 'b2', 'read');
      const updated = await localService.setBookShelf(userId, 'b2', 'want_to_read');

      expect(updated.status).toBe('want_to_read');
      const shelves = await localService.getUserShelves(userId);
      const b2 = shelves.find(s => s.book_id === 'b2');
      expect(b2?.finished_at).toBeUndefined();
    });

    it('removes a book from user shelves cleanly', async () => {
      const userId = 'demo_poet_001';
      await localService.setBookShelf(userId, 'b3', 'currently_reading');

      let shelves = await localService.getUserShelves(userId);
      expect(shelves.some(s => s.book_id === 'b3')).toBe(true);

      await localService.removeBookShelf(userId, 'b3');
      shelves = await localService.getUserShelves(userId);
      expect(shelves.some(s => s.book_id === 'b3')).toBe(false);
    });
  });

  describe('5. Guest vs Authenticated User Isolation', () => {
    it('persists guest shelves solely in safeStorage without calling Supabase', async () => {
      if (!isSupabaseConfigured || !supabase) return;

      const fromSpy = vi.spyOn(supabase, 'from');
      const guestId = 'demo_poet_001'; // Mock/guest ID (non-UUID)

      await localService.setBookShelf(guestId, 'b1', 'currently_reading');

      // Guest operations must never attempt remote Supabase shelves table queries
      const shelvesTableCalls = fromSpy.mock.calls.filter(call => call[0] === 'shelves');
      expect(shelvesTableCalls.length).toBe(0);
    });

    it('routes authenticated Supabase user (UUID) to remote shelves table with work_id', async () => {
      if (!isSupabaseConfigured || !supabase) return;

      const authUserId = '00000000-0000-0000-0000-000000000001';
      const upsertMock = vi.fn().mockResolvedValue({ data: null, error: null });

      vi.spyOn(supabase, 'from').mockImplementation(((table: string) => {
        if (table === 'shelves') {
          return { upsert: upsertMock } as any;
        }
        if (table === 'works') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { id: '1adf1d09-65fe-5899-90e2-ecb3d558be9f', legacy_code: 'b1' },
                  error: null,
                }),
              }),
            }),
          } as any;
        }
        return {} as any;
      }) as any);

      await localService.setBookShelf(authUserId, 'b1', 'currently_reading');

      expect(upsertMock).toHaveBeenCalled();
      const payload = upsertMock.mock.calls[0][0];
      const conflictOpts = upsertMock.mock.calls[0][1];

      // Verifies correct schema columns: user_id and work_id (NOT book_id!)
      expect(payload.user_id).toBe(authUserId);
      expect(payload.work_id).toBe('1adf1d09-65fe-5899-90e2-ecb3d558be9f');
      expect(payload.status).toBe('currently_reading');
      expect(conflictOpts?.onConflict).toBe('user_id,work_id');
    });

    it('throws error and does not silently swallow remote database errors for authenticated users', async () => {
      if (!isSupabaseConfigured || !supabase) return;

      const authUserId = '00000000-0000-0000-0000-000000000001';
      vi.spyOn(supabase, 'from').mockImplementation(((table: string) => {
        if (table === 'shelves') {
          return {
            upsert: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'permission denied for table shelves' },
            }),
          } as any;
        }
        if (table === 'works') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { id: '1adf1d09-65fe-5899-90e2-ecb3d558be9f', legacy_code: 'b1' },
                  error: null,
                }),
              }),
            }),
          } as any;
        }
        return {} as any;
      }) as any);

      await expect(
        localService.setBookShelf(authUserId, 'b1', 'currently_reading')
      ).rejects.toThrow(/Sanctuary archive error/);
    });
  });
});
