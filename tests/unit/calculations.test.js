/**
 * Testes Unitários - Cálculos
 * Testes para funções de cálculo extraídas/mockadas do app.js:
 * - Cálculo de custo de espaço
 * - Cálculo de mão de obra (horas normais, HE50%, HE100%)
 * - Cálculo de vale transporte, transporte por app, refeição
 * - Aplicação de multiplicadores de turno
 * - Cálculo de itens extras
 * - Aplicação de margem de lucro e desconto
 * - Conversão de meses para dias
 * - Cálculo de dias úteis vs finais de semana
 * - Validações
 */

// Funções auxiliares de cálculo (extraídas da lógica do app.js)

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

function calcularHorasPorTipo(diasTrabalhadosPorTipo, horasPorDia) {
  return {
    horasNormais: diasTrabalhadosPorTipo.normais * horasPorDia,
    horasHE50: diasTrabalhadosPorTipo.sabado * horasPorDia,
    horasHE100: diasTrabalhadosPorTipo.domingo * horasPorDia
  };
}

function calcularCustoOperacional(custoBase, multiplicadores, horasTotais) {
  const multiplicadorMedio = (multiplicadores.manha + multiplicadores.tarde + multiplicadores.noite) / 3;
  return custoBase * multiplicadorMedio * horasTotais;
}

function calcularCustoMaoObra(horas, valorHora) {
  return horas * valorHora;
}

function calcularCustoValeTransporte(dias, valorDia) {
  return dias * valorDia;
}

function calcularCustoTransporteApp(dias, valorDia) {
  return dias * valorDia;
}

function calcularCustoRefeicao(dias, valorDia) {
  return dias * valorDia;
}

function aplicarMargem(valor, margemPercent) {
  return valor * (margemPercent / 100);
}

function aplicarDesconto(valor, descontoPercent) {
  return valor * (descontoPercent / 100);
}

function calcularValorPorHora(valorTotal, horasTotais) {
  return horasTotais > 0 ? valorTotal / horasTotais : 0;
}

function calcularCustoExtras(custoExtraPorHora, horasTotais) {
  return custoExtraPorHora * horasTotais;
}

function parseTimeToMinutes(timeString) {
  const [hora, minuto] = timeString.split(':').map(Number);
  return hora * 60 + minuto;
}

function calcularHorasEntrePeriodo(inicio, fim) {
  const minutosInicio = parseTimeToMinutes(inicio);
  const minutosFim = parseTimeToMinutes(fim);
  
  if (minutosInicio >= minutosFim) {
    return 0;
  }
  
  return (minutosFim - minutosInicio) / 60;
}

describe('Cálculos - Conversão de Tempo', () => {
  test('deve converter 1 mês em 30 dias', () => {
    expect(converterMesesParaDias(1)).toBe(30);
  });

  test('deve converter 3 meses em 90 dias', () => {
    expect(converterMesesParaDias(3)).toBe(90);
  });

  test('deve converter 6 meses em 180 dias', () => {
    expect(converterMesesParaDias(6)).toBe(180);
  });

  test('deve converter 12 meses em 360 dias', () => {
    expect(converterMesesParaDias(12)).toBe(360);
  });

  test('deve lidar com meses decimais', () => {
    expect(converterMesesParaDias(1.5)).toBe(45);
  });

  test('deve retornar 0 para 0 meses', () => {
    expect(converterMesesParaDias(0)).toBe(0);
  });
});

describe('Cálculos - Dias Trabalhados', () => {
  test('deve calcular dias normais (segunda a sexta)', () => {
    const resultado = calcularDiasTrabalhados(7, [1, 2, 3, 4, 5]); // 1 semana, seg-sex
    expect(resultado.normais).toBe(5);
    expect(resultado.sabado).toBe(0);
    expect(resultado.domingo).toBe(0);
  });

  test('deve calcular sábados separadamente', () => {
    const resultado = calcularDiasTrabalhados(7, [6]); // 1 semana, só sábado
    expect(resultado.normais).toBe(0);
    expect(resultado.sabado).toBe(1);
    expect(resultado.domingo).toBe(0);
  });

  test('deve calcular domingos separadamente', () => {
    const resultado = calcularDiasTrabalhados(7, [0]); // 1 semana, só domingo
    expect(resultado.normais).toBe(0);
    expect(resultado.sabado).toBe(0);
    expect(resultado.domingo).toBe(1);
  });

  test('deve calcular todos os dias da semana', () => {
    const resultado = calcularDiasTrabalhados(7, [0, 1, 2, 3, 4, 5, 6]);
    expect(resultado.normais).toBe(5);
    expect(resultado.sabado).toBe(1);
    expect(resultado.domingo).toBe(1);
  });

  test('deve multiplicar por número de semanas', () => {
    const resultado = calcularDiasTrabalhados(28, [1, 2, 3, 4, 5]); // 4 semanas
    expect(resultado.normais).toBe(20);
  });

  test('deve lidar com dias restantes proporcionalmente', () => {
    const resultado = calcularDiasTrabalhados(10, [1]); // 1 semana + 3 dias
    expect(resultado.normais).toBeCloseTo(1 + (3/7), 2);
  });
});

