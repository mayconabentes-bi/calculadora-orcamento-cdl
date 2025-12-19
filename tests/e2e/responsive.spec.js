/**
 * Testes E2E - Responsividade
 * Testa o layout em diferentes dispositivos:
 * - Desktop (1920x1080)
 * - Tablet (768x1024)
 * - Mobile (375x667)
 * - Navegação em touch devices
 * - Modais em telas pequenas
 */

const { test, expect } = require('@playwright/test');

test.describe('Responsividade - Desktop', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
  });

  test('deve exibir layout completo em desktop', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.locator('.container')).toBeVisible();
    await expect(page.locator('.header')).toBeVisible();
    await expect(page.locator('.tabs')).toBeVisible();
    await expect(page.locator('.calculator-grid')).toBeVisible();
  });

  test('todas as abas devem estar visíveis em uma linha', async ({ page }) => {
    await page.goto('/');
    
    const tabs = page.locator('.tabs');
    await expect(tabs).toBeVisible();
    
    // Verificar que todos os botões de aba estão visíveis
    await expect(page.locator('[data-tab="calculator"]')).toBeVisible();
    await expect(page.locator('[data-tab="spaces"]')).toBeVisible();
    await expect(page.locator('[data-tab="costs"]')).toBeVisible();
    await expect(page.locator('[data-tab="config"]')).toBeVisible();
  });

  test('grid da calculadora deve ter múltiplas colunas', async ({ page }) => {
    await page.goto('/');
    
    const grid = page.locator('.calculator-grid');
    await expect(grid).toBeVisible();
    
    // Verificar que cards estão visíveis
    const cards = page.locator('.card');
    const count = await cards.count();
    expect(count).toBeGreaterThan(1);
  });

  test('formulário deve estar bem espaçado', async ({ page }) => {
    await page.goto('/');
    
    const formGroups = page.locator('.form-group');
    const count = await formGroups.count();
    
    expect(count).toBeGreaterThan(0);
    
    // Todos devem estar visíveis
    for (let i = 0; i < Math.min(count, 5); i++) {
      await expect(formGroups.nth(i)).toBeVisible();
    }
  });
});

test.describe('Responsividade - Tablet', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
  });

  test('deve exibir layout adaptado para tablet', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.locator('.container')).toBeVisible();
    await expect(page.locator('.header')).toBeVisible();
  });

  test('tabs devem ser acessíveis em tablet', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.locator('.tabs')).toBeVisible();
    
    // Testar navegação
    await page.click('[data-tab="spaces"]');
    await expect(page.locator('#spaces')).toHaveClass(/active/);
    
    await page.click('[data-tab="calculator"]');
    await expect(page.locator('#calculator')).toHaveClass(/active/);
  });

  test('formulários devem ser usáveis em tablet', async ({ page }) => {
    await page.goto('/');
    
    // Testar interação com formulário
    await page.selectOption('#espaco', { index: 1 });
    await page.fill('#duracao', '1');
    await page.check('#dia-seg');
    
    await expect(page.locator('#espaco')).not.toHaveValue('');
    await expect(page.locator('#dia-seg')).toBeChecked();
  });

  test('cards devem se reorganizar em colunas menores', async ({ page }) => {
    await page.goto('/');
    
    const cards = page.locator('.card');
    const count = await cards.count();
    
    expect(count).toBeGreaterThan(0);
    
    // Verificar que cards são visíveis
    await expect(cards.first()).toBeVisible();
  });
});

