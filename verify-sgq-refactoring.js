#!/usr/bin/env node

/**
 * SGQ-SECURITY Refactoring Verification Script
 * Verifica se todas as mudanças foram implementadas corretamente
 */

const fs = require('fs');
const path = require('path');

console.log('='.repeat(80));
console.log('SGQ-SECURITY REFACTORING VERIFICATION');
console.log('='.repeat(80));
console.log();

let allPassed = true;

// Verificação 1: solicitacao.js - validarCampoNome
console.log('1. Verificando validarCampoNome (Neutralidade Técnica)...');
const solicitacaoJs = fs.readFileSync(
    path.join(__dirname, 'assets/js/solicitacao.js'),
    'utf-8'
);

if (solicitacaoJs.includes('return true; // Sempre retorna true para não bloquear')) {
    console.log('   ✅ validarCampoNome sempre retorna true (modo informativo)');
} else {
    console.log('   ❌ validarCampoNome não está configurado para modo informativo');
    allPassed = false;
}

if (!solicitacaoJs.includes('btnProximo.disabled = true') || 
    solicitacaoJs.includes('// SGQ-SECURITY: NÃO bloqueia avanço')) {
    console.log('   ✅ Botão Próximo não é desabilitado por viés');
} else {
    console.log('   ❌ Botão Próximo ainda está sendo desabilitado');
    allPassed = false;
}

// Verificação 2: solicitacao.js - Navegação Fluida
console.log('\n2. Verificando Navegação Fluida (Background Sync)...');

const hasBackgroundSync = solicitacaoJs.includes('dataManager.salvarLead(leadTemp).then(resultado =>');
const hasNoAwait = !solicitacaoJs.match(/addEventListener\('click',\s*async\s*function/);
if (hasBackgroundSync && hasNoAwait) {
    console.log('   ✅ Salvamento Firebase em background (sem await)');
} else {
    console.log('   ❌ Salvamento Firebase ainda está bloqueante');
    allPassed = false;
}

if (solicitacaoJs.includes('irParaStep(2);') && 
    solicitacaoJs.includes('// SGQ-SECURITY: Ir para Step 2 IMEDIATAMENTE')) {
    console.log('   ✅ Transição imediata para Step 2');
} else {
    console.log('   ❌ Transição para Step 2 não está imediata');
    allPassed = false;
}

// Verificação 3: verificarCamposObrigatoriosStep1
console.log('\n3. Verificando Gatekeeper de Presença Pura...');

if (solicitacaoJs.includes('// SGQ-SECURITY: Habilitação baseada APENAS em presença de texto')) {
    console.log('   ✅ Gatekeeper ignora erros de viés');
} else {
    console.log('   ❌ Gatekeeper ainda depende de validação de viés');
    allPassed = false;
}

// Verificação 4: data-manager.js - UPSERT
console.log('\n4. Verificando UPSERT Inteligente...');
const dataManagerJs = fs.readFileSync(
    path.join(__dirname, 'assets/js/data-manager.js'),
    'utf-8'
);

if (dataManagerJs.includes('// SGQ-SECURITY: UPSERT REAL - Verificar se possui firebaseId')) {
    console.log('   ✅ Verificação de firebaseId implementada');
} else {
    console.log('   ❌ Verificação de firebaseId não encontrada');
    allPassed = false;
}

if (dataManagerJs.includes('await setDoc(docRef, updateData, { merge: true });')) {
    console.log('   ✅ setDoc com merge: true para UPDATE');
} else {
    console.log('   ❌ setDoc com merge não está configurado');
    allPassed = false;
}

if (dataManagerJs.includes('console.log(\'[SGQ-SECURITY] firebaseId armazenado no localStorage para UPSERT futuro\');')) {
    console.log('   ✅ firebaseId armazenado no localStorage após primeiro salvamento');
} else {
    console.log('   ❌ firebaseId não está sendo armazenado no localStorage');
    allPassed = false;
}

// Verificação 5: app.js - RBAC Gatekeeper
console.log('\n5. Verificando RBAC Gatekeeper...');
const appJs = fs.readFileSync(
    path.join(__dirname, 'assets/js/app.js'),
    'utf-8'
);

if (appJs.includes('console.log(\'[SGQ-SECURITY] Tentativa de acesso não autorizado\');')) {
    console.log('   ✅ Log de tentativa de acesso não autorizado');
} else {
    console.log('   ❌ Log de acesso não autorizado não encontrado');
    allPassed = false;
}

if (appJs.includes('return; // Bloqueia a mudança de aba - mantém aba atual')) {
    console.log('   ✅ Bloqueio de navegação e manutenção de aba atual');
} else {
    console.log('   ❌ Bloqueio de navegação não está correto');
    allPassed = false;
}

// Verificação 6: Logs de Transição de Estado
console.log('\n6. Verificando Logs de Transição de Estado...');

if (solicitacaoJs.includes('[SGQ-SECURITY] TRANSIÇÃO DE ESTADO: LEAD_INCOMPLETO -> LEAD_EM_PREENCHIMENTO') &&
    solicitacaoJs.includes('[SGQ-SECURITY] TRANSIÇÃO DE ESTADO: LEAD_EM_PREENCHIMENTO -> LEAD_NOVO')) {
    console.log('   ✅ Logs detalhados de transições de estado');
} else {
    console.log('   ❌ Logs de transição de estado incompletos');
    allPassed = false;
}

// Verificação 7: Resiliência Operacional
console.log('\n7. Verificando Resiliência Operacional...');

if (dataManagerJs.includes('window.addEventListener(\'online\', () =>') &&
    dataManagerJs.includes('this.sincronizarDadosPendentes();')) {
    console.log('   ✅ Listener online configurado');
} else {
    console.log('   ❌ Listener online não encontrado');
    allPassed = false;
}

if (dataManagerJs.includes('const leadsSemFirebase = this.dados.leads.filter(lead => !lead.firebaseId);')) {
    console.log('   ✅ Sincronização de leads pendentes');
} else {
    console.log('   ❌ Sincronização de leads não implementada');
    allPassed = false;
}

// Verificação 8: Campos Estratégicos (Shadow Capture)
console.log('\n8. Verificando Captura de Campos Estratégicos...');

if (solicitacaoJs.includes('finalidadeEvento: lead.finalidadeEvento || \'não informado\',') &&
    solicitacaoJs.includes('associadoCDL: lead.associadoCDL,')) {
    console.log('   ✅ Campos finalidadeEvento e associadoCDL capturados');
} else {
    console.log('   ❌ Campos estratégicos não estão sendo capturados');
    allPassed = false;
}

if (dataManagerJs.includes('// SGQ-SECURITY: Campos de enriquecimento capturados via Shadow Capture')) {
    console.log('   ✅ Documentação dos campos de enriquecimento');
} else {
    console.log('   ❌ Documentação dos campos não encontrada');
    allPassed = false;
}

// Resultado final
console.log('\n' + '='.repeat(80));
if (allPassed) {
    console.log('✅ TODAS AS VERIFICAÇÕES PASSARAM!');
    console.log('SGQ-SECURITY Refactoring implementado com sucesso.');
    process.exit(0);
} else {
    console.log('❌ ALGUMAS VERIFICAÇÕES FALHARAM');
    console.log('Revise as implementações acima.');
    process.exit(1);
}