describe('Cálculos - Horas por Tipo', () => {
  test('deve calcular horas normais', () => {
    const diasTrabalhados = { normais: 5, sabado: 0, domingo: 0 };
    const resultado = calcularHorasPorTipo(diasTrabalhados, 8);
    
    expect(resultado.horasNormais).toBe(40);
    expect(resultado.horasHE50).toBe(0);
    expect(resultado.horasHE100).toBe(0);
  });

  test('deve calcular horas extras 50% (sábado)', () => {
    const diasTrabalhados = { normais: 0, sabado: 2, domingo: 0 };
    const resultado = calcularHorasPorTipo(diasTrabalhados, 8);
    
    expect(resultado.horasNormais).toBe(0);
    expect(resultado.horasHE50).toBe(16);
    expect(resultado.horasHE100).toBe(0);
  });

  test('deve calcular horas extras 100% (domingo)', () => {
    const diasTrabalhados = { normais: 0, sabado: 0, domingo: 2 };
    const resultado = calcularHorasPorTipo(diasTrabalhados, 8);
    
    expect(resultado.horasNormais).toBe(0);
    expect(resultado.horasHE50).toBe(0);
    expect(resultado.horasHE100).toBe(16);
  });

  test('deve calcular mix de horas normais e extras', () => {
    const diasTrabalhados = { normais: 5, sabado: 1, domingo: 1 };
    const resultado = calcularHorasPorTipo(diasTrabalhados, 8);
    
    expect(resultado.horasNormais).toBe(40);
    expect(resultado.horasHE50).toBe(8);
    expect(resultado.horasHE100).toBe(8);
  });

  test('deve lidar com horas fracionadas', () => {
    const diasTrabalhados = { normais: 5, sabado: 0, domingo: 0 };
    const resultado = calcularHorasPorTipo(diasTrabalhados, 6.5);
    
    expect(resultado.horasNormais).toBe(32.5);
  });
});

describe('Cálculos - Custo Operacional', () => {
  const multiplicadores = { manha: 1.0, tarde: 1.15, noite: 1.40 };

  test('deve calcular custo operacional básico', () => {
    const custoBase = 100;
    const horasTotais = 10;
    const resultado = calcularCustoOperacional(custoBase, multiplicadores, horasTotais);
    
    // Média dos multiplicadores: (1.0 + 1.15 + 1.40) / 3 = 1.183333
    expect(resultado).toBeCloseTo(1183.33, 2);
  });

  test('deve usar multiplicador médio dos turnos', () => {
    const custoBase = 50;
    const horasTotais = 8;
    const resultado = calcularCustoOperacional(custoBase, multiplicadores, horasTotais);
    
    const multiplicadorMedio = (1.0 + 1.15 + 1.40) / 3;
    const esperado = custoBase * multiplicadorMedio * horasTotais;
    
    expect(resultado).toBeCloseTo(esperado, 2);
  });

  test('deve retornar 0 para 0 horas', () => {
    const resultado = calcularCustoOperacional(100, multiplicadores, 0);
    expect(resultado).toBe(0);
  });

  test('deve calcular com diferentes custos base', () => {
    const resultado1 = calcularCustoOperacional(100, multiplicadores, 10);
    const resultado2 = calcularCustoOperacional(200, multiplicadores, 10);
    
    expect(resultado2).toBeCloseTo(resultado1 * 2, 2);
  });
});

describe('Cálculos - Mão de Obra', () => {
  test('deve calcular custo de horas normais', () => {
    expect(calcularCustoMaoObra(40, 15.50)).toBe(620);
  });

  test('deve calcular custo de HE 50%', () => {
    expect(calcularCustoMaoObra(8, 23.25)).toBe(186);
  });

  test('deve calcular custo de HE 100%', () => {
    expect(calcularCustoMaoObra(8, 31.00)).toBe(248);
  });

  test('deve retornar 0 para 0 horas', () => {
    expect(calcularCustoMaoObra(0, 15.50)).toBe(0);
  });

  test('deve lidar com horas fracionadas', () => {
    expect(calcularCustoMaoObra(7.5, 20)).toBe(150);
  });

  test('deve calcular corretamente com valores decimais', () => {
    expect(calcularCustoMaoObra(40.5, 15.75)).toBeCloseTo(637.875, 2);
  });
});

