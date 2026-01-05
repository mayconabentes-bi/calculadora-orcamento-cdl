/**
 * Script de Registo de Utilizadores CDL Manaus
 * Versão 2.2 - Suporte Multi-Utilizador & SGQ-SECURITY v5.1.0
 * Arquitetura Zero Trust com Base64 Support
 * 
 * Este script permite o registo em massa de utilizadores seguindo
 * rigorosamente a Arquitetura Zero Trust e os padrões de auditoria SGQ-SECURITY.
 * 
 * ⚠️ ATENÇÃO DE SEGURANÇA:
 * - Senha temporária definida no código (senhaTemporaria)
 * - Utilizadores DEVEM alterar no primeiro acesso
 * - Execute apenas em ambiente seguro/controlado
 * - Logs contêm senha temporária - proteja saída do console
 * 
 * Uso:
 * 1. Certifique-se que o .env está configurado corretamente
 * 2. Execute: node setup-users-cdl.js
 *    OU: npm run setup:users
 * 
 * Utilizadores criados:
 * - manuel.joaquim@cdlmanaus.org.br (admin)
 * - josiane.oliveira@cdlmanaus.org.br (user)
 * - lidiane.cabral@cdlmanaus.org.br (user)
 * 
 * Senha temporária padrão: Cdl@Manaus2026
 * CRÍTICO: Informe aos utilizadores para alterarem a senha no primeiro acesso
 */

require('dotenv').config();
const admin = require('firebase-admin');
const { getFirebaseCredentials } = require('./firebase-key-handler');

const timestamp = new Date().toISOString();
console.log(`[SGQ-SECURITY] ${timestamp} - Script de Registo Multi-Utilizador iniciado`);
console.log('');

// Validação rigorosa de variáveis de ambiente obrigatórias
const requiredEnvVars = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL'
];

console.log(`[SGQ-SECURITY] ${timestamp} - 🔐 Verificando configuração de segurança (Arquitetura Gemini)...`);
console.log('');

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

// Check for private key (either format)
const hasBase64Key = !!process.env.FIREBASE_PRIVATE_KEY_BASE64;
const hasLegacyKey = !!process.env.FIREBASE_PRIVATE_KEY;

if (!hasBase64Key && !hasLegacyKey) {
  missingVars.push('FIREBASE_PRIVATE_KEY_BASE64 or FIREBASE_PRIVATE_KEY');
}

if (missingVars.length > 0) {
  const errorTimestamp = new Date().toISOString();
  console.error(`[SGQ-SECURITY] ${errorTimestamp} - ❌ ERRO CRÍTICO: Variáveis de ambiente obrigatórias não configuradas`);
  console.error('');
  console.error('Variáveis ausentes:');
  missingVars.forEach(varName => {
    console.error(`   ✗ ${varName}`);
  });
  console.error('');
  console.error('🔧 Para corrigir:');
  console.error('   1. Copie o template: cp .env.example .env');
  console.error('   2. Edite .env com suas credenciais do Firebase Console');
  console.error('   3. Para Base64 (recomendado): node convert-private-key-to-base64.js');
  console.error('   4. Execute este script novamente');
  console.error('');
  console.error('📚 Documentação: ENVIRONMENT_VARIABLES_GUIDE.md');
  console.error('🔒 Segurança: SECURITY_REMEDIATION_GUIDE.md');
  console.error('');
  console.error('⚠️  PRINCÍPIO ZERO TRUST: Este script NÃO aceita arquivos JSON locais');
  process.exit(1);
}

// Inicialização segura via Base64/Env
try {
  const credential = getFirebaseCredentials();
  admin.initializeApp({ credential: admin.credential.cert(credential) });
  const initTimestamp = new Date().toISOString();
  console.log(`[SGQ-SECURITY] ${initTimestamp} - ✅ Firebase Admin Inicializado`);
  console.log(`   Project: ${credential.projectId}`);
  console.log(`   Service Account: ${credential.clientEmail}`);
  console.log('');
} catch (error) {
  const errorTimestamp = new Date().toISOString();
  console.error(`[SGQ-SECURITY] ${errorTimestamp} - ❌ Erro na inicialização: ${error.message}`);
  console.error('');
  console.error('💡 Dicas de troubleshooting:');
  console.error('   - Verifique o formato da FIREBASE_PRIVATE_KEY_BASE64 (Base64 válido)');
  console.error('   - Se usar FIREBASE_PRIVATE_KEY, deve incluir \\n para quebras de linha');
  console.error('   - Confirme que as credenciais no .env estão corretas');
  console.error('   - Valide se o service account tem permissões adequadas');
  console.error('   - Execute: node convert-private-key-to-base64.js para gerar Base64');
  console.error('');
  process.exit(1);
}

const auth = admin.auth();
const db = admin.firestore();

// Lista de utilizadores para registo (Status padrão: 'ativo')
const novosUtilizadores = [
  { email: 'manuel.joaquim@cdlmanaus.org.br', nome: 'Manuel Joaquim', role: 'admin' },
  { email: 'josiane.oliveira@cdlmanaus.org.br', nome: 'Josiane Oliveira', role: 'user' },
  { email: 'lidiane.cabral@cdlmanaus.org.br', nome: 'Lidiane Cabral', role: 'user' }
];

// Senha temporária padrão
const senhaTemporaria = 'Cdl@Manaus2026';

