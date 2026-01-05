#!/usr/bin/env node

/**
 * Script de Validação SGQ-SECURITY
 * Verifica se a implementação da resolução do erro DECODER está completa
 * 
 * Arquitetura Axioma v5.1.0
 */

const fs = require('fs');
const path = require('path');

const timestamp = () => new Date().toISOString();

console.log('╔══════════════════════════════════════════════════════════════════╗');
console.log('║  SGQ-SECURITY Implementation Validation                         ║');
console.log('║  DECODER Error Resolution - Axioma v5.1.0                       ║');
console.log('╚══════════════════════════════════════════════════════════════════╝');
console.log(`[SGQ-SECURITY] ${timestamp()} - Iniciando validação\n`);

let allChecksPassed = true;

// Check 1: firebase-key-handler.js exists and exports required functions
console.log('1️⃣  Verificando firebase-key-handler.js...');
try {
  // First check if file exists and has valid syntax
  const handlerPath = path.join(__dirname, 'firebase-key-handler.js');
  if (!fs.existsSync(handlerPath)) {
    console.log('   ❌ Arquivo não encontrado');
    allChecksPassed = false;
  } else {
    // Try to require and check exports
    const handler = require('./firebase-key-handler.js');
    const requiredExports = ['getPrivateKey', 'validateEnvironmentVariables', 'getFirebaseCredentials', 'displayConfigurationInfo'];
    
    const missingExports = requiredExports.filter(exp => typeof handler[exp] !== 'function');
    
    if (missingExports.length === 0) {
      console.log(`   ✅ Arquivo existe e exporta todas as funções requeridas`);
      console.log(`   ✅ Exports: ${requiredExports.join(', ')}`);
    } else {
      console.log(`   ❌ Exports ausentes: ${missingExports.join(', ')}`);
      allChecksPassed = false;
    }
  }
} catch (error) {
  if (error.code === 'MODULE_NOT_FOUND') {
    console.log(`   ❌ Erro ao carregar módulo: ${error.message}`);
  } else {
    console.log(`   ❌ Erro de sintaxe ou runtime: ${error.message}`);
  }
  allChecksPassed = false;
}

// Check 2: convert-private-key-to-base64.js exists
console.log('\n2️⃣  Verificando convert-private-key-to-base64.js...');
const convertScriptPath = path.join(__dirname, 'convert-private-key-to-base64.js');
if (fs.existsSync(convertScriptPath)) {
  console.log('   ✅ Script de conversão existe');
  
  // Check if it's executable on Unix-like systems
  // Note: This check is primarily for Unix-like systems
  if (process.platform !== 'win32') {
    const stats = fs.statSync(convertScriptPath);
    const isExecutable = (stats.mode & fs.constants.S_IXUSR) !== 0;
    console.log(`   ${isExecutable ? '✅' : 'ℹ️'} Executável (Unix): ${isExecutable}`);
  }
  
  // Read first few lines to check shebang
  const content = fs.readFileSync(convertScriptPath, 'utf-8');
  const hasShebang = content.startsWith('#!/usr/bin/env node');
  
  console.log(`   ${hasShebang ? '✅' : 'ℹ️'} Shebang presente: ${hasShebang}`);
} else {
  console.log('   ❌ Script não encontrado');
  allChecksPassed = false;
}

// Check 3: verify-auth-setup.js uses firebase-key-handler
console.log('\n3️⃣  Verificando integração em verify-auth-setup.js...');
const verifyAuthPath = path.join(__dirname, 'verify-auth-setup.js');
if (fs.existsSync(verifyAuthPath)) {
  const content = fs.readFileSync(verifyAuthPath, 'utf-8');
  const usesHandler = content.includes("require('./firebase-key-handler')");
  const usesGetCredentials = content.includes('getFirebaseCredentials()');
  
  if (usesHandler && usesGetCredentials) {
    console.log('   ✅ Importa firebase-key-handler');
    console.log('   ✅ Usa getFirebaseCredentials()');
  } else {
    console.log(`   ${usesHandler ? '✅' : '❌'} Importa firebase-key-handler: ${usesHandler}`);
    console.log(`   ${usesGetCredentials ? '✅' : '❌'} Usa getFirebaseCredentials(): ${usesGetCredentials}`);
    allChecksPassed = false;
  }
} else {
  console.log('   ❌ Arquivo não encontrado');
  allChecksPassed = false;
}

