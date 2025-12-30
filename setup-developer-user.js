/**
 * Script para criar o usuário inicial do desenvolvedor
 * 
 * ⚠️  AVISO DE SEGURANÇA:
 * Este script usa serviceAccountKey.json (método legado).
 * Para melhor segurança, migre para variáveis de ambiente.
 * Consulte: ENVIRONMENT_VARIABLES_GUIDE.md
 * 
 * Uso:
 * 1. Instale o Firebase Admin SDK: npm install firebase-admin
 * 2. Baixe a chave de serviço do Firebase Console e salve como serviceAccountKey.json
 * 3. Execute: node setup-developer-user.js
 * 
 * ⚠️  IMPORTANTE: NUNCA commite serviceAccountKey.json no Git!
 * 
 * Credenciais criadas:
 * - Email: mayconabentes@gmail.com
 * - Senha: Aprendiz@33
 * - Role: admin
 */

const admin = require('firebase-admin');

console.log('⚠️  AVISO DE SEGURANÇA: Este script usa método legado (serviceAccountKey.json)');
console.log('   Para melhor segurança, migre para variáveis de ambiente.');
console.log('   Consulte: ENVIRONMENT_VARIABLES_GUIDE.md\n');

// Verificar se o arquivo de chave de serviço existe
try {
  const serviceAccount = require('./serviceAccountKey.json');
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
  console.error('❌ Erro: Arquivo serviceAccountKey.json não encontrado');
  console.error('');
  console.error('Para usar este script, você precisa:');
  console.error('1. Acessar o Firebase Console');
  console.error('2. Ir em Project Settings > Service Accounts');
  console.error('3. Clicar em "Generate new private key"');
  console.error('4. Salvar o arquivo como "serviceAccountKey.json" na raiz do projeto');
  console.error('');
  console.error('⚠️  IMPORTANTE: NUNCA commite serviceAccountKey.json no Git!');
  console.error('   O arquivo já está no .gitignore para proteção.');
  console.error('');
  console.error('Alternativamente, crie o usuário manualmente seguindo as instruções em:');
  console.error('setup-initial-user.md');
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
  console.log('🔧 Iniciando criação do usuário desenvolvedor...');
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
          dataCriacao: new Date().toISOString()
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
      dataCriacao: new Date().toISOString()
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
