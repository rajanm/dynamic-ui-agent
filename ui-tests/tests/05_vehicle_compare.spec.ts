import { test, expect } from '@playwright/test';

test.describe('Vehicle Comparison', () => {

  test.beforeEach(async ({ page }) => {
    // page.on('console', msg => console.log(`BROWSER LOG: ${msg.text()}`));
    await page.goto('/gen-ui');
    await expect(page).toHaveTitle(/Agent/i);
  });

  test('Compare Toyota and Honda displays verdict and details', async ({ page }) => {
    const input = page.locator('input');
    const sendButton = page.getByRole('button', { name: 'Send' });

    // Send comparison request
    await input.fill('Compare Toyota and Honda');
    await sendButton.click();

    // Wait for the comparison card component to appear
    // We target the specific class or element structure
    const comparisonContainer = page.locator('app-a2ui-card-comparison');
    await expect(comparisonContainer).toBeVisible({ timeout: 30000 });

    // Verify Verdict
    await expect(comparisonContainer).toContainText('Comparison Verdict');
    await expect(comparisonContainer).toContainText('Comparing Toyota Camry vs Honda Accord');
    await expect(comparisonContainer).toContainText('Toyota is known for reliable');

    // Verify Vehicle Cards
    // Toyota Camry
    await expect(comparisonContainer).toContainText('Toyota Camry');
    await expect(comparisonContainer).toContainText('Silver');
    await expect(comparisonContainer).toContainText('Sedan');
    await expect(comparisonContainer).toContainText('$28,000');
    await expect(comparisonContainer).toContainText('Reliable');

    // Honda Accord
    await expect(comparisonContainer).toContainText('Honda Accord');
    await expect(comparisonContainer).toContainText('Black');
    await expect(comparisonContainer).toContainText('Sporty'); // Feature
    await expect(comparisonContainer).toContainText('$29,000');
    
    // Verify "Book Test Drive" buttons exist
    const bookButtons = comparisonContainer.locator('button', { hasText: 'Book Test Drive' });
    await expect(bookButtons).toHaveCount(2);
  });

  test('Compare Tesla and BMW displays correct vehicles', async ({ page }) => {
    const input = page.locator('input');
    const sendButton = page.getByRole('button', { name: 'Send' });

    await input.fill('Compare Tesla and BMW');
    await sendButton.click();

    const comparisonContainer = page.locator('app-a2ui-card-comparison');
    await expect(comparisonContainer).toBeVisible({ timeout: 30000 });

    await expect(comparisonContainer).toContainText('Comparing Tesla Model 3 vs BMW X5');
    await expect(comparisonContainer).toContainText('Tesla Model 3');
    await expect(comparisonContainer).toContainText('BMW X5');
  });
});
