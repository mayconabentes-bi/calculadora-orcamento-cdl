/**
 * Testes E2E - Simulação com Formulário Vazio
 * 
 * Testa o modo de simulação do sistema Axioma onde o cálculo
 * deve ser executado mesmo com todos os campos vazios,
 * usando valores de fallback automáticos.
 * 
 * Requisitos:
 * - Cálculo deve ser executado sem interrupção
 * - Valores de fallback devem ser aplicados automaticamente
 * - Resultado deve ser numérico válido (não NaN, não Infinity)
 * - Classificação de risco deve ser ALTO RISCO
 * - Histórico deve ser salvo corretamente
 */

const { test, expect } = require('@playwright/test');

test.describe('Modo Simulação - Formulário Vazio', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar para a página da calculadora
    await page.goto('/');
    
    // Garantir que estamos na aba da calculadora
    await page.click('[data-tab="calculator"]');
    
    // Limpar qualquer dado pré-existente
    await page.evaluate(() => {
      // Limpar campos de texto
      document.getElementById('cliente-nome').value = '';
      document.getElementById('cliente-contato').value = '';
      
      // Resetar select de espaço
      document.getElementById('espaco').value = '';
      
      // Limpar data do evento
      document.getElementById('data-evento').value = '';
      
      // Desmarcar todos os dias da semana
      const diasIds = ['dia-seg', 'dia-ter', 'dia-qua', 'dia-qui', 'dia-sex', 'dia-sab', 'dia-dom'];
      diasIds.forEach(id => {
        const checkbox = document.getElementById(id);
        if (checkbox) checkbox.checked = false;
      });
    });
  });

  test('deve calcular orçamento com formulário completamente vazio', async ({ page }) => {
    // Executar o cálculo sem preencher nenhum campo
    await page.click('#calcular');
    
    // Aguardar um pouco para o cálculo ser processado
    await page.waitForTimeout(500);
    
    // Verificar que o resultado foi exibido
    const valorTotal = await page.locator('#valor-total').textContent();
    expect(valorTotal).toBeTruthy();
    expect(valorTotal).not.toBe('0,00');
    
    // Verificar que o valor não é NaN ou Infinity
    const valorNumerico = await page.evaluate(() => {
      const texto = document.getElementById('valor-total').textContent;
      // Remover formatação e converter para número
      const numero = parseFloat(texto.replace(/\./g, '').replace(',', '.'));
      return {
        valor: numero,
        isNaN: isNaN(numero),
        isFinite: isFinite(numero)
      };
    });
    
    expect(valorNumerico.isNaN).toBe(false);
    expect(valorNumerico.isFinite).toBe(true);
    expect(valorNumerico.valor).toBeGreaterThan(0);
    
    console.log('✅ Valor Total Calculado:', valorNumerico.valor);
  });

  test('deve exibir alerta de ALTO RISCO para cálculo com dados incompletos', async ({ page }) => {
    // Executar o cálculo sem preencher nenhum campo
    await page.click('#calcular');
    
    // Aguardar o processamento
    await page.waitForTimeout(500);
    
    // Verificar que o alerta de viabilidade está visível
    const alertDiv = page.locator('#viability-alert');
    await expect(alertDiv).toBeVisible();
    
    // Verificar que menciona "Dados Incompletos"
    const titleText = await page.locator('#viability-title').textContent();
    expect(titleText).toContain('Dados Incompletos');
    
    // Verificar que menciona "ALTO RISCO"
    const messageText = await page.locator('#viability-message').textContent();
    expect(messageText).toContain('ALTO RISCO');
    expect(messageText).toContain('simulação');
    
    console.log('✅ Alerta de Alto Risco exibido:', titleText);
  });

  test('deve usar nome de fallback "Simulação_Axioma_"', async ({ page }) => {
    // Executar o cálculo sem preencher o nome
    await page.click('#calcular');
    
    // Aguardar o processamento
    await page.waitForTimeout(500);
    
    // Verificar no console que o nome de fallback foi usado
    const consoleMessages = [];
    page.on('console', msg => {
      if (msg.type() === 'warn' || msg.type() === 'error') {
        consoleMessages.push(msg.text());
      }
    });
    
    // Executar novamente para capturar mensagens
    await page.evaluate(() => {
      document.getElementById('cliente-nome').value = '';
    });
    await page.click('#calcular');
    await page.waitForTimeout(500);
    
    // Verificar que há menção ao fallback no histórico
    const historicoExiste = await page.evaluate(() => {
      const historico = JSON.parse(localStorage.getItem('CDL_CALCULADORA_DATA') || '{}');
      if (historico.historicoCalculos && historico.historicoCalculos.length > 0) {
        const ultimoCalculo = historico.historicoCalculos[0];
        return ultimoCalculo.clienteNome && ultimoCalculo.clienteNome.includes('Simulação_Axioma_');
      }
      return false;
    });
    
    expect(historicoExiste).toBe(true);
    console.log('✅ Nome de fallback "Simulação_Axioma_" aplicado corretamente');
  });

  test('deve salvar cálculo no histórico mesmo com dados incompletos', async ({ page }) => {
    // Obter contagem inicial do histórico
    const historicoAntes = await page.evaluate(() => {
      const dados = JSON.parse(localStorage.getItem('CDL_CALCULADORA_DATA') || '{}');
      return dados.historicoCalculos ? dados.historicoCalculos.length : 0;
    });
    
    // Executar o cálculo
    await page.click('#calcular');
    await page.waitForTimeout(500);
    
    // Obter contagem após o cálculo
    const historicoDepois = await page.evaluate(() => {
      const dados = JSON.parse(localStorage.getItem('CDL_CALCULADORA_DATA') || '{}');
      return dados.historicoCalculos ? dados.historicoCalculos.length : 0;
    });
    
    // Verificar que um novo registro foi adicionado
    expect(historicoDepois).toBe(historicoAntes + 1);
    
    // Verificar detalhes do último registro
    const ultimoRegistro = await page.evaluate(() => {
      const dados = JSON.parse(localStorage.getItem('CDL_CALCULADORA_DATA') || '{}');
      return dados.historicoCalculos ? dados.historicoCalculos[0] : null;
    });
    
    expect(ultimoRegistro).toBeTruthy();
    expect(ultimoRegistro.valorFinal).toBeGreaterThan(0);
    expect(ultimoRegistro.classificacaoRisco).toBe('ALTO');
    
    console.log('✅ Cálculo salvo no histórico:', {
      valorFinal: ultimoRegistro.valorFinal,
      classificacaoRisco: ultimoRegistro.classificacaoRisco,
      clienteNome: ultimoRegistro.clienteNome
    });
  });

  test('deve usar sala padrão quando nenhuma sala selecionada', async ({ page }) => {
    // Executar o cálculo sem selecionar sala
    await page.click('#calcular');
    await page.waitForTimeout(500);
    
    // Verificar que o cálculo foi realizado
    const valorTotal = await page.locator('#valor-total').textContent();
    expect(valorTotal).toBeTruthy();
    
    // Verificar no histórico qual sala foi usada
    const salaUsada = await page.evaluate(() => {
      const dados = JSON.parse(localStorage.getItem('CDL_CALCULADORA_DATA') || '{}');
      if (dados.historicoCalculos && dados.historicoCalculos.length > 0) {
        const ultimoCalculo = dados.historicoCalculos[0];
        return {
          nome: ultimoCalculo.sala?.nome || 'N/A',
          unidade: ultimoCalculo.sala?.unidade || 'N/A'
        };
      }
      return null;
    });
    
    expect(salaUsada).toBeTruthy();
    console.log('✅ Sala usada no fallback:', salaUsada);
  });

  test('deve usar Segunda-feira quando nenhum dia selecionado', async ({ page }) => {
    // Executar o cálculo sem selecionar dias
    await page.click('#calcular');
    await page.waitForTimeout(500);
    
    // Verificar que o cálculo foi realizado
    const valorTotal = await page.locator('#valor-total').textContent();
    expect(valorTotal).toBeTruthy();
    
    // Verificar no histórico quais dias foram usados
    const diasUsados = await page.evaluate(() => {
      const dados = JSON.parse(localStorage.getItem('CDL_CALCULADORA_DATA') || '{}');
      if (dados.historicoCalculos && dados.historicoCalculos.length > 0) {
        const ultimoCalculo = dados.historicoCalculos[0];
        return ultimoCalculo.diasSelecionados || [];
      }
      return [];
    });
    
    expect(diasUsados).toEqual([1]); // 1 = Segunda-feira
    console.log('✅ Dia padrão (Segunda-feira) aplicado corretamente');
  });

  test('deve usar data atual quando data não informada', async ({ page }) => {
    // Executar o cálculo sem informar data
    await page.click('#calcular');
    await page.waitForTimeout(500);
    
    // Verificar que o cálculo foi realizado
    const valorTotal = await page.locator('#valor-total').textContent();
    expect(valorTotal).toBeTruthy();
    
    // Verificar que a data foi preenchida com a data atual
    const dataUsada = await page.evaluate(() => {
      const dados = JSON.parse(localStorage.getItem('CDL_CALCULADORA_DATA') || '{}');
      if (dados.historicoCalculos && dados.historicoCalculos.length > 0) {
        const ultimoCalculo = dados.historicoCalculos[0];
        return ultimoCalculo.dataEvento;
      }
      return null;
    });
    
    expect(dataUsada).toBeTruthy();
    
    // Verificar que é aproximadamente hoje (pode ter diferença de 1 dia devido a fuso horário)
    const dataAtual = new Date().toISOString().split('T')[0];
    const diferencaDias = Math.abs(
      (new Date(dataUsada) - new Date(dataAtual)) / (1000 * 60 * 60 * 24)
    );
    expect(diferencaDias).toBeLessThanOrEqual(1);
    
    console.log('✅ Data atual aplicada:', dataUsada);
  });

  test('deve gerar resultado válido com todos os fallbacks aplicados', async ({ page }) => {
    // Executar o cálculo com formulário vazio
    await page.click('#calcular');
    await page.waitForTimeout(500);
    
    // Capturar todos os valores exibidos
    const resultado = await page.evaluate(() => {
      return {
        valorTotal: document.getElementById('valor-total').textContent,
        valorHora: document.getElementById('valor-hora').textContent,
        totalHoras: document.getElementById('total-horas').textContent,
        custoBase: document.getElementById('custo-base').textContent,
        economia: document.getElementById('economia').textContent
      };
    });
    
    // Verificar que todos os valores são válidos (não vazios, não "NaN")
    Object.entries(resultado).forEach(([key, value]) => {
      expect(value).toBeTruthy();
      expect(value).not.toContain('NaN');
      expect(value).not.toContain('Infinity');
      console.log(`  ${key}: ${value}`);
    });
    
    console.log('✅ Todos os valores do resultado são válidos');
  });
});