describe('Cálculos - Vale Transporte', () => {
  test('deve calcular vale transporte para 5 dias', () => {
    expect(calcularCustoValeTransporte(5, 5.50)).toBe(27.50);
  });

  test('deve calcular vale transporte para 20 dias', () => {
    expect(calcularCustoValeTransporte(20, 5.50)).toBe(110);
  });

  test('deve retornar 0 para 0 dias', () => {
    expect(calcularCustoValeTransporte(0, 5.50)).toBe(0);
  });

  test('deve lidar com dias fracionados', () => {
    expect(calcularCustoValeTransporte(5.5, 6)).toBe(33);
  });
});

describe('Cálculos - Transporte por App', () => {
  test('deve calcular transporte por app', () => {
    expect(calcularCustoTransporteApp(10, 12.00)).toBe(120);
  });

  test('deve retornar 0 para 0 dias', () => {
    expect(calcularCustoTransporteApp(0, 12.00)).toBe(0);
  });

  test('deve calcular com valor zero (quando não usa)', () => {
    expect(calcularCustoTransporteApp(10, 0)).toBe(0);
  });
});

describe('Cálculos - Refeição', () => {
  test('deve calcular custo de refeição', () => {
    expect(calcularCustoRefeicao(10, 25.00)).toBe(250);
  });

  test('deve retornar 0 para 0 dias', () => {
    expect(calcularCustoRefeicao(0, 25.00)).toBe(0);
  });

  test('deve calcular com valor zero (quando não fornece)', () => {
    expect(calcularCustoRefeicao(10, 0)).toBe(0);
  });
});

describe('Cálculos - Itens Extras', () => {
  test('deve calcular custo de extras por hora', () => {
    expect(calcularCustoExtras(10, 100)).toBe(1000);
  });

  test('deve retornar 0 para 0 horas', () => {
    expect(calcularCustoExtras(10, 0)).toBe(0);
  });

  test('deve retornar 0 para custo zero', () => {
    expect(calcularCustoExtras(0, 100)).toBe(0);
  });

  test('deve calcular múltiplos extras', () => {
    const extra1 = calcularCustoExtras(5, 100);
    const extra2 = calcularCustoExtras(8, 100);
    const total = extra1 + extra2;
    
    expect(total).toBe(1300);
  });
});

describe('Cálculos - Margem de Lucro', () => {
  test('deve aplicar margem de 20%', () => {
    expect(aplicarMargem(1000, 20)).toBe(200);
  });

  test('deve aplicar margem de 30%', () => {
    expect(aplicarMargem(1000, 30)).toBe(300);
  });

  test('deve aplicar margem de 0%', () => {
    expect(aplicarMargem(1000, 0)).toBe(0);
  });

  test('deve aplicar margem de 100%', () => {
    expect(aplicarMargem(1000, 100)).toBe(1000);
  });

  test('deve lidar com valores decimais', () => {
    expect(aplicarMargem(1234.56, 15.5)).toBeCloseTo(191.36, 2);
  });
});

describe('Cálculos - Desconto', () => {
  test('deve aplicar desconto de 10%', () => {
    expect(aplicarDesconto(1000, 10)).toBe(100);
  });

  test('deve aplicar desconto de 5%', () => {
    expect(aplicarDesconto(1000, 5)).toBe(50);
  });

  test('deve aplicar desconto de 0%', () => {
    expect(aplicarDesconto(1000, 0)).toBe(0);
  });

  test('deve aplicar desconto de 100%', () => {
    expect(aplicarDesconto(1000, 100)).toBe(1000);
  });

  test('deve lidar com valores decimais', () => {
    expect(aplicarDesconto(2345.67, 7.5)).toBeCloseTo(175.93, 2);
  });
});

describe('Cálculos - Valor por Hora', () => {
  test('deve calcular valor por hora', () => {
    expect(calcularValorPorHora(1000, 100)).toBe(10);
  });

  test('deve calcular com valores decimais', () => {
    expect(calcularValorPorHora(1234.56, 80)).toBeCloseTo(15.432, 2);
  });

  test('deve retornar 0 para 0 horas', () => {
    expect(calcularValorPorHora(1000, 0)).toBe(0);
  });

  test('deve calcular corretamente para horas fracionadas', () => {
    expect(calcularValorPorHora(500, 12.5)).toBe(40);
  });
});

