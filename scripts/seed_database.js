/**
 * Script de População do Banco de Dados (Database Seeding)
 * Versão 1.0 - Zero Trust com Base64 Support
 * 
 * ✅ Arquitetura Gemini: Credenciais via environment variables
 * ✅ Suporte a FIREBASE_PRIVATE_KEY_BASE64 (recomendado)
 * ✅ Idempotência: Verifica existência antes de inserir
 * 
 * Uso:
 * 1. Certifique-se de que as credenciais estão configuradas no .env
 * 2. Execute: node scripts/seed_database.js
 * 
 * Coleções populadas:
 * - espacos: Espaços da CDL Manaus (DJLM e UTV)
 * - extras: Itens extras para orçamentos
 * - configuracoes: Multiplicadores de turno
 */

require('dotenv').config();
const admin = require('firebase-admin');
const { getFirebaseCredentials } = require('../firebase-key-handler');

const timestamp = new Date().toISOString();
console.log(`[SEED-DB] ${timestamp} - Script de seeding iniciado`);

// Validação rigorosa de variáveis de ambiente obrigatórias
const requiredEnvVars = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL'
];

console.log(`[SEED-DB] ${timestamp} - 🔐 Verificando configuração de segurança (Arquitetura Gemini)...`);
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
  console.error(`[SEED-DB] ${errorTimestamp} - ❌ ERRO CRÍTICO: Variáveis de ambiente obrigatórias não configuradas`);
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

// Inicializar Firebase Admin com credenciais de ambiente
try {
  const credential = getFirebaseCredentials();

  admin.initializeApp({
    credential: admin.credential.cert(credential)
  });

  const initTimestamp = new Date().toISOString();
  console.log(`[SEED-DB] ${initTimestamp} - ✅ Firebase Admin inicializado via variáveis de ambiente`);
  console.log(`   Project: ${credential.projectId}`);
  console.log(`   Service Account: ${credential.clientEmail}`);
  console.log('');
} catch (error) {
  const errorTimestamp = new Date().toISOString();
  console.error(`[SEED-DB] ${errorTimestamp} - ❌ Erro ao inicializar Firebase Admin: ${error.message}`);
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

const db = admin.firestore();

// =========================================================================
// HELPER FUNCTIONS
// =========================================================================

/**
 * Gera timestamp ISO atual
 * @returns {string} Timestamp no formato ISO 8601
 */
function getCurrentTimestamp() {
  return new Date().toISOString();
}

// =========================================================================
// DADOS DE SEEDING
// =========================================================================

/**
 * Espaços da CDL Manaus (DJLM e UTV)
 * Fonte: MANUAL_TECNICO.md
 */
const espacosData = [
  {
    nome: "DJLM - Auditório",
    unidade: "DJLM",
    capacidade: 120,
    area: 108,
    custoBase: 132.72
  },
  {
    nome: "UTV - Auditório",
    unidade: "UTV",
    capacidade: 70,
    area: 63,
    custoBase: 77.60
  },
  {
    nome: "UTV - Sala 2",
    unidade: "UTV",
    capacidade: 30,
    area: 27,
    custoBase: 35.69
  },
  {
    nome: "UTV - Sala 3",
    unidade: "UTV",
    capacidade: 50,
    area: 45,
    custoBase: 55.19
  },
  {
    nome: "UTV - Sala 4",
    unidade: "UTV",
    capacidade: 40,
    area: 36,
    custoBase: 43.92
  },
  {
    nome: "UTV - Sala 7",
    unidade: "UTV",
    capacidade: 26,
    area: 25,
    custoBase: 29.53
  },
  {
    nome: "UTV - Sala 8",
    unidade: "UTV",
    capacidade: 16,
    area: 14.4,
    custoBase: 17.74
  },
  {
    nome: "UTV - Sala 9",
    unidade: "UTV",
    capacidade: 28,
    area: 25,
    custoBase: 30.52
  },
  {
    nome: "UTV - Sala 12",
    unidade: "UTV",
    capacidade: 9,
    area: 8.1,
    custoBase: 10.02
  },
  {
    nome: "UTV - Sala 13",
    unidade: "UTV",
    capacidade: 8,
    area: 7.2,
    custoBase: 8.86
  }
];

/**
 * Itens extras para orçamentos
 * Fonte: MANUAL_USUARIO.md e problema statement
 */
const extrasData = [
  {
    nome: "Coffee Break Premium",
    custo: 50.00,
    descricao: "Coffee break completo com variedade de bebidas e alimentos"
  },
  {
    nome: "Serviço de Limpeza",
    custo: 150.00,
    descricao: "Serviço de limpeza completo do espaço"
  },
  {
    nome: "Projetor/Datashow",
    custo: 80.00,
    descricao: "Projetor profissional para apresentações"
  },
  {
    nome: "Serviço de Impressão",
    custo: 15.00,
    descricao: "Serviço de impressão de documentos"
  },
  {
    nome: "Gravação Profissional",
    custo: 80.00,
    descricao: "Gravação profissional do evento"
  }
];

/**
 * Configurações do sistema
 * Multiplicadores de turno conforme especificação
 */
const configuracoesData = {
  multiplicadores: {
    manha: 1.0,
    tarde: 1.15,
    noite: 1.40
  }
};

// =========================================================================
// FUNÇÕES DE SEEDING COM IDEMPOTÊNCIA
// =========================================================================

/**
 * Popula a coleção de espaços
 * Verifica existência pelo nome antes de inserir
 */
async function seedEspacos() {
  const startTimestamp = new Date().toISOString();
  console.log(`[SEED-DB] ${startTimestamp} - 🏢 Iniciando seeding de espaços...`);
  
  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const espaco of espacosData) {
    try {
      // Buscar por nome para verificar existência
      const querySnapshot = await db.collection('espacos')
        .where('nome', '==', espaco.nome)
        .limit(1)
        .get();

      if (querySnapshot.empty) {
        // Não existe, criar novo
        const docRef = await db.collection('espacos').add({
          ...espaco,
          ativo: true,
          criadoEm: getCurrentTimestamp(),
          atualizadoEm: getCurrentTimestamp()
        });
        console.log(`   ✅ Espaço '${espaco.nome}' criado (ID: ${docRef.id})`);
        created++;
      } else {
        // Já existe, atualizar
        const doc = querySnapshot.docs[0];
        await db.collection('espacos').doc(doc.id).set({
          ...espaco,
          ativo: true,
          atualizadoEm: getCurrentTimestamp()
        }, { merge: true });
        console.log(`   ♻️  Espaço '${espaco.nome}' atualizado (ID: ${doc.id})`);
        updated++;
      }
    } catch (error) {
      console.error(`   ❌ Erro ao processar espaço '${espaco.nome}': ${error.message}`);
      skipped++;
    }
  }

  const endTimestamp = new Date().toISOString();
  console.log(`[SEED-DB] ${endTimestamp} - ✅ Espaços processados: ${created} criados, ${updated} atualizados, ${skipped} com erro`);
  console.log('');
  
  return { created, updated, skipped };
}

