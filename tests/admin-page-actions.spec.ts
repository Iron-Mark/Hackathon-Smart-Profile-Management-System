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

test('admin dashboard export and quick action buttons navigate correctly', async ({ page }) => {
  await signInAsAdmin(page)

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export CSV' }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe('submissions_export.csv')

  const main = page.getByRole('main')
  await main.getByRole('link', { name: 'Add User' }).click()
  await expect(page).toHaveURL(appRoutePattern('/admin/accounts'))

  await page.goto(appRoute('/admin/dashboard'))
  await main.getByRole('link', { name: 'View Approvals' }).click()
  await expect(page).toHaveURL(appRoutePattern('/admin/approvals'))

  await page.goto(appRoute('/admin/dashboard'))
  await main.getByRole('link', { name: 'Generate Report' }).click()
  await expect(page).toHaveURL(appRoutePattern('/admin/reports'))

  await page.goto(appRoute('/admin/dashboard'))
  await main.getByRole('link', { name: 'Settings' }).click()
  await expect(page).toHaveURL(appRoutePattern('/admin/settings'))
})

test('admin audit log filters, settings tabs, and help accordions respond', async ({ page }) => {
  await signInAsAdmin(page)

  await page.goto(appRoute('/admin/audit-logs'))
  await expect(page.getByRole('heading', { name: 'System Audit Logs' })).toBeVisible()
  await page.getByPlaceholder('Filter by User Email...').fill('admin@umak.edu.ph')
  await page.getByRole('combobox').click()
  await page.getByRole('option', { name: 'LOGIN' }).click()
  await expect(page.locator('tbody')).toContainText('admin@umak.edu.ph')

  await page.getByPlaceholder('Filter by User Email...').fill('no-match@example.com')
  await expect(page.getByText('No audit logs found.')).toBeVisible()
  await page.getByRole('button', { name: 'Refresh' }).click()
  await expect(page.getByText('No audit logs found.')).toBeVisible()

  await page.goto(appRoute('/admin/settings'))
  await page.getByRole('tab', { name: 'Forms' }).click()
  await expect(page.getByRole('heading', { name: 'Active Document Categories' })).toBeVisible()
  await page.getByRole('tab', { name: 'Notifications' }).click()
  const reminderSwitch = page.getByRole('switch', { name: 'Reminder Notifications' })
  const before = await reminderSwitch.getAttribute('aria-checked')
  await reminderSwitch.click()
  await expect(reminderSwitch).toHaveAttribute('aria-checked', before === 'true' ? 'false' : 'true')

  await page.reload()
  await expect(page.getByRole('switch', { name: 'Reminder Notifications' })).toHaveAttribute(
    'aria-checked',
    before === 'true' ? 'false' : 'true'
  )

  await page.goto(appRoute('/admin/help'))
  await page.getByRole('button', { name: 'Account Management' }).click()
  await expect(page.getByText('Detailed instructions on how to create')).toBeVisible()
  await page.getByRole('button', { name: 'Audit Logs' }).click()
  await expect(page.getByText('Understanding how to view and interpret audit logs')).toBeVisible()
})

test('faculty settings password validation and logout controls respond', async ({ page }) => {
  await signInAsFaculty(page)
  await page.goto(appRoute('/faculty/settings'))

  await page.getByRole('button', { name: 'Change Account Password' }).click()
  await expect(page.getByRole('dialog', { name: 'Change Password' })).toBeVisible()
  await page.getByLabel('New Password', { exact: true }).fill('Faculty456')
  await page.getByLabel('Confirm New Password').fill('Faculty789')
  await page.getByRole('button', { name: 'Update Password' }).click()
  await expect(page.getByText('Passwords do not match')).toBeVisible()
  await page.getByRole('button', { name: 'Cancel' }).click()
  await expect(page.getByRole('dialog', { name: 'Change Password' })).toBeHidden()

  await page.getByRole('button', { name: 'Sign Out of All Devices' }).click()
  await expect(page).toHaveURL(appRoutePattern('/auth/login'))
})
