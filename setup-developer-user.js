/**
 * Script para criar o usuário inicial do desenvolvedor
 * Versão 2.0 - Zero Trust com Variáveis de Ambiente
 * 
 * ✅ Arquitetura Gemini: Credenciais via environment variables
 * 
 * Uso:
 * 1. npm install firebase-admin dotenv
 * 2. Copie .env.example para .env e configure as credenciais
 * 3. Execute: node setup-developer-user.js
 * 
 * Credenciais criadas:
 * - Email: mayconabentes@gmail.com
 * - Senha: Aprendiz@33 (Alterar após primeiro login)
 * - Role: admin
 */

require('dotenv').config();
const admin = require('firebase-admin');

// Validação rigorosa de variáveis de ambiente obrigatórias
const requiredEnvVars = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_CLIENT_EMAIL'
];

console.log('🔐 Verificando configuração de segurança (Arquitetura Gemini)...\n');

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('❌ ERRO CRÍTICO: Variáveis de ambiente obrigatórias não configuradas');
  console.error('');
  console.error('Variáveis ausentes:');
  missingVars.forEach(varName => {
    console.error(`   ✗ ${varName}`);
  });
  console.error('');
  console.error('🔧 Para corrigir:');
  console.error('   1. Copie o template: cp .env.example .env');
  console.error('   2. Edite .env com suas credenciais do Firebase Console');
  console.error('   3. Execute este script novamente');
  console.error('');
  console.error('📚 Documentação: ENVIRONMENT_VARIABLES_GUIDE.md');
  console.error('🔒 Segurança: SECURITY_REMEDIATION_GUIDE.md');
  console.error('');
  console.error('⚠️  PRINCÍPIO ZERO TRUST: Este script NÃO aceita arquivos JSON locais');
  process.exit(1);
}

// Inicializar Firebase Admin com credenciais de ambiente
try {
  const credential = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL
  };

  admin.initializeApp({
    credential: admin.credential.cert(credential)
  });

  console.log('✅ Firebase Admin inicializado via variáveis de ambiente');
  console.log(`   Project: ${process.env.FIREBASE_PROJECT_ID}`);
  console.log(`   Service Account: ${process.env.FIREBASE_CLIENT_EMAIL}`);
  console.log('');
} catch (error) {
  console.error('❌ Erro ao inicializar Firebase Admin:', error.message);
  console.error('');
  console.error('💡 Dicas de troubleshooting:');
  console.error('   - Verifique o formato da FIREBASE_PRIVATE_KEY (deve incluir \\n)');
  console.error('   - Confirme que as credenciais no .env estão corretas');
  console.error('   - Valide se o service account tem permissões adequadas');
  console.error('');
  process.exit(1);
}

const auth = admin.auth();
const db = admin.firestore();

/**
 * Dados do usuário desenvolvedor
 * ATENÇÃO: Credenciais temporárias - Alterar após primeiro login
 */
const developerData = {
  email: 'mayconabentes@gmail.com',
  password: 'Aprendiz@33',
  nome: 'Maycon Abentes',
  role: 'admin',
  status: 'ativo'
};

/**
 * Função principal: Criação de usuário desenvolvedor
 * Operações:
 * 1. Verifica existência do usuário (evita duplicação)
 * 2. Cria usuário no Firebase Authentication
 * 3. Cria documento correspondente no Firestore
 * 4. Auditoria completa de operações
 */
