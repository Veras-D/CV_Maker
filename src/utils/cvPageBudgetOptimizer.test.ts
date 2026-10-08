import { describe, it, expect } from 'vitest';
import { optimizeCVPageBudget } from './cvPageBudgetOptimizer';
import { USABLE_PAGE_HEIGHT_MM } from './pdfLayoutEstimator';
import { CVData, WorkExperience, createEmptyCVData } from '../types/cv';

function createMockCVData(numExperiences: number = 2): CVData {
  const base = createEmptyCVData();
  const experiences: WorkExperience[] = [];
  for (let i = 0; i < numExperiences; i++) {
    experiences.push({
      id: `exp-${i}`,
      roleTitle: { en: `Software Engineer ${i}`, cs: `Vývojář ${i}` },
      company: `Tech Corp ${i}`,
      location: 'Remote',
      startDate: `${2020 + i}-01`,
      endDate: `${2021 + i}-01`,
      summary: { en: `Summary for role ${i}`, cs: '' },
      enabled: true,
      tags: [],
      bullets: [
        { id: `b-${i}-1`, text: { en: `Engineered scalable cloud platform features ${i}`, cs: '' }, enabled: true, tags: [] },
        { id: `b-${i}-2`, text: { en: `Optimized database performance and latency ${i}`, cs: '' }, enabled: true, tags: [] },
        { id: `b-${i}-3`, text: { en: `Collaborated with cross-functional product teams ${i}`, cs: '' }, enabled: true, tags: [] },
        { id: `b-${i}-4`, text: { en: `Mentored junior engineers and led code reviews ${i}`, cs: '' }, enabled: true, tags: [] }
      ]
    });
  }

  return {
    ...base,
    profile: {
      name: 'Jane Doe',
      headline: { en: 'Staff Full-Stack Engineer', cs: '' },
      summary: { en: 'Experienced engineer passionate about distributed systems and cloud architecture.', cs: '' },
      email: 'jane@example.com',
      phone: '+1 555-0199',
      location: 'Prague, CZ',
      githubUrl: 'https://github.com/janedoe',
      linkedinUrl: 'https://linkedin.com/in/janedoe',
      portfolioUrl: 'https://janedoe.dev'
    },
    experiences,
    skillCategories: [
      {
        id: 'cat-1',
        categoryName: { en: 'Languages', cs: 'Jazyky' },
        skills: [
          { id: 's1', name: 'TypeScript', enabled: true, tags: [] },
          { id: 's2', name: 'Python', enabled: true, tags: [] },
          { id: 's3', name: 'Go', enabled: true, tags: [] },
          { id: 's4', name: 'Rust', enabled: true, tags: [] }
        ]
      },
      {
        id: 'cat-2',
        categoryName: { en: 'Frameworks', cs: '' },
        skills: [
          { id: 's5', name: 'React', enabled: true, tags: [] } // Only 1 skill -> should be pruned (< 3)
        ]
      }
    ],
    projects: [
      {
        id: 'p1',
        title: 'Cloud Orchestrator',
        description: { en: 'Distributed workflow engine built with Go and Kubernetes', cs: '' },
        techStack: ['Go', 'Docker', 'Kubernetes'],
        enabled: true,
        tags: []
      },
      {
        id: 'p2',
        title: 'Personal Portfolio',
        description: { en: 'Static personal site built with Astro', cs: '' },
        techStack: ['Astro', 'HTML'],
        enabled: true,
        tags: []
      }
    ],
    education: [
      {
        id: 'edu-1',
        institution: 'Charles University',
        program: { en: 'M.Sc. in Computer Science', cs: '' },
        dates: '2016 – 2021', // 5 years duration, CS degree -> Top candidate
        enabled: true
      },
      {
        id: 'edu-2',
        institution: 'Czech Technical University',
        program: { en: 'B.Sc. in Software Engineering', cs: '' },
        dates: '2013 – 2016', // 3 years duration -> 2nd candidate
        enabled: true
      },
      {
        id: 'edu-3',
        institution: 'Online Academy',
        program: { en: 'Frontend Certificate', cs: '' },
        dates: '2022 – 2022', // Short cert -> should be omitted (> 2 edu)
        enabled: true
      }
    ],
    languages: [
      { id: 'l1', language: { en: 'English', cs: 'Angličtina' }, proficiency: { en: 'Fluent', cs: 'Plynule' }, enabled: true }
    ],
    coverLetters: []
  };
}

