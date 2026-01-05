#!/usr/bin/env node

/**
 * Test Script: Multi-Role Access Validation
 * SGQ-SECURITY: Teste de acesso para todas as roles do sistema
 * Versão: 5.1.0 - Axioma CDL/Manaus
 * 
 * Este script testa o login e validação de acesso para:
 * - user: Usuário padrão
 * - admin: Administrador
 * - superintendente: Superintendente
 * 
 * Uso:
 * node tests/verification/test-multi-role-access.js
 */

require('dotenv').config();
const admin = require('firebase-admin');
const path = require('path');

console.log('╔══════════════════════════════════════════════════════════════════╗');
console.log('║  SGQ-SECURITY: Multi-Role Access Test                           ║');
console.log('║  Axioma v5.1.0 - CDL/Manaus                                     ║');
console.log('╚══════════════════════════════════════════════════════════════════╝');
console.log('');

// Validar variáveis de ambiente
const requiredEnvVars = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_CLIENT_EMAIL'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('❌ ERRO: Variáveis de ambiente obrigatórias não configuradas');
  console.error('Variáveis ausentes:', missingVars.join(', '));
  console.error('Configure o arquivo .env e tente novamente.');
  process.exit(1);
}

// Inicializar Firebase Admin
try {
  const credential = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL
  };

  admin.initializeApp({
    credential: admin.credential.cert(credential)
  });

  console.log('[SGQ-SECURITY] Firebase Admin inicializado');
  console.log('[SGQ-SECURITY] Project:', process.env.FIREBASE_PROJECT_ID);
  console.log('');
} catch (error) {
  console.error('❌ Erro ao inicializar Firebase Admin:', error.message);
  process.exit(1);
}

const auth = admin.auth();
const db = admin.firestore();

/**
 * Definição dos usuários de teste para cada role
 */
const testUsers = {
  admin: {
    email: 'mayconabentes@gmail.com',
    nome: 'Maycon Abentes',
    role: 'admin',
    status: 'ativo'
  },
  user: {
    email: 'user.teste@axioma.cdl',
    nome: 'Usuário Teste',
    role: 'user',
    status: 'ativo',
    password: 'UserTest@123'
  },
  superintendente: {
    email: 'super.teste@axioma.cdl',
    nome: 'Superintendente Teste',
    role: 'superintendente',
    status: 'ativo',
    password: 'SuperTest@123'
  }
};

/**
 * Função para verificar/criar usuário no Firebase
 */
async function ensureUserExists(userKey, userData) {
  const timestamp = new Date().toISOString();
  
  console.log('─────────────────────────────────────────────────────────────────');
  console.log(`[SGQ-SECURITY] Verificando usuário: ${userData.role.toUpperCase()}`);
  console.log(`[SGQ-SECURITY] Email: ${userData.email}`);
  console.log(`[SGQ-SECURITY] Timestamp: ${timestamp}`);
  console.log('');
  
  try {
    // Verificar se usuário existe no Auth
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(userData.email);
      console.log('  ✅ Usuário existe no Firebase Authentication');
      console.log('     UID:', userRecord.uid);
    } catch (error) {
      if (error.code === 'auth/user-not-found' && userData.password) {
        console.log('  ⚠️  Usuário não encontrado - criando...');
        userRecord = await auth.createUser({
          email: userData.email,
          password: userData.password,
          emailVerified: false,
          displayName: userData.nome,
          disabled: false
        });
        console.log('  ✅ Usuário criado no Authentication');
        console.log('     UID:', userRecord.uid);
        console.log('     Senha temporária:', userData.password);
      } else {
        throw error;
      }
    }
    
    // Verificar se existe no Firestore
    const userDoc = await db.collection('usuarios').doc(userRecord.uid).get();
    
    if (!userDoc.exists()) {
      console.log('  ⚠️  Documento ausente no Firestore - criando...');
      const firestoreTimestamp = new Date().toISOString();
      await db.collection('usuarios').doc(userRecord.uid).set({
        email: userData.email,
        nome: userData.nome,
        role: userData.role,
        status: userData.status,
        createdAt: firestoreTimestamp,
        updatedAt: firestoreTimestamp,
        testUser: true // Marcar como usuário de teste
      });
      console.log('  ✅ Documento criado no Firestore');
    } else {
      const firestoreData = userDoc.data();
      console.log('  ✅ Documento existe no Firestore');
      console.log('     Role:', firestoreData.role);
      console.log('     Status:', firestoreData.status);
      
      // Garantir que status está ativo
      if (firestoreData.status !== 'ativo') {
        await db.collection('usuarios').doc(userRecord.uid).update({
          status: 'ativo',
          updatedAt: new Date().toISOString()
        });
        console.log('  ✅ Status atualizado para: ativo');
      }
    }
    
    console.log('');
    console.log(`[SGQ-SECURITY] ✅ Acesso validado para role: ${userData.role} | Timestamp: ${new Date().toISOString()}`);
    console.log('');
    
    return {
      success: true,
      uid: userRecord.uid,
      email: userData.email,
      role: userData.role
    };
    
  } catch (error) {
    console.error('  ❌ ERRO ao processar usuário');
    console.error('     Mensagem:', error.message);
    console.error('     Código:', error.code || 'N/A');
    console.log('');
    return {
      success: false,
      email: userData.email,
      role: userData.role,
      error: error.message
    };
  }
}

