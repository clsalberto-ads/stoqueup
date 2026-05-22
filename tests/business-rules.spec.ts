import { test, expect } from '@playwright/test';

/**
 * Testes E2E para regras de negócio críticas corrigidas nesta sessão.
 *
 * Pré-condição: seed populado com admin@stoqueup.com.br / password123
 */

async function loginAsAdmin(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.fill('input[type="email"]', 'admin@stoqueup.com.br');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  // Aguarda navegação para dashboard OU toast de erro
  await page.waitForURL(/\/dashboard/, { timeout: 15000 });
}

test.describe('Regras de negócio — Produção', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('bloqueia criação de tarefa duplicada para mesmo produto', async ({ page }) => {
    await page.goto('/dashboard/production');

    // Clica em "Nova Tarefa"
    await page.getByRole('button', { name: /nova tarefa|nova produção/i }).click();
    await page.waitForTimeout(500);

    // Seleciona o primeiro produto disponível no Select
    const select = page.getByRole('combobox', { name: /produto/i });
    await select.click();
    await page.waitForTimeout(300);

    // Clica no primeiro item da lista
    const firstOption = page.getByRole('option').first();
    await firstOption.click();
    await page.waitForTimeout(300);

    // Define quantidade
    const qtyInput = page.getByRole('spinbutton', { name: /quantidade/i });
    await qtyInput.fill('5');

    // Submete
    await page.getByRole('button', { name: /criar|confirmar/i }).click();

    // Aguarda sucesso
    await expect(page.getByText(/sucesso|criada/i)).toBeVisible({ timeout: 10000 });

    // Tenta criar outra para o mesmo produto
    await page.getByRole('button', { name: /nova tarefa|nova produção/i }).click();
    await page.waitForTimeout(500);

    await select.click();
    await page.waitForTimeout(300);
    await firstOption.click();
    await page.waitForTimeout(300);
    await qtyInput.fill('3');
    await page.getByRole('button', { name: /criar|confirmar/i }).click();

    // Deve rejeitar
    await expect(page.getByText(/já existe|pendente/i)).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Regras de negócio — Vendas', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('venda não permite quantidade acima do estoque', async ({ page }) => {
    await page.goto('/dashboard/sales');

    // Clica em "Nova Venda"
    await page.getByRole('button', { name: /nova venda/i }).click();
    await page.waitForTimeout(500);

    // Seleciona produto
    const productSelect = page.getByRole('combobox', { name: /produto/i });
    await productSelect.click();
    await page.waitForTimeout(300);
    await page.getByRole('option').first().click();
    await page.waitForTimeout(300);

    // Tenta quantidade maior que estoque
    const qtyInput = page.getByRole('spinbutton', { name: /quantidade/i });
    await qtyInput.fill('99999');

    // Verifica se o botão de submit está desabilitado ou se aparece erro
    const submitBtn = page.getByRole('button', { name: /vender|confirmar/i });
    const isDisabled = await submitBtn.isDisabled();

    if (!isDisabled) {
      await submitBtn.click();
      await page.waitForTimeout(1000);
      await expect(page.getByText(/estoque|insuficiente/i)).toBeVisible({ timeout: 5000 });
    }
  });
});
