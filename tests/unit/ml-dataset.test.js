/**
 * Testes Unitários - ML Dataset Export e Feature Engineering
 * Testes para:
 * - Captura de data do evento
 * - Cálculo de Lead Time
 * - Inferência de turno predominante
 * - Exportação de dataset para Machine Learning
 */

const fs = require('fs');
const path = require('path');

// Carregar validation.js primeiro (contém CoreUtils)
const validationCode = fs.readFileSync(
  path.join(__dirname, '../../assets/js/validation.js'),
  'utf8'
);

// Carregar o código do DataManager
const dataManagerCode = fs.readFileSync(
  path.join(__dirname, '../../assets/js/data-manager.js'),
  'utf8'
);

// Executar código no contexto global para testes
const executarValidation = new Function(validationCode + '; return { CoreUtils, DataSanitizer };');
const { CoreUtils, DataSanitizer } = executarValidation();
global.CoreUtils = CoreUtils;
global.DataSanitizer = DataSanitizer;

const executar = new Function(dataManagerCode + '; return { DataManager };');
const { DataManager } = executar();
global.DataManager = DataManager;

describe('ML - Captura de Data do Evento e Lead Time', () => {
  let dm;

  beforeEach(() => {
    localStorage.clear();
    dm = new DataManager();
  });

  test('deve capturar data do evento ao adicionar ao histórico', () => {
    const dataEvento = '2024-12-31';
    const calculo = {
      clienteNome: 'Cliente Teste',
      clienteContato: 'teste@email.com',
      dataEvento: dataEvento,
      sala: {
        id: 1,
        nome: 'Auditório',
        unidade: 'DJLM'
      },
      duracao: 6,
      duracaoTipo: 'meses',
      horarios: [{ inicio: '08:00', fim: '17:00' }],
      resultado: {
        horasTotais: 100,
        valorFinal: 10000,
        subtotalSemMargem: 8000,
        valorMargem: 2000,
        valorDesconto: 500,
        custoMaoObraTotal: 3000,
        custoValeTransporte: 500,
        custoTransporteApp: 0,
        custoRefeicao: 0
      },
      desconto: 0.05
    };

    const registro = dm.adicionarCalculoHistorico(calculo);

    expect(registro).toBeDefined();
    expect(registro.dataEvento).toBe(dataEvento);
  });

  test('deve calcular lead time corretamente', () => {
    // Data do evento em 30 dias
    const dataEvento = new Date();
    dataEvento.setDate(dataEvento.getDate() + 30);
    const dataEventoStr = dataEvento.toISOString().split('T')[0];

    const calculo = {
      clienteNome: 'Cliente Teste',
      dataEvento: dataEventoStr,
      sala: {
        id: 1,
        nome: 'Auditório',
        unidade: 'DJLM'
      },
      duracao: 6,
      duracaoTipo: 'meses',
      horarios: [{ inicio: '08:00', fim: '17:00' }],
      resultado: {
        horasTotais: 100,
        valorFinal: 10000,
        subtotalSemMargem: 8000,
        valorMargem: 2000,
        valorDesconto: 500,
        custoMaoObraTotal: 3000,
        custoValeTransporte: 500,
        custoTransporteApp: 0,
        custoRefeicao: 0
      },
      desconto: 0.05
    };

    const registro = dm.adicionarCalculoHistorico(calculo);

    expect(registro.leadTimeDays).toBeDefined();
    expect(registro.leadTimeDays).toBeGreaterThanOrEqual(29);
    expect(registro.leadTimeDays).toBeLessThanOrEqual(31);
  });

  test('deve permitir registro sem data do evento (compatibilidade)', () => {
    const calculo = {
      clienteNome: 'Cliente Teste',
      sala: {
        id: 1,
        nome: 'Auditório',
        unidade: 'DJLM'
      },
      duracao: 6,
      duracaoTipo: 'meses',
      horarios: [{ inicio: '08:00', fim: '17:00' }],
      resultado: {
        horasTotais: 100,
        valorFinal: 10000,
        subtotalSemMargem: 8000,
        valorMargem: 2000,
        valorDesconto: 500,
        custoMaoObraTotal: 3000,
        custoValeTransporte: 500,
        custoTransporteApp: 0,
        custoRefeicao: 0
      },
      desconto: 0.05
    };

    const registro = dm.adicionarCalculoHistorico(calculo);

    expect(registro).toBeDefined();
    expect(registro.dataEvento).toBeNull();
    expect(registro.leadTimeDays).toBeNull();
  });

  test('deve calcular lead time negativo para datas passadas', () => {
    // Data do evento 10 dias atrás
    const dataEvento = new Date();
    dataEvento.setDate(dataEvento.getDate() - 10);
    const dataEventoStr = dataEvento.toISOString().split('T')[0];

    const calculo = {
      clienteNome: 'Cliente Teste',
      dataEvento: dataEventoStr,
      sala: {
        id: 1,
        nome: 'Auditório',
        unidade: 'DJLM'
      },
      duracao: 6,
      duracaoTipo: 'meses',
      horarios: [{ inicio: '08:00', fim: '17:00' }],
      resultado: {
        horasTotais: 100,
        valorFinal: 10000,
        subtotalSemMargem: 8000,
        valorMargem: 2000,
        valorDesconto: 500,
        custoMaoObraTotal: 3000,
        custoValeTransporte: 500,
        custoTransporteApp: 0,
        custoRefeicao: 0
      },
      desconto: 0.05
    };

    const registro = dm.adicionarCalculoHistorico(calculo);

    expect(registro.leadTimeDays).toBeDefined();
    expect(registro.leadTimeDays).toBeLessThan(0);
  });
});

