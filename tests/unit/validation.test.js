/**
 * Testes Unitários - Validação de Dados
 * Testes para funções de validação incluindo casos extremos e edge cases
 */

// Importar funções de validação
const fs = require('fs');
const path = require('path');

// Carregar o arquivo de validação
const validationCode = fs.readFileSync(
  path.join(__dirname, '../../assets/js/validation.js'),
  'utf8'
);

// Avaliar o código em um contexto isolado
eval(validationCode);

describe('Validação - Valores Monetários', () => {
  describe('Casos válidos', () => {
    test('deve aceitar valor monetário válido', () => {
      const resultado = validarValorMonetario(100.50);
      expect(resultado.valido).toBe(true);
      expect(resultado.erro).toBeNull();
    });

    test('deve aceitar zero', () => {
      const resultado = validarValorMonetario(0);
      expect(resultado.valido).toBe(true);
    });

    test('deve aceitar valores inteiros', () => {
      const resultado = validarValorMonetario(1000);
      expect(resultado.valido).toBe(true);
    });

    test('deve aceitar valores decimais pequenos', () => {
      const resultado = validarValorMonetario(0.01);
      expect(resultado.valido).toBe(true);
    });
  });

  describe('Casos inválidos - valores negativos', () => {
    test('deve rejeitar valores negativos', () => {
      const resultado = validarValorMonetario(-100);
      expect(resultado.valido).toBe(false);
      expect(resultado.erro).toContain('negativo');
    });

    test('deve rejeitar valores negativos decimais', () => {
      const resultado = validarValorMonetario(-0.01);
      expect(resultado.valido).toBe(false);
    });
  });

  describe('Casos inválidos - valores não numéricos', () => {
    test('deve rejeitar NaN', () => {
      const resultado = validarValorMonetario(NaN);
      expect(resultado.valido).toBe(false);
      expect(resultado.erro).toContain('número válido');
    });

    test('deve rejeitar strings', () => {
      const resultado = validarValorMonetario('100');
      expect(resultado.valido).toBe(false);
    });

    test('deve rejeitar null', () => {
      const resultado = validarValorMonetario(null);
      expect(resultado.valido).toBe(false);
    });

    test('deve rejeitar undefined', () => {
      const resultado = validarValorMonetario(undefined);
      expect(resultado.valido).toBe(false);
    });

    test('deve rejeitar objetos', () => {
      const resultado = validarValorMonetario({});
      expect(resultado.valido).toBe(false);
    });

    test('deve rejeitar arrays', () => {
      const resultado = validarValorMonetario([]);
      expect(resultado.valido).toBe(false);
    });
  });

  describe('Casos extremos - limites de precisão', () => {
    test('deve rejeitar valores muito grandes', () => {
      const resultado = validarValorMonetario(Number.MAX_SAFE_INTEGER);
      expect(resultado.valido).toBe(false);
      expect(resultado.erro).toContain('muito grande');
    });

    test('deve rejeitar valores com muitas casas decimais', () => {
      const resultado = validarValorMonetario(1.123456789012);
      expect(resultado.valido).toBe(false);
      expect(resultado.erro).toContain('casas decimais');
    });

    test('deve detectar erros de precisão flutuante', () => {
      // 0.1 + 0.2 = 0.30000000000000004 em JavaScript
      const resultado = validarValorMonetario(0.1 + 0.2);
      // Este deve falhar devido ao excesso de casas decimais
      expect(resultado.valido).toBe(false);
    });
  });

  describe('Casos de borda', () => {
    test('deve aceitar valores muito pequenos mas positivos', () => {
      const resultado = validarValorMonetario(0.001);
      expect(resultado.valido).toBe(true);
    });

    test('deve aceitar valores grandes mas seguros', () => {
      const resultado = validarValorMonetario(1000000);
      expect(resultado.valido).toBe(true);
    });
  });
});

