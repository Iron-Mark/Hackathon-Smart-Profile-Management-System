import path from 'node:path'
import { expect, test, type Page } from '@playwright/test'
import { appRoute, appRoutePattern } from './helpers'

const sampleCertificate = path.resolve(process.cwd(), 'public/demo-samples/sample-certificate.svg')

async function signInAsFaculty (page: Page) {
  await page.goto(appRoute('/auth/login'))
  await page.getByRole('button', { name: 'Faculty demo' }).click()
  await page.getByRole('button', { name: 'Login' }).click()
  await expect(page).toHaveURL(appRoutePattern('/faculty/dashboard'))
}

async function signInAsAdmin (page: Page) {
  await page.goto(appRoute('/auth/login'))
  await page.getByRole('button', { name: 'Admin demo' }).click()
  await page.getByRole('button', { name: 'Login' }).click()
  await expect(page).toHaveURL(appRoutePattern('/admin/dashboard'))
}

test('invalid credentials stay on login with an inline error', async ({ page }) => {
  await page.goto(appRoute('/auth/login'))
  await page.getByLabel('Email').fill('nobody@example.com')
  await page.locator('input#password').fill('WrongPass1')
  await page.getByRole('button', { name: 'Login' }).click()

  await expect(page.getByText(/Invalid demo credentials/i)).toBeVisible()
  await expect(page).toHaveURL(appRoutePattern('/auth/login'))
})

test('register validates name, password strength, and confirmation', async ({ page }) => {
  await page.goto(appRoute('/auth/register'))
  await page.getByRole('button', { name: 'Register' }).click()
  await expect(page.getByText('Full name is required.')).toBeVisible()
  await expect(page.getByText('Enter a valid email address.')).toBeVisible()

  await page.getByLabel('Full Name').fill('Validation Visitor')
  await page.getByLabel('Email').fill('validation@example.com')
  await page.locator('input#password').fill('short')
  await page.locator('input#confirm-password').fill('different')
  await page.getByRole('button', { name: 'Register' }).click()

  await expect(
    page.getByText('Password must be at least 6 characters and contain letters and numbers.')
  ).toBeVisible()
  await expect(page.getByText('Passwords do not match.')).toBeVisible()
})

test('wrong-role routes bounce faculty and admin to their own dashboards', async ({ page }) => {
  await signInAsFaculty(page)
  await page.goto(appRoute('/admin/dashboard'))
  await expect(page).toHaveURL(appRoutePattern('/faculty/dashboard'))

  await page.goto(appRoute('/auth/login'))
  await page.getByRole('button', { name: 'Admin demo' }).click()
  await page.getByRole('button', { name: 'Login' }).click()
  await expect(page).toHaveURL(appRoutePattern('/admin/dashboard'))

  await page.goto(appRoute('/faculty/dashboard'))
  await expect(page).toHaveURL(appRoutePattern('/admin/dashboard'))
})

test('unknown routes render the 404 page and return home', async ({ page }) => {
  await page.goto(appRoute('/this-route-does-not-exist'))
  await expect(page.getByRole('heading', { name: '404' })).toBeVisible()
  await page.getByRole('link', { name: 'Go back home' }).click()
  await expect(page).toHaveURL(appRoutePattern('/'))
  await expect(
    page.getByRole('heading', { name: /CCIS Smart Faculty Profile Management System/i })
  ).toBeVisible()
})

test('landing public facts and crawler files are reachable', async ({ page, request }) => {
  await page.goto(appRoute('/'))
  await expect(page.getByRole('heading', { name: 'Public Demo Facts' })).toBeVisible()

  const answersHref = await page.getByRole('link', { name: 'Answer-engine facts' }).getAttribute('href')
  expect(answersHref).toContain('answers.md')
  expect((await request.get(answersHref!)).ok()).toBe(true)

  const llmsHref = await page.getByRole('link', { name: 'llms.txt' }).getAttribute('href')
  expect(llmsHref).toContain('llms.txt')
  expect((await request.get(llmsHref!)).ok()).toBe(true)

  const openSample = page.getByRole('link', { name: 'Open sample' }).first()
  const sampleHref = await openSample.getAttribute('href')
  expect(sampleHref).toContain('/demo-samples/')
  expect((await request.get(sampleHref!)).ok()).toBe(true)
})

