# Demo and marketing media

Reusable captures for README, pitch decks, social posts, and future landing pages.

GitHub README can autoplay **GIFs**. It does not autoplay **MP4**. Keep a looping GIF as the visible player and link the MP4 for reviewers who want the full walkthrough.

## Files

| File | Use |
| --- | --- |
| `preview.gif` | Hero loop for README and social still-motion. Landing → Start demo → login → faculty workspace. |
| `demo.mp4` | Full silent walkthrough: start demo, upload a sample certificate, admin approve, faculty Uploaded Files, Generate AI Bio. |
| `feature-upload.gif` | Faculty smart upload classifying a sample certificate. |
| `feature-approvals.gif` | Admin Approval Management, Approve, success toast. |
| `feature-profile.gif` | Profile builder Generate AI Bio fallback copy. |
| `feature-uploaded-files.gif` | Uploaded Files table with Pending / All filters. |
| `feature-theme.gif` | Faculty workspace light mint chrome ↔ dark green-black chrome. |
| `feature-web-vitals.gif` | Landing page Core Web Vitals panel (this clip keeps the overlay visible). |

Product **stills** stay in [`docs/images/`](../images/). Use those when a platform wants a static frame instead of motion.

## Suggested placements

- **GitHub README:** clickable `preview.gif` pointing at `demo.mp4`, then the feature GIF table, then stills.
- **LinkedIn / X / Discord:** attach `demo.mp4`. Use `preview.gif` only if the channel prefers a loop.
- **Pitch or hackathon booth:** play `demo.mp4` on a loop; keep stills on a backup slide.
- **Future marketing site:** hero can use `demo.mp4` with `preview.gif` as poster/fallback. Do not hotlink GitHub blob URLs for production; copy the files into the marketing CDN.

Keep Web Vitals out of every clip except `feature-web-vitals.gif`. The capture script hides that overlay automatically.

## Open Graph share cards

Social previews are 1200x630 PNGs composed from the CCIS seal, `docs/images/` stills, and generated sample credentials. Recapture after stills change:

```bash
npm run docs:og
```

| File | Use |
| --- | --- |
| `public/og-image.png` | Default landing share image (`og:image` in `index.html`) |
| `public/og/landing.png` | Named copy of the landing card |
| `public/og/workflow.png` | Workflow, samples, and public facts |
| `public/og/login.png` / `register.png` | Seeded login and local registration |
| `public/og/faculty.png` / `upload.png` | Faculty workspace and smart upload |
| `public/og/uploaded-files.png` | Uploaded files table |
| `public/og/profile.png` | Profile builder |
| `public/og/admin.png` / `approvals.png` | Admin dashboard and approval queue |
| `public/og/theme.png` | Light mint and dark green-black chrome |
| `public/og/web-vitals.png` | Local Core Web Vitals panel |
| `public/og/preview.png` | Demo file preview |

SPA fallback HTML under `dist/auth`, `dist/faculty`, and `dist/admin` gets the matching card at build time so crawlers and unfurls do not all show the landing image.

## Recapture

The local Vite app must already be running (`npm run dev`, usually `http://127.0.0.1:5173`).

```bash
npm run docs:media
```

Optional:

```bash
PLAYWRIGHT_BASE_URL=http://127.0.0.1:5173 npm run docs:media
DOCS_MEDIA_ONLY=preview,demo npm run docs:media
```

`DOCS_MEDIA_ONLY` is a comma-separated list of clip names: `preview`, `demo`, `upload`, `approvals`, `profile`, `theme`, `uploaded-files`, `web-vitals`.

Refresh stills separately:

```bash
npm run docs:screenshots
```

## Size budget

Keep GIFs under about 3 MB each and `demo.mp4` under about 8 MB so GitHub README and clone size stay reasonable. This kit is not Git LFS. If a recapture blows the budget, the script already re-encodes oversized GIFs; lower width/fps in `scripts/capture-docs-media.mjs` before committing.

## Notes

- Clips start after the route is ready so loops do not flash the `Loading screen...` Suspense fallback.
- Uploads use a copy of `public/demo-samples/sample-certificate.svg` with a unique filename so they do not collide with the seeded `sample-certificate.svg` row.
- The MP4 is silent on purpose. Add voiceover later in an editor if a talk track is needed; do not re-record the UI unless the product chrome changed.
