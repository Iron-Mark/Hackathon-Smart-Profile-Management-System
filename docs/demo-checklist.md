# Demo Checklist

Use this when showcasing the restored 7th CCIS Hackathon app from GitHub Pages or a local preview build.

Public URL:

https://iron-mark.github.io/Hackathon-Smart-Profile-Management-System/

## Public Visitor Flow

1. Open the app landing page.
2. Confirm **Browser-local demo mode**, the public theme toggle, and the **Web Vitals** button are visible. The Web Vitals badge should show a live collected-metric count such as `0/5`, then increase as the browser reports metrics.
3. Select the theme toggle once and confirm the page switches between light mint surfaces and dark green-black chrome. The hero band should stay a dark branded green in both modes.
4. Open the **Web Vitals** panel from the lower right and confirm it reports session metrics without a load error.
5. Select Register.
6. Create a faculty account with any valid email address and a password with letters and numbers.
7. Sign in and confirm the faculty dashboard opens.
8. Confirm the upload area reminds visitors to use sample files only.
9. Upload a sample credential image from `public/demo-samples`.

The visitor account is stored only in the current browser when demo mode is active.
The generated sample set includes certificate, transcript, diploma, CV, and research summary SVG files.

## Optional Clerk Showcase Auth

If `VITE_CLERK_PUBLISHABLE_KEY` is configured locally:

1. Open Login or Register.
2. Select the Clerk sign-in or sign-up action.
3. Complete Clerk authentication.
4. Confirm the app routes to the faculty dashboard.
5. Confirm the sidebar shows the Clerk user menu and Organization switcher.

Clerk-authenticated visitors are still mapped to browser-local faculty demo profiles. Use the seeded admin account for admin approval checks.

## Seeded Faculty/Admin Flow

1. Open Login.
2. Or open the landing page and select Start demo to prefill seeded faculty credentials.
3. Select Faculty demo, then sign in.
4. Upload a credential image and submit it.
5. Open Login again.
6. Select Admin demo, then sign in.
7. Open Approvals and select View on the uploaded credential.
8. Confirm the Demo File Preview page opens with the uploaded filename.
9. Return to Approvals and approve the uploaded credential.
10. Sign back in with Faculty demo.
11. Open Uploaded Files and confirm the credential is Approved.
12. Select View from the faculty file row and confirm the Demo File Preview opens.

## Theme And Chrome Checks

1. On landing, login, and register, confirm the public theme toggle is enabled.
2. After sign-in, confirm the sidebar is a light green rail in light mode and a deep green rail in dark mode.
3. Confirm faculty and admin status chips remain readable in both themes.
4. On login and register, confirm the **Web Vitals** button is not covered by the demo access panel and still opens the metrics panel.

## Reset

Use Reset demo data on the login or register screen when the browser-local demo state gets stale. This restores the seeded faculty/admin accounts, sample profile, pending submission, audit log, and storage metadata.

Expected invalid-login messages after a reset are shown in the UI only; they should not produce browser console errors.

The authenticated sidebar also includes **Clear demo data**, which resets the browser-local state and returns to Login.

## Screenshot And Media Refresh

README stills live in `docs/images/`. Looping GIFs and the silent demo MP4 live in `docs/media/`. With the local Vite server running (`npm run dev`, usually `http://localhost:5173`):

```bash
npm run docs:screenshots
npm run docs:media
```

Still capture writes:

- `landing-light.png`, `landing-dark.png`, `landing-workflow.png`
- `login.png`
- `faculty-dashboard.png`, `faculty-dashboard-dark.png`
- `uploaded-files.png`
- `profile.png`
- `dashboard.png` (admin)
- `approvals.png`
- `web-vitals.png`

Motion capture writes:

- `preview.gif` and `demo.mp4`
- `feature-upload.gif`, `feature-approvals.gif`, `feature-profile.gif`
- `feature-uploaded-files.gif`, `feature-theme.gif`, `feature-web-vitals.gif`

Clip usage, size budget, and `DOCS_MEDIA_ONLY` are in `docs/media/README.md`. Open Graph share cards are `npm run docs:og`. Override the capture target with `PLAYWRIGHT_BASE_URL` when needed.

## Static Hosting Deep Links

For GitHub Pages or any static SPA host, check these direct links after deployment:

- `https://iron-mark.github.io/Hackathon-Smart-Profile-Management-System/auth/login/`
- `https://iron-mark.github.io/Hackathon-Smart-Profile-Management-System/auth/register/`
- `https://iron-mark.github.io/Hackathon-Smart-Profile-Management-System/demo-storage/?bucket=pictures-and-documents&path=demo-faculty-1%2FCertificates%2Fsample-certificate.svg`

The auth routes should render normally. The missing demo storage link should render the Demo File Unavailable page instead of a static-hosting 404.

Also verify these generated sample credentials return successfully:

- `https://iron-mark.github.io/Hackathon-Smart-Profile-Management-System/demo-samples/sample-certificate.svg`
- `https://iron-mark.github.io/Hackathon-Smart-Profile-Management-System/demo-samples/sample-transcript.svg`
- `https://iron-mark.github.io/Hackathon-Smart-Profile-Management-System/demo-samples/sample-diploma.svg`
- `https://iron-mark.github.io/Hackathon-Smart-Profile-Management-System/demo-samples/sample-cv.svg`
- `https://iron-mark.github.io/Hackathon-Smart-Profile-Management-System/demo-samples/sample-research-summary.svg`

## SEO Smoke Check

After deployment, verify:

- The landing page canonical URL is `https://iron-mark.github.io/Hackathon-Smart-Profile-Management-System/`.
- `https://iron-mark.github.io/Hackathon-Smart-Profile-Management-System/sitemap.xml` lists the public landing page, `answers.md`, and `llms.txt`.
- `https://iron-mark.github.io/Hackathon-Smart-Profile-Management-System/robots.txt` points to the GitHub Pages sitemap.
- `https://iron-mark.github.io/Hackathon-Smart-Profile-Management-System/llms.txt` describes the browser-local demo and sample-file guidance.
- `https://iron-mark.github.io/Hackathon-Smart-Profile-Management-System/answers.md` provides concise answer-engine facts for AEO/GEO-style summaries.
- `https://iron-mark.github.io/Hackathon-Smart-Profile-Management-System/og-image.png` returns the 1200x630 public share image.
- Dedicated cards such as `.../og/login.png` and `.../og/faculty.png` also return 200.
- Auth, admin, faculty, and demo-storage routes render but expose `noindex,nofollow`; matching private route prefixes are also disallowed for AI crawler groups in `robots.txt`.

Local command:

```bash
npm run seo:check
npm run links:check
npm run smoke:live
```

## Build Preview Commands

PowerShell:

```powershell
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

macOS / Linux:

```bash
VITE_DEMO_MODE=true \
VITE_BASE_PATH='/Hackathon-Smart-Profile-Management-System/' \
VITE_SITE_URL='https://iron-mark.github.io/Hackathon-Smart-Profile-Management-System/' \
npm run build

PLAYWRIGHT_BASE_URL='http://127.0.0.1:4173' \
PLAYWRIGHT_WEB_SERVER_URL='http://127.0.0.1:4173/Hackathon-Smart-Profile-Management-System/' \
PLAYWRIGHT_WEB_SERVER_COMMAND='npm run preview:pages' \
PLAYWRIGHT_BASE_PATH='/Hackathon-Smart-Profile-Management-System/' \
npx playwright test --reporter=line
```

The CI workflow runs the same Pages-style Playwright suite after building `dist`.
