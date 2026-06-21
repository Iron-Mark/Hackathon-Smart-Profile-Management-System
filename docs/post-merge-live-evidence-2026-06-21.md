# Post-Merge Live Evidence - 2026-06-21

Public URL:

https://iron-mark.github.io/Hackathon-Smart-Profile-Management-System/

## GitHub State

- PR: https://github.com/Iron-Mark/Hackathon-Smart-Profile-Management-System/pull/4
- PR status: merged
- Merge commit: `b36ef57dcdba78de7f3949d958ed2f2d0f6c166d`
- GitHub Pages deploy run: `27891543848`
- Deploy result: `success`
- Deploy completed: 2026-06-21 02:57:13 UTC
- Local working branch after merge: `dev`

## Live GitHub Pages Evidence

- Full live Playwright suite against GitHub Pages: `17 passed`
- Landing page returned HTTP 200 after redeploy.
- Static demo sample files returned HTTP 200:
  - `demo-samples/sample-certificate.svg`
  - `demo-samples/sample-transcript.svg`
  - `demo-samples/sample-diploma.svg`
  - `demo-samples/sample-cv.svg`
  - `demo-samples/sample-research-summary.svg`
- AEO/GEO source files returned HTTP 200:
  - `answers.md`
  - `llms.txt`
  - `sitemap.xml`
  - `robots.txt`
  - `og-image.png`
- Mobile landing probe confirmed:
  - Public Demo Facts section visible
  - Browser-local demo mode visible
  - `answers.md` and `llms.txt` links visible
  - Web Vitals button showed a live count, for example `Web Vitals2/5`
  - Web Vitals panel rendered LCP, FCP, and TTFB values
  - No browser console errors
  - No failed network requests

## Local `dev` QA Evidence

Commands run after the merge while checked out on `dev`:

```powershell
npm ci
npm run lint
npm run security:scan
npm run seo:check
npm run links:check
npm test -- --run
npm audit --json
$env:VITE_DEMO_MODE = 'true'
$env:VITE_BASE_PATH = '/Hackathon-Smart-Profile-Management-System/'
$env:VITE_SITE_URL = 'https://iron-mark.github.io/Hackathon-Smart-Profile-Management-System/'
npm run build
$env:PLAYWRIGHT_BASE_URL = 'http://127.0.0.1:4173'
$env:PLAYWRIGHT_WEB_SERVER_URL = 'http://127.0.0.1:4173/Hackathon-Smart-Profile-Management-System/'
$env:PLAYWRIGHT_WEB_SERVER_COMMAND = 'npm run preview:pages'
$env:PLAYWRIGHT_BASE_PATH = '/Hackathon-Smart-Profile-Management-System/'
npx playwright test --reporter=line
```

Results:

- `npm ci`: completed with 0 vulnerabilities after lockfile refresh
- `npm run lint`: passed
- `npm run security:scan`: passed, no common secret patterns found
- `npm run seo:check`: passed for the canonical GitHub Pages URL
- `npm run links:check`: passed for the canonical GitHub Pages URL
- `npm test -- --run`: 19 test files passed, 46 tests passed
- `npm audit --json`: 0 vulnerabilities
- `npm run build`: passed with GitHub Pages base path and created static SPA fallback files
- Local Pages-style Playwright suite: 17 tests passed

## Polish Audit

- README and public demo docs describe browser-local demo storage, seeded reviewer accounts, sample-file-only safety, AEO/GEO sources, and the live Web Vitals count.
- `docs/images/login.png`, `docs/images/profile.png`, and `docs/images/dashboard.png` exist for README screenshots.
- `public/answers.md` and `public/llms.txt` match the public answer-engine source strategy documented in `docs/seo-readiness.md`.
- `public/demo-samples` contains the five generated reviewer-safe sample files listed in `docs/demo-checklist.md`.
- The local and live sample-link checks cover `sample-diploma.svg`, which previously needed explicit verification after GitHub Pages deploy.

## Residual Notes

- The public site remains a static, browser-local demo. It does not provide production authentication, durable hosted storage, or real faculty-record handling.
- Optional Clerk and OpenAI keys remain local showcase paths only.
- A `v2.1.x` tag can be used as a checkpoint once the owner decides the current evidence and any follow-up docs commit should be part of the release point.
