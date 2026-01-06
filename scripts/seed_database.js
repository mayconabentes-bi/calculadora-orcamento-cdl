/**
 * Database Seeding Script
 * Axioma CDL - Sistema de Orçamento v5.2.0
 * 
 * Popula o Firestore com dados iniciais necessários para o sistema
 * - Espaços (salas) com custos base
 * - Itens extras (equipamentos)
 * - Configurações de multiplicadores de turno
 * 
 * Uso: npm run seed:database
 */

require('dotenv').config();
const admin = require('firebase-admin');
const { getFirebaseCredentials, displayConfigurationInfo } = require('../firebase-key-handler');

const timestamp = new Date().toISOString();
console.log(`[SEED] ${timestamp} - Database Seeding Script Started`);
console.log('');

// ============================================================================
// FIREBASE INITIALIZATION
// ============================================================================

try {
  displayConfigurationInfo();
  
  const credential = getFirebaseCredentials();
  
  admin.initializeApp({
    credential: admin.credential.cert(credential)
  });
  
  console.log(`[SEED] ✅ Firebase Admin initialized successfully`);
  console.log(`[SEED]    Project: ${credential.projectId}`);
  console.log('');
} catch (error) {
  console.error(`[SEED] ❌ FATAL ERROR: Could not initialize Firebase Admin`);
  console.error(`[SEED]    ${error.message}`);
  console.error('');
  console.error('🔧 To fix:');
  console.error('   1. Copy template: cp .env.example .env');
  console.error('   2. Configure Firebase credentials in .env');
  console.error('   3. Run: node convert-private-key-to-base64.js (if needed)');
  console.error('');
  process.exit(1);
}

const db = admin.firestore();

// ============================================================================
// SEED DATA DEFINITIONS
// ============================================================================

const espacos = [
  {
    id: 'djlm-auditorio',
    nome: 'DJLM - Auditório',
    capacidade: 200,
    custoBase: 150.00,
    descricao: 'Auditório principal com capacidade para 200 pessoas',
    ativo: true
  },
  {
    id: 'sala-vip-1',
    nome: 'Sala VIP 1',
    capacidade: 50,
    custoBase: 80.00,
    descricao: 'Sala VIP com infraestrutura completa',
    ativo: true
  },
  {
    id: 'sala-vip-2',
    nome: 'Sala VIP 2',
    capacidade: 50,
    custoBase: 80.00,
    descricao: 'Sala VIP com infraestrutura completa',
    ativo: true
  },
  {
    id: 'sala-conferencia-1',
    nome: 'Sala de Conferência 1',
    capacidade: 30,
    custoBase: 60.00,
    descricao: 'Sala de conferência equipada',
    ativo: true
  },
  {
    id: 'sala-conferencia-2',
    nome: 'Sala de Conferência 2',
    capacidade: 30,
    custoBase: 60.00,
    descricao: 'Sala de conferência equipada',
    ativo: true
  },
  {
    id: 'sala-reuniao-1',
    nome: 'Sala de Reunião 1',
    capacidade: 15,
    custoBase: 40.00,
    descricao: 'Sala de reunião para pequenos grupos',
    ativo: true
  },
  {
    id: 'sala-reuniao-2',
    nome: 'Sala de Reunião 2',
    capacidade: 15,
    custoBase: 40.00,
    descricao: 'Sala de reunião para pequenos grupos',
    ativo: true
  },
  {
    id: 'sala-treinamento',
    nome: 'Sala de Treinamento',
    capacidade: 40,
    custoBase: 70.00,
    descricao: 'Sala para treinamentos e workshops',
    ativo: true
  },
  {
    id: 'espaco-coworking',
    nome: 'Espaço Coworking',
    capacidade: 25,
    custoBase: 35.00,
    descricao: 'Espaço compartilhado de trabalho',
    ativo: true
  },
  {
    id: 'sala-diretoria',
    nome: 'Sala da Diretoria',
    capacidade: 20,
    custoBase: 100.00,
    descricao: 'Sala executiva premium',
    ativo: true
  }
];

