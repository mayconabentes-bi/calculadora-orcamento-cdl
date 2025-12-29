/**
 * Exemplo de Uso das Novas Funcionalidades Firebase
 * 
 * Este arquivo demonstra como usar os novos métodos Firebase
 * implementados no DataManager.
 */

// ============================================
// EXEMPLO 1: Salvar Lead (Dados do Cliente)
// ============================================

async function exemploSalvarLead() {
    const leadData = {
        nome: "Empresa ABC Ltda",
        email: "contato@empresaabc.com",
        telefone: "(92) 99999-9999",
        cpfCnpj: "12.345.678/0001-99",
        origem: "Website",
        interesse: "Locação de Auditório"
    };
    
    try {
        const leadSalvo = await dataManager.salvarLead(leadData);
        console.log('✅ Lead salvo com sucesso:', leadSalvo.id);
        return leadSalvo;
    } catch (error) {
        console.error('❌ Erro ao salvar lead:', error);
    }
}

// ============================================
// EXEMPLO 2: Adicionar Orçamento ao Firestore
// ============================================

async function exemploAdicionarOrcamento() {
    // Simular dados de um cálculo realizado
    const calculoData = {
        clienteNome: "Empresa XYZ",
        clienteContato: "(92) 98888-8888",
        dataEvento: "2024-06-15",
        sala: {
            id: 1,
            nome: "Auditório",
            unidade: "DJLM"
        },
        duracao: 6,
        duracaoTipo: "meses",
        horarios: [
            { inicio: "08:00", fim: "17:00" }
        ],
        desconto: 0.20,
        resultado: {
            horasTotais: 1440,
            valorFinal: 50000,
            subtotalSemMargem: 35000,
            valorMargem: 10000,
            valorDesconto: 5000,
            custoMaoObraTotal: 15000,
            custoValeTransporte: 5000,
            custoTransporteApp: 0,
            custoRefeicao: 0
        },
        calculoIncompleto: false
    };
    
    try {
        const orcamentoSalvo = await dataManager.adicionarCalculoHistoricoFirestore(calculoData);
        console.log('✅ Orçamento salvo com sucesso:', orcamentoSalvo.id);
        console.log('   Status inicial:', orcamentoSalvo.statusAprovacao);
        return orcamentoSalvo;
    } catch (error) {
        console.error('❌ Erro ao salvar orçamento:', error);
    }
}

// ============================================
// EXEMPLO 3: Listar Orçamentos Pendentes
// ============================================

async function exemploListarPendentes() {
    try {
        const pendentes = await dataManager.obterOrcamentosPendentes();
        console.log(`\n📋 Orçamentos Aguardando Aprovação: ${pendentes.length}`);
        
        pendentes.forEach((orc, index) => {
            console.log(`\n${index + 1}. ID: ${orc.id}`);
            console.log(`   Cliente: ${orc.cliente}`);
            console.log(`   Valor: R$ ${orc.valorFinal.toFixed(2)}`);
            console.log(`   Data: ${new Date(orc.data).toLocaleDateString('pt-BR')}`);
            console.log(`   Espaço: ${orc.sala.unidade} - ${orc.sala.nome}`);
        });
        
        return pendentes;
    } catch (error) {
        console.error('❌ Erro ao listar pendentes:', error);
    }
}

// ============================================
// EXEMPLO 4: Aprovar/Rejeitar Orçamento
// ============================================

async function exemploAprovarOrcamento(orcamentoId) {
    try {
        const sucesso = await dataManager.atualizarStatusOrcamento(
            orcamentoId,
            'APROVADO',
            'Aprovado pela superintendência - Evento estratégico'
        );
        
        if (sucesso) {
            console.log('✅ Orçamento aprovado com sucesso!');
        }
        return sucesso;
    } catch (error) {
        console.error('❌ Erro ao aprovar orçamento:', error);
    }
}

async function exemploRejeitarOrcamento(orcamentoId) {
    try {
        const sucesso = await dataManager.atualizarStatusOrcamento(
            orcamentoId,
            'REJEITADO',
            'Margem insuficiente - Risco financeiro muito alto'
        );
        
        if (sucesso) {
            console.log('✅ Orçamento rejeitado');
        }
        return sucesso;
    } catch (error) {
        console.error('❌ Erro ao rejeitar orçamento:', error);
    }
}

// ============================================
// EXEMPLO 5: Obter Análise (Apenas Aprovados)
// ============================================

