# Demo Checklist

Use this when showcasing the restored hackathon app from GitHub Pages or a local preview build.

Public URL:

https://iron-mark.github.io/Hackathon-Smart-Profile-Management-System/

## Public Visitor Flow

1. Open the app landing page.
2. Confirm **Browser-local demo mode** and the **Web Vitals** button are visible.
3. Select Register.
4. Create a faculty account with any valid email address and a password with letters and numbers.
5. Sign in and confirm the faculty dashboard opens.
6. Confirm the upload area reminds visitors to use sample files only.
7. Upload a sample credential image from `public/demo-samples`.

The visitor account is stored only in the current browser when demo mode is active.

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
12. Select View from the faculty file card and confirm the Demo File Preview opens.

## Reset

Use Reset demo data on the login or register screen when the browser-local demo state gets stale. This restores the seeded faculty/admin accounts, sample profile, pending submission, audit log, and storage metadata.

Expected invalid-login messages after a reset are shown in the UI only; they should not produce browser console errors.

The authenticated sidebar also includes **Clear demo data**, which resets the browser-local state and returns to Login.

## Static Hosting Deep Links

For GitHub Pages or any static SPA host, check these direct links after deployment:

- `https://iron-mark.github.io/Hackathon-Smart-Profile-Management-System/auth/login/`
- `https://iron-mark.github.io/Hackathon-Smart-Profile-Management-System/auth/register/`
- `https://iron-mark.github.io/Hackathon-Smart-Profile-Management-System/demo-storage/pictures-and-documents/missing/sample/`

The auth routes should render normally. The missing demo storage link should render the Demo File Unavailable page instead of a static-hosting 404.

Also verify `https://iron-mark.github.io/Hackathon-Smart-Profile-Management-System/demo-samples/sample-certificate.svg` returns the generated sample credential.

## SEO Smoke Check

After deployment, verify:

- The landing page canonical URL is `https://iron-mark.github.io/Hackathon-Smart-Profile-Management-System/`.
- `https://iron-mark.github.io/Hackathon-Smart-Profile-Management-System/sitemap.xml` lists only the public landing page.
- `https://iron-mark.github.io/Hackathon-Smart-Profile-Management-System/robots.txt` points to the GitHub Pages sitemap.
- `https://iron-mark.github.io/Hackathon-Smart-Profile-Management-System/llms.txt` describes the browser-local demo and sample-file guidance.
- `https://iron-mark.github.io/Hackathon-Smart-Profile-Management-System/answers.md` provides concise answer-engine facts for AEO/GEO-style summaries.
- `https://iron-mark.github.io/Hackathon-Smart-Profile-Management-System/og-image.png` returns the 1200x630 public share image.
- Auth, admin, faculty, and demo-storage routes render but expose `noindex,nofollow`.

Local command:

```bash
npm run seo:check
npm run links:check
```

## Build Preview Commands

PowerShell:

```powershell
$env:VITE_DEMO_MODE = 'true'
$env:VITE_BASE_PATH = '/Hackathon-Smart-Profile-Management-System/'
npm run build

$env:PLAYWRIGHT_BASE_URL = 'http://127.0.0.1:4173'
$env:PLAYWRIGHT_WEB_SERVER_URL = 'http://127.0.0.1:4173/Hackathon-Smart-Profile-Management-System/'
$env:PLAYWRIGHT_WEB_SERVER_COMMAND = 'npm run preview:pages'
$env:PLAYWRIGHT_BASE_PATH = '/Hackathon-Smart-Profile-Management-System/'
npx playwright test --reporter=line
```
