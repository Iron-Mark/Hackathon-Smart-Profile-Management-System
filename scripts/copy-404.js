import fs from 'fs';
import path from 'path';
import { FALLBACK_OG_IMAGE, OG_IMAGE_ALTS } from './og-assets.mjs';

const DEFAULT_SITE_URL = 'https://iron-mark.github.io/Hackathon-Smart-Profile-Management-System/';
const source = path.resolve(process.cwd(), 'dist', 'index.html');
const routeFallbacks = Object.keys(FALLBACK_OG_IMAGE);

function siteUrl() {
  const value = process.env.VITE_SITE_URL?.trim() || DEFAULT_SITE_URL;
  return value.endsWith('/') ? value : `${value}/`;
}

function applyOgTags(html, imageFile) {
  const imageUrl = `${siteUrl()}${imageFile}`;
  const alt = OG_IMAGE_ALTS[imageFile] ?? OG_IMAGE_ALTS['og-image.png'];

  return html
    .replace(
      /(<meta property="og:image" content=")[^"]+("\s*\/?>)/,
      `$1${imageUrl}$2`,
    )
    .replace(
      /(<meta property="og:image:secure_url" content=")[^"]+("\s*\/?>)/,
      `$1${imageUrl}$2`,
    )
    .replace(
      /(<meta property="og:image:alt" content=")[^"]+("\s*\/?>)/,
      `$1${alt}$2`,
    )
    .replace(
      /(<meta name="twitter:image" content=")[^"]+("\s*\/?>)/,
      `$1${imageUrl}$2`,
    )
    .replace(
      /(<meta name="twitter:image:alt" content=")[^"]+("\s*\/?>)/,
      `$1${alt}$2`,
    );
}

if (!fs.existsSync(source)) {
  console.error(`Cannot create 404.html because ${source} does not exist.`);
  process.exit(1);
}

const sourceHtml = fs.readFileSync(source, 'utf8');

for (const fallbackPath of routeFallbacks) {
  const destination = path.resolve(process.cwd(), 'dist', fallbackPath);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  const imageFile = FALLBACK_OG_IMAGE[fallbackPath];
  fs.writeFileSync(destination, applyOgTags(sourceHtml, imageFile));
}

console.log(`Created ${routeFallbacks.length} static SPA fallback files with dedicated Open Graph images.`);
