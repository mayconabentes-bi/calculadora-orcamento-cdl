// assets/js/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc, query, where, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyD-V2GNT5koNgR4r95RGbhIyfKOJd1oUbc",
  authDomain: "axioma-cdl-manaus.firebaseapp.com",
  projectId: "axioma-cdl-manaus",
  storageBucket: "axioma-cdl-manaus.firebasestorage.app",
  messagingSenderId: "748023320826",
  appId: "1:748023320826:web:97cd9ab757f19567fe3943",
  measurementId: "G-0VF64LKRPG"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);

// Exportar instâncias e métodos do Firestore para o DataManager
export { db, collection, addDoc, getDocs, updateDoc, doc, query, where, getDoc, analytics };
