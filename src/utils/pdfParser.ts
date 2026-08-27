/**
 * Pure TypeScript PDF text extractor using Web Streams DecompressionStream.
 * Extracts and reconstructs clean text lines from both Flate-compressed and uncompressed PDF streams.
 */

async function readStreamChunks(reader: ReadableStreamDefaultReader<Uint8Array>): Promise<Uint8Array[]> {
  const chunks: Uint8Array[] = [];
  let isDone = false;
  while (!isDone) {
    const { done, value } = await reader.read();
    if (done) {
      isDone = true;
    } else if (value) {
      chunks.push(value);
    }
  }
  return chunks;
}

async function decompressWithFormat(bytes: Uint8Array, format: 'deflate' | 'deflate-raw'): Promise<string | null> {
  try {
    const ds = new DecompressionStream(format);
    const writer = ds.writable.getWriter();
    writer.write(new Uint8Array(bytes) as unknown as BufferSource);
    writer.close();

    const chunks = await readStreamChunks(ds.readable.getReader());
    const total = chunks.reduce((acc, c) => acc + c.length, 0);
    const out = new Uint8Array(total);
    let offset = 0;
    for (const c of chunks) {
      out.set(c, offset);
      offset += c.length;
    }

    return new TextDecoder('utf-8', { fatal: false }).decode(out);
  } catch {
    return null;
  }
}

async function decompressStreamChunk(bytes: Uint8Array): Promise<string> {
  const deflate = await decompressWithFormat(bytes, 'deflate');
  if (deflate) return deflate;

  const raw = await decompressWithFormat(bytes, 'deflate-raw');
  return raw || '';
}

function extractTextTokensFromStream(streamText: string): string[] {
  const lines: string[] = [];
  
  // Extract text from TJ arrays: [(text1) -120 (text2)] TJ
  const tjMatches = streamText.matchAll(/\[(.*?)\]\s*TJ/g);
  for (const m of tjMatches) {
    const stringParts = m[1].matchAll(/\((.*?)\)/g);
    const combined = Array.from(stringParts).map(p => p[1]).join('');
    if (combined.trim().length > 0) {
      lines.push(combined.trim());
    }
  }

  // Extract text from simple Tj operators: (text) Tj
  const simpleMatches = streamText.matchAll(/\(([^()]*)\)\s*(?:Tj|'|")/g);
  for (const m of simpleMatches) {
    const text = m[1].trim();
    if (text.length > 0) {
      lines.push(text);
    }
  }

  return lines;
}

function getStreamOffset(bytes: Uint8Array, start: number): number {
  if (bytes[start] === 0x0d && bytes[start + 1] === 0x0a) return start + 2;
  if (bytes[start] === 0x0a || bytes[start] === 0x0d) return start + 1;
  return start;
}

function findStreamBlocks(buffer: ArrayBuffer): { start: number; end: number }[] {
  const bytes = new Uint8Array(buffer);
  const blocks: { start: number; end: number }[] = [];
  const text = new TextDecoder('latin1').decode(bytes);
  let pos = 0;

  while ((pos = text.indexOf('stream', pos)) !== -1) {
    const start = getStreamOffset(bytes, pos + 6);
    const end = text.indexOf('endstream', start);
    if (end === -1) break;
    blocks.push({ start, end });
    pos = end + 9;
  }

  return blocks;
}

function sanitizeFallbackText(rawString: string): string[] {
  return rawString
    .replace(/%PDF-[\d.]+/g, '')
    .replace(/\b\d+\s+\d+\s+obj\b/g, '')
    .replace(/\bendobj\b/g, '')
    .replace(/\/[\w]+/g, '')
    .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 2 && !l.startsWith('<<') && !l.startsWith('>>'));
}

async function extractFromStreamBlock(rawBytes: Uint8Array, block: { start: number; end: number }): Promise<string | null> {
  const chunkBytes = rawBytes.slice(block.start, block.end);
  const decompressed = await decompressStreamChunk(chunkBytes);
  if (!decompressed) return null;
  const tokens = extractTextTokensFromStream(decompressed);
  return tokens.length > 0 ? tokens.join(' ') : null;
}

/**
 * Extracts all readable text content from an uploaded PDF file
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const rawBytes = new Uint8Array(buffer);
  const streamBlocks = findStreamBlocks(buffer);
  const extractedLines: string[] = [];

  for (const block of streamBlocks) {
    const line = await extractFromStreamBlock(rawBytes, block);
    if (line) extractedLines.push(line);
  }

  // Fallback: If compressed streams produced no text, search uncompressed text
  if (extractedLines.length === 0) {
    const rawString = new TextDecoder('utf-8', { fatal: false }).decode(rawBytes);
    const uncompressedTokens = extractTextTokensFromStream(rawString);
    if (uncompressedTokens.length > 0) {
      extractedLines.push(...uncompressedTokens);
    } else {
      extractedLines.push(...sanitizeFallbackText(rawString));
    }
  }

  return extractedLines
    .map(line => line.replace(/\\([nrtbf()\\])/g, (_, c) => {
      const map: Record<string, string> = { n: '\n', r: '\r', t: '\t', b: '\b', f: '\f', '(': '(', ')': ')', '\\': '\\' };
      return map[c] || c;
    }))
    .join('\n');
}
