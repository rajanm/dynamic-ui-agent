
import { test, expect } from '@playwright/test';

test.describe('Agent Info Capabilities', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the app to be stable
    await expect(page).toHaveTitle(/Agent/i);
  });

  test('Product Search Agent: Find vehicles', async ({ page }) => {
    const input = page.locator('input');
    const sendButton = page.getByRole('button', { name: 'Send' });

    // Ask to find SUVs
    await expect(input).toBeEnabled();
    await input.fill('Find me an SUV');
    await sendButton.click();

    // Wait for loading to finish
    await expect(page.locator('.bubble.typing')).not.toBeVisible({ timeout: 30000 });

    // Expect response from agent
    const agentMessage = page.locator('.message.agent').last();
    await expect(agentMessage).toBeVisible({ timeout: 60000 });

    // The mock server returns SUVs like "Toyota RAV4", "Honda CR-V", "Ford Explorer"
    // We check for some keywords that likely appear in the response
    await expect(agentMessage).toContainText(/SUV|Toyota|Honda|Ford/i);
  });

  test('Product Compare Agent: Compare vehicles', async ({ page }) => {
    const input = page.locator('input');
    const sendButton = page.getByRole('button', { name: 'Send' });

    // Ask to compare vehicles
    await expect(input).toBeEnabled();
    await input.fill('Compare vehicle v1 and v2');
    await sendButton.click();

    // Wait for loading to finish
    await expect(page.locator('.bubble.typing')).not.toBeVisible({ timeout: 30000 });

    // Expect response
    const agentMessage = page.locator('.message.agent').last();
    await expect(agentMessage).toBeVisible({ timeout: 60000 });

    // Mock API returns comparison data
    await expect(agentMessage).toContainText(/comparison|vs|feature/i);
  });
});