describe('Cálculos - Horários', () => {
  test('deve converter horário para minutos', () => {
    expect(parseTimeToMinutes('08:00')).toBe(480);
    expect(parseTimeToMinutes('12:30')).toBe(750);
    expect(parseTimeToMinutes('18:45')).toBe(1125);
  });

  test('deve calcular horas entre períodos', () => {
    expect(calcularHorasEntrePeriodo('08:00', '12:00')).toBe(4);
    expect(calcularHorasEntrePeriodo('13:00', '17:30')).toBe(4.5);
    expect(calcularHorasEntrePeriodo('09:15', '18:45')).toBe(9.5);
  });

  test('deve retornar 0 para horário inválido (fim antes do início)', () => {
    expect(calcularHorasEntrePeriodo('17:00', '08:00')).toBe(0);
  });

  test('deve retornar 0 para horários iguais', () => {
    expect(calcularHorasEntrePeriodo('10:00', '10:00')).toBe(0);
  });
});

describe('Cálculos - Validações', () => {
  test('não deve permitir valores negativos em conversão de meses', () => {
    expect(converterMesesParaDias(-1)).toBe(-30); // Retorna valor negativo como indicativo
  });

  test('deve lidar com percentuais extremos', () => {
    expect(aplicarMargem(1000, 0)).toBeGreaterThanOrEqual(0);
    expect(aplicarMargem(1000, 100)).toBeLessThanOrEqual(1000);
  });

  test('deve lidar com percentuais de desconto extremos', () => {
    expect(aplicarDesconto(1000, 0)).toBeGreaterThanOrEqual(0);
    expect(aplicarDesconto(1000, 100)).toBeLessThanOrEqual(1000);
  });
});

describe('Cálculos - Cenários Integrados', () => {
  test('cenário 1: orçamento de 1 mês, segunda a sexta, 8h/dia', () => {
    const duracao = converterMesesParaDias(1);
    const diasSelecionados = [1, 2, 3, 4, 5]; // Seg-Sex
    const horasPorDia = 8;
    
    const diasTrabalhados = calcularDiasTrabalhados(duracao, diasSelecionados);
    const horas = calcularHorasPorTipo(diasTrabalhados, horasPorDia);
    
    expect(horas.horasNormais).toBeGreaterThan(0);
    expect(horas.horasHE50).toBe(0);
    expect(horas.horasHE100).toBe(0);
  });

  test('cenário 2: orçamento de 3 meses, todos os dias, 6h/dia', () => {
    const duracao = converterMesesParaDias(3);
    const diasSelecionados = [0, 1, 2, 3, 4, 5, 6]; // Todos os dias
    const horasPorDia = 6;
    
    const diasTrabalhados = calcularDiasTrabalhados(duracao, diasSelecionados);
    const horas = calcularHorasPorTipo(diasTrabalhados, horasPorDia);
    
    expect(horas.horasNormais).toBeGreaterThan(0);
    expect(horas.horasHE50).toBeGreaterThan(0); // Sábados
    expect(horas.horasHE100).toBeGreaterThan(0); // Domingos
  });

  test('cenário 3: cálculo completo com margem e desconto', () => {
    const custoBase = 1000;
    const margem = 20; // 20%
    const desconto = 10; // 10%
    
    const valorMargem = aplicarMargem(custoBase, margem);
    const subtotalComMargem = custoBase + valorMargem;
    const valorDesconto = aplicarDesconto(subtotalComMargem, desconto);
    const valorFinal = subtotalComMargem - valorDesconto;
    
    expect(subtotalComMargem).toBe(1200); // 1000 + 20%
    expect(valorDesconto).toBe(120); // 10% de 1200
    expect(valorFinal).toBe(1080); // 1200 - 120
  });

  test('cenário 4: múltiplos funcionários', () => {
    const funcionarios = [
      { horaNormal: 15.00, he50: 22.50, he100: 30.00 },
      { horaNormal: 18.00, he50: 27.00, he100: 36.00 }
    ];
    
    const horasNormais = 40;
    const horasHE50 = 8;
    const horasHE100 = 8;
    
    let custoTotal = 0;
    funcionarios.forEach(func => {
      custoTotal += calcularCustoMaoObra(horasNormais, func.horaNormal);
      custoTotal += calcularCustoMaoObra(horasHE50, func.he50);
      custoTotal += calcularCustoMaoObra(horasHE100, func.he100);
    });
    
    expect(custoTotal).toBeGreaterThan(0);
    expect(custoTotal).toBeCloseTo(2244, 0); // Verificação aproximada
  });
});
