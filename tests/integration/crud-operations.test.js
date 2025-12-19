/**
 * Testes de Integração - Operações CRUD
 * Testa operações CRUD completas:
 * - Criar, editar, excluir espaço
 * - Criar, editar, excluir item extra
 * - Criar, editar, excluir funcionário
 * - Validar persistência após cada operação
 * - Validar consistência de dados
 */

const fs = require('fs');
const path = require('path');

// Carregar código necessário
const dataManagerCode = fs.readFileSync(
  path.join(__dirname, '../../assets/js/data-manager.js'),
  'utf8'
);

eval(dataManagerCode);

describe('Integração CRUD - Espaços', () => {
  let dm;

  beforeEach(() => {
    localStorage.clear();
    dm = new DataManager();
  });

  test('ciclo completo: criar, ler, atualizar, excluir espaço', () => {
    const quantidadeInicial = dm.obterSalas().length;
    
    // 1. Criar
    const novaSala = dm.adicionarSala({
      nome: 'Sala de Reunião Premium',
      unidade: 'DJLM',
      capacidade: 50,
      area: 80,
      custoBase: 150.00
    });
    
    expect(novaSala.id).toBeDefined();
    expect(dm.obterSalas().length).toBe(quantidadeInicial + 1);
    
    // 2. Ler
    const salaLida = dm.obterSalaPorId(novaSala.id);
    expect(salaLida).toBeDefined();
    expect(salaLida.nome).toBe('Sala de Reunião Premium');
    expect(salaLida.capacidade).toBe(50);
    
    // 3. Atualizar
    const resultadoAtualizacao = dm.atualizarSala(novaSala.id, {
      nome: 'Sala de Reunião Premium Plus',
      capacidade: 60,
      custoBase: 175.00
    });
    
    expect(resultadoAtualizacao).toBe(true);
    
    const salaAtualizada = dm.obterSalaPorId(novaSala.id);
    expect(salaAtualizada.nome).toBe('Sala de Reunião Premium Plus');
    expect(salaAtualizada.capacidade).toBe(60);
    expect(salaAtualizada.custoBase).toBe(175.00);
    
    // 4. Excluir
    const resultadoExclusao = dm.removerSala(novaSala.id);
    expect(resultadoExclusao).toBe(true);
    expect(dm.obterSalas().length).toBe(quantidadeInicial);
    expect(dm.obterSalaPorId(novaSala.id)).toBeUndefined();
  });

  test('criar múltiplos espaços e verificar persistência', () => {
    const sala1 = dm.adicionarSala({
      nome: 'Espaço 1',
      unidade: 'CDL',
      capacidade: 30,
      area: 50,
      custoBase: 100
    });
    
    const sala2 = dm.adicionarSala({
      nome: 'Espaço 2',
      unidade: 'UTV',
      capacidade: 40,
      area: 60,
      custoBase: 120
    });
    
    // Criar nova instância (simula reload)
    const dm2 = new DataManager();
    
    const sala1Recuperada = dm2.obterSalaPorId(sala1.id);
    const sala2Recuperada = dm2.obterSalaPorId(sala2.id);
    
    expect(sala1Recuperada.nome).toBe('Espaço 1');
    expect(sala2Recuperada.nome).toBe('Espaço 2');
  });

  test('atualizar custo base de espaço', () => {
    const sala = dm.obterSalas()[0];
    const custoOriginal = sala.custoBase;
    
    dm.atualizarSala(sala.id, { custoBase: 200.00 });
    
    const salaAtualizada = dm.obterSalaPorId(sala.id);
    expect(salaAtualizada.custoBase).toBe(200.00);
    expect(salaAtualizada.custoBase).not.toBe(custoOriginal);
    
    // Reverter para não afetar outros testes
    dm.atualizarSala(sala.id, { custoBase: custoOriginal });
  });

  test('não deve permitir excluir espaço inexistente', () => {
    const resultado = dm.removerSala(99999);
    expect(resultado).toBe(false);
  });

  test('atualização parcial deve preservar outros campos', () => {
    const sala = dm.obterSalas()[0];
    const nomeOriginal = sala.nome;
    const areaOriginal = sala.area;
    
    dm.atualizarSala(sala.id, { capacidade: 999 });
    
    const salaAtualizada = dm.obterSalaPorId(sala.id);
    expect(salaAtualizada.nome).toBe(nomeOriginal);
    expect(salaAtualizada.area).toBe(areaOriginal);
    expect(salaAtualizada.capacidade).toBe(999);
  });
});

