/**
 * Testes Unitários - DataManager
 * Testes para a classe DataManager incluindo:
 * - Carregar dados padrão
 * - Salvar e recuperar dados do LocalStorage
 * - CRUD de salas
 * - CRUD de itens extras
 * - CRUD de funcionários
 * - Migração de dados antigos
 * - Validação de estrutura de dados
 * - Obter multiplicadores de turno
 * - Exportar/importar dados
 */

const fs = require('fs');
const path = require('path');

// Carregar o código do DataManager
const dataManagerCode = fs.readFileSync(
  path.join(__dirname, '../../assets/js/data-manager.js'),
  'utf8'
);

// Executar código no contexto global para testes
eval(dataManagerCode);

describe('DataManager - Inicialização', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('deve criar instância do DataManager', () => {
    const dm = new DataManager();
    expect(dm).toBeInstanceOf(DataManager);
    expect(dm.storageKey).toBe('cdl-calculadora-v5-data');
  });

  test('deve carregar dados padrão quando localStorage está vazio', () => {
    const dm = new DataManager();
    expect(dm.dados.salas).toBeDefined();
    expect(dm.dados.extras).toBeDefined();
    expect(dm.dados.funcionarios).toBeDefined();
    expect(Array.isArray(dm.dados.salas)).toBe(true);
    expect(Array.isArray(dm.dados.extras)).toBe(true);
    expect(Array.isArray(dm.dados.funcionarios)).toBe(true);
  });

  test('deve ter dados padrão válidos', () => {
    const dm = new DataManager();
    const dados = dm.obterDadosPadrao();
    
    expect(dados.salas.length).toBeGreaterThan(0);
    expect(dados.extras.length).toBeGreaterThan(0);
    expect(dados.funcionarios.length).toBeGreaterThan(0);
    expect(dados.multiplicadoresTurno).toBeDefined();
  });

  test('deve ter estrutura correta nos dados padrão', () => {
    const dm = new DataManager();
    const dados = dm.obterDadosPadrao();
    
    const sala = dados.salas[0];
    expect(sala).toHaveProperty('id');
    expect(sala).toHaveProperty('nome');
    expect(sala).toHaveProperty('unidade');
    expect(sala).toHaveProperty('capacidade');
    expect(sala).toHaveProperty('area');
    expect(sala).toHaveProperty('custoBase');
  });

  test('deve ter multiplicadores de turno definidos', () => {
    const dm = new DataManager();
    const dados = dm.obterDadosPadrao();
    
    expect(dados.multiplicadoresTurno).toHaveProperty('manha');
    expect(dados.multiplicadoresTurno).toHaveProperty('tarde');
    expect(dados.multiplicadoresTurno).toHaveProperty('noite');
  });
});

describe('DataManager - LocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('deve salvar dados no localStorage', () => {
    const dm = new DataManager();
    const result = dm.salvarDados();
    
    expect(result).toBe(true);
    expect(localStorage.getItem(dm.storageKey)).not.toBeNull();
  });

  test('deve recuperar dados do localStorage', () => {
    const dm1 = new DataManager();
    dm1.dados.salas.push({
      id: 999,
      nome: 'Sala Teste',
      unidade: 'TESTE',
      capacidade: 50,
      area: 100,
      custoBase: 50
    });
    dm1.salvarDados();

    const dm2 = new DataManager();
    const salaRecuperada = dm2.obterSalaPorId(999);
    
    expect(salaRecuperada).toBeDefined();
    expect(salaRecuperada.nome).toBe('Sala Teste');
  });

  test('deve limpar localStorage', () => {
    const dm = new DataManager();
    dm.salvarDados();
    
    expect(localStorage.getItem(dm.storageKey)).not.toBeNull();
    
    localStorage.clear();
    expect(localStorage.getItem(dm.storageKey)).toBeNull();
  });

  test('deve lidar com dados corrompidos no localStorage', () => {
    localStorage.setItem('cdl-calculadora-v5-data', 'dados-invalidos');
    
    const dm = new DataManager();
    // Deve retornar dados padrão quando dados estão corrompidos
    expect(dm.dados.salas).toBeDefined();
    expect(Array.isArray(dm.dados.salas)).toBe(true);
  });

  test('deve validar estrutura básica ao carregar', () => {
    localStorage.setItem('cdl-calculadora-v5-data', JSON.stringify({
      salas: [],
      extras: [],
      funcionarios: []
    }));
    
    const dm = new DataManager();
    expect(dm.dados.salas).toBeDefined();
    expect(dm.dados.extras).toBeDefined();
    expect(dm.dados.funcionarios).toBeDefined();
  });
});

