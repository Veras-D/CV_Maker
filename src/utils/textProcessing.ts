/**
 * Text processing and tokenization utilities with multilingual stop-word filtering
 */

export const STOP_WORDS = new Set([
  // English common words
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
  'from', 'up', 'about', 'into', 'over', 'after', 'is', 'are', 'was', 'were', 'be', 'been',
  'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'shall', 'should',
  'can', 'could', 'may', 'might', 'must', 'our', 'your', 'we', 'they', 'their', 'you', 'my',
  'he', 'she', 'it', 'its', 'this', 'that', 'these', 'those', 'which', 'who', 'whom', 'what',
  'where', 'when', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other',
  'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
  'just', 'now', 'work', 'working', 'experience', 'years', 'team', 'teams', 'role', 'roles',
  'position', 'candidate', 'responsibilities', 'requirements', 'qualifications', 'opportunity',
  'skills', 'strong', 'looking', 'joining', 'company', 'environment', 'include', 'including',
  'well', 'across', 'using', 'ability', 'high', 'delivering', 'proven',
  // Czech common words
  'a', 'i', 'že', 'se', 'si', 'na', 'do', 've', 'v', 'k', 'ke', 'o', 'u', 's', 'z', 'ze',
  'od', 'pro', 'po', 'za', 'před', 'při', 'pod', 'nad', 'mezi', 'je', 'jsou', 'byl', 'byla',
  'bylo', 'byli', 'bude', 'budou', 'jsem', 'jsme', 'jste', 'být', 'mít', 'má', 'mají', 'máme',
  'máte', 'měl', 'měla', 'tento', 'tato', 'toto', 'tyto', 'této', 'tomto', 'který', 'která',
  'které', 'kterou', 'kterým', 'jak', 'jako', 'tak', 'také', 'jen', 'jenom', 'nebo', 'ale',
  'však', 'aby', 'když', 'pak', 'už', 'až', 'co', 'kdo', 'kde', 'kam', 'odkud', 'proč',
  'zkušenosti', 'tým', 'práce', 'pozice', 'role', 'společnost', 'požadavky', 'nabízíme'
]);

export const NON_TECHNICAL_TERMS = new Set([
  'about', 'role', 'roles', 'team', 'teams', 'work', 'works', 'working',
  'company', 'companies', 'business', 'job', 'jobs', 'position', 'positions',
  'candidate', 'candidates', 'applicant', 'applicants', 'opportunity', 'opportunities',
  'department', 'organization', 'group', 'groups', 'mission', 'vision', 'values',
  'culture', 'people', 'office', 'offices', 'remote', 'hybrid', 'onsite', 'on-site',
  'headquarters', 'hq', 'branch', 'location', 'locations', 'city', 'state', 'country',
  'full', 'part', 'time', 'full-time', 'part-time', 'contract', 'freelance', 'permanent',
  'temporary', 'intern', 'interns', 'internship', 'junior', 'mid', 'senior', 'lead',
  'principal', 'staff', 'director', 'manager', 'head', 'vp', 'svp', 'evp',
  'ceo', 'cto', 'cfo', 'coo', 'cpo', 'hire', 'hiring', 'joined', 'joining', 'join',
  'apply', 'applying', 'application', 'status', 'level', 'levels', 'experience', 'experiences',
  'years', 'year', 'month', 'months', 'week', 'weeks', 'day', 'days', 'hour', 'hours',
  'salary', 'salaries', 'compensation', 'pay', 'bonus', 'bonuses', 'equity', 'stock',
  'options', 'shares', 'benefits', 'perks', 'insurance', 'health', 'dental', 'vision',
  'life', 'disability', '401k', 'pension', 'pto', 'vacation', 'holiday', 'holidays',
  'leave', 'paid', 'unpaid', 'stipend', 'allowance', 'policy', 'policies',
  'equal', 'opportunity', 'employer', 'eeo', 'affirmative', 'action', 'diversity',
  'inclusion', 'race', 'gender', 'religion', 'disability', 'veteran',
  'funding', 'funded', 'investor', 'investors', 'investment', 'investments', 'venture',
  'capital', 'series', 'seed', 'angel', 'round', 'rounds', 'ipo', 'valuation',
  'iconiq', 'sequoia', 'accel', 'andreessen', 'bessemer', 'benchmark', 'index',
  'usd', 'eur', 'gbp', 'cad', 'aud', 'chf', 'czk',
  'est', 'pst', 'cst', 'mst', 'utc', 'gmt', 'cet', 'eet', 'bst', 'pdt', 'edt',
  'usa', 'us', 'uk', 'eu', 'nyc', 'sf', 'la',
  'help', 'helps', 'helping', 'helped', 'build', 'builds', 'building', 'built',
  'drive', 'drives', 'driving', 'driven', 'scale', 'scales', 'scaling', 'scaled',
  'own', 'owns', 'owning', 'owned', 'deliver', 'delivers', 'delivering', 'delivered',
  'grow', 'grows', 'growing', 'growth', 'create', 'creates', 'creating', 'created',
  'solve', 'solves', 'solving', 'solved', 'support', 'supporting', 'supports',
  'ensure', 'ensures', 'ensuring', 'maintain', 'maintains', 'maintaining',
  'fast', 'pace', 'paced', 'dynamic', 'passionate', 'excited', 'exciting',
  'world', 'class', 'global', 'proven', 'strong', 'solid', 'excellent',
  'great', 'good', 'best', 'better', 'nice', 'new', 'next', 'high', 'quality',
  'impact', 'meaningful', 'success', 'successful', 'innovative', 'modern',
  'first', 'second', 'third', 'top', 'bottom', 'daily', 'weekly', 'monthly'
]);

