import { execFile } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const execFileAsync = promisify(execFile)
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:5173'
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = path.join(ROOT, 'docs/media')
const VIEWPORT = { width: 1280, height: 720 }
const SAMPLE_CERT = fs.readFileSync(
  path.join(ROOT, 'public/demo-samples/sample-certificate.svg'),
)
const SELECTED_CLIPS = new Set(
  (process.env.DOCS_MEDIA_ONLY ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean),
)

function shouldCapture (name) {
  return SELECTED_CLIPS.size === 0 || SELECTED_CLIPS.has(name)
}

function urlFor (pathname) {
  return new URL(pathname, BASE_URL).toString()
}

function certificateUpload (name) {
  return {
    name,
    mimeType: 'image/svg+xml',
    buffer: SAMPLE_CERT,
  }
}

async function setTheme (context, theme) {
  await context.addInitScript((value) => {
    try {
      window.localStorage.setItem('theme', value)
    } catch {
      // Ignore storage failures in restricted contexts.
    }
  }, theme)
}

async function hideVitalsAcrossNavigations (context) {
  await context.addInitScript(() => {
    const css =
      '[aria-label="Web Vitals"], [aria-label="Web Vitals panel"] { visibility: hidden !important; }'
    const inject = () => {
      if (document.querySelector('style[data-docs-hide-vitals]')) return
      const style = document.createElement('style')
      style.setAttribute('data-docs-hide-vitals', '')
      style.textContent = css
      document.documentElement.appendChild(style)
    }
    inject()
    document.addEventListener('DOMContentLoaded', inject)
  })
}

async function beat (page, ms = 600) {
  await page.waitForTimeout(ms)
}

