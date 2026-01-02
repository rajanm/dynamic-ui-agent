import { test, expect } from '@playwright/test';

test.describe('Conversational UI Text Fallback', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/'); // Default "Conversational" tab (text-only)
    await expect(page).toHaveTitle(/Agent/i);
  });

  test('Search Cars: Verify text table fallback', async ({ page }) => {
    test.setTimeout(130000);
    const input = page.locator('input');
    const sendButton = page.getByRole('button', { name: 'Send' });

    // 1. Search for cars
    await input.fill('Find Toyota cars');
    await sendButton.click();

    // 2. Wait for response
    const agentMessage = page.locator('.message.agent').last();
    await expect(agentMessage).toBeVisible({ timeout: 60000 });

    // 3. Verify NO Angular table surface
    const tableComponent = agentMessage.locator('app-a2ui-table');
    await expect(tableComponent).not.toBeVisible();

    // 4. Verify Text Content
    // Should contain "Here are the results" or simple table structure
    await expect(agentMessage).toContainText("Here are the results");
    await expect(agentMessage).toContainText("Toyota");
    await expect(agentMessage).toContainText("Camry");
    // Check for some pipe delimiters if we used them
    // await expect(agentMessage).toContainText("|"); 
  });

  test('Compare Cars: Verify text comparison fallback', async ({ page }) => {
    const input = page.locator('input');
    const sendButton = page.getByRole('button', { name: 'Send' });

    // 1. Compare
    await input.fill('Compare 1 and 5'); // Assuming mock data has these
    await sendButton.click();

    // 2. Wait for response
    const agentMessage = page.locator('.message.agent').last();
    await expect(agentMessage).toBeVisible({ timeout: 60000 });

    // 3. Verify NO Card Comparison component
    const cardComponent = agentMessage.locator('app-a2ui-card-comparison');
    // Note: It might be present in DOM but processing text? 
    // Wait, if we rendered "text" type, SurfaceComponent isn't even created.
    // 'app-a2ui-surface' renders 'app-a2ui-card-comparison' only if type matches.
    // In text mode, we push 'type: text', so no 'app-a2ui-surface' at all.
    await expect(cardComponent).not.toBeVisible();

    // 4. Verify Text Content
    await expect(agentMessage).toContainText("Verdict:");
    await expect(agentMessage).toContainText("Price:");
  });
});
