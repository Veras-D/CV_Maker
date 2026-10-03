import { LanguageCode } from '../types/cv';
import { formatTechnologyName, getDomainLabel } from './skillOntology';

export type CoverLetterTone = 'professional' | 'metric' | 'technical' | 'conversational';

export interface SynthesizerExperience {
  role: string;
  company: string;
  bullets: string[];
}

export interface CoverLetterSynthesizerParams {
  candidateName: string;
  companyName: string;
  jobTitle: string;
  matchedTags: string[];
  matchedKeywords: string[];
  experiences: SynthesizerExperience[];
  tone?: CoverLetterTone;
  seed?: number;
  language?: LanguageCode;
}

export function cleanBulletText(raw: string): string {
  const stripped = raw
    .replace(/^[\s•●○*·▪▫►▸⁃\u2013\u2014\u002D\u2212|:;,\-_/]+/u, '')
    .trim();
  if (!stripped) return '';
  return stripped.endsWith('.') ? stripped : `${stripped}.`;
}

function lowerFirst(str: string): string {
  if (!str) return '';
  if (/^[A-Z]{2,}\b/.test(str)) return str;
  return str.charAt(0).toLowerCase() + str.slice(1);
}

function formatDistinctSkills(keywords: string[]): string {
  const formatted = keywords.slice(0, 4).map(formatTechnologyName);
  if (formatted.length === 0) return 'modern technologies';
  if (formatted.length === 1) return formatted[0];
  if (formatted.length === 2) return `${formatted[0]} and ${formatted[1]}`;
  return `${formatted.slice(0, -1).join(', ')}, and ${formatted[formatted.length - 1]}`;
}

function formatDomainPhrase(tags: string[]): string {
  const labels = tags.slice(0, 2).map(getDomainLabel);
  if (labels.length === 0) return 'software engineering';
  if (labels.length === 1) return labels[0];
  return `${labels[0]} and ${labels[1]}`;
}

interface HookParams {
  role: string;
  company: string;
  domains: string;
  skills: string;
  tone: CoverLetterTone;
  seed: number;
}

function buildOpeningHook(p: HookParams): string {
  const hooks: Record<CoverLetterTone, string[]> = {
    professional: [
      `I am writing to express my strong interest in the ${p.role} position at ${p.company}. With a proven background in ${p.domains} and hands-on expertise in ${p.skills}, I am excited about the prospect of delivering scalable, high-impact contributions to your team.`,
      `With extensive experience across ${p.domains} and deep technical fluency in ${p.skills}, I am pleased to submit my application for the ${p.role} opening at ${p.company}. Having followed your product milestones, I am eager to help drive your engineering objectives forward.`,
      `I am writing to apply for the ${p.role} role at ${p.company}. Combining solid experience in ${p.domains} with a practical mastery of ${p.skills}, I am confident in my ability to immediately add value to your development cycles.`
    ],
    metric: [
      `I am applying for the ${p.role} role at ${p.company} with a dedicated focus on engineering efficiency and measurable product impact. Throughout my career in ${p.domains}, I have specialized in turning ambitious goals into robust software utilizing ${p.skills}.`,
      `High delivery velocity, architectural resilience, and measurable outcomes define my engineering track record. I am thrilled to submit my candidacy for the ${p.role} position at ${p.company}, bringing targeted depth in ${p.domains} and ${p.skills}.`
    ],
    technical: [
      `As an engineer dedicated to systems reliability, clean architecture, and technical craft, I was immediately drawn to the ${p.role} opening at ${p.company}. My background centers on ${p.domains}, with a strong foundation built around ${p.skills}.`,
      `I am excited to apply for the ${p.role} opening at ${p.company}. My approach to engineering is grounded in robust design patterns, comprehensive test coverage, and scalable codebases—principles I leverage daily across ${p.domains} and ${p.skills}.`
    ],
    conversational: [
      `I was thrilled to come across the ${p.role} opening at ${p.company}. Having spent recent years building solutions in ${p.domains} using ${p.skills}, I would love the opportunity to bring that passion and problem-solving energy to your team.`,
      `When I saw that ${p.company} was looking for a ${p.role}, it immediately caught my attention. I love working at the intersection of ${p.domains} with tools like ${p.skills}, and I am inspired by what your organization is building.`
    ]
  };

  const pool = hooks[p.tone] || hooks.professional;
  return pool[p.seed % pool.length];
}

interface SentenceParams {
  bullet: string;
  role: string;
  company: string;
  isFirst: boolean;
  seed: number;
}

