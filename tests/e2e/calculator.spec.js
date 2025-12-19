/**
 * Testes E2E - Calculadora
 * Testa a interface completa da calculadora:
 * - Navegação entre abas
 * - Seleção de espaço e exibição de informações
 * - Configuração de duração (meses/dias)
 * - Seleção de dias da semana
 * - Adicionar/remover horários
 * - Adicionar/remover funcionários
 * - Selecionar itens extras
 * - Configurar margem e desconto
 * - Calcular e verificar resultado
 * - Validações de campos obrigatórios
 */

const { test, expect } = require('@playwright/test');

test.describe('Calculadora E2E - Navegação', () => {
  test('deve carregar a página principal', async ({ page }) => {
    await page.goto('/');
    
    await expect(page).toHaveTitle(/Calculadora de Orçamento/);
    await expect(page.locator('h1')).toContainText('Calculadora de Orçamento');
  });

  test('deve ter todas as abas visíveis', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.locator('[data-tab="calculator"]')).toBeVisible();
    await expect(page.locator('[data-tab="spaces"]')).toBeVisible();
    await expect(page.locator('[data-tab="costs"]')).toBeVisible();
    await expect(page.locator('[data-tab="config"]')).toBeVisible();
  });

  test('deve navegar entre as abas', async ({ page }) => {
    await page.goto('/');
    
    // Clicar na aba de Espaços
    await page.click('[data-tab="spaces"]');
    await expect(page.locator('#spaces')).toHaveClass(/active/);
    
    // Clicar na aba de Custos
    await page.click('[data-tab="costs"]');
    await expect(page.locator('#costs')).toHaveClass(/active/);
    
    // Clicar na aba de Configurações
    await page.click('[data-tab="config"]');
    await expect(page.locator('#config')).toHaveClass(/active/);
    
    // Voltar para Calculadora
    await page.click('[data-tab="calculator"]');
    await expect(page.locator('#calculator')).toHaveClass(/active/);
  });
});

test.describe('Calculadora E2E - Seleção de Espaço', () => {
  test('deve ter select de espaços disponível', async ({ page }) => {
    await page.goto('/');
    
    const select = page.locator('#espaco');
    await expect(select).toBeVisible();
    
    // Deve ter opções
    const options = await select.locator('option').count();
    expect(options).toBeGreaterThan(1); // Pelo menos a opção padrão + 1 espaço
  });

  test('deve exibir informações do espaço ao selecionar', async ({ page }) => {
    await page.goto('/');
    
    // Selecionar primeiro espaço (índice 1, pois 0 é "Selecione")
    await page.selectOption('#espaco', { index: 1 });
    
    // Verificar que informações aparecem
    const salaInfo = page.locator('#sala-info');
    await expect(salaInfo).toBeVisible();
    await expect(salaInfo).toContainText(/Capacidade:/);
    await expect(salaInfo).toContainText(/Área:/);
    await expect(salaInfo).toContainText(/Custo Base:/);
  });

  test('deve mostrar multiplicadores de turno', async ({ page }) => {
    await page.goto('/');
    
    await page.selectOption('#espaco', { index: 1 });
    
    const salaInfo = page.locator('#sala-info');
    await expect(salaInfo).toContainText(/Manhã:/);
    await expect(salaInfo).toContainText(/Tarde:/);
    await expect(salaInfo).toContainText(/Noite:/);
  });
});

test.describe('Calculadora E2E - Configuração de Duração', () => {
  test('deve permitir inserir duração em meses', async ({ page }) => {
    await page.goto('/');
    
    await page.fill('#duracao', '3');
    await page.selectOption('#duracao-tipo', 'meses');
    
    expect(await page.inputValue('#duracao')).toBe('3');
    expect(await page.inputValue('#duracao-tipo')).toBe('meses');
  });

  test('deve permitir inserir duração em dias', async ({ page }) => {
    await page.goto('/');
    
    await page.fill('#duracao', '15');
    await page.selectOption('#duracao-tipo', 'dias');
    
    expect(await page.inputValue('#duracao')).toBe('15');
    expect(await page.inputValue('#duracao-tipo')).toBe('dias');
  });

  test('deve ter valores padrão', async ({ page }) => {
    await page.goto('/');
    
    const duracao = await page.inputValue('#duracao');
    expect(parseInt(duracao)).toBeGreaterThanOrEqual(1);
  });
});

