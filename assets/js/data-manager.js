/* assets/js/data-manager.js */
// ================================================================
// DATA LAYER - FIRESTORE MANAGER
// Arquitetura Zero Trust - Axioma v5.2.0
// SGQ-INFO: CRUD Centralizado, Validado e Auditável
// ================================================================

// 1. Importar Dependências da Infraestrutura (Singleton)
import { 
    db, auth, 
    collection, addDoc, getDocs, updateDoc, setDoc, getDoc, doc, 
    query, where, orderBy, limit, Timestamp,
    onAuthStateChanged
} from './firebase-config.js';

class DataManager {
    constructor() {
        // Definição Centralizada das Coleções (Evita "Magic Strings")
        this.collections = {
            ORCAMENTOS: 'orcamentos',
            CLIENTES: 'clientes',
            ESPACOS: 'espacos',
            CONFIGURACOES: 'configuracoes',
            LEADS: 'leads_solicitacoes', // Separado de orçamentos para funil de vendas
            LOGS: 'system_audit_logs'
        };
        
        console.log('[SGQ-DATA] DataManager Inicializado v5.2.0');
    }

    // =========================================================================
    // MÉTODOS PRIVADOS / UTILITÁRIOS
    // =========================================================================

    /**
     * Aguarda autenticação do usuário (máximo 5 segundos)
     * @private
     * @returns {Promise<User>} Usuário autenticado
     * @throws {Error} Se timeout ou usuário não autenticado
     */
    async _aguardarAutenticacao() {
        if (auth.currentUser) {
            return auth.currentUser;
        }

        console.warn('[SGQ-DATA] Aguardando autenticação do usuário...');
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Timeout: Usuário não autenticado após 5 segundos.'));
            }, 5000);
            
            const unsubscribe = onAuthStateChanged(auth, user => {
                clearTimeout(timeout);
                unsubscribe();
                if (user) {
                    resolve(user);
                } else {
                    reject(new Error('Operação negada: Usuário não autenticado.'));
                }
            });
        });
    }

    // =========================================================================
    // 1. GESTÃO DE ORÇAMENTOS (CORE)
    // =========================================================================

    /**
     * Salva um novo cálculo de orçamento no Firestore
     * @param {Object} dadosCalculo - Objeto sanitizado com os dados do orçamento
     * @returns {Promise<string>} ID do documento criado
     */
    async salvarOrcamento(dadosCalculo) {
        try {
            // Aguarda autenticação se ainda não estiver pronta
            await this._aguardarAutenticacao();

            // Adiciona Metadados de Rastreabilidade (SGQ)
            const payload = {
                ...dadosCalculo,
                criadoEm: new Date().toISOString(),
                timestamp: Timestamp.now(),
                criadoPor: auth.currentUser.uid,
                emailCriador: auth.currentUser.email,
                status: 'emitido', // emitido, aprovado, cancelado
                versaoSistema: '5.2.0'
            };

            const docRef = await addDoc(collection(db, this.collections.ORCAMENTOS), payload);
            console.log(`[SGQ-DATA] Orçamento salvo com sucesso. ID: ${docRef.id}`);

            return docRef.id;
        } catch (error) {
            console.error('[SGQ-DATA] ❌ Erro ao salvar orçamento:', error);
            throw error;
        }
    }

    /**
     * Recupera o histórico de orçamentos (Permite filtros)
     * @param {number} limite - Quantidade máxima de registros (Padrão: 50)
     */
    async obterHistoricoOrcamentos(limite = 50) {
        try {
            // Aguarda autenticação se ainda não estiver pronta
            await this._aguardarAutenticacao();

            const q = query(
                collection(db, this.collections.ORCAMENTOS),
                orderBy('timestamp', 'desc'),
                limit(limite)
            );

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('[SGQ-DATA] Erro ao buscar histórico:', error);
            // Em caso de erro de permissão ou rede, retorna array vazio para não quebrar a UI
            return [];
        }
    }

    // =========================================================================
    // 2. GESTÃO DE ESPAÇOS E CUSTOS (CONFIG)
    // =========================================================================

    /**
     * Busca a lista de espaços e seus custos base
     * @returns {Promise<Array>} Lista de espaços
     */
    async obterEspacos() {
        try {
            // Tenta buscar do Firestore primeiro (Fonte da Verdade)
            const snapshot = await getDocs(collection(db, this.collections.ESPACOS));
            
            if (snapshot.empty) {
                console.warn('[SGQ-DATA] Nenhum espaço encontrado no Firestore. Verifique a inicialização.');
                return [];
            }

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('[SGQ-DATA] Erro crítico ao buscar espaços:', error);
            throw error;
        }
    }

    /**
     * Atualiza os custos de um espaço específico (Apenas Admin/Super)
     */
    async atualizarEspaco(espacoId, dadosAtualizados) {
        try {
            // Aguarda autenticação antes de atualizar
            await this._aguardarAutenticacao();

            const espacoRef = doc(db, this.collections.ESPACOS, espacoId);
            await updateDoc(espacoRef, {
                ...dadosAtualizados,
                atualizadoEm: new Date().toISOString(),
                atualizadoPor: auth.currentUser.uid
            });
            console.log(`[SGQ-DATA] Espaço ${espacoId} atualizado.`);
        } catch (error) {
            console.error('[SGQ-DATA] Erro ao atualizar espaço:', error);
            throw error;
        }
    }

    // =========================================================================
    // 3. CRM & LEADS
    // =========================================================================

    /**
     * Salva um Lead vindo da página pública (Solicitação)
     * Não requer autenticação do usuário (acesso público configurado nas regras)
     */
    async salvarLead(dadosLead) {
        try {
            const payload = {
                ...dadosLead,
                criadoEm: new Date().toISOString(),
                timestamp: Timestamp.now(),
                status: 'novo', // novo, em_analise, convertido, perdido
                origem: 'web_form'
            };

            const docRef = await addDoc(collection(db, this.collections.LEADS), payload);
            return docRef.id;
        } catch (error) {
            console.error('[SGQ-DATA] Erro ao salvar lead:', error);
            throw error;
        }
    }

    /**
     * Busca clientes cadastrados
     */
    async buscarClientes() {
        try {
            const snapshot = await getDocs(collection(db, this.collections.CLIENTES));
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('[SGQ-DATA] Erro ao buscar clientes:', error);
            return [];
        }
    }
}

// Exportar Instância Singleton
const dataManager = new DataManager();
export default dataManager;