function buildAchievementSentence(p: SentenceParams): string {
  const clean = cleanBulletText(p.bullet);
  if (!clean) return '';
  const body = lowerFirst(clean);

  if (p.isFirst) {
    const openers = [
      p.company ? `Most recently at ${p.company}, I ${body}` : `In my recent work, I ${body}`,
      p.company && p.role ? `While serving as ${p.role} at ${p.company}, I ${body}` : `In my recent roles, I ${body}`,
      p.company ? `At ${p.company}, I ${body}` : `Throughout my recent projects, I ${body}`
    ];
    return openers[p.seed % openers.length];
  }

  const transitions = [
    `Building on this initiative, I also ${body}`,
    `In parallel, I ${body}`,
    `Additionally, I ${body}`
  ];
  return transitions[p.seed % transitions.length];
}

function buildExperienceNarrative(
  experiences: SynthesizerExperience[],
  domains: string,
  skills: string,
  seed: number
): string {
  const validExps = experiences.filter(e => e.bullets && e.bullets.length > 0);
  if (validExps.length === 0) {
    return `Throughout my career in ${domains}, I have specialized in developing dependable, scalable solutions leveraging ${skills}. I take pride in writing maintainable code, implementing automated testing practices, and working collaboratively across cross-functional teams to exceed release goals.`;
  }

  const primaryExp = validExps[0];
  const b1 = primaryExp.bullets[0];
  const s1 = buildAchievementSentence({ bullet: b1, role: primaryExp.role, company: primaryExp.company, isFirst: true, seed });
  
  let s2 = '';
  if (primaryExp.bullets.length > 1) {
    s2 = buildAchievementSentence({ bullet: primaryExp.bullets[1], role: primaryExp.role, company: primaryExp.company, isFirst: false, seed });
  } else if (validExps.length > 1 && validExps[1].bullets.length > 0) {
    const prev = validExps[1];
    const prevBody = lowerFirst(cleanBulletText(prev.bullets[0]));
    s2 = prev.company
      ? `Prior to that at ${prev.company}, I ${prevBody}`
      : `In earlier engagements, I ${prevBody}`;
  }

  return s2 ? `${s1} ${s2}` : s1;
}

interface AlignmentParams {
  company: string;
  role: string;
  skills: string;
  tone: CoverLetterTone;
  seed: number;
}

function buildAlignmentParagraph(p: AlignmentParams): string {
  const paragraphs: Record<CoverLetterTone, string[]> = {
    professional: [
      `What particularly appeals to me about ${p.company} is your commitment to technical excellence and user experience. Whether refining requirements, designing resilient services, or streamlining deployment workflows with ${p.skills}, I thrive in collaborative environments focused on continuous improvement.`,
      `Joining ${p.company} represents an exciting opportunity to apply my background in ${p.skills} to your upcoming product milestones. I am eager to collaborate with your team to solve complex engineering challenges and deliver robust, scalable outcomes.`
    ],
    metric: [
      `I admire ${p.company}'s focus on speed and product impact. My engineering philosophy emphasizes eliminating bottlenecks, driving test automation, and building maintainable architectures using ${p.skills} that support rapid business growth.`,
      `By bringing an analytical, data-informed mindset to ${p.company}, I aim to optimize system throughput and delivery cycles, ensuring our technical investments directly translate into tangible platform success.`
    ],
    technical: [
      `I am deeply energized by ${p.company}'s engineering standards. Having worked hands-on with ${p.skills}, I am passionate about clean modular design, high test coverage, and automated deployment pipelines that keep releases safe and predictable.`,
      `From designing clean interfaces to diagnosing distributed latency, I take pride in mastering ${p.skills}. I look forward to bringing this engineering discipline and technical curiosity to the ${p.role} team.`
    ],
    conversational: [
      `Beyond the technical requirements, what really draws me to ${p.company} is the vision and culture. I love working with passionate teammates who take genuine pride in their craft and aren't afraid to iterate quickly to delight users.`,
      `I am genuinely excited about what ${p.company} is building. With my background in ${p.skills} and an eager, collaborative mindset, I would love to jump in and help build the next chapter together.`
    ]
  };

  const pool = paragraphs[p.tone] || paragraphs.professional;
  return pool[p.seed % pool.length];
}

interface ClosingParams {
  name: string;
  company: string;
  role: string;
  tone: CoverLetterTone;
  seed: number;
}