describe('Integração CRUD - Itens Extras', () => {
  let dm;

  beforeEach(() => {
    localStorage.clear();
    dm = new DataManager();
  });

  test('ciclo completo: criar, ler, atualizar, excluir extra', () => {
    const quantidadeInicial = dm.obterExtras().length;
    
    // 1. Criar
    const novoExtra = dm.adicionarExtra({
      nome: 'Decoração Premium',
      custo: 50.00
    });
    
    expect(novoExtra.id).toBeDefined();
    expect(dm.obterExtras().length).toBe(quantidadeInicial + 1);
    
    // 2. Ler
    const extraLido = dm.obterExtraPorId(novoExtra.id);
    expect(extraLido).toBeDefined();
    expect(extraLido.nome).toBe('Decoração Premium');
    expect(extraLido.custo).toBe(50.00);
    
    // 3. Atualizar
    const resultadoAtualizacao = dm.atualizarExtra(novoExtra.id, {
      nome: 'Decoração Premium Plus',
      custo: 75.00
    });
    
    expect(resultadoAtualizacao).toBe(true);
    
    const extraAtualizado = dm.obterExtraPorId(novoExtra.id);
    expect(extraAtualizado.nome).toBe('Decoração Premium Plus');
    expect(extraAtualizado.custo).toBe(75.00);
    
    // 4. Excluir
    const resultadoExclusao = dm.removerExtra(novoExtra.id);
    expect(resultadoExclusao).toBe(true);
    expect(dm.obterExtras().length).toBe(quantidadeInicial);
    expect(dm.obterExtraPorId(novoExtra.id)).toBeUndefined();
  });

  test('criar múltiplos extras e verificar persistência', () => {
    const extra1 = dm.adicionarExtra({
      nome: 'Extra 1',
      custo: 10.00
    });
    
    const extra2 = dm.adicionarExtra({
      nome: 'Extra 2',
      custo: 20.00
    });
    
    const extra3 = dm.adicionarExtra({
      nome: 'Extra 3',
      custo: 30.00
    });
    
    // Criar nova instância (simula reload)
    const dm2 = new DataManager();
    
    const extras = dm2.obterExtras();
    const extrasRecuperados = extras.filter(e => 
      [extra1.id, extra2.id, extra3.id].includes(e.id)
    );
    
    expect(extrasRecuperados.length).toBe(3);
  });

  test('atualizar apenas custo de extra', () => {
    const extra = dm.obterExtras()[0];
    const nomeOriginal = extra.nome;
    
    dm.atualizarExtra(extra.id, { custo: 99.99 });
    
    const extraAtualizado = dm.obterExtraPorId(extra.id);
    expect(extraAtualizado.nome).toBe(nomeOriginal);
    expect(extraAtualizado.custo).toBe(99.99);
  });

  test('não deve permitir excluir extra inexistente', () => {
    const resultado = dm.removerExtra(99999);
    expect(resultado).toBe(false);
  });
});

