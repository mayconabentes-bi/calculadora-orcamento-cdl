/* =================================================================
   BUDGET ENGINE - Motor de Cálculo de Orçamentos v5.2.6 - Hotfix
   Inteligência financeira desacoplada da interface do usuário
   Módulo ES6 puro - Padrão ES Modules
   HOTFIX: Usar valores exatos de turno do CSV para eliminar erro de ~3%
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
     * Calcula o custo base respeitando a Tabela Oficial da CDL
     * HOTFIX v5.2.6: Usa valores exatos do CSV para eliminar erro de ~3%
     * @param {Object} sala - Objeto da sala (com custoManha, custoTarde, custoNoite importados do CSV)
     * @param {number} horas - Duração em horas
     * @param {string} turno - 'manha', 'tarde', 'noite' ou 'integral'
     * @returns {number} Custo total para o período
     */
    calcularCustoBase(sala, horas, turno) {
        // 1. Normalização do turno para casar com as chaves do objeto (manha, tarde, noite)
        const turnoKey = turno ? turno.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : 'manha';
        
        let custoHora = 0;

        // 2. LÓGICA DE PRECEDÊNCIA (A Correção do Erro de 3%)
        // Mapear turnoKey para os campos flat do CSV (custoManha, custoTarde, custoNoite)
        const custoTurnoMap = {
            'manha': sala.custoManha,
            'tarde': sala.custoTarde,
            'noite': sala.custoNoite,
            'integral': sala.custoManha // Para integral, usa valor base manhã
        };

        // Se a sala tem o preço do turno vindo do CSV, usa ele.
        // Se não, usa o custoBase genérico com multiplicador.
        const custoEspecifico = custoTurnoMap[turnoKey];
        
        if (custoEspecifico && custoEspecifico > 0) {
            custoHora = custoEspecifico;
            console.log(`[Engine] Usando preço específico CSV para ${turnoKey}: R$ ${custoHora}/h`);
        } else {
            // Fallback (apenas se o CSV falhar)
            const base = sala.custoBase || 0;
            const mult = this.obterMultiplicadorTurno(turnoKey);
            custoHora = base * mult;
            console.warn(`[Engine] Usando cálculo genérico (Fallback): R$ ${base} x ${mult}`);
        }

        // 3. Cálculo Final
        return custoHora * horas;
    }

    /**
     * Auxiliar para Fallback - Retorna multiplicador de turno
     * HOTFIX v5.2.6: Valores padrão da CDL
     * @param {string} turno - 'manha', 'tarde', 'noite'
     * @returns {number} Multiplicador do turno
     */
    obterMultiplicadorTurno(turno) {
        switch(turno) {
            case 'tarde': return 1.15;
            case 'noite': return 1.40;
            default: return 1.00; // Manhã
        }
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
        
        // =========================================================================
        // [TB.PREM.06] CÁLCULO DE COMISSIONAMENTO - AXIOMA v5.3.0
        // Sistema de incentivo: 8% Venda Direta + 2% Gestão = 10% total
        // =========================================================================
        
        // Obter taxas de comissão configuradas
        const taxasComissao = this.dataManager.obterTaxasComissao();
        
        // Calcular comissões sobre o valor final (após margem e desconto)
        let valorComissaoVendedor = 0;
        let valorComissaoGestao = 0;
        let totalComissoes = 0;
        let lucroLiquidoReal = 0;
        
        if (taxasComissao.ativo) {
            valorComissaoVendedor = valorFinal * taxasComissao.vendaDireta;
            valorComissaoGestao = valorFinal * taxasComissao.gestaoUTV;
            totalComissoes = valorComissaoVendedor + valorComissaoGestao;
            
            // Lucro Líquido Real: Valor Final - Custos Totais - Comissões
            lucroLiquidoReal = valorFinal - subtotalSemMargem - totalComissoes;
            
            // [SGQ-SECURITY] Log detalhado de transação financeira
            console.log('[SGQ-SECURITY] Transação Financeira: Calculando comissões conforme TB.PREM.06');
            console.log('[TB.PREM.06] Comissões calculadas:');
            console.log(`  - Vendedor (${(taxasComissao.vendaDireta * 100).toFixed(1)}%): R$ ${valorComissaoVendedor.toFixed(2)}`);
            console.log(`  - Gestão UTV (${(taxasComissao.gestaoUTV * 100).toFixed(1)}%): R$ ${valorComissaoGestao.toFixed(2)}`);
            console.log(`  - Total Comissões (10%): R$ ${totalComissoes.toFixed(2)}`);
            console.log(`  - Lucro Líquido Real: R$ ${lucroLiquidoReal.toFixed(2)}`);
            console.log(`[SGQ-SECURITY] Valor Final: R$ ${valorFinal.toFixed(2)} | Custos: R$ ${subtotalSemMargem.toFixed(2)} | Comissões: R$ ${totalComissoes.toFixed(2)} | Lucro Real: R$ ${lucroLiquidoReal.toFixed(2)}`);
        } else {
            // Se comissões desativadas, lucro líquido = margem
            lucroLiquidoReal = valorFinal - subtotalSemMargem;
            console.log('[TB.PREM.06] Sistema de comissões desativado');
        }
        
        // [SGQ-SECURITY] Segurança Margem: Verificar prejuízo
        // Detecta orçamentos com margem negativa (prejuízo) e sinaliza para revisão
        // Ação requerida: Revisar margem, custos ou descontos antes de aprovar o orçamento
        // Este alerta não bloqueia o cálculo, mas deve ser considerado na decisão de aprovação
        const alertaPrejuizo = lucroLiquidoReal < 0;
        
        if (alertaPrejuizo) {
            console.warn('[SGQ-SECURITY] ⚠️ ALERTA DE PREJUÍZO: Lucro Líquido Real negativo detectado!');
            console.warn(`[SGQ-SECURITY] Lucro Líquido Real: R$ ${lucroLiquidoReal.toFixed(2)}`);
            console.warn('[SGQ-SECURITY] Ação requerida: Revisar margem, custos ou descontos antes de enviar ao cliente');
        }
        
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
            detalhamentoFuncionarios: detalhamentoFuncionarios ?? [],
            // [TB.PREM.06] Campos de comissionamento
            valorComissaoVendedor: valorComissaoVendedor ?? 0,
            valorComissaoGestao: valorComissaoGestao ?? 0,
            totalComissoes: totalComissoes ?? 0,
            lucroLiquidoReal: lucroLiquidoReal ?? 0,
            percentualComissaoTotal: ((taxasComissao?.vendaDireta ?? 0) + (taxasComissao?.gestaoUTV ?? 0)) * 100,
            // [SGQ-SECURITY] Segurança Margem
            alertaPrejuizo
        };
    }
}

// ========== ES6 MODULE EXPORT ==========
// Exportação ES Modules padrão v5.2.6
export default BudgetEngine;

// Para compatibilidade com scripts legados (não-módulos) - v5.2.6
// Mantido para compatibilidade durante transição
if (typeof window !== 'undefined') {
    window.BudgetEngine = BudgetEngine;
}
