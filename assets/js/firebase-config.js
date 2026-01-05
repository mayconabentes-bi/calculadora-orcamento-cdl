// assets/js/firebase-config.js
// ================================================================
// SINGLETON PATTERN - FIREBASE CONFIGURATION
// Arquitetura Zero Trust - Axioma v5.1.0
// SGQ-SECURITY: Única inicialização garantida do Firebase
// ================================================================

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, updateDoc, setDoc, doc, query, where, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

/**
 * Singleton Pattern: FirebaseConfig
 * Garante que Firebase seja inicializado apenas uma vez
 * Previne múltiplas inicializações e conflitos de instância
 */
class FirebaseConfig {
  constructor() {
    if (FirebaseConfig.instance) {
      console.log('[SGQ-SECURITY] Firebase já inicializado - retornando instância existente');
      return FirebaseConfig.instance;
    }

    const firebaseConfig = {
      apiKey: "AIzaSyD-V2GNT5koNgR4r95RGbhIyfKOJd1oUbc",
      authDomain: "axioma-cdl-manaus.firebaseapp.com",
      projectId: "axioma-cdl-manaus",
      storageBucket: "axioma-cdl-manaus.firebasestorage.app",
      messagingSenderId: "748023320826",
      appId: "1:748023320826:web:97cd9ab757f19567fe3943",
      measurementId: "G-0VF64LKRPG"
    };

    // Verificar se Firebase já foi inicializado
    const existingApps = getApps();
    if (existingApps.length > 0) {
      console.log('[SGQ-SECURITY] Firebase já inicializado anteriormente - reutilizando');
      this.app = existingApps[0];
    } else {
      console.log('[SGQ-SECURITY] Inicializando Firebase pela primeira vez');
      this.app = initializeApp(firebaseConfig);
    }

    this.db = getFirestore(this.app);
    this.auth = getAuth(this.app);
    this.analytics = getAnalytics(this.app);

    console.log('[SGQ-SECURITY] Firebase Singleton inicializado');
    console.log('[SGQ-SECURITY] Firebase Bridge: setDoc habilitado para UPSERT');
    console.log('[SGQ-SECURITY] Timestamp:', new Date().toISOString());

    // Armazenar instância singleton
    FirebaseConfig.instance = this;
  }

  getApp() {
    return this.app;
  }

  getDb() {
    return this.db;
  }

  getAuth() {
    return this.auth;
  }

  getAnalytics() {
    return this.analytics;
  }
}

// Criar e exportar instância singleton
const firebaseInstance = new FirebaseConfig();
const app = firebaseInstance.getApp();
const db = firebaseInstance.getDb();
const auth = firebaseInstance.getAuth();
const analytics = firebaseInstance.getAnalytics();

// Exportar instâncias e métodos do Firestore para o DataManager
export { app, db, auth, collection, addDoc, getDocs, updateDoc, setDoc, doc, query, where, getDoc, analytics };
