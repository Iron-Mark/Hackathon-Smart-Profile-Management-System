import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { getRouteSeoMeta } from '../lib/seo';

const siteUrl = 'https://iron-mark.github.io/Hackathon-Smart-Profile-Management-System/';
const siteMapUrl = `${siteUrl}sitemap.xml`;
const answerQuestions = [
  'What is Smart Profile Management System?',
  'Can anyone try the public demo?',
  'Where is public demo data stored?',
  'Should visitors upload real faculty records?',
  'Does the GitHub Pages demo need backend or OpenAI secrets?',
  'Who built the original hackathon project?',
];
type JsonLdNode = { '@type'?: string; [key: string]: unknown };

function readProjectFile(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8');
}

describe('static SEO metadata', () => {
  test('uses the GitHub Pages URL as the canonical public target', () => {
    const html = readProjectFile('index.html');

    expect(html).toContain(`<link rel="canonical" href="${siteUrl}" />`);
    expect(html).toContain(`<meta property="og:url" content="${siteUrl}" />`);
    expect(html).toContain(`<meta property="og:image" content="${siteUrl}og-image.png" />`);
    expect(html).toContain(`<meta name="twitter:image" content="${siteUrl}og-image.png" />`);
    expect(html).not.toContain('https://marksiazon.dev/');
  });

  test('publishes truthful JSON-LD for the app and source repository', () => {
    const html = readProjectFile('index.html');
    const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    const jsonLd = JSON.parse(jsonLdMatch?.[1] ?? '{}');
    const graph: JsonLdNode[] = Array.isArray(jsonLd['@graph']) ? jsonLd['@graph'] : [];

    const app = graph.find((item) => item['@type'] === 'WebApplication');
    const source = graph.find((item) => item['@type'] === 'SoftwareSourceCode');

    expect(app).toMatchObject({
      name: 'Smart Profile Management System',
      url: siteUrl,
      image: `${siteUrl}og-image.png`,
      applicationCategory: 'EducationalApplication',
    });
    expect(String(app?.description)).toContain('browser storage');
    expect(source).toMatchObject({
      codeRepository: 'https://github.com/Iron-Mark/Hackathon-Smart-Profile-Management-System',
    });
  });

  test('publishes answer-engine FAQ JSON-LD that matches public demo questions', () => {
    const html = readProjectFile('index.html');
    const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    const jsonLd = JSON.parse(jsonLdMatch?.[1] ?? '{}');
    const graph: JsonLdNode[] = Array.isArray(jsonLd['@graph']) ? jsonLd['@graph'] : [];
    const faqPage = graph.find((item) => item['@type'] === 'FAQPage');
    const mainEntity = Array.isArray(faqPage?.mainEntity) ? faqPage.mainEntity : [];
    const questions = mainEntity.map((item: { name?: string }) => item.name);

    expect(questions).toEqual(answerQuestions);
    expect(JSON.stringify(faqPage)).toContain('browser-local');
    expect(JSON.stringify(faqPage)).toContain('sample files');
  });

  test('publishes discoverable sitemap URLs for landing and answer sources', () => {
    const sitemap = readProjectFile('public/sitemap.xml');

    expect(sitemap).toContain(`<loc>${siteUrl}</loc>`);
    expect(sitemap).toContain(`<loc>${siteUrl}answers.md</loc>`);
    expect(sitemap).toContain(`<loc>${siteUrl}llms.txt</loc>`);
    expect(sitemap).not.toContain('/auth/');
    expect(sitemap).not.toContain('/admin/');
    expect(sitemap).not.toContain('/faculty/');
    expect(sitemap).not.toContain('/demo-storage/');
    expect(sitemap).not.toContain('marksiazon.dev');
  });

  test('points robots.txt to the same sitemap and avoids stale hosts', () => {
    const robots = readProjectFile('public/robots.txt');

    expect(robots).toContain(`Sitemap: ${siteMapUrl}`);
    expect(robots).toContain('User-agent: OAI-SearchBot');
    expect(robots).toContain('User-agent: Google-Extended');
    expect(robots).toContain('Allow: /Hackathon-Smart-Profile-Management-System/answers.md');
    for (const userAgent of [
      'OAI-SearchBot',
      'GPTBot',
      'ChatGPT-User',
      'ClaudeBot',
      'PerplexityBot',
      'CCBot',
      'Google-Extended',
    ]) {
      const group = robots.match(new RegExp(`User-agent: ${userAgent}[\\s\\S]*?(?=\\nUser-agent:|\\nSitemap:|$)`))?.[0] ?? '';
      expect(group).toContain('Disallow: /Hackathon-Smart-Profile-Management-System/auth/');
      expect(group).toContain('Disallow: /Hackathon-Smart-Profile-Management-System/admin/');
      expect(group).toContain('Disallow: /Hackathon-Smart-Profile-Management-System/faculty/');
      expect(group).toContain('Disallow: /Hackathon-Smart-Profile-Management-System/demo-storage/');
    }
    expect(robots).not.toContain('marksiazon.dev');
  });

  test('keeps AI crawler guidance factual for the public demo', () => {
    const llms = readProjectFile('public/llms.txt');
    const answers = readProjectFile('public/answers.md');

    expect(llms).toContain('browser-local');
    expect(llms).toContain('/answers.md');
    expect(llms).toContain('sample files');
    expect(llms).not.toContain('production-grade');
    expect(llms).not.toContain('elite engineering trio');
    expect(answers).toContain('# Answer Engine Summary');
    expect(answers).toContain('browser-local');
    expect(answers).toContain('sample files');
  });

  test('declares route metadata for public and private SPA routes', () => {
    expect(getRouteSeoMeta('/')).toMatchObject({
      title: 'Smart Profile Management System | Public Demo',
      indexable: true,
    });
    expect(getRouteSeoMeta('/auth/register')).toMatchObject({
      title: 'Register | Smart Profile Management System',
      indexable: false,
    });
    expect(getRouteSeoMeta('/admin/dashboard')).toMatchObject({
      title: 'Admin Workspace | Smart Profile Management System',
      indexable: false,
    });
    expect(getRouteSeoMeta('/demo-storage')).toMatchObject({
      title: 'Demo File Preview | Smart Profile Management System',
      indexable: false,
    });
  });
});
