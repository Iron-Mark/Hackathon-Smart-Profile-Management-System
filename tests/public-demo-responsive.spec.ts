import { expect, test } from '@playwright/test'
import { appRoute } from './helpers'

async function expectNoHorizontalOverflow (page: import('@playwright/test').Page) {
  const overflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth - document.documentElement.clientWidth
  })

  expect(overflow).toBeLessThanOrEqual(1)
}

test('public demo entry is usable on a mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(appRoute('/'))

  await expect(page.getByText('Browser-local demo mode')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Start demo' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Web Vitals' })).toBeVisible()
  await expect(
    page.getByRole('heading', {
      name: /CCIS Smart Faculty Profile Management System/i
    })
  ).toBeVisible()
  await expect(page.getByRole('link', { name: 'Register' })).toBeVisible()
  await expectNoHorizontalOverflow(page)

  await page.goto(appRoute('/auth/register'))
  await expect(page.getByLabel('Email')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Reset demo data' })).toBeVisible()
  await expectNoHorizontalOverflow(page)
})

test('start demo prepares seeded faculty credentials', async ({ page }) => {
  await page.goto(appRoute('/'))

  await page.getByRole('link', { name: 'Start demo' }).click()
  await expect(page).toHaveURL(/\/auth\/login\?demo=faculty$/)
  await expect(page.getByLabel('Email')).toHaveValue('faculty@umak.edu.ph')
  await expect(page.locator('input#password')).toHaveValue('Faculty123')
  await expect(page.getByRole('status')).toContainText('faculty@umak.edu.ph is ready to sign in.')
})

test('seeded demo login is usable on a tablet viewport', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 })
  await page.goto(appRoute('/auth/login'))

  await page.getByRole('button', { name: 'Faculty demo' }).click()
  await expect(page.getByLabel('Email')).toHaveValue('faculty@umak.edu.ph')
  await expect(page.locator('input#password')).toHaveValue('Faculty123')

  await page.getByRole('button', { name: 'Login' }).click()
  await expect(page).toHaveURL(/\/faculty\/dashboard$/)
  await expect(
    page.getByRole('heading', { name: /Welcome, Dr\. Maria Santos/i })
  ).toBeVisible()
  await expect(page.getByRole('button', { name: 'Clear demo data' })).toBeVisible()
  await expectNoHorizontalOverflow(page)
})