async function goto (page, pathname) {
  await page.goto(urlFor(pathname), { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
  await beat(page, 350)
}

async function signIn (page, role) {
  await goto(page, '/auth/login')
  await page.getByRole('button', { name: role === 'faculty' ? 'Faculty demo' : 'Admin demo' }).click()
  await beat(page, 350)
  await page.getByRole('button', { name: 'Login' }).click()
}

async function uploadCertificate (page, fileName) {
  await page
    .getByRole('region', { name: 'Smart upload' })
    .locator('input[type="file"]')
    .setInputFiles(certificateUpload(fileName))
  const submit = page.getByRole('button', { name: 'Submit files' })
  await submit.waitFor({ state: 'visible' })
  await beat(page, 400)
  await submit.click()
  await page.getByText('Type: Certificates').waitFor({ timeout: 20_000 })
}

async function withRecording (browser, { theme = 'light', hideVitals = true, reducedMotion = 'reduce' }, work) {
  const context = await browser.newContext({
    viewport: VIEWPORT,
    recordVideo: { dir: os.tmpdir(), size: VIEWPORT },
    colorScheme: theme,
    reducedMotion,
  })
  await setTheme(context, theme)
  if (hideVitals) await hideVitalsAcrossNavigations(context)
  const page = await context.newPage()

  await work(page)
  await beat(page, 900)

  const video = page.video()
  await page.close()
  const videoPath = await video.path()
  await context.close()
  return videoPath
}

async function toMp4 (input, output) {
  await execFileAsync('ffmpeg', [
    '-y',
    '-hide_banner',
    '-loglevel',
    'error',
    '-i',
    input,
    '-an',
    '-vf',
    'scale=1280:720:flags=lanczos',
    '-c:v',
    'libx264',
    '-pix_fmt',
    'yuv420p',
    '-movflags',
    '+faststart',
    '-crf',
    '28',
    '-preset',
    'medium',
    output,
  ])
}

async function toGif (input, output, { fps = 10, width = 760, speed = 1, colors = 64 } = {}) {
  const prelude = []
  if (speed !== 1) prelude.push(`setpts=${(1 / speed).toFixed(3)}*PTS`)
  prelude.push(`fps=${fps}`, `scale=${width}:-1:flags=lanczos`)
  const vf = `${prelude.join(',')},split[s0][s1];[s0]palettegen=max_colors=${colors}:stats_mode=diff[p];[s1][p]paletteuse=dither=bayer:bayer_scale=5`

  await execFileAsync('ffmpeg', [
    '-y',
    '-hide_banner',
    '-loglevel',
    'error',
    '-i',
    input,
    '-vf',
    vf,
    '-loop',
    '0',
    output,
  ])
}

function fileSizeMb (filePath) {
  return fs.statSync(filePath).size / (1024 * 1024)
}

function logSize (filePath) {
  console.log(`Wrote ${path.relative(ROOT, filePath)} (${fileSizeMb(filePath).toFixed(2)} MB)`)
}

async function shrinkGifIfNeeded (filePath, maxMb = 3.2) {
  if (fileSizeMb(filePath) <= maxMb) return
  console.log(`Shrinking ${path.relative(ROOT, filePath)} from ${fileSizeMb(filePath).toFixed(2)} MB…`)
  const tempPath = `${filePath}.tmp.gif`
  await toGif(filePath, tempPath, { fps: 8, width: 640, speed: 1.35, colors: 48 })
  fs.renameSync(tempPath, filePath)
  logSize(filePath)
}

async function assertDevServer () {
  const response = await fetch(urlFor('/'))
  if (!response.ok) {
    throw new Error(`Dev server at ${BASE_URL} returned HTTP ${response.status}. Start it with npm run dev.`)
  }
}

async function captureClip (browser, name, options, work, convert) {
  if (!shouldCapture(name)) {
    console.log(`Skipping ${name}`)
    return
  }
  console.log(`Recording ${name}…`)
  const source = await withRecording(browser, options, work)
  try {
    await convert(source)
  } finally {
    fs.rmSync(source, { force: true })
  }
}

async function capture () {
  await assertDevServer()
  fs.mkdirSync(OUT_DIR, { recursive: true })
  const browser = await chromium.launch({ headless: true, slowMo: 80 })

  try {
    await captureClip(
      browser,
      'preview',
      {},
      async (page) => {
        await goto(page, '/')
        await page.getByRole('heading', { name: /CCIS Smart Faculty Profile Management System/i }).waitFor()
        await beat(page, 900)
        await page.getByRole('link', { name: 'Start demo' }).click()
        await page.getByRole('heading', { name: 'Welcome Back' }).waitFor()
        await beat(page, 700)
        await page.getByRole('button', { name: 'Login' }).click()
        await page.getByRole('heading', { name: /Welcome, Dr\. Maria Santos/i }).waitFor()
        await beat(page, 1200)
      },
      async (source) => {
        const output = path.join(OUT_DIR, 'preview.gif')
        await toGif(source, output, { fps: 12, width: 880, speed: 1.2, colors: 64 })
        await shrinkGifIfNeeded(output, 2.8)
        logSize(output)
      },
    )

    await captureClip(
      browser,
      'demo',
      {},
      async (page) => {
        const fileName = 'ccis-showcase-certificate.svg'
        await goto(page, '/')
        await page.getByRole('heading', { name: /CCIS Smart Faculty Profile Management System/i }).waitFor()
        await beat(page, 800)
        await page.getByRole('link', { name: 'Start demo' }).click()
        await page.getByRole('heading', { name: 'Welcome Back' }).waitFor()
        await beat(page, 500)
        await page.getByRole('button', { name: 'Login' }).click()
        await page.getByRole('heading', { name: /Welcome, Dr\. Maria Santos/i }).waitFor()
        await beat(page, 600)
        await uploadCertificate(page, fileName)
        await beat(page, 800)
        await signIn(page, 'admin')
        await page.getByRole('heading', { name: 'Admin Dashboard' }).waitFor()
        await beat(page, 500)
        await page.getByRole('link', { name: 'Approvals' }).click()
        await page.getByRole('heading', { name: 'Approval Management' }).waitFor()
        const uploadedRow = page.locator('tr', { hasText: fileName })
        await uploadedRow.waitFor()
        await beat(page, 400)
        await uploadedRow.getByRole('button', { name: 'Approve' }).click()
        await uploadedRow.getByText('Approved').waitFor()
        await beat(page, 700)
        await signIn(page, 'faculty')
        await page.getByRole('link', { name: 'Uploaded Files' }).click()
        await page.getByRole('heading', { name: /Uploaded Files/ }).waitFor()
        await page.locator('tr', { hasText: fileName }).getByText('Approved').waitFor()
        await beat(page, 800)
        await page.getByRole('link', { name: 'Profile' }).click()
        await page.getByText('Smart Profile Builder').waitFor()
        await beat(page, 400)
        await page.getByRole('button', { name: 'Generate AI Bio' }).click()
        await page.getByText(/documented academic background and verified credentials/i).waitFor({ timeout: 20_000 })
        await beat(page, 1200)
      },
      async (source) => {
        const output = path.join(OUT_DIR, 'demo.mp4')
        await toMp4(source, output)
        logSize(output)
      },
    )

    await captureClip(
      browser,
      'upload',
      {},
      async (page) => {
        await signIn(page, 'faculty')
        await page.getByRole('heading', { name: /Welcome, Dr\. Maria Santos/i }).waitFor()
        await beat(page, 500)
        await uploadCertificate(page, 'feature-upload-certificate.svg')
        await beat(page, 1000)
      },
      async (source) => {
        const output = path.join(OUT_DIR, 'feature-upload.gif')
        await toGif(source, output, { fps: 10, width: 760, speed: 1.15 })
        await shrinkGifIfNeeded(output)
        logSize(output)
      },
    )

    await captureClip(
      browser,
      'approvals',
      {},
      async (page) => {
        const fileName = 'feature-approvals-certificate.svg'
        await signIn(page, 'faculty')
        await page.getByRole('heading', { name: /Welcome, Dr\. Maria Santos/i }).waitFor()
        await uploadCertificate(page, fileName)
        await signIn(page, 'admin')
        await page.getByRole('link', { name: 'Approvals' }).click()
        await page.getByRole('heading', { name: 'Approval Management' }).waitFor()
        const row = page.locator('tr', { hasText: fileName }).last()
        await row.waitFor()
        await beat(page, 500)
        await row.getByRole('button', { name: 'Approve' }).click()
        await row.getByText('Approved').waitFor()
        await beat(page, 1000)
      },
      async (source) => {
        const output = path.join(OUT_DIR, 'feature-approvals.gif')
        await toGif(source, output, { fps: 10, width: 760, speed: 1.25 })
        await shrinkGifIfNeeded(output)
        logSize(output)
      },
    )

    await captureClip(
      browser,
      'profile',
      {},
      async (page) => {
        await signIn(page, 'faculty')
        await page.getByRole('link', { name: 'Profile' }).click()
        await page.getByText('Smart Profile Builder').waitFor()
        await beat(page, 600)
        await page.getByRole('button', { name: 'Generate AI Bio' }).click()
        await page.getByText(/documented academic background and verified credentials/i).waitFor({ timeout: 20_000 })
        await beat(page, 1200)
      },
      async (source) => {
        const output = path.join(OUT_DIR, 'feature-profile.gif')
        await toGif(source, output, { fps: 10, width: 760 })
        await shrinkGifIfNeeded(output)
        logSize(output)
      },
    )

    await captureClip(
      browser,
      'theme',
      { reducedMotion: 'no-preference' },
      async (page) => {
        await goto(page, '/')
        await page.getByRole('heading', { name: /CCIS Smart Faculty Profile Management System/i }).waitFor()
        const toggle = page.getByRole('button', { name: 'Switch to dark mode' })
        await toggle.waitFor()
        await beat(page, 700)
        await toggle.click()
        await page.getByRole('button', { name: 'Switch to light mode' }).waitFor({ timeout: 8000 })
        await beat(page, 1100)
        await page.getByRole('button', { name: 'Switch to light mode' }).click()
        await page.getByRole('button', { name: 'Switch to dark mode' }).waitFor({ timeout: 8000 })
        await beat(page, 900)
      },
      async (source) => {
        const output = path.join(OUT_DIR, 'feature-theme.gif')
        await toGif(source, output, { fps: 12, width: 760 })
        await shrinkGifIfNeeded(output)
        logSize(output)
      },
    )

    await captureClip(
      browser,
      'uploaded-files',
      {},
      async (page) => {
        await signIn(page, 'faculty')
        await page.getByRole('link', { name: 'Uploaded Files' }).click()
        await page.getByRole('heading', { name: /Uploaded Files/ }).waitFor()
        await beat(page, 700)
        await page.getByText(/Pending \(/).click()
        await beat(page, 900)
        await page.getByText(/^All \(/).first().click()
        await beat(page, 1000)
      },
      async (source) => {
        const output = path.join(OUT_DIR, 'feature-uploaded-files.gif')
        await toGif(source, output, { fps: 10, width: 760 })
        await shrinkGifIfNeeded(output)
        logSize(output)
      },
    )

    await captureClip(
      browser,
      'web-vitals',
      { hideVitals: false },
      async (page) => {
        await goto(page, '/')
        await page.getByRole('heading', { name: /CCIS Smart Faculty Profile Management System/i }).waitFor()
        await beat(page, 600)
        await page.getByRole('button', { name: 'Web Vitals', exact: true }).click()
        await page.getByRole('region', { name: 'Web Vitals panel' }).waitFor()
        await beat(page, 1400)
      },
      async (source) => {
        const output = path.join(OUT_DIR, 'feature-web-vitals.gif')
        await toGif(source, output, { fps: 10, width: 760 })
        await shrinkGifIfNeeded(output)
        logSize(output)
      },
    )
  } finally {
    await browser.close()
  }
}

capture().catch((error) => {
  console.error(error)
  process.exit(1)
})
