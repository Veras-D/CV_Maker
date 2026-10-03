import { CVData } from '../types/cv';
import { COMPREHENSIVE_BASE_SEEDS } from './knowledgeBaseSeeds';

export interface KnowledgeDomainNode {
  id: string;
  label: string;
  keywords: Record<string, number>;
  isUniversal?: boolean;
}

export interface KnowledgeGraphStore {
  version: number;
  domains: Record<string, KnowledgeDomainNode>;
  updatedAt: string;
}

const STORAGE_KEY = 'cv_maker_knowledge_graph_v1';

/**
 * Initialize base domain nodes from comprehensive multi-industry seed dictionary
 */
function createInitialStore(): KnowledgeGraphStore {
  const domains: Record<string, KnowledgeDomainNode> = {};

  Object.entries(COMPREHENSIVE_BASE_SEEDS).forEach(([id, seed]) => {
    domains[id] = {
      id,
      label: seed.label,
      keywords: { ...seed.keywords }
    };
  });

  return {
    version: 1,
    domains,
    updatedAt: new Date().toISOString()
  };
}

let memoryStore: KnowledgeGraphStore | null = null;

function loadStoreFromLocalStorage(): KnowledgeGraphStore | null {
  if (typeof localStorage === 'undefined') return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  const parsed = JSON.parse(raw);
  return (parsed && parsed.domains) ? (parsed as KnowledgeGraphStore) : null;
}

/**
 * Retrieve active knowledge graph from localStorage or in-memory fallback
 */
export function getKnowledgeGraph(): KnowledgeGraphStore {
  if (memoryStore) return memoryStore;

  try {
    const loaded = loadStoreFromLocalStorage();
    if (loaded) {
      memoryStore = loaded;
      return memoryStore;
    }
  } catch (err) {
    console.error('Failed to load knowledge graph from storage:', err);
  }

  memoryStore = createInitialStore();
  return memoryStore;
}

/**
 * Persist knowledge graph state to localStorage and in-memory cache
 */
export function saveKnowledgeGraph(store: KnowledgeGraphStore): void {
  store.updatedAt = new Date().toISOString();
  memoryStore = store;
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    }
  } catch (err) {
    console.error('Failed to save knowledge graph:', err);
  }
}

/**
 * Slugify category name for domain key
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 30);
}

/**
 * Classify a skill category into universal or domain-specific bucket using the dynamic graph
 */
export function classifyCategory(catName: string, skills: { name: string }[]): string {
  const lower = catName.toLowerCase();
  if (/language|jazyk|programov/i.test(lower)) return 'universal_languages';
  if (/developer tool|nástroj|practice|general tool/i.test(lower)) return 'universal_tools';

  const store = getKnowledgeGraph();
  for (const [id, domain] of Object.entries(store.domains)) {
    if (lower.includes(id) || lower.includes(domain.label.toLowerCase())) {
      return id;
    }
  }

  const counts: Record<string, number> = {};
  skills.forEach(s => {
    const sLower = s.name.toLowerCase();
    Object.entries(store.domains).forEach(([id, domain]) => {
      if (domain.keywords[sLower]) {
        counts[id] = (counts[id] || 0) + 1;
      }
    });
  });

  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return top ? top[0] : 'other';
}

/**
 * Automatically bootstrap knowledge graph from the user's master CV categories and skills
 */
export function bootstrapKnowledgeGraphFromCV(cvData: CVData): KnowledgeGraphStore {
  const store = getKnowledgeGraph();
  let changed = false;

  cvData.skillCategories.forEach(cat => {
    const catName = cat.categoryName.en || cat.categoryName.cs || '';
    if (!catName.trim()) return;

    const domainKey = slugify(catName);
    if (!store.domains[domainKey]) {
      store.domains[domainKey] = {
        id: domainKey,
        label: catName,
        keywords: {}
      };
      changed = true;
    }

    const domain = store.domains[domainKey];
    cat.skills.forEach(s => {
      const lower = s.name.trim().toLowerCase();
      if (lower && (!domain.keywords[lower] || domain.keywords[lower] < 10)) {
        domain.keywords[lower] = 10;
        changed = true;
      }
    });
  });

  if (changed) {
    saveKnowledgeGraph(store);
  }
  return store;
}

/**
 * Extract emerging acronyms and compound industry terms from text
 */
function extractDiscoveredTerms(jdText: string): string[] {
  const acronyms = jdText.match(/\b[A-Z0-9]{2,6}\b/g) || [];
  const commonStopWords = new Set(['THE', 'AND', 'FOR', 'WITH', 'ARE', 'YOU', 'OUR', 'NOT', 'ALL', 'CAN', 'HAS', 'HAVE', 'WAS', 'ITS']);

  const discovered = new Set<string>();
  acronyms.forEach(acronym => {
    if (!commonStopWords.has(acronym)) {
      discovered.add(acronym.toLowerCase());
    }
  });

  return Array.from(discovered);
}

/**
 * Learn new terms and strengthen keyword associations from tailored job postings
 */
export function learnFromJobPosting(
  _jobTitle: string,
  jobDescription: string,
  dominantDomains: string[]
): void {
  if (dominantDomains.length === 0 || !jobDescription) return;

  const store = getKnowledgeGraph();
  const discoveredTerms = extractDiscoveredTerms(jobDescription);
  let changed = false;

  dominantDomains.forEach(domainId => {
    const domain = store.domains[domainId];
    if (!domain) return;

    discoveredTerms.forEach(term => {
      const currentWeight = domain.keywords[term] || 0;
      domain.keywords[term] = currentWeight + 2;
      changed = true;
    });
  });

  if (changed) {
    saveKnowledgeGraph(store);
  }
}

/**
 * Reinforce enabled skills for a target domain when user saves or exports tailored output
 */
export function reinforceSkillRelevance(
  dominantDomains: string[],
  enabledSkills: string[]
): void {
  if (dominantDomains.length === 0 || enabledSkills.length === 0) return;

  const store = getKnowledgeGraph();
  let changed = false;

  dominantDomains.forEach(domainId => {
    const domain = store.domains[domainId];
    if (!domain) return;

    enabledSkills.forEach(skill => {
      const lower = skill.trim().toLowerCase();
      domain.keywords[lower] = (domain.keywords[lower] || 0) + 1;
      changed = true;
    });
  });

  if (changed) {
    saveKnowledgeGraph(store);
  }
}

/**
 * Retrieve dynamic domain definitions with all active and learned keywords
 */
export function getDynamicDomains(): Record<string, { id: string; label: string; keywords: string[] }> {
  const store = getKnowledgeGraph();
  const result: Record<string, { id: string; label: string; keywords: string[] }> = {};

  Object.entries(store.domains).forEach(([id, node]) => {
    result[id] = {
      id,
      label: node.label,
      keywords: Object.keys(node.keywords)
    };
  });

  return result;
}

/**
 * Reset knowledge graph back to initial seeds
 */
export function resetKnowledgeGraph(): void {
  localStorage.removeItem(STORAGE_KEY);
  saveKnowledgeGraph(createInitialStore());
}