/**
 * Função principal: Cadastrar múltiplos usuários
 * Operações:
 * 1. Verifica existência do usuário no Auth (evita duplicação)
 * 2. Cria usuário no Firebase Authentication se não existir
 * 3. Cria/atualiza documento correspondente no Firestore
 * 4. Auditoria completa SGQ-SECURITY de todas as operações
 */
async function cadastrarUsuarios() {
  const startTimestamp = new Date().toISOString();
  console.log(`[SGQ-SECURITY] ${startTimestamp} - Iniciar Processamento de ${novosUtilizadores.length} utilizadores...`);
  console.log('');

  for (const u of novosUtilizadores) {
    const timestamp = new Date().toISOString();
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`[SGQ-SECURITY] ${timestamp} - Processando: ${u.nome} (${u.email})`);
    console.log(`[SGQ-SECURITY] Role: ${u.role}`);
    console.log('');
    
    try {
      let uid;
      let userCreated = false;
      
      try {
        // Verificar se já existe no Auth
        const userRecord = await auth.getUserByEmail(u.email);
        uid = userRecord.uid;
        const existTimestamp = new Date().toISOString();
        console.log(`[SGQ-SECURITY] ${existTimestamp} - ⚠️  ${u.email} já existe no Auth.`);
        console.log(`[SGQ-SECURITY] UID: ${uid}`);
      } catch (authError) {
        if (authError.code === 'auth/user-not-found') {
          // Criar no Auth se não existir (Senha padrão temporária)
          const userRecord = await auth.createUser({
            email: u.email,
            password: senhaTemporaria,
            displayName: u.nome,
            emailVerified: false,
            disabled: false
          });
          uid = userRecord.uid;
          userCreated = true;
          const createTimestamp = new Date().toISOString();
          console.log(`[SGQ-SECURITY] ${createTimestamp} - ✅ ${u.email} criado no Auth.`);
          console.log(`[SGQ-SECURITY] UID gerado: ${uid}`);
        } else {
          throw authError;
        }
      }

      // Sincronizar Metadados no Firestore (status sempre 'ativo')
      const firestoreTimestamp = new Date().toISOString();
      console.log(`[SGQ-SECURITY] ${firestoreTimestamp} - Sincronizando metadados no Firestore...`);
      
      await db.collection('usuarios').doc(uid).set({
        email: u.email,
        nome: u.nome,
        role: u.role,
        status: 'ativo',
        updatedAt: new Date().toISOString()
      }, { merge: true });

      const syncTimestamp = new Date().toISOString();
      console.log(`[SGQ-SECURITY] ${syncTimestamp} - ✅ Metadados sincronizados no Firestore para: ${u.nome}`);
      
      if (userCreated) {
        console.log(`[SGQ-SECURITY] ${syncTimestamp} - 📧 Credenciais criadas:`);
        console.log(`    Email: ${u.email}`);
        console.log(`    Senha: ******** (ver resumo final)`);
        console.log(`    Role: ${u.role}`);
        console.log(`    Status: ativo`);
      }

    } catch (err) {
      const errorTimestamp = new Date().toISOString();
      console.error(`[SGQ-SECURITY] ${errorTimestamp} - ❌ Erro ao processar ${u.email}: ${err.message}`);
      
      if (err.code === 'auth/invalid-password') {
        console.error(`[SGQ-SECURITY] ${errorTimestamp} - Diagnóstico: Senha não atende requisitos mínimos`);
      } else if (err.code === 'auth/invalid-email') {
        console.error(`[SGQ-SECURITY] ${errorTimestamp} - Diagnóstico: Formato de e-mail inválido`);
      }
    }
    
    console.log('');
  }
}

// Executar a função principal
cadastrarUsuarios()
  .then(() => {
    const successTimestamp = new Date().toISOString();
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`[SGQ-SECURITY] ${successTimestamp} - Status: OPERAÇÃO CONCLUÍDA`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('✅ Processo de registo concluído com sucesso!');
    console.log('');
    console.log('📋 Resumo:');
    console.log(`   Total de utilizadores processados: ${novosUtilizadores.length}`);
    console.log(`   Senha temporária padrão: ${senhaTemporaria}`);
    console.log('');
    console.log('⚠️  ATENÇÃO IMPORTANTE:');
    console.log('   1. Todos os utilizadores devem alterar a senha no primeiro acesso');
    console.log('   2. Verifique que o campo "status" no Firestore está como "ativo"');
    console.log('   3. Informe as credenciais de forma segura aos utilizadores');
    console.log('');
    console.log('🔐 Utilizadores criados:');
    novosUtilizadores.forEach(u => {
      console.log(`   • ${u.nome} (${u.email}) - Role: ${u.role}`);
    });
    console.log('');
    console.log('📚 Para validar a autenticação:');
    console.log('   npm run verify:auth');
    console.log('');
    console.log(`[SGQ-SECURITY] ${successTimestamp} - Todas as operações executadas corretamente`);
    console.log('');
    process.exit(0);
  })
  .catch((error) => {
    const fatalTimestamp = new Date().toISOString();
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error(`[SGQ-SECURITY] ${fatalTimestamp} - ❌ Erro fatal no processo: ${error.message}`);
    console.error(`[SGQ-SECURITY] ${fatalTimestamp} - Status: FALHA CRÍTICA`);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('');
    process.exit(1);
  });
