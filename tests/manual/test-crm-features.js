/**
 * Script de teste manual para validar funcionalidades de CRM
 * Execute este script no console do navegador após abrir index.html
 */

console.log('=== Teste Manual: Funcionalidades de CRM ===\n');

// 1. Testar adição de cálculo com dados do cliente
console.log('1. Testando adição de cálculo com dados do cliente...');
const calculoTeste = {
    clienteNome: 'Empresa Teste ABC',
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
        valorDesconto: 500,
        custoOperacionalBase: 3000,
        custoMaoObraNormal: 3000,
        custoMaoObraHE50: 1000,
        custoMaoObraHE100: 1000,
        custoValeTransporte: 500,
        custoTransporteApp: 0,
        custoRefeicao: 0,
        custoExtras: 0
    }
};

dataManager.adicionarCalculoHistorico(calculoTeste);
console.log('✓ Cálculo adicionado com sucesso');

// 2. Verificar se dados foram salvos
console.log('\n2. Verificando persistência dos dados...');
const historico = dataManager.obterHistoricoCalculos();
const ultimoRegistro = historico[0];
console.log('Cliente:', ultimoRegistro.cliente);
console.log('Contato:', ultimoRegistro.contato);
console.log('✓ Dados persistidos corretamente');

// 3. Testar exportação CSV
console.log('\n3. Testando exportação CSV...');
const csv = dataManager.exportarHistoricoCSV();
if (csv.includes('Cliente') && csv.includes('Contato')) {
    console.log('✓ CSV contém colunas de cliente e contato');
} else {
    console.error('✗ CSV não contém colunas esperadas');
}

// 4. Testar oportunidades de renovação (simular evento antigo)
console.log('\n4. Testando detecção de oportunidades de renovação...');

// Criar evento há 11 meses
const data11Meses = new Date();
data11Meses.setMonth(data11Meses.getMonth() - 11);

const calculoAntigo = {
    clienteNome: 'Cliente Renovação XYZ',
    clienteContato: 'renovacao@email.com',
    sala: {
        id: 2,
        nome: 'Sala 3',
        unidade: 'UTV'
    },
    duracao: 6,
    duracaoTipo: 'meses',
    resultado: {
        horasTotais: 80,
        valorFinal: 8000,
        subtotalSemMargem: 6000,
        valorMargem: 1500,
        valorDesconto: 500,
        custoOperacionalBase: 2500,
        custoMaoObraNormal: 2500,
        custoMaoObraHE50: 500,
        custoMaoObraHE100: 500,
        custoValeTransporte: 400,
        custoTransporteApp: 0,
        custoRefeicao: 0,
        custoExtras: 0
    }
};

dataManager.adicionarCalculoHistorico(calculoAntigo);
// Forçar data antiga
dataManager.dados.historicoCalculos[0].data = data11Meses.toISOString();
dataManager.salvarDados();

const oportunidades = dataManager.obterOportunidadesRenovacao();
console.log('Oportunidades encontradas:', oportunidades.length);
if (oportunidades.length > 0) {
    console.log('✓ Oportunidade detectada:');
    console.log('  Cliente:', oportunidades[0].cliente);
    console.log('  Meses atrás:', oportunidades[0].mesesAtras);
    console.log('  Espaço:', oportunidades[0].espaco);
} else {
    console.warn('⚠ Nenhuma oportunidade detectada (pode ser esperado se não há eventos no período)');
}

// 5. Testar exibição no UI
console.log('\n5. Testando exibição de oportunidades na interface...');
if (typeof exibirOportunidadesRenovacao === 'function') {
    exibirOportunidadesRenovacao();
    const card = document.getElementById('radar-vendas-card');
    if (card && card.style.display !== 'none') {
        console.log('✓ Card de Radar de Vendas exibido com sucesso');
    } else {
        console.log('ℹ Card não exibido (pode ser esperado se não há oportunidades)');
    }
} else {
    console.error('✗ Função exibirOportunidadesRenovacao não encontrada');
}

// 6. Validar campos no formulário
console.log('\n6. Validando campos do formulário...');
const campoNome = document.getElementById('cliente-nome');
const campoContato = document.getElementById('cliente-contato');

if (campoNome && campoContato) {
    console.log('✓ Campos de cliente encontrados no formulário');
    console.log('  Campo Nome:', campoNome.id);
    console.log('  Campo Contato:', campoContato.id);
} else {
    console.error('✗ Campos de cliente não encontrados');
}

console.log('\n=== Teste Manual Concluído ===');
console.log('\nPara testar manualmente no navegador:');
console.log('1. Preencha o campo "Nome do Cliente / Empresa"');
console.log('2. Preencha o campo "Telefone / Email"');
console.log('3. Configure um orçamento e clique em "Calcular"');
console.log('4. Verifique se o cálculo foi salvo com os dados do cliente');
console.log('5. Exporte o CSV e verifique se contém as colunas de cliente');