describe('Validação - Percentuais', () => {
  describe('Casos válidos', () => {
    test('deve aceitar 0%', () => {
      const resultado = validarPercentual(0);
      expect(resultado.valido).toBe(true);
    });

    test('deve aceitar 100%', () => {
      const resultado = validarPercentual(100);
      expect(resultado.valido).toBe(true);
    });

    test('deve aceitar 50%', () => {
      const resultado = validarPercentual(50);
      expect(resultado.valido).toBe(true);
    });

    test('deve aceitar decimais', () => {
      const resultado = validarPercentual(25.5);
      expect(resultado.valido).toBe(true);
    });
  });

  describe('Casos inválidos', () => {
    test('deve rejeitar valores negativos', () => {
      const resultado = validarPercentual(-10);
      expect(resultado.valido).toBe(false);
      expect(resultado.erro).toContain('negativo');
    });

    test('deve rejeitar valores acima de 100', () => {
      const resultado = validarPercentual(101);
      expect(resultado.valido).toBe(false);
      expect(resultado.erro).toContain('maior que 100');
    });

    test('deve rejeitar valores muito acima de 100', () => {
      const resultado = validarPercentual(500);
      expect(resultado.valido).toBe(false);
    });

    test('deve rejeitar NaN', () => {
      const resultado = validarPercentual(NaN);
      expect(resultado.valido).toBe(false);
    });

    test('deve rejeitar strings', () => {
      const resultado = validarPercentual('50');
      expect(resultado.valido).toBe(false);
    });

    test('deve rejeitar null', () => {
      const resultado = validarPercentual(null);
      expect(resultado.valido).toBe(false);
    });
  });

  describe('Casos de borda', () => {
    test('deve aceitar percentual muito pequeno', () => {
      const resultado = validarPercentual(0.01);
      expect(resultado.valido).toBe(true);
    });

    test('deve aceitar percentual próximo de 100', () => {
      const resultado = validarPercentual(99.99);
      expect(resultado.valido).toBe(true);
    });
  });
});

describe('Validação - Quantidade', () => {
  describe('Casos válidos', () => {
    test('deve aceitar inteiro positivo', () => {
      const resultado = validarQuantidade(5);
      expect(resultado.valido).toBe(true);
    });

    test('deve aceitar zero', () => {
      const resultado = validarQuantidade(0);
      expect(resultado.valido).toBe(true);
    });

    test('deve aceitar números grandes', () => {
      const resultado = validarQuantidade(1000);
      expect(resultado.valido).toBe(true);
    });
  });

  describe('Casos inválidos', () => {
    test('deve rejeitar valores negativos', () => {
      const resultado = validarQuantidade(-5);
      expect(resultado.valido).toBe(false);
      expect(resultado.erro).toContain('negativa');
    });

    test('deve rejeitar decimais', () => {
      const resultado = validarQuantidade(5.5);
      expect(resultado.valido).toBe(false);
      expect(resultado.erro).toContain('inteiro');
    });

    test('deve rejeitar NaN', () => {
      const resultado = validarQuantidade(NaN);
      expect(resultado.valido).toBe(false);
    });

    test('deve rejeitar strings', () => {
      const resultado = validarQuantidade('5');
      expect(resultado.valido).toBe(false);
    });

    test('deve rejeitar null', () => {
      const resultado = validarQuantidade(null);
      expect(resultado.valido).toBe(false);
    });
  });
});

describe('Validação - Duração', () => {
  describe('Casos válidos', () => {
    test('deve aceitar duração válida em dias', () => {
      const resultado = validarDuracao(30, 'dias');
      expect(resultado.valido).toBe(true);
    });

    test('deve aceitar duração válida em meses', () => {
      const resultado = validarDuracao(6, 'meses');
      expect(resultado.valido).toBe(true);
    });

    test('deve aceitar 1 dia', () => {
      const resultado = validarDuracao(1, 'dias');
      expect(resultado.valido).toBe(true);
    });

    test('deve aceitar duração máxima permitida em dias', () => {
      const resultado = validarDuracao(730, 'dias');
      expect(resultado.valido).toBe(true);
    });

    test('deve aceitar duração máxima permitida em meses', () => {
      const resultado = validarDuracao(24, 'meses');
      expect(resultado.valido).toBe(true);
    });
  });

  describe('Casos inválidos', () => {
    test('deve rejeitar duração zero', () => {
      const resultado = validarDuracao(0, 'dias');
      expect(resultado.valido).toBe(false);
      expect(resultado.erro).toContain('zero');
    });

    test('deve rejeitar duração negativa', () => {
      const resultado = validarDuracao(-5, 'dias');
      expect(resultado.valido).toBe(false);
    });

    test('deve rejeitar duração acima do limite em dias', () => {
      const resultado = validarDuracao(731, 'dias');
      expect(resultado.valido).toBe(false);
      expect(resultado.erro).toContain('exceder');
    });

    test('deve rejeitar duração acima do limite em meses', () => {
      const resultado = validarDuracao(25, 'meses');
      expect(resultado.valido).toBe(false);
      expect(resultado.erro).toContain('exceder');
    });

    test('deve rejeitar duração decimal', () => {
      const resultado = validarDuracao(5.5, 'dias');
      expect(resultado.valido).toBe(false);
      expect(resultado.erro).toContain('inteiro');
    });
  });
});