// Check 4: setup-developer-user.js uses firebase-key-handler
console.log('\n4️⃣  Verificando integração em setup-developer-user.js...');
const setupUserPath = path.join(__dirname, 'setup-developer-user.js');
if (fs.existsSync(setupUserPath)) {
  const content = fs.readFileSync(setupUserPath, 'utf-8');
  const usesHandler = content.includes("require('./firebase-key-handler')");
  const usesGetCredentials = content.includes('getFirebaseCredentials()');
  
  if (usesHandler && usesGetCredentials) {
    console.log('   ✅ Importa firebase-key-handler');
    console.log('   ✅ Usa getFirebaseCredentials()');
  } else {
    console.log(`   ${usesHandler ? '✅' : '❌'} Importa firebase-key-handler: ${usesHandler}`);
    console.log(`   ${usesGetCredentials ? '✅' : '❌'} Usa getFirebaseCredentials(): ${usesGetCredentials}`);
    allChecksPassed = false;
  }
} else {
  console.log('   ❌ Arquivo não encontrado');
  allChecksPassed = false;
}

// Check 5: Verify SGQ-SECURITY logging with ISO 8601 timestamps
console.log('\n5️⃣  Verificando padrão de logs SGQ-SECURITY...');
const filesToCheck = [
  'firebase-key-handler.js',
  'convert-private-key-to-base64.js',
  'verify-auth-setup.js',
  'setup-developer-user.js'
];

let allHaveProperLogging = true;
filesToCheck.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const hasSGQPrefix = content.includes('[SGQ-SECURITY]');
    const hasISOTimestamp = content.includes('toISOString()');
    
    if (hasSGQPrefix && hasISOTimestamp) {
      console.log(`   ✅ ${file}: Logging conforme`);
    } else {
      console.log(`   ❌ ${file}: Logging não conforme`);
      console.log(`      - [SGQ-SECURITY]: ${hasSGQPrefix ? '✅' : '❌'}`);
      console.log(`      - ISO 8601: ${hasISOTimestamp ? '✅' : '❌'}`);
      allHaveProperLogging = false;
    }
  }
});

if (!allHaveProperLogging) {
  allChecksPassed = false;
}

// Check 6: Documentation exists
console.log('\n6️⃣  Verificando documentação...');
const docs = [
  'SGQ_SECURITY_DECODER_ERROR_RESOLUTION.md',
  'COMANDOS_SGQ_SECURITY.md'
];

docs.forEach(doc => {
  const docPath = path.join(__dirname, doc);
  if (fs.existsSync(docPath)) {
    const stats = fs.statSync(docPath);
    console.log(`   ✅ ${doc} (${stats.size} bytes)`);
  } else {
    console.log(`   ❌ ${doc} não encontrado`);
    allChecksPassed = false;
  }
});

// Check 7: Command documentation includes specific JSON file
console.log('\n7️⃣  Verificando comando para arquivo JSON específico...');
const commandsDocPath = path.join(__dirname, 'COMANDOS_SGQ_SECURITY.md');
if (fs.existsSync(commandsDocPath)) {
  const content = fs.readFileSync(commandsDocPath, 'utf-8');
  const hasSpecificCommand = content.includes('axioma-cdl-manaus-firebase-adminsdk-fbsvc-8e7483fceb.json');
  
  if (hasSpecificCommand) {
    console.log('   ✅ Comando para arquivo específico documentado');
  } else {
    console.log('   ❌ Comando para arquivo específico não encontrado');
    allChecksPassed = false;
  }
} else {
  console.log('   ❌ Documento de comandos não encontrado');
  allChecksPassed = false;
}

