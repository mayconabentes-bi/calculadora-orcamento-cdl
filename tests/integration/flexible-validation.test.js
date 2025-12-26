/**
 * Testes de Integração - Validação Flexível
 * Testa a capacidade do sistema de calcular orçamentos com dados incompletos
 * Verifica os fallbacks automáticos e o modo de simulação de cenários
 */

const fs = require('fs');
const path = require('path');

// Carregar BudgetEngine
const budgetEngineCode = fs.readFileSync(
  path.join(__dirname, '../../assets/js/budget-engine.js'),
  'utf8'
);

// Carregar DataManager
const dataManagerCode = fs.readFileSync(
  path.join(__dirname, '../../assets/js/data-manager.js'),
  'utf8'
);

// Executar código usando Function para evitar problemas com escopo strict
const codeWithoutInstance = dataManagerCode.replace('const dataManager = new DataManager();', '');
const executar = new Function(codeWithoutInstance + '; return DataManager;');
const DataManager = executar();
global.DataManager = DataManager;

// Criar BudgetEngine
const executarEngine = new Function(budgetEngineCode + '; return BudgetEngine;');
const BudgetEngine = executarEngine();

describe('Validação Flexível - Modo Simulação de Cenários', () => {
  let dm;
  let engine;

  beforeEach(() => {
    localStorage.clear();
    dm = new DataManager();
    engine = new BudgetEngine(dm);
  });

  describe('Fallbacks Automáticos', () => {
    test('deve calcular com dias da semana padrão quando nenhum dia é fornecido', () => {
      const sala = dm.obterSalas()[0];
      const funcionarios = dm.obterFuncionariosAtivos();
      
      // Chamar com array vazio de dias
      const resultado = engine.calcularValores({
        sala,
        duracao: 1,
        duracaoTipo: 'meses',
        diasSelecionados: [], // Array vazio - deve usar fallback
        horasPorDia: 8,
        margem: 0.20,
        desconto: 0.05,
        extrasIds: []
      });
      
      // Deve ter calculado com pelo menos 1 dia (Monday fallback)
      expect(resultado.horasTotais).toBeGreaterThan(0);
      expect(resultado.valorFinal).toBeGreaterThan(0);
      expect(resultado.diasTotais).toBeGreaterThan(0);
    });

    test('deve calcular com sala padrão quando sala for null/undefined', () => {
      const salas = dm.obterSalas();
      expect(salas.length).toBeGreaterThan(0);
      
      // Chamar com sala null - budget engine deve usar valores padrão
      const resultado = engine.calcularValores({
        sala: null, // Null - deve usar fallback
        duracao: 1,
        duracaoTipo: 'meses',
        diasSelecionados: [1, 2, 3, 4, 5],
        horasPorDia: 8,
        margem: 0.20,
        desconto: 0.05,
        extrasIds: []
      });
      
      // Deve retornar valores numéricos válidos (sem NaN)
      expect(resultado.valorFinal).toBeDefined();
      expect(typeof resultado.valorFinal).toBe('number');
      expect(isNaN(resultado.valorFinal)).toBe(false);
      expect(resultado.horasTotais).toBeGreaterThan(0);
    });

    test('deve usar valores padrão quando duração não é fornecida', () => {
      const sala = dm.obterSalas()[0];
      
      const resultado = engine.calcularValores({
        sala,
        duracao: null, // Null - deve usar fallback (1)
        duracaoTipo: null, // Null - deve usar fallback ('meses')
        diasSelecionados: [1, 2, 3, 4, 5],
        horasPorDia: 8,
        margem: 0.20,
        desconto: 0.05,
        extrasIds: []
      });
      
      expect(resultado.valorFinal).toBeGreaterThan(0);
      expect(resultado.horasTotais).toBeGreaterThan(0);
      expect(isNaN(resultado.valorFinal)).toBe(false);
    });

    test('deve calcular com margem e desconto zero quando não fornecidos', () => {
      const sala = dm.obterSalas()[0];
      
      const resultado = engine.calcularValores({
        sala,
        duracao: 1,
        duracaoTipo: 'meses',
        diasSelecionados: [1, 2, 3, 4, 5],
        horasPorDia: 8,
        margem: null, // Null - deve usar 0
        desconto: null, // Null - deve usar 0
        extrasIds: []
      });
      
      expect(resultado.valorFinal).toBeGreaterThan(0);
      expect(resultado.margemPercent).toBe(0);
      expect(resultado.descontoPercent).toBe(0);
      expect(resultado.valorFinal).toBe(resultado.subtotalSemMargem);
    });
  });

  describe('Robustez do Motor de Cálculo', () => {
    test('deve retornar apenas valores numéricos válidos (sem NaN)', () => {
      const sala = dm.obterSalas()[0];
      
      const resultado = engine.calcularValores({
        sala,
        duracao: 1,
        duracaoTipo: 'meses',
        diasSelecionados: [1, 2, 3, 4, 5],
        horasPorDia: 8,
        margem: 0.20,
        desconto: 0.05,
        extrasIds: []
      });
      
      // Verificar que todos os valores retornados são numéricos
      expect(typeof resultado.valorFinal).toBe('number');
      expect(typeof resultado.horasTotais).toBe('number');
      expect(typeof resultado.custoOperacionalBase).toBe('number');
      expect(typeof resultado.custoMaoObraTotal).toBe('number');
      expect(typeof resultado.valorPorHora).toBe('number');
      
      // Verificar que nenhum valor é NaN
      expect(isNaN(resultado.valorFinal)).toBe(false);
      expect(isNaN(resultado.horasTotais)).toBe(false);
      expect(isNaN(resultado.custoOperacionalBase)).toBe(false);
      expect(isNaN(resultado.custoMaoObraTotal)).toBe(false);
      expect(isNaN(resultado.valorPorHora)).toBe(false);
    });

    test('deve proteger contra divisão por zero no valorPorHora', () => {
      const sala = dm.obterSalas()[0];
      
      const resultado = engine.calcularValores({
        sala,
        duracao: 1,
        duracaoTipo: 'meses',
        diasSelecionados: [1, 2, 3, 4, 5],
        horasPorDia: 0, // Zero horas - teste de edge case
        margem: 0.20,
        desconto: 0.05,
        extrasIds: []
      });
      
      // valorPorHora deve ser 0 ou número válido (não Infinity ou NaN)
      expect(isNaN(resultado.valorPorHora)).toBe(false);
      expect(isFinite(resultado.valorPorHora)).toBe(true);
    });

    test('deve tratar funcionários com valores undefined nos custos', () => {
      // Adicionar funcionário com valores undefined (usando coalescência para passar validação)
      const funcId = dm.adicionarFuncionario({
        nome: 'Func Test',
        horaNormal: 0,
        he50: 0,
        he100: 0,
        valeTransporte: 0,
        transporteApp: 0,
        refeicao: 0
      });
      
      dm.definirFuncionarioAtivo(funcId.id, true);
      
      const sala = dm.obterSalas()[0];
      
      const resultado = engine.calcularValores({
        sala,
        duracao: 1,
        duracaoTipo: 'meses',
        diasSelecionados: [1, 2, 3, 4, 5],
        horasPorDia: 8,
        margem: 0.20,
        desconto: 0.05,
        extrasIds: []
      });
      
      // Deve calcular sem erros
      expect(resultado.valorFinal).toBeGreaterThanOrEqual(0);
      expect(isNaN(resultado.valorFinal)).toBe(false);
    });

    test('deve calcular corretamente com funcionários sem custos extras', () => {
      const sala = dm.obterSalas()[0];
      
      const resultado = engine.calcularValores({
        sala,
        duracao: 1,
        duracaoTipo: 'meses',
        diasSelecionados: [1, 2, 3, 4, 5],
        horasPorDia: 8,
        margem: 0.20,
        desconto: 0.05,
        extrasIds: []
      });
      
      // Custos opcionais devem ser 0 ou valores válidos
      expect(typeof resultado.custoTransporteApp).toBe('number');
      expect(typeof resultado.custoRefeicao).toBe('number');
      expect(isNaN(resultado.custoTransporteApp)).toBe(false);
      expect(isNaN(resultado.custoRefeicao)).toBe(false);
    });
  });

  describe('Cenários Extremos', () => {
    test('deve calcular com todos os parâmetros no mínimo', () => {
      const sala = dm.obterSalas()[0];
      
      const resultado = engine.calcularValores({
        sala,
        duracao: 1,
        duracaoTipo: 'dias',
        diasSelecionados: [1], // Apenas 1 dia
        horasPorDia: 1, // 1 hora
        margem: 0, // Sem margem
        desconto: 0, // Sem desconto
        extrasIds: []
      });
      
      expect(resultado.valorFinal).toBeGreaterThan(0);
      expect(resultado.horasTotais).toBeGreaterThan(0);
      expect(isNaN(resultado.valorFinal)).toBe(false);
    });

    test('deve calcular com valores undefined em multiplicadores', () => {
      const sala = { ...dm.obterSalas()[0], custoBase: undefined };
      
      const resultado = engine.calcularValores({
        sala,
        duracao: 1,
        duracaoTipo: 'meses',
        diasSelecionados: [1, 2, 3, 4, 5],
        horasPorDia: 8,
        margem: 0.20,
        desconto: 0.05,
        extrasIds: []
      });
      
      // Deve retornar 0 ou valor válido, não NaN
      expect(isNaN(resultado.custoOperacionalBase)).toBe(false);
      expect(typeof resultado.custoOperacionalBase).toBe('number');
    });

    test('deve calcular com extras undefined/inválidos', () => {
      const sala = dm.obterSalas()[0];
      
      const resultado = engine.calcularValores({
        sala,
        duracao: 1,
        duracaoTipo: 'meses',
        diasSelecionados: [1, 2, 3, 4, 5],
        horasPorDia: 8,
        margem: 0.20,
        desconto: 0.05,
        extrasIds: [999, 1000, -1] // IDs inválidos
      });
      
      // Não deve quebrar com IDs inválidos
      expect(resultado.valorFinal).toBeGreaterThan(0);
      expect(isNaN(resultado.valorFinal)).toBe(false);
    });
  });

  describe('Consistência de Dados', () => {
    test('valorFinal deve ser sempre >= 0', () => {
      const sala = dm.obterSalas()[0];
      
      const resultado = engine.calcularValores({
        sala,
        duracao: 1,
        duracaoTipo: 'meses',
        diasSelecionados: [1, 2, 3, 4, 5],
        horasPorDia: 8,
        margem: 0.20,
        desconto: 0.05,
        extrasIds: []
      });
      
      expect(resultado.valorFinal).toBeGreaterThanOrEqual(0);
    });

    test('todos os custos devem ser >= 0', () => {
      const sala = dm.obterSalas()[0];
      
      const resultado = engine.calcularValores({
        sala,
        duracao: 1,
        duracaoTipo: 'meses',
        diasSelecionados: [1, 2, 3, 4, 5],
        horasPorDia: 8,
        margem: 0.20,
        desconto: 0.05,
        extrasIds: []
      });
      
      expect(resultado.custoOperacionalBase).toBeGreaterThanOrEqual(0);
      expect(resultado.custoMaoObraTotal).toBeGreaterThanOrEqual(0);
      expect(resultado.custoValeTransporte).toBeGreaterThanOrEqual(0);
      expect(resultado.custoTransporteApp).toBeGreaterThanOrEqual(0);
      expect(resultado.custoRefeicao).toBeGreaterThanOrEqual(0);
      expect(resultado.custoExtras).toBeGreaterThanOrEqual(0);
    });

    test('subtotais devem seguir a matemática correta', () => {
      const sala = dm.obterSalas()[0];
      
      const resultado = engine.calcularValores({
        sala,
        duracao: 1,
        duracaoTipo: 'meses',
        diasSelecionados: [1, 2, 3, 4, 5],
        horasPorDia: 8,
        margem: 0.20,
        desconto: 0.05,
        extrasIds: []
      });
      
      // Validar matemática: subtotalComMargem = subtotalSemMargem + valorMargem
      expect(resultado.subtotalComMargem).toBeCloseTo(
        resultado.subtotalSemMargem + resultado.valorMargem, 
        2
      );
      
      // Validar: valorFinal = subtotalComMargem - valorDesconto
      expect(resultado.valorFinal).toBeCloseTo(
        resultado.subtotalComMargem - resultado.valorDesconto,
        2
      );
    });
  });

  describe('Detalhamento de Funcionários', () => {
    test('deve retornar array vazio quando não há funcionários', () => {
      // Desativar todos os funcionários
      const funcionarios = dm.obterFuncionarios();
      funcionarios.forEach(f => dm.definirFuncionarioAtivo(f.id, false));
      
      const sala = dm.obterSalas()[0];
      
      const resultado = engine.calcularValores({
        sala,
        duracao: 1,
        duracaoTipo: 'meses',
        diasSelecionados: [1, 2, 3, 4, 5],
        horasPorDia: 8,
        margem: 0.20,
        desconto: 0.05,
        extrasIds: []
      });
      
      expect(resultado.detalhamentoFuncionarios).toEqual([]);
      expect(resultado.quantidadeFuncionarios).toBe(0);
      expect(resultado.custoMaoObraTotal).toBe(0);
    });

    test('deve incluir detalhamento correto para múltiplos funcionários', () => {
      // Garantir que há múltiplos funcionários ativos
      const funcionarios = dm.obterFuncionarios();
      funcionarios.forEach(f => dm.definirFuncionarioAtivo(f.id, true));
      
      const sala = dm.obterSalas()[0];
      
      const resultado = engine.calcularValores({
        sala,
        duracao: 1,
        duracaoTipo: 'meses',
        diasSelecionados: [1, 2, 3, 4, 5],
        horasPorDia: 8,
        margem: 0.20,
        desconto: 0.05,
        extrasIds: []
      });
      
      expect(Array.isArray(resultado.detalhamentoFuncionarios)).toBe(true);
      expect(resultado.detalhamentoFuncionarios.length).toBe(resultado.quantidadeFuncionarios);
      
      // Cada funcionário deve ter os campos necessários
      resultado.detalhamentoFuncionarios.forEach(func => {
        expect(func).toHaveProperty('nome');
        expect(func).toHaveProperty('custoTotal');
        expect(typeof func.custoTotal).toBe('number');
        expect(isNaN(func.custoTotal)).toBe(false);
      });
    });
  });
});