describe('DataManager - CRUD Salas', () => {
  let dm;

  beforeEach(() => {
    localStorage.clear();
    dm = new DataManager();
  });

  test('deve obter todas as salas', () => {
    const salas = dm.obterSalas();
    expect(Array.isArray(salas)).toBe(true);
    expect(salas.length).toBeGreaterThan(0);
  });

  test('deve obter sala por ID', () => {
    const salas = dm.obterSalas();
    const primeiroId = salas[0].id;
    const sala = dm.obterSalaPorId(primeiroId);
    
    expect(sala).toBeDefined();
    expect(sala.id).toBe(primeiroId);
  });

  test('deve retornar undefined para ID inválido', () => {
    const sala = dm.obterSalaPorId(99999);
    expect(sala).toBeUndefined();
  });

  test('deve adicionar nova sala', () => {
    const quantidadeInicial = dm.obterSalas().length;
    
    const novaSala = dm.adicionarSala({
      nome: 'Sala Nova',
      unidade: 'TESTE',
      capacidade: 100,
      area: 200,
      custoBase: 75
    });
    
    expect(novaSala).toBeDefined();
    expect(novaSala.id).toBeDefined();
    expect(novaSala.nome).toBe('Sala Nova');
    expect(dm.obterSalas().length).toBe(quantidadeInicial + 1);
  });

  test('deve gerar ID único ao adicionar sala', () => {
    const sala1 = dm.adicionarSala({
      nome: 'Sala 1',
      unidade: 'TESTE',
      capacidade: 50,
      area: 100,
      custoBase: 50
    });
    
    const sala2 = dm.adicionarSala({
      nome: 'Sala 2',
      unidade: 'TESTE',
      capacidade: 60,
      area: 110,
      custoBase: 60
    });
    
    expect(sala1.id).not.toBe(sala2.id);
  });

  test('deve atualizar sala existente', () => {
    const sala = dm.obterSalas()[0];
    const idOriginal = sala.id;
    
    const result = dm.atualizarSala(idOriginal, {
      nome: 'Nome Atualizado',
      capacidade: 999
    });
    
    expect(result).toBe(true);
    
    const salaAtualizada = dm.obterSalaPorId(idOriginal);
    expect(salaAtualizada.nome).toBe('Nome Atualizado');
    expect(salaAtualizada.capacidade).toBe(999);
  });

  test('não deve atualizar sala inexistente', () => {
    const result = dm.atualizarSala(99999, { nome: 'Teste' });
    expect(result).toBe(false);
  });

  test('deve remover sala', () => {
    const sala = dm.obterSalas()[0];
    const id = sala.id;
    const quantidadeInicial = dm.obterSalas().length;
    
    const result = dm.removerSala(id);
    
    expect(result).toBe(true);
    expect(dm.obterSalas().length).toBe(quantidadeInicial - 1);
    expect(dm.obterSalaPorId(id)).toBeUndefined();
  });

  test('não deve remover sala inexistente', () => {
    const result = dm.removerSala(99999);
    expect(result).toBe(false);
  });

  test('deve converter capacidade e area para números', () => {
    const novaSala = dm.adicionarSala({
      nome: 'Sala Teste',
      unidade: 'TESTE',
      capacidade: '100',
      area: '200.5',
      custoBase: '75.50'
    });
    
    expect(typeof novaSala.capacidade).toBe('number');
    expect(typeof novaSala.area).toBe('number');
    expect(typeof novaSala.custoBase).toBe('number');
  });
});

