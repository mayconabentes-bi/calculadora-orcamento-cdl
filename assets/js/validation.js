/* =================================================================
   VALIDATION.JS - Sistema de Validação de Dados v5.2.0 - Refactored
   Funções para validar dados e prevenir problemas de precisão
   Módulo ES6 puro - Padrão ES Modules
   ================================================================= */

// Constantes de validação
const MAX_SAFE_MONETARY_VALUE = Number.MAX_SAFE_INTEGER / 100;
const MAX_DECIMAL_PLACES = 10;
const PRECISION_THRESHOLD = 0.001;

/* =================================================================
   CORE UTILS - Centralização de Utilitários de Formatação
   Fonte única da verdade para apresentação de dados financeiros
   ================================================================= */

/**
 * Classe estática CoreUtils
 * Centraliza todas as funções de formatação e utilitários do sistema
 * Garante consistência na apresentação de dados em toda a aplicação
 */
class CoreUtils {
    /**
     * Formata número como moeda brasileira
     * @param {number} valor - Valor a ser formatado
     * @returns {string} Valor formatado (ex: "1.234,56")
     */
    static formatarMoeda(valor) {
        return valor.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    /**
     * Formata número simples com 2 casas decimais
     * @param {number} valor - Valor a ser formatado
     * @returns {string} Valor formatado (ex: "1234.56")
     */
    static formatarNumero(valor) {
        return valor.toFixed(2);
    }

    /**
     * Converte horário em formato HH:MM para minutos
     * @param {string} timeString - Horário no formato "HH:MM"
     * @returns {number} Total de minutos
     */
    static parseTimeToMinutes(timeString) {
        const [hora, minuto] = timeString.split(':').map(Number);
        return hora * 60 + minuto;
    }

    /**
     * Formata número como moeda compacta (para eixos de gráficos)
     * @param {number} valor - Valor a ser formatado
     * @returns {string} Valor formatado (ex: "1.2M", "500K")
     */
    static formatarMoedaCompacta(valor) {
        if (valor >= 1000000) {
            return (valor / 1000000).toFixed(1) + 'M';
        } else if (valor >= 1000) {
            return (valor / 1000).toFixed(1) + 'K';
        }
        return valor.toFixed(0);
    }
}

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
     * Separadas em palavras únicas e frases compostas
     */
    static PALAVRAS_PROIBIDAS_UNICAS = [
        'caro', 'barato', 'chato', 'vip', 'urgente', 
        'conhecido', 'importante', 'especial',
        'difícil', 'complicado', 'fácil', 'rápido'
    ];
    
    static FRASES_PROIBIDAS = [
        'amigo do dono'
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
     * Aceita: (11) 98765-4321, 11987654321, +5511987654321, 1133334444, etc.
     * Padrão mais rigoroso: exige DDD (2-3 dígitos), opcionalmente 9 inicial, e 8 dígitos
     */
    static REGEX_TELEFONE = /^[\+]?[0-9]{0,2}[-\s\.]?[(]?[0-9]{2,3}[)]?[-\s\.]?[9]?[-\s\.]?[0-9]{4}[-\s\.]?[0-9]{4}$/;

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
        if (typeof nome !== 'string') {
            return { valido: false, nomeNormalizado: null, erro: 'Nome deve ser uma string válida' };
        }

        // Remover espaços em excesso
        let nomeProcessado = nome.trim();

        if (nomeProcessado.length === 0) {
            return { valido: false, nomeNormalizado: null, erro: 'Nome está vazio' };
        }

        // Remover emojis e caracteres especiais não-textuais
        // Remove: emojis, símbolos, caracteres de controle, mas mantém acentos e pontuação básica
        // Regex otimizado combinando todos os ranges Unicode de emojis
        nomeProcessado = nomeProcessado.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');

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
     * 
     * ATUALIZAÇÃO: Campo agora é OPCIONAL para permitir testes manuais
     * Aceita qualquer string de texto livre quando fornecido
     * Não valida formatos específicos de Email ou Telefone
     * 
     * @param {string} contato - Contato do cliente (email, telefone ou texto livre) - OPCIONAL
     * @returns {Object} { valido: boolean, tipo: 'texto'|null, contatoNormalizado: string|null, erro: string|null }
     */
    static validarContato(contato) {
        // CAMPO OPCIONAL: Se vazio ou não fornecido, retornar como válido
        if (!contato || typeof contato !== 'string' || contato.trim().length === 0) {
            return { valido: true, tipo: null, contatoNormalizado: null, erro: null };
        }

        const contatoTrimmed = contato.trim();

        // MODO FLEXÍVEL: Aceitar qualquer texto livre
        // Retornar como válido independente do formato
        return { valido: true, tipo: 'texto', contatoNormalizado: contatoTrimmed, erro: null };
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

        // Verificar palavras únicas usando word boundary
        for (const palavra of this.PALAVRAS_PROIBIDAS_UNICAS) {
            const regex = new RegExp(`\\b${palavra}\\b`, 'i');
            if (regex.test(textoLower)) {
                palavrasEncontradas.push(palavra);
            }
        }
        
        // Verificar frases compostas (sem word boundary, busca simples)
        for (const frase of this.FRASES_PROIBIDAS) {
            if (textoLower.includes(frase)) {
                palavrasEncontradas.push(frase);
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
     * ATUALIZAÇÃO: Contato agora é OPCIONAL - não gera erro se vazio ou fora do padrão
     * 
     * @param {string} clienteNome - Nome do cliente
     * @param {string} clienteContato - Contato do cliente (OPCIONAL)
     * @returns {Object} { valido: boolean, dados: Object|null, erros: Array<string> }
     */
    static sanitizarDadosCliente(clienteNome, clienteContato) {
        const erros = [];

        // Validar e normalizar nome
        const resultadoNome = this.normalizarNome(clienteNome);
        if (!resultadoNome.valido) {
            erros.push(`Nome: ${resultadoNome.erro}`);
        }

        // Detectar viés no nome NORMALIZADO (não no original)
        // Isso permite que nomes com observações subjetivas sejam removidas e aceitas
        if (resultadoNome.valido) {
            const viesNome = this.detectarVies(resultadoNome.nomeNormalizado);
            if (viesNome.temVies) {
                erros.push(`Nome contém viés: ${viesNome.motivos.join('; ')}`);
            }
        }

        // Validar e normalizar contato (CAMPO OPCIONAL)
        // Não adicionar erro se contato estiver vazio ou fora do padrão
        const resultadoContato = this.validarContato(clienteContato);
        // Contato sempre é válido agora (campo opcional), então não verificamos erros

        // Se há erros (apenas do nome), retornar inválido
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

// ========== ES6 MODULE EXPORTS ==========
// Exportação ES Modules padrão v5.2.0

export {
    CoreUtils,
    DataSanitizer,
    validarValorMonetario,
    validarPercentual,
    validarQuantidade,
    validarDuracao,
    validarHorario,
    validarIntervaloHorario,
    validarDiasSemana,
    arredondarMoeda,
    detectarPerdaPrecisao
};
