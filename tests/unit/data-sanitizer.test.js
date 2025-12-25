/**
 * Testes Unitários - DataSanitizer
 * Testes abrangentes para a classe DataSanitizer
 */

// Importar funções de validação usando require
const { DataSanitizer } = require('../../assets/js/validation.js');

describe('DataSanitizer - Normalização de Nome', () => {
  describe('Casos válidos - Title Case', () => {
    test('deve converter nome em minúsculas para Title Case', () => {
      const resultado = DataSanitizer.normalizarNome('joão silva');
      expect(resultado.valido).toBe(true);
      expect(resultado.nomeNormalizado).toBe('João Silva');
    });

    test('deve converter nome em MAIÚSCULAS para Title Case', () => {
      const resultado = DataSanitizer.normalizarNome('EMPRESA ABC');
      expect(resultado.valido).toBe(true);
      expect(resultado.nomeNormalizado).toBe('Empresa Abc');
    });

    test('deve manter Title Case quando já está correto', () => {
      const resultado = DataSanitizer.normalizarNome('Maria dos Santos');
      expect(resultado.valido).toBe(true);
      expect(resultado.nomeNormalizado).toBe('Maria dos Santos');
    });

    test('deve tratar preposições corretamente', () => {
      const resultado = DataSanitizer.normalizarNome('empresa de tecnologia da informação');
      expect(resultado.valido).toBe(true);
      expect(resultado.nomeNormalizado).toBe('Empresa de Tecnologia da Informação');
    });
  });

  describe('Remoção de emojis', () => {
    test('deve remover emojis de emoticons', () => {
      const resultado = DataSanitizer.normalizarNome('João Silva 😊');
      expect(resultado.valido).toBe(true);
      expect(resultado.nomeNormalizado).toBe('João Silva');
    });

    test('deve remover múltiplos emojis', () => {
      const resultado = DataSanitizer.normalizarNome('🎉 Empresa ABC 🚀✨');
      expect(resultado.valido).toBe(true);
      expect(resultado.nomeNormalizado).toBe('Empresa Abc');
    });

    test('deve remover emojis de bandeiras', () => {
      const resultado = DataSanitizer.normalizarNome('Empresa Brasil 🇧🇷');
      expect(resultado.valido).toBe(true);
      expect(resultado.nomeNormalizado).toBe('Empresa Brasil');
    });
  });

  describe('Remoção de subjetividade entre parênteses', () => {
    test('deve remover (urgente)', () => {
      const resultado = DataSanitizer.normalizarNome('Cliente ABC (urgente)');
      expect(resultado.valido).toBe(true);
      expect(resultado.nomeNormalizado).toBe('Cliente Abc');
    });

    test('deve remover (chato)', () => {
      const resultado = DataSanitizer.normalizarNome('Empresa XYZ (chato)');
      expect(resultado.valido).toBe(true);
      expect(resultado.nomeNormalizado).toBe('Empresa Xyz');
    });

    test('deve remover (amigo do dono)', () => {
      const resultado = DataSanitizer.normalizarNome('João Silva (amigo do dono)');
      expect(resultado.valido).toBe(true);
      expect(resultado.nomeNormalizado).toBe('João Silva');
    });

    test('deve remover múltiplas observações subjetivas', () => {
      const resultado = DataSanitizer.normalizarNome('Cliente (vip) ABC (importante)');
      expect(resultado.valido).toBe(true);
      expect(resultado.nomeNormalizado).toBe('Cliente Abc');
    });

    test('deve manter parênteses com conteúdo não-subjetivo', () => {
      const resultado = DataSanitizer.normalizarNome('Empresa ABC (Filial Sul)');
      expect(resultado.valido).toBe(true);
      expect(resultado.nomeNormalizado).toBe('Empresa Abc (filial Sul)');
    });
  });

  describe('Casos inválidos', () => {
    test('deve rejeitar string vazia', () => {
      const resultado = DataSanitizer.normalizarNome('');
      expect(resultado.valido).toBe(false);
      expect(resultado.erro).toContain('vazio');
    });

    test('deve rejeitar string apenas com espaços', () => {
      const resultado = DataSanitizer.normalizarNome('   ');
      expect(resultado.valido).toBe(false);
      expect(resultado.erro).toContain('vazio');
    });

    test('deve rejeitar null', () => {
      const resultado = DataSanitizer.normalizarNome(null);
      expect(resultado.valido).toBe(false);
      expect(resultado.erro).toContain('string');
    });

    test('deve rejeitar undefined', () => {
      const resultado = DataSanitizer.normalizarNome(undefined);
      expect(resultado.valido).toBe(false);
    });

    test('deve rejeitar número', () => {
      const resultado = DataSanitizer.normalizarNome(123);
      expect(resultado.valido).toBe(false);
    });

    test('deve rejeitar nome muito curto (< 2 caracteres)', () => {
      const resultado = DataSanitizer.normalizarNome('A');
      expect(resultado.valido).toBe(false);
      expect(resultado.erro).toContain('muito curto');
    });

    test('deve rejeitar nome que fica vazio após processamento', () => {
      const resultado = DataSanitizer.normalizarNome('😊🎉');
      expect(resultado.valido).toBe(false);
      expect(resultado.erro).toContain('vazio após normalização');
    });
  });

  describe('Normalização de espaços', () => {
    test('deve remover espaços múltiplos', () => {
      const resultado = DataSanitizer.normalizarNome('João    Silva');
      expect(resultado.valido).toBe(true);
      expect(resultado.nomeNormalizado).toBe('João Silva');
    });

    test('deve remover espaços no início e fim', () => {
      const resultado = DataSanitizer.normalizarNome('  João Silva  ');
      expect(resultado.valido).toBe(true);
      expect(resultado.nomeNormalizado).toBe('João Silva');
    });
  });
});