test('faculty dashboard sample downloads and sidebar destinations work', async ({ page, request }) => {
  await signInAsFaculty(page)

  const certificateHref = await page.getByRole('link', { name: 'Certificate' }).getAttribute('href')
  const transcriptHref = await page.getByRole('link', { name: 'Transcript' }).getAttribute('href')
  expect((await request.get(certificateHref!)).ok()).toBe(true)
  expect((await request.get(transcriptHref!)).ok()).toBe(true)

  await page.getByRole('link', { name: 'Profile' }).click()
  await expect(page).toHaveURL(appRoutePattern('/faculty/profile'))
  await page.getByRole('link', { name: 'Uploaded Files' }).click()
  await expect(page).toHaveURL(appRoutePattern('/faculty/uploaded'))
  await page.getByRole('link', { name: 'Settings' }).click()
  await expect(page).toHaveURL(appRoutePattern('/faculty/settings'))
  await page.getByRole('link', { name: 'Dashboard' }).click()
  await expect(page).toHaveURL(appRoutePattern('/faculty/dashboard'))
})

test('smart upload rejects unsupported and oversized files', async ({ page }) => {
  await signInAsFaculty(page)
  const upload = page.getByRole('region', { name: 'Smart upload' })

  await upload.locator('input[type="file"]').setInputFiles({
    name: 'notes.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('not a credential'),
  })
  await expect(page.getByRole('alert')).toContainText('notes.txt is not supported')
  await expect(page.getByRole('button', { name: 'Submit files' })).toBeDisabled()

  await upload.locator('input[type="file"]').setInputFiles({
    name: 'too-big.png',
    mimeType: 'image/png',
    buffer: Buffer.alloc(2 * 1024 * 1024 + 1, 1),
  })
  await expect(page.getByRole('alert')).toContainText('too-big.png is too large')
})

