/**
 * Testes E2E - Correção do Bloqueio de Cálculo
 * 
 * Testa especificamente os cenários que foram corrigidos:
 * 1. DataSanitizer em modo flexível
 * 2. Validação de data com confirmação
 */

const { test, expect } = require('@playwright/test');

test.describe('Correção do Bloqueio - DataSanitizer Flexível', () => {
  
  test('deve permitir cálculo com nome em CAPS', async ({ page }) => {
    await page.goto('/dashboard-admin.html');
    
    // Preencher com nome em CAPS
    await page.fill('#cliente-nome', 'MARIA SILVA');
    await page.fill('#cliente-contato', '11987654321');
    
    // Selecionar espaço
    await page.selectOption('#espaco', { index: 1 });
    
    // Selecionar data futura
    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    const dataFormatada = amanha.toISOString().split('T')[0];
    await page.fill('#data-evento', dataFormatada);
    
    // Selecionar dias da semana
    await page.check('#dia-seg');
    await page.check('#dia-ter');
    
    // Configurar horário
    const horario = page.locator('.horario-item').first();
    await horario.locator('[id^="horario-inicio"]').fill('08:00');
    await horario.locator('[id^="horario-fim"]').fill('17:00');
    
    // Calcular
    await page.click('#calcular');
    
    // Verificar que o cálculo foi realizado
    const valorTotal = await page.locator('#valor-total').textContent();
    expect(valorTotal).not.toBe('0,00');
    expect(valorTotal).not.toBe('');
  });
  
  test('deve permitir cálculo com nome simples', async ({ page }) => {
    await page.goto('/dashboard-admin.html');
    
    // Preencher com nome simples
    await page.fill('#cliente-nome', 'João Silva');
    await page.fill('#cliente-contato', 'joao@empresa.com');
    
    // Selecionar espaço
    await page.selectOption('#espaco', { index: 1 });
    
    // Selecionar data futura
    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 7);
    const dataFormatada = amanha.toISOString().split('T')[0];
    await page.fill('#data-evento', dataFormatada);
    
    // Selecionar dias da semana
    await page.check('#dia-seg');
    await page.check('#dia-qua');
    await page.check('#dia-sex');
    
    // Configurar horário
    const horario = page.locator('.horario-item').first();
    await horario.locator('[id^="horario-inicio"]').fill('09:00');
    await horario.locator('[id^="horario-fim"]').fill('18:00');
    
    // Calcular
    await page.click('#calcular');
    
    // Verificar que o cálculo foi realizado
    const valorTotal = await page.locator('#valor-total').textContent();
    expect(valorTotal).not.toBe('0,00');
    expect(valorTotal).not.toBe('');
  });
  
  test('deve bloquear quando nome está vazio', async ({ page }) => {
    await page.goto('/dashboard-admin.html');
    
    // Não preencher nome
    await page.fill('#cliente-contato', '11987654321');
    
    // Selecionar espaço
    await page.selectOption('#espaco', { index: 1 });
    
    // Selecionar data futura
    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    const dataFormatada = amanha.toISOString().split('T')[0];
    await page.fill('#data-evento', dataFormatada);
    
    // Selecionar dias
    await page.check('#dia-seg');
    
    // Configurar horário
    const horario = page.locator('.horario-item').first();
    await horario.locator('[id^="horario-inicio"]').fill('08:00');
    await horario.locator('[id^="horario-fim"]').fill('17:00');
    
    // Tentar calcular - deve ser bloqueado
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('nome');
      await dialog.accept();
    });
    
    await page.click('#calcular');
    
    // Verificar que cálculo NÃO foi realizado
    const valorTotal = await page.locator('#valor-total').textContent();
    expect(valorTotal).toBe('0,00');
  });
});