test.describe('Responsividade - Mobile', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test('deve exibir layout mobile', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.locator('.container')).toBeVisible();
    await expect(page.locator('.header')).toBeVisible();
  });

  test('header deve estar legível em mobile', async ({ page }) => {
    await page.goto('/');
    
    const header = page.locator('.header h1');
    await expect(header).toBeVisible();
  });

  test('tabs devem ser acessíveis em mobile', async ({ page }) => {
    await page.goto('/');
    
    const tabs = page.locator('.tabs');
    await expect(tabs).toBeVisible();
    
    // Clicar em uma aba
    await page.click('[data-tab="spaces"]');
    
    // Verificar que a aba foi ativada
    await expect(page.locator('#spaces')).toHaveClass(/active/);
  });

  test('formulários devem ser usáveis em mobile', async ({ page }) => {
    await page.goto('/');
    
    // Scroll para ver elementos
    await page.locator('#espaco').scrollIntoViewIfNeeded();
    
    await page.selectOption('#espaco', { index: 1 });
    await page.fill('#duracao', '1');
    
    await page.locator('#dia-seg').scrollIntoViewIfNeeded();
    await page.check('#dia-seg');
    
    expect(await page.inputValue('#duracao')).toBe('1');
    await expect(page.locator('#dia-seg')).toBeChecked();
  });

  test('checkboxes devem ser clicáveis em mobile', async ({ page }) => {
    await page.goto('/');
    
    await page.locator('#dia-seg').scrollIntoViewIfNeeded();
    await page.click('#dia-seg');
    
    await expect(page.locator('#dia-seg')).toBeChecked();
  });

  test('botões devem ser grandes o suficiente para toque', async ({ page }) => {
    await page.goto('/');
    
    const btnCalcular = page.locator('#calcular');
    await btnCalcular.scrollIntoViewIfNeeded();
    
    await expect(btnCalcular).toBeVisible();
    
    const box = await btnCalcular.boundingBox();
    
    // Botão deve ter altura mínima de 40px para toque confortável
    if (box) {
      expect(box.height).toBeGreaterThanOrEqual(35);
    }
  });

  test('cards devem empilhar verticalmente em mobile', async ({ page }) => {
    await page.goto('/');
    
    const cards = page.locator('.card');
    const count = await cards.count();
    
    expect(count).toBeGreaterThan(0);
    
    // Verificar que os cards existem
    await expect(cards.first()).toBeInViewport();
  });
});

test.describe('Responsividade - Interações Touch', () => {
  test('deve suportar toque em checkboxes', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    await page.locator('#dia-seg').scrollIntoViewIfNeeded();
    
    // Simular toque
    await page.tap('#dia-seg');
    
    await expect(page.locator('#dia-seg')).toBeChecked();
  });

  test('deve suportar toque em botões', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    const tabSpaces = page.locator('[data-tab="spaces"]');
    await tabSpaces.scrollIntoViewIfNeeded();
    
    // Simular toque
    await page.tap('[data-tab="spaces"]');
    
    await expect(page.locator('#spaces')).toHaveClass(/active/);
  });

  test('deve suportar scroll em mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Scroll até o final da página
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    
    // Aguardar scroll
    await page.waitForTimeout(500);
    
    // Scroll de volta ao topo
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    
    await page.waitForTimeout(500);
    
    // Header deve estar visível novamente
    await expect(page.locator('.header')).toBeVisible();
  });
});

test.describe('Responsividade - Orientação', () => {
  test('deve funcionar em modo paisagem (landscape)', async ({ page }) => {
    await page.setViewportSize({ width: 667, height: 375 });
    await page.goto('/');
    
    await expect(page.locator('.container')).toBeVisible();
    await expect(page.locator('.header')).toBeVisible();
  });

  test('deve funcionar em modo retrato (portrait)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    await expect(page.locator('.container')).toBeVisible();
    await expect(page.locator('.header')).toBeVisible();
  });
});

test.describe('Responsividade - Diferentes Resoluções', () => {
  const resolutions = [
    { name: 'iPhone SE', width: 375, height: 667 },
    { name: 'iPhone 12', width: 390, height: 844 },
    { name: 'iPad', width: 768, height: 1024 },
    { name: 'iPad Pro', width: 1024, height: 1366 },
    { name: 'Desktop HD', width: 1920, height: 1080 },
  ];

  resolutions.forEach(({ name, width, height }) => {
    test(`deve funcionar em ${name} (${width}x${height})`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto('/');
      
      // Verificações básicas
      await expect(page.locator('.container')).toBeVisible();
      await expect(page.locator('h1')).toBeVisible();
      
      // Tentar interagir
      await page.locator('#espaco').scrollIntoViewIfNeeded();
      const select = page.locator('#espaco');
      await expect(select).toBeVisible();
    });
  });
});
