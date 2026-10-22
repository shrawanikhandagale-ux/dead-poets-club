import { describe, it, expect, beforeEach } from 'vitest';
import { localService, safeStorage } from '../lib/supabase';
import { DEFAULT_AVATAR_CONFIG, AvatarConfig } from '../types/profile';

describe('Pixel RPG Avatar System & Multi-User Persistence', () => {
  beforeEach(() => {
    localService.resetStorage();
  });

  describe('1. Default Avatar Configuration & Sensible Fallbacks', () => {
    it('initializes default profile with valid RPG avatar attributes', () => {
      expect(DEFAULT_AVATAR_CONFIG).toBeDefined();
      expect(DEFAULT_AVATAR_CONFIG.skinTone).toBe('#EAD4BA');
      expect(DEFAULT_AVATAR_CONFIG.hairStyle).toBe('shaggy_mess');
      expect(DEFAULT_AVATAR_CONFIG.top).toBe('oversized_tee');
      expect(DEFAULT_AVATAR_CONFIG.bottom).toBe('cargo_pants');
      expect(DEFAULT_AVATAR_CONFIG.shoes).toBe('combat_boots');
      expect(DEFAULT_AVATAR_CONFIG.heldItem).toBe('antique_book');
      expect(DEFAULT_AVATAR_CONFIG.equippedBadge).toBe('secret_society_key');
      expect(DEFAULT_AVATAR_CONFIG.mbti).toBe('INTJ');
      expect(DEFAULT_AVATAR_CONFIG.configured).toBe(false);
    });

    it('newly registered user gets configured: false flag for first-time atelier redirect', async () => {
      const { user } = await localService.signup(
        'walt@whitman.org',
        'leaves_of_grass',
        'Walt Whitman'
      );

      const profile = await localService.getProfile(user.id);
      expect(profile).toBeDefined();
      expect(profile?.avatar_config.configured).toBe(false);
      expect(profile?.avatar_config.hairStyle).toBe('shaggy_mess');
      expect(profile?.avatar_config.heldItem).toBe('antique_book');
    });
  });

  describe('2. User Persistence & Avatar Customization', () => {
    it('persists customized sprite configuration across profile updates and subsequent fetches', async () => {
      const { user } = await localService.signup(
        'emily@dickinson.org',
        'amherst_recluse',
        'Emily Dickinson'
      );

      const customizedAvatar: Partial<AvatarConfig> = {
        skinTone: '#FFF0E5',
        faceExpression: 'contemplative',
        facialDetails: 'freckles',
        hairStyle: 'classic_bob',
        hairColor: '#1A1614',
        top: 'turtleneck',
        topColor: '#1A1614',
        bottom: 'pleated_skirt',
        bottomColor: '#755151',
        outerwear: 'cozy_cardigan',
        outerwearColor: '#72583E',
        shoes: 'penny_loafers',
        shoesColor: '#1A1614',
        accessories: ['round_spectacles', 'french_beret'],
        heldItem: 'leather_journal',
        equippedBadge: 'quill_crest',
        mbti: 'INFP',
        configured: true,
      };

      await localService.updateProfile(user.id, {
        avatar_config: customizedAvatar as AvatarConfig,
      });

      // Fetch profile freshly
      const updated = await localService.getProfile(user.id);
      expect(updated?.avatar_config.configured).toBe(true);
      expect(updated?.avatar_config.hairStyle).toBe('classic_bob');
      expect(updated?.avatar_config.top).toBe('turtleneck');
      expect(updated?.avatar_config.bottom).toBe('pleated_skirt');
      expect(updated?.avatar_config.heldItem).toBe('leather_journal');
      expect(updated?.avatar_config.accessories).toContain('round_spectacles');
      expect(updated?.avatar_config.accessories).toContain('french_beret');
      expect(updated?.avatar_config.mbti).toBe('INFP');
    });

    it('preserves existing avatar configuration across logins without reset', async () => {
      const { user } = await localService.signup(
        'rimbaud@paris.org',
        'drunken_boat',
        'Arthur Rimbaud'
      );

      // Customize avatar
      await localService.updateProfile(user.id, {
        avatar_config: {
          ...DEFAULT_AVATAR_CONFIG,
          hairStyle: 'poet_curls',
          hairColor: '#8D3F37',
          heldItem: 'steaming_coffee',
          configured: true,
        },
      });

      // Clear session (simulating logout)
      localService.clearSession();
      expect(localService.getSession()).toBeNull();

      // Log back in
      const loginRes = await localService.login('drunken_boat');
      expect(loginRes.user.id).toBe(user.id);

      // Verify avatar remained intact
      const refreshedProfile = await localService.getProfile(user.id);
      expect(refreshedProfile?.avatar_config.hairStyle).toBe('poet_curls');
      expect(refreshedProfile?.avatar_config.hairColor).toBe('#8D3F37');
      expect(refreshedProfile?.avatar_config.heldItem).toBe('steaming_coffee');
      expect(refreshedProfile?.avatar_config.configured).toBe(true);
    });
  });

  describe('3. Multi-User Isolation & Security', () => {
    it('ensures User A cannot overwrite User B avatar configuration', async () => {
      // User A
      const userA = await localService.signup('userA@club.org', 'poet_alpha', 'Poet Alpha');
      // User B
      const userB = await localService.signup('userB@club.org', 'poet_beta', 'Poet Beta');

      // User A sets a specific avatar
      await localService.updateProfile(userA.user.id, {
        avatar_config: {
          ...DEFAULT_AVATAR_CONFIG,
          hairStyle: 'pixie',
          top: 'striped_longsleeve',
          configured: true,
        },
      });

      // User B sets a different avatar
      await localService.updateProfile(userB.user.id, {
        avatar_config: {
          ...DEFAULT_AVATAR_CONFIG,
          hairStyle: 'side_part',
          top: 'button_oxford',
          configured: true,
        },
      });

      // Verify User A profile was not modified by User B's update
      const freshA = await localService.getProfile(userA.user.id);
      const freshB = await localService.getProfile(userB.user.id);

      expect(freshA?.avatar_config.hairStyle).toBe('pixie');
      expect(freshA?.avatar_config.top).toBe('striped_longsleeve');

      expect(freshB?.avatar_config.hairStyle).toBe('side_part');
      expect(freshB?.avatar_config.top).toBe('button_oxford');
    });
  });

  describe('4. Backward Compatibility & System Integrity', () => {
    it('gracefully normalizes legacy profiles that only had baseId and pose', async () => {
      // Directly simulate a legacy record in storage
      const profiles = localService.getProfiles();
      const legacyProfile = {
        ...profiles[0],
        id: 'legacy_user_777',
        username: 'legacy_reader',
        avatar_config: {
          baseId: 'classic_scholar',
          pose: 'reading',
        } as any,
      };
      profiles.push(legacyProfile);
      safeStorage.setItem('dpc_profiles', JSON.stringify(profiles));

      const retrieved = await localService.getProfile('legacy_user_777');
      expect(retrieved).toBeDefined();
      // Verifies fallback normalization populated missing fields
      expect(retrieved?.avatar_config.skinTone).toBe(DEFAULT_AVATAR_CONFIG.skinTone);
      expect(retrieved?.avatar_config.hairStyle).toBe(DEFAULT_AVATAR_CONFIG.hairStyle);
      expect(retrieved?.avatar_config.top).toBe(DEFAULT_AVATAR_CONFIG.top);
      expect(retrieved?.avatar_config.baseId).toBe('classic_scholar');
    });
  });
});