describe('cvPageBudgetOptimizer', () => {
  it('does not prune or compact if CV naturally fits on 1 page', () => {
    const compactData = createMockCVData(1);
    compactData.projects = [];
    compactData.education = [compactData.education[0]];

    const { optimizedData, audit } = optimizeCVPageBudget({
      cvData: compactData,
      jobTitle: 'Senior Software Engineer',
      companyName: 'Stripe',
      jobDescription: 'Looking for a senior engineer with TypeScript and cloud experience.',
      matchedKeywords: ['typescript', 'cloud'],
      matchedTags: ['backend'],
      maxPages: 1
    });

    expect(audit.wasCompacted).toBe(false);
    expect(optimizedData.experiences[0].enabled).toBe(true);
  });

  it('enforces minimum 3 skills per competence category', () => {
    const data = createMockCVData(6);
    const { optimizedData, audit } = optimizeCVPageBudget({
      cvData: data,
      jobTitle: 'Senior Fullstack Engineer',
      companyName: 'Acme',
      jobDescription: 'TypeScript React Go developer',
      matchedKeywords: ['typescript', 'react', 'go'],
      matchedTags: ['fullstack'],
      maxPages: 1
    });

    // cat-1 has 4 skills -> kept
    expect(optimizedData.skillCategories[0].skills.some(s => s.enabled)).toBe(true);
    // cat-2 has only 1 skill -> all disabled because < 3 skills
    expect(optimizedData.skillCategories[1].skills.every(s => !s.enabled)).toBe(true);
    expect(audit.omittedSkillCategoriesCount).toBeGreaterThanOrEqual(1);
  });

  it('keeps top 2 education items (longest duration and most relevant) when user has > 2', () => {
    const data = createMockCVData(6);
    const { optimizedData, audit } = optimizeCVPageBudget({
      cvData: data,
      jobTitle: 'Backend Engineer',
      companyName: 'Acme',
      jobDescription: 'Software engineer degree required',
      matchedKeywords: ['software', 'computer'],
      matchedTags: ['backend'],
      maxPages: 1
    });

    const activeEdu = optimizedData.education.filter(e => e.enabled);
    expect(activeEdu.length).toBe(2);
    expect(activeEdu.some(e => e.id === 'edu-1')).toBe(true); // Charles University 5 yrs
    expect(activeEdu.some(e => e.id === 'edu-2')).toBe(true); // CTU 3 yrs
    expect(activeEdu.some(e => e.id === 'edu-3')).toBe(false); // short cert omitted
    expect(audit.omittedEducationCount).toBe(1);
  });

  it('keeps at least 1 project if possible when secondary projects are pruned', () => {
    const data = createMockCVData(4);
    const { optimizedData, audit } = optimizeCVPageBudget({
      cvData: data,
      jobTitle: 'Kubernetes Engineer',
      companyName: 'Acme',
      jobDescription: 'Go Docker Kubernetes',
      matchedKeywords: ['go', 'docker', 'kubernetes'],
      matchedTags: ['devops'],
      maxPages: 1
    });

    const activeProjects = optimizedData.projects.filter(p => p.enabled);
    expect(activeProjects.length).toBe(1);
    expect(activeProjects[0].id).toBe('p1'); // Cloud Orchestrator kept
    expect(audit.omittedProjectsCount).toBe(1); // p2 omitted
  });
});

