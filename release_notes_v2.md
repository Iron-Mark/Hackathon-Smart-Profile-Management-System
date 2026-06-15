# v2.1 Public Demo Handoff Release

This release closes the restoration pass for the Smart Profile Management System hackathon project. The app is now positioned as a GitHub Pages-friendly public showcase that can be cloned, installed, run locally, and demonstrated without a hosted backend.

## Highlights

- Restored the faculty-to-admin demo flow with browser-local seeded accounts, document upload metadata, admin approval, faculty status visibility, and demo file previews.
- Converted the unsupported hosted backend path into a browser-local demo backend, so no Supabase, Appwrite, Firebase, or custom server is required.
- Added optional Clerk showcase authentication with sign-in, sign-up, user menu, and Organization switcher controls when `VITE_CLERK_PUBLISHABLE_KEY` is configured.
- Kept admin access on the seeded demo admin account rather than trusting browser-side Clerk Organization state.
- Updated SEO, AEO, GEO, social preview, robots, sitemap, `llms.txt`, and public demo copy for the canonical GitHub Pages URL.
- Reworked the demo information panel into a responsive bottom-right snackbar with dismiss, reset, and seeded-account actions.
- Added focused tests and Playwright coverage for the restored demo flow, responsive auth screens, SEO smoke checks, route noindex behavior, duplicate registration messaging, and demo reset behavior.

## Public Demo

- URL: https://iron-mark.github.io/Hackathon-Smart-Profile-Management-System/
- Runtime model: browser-local demo storage
- Supported setup: `npm ci`, then `npm run dev` or the documented GitHub Pages build/preview commands
- Optional Clerk setup: add `VITE_CLERK_PUBLISHABLE_KEY` only if you want the hosted Clerk UI layer

## Safety Notes

- Uploaded demo files and generated previews stay in the visitor's browser-local state.
- No backend secrets are required for the public showcase.
- The app does not claim production authentication, production document storage, or durable multi-user institutional records.
- Optional OpenAI and Clerk keys are public/demo configuration paths only; the app continues to work without them.

## Verification Gate

The v2.1 release should be considered valid only when these checks pass on the release commit:

- `npm ci`
- `npm test -- --run`
- `npm run lint`
- `npm run security:scan`
- `npm run seo:check`
- `npm run links:check`
- GitHub Pages-style `npm run build`
- GitHub Pages-style `npx playwright test --reporter=line`

## Handoff Notes

- Continue from the `v2.1` tag or the latest `main` commit.
- Do not add a real backend unless the project goal changes from showcase to production.
- If continuing on another PC, clone the repo, run `npm ci`, copy `.env.example` to `.env.local` if needed, and keep `VITE_DEMO_MODE=true`.
