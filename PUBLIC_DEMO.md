# Public Demo Guide

Use this repo as a static GitHub Pages showcase:

https://iron-mark.github.io/Hackathon-Smart-Profile-Management-System/

Demo mode stores accounts, submissions, audit logs, and uploaded file metadata in the visitor's browser only.

## Fast Path

1. Open the deployed app.
2. Select **Start demo**.
3. Sign in with the prefilled faculty credentials.
4. Upload one of the sample files from `public/demo-samples`.
5. Sign in as admin, view the uploaded file, and approve it.
6. Return as faculty and confirm the file is approved.

## Safety Notes

- Do not upload real IDs, transcripts, licenses, or private faculty records.
- Use only generated/sample files when sharing the public URL.
- Use **Clear demo data** in the sidebar or **Reset demo data** on auth pages to restore the seeded state.
- The Web Vitals panel is local to the browser and does not send analytics anywhere.

## Share Preview

- Public shares should resolve to the GitHub Pages URL above.
- Link previews should use `public/og-image.png`.
- Search crawlers should index only the landing page. Auth, admin, faculty, and demo-storage routes are app routes and are marked noindex after render.
- Answer engines can use the visible **Public Demo Facts** section, FAQ JSON-LD, `llms.txt`, and `answers.md` for concise project context.

## Post-Deploy Smoke Check

Run these after GitHub Pages publishes:

- Landing page renders and shows **Browser-local demo mode**.
- **Start demo** opens login with seeded faculty credentials.
- `/auth/login` and `/auth/register` direct links render.
- `/demo-storage/pictures-and-documents/missing/sample.png` renders the Demo File Unavailable page.
- Faculty upload accepts the sample certificate and rejects oversized or unsupported files.
- Admin can view and approve an uploaded file.
- Faculty can view the approved file from Uploaded Files.
- `/sitemap.xml`, `/robots.txt`, `/llms.txt`, and `/og-image.png` return 200 from the deployed GitHub Pages base path.
- `/answers.md` returns 200 and matches the public demo facts.