describe('DataManager - CRUD Extras', () => {
  let dm;

  beforeEach(() => {
    localStorage.clear();
    dm = new DataManager();
  });

  test('deve obter todos os extras', () => {
    const extras = dm.obterExtras();
    expect(Array.isArray(extras)).toBe(true);
    expect(extras.length).toBeGreaterThan(0);
  });

  test('deve obter extra por ID', () => {
    const extras = dm.obterExtras();
    const primeiroId = extras[0].id;
    const extra = dm.obterExtraPorId(primeiroId);
    
    expect(extra).toBeDefined();
    expect(extra.id).toBe(primeiroId);
  });

  test('deve retornar undefined para ID de extra inválido', () => {
    const extra = dm.obterExtraPorId(99999);
    expect(extra).toBeUndefined();
  });

  test('deve adicionar novo item extra', () => {
    const quantidadeInicial = dm.obterExtras().length;
    
    const novoExtra = dm.adicionarExtra({
      nome: 'Item Teste',
      custo: 25.50
    });
    
    expect(novoExtra).toBeDefined();
    expect(novoExtra.id).toBeDefined();
    expect(novoExtra.nome).toBe('Item Teste');
    expect(novoExtra.custo).toBe(25.50);
    expect(dm.obterExtras().length).toBe(quantidadeInicial + 1);
  });

  test('deve gerar ID único ao adicionar extra', () => {
    const extra1 = dm.adicionarExtra({ nome: 'Extra 1', custo: 10 });
    const extra2 = dm.adicionarExtra({ nome: 'Extra 2', custo: 20 });
    
    expect(extra1.id).not.toBe(extra2.id);
  });

  test('deve atualizar extra existente', () => {
    const extra = dm.obterExtras()[0];
    const idOriginal = extra.id;
    
    const result = dm.atualizarExtra(idOriginal, {
      nome: 'Nome Atualizado',
      custo: 99.99
    });
    
    expect(result).toBe(true);
    
    const extraAtualizado = dm.obterExtraPorId(idOriginal);
    expect(extraAtualizado.nome).toBe('Nome Atualizado');
    expect(extraAtualizado.custo).toBe(99.99);
  });

  test('não deve atualizar extra inexistente', () => {
    const result = dm.atualizarExtra(99999, { nome: 'Teste' });
    expect(result).toBe(false);
  });

  test('deve remover extra', () => {
    const extra = dm.obterExtras()[0];
    const id = extra.id;
    const quantidadeInicial = dm.obterExtras().length;
    
    const result = dm.removerExtra(id);
    
    expect(result).toBe(true);
    expect(dm.obterExtras().length).toBe(quantidadeInicial - 1);
    expect(dm.obterExtraPorId(id)).toBeUndefined();
  });

  test('não deve remover extra inexistente', () => {
    const result = dm.removerExtra(99999);
    expect(result).toBe(false);
  });

  test('deve converter custo para número', () => {
    const novoExtra = dm.adicionarExtra({
      nome: 'Extra Teste',
      custo: '45.75'
    });
    
    expect(typeof novoExtra.custo).toBe('number');
    expect(novoExtra.custo).toBe(45.75);
  });
});

