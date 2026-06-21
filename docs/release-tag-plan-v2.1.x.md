# v2.1.x Release Tag Plan

Use this plan if the current GitHub Pages state should become a durable checkpoint.

## Recommended Tag

- Tag name: `v2.1.1`
- Target commit: latest verified `main` after the post-merge evidence docs and lockfile audit refresh are committed and merged
- Release type: patch checkpoint
- Release title: `v2.1.1 - Public demo QA checkpoint`

## Why This Is Patch-Level

- No new product workflow is introduced beyond the already merged public demo hardening.
- The release checkpoint is primarily verification, documentation, CI/live-QA evidence, and a dev-only lockfile audit refresh.
- Public behavior remains the restored static GitHub Pages demo for faculty credential upload, admin approval, browser-local data, sample files, and local Web Vitals reporting.

## Before Tagging

1. Commit the current evidence docs and lockfile audit refresh on `dev`.
2. Open a small PR from `dev` to `main`.
3. Confirm CI passes.
4. Merge the PR into `main`.
5. Wait for GitHub Pages redeploy.
6. Rerun the live GitHub Pages Playwright suite.
7. Confirm these live URLs return HTTP 200:
   - `/`
   - `/demo-samples/sample-certificate.svg`
   - `/demo-samples/sample-transcript.svg`
   - `/demo-samples/sample-diploma.svg`
   - `/demo-samples/sample-cv.svg`
   - `/demo-samples/sample-research-summary.svg`
   - `/answers.md`
   - `/llms.txt`
   - `/sitemap.xml`
   - `/robots.txt`
   - `/og-image.png`

## Tag Commands

Run these only after the verified release commit is on `main`:

```bash
git switch main
git pull --ff-only origin main
git tag -a v2.1.1 -m "v2.1.1 - Public demo QA checkpoint"
git push origin v2.1.1
```

## GitHub Release Notes Draft

```markdown
## Summary

- Captures the verified GitHub Pages public demo state after PR #4.
- Documents live deploy evidence, local `dev` QA evidence, sample asset checks, AEO/GEO source checks, and Web Vitals behavior.
- Refreshes dev-only transitive lockfile packages so `npm audit` reports 0 vulnerabilities.

## Verification

- GitHub Pages deploy completed successfully.
- Full live Playwright suite passed against GitHub Pages.
- Local `dev` QA passed: install, lint, secret scan, SEO check, link check, Vitest, audit, production build, and Pages-style Playwright.
- Public sample files, `answers.md`, `llms.txt`, sitemap, robots, and Open Graph image returned HTTP 200.

## Safety

- Public demo data remains browser-local.
- Reviewers should use generated sample files only.
- No backend secrets are required for the public GitHub Pages build.
```

## Do Not Tag Yet If

- There are uncommitted verification artifacts in the working tree.
- GitHub Pages has not redeployed from the target `main` commit.
- The live Playwright suite has not passed against the deployed URL.
- The owner wants a different version number or wants to bundle more changes before the checkpoint.
