import { expect, test } from '@playwright/test'
import { appRoute, appRoutePattern } from './helpers'

async function signInAsFaculty (page: import('@playwright/test').Page) {
  await page.goto(appRoute('/auth/login'))
  await page.getByRole('button', { name: 'Faculty demo' }).click()
  await page.getByRole('button', { name: 'Login' }).click()
  await expect(page).toHaveURL(appRoutePattern('/faculty/dashboard'))
}

test('faculty profile education add and edit dialogs save and close cleanly', async ({ page }) => {
  await signInAsFaculty(page)
  await page.goto(appRoute('/faculty/profile'))

  await page.getByRole('button', { name: 'Add Education' }).click()
  let dialog = page.getByRole('dialog', { name: 'Add Education' })
  await expect(dialog).toBeVisible()
  await dialog.getByPlaceholder(/Degree/).fill('Reusable Architecture Fellowship')
  await dialog.getByPlaceholder('Institution').fill('Demo Institute')
  await dialog.getByRole('button', { name: 'Save' }).click()
  await expect(dialog).toBeHidden()
  await expect(page.getByText('Reusable Architecture Fellowship')).toBeVisible()

  await page.getByLabel('Edit education Reusable Architecture Fellowship').click()
  dialog = page.getByRole('dialog', { name: 'Edit Education' })
  await expect(dialog).toBeVisible()
  await dialog.getByPlaceholder('Institution').fill('Updated Demo Institute')
  await dialog.getByRole('button', { name: 'Save' }).click()
  await expect(dialog).toBeHidden()
  await expect(page.getByText('Updated Demo Institute')).toBeVisible()
})

test('faculty uploaded file category edits persist after refresh', async ({ page }) => {
  await signInAsFaculty(page)
  await page.goto(appRoute('/faculty/uploaded'))

  const diplomaCard = page.locator('[data-slot="card"]', { hasText: 'sample-diploma.svg' }).first()
  await expect(diplomaCard).toContainText('Diplomas')
  await diplomaCard.getByRole('button', { name: 'Edit' }).click()

  const dialog = page.getByRole('dialog', { name: 'Edit File' })
  await dialog.getByRole('combobox').click()
  await page.getByRole('option', { name: /Certificates/ }).click()
  await expect(dialog).toContainText('Certificates')

  await page.reload()
  const updatedCard = page.locator('[data-slot="card"]', { hasText: 'sample-diploma.svg' }).first()
  await expect(updatedCard).toContainText('Certificates')
  await expect(updatedCard).toContainText('Pending')
})

test('faculty uploaded file removal persists after refresh', async ({ page }) => {
  await signInAsFaculty(page)
  await page.goto(appRoute('/faculty/uploaded'))

  const certificateCard = page.locator('[data-slot="card"]', { hasText: 'sample-certificate.svg' }).first()
  await expect(certificateCard).toBeVisible()
  await certificateCard.getByRole('button', { name: 'Remove' }).click()
  await expect(page.locator('[data-slot="card"]', { hasText: 'sample-certificate.svg' })).toHaveCount(0)

  await page.reload()
  await expect(page.locator('[data-slot="card"]', { hasText: 'sample-certificate.svg' })).toHaveCount(0)
})