describe('DataManager - CRUD Funcionários', () => {
  let dm;

  beforeEach(() => {
    localStorage.clear();
    dm = new DataManager();
  });

  test('deve obter todos os funcionários', () => {
    const funcionarios = dm.obterFuncionarios();
    expect(Array.isArray(funcionarios)).toBe(true);
    expect(funcionarios.length).toBeGreaterThan(0);
  });

  test('deve obter apenas funcionários ativos', () => {
    const funcionarios = dm.obterFuncionariosAtivos();
    expect(Array.isArray(funcionarios)).toBe(true);
    funcionarios.forEach(func => {
      expect(func.ativo).toBe(true);
    });
  });

  test('deve obter funcionário por ID', () => {
    const funcionarios = dm.obterFuncionarios();
    const primeiroId = funcionarios[0].id;
    const funcionario = dm.obterFuncionarioPorId(primeiroId);
    
    expect(funcionario).toBeDefined();
    expect(funcionario.id).toBe(primeiroId);
  });

  test('deve retornar undefined para ID de funcionário inválido', () => {
    const funcionario = dm.obterFuncionarioPorId(99999);
    expect(funcionario).toBeUndefined();
  });

  test('deve adicionar novo funcionário', () => {
    const quantidadeInicial = dm.obterFuncionarios().length;
    
    const novoFunc = dm.adicionarFuncionario({
      nome: 'João Silva',
      horaNormal: 15.50,
      he50: 23.25,
      he100: 31.00,
      valeTransporte: 5.50,
      transporteApp: 10.00,
      refeicao: 20.00
    });
    
    expect(novoFunc).toBeDefined();
    expect(novoFunc.id).toBeDefined();
    expect(novoFunc.nome).toBe('João Silva');
    expect(novoFunc.ativo).toBe(true);
    expect(dm.obterFuncionarios().length).toBe(quantidadeInicial + 1);
  });

  test('deve definir valores padrão ao adicionar funcionário', () => {
    const novoFunc = dm.adicionarFuncionario({
      nome: 'Maria Santos',
      horaNormal: 15.00,
      he50: 22.50,
      he100: 30.00,
      valeTransporte: 5.00
    });
    
    expect(novoFunc.transporteApp).toBe(0);
    expect(novoFunc.refeicao).toBe(0);
    expect(novoFunc.ativo).toBe(true);
  });

  test('deve atualizar funcionário existente', () => {
    const funcionario = dm.obterFuncionarios()[0];
    const idOriginal = funcionario.id;
    
    const result = dm.atualizarFuncionario(idOriginal, {
      nome: 'Nome Atualizado',
      horaNormal: 99.99
    });
    
    expect(result).toBe(true);
    
    const funcAtualizado = dm.obterFuncionarioPorId(idOriginal);
    expect(funcAtualizado.nome).toBe('Nome Atualizado');
    expect(funcAtualizado.horaNormal).toBe(99.99);
  });

  test('não deve atualizar funcionário inexistente', () => {
    const result = dm.atualizarFuncionario(99999, { nome: 'Teste' });
    expect(result).toBe(false);
  });

  test('deve desativar funcionário', () => {
    const funcionario = dm.obterFuncionarios()[0];
    const id = funcionario.id;
    
    const result = dm.desativarFuncionario(id);
    
    expect(result).toBe(true);
    
    const funcDesativado = dm.obterFuncionarioPorId(id);
    expect(funcDesativado.ativo).toBe(false);
  });

  test('não deve desativar funcionário inexistente', () => {
    const result = dm.desativarFuncionario(99999);
    expect(result).toBe(false);
  });

  test('deve reativar funcionário', () => {
    const funcionario = dm.obterFuncionarios()[0];
    const id = funcionario.id;
    
    dm.desativarFuncionario(id);
    const result = dm.reativarFuncionario(id);
    
    expect(result).toBe(true);
    
    const funcReativado = dm.obterFuncionarioPorId(id);
    expect(funcReativado.ativo).toBe(true);
  });

  test('deve converter valores numéricos ao adicionar funcionário', () => {
    const novoFunc = dm.adicionarFuncionario({
      nome: 'Teste',
      horaNormal: '15.50',
      he50: '23.25',
      he100: '31.00',
      valeTransporte: '5.50',
      transporteApp: '10.00',
      refeicao: '20.00'
    });
    
    expect(typeof novoFunc.horaNormal).toBe('number');
    expect(typeof novoFunc.he50).toBe('number');
    expect(typeof novoFunc.he100).toBe('number');
    expect(typeof novoFunc.valeTransporte).toBe('number');
  });
});

