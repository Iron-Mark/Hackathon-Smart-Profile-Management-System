import { expect, test } from '@playwright/test'
import { appRoute, appRoutePattern } from './helpers'

function webVitalsButton (page: import('@playwright/test').Page) {
  return page.getByRole('button', { name: 'Web Vitals', exact: true })
}

test('landing Web Vitals button opens live metrics in the lower right', async ({ page }) => {
  await page.goto(appRoute('/'))

  const button = webVitalsButton(page)
  await expect(button).toBeVisible()
  await expect(button).toBeEnabled()
  await button.click()

  const panel = page.getByRole('region', { name: 'Web Vitals panel' })
  await expect(panel).toBeVisible()
  await expect(panel.getByText('Core Web Vitals')).toBeVisible()
  await expect(panel).not.toHaveText('Unable to load Web Vitals')
  await expect(button).toHaveAttribute('aria-expanded', 'true')

  await expect
    .poll(async () => panel.locator('dt').count(), { timeout: 10_000 })
    .toBeGreaterThan(0)

  await page.getByRole('button', { name: 'Close Web Vitals panel' }).click()
  await expect(panel).toHaveCount(0)
  await expect(button).toHaveAttribute('aria-expanded', 'false')
})

test('login Web Vitals button stays clickable above the demo access panel', async ({ page }) => {
  await page.goto(appRoute('/auth/login'))

  await expect(page.getByRole('region', { name: 'Demo access' })).toBeVisible()
  const button = webVitalsButton(page)
  await expect(button).toBeVisible()
  await button.click()

  await expect(page.getByRole('region', { name: 'Web Vitals panel' })).toBeVisible()
  await expect(button).toHaveAttribute('aria-expanded', 'true')
})

test('faculty dashboard Web Vitals button opens after sign in', async ({ page }) => {
  await page.goto(appRoute('/auth/login'))
  await page.getByRole('button', { name: 'Faculty demo' }).click()
  await page.getByRole('button', { name: 'Login' }).click()
  await expect(page).toHaveURL(appRoutePattern('/faculty/dashboard'))

  const button = webVitalsButton(page)
  await expect(button).toBeVisible()
  await button.click()
  await expect(page.getByRole('region', { name: 'Web Vitals panel' })).toBeVisible()
})
