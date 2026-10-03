/**
 * Text processing and tokenization utilities with multilingual stop-word filtering
 */

const STOP_WORDS = new Set([
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
