// Generates public/og-default.png (1200×630) with a hand-rolled PNG encoder and a 5×7 pixel
// font, because the site has no image dependencies and the default OG card should exist.
import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { deflateSync, crc32 } from 'node:zlib';

const out = resolve(import.meta.dirname, '../public/og-default.png');
if (existsSync(out)) process.exit(0);

const W = 1200, H = 630;
const px = Buffer.alloc(W * H * 3, 0xff);
const set = (x: number, y: number, r: number, g: number, b: number) => { if (x < 0 || y < 0 || x >= W || y >= H) return; const o = (y * W + x) * 3; px[o] = r; px[o + 1] = g; px[o + 2] = b; };
const rect = (x: number, y: number, w: number, h: number, c: [number, number, number]) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) set(i, j, ...c); };

const F: Record<string, string[]> = {
  S: ['01110', '10001', '10000', '01110', '00001', '10001', '01110'],
  H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
  I: ['11111', '00100', '00100', '00100', '00100', '00100', '11111'],
  T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  Y: ['10001', '10001', '01010', '00100', '00100', '00100', '00100'],
  N: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  W: ['10001', '10001', '10001', '10101', '10101', '10101', '01010'],
  C: ['01110', '10001', '10000', '10000', '10000', '10001', '01110'],
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  M: ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
  '.': ['00000', '00000', '00000', '00000', '00000', '00000', '00100'],
  ' ': ['00000', '00000', '00000', '00000', '00000', '00000', '00000'],
};
function text(s: string, x: number, y: number, scale: number, colorOf: (i: number) => [number, number, number]) {
  for (let i = 0; i < s.length; i++) {
    const g = F[s[i]!] ?? F[' ']!;
    for (let r = 0; r < 7; r++) for (let c = 0; c < 5; c++) if (g[r]![c] === '1') rect(x + (i * 6 + c) * scale, y + r * scale, scale, scale, colorOf(i));
  }
}
const RED: [number, number, number] = [0xc8, 0x10, 0x2e], INK: [number, number, number] = [0x11, 0x11, 0x11], GREY: [number, number, number] = [0x77, 0x77, 0x77], YEL: [number, number, number] = [0xff, 0xd4, 0x00];

rect(0, 0, W, 14, RED);                        // nav bar
rect(0, H - 90, W, 90, INK); rect(0, H - 90, W, 4, YEL); // ticker
text('SHITTYNEWS.COM', 90, 170, 12, (i) => (i < 6 ? RED : i < 10 ? INK : GREY)); // 14 chars × 6 × 12 = 1008px
text('SABSE PEHLE. SABSE SHITTY.', 90, 330, 5, () => GREY);
text('NOTHING HAPPENED', 90, H - 62, 5, () => YEL);
rect(W - 130, 40, 90, 90, YEL); text('S', W - 115, 55, 12, () => RED);

// PNG encode: 8-bit RGB, filter 0 per row
const raw = Buffer.alloc((W * 3 + 1) * H);
for (let y = 0; y < H; y++) { raw[y * (W * 3 + 1)] = 0; px.copy(raw, y * (W * 3 + 1) + 1, y * W * 3, (y + 1) * W * 3); }
const chunk = (type: string, data: Buffer) => { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type, 'ascii'), data]); const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td) >>> 0); return Buffer.concat([len, td, crc]); };
const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4); ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
mkdirSync(resolve(out, '..'), { recursive: true });
writeFileSync(out, png);
console.log(`og image: ${(png.length / 1024).toFixed(1)} KB → public/og-default.png`);
