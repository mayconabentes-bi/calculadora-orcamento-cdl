/**
 * Script de Verificação de Saúde do Sistema (System Health Check)
 * Versão 1.0 - Zero Trust com Base64 Support
 * 
 * ✅ Arquitetura Gemini: Credenciais via environment variables
 * ✅ Suporte a FIREBASE_PRIVATE_KEY_BASE64 (recomendado)
 * ✅ Validação de conectividade Firebase
 * ✅ Verificação de coleções críticas
 * 
 * Uso:
 * 1. Certifique-se de que as credenciais estão configuradas no .env
 * 2. Execute: node scripts/system_health_check.js
 * 
 * Verificações realizadas:
 * - Validação de variáveis de ambiente
 * - Conectividade com Firebase
 * - Existência de coleções críticas (espacos, extras, configuracoes)
 * - Contagem de documentos em cada coleção
 */

require('dotenv').config();
const admin = require('firebase-admin');
const { getFirebaseCredentials } = require('../firebase-key-handler');

console.log(`[HEALTH-CHECK] ${new Date().toISOString()} - Iniciando verificação de saúde do sistema`);
console.log('');

// =========================================================================
// VALIDAÇÃO DE AMBIENTE
// =========================================================================

/**
 * Valida variáveis de ambiente obrigatórias
 * @returns {boolean} True se todas as variáveis estão configuradas
 */
function validateEnvironment() {
  const timestamp = new Date().toISOString();
  console.log(`[HEALTH-CHECK] ${timestamp} - 🔐 Validando variáveis de ambiente...`);
  
  const requiredVars = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL'
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  // Check for private key (either format)
  const hasBase64Key = !!process.env.FIREBASE_PRIVATE_KEY_BASE64;
  const hasLegacyKey = !!process.env.FIREBASE_PRIVATE_KEY;
  
  if (!hasBase64Key && !hasLegacyKey) {
    missingVars.push('FIREBASE_PRIVATE_KEY_BASE64 or FIREBASE_PRIVATE_KEY');
  }
  
  if (missingVars.length > 0) {
    console.error(`   ❌ FALHA: Variáveis de ambiente ausentes`);
    missingVars.forEach(varName => {
      console.error(`      ✗ ${varName}`);
    });
    console.log('');
    return false;
  }
  
  console.log(`   ✅ Todas as variáveis de ambiente estão configuradas`);
  console.log('');
  return true;
}

// =========================================================================
// INICIALIZAÇÃO FIREBASE
// =========================================================================

/**
 * Inicializa conexão com Firebase
 * @returns {Object|null} Objeto db do Firestore ou null em caso de erro
 */
function initializeFirebase() {
  const timestamp = new Date().toISOString();
  console.log(`[HEALTH-CHECK] ${timestamp} - 🔌 Conectando ao Firebase...`);
  
  try {
    const credential = getFirebaseCredentials();
    
    admin.initializeApp({
      credential: admin.credential.cert(credential)
    });
    
    console.log(`   ✅ Conectado ao Firebase`);
    console.log(`      Project: ${credential.projectId}`);
    console.log(`      Service Account: ${credential.clientEmail}`);
    console.log('');
    
    return admin.firestore();
  } catch (error) {
    console.error(`   ❌ FALHA: Erro ao conectar ao Firebase`);
    console.error(`      Erro: ${error.message}`);
    console.log('');
    return null;
  }
}

// =========================================================================
// VERIFICAÇÃO DE COLEÇÕES
// =========================================================================

/**
 * Verifica existência e contagem de documentos em uma coleção
 * @param {Object} db - Instância do Firestore
 * @param {string} collectionName - Nome da coleção
 * @returns {Object} Resultado da verificação { exists: boolean, count: number }
 */
async function checkCollection(db, collectionName) {
  const timestamp = new Date().toISOString();
  console.log(`[HEALTH-CHECK] ${timestamp} - 📚 Verificando coleção '${collectionName}'...`);
  
  try {
    const snapshot = await db.collection(collectionName).get();
    const count = snapshot.size;
    
    if (count > 0) {
      console.log(`   ✅ Coleção '${collectionName}' encontrada (${count} documentos)`);
    } else {
      console.log(`   ⚠️  Coleção '${collectionName}' está vazia`);
    }
    console.log('');
    
    return { exists: true, count };
  } catch (error) {
    console.error(`   ❌ FALHA: Erro ao acessar coleção '${collectionName}'`);
    console.error(`      Erro: ${error.message}`);
    console.log('');
    return { exists: false, count: 0, error: error.message };
  }
}

/**
 * Verifica documento específico em uma coleção
 * @param {Object} db - Instância do Firestore
 * @param {string} collectionName - Nome da coleção
 * @param {string} docId - ID do documento
 * @returns {Object} Resultado da verificação { exists: boolean }
 */
async function checkDocument(db, collectionName, docId) {
  const timestamp = new Date().toISOString();
  console.log(`[HEALTH-CHECK] ${timestamp} - 📄 Verificando documento '${collectionName}/${docId}'...`);
  
  try {
    const doc = await db.collection(collectionName).doc(docId).get();
    
    if (doc.exists) {
      console.log(`   ✅ Documento '${collectionName}/${docId}' encontrado`);
    } else {
      console.log(`   ⚠️  Documento '${collectionName}/${docId}' não existe`);
    }
    console.log('');
    
    return { exists: doc.exists };
  } catch (error) {
    console.error(`   ❌ FALHA: Erro ao acessar documento '${collectionName}/${docId}'`);
    console.error(`      Erro: ${error.message}`);
    console.log('');
    return { exists: false, error: error.message };
  }
}

