// assets/js/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, updateDoc, setDoc, doc, query, where, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyD-V2GNT5koNgR4r95RGbhIyfKOJd1oUbc",
  authDomain: "axioma-cdl-manaus.firebaseapp.com",
  projectId: "axioma-cdl-manaus",
  storageBucket: "axioma-cdl-manaus.firebasestorage.app",
  messagingSenderId: "748023320826",
  appId: "1:748023320826:web:97cd9ab757f19567fe3943",
  measurementId: "G-0VF64LKRPG"
};

// Inicializar Firebase (apenas uma vez)
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const analytics = getAnalytics(app);

console.log('[SGQ-SECURITY] Firebase Bridge: setDoc habilitado para UPSERT');

// Exportar instâncias e métodos do Firestore para o DataManager
export { app, db, auth, collection, addDoc, getDocs, updateDoc, setDoc, doc, query, where, getDoc, analytics };
