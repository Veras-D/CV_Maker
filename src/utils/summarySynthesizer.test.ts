import { describe, it, expect } from 'vitest';
import {
  cleanJobTitle,
  estimateCareerYears,
  getCandidateMatchedSkills,
  synthesizeExecutiveSummaryByStyle,
  generateExecutiveSummaryVariants,
  synthesizeExecutiveSummary
} from './summarySynthesizer';
import { CVData, createEmptyCVData } from '../types/cv';

const mockCV: CVData = {
  ...createEmptyCVData(),
  profile: {
    ...createEmptyCVData().profile,
    name: 'Jane Doe',
    headline: { en: 'Senior Software Engineer' },
    summary: {
      en: 'Passionate and dedicated engineer with a strong foundation in distributed systems, event-driven architectures, and high-throughput pipelines.',
      cs: 'Zkušená vývojářka se zaměřením na distribuované systémy a vysokou spolehlivost.'
    },
    email: 'jane@example.com',
    location: 'Prague'
  },
  experiences: [
    {
      id: 'exp-1',
      roleTitle: { en: 'Senior Backend Engineer' },
      company: 'TechCorp',
      startDate: '2020-03',
      endDate: 'Present',
      bullets: [],
      tags: ['TypeScript', 'Node.js', 'PostgreSQL', 'Docker'],
      enabled: true
    },
    {
      id: 'exp-2',
      roleTitle: { en: 'Software Developer' },
      company: 'EarlyStage',
      startDate: '2017-06',
      endDate: '2020-02',
      bullets: [],
      tags: ['JavaScript', 'React', 'MongoDB'],
      enabled: true
    },
    {
      id: 'exp-3',
      roleTitle: { en: 'Intern' },
      company: 'OldCompany',
      startDate: '2010-01',
      endDate: '2011-01',
      bullets: [],
      tags: ['C++'],
      enabled: false // disabled should be ignored
    }
  ],
  skillCategories: [
    {
      id: 'cat-1',
      categoryName: { en: 'Backend' },
      skills: [
        { id: 's1', name: 'Node.js', tags: ['backend'], enabled: true },
        { id: 's2', name: 'TypeScript', tags: ['lang'], enabled: true },
        { id: 's3', name: 'PostgreSQL', tags: ['db'], enabled: true },
        { id: 's4', name: 'Docker', tags: ['devops'], enabled: true }
      ]
    }
  ]
};

describe('summarySynthesizer - cleanJobTitle', () => {
  it('strips noisy parentheticals, tech stack lists, and location suffixes', () => {
    const raw = 'Senior Backend Engineer (Go/Kubernetes, Remote - US) - Payments';
    expect(cleanJobTitle(raw)).toBe('Senior Backend Engineer');
  });

  it('strips bracketed tags and hiring gender designations', () => {
    const raw = 'Staff Platform Engineer [K8s/AWS] (m/f/d)';
    expect(cleanJobTitle(raw)).toBe('Staff Platform Engineer');
  });

  it('strips trailing remote and hybrid indicators', () => {
    expect(cleanJobTitle('Full Stack Engineer - Remote')).toBe('Full Stack Engineer');
    expect(cleanJobTitle('QA Automation Engineer | Hybrid')).toBe('QA Automation Engineer');
    expect(cleanJobTitle('DevOps Specialist / On-site')).toBe('DevOps Specialist');
  });

  it('leaves already clean titles intact', () => {
    expect(cleanJobTitle('Software Engineer')).toBe('Software Engineer');
    expect(cleanJobTitle('Engineering Manager')).toBe('Engineering Manager');
    expect(cleanJobTitle('Vývojář software')).toBe('Vývojář software');
  });

  it('handles empty or blank titles with sensible fallback', () => {
    expect(cleanJobTitle('')).toBe('Software Engineer');
    expect(cleanJobTitle('   ')).toBe('Software Engineer');
  });
});

describe('summarySynthesizer - estimateCareerYears', () => {
  it('calculates career years based on earliest enabled start date', () => {
    const years = estimateCareerYears(mockCV);
    const expected = new Date().getFullYear() - 2017;
    expect(years).toBe(expected);
  });

  it('returns 0 when experiences have no parseable start dates', () => {
    const emptyCV: CVData = {
      ...mockCV,
      experiences: []
    };
    expect(estimateCareerYears(emptyCV)).toBe(0);
  });
});

