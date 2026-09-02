# Release Status

Current public showcase:

https://iron-mark.github.io/Hackathon-Smart-Profile-Management-System/

## Current Release

- Latest documented checkpoint: `v2.1.1`
- GitHub release: https://github.com/Iron-Mark/Hackathon-Smart-Profile-Management-System/releases/tag/v2.1.1
- Release commit: `09573665db005f4a1114dcaf9606886a7cfbc73f`
- Public runtime model: static GitHub Pages app with browser-local demo storage

## What The Release Captures

- Faculty credential upload, admin review, approval tracking, and faculty status visibility.
- Seeded reviewer accounts plus browser-local public registration.
- Browser-local submissions, audit logs, upload metadata, profile data, and small file previews.
- Generated sample credentials only. Public reviewers should not upload real IDs, transcripts, licenses, or faculty records.
- Optional local Clerk sign-in/sign-up showcase; admin access remains the seeded admin demo account.
- Optional local OpenAI experimentation; missing keys use deterministic demo fallbacks.
- Public SEO/AEO/GEO sources through landing-page facts, FAQ JSON-LD, `answers.md`, `llms.txt`, sitemap, robots, and social preview metadata.
- Local Web Vitals panel backed by the official `web-vitals` package.

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
- This is local verification evidence only. It does not replace the documented `v2.1.1` public release or claim a new deployment.

## Unreleased Branch Work

Product work from PRs #29 and #31 is on `main` (first landed in `0b855b1`, 2026-09-02) but is **not** the public Pages checkpoint yet. The live URL still matches the 2026-08-10 deployment.

The Pages dispatcher from #35/#36 is now on `main` (`5e37508`). The next trusted `main` ← `dev` merge should dispatch **Deploy to GitHub Pages**.

Until a Pages run for current `main` succeeds and the live URL is re-checked:

- Light and dark CCIS green chrome with a public theme toggle. The landing hero stays a dark branded band in both modes.
- Web Vitals button stays clickable above the login/register demo access panel.
- Marketing README plus refreshed `docs/images/` stills, `docs/media/` preview GIF, feature GIFs, silent demo MP4, and dedicated 1200x630 Open Graph cards in `public/og/`.

These do **not** replace `v2.1.1` until they are deployed and re-checked against the live URL. The next documented tag after that check must be newer than `v2.1.2`.

## Last Recorded Live Evidence

The `v2.1.1` checkpoint was previously verified against GitHub Pages with:

- Full live Playwright suite: `17 passed`
- Landing page and app deep links returning HTTP 200 through static fallbacks
- Generated sample files returning HTTP 200
- `answers.md`, `llms.txt`, `sitemap.xml`, `robots.txt`, and `og-image.png` returning HTTP 200
- Mobile landing and faculty dashboard smoke checks
- No required backend secrets for the public build

Treat these as release evidence for the historical checkpoint. Re-run the verification gate before making a fresh current-state claim.

## Release Safety Notes

- This repository is a static public demo, not production authentication, authorization, audit logging, or document storage.
- Uploaded demo files and account state stay in the visitor's current browser.
- Clerk Organizations are showcase context only and do not grant admin access.
- Browser-exposed OpenAI keys are for local experimentation only; production use would require a server-side proxy.

## GitHub Pages Deploy Trigger

GitHub does not start new workflows from `push` events created by `GITHUB_TOKEN`. Trusted auto-merge therefore does **not** run `Deploy to GitHub Pages` on its own.

After a `main` ← `dev` merge, Trusted PR Lifecycle waits until the pull request is merged, then dispatches `Deploy to GitHub Pages` on `main`. A human merge of `dev` into `main` still deploys through the normal `push` trigger.

This dispatch only runs from the workflow file already on `main`. It landed in PR #36 (`5e37508`, 2026-09-02); that promotion itself did not publish because the old lifecycle performed the merge. Follow-up promotions can dispatch Pages.

## Future Release Checklist

1. Confirm the worktree is clean except intended release changes.
2. Run the full verification gate.
3. Build and test with the GitHub Pages base path from `docs/demo-checklist.md`.
4. Merge the verified branch into the publish branch.
5. Wait for GitHub Pages deployment to finish (Actions: **Deploy to GitHub Pages** on `main`). If the promotion was auto-merged, confirm the lifecycle job dispatched that workflow.
6. Re-run the live Playwright suite against the public URL.
7. Confirm public assets and sample files return HTTP 200.
8. Tag only the verified commit. Do not reuse `v2.1.2` (that tag already points at the June 2026 cleanup checkpoint).
