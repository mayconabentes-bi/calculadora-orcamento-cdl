/* =================================================================
   VALIDATION.JS - Sistema de Validação de Dados
   Funções para validar dados e prevenir problemas de precisão
   ================================================================= */

// Constantes de validação
const MAX_SAFE_MONETARY_VALUE = Number.MAX_SAFE_INTEGER / 100;
const MAX_DECIMAL_PLACES = 10;
const PRECISION_THRESHOLD = 0.001;

/**
 * Valida valores monetários
 * Verifica se o valor está dentro dos limites seguros para cálculos financeiros
 * 
 * AVISO: JavaScript usa IEEE 754 float de 64 bits, que pode causar imprecisões
 * em cálculos monetários devido a erros de arredondamento.
 * Para aplicações críticas, considere usar bibliotecas como:
 * - decimal.js: https://github.com/MikeMcl/decimal.js/
 * - big.js: https://github.com/MikeMcl/big.js/
 * - bignumber.js: https://github.com/MikeMcl/bignumber.js/
 * 
 * @param {number} valor - Valor a ser validado
 * @returns {Object} { valido: boolean, erro: string|null }
 */
function validarValorMonetario(valor) {
    // Verificar se é um número válido
    if (typeof valor !== 'number' || isNaN(valor)) {
        return { valido: false, erro: 'Valor deve ser um número válido' };
    }

    // Verificar valores negativos
    if (valor < 0) {
        return { valido: false, erro: 'Valor não pode ser negativo' };
    }

    // Verificar valores extremamente grandes que podem causar perda de precisão
    if (valor > MAX_SAFE_MONETARY_VALUE) {
        return { valido: false, erro: 'Valor muito grande, pode causar perda de precisão' };
    }

    // Verificar número de casas decimais (mais de MAX_DECIMAL_PLACES pode indicar erro de precisão)
    // Nota: Usamos uma abordagem de string que funciona para a maioria dos casos.
    // Para números em notação científica, tratamos separadamente.
    const valorStr = valor.toString();
    
    // Se está em notação científica (muito grande ou pequeno), validar separadamente
    if (valorStr.includes('e') || valorStr.includes('E')) {
        // Valores em notação científica muito pequenos ou muito grandes podem ser problemáticos
        const absValor = Math.abs(valor);
        if (absValor < 0.01 && absValor > 0) {
            // Valores monetários muito pequenos podem indicar erro de precisão
            return { 
                valido: false, 
                erro: 'Valor muito pequeno, possível erro de precisão flutuante' 
            };
        }
    }
    
    const decimal = (valorStr.split('.')[1] || '').replace(/[eE].*/, '').length;
    if (decimal > MAX_DECIMAL_PLACES) {
        return { 
            valido: false, 
            erro: 'Valor com muitas casas decimais, possível erro de precisão flutuante' 
        };
    }

    return { valido: true, erro: null };
}

/**
 * Valida percentuais (0-100)
 * @param {number} percentual - Percentual a ser validado
 * @returns {Object} { valido: boolean, erro: string|null }
 */
function validarPercentual(percentual) {
    if (typeof percentual !== 'number' || isNaN(percentual)) {
        return { valido: false, erro: 'Percentual deve ser um número válido' };
    }

    if (percentual < 0) {
        return { valido: false, erro: 'Percentual não pode ser negativo' };
    }

    if (percentual > 100) {
        return { valido: false, erro: 'Percentual não pode ser maior que 100%' };
    }

    return { valido: true, erro: null };
}

/**
 * Valida quantidade (inteiro positivo)
 * @param {number} quantidade - Quantidade a ser validada
 * @returns {Object} { valido: boolean, erro: string|null }
 */
function validarQuantidade(quantidade) {
    if (typeof quantidade !== 'number' || isNaN(quantidade)) {
        return { valido: false, erro: 'Quantidade deve ser um número válido' };
    }

    if (quantidade < 0) {
        return { valido: false, erro: 'Quantidade não pode ser negativa' };
    }

    if (!Number.isInteger(quantidade)) {
        return { valido: false, erro: 'Quantidade deve ser um número inteiro' };
    }

    return { valido: true, erro: null };
}

/**
 * Valida duração (dias ou meses)
 * @param {number} duracao - Duração a ser validada
 * @param {string} tipo - Tipo de duração ('dias' ou 'meses')
 * @returns {Object} { valido: boolean, erro: string|null }
 */
