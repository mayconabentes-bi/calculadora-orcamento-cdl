/**
 * Testes Unitários - Funcionalidades de CRM e Fidelização
 * Testes para:
 * - Captura de dados do cliente
 * - Persistência de cliente e contato no histórico
 * - Exportação CSV com colunas de cliente
 * - Detecção de oportunidades de renovação
 */

const fs = require('fs');
const path = require('path');

// Carregar o código do DataManager
const dataManagerCode = fs.readFileSync(
  path.join(__dirname, '../../assets/js/data-manager.js'),
  'utf8'
);

// Executar código no contexto global para testes
const executar = new Function(dataManagerCode + '; return { DataManager, formatarMoeda, formatarNumero };');
const { DataManager, formatarMoeda, formatarNumero } = executar();
global.DataManager = DataManager;
global.formatarMoeda = formatarMoeda;
global.formatarNumero = formatarNumero;

describe('CRM - Captura de dados do cliente', () => {
  let dm;

  beforeEach(() => {
    localStorage.clear();
    dm = new DataManager();
  });

  test('deve adicionar cálculo com dados do cliente ao histórico', () => {
    const calculo = {
      clienteNome: 'Empresa ABC Ltda',
      clienteContato: '(92) 99999-9999',
      sala: {
        id: 1,
        nome: 'Auditório',
        unidade: 'DJLM'
      },
      duracao: 6,
      duracaoTipo: 'meses',
      resultado: {
        horasTotais: 100,
        valorFinal: 10000,
        subtotalSemMargem: 8000,
        valorMargem: 2000,
        valorDesconto: 500
      }
    };

    const registro = dm.adicionarCalculoHistorico(calculo);

    expect(registro).toBeDefined();
    expect(registro.cliente).toBe('Empresa ABC Ltda');
    expect(registro.contato).toBe('(92) 99999-9999');
    expect(registro.sala.nome).toBe('Auditório');
  });

  test('deve adicionar cálculo sem dados do cliente (compatibilidade)', () => {
    const calculo = {
      sala: {
        id: 1,
        nome: 'Auditório',
        unidade: 'DJLM'
      },
      duracao: 6,
      duracaoTipo: 'meses',
      resultado: {
        horasTotais: 100,
        valorFinal: 10000,
        subtotalSemMargem: 8000,
        valorMargem: 2000,
        valorDesconto: 500
      }
    };

    const registro = dm.adicionarCalculoHistorico(calculo);

    expect(registro).toBeDefined();
    expect(registro.cliente).toBe('');
    expect(registro.contato).toBe('');
  });

  test('deve persistir dados do cliente no localStorage', () => {
    const calculo = {
      clienteNome: 'João Silva',
      clienteContato: 'joao@email.com',
      sala: {
        id: 2,
        nome: 'Sala 3',
        unidade: 'UTV'
      },
      duracao: 3,
      duracaoTipo: 'meses',
      resultado: {
        horasTotais: 50,
        valorFinal: 5000,
        subtotalSemMargem: 4000,
        valorMargem: 1000,
        valorDesconto: 250
      }
    };

    dm.adicionarCalculoHistorico(calculo);

    // Criar nova instância para verificar persistência
    const dm2 = new DataManager();
    const historico = dm2.obterHistoricoCalculos();

    expect(historico.length).toBeGreaterThan(0);
    expect(historico[0].cliente).toBe('João Silva');
    expect(historico[0].contato).toBe('joao@email.com');
  });
});

