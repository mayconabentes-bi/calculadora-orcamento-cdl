/* =================================================================
   VALIDATION.JS - Sistema de Validação de Dados
   Funções para validar dados e prevenir problemas de precisão
   ================================================================= */

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
    // Number.MAX_SAFE_INTEGER = 9007199254740991
    if (valor > Number.MAX_SAFE_INTEGER / 100) {
        return { valido: false, erro: 'Valor muito grande, pode causar perda de precisão' };
    }

    // Verificar número de casas decimais (mais de 2 pode indicar erro de precisão)
    const decimal = (valor.toString().split('.')[1] || '').length;
    if (decimal > 10) {
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
 * Verifica se há perda de precisão em operações monetárias
 * @param {number} valor - Valor calculado
 * @returns {boolean} true se detectou perda de precisão
 */
function detectarPerdaPrecisao(valor) {
    const arredondado = arredondarMoeda(valor);
    const diferenca = Math.abs(valor - arredondado);
    
    // Se a diferença for maior que 0.001, pode haver problema
    return diferenca > 0.001;
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
        detectarPerdaPrecisao
    };
}