function validarDuracao(duracao, tipo) {
    const resultQuantidade = validarQuantidade(duracao);
    if (!resultQuantidade.valido) {
        return resultQuantidade;
    }

    if (duracao === 0) {
        return { valido: false, erro: 'Duração não pode ser zero' };
    }

    // Limites razoáveis
    const maxDias = 730; // ~2 anos
    const maxMeses = 24; // 2 anos

    if (tipo === 'dias' && duracao > maxDias) {
        return { valido: false, erro: `Duração não pode exceder ${maxDias} dias` };
    }

    if (tipo === 'meses' && duracao > maxMeses) {
        return { valido: false, erro: `Duração não pode exceder ${maxMeses} meses` };
    }

    return { valido: true, erro: null };
}

/**
 * Valida horário no formato HH:MM
 * @param {string} horario - Horário a ser validado
 * @returns {Object} { valido: boolean, erro: string|null }
 */
function validarHorario(horario) {
    if (typeof horario !== 'string') {
        return { valido: false, erro: 'Horário deve ser uma string' };
    }

    const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!regex.test(horario)) {
        return { valido: false, erro: 'Horário deve estar no formato HH:MM' };
    }

    return { valido: true, erro: null };
}

/**
 * Valida intervalo de horários
 * @param {string} inicio - Horário de início
 * @param {string} fim - Horário de fim
 * @returns {Object} { valido: boolean, erro: string|null }
 */
function validarIntervaloHorario(inicio, fim) {
    const validacaoInicio = validarHorario(inicio);
    if (!validacaoInicio.valido) {
        return { valido: false, erro: `Horário de início inválido: ${validacaoInicio.erro}` };
    }

    const validacaoFim = validarHorario(fim);
    if (!validacaoFim.valido) {
        return { valido: false, erro: `Horário de fim inválido: ${validacaoFim.erro}` };
    }

    const [horaInicio, minutoInicio] = inicio.split(':').map(Number);
    const [horaFim, minutoFim] = fim.split(':').map(Number);

    const minutosInicio = horaInicio * 60 + minutoInicio;
    const minutosFim = horaFim * 60 + minutoFim;

    if (minutosInicio >= minutosFim) {
        return { valido: false, erro: 'Horário de início deve ser anterior ao horário de fim' };
    }

    return { valido: true, erro: null };
}

/**
 * Valida array de dias da semana (0-6, onde 0=domingo)
 * @param {Array<number>} dias - Array de dias da semana
 * @returns {Object} { valido: boolean, erro: string|null }
 */
function validarDiasSemana(dias) {
    if (!Array.isArray(dias)) {
        return { valido: false, erro: 'Dias da semana devem ser um array' };
    }

    if (dias.length === 0) {
        return { valido: false, erro: 'Deve selecionar pelo menos um dia da semana' };
    }

    for (const dia of dias) {
        if (!Number.isInteger(dia) || dia < 0 || dia > 6) {
            return { valido: false, erro: 'Dias da semana devem ser inteiros entre 0 e 6' };
        }
    }

    return { valido: true, erro: null };
}

/**
 * Arredonda valor monetário para 2 casas decimais de forma segura
 * @param {number} valor - Valor a ser arredondado
 * @returns {number} Valor arredondado
 */
function arredondarMoeda(valor) {
    // Multiplica por 100, arredonda e divide por 100 para evitar erros de precisão
    return Math.round((valor + Number.EPSILON) * 100) / 100;
}

/**
 * Verifica se há diferença significativa entre o valor e seu arredondamento
 * Útil para detectar valores que precisam ser arredondados antes de uso
 * 
 * Nota: Esta função detecta diferenças > PRECISION_THRESHOLD entre o valor original e
 * o valor arredondado. Não detecta todos os erros de precisão flutuante,
 * apenas aqueles que resultam em diferenças perceptíveis após arredondamento.
 * 
 * @param {number} valor - Valor calculado
 * @returns {boolean} true se detectou diferença > PRECISION_THRESHOLD do valor arredondado
 */
function detectarPerdaPrecisao(valor) {
    const arredondado = arredondarMoeda(valor);
    const diferenca = Math.abs(valor - arredondado);
    
    // Se a diferença for maior que o limite, pode haver problema
    return diferenca > PRECISION_THRESHOLD;
}