// Check 8: Verify Base64 support in handler
console.log('\n8️⃣  Verificando suporte a FIREBASE_PRIVATE_KEY_BASE64...');
try {
  const handlerContent = fs.readFileSync(path.join(__dirname, 'firebase-key-handler.js'), 'utf-8');
  const supportsBase64 = handlerContent.includes('FIREBASE_PRIVATE_KEY_BASE64');
  const hasBase64Decoding = handlerContent.includes('Buffer.from') && handlerContent.includes("'base64'");
  const hasLegacyFallback = handlerContent.includes('FIREBASE_PRIVATE_KEY');
  
  // Note: This is a basic string-based check for validation purposes
  // For production code analysis, consider using AST parsing
  if (supportsBase64 && hasBase64Decoding && hasLegacyFallback) {
    console.log('   ✅ Suporte a FIREBASE_PRIVATE_KEY_BASE64');
    console.log('   ✅ Decodificação Base64 implementada');
    console.log('   ✅ Fallback para formato legacy');
  } else {
    console.log(`   ${supportsBase64 ? '✅' : '❌'} Suporte a FIREBASE_PRIVATE_KEY_BASE64: ${supportsBase64}`);
    console.log(`   ${hasBase64Decoding ? '✅' : '❌'} Decodificação Base64: ${hasBase64Decoding}`);
    console.log(`   ${hasLegacyFallback ? '✅' : '❌'} Fallback legacy: ${hasLegacyFallback}`);
    allChecksPassed = false;
  }
} catch (error) {
  console.log(`   ❌ Erro ao verificar: ${error.message}`);
  allChecksPassed = false;
}

// Check 9: Verify Zero Trust security measures
console.log('\n9️⃣  Verificando medidas de segurança Zero Trust...');
const resolutionDocPath = path.join(__dirname, 'SGQ_SECURITY_DECODER_ERROR_RESOLUTION.md');
if (fs.existsSync(resolutionDocPath)) {
  const content = fs.readFileSync(resolutionDocPath, 'utf-8');
  const hasZeroTrust = content.includes('Zero Trust');
  const hasFileRemoval = content.includes('DELETE') || content.includes('rm');
  const hasVerification = content.includes('npm run verify:auth');
  
  if (hasZeroTrust && hasFileRemoval && hasVerification) {
    console.log('   ✅ Protocolo Zero Trust documentado');
    console.log('   ✅ Instruções de remoção de arquivos');
    console.log('   ✅ Processo de verificação');
  } else {
    console.log(`   ${hasZeroTrust ? '✅' : '❌'} Protocolo Zero Trust: ${hasZeroTrust}`);
    console.log(`   ${hasFileRemoval ? '✅' : '❌'} Remoção de arquivos: ${hasFileRemoval}`);
    console.log(`   ${hasVerification ? '✅' : '❌'} Processo de verificação: ${hasVerification}`);
    allChecksPassed = false;
  }
} else {
  console.log('   ❌ Documento de resolução não encontrado');
  allChecksPassed = false;
}

// Summary
console.log('\n═══════════════════════════════════════════════════════════════════');
console.log('RESULTADO DA VALIDAÇÃO');
console.log('═══════════════════════════════════════════════════════════════════\n');

if (allChecksPassed) {
  console.log(`[SGQ-SECURITY] ${timestamp()} - ✅ TODAS AS VERIFICAÇÕES PASSARAM`);
  console.log('\n🎉 Implementação completa e conforme aos requisitos SGQ-SECURITY\n');
  console.log('Próximos passos:');
  console.log('  1. Executar: npm run verify:auth');
  console.log('  2. Executar: npm run setup:user');
  console.log('  3. Remover arquivo JSON após validação');
  console.log('');
  process.exit(0);
} else {
  console.log(`[SGQ-SECURITY] ${timestamp()} - ❌ ALGUMAS VERIFICAÇÕES FALHARAM`);
  console.log('\n⚠️  Revise os itens marcados com ❌ acima\n');
  console.log('Documentação:');
  console.log('  - SGQ_SECURITY_DECODER_ERROR_RESOLUTION.md');
  console.log('  - COMANDOS_SGQ_SECURITY.md');
  console.log('');
  process.exit(1);
}
