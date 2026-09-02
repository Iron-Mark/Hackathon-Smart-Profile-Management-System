import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = path.join(ROOT, 'public/og')
const DEFAULT_OG = path.join(ROOT, 'public/og-image.png')
const FONT_REGULAR = '/usr/share/fonts/truetype/macos/Inter-Regular.ttf'
const FONT_SEMIBOLD = '/usr/share/fonts/truetype/macos/Inter-SemiBold.ttf'
const FONT_BOLD = '/usr/share/fonts/truetype/macos/Inter-Bold.ttf'

function dataUri (relativePath, mime) {
  const buffer = fs.readFileSync(path.join(ROOT, relativePath))
  return `data:${mime};base64,${buffer.toString('base64')}`
}

function fontDataUri (filePath) {
  if (!fs.existsSync(filePath)) return ''
  const buffer = fs.readFileSync(filePath)
  return `url('data:font/ttf;base64,${buffer.toString('base64')}')`
}

function fontFace (family, filePath, weight) {
  const src = fontDataUri(filePath)
  if (!src) return ''
  return `@font-face { font-family: '${family}'; src: ${src}; font-weight: ${weight}; font-style: normal; font-display: block; }`
}

const CARDS = [
  {
    id: 'landing',
    output: DEFAULT_OG,
    alsoCopy: [path.join(OUT_DIR, 'landing.png')],
    kicker: 'UMak CCIS · 7th Hackathon',
    title: 'Smart Faculty Profile Management',
    subtitle: 'Browser-local credential intake, admin review, and profile proofing.',
    pills: ['Public demo', 'Sample files only'],
    shots: ['docs/images/landing-light.png'],
    footer: 'Team 2nd Choice',
  },
  {
    id: 'workflow',
    output: path.join(OUT_DIR, 'workflow.png'),
    kicker: 'How it works',
    title: 'Upload. Review. Approve.',
    subtitle: 'A restored faculty credential loop that runs entirely in this browser.',
    pills: ['Five sample types', 'No private backend'],
    shots: ['docs/images/landing-workflow.png'],
    footer: 'Public demo facts',
  },
  {
    id: 'login',
    output: path.join(OUT_DIR, 'login.png'),
    kicker: 'Seeded reviewers',
    title: 'Faculty and admin demo login',
    subtitle: 'One click fills the restored reviewer accounts for the public showcase.',
    pills: ['Faculty demo', 'Admin demo'],
    shots: ['docs/images/login.png'],
    footer: 'Browser-local accounts',
  },
  {
    id: 'register',
    output: path.join(OUT_DIR, 'register.png'),
    kicker: 'Public registration',
    title: 'Create a local faculty account',
    subtitle: 'Any valid email stays in this browser. Nothing is stored on a server.',
    pills: ['Local faculty only', 'Reset anytime'],
    shots: ['docs/images/login.png'],
    footer: 'No hosted identity required',
  },
  {
    id: 'faculty',
    output: path.join(OUT_DIR, 'faculty.png'),
    kicker: 'Faculty workspace',
    title: 'Track records and sample uploads',
    subtitle: 'Metrics, generated samples, and smart upload in one restored workspace.',
    pills: ['Dr. Maria Santos', 'Smart upload'],
    shots: ['docs/images/faculty-dashboard.png'],
    footer: 'Faculty dashboard',
  },
  {
    id: 'upload',
    output: path.join(OUT_DIR, 'upload.png'),
    kicker: 'Smart upload',
    title: 'Classify a sample credential',
    subtitle: 'Drop a generated certificate, transcript, or CV. The demo queues it for review.',
    pills: ['SVG samples', '2 MB cap'],
    shots: ['docs/images/faculty-dashboard.png'],
    badge: 'public/demo-samples/sample-certificate.svg',
    footer: 'Sample files only',
  },
  {
    id: 'uploaded-files',
    output: path.join(OUT_DIR, 'uploaded-files.png'),
    kicker: 'Faculty files',
    title: 'Uploaded files as a table',
    subtitle: 'Filter Pending, Approved, or Returned without nested cards.',
    pills: ['View', 'Edit', 'Remove'],
    shots: ['docs/images/uploaded-files.png'],
    footer: 'Browser-local storage',
  },
  {
    id: 'profile',
    output: path.join(OUT_DIR, 'profile.png'),
    kicker: 'Profile builder',
    title: 'Draft a bio from credentials',
    subtitle: 'Smart Profile Builder turns approved sample records into a readable biography.',
    pills: ['Generate AI Bio', 'Safe fallbacks'],
    shots: ['docs/images/profile.png'],
    footer: 'Faculty profile',
  },
  {
    id: 'admin',
    output: path.join(OUT_DIR, 'admin.png'),
    kicker: 'Reviewer workspace',
    title: 'Admin dashboard at a glance',
    subtitle: 'Pending queue, credential mix, and seeded reviewer activity in one place.',
    pills: ['Export CSV', 'Four seeded users'],
    shots: ['docs/images/dashboard.png'],
    footer: 'Admin dashboard',
  },
  {
    id: 'approvals',
    output: path.join(OUT_DIR, 'approvals.png'),
    kicker: 'Approval queue',
    title: 'Preview, approve, or return',
    subtitle: 'Admins review generated sample credentials and leave a local audit trail.',
    pills: ['Approve', 'Return', 'View'],
    shots: ['docs/images/approvals.png'],
    footer: 'Approval management',
  },
  {
    id: 'theme',
    output: path.join(OUT_DIR, 'theme.png'),
    kicker: 'CCIS green chrome',
    title: 'One brand in light and dark',
    subtitle: 'Mint faculty rails and green-black chrome share the same tokens. The hero stays branded.',
    pills: ['Light mint', 'Dark green-black'],
    shots: ['docs/images/faculty-dashboard.png', 'docs/images/faculty-dashboard-dark.png'],
    footer: 'Theme toggle',
  },
  {
    id: 'web-vitals',
    output: path.join(OUT_DIR, 'web-vitals.png'),
    kicker: 'Local telemetry',
    title: 'Core Web Vitals in this browser',
    subtitle: 'LCP, INP, CLS, FCP, and TTFB stay on-device. Nothing is sent anywhere.',
    pills: ['Session only', 'No analytics sink'],
    shots: ['docs/images/web-vitals.png'],
    footer: 'Web Vitals panel',
  },
  {
    id: 'preview',
    output: path.join(OUT_DIR, 'preview.png'),
    kicker: 'Demo file preview',
    title: 'Open a generated sample',
    subtitle: 'Deep links render the demo storage page for seeded certificate and transcript files.',
    pills: ['Seeded SVG', 'No real records'],
    shots: ['docs/images/landing-light.png'],
    badge: 'public/demo-samples/sample-certificate.svg',
    footer: 'Demo storage',
  },
]

