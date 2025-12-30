
import { test, expect } from '@playwright/test';

test.describe('Chat Basics', () => {

  test.beforeEach(async ({ page }) => {
    page.on('console', msg => console.log(`BROWSER LOG: ${msg.text()}`));
    await page.goto('/');
    // Wait for the app to be stable or verify title
    await expect(page).toHaveTitle(/Agent/i); // Adjust based on actual title "Vehicle Agent"
  });

  test('Happy Path: Send message and receive response', async ({ page }) => {
    // 1. Locate input and button
    const input = page.locator('input'); // Or input[placeholder="Type a message..."]
    const sendButton = page.getByRole('button', { name: 'Send' }); // specific selector if needed

    // 2. Type "Hello"
    await input.fill('Hello');
    await sendButton.click();

    // 3. Verify user message appears
    const userMessage = page.locator('.message.user').last();
    await expect(userMessage).toContainText('Hello');

    // 4. Wait for agent response
    const agentMessage = page.locator('.message.agent').last();
    await expect(agentMessage).toBeVisible({ timeout: 60000 }); // Give LLM time
    // Ensure it's not the default empty state if strictly checking new one
    await expect(agentMessage).not.toHaveText('Thinking...');
  });

  test('Input Validation: Empty message should not send', async ({ page }) => {
    const input = page.locator('input');
    const sendButton = page.getByRole('button', { name: 'Send' });
    const messageCount = await page.locator('.message').count();

    await expect(input).toBeEnabled();
    await input.fill('');
    await expect(sendButton).toBeDisabled();

    // Verify count did not increase
    expect(await page.locator('.message').count()).toBe(messageCount);
  });
});
