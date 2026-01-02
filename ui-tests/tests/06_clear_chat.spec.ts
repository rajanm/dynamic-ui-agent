import { test, expect } from '@playwright/test';

test.describe('Clear Chat Functionality', () => {
  test('should clear chat history when clear button is clicked', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');

    // Ensure we are on the page
    await expect(page.getByRole('heading', { name: 'vehicle shopping agent' }).first()).toBeVisible();

    // Type a message
    const input = page.locator('input');
    await input.fill('Hello Testing');
    
    // Send the message
    await page.getByRole('button', { name: 'Send' }).click();

    // Verify message appears
    await expect(page.locator('.message.user .bubble')).toContainText('Hello Testing');
    
    // Click Clear button
    await page.getByRole('button', { name: 'Clear' }).click();

    // Verify messages are gone
    await expect(page.locator('.message.user .bubble')).not.toBeVisible();
    await expect(page.locator('.message')).toHaveCount(0);
  });
});