async function exemploAnaliseAprovados() {
    try {
        const analytics = await dataManager.obterDadosAnaliticosFirestore();
        
        console.log('\n📊 DASHBOARD EXECUTIVO (Apenas Orçamentos Aprovados)');
        console.log('='.repeat(60));
        
        console.log('\n💰 KPIs Financeiros:');
        console.log(`   Receita Total: R$ ${analytics.kpis.receitaTotal.toFixed(2)}`);
        console.log(`   Receita Confirmada: R$ ${analytics.kpis.receitaConfirmada.toFixed(2)}`);
        console.log(`   Margem Média: ${analytics.kpis.margemMedia.toFixed(2)}%`);
        console.log(`   Ticket Médio: R$ ${analytics.kpis.ticketMedio.toFixed(2)}`);
        
        console.log('\n🏢 Análise por Unidade:');
        Object.keys(analytics.porUnidade).forEach(unidade => {
            const dados = analytics.porUnidade[unidade];
            console.log(`\n   ${unidade}:`);
            console.log(`     Receita: R$ ${dados.receita.toFixed(2)}`);
            console.log(`     Margem Contribuição: R$ ${dados.margemContribuicao.toFixed(2)}`);
            console.log(`     Número de Contratos: ${dados.count}`);
        });
        
        console.log('\n📈 Evolução Mensal (últimos 6 meses):');
        analytics.evolucaoMensal.forEach(mes => {
            console.log(`   ${mes.mes}: R$ ${mes.receita.toFixed(2)} (${mes.count} contratos)`);
        });
        
        return analytics;
    } catch (error) {
        console.error('❌ Erro ao obter análise:', error);
    }
}

// ============================================
// EXEMPLO 6: Workflow Completo
// ============================================

async function exemploWorkflowCompleto() {
    console.log('\n🔄 DEMONSTRAÇÃO DE WORKFLOW COLABORATIVO');
    console.log('='.repeat(60));
    
    // Passo 1: Cliente solicita orçamento
    console.log('\n1️⃣ CLIENTE: Solicitando orçamento...');
    const lead = await exemploSalvarLead();
    
    // Passo 2: Comercial cria orçamento
    console.log('\n2️⃣ COMERCIAL: Criando orçamento...');
    const orcamento = await exemploAdicionarOrcamento();
    
    if (!orcamento) return;
    
    // Passo 3: Superintendência revisa pendentes
    console.log('\n3️⃣ SUPERINTENDÊNCIA: Revisando pendentes...');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simular delay
    const pendentes = await exemploListarPendentes();
    
    // Passo 4: Aprovação
    console.log('\n4️⃣ SUPERINTENDÊNCIA: Aprovando orçamento...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    await exemploAprovarOrcamento(orcamento.id);
    
    // Passo 5: Análise com dados aprovados
    console.log('\n5️⃣ DIRETORIA: Visualizando dashboard...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    await exemploAnaliseAprovados();
    
    console.log('\n✅ WORKFLOW CONCLUÍDO COM SUCESSO!');
}

// ============================================
// EXEMPLO 7: Verificar Firebase
// ============================================

function verificarFirebase() {
    console.log('\n🔍 VERIFICAÇÃO DE CONFIGURAÇÃO FIREBASE');
    console.log('='.repeat(60));
    console.log(`Firebase habilitado: ${dataManager.firebaseEnabled ? '✅ SIM' : '❌ NÃO'}`);
    
    if (!dataManager.firebaseEnabled) {
        console.log('\n⚠️ Firebase não configurado!');
        console.log('📝 Siga as instruções em FIREBASE_MIGRATION_GUIDE.md');
        console.log('   1. Edite assets/js/firebase-config.js');
        console.log('   2. Adicione suas credenciais do Firebase');
        console.log('   3. Recarregue a página');
    } else {
        console.log('\n✅ Firebase configurado corretamente!');
        console.log('🚀 Pronto para usar os métodos Firebase');
    }
}

// ============================================
// EXECUTAR EXEMPLOS (descomente para testar)
// ============================================

// Para testar, descomente as linhas abaixo no console do navegador:

// verificarFirebase();
// exemploSalvarLead();
// exemploAdicionarOrcamento();
// exemploListarPendentes();
// exemploWorkflowCompleto();

// Ou execute o workflow completo:
// exemploWorkflowCompleto();