describe('ML - Inferência de Turno Predominante', () => {
  let dm;

  beforeEach(() => {
    localStorage.clear();
    dm = new DataManager();
  });

  test('deve inferir turno Manhã (1) corretamente', () => {
    const horarios = [
      { inicio: '08:00', fim: '11:00' }
    ];

    const turno = dm.inferirTurnoPredominante(horarios);

    expect(turno).toBe(1);
  });

  test('deve inferir turno Tarde (2) corretamente', () => {
    const horarios = [
      { inicio: '14:00', fim: '17:00' }
    ];

    const turno = dm.inferirTurnoPredominante(horarios);

    expect(turno).toBe(2);
  });

  test('deve inferir turno Noite (3) corretamente', () => {
    const horarios = [
      { inicio: '19:00', fim: '22:00' }
    ];

    const turno = dm.inferirTurnoPredominante(horarios);

    expect(turno).toBe(3);
  });

  test('deve inferir turno predominante com múltiplos horários', () => {
    const horarios = [
      { inicio: '08:00', fim: '10:00' },  // 2h manhã
      { inicio: '14:00', fim: '18:00' }   // 4h tarde
    ];

    const turno = dm.inferirTurnoPredominante(horarios);

    expect(turno).toBe(2); // Tarde predomina
  });

  test('deve retornar null se não houver horários', () => {
    const turno = dm.inferirTurnoPredominante([]);

    expect(turno).toBeNull();
  });

  test('deve retornar null se horários for undefined', () => {
    const turno = dm.inferirTurnoPredominante(undefined);

    expect(turno).toBeNull();
  });
});

