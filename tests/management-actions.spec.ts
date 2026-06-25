import { expect, test } from '@playwright/test'
import { appRoute, appRoutePattern } from './helpers'

async function signInAsAdmin (page: import('@playwright/test').Page) {
  await page.goto(appRoute('/auth/login'))
  await page.getByRole('button', { name: 'Admin demo' }).click()
  await page.getByRole('button', { name: 'Login' }).click()
  await expect(page).toHaveURL(appRoutePattern('/admin/dashboard'))
}

async function signInAsFaculty (page: import('@playwright/test').Page) {
  await page.goto(appRoute('/auth/login'))
  await page.getByRole('button', { name: 'Faculty demo' }).click()
  await page.getByRole('button', { name: 'Login' }).click()
  await expect(page).toHaveURL(appRoutePattern('/faculty/dashboard'))
}

test('admin backup export buttons download browser-local demo data', async ({ page }) => {
  await signInAsAdmin(page)
  await page.goto(appRoute('/admin/settings'))
  await page.getByRole('tab', { name: 'Backup & Data' }).click()

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export Backup' }).click()
  const download = await downloadPromise

  expect(download.suggestedFilename()).toMatch(/^ccis_fpms_backup_\d{4}-\d{2}-\d{2}\.json$/)
})

test('admin report generator downloads the selected CSV report', async ({ page }) => {
  await signInAsAdmin(page)
  await page.goto(appRoute('/admin/reports'))

  await page.getByRole('combobox').click()
  await page.getByRole('option', { name: 'Submissions Summary' }).click()

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Generate & Download CSV' }).click()
  const download = await downloadPromise

  expect(download.suggestedFilename()).toMatch(/^submissions_report_\d{4}-\d{2}-\d{2}\.csv$/)
})

test('faculty settings dark mode switch changes the active theme', async ({ page }) => {
  await signInAsFaculty(page)
  await page.goto(appRoute('/faculty/settings'))

  const darkMode = page.getByRole('switch', { name: 'Dark Mode' })
  const before = await darkMode.getAttribute('aria-checked')

  await darkMode.click()

  if (before === 'true') {
    await expect(darkMode).toHaveAttribute('aria-checked', 'false')
    await expect(page.locator('html')).not.toHaveClass(/dark/)
  } else {
    await expect(darkMode).toHaveAttribute('aria-checked', 'true')
    await expect(page.locator('html')).toHaveClass(/dark/)
  }
})