/**
 * Popula a coleção de extras
 * Verifica existência pelo nome antes de inserir
 */
async function seedExtras() {
  const startTimestamp = new Date().toISOString();
  console.log(`[SEED-DB] ${startTimestamp} - 🎁 Iniciando seeding de extras...`);
  
  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const extra of extrasData) {
    try {
      // Buscar por nome para verificar existência
      const querySnapshot = await db.collection('extras')
        .where('nome', '==', extra.nome)
        .limit(1)
        .get();

      if (querySnapshot.empty) {
        // Não existe, criar novo
        const docRef = await db.collection('extras').add({
          ...extra,
          ativo: true,
          criadoEm: getCurrentTimestamp(),
          atualizadoEm: getCurrentTimestamp()
        });
        console.log(`   ✅ Extra '${extra.nome}' criado (ID: ${docRef.id})`);
        created++;
      } else {
        // Já existe, atualizar
        const doc = querySnapshot.docs[0];
        await db.collection('extras').doc(doc.id).set({
          ...extra,
          ativo: true,
          atualizadoEm: getCurrentTimestamp()
        }, { merge: true });
        console.log(`   ♻️  Extra '${extra.nome}' atualizado (ID: ${doc.id})`);
        updated++;
      }
    } catch (error) {
      console.error(`   ❌ Erro ao processar extra '${extra.nome}': ${error.message}`);
      skipped++;
    }
  }

  const endTimestamp = new Date().toISOString();
  console.log(`[SEED-DB] ${endTimestamp} - ✅ Extras processados: ${created} criados, ${updated} atualizados, ${skipped} com erro`);
  console.log('');
  
  return { created, updated, skipped };
}

/**
 * Popula a coleção de configurações
 * Usa documento fixo com ID 'multiplicadores'
 */
