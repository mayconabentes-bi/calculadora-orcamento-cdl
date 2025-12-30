/**
 * Script para criar o usuário inicial do desenvolvedor
 * Versão 2.0 - Arquitetura Gemini (Zero Trust com Variáveis de Ambiente)
 * 
 * Uso:
 * 1. Instale as dependências: npm install firebase-admin dotenv
 * 2. Copie .env.example para .env: cp .env.example .env
 * 3. Configure as credenciais Firebase no arquivo .env
 * 4. Execute: node setup-developer-user.js
 * 
 * Credenciais criadas:
 * - Email: mayconabentes@gmail.com
 * - Senha: Aprendiz@33
 * - Role: admin
 */

require('dotenv').config();
const admin = require('firebase-admin');

// Validação de variáveis de ambiente obrigatórias
const requiredEnvVars = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_CLIENT_EMAIL'
];

console.log('🔐 Verificando configuração de segurança...\n');

const missingVars = requiredEnvVars.filter(varName => !process.env[varName] || process.env[varName].trim() === '');
if (missingVars.length > 0) {
  console.error('❌ Erro: Variáveis de ambiente obrigatórias não configuradas:');
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('\n📝 Para configurar:');
  console.error('   1. Copie .env.example para .env: cp .env.example .env');
  console.error('   2. Edite .env com suas credenciais reais');
  console.error('   3. Execute este script novamente');
  console.error('\n📚 Consulte: ENVIRONMENT_VARIABLES_GUIDE.md');
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

  console.log('✅ Firebase Admin inicializado com sucesso via variáveis de ambiente');
  console.log(`   Project: ${process.env.FIREBASE_PROJECT_ID}`);
  console.log(`   Service Account: ${process.env.FIREBASE_CLIENT_EMAIL}\n`);
} catch (error) {
  console.error('❌ Erro ao inicializar Firebase Admin:', error.message);
  console.error('\n💡 Verifique se as credenciais no arquivo .env estão corretas.');
  console.error('   Especialmente o formato da FIREBASE_PRIVATE_KEY (deve incluir \\n)');
  process.exit(1);
}

const auth = admin.auth();
const db = admin.firestore();

// Dados do desenvolvedor
const developerData = {
  email: 'mayconabentes@gmail.com',
  password: 'Aprendiz@33',
  nome: 'Maycon Abentes',
  role: 'admin',
  status: 'ativo'
};

async function createDeveloperUser() {
  console.log('👤 Iniciando criação do usuário desenvolvedor...');
  console.log('');
  
  try {
    // Verificar se o usuário já existe
    try {
      const existingUser = await auth.getUserByEmail(developerData.email);
      console.log('⚠️  Usuário já existe no Firebase Authentication');
      console.log('   UID:', existingUser.uid);
      
      // Verificar se existe no Firestore
      const userDoc = await db.collection('usuarios').doc(existingUser.uid).get();
      
      if (userDoc.exists) {
        console.log('⚠️  Usuário já existe no Firestore');
        console.log('   Atualizando dados no Firestore...');
        
        await db.collection('usuarios').doc(existingUser.uid).set({
          email: developerData.email,
          nome: developerData.nome,
          role: developerData.role,
          status: developerData.status,
          updatedAt: new Date().toISOString()
        }, { merge: true });
        
        console.log('✅ Dados do usuário atualizados no Firestore');
        console.log('');
        console.log('Credenciais de acesso:');
        console.log('  E-mail:', developerData.email);
        console.log('  Senha:', developerData.password);
        console.log('  Role:', userDoc.data().role);
        console.log('  Status:', userDoc.data().status);
        return;
      } else {
        console.log('⚠️  Usuário existe no Authentication mas não no Firestore');
        console.log('   Criando documento no Firestore...');
        
        await db.collection('usuarios').doc(existingUser.uid).set({
          email: developerData.email,
          nome: developerData.nome,
          role: developerData.role,
          status: developerData.status,
          createdAt: new Date().toISOString()
        });
        
        console.log('✅ Documento criado no Firestore');
        console.log('');
        console.log('Credenciais de acesso:');
        console.log('  E-mail:', developerData.email);
        console.log('  Senha:', developerData.password);
        console.log('  Role:', developerData.role);
        return;
      }
    } catch (error) {
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
      // Usuário não existe, continuar com a criação
    }
    
    // Criar usuário no Firebase Authentication
    console.log('📝 Criando usuário no Firebase Authentication...');
    const userRecord = await auth.createUser({
      email: developerData.email,
      password: developerData.password,
      emailVerified: false,
      displayName: developerData.nome,
      disabled: false
    });
    
    console.log('✅ Usuário criado no Authentication');
    console.log('   UID:', userRecord.uid);
    
    // Criar documento no Firestore
    console.log('📝 Criando documento no Firestore...');
    await db.collection('usuarios').doc(userRecord.uid).set({
      email: developerData.email,
      nome: developerData.nome,
      role: developerData.role,
      status: developerData.status,
      createdAt: new Date().toISOString()
    });
    
    console.log('✅ Documento criado no Firestore');
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Usuário desenvolvedor criado com sucesso!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('Credenciais de acesso:');
    console.log('  E-mail:', developerData.email);
    console.log('  Senha:', developerData.password);
    console.log('  Nome:', developerData.nome);
    console.log('  Role:', developerData.role);
    console.log('  Status:', developerData.status);
    console.log('');
    console.log('Para acessar o sistema:');
    console.log('1. Abra index.html no navegador');
    console.log('2. Faça login com as credenciais acima');
    console.log('3. Você será redirecionado para o dashboard-admin.html');
    console.log('');
    
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error.message);
    
    if (error.code === 'auth/email-already-exists') {
      console.error('');
      console.error('O e-mail já está em uso. Tente:');
      console.error('1. Usar um e-mail diferente');
      console.error('2. Ou deletar o usuário existente no Firebase Console');
    } else if (error.code === 'auth/invalid-password') {
      console.error('');
      console.error('A senha deve ter pelo menos 6 caracteres');
    } else if (error.code === 'auth/invalid-email') {
      console.error('');
      console.error('O e-mail fornecido é inválido');
    }
    
    process.exit(1);
  }
}

// Executar a função
createDeveloperUser()
  .then(() => {
    console.log('🎉 Processo concluído!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