function cardHtml (card) {
  const shotImgs = card.shots
    .map((shot, index) => `<img class="shot shot-${index}" src="${dataUri(shot, 'image/png')}" alt="" />`)
    .join('')
  const pills = card.pills
    .map((pill, index) => `<span class="pill pill-${index}"><i></i>${pill}</span>`)
    .join('')
  const badge = card.badge
    ? `<img class="badge" src="${dataUri(card.badge, 'image/svg+xml')}" alt="" />`
    : ''

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <style>
    ${fontFace('Inter', FONT_REGULAR, 400)}
    ${fontFace('Inter', FONT_SEMIBOLD, 600)}
    ${fontFace('Inter', FONT_BOLD, 700)}
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { width: 1200px; height: 630px; overflow: hidden; background: #102418; }
    body {
      font-family: Inter, "Noto Sans", sans-serif;
      color: #f3faf4;
    }
    .canvas {
      width: 1200px;
      height: 630px;
      padding: 26px;
      background:
        radial-gradient(920px 520px at 12% -10%, rgba(141, 197, 122, 0.22), transparent 58%),
        radial-gradient(780px 460px at 100% 110%, rgba(228, 195, 90, 0.12), transparent 52%),
        linear-gradient(135deg, #163522 0%, #102418 46%, #0b1810 100%);
    }
    .outer {
      height: 100%;
      border: 2px solid #e4c35a;
      padding: 7px;
    }
    .inner {
      height: 100%;
      border: 2px solid #7dcea0;
      display: grid;
      grid-template-columns: 470px 1fr;
      gap: 20px;
      padding: 34px 38px 30px;
      position: relative;
      overflow: hidden;
    }
    .copy { display: flex; flex-direction: column; justify-content: center; min-width: 0; }
    .brand { display: flex; align-items: center; gap: 14px; margin-bottom: 22px; }
    .seal {
      width: 86px;
      height: 86px;
      border-radius: 50%;
      border: 2px solid rgba(228, 195, 90, 0.85);
      background: #0b1810;
      object-fit: cover;
    }
    .kicker {
      font-size: 15px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #c8e6c0;
      font-weight: 600;
    }
    h1 {
      font-size: 44px;
      line-height: 1.05;
      font-weight: 700;
      letter-spacing: -0.03em;
      margin: 10px 0 14px;
    }
    .subtitle {
      font-size: 20px;
      line-height: 1.35;
      color: #d7ead4;
      font-weight: 400;
      max-width: 430px;
    }
    .pills { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 22px; }
    .pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      border: 1px solid rgba(125, 206, 160, 0.45);
      background: rgba(16, 36, 24, 0.45);
      border-radius: 999px;
      padding: 7px 12px 7px 10px;
      font-size: 15px;
      font-weight: 600;
      color: #eaf7e8;
    }
    .pill i {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background: #7dcea0;
      display: block;
    }
    .pill-1 i { background: #e4c35a; }
    .pill-2 i { background: #8ec8e8; }
    .footer {
      margin-top: 26px;
      font-size: 14px;
      color: #b7cfc0;
      letter-spacing: 0.04em;
    }
    .stage {
      position: relative;
      height: 100%;
      display: grid;
      place-items: center;
    }
    .shot-wrap {
      position: relative;
      width: 610px;
      height: 430px;
    }
    .shot {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: top center;
      border-radius: 18px;
      border: 1px solid rgba(243, 250, 244, 0.18);
      box-shadow: 0 24px 48px rgba(0, 0, 0, 0.38);
      background: #102418;
    }
    .shot-0 { transform: rotate(-1.6deg); }
    .shot-wrap.has-two .shot-0 {
      width: 78%;
      height: 78%;
      left: auto;
      right: 0;
      top: 0;
      transform: rotate(7deg);
      opacity: 0.95;
    }
    .shot-wrap.has-two .shot-1 {
      width: 78%;
      height: 78%;
      left: 0;
      top: auto;
      bottom: 0;
      right: auto;
      transform: rotate(-6deg);
    }
    .badge {
      position: absolute;
      left: -18px;
      bottom: 18px;
      width: 132px;
      height: 168px;
      object-fit: cover;
      border-radius: 12px;
      border: 2px solid #e4c35a;
      background: #f3faf4;
      box-shadow: 0 16px 28px rgba(0, 0, 0, 0.32);
      transform: rotate(-8deg);
    }
  </style>
</head>
<body>
  <div class="canvas">
    <div class="outer">
      <div class="inner">
        <section class="copy">
          <div class="brand">
            <img class="seal" src="${dataUri('public/fav-icon.png', 'image/png')}" alt="" />
            <p class="kicker">${card.kicker}</p>
          </div>
          <h1>${card.title}</h1>
          <p class="subtitle">${card.subtitle}</p>
          <div class="pills">${pills}</div>
          <p class="footer">${card.footer}</p>
        </section>
        <section class="stage">
          <div class="shot-wrap ${card.shots.length > 1 ? 'has-two' : ''}">
            ${shotImgs}
            ${badge}
          </div>
        </section>
      </div>
    </div>
  </div>
</body>
</html>`
}

async function waitForImages (page) {
  await page.evaluate(async () => {
    await Promise.all(
      Array.from(document.images).map((image) => {
        if (image.complete) return image.decode().catch(() => {})
        return new Promise((resolve) => {
          image.addEventListener('load', () => resolve(), { once: true })
          image.addEventListener('error', () => resolve(), { once: true })
        })
      }),
    )
    await document.fonts.ready
  })
}

async function compose () {
  fs.mkdirSync(OUT_DIR, { recursive: true })
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  })

  try {
    for (const card of CARDS) {
      await page.setContent(cardHtml(card), { waitUntil: 'load' })
      await waitForImages(page)
      await page.screenshot({
        path: card.output,
        type: 'png',
        clip: { x: 0, y: 0, width: 1200, height: 630 },
        animations: 'disabled',
      })
      for (const extra of card.alsoCopy ?? []) {
        fs.copyFileSync(card.output, extra)
      }
      const kb = Math.round(fs.statSync(card.output).size / 1024)
      console.log(`Wrote ${path.relative(ROOT, card.output)} (${kb} KB)`)
    }
  } finally {
    await browser.close()
  }
}

compose().catch((error) => {
  console.error(error)
  process.exit(1)
})