// =========================================================================
// FUNÇÃO PRINCIPAL
// =========================================================================

/**
 * Executa verificação completa de saúde do sistema
 */
async function performHealthCheck() {
  const startTimestamp = new Date().toISOString();
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`[HEALTH-CHECK] ${startTimestamp} - 🏥 INICIANDO HEALTH CHECK`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  
  let allChecksPass = true;
  const results = {
    environment: false,
    firebase: false,
    collections: {}
  };
  
  // 1. Validar ambiente
  results.environment = validateEnvironment();
  if (!results.environment) {
    allChecksPass = false;
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`[HEALTH-CHECK] ${new Date().toISOString()} - ❌ SYSTEM STATUS: CONFIGURATION ERROR`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('💡 Ação necessária: Configure as variáveis de ambiente no arquivo .env');
    console.log('   Execute: cp .env.example .env && node convert-private-key-to-base64.js');
    console.log('');
    process.exit(1);
  }
  
  // 2. Conectar ao Firebase
  const db = initializeFirebase();
  if (!db) {
    allChecksPass = false;
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`[HEALTH-CHECK] ${new Date().toISOString()} - ❌ SYSTEM STATUS: CONNECTION ERROR`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('💡 Ação necessária: Verifique as credenciais Firebase no arquivo .env');
    console.log('');
    process.exit(1);
  }
  results.firebase = true;
  
  // 3. Verificar coleções críticas
  try {
    const espacosResult = await checkCollection(db, 'espacos');
    results.collections.espacos = espacosResult;
    
    const extrasResult = await checkCollection(db, 'extras');
    results.collections.extras = extrasResult;
    
    const configuracoesResult = await checkDocument(db, 'configuracoes', 'multiplicadores');
    results.collections.configuracoes = configuracoesResult;
    
    // Verificar se todas as coleções têm dados
    const hasEspacosError = espacosResult.error || espacosResult.count === 0;
    const hasExtrasError = extrasResult.error || extrasResult.count === 0;
    const hasConfigError = configuracoesResult.error || !configuracoesResult.exists;
    
    if (hasEspacosError || hasExtrasError || hasConfigError) {
      allChecksPass = false;
      console.log('⚠️  Algumas coleções estão vazias, ausentes ou com erros');
      console.log('💡 Ação recomendada: Execute npm run seed:database para popular o banco');
      console.log('');
    }
  } catch (error) {
    allChecksPass = false;
    console.error(`❌ Erro durante verificação de coleções: ${error.message}`);
    console.log('');
  }
  
  // 4. Resumo final
  const endTimestamp = new Date().toISOString();
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  if (allChecksPass) {
    console.log(`[HEALTH-CHECK] ${endTimestamp} - ✅ SYSTEM STATUS: OPERATIONAL`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('📊 RESUMO DA VERIFICAÇÃO:');
    console.log('');
    console.log(`   ✅ Variáveis de ambiente: OK`);
    console.log(`   ✅ Conectividade Firebase: OK`);
    console.log(`   ✅ Coleção 'espacos': ${results.collections.espacos.count} documentos`);
    console.log(`   ✅ Coleção 'extras': ${results.collections.extras.count} documentos`);
    console.log(`   ✅ Configurações: Multiplicadores configurados`);
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 Sistema operacional e pronto para uso!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    
    process.exit(0);
  } else {
    console.log(`[HEALTH-CHECK] ${endTimestamp} - ⚠️  SYSTEM STATUS: DEGRADED`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('📊 RESUMO DA VERIFICAÇÃO:');
    console.log('');
    console.log(`   ${results.environment ? '✅' : '❌'} Variáveis de ambiente`);
    console.log(`   ${results.firebase ? '✅' : '❌'} Conectividade Firebase`);
    
    if (results.collections.espacos) {
      const espacosStatus = results.collections.espacos.error ? '❌' : 
                            results.collections.espacos.count > 0 ? '✅' : '⚠️ ';
      const espacosInfo = results.collections.espacos.error ? 
                          `Erro: ${results.collections.espacos.error}` :
                          `${results.collections.espacos.count} documentos`;
      console.log(`   ${espacosStatus} Coleção 'espacos': ${espacosInfo}`);
    }
    if (results.collections.extras) {
      const extrasStatus = results.collections.extras.error ? '❌' : 
                           results.collections.extras.count > 0 ? '✅' : '⚠️ ';
      const extrasInfo = results.collections.extras.error ? 
                         `Erro: ${results.collections.extras.error}` :
                         `${results.collections.extras.count} documentos`;
      console.log(`   ${extrasStatus} Coleção 'extras': ${extrasInfo}`);
    }
    if (results.collections.configuracoes) {
      const configStatus = results.collections.configuracoes.error ? '❌' :
                           results.collections.configuracoes.exists ? '✅' : '⚠️ ';
      const configInfo = results.collections.configuracoes.error ?
                         `Erro: ${results.collections.configuracoes.error}` :
                         results.collections.configuracoes.exists ? 'Configuradas' : 'Ausentes';
      console.log(`   ${configStatus} Configurações: ${configInfo}`);
    }
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️  Sistema com problemas detectados');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    
    process.exit(1);
  }
}

// Executar o health check
performHealthCheck()
  .catch((error) => {
    const fatalTimestamp = new Date().toISOString();
    console.error(`[HEALTH-CHECK] ${fatalTimestamp} - ❌ Erro fatal não tratado: ${error.message}`);
    console.error(`[HEALTH-CHECK] Stack: ${error.stack}`);
    process.exit(1);
  });
