/* =================================================================
   BUDGET ENGINE - Motor de Cálculo de Orçamentos
   Inteligência financeira desacoplada da interface do usuário
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
        const funcionariosAtivos = this.dataManager.obterFuncionariosAtivos();
        const multiplicadores = this.dataManager.obterMultiplicadoresTurno();
        
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
        const multiplicadorMedio = (multiplicadores.manha + multiplicadores.tarde + multiplicadores.noite) / 3;
        const custoOperacionalBase = sala.custoBase * multiplicadorMedio * horasTotais;
        
        // Calcular custos de mão de obra para cada funcionário
        // Complexidade: O(f) onde f = funcionariosAtivos.length
        // IMPORTANTE: Este loop é linear, não aninhado - mantém eficiência O(n)
        const detalhamentoFuncionarios = [];
        let custoMaoObraNormal = 0;
        let custoMaoObraHE50 = 0;
        let custoMaoObraHE100 = 0;
        let custoValeTransporte = 0;
        let custoTransporteApp = 0;
        let custoRefeicao = 0;
        
        funcionariosAtivos.forEach(func => {
            const custoFuncNormal = horasNormais * func.horaNormal;
            const custoFuncHE50 = horasHE50 * func.he50;
            const custoFuncHE100 = horasHE100 * func.he100;
            const custoFuncVT = diasTotais * func.valeTransporte;
            const custoFuncTransApp = diasTotais * (func.transporteApp || 0);
            const custoFuncRefeicao = diasTotais * (func.refeicao || 0);
            
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
        const todosExtras = this.dataManager.obterExtras();
        todosExtras.forEach(extra => {
            if (extrasIds.includes(extra.id)) {
                custoExtras += extra.custo * horasTotais;
            }
        });
        
        // Subtotal sem margem
        const subtotalSemMargem = custoOperacionalBase + custoMaoObraTotal + custoValeTransporte + custoTransporteApp + custoRefeicao + custoExtras;
        
        // Aplicar margem de lucro
        const valorMargem = subtotalSemMargem * margem;
        const subtotalComMargem = subtotalSemMargem + valorMargem;
        
        // Aplicar desconto
        const valorDesconto = subtotalComMargem * desconto;
        const valorFinal = subtotalComMargem - valorDesconto;
        
        // Calcular valor por hora
        const valorPorHora = valorFinal / horasTotais;
        
        // Calcular economia (desconto)
        const economia = valorDesconto;
        
        // Calcular total de custos dos funcionários
        const totalCustosFuncionarios = custoMaoObraTotal + custoValeTransporte + custoTransporteApp + custoRefeicao;
        
        return {
            horasTotais,
            horasNormais,
            horasHE50,
            horasHE100,
            diasTotais,
            custoOperacionalBase,
            custoMaoObraNormal,
            custoMaoObraHE50,
            custoMaoObraHE100,
            custoMaoObraTotal,
            custoValeTransporte,
            custoTransporteApp,
            custoRefeicao,
            custoExtras,
            subtotalSemMargem,
            valorMargem,
            subtotalComMargem,
            valorDesconto,
            valorFinal,
            valorPorHora,
            economia,
            margemPercent: margem * 100,
            descontoPercent: desconto * 100,
            quantidadeFuncionarios: funcionariosAtivos.length,
            totalCustosFuncionarios,
            detalhamentoFuncionarios
        };
    }
}

// Exportar para uso em módulos (se necessário)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BudgetEngine;
}