describe('cvPageBudgetOptimizer - experience pruning & limits', () => {
  it('guarantees that jobs 0, 1, 2, and 3 (top 4 jobs) are 100% immune from being disabled', () => {
    const data = createMockCVData(7);
    const { optimizedData } = optimizeCVPageBudget({
      cvData: data,
      jobTitle: 'Software Engineer',
      companyName: 'Acme',
      jobDescription: 'Engineering vacancy',
      matchedKeywords: ['engineer'],
      matchedTags: ['backend'],
      maxPages: 1
    });

    expect(optimizedData.experiences[0].enabled).toBe(true);
    expect(optimizedData.experiences[1].enabled).toBe(true);
    expect(optimizedData.experiences[2].enabled).toBe(true);
    expect(optimizedData.experiences[3].enabled).toBe(true);
  });

  it('never omits any experience when user has 4 or fewer experiences', () => {
    const data = createMockCVData(4);
    const { optimizedData, audit } = optimizeCVPageBudget({
      cvData: data,
      jobTitle: 'Software Engineer',
      companyName: 'Acme',
      jobDescription: 'Engineering vacancy',
      matchedKeywords: ['engineer'],
      matchedTags: ['backend'],
      maxPages: 1
    });

    expect(optimizedData.experiences.filter(e => e.enabled).length).toBe(4);
    expect(audit.omittedExperiencesCount).toBe(0);
  });

  it('guarantees each enabled job retains at least 2 bullet points (or 1 in ultra-compact fallback)', () => {
    const data = createMockCVData(6);
    const { optimizedData } = optimizeCVPageBudget({
      cvData: data,
      jobTitle: 'Software Engineer',
      companyName: 'Acme',
      jobDescription: 'Engineering vacancy',
      matchedKeywords: ['cloud', 'latency'],
      matchedTags: ['backend'],
      maxPages: 1
    });

    const enabledExps = optimizedData.experiences.filter(e => e.enabled);
    for (const exp of enabledExps) {
      const activeBullets = exp.bullets.filter(b => b.enabled);
      expect(activeBullets.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('cuts unrelated older jobs beyond top 4 first before cutting a relevant older job', () => {
    const data = createMockCVData(4);
    // Add Job 4: Unrelated Barista role
    data.experiences.push({
      id: 'exp-4',
      roleTitle: { en: 'Barista & Coffee Roaster', cs: '' },
      company: 'Coffee House',
      location: 'Prague',
      startDate: '2019-01',
      endDate: '2020-01',
      summary: { en: 'Brewed coffee', cs: '' },
      enabled: true,
      tags: [],
      bullets: [
        { id: 'b41', text: { en: 'Served 200 espressos daily', cs: '' }, enabled: true, tags: [] },
        { id: 'b42', text: { en: 'Managed inventory and cash register', cs: '' }, enabled: true, tags: [] },
        { id: 'b43', text: { en: 'Cleaned espresso machines', cs: '' }, enabled: true, tags: [] }
      ]
    });
    // Add Job 5: Relevant React Native Developer role
    data.experiences.push({
      id: 'exp-5',
      roleTitle: { en: 'React Native Mobile Developer', cs: '' },
      company: 'App Studio',
      location: 'Remote',
      startDate: '2017-01',
      endDate: '2019-01',
      summary: { en: 'Built mobile apps', cs: '' },
      enabled: true,
      tags: [],
      bullets: [
        { id: 'b51', text: { en: 'Developed React Native iOS and Android apps with TypeScript', cs: '' }, enabled: true, tags: [] },
        { id: 'b52', text: { en: 'Published cross-platform features to App Store', cs: '' }, enabled: true, tags: [] }
      ]
    });

    const { optimizedData, audit } = optimizeCVPageBudget({
      cvData: data,
      jobTitle: 'React Native Developer',
      companyName: 'Fintech App',
      jobDescription: 'React Native Mobile Developer with TypeScript experience',
      matchedKeywords: ['react native', 'typescript', 'mobile'],
      matchedTags: ['frontend'],
      maxPages: 1
    });

    // If space required pruning beyond 4 jobs, exp-4 (Barista) should be cut before exp-5 (React Native)!
    expect(audit.omittedExperiencesCount).toBeGreaterThanOrEqual(1);
    expect(audit.omittedExperiences[0]).toContain('Barista');
    expect(optimizedData.experiences.find(e => e.id === 'exp-4')?.enabled).toBe(false);
  });

  it('respects 2-page budget limit when maxPages is 2', () => {
    const data = createMockCVData(6);
    const { audit } = optimizeCVPageBudget({
      cvData: data,
      jobTitle: 'Software Engineer',
      companyName: 'Acme',
      jobDescription: 'TypeScript cloud engineer',
      matchedKeywords: ['typescript', 'cloud'],
      matchedTags: ['backend'],
      maxPages: 2
    });

    expect(audit.targetPages).toBe(2);
    expect(audit.maxAllowedHeightMm).toBe(2 * USABLE_PAGE_HEIGHT_MM);
  });
});
