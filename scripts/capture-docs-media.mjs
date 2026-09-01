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

function fileSizeMb (filePath) {
  return fs.statSync(filePath).size / (1024 * 1024)
}

function logSize (filePath) {
  console.log(`Wrote ${path.relative(ROOT, filePath)} (${fileSizeMb(filePath).toFixed(2)} MB)`)
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

async function hideWebVitals (page) {
  await page.addStyleTag({
    content: [
      '[aria-label="Web Vitals"],',
      '[aria-label="Web Vitals panel"],',
      '[aria-label="Close Web Vitals panel"] {',
      '  display: none !important;',
      '}',
    ].join(' '),
  })
}

async function beat (_page, ms = 700) {
  // Use a real timer so Playwright screenshots can keep firing during holds.
  await new Promise((resolve) => setTimeout(resolve, ms))
}

async function waitForRouteReady (page) {
  const loading = page.getByRole('status').filter({ hasText: 'Loading screen' })
  await loading.waitFor({ state: 'detached', timeout: 20_000 }).catch(() => {})
  await page.evaluate(() => document.fonts.ready)
}

async function goto (page, pathname, { hideVitals = true } = {}) {
  await page.goto(urlFor(pathname), { waitUntil: 'domcontentloaded' })
  await waitForRouteReady(page)
  if (hideVitals) await hideWebVitals(page)
  await beat(page, 250)
}

async function signIn (page, role, { hideVitals = true } = {}) {
  await goto(page, '/auth/login', { hideVitals })
  await page.getByRole('button', { name: role === 'faculty' ? 'Faculty demo' : 'Admin demo' }).click()
  await beat(page, 250)
  await page.getByRole('button', { name: 'Login' }).click()
}

async function uploadCertificate (page, fileName) {
  await page
    .getByRole('region', { name: 'Smart upload' })
    .locator('input[type="file"]')
    .setInputFiles(certificateUpload(fileName))
  const submit = page.getByRole('button', { name: 'Submit files' })
  await submit.waitFor({ state: 'visible' })
  await beat(page, 500)
  await submit.click()
  await page.getByText('Type: Certificates').waitFor({ timeout: 20_000 })
}

function padFrame (index) {
  return `${String(index).padStart(5, '0')}.jpg`
}

function createGrabber (page) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'docs-media-'))
  let index = 0
  let paused = true
  let stopped = false
  let inFlight = false
  let clientPromise

  const tick = async () => {
    if (stopped || paused || inFlight) return
    inFlight = true
    try {
      if (!clientPromise) clientPromise = page.context().newCDPSession(page)
      const client = await clientPromise
      const { data } = await client.send('Page.captureScreenshot', {
        format: 'jpeg',
        quality: 80,
        fromSurface: true,
      })
      const filePath = path.join(dir, padFrame(index))
      await fs.promises.writeFile(filePath, Buffer.from(data, 'base64'))
      index += 1
    } catch {
      // Ignore frames captured during navigation or context teardown.
    } finally {
      inFlight = false
    }
  }

  const timer = setInterval(() => {
    void tick()
  }, 80)

  return {
    dir,
    resume () {
      paused = false
    },
    pause () {
      paused = true
    },
    async stop () {
      stopped = true
      clearInterval(timer)
      for (let i = 0; i < 30 && inFlight; i += 1) {
        await new Promise((resolve) => setTimeout(resolve, 40))
      }
      if (clientPromise) {
        const client = await clientPromise.catch(() => null)
        await client?.detach().catch(() => {})
      }
      if (index < 12) {
        throw new Error(`Too few frames captured in ${dir} (${index})`)
      }
      return { dir, frames: index }
    },
  }
}

async function sequenceToGif (dir, output, { fps = 11, width = 840, colors = 80 } = {}) {
  await execFileAsync('ffmpeg', [
    '-y',
    '-hide_banner',
    '-loglevel',
    'error',
    '-framerate',
    String(fps),
    '-start_number',
    '0',
    '-i',
    path.join(dir, '%05d.jpg'),
    '-vf',
    `fps=${fps},scale=${width}:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=${colors}:stats_mode=diff[p];[s1][p]paletteuse=dither=bayer:bayer_scale=5`,
    '-loop',
    '0',
    output,
  ])
}

