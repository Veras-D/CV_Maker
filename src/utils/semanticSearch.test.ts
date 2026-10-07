import { describe, it, expect } from 'vitest';
import { performHybridSemanticMatch } from './semanticSearch';
import { CVData, WorkExperience, createEmptyCVData } from '../types/cv';

function createMockCV(): CVData {
  const base = createEmptyCVData();

  const experiences: WorkExperience[] = [
    {
      id: 'exp-recent',
      company: 'Revelo',
      roleTitle: { en: 'Technical AI Evaluator & Code Reviewer' },
      startDate: '2025-08',
      endDate: 'Present',
      tags: ['ai', 'typescript', 'python'],
      enabled: true,
      bullets: [
        { id: 'b1-1', text: { en: 'Performed RLHF grading model outputs' }, tags: ['ai'], enabled: true },
        { id: 'b1-2', text: { en: 'Evaluated code in TypeScript and Python' }, tags: ['typescript', 'python'], enabled: true },
        { id: 'b1-3', text: { en: 'Designed fine-tuning test suites for LLMs' }, tags: ['ai'], enabled: true }
      ]
    },
    {
      id: 'exp-mid',
      company: 'GX4 Software',
      roleTitle: { en: 'Full-Stack Engineer' },
      startDate: '2024-06',
      endDate: '2025-07',
      tags: ['fullstack', 'react', 'docker'],
      enabled: true,
      bullets: [
        { id: 'b2-1', text: { en: 'Designed containerized deployment with Docker' }, tags: ['devops', 'docker'], enabled: true },
        { id: 'b2-2', text: { en: 'Developed web applications using React and TypeScript' }, tags: ['react', 'typescript'], enabled: true },
        { id: 'b2-3', text: { en: 'Streamlined CI/CD pipelines with Docker' }, tags: ['docker'], enabled: true },
        { id: 'b2-4', text: { en: 'Built RESTful APIs with ExpressJS and PostgreSQL' }, tags: ['backend'], enabled: true }
      ]
    },
    {
      id: 'exp-earlier',
      company: 'Legacy Corp',
      roleTitle: { en: 'Junior Web Developer' },
      startDate: '2022-01',
      endDate: '2024-05',
      tags: ['web'],
      enabled: true,
      bullets: [
        { id: 'b3-1', text: { en: 'Maintained internal web portals and legacy interfaces' }, tags: ['web'], enabled: true },
        { id: 'b3-2', text: { en: 'Created unit tests for reporting dashboards' }, tags: ['testing'], enabled: true },
        { id: 'b3-3', text: { en: 'Collaborated with design team on UX updates' }, tags: ['ux'], enabled: true }
      ]
    },
    {
      id: 'exp-intern',
      company: 'Startup Lab',
      roleTitle: { en: 'Software Engineering Intern' },
      startDate: '2021-06',
      endDate: '2021-12',
      tags: ['intern'],
      enabled: true,
      bullets: [
        { id: 'b4-1', text: { en: 'Assisted senior engineers in bug fixes and documentation' }, tags: [], enabled: true }
      ]
    }
  ];

  return {
    ...base,
    profile: {
      ...base.profile,
      name: 'John Doe',
      summary: { en: 'Forward Deployed Engineer with 4+ years of hands-on experience' }
    },
    experiences
  };
}

describe('performHybridSemanticMatch - Experience Ranking', () => {
  it('guarantees that ALL work experiences remain enabled during tailoring', () => {
    const cvData = createMockCV();
    const result = performHybridSemanticMatch({
      jobTitle: 'Senior Cloud DevOps Engineer',
      companyName: 'CloudTech',
      jobDescription: 'Seeking DevOps engineer with Docker, Kubernetes, AWS, Terraform, and CI/CD pipelines.',
      cvData
    });

    expect(result.rankedExperiences).toHaveLength(4);
    // Every role must remain enabled so total years of career history is preserved
    result.rankedExperiences.forEach(exp => {
      expect(exp.enabled).toBe(true);
    });
  });

  it('guarantees at least 2 bullets enabled for each role with 2 or more bullets', () => {
    const cvData = createMockCV();
    const result = performHybridSemanticMatch({
      jobTitle: 'Senior Cloud DevOps Engineer',
      companyName: 'CloudTech',
      jobDescription: 'Seeking DevOps engineer with Docker, Kubernetes, AWS, Terraform, and CI/CD pipelines.',
      cvData
    });

    // Recent role has 3 bullets -> at least 2 enabled
    const expRecent = result.rankedExperiences.find(e => e.id === 'exp-recent')!;
    const recentEnabledBullets = expRecent.bullets.filter(b => b.enabled);
    expect(recentEnabledBullets.length).toBeGreaterThanOrEqual(2);

    // Mid role has 4 bullets -> at least 2 enabled (and matches Docker keywords)
    const expMid = result.rankedExperiences.find(e => e.id === 'exp-mid')!;
    const midEnabledBullets = expMid.bullets.filter(b => b.enabled);
    expect(midEnabledBullets.length).toBeGreaterThanOrEqual(2);

    // Earlier role has 3 bullets with 0 devops keyword matches -> still has at least 2 bullets enabled
    const expEarlier = result.rankedExperiences.find(e => e.id === 'exp-earlier')!;
    const earlierEnabledBullets = expEarlier.bullets.filter(b => b.enabled);
    expect(earlierEnabledBullets.length).toBe(2);

    // Intern role has only 1 bullet total -> has 1 bullet enabled
    const expIntern = result.rankedExperiences.find(e => e.id === 'exp-intern')!;
    const internEnabledBullets = expIntern.bullets.filter(b => b.enabled);
    expect(internEnabledBullets.length).toBe(1);
  });

  it('maintains original bullet order within each experience', () => {
    const cvData = createMockCV();
    const result = performHybridSemanticMatch({
      jobTitle: 'React Frontend Developer',
      companyName: 'WebCorp',
      jobDescription: 'Building modern React and TypeScript web applications.',
      cvData
    });

    const expMid = result.rankedExperiences.find(e => e.id === 'exp-mid')!;
    const originalIds = cvData.experiences.find(e => e.id === 'exp-mid')!.bullets.map(b => b.id);
    const resultIds = expMid.bullets.map(b => b.id);

    expect(resultIds).toEqual(originalIds);
  });
});