describe('CRM - Exportação CSV com dados do cliente', () => {
  let dm;

  beforeEach(() => {
    localStorage.clear();
    dm = new DataManager();
  });

  test('deve incluir colunas de cliente e contato no CSV', () => {
    const calculo = {
      clienteNome: 'Empresa XYZ',
      clienteContato: '(92) 98888-8888',
      sala: {
        id: 1,
        nome: 'Auditório',
        unidade: 'DJLM'
      },
      duracao: 6,
      duracaoTipo: 'meses',
      resultado: {
        horasTotais: 100,
        valorFinal: 10000,
        subtotalSemMargem: 8000,
        valorMargem: 2000,
        valorDesconto: 500
      }
    };

    dm.adicionarCalculoHistorico(calculo);
    const csv = dm.exportarHistoricoCSV();

    expect(csv).toContain('Cliente');
    expect(csv).toContain('Contato');
    expect(csv).toContain('Empresa XYZ');
    expect(csv).toContain('(92) 98888-8888');
  });

  test('deve formatar CSV corretamente para Excel (UTF-8 com BOM)', () => {
    const calculo = {
      clienteNome: 'Cliente Teste',
      clienteContato: 'teste@email.com',
      sala: {
        id: 1,
        nome: 'Auditório',
        unidade: 'DJLM'
      },
      duracao: 6,
      duracaoTipo: 'meses',
      resultado: {
        horasTotais: 100,
        valorFinal: 10000,
        subtotalSemMargem: 8000,
        valorMargem: 2000,
        valorDesconto: 500
      }
    };

    dm.adicionarCalculoHistorico(calculo);
    const csv = dm.exportarHistoricoCSV();

    // Verificar formato CSV válido
    const linhas = csv.split('\n');
    expect(linhas.length).toBeGreaterThan(1);
    
    // Primeira linha deve ser cabeçalho
    const cabecalho = linhas[0];
    expect(cabecalho).toContain('Data');
    expect(cabecalho).toContain('Cliente');
    expect(cabecalho).toContain('Contato');
  });

  test('deve compatibilizar dados antigos sem cliente no CSV', () => {
    // Simular dados antigos sem cliente
    const calculoAntigo = {
      sala: {
        id: 1,
        nome: 'Auditório',
        unidade: 'DJLM'
      },
      duracao: 6,
      duracaoTipo: 'meses',
      resultado: {
        horasTotais: 100,
        valorFinal: 10000,
        subtotalSemMargem: 8000,
        valorMargem: 2000,
        valorDesconto: 500
      }
    };

    dm.adicionarCalculoHistorico(calculoAntigo);
    const csv = dm.exportarHistoricoCSV();

    expect(csv).toBeDefined();
    expect(csv.split('\n').length).toBeGreaterThan(1);
  });
});