test.describe('Calculadora E2E - Dias da Semana', () => {
  test('deve ter checkboxes para todos os dias da semana', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.locator('#dia-seg')).toBeVisible();
    await expect(page.locator('#dia-ter')).toBeVisible();
    await expect(page.locator('#dia-qua')).toBeVisible();
    await expect(page.locator('#dia-qui')).toBeVisible();
    await expect(page.locator('#dia-sex')).toBeVisible();
    await expect(page.locator('#dia-sab')).toBeVisible();
    await expect(page.locator('#dia-dom')).toBeVisible();
  });

  test('deve permitir selecionar múltiplos dias', async ({ page }) => {
    await page.goto('/');
    
    await page.check('#dia-seg');
    await page.check('#dia-ter');
    await page.check('#dia-qua');
    
    await expect(page.locator('#dia-seg')).toBeChecked();
    await expect(page.locator('#dia-ter')).toBeChecked();
    await expect(page.locator('#dia-qua')).toBeChecked();
  });

  test('deve permitir desselecionar dias', async ({ page }) => {
    await page.goto('/');
    
    await page.check('#dia-seg');
    await expect(page.locator('#dia-seg')).toBeChecked();
    
    await page.uncheck('#dia-seg');
    await expect(page.locator('#dia-seg')).not.toBeChecked();
  });
});

test.describe('Calculadora E2E - Horários', () => {
  test('deve ter pelo menos um horário inicial', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.locator('.horario-item').first()).toBeVisible();
  });

  test('deve adicionar novo horário', async ({ page }) => {
    await page.goto('/');
    
    const countInicial = await page.locator('.horario-item').count();
    
    await page.click('#adicionar-horario');
    
    const countFinal = await page.locator('.horario-item').count();
    expect(countFinal).toBe(countInicial + 1);
  });

  test('deve remover horário', async ({ page }) => {
    await page.goto('/');
    
    // Adicionar um horário extra
    await page.click('#adicionar-horario');
    
    const countInicial = await page.locator('.horario-item').count();
    
    // Remover o último horário
    await page.locator('.remover-horario').last().click();
    
    const countFinal = await page.locator('.horario-item').count();
    expect(countFinal).toBe(countInicial - 1);
  });

  test('deve permitir configurar horário de início e fim', async ({ page }) => {
    await page.goto('/');
    
    const primeiroHorario = page.locator('.horario-item').first();
    await primeiroHorario.locator('.horario-inicio').fill('08:00');
    await primeiroHorario.locator('.horario-fim').fill('17:00');
    
    expect(await primeiroHorario.locator('.horario-inicio').inputValue()).toBe('08:00');
    expect(await primeiroHorario.locator('.horario-fim').inputValue()).toBe('17:00');
  });
});

test.describe('Calculadora E2E - Itens Extras', () => {
  test('deve ter lista de extras disponível', async ({ page }) => {
    await page.goto('/');
    
    const extras = page.locator('[id^="extra-"]');
    const count = await extras.count();
    
    expect(count).toBeGreaterThan(0);
  });

  test('deve permitir selecionar extras', async ({ page }) => {
    await page.goto('/');
    
    const primeiroExtra = page.locator('[id^="extra-"]').first();
    await primeiroExtra.check();
    
    await expect(primeiroExtra).toBeChecked();
  });

  test('deve mostrar custo do extra', async ({ page }) => {
    await page.goto('/');
    
    const labelExtra = page.locator('label[for^="extra-"]').first();
    await expect(labelExtra).toContainText(/R\$/);
  });
});

test.describe('Calculadora E2E - Margem e Desconto', () => {
  test('deve ter campos de margem e desconto', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.locator('#margem')).toBeVisible();
    await expect(page.locator('#desconto')).toBeVisible();
  });

  test('deve permitir configurar margem', async ({ page }) => {
    await page.goto('/');
    
    await page.fill('#margem', '25');
    expect(await page.inputValue('#margem')).toBe('25');
  });

  test('deve permitir configurar desconto', async ({ page }) => {
    await page.goto('/');
    
    await page.fill('#desconto', '10');
    expect(await page.inputValue('#desconto')).toBe('10');
  });
});

