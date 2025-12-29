/* =================================================================
   DATA MANAGER - AXIOMA: INTELIGÊNCIA DE MARGEM v5.1.0
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
 * - Auditoria de Atualização de Dados
 */
class DataManager {
    // ========== CONSTANTES DE RISCO FINANCEIRO ==========
    // Fonte única da verdade para thresholds de viabilidade
    static THRESHOLD_RISCO_ALTO = 60;    // % de custos variáveis > 60% = RISCO ALTO
    static THRESHOLD_RISCO_MEDIO = 40;   // % de custos variáveis >= 40% = RISCO MÉDIO
    
    constructor() {
        this.storageKey = 'cdl-calculadora-v5-data';
        // Limite de dias para considerar dados desatualizados (proteção contra inflação)
        this.LIMITE_DIAS_AUDITORIA = 90;
        this.dados = this.carregarDados();
    }

    /**
     * Carrega dados do LocalStorage ou retorna dados padrão
     */
    carregarDados() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                let dados = JSON.parse(stored);
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
                    // Migração: adicionar configuracoes se não existir
                    if (!dados.configuracoes) {
                        dados.configuracoes = { tema: 'sistema' };
                    }
                    if (dados.funcionarios) {
                        // Validar schema antes de retornar
                        const validacao = this.validarSchema(dados);
                        if (validacao.valido) {
                            return dados;
                        } else {
                            console.error('Dados corrompidos no LocalStorage:', validacao.erros);
                            console.warn('Restaurando dados padrão devido à corrupção detectada');
                        }
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
            // Validar antes de salvar para prevenir corrupção
            const validacao = this.validarSchema(this.dados);
            if (!validacao.valido) {
                console.error('Tentativa de salvar dados inválidos:', validacao.erros);
                return false;
            }

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
     * Valida o schema dos dados para prevenir corrupção
     * @param {Object} dados - Dados a serem validados
     * @returns {Object} { valido: boolean, erros: Array<string> }
     */
    validarSchema(dados) {
        const erros = [];

        // Validar estrutura principal
        if (!dados || typeof dados !== 'object') {
            erros.push('Dados devem ser um objeto');
            return { valido: false, erros };
        }

        // Validar salas
        if (!Array.isArray(dados.salas)) {
            erros.push('salas deve ser um array');
        } else {
            dados.salas.forEach((sala, index) => {
                if (!sala.id || typeof sala.id !== 'number') {
                    erros.push(`sala[${index}]: id inválido`);
                }
                if (!sala.nome || typeof sala.nome !== 'string') {
                    erros.push(`sala[${index}]: nome inválido`);
                }
                if (!sala.unidade || typeof sala.unidade !== 'string') {
                    erros.push(`sala[${index}]: unidade inválida`);
                }
                if (typeof sala.capacidade !== 'number' || sala.capacidade < 0) {
                    erros.push(`sala[${index}]: capacidade inválida`);
                }
                if (typeof sala.area !== 'number' || sala.area < 0) {
                    erros.push(`sala[${index}]: área inválida`);
                }
                if (typeof sala.custoBase !== 'number' || sala.custoBase < 0) {
                    erros.push(`sala[${index}]: custoBase inválido`);
                }
            });
        }

        // Validar extras
        if (!Array.isArray(dados.extras)) {
            erros.push('extras deve ser um array');
        } else {
            dados.extras.forEach((extra, index) => {
                if (!extra.id || typeof extra.id !== 'number') {
                    erros.push(`extra[${index}]: id inválido`);
                }
                if (!extra.nome || typeof extra.nome !== 'string') {
                    erros.push(`extra[${index}]: nome inválido`);
                }
                if (typeof extra.custo !== 'number' || extra.custo < 0) {
                    erros.push(`extra[${index}]: custo inválido`);
                }
            });
        }

        // Validar funcionários
        if (!Array.isArray(dados.funcionarios)) {
            erros.push('funcionarios deve ser um array');
        } else if (dados.funcionarios.length === 0) {
            erros.push('deve haver pelo menos um funcionário');
        } else {
            dados.funcionarios.forEach((func, index) => {
                if (!func.id || typeof func.id !== 'number') {
                    erros.push(`funcionario[${index}]: id inválido`);
                }
                if (!func.nome || typeof func.nome !== 'string') {
                    erros.push(`funcionario[${index}]: nome inválido`);
                }
                if (typeof func.horaNormal !== 'number' || func.horaNormal < 0) {
                    erros.push(`funcionario[${index}]: horaNormal inválido`);
                }
                if (typeof func.he50 !== 'number' || func.he50 < 0) {
                    erros.push(`funcionario[${index}]: he50 inválido`);
                }
                if (typeof func.he100 !== 'number' || func.he100 < 0) {
                    erros.push(`funcionario[${index}]: he100 inválido`);
                }
                if (typeof func.valeTransporte !== 'number' || func.valeTransporte < 0) {
                    erros.push(`funcionario[${index}]: valeTransporte inválido`);
                }
                if (func.transporteApp !== undefined && (typeof func.transporteApp !== 'number' || func.transporteApp < 0)) {
                    erros.push(`funcionario[${index}]: transporteApp inválido`);
                }
                if (func.refeicao !== undefined && (typeof func.refeicao !== 'number' || func.refeicao < 0)) {
                    erros.push(`funcionario[${index}]: refeicao inválido`);
                }
                if (typeof func.ativo !== 'boolean') {
                    erros.push(`funcionario[${index}]: ativo deve ser boolean`);
                }
            });
        }

        // Validar multiplicadores de turno
        if (!dados.multiplicadoresTurno || typeof dados.multiplicadoresTurno !== 'object') {
            erros.push('multiplicadoresTurno deve ser um objeto');
        } else {
            const mult = dados.multiplicadoresTurno;
            if (typeof mult.manha !== 'number' || mult.manha <= 0) {
                erros.push('multiplicadoresTurno.manha inválido');
            }
            if (typeof mult.tarde !== 'number' || mult.tarde <= 0) {
                erros.push('multiplicadoresTurno.tarde inválido');
            }
            if (typeof mult.noite !== 'number' || mult.noite <= 0) {
                erros.push('multiplicadoresTurno.noite inválido');
            }
        }

        // Validar configurações (opcional, mas se existir deve ser válida)
        if (dados.configuracoes) {
            if (typeof dados.configuracoes !== 'object') {
                erros.push('configuracoes deve ser um objeto');
            } else {
                // Validar tema se existir
                if (dados.configuracoes.tema !== undefined) {
                    const temasValidos = ['claro', 'escuro', 'sistema'];
                    if (typeof dados.configuracoes.tema !== 'string' || !temasValidos.includes(dados.configuracoes.tema)) {
                        erros.push(`configuracoes.tema inválido. Deve ser um de: ${temasValidos.join(', ')}`);
                    }
                }
                
                // Validar visualizacaoBI se existir
                if (dados.configuracoes.visualizacaoBI) {
                    const bi = dados.configuracoes.visualizacaoBI;
                    if (bi.exibirAlertaViabilidade !== undefined && typeof bi.exibirAlertaViabilidade !== 'boolean') {
                        erros.push('configuracoes.visualizacaoBI.exibirAlertaViabilidade deve ser boolean');
                    }
                    if (bi.exibirEstruturaCustos !== undefined && typeof bi.exibirEstruturaCustos !== 'boolean') {
                        erros.push('configuracoes.visualizacaoBI.exibirEstruturaCustos deve ser boolean');
                    }
                    if (bi.exibirClassificacaoRisco !== undefined && typeof bi.exibirClassificacaoRisco !== 'boolean') {
                        erros.push('configuracoes.visualizacaoBI.exibirClassificacaoRisco deve ser boolean');
                    }
                }
            }
        }

        // Validar histórico de cálculos (opcional)
        if (dados.historicoCalculos !== undefined && !Array.isArray(dados.historicoCalculos)) {
            erros.push('historicoCalculos deve ser um array');
        }

        // Validar clientes (opcional)
        if (dados.clientes !== undefined && !Array.isArray(dados.clientes)) {
            erros.push('clientes deve ser um array');
        }

        return {
            valido: erros.length === 0,
            erros
        };
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
            },
            configuracoes: {
                tema: 'sistema',
                visualizacaoBI: {
                    exibirAlertaViabilidade: true,
                    exibirEstruturaCustos: true,
                    exibirClassificacaoRisco: true
                }
            },
            historicoCalculos: [],
            clientes: []
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
            custoBase: parseFloat(sala.custoBase) || 0,
            ultimaAtualizacao: new Date().toISOString()
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
                ...dadosAtualizados,
                ultimaAtualizacao: new Date().toISOString()
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
            custo: parseFloat(extra.custo),
            ultimaAtualizacao: new Date().toISOString()
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
                ...dadosAtualizados,
                ultimaAtualizacao: new Date().toISOString()
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
            dataEscala: funcionario.dataEscala || null,
            ultimaAtualizacao: new Date().toISOString()
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
                ...dadosAtualizados,
                ultimaAtualizacao: new Date().toISOString()
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

    // ========== MÉTODOS DE CONFIGURAÇÃO ==========

    /**
     * Obtém o tema atual
     */
    obterTema() {
        return this.dados.configuracoes?.tema || 'sistema';
    }

    /**
     * Define o tema da aplicação
     * @param {string} novoTema - Tema a ser definido ('claro', 'escuro', 'sistema')
     * @returns {boolean} True se o tema foi definido com sucesso
     */
    definirTema(novoTema) {
        // Validar entrada
        const temasValidos = ['claro', 'escuro', 'sistema'];
        if (!temasValidos.includes(novoTema)) {
            console.error(`Tema inválido: ${novoTema}. Use: ${temasValidos.join(', ')}`);
            return false;
        }

        // Garantir que configuracoes existe
        if (!this.dados.configuracoes) {
            this.dados.configuracoes = {};
        }

        // Definir o tema
        this.dados.configuracoes.tema = novoTema;

        // Persistir
        return this.salvarDados();
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

    // ========== MÉTODOS DE GESTÃO DE CLIENTES ==========

    /**
     * Obtém todos os clientes
     */
    obterClientes() {
        if (!this.dados.clientes) {
            this.dados.clientes = [];
        }
        return this.dados.clientes;
    }

    /**
     * Obtém um cliente por ID
     */
    obterClientePorId(id) {
        return this.obterClientes().find(cliente => cliente.id === id);
    }

    /**
     * Adiciona um novo cliente
     */
    adicionarCliente(cliente) {
        if (!this.dados.clientes) {
            this.dados.clientes = [];
        }

        const novoCliente = {
            id: Date.now(),
            ...cliente,
            dataCadastro: new Date().toISOString()
        };

        this.dados.clientes.push(novoCliente);
        this.salvarDados();
        return novoCliente;
    }

    /**
     * Atualiza um cliente existente
     */
    atualizarCliente(cliente) {
        if (!this.dados.clientes) {
            this.dados.clientes = [];
        }

        const index = this.dados.clientes.findIndex(c => c.id === cliente.id);
        if (index !== -1) {
            this.dados.clientes[index] = {
                ...this.dados.clientes[index],
                ...cliente,
                dataAtualizacao: new Date().toISOString()
            };
            this.salvarDados();
            return true;
        }
        return false;
    }

    /**
     * Remove um cliente
     */
    removerCliente(id) {
        if (!this.dados.clientes) {
            return false;
        }

        const index = this.dados.clientes.findIndex(cliente => cliente.id === id);
        if (index !== -1) {
            this.dados.clientes.splice(index, 1);
            this.salvarDados();
            return true;
        }
        return false;
    }

    /**
     * Busca clientes por nome, e-mail ou telefone
     */
    buscarClientes(termo) {
        if (!termo) {
            return this.obterClientes();
        }

        const termoLower = termo.toLowerCase();
        return this.obterClientes().filter(cliente => 
            (cliente.nome && cliente.nome.toLowerCase().includes(termoLower)) ||
            (cliente.email && cliente.email.toLowerCase().includes(termoLower)) ||
            (cliente.telefone && cliente.telefone.includes(termo)) ||
            (cliente.cpfCnpj && cliente.cpfCnpj.includes(termo))
        );
    }

    // ========== MÉTODOS DE HISTÓRICO DE CÁLCULOS ==========

    /**
     * Adiciona um cálculo ao histórico
     * Blindagem automática: Todos os dados passam pelo DataSanitizer antes do armazenamento
     * 
     * @param {Object} calculo - Dados do cálculo realizado
     */
    adicionarCalculoHistorico(calculo) {
        if (!this.dados.historicoCalculos) {
            this.dados.historicoCalculos = [];
        }

        // BLINDAGEM AUTOMÁTICA: Sanitizar dados do cliente antes de armazenar
        // Garantir que nenhum dado subjetivo ou com viés seja guardado no LocalStorage
        const clienteNome = calculo.clienteNome || '';
        const clienteContato = calculo.clienteContato || '';
        
        // Aplicar DataSanitizer para limpar dados
        const resultadoSanitizacao = DataSanitizer.sanitizarDadosCliente(clienteNome, clienteContato);
        
        // Usar dados sanitizados (ou vazios se inválidos)
        const nomeArmazenado = resultadoSanitizacao.valido && resultadoSanitizacao.dados 
            ? resultadoSanitizacao.dados.clienteNome 
            : '';
        const contatoArmazenado = resultadoSanitizacao.valido && resultadoSanitizacao.dados 
            ? (resultadoSanitizacao.dados.clienteContato || '') 
            : '';

        // Calcular Lead Time (dias entre cotação e evento)
        let leadTimeDays = null;
        let dataEvento = null;
        
        if (calculo.dataEvento) {
            dataEvento = calculo.dataEvento;
            const dataCotacao = new Date();
            const dataEventoObj = new Date(calculo.dataEvento);
            
            // Calcular diferença em dias
            const diferencaMs = dataEventoObj.getTime() - dataCotacao.getTime();
            leadTimeDays = Math.floor(diferencaMs / (1000 * 60 * 60 * 24));
        }

        // Inferir turno predominante baseado nos horários
        let turnoPredominante = this.inferirTurnoPredominante(calculo.horarios);

        const registroHistorico = {
            id: Date.now(),
            data: new Date().toISOString(),
            cliente: nomeArmazenado,      // Dados sanitizados
            contato: contatoArmazenado,   // Dados sanitizados
            sala: {
                id: calculo.sala.id,
                nome: calculo.sala.nome,
                unidade: calculo.sala.unidade
            },
            duracao: calculo.duracao,
            duracaoTipo: calculo.duracaoTipo,
            horasTotais: calculo.resultado.horasTotais,
            valorFinal: calculo.resultado.valorFinal,
            margemLiquida: ((calculo.resultado.valorFinal - calculo.resultado.subtotalSemMargem) / calculo.resultado.valorFinal * 100),
            classificacaoRisco: this.calcularClassificacaoRisco(calculo.resultado, calculo.calculoIncompleto || false).nivel,
            subtotalSemMargem: calculo.resultado.subtotalSemMargem,
            valorMargem: calculo.resultado.valorMargem,
            valorDesconto: calculo.resultado.valorDesconto,
            descontoPercent: calculo.desconto * 100,
            convertido: false,  // Variável target para modelo de regressão logística
            // Novos campos para ML
            dataEvento: dataEvento,
            leadTimeDays: leadTimeDays,
            turnoPredominante: turnoPredominante
        };

        // Limitar histórico a 500 registros mais recentes (amostragem estatística suficiente)
        this.dados.historicoCalculos.unshift(registroHistorico);
        if (this.dados.historicoCalculos.length > 500) {
            this.dados.historicoCalculos = this.dados.historicoCalculos.slice(0, 500);
        }

        this.salvarDados();
        return registroHistorico;
    }

    /**
     * Calcula classificação de risco baseada nos custos
     * Fonte única da verdade para classificação de risco e cores (Verde/Amarelo/Vermelho)
     * 
     * @param {Object} resultado - Objeto com dados financeiros do cálculo
     * @param {boolean} calculoIncompleto - Se true, força classificação ALTO RISCO por falta de dados
     * @returns {Object} Classificação completa com { nivel, cor, bgColor, borderColor, percentual }
     */
    calcularClassificacaoRisco(resultado, calculoIncompleto = false) {
        const custoVariavel = resultado.custoMaoObraTotal + resultado.custoValeTransporte + 
                             (resultado.custoTransporteApp || 0) + (resultado.custoRefeicao || 0);
        const riscoMaoObra = (custoVariavel / resultado.valorFinal * 100);
        
        let nivel, cor, bgColor, borderColor;
        
        // RIGOR DE RISCO: Cálculos incompletos são automaticamente classificados como ALTO RISCO
        if (calculoIncompleto) {
            nivel = 'ALTO';
            cor = '#dc2626';      // Vermelho
            bgColor = '#fee2e2';
            borderColor = '#dc2626';
        } else if (riscoMaoObra > DataManager.THRESHOLD_RISCO_ALTO) {
            nivel = 'ALTO';
            cor = '#dc2626';      // Vermelho
            bgColor = '#fee2e2';
            borderColor = '#dc2626';
        } else if (riscoMaoObra >= DataManager.THRESHOLD_RISCO_MEDIO) {
            nivel = 'MÉDIO';
            cor = '#d97706';      // Amarelo/Laranja
            bgColor = '#fef3c7';
            borderColor = '#d97706';
        } else {
            nivel = 'BAIXO';
            cor = '#16a34a';      // Verde
            bgColor = '#dcfce7';
            borderColor = '#16a34a';
        }
        
        return {
            nivel,
            cor,
            bgColor,
            borderColor,
            percentual: riscoMaoObra
        };
    }

    /**
     * Infere o turno predominante baseado nos horários de uso
     * @param {Array} horarios - Array de horários [{inicio: "08:00", fim: "17:00"}, ...]
     * @returns {number} 1=Manhã (06:00-11:59), 2=Tarde (12:00-17:59), 3=Noite (18:00-05:59)
     */
    inferirTurnoPredominante(horarios) {
        if (!horarios || horarios.length === 0) {
            return null;
        }

        const horasPorTurno = { manha: 0, tarde: 0, noite: 0 };

        horarios.forEach(horario => {
            const horaInicio = parseInt(horario.inicio.split(':')[0]);
            const horaFim = parseInt(horario.fim.split(':')[0]);
            const minutoInicio = parseInt(horario.inicio.split(':')[1]);
            const minutoFim = parseInt(horario.fim.split(':')[1]);

            // Calcular horas no horário
            let totalMinutos = (horaFim * 60 + minutoFim) - (horaInicio * 60 + minutoInicio);
            if (totalMinutos < 0) totalMinutos += 24 * 60; // Ajuste para horários que atravessam meia-noite
            const totalHoras = totalMinutos / 60;

            // Classificar por turno predominante (ponto médio do horário)
            const horaMedia = horaInicio + (totalHoras / 2);

            if (horaMedia >= 6 && horaMedia < 12) {
                horasPorTurno.manha += totalHoras;
            } else if (horaMedia >= 12 && horaMedia < 18) {
                horasPorTurno.tarde += totalHoras;
            } else {
                horasPorTurno.noite += totalHoras;
            }
        });

        // Determinar turno predominante
        const maxHoras = Math.max(horasPorTurno.manha, horasPorTurno.tarde, horasPorTurno.noite);
        
        if (maxHoras === horasPorTurno.manha) return 1;  // Manhã
        if (maxHoras === horasPorTurno.tarde) return 2;  // Tarde
        return 3;  // Noite
    }

    /**
     * Obtém o histórico de cálculos
     */
    obterHistoricoCalculos() {
        return this.dados.historicoCalculos || [];
    }

    /**
     * Atualiza o status de conversão de um cálculo
     * @param {number} id - ID do registro no histórico
     * @param {boolean} status - Status de conversão (true = vendido, false = não vendido)
     * @returns {boolean} True se atualizado com sucesso
     */
    atualizarConversao(id, status) {
        if (!this.dados.historicoCalculos) {
            return false;
        }

        const registro = this.dados.historicoCalculos.find(calc => calc.id === id);
        if (registro) {
            registro.convertido = status;
            this.salvarDados();
            return true;
        }

        return false;
    }

    /**
     * Limpa o histórico de cálculos
     */
    limparHistoricoCalculos() {
        this.dados.historicoCalculos = [];
        this.salvarDados();
        return true;
    }

    /**
     * Exporta histórico de cálculos como CSV
     * @returns {string} Dados em formato CSV
     */
    exportarHistoricoCSV() {
        const historico = this.obterHistoricoCalculos();
        
        if (historico.length === 0) {
            return null;
        }

        // Cabeçalhos do CSV - Com dados do cliente para análise de Pareto
        const headers = [
            'Data',
            'ID',
            'Cliente',
            'Contato',
            'Unidade',
            'Espaço',
            'Duração',
            'Tipo Duração',
            'Horas Totais',
            'Subtotal Sem Margem (R$)',
            'Valor da Margem (R$)',
            'Valor do Desconto (R$)',
            'Valor Final (R$)',
            'Valor por Hora (R$)',
            'Margem Líquida (%)',
            'Classificação de Risco',
            'CONVERTIDO'
        ];

        // Construir linhas CSV
        const linhas = [headers.join(',')];

        historico.forEach(calc => {
            const valorPorHora = calc.valorFinal / calc.horasTotais;
            // Garantir tratamento de dados antigos que não possuem o campo convertido
            const convertidoValor = calc.convertido === true ? '1' : '0';
            // Garantir compatibilidade com dados antigos que não possuem cliente/contato
            const cliente = calc.cliente ? `"${calc.cliente}"` : '""';
            const contato = calc.contato ? `"${calc.contato}"` : '""';
            
            const linha = [
                new Date(calc.data).toLocaleDateString('pt-BR'),
                calc.id,
                cliente,
                contato,
                calc.sala.unidade,
                `"${calc.sala.nome}"`, // Aspas para nomes com vírgula
                calc.duracao,
                calc.duracaoTipo,
                calc.horasTotais.toFixed(2),
                calc.subtotalSemMargem.toFixed(2),
                calc.valorMargem.toFixed(2),
                calc.valorDesconto.toFixed(2),
                calc.valorFinal.toFixed(2),
                valorPorHora.toFixed(2),
                calc.margemLiquida.toFixed(2),
                calc.classificacaoRisco,
                convertidoValor
            ];
            linhas.push(linha.join(','));
        });

        return linhas.join('\n');
    }

    /**
     * Exporta o cálculo atual como CSV
     * @param {Object} calculoAtual - Dados do cálculo atual
     * @returns {string} Dados em formato CSV
     */
    exportarCalculoAtualCSV(calculoAtual) {
        if (!calculoAtual || !calculoAtual.resultado) {
            return null;
        }

        const resultado = calculoAtual.resultado;
        const sala = calculoAtual.sala;

        // Cabeçalhos
        const headers = [
            'Categoria',
            'Descrição',
            'Valor (R$)',
            'Percentual (%)'
        ];

        const linhas = [headers.join(',')];

        // Informações básicas
        linhas.push(`"Espaço","${sala.unidade} - ${sala.nome}","",""` );
        linhas.push(`"Duração","${calculoAtual.duracao} ${calculoAtual.duracaoTipo}","",""` );
        linhas.push(`"Horas Totais","${resultado.horasTotais.toFixed(2)}h","",""` );
        linhas.push('');

        // Custos
        const total = resultado.subtotalSemMargem;
        linhas.push(`"Custo Operacional Base","",${resultado.custoOperacionalBase.toFixed(2)},${((resultado.custoOperacionalBase/total)*100).toFixed(2)}`);
        linhas.push(`"Mão de Obra - Horas Normais","",${resultado.custoMaoObraNormal.toFixed(2)},${((resultado.custoMaoObraNormal/total)*100).toFixed(2)}`);
        linhas.push(`"Mão de Obra - HE 50%","",${resultado.custoMaoObraHE50.toFixed(2)},${((resultado.custoMaoObraHE50/total)*100).toFixed(2)}`);
        linhas.push(`"Mão de Obra - HE 100%","",${resultado.custoMaoObraHE100.toFixed(2)},${((resultado.custoMaoObraHE100/total)*100).toFixed(2)}`);
        linhas.push(`"Vale Transporte","",${resultado.custoValeTransporte.toFixed(2)},${((resultado.custoValeTransporte/total)*100).toFixed(2)}`);
        
        if (resultado.custoTransporteApp > 0) {
            linhas.push(`"Transporte App","",${resultado.custoTransporteApp.toFixed(2)},${((resultado.custoTransporteApp/total)*100).toFixed(2)}`);
        }
        if (resultado.custoRefeicao > 0) {
            linhas.push(`"Refeição","",${resultado.custoRefeicao.toFixed(2)},${((resultado.custoRefeicao/total)*100).toFixed(2)}`);
        }
        if (resultado.custoExtras > 0) {
            linhas.push(`"Itens Extras","",${resultado.custoExtras.toFixed(2)},${((resultado.custoExtras/total)*100).toFixed(2)}`);
        }

        linhas.push('');
        linhas.push(`"Subtotal Sem Margem","",${resultado.subtotalSemMargem.toFixed(2)},100.00`);
        linhas.push(`"Margem de Lucro","${resultado.margemPercent.toFixed(0)}%",${resultado.valorMargem.toFixed(2)},""`);
        linhas.push(`"Subtotal Com Margem","",${resultado.subtotalComMargem.toFixed(2)},""`);
        linhas.push(`"Desconto","${resultado.descontoPercent.toFixed(0)}%",${resultado.valorDesconto.toFixed(2)},""`);
        linhas.push(`"VALOR FINAL","",${resultado.valorFinal.toFixed(2)},""`);
        
        linhas.push('');
        const margemLiquida = ((resultado.valorFinal - resultado.subtotalSemMargem) / resultado.valorFinal * 100);
        linhas.push(`"Margem Líquida","",${margemLiquida.toFixed(2)},""` );
        linhas.push(`"Valor por Hora","",${resultado.valorPorHora.toFixed(2)},""`);

        return linhas.join('\n');
    }

    /**
     * Exporta dataset otimizado para Machine Learning e Análise de Regressão Logística
     * Formato: CSV com features numéricas e categóricas prontas para algoritmos
     * 
     * @returns {string|null} Dataset em formato CSV ou null se não houver dados
     */
    exportarDatasetML() {
        const historico = this.obterHistoricoCalculos();
        
        if (historico.length === 0) {
            return null;
        }

        // Cabeçalhos otimizados para ML (sem espaços, apenas underscore)
        const headers = [
            'TARGET_CONVERTIDO',           // 0 ou 1 (variável dependente)
            'FEATURE_DESCONTO_PERCENT',    // 0 a 100
            'FEATURE_MARGEM_LIQUIDA',      // float (%)
            'FEATURE_LEAD_TIME',           // int (dias de antecedência)
            'FEATURE_VALOR_TOTAL',         // float (R$)
            'FEATURE_DURACAO_HORAS',       // float (horas totais)
            'CAT_SALA_ID',                 // int (identificador categórico da sala)
            'CAT_TURNO_PREDOMINANTE'       // 1=Manhã, 2=Tarde, 3=Noite
        ];

        // Construir linhas do dataset
        const linhas = [headers.join(',')];

        historico.forEach(calc => {
            // TARGET: Convertido (1) ou não convertido (0)
            const targetConvertido = calc.convertido === true ? 1 : 0;
            
            // FEATURES NUMÉRICAS
            const descontoPercent = calc.descontoPercent !== undefined ? calc.descontoPercent.toFixed(2) : '0.00';
            const margemLiquida = calc.margemLiquida.toFixed(2);
            const leadTime = calc.leadTimeDays !== null && calc.leadTimeDays !== undefined ? calc.leadTimeDays : '';
            const valorTotal = calc.valorFinal.toFixed(2);
            const duracaoHoras = calc.horasTotais.toFixed(2);
            
            // FEATURES CATEGÓRICAS
            const salaId = calc.sala.id;
            const turnoPredominante = calc.turnoPredominante !== null && calc.turnoPredominante !== undefined ? calc.turnoPredominante : '';
            
            const linha = [
                targetConvertido,
                descontoPercent,
                margemLiquida,
                leadTime,
                valorTotal,
                duracaoHoras,
                salaId,
                turnoPredominante
            ];
            
            linhas.push(linha.join(','));
        });

        return linhas.join('\n');
    }

    /**
     * Obtém oportunidades de renovação de eventos
     * Identifica clientes que realizaram eventos há 11-12 meses atrás
     * para prospecção ativa antes que busquem a concorrência
     * 
     * @returns {Array} Lista de oportunidades de renovação (Leads Quentes)
     */
    obterOportunidadesRenovacao() {
        const historico = this.obterHistoricoCalculos();
        
        if (historico.length === 0) {
            return [];
        }

        const agora = new Date();
        const oportunidades = [];

        historico.forEach(calc => {
            // Verificar se tem dados do cliente
            if (!calc.cliente || calc.cliente.trim() === '') {
                return; // Pular registros sem cliente
            }

            const dataEvento = new Date(calc.data);
            
            // Calcular diferença em meses
            const diferencaMeses = (agora.getFullYear() - dataEvento.getFullYear()) * 12 + 
                                   (agora.getMonth() - dataEvento.getMonth());
            
            // Filtrar eventos entre 11 e 12 meses atrás (janela de oportunidade)
            if (diferencaMeses >= 11 && diferencaMeses <= 12) {
                // Verificar se já não existe uma oportunidade para o mesmo cliente
                // (evitar duplicatas se cliente tem múltiplos eventos no mesmo período)
                const jaExiste = oportunidades.some(op => 
                    op.cliente.toLowerCase() === calc.cliente.toLowerCase()
                );
                
                if (!jaExiste) {
                    oportunidades.push({
                        id: calc.id,
                        cliente: calc.cliente,
                        contato: calc.contato || 'Não informado',
                        espaco: `${calc.sala.unidade} - ${calc.sala.nome}`,
                        dataEvento: new Date(calc.data).toLocaleDateString('pt-BR'),
                        mesesAtras: diferencaMeses,
                        valorAnterior: calc.valorFinal,
                        convertido: calc.convertido || false
                    });
                }
            }
        });

        // Ordenar por data mais recente (maior chance de conversão)
        oportunidades.sort((a, b) => b.mesesAtras - a.mesesAtras);

        return oportunidades;
    }

    // ========== MÉTODOS DE ANÁLISE DE DADOS (OLAP) ==========

    /**
     * Obtém dados analíticos agregados para Dashboard
     * Agrupa orçamentos por unidade e calcula métricas financeiras
     * @returns {Object} Dados agregados para visualização
     */
    obterDadosAnaliticos() {
        const historico = this.obterHistoricoCalculos();
        
        // Constante para estimativa de custos fixos quando não disponível
        const ESTIMATIVA_CUSTOS_FIXOS_PERCENTUAL = 0.3; // 30% do subtotal
        
        if (historico.length === 0) {
            return {
                kpis: {
                    receitaTotal: 0,
                    receitaConfirmada: 0,
                    margemMedia: 0,
                    ticketMedio: 0
                },
                porUnidade: {},
                evolucaoMensal: []
            };
        }
        
        // Filtrar apenas orçamentos dos últimos 12 meses
        const dataLimite = new Date();
        dataLimite.setMonth(dataLimite.getMonth() - 12);
        
        const historicoRecente = historico.filter(calc => {
            const dataCalc = new Date(calc.data);
            return dataCalc >= dataLimite;
        });
        
        if (historicoRecente.length === 0) {
            return {
                kpis: {
                    receitaTotal: 0,
                    receitaConfirmada: 0,
                    margemMedia: 0,
                    ticketMedio: 0
                },
                porUnidade: {},
                evolucaoMensal: []
            };
        }
        
        // Calcular KPIs gerais
        let receitaTotal = 0;
        let receitaConfirmada = 0;
        let somaMargens = 0;
        let countConvertidos = 0;
        
        // Agregação por unidade
        const porUnidade = {};
        
        // Evolução mensal (últimos 6 meses)
        const evolucaoMensal = [];
        const dataLimite6Meses = new Date();
        dataLimite6Meses.setMonth(dataLimite6Meses.getMonth() - 6);
        
        historicoRecente.forEach(calc => {
            const unidade = calc.sala.unidade;
            const valorFinal = calc.valorFinal || 0;
            const subtotalSemMargem = calc.subtotalSemMargem || 0;
            const convertido = calc.convertido === true;
            
            // KPIs gerais
            receitaTotal += valorFinal;
            if (convertido) {
                receitaConfirmada += valorFinal;
                countConvertidos++;
            }
            somaMargens += calc.margemLiquida || 0;
            
            // Agregação por unidade
            if (!porUnidade[unidade]) {
                porUnidade[unidade] = {
                    receita: 0,
                    custoVariavel: 0,
                    custoFixo: 0,
                    margemContribuicao: 0,
                    count: 0
                };
            }
            
            // Calcular custos com validação para evitar valores negativos
            let custoFixo = calc.custoOperacionalBase || (subtotalSemMargem * ESTIMATIVA_CUSTOS_FIXOS_PERCENTUAL);
            // Garantir que custoFixo não exceda subtotalSemMargem
            custoFixo = Math.min(custoFixo, subtotalSemMargem);
            
            const custoVariavel = Math.max(0, subtotalSemMargem - custoFixo);
            const margemContribuicao = valorFinal - custoVariavel;
            
            porUnidade[unidade].receita += valorFinal;
            porUnidade[unidade].custoVariavel += custoVariavel;
            porUnidade[unidade].custoFixo += custoFixo;
            porUnidade[unidade].margemContribuicao += margemContribuicao;
            porUnidade[unidade].count += 1;
        });
        
        // Calcular evolução mensal
        const mesesMap = {};
        historicoRecente.forEach(calc => {
            const dataCalc = new Date(calc.data);
            if (dataCalc >= dataLimite6Meses) {
                const mesAno = `${dataCalc.getFullYear()}-${String(dataCalc.getMonth() + 1).padStart(2, '0')}`;
                
                if (!mesesMap[mesAno]) {
                    mesesMap[mesAno] = {
                        mes: mesAno,
                        receita: 0,
                        custos: 0,
                        margemLiquida: 0,
                        count: 0
                    };
                }
                
                const valorFinal = calc.valorFinal || 0;
                const subtotalSemMargem = calc.subtotalSemMargem || 0;
                const margemLiquidaValor = valorFinal - subtotalSemMargem;
                
                mesesMap[mesAno].receita += valorFinal;
                mesesMap[mesAno].custos += subtotalSemMargem;
                mesesMap[mesAno].margemLiquida += margemLiquidaValor;
                mesesMap[mesAno].count += 1;
            }
        });
        
        // Converter para array e ordenar
        Object.keys(mesesMap).forEach(mesAno => {
            const mes = mesesMap[mesAno];
            // Calcular percentual de margem líquida
            mes.margemLiquidaPercent = mes.receita > 0 ? (mes.margemLiquida / mes.receita * 100) : 0;
            evolucaoMensal.push(mes);
        });
        
        evolucaoMensal.sort((a, b) => a.mes.localeCompare(b.mes));
        
        // Calcular médias
        const margemMedia = historicoRecente.length > 0 ? somaMargens / historicoRecente.length : 0;
        const ticketMedio = historicoRecente.length > 0 ? receitaTotal / historicoRecente.length : 0;
        
        return {
            kpis: {
                receitaTotal: receitaTotal,
                receitaConfirmada: receitaConfirmada,
                margemMedia: margemMedia,
                ticketMedio: ticketMedio
            },
            porUnidade: porUnidade,
            evolucaoMensal: evolucaoMensal
        };
    }

    // ========== MÉTODOS DE CONFIGURAÇÃO DE BI ==========

    /**
     * Obtém configurações de visualização de BI
     */
    obterConfiguracoesBI() {
        if (!this.dados.configuracoes) {
            this.dados.configuracoes = {};
        }
        if (!this.dados.configuracoes.visualizacaoBI) {
            this.dados.configuracoes.visualizacaoBI = {
                exibirAlertaViabilidade: true,
                exibirEstruturaCustos: true,
                exibirClassificacaoRisco: true
            };
        }
        return this.dados.configuracoes.visualizacaoBI;
    }

    /**
     * Atualiza configurações de visualização de BI
     */
    atualizarConfiguracoesBI(novasConfigs) {
        if (!this.dados.configuracoes) {
            this.dados.configuracoes = {};
        }
        this.dados.configuracoes.visualizacaoBI = {
            ...this.obterConfiguracoesBI(),
            ...novasConfigs
        };
        this.salvarDados();
        return true;
    }

    // ========== MÉTODOS DE AUDITORIA DE DADOS ==========

    /**
     * Realiza auditoria de dados para verificar itens desatualizados
     * Retorna relatório com status geral e lista de itens críticos
     * 
     * @returns {Object} Relatório de auditoria com:
     *   - status: 'OK' ou 'ATENCAO'
     *   - itensDesatualizados: Array de itens que precisam ser revisados
     *   - totalItens: Número total de itens verificados
     *   - itensComProblema: Número de itens com problemas
     */
    realizarAuditoriaDados() {
        const agora = new Date();
        const limiteDias = this.LIMITE_DIAS_AUDITORIA;
        const itensDesatualizados = [];
        
        // Função auxiliar para calcular diferença em dias
        const calcularDiferencaDias = (dataAtualizacao) => {
            if (!dataAtualizacao) return null;
            const dataAtual = new Date(dataAtualizacao);
            const diferencaMs = agora - dataAtual;
            return Math.floor(diferencaMs / (1000 * 60 * 60 * 24));
        };
        
        // Verificar Salas
        this.dados.salas.forEach(sala => {
            const dias = calcularDiferencaDias(sala.ultimaAtualizacao);
            
            if (dias === null || dias > limiteDias) {
                itensDesatualizados.push({
                    tipo: 'Sala',
                    nome: `${sala.unidade} - ${sala.nome}`,
                    id: sala.id,
                    ultimaAtualizacao: sala.ultimaAtualizacao || null,
                    diasDesatualizado: dias,
                    valorAtual: sala.custoBase
                });
            }
        });
        
        // Verificar Extras
        this.dados.extras.forEach(extra => {
            const dias = calcularDiferencaDias(extra.ultimaAtualizacao);
            
            if (dias === null || dias > limiteDias) {
                itensDesatualizados.push({
                    tipo: 'Extra',
                    nome: extra.nome,
                    id: extra.id,
                    ultimaAtualizacao: extra.ultimaAtualizacao || null,
                    diasDesatualizado: dias,
                    valorAtual: extra.custo
                });
            }
        });
        
        // Verificar Funcionários
        this.dados.funcionarios.forEach(funcionario => {
            const dias = calcularDiferencaDias(funcionario.ultimaAtualizacao);
            
            if (dias === null || dias > limiteDias) {
                itensDesatualizados.push({
                    tipo: 'Funcionário',
                    nome: funcionario.nome,
                    id: funcionario.id,
                    ultimaAtualizacao: funcionario.ultimaAtualizacao || null,
                    diasDesatualizado: dias,
                    valorAtual: funcionario.horaNormal
                });
            }
        });
        
        // Calcular totais
        const totalItens = this.dados.salas.length + this.dados.extras.length + this.dados.funcionarios.length;
        const itensComProblema = itensDesatualizados.length;
        
        return {
            status: itensComProblema > 0 ? 'ATENCAO' : 'OK',
            itensDesatualizados,
            totalItens,
            itensComProblema,
            limiteDias
        };
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

// Exportar instância global do DataManager
const dataManager = new DataManager();
