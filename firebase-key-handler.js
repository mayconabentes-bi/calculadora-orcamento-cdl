/**
 * Firebase Private Key Handler
 * Arquitetura Axioma v5.1.0 - SGQ-SECURITY Zero Trust
 * 
 * Módulo reutilizável para tratamento robusto de chaves privadas Firebase.
 * Suporta:
 * - FIREBASE_PRIVATE_KEY_BASE64 (Base64 encoding - recomendado)
 * - FIREBASE_PRIVATE_KEY (formato legacy com \n)
 * 
 * @module firebase-key-handler
 */

/**
 * Decodifica e retorna a chave privada Firebase do ambiente
 * 
 * Prioridade:
 * 1. FIREBASE_PRIVATE_KEY_BASE64 (se disponível)
 * 2. FIREBASE_PRIVATE_KEY (fallback para compatibilidade)
 * 
 * @returns {string} Chave privada decodificada pronta para uso
 * @throws {Error} Se nenhuma chave privada válida for encontrada
 */
function getPrivateKey() {
  const timestamp = new Date().toISOString();
  
  // Tentar Base64 primeiro (nova abordagem recomendada)
  if (process.env.FIREBASE_PRIVATE_KEY_BASE64) {
    try {
      const decoded = Buffer.from(process.env.FIREBASE_PRIVATE_KEY_BASE64, 'base64').toString('utf-8');
      
      // Validar se a chave decodificada tem o formato esperado
      if (decoded.includes('BEGIN PRIVATE KEY') && decoded.includes('END PRIVATE KEY')) {
        console.log(`[SGQ-SECURITY] ${timestamp} - Using FIREBASE_PRIVATE_KEY_BASE64 (recommended)`);
        return decoded;
      } else {
        console.warn(`[SGQ-SECURITY] ${timestamp} - ⚠️  FIREBASE_PRIVATE_KEY_BASE64 decoded but invalid format`);
      }
    } catch (error) {
      console.warn(`[SGQ-SECURITY] ${timestamp} - ⚠️  Error decoding FIREBASE_PRIVATE_KEY_BASE64:`, error.message);
    }
  }
  
  // Fallback para formato legacy
  if (process.env.FIREBASE_PRIVATE_KEY) {
    console.log(`[SGQ-SECURITY] ${timestamp} - Using FIREBASE_PRIVATE_KEY (legacy format)`);
    console.log(`[SGQ-SECURITY] ${timestamp} - ⚠️  Consider migrating to FIREBASE_PRIVATE_KEY_BASE64`);
    return process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
  }
  
  // Nenhuma chave disponível
  const errorMsg = 'Neither FIREBASE_PRIVATE_KEY_BASE64 nor FIREBASE_PRIVATE_KEY is configured';
  console.error(`[SGQ-SECURITY] ${timestamp} - ❌ ERRO: ${errorMsg}`);
  throw new Error(errorMsg);
}

/**
 * Valida se as variáveis de ambiente obrigatórias estão configuradas
 * 
 * @param {boolean} requirePrivateKey - Se true, valida também a chave privada
 * @returns {Object} Resultado da validação { valid: boolean, missing: string[] }
 */
function validateEnvironmentVariables(requirePrivateKey = true) {
  const timestamp = new Date().toISOString();
  const requiredVars = ['FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL'];
  
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (requirePrivateKey) {
    // Verificar se pelo menos uma forma de chave privada está disponível
    const hasBase64 = !!process.env.FIREBASE_PRIVATE_KEY_BASE64;
    const hasLegacy = !!process.env.FIREBASE_PRIVATE_KEY;
    
    if (!hasBase64 && !hasLegacy) {
      missing.push('FIREBASE_PRIVATE_KEY_BASE64 or FIREBASE_PRIVATE_KEY');
    }
  }
  
  const valid = missing.length === 0;
  
  if (!valid) {
    console.error(`[SGQ-SECURITY] ${timestamp} - ❌ Missing environment variables:`, missing);
  }
  
  return { valid, missing };
}

/**
 * Cria credenciais Firebase Admin a partir das variáveis de ambiente
 * 
 * @returns {Object} Objeto de credenciais pronto para admin.credential.cert()
 * @throws {Error} Se as variáveis de ambiente não estiverem configuradas
 */
function getFirebaseCredentials() {
  const timestamp = new Date().toISOString();
  
  // Validar variáveis de ambiente
  const validation = validateEnvironmentVariables(true);
  if (!validation.valid) {
    throw new Error(`Missing required environment variables: ${validation.missing.join(', ')}`);
  }
  
  // Obter chave privada (com fallback automático)
  const privateKey = getPrivateKey();
  
  const credentials = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: privateKey,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL
  };
  
  console.log(`[SGQ-SECURITY] ${timestamp} - Firebase credentials prepared`);
  console.log(`[SGQ-SECURITY] ${timestamp} - Project: ${credentials.projectId}`);
  console.log(`[SGQ-SECURITY] ${timestamp} - Service Account: ${credentials.clientEmail}`);
  
  return credentials;
}

/**
 * Exibe informações sobre a configuração atual
 */
function displayConfigurationInfo() {
  const timestamp = new Date().toISOString();
  
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('FIREBASE CONFIGURATION STATUS');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('');
  
  const hasBase64 = !!process.env.FIREBASE_PRIVATE_KEY_BASE64;
  const hasLegacy = !!process.env.FIREBASE_PRIVATE_KEY;
  const hasProjectId = !!process.env.FIREBASE_PROJECT_ID;
  const hasClientEmail = !!process.env.FIREBASE_CLIENT_EMAIL;
  
  console.log(`FIREBASE_PROJECT_ID:         ${hasProjectId ? '✅ Configured' : '❌ Missing'}`);
  console.log(`FIREBASE_CLIENT_EMAIL:       ${hasClientEmail ? '✅ Configured' : '❌ Missing'}`);
  console.log(`FIREBASE_PRIVATE_KEY_BASE64: ${hasBase64 ? '✅ Configured (Recommended)' : '⚠️  Not configured'}`);
  console.log(`FIREBASE_PRIVATE_KEY:        ${hasLegacy ? '⚠️  Configured (Legacy)' : '❌ Not configured'}`);
  console.log('');
  
  if (hasBase64 && hasLegacy) {
    console.log('ℹ️  Both key formats detected. FIREBASE_PRIVATE_KEY_BASE64 will be used.');
    console.log('   Consider removing FIREBASE_PRIVATE_KEY from .env');
  } else if (hasLegacy && !hasBase64) {
    console.log('⚠️  Using legacy FIREBASE_PRIVATE_KEY format.');
    console.log('   Recommendation: Migrate to FIREBASE_PRIVATE_KEY_BASE64');
    console.log('   Run: node convert-private-key-to-base64.js');
  } else if (hasBase64) {
    console.log('✅ Using recommended FIREBASE_PRIVATE_KEY_BASE64 format');
  }
  
  console.log('');
  console.log(`[SGQ-SECURITY] ${timestamp}`);
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('');
}

module.exports = {
  getPrivateKey,
  validateEnvironmentVariables,
  getFirebaseCredentials,
  displayConfigurationInfo
};
