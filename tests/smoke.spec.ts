import { test, expect } from '@playwright/test';

test('login page loads correctly', async ({ page }) => {
  await page.goto('/login');
  
  // Verificar se o título do sistema aparece
  await expect(page.locator('h1')).toContainText('StoqueUp');
  
  // Verificar se o formulário de login está presente
  await expect(page.locator('button[type="submit"]')).toBeVisible();
  await expect(page.locator('input[type="email"]')).toBeVisible();
});

test('dashboard redirect when unauthenticated', async ({ page }) => {
  await page.goto('/dashboard');
  
  // Deve redirecionar para o login
  await expect(page).toHaveURL(/.*login/);
});
