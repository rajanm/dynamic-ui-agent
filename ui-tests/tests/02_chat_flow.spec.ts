
import { test, expect } from '@playwright/test';

test.describe('Chat Flow', () => {

  test.beforeEach(async ({ page }) => {
    page.on('console', msg => console.log(`BROWSER LOG: ${msg.text()}`));
    await page.goto('/');
    // Wait for the app to be stable or verify title
    await expect(page).toHaveTitle(/Agent/i); // Adjust based on actual title "Vehicle Agent"
  });

  test('Continuous Conversation: History is preserved', async ({ page }) => {
    const input = page.locator('input');
    const sendButton = page.getByRole('button', { name: 'Send' });

    // First message
    await input.fill('Hello');
    await sendButton.click();
    await expect(page.locator('.message.agent').last()).toBeVisible({ timeout: 60000 });

    // Second message
    await expect(input).toBeEnabled();
    await input.fill('what cars do you have');
    await sendButton.click();

    // Verify we have at least 4 messages (User, Agent, User, Agent)
    // Or at least verify the new user message is there
    await expect(page.locator('.message.user').nth(1)).toContainText('what cars do you have');

    // Verify response to second message
    const agentCount = await page.locator('.message.agent').count();
    expect(agentCount).toBeGreaterThanOrEqual(2);
  });

  test('Focus UX: Input remains focused after sending', async ({ page }) => {
    const input = page.locator('input');
    const sendButton = page.getByRole('button', { name: 'Send' });

    // Ensure input is focused initially
    await input.click();
    await expect(input).toBeFocused();

    // Type and send
    await input.fill('hello');
    await sendButton.click();

    // Verify input regains focus
    await expect(page.locator('.bubble.typing')).not.toBeVisible({ timeout: 60000 });
    await expect(input).toBeEnabled();
    await expect(input).toBeFocused();
  });
});
