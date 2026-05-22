import { test, expect } from '@playwright/test';

test.describe('Smart Profile Management System - Essential Flows', () => {
  test('Landing page loads correctly', async ({ page }) => {
    // Attempt to navigate to the landing page
    await page.goto('http://localhost:5173/');
    
    // Check if main title or key elements are visible
    // Adjust selector based on actual landing page content
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
  });

  test('Login page renders and can be interacted with', async ({ page }) => {
    await page.goto('http://localhost:5173/auth/login');
    
    const emailInput = page.getByPlaceholder(/email|example/i).first();
    const passwordInput = page.getByPlaceholder(/password/i).first();
    const submitButton = page.locator('button[type="submit"]');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();

    // We do not actually submit to avoid hitting the real Supabase backend 
    // without a dedicated test environment.
  });
});
