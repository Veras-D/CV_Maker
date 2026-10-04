import { describe, it, expect } from 'vitest';
import { 
  isStrictlyRemote, 
  detectContractDuration, 
  parseSalaryRange, 
  filterRemoteJobs,
  detectJobRegion
} from './jobFilterEngine';
import { RemoteJob, JobSearchFiltersState } from '../types/jobSearch';
import { KanbanRole } from '../types/cv';

describe('jobFilterEngine - Detection and Parsing', () => {
  describe('isStrictlyRemote', () => {
    it('identifies valid remote keywords in location string', () => {
      expect(isStrictlyRemote('Remote - Worldwide')).toBe(true);
      expect(isStrictlyRemote('US (Remote)')).toBe(true);
      expect(isStrictlyRemote('Anywhere')).toBe(true);
      expect(isStrictlyRemote('Virtual')).toBe(true);
      expect(isStrictlyRemote('Distributed Team')).toBe(true);
    });

    it('rejects on-site or hybrid locations unless overridden by workplaceType', () => {
      expect(isStrictlyRemote('San Francisco, CA')).toBe(false);
      expect(isStrictlyRemote('London, UK (Onsite)')).toBe(false);
      expect(isStrictlyRemote('Remote', 'inperson')).toBe(false);
      expect(isStrictlyRemote('Remote', 'onsite')).toBe(false);
    });

    it('honors workplaceType remote even if location is general', () => {
      expect(isStrictlyRemote('Berlin, Germany', 'remote')).toBe(true);
    });
  });

  describe('detectContractDuration', () => {
    it('detects 1 month contracts', () => {
      const res = detectContractDuration('Frontend Engineer - 1 month contract', 'Short project');
      expect(res.duration).toBe('1mo');
      expect(res.label).toBe('1 Mo');
    });

    it('detects 1-3 months contracts', () => {
      const res = detectContractDuration('React Dev', 'Duration: 3 months contract');
      expect(res.duration).toBe('1-3mo');
      expect(res.label).toBe('1–3 Mo');
    });

    it('detects 3-6 months contracts', () => {
      const res = detectContractDuration('Backend Engineer (6 months)', 'Contract position');
      expect(res.duration).toBe('3-6mo');
      expect(res.label).toBe('3–6 Mo');
    });

    it('detects 6+ months contracts', () => {
      const res = detectContractDuration('DevOps Lead', 'Initial 1-year contract');
      expect(res.duration).toBe('6mo+');
      expect(res.label).toBe('6+ Mo');
    });

    it('returns empty for permanent full-time roles without duration', () => {
      const res = detectContractDuration('Senior Staff Engineer', 'Permanent full-time role with equity');
      expect(res.duration).toBeUndefined();
    });
  });

  describe('parseSalaryRange', () => {
    it('parses annual salary range with USD', () => {
      const parsed = parseSalaryRange('$120,000 - $150,000 / year');
      expect(parsed.minSalary).toBe(120000);
      expect(parsed.maxSalary).toBe(150000);
      expect(parsed.currency).toBe('USD');
    });

    it('parses k notation', () => {
      const parsed = parseSalaryRange('€80k - €110k');
      expect(parsed.minSalary).toBe(80000);
      expect(parsed.maxSalary).toBe(110000);
      expect(parsed.currency).toBe('EUR');
    });

    it('annualizes hourly rates', () => {
      const parsed = parseSalaryRange('$50 - $75 / hr');
      expect(parsed.minSalary).toBe(100000);
      expect(parsed.maxSalary).toBe(150000);
      expect(parsed.currency).toBe('USD');
    });

    it('detects GBP currency', () => {
      const parsed = parseSalaryRange('£60,000 - £80,000');
      expect(parsed.currency).toBe('GBP');
    });
  });

  describe('detectJobRegion', () => {
    it('detects worldwide regions', () => {
      expect(detectJobRegion('Worldwide')).toBe('worldwide');
      expect(detectJobRegion('Global / Anywhere')).toBe('worldwide');
    });

    it('detects regional locations', () => {
      expect(detectJobRegion('New York, NY, USA')).toBe('us');
      expect(detectJobRegion('Berlin, Germany')).toBe('eu');
      expect(detectJobRegion('Tokyo, Japan')).toBe('apac');
    });
  });
});

describe('jobFilterEngine - Remote Filtering', () => {
  const mockJobs: RemoteJob[] = [
    {
      id: 'job-1',
      title: 'Senior TypeScript Engineer',
      company: 'Stripe',
      source: 'greenhouse',
      url: 'https://stripe.com/jobs/1',
      location: 'Remote - Worldwide',
      region: 'worldwide',
      publishedAt: new Date().toISOString(),
      employmentType: 'full-time',
      descriptionPlain: 'Senior TypeScript engineer at Stripe building payments infra.',
      isYc: true
    },
    {
      id: 'job-2',
      title: 'Full Stack Contractor',
      company: 'Acme Corp',
      source: 'remotive',
      url: 'https://remotive.com/jobs/2',
      location: 'Remote - US',
      region: 'us',
      publishedAt: new Date().toISOString(),
      employmentType: 'contract',
      contractDuration: '3-6mo',
      descriptionPlain: 'Contract role building fullstack react apps.',
      isYc: false
    }
  ];

  const defaultFilters: JobSearchFiltersState = {
    query: '',
    postedTime: 'any',
    region: 'any',
    sources: {
      ashby: true,
      greenhouse: true,
      lever: true,
      smartrecruiters: true,
      remotive: true,
      jobicy: true
    },
    minSalary: 0,
    hideApplied: false,
    employmentType: 'all',
    contractDuration: 'all'
  };

  it('filters by dynamic YC query', () => {
    const filtered = filterRemoteJobs({
      jobs: mockJobs,
      filters: { ...defaultFilters, query: 'yc' },
      kanbanRoles: []
    });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].company).toBe('Stripe');
  });

  it('filters by employment type contract', () => {
    const filtered = filterRemoteJobs({
      jobs: mockJobs,
      filters: { ...defaultFilters, employmentType: 'contract' },
      kanbanRoles: []
    });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].title).toBe('Full Stack Contractor');
  });

  it('filters out applied jobs when hideApplied is true', () => {
    const kanbanRoles: KanbanRole[] = [
      {
        id: 'role-1',
        roleTitle: 'Senior TypeScript Engineer',
        company: 'Stripe',
        location: 'Remote - Worldwide',
        status: 'applied',
        dateApplied: '2026-10-01',
        updatedAt: '2026-10-01'
      }
    ];

    const filtered = filterRemoteJobs({
      jobs: mockJobs,
      filters: { ...defaultFilters, hideApplied: true },
      kanbanRoles
    });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].company).toBe('Acme Corp');
  });
});