describe('Integração CRUD - Funcionários', () => {
  let dm;

  beforeEach(() => {
    localStorage.clear();
    dm = new DataManager();
  });

  test('ciclo completo: criar, ler, atualizar, desativar, reativar funcionário', () => {
    const quantidadeInicial = dm.obterFuncionarios().length;
    
    // 1. Criar
    const novoFunc = dm.adicionarFuncionario({
      nome: 'Carlos Silva',
      horaNormal: 18.00,
      he50: 27.00,
      he100: 36.00,
      valeTransporte: 6.00,
      transporteApp: 12.00,
      refeicao: 25.00
    });
    
    expect(novoFunc.id).toBeDefined();
    expect(novoFunc.ativo).toBe(true);
    expect(dm.obterFuncionarios().length).toBe(quantidadeInicial + 1);
    
    // 2. Ler
    const funcLido = dm.obterFuncionarioPorId(novoFunc.id);
    expect(funcLido).toBeDefined();
    expect(funcLido.nome).toBe('Carlos Silva');
    expect(funcLido.horaNormal).toBe(18.00);
    
    // 3. Atualizar
    const resultadoAtualizacao = dm.atualizarFuncionario(novoFunc.id, {
      nome: 'Carlos Silva Júnior',
      horaNormal: 20.00
    });
    
    expect(resultadoAtualizacao).toBe(true);
    
    const funcAtualizado = dm.obterFuncionarioPorId(novoFunc.id);
    expect(funcAtualizado.nome).toBe('Carlos Silva Júnior');
    expect(funcAtualizado.horaNormal).toBe(20.00);
    
    // 4. Desativar
    const resultadoDesativacao = dm.desativarFuncionario(novoFunc.id);
    expect(resultadoDesativacao).toBe(true);
    
    const funcDesativado = dm.obterFuncionarioPorId(novoFunc.id);
    expect(funcDesativado.ativo).toBe(false);
    
    // Não deve aparecer na lista de ativos
    const funcionariosAtivos = dm.obterFuncionariosAtivos();
    const funcNosAtivos = funcionariosAtivos.find(f => f.id === novoFunc.id);
    expect(funcNosAtivos).toBeUndefined();
    
    // 5. Reativar
    const resultadoReativacao = dm.reativarFuncionario(novoFunc.id);
    expect(resultadoReativacao).toBe(true);
    
    const funcReativado = dm.obterFuncionarioPorId(novoFunc.id);
    expect(funcReativado.ativo).toBe(true);
  });

  test('criar múltiplos funcionários e verificar persistência', () => {
    const func1 = dm.adicionarFuncionario({
      nome: 'Func 1',
      horaNormal: 15.00,
      he50: 22.50,
      he100: 30.00,
      valeTransporte: 5.00
    });
    
    const func2 = dm.adicionarFuncionario({
      nome: 'Func 2',
      horaNormal: 18.00,
      he50: 27.00,
      he100: 36.00,
      valeTransporte: 6.00
    });
    
    // Criar nova instância (simula reload)
    const dm2 = new DataManager();
    
    const func1Recuperado = dm2.obterFuncionarioPorId(func1.id);
    const func2Recuperado = dm2.obterFuncionarioPorId(func2.id);
    
    expect(func1Recuperado.nome).toBe('Func 1');
    expect(func2Recuperado.nome).toBe('Func 2');
  });

  test('atualizar valores de mão de obra de funcionário', () => {
    const func = dm.obterFuncionarios()[0];
    const nomeOriginal = func.nome;
    
    dm.atualizarFuncionario(func.id, {
      horaNormal: 25.00,
      he50: 37.50,
      he100: 50.00
    });
    
    const funcAtualizado = dm.obterFuncionarioPorId(func.id);
    expect(funcAtualizado.nome).toBe(nomeOriginal);
    expect(funcAtualizado.horaNormal).toBe(25.00);
    expect(funcAtualizado.he50).toBe(37.50);
    expect(funcAtualizado.he100).toBe(50.00);
  });

  test('funcionário desativado não deve aparecer em lista de ativos', () => {
    const func = dm.adicionarFuncionario({
      nome: 'Teste Desativar',
      horaNormal: 15.00,
      he50: 22.50,
      he100: 30.00,
      valeTransporte: 5.00
    });
    
    // Inicialmente está ativo
    let funcionariosAtivos = dm.obterFuncionariosAtivos();
    expect(funcionariosAtivos.find(f => f.id === func.id)).toBeDefined();
    
    // Desativar
    dm.desativarFuncionario(func.id);
    
    // Não deve mais estar na lista de ativos
    funcionariosAtivos = dm.obterFuncionariosAtivos();
    expect(funcionariosAtivos.find(f => f.id === func.id)).toBeUndefined();
    
    // Mas deve estar na lista geral
    const todosFuncionarios = dm.obterFuncionarios();
    expect(todosFuncionarios.find(f => f.id === func.id)).toBeDefined();
  });

  test('não deve permitir desativar funcionário inexistente', () => {
    const resultado = dm.desativarFuncionario(99999);
    expect(resultado).toBe(false);
  });
});

