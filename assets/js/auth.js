/* =================================================================
   AUTHENTICATION MODULE - AXIOMA: INTELIGÊNCIA DE MARGEM
   Sistema de autenticação com Firebase Authentication e Firestore
   ================================================================= */

// Imports das funções do Firebase Authentication
import { 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    createUserWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Imports das funções do Firestore
import { 
    doc, 
    getDoc, 
    setDoc, 
    collection, 
    getDocs,
    updateDoc 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Importar instâncias já inicializadas do firebase-config.js
import { auth, db } from './firebase-config.js';

/**
 * Classe AuthManager
 * Responsável por gerenciar autenticação e controle de acesso
 */
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.userMetadata = null;
    }

    /**
     * Realizar login com email e senha
     * @param {string} email 
     * @param {string} password 
     * @returns {Promise<object>} Dados do usuário
     */
    async login(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Buscar metadata do usuário no Firestore
            const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
            
            if (!userDoc.exists()) {
                throw new Error('Usuário não encontrado no sistema');
            }
            
            const userData = userDoc.data();
            
            // Verificar se o usuário está ativo
            if (userData.status !== 'ativo') {
                await signOut(auth);
                throw new Error('Usuário inativo. Entre em contato com o administrador.');
            }
            
            this.currentUser = user;
            this.userMetadata = userData;
            
            return {
                success: true,
                user: user,
                metadata: userData
            };
        } catch (error) {
            console.error('Erro no login:', error);
            throw error;
        }
    }

    /**
     * Realizar logout
     * @returns {Promise<void>}
     */
    async logout() {
        try {
            await signOut(auth);
            this.currentUser = null;
            this.userMetadata = null;
        } catch (error) {
            console.error('Erro no logout:', error);
            throw error;
        }
    }

    /**
     * Verificar se o usuário tem acesso ao dashboard
     * Redireciona para index.html se não autorizado
     * @returns {Promise<boolean>}
     */
    async verificarAcesso() {
        return new Promise((resolve, reject) => {
            onAuthStateChanged(auth, async (user) => {
                try {
                    if (!user) {
                        // Usuário não autenticado
                        resolve(false);
                        return;
                    }

                    // Buscar metadata do usuário
                    const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
                    
                    if (!userDoc.exists()) {
                        // Usuário não existe no Firestore
                        await signOut(auth);
                        resolve(false);
                        return;
                    }

                    const userData = userDoc.data();

                    // Verificar se está ativo
                    if (userData.status !== 'ativo') {
                        await signOut(auth);
                        resolve(false);
                        return;
                    }

                    // Usuário autenticado e ativo
                    this.currentUser = user;
                    this.userMetadata = userData;
                    resolve(true);
                } catch (error) {
                    console.error('Erro ao verificar acesso:', error);
                    reject(error);
                }
            });
        });
    }

    /**
     * Obter o usuário atual
     * @returns {object|null}
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Obter metadata do usuário atual
     * @returns {object|null}
     */
    getUserMetadata() {
        return this.userMetadata;
    }

    /**
     * Verificar se o usuário é admin ou superintendente
     * @returns {boolean}
     */
    isAdmin() {
        if (!this.userMetadata) return false;
        return this.userMetadata.role === 'admin' || this.userMetadata.role === 'superintendente';
    }

    /**
     * Criar novo usuário (apenas para admin/superintendente)
     * @param {string} email 
     * @param {string} password 
     * @param {string} nome 
     * @param {string} role - 'user', 'admin', 'superintendente'
     * @returns {Promise<object>}
     */
    async criarUsuario(email, password, nome, role = 'user') {
        try {
            // Verificar se o usuário atual é admin
            if (!this.isAdmin()) {
                throw new Error('Acesso negado. Apenas administradores podem criar usuários.');
            }

            // Criar usuário no Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Criar documento no Firestore com metadata
            await setDoc(doc(db, 'usuarios', user.uid), {
                email: email,
                nome: nome,
                role: role,
                status: 'ativo',
                dataCriacao: new Date().toISOString(),
                criadoPor: this.currentUser.uid
            });

            return {
                success: true,
                uid: user.uid,
                email: email
            };
        } catch (error) {
            console.error('Erro ao criar usuário:', error);
            throw error;
        }
    }

    /**
     * Listar todos os usuários (apenas para admin)
     * @returns {Promise<Array>}
     */
    async listarUsuarios() {
        try {
            if (!this.isAdmin()) {
                throw new Error('Acesso negado. Apenas administradores podem listar usuários.');
            }

            const usuariosSnapshot = await getDocs(collection(db, 'usuarios'));
            const usuarios = [];

            usuariosSnapshot.forEach(doc => {
                usuarios.push({
                    uid: doc.id,
                    ...doc.data()
                });
            });

            return usuarios;
        } catch (error) {
            console.error('Erro ao listar usuários:', error);
            throw error;
        }
    }

    /**
     * Atualizar status do usuário (apenas para admin)
     * @param {string} uid 
     * @param {string} status - 'ativo' ou 'inativo'
     * @returns {Promise<void>}
     */
    async atualizarStatusUsuario(uid, status) {
        try {
            if (!this.isAdmin()) {
                throw new Error('Acesso negado. Apenas administradores podem atualizar status.');
            }

            await updateDoc(doc(db, 'usuarios', uid), {
                status: status,
                dataAtualizacao: new Date().toISOString(),
                atualizadoPor: this.currentUser.uid
            });
        } catch (error) {
            console.error('Erro ao atualizar status do usuário:', error);
            throw error;
        }
    }
}

// Exportar instância singleton
const authManager = new AuthManager();
export default authManager;
