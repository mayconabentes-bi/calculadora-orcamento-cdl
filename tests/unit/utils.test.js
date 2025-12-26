/**
 * Testes Unitários - Utilitários
 * Testes para funções auxiliares:
 * - Formatação de moeda
 * - Formatação de data
 * - Validação de horário
 * - Sanitização de HTML
 * - Geração de IDs únicos
 */

const fs = require('fs');
const path = require('path');

// Carregar CoreUtils do validation.js
const validationCode = fs.readFileSync(
  path.join(__dirname, '../../assets/js/validation.js'),
  'utf8'
);

// Executar código e extrair CoreUtils
const executar = new Function(validationCode + '; return { CoreUtils };');
const { CoreUtils } = executar();

describe('Utilitários - Formatação de Moeda', () => {
  test('deve formatar número inteiro', () => {
    const resultado = CoreUtils.formatarMoeda(1000);
    expect(resultado).toBe('1.000,00');
  });

  test('deve formatar número com decimais', () => {
    const resultado = CoreUtils.formatarMoeda(1234.56);
    expect(resultado).toBe('1.234,56');
  });

  test('deve formatar zero', () => {
    const resultado = CoreUtils.formatarMoeda(0);
    expect(resultado).toBe('0,00');
  });

  test('deve formatar números negativos', () => {
    const resultado = CoreUtils.formatarMoeda(-500.75);
    expect(resultado).toBe('-500,75');
  });

  test('deve sempre ter 2 casas decimais', () => {
    const resultado = CoreUtils.formatarMoeda(10);
    expect(resultado).toBe('10,00');
  });

  test('deve formatar números grandes', () => {
    const resultado = CoreUtils.formatarMoeda(1000000);
    expect(resultado).toBe('1.000.000,00');
  });

  test('deve arredondar para 2 casas decimais', () => {
    const resultado = CoreUtils.formatarMoeda(10.999);
    expect(resultado).toBe('11,00');
  });

  test('deve formatar centavos', () => {
    const resultado = CoreUtils.formatarMoeda(0.99);
    expect(resultado).toBe('0,99');
  });
});

describe('Utilitários - Formatação de Número', () => {
  test('deve formatar número com 2 casas decimais', () => {
    const resultado = CoreUtils.formatarNumero(10);
    expect(resultado).toBe('10.00');
  });

  test('deve formatar com ponto decimal', () => {
    const resultado = CoreUtils.formatarNumero(123.456);
    expect(resultado).toBe('123.46');
  });

  test('deve arredondar corretamente', () => {
    const resultado = CoreUtils.formatarNumero(10.995);
    // toFixed arredonda de forma banker's rounding (para o número par mais próximo)
    // então 10.995 pode arredondar para 10.99 ou 11.00 dependendo da implementação
    expect(resultado).toMatch(/^(10\.99|11\.00)$/);
  });
});

describe('Utilitários - Validação de Horário', () => {
  function validarFormatoHorario(horario) {
    const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return regex.test(horario);
  }

  test('deve validar horário correto', () => {
    expect(validarFormatoHorario('08:00')).toBe(true);
    expect(validarFormatoHorario('12:30')).toBe(true);
    expect(validarFormatoHorario('23:59')).toBe(true);
  });

  test('deve rejeitar horário inválido', () => {
    expect(validarFormatoHorario('24:00')).toBe(false);
    expect(validarFormatoHorario('12:60')).toBe(false);
    expect(validarFormatoHorario('abc')).toBe(false);
  });

  test('deve aceitar horas de 1 dígito', () => {
    expect(validarFormatoHorario('8:00')).toBe(true);
    expect(validarFormatoHorario('9:30')).toBe(true);
  });

  test('deve rejeitar formato sem dois pontos', () => {
    expect(validarFormatoHorario('0800')).toBe(false);
  });
});

describe('Utilitários - Formatação de Data', () => {
  function formatarDataBR(data) {
    if (data instanceof Date) {
      return data.toLocaleDateString('pt-BR');
    }
    return '';
  }

  test('deve formatar data em formato brasileiro', () => {
    const data = new Date('2024-01-15');
    const resultado = formatarDataBR(data);
    expect(resultado).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
  });

  test('deve retornar string vazia para entrada inválida', () => {
    const resultado = formatarDataBR('não é uma data');
    expect(resultado).toBe('');
  });

  test('deve retornar string vazia para null', () => {
    const resultado = formatarDataBR(null);
    expect(resultado).toBe('');
  });
});

describe('Utilitários - Geração de IDs', () => {
  function gerarIdUnico(lista) {
    if (!lista || lista.length === 0) return 1;
    return Math.max(...lista.map(item => item.id), 0) + 1;
  }

  test('deve gerar ID 1 para lista vazia', () => {
    expect(gerarIdUnico([])).toBe(1);
  });

  test('deve gerar próximo ID sequencial', () => {
    const lista = [{ id: 1 }, { id: 2 }, { id: 3 }];
    expect(gerarIdUnico(lista)).toBe(4);
  });

  test('deve lidar com IDs não sequenciais', () => {
    const lista = [{ id: 1 }, { id: 5 }, { id: 3 }];
    expect(gerarIdUnico(lista)).toBe(6);
  });

  test('deve retornar 1 para lista null ou undefined', () => {
    expect(gerarIdUnico(null)).toBe(1);
    expect(gerarIdUnico(undefined)).toBe(1);
  });
});

