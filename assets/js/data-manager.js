/* =================================================================
   DATA MANAGER - CALCULADORA DE ORÇAMENTO CDL/UTV v5.0
   Sistema de gerenciamento de dados com persistência em LocalStorage
   ================================================================= */

/**
 * Classe DataManager
 * Responsável por gerenciar todos os dados do sistema:
 * - Salas/Espaços
 * - Itens Extras
 * - Custos de Funcionário
 * - Multiplicadores de Turno
 * - Persistência em LocalStorage
 */
class DataManager {
    constructor() {
        this.storageKey = 'cdl-calculadora-v5-data';
        this.dados = this.carregarDados();
    }

    /**
     * Carrega dados do LocalStorage ou retorna dados padrão
     */
    carregarDados() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const dados = JSON.parse(stored);
                // Validar estrutura básica
                if (dados.salas && dados.extras) {
                    // Migração de dados antigos: converter custosFuncionario para funcionarios
                    if (dados.custosFuncionario && !dados.funcionarios) {
                        dados.funcionarios = [{
                            id: 1,
                            nome: "Funcionário Padrão",
                            horaNormal: dados.custosFuncionario.horaNormal,
                            he50: dados.custosFuncionario.he50,
                            he100: dados.custosFuncionario.he100,
                            valeTransporte: dados.custosFuncionario.valeTransporte,
                            transporteApp: dados.custosFuncionario.transporteApp || 0.00,
                            refeicao: dados.custosFuncionario.refeicao || 0.00,
                            ativo: true
                        }];
                        delete dados.custosFuncionario;
                    }
                    // Adicionar novos campos em funcionários existentes que não os têm
                    dados = this.migrarCamposNovosFuncionarios(dados);
                    if (dados.funcionarios) {
                        return dados;
                    }
                }
            }
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        }
        return this.obterDadosPadrao();
    }

    /**
     * Salva dados no LocalStorage
     */
    salvarDados() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.dados));
            return true;
        } catch (error) {
            console.error('Erro ao salvar dados:', error);
            return false;
        }
    }

    /**
     * Migra campos novos em funcionários existentes
     */
    migrarCamposNovosFuncionarios(dados) {
        if (dados.funcionarios) {
            dados.funcionarios = dados.funcionarios.map(func => ({
                ...func,
                transporteApp: func.transporteApp !== undefined ? func.transporteApp : 0.00,
                refeicao: func.refeicao !== undefined ? func.refeicao : 0.00,
                dataEscala: func.dataEscala !== undefined ? func.dataEscala : null
            }));
        }
        return dados;
    }

    /**
     * Retorna os dados padrão do sistema
     */
    obterDadosPadrao() {
        return {
            salas: [
                {
                    id: 1,
                    nome: "Auditório",
                    unidade: "DJLM",
                    capacidade: 120,
                    area: 108,
                    custoBase: 132.72
                },
                {
                    id: 2,
                    nome: "Auditório",
                    unidade: "UTV",
                    capacidade: 70,
                    area: 63,
                    custoBase: 77.60
                },
                {
                    id: 3,
                    nome: "Sala 2",
                    unidade: "UTV",
                    capacidade: 30,
                    area: 27,
                    custoBase: 35.69
                },
                {
                    id: 4,
                    nome: "Sala 3",
                    unidade: "UTV",
                    capacidade: 50,
                    area: 45,
                    custoBase: 55.19
                },
                {
                    id: 5,
                    nome: "Sala 4",
                    unidade: "UTV",
                    capacidade: 40,
                    area: 36,
                    custoBase: 43.92
                },
                {
                    id: 6,
                    nome: "Sala 7",
                    unidade: "UTV",
                    capacidade: 26,
                    area: 25,
                    custoBase: 29.53
                },
                {
                    id: 7,
                    nome: "Sala 8",
                    unidade: "UTV",
                    capacidade: 16,
                    area: 14.4,
                    custoBase: 17.74
                },
                {
                    id: 8,
                    nome: "Sala 9",
                    unidade: "UTV",
                    capacidade: 28,
                    area: 25,
                    custoBase: 30.52
                },
                {
                    id: 9,
                    nome: "Sala 12",
                    unidade: "UTV",
                    capacidade: 9,
                    area: 8.1,
                    custoBase: 10.02
                },
                {
                    id: 10,
                    nome: "Sala 13",
                    unidade: "UTV",
                    capacidade: 8,
                    area: 7.2,
                    custoBase: 8.86
                }
            ],
            extras: [
                { id: 1, nome: "Coffee Break Premium", custo: 50.00 },
                { id: 2, nome: "Serviço de Impressão", custo: 15.00 },
                { id: 3, nome: "Gravação Profissional", custo: 80.00 },
                { id: 4, nome: "Transmissão ao Vivo", custo: 120.00 },
                { id: 5, nome: "Flip Chart Extra", custo: 5.00 }
            ],
            funcionarios: [
                {
                    id: 1,
                    nome: "Funcionário Padrão",
                    horaNormal: 13.04,
                    he50: 19.56,
                    he100: 26.08,
                    valeTransporte: 12.00,
                    transporteApp: 0.00,
                    refeicao: 0.00,
                    ativo: true,
                    dataEscala: null
                }
            ],
            multiplicadoresTurno: {
                manha: 1.00,
                tarde: 1.15,
                noite: 1.40
            }
        };
    }

    // ========== MÉTODOS DE GESTÃO DE SALAS ==========

    /**
     * Obtém todas as salas
     */
    obterSalas() {
        return this.dados.salas;
    }

    /**
     * Obtém uma sala por ID
     */
    obterSalaPorId(id) {
        return this.dados.salas.find(sala => sala.id === parseInt(id));
    }

    /**
     * Adiciona uma nova sala
     */
    adicionarSala(sala) {
        const novoId = Math.max(...this.dados.salas.map(s => s.id), 0) + 1;
        const novaSala = {
            id: novoId,
            nome: sala.nome,
            unidade: sala.unidade,
            capacidade: parseInt(sala.capacidade),
            area: parseFloat(sala.area),
            custoBase: parseFloat(sala.custoBase) || 0
        };
        this.dados.salas.push(novaSala);
        this.salvarDados();
        return novaSala;
    }

    /**
     * Atualiza uma sala existente
     */
    atualizarSala(id, dadosAtualizados) {
        const index = this.dados.salas.findIndex(sala => sala.id === parseInt(id));
        if (index !== -1) {
            this.dados.salas[index] = {
                ...this.dados.salas[index],
                ...dadosAtualizados
            };
            this.salvarDados();
            return true;
        }
        return false;
    }

    /**
     * Remove uma sala
     */
    removerSala(id) {
        const index = this.dados.salas.findIndex(sala => sala.id === parseInt(id));
        if (index !== -1) {
            this.dados.salas.splice(index, 1);
            this.salvarDados();
            return true;
        }
        return false;
    }

    // ========== MÉTODOS DE GESTÃO DE EXTRAS ==========

    /**
     * Obtém todos os itens extras
     */
    obterExtras() {
        return this.dados.extras;
    }

    /**
     * Obtém um item extra por ID
     */
    obterExtraPorId(id) {
        return this.dados.extras.find(extra => extra.id === parseInt(id));
    }

    /**
     * Adiciona um novo item extra
     */
    adicionarExtra(extra) {
        const novoId = Math.max(...this.dados.extras.map(e => e.id), 0) + 1;
        const novoExtra = {
            id: novoId,
            nome: extra.nome,
            custo: parseFloat(extra.custo)
        };
        this.dados.extras.push(novoExtra);
        this.salvarDados();
        return novoExtra;
    }

    /**
     * Atualiza um item extra existente
     */
    atualizarExtra(id, dadosAtualizados) {
        const index = this.dados.extras.findIndex(extra => extra.id === parseInt(id));
        if (index !== -1) {
            this.dados.extras[index] = {
                ...this.dados.extras[index],
                ...dadosAtualizados
            };
            this.salvarDados();
            return true;
        }
        return false;
    }

    /**
     * Remove um item extra
     */
    removerExtra(id) {
        const index = this.dados.extras.findIndex(extra => extra.id === parseInt(id));
        if (index !== -1) {
            this.dados.extras.splice(index, 1);
            this.salvarDados();
            return true;
        }
        return false;
    }

    // ========== MÉTODOS DE GESTÃO DE FUNCIONÁRIOS ==========

    /**
     * Obtém todos os funcionários
     */
    obterFuncionarios() {
        return this.dados.funcionarios || [];
    }

    /**
     * Obtém um funcionário por ID
     */
    obterFuncionarioPorId(id) {
        return this.dados.funcionarios.find(func => func.id === parseInt(id));
    }

    /**
     * Obtém o funcionário ativo (usado nos cálculos)
     * @deprecated Desde v5.0 - Use obterFuncionariosAtivos() para suportar múltiplos funcionários ativos
     */
    obterFuncionarioAtivo() {
        const ativo = this.dados.funcionarios.find(func => func.ativo === true);
        return ativo || this.dados.funcionarios[0] || null;
    }

    /**
     * Obtém todos os funcionários ativos (usados nos cálculos)
     */
    obterFuncionariosAtivos() {
        const ativos = this.dados.funcionarios.filter(func => func.ativo === true);
        // Se nenhum estiver ativo, retorna o primeiro como fallback
        if (ativos.length === 0 && this.dados.funcionarios.length > 0) {
            return [this.dados.funcionarios[0]];
        }
        return ativos;
    }

    /**
     * Adiciona um novo funcionário
     */
    adicionarFuncionario(funcionario) {
        const novoId = Math.max(...this.dados.funcionarios.map(f => f.id), 0) + 1;
        const novoFuncionario = {
            id: novoId,
            nome: funcionario.nome,
            horaNormal: parseFloat(funcionario.horaNormal),
            he50: parseFloat(funcionario.he50),
            he100: parseFloat(funcionario.he100),
            valeTransporte: parseFloat(funcionario.valeTransporte),
            transporteApp: parseFloat(funcionario.transporteApp || 0),
            refeicao: parseFloat(funcionario.refeicao || 0),
            ativo: false,
            dataEscala: funcionario.dataEscala || null
        };
        this.dados.funcionarios.push(novoFuncionario);
        this.salvarDados();
        return novoFuncionario;
    }

    /**
     * Atualiza um funcionário existente
     */
    atualizarFuncionario(id, dadosAtualizados) {
        const index = this.dados.funcionarios.findIndex(func => func.id === parseInt(id));
        if (index !== -1) {
            this.dados.funcionarios[index] = {
                ...this.dados.funcionarios[index],
                ...dadosAtualizados
            };
            this.salvarDados();
            return true;
        }
        return false;
    }

    /**
     * Define qual funcionário está ativo (usado nos cálculos)
     * Permite múltiplos funcionários ativos
     */
    definirFuncionarioAtivo(id, ativo = true) {
        const funcionario = this.obterFuncionarioPorId(id);
        if (funcionario) {
            funcionario.ativo = ativo;
            this.salvarDados();
            return true;
        }
        return false;
    }

    /**
     * Alterna o estado ativo de um funcionário
     */
    alternarFuncionarioAtivo(id) {
        const funcionario = this.obterFuncionarioPorId(id);
        if (funcionario) {
            funcionario.ativo = !funcionario.ativo;
            this.salvarDados();
            return true;
        }
        return false;
    }

    /**
     * Remove um funcionário
     */
    removerFuncionario(id) {
        const index = this.dados.funcionarios.findIndex(func => func.id === parseInt(id));
        if (index !== -1) {
            // Não permite remover se for o único funcionário
            if (this.dados.funcionarios.length === 1) {
                return false;
            }
            
            const funcionario = this.dados.funcionarios[index];
            this.dados.funcionarios.splice(index, 1);
            
            // Se o funcionário removido era o ativo, ativa o primeiro
            if (funcionario.ativo && this.dados.funcionarios.length > 0) {
                this.dados.funcionarios[0].ativo = true;
            }
            
            this.salvarDados();
            return true;
        }
        return false;
    }

    /**
     * Obtém custos agregados de todos os funcionários ativos
     * @deprecated Desde v5.0 - Este método retorna custos agregados. Para dados individuais, use obterFuncionariosAtivos()
     */
    obterCustosFuncionario() {
        const funcionariosAtivos = this.obterFuncionariosAtivos();
        if (funcionariosAtivos.length === 0) {
            // Fallback para evitar erros
            return {
                horaNormal: 13.04,
                he50: 19.56,
                he100: 26.08,
                valeTransporte: 12.00,
                transporteApp: 0.00,
                refeicao: 0.00,
                quantidadeFuncionarios: 1
            };
        }
        
        // Soma os custos de todos os funcionários ativos
        const custosAgregados = funcionariosAtivos.reduce((total, func) => ({
            horaNormal: total.horaNormal + func.horaNormal,
            he50: total.he50 + func.he50,
            he100: total.he100 + func.he100,
            valeTransporte: total.valeTransporte + func.valeTransporte,
            transporteApp: total.transporteApp + (func.transporteApp || 0),
            refeicao: total.refeicao + (func.refeicao || 0)
        }), {
            horaNormal: 0,
            he50: 0,
            he100: 0,
            valeTransporte: 0,
            transporteApp: 0,
            refeicao: 0
        });
        
        // Adiciona a quantidade de funcionários
        custosAgregados.quantidadeFuncionarios = funcionariosAtivos.length;
        
        return custosAgregados;
    }

    /**
     * Atualiza custos do funcionário (mantido para compatibilidade)
     * @deprecated Use atualizarFuncionario() ao invés
     */
    atualizarCustosFuncionario(custos) {
        const funcionarioAtivo = this.obterFuncionarioAtivo();
        if (funcionarioAtivo) {
            return this.atualizarFuncionario(funcionarioAtivo.id, custos);
        }
        return false;
    }

    /**
     * Obtém multiplicadores de turno
     */
    obterMultiplicadoresTurno() {
        return this.dados.multiplicadoresTurno;
    }

    // ========== MÉTODOS DE BACKUP E RESTORE ==========

    /**
     * Exporta todos os dados como JSON
     */
    exportarDados() {
        return JSON.stringify(this.dados, null, 2);
    }

    /**
     * Importa dados de um JSON
     */
    importarDados(jsonString) {
        try {
            const dados = JSON.parse(jsonString);
            // Validar estrutura básica
            if (!dados.salas || !dados.extras) {
                throw new Error('Estrutura de dados inválida');
            }
            // Migração de dados antigos
            if (dados.custosFuncionario && !dados.funcionarios) {
                dados.funcionarios = [{
                    id: 1,
                    nome: "Funcionário Padrão",
                    horaNormal: dados.custosFuncionario.horaNormal,
                    he50: dados.custosFuncionario.he50,
                    he100: dados.custosFuncionario.he100,
                    valeTransporte: dados.custosFuncionario.valeTransporte,
                    transporteApp: dados.custosFuncionario.transporteApp || 0.00,
                    refeicao: dados.custosFuncionario.refeicao || 0.00,
                    ativo: true
                }];
                delete dados.custosFuncionario;
            }
            // Adicionar novos campos em funcionários existentes que não os têm
            dados = this.migrarCamposNovosFuncionarios(dados);
            if (!dados.funcionarios) {
                throw new Error('Estrutura de dados inválida');
            }
            this.dados = dados;
            this.salvarDados();
            return true;
        } catch (error) {
            console.error('Erro ao importar dados:', error);
            return false;
        }
    }

    /**
     * Restaura dados para o padrão
     */
    restaurarPadrao() {
        this.dados = this.obterDadosPadrao();
        this.salvarDados();
        return true;
    }

    /**
     * Limpa todos os dados
     */
    limparDados() {
        try {
            localStorage.removeItem(this.storageKey);
            this.dados = this.obterDadosPadrao();
            return true;
        } catch (error) {
            console.error('Erro ao limpar dados:', error);
            return false;
        }
    }
}

// ========== SISTEMA DE NOTIFICAÇÕES ==========

/**
 * Exibe uma notificação para o usuário
 * @param {string} mensagem - Mensagem a ser exibida
 * @param {number} duracao - Duração em ms (padrão: 3000)
 */
function mostrarNotificacao(mensagem, duracao = 3000) {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notification-text');
    
    if (notification && notificationText) {
        notificationText.textContent = mensagem;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, duracao);
    }
}

/**
 * Formata número como moeda brasileira
 * @param {number} valor - Valor a ser formatado
 * @returns {string} Valor formatado
 */
function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

/**
 * Formata número simples com 2 casas decimais
 * @param {number} valor - Valor a ser formatado
 * @returns {string} Valor formatado
 */
function formatarNumero(valor) {
    return valor.toFixed(2);
}

// Exportar instância global do DataManager
const dataManager = new DataManager();