describe('summarySynthesizer - getCandidateMatchedSkills', () => {
  it('filters matched keywords to genuine candidate skills', () => {
    const matched = ['node.js', 'typescript', 'rust', 'c#', 'postgresql'];
    const verified = getCandidateMatchedSkills(mockCV, matched, 'Backend Engineer');
    expect(verified).toContain('Node.js');
    expect(verified).toContain('TypeScript');
    expect(verified).toContain('PostgreSQL');
    expect(verified).not.toContain('Rust'); // Candidate does not have Rust
  });

  it('avoids duplicating role title words and generic nouns', () => {
    const matched = ['engineer', 'software', 'testing', 'docker'];
    const verified = getCandidateMatchedSkills(mockCV, matched, 'Software Engineer');
    expect(verified).toContain('Docker');
    expect(verified).not.toContain('engineer');
    expect(verified).not.toContain('software');
  });
});

describe('summarySynthesizer - executive summary synthesis', () => {
  it('authentic style preserves authentic master summary without destructive regex replacement', () => {
    const summary = synthesizeExecutiveSummaryByStyle('authentic', {
      cvData: mockCV,
      jobTitle: 'Lead QA Engineer',
      matchedTags: ['testing'],
      matchedKeywords: ['cypress'],
      language: 'en'
    });
    // Must NOT replace the opening with "Lead QA Engineer" and mutilate the sentence!
    expect(summary).toBe(mockCV.profile.summary.en);
    expect(summary).toContain('Passionate and dedicated engineer');
  });

  it('technical style synthesizes architecture and code quality focus', () => {
    const summary = synthesizeExecutiveSummaryByStyle('technical', {
      cvData: mockCV,
      jobTitle: 'Senior Backend Engineer (Go/AWS) - Core Payments',
      matchedTags: ['backend', 'cloud'],
      matchedKeywords: ['node.js', 'typescript', 'docker'],
      language: 'en'
    });
    expect(summary).toContain('Senior Backend Engineer');
    expect(summary).toContain('technical depth');
    expect(summary).toContain('architecting resilient distributed systems');
    expect(summary).toContain('Node.js');
  });

  it('impact style synthesizes delivery velocity and business outcomes focus', () => {
    const summary = synthesizeExecutiveSummaryByStyle('impact', {
      cvData: mockCV,
      jobTitle: 'Senior Full-Stack Engineer',
      matchedTags: ['backend'],
      matchedKeywords: ['node.js', 'typescript'],
      language: 'en'
    });
    expect(summary).toContain('Senior Full-Stack Engineer');
    expect(summary).toContain('Impact-focused');
    expect(summary).toContain('product velocity');
    expect(summary).toContain('complex requirements into tangible outcomes');
  });

  it('generates grounded synthesis when candidate has no existing master summary', () => {
    const cvWithoutSummary: CVData = {
      ...mockCV,
      profile: {
        ...mockCV.profile,
        summary: { en: '', cs: '' }
      }
    };
    const summary = synthesizeExecutiveSummaryByStyle('authentic', {
      cvData: cvWithoutSummary,
      jobTitle: 'DevOps Engineer - Infrastructure',
      matchedTags: ['devops'],
      matchedKeywords: ['docker'],
      language: 'en'
    });
    expect(summary).toContain('Results-driven DevOps Engineer');
    expect(summary).toContain('Docker');
  });

  it('supports Czech language synthesis cleanly', () => {
    const cvWithoutSummary: CVData = {
      ...mockCV,
      profile: {
        ...mockCV.profile,
        summary: { en: '', cs: '' }
      }
    };
    const summaryCs = synthesizeExecutiveSummaryByStyle('technical', {
      cvData: cvWithoutSummary,
      jobTitle: 'Backend Vývojář',
      matchedTags: ['backend'],
      matchedKeywords: ['node.js'],
      language: 'cs'
    });
    expect(summaryCs).toContain('Backend Vývojář');
    expect(summaryCs).toContain('architekturu odolných systémů');
    expect(summaryCs).toContain('Node.js');
  });

  it('generateExecutiveSummaryVariants provides all 3 archetypes', () => {
    const variants = generateExecutiveSummaryVariants({
      cvData: mockCV,
      jobTitle: 'Principal Engineer',
      matchedTags: ['backend'],
      matchedKeywords: ['typescript'],
      language: 'en'
    });
    expect(variants.authentic).toBeDefined();
    expect(variants.technical).toBeDefined();
    expect(variants.impact).toBeDefined();
    expect(variants.authentic).toBe(mockCV.profile.summary.en);
    expect(variants.technical).toContain('technical depth');
    expect(variants.impact).toContain('Impact-focused');
  });

  it('synthesizeExecutiveSummary retains backwards compatibility', () => {
    const summary = synthesizeExecutiveSummary({
      cvData: mockCV,
      primaryRole: 'Software Engineer',
      matchedTags: ['backend'],
      matchedKeywords: ['node.js'],
      language: 'en'
    });
    expect(summary).toBe(mockCV.profile.summary.en);
  });
});