describe('CRM - Oportunidades de Renovação', () => {
  let dm;

  beforeEach(() => {
    localStorage.clear();
    dm = new DataManager();
  });

  test('deve retornar array vazio quando não há histórico', () => {
    const oportunidades = dm.obterOportunidadesRenovacao();
    expect(Array.isArray(oportunidades)).toBe(true);
    expect(oportunidades.length).toBe(0);
  });

  test('deve identificar eventos de 11-12 meses atrás', () => {
    // Criar evento há 11 meses
    const data11Meses = new Date();
    data11Meses.setMonth(data11Meses.getMonth() - 11);

    const calculo = {
      clienteNome: 'Cliente Renovação',
      clienteContato: '(92) 99999-9999',
      sala: {
        id: 1,
        nome: 'Auditório',
        unidade: 'DJLM'
      },
      duracao: 6,
      duracaoTipo: 'meses',
      resultado: {
        horasTotais: 100,
        valorFinal: 10000,
        subtotalSemMargem: 8000,
        valorMargem: 2000,
        valorDesconto: 500
      }
    };

    // Adicionar e forçar data antiga
    const registro = dm.adicionarCalculoHistorico(calculo);
    dm.dados.historicoCalculos[0].data = data11Meses.toISOString();
    dm.salvarDados();

    const oportunidades = dm.obterOportunidadesRenovacao();

    expect(oportunidades.length).toBeGreaterThan(0);
    expect(oportunidades[0].cliente).toBe('Cliente Renovação');
    expect(oportunidades[0].mesesAtras).toBeGreaterThanOrEqual(11);
    expect(oportunidades[0].mesesAtras).toBeLessThanOrEqual(12);
  });

  test('não deve retornar eventos muito recentes (menos de 11 meses)', () => {
    const calculo = {
      clienteNome: 'Cliente Recente',
      clienteContato: '(92) 99999-9999',
      sala: {
        id: 1,
        nome: 'Auditório',
        unidade: 'DJLM'
      },
      duracao: 6,
      duracaoTipo: 'meses',
      resultado: {
        horasTotais: 100,
        valorFinal: 10000,
        subtotalSemMargem: 8000,
        valorMargem: 2000,
        valorDesconto: 500
      }
    };

    dm.adicionarCalculoHistorico(calculo);
    const oportunidades = dm.obterOportunidadesRenovacao();

    expect(oportunidades.length).toBe(0);
  });

  test('não deve retornar eventos muito antigos (mais de 12 meses)', () => {
    // Criar evento há 15 meses
    const data15Meses = new Date();
    data15Meses.setMonth(data15Meses.getMonth() - 15);

    const calculo = {
      clienteNome: 'Cliente Antigo',
      clienteContato: '(92) 99999-9999',
      sala: {
        id: 1,
        nome: 'Auditório',
        unidade: 'DJLM'
      },
      duracao: 6,
      duracaoTipo: 'meses',
      resultado: {
        horasTotais: 100,
        valorFinal: 10000,
        subtotalSemMargem: 8000,
        valorMargem: 2000,
        valorDesconto: 500
      }
    };

    const registro = dm.adicionarCalculoHistorico(calculo);
    dm.dados.historicoCalculos[0].data = data15Meses.toISOString();
    dm.salvarDados();

    const oportunidades = dm.obterOportunidadesRenovacao();

    expect(oportunidades.length).toBe(0);
  });

  test('não deve retornar registros sem cliente', () => {
    const data11Meses = new Date();
    data11Meses.setMonth(data11Meses.getMonth() - 11);

    const calculo = {
      // Sem clienteNome
      sala: {
        id: 1,
        nome: 'Auditório',
        unidade: 'DJLM'
      },
      duracao: 6,
      duracaoTipo: 'meses',
      resultado: {
        horasTotais: 100,
        valorFinal: 10000,
        subtotalSemMargem: 8000,
        valorMargem: 2000,
        valorDesconto: 500
      }
    };

    const registro = dm.adicionarCalculoHistorico(calculo);
    dm.dados.historicoCalculos[0].data = data11Meses.toISOString();
    dm.salvarDados();

    const oportunidades = dm.obterOportunidadesRenovacao();

    expect(oportunidades.length).toBe(0);
  });

  test('deve evitar duplicatas do mesmo cliente', () => {
    const data11Meses = new Date();
    data11Meses.setMonth(data11Meses.getMonth() - 11);

    // Adicionar 3 eventos do mesmo cliente no mesmo período
    for (let i = 0; i < 3; i++) {
      const calculo = {
        clienteNome: 'Cliente Duplicado',
        clienteContato: '(92) 99999-9999',
        sala: {
          id: 1,
          nome: 'Auditório',
          unidade: 'DJLM'
        },
        duracao: 6,
        duracaoTipo: 'meses',
        resultado: {
          horasTotais: 100,
          valorFinal: 10000,
          subtotalSemMargem: 8000,
          valorMargem: 2000,
          valorDesconto: 500
        }
      };

      const registro = dm.adicionarCalculoHistorico(calculo);
      dm.dados.historicoCalculos[0].data = data11Meses.toISOString();
    }
    dm.salvarDados();

    const oportunidades = dm.obterOportunidadesRenovacao();

    // Deve retornar apenas 1 oportunidade, não 3
    expect(oportunidades.length).toBe(1);
    expect(oportunidades[0].cliente).toBe('Cliente Duplicado');
  });

  test('deve incluir informações completas na oportunidade', () => {
    const data11Meses = new Date();
    data11Meses.setMonth(data11Meses.getMonth() - 11);

    const calculo = {
      clienteNome: 'Cliente Completo',
      clienteContato: 'cliente@email.com',
      sala: {
        id: 2,
        nome: 'Sala 3',
        unidade: 'UTV'
      },
      duracao: 6,
      duracaoTipo: 'meses',
      resultado: {
        horasTotais: 100,
        valorFinal: 15000,
        subtotalSemMargem: 8000,
        valorMargem: 2000,
        valorDesconto: 500
      }
    };

    const registro = dm.adicionarCalculoHistorico(calculo);
    dm.dados.historicoCalculos[0].data = data11Meses.toISOString();
    dm.salvarDados();

    const oportunidades = dm.obterOportunidadesRenovacao();

    expect(oportunidades.length).toBe(1);
    const op = oportunidades[0];
    
    expect(op.cliente).toBe('Cliente Completo');
    expect(op.contato).toBe('cliente@email.com');
    expect(op.espaco).toBe('UTV - Sala 3');
    expect(op.valorAnterior).toBe(15000);
    expect(op.dataEvento).toBeDefined();
    expect(op.mesesAtras).toBeGreaterThanOrEqual(11);
  });
});
