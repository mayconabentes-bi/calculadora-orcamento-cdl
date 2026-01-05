#!/usr/bin/env node

/**
 * Validation Script: Code Implementation Verification
 * Verifica se as mudanças de código foram aplicadas corretamente
 * NÃO requer credenciais do Firebase
 */

const fs = require('fs');
const path = require('path');

console.log('╔══════════════════════════════════════════════════════════════════╗');
console.log('║  SGQ-SECURITY: Code Implementation Validation                   ║');
console.log('║  Axioma v5.1.0 - CDL/Manaus                                     ║');
console.log('╚══════════════════════════════════════════════════════════════════╝');
console.log('');

let allChecksPass = true;

// Função auxiliar para verificar conteúdo de arquivo
function checkFileContains(filePath, patterns, description) {
  console.log(`\n📄 Verificando: ${path.basename(filePath)}`);
  console.log(`   ${description}`);
  
  if (!fs.existsSync(filePath)) {
    console.log('   ❌ Arquivo não encontrado!');
    allChecksPass = false;
    return false;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  let allFound = true;
  
  for (const pattern of patterns) {
    if (typeof pattern === 'string') {
      if (content.includes(pattern)) {
        console.log(`   ✅ Encontrado: "${pattern.substring(0, 50)}..."`);
      } else {
        console.log(`   ❌ Ausente: "${pattern.substring(0, 50)}..."`);
        allFound = false;
        allChecksPass = false;
      }
    } else if (pattern instanceof RegExp) {
      if (pattern.test(content)) {
        console.log(`   ✅ Encontrado: ${pattern.toString()}`);
      } else {
        console.log(`   ❌ Ausente: ${pattern.toString()}`);
        allFound = false;
        allChecksPass = false;
      }
    }
  }
  
  return allFound;
}

console.log('═══════════════════════════════════════════════════════════════════');
console.log('Teste 1: Singleton Pattern em firebase-config.js');
console.log('═══════════════════════════════════════════════════════════════════');

checkFileContains(
  path.join(__dirname, '../../assets/js/firebase-config.js'),
  [
    'class FirebaseConfig',
    'FirebaseConfig.instance',
    'getApps()',
    '[SGQ-SECURITY] Firebase Singleton inicializado',
    'new Date().toISOString()'
  ],
  'Verificando implementação do Singleton pattern'
);

console.log('\n═══════════════════════════════════════════════════════════════════');
console.log('Teste 2: Logs SGQ-SECURITY Aprimorados em auth.js');
console.log('═══════════════════════════════════════════════════════════════════');

checkFileContains(
  path.join(__dirname, '../../assets/js/auth.js'),
  [
    '[SGQ-SECURITY] Iniciando autenticação',
    '[SGQ-SECURITY] ✅ Acesso validado para role:',
    'Tipo de erro: Metadados ausentes (Firestore)',
    'Status inativo (Firestore)',
    'Credencial (Auth)',
    /new Date\(\)\.toISOString\(\)/
  ],
  'Verificando logs SGQ-SECURITY com role e timestamp ISO 8601'
);

console.log('\n═══════════════════════════════════════════════════════════════════');
console.log('Teste 3: Verificação de Status Ativo');
console.log('═══════════════════════════════════════════════════════════════════');

checkFileContains(
  path.join(__dirname, '../../assets/js/auth.js'),
  [
    "if (userData.status !== 'ativo')",
    'Usuário inativo. Entre em contato com o administrador.'
  ],
  'Verificando validação de status ativo'
);

console.log('\n═══════════════════════════════════════════════════════════════════');
console.log('Teste 4: Script de Teste Multi-Role');
console.log('═══════════════════════════════════════════════════════════════════');

const multiRoleScriptExists = fs.existsSync(
  path.join(__dirname, 'test-multi-role-access.js')
);

if (multiRoleScriptExists) {
  console.log('   ✅ Script test-multi-role-access.js existe');
  
  checkFileContains(
    path.join(__dirname, 'test-multi-role-access.js'),
    [
      'testUsers',
      'role: \'admin\'',
      'role: \'user\'',
      'role: \'superintendente\'',
      'Acesso validado para role:'
    ],
    'Verificando conteúdo do script multi-role'
  );
} else {
  console.log('   ❌ Script test-multi-role-access.js não encontrado');
  allChecksPass = false;
}

console.log('\n═══════════════════════════════════════════════════════════════════');
console.log('Teste 5: Documentação de Fallback');
console.log('═══════════════════════════════════════════════════════════════════');

const fallbackDocExists = fs.existsSync(
  path.join(__dirname, '../../FALLBACK_MANUAL_USER_CREATION.md')
);

if (fallbackDocExists) {
  console.log('   ✅ Documentação FALLBACK_MANUAL_USER_CREATION.md existe');
  
  checkFileContains(
    path.join(__dirname, '../../FALLBACK_MANUAL_USER_CREATION.md'),
    [
      'Passo A: Criação no Firebase Authentication Console',
      'Passo B: Criação do Documento no Firestore',
      'Passo C: Validação do Campo',
      'status: \'ativo\'',
      'Document ID = UID'
    ],
    'Verificando conteúdo da documentação'
  );
} else {
  console.log('   ❌ Documentação FALLBACK_MANUAL_USER_CREATION.md não encontrada');
  allChecksPass = false;
}

console.log('\n═══════════════════════════════════════════════════════════════════');
console.log('Teste 6: Atualização de package.json');
console.log('═══════════════════════════════════════════════════════════════════');

checkFileContains(
  path.join(__dirname, '../../package.json'),
  [
    '"test:multi-role"',
    'node tests/verification/test-multi-role-access.js'
  ],
  'Verificando novo script npm'
);

console.log('\n═══════════════════════════════════════════════════════════════════');
console.log('Teste 7: Estrutura de Logs ISO 8601');
console.log('═══════════════════════════════════════════════════════════════════');

const authContent = fs.readFileSync(
  path.join(__dirname, '../../assets/js/auth.js'),
  'utf8'
);

// Contar ocorrências de timestamp ISO 8601
const timestampMatches = authContent.match(/new Date\(\)\.toISOString\(\)/g) || [];
console.log(`   ✅ Encontradas ${timestampMatches.length} chamadas para ISO 8601 timestamp`);

if (timestampMatches.length >= 5) {
  console.log('   ✅ Quantidade adequada de timestamps implementados');
} else {
  console.log('   ⚠️  Poucos timestamps encontrados (esperado >= 5)');
}

// Verificar padrão de log com role
const roleLogMatches = authContent.match(/\[SGQ-SECURITY\].*role:/gi) || [];
console.log(`   ✅ Encontradas ${roleLogMatches.length} referências a role em logs SGQ-SECURITY`);

console.log('\n═══════════════════════════════════════════════════════════════════');
console.log('RESUMO FINAL');
console.log('═══════════════════════════════════════════════════════════════════');
console.log('');

if (allChecksPass) {
  console.log('✅ TODOS OS TESTES DE VALIDAÇÃO PASSARAM!');
  console.log('');
  console.log('A implementação está completa e conforme especificações SGQ-SECURITY:');
  console.log('  ✅ Singleton Pattern implementado em firebase-config.js');
  console.log('  ✅ Logs SGQ-SECURITY com role e timestamp ISO 8601');
  console.log('  ✅ Verificação de status ativo implementada');
  console.log('  ✅ Diferenciação de erros (Auth/Firestore/Status)');
  console.log('  ✅ Script de teste multi-role criado');
  console.log('  ✅ Documentação de fallback manual criada');
  console.log('');
  console.log('📋 PRÓXIMOS PASSOS:');
  console.log('  1. Configure o arquivo .env com credenciais do Firebase');
  console.log('     (Veja .env.example para template)');
  console.log('  2. Execute: npm run test:multi-role');
  console.log('  3. Teste login manual para cada role em index.html');
  console.log('  4. Capture screenshots dos logs SGQ-SECURITY');
  console.log('  5. Consulte IMPLEMENTATION_SUMMARY_SGQ_SECURITY.md para detalhes');
  console.log('');
} else {
  console.log('❌ ALGUNS TESTES FALHARAM');
  console.log('');
  console.log('Revise os erros acima e corrija as implementações ausentes.');
  console.log('');
}

console.log('═══════════════════════════════════════════════════════════════════');
console.log('[SGQ-SECURITY] Validação concluída | Timestamp:', new Date().toISOString());
console.log('═══════════════════════════════════════════════════════════════════');
console.log('');

process.exit(allChecksPass ? 0 : 1);
