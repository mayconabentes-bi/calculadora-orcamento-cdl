#!/usr/bin/env node

/**
 * Verify Authentication Setup Script
 * 
 * This script helps diagnose authentication issues by:
 * 1. Checking if firebase-admin is installed
 * 2. Checking if serviceAccountKey.json exists
 * 3. If available, verifying the user exists in Firebase
 * 4. Providing instructions for manual setup
 */

const fs = require('fs');
const path = require('path');

console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║  Authentication Setup Verification Tool                       ║');
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

// Check if serviceAccountKey.json exists
console.log('');
console.log('2️⃣  Checking for Firebase service account key...');
const serviceKeyPath = path.join(__dirname, 'serviceAccountKey.json');
const hasServiceKey = fs.existsSync(serviceKeyPath);

if (hasServiceKey) {
  console.log('   ✅ serviceAccountKey.json found');
} else {
  console.log('   ❌ serviceAccountKey.json NOT found');
  console.log('');
  console.log('   To obtain the service account key:');
  console.log('   1. Go to Firebase Console: https://console.firebase.google.com/');
  console.log('   2. Select project: axioma-cdl-manaus');
  console.log('   3. Go to Project Settings > Service Accounts');
  console.log('   4. Click "Generate new private key"');
  console.log('   5. Save the file as "serviceAccountKey.json" in the project root');
  console.log('');
}

// If we have the service key, try to verify the user
if (hasServiceKey) {
  console.log('');
  console.log('3️⃣  Attempting to verify developer user...');
  
  (async () => {
    try {
      const admin = require('firebase-admin');
      const serviceAccount = require('./serviceAccountKey.json');
      
      // Initialize Firebase Admin
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      
      const auth = admin.auth();
      const db = admin.firestore();
      
      const developerEmail = 'mayconabentes@gmail.com';
      
      console.log('   📧 Checking for user:', developerEmail);
      
      // Check if user exists in Authentication
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
          throw error;
        }
      }
      
      process.exit(0);
    } catch (error) {
      console.error('   ❌ Error:', error.message);
      process.exit(1);
    }
  })();
} else {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
  console.log('📋 MANUAL SETUP INSTRUCTIONS');
  console.log('');
  console.log('Since the service account key is not available, you can set up');
  console.log('the developer user manually via Firebase Console:');
  console.log('');
  console.log('Step 1: Create user in Authentication');
  console.log('────────────────────────────────────');
  console.log('1. Go to: https://console.firebase.google.com/');
  console.log('2. Select project: axioma-cdl-manaus');
  console.log('3. Click "Authentication" in the left menu');
  console.log('4. Click "Users" tab');
  console.log('5. Click "Add user" button');
  console.log('6. Enter:');
  console.log('   Email: mayconabentes@gmail.com');
  console.log('   Password: Aprendiz@33');
  console.log('7. Click "Add user"');
  console.log('8. ⚠️  COPY THE UID - you will need it!');
  console.log('');
  console.log('Step 2: Create document in Firestore');
  console.log('────────────────────────────────────');
  console.log('1. Click "Firestore Database" in the left menu');
  console.log('2. Navigate to or create collection: "usuarios"');
  console.log('3. Click "Add document"');
  console.log('4. Document ID: [paste the UID you copied]');
  console.log('5. Add these fields:');
  console.log('   • email (string): mayconabentes@gmail.com');
  console.log('   • nome (string): Maycon Abentes');
  console.log('   • role (string): admin');
  console.log('   • status (string): ativo');
  console.log('   • dataCriacao (string): ' + new Date().toISOString());
  console.log('6. Click "Save"');
  console.log('');
  console.log('Step 3: Test the login');
  console.log('────────────────────────────────────');
  console.log('1. Open index.html in your browser');
  console.log('2. Login with:');
  console.log('   Email: mayconabentes@gmail.com');
  console.log('   Password: Aprendiz@33');
  console.log('3. You should be redirected to dashboard-admin.html');
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
}
