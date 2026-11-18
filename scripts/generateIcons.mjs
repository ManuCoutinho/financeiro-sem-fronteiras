import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const PUBLIC_DIR = resolve(fileURLToPath(import.meta.url), '../../public');
const LOGO_PATH = resolve(PUBLIC_DIR, 'logo.svg');
const BACKGROUND = '#fef6e4';
// Ícone maskable: o conteúdo precisa caber no círculo central de 80%.
const MASKABLE_CONTENT_RATIO = 0.82;

const ICONS = [
  { file: 'icon-192.png', size: 192 },
  { file: 'icon-512.png', size: 512 },
  { file: 'apple-touch-icon.png', size: 180 },
];

async function renderSquare(size) {
  return sharp(LOGO_PATH, { density: 300 }).resize(size, size).png().toBuffer();
}

async function renderMaskable(size) {
  const contentSize = Math.round(size * MASKABLE_CONTENT_RATIO);
  const content = await renderSquare(contentSize);
  return sharp({ create: { width: size, height: size, channels: 4, background: BACKGROUND } })
    .composite([{ input: content, gravity: 'center' }])
    .png()
    .toBuffer();
}

function writeFavicon() {
  const logo = readFileSync(LOGO_PATH, 'utf8');
  const favicon = logo.replace(
    '<rect width="512" height="512" fill="#fef6e4"/>',
    '<rect width="512" height="512" rx="112" fill="#fef6e4"/>',
  );
  writeFileSync(resolve(PUBLIC_DIR, 'favicon.svg'), favicon);
}

async function main() {
  for (const { file, size } of ICONS) {
    writeFileSync(resolve(PUBLIC_DIR, file), await renderSquare(size));
  }
  writeFileSync(resolve(PUBLIC_DIR, 'icon-maskable-512.png'), await renderMaskable(512));
  writeFavicon();
}

await main();