test('admin can return a credential and faculty sees Returned', async ({ page }) => {
  await signInAsFaculty(page)
  await page
    .getByRole('region', { name: 'Smart upload' })
    .locator('input[type="file"]')
    .setInputFiles({
      name: 'return-me-certificate.png',
      mimeType: 'image/png',
      buffer: Buffer.from('return me'),
    })
  await page.getByRole('button', { name: 'Submit files' }).click()
  await expect(page.getByText('Type: Certificates')).toBeVisible()

  await signInAsAdmin(page)
  await page.goto(appRoute('/admin/approvals'))
  const uploadedRow = page.locator('tr', { hasText: 'return-me-certificate.png' })
  await expect(uploadedRow).toContainText('Pending')
  await uploadedRow.getByRole('button', { name: 'Return' }).click()
  await expect(uploadedRow).toContainText('Returned')

  await signInAsFaculty(page)
  await page.goto(appRoute('/faculty/uploaded'))
  const card = page.locator('[data-slot="card"]', { hasText: 'return-me-certificate.png' }).first()
  await expect(card).toContainText('Returned')

  await page.getByText(/Pending \(/).click()
  await expect(page.locator('[data-slot="card"]', { hasText: 'return-me-certificate.png' })).toHaveCount(0)
  await page.getByText(/^All \(/).first().click()
  await expect(card).toBeVisible()
})

test('faculty profile bio, work, development, print, and autofill work', async ({ page }) => {
  test.setTimeout(90_000)
  await signInAsFaculty(page)
  await page.goto(appRoute('/faculty/profile'))
  await expect(page.getByText('Smart Profile Builder')).toBeVisible()

  await page.getByRole('button', { name: 'Generate AI Bio' }).click()
  await expect(
    page.getByText(/documented academic background and verified credentials/i)
  ).toBeVisible()

  await page.getByRole('button', { name: 'Add Work Experience' }).click()
  const workDialog = page.getByRole('dialog', { name: 'Add Work Experience' })
  await workDialog.getByPlaceholder('Role').fill('Capstone Mentor')
  await workDialog.getByPlaceholder('Organization').fill('CCIS Demo Lab')
  await workDialog.getByPlaceholder(/Period/).fill('2024 - 2026')
  await workDialog.getByRole('button', { name: 'Save' }).click()
  await expect(workDialog).toBeHidden()
  await expect(page.getByText('Capstone Mentor')).toBeVisible()
  page.once('dialog', (dialog) => dialog.accept())
  await page.getByLabel('Delete work experience Capstone Mentor').click()
  await expect(page.getByText('Capstone Mentor')).toHaveCount(0)

  await page.getByRole('button', { name: 'Add Professional Development' }).click()
  const devDialog = page.getByRole('dialog', { name: 'Add Professional Development' })
  await expect(devDialog).toBeVisible()
  await devDialog.getByPlaceholder('Role/Activity').fill('AI Teaching Workshop')
  await devDialog.getByPlaceholder('Organization').fill('UMak CCIS')
  await devDialog.getByPlaceholder('Period').fill('2025')
  await devDialog.getByRole('button', { name: 'Save' }).click()
  await expect(devDialog).toBeHidden()
  await expect(page.getByText('AI Teaching Workshop')).toBeVisible()

  await page.evaluate(() => {
    ;(window as Window & { __printCalled?: boolean }).__printCalled = false
    window.print = () => {
      ;(window as Window & { __printCalled?: boolean }).__printCalled = true
    }
  })
  await page.getByRole('button', { name: 'Export PDF' }).click()
  expect(await page.evaluate(() => (window as Window & { __printCalled?: boolean }).__printCalled)).toBe(true)

  const autofillInput = page.locator('input[type="file"][accept="image/*,.pdf"]')
  await autofillInput.setInputFiles(sampleCertificate)
  await expect(page.getByText('Restored Demo Credential')).toBeVisible({ timeout: 60_000 })
})

test('faculty can change password and sign back in with the new one', async ({ page }) => {
  await signInAsFaculty(page)
  await page.goto(appRoute('/faculty/settings'))

  const notifications = page.getByRole('switch', { name: 'Push Notifications' })
  const before = await notifications.getAttribute('aria-checked')
  await notifications.click()
  await expect(notifications).toHaveAttribute(
    'aria-checked',
    before === 'true' ? 'false' : 'true'
  )

  await page.getByRole('button', { name: 'Change Account Password' }).click()
  await page.getByLabel('New Password', { exact: true }).fill('Faculty456')
  await page.getByLabel('Confirm New Password').fill('Faculty456')
  await page.getByRole('button', { name: 'Update Password' }).click()
  await expect(page.getByText('Password updated successfully')).toBeVisible()

  await page.getByRole('button', { name: 'Sign Out of All Devices' }).click()
  await expect(page).toHaveURL(appRoutePattern('/auth/login'))

  await page.getByLabel('Email').fill('faculty@umak.edu.ph')
  await page.locator('input#password').fill('Faculty456')
  await page.getByRole('button', { name: 'Login' }).click()
  await expect(page).toHaveURL(appRoutePattern('/faculty/dashboard'))
})

test('admin sidebar, search, reports, and backup export work', async ({ page }) => {
  await signInAsAdmin(page)

  await page.getByPlaceholder('Search faculty or docs...').fill('sample-diploma')
  await expect(page.getByText(/sample-diploma/i).first()).toBeVisible()
  await page.getByRole('link', { name: 'Manage' }).first().click()
  await expect(page).toHaveURL(appRoutePattern('/admin/approvals'))

  const sidebar = page.locator('[data-sidebar="content"]')
  const destinations = [
    ['Dashboard', '/admin/dashboard'],
    ['Accounts', '/admin/accounts'],
    ['Approvals', '/admin/approvals'],
    ['Audit Logs', '/admin/audit-logs'],
    ['Reports', '/admin/reports'],
    ['Settings', '/admin/settings'],
    ['Help & Support', '/admin/help'],
  ] as const

  for (const [name, route] of destinations) {
    await sidebar.getByRole('link', { name, exact: true }).click()
    await expect(page).toHaveURL(appRoutePattern(route))
  }

  await page.goto(appRoute('/admin/reports'))
  for (const [label, filename] of [
    ['Faculty List & Roles', 'faculty_list'],
    ['System Audit Trail', 'audit_report'],
    ['Faculty Professional Details', 'profile_data'],
  ] as const) {
    await page.getByRole('combobox').click()
    await page.getByRole('option', { name: label }).click()
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Generate & Download CSV' }).click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toMatch(new RegExp(`^${filename}_\\d{4}-\\d{2}-\\d{2}\\.csv$`))
  }

  await page.goto(appRoute('/admin/settings'))
  await page.getByRole('tab', { name: 'Backup & Data' }).click()
  const jsonDownload = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export JSON' }).click()
  const backup = await jsonDownload
  expect(backup.suggestedFilename()).toMatch(/^ccis_fpms_backup_\d{4}-\d{2}-\d{2}\.json$/)
})

test('offline and online toasts appear from the root toaster', async ({ page }) => {
  await signInAsFaculty(page)
  await page.evaluate(() => window.dispatchEvent(new Event('offline')))
  await expect(page.getByText(/Offline Mode/i)).toBeVisible()
  await page.evaluate(() => window.dispatchEvent(new Event('online')))
  await expect(page.getByText(/Back Online/i)).toBeVisible()
})

test('clear demo data from the sidebar restores login', async ({ page }) => {
  await signInAsFaculty(page)
  await page.getByRole('button', { name: 'Clear demo data' }).click()
  await expect(page).toHaveURL(appRoutePattern('/auth/login'))
  await expect(page.getByRole('status')).toContainText('Demo data reset')
})

test('additional seeded faculty can sign in and update profile media', async ({ page }) => {
  await page.goto(appRoute('/auth/login'))
  await page.getByLabel('Email').fill('daniel.reyes@umak.edu.ph')
  await page.locator('input#password').fill('Faculty123')
  await page.getByRole('button', { name: 'Login' }).click()
  await expect(page).toHaveURL(appRoutePattern('/faculty/dashboard'))
  await expect(page.getByRole('heading', { name: /Welcome, Prof\. Daniel Reyes/i })).toBeVisible()

  await page.goto(appRoute('/faculty/profile'))
  await page.locator('input[accept="image/*"]').nth(1).setInputFiles({
    name: 'avatar.png',
    mimeType: 'image/png',
    buffer: Buffer.from('avatar'),
  })
  await expect(page.getByText('Profile picture updated')).toBeVisible()

  await page.getByRole('button', { name: 'Edit profile description' }).click()
  const dialog = page.getByRole('dialog', { name: 'Edit Description' })
  await dialog.locator('textarea').fill('Updated demo biography for Daniel Reyes.')
  await dialog.getByRole('button', { name: 'Save' }).click()
  await expect(dialog).toBeHidden()
  await expect(page.getByText('Updated demo biography for Daniel Reyes.')).toBeVisible()
})

test('faculty uploaded page can ingest a sample file through Select File', async ({ page }) => {
  test.setTimeout(90_000)
  await signInAsFaculty(page)
  await page.goto(appRoute('/faculty/uploaded'))

  await page.locator('#file-upload').setInputFiles({
    name: 'uploaded-page-certificate.png',
    mimeType: 'image/png',
    buffer: Buffer.from('certificate of completion'),
  })

  await expect(page.getByText(/Extracting text from image/i)).toBeVisible()
  await expect(
    page.locator('[data-slot="card"]', { hasText: 'uploaded-page-certificate.png' })
  ).toBeVisible({ timeout: 60_000 })
})