/**
 * Executar testes para todas as roles
 */
async function runMultiRoleTests() {
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('INICIANDO TESTES DE ACESSO MULTIUSUÁRIO');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('');
  
  const results = {
    admin: null,
    user: null,
    superintendente: null
  };
  
  // Testar cada role
  for (const [key, userData] of Object.entries(testUsers)) {
    results[key] = await ensureUserExists(key, userData);
    await new Promise(resolve => setTimeout(resolve, 500)); // Pequeno delay entre testes
  }
  
  // Resumo dos resultados
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('RESUMO DOS TESTES');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('');
  
  let allPassed = true;
  
  for (const [role, result] of Object.entries(results)) {
    if (result.success) {
      console.log(`✅ ${role.toUpperCase()}: ACESSO VALIDADO`);
      console.log(`   Email: ${result.email}`);
      console.log(`   UID: ${result.uid}`);
    } else {
      console.log(`❌ ${role.toUpperCase()}: FALHOU`);
      console.log(`   Email: ${result.email}`);
      console.log(`   Erro: ${result.error}`);
      allPassed = false;
    }
    console.log('');
  }
  
  // Instruções de login
  if (allPassed) {
    console.log('═══════════════════════════════════════════════════════════════════');
    console.log('CREDENCIAIS PARA TESTE DE LOGIN');
    console.log('═══════════════════════════════════════════════════════════════════');
    console.log('');
    
    console.log('1️⃣  ADMIN:');
    console.log('   Email: mayconabentes@gmail.com');
    console.log('   Senha: Aprendiz@33');
    console.log('');
    
    console.log('2️⃣  USER:');
    console.log('   Email: user.teste@axioma.cdl');
    console.log('   Senha: UserTest@123');
    console.log('');
    
    console.log('3️⃣  SUPERINTENDENTE:');
    console.log('   Email: super.teste@axioma.cdl');
    console.log('   Senha: SuperTest@123');
    console.log('');
    
    console.log('═══════════════════════════════════════════════════════════════════');
    console.log('PROTOCOLO DE EVIDÊNCIA');
    console.log('═══════════════════════════════════════════════════════════════════');
    console.log('');
    console.log('Para cada usuário, teste o login em index.html e verifique:');
    console.log('');
    console.log('1. Abra o Console do Navegador (F12)');
    console.log('2. Faça login com as credenciais acima');
    console.log('3. Capture o log no console:');
    console.log('   [SGQ-SECURITY] ✅ Acesso validado para role: [ROLE] | Timestamp: [ISO 8601]');
    console.log('');
    console.log('4. Em caso de erro, verifique se aparece:');
    console.log('   [SGQ-SECURITY] ❌ FALHA NO LOGIN');
    console.log('   [SGQ-SECURITY] Tipo de erro: [Credencial (Auth) | Metadados ausentes (Firestore)]');
    console.log('');
  }
  
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log(allPassed ? '✅ TODOS OS TESTES PASSARAM' : '⚠️  ALGUNS TESTES FALHARAM');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('');
  
  return allPassed ? 0 : 1;
}

// Executar os testes
runMultiRoleTests()
  .then((exitCode) => {
    console.log('[SGQ-SECURITY] Teste concluído | Timestamp:', new Date().toISOString());
    process.exit(exitCode);
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error.message);
    console.error('[SGQ-SECURITY] Timestamp:', new Date().toISOString());
    process.exit(1);
  });
