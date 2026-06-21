# Post-Deploy Review

Date: 2026-06-21

Public URL:

https://iron-mark.github.io/Hackathon-Smart-Profile-Management-System/

## Current Public Status

- GitHub Pages deployment is live from PR #4 merge commit `b36ef57dcdba78de7f3949d958ed2f2d0f6c166d`.
- Landing page, static SEO assets, generated sample files, and static SPA deep links return HTTP 200.
- Auth, admin, faculty, and demo-storage app routes render through the restored static fallback strategy.
- Full Playwright demo coverage passed against the live GitHub Pages site.
- Latest detailed evidence: `docs/post-merge-live-evidence-2026-06-21.md`.

## Showcase Notes

- Use the public URL above when sharing the project.
- Public visitors can register with any valid email in browser-local demo mode.
- Demo data stays in the visitor's browser storage.
- Reviewers should use generated sample files only, not real IDs, licenses, transcripts, or faculty records.
- Social previews should use `public/og-image.png`.

## Automation Notes

- CI should run lint, secret scan, SEO checks, a Pages-style build, public link checks, unit tests, and the Pages-style Playwright suite.
- The deploy workflow should block publishing if `npm run links:check` fails after the Pages-style build.
- GitHub Actions workflows use current official action majors and Node 24 for CI/deploy runtime readiness.

## Mobile Review

- Mobile landing and faculty dashboard were checked with Playwright screenshots at 390px width.
- The Web Vitals trigger is icon-only on mobile to avoid covering landing-page sample links.
- The faculty dashboard upload area remains reachable on mobile.
- The live Web Vitals button reports the current collected-metric count and opens a panel with real LCP, FCP, and TTFB values when available.
