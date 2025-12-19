/**
 * Testes de Integração - Fluxo da Calculadora
 * Testa o fluxo completo de cálculo:
 * - Selecionar espaço → configurar duração → selecionar dias → 
 *   adicionar horários → adicionar mão de obra → adicionar extras → 
 *   calcular → validar resultado
 * - Persistência de dados
 * - Múltiplos cenários
 */

const fs = require('fs');
const path = require('path');

// Carregar código necessário
const dataManagerCode = fs.readFileSync(
  path.join(__dirname, '../../assets/js/data-manager.js'),
  'utf8'
);

eval(dataManagerCode);

// Mock das funções de cálculo (baseadas no app.js)
function calcularValoresCompleto(parametros) {
  const { sala, duracao, duracaoTipo, diasSelecionados, horasPorDia, margem, desconto, funcionarios, extras } = parametros;
  
  const multiplicadores = { manha: 1.0, tarde: 1.15, noite: 1.40 };
  
  // Converter duração para dias
  let duracaoEmDias = duracao;
  if (duracaoTipo === 'meses') {
    duracaoEmDias = duracao * 30;
  }
  
  // Calcular total de dias trabalhados
  const semanas = Math.floor(duracaoEmDias / 7);
  const diasRestantes = duracaoEmDias % 7;
  
  let diasTrabalhadosPorTipo = {
    normais: 0,
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
  
  const diasTotais = diasTrabalhadosPorTipo.normais + diasTrabalhadosPorTipo.sabado + diasTrabalhadosPorTipo.domingo;
  
  const horasNormais = diasTrabalhadosPorTipo.normais * horasPorDia;
  const horasHE50 = diasTrabalhadosPorTipo.sabado * horasPorDia;
  const horasHE100 = diasTrabalhadosPorTipo.domingo * horasPorDia;
  const horasTotais = horasNormais + horasHE50 + horasHE100;
  
  // Calcular custo operacional
  const multiplicadorMedio = (multiplicadores.manha + multiplicadores.tarde + multiplicadores.noite) / 3;
  const custoOperacionalBase = sala.custoBase * multiplicadorMedio * horasTotais;
  
  // Calcular custos de mão de obra
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
  
  // Calcular extras
  let custoExtras = 0;
  extras.forEach(extra => {
    custoExtras += extra.custo * horasTotais;
  });
  
  // Subtotal sem margem
  const subtotalSemMargem = custoOperacionalBase + custoMaoObraTotal + custoValeTransporte + custoTransporteApp + custoRefeicao + custoExtras;
  
  // Aplicar margem
  const valorMargem = subtotalSemMargem * margem;
  const subtotalComMargem = subtotalSemMargem + valorMargem;
  
  // Aplicar desconto
  const valorDesconto = subtotalComMargem * desconto;
  const valorFinal = subtotalComMargem - valorDesconto;
  
  return {
    horasTotais,
    horasNormais,
    horasHE50,
    horasHE100,
    diasTotais,
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

describe('Integração - Fluxo Completo da Calculadora', () => {
  let dm;

  beforeEach(() => {
    localStorage.clear();
    dm = new DataManager();
  });

  test('fluxo 1: cálculo básico para 1 mês, segunda a sexta, 8h/dia', () => {
    // 1. Selecionar espaço
    const salas = dm.obterSalas();
    expect(salas.length).toBeGreaterThan(0);
    const sala = salas[0];
    
    // 2. Configurar duração
    const duracao = 1;
    const duracaoTipo = 'meses';
    
    // 3. Selecionar dias da semana (segunda a sexta)
    const diasSelecionados = [1, 2, 3, 4, 5];
    
    // 4. Adicionar horários
    const horasPorDia = 8;
    
    // 5. Obter funcionários
    const funcionarios = dm.obterFuncionariosAtivos();
    expect(funcionarios.length).toBeGreaterThan(0);
    
    // 6. Extras (nenhum neste caso)
    const extras = [];
    
    // 7. Configurar margem e desconto
    const margem = 0.20; // 20%
    const desconto = 0.05; // 5%
    
    // 8. Calcular
    const resultado = calcularValoresCompleto({
      sala,
      duracao,
      duracaoTipo,
      diasSelecionados,
      horasPorDia,
      margem,
      desconto,
      funcionarios,
      extras
    });
    
    // 9. Validar resultados
    expect(resultado.valorFinal).toBeGreaterThan(0);
    expect(resultado.horasTotais).toBeGreaterThan(0);
    expect(resultado.valorPorHora).toBeGreaterThan(0);
    expect(resultado.custoMaoObraTotal).toBeGreaterThan(0);
    
    // Não deve ter HE (apenas dias úteis)
    expect(resultado.horasHE50).toBe(0);
    expect(resultado.horasHE100).toBe(0);
  });

  test('fluxo 2: cálculo com finais de semana (3 meses, todos os dias)', () => {
    const sala = dm.obterSalas()[0];
    const duracao = 3;
    const duracaoTipo = 'meses';
    const diasSelecionados = [0, 1, 2, 3, 4, 5, 6]; // Todos os dias
    const horasPorDia = 6;
    const funcionarios = dm.obterFuncionariosAtivos();
    const extras = [];
    const margem = 0.25;
    const desconto = 0.10;
    
    const resultado = calcularValoresCompleto({
      sala,
      duracao,
      duracaoTipo,
      diasSelecionados,
      horasPorDia,
      margem,
      desconto,
      funcionarios,
      extras
    });
    
    // Deve ter horas extras (sábados e domingos)
    expect(resultado.horasHE50).toBeGreaterThan(0); // Sábados
    expect(resultado.horasHE100).toBeGreaterThan(0); // Domingos
    expect(resultado.custoMaoObraHE50).toBeGreaterThan(0);
    expect(resultado.custoMaoObraHE100).toBeGreaterThan(0);
  });

  test('fluxo 3: cálculo com extras (6 meses)', () => {
    const sala = dm.obterSalas()[0];
    const duracao = 6;
    const duracaoTipo = 'meses';
    const diasSelecionados = [1, 2, 3, 4, 5];
    const horasPorDia = 8;
    const funcionarios = dm.obterFuncionariosAtivos();
    
    // Adicionar alguns extras
    const extrasDisponiveis = dm.obterExtras();
    const extras = extrasDisponiveis.slice(0, 2); // Pegar os 2 primeiros extras
    
    const margem = 0.20;
    const desconto = 0.00;
    
    const resultado = calcularValoresCompleto({
      sala,
      duracao,
      duracaoTipo,
      diasSelecionados,
      horasPorDia,
      margem,
      desconto,
      funcionarios,
      extras
    });
    
    // Deve ter custo de extras
    expect(resultado.custoExtras).toBeGreaterThan(0);
    expect(resultado.subtotalSemMargem).toBeGreaterThan(resultado.custoOperacionalBase);
  });

  test('fluxo 4: cálculo com margem alta e desconto', () => {
    const sala = dm.obterSalas()[0];
    const duracao = 1;
    const duracaoTipo = 'meses';
    const diasSelecionados = [1, 2, 3, 4, 5];
    const horasPorDia = 8;
    const funcionarios = dm.obterFuncionariosAtivos();
    const extras = [];
    const margem = 0.30; // 30%
    const desconto = 0.15; // 15%
    
    const resultado = calcularValoresCompleto({
      sala,
      duracao,
      duracaoTipo,
      diasSelecionados,
      horasPorDia,
      margem,
      desconto,
      funcionarios,
      extras
    });
    
    // Validar que margem foi aplicada
    expect(resultado.valorMargem).toBeCloseTo(resultado.subtotalSemMargem * margem, 2);
    expect(resultado.subtotalComMargem).toBeCloseTo(resultado.subtotalSemMargem + resultado.valorMargem, 2);
    
    // Validar que desconto foi aplicado
    expect(resultado.valorDesconto).toBeCloseTo(resultado.subtotalComMargem * desconto, 2);
    expect(resultado.valorFinal).toBeCloseTo(resultado.subtotalComMargem - resultado.valorDesconto, 2);
  });

  test('fluxo 5: duração em dias (não meses)', () => {
    const sala = dm.obterSalas()[0];
    const duracao = 15; // 15 dias
    const duracaoTipo = 'dias';
    const diasSelecionados = [1, 2, 3, 4, 5];
    const horasPorDia = 4;
    const funcionarios = dm.obterFuncionariosAtivos();
    const extras = [];
    const margem = 0.20;
    const desconto = 0.05;
    
    const resultado = calcularValoresCompleto({
      sala,
      duracao,
      duracaoTipo,
      diasSelecionados,
      horasPorDia,
      margem,
      desconto,
      funcionarios,
      extras
    });
    
    expect(resultado.horasTotais).toBeGreaterThan(0);
    expect(resultado.valorFinal).toBeGreaterThan(0);
  });
});

describe('Integração - Persistência de Dados', () => {
  let dm;

  beforeEach(() => {
    localStorage.clear();
    dm = new DataManager();
  });

  test('deve persistir dados após cálculo e recarregar', () => {
    const sala = dm.obterSalas()[0];
    const salaId = sala.id;
    
    // Adicionar novo funcionário
    const novoFunc = dm.adicionarFuncionario({
      nome: 'Funcionário Teste',
      horaNormal: 20.00,
      he50: 30.00,
      he100: 40.00,
      valeTransporte: 6.00
    });
    
    // Criar nova instância do DataManager (simula reload da página)
    const dm2 = new DataManager();
    
    // Verificar que dados foram persistidos
    const salaRecuperada = dm2.obterSalaPorId(salaId);
    expect(salaRecuperada).toBeDefined();
    expect(salaRecuperada.id).toBe(salaId);
    
    const funcionarioRecuperado = dm2.obterFuncionarioPorId(novoFunc.id);
    expect(funcionarioRecuperado).toBeDefined();
    expect(funcionarioRecuperado.nome).toBe('Funcionário Teste');
  });

  test('cálculos devem ser consistentes após reload', () => {
    const sala = dm.obterSalas()[0];
    const parametros = {
      sala,
      duracao: 1,
      duracaoTipo: 'meses',
      diasSelecionados: [1, 2, 3, 4, 5],
      horasPorDia: 8,
      margem: 0.20,
      desconto: 0.05,
      funcionarios: dm.obterFuncionariosAtivos(),
      extras: []
    };
    
    const resultado1 = calcularValoresCompleto(parametros);
    
    // Simular reload
    const dm2 = new DataManager();
    const sala2 = dm2.obterSalaPorId(sala.id);
    parametros.sala = sala2;
    parametros.funcionarios = dm2.obterFuncionariosAtivos();
    
    const resultado2 = calcularValoresCompleto(parametros);
    
    // Resultados devem ser idênticos
    expect(resultado2.valorFinal).toBeCloseTo(resultado1.valorFinal, 2);
    expect(resultado2.horasTotais).toBeCloseTo(resultado1.horasTotais, 2);
  });
});

describe('Integração - Cenários Diversos', () => {
  let dm;

  beforeEach(() => {
    localStorage.clear();
    dm = new DataManager();
  });

  test('cenário: apenas finais de semana', () => {
    const sala = dm.obterSalas()[0];
    const resultado = calcularValoresCompleto({
      sala,
      duracao: 1,
      duracaoTipo: 'meses',
      diasSelecionados: [0, 6], // Apenas sábado e domingo
      horasPorDia: 8,
      margem: 0.20,
      desconto: 0.00,
      funcionarios: dm.obterFuncionariosAtivos(),
      extras: []
    });
    
    // Não deve ter horas normais
    expect(resultado.horasNormais).toBe(0);
    // Deve ter apenas HE
    expect(resultado.horasHE50).toBeGreaterThan(0);
    expect(resultado.horasHE100).toBeGreaterThan(0);
  });

  test('cenário: sem margem e sem desconto', () => {
    const sala = dm.obterSalas()[0];
    const resultado = calcularValoresCompleto({
      sala,
      duracao: 1,
      duracaoTipo: 'meses',
      diasSelecionados: [1, 2, 3, 4, 5],
      horasPorDia: 8,
      margem: 0.00,
      desconto: 0.00,
      funcionarios: dm.obterFuncionariosAtivos(),
      extras: []
    });
    
    expect(resultado.valorMargem).toBe(0);
    expect(resultado.valorDesconto).toBe(0);
    expect(resultado.valorFinal).toBe(resultado.subtotalSemMargem);
  });

  test('cenário: múltiplos funcionários', () => {
    // Adicionar mais funcionários
    dm.adicionarFuncionario({
      nome: 'Func 2',
      horaNormal: 18.00,
      he50: 27.00,
      he100: 36.00,
      valeTransporte: 6.00
    });
    
    dm.adicionarFuncionario({
      nome: 'Func 3',
      horaNormal: 22.00,
      he50: 33.00,
      he100: 44.00,
      valeTransporte: 6.00
    });
    
    const sala = dm.obterSalas()[0];
    const funcionarios = dm.obterFuncionariosAtivos();
    expect(funcionarios.length).toBeGreaterThanOrEqual(3);
    
    const resultado = calcularValoresCompleto({
      sala,
      duracao: 1,
      duracaoTipo: 'meses',
      diasSelecionados: [1, 2, 3, 4, 5],
      horasPorDia: 8,
      margem: 0.20,
      desconto: 0.05,
      funcionarios,
      extras: []
    });
    
    // Custo de mão de obra deve ser significativo com 3+ funcionários
    expect(resultado.custoMaoObraTotal).toBeGreaterThan(0);
  });

  test('cenário: período curto (5 dias)', () => {
    const sala = dm.obterSalas()[0];
    const resultado = calcularValoresCompleto({
      sala,
      duracao: 5,
      duracaoTipo: 'dias',
      diasSelecionados: [1, 2, 3, 4, 5],
      horasPorDia: 4,
      margem: 0.15,
      desconto: 0.00,
      funcionarios: dm.obterFuncionariosAtivos(),
      extras: []
    });
    
    expect(resultado.horasTotais).toBeGreaterThan(0);
    expect(resultado.diasTotais).toBeGreaterThan(0);
    expect(resultado.valorFinal).toBeGreaterThan(0);
  });

  test('cenário: período longo (1 ano)', () => {
    const sala = dm.obterSalas()[0];
    const resultado = calcularValoresCompleto({
      sala,
      duracao: 12,
      duracaoTipo: 'meses',
      diasSelecionados: [1, 2, 3, 4, 5],
      horasPorDia: 8,
      margem: 0.20,
      desconto: 0.10,
      funcionarios: dm.obterFuncionariosAtivos(),
      extras: []
    });
    
    // Valores devem ser grandes para 1 ano
    expect(resultado.horasTotais).toBeGreaterThan(1000);
    expect(resultado.valorFinal).toBeGreaterThan(10000);
  });

  test('cenário: todos os extras selecionados', () => {
    const sala = dm.obterSalas()[0];
    const extras = dm.obterExtras(); // Todos os extras
    
    const resultado = calcularValoresCompleto({
      sala,
      duracao: 1,
      duracaoTipo: 'meses',
      diasSelecionados: [1, 2, 3, 4, 5],
      horasPorDia: 8,
      margem: 0.20,
      desconto: 0.00,
      funcionarios: dm.obterFuncionariosAtivos(),
      extras
    });
    
    // Custo de extras deve ser significativo
    expect(resultado.custoExtras).toBeGreaterThan(0);
    expect(resultado.subtotalSemMargem).toBeGreaterThan(
      resultado.custoOperacionalBase + resultado.custoMaoObraTotal
    );
  });
});

describe('Integração - Validações de Negócio', () => {
  let dm;

  beforeEach(() => {
    localStorage.clear();
    dm = new DataManager();
  });

  test('valor final deve sempre ser positivo', () => {
    const sala = dm.obterSalas()[0];
    const resultado = calcularValoresCompleto({
      sala,
      duracao: 1,
      duracaoTipo: 'meses',
      diasSelecionados: [1, 2, 3, 4, 5],
      horasPorDia: 8,
      margem: 0.20,
      desconto: 0.05,
      funcionarios: dm.obterFuncionariosAtivos(),
      extras: []
    });
    
    expect(resultado.valorFinal).toBeGreaterThan(0);
  });

  test('margem deve aumentar o subtotal', () => {
    const sala = dm.obterSalas()[0];
    const resultado = calcularValoresCompleto({
      sala,
      duracao: 1,
      duracaoTipo: 'meses',
      diasSelecionados: [1, 2, 3, 4, 5],
      horasPorDia: 8,
      margem: 0.30,
      desconto: 0.00,
      funcionarios: dm.obterFuncionariosAtivos(),
      extras: []
    });
    
    expect(resultado.subtotalComMargem).toBeGreaterThan(resultado.subtotalSemMargem);
    expect(resultado.valorMargem).toBeGreaterThan(0);
  });

  test('desconto deve reduzir o valor final', () => {
    const sala = dm.obterSalas()[0];
    const resultado = calcularValoresCompleto({
      sala,
      duracao: 1,
      duracaoTipo: 'meses',
      diasSelecionados: [1, 2, 3, 4, 5],
      horasPorDia: 8,
      margem: 0.20,
      desconto: 0.10,
      funcionarios: dm.obterFuncionariosAtivos(),
      extras: []
    });
    
    expect(resultado.valorFinal).toBeLessThan(resultado.subtotalComMargem);
    expect(resultado.valorDesconto).toBeGreaterThan(0);
  });

  test('valor por hora deve ser consistente', () => {
    const sala = dm.obterSalas()[0];
    const resultado = calcularValoresCompleto({
      sala,
      duracao: 1,
      duracaoTipo: 'meses',
      diasSelecionados: [1, 2, 3, 4, 5],
      horasPorDia: 8,
      margem: 0.20,
      desconto: 0.05,
      funcionarios: dm.obterFuncionariosAtivos(),
      extras: []
    });
    
    const valorPorHoraCalculado = resultado.valorFinal / resultado.horasTotais;
    expect(resultado.valorPorHora).toBeCloseTo(valorPorHoraCalculado, 2);
  });
});
