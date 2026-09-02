# Release Status

Current public showcase:

https://iron-mark.github.io/Hackathon-Smart-Profile-Management-System/

## Current Release

- Latest documented checkpoint: `v2.1.3`
- GitHub tag: https://github.com/Iron-Mark/Hackathon-Smart-Profile-Management-System/releases/tag/v2.1.3
- Release commit: `b24fa02e3d8684915dacc4031fe8c02a03271e93` (merge of PR #42)
- Public runtime model: static GitHub Pages app with browser-local demo storage
- `v2.1.2` remains the June 2026 cleanup tag (`bde37623`) and is not this checkpoint

## What The Release Captures

- Faculty credential upload, admin review, approval tracking, and faculty status visibility.
- Seeded reviewer accounts plus browser-local public registration.
- Browser-local submissions, audit logs, upload metadata, profile data, and small file previews.
- Generated sample credentials only. Public reviewers should not upload real IDs, transcripts, licenses, or faculty records.
- Optional local Clerk sign-in/sign-up showcase; admin access remains the seeded admin demo account.
- Optional local OpenAI experimentation; missing keys use deterministic demo fallbacks.
- Public SEO/AEO/GEO sources through landing-page facts, FAQ JSON-LD, `answers.md`, `llms.txt`, sitemap, robots, and social preview metadata.
- Dedicated 1200×630 Open Graph cards in `public/og/` composed from the CCIS seal and product stills, plus default `og-image.png`.
- Marketing README stills, looping preview GIF, per-feature GIFs, and silent demo MP4.
- Light and dark CCIS green chrome with a public theme toggle. The landing hero stays a dark branded band in both modes.
- Local Web Vitals panel backed by the official `web-vitals` package. The Web Vitals button stays clickable above the login/register demo access panel.
- Trusted `main` ← `dev` merges dispatch **Deploy to GitHub Pages** through the Actions API so `GITHUB_TOKEN` auto-merge still publishes the demo.

## Verification Gate

Run the local gate before tagging, publishing, or claiming a release is current:

```bash
npm ci
npm test -- --run
npm run lint
npm run security:scan
npm run seo:check
npm run links:check
npm run build
npx playwright test
```

For GitHub Pages-style local QA, use the build preview commands in `docs/demo-checklist.md`.

## 2026-08-10 Local Dependency Checkpoint

- Branch: `agent/dependency-security`, based on `dev`.
- Refreshed the lockfile to resolve `nanoid` 3.3.18 and `undici` 7.29.0, removing the two high-severity findings present in the development snapshot.
- `npm audit` reports zero vulnerabilities.
- The full local gate passed: 21 Vitest files with 52 tests, ESLint, secret scanning, SEO and link checks, the GitHub Pages production build, and 26 Chromium Playwright tests.
- This is historical local verification evidence only.

## Last Recorded Live Evidence

`v2.1.3` was verified against GitHub Pages on 2026-09-02 after workflow_dispatch run `33629926878` (triggered by Trusted PR Lifecycle after PR #42):

- `og-image.png` `Last-Modified: Wed, 02 Sep 2026 12:27:02 GMT`, 1200×630, 346315 bytes
- `/og/login.png`, `/og/faculty.png`, `/og/approvals.png`, `/og/landing.png` HTTP 200 and 1200×630
- Landing, `sitemap.xml`, `robots.txt`, `llms.txt`, `answers.md`, sample SVGs, and `fav-icon.png` HTTP 200
- `npm run smoke:live`: 9 passed (deep links, SEO including dedicated OG paths, public demo responsive)
- Additional live Playwright: 11 passed (`tests/demo-flow.spec.ts`, `tests/theme-contrast.spec.ts`, `tests/web-vitals.spec.ts`) covering faculty upload → admin approve, theme toggle, and Web Vitals
- No required backend secrets for the public build

## Release Safety Notes

- This repository is a static public demo, not production authentication, authorization, audit logging, or document storage.
- Uploaded demo files and account state stay in the visitor's current browser.
- Clerk Organizations are showcase context only and do not grant admin access.
- Browser-exposed OpenAI keys are for local experimentation only; production use would require a server-side proxy.

## GitHub Pages Deploy Trigger

GitHub does not start new workflows from `push` events created by `GITHUB_TOKEN`. Trusted auto-merge therefore does **not** run `Deploy to GitHub Pages` on its own.

After a `main` ← `dev` merge, Trusted PR Lifecycle waits until the pull request is merged, then creates a `workflow_dispatch` on `deploy.yml` through the Actions API (`ref: main`). The lifecycle job has no git checkout, so `gh workflow run` cannot be used. A human merge of `dev` into `main` still deploys through the normal `push` trigger.

This path succeeded for PR #42 (`b24fa02`, 2026-09-02). Earlier promotions #38 and #40 failed while `main` still called `gh workflow run`.

## Future Release Checklist

1. Confirm the worktree is clean except intended release changes.
2. Run the full verification gate.
3. Build and test with the GitHub Pages base path from `docs/demo-checklist.md`.
4. Merge the verified branch into the publish branch.
5. Wait for GitHub Pages deployment to finish (Actions: **Deploy to GitHub Pages** on `main`). If the promotion was auto-merged, confirm the lifecycle job dispatched that workflow.
6. Re-run the live Playwright suite against the public URL.
7. Confirm public assets and sample files return HTTP 200.
8. Tag only the verified commit. Do not reuse `v2.1.2` (that tag already points at the June 2026 cleanup checkpoint).
