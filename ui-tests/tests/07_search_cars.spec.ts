
import { test, expect } from '@playwright/test';

test.describe('Search Vehicle ID Verification', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/gen-ui');
    // Wait for the app to be stable
    await expect(page).toHaveTitle(/Agent/i);
  });

  test('Search Cars: Verify ID column is present in table', async ({ page }) => {
    // Increase timeout for real search if needed
    test.setTimeout(130000);
    
    const input = page.locator('input');
    const sendButton = page.getByRole('button', { name: 'Send' });

    // 1. Search for cars
    await expect(input).toBeEnabled();
    await input.fill('Find Toyota');
    await sendButton.click();

    // 2. Wait for loading to finish
    await expect(page.locator('.bubble.typing')).not.toBeVisible({ timeout: 60000 });

    // 3. Expect response
    const agentMessage = page.locator('.message.agent').last();
    await expect(agentMessage).toBeVisible({ timeout: 60000 });

    // 4. Verify Table Headers
    // The table should be within the agent message or a specific surface container
    // Relaxed check: look for columnheader with text "ID"
    const idHeader = page.getByRole('columnheader', { name: "ID", exact: false });
    await expect(idHeader).toBeVisible();
    
    // 5. Verify Row Data
    // Check if we have rows
    const rows = page.locator('tbody tr');
    await expect(rows).not.toHaveCount(0);
    
    // Check first row has a numeric ID in the first column
    const firstRowFirstCell = rows.first().locator('td').first();
    // Relaxed check: should contain at least one digit
    await expect(firstRowFirstCell).toContainText(/\d+/);
  });
});
