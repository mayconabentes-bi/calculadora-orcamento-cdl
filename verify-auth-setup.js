#!/usr/bin/env node

/**
 * Verify Authentication Setup Script
 * Versão 2.0 - Arquitetura Gemini (Zero Trust com Variáveis de Ambiente)
 * 
 * This script helps diagnose authentication issues by:
 * 1. Checking if firebase-admin is installed
 * 2. Checking if dotenv is installed
 * 3. Checking if .env file exists and has required variables
 * 4. Testing Firebase connection with environment variables
 * 5. Verifying the user exists in Firebase
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║  Authentication Setup Verification Tool v2.0                  ║');
console.log('║  Arquitetura Gemini (Zero Trust)                              ║');
console.log('╚════════════════════════════════════════════════════════════════╝');
console.log('');

// Check if firebase-admin is installed
console.log('1️⃣  Checking firebase-admin installation...');
try {
  require('firebase-admin');
  console.log('   ✅ firebase-admin is installed');
} catch (error) {
  console.log('   ❌ firebase-admin is NOT installed');
  console.log('   Run: npm install firebase-admin');
  console.log('');
}

// Check if dotenv is installed
console.log('');
console.log('2️⃣  Checking dotenv installation...');
try {
  require('dotenv');
  console.log('   ✅ dotenv is installed');
} catch (error) {
  console.log('   ❌ dotenv is NOT installed');
  console.log('   Run: npm install dotenv');
  console.log('');
}

// Check for .env file
console.log('');
console.log('3️⃣  Checking for .env configuration...');
const envPath = path.join(__dirname, '.env');
const hasEnvFile = fs.existsSync(envPath);

if (hasEnvFile) {
  console.log('   ✅ .env file found');
} else {
  console.log('   ❌ .env file NOT found');
  console.log('');
  console.log('   To create .env file:');
  console.log('   1. Copy the template: cp .env.example .env');
  console.log('   2. Edit .env with your Firebase credentials');
  console.log('   3. Get credentials from: https://console.firebase.google.com/');
  console.log('      → Project Settings → Service Accounts → Generate Private Key');
  console.log('');
}

// Check for required environment variables
console.log('');
console.log('4️⃣  Checking environment variables...');
const requiredVars = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_CLIENT_EMAIL'
];

let allVarsPresent = true;
requiredVars.forEach(varName => {
  if (process.env[varName] && process.env[varName].trim() !== '') {
    console.log(`   ✅ ${varName} is set`);
  } else {
    console.log(`   ❌ ${varName} is NOT set`);
    allVarsPresent = false;
  }
});

// Check for legacy serviceAccountKey.json (should NOT exist)
console.log('');
console.log('5️⃣  Checking for legacy credential files...');
const legacyFiles = [
  'serviceAccountKey.json',
  'axioma-cdl-manaus-firebase-adminsdk-fbsvc-586ddd7211.json'
];

let foundLegacyFiles = false;
legacyFiles.forEach(filename => {
  const filePath = path.join(__dirname, filename);
  if (fs.existsSync(filePath)) {
    console.log(`   ⚠️  LEGACY FILE FOUND: ${filename}`);
    console.log(`      DELETE THIS FILE IMMEDIATELY for security!`);
    foundLegacyFiles = true;
  }
});

if (!foundLegacyFiles) {
  console.log('   ✅ No legacy credential files found (good!)');
}

// Try to connect to Firebase (if all vars are set)
if (allVarsPresent && hasEnvFile) {
  console.log('');
  console.log('6️⃣  Testing Firebase connection...');
  
  (async () => {
    try {
      const admin = require('firebase-admin');
      
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL
        })
      });
      
      console.log('   ✅ Successfully connected to Firebase!');
      console.log(`      Project: ${process.env.FIREBASE_PROJECT_ID}`);
      console.log(`      Service Account: ${process.env.FIREBASE_CLIENT_EMAIL}`);
      
      // Try to verify the developer user
      const auth = admin.auth();
      const db = admin.firestore();
      const developerEmail = 'mayconabentes@gmail.com';
      
      console.log('');
      console.log('7️⃣  Verifying developer user...');
      console.log('   📧 Checking for user:', developerEmail);
      
      try {
        const userRecord = await auth.getUserByEmail(developerEmail);
        console.log('   ✅ User exists in Firebase Authentication');
        console.log('      UID:', userRecord.uid);
        console.log('      Email:', userRecord.email);
        console.log('      Disabled:', userRecord.disabled);
        
        // Check if user exists in Firestore
        const userDoc = await db.collection('usuarios').doc(userRecord.uid).get();
        
        if (userDoc.exists) {
          const userData = userDoc.data();
          console.log('   ✅ User document exists in Firestore');
          console.log('      Nome:', userData.nome);
          console.log('      Role:', userData.role);
          console.log('      Status:', userData.status);
          
          if (userData.status === 'ativo') {
            console.log('');
            console.log('   ✅ ALL CHECKS PASSED!');
            console.log('');
            console.log('   User should be able to login with:');
            console.log('   Email: mayconabentes@gmail.com');
            console.log('   Password: Aprendiz@33');
          } else {
            console.log('');
            console.log('   ⚠️  User exists but status is:', userData.status);
            console.log('   The user needs to be "ativo" to login.');
            console.log('   Update the status in Firestore or run: npm run setup:user');
          }
        } else {
          console.log('   ⚠️  User exists in Authentication but NOT in Firestore');
          console.log('   Run: npm run setup:user');
        }
      } catch (error) {
        if (error.code === 'auth/user-not-found') {
          console.log('   ⚠️  User does NOT exist in Firebase Authentication');
          console.log('   Run: npm run setup:user');
        } else {
          console.log('   ❌ Error checking user:', error.message);
        }
      }
      
      // Summary
      console.log('');
      console.log('═══════════════════════════════════════════════════════════════');
      console.log('SUMMARY');
      console.log('═══════════════════════════════════════════════════════════════');
      
      if (hasEnvFile && allVarsPresent && !foundLegacyFiles) {
        console.log('✅ Your authentication setup looks good!');
        console.log('   You can now run: npm run setup:user');
      } else {
        console.log('⚠️  Action required:');
        if (!hasEnvFile) {
          console.log('   1. Create .env file: cp .env.example .env');
        }
        if (!allVarsPresent) {
          console.log('   2. Configure Firebase credentials in .env');
        }
        if (foundLegacyFiles) {
          console.log('   3. DELETE legacy credential JSON files!');
        }
        console.log('');
        console.log('📚 For detailed instructions, see: ENVIRONMENT_VARIABLES_GUIDE.md');
      }
      
      console.log('');
      process.exit(0);
      
    } catch (error) {
      console.log('   ❌ Failed to connect to Firebase');
      console.log(`      Error: ${error.message}`);
      console.log('');
      console.log('═══════════════════════════════════════════════════════════════');
      console.log('SUMMARY');
      console.log('═══════════════════════════════════════════════════════════════');
      console.log('⚠️  Could not connect to Firebase. Please check:');
      console.log('   1. FIREBASE_PRIVATE_KEY format (must include \\n for line breaks)');
      console.log('   2. All credentials are correct in .env file');
      console.log('   3. Service account has proper permissions');
      console.log('');
      console.log('📚 For detailed instructions, see: ENVIRONMENT_VARIABLES_GUIDE.md');
      console.log('');
      process.exit(1);
    }
  })();
} else {
  // Summary when env vars not present
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════');
  
  if (hasEnvFile && allVarsPresent && !foundLegacyFiles) {
    console.log('✅ Your authentication setup looks good!');
    console.log('   You can now run: npm run setup:user');
  } else {
    console.log('⚠️  Action required:');
    if (!hasEnvFile) {
      console.log('   1. Create .env file: cp .env.example .env');
    }
    if (!allVarsPresent) {
      console.log('   2. Configure Firebase credentials in .env');
    }
    if (foundLegacyFiles) {
      console.log('   3. DELETE legacy credential JSON files!');
    }
    console.log('');
    console.log('📚 For detailed instructions, see: ENVIRONMENT_VARIABLES_GUIDE.md');
  }
  
  console.log('');
}
