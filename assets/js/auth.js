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
     * SGQ-SECURITY: Inclui logs de auditoria detalhados
     * @param {string} email 
     * @param {string} password 
     * @returns {Promise<object>} Dados do usuário
     */
    async login(email, password) {
        const timestamp = new Date().toISOString();
        
        try {
            // Passo 1: Autenticação no Firebase Auth
            console.log('[SGQ-SECURITY] Iniciando autenticação | Timestamp:', timestamp);
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log('[SGQ-SECURITY] Autenticação Firebase Auth bem-sucedida | UID:', user.uid);
            
            // Passo 2: Buscar metadata do usuário no Firestore
            console.log('[SGQ-SECURITY] Verificando metadados no Firestore | UID:', user.uid);
            const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
            
            if (!userDoc.exists()) {
                await signOut(auth);
                const errorTimestamp = new Date().toISOString();
                console.error('[SGQ-SECURITY] FALHA: Usuário autenticado mas ausente no Firestore');
                console.error('[SGQ-SECURITY] Tipo de erro: Metadados ausentes (Firestore)');
                console.error('[SGQ-SECURITY] UID:', user.uid);
                console.error('[SGQ-SECURITY] Email:', email);
                console.error('[SGQ-SECURITY] Timestamp:', errorTimestamp);
                throw new Error('Usuário não encontrado no sistema');
            }
            
            const userData = userDoc.data();
            console.log('[SGQ-SECURITY] Metadados encontrados | Role:', userData.role, '| Status:', userData.status);
            
            // Passo 3: Verificar se o usuário está ativo
            if (userData.status !== 'ativo') {
                await signOut(auth);
                const errorTimestamp = new Date().toISOString();
                console.error('[SGQ-SECURITY] FALHA: Usuário inativo');
                console.error('[SGQ-SECURITY] Status atual:', userData.status);
                console.error('[SGQ-SECURITY] Email:', email);
                console.error('[SGQ-SECURITY] Role:', userData.role);
                console.error('[SGQ-SECURITY] Timestamp:', errorTimestamp);
                throw new Error('Usuário inativo. Entre em contato com o administrador.');
            }
            
            this.currentUser = user;
            this.userMetadata = userData;
            
            // SGQ-SECURITY: Log de sucesso de login com role
            const successTimestamp = new Date().toISOString();
            console.log('[SGQ-SECURITY] ✅ Acesso validado para role:', userData.role, '| Timestamp:', successTimestamp);
            console.log('[SGQ-SECURITY] Login bem-sucedido');
            console.log('[SGQ-SECURITY] Email:', email);
            console.log('[SGQ-SECURITY] UID:', user.uid);
            console.log('[SGQ-SECURITY] Role:', userData.role);
            console.log('[SGQ-SECURITY] Status:', userData.status);
            
            return {
                success: true,
                user: user,
                metadata: userData
            };
        } catch (error) {
            // SGQ-SECURITY: Log detalhado de falha no login
            const errorTimestamp = new Date().toISOString();
            
            // Determinar tipo de erro (Auth vs Firestore)
            let errorType = 'Credencial (Auth)';
            if (error.message === 'Usuário não encontrado no sistema') {
                errorType = 'Metadados ausentes (Firestore)';
            } else if (error.message === 'Usuário inativo. Entre em contato com o administrador.') {
                errorType = 'Status inativo (Firestore)';
            }
            
            console.error('[SGQ-SECURITY] ❌ FALHA NO LOGIN');
            console.error('[SGQ-SECURITY] Falha no login');
            console.error('[SGQ-SECURITY] Tipo de erro:', errorType);
            console.error('[SGQ-SECURITY] Email tentado:', email);
            console.error('[SGQ-SECURITY] Código do erro:', error.code || 'N/A');
            console.error('[SGQ-SECURITY] Mensagem:', error.message);
            console.error('[SGQ-SECURITY] Timestamp:', errorTimestamp);
            
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
                const timestamp = new Date().toISOString();
                
                try {
                    if (!user) {
                        // Usuário não autenticado
                        console.log('[SGQ-SECURITY] Verificação de acesso: Não autenticado | Timestamp:', timestamp);
                        resolve(false);
                        return;
                    }

                    console.log('[SGQ-SECURITY] Verificando acesso para UID:', user.uid, '| Timestamp:', timestamp);
                    
                    // Buscar metadata do usuário
                    const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
                    
                    if (!userDoc.exists()) {
                        // Usuário não existe no Firestore
                        console.error('[SGQ-SECURITY] FALHA: Metadados ausentes (Firestore) | UID:', user.uid);
                        console.error('[SGQ-SECURITY] Timestamp:', new Date().toISOString());
                        await signOut(auth);
                        resolve(false);
                        return;
                    }

                    const userData = userDoc.data();

                    // Verificar se está ativo
                    if (userData.status !== 'ativo') {
                        console.error('[SGQ-SECURITY] FALHA: Status inativo | UID:', user.uid, '| Status:', userData.status);
                        console.error('[SGQ-SECURITY] Timestamp:', new Date().toISOString());
                        await signOut(auth);
                        resolve(false);
                        return;
                    }

                    // Usuário autenticado e ativo
                    this.currentUser = user;
                    this.userMetadata = userData;
                    
                    const successTimestamp = new Date().toISOString();
                    console.log('[SGQ-SECURITY] ✅ Acesso validado para role:', userData.role, '| Timestamp:', successTimestamp);
                    console.log('[SGQ-SECURITY] Email:', user.email);
                    console.log('[SGQ-SECURITY] UID:', user.uid);
                    
                    resolve(true);
                } catch (error) {
                    console.error('[SGQ-SECURITY] ❌ Erro ao verificar acesso');
                    console.error('[SGQ-SECURITY] Mensagem:', error.message);
                    console.error('[SGQ-SECURITY] Timestamp:', new Date().toISOString());
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
