/**
 * Teste de Verificação do Cálculo de Orçamento
 * 
 * Este teste verifica cenários completos de cálculo de orçamento,
 * simulando casos de uso reais do sistema.
 */

describe('Verificação Completa - Cálculo de Orçamento', () => {
  
  // Funções auxiliares extraídas da lógica principal
  function converterMesesParaDias(meses) {
    return meses * 30;
  }

  function calcularDiasTrabalhados(duracaoEmDias, diasSelecionados) {
    const semanas = Math.floor(duracaoEmDias / 7);
    const diasRestantes = duracaoEmDias % 7;
    
    let diasTrabalhadosPorTipo = {
      normais: 0,  // Segunda a Sexta
      sabado: 0,
      domingo: 0
    };
    
    diasSelecionados.forEach(dia => {
      if (dia === 6) {
        diasTrabalhadosPorTipo.sabado += semanas;
      } else if (dia === 0) {
        diasTrabalhadosPorTipo.domingo += semanas;
      } else {
        diasTrabalhadosPorTipo.normais += semanas;
      }
    });
    
    if (diasRestantes > 0) {
      diasSelecionados.forEach(dia => {
        const proporcao = diasRestantes / 7;
        if (dia === 6) {
          diasTrabalhadosPorTipo.sabado += proporcao;
        } else if (dia === 0) {
          diasTrabalhadosPorTipo.domingo += proporcao;
        } else {
          diasTrabalhadosPorTipo.normais += proporcao;
        }
      });
    }
    
    return diasTrabalhadosPorTipo;
  }

  function calcularOrcamentoCompleto(config) {
    const {
      duracao,
      duracaoTipo,
      diasSelecionados,
      horasPorDia,
      custoBase,
      multiplicadores,
      funcionarios,
      extrasHora,
      margem,
      desconto
    } = config;

    // 1. Converter duração
    let duracaoEmDias = duracao;
    if (duracaoTipo === 'meses') {
      duracaoEmDias = converterMesesParaDias(duracao);
    }

    // 2. Calcular dias trabalhados
    const diasTrabalhados = calcularDiasTrabalhados(duracaoEmDias, diasSelecionados);
    const diasTotais = diasTrabalhados.normais + diasTrabalhados.sabado + diasTrabalhados.domingo;

    // 3. Calcular horas por tipo
    const horasNormais = diasTrabalhados.normais * horasPorDia;
    const horasHE50 = diasTrabalhados.sabado * horasPorDia;
    const horasHE100 = diasTrabalhados.domingo * horasPorDia;
    const horasTotais = horasNormais + horasHE50 + horasHE100;

    // 4. Calcular custo operacional base
    const multiplicadorMedio = (multiplicadores.manha + multiplicadores.tarde + multiplicadores.noite) / 3;
    const custoOperacionalBase = custoBase * multiplicadorMedio * horasTotais;

    // 5. Calcular custos de mão de obra
    let custoMaoObraNormal = 0;
    let custoMaoObraHE50 = 0;
    let custoMaoObraHE100 = 0;
    let custoValeTransporte = 0;
    let custoTransporteApp = 0;
    let custoRefeicao = 0;

    funcionarios.forEach(func => {
      custoMaoObraNormal += horasNormais * func.horaNormal;
      custoMaoObraHE50 += horasHE50 * func.he50;
      custoMaoObraHE100 += horasHE100 * func.he100;
      custoValeTransporte += diasTotais * func.valeTransporte;
      custoTransporteApp += diasTotais * (func.transporteApp || 0);
      custoRefeicao += diasTotais * (func.refeicao || 0);
    });

    const custoMaoObraTotal = custoMaoObraNormal + custoMaoObraHE50 + custoMaoObraHE100;

    // 6. Calcular extras
    const custoExtras = extrasHora * horasTotais;

    // 7. Subtotal sem margem
    const subtotalSemMargem = custoOperacionalBase + custoMaoObraTotal + 
                              custoValeTransporte + custoTransporteApp + 
                              custoRefeicao + custoExtras;

    // 8. Aplicar margem
    const valorMargem = subtotalSemMargem * margem;
    const subtotalComMargem = subtotalSemMargem + valorMargem;

    // 9. Aplicar desconto
    const valorDesconto = subtotalComMargem * desconto;
    const valorFinal = subtotalComMargem - valorDesconto;

    return {
      diasTotais,
      horasTotais,
      horasNormais,
      horasHE50,
      horasHE100,
      custoOperacionalBase,
      custoMaoObraNormal,
      custoMaoObraHE50,
      custoMaoObraHE100,
      custoMaoObraTotal,
      custoValeTransporte,
      custoTransporteApp,
      custoRefeicao,
      custoExtras,
      subtotalSemMargem,
      valorMargem,
      subtotalComMargem,
      valorDesconto,
      valorFinal,
      valorPorHora: valorFinal / horasTotais
    };
  }

  describe('Cenário 1: Orçamento Básico - 1 Mês, Segunda a Sexta', () => {
    test('deve calcular corretamente orçamento de 1 mês, seg-sex, 8h/dia', () => {
      const config = {
        duracao: 1,
        duracaoTipo: 'meses',
        diasSelecionados: [1, 2, 3, 4, 5], // Seg-Sex
        horasPorDia: 8,
        custoBase: 100,
        multiplicadores: { manha: 1.0, tarde: 1.15, noite: 1.40 },
        funcionarios: [
          { horaNormal: 15.00, he50: 22.50, he100: 30.00, valeTransporte: 12.00 }
        ],
        extrasHora: 0,
        margem: 0.20, // 20%
        desconto: 0.10 // 10%
      };

      const resultado = calcularOrcamentoCompleto(config);

      // Verificações de dias e horas
      expect(resultado.diasTotais).toBeCloseTo(21.43, 2); // ~4.3 semanas × 5 dias
      expect(resultado.horasTotais).toBeCloseTo(171.43, 2); // ~21.43 × 8
      expect(resultado.horasNormais).toBeCloseTo(171.43, 2);
      expect(resultado.horasHE50).toBe(0);
      expect(resultado.horasHE100).toBe(0);

      // Verificações de custos
      expect(resultado.custoOperacionalBase).toBeGreaterThan(0);
      expect(resultado.custoMaoObraNormal).toBeGreaterThan(0);
      expect(resultado.custoValeTransporte).toBeCloseTo(257.14, 2); // 21.43 × 12

      // Verificações de margem e desconto
      expect(resultado.valorMargem).toBeCloseTo(resultado.subtotalSemMargem * 0.20, 2);
      expect(resultado.valorDesconto).toBeCloseTo(resultado.subtotalComMargem * 0.10, 2);

      // Verificação final
      expect(resultado.valorFinal).toBeGreaterThan(0);
      expect(resultado.valorPorHora).toBeGreaterThan(0);
    });
  });

  describe('Cenário 2: Orçamento com Finais de Semana - 3 Meses, Todos os Dias', () => {
    test('deve calcular corretamente orçamento com finais de semana', () => {
      const config = {
        duracao: 3,
        duracaoTipo: 'meses',
        diasSelecionados: [0, 1, 2, 3, 4, 5, 6], // Todos os dias
        horasPorDia: 6,
        custoBase: 80,
        multiplicadores: { manha: 1.0, tarde: 1.15, noite: 1.40 },
        funcionarios: [
          { horaNormal: 18.00, he50: 27.00, he100: 36.00, valeTransporte: 10.00 }
        ],
        extrasHora: 5, // R$ 5/hora de extras
        margem: 0.30, // 30%
        desconto: 0.05 // 5%
      };

      const resultado = calcularOrcamentoCompleto(config);

      // Verificações de dias
      expect(resultado.diasTotais).toBeCloseTo(90, 1);

      // Verificações de horas - deve ter horas normais, HE50 e HE100
      expect(resultado.horasNormais).toBeGreaterThan(0);
      expect(resultado.horasHE50).toBeGreaterThan(0); // Sábados
      expect(resultado.horasHE100).toBeGreaterThan(0); // Domingos

      // Verificações de custos de mão de obra
      expect(resultado.custoMaoObraNormal).toBeGreaterThan(0);
      expect(resultado.custoMaoObraHE50).toBeGreaterThan(0);
      expect(resultado.custoMaoObraHE100).toBeGreaterThan(0);

      // Verificações de extras
      expect(resultado.custoExtras).toBeGreaterThan(0);

      // Verificações de margem e desconto
      expect(resultado.valorMargem).toBeCloseTo(resultado.subtotalSemMargem * 0.30, 2);
      expect(resultado.valorDesconto).toBeCloseTo(resultado.subtotalComMargem * 0.05, 2);

      // Valor final deve ser positivo
      expect(resultado.valorFinal).toBeGreaterThan(0);
    });
  });

  describe('Cenário 3: Múltiplos Funcionários', () => {
    test('deve calcular corretamente com 3 funcionários', () => {
      const config = {
        duracao: 15,
        duracaoTipo: 'dias',
        diasSelecionados: [1, 2, 3, 4, 5],
        horasPorDia: 8,
        custoBase: 120,
        multiplicadores: { manha: 1.0, tarde: 1.15, noite: 1.40 },
        funcionarios: [
          { horaNormal: 15.00, he50: 22.50, he100: 30.00, valeTransporte: 12.00 },
          { horaNormal: 18.00, he50: 27.00, he100: 36.00, valeTransporte: 12.00 },
          { horaNormal: 20.00, he50: 30.00, he100: 40.00, valeTransporte: 12.00 }
        ],
        extrasHora: 10,
        margem: 0.25, // 25%
        desconto: 0.15 // 15%
      };

      const resultado = calcularOrcamentoCompleto(config);

      // Deve ter custos de mão de obra para os 3 funcionários
      expect(resultado.custoMaoObraTotal).toBeGreaterThan(0);

      // Vale transporte deve ser para 3 funcionários
      const custoVTEsperado = resultado.diasTotais * 12 * 3;
      expect(resultado.custoValeTransporte).toBeCloseTo(custoVTEsperado, 2);

      // Verificações de valores finais
      expect(resultado.subtotalSemMargem).toBeGreaterThan(0);
      expect(resultado.valorFinal).toBeGreaterThan(0);
    });
  });

  describe('Cenário 4: Orçamento com Transporte App e Refeição', () => {
    test('deve incluir transporte por app e refeição no cálculo', () => {
      const config = {
        duracao: 1,
        duracaoTipo: 'meses',
        diasSelecionados: [1, 2, 3, 4, 5],
        horasPorDia: 8,
        custoBase: 100,
        multiplicadores: { manha: 1.0, tarde: 1.15, noite: 1.40 },
        funcionarios: [
          { 
            horaNormal: 15.00, 
            he50: 22.50, 
            he100: 30.00, 
            valeTransporte: 12.00,
            transporteApp: 25.00, // R$ 25/dia de transporte por app
            refeicao: 30.00 // R$ 30/dia de refeição
          }
        ],
        extrasHora: 0,
        margem: 0.20,
        desconto: 0.10
      };

      const resultado = calcularOrcamentoCompleto(config);

      // Deve ter custos de transporte app e refeição
      expect(resultado.custoTransporteApp).toBeGreaterThan(0);
      expect(resultado.custoRefeicao).toBeGreaterThan(0);

      // Verificar que foram incluídos no subtotal
      const subtotalCalculado = resultado.custoOperacionalBase + 
                                resultado.custoMaoObraTotal + 
                                resultado.custoValeTransporte + 
                                resultado.custoTransporteApp + 
                                resultado.custoRefeicao + 
                                resultado.custoExtras;
      
      expect(resultado.subtotalSemMargem).toBeCloseTo(subtotalCalculado, 2);
    });
  });

  describe('Cenário 5: Validação de Fórmulas de Margem e Desconto', () => {
    test('deve aplicar corretamente margem de 20% e desconto de 10%', () => {
      const config = {
        duracao: 10,
        duracaoTipo: 'dias',
        diasSelecionados: [1, 2, 3, 4, 5],
        horasPorDia: 8,
        custoBase: 100,
        multiplicadores: { manha: 1.0, tarde: 1.15, noite: 1.40 },
        funcionarios: [
          { horaNormal: 15.00, he50: 22.50, he100: 30.00, valeTransporte: 12.00 }
        ],
        extrasHora: 0,
        margem: 0.20,
        desconto: 0.10
      };

      const resultado = calcularOrcamentoCompleto(config);

      // Verificar fórmula da margem
      const margemEsperada = resultado.subtotalSemMargem * 0.20;
      expect(resultado.valorMargem).toBeCloseTo(margemEsperada, 2);

      // Verificar subtotal com margem
      const subtotalComMargemEsperado = resultado.subtotalSemMargem + margemEsperada;
      expect(resultado.subtotalComMargem).toBeCloseTo(subtotalComMargemEsperado, 2);

      // Verificar fórmula do desconto
      const descontoEsperado = resultado.subtotalComMargem * 0.10;
      expect(resultado.valorDesconto).toBeCloseTo(descontoEsperado, 2);

      // Verificar valor final
      const valorFinalEsperado = resultado.subtotalComMargem - descontoEsperado;
      expect(resultado.valorFinal).toBeCloseTo(valorFinalEsperado, 2);
    });

    test('deve calcular valor por hora corretamente', () => {
      const config = {
        duracao: 7,
        duracaoTipo: 'dias',
        diasSelecionados: [1, 2, 3, 4, 5],
        horasPorDia: 8,
        custoBase: 100,
        multiplicadores: { manha: 1.0, tarde: 1.15, noite: 1.40 },
        funcionarios: [
          { horaNormal: 15.00, he50: 22.50, he100: 30.00, valeTransporte: 12.00 }
        ],
        extrasHora: 0,
        margem: 0.30,
        desconto: 0.05
      };

      const resultado = calcularOrcamentoCompleto(config);

      // Valor por hora = valor final / horas totais
      const valorPorHoraEsperado = resultado.valorFinal / resultado.horasTotais;
      expect(resultado.valorPorHora).toBeCloseTo(valorPorHoraEsperado, 2);
      expect(resultado.valorPorHora).toBeGreaterThan(0);
    });
  });

  describe('Cenário 6: Casos Extremos', () => {
    test('deve lidar com margem 0% e desconto 0%', () => {
      const config = {
        duracao: 10,
        duracaoTipo: 'dias',
        diasSelecionados: [1, 2, 3, 4, 5],
        horasPorDia: 8,
        custoBase: 100,
        multiplicadores: { manha: 1.0, tarde: 1.15, noite: 1.40 },
        funcionarios: [
          { horaNormal: 15.00, he50: 22.50, he100: 30.00, valeTransporte: 12.00 }
        ],
        extrasHora: 0,
        margem: 0,
        desconto: 0
      };

      const resultado = calcularOrcamentoCompleto(config);

      // Com margem 0%, valor final = subtotal sem margem
      expect(resultado.valorMargem).toBe(0);
      expect(resultado.valorDesconto).toBe(0);
      expect(resultado.valorFinal).toBeCloseTo(resultado.subtotalSemMargem, 2);
    });

    test('deve lidar com apenas sábados selecionados (HE 50%)', () => {
      const config = {
        duracao: 28,
        duracaoTipo: 'dias',
        diasSelecionados: [6], // Apenas sábado
        horasPorDia: 8,
        custoBase: 100,
        multiplicadores: { manha: 1.0, tarde: 1.15, noite: 1.40 },
        funcionarios: [
          { horaNormal: 15.00, he50: 22.50, he100: 30.00, valeTransporte: 12.00 }
        ],
        extrasHora: 0,
        margem: 0.20,
        desconto: 0.10
      };

      const resultado = calcularOrcamentoCompleto(config);

      // Deve ter apenas HE 50%, sem horas normais ou HE 100%
      expect(resultado.horasNormais).toBe(0);
      expect(resultado.horasHE50).toBeGreaterThan(0);
      expect(resultado.horasHE100).toBe(0);
      expect(resultado.custoMaoObraHE50).toBeGreaterThan(0);
    });
  });
});