describe('DataManager - Multiplicadores de Turno', () => {
  let dm;

  beforeEach(() => {
    localStorage.clear();
    dm = new DataManager();
  });

  test('deve obter multiplicadores de turno', () => {
    const multiplicadores = dm.obterMultiplicadoresTurno();
    
    expect(multiplicadores).toBeDefined();
    expect(multiplicadores.manha).toBeDefined();
    expect(multiplicadores.tarde).toBeDefined();
    expect(multiplicadores.noite).toBeDefined();
  });

  test('multiplicadores devem ser números positivos', () => {
    const multiplicadores = dm.obterMultiplicadoresTurno();
    
    expect(typeof multiplicadores.manha).toBe('number');
    expect(typeof multiplicadores.tarde).toBe('number');
    expect(typeof multiplicadores.noite).toBe('number');
    expect(multiplicadores.manha).toBeGreaterThan(0);
    expect(multiplicadores.tarde).toBeGreaterThan(0);
    expect(multiplicadores.noite).toBeGreaterThan(0);
  });

  test('deve atualizar multiplicadores de turno', () => {
    const novosMultiplicadores = {
      manha: 1.5,
      tarde: 2.0,
      noite: 2.5
    };
    
    const result = dm.atualizarMultiplicadoresTurno(novosMultiplicadores);
    
    expect(result).toBe(true);
    
    const multiplicadores = dm.obterMultiplicadoresTurno();
    expect(multiplicadores.manha).toBe(1.5);
    expect(multiplicadores.tarde).toBe(2.0);
    expect(multiplicadores.noite).toBe(2.5);
  });
});

describe('DataManager - Exportar/Importar', () => {
  let dm;

  beforeEach(() => {
    localStorage.clear();
    dm = new DataManager();
  });

  test('deve exportar dados completos', () => {
    const dadosExportados = dm.exportarDados();
    
    expect(dadosExportados).toBeDefined();
    expect(dadosExportados.salas).toBeDefined();
    expect(dadosExportados.extras).toBeDefined();
    expect(dadosExportados.funcionarios).toBeDefined();
  });

  test('dados exportados devem ser serializáveis', () => {
    const dadosExportados = dm.exportarDados();
    const json = JSON.stringify(dadosExportados);
    const parsed = JSON.parse(json);
    
    expect(parsed).toEqual(dadosExportados);
  });

  test('deve importar dados válidos', () => {
    const dadosParaImportar = {
      salas: [
        {
          id: 1,
          nome: 'Sala Importada',
          unidade: 'TESTE',
          capacidade: 50,
          area: 100,
          custoBase: 50
        }
      ],
      extras: [
        {
          id: 1,
          nome: 'Extra Importado',
          custo: 25
        }
      ],
      funcionarios: [
        {
          id: 1,
          nome: 'Funcionário Importado',
          horaNormal: 15,
          he50: 22.5,
          he100: 30,
          valeTransporte: 5,
          transporteApp: 0,
          refeicao: 0,
          ativo: true
        }
      ],
      multiplicadoresTurno: {
        manha: 1.0,
        tarde: 1.15,
        noite: 1.40
      }
    };
    
    const result = dm.importarDados(dadosParaImportar);
    
    expect(result).toBe(true);
    expect(dm.obterSalas()[0].nome).toBe('Sala Importada');
    expect(dm.obterExtras()[0].nome).toBe('Extra Importado');
  });

  test('não deve importar dados inválidos', () => {
    const dadosInvalidos = { invalido: true };
    const result = dm.importarDados(dadosInvalidos);
    
    expect(result).toBe(false);
  });
});

