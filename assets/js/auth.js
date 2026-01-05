/* assets/js/auth.js */
// ================================================================
// SECURITY LAYER - AUTHENTICATION MANAGER
// Arquitetura Zero Trust - Axioma v5.2.0
// SGQ-SECURITY: Controle de Acesso Baseado em Roles (RBAC)
// ================================================================

// 1. Importar instâncias SINGLETON da nossa infraestrutura local
// Isso garante que usamos a MESMA conexão iniciada em firebase-config.js
import { 
    auth, db, doc, getDoc, setDoc, updateDoc, 
    signOut, onAuthStateChanged, collection, getDocs 
} from './firebase-config.js';

// 2. Importar funções específicas do Auth (v10.8.0)
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    updatePassword 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

class AuthManager {
    constructor() {
        this.userMetadata = null;
        this.currentUser = null;
    }

    /**
     * Login com Auditoria e Validação Cruzada (Auth + Firestore)
     */
    async login(email, password) {
        const timestamp = new Date().toISOString();
        try {
            console.log(`[SGQ-AUTH] 🔒 Tentativa de login: ${email} | ${timestamp}`);
            
            // A. Autenticação de Credenciais
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // B. Validação de Metadados (Zero Trust)
            // Não confiamos apenas no Auth; verificamos se o registo existe no banco
            const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
            
            if (!userDoc.exists()) {
                console.error('[SGQ-AUTH] 🚫 FALHA CRÍTICA: Usuário autenticado sem registo no Firestore.');
                await signOut(auth);
                throw new Error('PERFIL_NAO_ENCONTRADO: Usuário sem registro no banco de dados.');
            }

            const userData = userDoc.data();
            
            // C. Verificação de Status
            if (userData.status !== 'ativo') {
                console.warn(`[SGQ-AUTH] ⛔ Acesso negado para usuário inativo: ${email}`);
                await signOut(auth);
                throw new Error('ACESSO_REVOGADO: Conta inativa ou suspensa. Contacte o administrador.');
            }

            // D. Verificação de Troca de Senha Obrigatória
            if (userData.requerTrocaSenha) {
                console.log('[SGQ-AUTH] ⚠️ Troca de senha obrigatória solicitada.');
                return { success: true, user, metadata: userData, forcePasswordChange: true };
            }

            this.currentUser = user;
            this.userMetadata = userData;
            
            console.log(`[SGQ-AUTH] ✅ Login Autorizado. Role: ${userData.role}`);
            return { success: true, user, metadata: userData };

        } catch (error) {
            console.error('[SGQ-AUTH] ❌ Falha de Login:', error.code || error.message);
            throw error;
        }
    }

    /**
     * Verificar Sessão Atual (Persistência com Revalidação)
     * Chamado em cada carregamento de página para garantir que o utilizador ainda é válido.
     */
    async verificarAcesso() {
        return new Promise((resolve) => {
            onAuthStateChanged(auth, async (user) => {
                if (!user) {
                    console.log('[SGQ-AUTH] Sessão: Não autenticado.');
                    resolve(false);
                    return;
                }
                
                // Revalidar status no banco a cada refresh (Zero Trust)
                try {
                    const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
                    
                    if (userDoc.exists() && userDoc.data().status === 'ativo') {
                        this.currentUser = user;
                        this.userMetadata = userDoc.data();
                        console.log(`[SGQ-AUTH] 🔄 Sessão Restaurada: ${this.userMetadata.role}`);
                        resolve(true);
                    } else {
                        console.warn('[SGQ-AUTH] Sessão inválida ou utilizador desativado remotamente.');
                        await signOut(auth);
                        resolve(false);
                    }
                } catch (e) {
                    console.error('[SGQ-AUTH] Erro na verificação de sessão:', e);
                    resolve(false);
                }
            });
        });
    }

    /**
     * Logout Seguro
     */
    async logout() {
        try {
            await signOut(auth);
            this.currentUser = null;
            this.userMetadata = null;
            console.log('[SGQ-AUTH] Logout realizado com sucesso.');
            // O redirecionamento deve ser feito pela UI, mas por segurança:
            if (window.location.pathname.includes('dashboard')) {
                window.location.href = 'index.html';
            }
        } catch (error) {
            console.error('[SGQ-AUTH] Erro ao sair:', error);
        }
    }

    // --- Utilitários de Permissão ---

    isAdmin() {
        return this.userMetadata?.role === 'admin' || this.userMetadata?.role === 'superintendente';
    }

    getCurrentRole() {
        return this.userMetadata?.role || 'guest';
    }

    getCurrentUser() {
        return this.currentUser;
    }

    getUserMetadata() {
        return this.userMetadata;
    }

    // --- Gestão de Utilizadores (Admin) ---

    async criarUsuario(email, password, nome, role = 'user') {
        if (!this.isAdmin()) throw new Error('Acesso Negado: Requer privilégios de Admin.');
        
        // Nota: Criar utilizador secundário enquanto logado requer Cloud Functions ou App Secundário
        // Esta é uma implementação simplificada para o frontend atual
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, 'usuarios', user.uid), {
            email, nome, role,
            status: 'ativo',
            dataCriacao: new Date().toISOString(),
            criadoPor: this.currentUser.uid
        });

        return user;
    }

    async alterarSenha(novaSenha) {
        if (!this.currentUser) throw new Error('Nenhum usuário autenticado.');
        
        await updatePassword(this.currentUser, novaSenha);
        await updateDoc(doc(db, 'usuarios', this.currentUser.uid), {
            requerTrocaSenha: false,
            dataAtualizacao: new Date().toISOString()
        });
    }
    
    async listarUsuarios() {
        if (!this.isAdmin()) throw new Error('Acesso Negado.');
        const snapshot = await getDocs(collection(db, 'usuarios'));
        return snapshot.docs.map(d => ({ uid: d.id, ...d.data() }));
    }

    async atualizarStatusUsuario(uid, status) {
        if (!this.isAdmin()) throw new Error('Acesso Negado.');
        await updateDoc(doc(db, 'usuarios', uid), { 
            status, 
            atualizadoPor: this.currentUser.uid,
            dataAtualizacao: new Date().toISOString() 
        });
    }
}

// Exportar Instância Singleton
const authManager = new AuthManager();
export default authManager;