/**
 * Validates whether a token represents a genuine technical skill or keyword
 * and rejects pure numbers, years, stop words, and general corporate vocabulary.
 */
export function isValidKeyword(term: string): boolean {
  if (!term || typeof term !== 'string') return false;
  const lower = term.trim().toLowerCase();
  if (lower.length < 2 || lower.length > 35) return false;
  if (/^\d+$/.test(lower)) return false;
  if (/^\d+(?:st|nd|rd|th|k|m|\+)$/i.test(lower)) return false;
  if (!/[a-z]/i.test(lower)) return false;
  if (STOP_WORDS.has(lower)) return false;
  if (NON_TECHNICAL_TERMS.has(lower)) return false;
  return true;
}

const HIGH_PRIORITY_TRIGGERS = /(?:requirements?|qualifications?|must[- ]have|skills?|responsibilities|what you(?:\x27ll| will) do|your role|experience (?:with|in)|proficient in|looking for)/gi;
const LOW_PRIORITY_TRIGGERS = /(?:about (?:us|the company)|who we are|our company|our product|benefits|we offer|perks)/gi;

export interface ProximityMap {
  highMatches: number[];
  lowMatches: number[];
}

/**
 * Identify character offset spans of high-priority requirement sections vs low-priority background sections
 */
export function buildProximityMap(text: string): ProximityMap {
  const highMatches = Array.from(text.matchAll(HIGH_PRIORITY_TRIGGERS)).map(m => m.index || 0);
  const lowMatches = Array.from(text.matchAll(LOW_PRIORITY_TRIGGERS)).map(m => m.index || 0);
  return { highMatches, lowMatches };
}

/**
 * Determine weight for a keyword occurrence based on its proximity to section triggers
 */
export function getProximityWeight(charIndex: number, map: ProximityMap): number {
  if (map.highMatches.some(pos => charIndex >= pos && charIndex <= pos + 500)) {
    return 4;
  }
  if (map.lowMatches.some(pos => charIndex >= pos && charIndex <= pos + 300)) {
    return 1;
  }
  return 2;
}

/**
 * Unicode-aware tokenizer filtering out punctuation and single characters
 */
export function tokenizeRaw(text: string): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}+#.-]/gu, ' ')
    .split(/\s+/)
    .filter(token => token.length > 1);
}

/**
 * Unicode-aware tokenizer filtering out punctuation, single characters, and stop words
 */
export function tokenizeClean(text: string): string[] {
  return tokenizeRaw(text).filter(token => !STOP_WORDS.has(token));
}

/**
 * Calculate Term Frequency vector for tokens
 */
export function getTermFrequency(tokens: string[]): Record<string, number> {
  const tf: Record<string, number> = {};
  tokens.forEach(token => {
    tf[token] = (tf[token] || 0) + 1;
  });
  return tf;
}

/**
 * Cosine similarity between two term frequency vectors
 */
export function calculateCosineSimilarity(tf1: Record<string, number>, tf2: Record<string, number>): number {
  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;

  Object.keys(tf1).forEach(term => {
    const count1 = tf1[term];
    magnitude1 += count1 * count1;
    if (tf2[term]) {
      dotProduct += count1 * tf2[term];
    }
  });

  Object.values(tf2).forEach(count2 => {
    magnitude2 += count2 * count2;
  });

  if (magnitude1 === 0 || magnitude2 === 0) return 0;
  return dotProduct / (Math.sqrt(magnitude1) * Math.sqrt(magnitude2));
}
