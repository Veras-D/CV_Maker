import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function crc32(buf: Buffer): number {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ -1) >>> 0;
}

function makeChunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'binary');
  const body = Buffer.concat([typeBuf, data]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crcBuf]);
}

function createPng(width: number, height: number): Buffer {
  const header = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // 8-bit depth
  ihdrData.writeUInt8(6, 9); // RGBA
  ihdrData.writeUInt8(0, 10);
  ihdrData.writeUInt8(0, 11);
  ihdrData.writeUInt8(0, 12);
  const ihdr = makeChunk('IHDR', ihdrData);

  const rawLines: Buffer[] = [];
  for (let y = 0; y < height; y++) {
    const line = Buffer.alloc(1 + width * 4);
    line[0] = 0; // Filter type 0
    for (let x = 0; x < width; x++) {
      const idx = 1 + x * 4;
      line[idx] = 2;       // Red
      line[idx + 1] = 132; // Green (Sky Blue #0284c7)
      line[idx + 2] = 199; // Blue
      line[idx + 3] = 255; // Alpha
    }
    rawLines.push(line);
  }
  const compressed = zlib.deflateSync(Buffer.concat(rawLines));
  const idat = makeChunk('IDAT', compressed);
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([header, ihdr, idat, iend]);
}

const iconsDir = path.join(process.cwd(), 'src-tauri', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

fs.writeFileSync(path.join(iconsDir, '32x32.png'), createPng(32, 32));
fs.writeFileSync(path.join(iconsDir, '128x128.png'), createPng(128, 128));
fs.writeFileSync(path.join(iconsDir, '128x128@2x.png'), createPng(256, 256));
fs.writeFileSync(path.join(iconsDir, 'icon.icns'), createPng(128, 128));
fs.writeFileSync(path.join(iconsDir, 'icon.ico'), createPng(128, 128));

console.log("Successfully generated exact dimension PNG icon files!");