describe('DataSanitizer - Validação de Contato', () => {
  describe('Validação de Email', () => {
    test('deve aceitar email simples como texto livre', () => {
      const resultado = DataSanitizer.validarContato('joao@empresa.com');
      expect(resultado.valido).toBe(true);
      expect(resultado.tipo).toBe('texto');
      expect(resultado.contatoNormalizado).toBe('joao@empresa.com');
    });

    test('deve aceitar email em maiúsculas como texto livre', () => {
      const resultado = DataSanitizer.validarContato('JOAO@EMPRESA.COM');
      expect(resultado.valido).toBe(true);
      expect(resultado.tipo).toBe('texto');
      expect(resultado.contatoNormalizado).toBe('JOAO@EMPRESA.COM');
    });

    test('deve aceitar email com pontos e underscores como texto livre', () => {
      const resultado = DataSanitizer.validarContato('joao.silva_teste@empresa.com.br');
      expect(resultado.valido).toBe(true);
      expect(resultado.tipo).toBe('texto');
    });

    test('deve aceitar email incompleto como texto livre', () => {
      const resultado = DataSanitizer.validarContato('joao@');
      expect(resultado.valido).toBe(true);
      expect(resultado.tipo).toBe('texto');
    });

    test('deve aceitar texto sem @ como texto livre', () => {
      const resultado = DataSanitizer.validarContato('joaoempresa.com');
      expect(resultado.valido).toBe(true);
      expect(resultado.tipo).toBe('texto');
    });

    test('deve aceitar email sem ponto no domínio como texto livre', () => {
      const resultado = DataSanitizer.validarContato('joao@empresa');
      expect(resultado.valido).toBe(true);
      expect(resultado.tipo).toBe('texto');
    });
  });

  describe('Validação de Telefone', () => {
    test('deve aceitar telefone brasileiro com DDD e 9 dígitos como texto livre', () => {
      const resultado = DataSanitizer.validarContato('11987654321');
      expect(resultado.valido).toBe(true);
      expect(resultado.tipo).toBe('texto');
      expect(resultado.contatoNormalizado).toBe('11987654321');
    });

    test('deve aceitar telefone com formatação como texto livre', () => {
      const resultado = DataSanitizer.validarContato('(11) 98765-4321');
      expect(resultado.valido).toBe(true);
      expect(resultado.tipo).toBe('texto');
      expect(resultado.contatoNormalizado).toBe('(11) 98765-4321');
    });

    test('deve aceitar telefone com código do país como texto livre', () => {
      const resultado = DataSanitizer.validarContato('+5511987654321');
      expect(resultado.valido).toBe(true);
      expect(resultado.tipo).toBe('texto');
      expect(resultado.contatoNormalizado).toBe('+5511987654321');
    });

    test('deve aceitar telefone fixo com 8 dígitos como texto livre', () => {
      const resultado = DataSanitizer.validarContato('1133334444');
      expect(resultado.valido).toBe(true);
      expect(resultado.tipo).toBe('texto');
      expect(resultado.contatoNormalizado).toBe('1133334444');
    });

    test('deve aceitar telefone com espaços como texto livre', () => {
      const resultado = DataSanitizer.validarContato('(11) 9 8765-4321');
      expect(resultado.valido).toBe(true);
      expect(resultado.tipo).toBe('texto');
      expect(resultado.contatoNormalizado).toBe('(11) 9 8765-4321');
    });

    test('deve aceitar telefone com pontos como texto livre', () => {
      const resultado = DataSanitizer.validarContato('11.98765.4321');
      expect(resultado.valido).toBe(true);
      expect(resultado.tipo).toBe('texto');
      expect(resultado.contatoNormalizado).toBe('11.98765.4321');
    });

    test('deve aceitar telefone muito curto como texto livre', () => {
      const resultado = DataSanitizer.validarContato('123456');
      expect(resultado.valido).toBe(true);
      expect(resultado.tipo).toBe('texto');
    });

    test('deve aceitar telefone muito longo como texto livre', () => {
      const resultado = DataSanitizer.validarContato('12345678901234');
      expect(resultado.valido).toBe(true);
      expect(resultado.tipo).toBe('texto');
    });

    test('deve aceitar telefone com letras como texto livre', () => {
      const resultado = DataSanitizer.validarContato('11abc987654321');
      expect(resultado.valido).toBe(true);
      expect(resultado.tipo).toBe('texto');
    });
  });

  describe('Casos inválidos gerais', () => {
    test('deve aceitar contato vazio como válido (campo opcional)', () => {
      const resultado = DataSanitizer.validarContato('');
      expect(resultado.valido).toBe(true);
      expect(resultado.tipo).toBe(null);
      expect(resultado.contatoNormalizado).toBe(null);
    });

    test('deve aceitar contato apenas com espaços como válido (campo opcional)', () => {
      const resultado = DataSanitizer.validarContato('   ');
      expect(resultado.valido).toBe(true);
      expect(resultado.tipo).toBe(null);
    });

    test('deve aceitar null como válido (campo opcional)', () => {
      const resultado = DataSanitizer.validarContato(null);
      expect(resultado.valido).toBe(true);
      expect(resultado.tipo).toBe(null);
    });

    test('deve aceitar undefined como válido (campo opcional)', () => {
      const resultado = DataSanitizer.validarContato(undefined);
      expect(resultado.valido).toBe(true);
      expect(resultado.tipo).toBe(null);
    });

    test('deve aceitar número como texto livre', () => {
      const resultado = DataSanitizer.validarContato(123);
      expect(resultado.valido).toBe(true);
    });
    
    test('deve aceitar qualquer texto livre', () => {
      const resultado = DataSanitizer.validarContato('sem telefone');
      expect(resultado.valido).toBe(true);
      expect(resultado.tipo).toBe('texto');
      expect(resultado.contatoNormalizado).toBe('sem telefone');
    });
  });
});

