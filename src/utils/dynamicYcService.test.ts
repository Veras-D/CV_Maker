import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  cleanCompanyKey, 
  isDynamicYcBusiness, 
  fetchLiveYcDirectory
} from './dynamicYcService';

describe('dynamicYcService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('cleanCompanyKey', () => {
    it('normalizes alphanumeric text and removes punctuation', () => {
      expect(cleanCompanyKey('Eight Sleep, Inc.')).toBe('eightsleepinc');
      expect(cleanCompanyKey('Scale AI')).toBe('scaleai');
      expect(cleanCompanyKey('GitLab')).toBe('gitlab');
      expect(cleanCompanyKey('Field-AI')).toBe('fieldai');
    });
  });

  describe('isDynamicYcBusiness', () => {
    it('matches known YC businesses from seed watchlist', () => {
      expect(isDynamicYcBusiness('Stripe')).toBe(true);
      expect(isDynamicYcBusiness('GitLab')).toBe(true);
      expect(isDynamicYcBusiness('Reddit')).toBe(true);
    });

    it('strips common corporate suffixes to match base company name', () => {
      // Seed watchlist has Stripe, Reddit, etc.
      expect(isDynamicYcBusiness('Stripe, Inc.')).toBe(true);
      expect(isDynamicYcBusiness('Reddit LLC')).toBe(true);
      expect(isDynamicYcBusiness('GitLab Corp')).toBe(true);
    });

    it('returns false for non-YC businesses', () => {
      expect(isDynamicYcBusiness('Catawiki')).toBe(false);
      expect(isDynamicYcBusiness('Random Nonexistent Corp')).toBe(false);
      expect(isDynamicYcBusiness('')).toBe(false);
    });
  });

  describe('fetchLiveYcDirectory', () => {
    it('replaces active YC set strictly with live feed data', async () => {
      const mockLiveFeed = [
        { name: 'Live Startup One', slug: 'live-startup-one' },
        { name: 'Brand New YC Co', slug: 'brand-new-yc-co', former_names: ['Old Co Name'] }
      ];

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockLiveFeed
      } as Response);

      const keys = await fetchLiveYcDirectory(true);

      // Verify the new startup is now marked as YC
      expect(keys.has('livestartupone')).toBe(true);
      expect(keys.has('brandnewycco')).toBe(true);
      expect(keys.has('oldconame')).toBe(true);

      expect(isDynamicYcBusiness('Brand New YC Co')).toBe(true);
      expect(isDynamicYcBusiness('Live Startup One Inc')).toBe(true);
      expect(isDynamicYcBusiness('Old Co Name')).toBe(true);
    });
  });
});
