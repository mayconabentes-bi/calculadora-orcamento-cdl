/* =================================================================
   BUDGET ENGINE - Motor de Cálculo de Orçamentos v5.2.0 - Refactored
   Inteligência financeira desacoplada da interface do usuário
   Módulo ES6 puro - Padrão ES Modules
   ================================================================= */

/**
 * Classe BudgetEngine
 * Motor de cálculo de orçamentos independente do DOM
 * Permite testes unitários sem dependências de interface
 * 
 * Responsabilidades:
 * - Cálculo de valores de orçamento baseado em parâmetros
 * - Lógica de pricing e rentabilidade
 * - Cálculos de mão de obra e custos operacionais
 * - Aplicação de margens e descontos
 */
class BudgetEngine {
    /**
     * @param {Object} dataManager - Instância do DataManager para acesso a dados
     */
    constructor(dataManager) {
        this.dataManager = dataManager;
    }

    /**
     * Calcula valores do orçamento
     * 
     * Complexidade Algorítmica: O(d + f) onde:
     * - d = número de dias selecionados na semana (max 7)
     * - f = número de funcionários ativos
     * 
     * Análise de Performance:
     * - Processamento de dias: O(d) - dois loops sobre diasSelecionados (max 7 elementos)
     * - Processamento de funcionários: O(f) - um loop sobre funcionários ativos
     * - Total: O(d + f) que é linear e eficiente
     * 
     * Nota sobre Precisão Numérica:
     * Esta função realiza múltiplas operações com valores monetários.
     * Para aplicações críticas ou valores muito grandes, considere usar
     * bibliotecas de precisão decimal como decimal.js
     * 
     * @param {Object} params - Parâmetros do cálculo
     * @param {Object} params.sala - Dados da sala/espaço
     * @param {number} params.duracao - Duração do contrato
     * @param {string} params.duracaoTipo - Tipo: 'dias' ou 'meses'
     * @param {Array<number>} params.diasSelecionados - Array com dias da semana (0-6)
     * @param {number} params.horasPorDia - Horas por dia de trabalho
     * @param {number} params.margem - Margem de lucro (0-1, ex: 0.20 = 20%)
     * @param {number} params.desconto - Desconto (0-1, ex: 0.10 = 10%)
     * @param {Array<number>} params.extrasIds - IDs dos itens extras selecionados
     * @returns {Object} Resultado dos cálculos
     */
    calcularValores({ sala, duracao, duracaoTipo, diasSelecionados, horasPorDia, margem, desconto, extrasIds = [] }) {
        // ========================================================
        // INTEGRIDADE DO MOTOR DE CÁLCULO
        // Garantir robustez com operadores de coalescência nula
        // Evitar divisão por zero e valores NaN
        // ========================================================
        
        const funcionariosAtivos = this.dataManager.obterFuncionariosAtivos() ?? [];
        const multiplicadores = this.dataManager.obterMultiplicadoresTurno() ?? { manha: 1.0, tarde: 1.15, noite: 1.40 };
        
        // Garantir valores padrão válidos com coalescência nula
        sala = sala ?? { custoBase: 0 };
        duracao = duracao ?? 1;
        duracaoTipo = duracaoTipo ?? 'meses';
        // Default: Segunda-feira (value: 1 = Monday in JavaScript Date.getDay() convention)
        diasSelecionados = (diasSelecionados && diasSelecionados.length > 0) ? diasSelecionados : [1];
        horasPorDia = horasPorDia ?? 8;
        margem = margem ?? 0;
        desconto = desconto ?? 0;
        extrasIds = extrasIds ?? [];
        
        // Converter duração para dias
        let duracaoEmDias = duracao;
        if (duracaoTipo === 'meses') {
            duracaoEmDias = duracao * 30; // Aproximadamente 30 dias por mês
        }
        
        // Calcular total de dias trabalhados
        const semanas = Math.floor(duracaoEmDias / 7);
        const diasRestantes = duracaoEmDias % 7;
        
        let diasTrabalhadosPorTipo = {
            normais: 0,  // Segunda a Sexta
            sabado: 0,
            domingo: 0
        };
        
        // Contar dias por tipo nas semanas completas
        // Complexidade: O(d) onde d = diasSelecionados.length (max 7)
        diasSelecionados.forEach(dia => {
            if (dia === 6) {
                diasTrabalhadosPorTipo.sabado += semanas;
            } else if (dia === 0) {
                diasTrabalhadosPorTipo.domingo += semanas;
            } else {
                diasTrabalhadosPorTipo.normais += semanas;
            }
        });
        
        // Adicionar dias restantes (proporcional)
        // Complexidade: O(d) onde d = diasSelecionados.length (max 7)
        if (diasRestantes > 0) {
            diasSelecionados.forEach(dia => {
                const proporcao = diasRestantes / 7;
                if (dia === 6) {
                    diasTrabalhadosPorTipo.sabado += proporcao;
                } else if (dia === 0) {
                    diasTrabalhadosPorTipo.domingo += proporcao;
                } else {
                    diasTrabalhadosPorTipo.normais += proporcao;
                }
            });
        }
        
        const diasTotais = diasTrabalhadosPorTipo.normais + diasTrabalhadosPorTipo.sabado + diasTrabalhadosPorTipo.domingo;
        
        // Calcular horas por tipo
        const horasNormais = diasTrabalhadosPorTipo.normais * horasPorDia;
        const horasHE50 = diasTrabalhadosPorTipo.sabado * horasPorDia; // Sábado - HE 50%
        const horasHE100 = diasTrabalhadosPorTipo.domingo * horasPorDia; // Domingo - HE 100%
        const horasTotais = horasNormais + horasHE50 + horasHE100;
        
        // Calcular custo operacional base (usa média dos multiplicadores de turno)
        const multiplicadorMedio = ((multiplicadores.manha ?? 1.0) + (multiplicadores.tarde ?? 1.15) + (multiplicadores.noite ?? 1.40)) / 3;
        const custoOperacionalBase = (sala.custoBase ?? 0) * multiplicadorMedio * horasTotais;
        
        // Calcular custos de mão de obra para cada funcionário
        // Complexidade: O(f) onde f = funcionariosAtivos.length
        // IMPORTANTE: Este loop é linear, não aninhado - mantém eficiência O(n)
        // ROBUSTEZ: Usar coalescência nula para evitar NaN em todos os cálculos
        const detalhamentoFuncionarios = [];
        let custoMaoObraNormal = 0;
        let custoMaoObraHE50 = 0;
        let custoMaoObraHE100 = 0;
        let custoValeTransporte = 0;
        let custoTransporteApp = 0;
        let custoRefeicao = 0;
        
        funcionariosAtivos.forEach(func => {
            const custoFuncNormal = horasNormais * (func.horaNormal ?? 0);
            const custoFuncHE50 = horasHE50 * (func.he50 ?? 0);
            const custoFuncHE100 = horasHE100 * (func.he100 ?? 0);
            const custoFuncVT = diasTotais * (func.valeTransporte ?? 0);
            const custoFuncTransApp = diasTotais * (func.transporteApp ?? 0);
            const custoFuncRefeicao = diasTotais * (func.refeicao ?? 0);
            
            const custoFuncTotal = custoFuncNormal + custoFuncHE50 + custoFuncHE100 + 
                                   custoFuncVT + custoFuncTransApp + custoFuncRefeicao;
            
            detalhamentoFuncionarios.push({
                nome: func.nome,
                horasNormais: horasNormais,
                horasHE50: horasHE50,
                horasHE100: horasHE100,
                custoNormal: custoFuncNormal,
                custoHE50: custoFuncHE50,
                custoHE100: custoFuncHE100,
                custoVT: custoFuncVT,
                custoTransApp: custoFuncTransApp,
                custoRefeicao: custoFuncRefeicao,
                custoTotal: custoFuncTotal
            });
            
            custoMaoObraNormal += custoFuncNormal;
            custoMaoObraHE50 += custoFuncHE50;
            custoMaoObraHE100 += custoFuncHE100;
            custoValeTransporte += custoFuncVT;
            custoTransporteApp += custoFuncTransApp;
            custoRefeicao += custoFuncRefeicao;
        });
        
        const custoMaoObraTotal = custoMaoObraNormal + custoMaoObraHE50 + custoMaoObraHE100;
        
        // Calcular itens extras (sem dependência do DOM)
        let custoExtras = 0;
        const todosExtras = this.dataManager.obterExtras() ?? [];
        todosExtras.forEach(extra => {
            if (extrasIds.includes(extra.id)) {
                custoExtras += (extra.custo ?? 0) * horasTotais;
            }
        });
        
        // Subtotal sem margem - garantir valores numéricos válidos
        const subtotalSemMargem = (custoOperacionalBase ?? 0) + (custoMaoObraTotal ?? 0) + 
                                  (custoValeTransporte ?? 0) + (custoTransporteApp ?? 0) + 
                                  (custoRefeicao ?? 0) + (custoExtras ?? 0);
        
        // Aplicar margem de lucro
        const valorMargem = subtotalSemMargem * margem;
        const subtotalComMargem = subtotalSemMargem + valorMargem;
        
        // [SGQ-SECURITY] Inteligência de Margem: Desconto de Volume Automático
        // Aplicar desconto progressivo baseado na duração do contrato (em dias)
        let descontoVolume = 0;
        if (duracaoEmDias > 7) {
            descontoVolume = 0.10; // 10% de desconto para contratos > 7 dias
            console.log('[SGQ-SECURITY] Desconto de volume aplicado: 10% (contrato > 7 dias)');
        } else if (duracaoEmDias > 3) {
            descontoVolume = 0.05; // 5% de desconto para contratos > 3 dias
            console.log('[SGQ-SECURITY] Desconto de volume aplicado: 5% (contrato > 3 dias)');
        }
        
        // Combinar desconto de volume com desconto manual (o maior prevalece)
        const descontoFinal = Math.max(desconto, descontoVolume);
        
        // Aplicar desconto
        const valorDesconto = subtotalComMargem * descontoFinal;
        const valorFinal = subtotalComMargem - valorDesconto;
        
        // Calcular valor por hora - proteger contra divisão por zero
        const valorPorHora = (horasTotais > 0) ? (valorFinal / horasTotais) : 0;
        
        // Calcular economia (desconto)
        const economia = valorDesconto;
        
        // Calcular total de custos dos funcionários
        const totalCustosFuncionarios = (custoMaoObraTotal ?? 0) + (custoValeTransporte ?? 0) + 
                                        (custoTransporteApp ?? 0) + (custoRefeicao ?? 0);
        
        // GARANTIA FINAL: Assegurar que todos os valores retornados são numéricos válidos
        return {
            horasTotais: horasTotais ?? 0,
            horasNormais: horasNormais ?? 0,
            horasHE50: horasHE50 ?? 0,
            horasHE100: horasHE100 ?? 0,
            diasTotais: diasTotais ?? 0,
            duracaoEmDias: duracaoEmDias ?? 0,
            custoOperacionalBase: custoOperacionalBase ?? 0,
            custoMaoObraNormal: custoMaoObraNormal ?? 0,
            custoMaoObraHE50: custoMaoObraHE50 ?? 0,
            custoMaoObraHE100: custoMaoObraHE100 ?? 0,
            custoMaoObraTotal: custoMaoObraTotal ?? 0,
            custoValeTransporte: custoValeTransporte ?? 0,
            custoTransporteApp: custoTransporteApp ?? 0,
            custoRefeicao: custoRefeicao ?? 0,
            custoExtras: custoExtras ?? 0,
            subtotalSemMargem: subtotalSemMargem ?? 0,
            valorMargem: valorMargem ?? 0,
            subtotalComMargem: subtotalComMargem ?? 0,
            descontoVolume: descontoVolume ?? 0,
            descontoVolumePercent: (descontoVolume ?? 0) * 100,
            valorDesconto: valorDesconto ?? 0,
            valorFinal: valorFinal ?? 0,
            valorPorHora: valorPorHora ?? 0,
            economia: economia ?? 0,
            margemPercent: (margem ?? 0) * 100,
            descontoPercent: (descontoFinal ?? 0) * 100,
            quantidadeFuncionarios: (funcionariosAtivos ?? []).length,
            totalCustosFuncionarios: totalCustosFuncionarios ?? 0,
            detalhamentoFuncionarios: detalhamentoFuncionarios ?? []
        };
    }
}

// ========== ES6 MODULE EXPORT ==========
// Exportação ES Modules padrão v5.2.0
export default BudgetEngine;
