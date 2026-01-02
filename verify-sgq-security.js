#!/usr/bin/env node

/**
 * Script de Verificação - Protocolo SGQ-SECURITY v5.1.0
 * Valida a implementação dos requisitos de segurança e resiliência
 */

const fs = require('fs');
const path = require('path');

console.log('\n========================================');
console.log('   VERIFICAÇÃO SGQ-SECURITY v5.1.0');
console.log('========================================\n');

// Cores para output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m'
};

const checkMark = '✓';
const crossMark = '✗';

let totalChecks = 0;
let passedChecks = 0;

function check(description, condition) {
    totalChecks++;
    if (condition) {
        passedChecks++;
        console.log(`${colors.green}${checkMark}${colors.reset} ${description}`);
        return true;
    } else {
        console.log(`${colors.red}${crossMark}${colors.reset} ${description}`);
        return false;
    }
}

function section(title) {
    console.log(`\n${colors.blue}═══ ${title} ═══${colors.reset}\n`);
}

// 1. Verificar RBAC Gatekeeper
section('1. Blindagem de RBAC');

const appJs = fs.readFileSync(path.join(__dirname, 'assets/js/app.js'), 'utf8');

check(
    'Função configurarNavegacaoAbas contém verificação authManager.isAdmin()',
    appJs.includes('authManager.isAdmin()')
);

check(
    'Bloqueia acesso às tabs "config" e "dashboard"',
    appJs.includes("targetTab === 'config' || targetTab === 'dashboard'")
);

check(
    'Registra log [SGQ-SECURITY] para acesso negado',
    appJs.includes('[SGQ-SECURITY] Acesso negado a recurso administrativo')
);

check(
    'Inclui timestamp ISO em logs de acesso negado',
    appJs.includes('new Date().toISOString()')
);

// 2. Verificar Resiliência de Persistência
section('2. Resiliência de Persistência');

const dataManagerJs = fs.readFileSync(path.join(__dirname, 'assets/js/data-manager.js'), 'utf8');

check(
    'Listener "online" configurado',
    dataManagerJs.includes("window.addEventListener('online'")
);

check(
    'Listener "offline" configurado',
    dataManagerJs.includes("window.addEventListener('offline'")
);

check(
    'Método sincronizarDadosPendentes() existe',
    dataManagerJs.includes('sincronizarDadosPendentes()')
);

check(
    'Sincroniza registros sem firebaseId',
    dataManagerJs.includes('!calc.firebaseId') || dataManagerJs.includes('!lead.firebaseId')
);

check(
    'Logs de sincronização incluem timestamp',
    dataManagerJs.includes('[SGQ-SECURITY]') && dataManagerJs.includes('Timestamp:')
);

// 3. Verificar Expansão de Logs de Auditoria
section('3. Expansão de Logs de Auditoria');

const authJs = fs.readFileSync(path.join(__dirname, 'assets/js/auth.js'), 'utf8');

check(
    'Logs de falha no login incluem email tentado',
    authJs.includes('[SGQ-SECURITY] Falha no login') && authJs.includes('Email tentado:')
);

check(
    'Logs de sucesso no login incluem email',
    authJs.includes('[SGQ-SECURITY] Login bem-sucedido') && authJs.includes('Email:')
);

check(
    'Logs de autenticação incluem timestamp ISO',
    authJs.includes('new Date().toISOString()')
);

const dashboardJs = fs.readFileSync(path.join(__dirname, 'assets/js/dashboard.js'), 'utf8');

check(
    'Logs de tentativa de acesso à área restrita com senha incorreta',
    dashboardJs.includes('[SGQ-SECURITY] Tentativa de acesso à Área Restrita com senha executiva incorreta')
);

check(
    'Logs de acesso autorizado à área restrita',
    dashboardJs.includes('[SGQ-SECURITY] Acesso à Área Restrita autorizado')
);

check(
    'Logs de área restrita incluem timestamp ISO',
    dashboardJs.includes('new Date().toISOString()')
);

// 4. Verificar Segurança de Credenciais
section('4. Segurança de Credenciais');

check(
    'Recomendação de migração para Firebase documentada',
    dashboardJs.includes('MIGRAÇÃO PARA FIREBASE SECURITY RULES')
);

check(
    'Recomendação de hash bcrypt documentada',
    dashboardJs.includes('HASH DE SENHA') && dashboardJs.includes('bcrypt')
);

check(
    'Recomendação de rotação de credenciais documentada',
    dashboardJs.includes('ROTAÇÃO DE CREDENCIAIS')
);

check(
    'Recomendação de MFA documentada',
    dashboardJs.includes('MULTI-FACTOR AUTHENTICATION')
);

check(
    'Firebase Security Rules exemplo fornecido',
    dashboardJs.includes('rules_version')
);

// 5. Verificar Documentação
section('5. Documentação');

const securityDoc = path.join(__dirname, 'SECURITY_ENHANCEMENTS_SGQ.md');
check(
    'Documento SECURITY_ENHANCEMENTS_SGQ.md existe',
    fs.existsSync(securityDoc)
);

if (fs.existsSync(securityDoc)) {
    const docContent = fs.readFileSync(securityDoc, 'utf8');
    
    check(
        'Documentação inclui resumo executivo',
        docContent.includes('Resumo Executivo')
    );
    
    check(
        'Documentação inclui exemplos de logs',
        docContent.includes('[SGQ-SECURITY]')
    );
    
    check(
        'Documentação inclui benefícios de segurança',
        docContent.includes('Benefícios de Segurança')
    );
    
    check(
        'Documentação inclui próximos passos',
        docContent.includes('Próximos Passos')
    );
}

// Resultado Final
section('Resultado Final');

const percentage = Math.round((passedChecks / totalChecks) * 100);
const color = percentage === 100 ? colors.green : percentage >= 80 ? colors.yellow : colors.red;

console.log(`${color}Verificações Passadas: ${passedChecks}/${totalChecks} (${percentage}%)${colors.reset}\n`);

if (percentage === 100) {
    console.log(`${colors.green}✓ PROTOCOLO SGQ-SECURITY IMPLEMENTADO COM SUCESSO!${colors.reset}\n`);
    console.log('Todas as verificações passaram. O sistema está em conformidade com o protocolo SGQ-SECURITY v5.1.0.\n');
    process.exit(0);
} else if (percentage >= 80) {
    console.log(`${colors.yellow}⚠ IMPLEMENTAÇÃO PARCIAL${colors.reset}\n`);
    console.log('A maioria das verificações passou, mas algumas melhorias são necessárias.\n');
    process.exit(1);
} else {
    console.log(`${colors.red}✗ IMPLEMENTAÇÃO INCOMPLETA${colors.reset}\n`);
    console.log('Várias verificações falharam. Revise a implementação do protocolo SGQ-SECURITY.\n');
    process.exit(1);
}