describe('DataSanitizer - Detecção de Viés', () => {
  describe('Detecção de pontos de exclamação excessivos', () => {
    test('deve detectar múltiplos pontos de exclamação', () => {
      const resultado = DataSanitizer.detectarVies('Cliente urgente!!');
      expect(resultado.temVies).toBe(true);
      expect(resultado.motivos).toContain('Excesso de pontos de exclamação (linguagem emotiva)');
    });

    test('deve detectar três ou mais pontos de exclamação', () => {
      const resultado = DataSanitizer.detectarVies('IMPORTANTE!!!');
      expect(resultado.temVies).toBe(true);
    });

    test('não deve detectar um único ponto de exclamação', () => {
      const resultado = DataSanitizer.detectarVies('Cliente importante!');
      // Pode detectar por palavra proibida, mas não por exclamação
      expect(resultado.motivos.some(m => m.includes('exclamação'))).toBe(false);
    });
  });

  describe('Detecção de ALL CAPS (gritar)', () => {
    test('deve detectar texto completamente em maiúsculas', () => {
      const resultado = DataSanitizer.detectarVies('EMPRESA URGENTE');
      expect(resultado.temVies).toBe(true);
      expect(resultado.motivos.some(m => m.includes('maiúsculas'))).toBe(true);
    });

    test('deve detectar CAPS com números', () => {
      const resultado = DataSanitizer.detectarVies('CLIENTE 123');
      expect(resultado.temVies).toBe(true);
    });

    test('não deve detectar siglas curtas como CAPS', () => {
      const resultado = DataSanitizer.detectarVies('ABC');
      expect(resultado.motivos.some(m => m.includes('maiúsculas'))).toBe(false);
    });

    test('não deve detectar texto com maiúsculas e minúsculas misturadas', () => {
      const resultado = DataSanitizer.detectarVies('Empresa ABC');
      expect(resultado.motivos.some(m => m.includes('maiúsculas'))).toBe(false);
    });
  });

  describe('Detecção de palavras proibidas (blacklist)', () => {
    test('deve detectar palavra "caro"', () => {
      const resultado = DataSanitizer.detectarVies('Cliente muito caro');
      expect(resultado.temVies).toBe(true);
      expect(resultado.motivos.some(m => m.includes('caro'))).toBe(true);
    });

    test('deve detectar palavra "barato"', () => {
      const resultado = DataSanitizer.detectarVies('Produto barato');
      expect(resultado.temVies).toBe(true);
      expect(resultado.motivos.some(m => m.includes('barato'))).toBe(true);
    });

    test('deve detectar palavra "chato"', () => {
      const resultado = DataSanitizer.detectarVies('Cliente chato');
      expect(resultado.temVies).toBe(true);
      expect(resultado.motivos.some(m => m.includes('chato'))).toBe(true);
    });

    test('deve detectar palavra "vip"', () => {
      const resultado = DataSanitizer.detectarVies('Cliente vip');
      expect(resultado.temVies).toBe(true);
      expect(resultado.motivos.some(m => m.includes('vip'))).toBe(true);
    });

    test('deve detectar palavra "urgente"', () => {
      const resultado = DataSanitizer.detectarVies('Pedido urgente');
      expect(resultado.temVies).toBe(true);
      expect(resultado.motivos.some(m => m.includes('urgente'))).toBe(true);
    });

    test('deve detectar múltiplas palavras proibidas', () => {
      const resultado = DataSanitizer.detectarVies('Cliente vip muito caro');
      expect(resultado.temVies).toBe(true);
      expect(resultado.motivos.some(m => m.includes('vip') && m.includes('caro'))).toBe(true);
    });

    test('deve ser case-insensitive para palavras proibidas', () => {
      const resultado = DataSanitizer.detectarVies('Cliente VIP');
      expect(resultado.temVies).toBe(true);
    });

    test('não deve detectar falsos positivos em palavras maiores', () => {
      // "caro" não deve ser detectado em "precário"
      const resultado = DataSanitizer.detectarVies('Situação precária');
      // Pode detectar se "precária" estiver na blacklist, mas não por conter "caro"
      // Este teste verifica o uso de word boundary no regex
      expect(resultado.temVies).toBe(false);
    });
  });

  describe('Casos sem viés', () => {
    test('não deve detectar viés em texto neutro', () => {
      const resultado = DataSanitizer.detectarVies('Empresa ABC Ltda');
      expect(resultado.temVies).toBe(false);
      expect(resultado.motivos).toHaveLength(0);
    });

    test('não deve detectar viés em nome simples', () => {
      const resultado = DataSanitizer.detectarVies('João Silva');
      expect(resultado.temVies).toBe(false);
    });

    test('não deve detectar viés em string vazia', () => {
      const resultado = DataSanitizer.detectarVies('');
      expect(resultado.temVies).toBe(false);
    });

    test('deve lidar com null/undefined', () => {
      const resultado1 = DataSanitizer.detectarVies(null);
      const resultado2 = DataSanitizer.detectarVies(undefined);
      expect(resultado1.temVies).toBe(false);
      expect(resultado2.temVies).toBe(false);
    });
  });
});