describe('Validação - Horários', () => {
  describe('Casos válidos', () => {
    test('deve aceitar horário válido', () => {
      const resultado = validarHorario('08:00');
      expect(resultado.valido).toBe(true);
    });

    test('deve aceitar meia-noite', () => {
      const resultado = validarHorario('00:00');
      expect(resultado.valido).toBe(true);
    });

    test('deve aceitar meio-dia', () => {
      const resultado = validarHorario('12:00');
      expect(resultado.valido).toBe(true);
    });

    test('deve aceitar 23:59', () => {
      const resultado = validarHorario('23:59');
      expect(resultado.valido).toBe(true);
    });

    test('deve aceitar horário com um dígito na hora', () => {
      const resultado = validarHorario('9:30');
      expect(resultado.valido).toBe(true);
    });
  });

  describe('Casos inválidos', () => {
    test('deve rejeitar hora inválida', () => {
      const resultado = validarHorario('25:00');
      expect(resultado.valido).toBe(false);
    });

    test('deve rejeitar minuto inválido', () => {
      const resultado = validarHorario('12:60');
      expect(resultado.valido).toBe(false);
    });

    test('deve rejeitar formato incorreto', () => {
      const resultado = validarHorario('12-30');
      expect(resultado.valido).toBe(false);
    });

    test('deve rejeitar string vazia', () => {
      const resultado = validarHorario('');
      expect(resultado.valido).toBe(false);
    });

    test('deve rejeitar null', () => {
      const resultado = validarHorario(null);
      expect(resultado.valido).toBe(false);
    });

    test('deve rejeitar números', () => {
      const resultado = validarHorario(1200);
      expect(resultado.valido).toBe(false);
    });
  });
});

describe('Validação - Intervalo de Horários', () => {
  describe('Casos válidos', () => {
    test('deve aceitar intervalo válido', () => {
      const resultado = validarIntervaloHorario('08:00', '17:00');
      expect(resultado.valido).toBe(true);
    });

    test('deve aceitar intervalo de 1 minuto', () => {
      const resultado = validarIntervaloHorario('08:00', '08:01');
      expect(resultado.valido).toBe(true);
    });

    test('deve aceitar intervalo cruzando meio-dia', () => {
      const resultado = validarIntervaloHorario('10:00', '14:00');
      expect(resultado.valido).toBe(true);
    });
  });

  describe('Casos inválidos', () => {
    test('deve rejeitar horário de início após o fim', () => {
      const resultado = validarIntervaloHorario('17:00', '08:00');
      expect(resultado.valido).toBe(false);
      expect(resultado.erro).toContain('anterior');
    });

    test('deve rejeitar horários iguais', () => {
      const resultado = validarIntervaloHorario('10:00', '10:00');
      expect(resultado.valido).toBe(false);
    });

    test('deve rejeitar horário de início inválido', () => {
      const resultado = validarIntervaloHorario('25:00', '17:00');
      expect(resultado.valido).toBe(false);
      expect(resultado.erro).toContain('início inválido');
    });

    test('deve rejeitar horário de fim inválido', () => {
      const resultado = validarIntervaloHorario('08:00', '25:00');
      expect(resultado.valido).toBe(false);
      expect(resultado.erro).toContain('fim inválido');
    });
  });
});

describe('Validação - Dias da Semana', () => {
  describe('Casos válidos', () => {
    test('deve aceitar array válido de dias', () => {
      const resultado = validarDiasSemana([1, 2, 3, 4, 5]);
      expect(resultado.valido).toBe(true);
    });

    test('deve aceitar todos os dias', () => {
      const resultado = validarDiasSemana([0, 1, 2, 3, 4, 5, 6]);
      expect(resultado.valido).toBe(true);
    });

    test('deve aceitar um único dia', () => {
      const resultado = validarDiasSemana([1]);
      expect(resultado.valido).toBe(true);
    });

    test('deve aceitar domingo (0)', () => {
      const resultado = validarDiasSemana([0]);
      expect(resultado.valido).toBe(true);
    });

    test('deve aceitar sábado (6)', () => {
      const resultado = validarDiasSemana([6]);
      expect(resultado.valido).toBe(true);
    });
  });

  describe('Casos inválidos', () => {
    test('deve rejeitar array vazio', () => {
      const resultado = validarDiasSemana([]);
      expect(resultado.valido).toBe(false);
      expect(resultado.erro).toContain('pelo menos um dia');
    });

    test('deve rejeitar dias inválidos', () => {
      const resultado = validarDiasSemana([7]);
      expect(resultado.valido).toBe(false);
    });

    test('deve rejeitar dias negativos', () => {
      const resultado = validarDiasSemana([-1]);
      expect(resultado.valido).toBe(false);
    });

    test('deve rejeitar não-array', () => {
      const resultado = validarDiasSemana(1);
      expect(resultado.valido).toBe(false);
      expect(resultado.erro).toContain('array');
    });

    test('deve rejeitar null', () => {
      const resultado = validarDiasSemana(null);
      expect(resultado.valido).toBe(false);
    });

    test('deve rejeitar dias decimais', () => {
      const resultado = validarDiasSemana([1.5]);
      expect(resultado.valido).toBe(false);
    });
  });
});

