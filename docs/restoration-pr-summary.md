# PR Summary: Restore Local Demo Workflow

## Summary

- Restores the stale 7th CCIS Hackathon app into a locally runnable Vite/React application with browser-local demo auth, storage, seeded data, and the core faculty upload to admin approval flow.
- Modernizes install/build tooling so `npm ci`, lint, tests, production build, Docker build inputs, and CI scripts no longer rely on legacy peer dependency workarounds or Unix-only copy commands.
- Adds meaningful Vitest and Playwright coverage for demo auth, route protection, AI/OCR fallbacks, and the end-to-end faculty/admin workflow.
- Documents demo-only setup, SEO readiness, and the public showcase limitations without requiring a hosted backend.

## Review Notes

- Demo mode is the only supported runtime path. `VITE_DEMO_MODE=true` remains in `.env.example` as an explicit showcase flag.
- GitHub Pages is configured to deploy the showcase build with `VITE_DEMO_MODE=true`.
- Public demo registration accepts any valid email address and creates a browser-local faculty account.
- Duplicate public demo registrations now show a clear `Email already registered` message.
- Demo storage View actions now open an in-app preview route that works under the GitHub Pages base path.
- Faculty Uploaded Files View actions are now covered by the main demo flow.
- Expected invalid demo-login attempts after Reset demo data no longer emit browser console errors.
- The faculty upload area now warns public demo visitors to use sample files only.
- Landing now has a Start demo shortcut, Browser-local demo mode badge, sample credential links, and a local Web Vitals panel.
- Authenticated faculty/admin pages now expose Clear demo data in the sidebar.
- Login now exposes quick-fill seeded demo accounts, and auth screens can reset browser-local demo state.
- `npm run preview:pages` serves the built `dist` output under the GitHub Pages repository base path for local pre-deploy QA.
- `npm run security:scan` checks source files for common private key and token patterns.
- `npm run seo:check` validates the GitHub Pages canonical URL, crawler files, JSON-LD, social preview metadata, and 1200x630 Open Graph image.
- The public landing page is the only sitemap URL; auth, admin, faculty, and demo-storage routes are marked `noindex,nofollow` after render.
- `public/llms.txt` now describes the browser-local public demo and sample-file guidance without production-readiness overclaims.
- AEO/GEO readiness adds a visible Public Demo Facts section, matching FAQ JSON-LD, `answers.md`, and AI crawler guidance for concise answer-engine summaries.
- OpenAI is optional for local restoration. Missing keys use deterministic fallbacks so reviewers can run the app without private secrets.
- The former browser OpenAI SDK dependency was replaced with `fetch`, and dead Cohere-era code was removed.
- Vite build output is now split into reviewable vendor and route chunks instead of one oversized application bundle.
- The former hosted-backend setup notes and SQL bootstrap files were removed because this branch is now a demo-only GitHub Pages showcase.
- Browser-local registration creates only local demo faculty accounts in the visitor's current browser.
- Uploaded preview files and file metadata stay in browser-local demo storage and are not sent to a hosted document store.

## Test Plan

- `npm ci` -> 718 packages installed, 0 vulnerabilities.
- `npm test -- --run` -> 15 test files passed, 38 tests passed. The current Node/Vitest runtime emits a non-fatal `--localstorage-file` warning.
- `npm run lint` -> completed with 0 warnings and 0 errors.
- `npm run security:scan` -> no common secret patterns found.
- `npm run seo:check` -> SEO check passed for the GitHub Pages canonical URL.
- GitHub Pages-style `npm run build` -> TypeScript and Vite build passed; `dist/404.html` created; route chunks and `web-vitals` chunk emitted; no large chunk warning.
- Focused SEO Playwright smoke -> 2 Chromium tests passed against the dev server.
- GitHub Pages-style build plus `npm run preview:pages` -> 14 Chromium tests passed against built `dist` at `/Hackathon-Smart-Profile-Management-System/`.
- npm install audit from `npm ci` -> 0 vulnerabilities.
- `git diff --check` -> exit 0; only Windows LF-to-CRLF notices.
- Strict secret-pattern scan for OpenAI, backend secret, and npm token shapes -> no matches in repo files outside generated dependency/build/test output folders.

## Follow-Up Work

- Choose and implement a hosted backend only if persistent multi-user public testing becomes a requirement.
- Move admin account creation/promotion behind trusted server-side code before any production deployment.
- Move OpenAI requests behind a server-side proxy before production use.
- Add hosted real-user monitoring such as Vercel Speed Insights if the app moves from GitHub Pages to Vercel.
