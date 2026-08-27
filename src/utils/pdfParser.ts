/**
 * Pure TypeScript PDF text extractor using Web Streams DecompressionStream.
 * Extracts and reconstructs clean text lines from both Flate-compressed and uncompressed PDF streams.
 */

async function decompressStreamChunk(bytes: Uint8Array): Promise<string> {
  const formats: ('deflate' | 'deflate-raw')[] = ['deflate', 'deflate-raw'];

  for (const format of formats) {
    try {
      const ds = new DecompressionStream(format);
      const writer = ds.writable.getWriter();
      writer.write(new Uint8Array(bytes) as unknown as BufferSource);
      writer.close();

      const reader = ds.readable.getReader();
      const chunks: Uint8Array[] = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) chunks.push(value);
      }

      const total = chunks.reduce((acc, c) => acc + c.length, 0);
      const out = new Uint8Array(total);
      let offset = 0;
      for (const c of chunks) {
        out.set(c, offset);
        offset += c.length;
      }

      return new TextDecoder('utf-8', { fatal: false }).decode(out);
    } catch {
      // try next decompression format
    }
  }

  return '';
}

function extractTextTokensFromStream(streamText: string): string[] {
  const lines: string[] = [];
  
  // Extract text from TJ arrays: [(text1) -120 (text2)] TJ
  const tjMatches = streamText.matchAll(/\[(.*?)\]\s*TJ/g);
  for (const m of tjMatches) {
    const inner = m[1];
    const stringParts = inner.matchAll(/\((.*?)\)/g);
    const combined = Array.from(stringParts).map(p => p[1]).join('');
    if (combined.trim().length > 0) {
      lines.push(combined.trim());
    }
  }

  // Extract text from simple Tj / ' / " operators: (text) Tj
  const simpleMatches = streamText.matchAll(/\(([^()]*)\)\s*(?:Tj|'|")/g);
  for (const m of simpleMatches) {
    const text = m[1].trim();
    if (text.length > 0) {
      lines.push(text);
    }
  }

  return lines;
}

function findStreamBlocks(buffer: ArrayBuffer): { start: number; end: number }[] {
  const bytes = new Uint8Array(buffer);
  const blocks: { start: number; end: number }[] = [];
  const text = new TextDecoder('latin1').decode(bytes);

  const streamKeyword = 'stream';
  const endstreamKeyword = 'endstream';
  let pos = 0;

  while ((pos = text.indexOf(streamKeyword, pos)) !== -1) {
    let start = pos + streamKeyword.length;
    if (bytes[start] === 0x0d && bytes[start + 1] === 0x0a) {
      start += 2;
    } else if (bytes[start] === 0x0a || bytes[start] === 0x0d) {
      start += 1;
    }

    const end = text.indexOf(endstreamKeyword, start);
    if (end !== -1) {
      blocks.push({ start, end });
      pos = end + endstreamKeyword.length;
    } else {
      break;
    }
  }

  return blocks;
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
    const chunkBytes = rawBytes.slice(block.start, block.end);
    const decompressed = await decompressStreamChunk(chunkBytes);
    
    if (decompressed) {
      const tokens = extractTextTokensFromStream(decompressed);
      if (tokens.length > 0) {
        extractedLines.push(tokens.join(' '));
      }
    }
  }

  // Fallback: If no streams produced tokens, search raw uncompressed text
  if (extractedLines.length === 0) {
    const rawString = new TextDecoder('utf-8', { fatal: false }).decode(rawBytes);
    const uncompressedTokens = extractTextTokensFromStream(rawString);
    if (uncompressedTokens.length > 0) {
      extractedLines.push(...uncompressedTokens);
    } else {
      // Filter out PDF binary header artifacts (%PDF, /Type, obj, etc.)
      const cleaned = rawString
        .replace(/%PDF-[\d.]+/g, '')
        .replace(/\b\d+\s+\d+\s+obj\b/g, '')
        .replace(/\bendobj\b/g, '')
        .replace(/\/[\w]+/g, '')
        .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 2 && !l.startsWith('<<') && !l.startsWith('>>'));
      
      extractedLines.push(...cleaned);
    }
  }

  return extractedLines
    .map(line => line.replace(/\\([nrtbf()\\])/g, (_, c) => {
      const map: Record<string, string> = { n: '\n', r: '\r', t: '\t', b: '\b', f: '\f', '(': '(', ')': ')', '\\': '\\' };
      return map[c] || c;
    }))
    .join('\n');
}
