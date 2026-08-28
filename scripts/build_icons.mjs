import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const iconsDir = path.resolve(__dirname, '../src-tauri/icons');

const png32 = fs.readFileSync(path.join(iconsDir, '32x32.png'));
const png128 = fs.readFileSync(path.join(iconsDir, '128x128.png'));
const png256 = fs.readFileSync(path.join(iconsDir, '128x128@2x.png'));

// 1. Build Microsoft Windows .ico (ICONDIR + ICONDIRENTRY array + embedded PNGs)
function buildIco(images) {
  const numImages = images.length;
  const headerSize = 6;
  const entrySize = 16;
  const dirSize = headerSize + entrySize * numImages;

  let currentOffset = dirSize;
  const entries = [];

  for (const img of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(img.width === 256 ? 0 : img.width, 0);   // width (0 means 256)
    entry.writeUInt8(img.height === 256 ? 0 : img.height, 1); // height (0 means 256)
    entry.writeUInt8(0, 2);                                   // color count
    entry.writeUInt8(0, 3);                                   // reserved
    entry.writeUInt16LE(1, 4);                                // color planes
    entry.writeUInt16LE(32, 6);                               // bits per pixel
    entry.writeUInt32LE(img.buffer.length, 8);                 // bytes in res
    entry.writeUInt32LE(currentOffset, 12);                    // image offset

    entries.push(entry);
    currentOffset += img.buffer.length;
  }

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type 1 = ICO
  header.writeUInt16LE(numImages, 4); // number of icons

  return Buffer.concat([header, ...entries, ...images.map(i => i.buffer)]);
}

// 2. Build Apple macOS .icns (Header + OSType chunks)
function buildIcns(chunks) {
  const chunkBuffers = [];
  let totalLength = 8;

  for (const chunk of chunks) {
    const chunkLen = 8 + chunk.buffer.length;
    const chunkHeader = Buffer.alloc(8);
    chunkHeader.write(chunk.tag, 0, 4, 'ascii');
    chunkHeader.writeUInt32BE(chunkLen, 4);
    chunkBuffers.push(Buffer.concat([chunkHeader, chunk.buffer]));
    totalLength += chunkLen;
  }

  const header = Buffer.alloc(8);
  header.write('icns', 0, 4, 'ascii');
  header.writeUInt32BE(totalLength, 4);

  return Buffer.concat([header, ...chunkBuffers]);
}

// Generate valid Windows .ico container
const icoBuffer = buildIco([
  { width: 32, height: 32, buffer: png32 },
  { width: 128, height: 128, buffer: png128 },
  { width: 256, height: 256, buffer: png256 }
]);
fs.writeFileSync(path.join(iconsDir, 'icon.ico'), icoBuffer);
console.log(`Generated Windows icon.ico (${icoBuffer.length} bytes)`);

// Generate valid Apple .icns container
const icnsBuffer = buildIcns([
  { tag: 'icp5', buffer: png32 },
  { tag: 'ic07', buffer: png128 },
  { tag: 'ic08', buffer: png256 }
]);
fs.writeFileSync(path.join(iconsDir, 'icon.icns'), icnsBuffer);
console.log(`Generated Apple icon.icns (${icnsBuffer.length} bytes)`);
