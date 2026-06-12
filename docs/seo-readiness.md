# SEO Readiness

## Canonical URL

The public showcase canonical URL is:

https://iron-mark.github.io/Hackathon-Smart-Profile-Management-System/

Set the same value in `VITE_SITE_URL` for local checks and deployment builds.

## Indexing Policy

Indexable:

- `/` - public landing page and showcase entry point.

Intentionally noindexed after React renders:

- `/auth/*`
- `/admin/*`
- `/faculty/*`
- `/demo-storage/*`
- unknown app routes

The app routes still work for reviewers, but they should not be treated as public search pages.

## Static SEO Files

- `index.html` contains canonical, robots, Open Graph, Twitter card, JSON-LD, and no-script fallback metadata.
- `public/sitemap.xml` includes only the canonical landing page.
- `public/robots.txt` points crawlers to the sitemap and avoids intentional indexing of private app routes.
- `public/llms.txt` gives AI crawlers factual project context without production overclaims.
- `public/answers.md` provides concise answer-engine facts for AEO/GEO-style summaries.
- `public/og-image.png` is the 1200x630 social preview image.

## AEO And GEO Readiness

For this repo, AEO means answer-engine optimization and GEO means generative-engine optimization.

Implemented signals:

- Visible **Public Demo Facts** content on the landing page.
- Matching `FAQPage` JSON-LD in `index.html`.
- `llms.txt` with factual project context.
- `answers.md` with concise question-and-answer summaries.
- `robots.txt` entries for common AI/search crawlers, including `OAI-SearchBot`, `GPTBot`, `ChatGPT-User`, and `Google-Extended`.

This does not guarantee inclusion in Google AI Overviews, AI Mode, ChatGPT Search, Perplexity, Claude, or other answer engines. It makes the public showcase easier to crawl, quote, and summarize accurately.

## GitHub Pages Limitation

This repo is deployed as a GitHub Pages project site under a path. Search engines normally look for `robots.txt` at the host root, so `https://iron-mark.github.io/robots.txt` is stronger than a project-level `robots.txt` file. The project-level files are still useful for reviewers, link checkers, and future custom-domain migration.

For stronger SEO, move the showcase to a custom domain or a root-hosted site where `robots.txt` and `sitemap.xml` live at the domain root.

## Verification

Run:

```bash
npm run seo:check
```

After deployment, submit the sitemap in Google Search Console if the repository owner wants the showcase indexed:

```text
https://iron-mark.github.io/Hackathon-Smart-Profile-Management-System/sitemap.xml
```
