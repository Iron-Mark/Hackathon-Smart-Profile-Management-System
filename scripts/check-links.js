import fs from 'fs';
import path from 'path';

const DEFAULT_SITE_URL = 'https://iron-mark.github.io/Hackathon-Smart-Profile-Management-System/';
const REQUIRED_PUBLIC_ASSETS = [
  'answers.md',
  'demo-samples/sample-certificate.svg',
  'demo-samples/sample-cv.svg',
  'demo-samples/sample-diploma.svg',
  'demo-samples/sample-research-summary.svg',
  'demo-samples/sample-transcript.svg',
  'fav-icon.png',
  'llms.txt',
  'og-image.png',
  'pwa-192x192.png',
  'pwa-512x512.png',
  'robots.txt',
  'sitemap.xml',
];
const DOC_FILES = [
  'PUBLIC_DEMO.md',
  'README.md',
  'docs/demo-checklist.md',
  'docs/PUBLIC_DEMO.md',
  'docs/post-deploy-review.md',
  'docs/seo-readiness.md',
];
const REQUIRED_DIST_FALLBACKS = [
  '404.html',
  'admin/accounts/index.html',
  'admin/approvals/index.html',
  'admin/audit-logs/index.html',
  'admin/dashboard/index.html',
  'admin/help/index.html',
  'admin/reports/index.html',
  'admin/settings/index.html',
  'auth/login/index.html',
  'auth/register/index.html',
  'demo-storage/index.html',
  'faculty/dashboard/index.html',
  'faculty/profile/index.html',
  'faculty/settings/index.html',
  'faculty/uploaded/index.html',
];
const ROOT_RELATIVE_DOC_PATHS = [
  '/admin/',
  '/auth/',
  '/demo-storage/',
  '/demo-samples/',
  '/faculty/',
  '/sitemap.xml',
  '/robots.txt',
  '/llms.txt',
  '/answers.md',
  '/og-image.png',
];

function readText(filePath) {
  return fs.readFileSync(path.resolve(process.cwd(), filePath), 'utf8');
}

function readEnvValue(varName) {
  if (process.env[varName]) return process.env[varName];

  for (const envFile of ['.env.local', '.env', '.env.example']) {
    const envPath = path.resolve(process.cwd(), envFile);
    if (!fs.existsSync(envPath)) continue;

    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(new RegExp(`^${varName}=(.*)$`, 'm'));
    if (match?.[1]) return match[1].trim().replace(/^['"]|['"]$/g, '');
  }

  return undefined;
}

function normalizeSiteUrl(value) {
  const siteUrl = (value || DEFAULT_SITE_URL).trim();
  return siteUrl.endsWith('/') ? siteUrl : `${siteUrl}/`;
}

function getBasePath(siteUrl) {
  return new URL(siteUrl).pathname.replace(/\/$/, '');
}

function toDistPath(projectUrl, basePath) {
  if (!projectUrl.startsWith(`${basePath}/`)) return null;

  const relativePath = projectUrl.slice(basePath.length + 1);
  return path.resolve(process.cwd(), 'dist', relativePath || 'index.html');
}

function collectHtmlLinks(html) {
  return [
    ...html.matchAll(/\s(?:href|src)="([^"]+)"/g),
    ...html.matchAll(/\scontent="([^"]+)"/g),
  ]
    .map((match) => match[1])
    .filter((value) => value.startsWith('/'));
}

function checkLinks() {
  const errors = [];
  const siteUrl = normalizeSiteUrl(readEnvValue('VITE_SITE_URL'));
  const basePath = getBasePath(siteUrl);

  for (const assetPath of REQUIRED_PUBLIC_ASSETS) {
    const publicPath = path.resolve(process.cwd(), 'public', assetPath);
    if (!fs.existsSync(publicPath)) {
      errors.push(`Missing public asset: public/${assetPath}`);
    }
  }

  const sourceHtml = readText('index.html');
  for (const badRootAsset of ['/fav-icon.png', '/pwa-192x192.png']) {
    if (sourceHtml.includes(`href="${badRootAsset}"`) || sourceHtml.includes(`src="${badRootAsset}"`)) {
      errors.push(`index.html contains project-hostile root asset path: ${badRootAsset}`);
    }
  }

  for (const docFile of DOC_FILES) {
    if (!fs.existsSync(path.resolve(process.cwd(), docFile))) continue;

    const content = readText(docFile);
    for (const rootPath of ROOT_RELATIVE_DOC_PATHS) {
      const markdownLiteral = `\`${rootPath}`;
      if (content.includes(markdownLiteral)) {
        errors.push(`${docFile} still documents root-relative GitHub Pages path ${rootPath}`);
      }
    }
  }

  const distIndex = path.resolve(process.cwd(), 'dist/index.html');
  if (fs.existsSync(distIndex)) {
    const builtHtml = readText('dist/index.html');
    const builtLinks = collectHtmlLinks(builtHtml);

    for (const fallbackPath of REQUIRED_DIST_FALLBACKS) {
      const distPath = path.resolve(process.cwd(), 'dist', fallbackPath);
      if (!fs.existsSync(distPath)) {
        errors.push(`Missing static SPA fallback: dist/${fallbackPath}`);
      }
    }

    for (const builtLink of builtLinks) {
      if (!builtLink.startsWith(`${basePath}/`)) {
        errors.push(`dist/index.html contains host-root link outside ${basePath}: ${builtLink}`);
        continue;
      }

      const distPath = toDistPath(builtLink, basePath);
      const isAppRoute = !path.extname(builtLink);
      if (!isAppRoute && distPath && !fs.existsSync(distPath)) {
        errors.push(`dist/index.html references missing built asset: ${builtLink}`);
      }
    }
  }

  if (errors.length > 0) {
    console.error('Link check failed:');
    errors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
  }

  console.log(`Link check passed for ${siteUrl}`);
}

checkLinks();
