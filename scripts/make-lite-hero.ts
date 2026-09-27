// Generates public/lite-hero.bmp: a ~2 MB uncompressed bitmap for the /lite page.
// BMP because it is trivially uncompressed; the whole joke is the byte count.
import { writeFileSync, existsSync, statSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const out = resolve(import.meta.dirname, '../public/lite-hero.bmp');
const W = 840, H = 832; // 840*832*3 ≈ 2.097 MB
if (existsSync(out) && statSync(out).size > 2_000_000) process.exit(0);

const rowBytes = Math.ceil((W * 3) / 4) * 4;
const pixelBytes = rowBytes * H;
const buf = Buffer.alloc(54 + pixelBytes);
buf.write('BM', 0);
buf.writeUInt32LE(buf.length, 2);
buf.writeUInt32LE(54, 10);
buf.writeUInt32LE(40, 14);
buf.writeInt32LE(W, 18);
buf.writeInt32LE(H, 22);
buf.writeUInt16LE(1, 26);
buf.writeUInt16LE(24, 28);
buf.writeUInt32LE(pixelBytes, 34);
// Diagonal grey stripes, same as the site's placeholder pattern.
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const stripe = Math.floor((x + y) / 8) % 2;
    const v = stripe ? 0xd9 : 0xcf;
    const o = 54 + y * rowBytes + x * 3;
    buf[o] = v; buf[o + 1] = v; buf[o + 2] = v;
  }
}
mkdirSync(resolve(out, '..'), { recursive: true });
writeFileSync(out, buf);
console.log(`lite hero: ${(buf.length / 1048576).toFixed(2)} MB → public/lite-hero.bmp`);