/* =================================================================
   DATA SANITIZER - Gatekeeper de Qualidade de Dados para CRM
   Sistema de higienização e validação de dados do cliente
   para alimentar modelos de Inteligência Artificial
   ================================================================= */

/**
 * Classe DataSanitizer
 * Responsável por limpar e validar inputs de dados do cliente antes
 * de serem processados e armazenados no sistema CRM.
 * 
 * Objetivos:
 * - Impor neutralidade técnica nos dados
 * - Remover linguagem emotiva (CAPS, excesso de pontuação, emojis)
 * - Padronizar formatos para facilitar desduplicação futura
 * - Garantir integridade dos dados para modelos de IA
 */
class DataSanitizer {
    /**
     * Palavras proibidas (blacklist) que indicam subjetividade ou viés
     */
    static PALAVRAS_PROIBIDAS = [
        'caro', 'barato', 'chato', 'vip', 'urgente', 
        'amigo do dono', 'conhecido', 'importante', 'especial',
        'difícil', 'complicado', 'fácil', 'rápido'
    ];

    /**
     * Padrões de subjetividade entre parênteses
     */
    static PATTERN_PARENTESES_SUBJETIVOS = /\([^)]*(?:urgente|chato|amigo|vip|importante|especial|difícil|complicado)[^)]*\)/gi;

    /**
     * Regex para validação de email
     */
    static REGEX_EMAIL = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    /**
     * Regex para detectar telefone (formato brasileiro e variações)
     * Aceita: (11) 98765-4321, 11987654321, +5511987654321, etc.
     */
    static REGEX_TELEFONE = /^[\+]?[(]?[0-9]{2,3}[)]?[-\s\.]?[0-9]{4,5}[-\s\.]?[0-9]{4}$/;

    /**
     * Normaliza o nome do cliente para formato padronizado
     * - Converte para Title Case (Primeira Letra Maiúscula)
     * - Remove emojis e caracteres especiais não-textuais
     * - Remove observações subjetivas entre parênteses
     * 
     * @param {string} nome - Nome do cliente/empresa a ser normalizado
     * @returns {Object} { valido: boolean, nomeNormalizado: string|null, erro: string|null }
     */
    static normalizarNome(nome) {
        // Validar entrada
        if (!nome || typeof nome !== 'string') {
            return { valido: false, nomeNormalizado: null, erro: 'Nome deve ser uma string não vazia' };
        }

        // Remover espaços em excesso
        let nomeProcessado = nome.trim();

        if (nomeProcessado.length === 0) {
            return { valido: false, nomeNormalizado: null, erro: 'Nome não pode ser vazio' };
        }

        // Remover emojis e caracteres especiais não-textuais
        // Remove: emojis, símbolos, caracteres de controle, mas mantém acentos e pontuação básica
        nomeProcessado = nomeProcessado.replace(/[\u{1F600}-\u{1F64F}]/gu, ''); // Emoticons
        nomeProcessado = nomeProcessado.replace(/[\u{1F300}-\u{1F5FF}]/gu, ''); // Símbolos e pictogramas
        nomeProcessado = nomeProcessado.replace(/[\u{1F680}-\u{1F6FF}]/gu, ''); // Transporte e mapas
        nomeProcessado = nomeProcessado.replace(/[\u{1F1E0}-\u{1F1FF}]/gu, ''); // Bandeiras
        nomeProcessado = nomeProcessado.replace(/[\u{2600}-\u{26FF}]/gu, '');   // Símbolos diversos
        nomeProcessado = nomeProcessado.replace(/[\u{2700}-\u{27BF}]/gu, '');   // Dingbats

        // Remover observações subjetivas entre parênteses
        nomeProcessado = nomeProcessado.replace(this.PATTERN_PARENTESES_SUBJETIVOS, '');

        // Remover parênteses vazios resultantes
        nomeProcessado = nomeProcessado.replace(/\(\s*\)/g, '');

        // Normalizar espaços múltiplos
        nomeProcessado = nomeProcessado.replace(/\s+/g, ' ').trim();

        // Converter para Title Case (Primeira Letra de Cada Palavra Maiúscula)
        nomeProcessado = this.toTitleCase(nomeProcessado);

        // Validar se ainda há conteúdo após processamento
        if (nomeProcessado.length === 0) {
            return { valido: false, nomeNormalizado: null, erro: 'Nome resultante está vazio após normalização' };
        }

        // Validar comprimento mínimo (pelo menos 2 caracteres)
        if (nomeProcessado.length < 2) {
            return { valido: false, nomeNormalizado: null, erro: 'Nome muito curto (mínimo 2 caracteres)' };
        }

        return { valido: true, nomeNormalizado: nomeProcessado, erro: null };
    }

    /**
     * Converte string para Title Case
     * Exceções: preposições, artigos e conjunções permanecem em minúsculas
     * 
     * @param {string} str - String a ser convertida
     * @returns {string} String em Title Case
     */
    static toTitleCase(str) {
        // Palavras que devem permanecer em minúsculas (exceto no início)
        const excecoes = ['de', 'da', 'do', 'das', 'dos', 'e', 'ou', 'em', 'na', 'no', 'para', 'com'];

        return str.toLowerCase().split(' ').map((palavra, index) => {
            // Primeira palavra sempre em maiúscula
            if (index === 0) {
                return palavra.charAt(0).toUpperCase() + palavra.slice(1);
            }
            
            // Verificar se é exceção
            if (excecoes.includes(palavra)) {
                return palavra;
            }

            // Converter para Title Case
            return palavra.charAt(0).toUpperCase() + palavra.slice(1);
        }).join(' ');
    }

    /**
     * Valida e normaliza contato do cliente
     * Detecta automaticamente se é Email ou Telefone
     * 
     * Para Telefone: Remove formatação visual e mantém apenas dígitos
     * Para Email: Valida com Regex estrito e converte para lowercase
     * 
     * @param {string} contato - Contato do cliente (email ou telefone)
     * @returns {Object} { valido: boolean, tipo: 'email'|'telefone'|null, contatoNormalizado: string|null, erro: string|null }
     */
    static validarContato(contato) {
        // Validar entrada
        if (!contato || typeof contato !== 'string') {
            return { valido: false, tipo: null, contatoNormalizado: null, erro: 'Contato deve ser uma string não vazia' };
        }

        const contatoTrimmed = contato.trim();

        if (contatoTrimmed.length === 0) {
            return { valido: false, tipo: null, contatoNormalizado: null, erro: 'Contato não pode ser vazio' };
        }

        // Detectar se é email (presença de @)
        if (contatoTrimmed.includes('@')) {
            return this.validarEmail(contatoTrimmed);
        }

        // Caso contrário, tratar como telefone
        return this.validarTelefone(contatoTrimmed);
    }

    /**
     * Valida e normaliza email
     * 
     * @param {string} email - Email a ser validado
     * @returns {Object} { valido: boolean, tipo: 'email', contatoNormalizado: string|null, erro: string|null }
     */
    static validarEmail(email) {
        const emailLower = email.toLowerCase().trim();

        // Validar com regex
        if (!this.REGEX_EMAIL.test(emailLower)) {
            return { valido: false, tipo: 'email', contatoNormalizado: null, erro: 'Formato de email inválido' };
        }

        // Validação adicional: verificar se domínio tem pelo menos um ponto
        const dominio = emailLower.split('@')[1];
        if (!dominio || !dominio.includes('.')) {
            return { valido: false, tipo: 'email', contatoNormalizado: null, erro: 'Domínio de email inválido' };
        }

        return { valido: true, tipo: 'email', contatoNormalizado: emailLower, erro: null };
    }

    /**
     * Valida e normaliza telefone
     * Remove toda formatação visual e mantém apenas dígitos
     * 
     * @param {string} telefone - Telefone a ser validado
     * @returns {Object} { valido: boolean, tipo: 'telefone', contatoNormalizado: string|null, erro: string|null }
     */
    static validarTelefone(telefone) {
        const telefoneTrimmed = telefone.trim();

        // Validar formato antes de remover caracteres
        if (!this.REGEX_TELEFONE.test(telefoneTrimmed)) {
            return { valido: false, tipo: 'telefone', contatoNormalizado: null, erro: 'Formato de telefone inválido' };
        }

        // Remover toda formatação: parênteses, traços, espaços, pontos, sinal de +
        const apenasDigitos = telefoneTrimmed.replace(/[\s\-\.\(\)\+]/g, '');

        // Validar quantidade de dígitos (mínimo 10, máximo 13 para incluir código do país)
        if (apenasDigitos.length < 10 || apenasDigitos.length > 13) {
            return { valido: false, tipo: 'telefone', contatoNormalizado: null, erro: 'Telefone deve ter entre 10 e 13 dígitos' };
        }

        // Validar que só contém dígitos
        if (!/^\d+$/.test(apenasDigitos)) {
            return { valido: false, tipo: 'telefone', contatoNormalizado: null, erro: 'Telefone deve conter apenas números' };
        }

        return { valido: true, tipo: 'telefone', contatoNormalizado: apenasDigitos, erro: null };
    }

    /**
     * Detecta viés emocional ou linguagem subjetiva no texto
     * 
     * Verifica:
     * - Mais de um ponto de exclamação consecutivo (!!)
     * - Texto inteiramente em maiúsculas (gritar)
     * - Palavras da blacklist (ex: caro, barato, chato, vip)
     * 
     * @param {string} texto - Texto a ser analisado
     * @returns {Object} { temVies: boolean, motivos: Array<string> }
     */
    static detectarVies(texto) {
        // Validar entrada
        if (!texto || typeof texto !== 'string') {
            return { temVies: false, motivos: [] };
        }

        const textoTrimmed = texto.trim();

        if (textoTrimmed.length === 0) {
            return { temVies: false, motivos: [] };
        }

        const motivos = [];

        // 1. Detectar múltiplos pontos de exclamação consecutivos
        if (/!!+/.test(textoTrimmed)) {
            motivos.push('Excesso de pontos de exclamação (linguagem emotiva)');
        }

        // 2. Detectar texto inteiramente em maiúsculas (gritar)
        // Exceção: textos muito curtos (siglas) ou com menos de 4 letras
        const letras = textoTrimmed.replace(/[^a-zA-ZÀ-ÿ]/g, '');
        if (letras.length >= 4 && letras === letras.toUpperCase()) {
            motivos.push('Texto em maiúsculas (ALL CAPS é considerado gritar)');
        }

        // 3. Detectar palavras da blacklist
        const textoLower = textoTrimmed.toLowerCase();
        const palavrasEncontradas = [];

        for (const palavra of this.PALAVRAS_PROIBIDAS) {
            // Usar word boundary para evitar falsos positivos em palavras maiores
            const regex = new RegExp(`\\b${palavra}\\b`, 'i');
            if (regex.test(textoLower)) {
                palavrasEncontradas.push(palavra);
            }
        }

        if (palavrasEncontradas.length > 0) {
            motivos.push(`Palavras subjetivas detectadas: ${palavrasEncontradas.join(', ')}`);
        }

        return {
            temVies: motivos.length > 0,
            motivos: motivos
        };
    }

    /**
     * Método auxiliar para sanitizar completamente os dados do cliente
     * Combina normalização de nome, validação de contato e detecção de viés
     * 
     * @param {string} clienteNome - Nome do cliente
     * @param {string} clienteContato - Contato do cliente
     * @returns {Object} { valido: boolean, dados: Object|null, erros: Array<string> }
     */
    static sanitizarDadosCliente(clienteNome, clienteContato) {
        const erros = [];

        // Validar e normalizar nome
        const resultadoNome = this.normalizarNome(clienteNome);
        if (!resultadoNome.valido) {
            erros.push(`Nome: ${resultadoNome.erro}`);
        }

        // Detectar viés no nome
        if (resultadoNome.valido) {
            const viesNome = this.detectarVies(clienteNome);
            if (viesNome.temVies) {
                erros.push(`Nome contém viés: ${viesNome.motivos.join('; ')}`);
            }
        }

        // Validar e normalizar contato
        const resultadoContato = this.validarContato(clienteContato);
        if (!resultadoContato.valido) {
            erros.push(`Contato: ${resultadoContato.erro}`);
        }

        // Se há erros, retornar inválido
        if (erros.length > 0) {
            return { valido: false, dados: null, erros };
        }

        // Retornar dados sanitizados
        return {
            valido: true,
            dados: {
                clienteNome: resultadoNome.nomeNormalizado,
                clienteContato: resultadoContato.contatoNormalizado,
                tipoContato: resultadoContato.tipo
            },
            erros: []
        };
    }
}

// Exportar funções (se estiver usando módulos)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validarValorMonetario,
        validarPercentual,
        validarQuantidade,
        validarDuracao,
        validarHorario,
        validarIntervaloHorario,
        validarDiasSemana,
        arredondarMoeda,
        detectarPerdaPrecisao,
        DataSanitizer
    };
}
