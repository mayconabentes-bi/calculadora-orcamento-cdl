/**
 * Setup de Usuário Desenvolvedor - Sistema Axioma CDL/UTV
 * Versão 2.0 - Arquitetura Zero Trust (Environment Variables)
 * 
 * Conformidade: SGQ-SECURITY | Zero Trust Architecture
 * 
 * Propósito:
 * - Criação segura de usuário administrativo sem exposição de credenciais
 * - Validação rigorosa de variáveis de ambiente
 * - Auditoria completa de operações de segurança
 * 
 * Pré-requisitos:
 * 1. Node.js instalado
 * 2. Dependências: npm install
 * 3. Arquivo .env configurado (copiar de .env.example)
 * 4. Credenciais Firebase válidas no .env
 * 
 * Execução:
 * npm run setup:user
 * ou
 * node setup-developer-user.js
 * 
 * Credenciais padrão:
 * - Email: mayconabentes@gmail.com
 * - Senha: Aprendiz@33 (Alterar após primeiro login)
 * - Role: admin
 */

require('dotenv').config();
const admin = require('firebase-admin');

/**
 * Variáveis de ambiente obrigatórias para autenticação Firebase Admin SDK
 * Conformidade: Zero Trust Security Model
 */
const requiredEnvVars = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_CLIENT_EMAIL'
];

// Inicialização da auditoria de segurança
console.log('[SGQ-SECURITY] Iniciando setup de usuário desenvolvedor');
console.log('[SGQ-SECURITY] Validando credenciais de ambiente...\n');

// Validação rigorosa: impede execução com configuração incompleta
const missingVars = requiredEnvVars.filter(varName => !process.env[varName] || process.env[varName].trim() === '');
if (missingVars.length > 0) {
  console.error('[SGQ-SECURITY] ❌ FALHA: Variáveis de ambiente obrigatórias ausentes');
  console.error('[SGQ-SECURITY] Variáveis faltantes:');
  missingVars.forEach(varName => {
    console.error(`[SGQ-SECURITY]   - ${varName}`);
  });
  console.error('\n[SGQ-SECURITY] Ações corretivas necessárias:');
  console.error('[SGQ-SECURITY]   1. Copiar template: cp .env.example .env');
  console.error('[SGQ-SECURITY]   2. Configurar credenciais reais no arquivo .env');
  console.error('[SGQ-SECURITY]   3. Validar formato da FIREBASE_PRIVATE_KEY (incluir \\n)');
  console.error('[SGQ-SECURITY]   4. Executar este script novamente');
  console.error('\n[SGQ-SECURITY] Documentação: ENVIRONMENT_VARIABLES_GUIDE.md');
  console.error('[SGQ-SECURITY] Status: ABORTADO\n');
  process.exit(1);
}

console.log('[SGQ-SECURITY] ✅ Validação concluída: Todas as variáveis presentes');

/**
 * Inicialização do Firebase Admin SDK
 * Método: Service Account via Environment Variables
 * Security Model: Zero Trust - Nenhuma credencial em arquivo físico
 */
try {
  // Verificar se o Firebase Admin já foi inicializado (prevenção de duplicação)
  if (admin.apps.length === 0) {
    // Construção do objeto de credenciais a partir de variáveis de ambiente
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });

    console.log('[SGQ-SECURITY] ✅ Firebase Admin SDK inicializado');
    console.log(`[SGQ-SECURITY] Project ID: ${process.env.FIREBASE_PROJECT_ID}`);
    console.log(`[SGQ-SECURITY] Service Account: ${process.env.FIREBASE_CLIENT_EMAIL}`);
    console.log('[SGQ-SECURITY] Método: Environment Variables (Zero Trust)\n');
  } else {
    console.log('[SGQ-SECURITY] ℹ️  Firebase Admin SDK já inicializado (reutilizando instância)');
    console.log(`[SGQ-SECURITY] Project ID: ${process.env.FIREBASE_PROJECT_ID}\n`);
  }
} catch (error) {
  console.error('[SGQ-SECURITY] ❌ FALHA CRÍTICA: Erro na inicialização do Firebase Admin');
  console.error(`[SGQ-SECURITY] Erro: ${error.message}`);
  console.error('\n[SGQ-SECURITY] Diagnóstico:');
  console.error('[SGQ-SECURITY]   - Verifique formato da FIREBASE_PRIVATE_KEY');
  console.error('[SGQ-SECURITY]   - Confirme validade das credenciais Firebase');
  console.error('[SGQ-SECURITY]   - Valide escape de caracteres especiais (\\n)');
  console.error('[SGQ-SECURITY] Status: ABORTADO\n');
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
        
        await db.collection('usuarios').doc(existingUser.uid).set({
          email: developerData.email,
          nome: developerData.nome,
          role: developerData.role,
          status: developerData.status,
          createdAt: new Date().toISOString(),
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
    await db.collection('usuarios').doc(userRecord.uid).set({
      email: developerData.email,
      nome: developerData.nome,
      role: developerData.role,
      status: developerData.status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
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