async function createDeveloperUser() {
  console.log('[SGQ-SECURITY] Iniciando criação de usuário desenvolvedor');
  console.log(`[SGQ-SECURITY] Email: ${developerData.email}`);
  console.log(`[SGQ-SECURITY] Role: ${developerData.role}\n`);
  
  try {
    // Verificar se o usuário já existe
    try {
      const existingUser = await auth.getUserByEmail(developerData.email);
      console.log('[SGQ-SECURITY] ⚠️  Usuário já existe no Firebase Authentication');
      console.log(`[SGQ-SECURITY] UID: ${existingUser.uid}`);
      
      // Verificar se existe no Firestore
      const userDoc = await db.collection('usuarios').doc(existingUser.uid).get();
      
      if (userDoc.exists) {
        console.log('[SGQ-SECURITY] ⚠️  Registro encontrado no Firestore');
        console.log('[SGQ-SECURITY] Operação: Atualização de dados existentes');
        
        await db.collection('usuarios').doc(existingUser.uid).set({
          email: developerData.email,
          nome: developerData.nome,
          role: developerData.role,
          status: developerData.status,
          updatedAt: new Date().toISOString()
        }, { merge: true });
        
        console.log('[SGQ-SECURITY] ✅ Dados atualizados no Firestore');
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('[SGQ-SECURITY] Status: OPERAÇÃO CONCLUÍDA');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('Credenciais de acesso:');
        console.log(`  E-mail: ${developerData.email}`);
        console.log(`  Senha: ${developerData.password}`);
        console.log(`  Role: ${userDoc.data().role}`);
        console.log(`  Status: ${userDoc.data().status}`);
        console.log('\n[SGQ-SECURITY] ATENÇÃO: Altere a senha após o primeiro login\n');
        return;
      } else {
        console.log('[SGQ-SECURITY] ⚠️  Inconsistência detectada: Auth OK, Firestore ausente');
        console.log('[SGQ-SECURITY] Operação: Sincronização de dados');
        
        // Usar timestamp de criação do Auth para manter consistência de auditoria
        // Converter de RFC3339 para ISO string para manter formato consistente
        const authCreatedAt = new Date(existingUser.metadata.creationTime).toISOString();
        
        await db.collection('usuarios').doc(existingUser.uid).set({
          email: developerData.email,
          nome: developerData.nome,
          role: developerData.role,
          status: developerData.status,
          createdAt: authCreatedAt,
          updatedAt: new Date().toISOString()
        }, { merge: true });
        
        console.log('[SGQ-SECURITY] ✅ Documento criado no Firestore');
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('[SGQ-SECURITY] Status: SINCRONIZAÇÃO CONCLUÍDA');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('Credenciais de acesso:');
        console.log(`  E-mail: ${developerData.email}`);
        console.log(`  Senha: ${developerData.password}`);
        console.log(`  Role: ${developerData.role}`);
        console.log('\n[SGQ-SECURITY] ATENÇÃO: Altere a senha após o primeiro login\n');
        return;
      }
    } catch (error) {
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
      console.log('[SGQ-SECURITY] Usuário não encontrado. Iniciando criação...');
    }
    
    // Criar usuário no Firebase Authentication
    console.log('[SGQ-SECURITY] Operação: Criação de novo usuário');
    console.log('[SGQ-SECURITY] Criando registro no Firebase Authentication...');
    const userRecord = await auth.createUser({
      email: developerData.email,
      password: developerData.password,
      emailVerified: false,
      displayName: developerData.nome,
      disabled: false
    });
    
    console.log('[SGQ-SECURITY] ✅ Usuário criado no Authentication');
    console.log(`[SGQ-SECURITY] UID gerado: ${userRecord.uid}`);
    
    // Criar documento no Firestore
    console.log('[SGQ-SECURITY] Criando documento no Firestore...');
    
    // Usar timestamp único para createdAt e updatedAt para manter consistência
    const timestamp = new Date().toISOString();
    
    await db.collection('usuarios').doc(userRecord.uid).set({
      email: developerData.email,
      nome: developerData.nome,
      role: developerData.role,
      status: developerData.status,
      createdAt: timestamp,
      updatedAt: timestamp
    }, { merge: true });
    
    console.log('[SGQ-SECURITY] ✅ Documento criado no Firestore');
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('[SGQ-SECURITY] Status: USUÁRIO CRIADO COM SUCESSO');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('Credenciais de acesso:');
    console.log(`  E-mail: ${developerData.email}`);
    console.log(`  Senha: ${developerData.password}`);
    console.log(`  Nome: ${developerData.nome}`);
    console.log(`  Role: ${developerData.role}`);
    console.log(`  Status: ${developerData.status}`);
    console.log('\n[SGQ-SECURITY] ATENÇÃO: Altere a senha após o primeiro login');
    console.log('\nPara acessar o sistema:');
    console.log('1. Abra index.html no navegador');
    console.log('2. Faça login com as credenciais acima');
    console.log('3. Você será redirecionado para o dashboard-admin.html\n');
    
  } catch (error) {
    console.error('[SGQ-SECURITY] ❌ FALHA NA OPERAÇÃO');
    console.error(`[SGQ-SECURITY] Erro: ${error.message}`);
    
    if (error.code === 'auth/email-already-exists') {
      console.error('\n[SGQ-SECURITY] Diagnóstico: E-mail já cadastrado no sistema');
      console.error('[SGQ-SECURITY] Ações sugeridas:');
      console.error('[SGQ-SECURITY]   1. Usar um e-mail diferente');
      console.error('[SGQ-SECURITY]   2. Deletar usuário existente no Firebase Console');
    } else if (error.code === 'auth/invalid-password') {
      console.error('\n[SGQ-SECURITY] Diagnóstico: Senha não atende requisitos mínimos');
      console.error('[SGQ-SECURITY] Requisito: Mínimo 6 caracteres');
    } else if (error.code === 'auth/invalid-email') {
      console.error('\n[SGQ-SECURITY] Diagnóstico: Formato de e-mail inválido');
    }
    
    console.error('[SGQ-SECURITY] Status: ABORTADO\n');
    process.exit(1);
  }
}

// Executar a função
createDeveloperUser()
  .then(() => {
    console.log('[SGQ-SECURITY] Operação concluída com sucesso');
    console.log('[SGQ-SECURITY] Todas as operações executadas corretamente\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('[SGQ-SECURITY] ❌ Erro fatal no processo:', error.message);
    console.error('[SGQ-SECURITY] Status: FALHA CRÍTICA\n');
    process.exit(1);
  });
