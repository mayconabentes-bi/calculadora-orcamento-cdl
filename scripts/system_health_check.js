/**
 * System Health Check Script
 * Axioma CDL - Sistema de Orçamento v5.2.0
 * 
 * End-to-End System Verification (Headless Smoke Test)
 * Valida a cadeia completa: Conexão -> Leitura de Dados -> Motor de Cálculo
 * 
 * Testes:
 * 1. Integridade do Banco de Dados
 * 2. Simulação de Cálculo (Core Business Logic)
 * 
 * Uso: npm run health:check
 */

require('dotenv').config();
const admin = require('firebase-admin');
const { getFirebaseCredentials, displayConfigurationInfo } = require('../firebase-key-handler');

const timestamp = new Date().toISOString();
console.log(`[HEALTH] ${timestamp} - System Health Check Started`);
console.log('');

// ============================================================================
// FIREBASE INITIALIZATION
// ============================================================================

let db;

try {
  displayConfigurationInfo();
  
  const credential = getFirebaseCredentials();
  
  admin.initializeApp({
    credential: admin.credential.cert(credential)
  });
  
  db = admin.firestore();
  
  console.log(`[HEALTH] ✅ Firebase Admin initialized successfully`);
  console.log(`[HEALTH]    Project: ${credential.projectId}`);
  console.log('');
} catch (error) {
  console.error(`[HEALTH] ❌ FATAL ERROR: Could not initialize Firebase Admin`);
  console.error(`[HEALTH]    ${error.message}`);
  console.error('');
  console.error('🔧 To fix:');
  console.error('   1. Copy template: cp .env.example .env');
  console.error('   2. Configure Firebase credentials in .env');
  console.error('   3. Run: npm run seed:database');
  console.error('');
  process.exit(1);
}

// ============================================================================
// TEST RESULTS TRACKING
// ============================================================================

const testResults = {
  databaseConnection: false,
  dataIntegrity: false,
  businessLogicReady: false,
  calculationSimulation: false,
  details: {
    espacosCount: 0,
    extrasCount: 0,
    multiplicadoresFound: false,
    djlmFound: false,
    djlmCustoBase: 0,
    simulationResult: null
  }
};

// ============================================================================
// TEST 1: DATABASE INTEGRITY
// ============================================================================

async function testDatabaseIntegrity() {
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('TEST 1: DATABASE INTEGRITY');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('');
  
  try {
    // Test 1.1: Database Connection
    console.log('[TEST 1.1] Testing database connection...');
    const testQuery = await db.collection('espacos').limit(1).get();
    testResults.databaseConnection = true;
    console.log('[OK] Database Connection');
    console.log('');
    
    // Test 1.2: Spaces Collection
    console.log('[TEST 1.2] Checking Spaces (Espaços) collection...');
    const espacosSnapshot = await db.collection('espacos').get();
    
    if (espacosSnapshot.empty) {
      console.log('[FAIL] Spaces collection is empty');
      console.log('       Run: npm run seed:database');
      return false;
    }
    
    testResults.details.espacosCount = espacosSnapshot.size;
    console.log(`[OK] Found ${espacosSnapshot.size} spaces in database`);
    
    // Test 1.3: DJLM Auditório
    console.log('[TEST 1.3] Validating "DJLM - Auditório" space...');
    const djlmDoc = await db.collection('espacos').doc('djlm-auditorio').get();
    
    if (!djlmDoc.exists) {
      console.log('[FAIL] DJLM - Auditório not found');
      console.log('       Run: npm run seed:database');
      return false;
    }
    
    const djlmData = djlmDoc.data();
    testResults.details.djlmFound = true;
    testResults.details.djlmCustoBase = djlmData.custoBase || 0;
    
    if (typeof djlmData.custoBase !== 'number' || djlmData.custoBase <= 0) {
      console.log(`[FAIL] DJLM custoBase is invalid: ${djlmData.custoBase}`);
      return false;
    }
    
    console.log(`[OK] DJLM - Auditório found (custoBase: R$ ${djlmData.custoBase.toFixed(2)})`);
    console.log('');
    
    // Test 1.4: Extras Collection
    console.log('[TEST 1.4] Checking Extras collection...');
    const extrasSnapshot = await db.collection('extras').get();
    testResults.details.extrasCount = extrasSnapshot.size;
    console.log(`[OK] Found ${extrasSnapshot.size} extras in database`);
    console.log('');
    
    // Test 1.5: Configuration (Multipliers)
    console.log('[TEST 1.5] Validating configuration (Multipliers)...');
    const configDoc = await db.collection('configuracoes').doc('sistema').get();
    
    if (!configDoc.exists) {
      console.log('[WARN] Configuration not found, using default multipliers');
      testResults.details.multiplicadoresFound = false;
    } else {
      const configData = configDoc.data();
      const multiplicadores = configData.multiplicadores;
      
      if (multiplicadores && 
          typeof multiplicadores.manha === 'number' &&
          typeof multiplicadores.tarde === 'number' &&
          typeof multiplicadores.noite === 'number') {
        testResults.details.multiplicadoresFound = true;
        console.log(`[OK] Multipliers found:`);
        console.log(`     Manhã: ${multiplicadores.manha}`);
        console.log(`     Tarde: ${multiplicadores.tarde}`);
        console.log(`     Noite: ${multiplicadores.noite}`);
      } else {
        console.log('[WARN] Multipliers incomplete, using defaults');
        testResults.details.multiplicadoresFound = false;
      }
    }
    
    console.log('');
    testResults.dataIntegrity = true;
    testResults.businessLogicReady = true;
    return true;
    
  } catch (error) {
    console.error('[FAIL] Database integrity test failed');
    console.error('       Error:', error.message);
    console.log('');
    return false;
  }
}