async function seedConfiguracoes() {
  const startTimestamp = new Date().toISOString();
  console.log(`[SEED-DB] ${startTimestamp} - ⚙️  Iniciando seeding de configurações...`);
  
  let created = 0;
  let updated = 0;

  try {
    const docRef = db.collection('configuracoes').doc('multiplicadores');
    const doc = await docRef.get();

    if (!doc.exists) {
      // Não existe, criar novo
      await docRef.set({
        ...configuracoesData,
        criadoEm: getCurrentTimestamp(),
        atualizadoEm: getCurrentTimestamp()
      });
      console.log(`   ✅ Configuração 'multiplicadores' criada`);
      created++;
    } else {
      // Já existe, atualizar
      await docRef.set({
        ...configuracoesData,
        atualizadoEm: getCurrentTimestamp()
      }, { merge: true });
      console.log(`   ♻️  Configuração 'multiplicadores' atualizada`);
      updated++;
    }
  } catch (error) {
    console.error(`   ❌ Erro ao processar configurações: ${error.message}`);
  }

  const endTimestamp = new Date().toISOString();
  console.log(`[SEED-DB] ${endTimestamp} - ✅ Configurações processadas: ${created} criadas, ${updated} atualizadas`);
  console.log('');
  
  return { created, updated };
}

// =========================================================================
// FUNÇÃO PRINCIPAL
// =========================================================================

/**
 * Executa o seeding completo do banco de dados
 */
async function seedDatabase() {
  const startTimestamp = new Date().toISOString();
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`[SEED-DB] ${startTimestamp} - 🚀 INICIANDO DATABASE SEEDING`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');

  try {
    // Executar seeding de cada coleção
    const espacosResult = await seedEspacos();
    const extrasResult = await seedExtras();
    const configuracoesResult = await seedConfiguracoes();

    // Resumo final
    const endTimestamp = new Date().toISOString();
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`[SEED-DB] ${endTimestamp} - 🎉 DATABASE SEEDING CONCLUÍDO COM SUCESSO`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('📊 RESUMO FINAL:');
    console.log('');
    console.log(`   🏢 Espaços:`);
    console.log(`      ✅ Criados: ${espacosResult.created}`);
    console.log(`      ♻️  Atualizados: ${espacosResult.updated}`);
    console.log(`      ❌ Erros: ${espacosResult.skipped}`);
    console.log('');
    console.log(`   🎁 Extras:`);
    console.log(`      ✅ Criados: ${extrasResult.created}`);
    console.log(`      ♻️  Atualizados: ${extrasResult.updated}`);
    console.log(`      ❌ Erros: ${extrasResult.skipped}`);
    console.log('');
    console.log(`   ⚙️  Configurações:`);
    console.log(`      ✅ Criadas: ${configuracoesResult.created}`);
    console.log(`      ♻️  Atualizadas: ${configuracoesResult.updated}`);
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const totalEspacos = espacosResult.created + espacosResult.updated;
    const totalExtras = extrasResult.created + extrasResult.updated;
    const totalConfigs = configuracoesResult.created + configuracoesResult.updated;
    console.log(`🚀 Database Seeded: ${totalEspacos} espaços, ${totalExtras} extras, ${totalConfigs} configs`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('✅ O banco de dados está pronto para uso!');
    console.log('');

    process.exit(0);
  } catch (error) {
    const errorTimestamp = new Date().toISOString();
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error(`[SEED-DB] ${errorTimestamp} - ❌ ERRO FATAL NO SEEDING`);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('');
    console.error(`Erro: ${error.message}`);
    console.error('');
    console.error('💡 Dicas de troubleshooting:');
    console.error('   - Verifique se as credenciais Firebase estão corretas');
    console.error('   - Confirme que o service account tem permissões de escrita no Firestore');
    console.error('   - Verifique a conectividade com o Firebase');
    console.error('   - Consulte os logs acima para mais detalhes');
    console.error('');
    process.exit(1);
  }
}

// Executar o seeding
seedDatabase()
  .then(() => {
    const successTimestamp = new Date().toISOString();
    console.log(`[SEED-DB] ${successTimestamp} - Script finalizado com sucesso`);
  })
  .catch((error) => {
    const fatalTimestamp = new Date().toISOString();
    console.error(`[SEED-DB] ${fatalTimestamp} - ❌ Erro fatal não tratado: ${error.message}`);
    console.error(`[SEED-DB] Stack: ${error.stack}`);
    process.exit(1);
  });