describe('DataManager - Migração de Dados', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('deve migrar dados antigos com custosFuncionario', () => {
    const dadosAntigos = {
      salas: [],
      extras: [],
      custosFuncionario: {
        horaNormal: 15.00,
        he50: 22.50,
        he100: 30.00,
        valeTransporte: 5.00
      },
      multiplicadoresTurno: {
        manha: 1.0,
        tarde: 1.15,
        noite: 1.40
      }
    };
    
    localStorage.setItem('cdl-calculadora-v5-data', JSON.stringify(dadosAntigos));
    
    const dm = new DataManager();
    
    expect(dm.dados.funcionarios).toBeDefined();
    expect(dm.dados.funcionarios.length).toBe(1);
    expect(dm.dados.funcionarios[0].nome).toBe('Funcionário Padrão');
    expect(dm.dados.funcionarios[0].horaNormal).toBe(15.00);
  });

  test('deve adicionar campos novos em funcionários existentes', () => {
    const dadosSemCamposNovos = {
      salas: [],
      extras: [],
      funcionarios: [
        {
          id: 1,
          nome: 'Funcionário Antigo',
          horaNormal: 15.00,
          he50: 22.50,
          he100: 30.00,
          valeTransporte: 5.00,
          ativo: true
        }
      ],
      multiplicadoresTurno: {
        manha: 1.0,
        tarde: 1.15,
        noite: 1.40
      }
    };
    
    localStorage.setItem('cdl-calculadora-v5-data', JSON.stringify(dadosSemCamposNovos));
    
    const dm = new DataManager();
    const funcionario = dm.obterFuncionarios()[0];
    
    expect(funcionario.transporteApp).toBe(0);
    expect(funcionario.refeicao).toBe(0);
  });
});

describe('DataManager - Validações', () => {
  let dm;

  beforeEach(() => {
    localStorage.clear();
    dm = new DataManager();
  });

  test('deve validar estrutura de dados ao salvar', () => {
    expect(dm.dados.salas).toBeDefined();
    expect(dm.dados.extras).toBeDefined();
    expect(dm.dados.funcionarios).toBeDefined();
    expect(dm.dados.multiplicadoresTurno).toBeDefined();
  });

  test('deve garantir IDs únicos em salas', () => {
    const sala1 = dm.adicionarSala({ nome: 'S1', unidade: 'U', capacidade: 10, area: 10, custoBase: 10 });
    const sala2 = dm.adicionarSala({ nome: 'S2', unidade: 'U', capacidade: 20, area: 20, custoBase: 20 });
    const sala3 = dm.adicionarSala({ nome: 'S3', unidade: 'U', capacidade: 30, area: 30, custoBase: 30 });
    
    const ids = [sala1.id, sala2.id, sala3.id];
    const idsUnicos = new Set(ids);
    
    expect(idsUnicos.size).toBe(3);
  });

  test('deve garantir IDs únicos em extras', () => {
    const extra1 = dm.adicionarExtra({ nome: 'E1', custo: 10 });
    const extra2 = dm.adicionarExtra({ nome: 'E2', custo: 20 });
    const extra3 = dm.adicionarExtra({ nome: 'E3', custo: 30 });
    
    const ids = [extra1.id, extra2.id, extra3.id];
    const idsUnicos = new Set(ids);
    
    expect(idsUnicos.size).toBe(3);
  });

  test('deve garantir IDs únicos em funcionários', () => {
    const func1 = dm.adicionarFuncionario({ 
      nome: 'F1', horaNormal: 10, he50: 15, he100: 20, valeTransporte: 5 
    });
    const func2 = dm.adicionarFuncionario({ 
      nome: 'F2', horaNormal: 10, he50: 15, he100: 20, valeTransporte: 5 
    });
    const func3 = dm.adicionarFuncionario({ 
      nome: 'F3', horaNormal: 10, he50: 15, he100: 20, valeTransporte: 5 
    });
    
    const ids = [func1.id, func2.id, func3.id];
    const idsUnicos = new Set(ids);
    
    expect(idsUnicos.size).toBe(3);
  });
});