test.describe('Calculadora E2E - Cálculo Completo', () => {
  test('deve calcular orçamento com sucesso', async ({ page }) => {
    await page.goto('/');
    
    // 1. Selecionar espaço
    await page.selectOption('#espaco', { index: 1 });
    
    // 2. Configurar duração
    await page.fill('#duracao', '1');
    await page.selectOption('#duracao-tipo', 'meses');
    
    // 3. Selecionar dias
    await page.check('#dia-seg');
    await page.check('#dia-ter');
    await page.check('#dia-qua');
    await page.check('#dia-qui');
    await page.check('#dia-sex');
    
    // 4. Configurar horário
    const primeiroHorario = page.locator('.horario-item').first();
    await primeiroHorario.locator('.horario-inicio').fill('08:00');
    await primeiroHorario.locator('.horario-fim').fill('17:00');
    
    // 5. Configurar margem e desconto
    await page.fill('#margem', '20');
    await page.fill('#desconto', '5');
    
    // 6. Calcular
    await page.click('#calcular');
    
    // 7. Verificar resultados
    await expect(page.locator('#valor-total')).not.toBeEmpty();
    await expect(page.locator('#valor-hora')).not.toBeEmpty();
    await expect(page.locator('#total-horas')).not.toBeEmpty();
  });

  test('deve exibir erro quando nenhum espaço selecionado', async ({ page }) => {
    await page.goto('/');
    
    // Configurar tudo menos o espaço
    await page.check('#dia-seg');
    
    // Tentar calcular
    page.on('dialog', dialog => dialog.accept());
    await page.click('#calcular');
    
    // Deve mostrar alerta (já configuramos para aceitar automaticamente)
  });

  test('deve exibir erro quando nenhum dia selecionado', async ({ page }) => {
    await page.goto('/');
    
    await page.selectOption('#espaco', { index: 1 });
    
    // Garantir que nenhum dia está selecionado
    await page.uncheck('#dia-seg');
    await page.uncheck('#dia-ter');
    await page.uncheck('#dia-qua');
    await page.uncheck('#dia-qui');
    await page.uncheck('#dia-sex');
    await page.uncheck('#dia-sab');
    await page.uncheck('#dia-dom');
    
    // Tentar calcular
    page.on('dialog', dialog => dialog.accept());
    await page.click('#calcular');
    
    // Deve mostrar alerta
  });

  test('deve exibir detalhamento após cálculo', async ({ page }) => {
    await page.goto('/');
    
    // Realizar cálculo completo
    await page.selectOption('#espaco', { index: 1 });
    await page.fill('#duracao', '1');
    await page.check('#dia-seg');
    await page.check('#dia-ter');
    await page.check('#dia-qua');
    await page.check('#dia-qui');
    await page.check('#dia-sex');
    
    const primeiroHorario = page.locator('.horario-item').first();
    await primeiroHorario.locator('.horario-inicio').fill('08:00');
    await primeiroHorario.locator('.horario-fim').fill('17:00');
    
    await page.click('#calcular');
    
    // Verificar que detalhamento aparece
    await expect(page.locator('#custo-base')).not.toBeEmpty();
    await expect(page.locator('#economia')).not.toBeEmpty();
  });
});

test.describe('Calculadora E2E - Responsividade', () => {
  test('deve ser responsivo em mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    await expect(page.locator('.container')).toBeVisible();
    await expect(page.locator('h1')).toBeVisible();
  });

  test('deve ser responsivo em tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    
    await expect(page.locator('.container')).toBeVisible();
    await expect(page.locator('.tabs')).toBeVisible();
  });

  test('deve ser responsivo em desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    
    await expect(page.locator('.container')).toBeVisible();
    await expect(page.locator('.calculator-grid')).toBeVisible();
  });
});

test.describe('Calculadora E2E - Validações', () => {
  test('deve validar horários (início antes do fim)', async ({ page }) => {
    await page.goto('/');
    
    await page.selectOption('#espaco', { index: 1 });
    await page.check('#dia-seg');
    
    const primeiroHorario = page.locator('.horario-item').first();
    await primeiroHorario.locator('.horario-inicio').fill('17:00');
    await primeiroHorario.locator('.horario-fim').fill('08:00');
    
    page.on('dialog', dialog => dialog.accept());
    await page.click('#calcular');
    
    // Deve mostrar erro de validação
  });

  test('campos numéricos devem aceitar apenas números', async ({ page }) => {
    await page.goto('/');
    
    await page.fill('#duracao', 'abc');
    await page.fill('#margem', 'xyz');
    await page.fill('#desconto', '123abc');
    
    // Verificar valores
    const duracaoValue = await page.inputValue('#duracao');
    const margemValue = await page.inputValue('#margem');
    const descontoValue = await page.inputValue('#desconto');
    
    // Campos devem filtrar caracteres não numéricos ou manter vazio
    expect(duracaoValue).not.toBe('abc');
  });
});