describe('DataSanitizer - Sanitização Completa de Dados do Cliente', () => {
  describe('Casos válidos', () => {
    test('deve sanitizar dados válidos corretamente', () => {
      const resultado = DataSanitizer.sanitizarDadosCliente(
        'joão silva',
        'joao@empresa.com'
      );
      expect(resultado.valido).toBe(true);
      expect(resultado.dados.clienteNome).toBe('João Silva');
      expect(resultado.dados.clienteContato).toBe('joao@empresa.com');
      expect(resultado.dados.tipoContato).toBe('texto');
      expect(resultado.erros).toHaveLength(0);
    });

    test('deve sanitizar nome com emojis e normalizar contato telefônico', () => {
      const resultado = DataSanitizer.sanitizarDadosCliente(
        'EMPRESA ABC 🚀',
        '(11) 98765-4321'
      );
      expect(resultado.valido).toBe(true);
      expect(resultado.dados.clienteNome).toBe('Empresa Abc');
      expect(resultado.dados.clienteContato).toBe('(11) 98765-4321');
      expect(resultado.dados.tipoContato).toBe('texto');
    });

    test('deve remover observações subjetivas do nome', () => {
      const resultado = DataSanitizer.sanitizarDadosCliente(
        'Cliente ABC (urgente)',
        'cliente@email.com'
      );
      expect(resultado.valido).toBe(true);
      expect(resultado.dados.clienteNome).toBe('Cliente Abc');
    });
    
    test('deve aceitar contato vazio (campo opcional)', () => {
      const resultado = DataSanitizer.sanitizarDadosCliente(
        'João Silva',
        ''
      );
      expect(resultado.valido).toBe(true);
      expect(resultado.dados.clienteNome).toBe('João Silva');
      expect(resultado.dados.clienteContato).toBe(null);
      expect(resultado.dados.tipoContato).toBe(null);
    });
    
    test('deve aceitar texto livre como contato', () => {
      const resultado = DataSanitizer.sanitizarDadosCliente(
        'João Silva',
        'sem telefone'
      );
      expect(resultado.valido).toBe(true);
      expect(resultado.dados.clienteNome).toBe('João Silva');
      expect(resultado.dados.clienteContato).toBe('sem telefone');
      expect(resultado.dados.tipoContato).toBe('texto');
    });
  });

  describe('Casos inválidos - nome', () => {
    test('deve rejeitar nome vazio', () => {
      const resultado = DataSanitizer.sanitizarDadosCliente(
        '',
        'joao@empresa.com'
      );
      expect(resultado.valido).toBe(false);
      expect(resultado.erros.some(e => e.includes('Nome'))).toBe(true);
    });

    test('deve rejeitar nome com viés (ALL CAPS)', () => {
      const resultado = DataSanitizer.sanitizarDadosCliente(
        'EMPRESA URGENTE',
        'empresa@email.com'
      );
      expect(resultado.valido).toBe(false);
      expect(resultado.erros.some(e => e.includes('viés'))).toBe(true);
    });

    test('deve rejeitar nome com palavras proibidas', () => {
      const resultado = DataSanitizer.sanitizarDadosCliente(
        'Cliente vip',
        'cliente@email.com'
      );
      expect(resultado.valido).toBe(false);
      expect(resultado.erros.some(e => e.includes('viés'))).toBe(true);
    });
  });

  describe('Casos inválidos - contato', () => {
    test('deve aceitar email inválido como texto livre', () => {
      const resultado = DataSanitizer.sanitizarDadosCliente(
        'João Silva',
        'email-invalido'
      );
      expect(resultado.valido).toBe(true);
      expect(resultado.dados.clienteContato).toBe('email-invalido');
    });

    test('deve aceitar telefone inválido como texto livre', () => {
      const resultado = DataSanitizer.sanitizarDadosCliente(
        'João Silva',
        '123'
      );
      expect(resultado.valido).toBe(true);
      expect(resultado.dados.clienteContato).toBe('123');
    });

    test('deve aceitar contato vazio (campo opcional)', () => {
      const resultado = DataSanitizer.sanitizarDadosCliente(
        'João Silva',
        ''
      );
      expect(resultado.valido).toBe(true);
      expect(resultado.dados.clienteContato).toBe(null);
    });
  });

  describe('Casos inválidos - múltiplos erros', () => {
    test('deve reportar erro quando nome é inválido (contato agora é sempre válido)', () => {
      const resultado = DataSanitizer.sanitizarDadosCliente(
        '',
        'email-invalido'
      );
      expect(resultado.valido).toBe(false);
      expect(resultado.erros.some(e => e.includes('Nome'))).toBe(true);
    });

    test('deve reportar erro de viés mas aceitar contato inválido', () => {
      const resultado = DataSanitizer.sanitizarDadosCliente(
        'CLIENTE URGENTE',
        '123'
      );
      expect(resultado.valido).toBe(false);
      expect(resultado.erros.some(e => e.includes('viés'))).toBe(true);
      // Contato não gera mais erro
    });
  });
});