describe('Arredondamento de Moeda', () => {
  test('deve arredondar para 2 casas decimais', () => {
    expect(arredondarMoeda(10.126)).toBe(10.13);
  });

  test('deve arredondar para baixo', () => {
    expect(arredondarMoeda(10.124)).toBe(10.12);
  });

  test('deve lidar com problema de precisão do JavaScript', () => {
    // 0.1 + 0.2 = 0.30000000000000004
    expect(arredondarMoeda(0.1 + 0.2)).toBe(0.30);
  });

  test('deve manter valores já arredondados', () => {
    expect(arredondarMoeda(10.50)).toBe(10.50);
  });

  test('deve arredondar valores negativos', () => {
    expect(arredondarMoeda(-10.126)).toBe(-10.13);
  });

  test('deve lidar com zero', () => {
    expect(arredondarMoeda(0)).toBe(0);
  });
});

describe('Detecção de Perda de Precisão', () => {
  test('não deve detectar perda em operações comuns de float', () => {
    // 0.1 + 0.2 = 0.30000000000000004
    // A diferença é muito pequena (< 0.001), então não é detectada como problema
    expect(detectarPerdaPrecisao(0.1 + 0.2)).toBe(false);
  });

  test('não deve detectar em valores normais', () => {
    expect(detectarPerdaPrecisao(10.50)).toBe(false);
  });

  test('deve detectar diferenças significativas de arredondamento', () => {
    // Este teste verifica se há diferença > 0.001 entre o valor e seu arredondamento
    // 10.506 arredonda para 10.51, diferença de 0.004 > 0.001
    expect(detectarPerdaPrecisao(10.506)).toBe(true);
  });

  test('deve funcionar com valores grandes', () => {
    expect(detectarPerdaPrecisao(1000.00)).toBe(false);
  });

  test('deve funcionar com valores negativos', () => {
    expect(detectarPerdaPrecisao(-10.50)).toBe(false);
  });

  test('deve detectar valores que precisam arredondamento significativo', () => {
    // Valor com mais casas decimais que precisa arredondamento
    expect(detectarPerdaPrecisao(123.4567)).toBe(true);
  });
});

describe('Testes de Integração - Casos Reais', () => {
  test('cenário: valores monetários em cálculo de orçamento', () => {
    const custoBase = 132.72;
    const horas = 160;
    const total = custoBase * horas;
    
    const validacao = validarValorMonetario(total);
    expect(validacao.valido).toBe(true);
    
    // Verificar arredondamento
    const totalArredondado = arredondarMoeda(total);
    expect(totalArredondado).toBe(21235.20);
  });

  test('cenário: margem de lucro e desconto', () => {
    const subtotal = 10000;
    const margem = 20; // 20%
    const desconto = 10; // 10%
    
    expect(validarPercentual(margem).valido).toBe(true);
    expect(validarPercentual(desconto).valido).toBe(true);
    
    const comMargem = subtotal * (1 + margem/100);
    const comDesconto = comMargem * (1 - desconto/100);
    
    expect(arredondarMoeda(comDesconto)).toBe(10800);
  });

  test('cenário: validação de entrada de usuário - valores nulos', () => {
    expect(validarValorMonetario(null).valido).toBe(false);
    expect(validarPercentual(null).valido).toBe(false);
    expect(validarQuantidade(null).valido).toBe(false);
    expect(validarHorario(null).valido).toBe(false);
  });

  test('cenário: validação de entrada de usuário - valores negativos', () => {
    expect(validarValorMonetario(-100).valido).toBe(false);
    expect(validarPercentual(-10).valido).toBe(false);
    expect(validarQuantidade(-5).valido).toBe(false);
    expect(validarDuracao(-1, 'dias').valido).toBe(false);
  });

  test('cenário: limites extremos de desconto', () => {
    expect(validarPercentual(0).valido).toBe(true);
    expect(validarPercentual(100).valido).toBe(true);
    expect(validarPercentual(101).valido).toBe(false);
    expect(validarPercentual(-1).valido).toBe(false);
  });
});