describe('ML - Exportação de Dataset para Machine Learning', () => {
  let dm;

  beforeEach(() => {
    localStorage.clear();
    dm = new DataManager();
  });

  test('deve retornar null se não houver histórico', () => {
    const csv = dm.exportarDatasetML();

    expect(csv).toBeNull();
  });

  test('deve incluir cabeçalhos corretos no dataset ML', () => {
    const calculo = {
      clienteNome: 'Cliente Teste',
      dataEvento: '2024-12-31',
      sala: {
        id: 1,
        nome: 'Auditório',
        unidade: 'DJLM'
      },
      duracao: 6,
      duracaoTipo: 'meses',
      horarios: [{ inicio: '14:00', fim: '17:00' }],
      resultado: {
        horasTotais: 100,
        valorFinal: 10000,
        subtotalSemMargem: 8000,
        valorMargem: 2000,
        valorDesconto: 500,
        custoMaoObraTotal: 3000,
        custoValeTransporte: 500,
        custoTransporteApp: 0,
        custoRefeicao: 0
      },
      desconto: 0.05
    };

    dm.adicionarCalculoHistorico(calculo);
    const csv = dm.exportarDatasetML();

    expect(csv).toContain('TARGET_CONVERTIDO');
    expect(csv).toContain('FEATURE_DESCONTO_PERCENT');
    expect(csv).toContain('FEATURE_MARGEM_LIQUIDA');
    expect(csv).toContain('FEATURE_LEAD_TIME');
    expect(csv).toContain('FEATURE_VALOR_TOTAL');
    expect(csv).toContain('FEATURE_DURACAO_HORAS');
    expect(csv).toContain('CAT_SALA_ID');
    expect(csv).toContain('CAT_TURNO_PREDOMINANTE');
  });

  test('deve exportar TARGET_CONVERTIDO corretamente (0 ou 1)', () => {
    const calculo1 = {
      clienteNome: 'Cliente 1',
      dataEvento: '2024-12-31',
      sala: { id: 1, nome: 'Auditório', unidade: 'DJLM' },
      duracao: 6,
      duracaoTipo: 'meses',
      horarios: [{ inicio: '14:00', fim: '17:00' }],
      resultado: {
        horasTotais: 100,
        valorFinal: 10000,
        subtotalSemMargem: 8000,
        valorMargem: 2000,
        valorDesconto: 500,
        custoMaoObraTotal: 3000,
        custoValeTransporte: 500,
        custoTransporteApp: 0,
        custoRefeicao: 0
      },
      desconto: 0.05
    };

    const registro = dm.adicionarCalculoHistorico(calculo1);
    
    // Marcar como convertido
    dm.atualizarConversao(registro.id, true);
    
    const csv = dm.exportarDatasetML();
    const linhas = csv.split('\n');
    
    // Segunda linha (primeira após cabeçalho) deve ter TARGET = 1
    expect(linhas[1]).toMatch(/^1,/);
  });

  test('deve exportar features numéricas sem valores vazios críticos', () => {
    const calculo = {
      clienteNome: 'Cliente Teste',
      dataEvento: '2024-12-31',
      sala: { id: 1, nome: 'Auditório', unidade: 'DJLM' },
      duracao: 6,
      duracaoTipo: 'meses',
      horarios: [{ inicio: '14:00', fim: '17:00' }],
      resultado: {
        horasTotais: 100,
        valorFinal: 10000,
        subtotalSemMargem: 8000,
        valorMargem: 2000,
        valorDesconto: 500,
        custoMaoObraTotal: 3000,
        custoValeTransporte: 500,
        custoTransporteApp: 0,
        custoRefeicao: 0
      },
      desconto: 0.20
    };

    dm.adicionarCalculoHistorico(calculo);
    const csv = dm.exportarDatasetML();
    const linhas = csv.split('\n');
    const dados = linhas[1].split(',');

    // TARGET_CONVERTIDO
    expect(dados[0]).toMatch(/^[01]$/);
    
    // FEATURE_DESCONTO_PERCENT
    expect(parseFloat(dados[1])).toBeGreaterThanOrEqual(0);
    
    // FEATURE_MARGEM_LIQUIDA
    expect(parseFloat(dados[2])).toBeGreaterThan(0);
    
    // FEATURE_LEAD_TIME pode estar vazio para dados antigos, mas se presente deve ser número
    if (dados[3] !== '') {
      expect(parseFloat(dados[3])).toBeDefined();
    }
    
    // FEATURE_VALOR_TOTAL
    expect(parseFloat(dados[4])).toBeGreaterThan(0);
    
    // FEATURE_DURACAO_HORAS
    expect(parseFloat(dados[5])).toBeGreaterThan(0);
    
    // CAT_SALA_ID
    expect(parseInt(dados[6])).toBeGreaterThan(0);
  });

  test('deve exportar CAT_TURNO_PREDOMINANTE corretamente', () => {
    const calculo = {
      clienteNome: 'Cliente Teste',
      dataEvento: '2024-12-31',
      sala: { id: 1, nome: 'Auditório', unidade: 'DJLM' },
      duracao: 6,
      duracaoTipo: 'meses',
      horarios: [{ inicio: '14:00', fim: '17:00' }], // Tarde
      resultado: {
        horasTotais: 100,
        valorFinal: 10000,
        subtotalSemMargem: 8000,
        valorMargem: 2000,
        valorDesconto: 500,
        custoMaoObraTotal: 3000,
        custoValeTransporte: 500,
        custoTransporteApp: 0,
        custoRefeicao: 0
      },
      desconto: 0.20
    };

    dm.adicionarCalculoHistorico(calculo);
    const csv = dm.exportarDatasetML();
    const linhas = csv.split('\n');
    const dados = linhas[1].split(',');

    // CAT_TURNO_PREDOMINANTE deve ser 2 (Tarde)
    expect(dados[7]).toBe('2');
  });

  test('deve lidar com múltiplos registros no dataset', () => {
    // Adicionar 3 cálculos
    for (let i = 0; i < 3; i++) {
      const calculo = {
        clienteNome: `Cliente ${i}`,
        dataEvento: '2024-12-31',
        sala: { id: i + 1, nome: `Sala ${i}`, unidade: 'DJLM' },
        duracao: 6,
        duracaoTipo: 'meses',
        horarios: [{ inicio: '14:00', fim: '17:00' }],
        resultado: {
          horasTotais: 100 + i * 10,
          valorFinal: 10000 + i * 1000,
          subtotalSemMargem: 8000,
          valorMargem: 2000,
          valorDesconto: 500,
          custoMaoObraTotal: 3000,
          custoValeTransporte: 500,
          custoTransporteApp: 0,
          custoRefeicao: 0
        },
        desconto: 0.20
      };

      dm.adicionarCalculoHistorico(calculo);
    }

    const csv = dm.exportarDatasetML();
    const linhas = csv.split('\n');

    // Deve ter cabeçalho + 3 linhas de dados
    expect(linhas.length).toBe(4);
  });

  test('deve gerar CSV válido sem campos não formatados', () => {
    const calculo = {
      clienteNome: 'Cliente Teste',
      dataEvento: '2024-12-31',
      sala: { id: 1, nome: 'Auditório', unidade: 'DJLM' },
      duracao: 6,
      duracaoTipo: 'meses',
      horarios: [{ inicio: '14:00', fim: '17:00' }],
      resultado: {
        horasTotais: 100,
        valorFinal: 10000,
        subtotalSemMargem: 8000,
        valorMargem: 2000,
        valorDesconto: 500,
        custoMaoObraTotal: 3000,
        custoValeTransporte: 500,
        custoTransporteApp: 0,
        custoRefeicao: 0
      },
      desconto: 0.20
    };

    dm.adicionarCalculoHistorico(calculo);
    const csv = dm.exportarDatasetML();

    // Não deve conter aspas duplas (CSV limpo para ML)
    expect(csv).not.toContain('"');
    
    // Todas as linhas devem ter 8 campos
    const linhas = csv.split('\n');
    linhas.forEach((linha, index) => {
      if (linha.trim() !== '') {
        const campos = linha.split(',');
        expect(campos.length).toBe(8);
      }
    });
  });
});