async function sequenceToMp4 (dir, output, { fps = 12 } = {}) {
  await execFileAsync('ffmpeg', [
    '-y',
    '-hide_banner',
    '-loglevel',
    'error',
    '-framerate',
    String(fps),
    '-start_number',
    '0',
    '-i',
    path.join(dir, '%05d.jpg'),
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
    '26',
    '-preset',
    'medium',
    output,
  ])
}

async function shrinkGifIfNeeded (filePath, maxMb = 3.2) {
  if (fileSizeMb(filePath) <= maxMb) return
  console.log(`Shrinking ${path.relative(ROOT, filePath)} from ${fileSizeMb(filePath).toFixed(2)} MB…`)
  const tempPath = `${filePath}.tmp.gif`
  await execFileAsync('ffmpeg', [
    '-y',
    '-hide_banner',
    '-loglevel',
    'error',
    '-i',
    filePath,
    '-vf',
    'fps=8,scale=640:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=48:stats_mode=diff[p];[s1][p]paletteuse=dither=bayer:bayer_scale=5',
    '-loop',
    '0',
    tempPath,
  ])
  fs.renameSync(tempPath, filePath)
}

async function withPage (browser, { theme = 'light', hideVitals = true, reducedMotion = 'reduce' }, work) {
  const context = await browser.newContext({
    viewport: VIEWPORT,
    colorScheme: theme,
    reducedMotion,
  })
  await setTheme(context, theme)
  const page = await context.newPage()
  const grabber = createGrabber(page)
  try {
    await work(page, grabber, hideVitals)
    return await grabber.stop()
  } catch (error) {
    await grabber.stop().catch(() => {})
    throw error
  } finally {
    await context.close()
  }
}

