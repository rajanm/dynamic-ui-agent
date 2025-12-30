
import { test, expect } from '@playwright/test';

test.describe('Agent Action Capabilities', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the app to be stable
    await expect(page).toHaveTitle(/Agent/i);
  });

  test('Product Book Agent: Book a vehicle', async ({ page }) => {
    const input = page.locator('input');
    const sendButton = page.getByRole('button', { name: 'Send' });

    // Ask to book
    await expect(input).toBeEnabled();
    await input.fill('Book vehicle v1 for John Doe on 2025-01-01');
    await sendButton.click();

    // Wait for loading to finish
    await expect(page.locator('.bubble.typing')).not.toBeVisible({ timeout: 60000 });

    // Expect response
    const agentMessage = page.locator('.message.agent').last();
    await expect(agentMessage).toBeVisible({ timeout: 60000 });

    // Mock API returns booking confirmation or the booked car object
    await expect(agentMessage).toContainText(/Book|confirm|Tesla|Model 3/i);
  });

  test('Market Trend Agent: Ask for trends', async ({ page }) => {
    test.setTimeout(130000); // Allow enough time for real Google Search tool
    const input = page.locator('input');
    const sendButton = page.getByRole('button', { name: 'Send' });

    // Ask for trends
    await expect(input).toBeEnabled();
    await input.fill('What are the latest market trends for electric vehicles in Singapore?');
    await sendButton.click();

    // Wait for loading to finish
    await expect(page.locator('.bubble.typing')).not.toBeVisible({ timeout: 180000 });

    // Expect response
    const agentMessage = page.locator('.message.agent').last();
    await expect(agentMessage).toBeVisible({ timeout: 60000 }); // Should be visible if loading is done

    // Response should be non-empty and likely contain "trend" or "electric"
    await expect(agentMessage).toContainText(/trend|electric|EV|market|Singapore/i);
  });
});
