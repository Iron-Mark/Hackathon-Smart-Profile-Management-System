import fs from 'fs';
import path from 'path';

const DEFAULT_SITE_URL = 'https://iron-mark.github.io/Hackathon-Smart-Profile-Management-System/';
const FORBIDDEN_SITEMAP_PATHS = ['/auth/', '/admin/', '/faculty/', '/demo-storage/'];
const STALE_HOSTS = ['marksiazon.dev'];
const ANSWER_QUESTIONS = [
  'What is Smart Profile Management System?',
  'Can anyone try the public demo?',
  'Where is public demo data stored?',
  'Should visitors upload real faculty records?',
  'Does the GitHub Pages demo need Supabase or OpenAI secrets?',
  'Who built the original hackathon project?',
];

function readText(filePath) {
  return fs.readFileSync(path.resolve(process.cwd(), filePath), 'utf8');
}

function normalizeSiteUrl(value) {
  const siteUrl = (value || DEFAULT_SITE_URL).trim();
  return siteUrl.endsWith('/') ? siteUrl : `${siteUrl}/`;
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

function getMetaContent(html, selector) {
  const regex = new RegExp(`<meta\\s+${selector}\\s+content="([^"]+)"\\s*/?>`, 'i');
  return html.match(regex)?.[1];
}

function getJsonLd(html) {
  const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);
  if (!match?.[1]) return null;
  return JSON.parse(match[1]);
}

function getPngDimensions(filePath) {
  const buffer = fs.readFileSync(path.resolve(process.cwd(), filePath));
  const pngSignature = '89504e470d0a1a0a';
  if (buffer.subarray(0, 8).toString('hex') !== pngSignature) {
    return null;
  }

  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

function checkSeo() {
  const errors = [];
  const siteUrl = normalizeSiteUrl(readEnvValue('VITE_SITE_URL'));
  const sitemapUrl = `${siteUrl}sitemap.xml`;
  const socialImageUrl = `${siteUrl}og-image.png`;

  const html = readText('index.html');
  const robots = readText('public/robots.txt');
  const sitemap = readText('public/sitemap.xml');
  const llms = readText('public/llms.txt');
  const answers = readText('public/answers.md');

  if (!html.includes(`<link rel="canonical" href="${siteUrl}" />`)) {
    errors.push(`index.html canonical does not match ${siteUrl}`);
  }

  if (getMetaContent(html, 'name="robots"') !== 'index,follow,max-image-preview:large') {
    errors.push('index.html must expose indexable robots metadata for the landing page');
  }

  if (getMetaContent(html, 'property="og:url"') !== siteUrl) {
    errors.push('og:url must match VITE_SITE_URL');
  }

  if (getMetaContent(html, 'property="og:image"') !== socialImageUrl) {
    errors.push('og:image must use an absolute public URL');
  }

  if (getMetaContent(html, 'name="twitter:image"') !== socialImageUrl) {
    errors.push('twitter:image must use an absolute public URL');
  }

  const jsonLd = getJsonLd(html);
  const graph = Array.isArray(jsonLd?.['@graph']) ? jsonLd['@graph'] : [];
  const webApplication = graph.find((item) => item['@type'] === 'WebApplication');
  const sourceCode = graph.find((item) => item['@type'] === 'SoftwareSourceCode');

  if (webApplication?.url !== siteUrl) {
    errors.push('JSON-LD WebApplication url must match VITE_SITE_URL');
  }

  if (webApplication?.image !== socialImageUrl) {
    errors.push('JSON-LD WebApplication image must match og-image URL');
  }

  if (sourceCode?.codeRepository !== 'https://github.com/Iron-Mark/Hackathon-Smart-Profile-Management-System') {
    errors.push('JSON-LD SoftwareSourceCode must include the public repository URL');
  }

  const faqPage = graph.find((item) => item['@type'] === 'FAQPage');
  const faqQuestions = Array.isArray(faqPage?.mainEntity)
    ? faqPage.mainEntity.map((item) => item.name)
    : [];

  if (JSON.stringify(faqQuestions) !== JSON.stringify(ANSWER_QUESTIONS)) {
    errors.push('JSON-LD FAQPage must include the public demo answer questions in order');
  }

  const faqContent = JSON.stringify(faqPage ?? {});
  if (!faqContent.includes('browser-local') || !faqContent.includes('sample files')) {
    errors.push('JSON-LD FAQPage must describe browser-local data and sample-file guidance');
  }

  const sitemapLocations = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
  if (sitemapLocations.length !== 1 || sitemapLocations[0] !== siteUrl) {
    errors.push('sitemap.xml must include only the public landing page URL');
  }

  for (const forbiddenPath of FORBIDDEN_SITEMAP_PATHS) {
    if (sitemap.includes(forbiddenPath)) {
      errors.push(`sitemap.xml must not include app route ${forbiddenPath}`);
    }
  }

  if (!robots.includes(`Sitemap: ${sitemapUrl}`)) {
    errors.push(`robots.txt must point to ${sitemapUrl}`);
  }

  for (const requiredRobotRule of [
    'User-agent: OAI-SearchBot',
    'User-agent: GPTBot',
    'User-agent: ChatGPT-User',
    'User-agent: Google-Extended',
    'Allow: /Hackathon-Smart-Profile-Management-System/answers.md',
  ]) {
    if (!robots.includes(requiredRobotRule)) {
      errors.push(`robots.txt missing AEO/GEO crawler rule: ${requiredRobotRule}`);
    }
  }

  for (const staleHost of STALE_HOSTS) {
    for (const [label, content] of [
      ['index.html', html],
      ['robots.txt', robots],
      ['sitemap.xml', sitemap],
      ['llms.txt', llms],
      ['answers.md', answers],
    ]) {
      if (content.includes(staleHost)) {
        errors.push(`${label} still references stale host ${staleHost}`);
      }
    }
  }

  if (!llms.includes('browser-local') || !llms.includes('sample files') || !llms.includes('/answers.md')) {
    errors.push('llms.txt must explain browser-local demo behavior, sample-file guidance, and answers.md');
  }

  if (llms.includes('production-grade') || llms.includes('elite engineering trio')) {
    errors.push('llms.txt must avoid overclaiming public demo readiness');
  }

  if (!answers.includes('# Answer Engine Summary')) {
    errors.push('answers.md must expose a concise answer-engine summary');
  }

  for (const answerQuestion of ANSWER_QUESTIONS) {
    if (!answers.includes(`### ${answerQuestion}`)) {
      errors.push(`answers.md missing answer question: ${answerQuestion}`);
    }
  }

  if (!answers.includes('browser-local') || !answers.includes('sample files')) {
    errors.push('answers.md must describe browser-local data and sample-file guidance');
  }

  const dimensions = getPngDimensions('public/og-image.png');
  if (!dimensions || dimensions.width !== 1200 || dimensions.height !== 630) {
    errors.push('public/og-image.png must be a 1200x630 PNG');
  }

  if (errors.length > 0) {
    console.error('SEO check failed:');
    errors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
  }

  console.log(`SEO check passed for ${siteUrl}`);
}

checkSeo();
