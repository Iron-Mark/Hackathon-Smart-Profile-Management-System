# v2.1.1 Release Evidence

Public demo URL:

https://iron-mark.github.io/Hackathon-Smart-Profile-Management-System/

## Checkpoint

- Release tag: `v2.1.1`
- GitHub Release: https://github.com/Iron-Mark/Hackathon-Smart-Profile-Management-System/releases/tag/v2.1.1
- Tag target: `09573665db005f4a1114dcaf9606886a7cfbc73f`
- GitHub Pages deploy run: `27897209662`
- Deploy result: `success`
- Final working branch after verification: `dev`

## What This Release Captures

- Restored public GitHub Pages demo for faculty credential upload, admin review, and approval tracking.
- Browser-local demo data for seeded reviewer accounts, visitor registration, submissions, audit logs, and file metadata.
- Generated sample files only; visitors should not upload real faculty records.
- Public AEO/GEO sources through the visible facts section, FAQ JSON-LD, `answers.md`, and `llms.txt`.
- Local Web Vitals button and panel backed by the official `web-vitals` package.

## Live Verification

Fresh live verification was run against the deployed GitHub Pages URL after the tag was moved to the final verified commit:

```powershell
$env:PLAYWRIGHT_BASE_URL = 'https://iron-mark.github.io/Hackathon-Smart-Profile-Management-System'
$env:PLAYWRIGHT_WEB_SERVER_URL = 'https://iron-mark.github.io/Hackathon-Smart-Profile-Management-System/'
$env:PLAYWRIGHT_WEB_SERVER_COMMAND = 'node -e "setInterval(()=>{}, 1000)"'
$env:PLAYWRIGHT_BASE_PATH = '/Hackathon-Smart-Profile-Management-System/'
npx playwright test --reporter=line
```

Result:

- Full live GitHub Pages Playwright suite: `17 passed`
- Live landing page: `200 OK`
- `v2.1.1` remote tag dereferences to `09573665db005f4a1114dcaf9606886a7cfbc73f`

## Release Safety Notes

- No backend secrets are required for the public GitHub Pages build.
- Public demo state remains browser-local.
- Clerk and OpenAI integrations remain optional local showcase paths.
- The release is a static-demo checkpoint, not a production persistence or real faculty-record handling release.