describe('DataSanitizer - Testes de Integração', () => {
  test('cenário real: nome em CAPS com emoji e telefone formatado', () => {
    const resultado = DataSanitizer.sanitizarDadosCliente(
      'JOÃO SILVA 😊',
      '(11) 98765-4321'
    );
    // Após sanitização: emojis removidos e convertido para Title Case = "João Silva"
    // Isso é válido porque a normalização remove o viés de ALL CAPS
    expect(resultado.valido).toBe(true);
    expect(resultado.dados.clienteNome).toBe('João Silva');
    expect(resultado.dados.clienteContato).toBe('(11) 98765-4321');
    expect(resultado.dados.tipoContato).toBe('texto');
  });

  test('cenário real: nome com observação subjetiva e email maiúsculo', () => {
    const resultado = DataSanitizer.sanitizarDadosCliente(
      'Empresa ABC (amigo do dono)',
      'CONTATO@EMPRESA.COM'
    );
    expect(resultado.valido).toBe(true); // Nome válido após remover observação
    expect(resultado.dados.clienteNome).toBe('Empresa Abc');
    expect(resultado.dados.clienteContato).toBe('CONTATO@EMPRESA.COM');
    expect(resultado.dados.tipoContato).toBe('texto');
  });

  test('cenário real: nome com múltiplos problemas', () => {
    const resultado = DataSanitizer.sanitizarDadosCliente(
      'CLIENTE VIP!! 🎉 (urgente)',
      'cliente@email'
    );
    expect(resultado.valido).toBe(false);
    // Deve detectar: CAPS, exclamações, palavra proibida (mas não email inválido)
    expect(resultado.erros.length).toBeGreaterThan(0);
    expect(resultado.erros.some(e => e.includes('viés'))).toBe(true);
  });

  test('cenário ideal: dados limpos e neutros', () => {
    const resultado = DataSanitizer.sanitizarDadosCliente(
      'Empresa de Tecnologia Ltda',
      'contato@empresa.com.br'
    );
    expect(resultado.valido).toBe(true);
    expect(resultado.dados.clienteNome).toBe('Empresa de Tecnologia Ltda');
    expect(resultado.dados.clienteContato).toBe('contato@empresa.com.br');
    expect(resultado.dados.tipoContato).toBe('texto');
    expect(resultado.erros).toHaveLength(0);
  });
});