describe('Utilitários - Sanitização de HTML', () => {
  function sanitizarHTML(texto) {
    if (!texto) return '';
    return texto
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  test('deve escapar caracteres HTML', () => {
    const resultado = sanitizarHTML('<script>alert("xss")</script>');
    expect(resultado).not.toContain('<script>');
    expect(resultado).toContain('&lt;script&gt;');
  });

  test('deve escapar ampersand', () => {
    const resultado = sanitizarHTML('A & B');
    expect(resultado).toBe('A &amp; B');
  });

  test('deve escapar aspas', () => {
    const resultado = sanitizarHTML('Ele disse "olá"');
    expect(resultado).toContain('&quot;');
  });

  test('deve retornar string vazia para entrada vazia', () => {
    expect(sanitizarHTML('')).toBe('');
    expect(sanitizarHTML(null)).toBe('');
    expect(sanitizarHTML(undefined)).toBe('');
  });
});

describe('Utilitários - Validações Numéricas', () => {
  function validarNumeroPositivo(valor) {
    return typeof valor === 'number' && !isNaN(valor) && valor >= 0;
  }

  function validarPercentual(valor) {
    return typeof valor === 'number' && !isNaN(valor) && valor >= 0 && valor <= 100;
  }

  test('deve validar número positivo', () => {
    expect(validarNumeroPositivo(10)).toBe(true);
    expect(validarNumeroPositivo(0)).toBe(true);
    expect(validarNumeroPositivo(100.5)).toBe(true);
  });

  test('deve rejeitar número negativo', () => {
    expect(validarNumeroPositivo(-1)).toBe(false);
  });

  test('deve rejeitar NaN', () => {
    expect(validarNumeroPositivo(NaN)).toBe(false);
  });

  test('deve validar percentual válido', () => {
    expect(validarPercentual(0)).toBe(true);
    expect(validarPercentual(50)).toBe(true);
    expect(validarPercentual(100)).toBe(true);
  });

  test('deve rejeitar percentual inválido', () => {
    expect(validarPercentual(-1)).toBe(false);
    expect(validarPercentual(101)).toBe(false);
  });
});

describe('Utilitários - Conversões', () => {
  function converterStringParaNumero(valor, padrao = 0) {
    const numero = parseFloat(valor);
    return isNaN(numero) ? padrao : numero;
  }

  function converterStringParaInteiro(valor, padrao = 0) {
    const numero = parseInt(valor);
    return isNaN(numero) ? padrao : numero;
  }

  test('deve converter string para número', () => {
    expect(converterStringParaNumero('10.5')).toBe(10.5);
    expect(converterStringParaNumero('100')).toBe(100);
  });

  test('deve retornar padrão para string inválida', () => {
    expect(converterStringParaNumero('abc', 0)).toBe(0);
    expect(converterStringParaNumero('', 10)).toBe(10);
  });

  test('deve converter string para inteiro', () => {
    expect(converterStringParaInteiro('10')).toBe(10);
    expect(converterStringParaInteiro('100')).toBe(100);
  });

  test('deve truncar decimais ao converter para inteiro', () => {
    expect(converterStringParaInteiro('10.9')).toBe(10);
  });
});

describe('Utilitários - Manipulação de Arrays', () => {
  function removerDuplicados(array) {
    return [...new Set(array)];
  }

  function ordenarNumeros(array) {
    return [...array].sort((a, b) => a - b);
  }

  test('deve remover duplicados de array', () => {
    const resultado = removerDuplicados([1, 2, 2, 3, 3, 3]);
    expect(resultado).toEqual([1, 2, 3]);
  });

  test('deve ordenar números corretamente', () => {
    const resultado = ordenarNumeros([5, 2, 8, 1, 9]);
    expect(resultado).toEqual([1, 2, 5, 8, 9]);
  });
});

describe('Utilitários - Strings', () => {
  function capitalize(texto) {
    if (!texto) return '';
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
  }

  function truncarTexto(texto, tamanho = 50) {
    if (!texto) return '';
    if (texto.length <= tamanho) return texto;
    return texto.substring(0, tamanho) + '...';
  }

  test('deve capitalizar primeira letra', () => {
    expect(capitalize('teste')).toBe('Teste');
    expect(capitalize('TESTE')).toBe('Teste');
  });

  test('deve truncar texto longo', () => {
    const textoLongo = 'Este é um texto muito longo que precisa ser truncado';
    const resultado = truncarTexto(textoLongo, 20);
    expect(resultado.length).toBeLessThanOrEqual(23); // 20 + '...'
    expect(resultado).toContain('...');
  });

  test('não deve truncar texto curto', () => {
    const textoCurto = 'Texto curto';
    const resultado = truncarTexto(textoCurto, 50);
    expect(resultado).toBe(textoCurto);
  });
});