test.describe('Correção do Bloqueio - Data com Confirmação', () => {
  
  test('deve permitir cálculo com data passada após confirmação', async ({ page }) => {
    await page.goto('/dashboard-admin.html');
    
    // Preencher dados do cliente
    await page.fill('#cliente-nome', 'Pedro Santos');
    await page.fill('#cliente-contato', '21999887766');
    
    // Selecionar espaço
    await page.selectOption('#espaco', { index: 1 });
    
    // Selecionar data PASSADA (ontem)
    const ontem = new Date();
    ontem.setDate(ontem.getDate() - 1);
    const dataFormatada = ontem.toISOString().split('T')[0];
    await page.fill('#data-evento', dataFormatada);
    
    // Selecionar dias
    await page.check('#dia-seg');
    await page.check('#dia-ter');
    
    // Configurar horário
    const horario = page.locator('.horario-item').first();
    await horario.locator('[id^="horario-inicio"]').fill('08:00');
    await horario.locator('[id^="horario-fim"]').fill('17:00');
    
    // Configurar para aceitar o dialog de confirmação
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('passado');
      await dialog.accept(); // Confirmar que quer continuar
    });
    
    // Calcular
    await page.click('#calcular');
    
    // Verificar que o cálculo foi realizado após confirmação
    await page.waitForTimeout(500); // Esperar um pouco para o cálculo processar
    const valorTotal = await page.locator('#valor-total').textContent();
    expect(valorTotal).not.toBe('0,00');
    expect(valorTotal).not.toBe('');
  });
  
  test('não deve calcular com data passada se usuário cancelar', async ({ page }) => {
    await page.goto('/dashboard-admin.html');
    
    // Preencher dados
    await page.fill('#cliente-nome', 'Ana Costa');
    await page.fill('#cliente-contato', 'ana@empresa.com');
    
    // Selecionar espaço
    await page.selectOption('#espaco', { index: 1 });
    
    // Selecionar data PASSADA
    const ontem = new Date();
    ontem.setDate(ontem.getDate() - 1);
    const dataFormatada = ontem.toISOString().split('T')[0];
    await page.fill('#data-evento', dataFormatada);
    
    // Selecionar dias
    await page.check('#dia-seg');
    
    // Configurar horário
    const horario = page.locator('.horario-item').first();
    await horario.locator('[id^="horario-inicio"]').fill('08:00');
    await horario.locator('[id^="horario-fim"]').fill('17:00');
    
    // Configurar para CANCELAR o dialog de confirmação
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('passado');
      await dialog.dismiss(); // Cancelar - não quer continuar
    });
    
    // Tentar calcular
    await page.click('#calcular');
    
    // Verificar que cálculo NÃO foi realizado
    await page.waitForTimeout(500);
    const valorTotal = await page.locator('#valor-total').textContent();
    expect(valorTotal).toBe('0,00');
  });
});

test.describe('Correção do Bloqueio - Casos Reais', () => {
  
  test('cenário completo: empresa com formatação não ideal', async ({ page }) => {
    await page.goto('/dashboard-admin.html');
    
    // Nome com formatação não ideal mas válido
    await page.fill('#cliente-nome', 'EMPRESA ABC LTDA');
    await page.fill('#cliente-contato', 'CONTATO@EMPRESA.COM');
    
    // Selecionar espaço
    await page.selectOption('#espaco', { index: 1 });
    
    // Data futura
    const proximaSemana = new Date();
    proximaSemana.setDate(proximaSemana.getDate() + 7);
    const dataFormatada = proximaSemana.toISOString().split('T')[0];
    await page.fill('#data-evento', dataFormatada);
    
    // Configurar duração
    await page.fill('#duracao', '6');
    await page.selectOption('#duracao-tipo', 'meses');
    
    // Selecionar dias
    await page.check('#dia-seg');
    await page.check('#dia-ter');
    await page.check('#dia-qua');
    await page.check('#dia-qui');
    await page.check('#dia-sex');
    
    // Configurar horário
    const horario = page.locator('.horario-item').first();
    await horario.locator('[id^="horario-inicio"]').fill('08:00');
    await horario.locator('[id^="horario-fim"]').fill('17:00');
    
    // Calcular
    await page.click('#calcular');
    
    // Verificar que o cálculo foi realizado com sucesso
    await page.waitForTimeout(500);
    
    const valorTotal = await page.locator('#valor-total').textContent();
    const valorHora = await page.locator('#valor-hora').textContent();
    const totalHoras = await page.locator('#total-horas').textContent();
    
    expect(valorTotal).not.toBe('0,00');
    expect(valorTotal).not.toBe('');
    expect(valorHora).not.toBe('0,00');
    expect(totalHoras).not.toBe('0');
    
    // Verificar que os detalhes foram calculados
    const custoBase = await page.locator('#custo-base').textContent();
    expect(custoBase).not.toBe('0,00');
  });
});
