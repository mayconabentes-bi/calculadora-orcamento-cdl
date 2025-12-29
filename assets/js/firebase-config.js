// assets/js/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc, query, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Suas chaves copiadas do Console
const firebaseConfig = {
  apiKey: "SUA_API_KEY_AQUI",
  authDomain: "axioma-cdl.firebaseapp.com",
  projectId: "axioma-cdl",
  storageBucket: "axioma-cdl.appspot.com",
  messagingSenderId: "SEU_SENDER_ID",
  appId: "SEU_APP_ID"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Exporta as funções para usar no DataManager
export { db, collection, addDoc, getDocs, updateDoc, doc, query, where };