const extras = [
  {
    id: 'projetor',
    nome: 'Projetor Multimídia',
    custo: 5.00,
    unidade: 'hora',
    descricao: 'Projetor Full HD',
    ativo: true
  },
  {
    id: 'sonorizacao',
    nome: 'Sistema de Sonorização',
    custo: 8.00,
    unidade: 'hora',
    descricao: 'Sistema de som completo',
    ativo: true
  },
  {
    id: 'microfone',
    nome: 'Microfone sem Fio',
    custo: 3.00,
    unidade: 'hora',
    descricao: 'Microfone profissional',
    ativo: true
  },
  {
    id: 'notebook',
    nome: 'Notebook',
    custo: 10.00,
    unidade: 'hora',
    descricao: 'Notebook para apresentações',
    ativo: true
  },
  {
    id: 'flip-chart',
    nome: 'Flip Chart',
    custo: 2.00,
    unidade: 'hora',
    descricao: 'Flip chart com material',
    ativo: true
  }
];

const configuracoes = {
  multiplicadores: {
    manha: 1.0,
    tarde: 1.15,
    noite: 1.40,
    descricao: 'Multiplicadores de turno para cálculo de custos'
  },
  sistema: {
    versao: '5.2.0',
    nome: 'Axioma: Inteligência de Margem',
    descricao: 'Sistema de precificação CDL/UTV'
  }
};

// ============================================================================
// SEEDING FUNCTIONS
// ============================================================================

async function seedEspacos() {
  console.log('[SEED] 📦 Seeding Spaces (Espaços)...');
  
  let created = 0;
  let updated = 0;
  
  for (const espaco of espacos) {
    try {
      const espacoRef = db.collection('espacos').doc(espaco.id);
      const doc = await espacoRef.get();
      
      const data = {
        ...espaco,
        atualizadoEm: new Date().toISOString(),
        criadoEm: doc.exists ? (doc.data().criadoEm || new Date().toISOString()) : new Date().toISOString()
      };
      
      await espacoRef.set(data, { merge: true });
      
      if (doc.exists) {
        updated++;
        console.log(`[SEED]    ✓ Updated: ${espaco.nome}`);
      } else {
        created++;
        console.log(`[SEED]    ✓ Created: ${espaco.nome}`);
      }
    } catch (error) {
      console.error(`[SEED]    ✗ Error with ${espaco.nome}:`, error.message);
    }
  }
  
  console.log(`[SEED] ✅ Spaces: ${created} created, ${updated} updated`);
  console.log('');
}

async function seedExtras() {
  console.log('[SEED] 📦 Seeding Extras (Equipment)...');
  
  let created = 0;
  let updated = 0;
  
  for (const extra of extras) {
    try {
      const extraRef = db.collection('extras').doc(extra.id);
      const doc = await extraRef.get();
      
      const data = {
        ...extra,
        atualizadoEm: new Date().toISOString(),
        criadoEm: doc.exists ? (doc.data().criadoEm || new Date().toISOString()) : new Date().toISOString()
      };
      
      await extraRef.set(data, { merge: true });
      
      if (doc.exists) {
        updated++;
        console.log(`[SEED]    ✓ Updated: ${extra.nome}`);
      } else {
        created++;
        console.log(`[SEED]    ✓ Created: ${extra.nome}`);
      }
    } catch (error) {
      console.error(`[SEED]    ✗ Error with ${extra.nome}:`, error.message);
    }
  }
  
  console.log(`[SEED] ✅ Extras: ${created} created, ${updated} updated`);
  console.log('');
}

async function seedConfiguracoes() {
  console.log('[SEED] 📦 Seeding Configuration...');
  
  try {
    const configRef = db.collection('configuracoes').doc('sistema');
    
    await configRef.set({
      ...configuracoes,
      atualizadoEm: new Date().toISOString()
    }, { merge: true });
    
    console.log('[SEED]    ✓ System configuration updated');
    console.log('[SEED] ✅ Configuration seeded successfully');
    console.log('');
  } catch (error) {
    console.error('[SEED]    ✗ Error seeding configuration:', error.message);
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('DATABASE SEEDING - Axioma CDL');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('');
  
  try {
    await seedEspacos();
    await seedExtras();
    await seedConfiguracoes();
    
    console.log('═══════════════════════════════════════════════════════════════════');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY');
    console.log('═══════════════════════════════════════════════════════════════════');
    console.log('');
    console.log('Summary:');
    console.log(`  - ${espacos.length} spaces configured`);
    console.log(`  - ${extras.length} extras configured`);
    console.log('  - System configuration updated');
    console.log('');
    console.log('Next step: Run health check');
    console.log('  npm run health:check');
    console.log('');
    
    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('═══════════════════════════════════════════════════════════════════');
    console.error('❌ DATABASE SEEDING FAILED');
    console.error('═══════════════════════════════════════════════════════════════════');
    console.error('');
    console.error('Error:', error.message);
    console.error('');
    process.exit(1);
  }
}

// Execute main function
main();