function buildClosingParagraph(p: ClosingParams): string {
  const closings: Record<CoverLetterTone, { body: string; signoff: string }[]> = {
    professional: [
      {
        body: `I would welcome the opportunity to discuss how my background and technical skillset align with ${p.company}'s upcoming initiatives. Thank you for your time and consideration.`,
        signoff: 'Sincerely,'
      },
      {
        body: `I look forward to speaking with your team about how I can contribute to the continued success of the ${p.role} role at ${p.company}. Thank you for considering my application.`,
        signoff: 'Best regards,'
      }
    ],
    metric: [
      {
        body: `I look forward to discussing how my experience can deliver measurable engineering value to ${p.company}. Thank you for reviewing my qualifications.`,
        signoff: 'Sincerely,'
      },
      {
        body: `I would be glad to share more details on how my background can help accelerate your engineering deliverables. Thank you for your consideration.`,
        signoff: 'Best regards,'
      }
    ],
    technical: [
      {
        body: `I would be thrilled to speak with your engineering team and explore how my technical background can support your architecture and roadmap. Thank you for your time.`,
        signoff: 'Sincerely,'
      },
      {
        body: `I welcome the chance to dive deeper into technical discussions regarding your stack and engineering vision. Thank you for considering my profile.`,
        signoff: 'Warm regards,'
      }
    ],
    conversational: [
      {
        body: `I would love the opportunity to connect and chat further about how I can help ${p.company} achieve its goals. Thank you so much for your time and consideration!`,
        signoff: 'Warm regards,'
      },
      {
        body: `I would be thrilled to learn more about the team and share more about what I can bring to ${p.company}. Thanks for reading!`,
        signoff: 'Best regards,'
      }
    ]
  };

  const pool = closings[p.tone] || closings.professional;
  const item = pool[p.seed % pool.length];
  return `${item.body}\n\n${item.signoff}\n${p.name || 'Candidate'}`;
}

function synthesizePortugueseLetter(p: CoverLetterSynthesizerParams): string {
  const company = p.companyName.trim() || 'equipe de recrutamento';
  const role = p.jobTitle.trim() || 'Desenvolvedor de Software';
  const skills = formatDistinctSkills(p.matchedKeywords);
  const domains = formatDomainPhrase(p.matchedTags);
  const name = p.candidateName.trim() || 'Candidato';

  const opening = `Prezada equipe da ${company},

Escrevo para manifestar meu grande interesse na posição de ${role}. Com sólida experiência em ${domains} e atuação prática com tecnologias como ${skills}, estou confiante na minha capacidade de agregar valor imediato e soluções de alto impacto para a equipe.`;

  const validExps = p.experiences.filter(e => e.bullets && e.bullets.length > 0);
  let expProse = `Ao longo da minha trajetória em ${domains}, especializei-me no desenvolvimento de sistemas confiáveis e escaláveis utilizando ${skills}, com foco em código limpo, automação de testes e boas práticas de engenharia.`;
  if (validExps.length > 0) {
    const e1 = validExps[0];
    const b1 = cleanBulletText(e1.bullets[0]);
    expProse = e1.company 
      ? `Recentemente na ${e1.company}, atuando como ${e1.role || 'Engenheiro'}, ${lowerFirst(b1)}`
      : `Em minha atuação recente, ${lowerFirst(b1)}`;
    if (e1.bullets.length > 1) {
      const b2 = cleanBulletText(e1.bullets[1]);
      expProse += ` Em paralelo, ${lowerFirst(b2)}`;
    }
  }

  const alignment = `O que mais me atrai na oportunidade da ${company} é o compromisso com a excelência técnica e inovação. Meu objetivo é aplicar minhas competências em ${skills} para construir produtos escaláveis e de alta qualidade.`;

  const closing = `Agradeço pela atenção e consideração, e coloco-me à inteira disposição para conversarmos em uma entrevista sobre como posso contribuir para os próximos objetivos da equipe.

Atenciosamente,
${name}`;

  return `${opening}\n\n${expProse}\n\n${alignment}\n\n${closing}`;
}

export function synthesizeCoverLetterProse(params: CoverLetterSynthesizerParams): string {
  if (params.language === 'pt') {
    return synthesizePortugueseLetter(params);
  }

  const company = params.companyName.trim() || 'the Company';
  const role = params.jobTitle.trim() || 'Software Engineer';
  const tone = params.tone || 'professional';
  const seed = params.seed ?? 0;

  const domains = formatDomainPhrase(params.matchedTags);
  const skills = formatDistinctSkills(params.matchedKeywords);
  const candidateName = params.candidateName.trim() || 'Candidate';

  const salutation = tone === 'conversational' ? `Hello ${company} Team,` : `Dear Hiring Team at ${company},`;
  const hook = buildOpeningHook({ role, company, domains, skills, tone, seed });
  const narrative = buildExperienceNarrative(params.experiences, domains, skills, seed);
  const alignment = buildAlignmentParagraph({ company, role, skills, tone, seed });
  const closing = buildClosingParagraph({ name: candidateName, company, role, tone, seed });

  return `${salutation}\n\n${hook}\n\n${narrative}\n\n${alignment}\n\n${closing}`;
}

export function synthesizeCoverLetter(params: CoverLetterSynthesizerParams): Record<string, string> {
  const enLetter = synthesizeCoverLetterProse({ ...params, language: 'en' });
  const langLetter = params.language && params.language !== 'en'
    ? synthesizeCoverLetterProse(params)
    : enLetter;

  return {
    en: enLetter,
    [params.language || 'en']: langLetter
  };
}

export function getEstimatedReadingTime(text: string): { words: number; minutes: number } {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return { words, minutes };
}
