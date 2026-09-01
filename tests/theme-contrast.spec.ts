import { expect, test } from '@playwright/test'
import { appRoute, appRoutePattern } from './helpers'

async function signInAsFaculty (page: import('@playwright/test').Page) {
  await page.goto(appRoute('/auth/login'))
  await page.getByRole('button', { name: 'Faculty demo' }).click()
  await page.getByRole('button', { name: 'Login' }).click()
  await expect(page).toHaveURL(appRoutePattern('/faculty/dashboard'))
}

test('landing and login honor the active light and dark theme', async ({ page }) => {
  await page.goto(appRoute('/'))

  const html = page.locator('html')
  const toggle = page.getByRole('button', { name: /switch to (dark|light) mode/i })
  await expect(toggle).toBeEnabled()

  const startedDark = await html.evaluate(element => element.classList.contains('dark'))
  await toggle.click()

  if (startedDark) {
    await expect(html).not.toHaveClass(/dark/)
  } else {
    await expect(html).toHaveClass(/dark/)
  }

  const afterToggleDark = !startedDark
  const background = await page.locator('main').evaluate(element => getComputedStyle(element).backgroundColor)
  expect(background).not.toBe('rgb(2, 6, 23)')
  expect(background).not.toBe('rgb(248, 250, 252)')

  await page.goto(appRoute('/auth/login'))
  if (afterToggleDark) {
    await expect(html).toHaveClass(/dark/)
  } else {
    await expect(html).not.toHaveClass(/dark/)
  }

  const loginBackground = await page.locator('body').evaluate(element => getComputedStyle(element).backgroundColor)
  expect(loginBackground).not.toBe('rgb(2, 6, 23)')
})

test('faculty settings theme switch keeps dashboard chrome on semantic colors', async ({ page }) => {
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

  await page.goto(appRoute('/faculty/dashboard'))
  const dashboard = page.locator('main').first()
  await expect(dashboard).toBeVisible()
  const color = await dashboard.evaluate(element => getComputedStyle(element).color)
  const background = await dashboard.evaluate(element => getComputedStyle(element).backgroundColor)
  expect(color).not.toBe(background)
})