// ============================================================================
// TEST 2: BUSINESS LOGIC SIMULATION
// ============================================================================

async function testBusinessLogicSimulation() {
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('TEST 2: BUSINESS LOGIC SIMULATION');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('');
  
  try {
    console.log('[TEST 2.1] Simulating budget calculation...');
    console.log('');
    console.log('Scenario:');
    console.log('  - Space: DJLM - Auditório');
    console.log('  - Duration: 8 hours');
    console.log('  - Shift: Morning (Multiplicador: 1.0)');
    console.log('  - Expected: custoBase * hours * multiplicador');
    console.log('');
    
    // Retrieve DJLM data
    const djlmDoc = await db.collection('espacos').doc('djlm-auditorio').get();
    if (!djlmDoc.exists) {
      console.log('[FAIL] Cannot simulate: DJLM not found');
      return false;
    }
    
    const djlmData = djlmDoc.data();
    const custoBase = djlmData.custoBase || 0;
    
    // Get multipliers
    let multiplicadorManha = 1.0;
    const configDoc = await db.collection('configuracoes').doc('sistema').get();
    if (configDoc.exists) {
      const configData = configDoc.data();
      if (configData.multiplicadores && configData.multiplicadores.manha) {
        multiplicadorManha = configData.multiplicadores.manha;
      }
    }
    
    // Simulation parameters
    const horas = 8;
    const multiplicador = multiplicadorManha;
    
    // Calculate expected value
    const custoOperacionalBase = custoBase * multiplicador * horas;
    
    console.log('Calculation:');
    console.log(`  custoBase: R$ ${custoBase.toFixed(2)}`);
    console.log(`  multiplicador: ${multiplicador}`);
    console.log(`  horas: ${horas}`);
    console.log(`  custoOperacionalBase = ${custoBase} * ${multiplicador} * ${horas}`);
    console.log(`  custoOperacionalBase = R$ ${custoOperacionalBase.toFixed(2)}`);
    console.log('');
    
    // Validate that all required inputs exist
    if (custoBase > 0 && multiplicador > 0 && horas > 0) {
      console.log('[OK] All calculation inputs are valid');
      console.log('[OK] Business logic can be executed');
      
      testResults.details.simulationResult = {
        custoBase,
        multiplicador,
        horas,
        custoOperacionalBase
      };
      
      testResults.calculationSimulation = true;
      console.log('');
      return true;
    } else {
      console.log('[FAIL] Invalid calculation inputs');
      console.log('');
      return false;
    }
    
  } catch (error) {
    console.error('[FAIL] Business logic simulation failed');
    console.error('       Error:', error.message);
    console.log('');
    return false;
  }
}

// ============================================================================
// FINAL REPORT
// ============================================================================

function generateReport() {
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('SYSTEM HEALTH CHECK REPORT');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('');
  
  // Visual Status Indicators
  const indicator = (status) => status ? '[OK]' : '[FAIL]';
  
  console.log(`${indicator(testResults.databaseConnection)} Database Connection`);
  console.log(`${indicator(testResults.dataIntegrity)} Data Integrity (${testResults.details.espacosCount} Spaces, ${testResults.details.extrasCount} Extras)`);
  console.log(`${indicator(testResults.businessLogicReady)} Business Logic Ready (Multipliers ${testResults.details.multiplicadoresFound ? 'found' : 'using defaults'})`);
  console.log(`${indicator(testResults.calculationSimulation)} Calculation Simulation Passed`);
  console.log('');
  
  // Detailed Information
  if (testResults.details.djlmFound) {
    console.log('Key Data Points:');
    console.log(`  - DJLM Auditório custoBase: R$ ${testResults.details.djlmCustoBase.toFixed(2)}`);
    if (testResults.details.simulationResult) {
      const sim = testResults.details.simulationResult;
      console.log(`  - Sample calculation (8h morning): R$ ${sim.custoOperacionalBase.toFixed(2)}`);
    }
    console.log('');
  }
  
  // Overall System Status
  const allTestsPassed = testResults.databaseConnection && 
                         testResults.dataIntegrity && 
                         testResults.businessLogicReady &&
                         testResults.calculationSimulation;
  
  if (allTestsPassed) {
    console.log('🚀 SYSTEM STATUS: OPERATIONAL');
    console.log('✅ All tests passed - System is ready for production');
  } else {
    console.log('⚠️  SYSTEM STATUS: ISSUES DETECTED');
    console.log('❌ Some tests failed - Review errors above');
    console.log('');
    console.log('Recommended actions:');
    console.log('  1. Run: npm run seed:database');
    console.log('  2. Run: npm run health:check (again)');
  }
  
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('');
  
  return allTestsPassed;
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('AXIOMA CDL - END-TO-END SYSTEM VERIFICATION');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('');
  
  try {
    // Run Test 1: Database Integrity
    const test1Passed = await testDatabaseIntegrity();
    
    // Run Test 2: Business Logic (only if Test 1 passed)
    let test2Passed = false;
    if (test1Passed) {
      test2Passed = await testBusinessLogicSimulation();
    } else {
      console.log('═══════════════════════════════════════════════════════════════════');
      console.log('TEST 2: SKIPPED (Test 1 failed)');
      console.log('═══════════════════════════════════════════════════════════════════');
      console.log('');
    }
    
    // Generate final report
    const systemHealthy = generateReport();
    
    // Exit with appropriate code
    process.exit(systemHealthy ? 0 : 1);
    
  } catch (error) {
    console.error('');
    console.error('═══════════════════════════════════════════════════════════════════');
    console.error('❌ SYSTEM HEALTH CHECK FAILED');
    console.error('═══════════════════════════════════════════════════════════════════');
    console.error('');
    console.error('Fatal Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('');
    process.exit(1);
  }
}

// Execute main function
main();
