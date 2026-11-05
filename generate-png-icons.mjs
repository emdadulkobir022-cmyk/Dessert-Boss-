import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createCRC32Table() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c >>> 0;
  }
  return table;
}

const crcTable = createCRC32Table();

function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  }
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(4 + 4 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4);
  data.copy(buf, 8);
  const crcBuf = Buffer.concat([Buffer.from(type), data]);
  buf.writeUInt32BE(crc32(crcBuf), 8 + len);
  return buf;
}

function generatePNG(width, height, isMaskable = false) {
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8-bit depth
  ihdr[9] = 6; // RGBA color type
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Pixel data (RGBA)
  // Each scanline: 1 byte filter type (0) + width * 4 bytes
  const scanlineLength = 1 + width * 4;
  const rawData = Buffer.alloc(height * scanlineLength);

  const cx = width / 2;
  const cy = height / 2;
  const radius = isMaskable ? width * 0.48 : width * 0.42;
  const innerRadius = radius * 0.72;

  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // filter type None
    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Default background: rich dark emerald (#022c22 to #064e3b)
      const gradT = (x + y) / (width + height);
      let r = Math.round(2 + gradT * (6 - 2));
      let g = Math.round(44 + gradT * (78 - 44));
      let b = Math.round(34 + gradT * (59 - 34));
      let a = 255;

      // Circle badge
      if (dist < radius) {
        // Outer ring accent
        if (dist > radius - (width * 0.02)) {
          r = 16; g = 185; b = 129; // emerald-500
        } else if (dist < innerRadius) {
          // Coconut pudding center bowl
          if (dy > 0) {
            // Coconut shell bottom (#78350f)
            r = 120; g = 53; b = 15;
            if (dist < innerRadius * 0.85) {
              // Coconut white flesh (#ffffff)
              r = 255; g = 255; b = 255;
            }
            if (dist < innerRadius * 0.7) {
              // Green coconut pudding (#d1fae5)
              r = 209; g = 250; b = 229;
            }
          } else {
            // Pudding top cream curve (#ffffff / #10b981)
            r = 255; g = 255; b = 255;
            // Cherry on top
            const cherryDist = Math.hypot(dx, dy + innerRadius * 0.2);
            if (cherryDist < innerRadius * 0.22) {
              r = 239; g = 68; b = 68; // red cherry
            }
          }
        }
      }

      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);

  // IEND
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), generatePNG(192, 192, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), generatePNG(512, 512, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), generatePNG(512, 512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), generatePNG(180, 180, false));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), generatePNG(64, 64, false));

console.log('Successfully generated all PWA PNG icons!');