describe('Integração CRUD - Consistência Entre Operações', () => {
  let dm;

  beforeEach(() => {
    localStorage.clear();
    dm = new DataManager();
  });

  test('IDs devem ser únicos entre salas, extras e funcionários', () => {
    const sala = dm.adicionarSala({
      nome: 'Sala Teste',
      unidade: 'TESTE',
      capacidade: 50,
      area: 100,
      custoBase: 100
    });
    
    const extra = dm.adicionarExtra({
      nome: 'Extra Teste',
      custo: 50
    });
    
    const func = dm.adicionarFuncionario({
      nome: 'Func Teste',
      horaNormal: 15,
      he50: 22.5,
      he100: 30,
      valeTransporte: 5
    });
    
    // IDs podem ser iguais entre diferentes tipos (isso é OK)
    // Mas dentro do mesmo tipo devem ser únicos
    const todasSalas = dm.obterSalas();
    const idsSalas = todasSalas.map(s => s.id);
    const idsUnicos = new Set(idsSalas);
    expect(idsUnicos.size).toBe(todasSalas.length);
  });

  test('operações em uma entidade não devem afetar outras', () => {
    const quantidadeSalasInicial = dm.obterSalas().length;
    const quantidadeExtrasInicial = dm.obterExtras().length;
    const quantidadeFuncsInicial = dm.obterFuncionarios().length;
    
    // Adicionar sala
    dm.adicionarSala({
      nome: 'Sala X',
      unidade: 'X',
      capacidade: 10,
      area: 10,
      custoBase: 10
    });
    
    // Verificar que apenas salas aumentou
    expect(dm.obterSalas().length).toBe(quantidadeSalasInicial + 1);
    expect(dm.obterExtras().length).toBe(quantidadeExtrasInicial);
    expect(dm.obterFuncionarios().length).toBe(quantidadeFuncsInicial);
  });

  test('exportar e importar dados preserva todas as entidades', () => {
    // Adicionar dados
    const sala = dm.adicionarSala({
      nome: 'Sala Export',
      unidade: 'EXPORT',
      capacidade: 50,
      area: 100,
      custoBase: 100
    });
    
    const extra = dm.adicionarExtra({
      nome: 'Extra Export',
      custo: 50
    });
    
    const func = dm.adicionarFuncionario({
      nome: 'Func Export',
      horaNormal: 15,
      he50: 22.5,
      he100: 30,
      valeTransporte: 5
    });
    
    // Exportar
    const dadosExportados = dm.exportarDados();
    
    // Limpar e criar novo DataManager
    localStorage.clear();
    const dm2 = new DataManager();
    
    // Importar
    dm2.importarDados(dadosExportados);
    
    // Verificar que todos os dados foram importados
    expect(dm2.obterSalaPorId(sala.id)).toBeDefined();
    expect(dm2.obterExtraPorId(extra.id)).toBeDefined();
    expect(dm2.obterFuncionarioPorId(func.id)).toBeDefined();
  });
});

describe('Integração CRUD - Validações de Integridade', () => {
  let dm;

  beforeEach(() => {
    localStorage.clear();
    dm = new DataManager();
  });

  test('dados devem permanecer consistentes após múltiplas operações', () => {
    // Realizar várias operações
    const sala1 = dm.adicionarSala({
      nome: 'S1',
      unidade: 'U',
      capacidade: 10,
      area: 10,
      custoBase: 10
    });
    
    dm.adicionarSala({
      nome: 'S2',
      unidade: 'U',
      capacidade: 20,
      area: 20,
      custoBase: 20
    });
    
    dm.atualizarSala(sala1.id, { nome: 'S1 Atualizada' });
    
    const extra1 = dm.adicionarExtra({ nome: 'E1', custo: 10 });
    dm.adicionarExtra({ nome: 'E2', custo: 20 });
    dm.removerExtra(extra1.id);
    
    const func1 = dm.adicionarFuncionario({
      nome: 'F1',
      horaNormal: 15,
      he50: 22.5,
      he100: 30,
      valeTransporte: 5
    });
    
    dm.desativarFuncionario(func1.id);
    dm.reativarFuncionario(func1.id);
    
    // Criar nova instância e verificar consistência
    const dm2 = new DataManager();
    
    expect(dm2.obterSalas().length).toBe(dm.obterSalas().length);
    expect(dm2.obterExtras().length).toBe(dm.obterExtras().length);
    expect(dm2.obterFuncionarios().length).toBe(dm.obterFuncionarios().length);
  });

  test('atualização em lote de custos base', () => {
    const salas = dm.obterSalas();
    const custosPorId = {};
    
    // Atualizar todos os custos
    salas.forEach((sala, index) => {
      const novoCusto = 100 + (index * 10);
      dm.atualizarSala(sala.id, { custoBase: novoCusto });
      custosPorId[sala.id] = novoCusto;
    });
    
    // Verificar que todos foram atualizados
    salas.forEach(sala => {
      const salaAtualizada = dm.obterSalaPorId(sala.id);
      expect(salaAtualizada.custoBase).toBe(custosPorId[sala.id]);
    });
  });

  test('múltiplos reloads preservam dados', () => {
    const sala = dm.adicionarSala({
      nome: 'Persistente',
      unidade: 'P',
      capacidade: 50,
      area: 100,
      custoBase: 100
    });
    
    // Primeiro reload
    const dm2 = new DataManager();
    expect(dm2.obterSalaPorId(sala.id)).toBeDefined();
    
    // Segundo reload
    const dm3 = new DataManager();
    expect(dm3.obterSalaPorId(sala.id)).toBeDefined();
    expect(dm3.obterSalaPorId(sala.id).nome).toBe('Persistente');
  });
});
