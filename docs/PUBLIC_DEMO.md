# Public Demo Guide

Use this repo as a static GitHub Pages showcase:

https://iron-mark.github.io/Hackathon-Smart-Profile-Management-System/

Demo mode stores accounts, submissions, audit logs, and uploaded file metadata in the visitor's browser only.
There is no hosted backend for the public showcase.
Optional Clerk sign-in can be enabled locally with `VITE_CLERK_PUBLISHABLE_KEY`; it maps visitors to browser-local faculty demo profiles and does not create production document storage.

The current UI uses one CCIS green token system for light and dark mode. The landing hero stays a dark branded band in both themes. Product stills live in `docs/images/`. Looping GIFs and the silent demo MP4 live in `docs/media/`.

## Fast Path

1. Open the deployed app.
2. Confirm the landing page shows **Browser-local demo mode**, a theme toggle, and a lower-right **Web Vitals** button.
3. Select **Start demo**.
4. Sign in with the prefilled faculty credentials.
5. Upload one of the generated sample files from `public/demo-samples`.
6. Sign in as admin, view the uploaded file, and approve it.
7. Return as faculty and confirm the file is approved.

## Current UI Surfaces

These captures match the restored public chrome. Refresh stills with `npm run docs:screenshots` and motion clips with `npm run docs:media` after visual changes.

- `docs/media/preview.gif` — looping Start demo → faculty workspace preview
- `docs/media/demo.mp4` — silent full walkthrough (upload, approve, profile bio)
- `docs/media/feature-upload.gif` / `feature-approvals.gif` / `feature-profile.gif` / `feature-uploaded-files.gif` / `feature-theme.gif` / `feature-web-vitals.gif`
- `docs/images/landing-light.png` / `docs/images/landing-dark.png` — public landing hero in both themes
- `docs/images/landing-workflow.png` — numbered workflow, compact samples, and public facts
- `docs/images/login.png` — seeded Faculty demo / Admin demo shortcuts
- `docs/images/faculty-dashboard.png` / `docs/images/faculty-dashboard-dark.png` — faculty workspace and smart upload
- `docs/images/uploaded-files.png` — faculty uploaded-files table
- `docs/images/profile.png` — profile builder and biography draft
- `docs/images/dashboard.png` — admin reviewer dashboard
- `docs/images/approvals.png` — approval queue with Approve, Return, and View
- `docs/images/web-vitals.png` — Core Web Vitals panel on the landing page
- `public/og-image.png` / `public/og/*.png` — 1200x630 share cards composed from the seal and stills (`npm run docs:og`)

## Safety Notes

- Do not upload real IDs, transcripts, licenses, or private faculty records.
- Use only generated/sample files when sharing the public URL.
- The generated sample set covers certificate, transcript, diploma, CV, and research summary records.
- Uploaded files and account state stay in the current browser and are not synced to a server.
- Clerk Organizations, when enabled, are showcase context only and do not grant admin access in this static app.
- Use **Clear demo data** in the sidebar or **Reset demo data** on auth pages to restore the seeded state.
- The Web Vitals button and panel are local to the browser, show the live collected-metric count for that session, and do not send analytics anywhere.
- The Web Vitals control sits above the login/register demo access panel so it stays clickable.

## Share Preview

- Public shares should resolve to the GitHub Pages URL above.
- Link previews should use `public/og-image.png` for the landing URL. Route-specific cards in `public/og/` are used for login, faculty, admin, and demo-storage unfurls.
- Search crawlers should index the landing page and discover the public `answers.md` and `llms.txt` source files. Auth, admin, faculty, and demo-storage routes are app routes and are disallowed in `robots.txt` plus marked noindex after render.
- Answer engines can use the visible **Public Demo Facts** section, FAQ JSON-LD, `llms.txt`, and `answers.md` for concise project context.

## Post-Deploy Smoke Check

Run these after GitHub Pages publishes:

- Landing page renders and shows **Browser-local demo mode**.
- Theme toggle switches landing and login between light mint surfaces and dark green-black chrome without inverting the hero to bright lime.
- **Start demo** opens login with seeded faculty credentials.
- `https://iron-mark.github.io/Hackathon-Smart-Profile-Management-System/auth/login/` and `https://iron-mark.github.io/Hackathon-Smart-Profile-Management-System/auth/register/` direct links render.
- `https://iron-mark.github.io/Hackathon-Smart-Profile-Management-System/demo-storage/?bucket=pictures-and-documents&path=demo-faculty-1%2FCertificates%2Fsample-certificate.svg` renders a seeded demo preview without requiring a per-file static fallback.
- Faculty upload accepts the sample certificate and rejects oversized or unsupported files.
- Admin can view and approve an uploaded file.
- Faculty can view the approved file from Uploaded Files.
- The lower-right **Web Vitals** button opens a panel with live session metrics on landing, login, and the faculty dashboard.
- `https://iron-mark.github.io/Hackathon-Smart-Profile-Management-System/sitemap.xml`, `https://iron-mark.github.io/Hackathon-Smart-Profile-Management-System/robots.txt`, `https://iron-mark.github.io/Hackathon-Smart-Profile-Management-System/llms.txt`, and `https://iron-mark.github.io/Hackathon-Smart-Profile-Management-System/og-image.png` return 200 from the deployed GitHub Pages base path.
- `https://iron-mark.github.io/Hackathon-Smart-Profile-Management-System/answers.md` returns 200 and matches the public demo facts.
