/* assets/js/firebase-config.js */
// ================================================================
// INFRASTRUCTURE LAYER - SINGLETON PATTERN
// Arquitetura Zero Trust - Axioma v5.2.0
// SGQ-SECURITY: Inicialização Única Garantida
// ================================================================

// 1. Importações Modulares do Firebase (v10.8.0)
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getFirestore, collection, addDoc, getDocs, 
    updateDoc, setDoc, doc, query, where, getDoc, 
    orderBy, limit, Timestamp, deleteDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { 
    getAuth, onAuthStateChanged, signOut 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";

// 2. Configuração Blindada
// Nota: Chaves públicas no frontend são padrão, mas o domínio deve estar na allowlist do console
const firebaseConfig = {
    apiKey: "AIzaSyD-V2GNT5koNgR4r95RGbhIyfKOJd1oUbc",
    authDomain: "axioma-cdl-manaus.firebaseapp.com",
    projectId: "axioma-cdl-manaus",
    storageBucket: "axioma-cdl-manaus.firebasestorage.app",
    messagingSenderId: "748023320826",
    appId: "1:748023320826:web:97cd9ab757f19567fe3943",
    measurementId: "G-0VF64LKRPG"
};

// 3. Implementação Singleton (O Coração da Estabilidade)
let app;
let db;
let auth;
let analytics;

// Verifica se já existe uma instância a correr (evita erro de duplicidade)
if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    console.log('[SGQ-INFRA] 🚀 Firebase Inicializado (Cold Start)');
} else {
    app = getApps()[0];
    console.log('[SGQ-INFRA] ♻️ Firebase Reutilizado (Warm Start)');
}

// 4. Inicialização dos Serviços
try {
    db = getFirestore(app);
    auth = getAuth(app);
    analytics = getAnalytics(app);
    console.log('[SGQ-INFRA] Serviços Conectados: Auth, Firestore, Analytics');
} catch (error) {
    console.error('[SGQ-INFRA] ❌ Erro Crítico na Inicialização dos Serviços:', error);
}

// 5. Exportação Centralizada (Facade Pattern)
// Exportamos as instâncias e também os métodos utilitários para centralizar a dependência
export { 
    // Instâncias
    app, db, auth, analytics,
    
    // Métodos Firestore
    collection, addDoc, getDocs, updateDoc, setDoc, doc, 
    query, where, getDoc, orderBy, limit, Timestamp, deleteDoc,
    
    // Métodos Auth
    onAuthStateChanged, signOut
};