async function recordClip (browser, name, options, work, convert) {
  if (!shouldCapture(name)) {
    console.log(`Skipping ${name}`)
    return
  }
  console.log(`Recording ${name}…`)
  const { dir, frames } = await withPage(browser, options, work)
  console.log(`  ${frames} frames`)
  try {
    await convert(dir)
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
}

async function assertDevServer () {
  const response = await fetch(urlFor('/'))
  if (!response.ok) {
    throw new Error(`Dev server at ${BASE_URL} returned HTTP ${response.status}. Start it with npm run dev.`)
  }
}

async function capture () {
  await assertDevServer()
  fs.mkdirSync(OUT_DIR, { recursive: true })
  const browser = await chromium.launch({ headless: true, slowMo: 55 })

  try {
    await recordClip(
      browser,
      'preview',
      {},
      async (page, grabber, hideVitals) => {
        await goto(page, '/', { hideVitals })
        await page.getByRole('heading', { name: /CCIS Smart Faculty Profile Management System/i }).waitFor()
        grabber.resume()
        await beat(page, 1400)
        grabber.pause()
        await page.getByRole('link', { name: 'Start demo' }).click()
        await page.getByRole('heading', { name: 'Welcome Back' }).waitFor()
        await waitForRouteReady(page)
        if (hideVitals) await hideWebVitals(page)
        grabber.resume()
        await beat(page, 1000)
        grabber.pause()
        await page.getByRole('button', { name: 'Login' }).click()
        await page.getByRole('heading', { name: /Welcome, Dr\. Maria Santos/i }).waitFor()
        await waitForRouteReady(page)
        if (hideVitals) await hideWebVitals(page)
        grabber.resume()
        await beat(page, 1800)
      },
      async (dir) => {
        const output = path.join(OUT_DIR, 'preview.gif')
        await sequenceToGif(dir, output, { fps: 11, width: 920, colors: 96 })
        await shrinkGifIfNeeded(output, 2.8)
        logSize(output)
      },
    )

    await recordClip(
      browser,
      'demo',
      {},
      async (page, grabber, hideVitals) => {
        const fileName = 'ccis-showcase-certificate.svg'
        await goto(page, '/', { hideVitals })
        await page.getByRole('heading', { name: /CCIS Smart Faculty Profile Management System/i }).waitFor()
        grabber.resume()
        await beat(page, 1100)
        grabber.pause()
        await page.getByRole('link', { name: 'Start demo' }).click()
        await page.getByRole('heading', { name: 'Welcome Back' }).waitFor()
        await waitForRouteReady(page)
        if (hideVitals) await hideWebVitals(page)
        grabber.resume()
        await beat(page, 800)
        grabber.pause()
        await page.getByRole('button', { name: 'Login' }).click()
        await page.getByRole('heading', { name: /Welcome, Dr\. Maria Santos/i }).waitFor()
        await waitForRouteReady(page)
        if (hideVitals) await hideWebVitals(page)
        grabber.resume()
        await beat(page, 900)
        await uploadCertificate(page, fileName)
        await beat(page, 1100)
        grabber.pause()
        await signIn(page, 'admin', { hideVitals })
        await page.getByRole('heading', { name: 'Admin Dashboard' }).waitFor()
        await waitForRouteReady(page)
        if (hideVitals) await hideWebVitals(page)
        grabber.resume()
        await beat(page, 700)
        grabber.pause()
        await page.getByRole('link', { name: 'Approvals', exact: true }).click()
        await page.getByRole('heading', { name: 'Approval Management' }).waitFor()
        await waitForRouteReady(page)
        if (hideVitals) await hideWebVitals(page)
        grabber.resume()
        const uploadedRow = page.locator('tr', { hasText: fileName })
        await uploadedRow.waitFor()
        await beat(page, 600)
        await uploadedRow.getByRole('button', { name: 'Approve' }).click()
        await uploadedRow.getByText('Approved').waitFor()
        await beat(page, 1000)
        grabber.pause()
        await signIn(page, 'faculty', { hideVitals })
        await page.getByRole('link', { name: 'Uploaded Files' }).click()
        await page.getByRole('heading', { name: /Uploaded Files/ }).waitFor()
        await waitForRouteReady(page)
        if (hideVitals) await hideWebVitals(page)
        grabber.resume()
        await page.locator('tr', { hasText: fileName }).getByText('Approved').waitFor()
        await beat(page, 1200)
        grabber.pause()
        await page.getByRole('link', { name: 'Profile' }).click()
        await page.getByText('Smart Profile Builder').waitFor()
        await waitForRouteReady(page)
        if (hideVitals) await hideWebVitals(page)
        grabber.resume()
        await beat(page, 700)
        await page.getByRole('button', { name: 'Generate AI Bio' }).click()
        await page.getByText(/documented academic background and verified credentials/i).waitFor({ timeout: 20_000 })
        await beat(page, 1600)
      },
      async (dir) => {
        const output = path.join(OUT_DIR, 'demo.mp4')
        await sequenceToMp4(dir, output)
        logSize(output)
      },
    )

    await recordClip(
      browser,
      'upload',
      {},
      async (page, grabber, hideVitals) => {
        await signIn(page, 'faculty', { hideVitals })
        await page.getByRole('heading', { name: /Welcome, Dr\. Maria Santos/i }).waitFor()
        await waitForRouteReady(page)
        if (hideVitals) await hideWebVitals(page)
        grabber.resume()
        await beat(page, 900)
        await uploadCertificate(page, 'feature-upload-certificate.svg')
        await beat(page, 1500)
      },
      async (dir) => {
        const output = path.join(OUT_DIR, 'feature-upload.gif')
        await sequenceToGif(dir, output)
        await shrinkGifIfNeeded(output)
        logSize(output)
      },
    )

    await recordClip(
      browser,
      'approvals',
      {},
      async (page, grabber, hideVitals) => {
        const fileName = 'feature-approvals-certificate.svg'
        await signIn(page, 'faculty', { hideVitals })
        await page.getByRole('heading', { name: /Welcome, Dr\. Maria Santos/i }).waitFor()
        await uploadCertificate(page, fileName)
        await signIn(page, 'admin', { hideVitals })
        await page.getByRole('link', { name: 'Approvals', exact: true }).click()
        await page.getByRole('heading', { name: 'Approval Management' }).waitFor()
        await waitForRouteReady(page)
        if (hideVitals) await hideWebVitals(page)
        grabber.resume()
        const row = page.locator('tr', { hasText: fileName }).last()
        await row.waitFor()
        await beat(page, 900)
        await row.getByRole('button', { name: 'Approve' }).click()
        await row.getByText('Approved').waitFor()
        await beat(page, 1400)
      },
      async (dir) => {
        const output = path.join(OUT_DIR, 'feature-approvals.gif')
        await sequenceToGif(dir, output)
        await shrinkGifIfNeeded(output)
        logSize(output)
      },
    )

    await recordClip(
      browser,
      'profile',
      {},
      async (page, grabber, hideVitals) => {
        await signIn(page, 'faculty', { hideVitals })
        await page.getByRole('link', { name: 'Profile' }).click()
        await page.getByText('Smart Profile Builder').waitFor()
        await waitForRouteReady(page)
        if (hideVitals) await hideWebVitals(page)
        grabber.resume()
        await beat(page, 1000)
        await page.getByRole('button', { name: 'Generate AI Bio' }).click()
        await page.getByText(/documented academic background and verified credentials/i).waitFor({ timeout: 20_000 })
        await beat(page, 1600)
      },
      async (dir) => {
        const output = path.join(OUT_DIR, 'feature-profile.gif')
        await sequenceToGif(dir, output)
        await shrinkGifIfNeeded(output)
        logSize(output)
      },
    )

    await recordClip(
      browser,
      'theme',
      { reducedMotion: 'no-preference' },
      async (page, grabber, hideVitals) => {
        await signIn(page, 'faculty', { hideVitals })
        await page.getByRole('heading', { name: /Welcome, Dr\. Maria Santos/i }).waitFor()
        await waitForRouteReady(page)
        if (hideVitals) await hideWebVitals(page)
        const darkToggle = page.getByRole('button', { name: 'Switch to dark mode' })
        await darkToggle.waitFor()
        grabber.resume()
        await beat(page, 1200)
        await darkToggle.click()
        await page.getByRole('button', { name: 'Switch to light mode' }).waitFor({ timeout: 8000 })
        await beat(page, 1500)
        await page.getByRole('button', { name: 'Switch to light mode' }).click()
        await page.getByRole('button', { name: 'Switch to dark mode' }).waitFor({ timeout: 8000 })
        await beat(page, 1300)
      },
      async (dir) => {
        const output = path.join(OUT_DIR, 'feature-theme.gif')
        await sequenceToGif(dir, output, { fps: 12, width: 840, colors: 96 })
        await shrinkGifIfNeeded(output)
        logSize(output)
      },
    )

    await recordClip(
      browser,
      'uploaded-files',
      {},
      async (page, grabber, hideVitals) => {
        await signIn(page, 'faculty', { hideVitals })
        await page.getByRole('link', { name: 'Uploaded Files' }).click()
        await page.getByRole('heading', { name: /Uploaded Files/ }).waitFor()
        await waitForRouteReady(page)
        if (hideVitals) await hideWebVitals(page)
        grabber.resume()
        await beat(page, 1000)
        await page.getByText(/Pending \(/).click()
        await beat(page, 1100)
        await page.getByText(/^All \(/).first().click()
        await beat(page, 1300)
      },
      async (dir) => {
        const output = path.join(OUT_DIR, 'feature-uploaded-files.gif')
        await sequenceToGif(dir, output)
        await shrinkGifIfNeeded(output)
        logSize(output)
      },
    )

    await recordClip(
      browser,
      'web-vitals',
      { hideVitals: false },
      async (page, grabber) => {
        await goto(page, '/', { hideVitals: false })
        await page.getByRole('heading', { name: /CCIS Smart Faculty Profile Management System/i }).waitFor()
        grabber.resume()
        await beat(page, 900)
        await page.getByRole('button', { name: 'Web Vitals', exact: true }).click()
        await page.getByRole('region', { name: 'Web Vitals panel' }).waitFor()
        await beat(page, 1800)
      },
      async (dir) => {
        const output = path.join(OUT_DIR, 'feature-web-vitals.gif')
        await sequenceToGif(dir, output)
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
