import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  cleanCompanyKey, 
  isDynamicYcBusiness, 
  fetchLiveYcDirectory,
  searchLiveDirectory
} from './dynamicYcService';
import { extractAtsAndSlugFromUrl, generateCandidateSlugs } from './companyWatchlistService';

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

  describe('searchLiveDirectory', () => {
    it('finds companies by name or slug query', () => {
      const results = searchLiveDirectory('Startup');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.slug === 'live-startup-one')).toBe(true);
    });

    it('returns empty array when query is under 2 characters', () => {
      expect(searchLiveDirectory('')).toEqual([]);
      expect(searchLiveDirectory('a')).toEqual([]);
    });
  });

  describe('extractAtsAndSlugFromUrl', () => {
    it('extracts slug and ATS from greenhouse, ashby, lever, smartrecruiters URLs', () => {
      expect(extractAtsAndSlugFromUrl('https://boards.greenhouse.io/thoughtworks')).toEqual({
        slug: 'thoughtworks',
        ats: 'greenhouse'
      });
      expect(extractAtsAndSlugFromUrl('https://boards.greenhouse.io/embed/job_board?for=stripe')).toEqual({
        slug: 'stripe',
        ats: 'greenhouse'
      });
      expect(extractAtsAndSlugFromUrl('https://jobs.ashbyhq.com/openai/positions')).toEqual({
        slug: 'openai',
        ats: 'ashby'
      });
      expect(extractAtsAndSlugFromUrl('https://jobs.lever.co/spotify/123')).toEqual({
        slug: 'spotify',
        ats: 'lever'
      });
      expect(extractAtsAndSlugFromUrl('https://careers.smartrecruiters.com/canva')).toEqual({
        slug: 'canva',
        ats: 'smartrecruiters'
      });
    });

    it('returns null for non-ATS or invalid URLs', () => {
      expect(extractAtsAndSlugFromUrl('https://google.com')).toBeNull();
      expect(extractAtsAndSlugFromUrl('just a company name')).toBeNull();
    });
  });

  describe('generateCandidateSlugs', () => {
    it('generates clean slug candidates stripping corporate suffixes and punctuation', () => {
      const candidates = generateCandidateSlugs('Vacuumlabs, s.r.o.');
      expect(candidates).toContain('vacuumlabs');
      const dataCandidates = generateCandidateSlugs('Databricks Inc.');
      expect(dataCandidates).toContain('databricks');
    });

    it('returns empty array for empty or single char input', () => {
      expect(generateCandidateSlugs('')).toEqual([]);
      expect(generateCandidateSlugs('a')).toEqual([]);
    });
  });
});

