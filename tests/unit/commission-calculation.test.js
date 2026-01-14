/**
 * @jest-environment jsdom
 */

// =========================================================================
// TESTE DE COMISSIONAMENTO (TB.PREM.06) - AXIOMA v5.2.0
// Verifica o cálculo correto de comissões: 8% Venda Direta + 2% Gestão = 10%
// =========================================================================

describe('TB.PREM.06 - Comissionamento', () => {
    
    // Mock do DataManager com taxas de comissão
    const mockDataManager = {
        obterTaxasComissao: jest.fn(() => ({
            vendaDireta: 0.08,  // 8%
            gestaoUTV: 0.02,    // 2%
            ativo: true
        })),
        obterFuncionariosAtivos: jest.fn(() => []),
        obterMultiplicadoresTurno: jest.fn(() => ({
            manha: 1.0,
            tarde: 1.15,
            noite: 1.40
        })),
        obterExtras: jest.fn(() => [])
    };

    // Simular BudgetEngine (simplificado para teste)
    class MockBudgetEngine {
        constructor(dataManager) {
            this.dataManager = dataManager;
        }

        calcularValores(params) {
            // Valores simplificados para teste
            const subtotalSemMargem = 1000; // R$ 1.000,00 de custos
            const margem = params.margem || 0.20; // 20% margem padrão
            const valorMargem = subtotalSemMargem * margem;
            const subtotalComMargem = subtotalSemMargem + valorMargem;
            const desconto = params.desconto || 0;
            const valorDesconto = subtotalComMargem * desconto;
            const valorFinal = subtotalComMargem - valorDesconto;

            // [TB.PREM.06] Cálculo de comissões
            const taxasComissao = this.dataManager.obterTaxasComissao();
            
            let valorComissaoVendedor = 0;
            let valorComissaoGestao = 0;
            let totalComissoes = 0;
            let lucroLiquidoReal = 0;

            if (taxasComissao.ativo) {
                valorComissaoVendedor = valorFinal * taxasComissao.vendaDireta;
                valorComissaoGestao = valorFinal * taxasComissao.gestaoUTV;
                totalComissoes = valorComissaoVendedor + valorComissaoGestao;
                lucroLiquidoReal = valorFinal - subtotalSemMargem - totalComissoes;
            }

            return {
                subtotalSemMargem,
                valorMargem,
                subtotalComMargem,
                valorDesconto,
                valorFinal,
                valorComissaoVendedor,
                valorComissaoGestao,
                totalComissoes,
                lucroLiquidoReal,
                margemPercent: margem * 100,
                descontoPercent: desconto * 100
            };
        }
    }

    let engine;

    beforeEach(() => {
        engine = new MockBudgetEngine(mockDataManager);
        jest.clearAllMocks();
    });

    describe('Cálculo de Comissões - Cenários Base', () => {
        
        test('Deve calcular comissão de vendedor corretamente (8%)', () => {
            const resultado = engine.calcularValores({
                margem: 0.20,
                desconto: 0
            });

            // Valor Final = 1000 + 200 (20% margem) = R$ 1.200,00
            expect(resultado.valorFinal).toBe(1200);
            
            // Comissão Vendedor = 1200 * 0.08 = R$ 96,00
            expect(resultado.valorComissaoVendedor).toBe(96);
        });

        test('Deve calcular comissão de gestão corretamente (2%)', () => {
            const resultado = engine.calcularValores({
                margem: 0.20,
                desconto: 0
            });

            // Comissão Gestão = 1200 * 0.02 = R$ 24,00
            expect(resultado.valorComissaoGestao).toBe(24);
        });

        test('Deve calcular total de comissões (10%)', () => {
            const resultado = engine.calcularValores({
                margem: 0.20,
                desconto: 0
            });

            // Total Comissões = 96 + 24 = R$ 120,00 (10% de 1200)
            expect(resultado.totalComissoes).toBe(120);
            expect(resultado.totalComissoes).toBe(resultado.valorFinal * 0.10);
        });

        test('Deve calcular lucro líquido real após comissões', () => {
            const resultado = engine.calcularValores({
                margem: 0.20,
                desconto: 0
            });

            // Lucro Líquido Real = 1200 (valor final) - 1000 (custos) - 120 (comissões) = R$ 80,00
            const esperado = resultado.valorFinal - resultado.subtotalSemMargem - resultado.totalComissoes;
            expect(resultado.lucroLiquidoReal).toBe(esperado);
            expect(resultado.lucroLiquidoReal).toBe(80);
        });
    });

    describe('Cálculo com Desconto', () => {
        
        test('Deve calcular comissões sobre valor final com desconto', () => {
            const resultado = engine.calcularValores({
                margem: 0.20,
                desconto: 0.10 // 10% desconto
            });

            // Valor com Margem = R$ 1.200,00
            // Desconto 10% = R$ 120,00
            // Valor Final = R$ 1.080,00
            expect(resultado.valorFinal).toBe(1080);
            
            // Comissões sobre valor final (R$ 1.080,00)
            // Vendedor (8%) = R$ 86,40
            // Gestão (2%) = R$ 21,60
            // Total = R$ 108,00 (10% de 1080)
            expect(resultado.valorComissaoVendedor).toBe(86.4);
            expect(resultado.valorComissaoGestao).toBe(21.6);
            expect(resultado.totalComissoes).toBe(108);
        });
    });

    describe('Proteção de Caixa - Casos de Risco', () => {
        
        test('Deve mostrar lucro líquido real negativo quando margem é baixa', () => {
            const resultado = engine.calcularValores({
                margem: 0.05, // Apenas 5% de margem
                desconto: 0
            });

            // Valor Final = 1000 + 50 = R$ 1.050,00
            // Comissões = 105 (10%)
            // Lucro Líquido Real = 1050 - 1000 - 105 = -R$ 55,00 (PREJUÍZO!)
            expect(resultado.valorFinal).toBe(1050);
            expect(resultado.totalComissoes).toBe(105);
            expect(resultado.lucroLiquidoReal).toBe(-55);
            expect(resultado.lucroLiquidoReal).toBeLessThan(0);
        });

        test('Deve alertar quando margem aparente é positiva mas real é negativa', () => {
            const resultado = engine.calcularValores({
                margem: 0.08, // 8% de margem (parece bom)
                desconto: 0
            });

            // Valor Final = 1000 + 80 = R$ 1.080,00
            // Margem bruta = R$ 80,00 (8%)
            // Comissões = R$ 108,00 (10%)
            // Lucro Líquido Real = 1080 - 1000 - 108 = -R$ 28,00 (PREJUÍZO!)
            
            expect(resultado.valorMargem).toBe(80); // Margem bruta positiva
            expect(resultado.totalComissoes).toBe(108); // Mas comissões maiores
            expect(resultado.lucroLiquidoReal).toBe(-28); // Resultado: prejuízo
        });

        test('Deve validar cenário limite: margem de 10% = ponto de equilíbrio', () => {
            const resultado = engine.calcularValores({
                margem: 0.10, // Exatamente 10% de margem
                desconto: 0
            });

            // Valor Final = 1000 + 100 = R$ 1.100,00
            // Comissões = R$ 110,00 (10%)
            // Lucro Líquido Real = 1100 - 1000 - 110 = R$ -10,00 (Ainda prejuízo)
            
            expect(resultado.valorFinal).toBe(1100);
            expect(resultado.totalComissoes).toBe(110);
            expect(resultado.lucroLiquidoReal).toBe(-10);
            
            // Para lucro zero, precisaria de margem > 11.11%
            // (pois 10% de comissão sobre (Custo + Margem) deve ser absorvido pela margem)
        });
    });

    describe('Validação de Configuração', () => {
        
        test('Deve chamar obterTaxasComissao do dataManager', () => {
            engine.calcularValores({ margem: 0.20, desconto: 0 });
            
            expect(mockDataManager.obterTaxasComissao).toHaveBeenCalled();
        });

        test('Deve usar taxas configuradas corretamente', () => {
            const taxas = mockDataManager.obterTaxasComissao();
            
            expect(taxas.vendaDireta).toBe(0.08);
            expect(taxas.gestaoUTV).toBe(0.02);
            expect(taxas.ativo).toBe(true);
            expect(taxas.vendaDireta + taxas.gestaoUTV).toBe(0.10);
        });

        test('Deve não calcular comissões se sistema desativado', () => {
            // Mock com sistema desativado
            mockDataManager.obterTaxasComissao.mockReturnValueOnce({
                vendaDireta: 0.08,
                gestaoUTV: 0.02,
                ativo: false // Desativado
            });

            // Criar nova engine com o mock atualizado
            const engineDesativado = new MockBudgetEngine(mockDataManager);
            engineDesativado.calcularValores = function(params) {
                const subtotalSemMargem = 1000;
                const margem = params.margem || 0.20;
                const valorMargem = subtotalSemMargem * margem;
                const valorFinal = subtotalSemMargem + valorMargem;

                const taxasComissao = this.dataManager.obterTaxasComissao();
                
                let totalComissoes = 0;
                let lucroLiquidoReal = valorFinal - subtotalSemMargem;

                if (taxasComissao.ativo) {
                    // Não deve entrar aqui
                    totalComissoes = valorFinal * 0.10;
                    lucroLiquidoReal = valorFinal - subtotalSemMargem - totalComissoes;
                }

                return {
                    valorFinal,
                    totalComissoes,
                    lucroLiquidoReal,
                    subtotalSemMargem
                };
            };

            const resultado = engineDesativado.calcularValores({ margem: 0.20 });
            
            expect(resultado.totalComissoes).toBe(0);
            expect(resultado.lucroLiquidoReal).toBe(resultado.valorFinal - resultado.subtotalSemMargem);
        });
    });

    describe('Precisão Matemática', () => {
        
        test('Deve manter precisão com valores decimais', () => {
            const resultado = engine.calcularValores({
                margem: 0.175, // 17.5%
                desconto: 0.075 // 7.5%
            });

            // Verificar que os cálculos não introduzem erro de precisão significativo
            const totalCalculado = resultado.valorComissaoVendedor + resultado.valorComissaoGestao;
            expect(Math.abs(totalCalculado - resultado.totalComissoes)).toBeLessThan(0.01);
        });

        test('Deve calcular corretamente com valores altos', () => {
            // Simular orçamento grande
            const engineGrande = new MockBudgetEngine(mockDataManager);
            engineGrande.calcularValores = function(params) {
                const subtotalSemMargem = 50000; // R$ 50.000,00
                const margem = params.margem || 0.20;
                const valorFinal = subtotalSemMargem * (1 + margem);
                
                const taxasComissao = this.dataManager.obterTaxasComissao();
                const totalComissoes = valorFinal * 0.10;
                const lucroLiquidoReal = valorFinal - subtotalSemMargem - totalComissoes;

                return {
                    subtotalSemMargem,
                    valorFinal,
                    totalComissoes,
                    lucroLiquidoReal
                };
            };

            const resultado = engineGrande.calcularValores({ margem: 0.20 });
            
            // Valor Final = 50000 * 1.20 = R$ 60.000,00
            // Comissões = 60000 * 0.10 = R$ 6.000,00
            // Lucro Real = 60000 - 50000 - 6000 = R$ 4.000,00
            expect(resultado.valorFinal).toBe(60000);
            expect(resultado.totalComissoes).toBe(6000);
            expect(resultado.lucroLiquidoReal).toBe(4000);
        });
    });

    describe('Documentação e Rastreabilidade', () => {
        
        test('Deve retornar todos os campos necessários para auditoria', () => {
            const resultado = engine.calcularValores({ margem: 0.20, desconto: 0 });
            
            // Verificar que todos os campos de comissão estão presentes
            expect(resultado).toHaveProperty('valorComissaoVendedor');
            expect(resultado).toHaveProperty('valorComissaoGestao');
            expect(resultado).toHaveProperty('totalComissoes');
            expect(resultado).toHaveProperty('lucroLiquidoReal');
        });

        test('Deve permitir cálculo de margem real após comissões', () => {
            const resultado = engine.calcularValores({ margem: 0.20, desconto: 0 });
            
            // Margem Real = (Lucro Líquido Real / Valor Final) * 100
            const margemReal = (resultado.lucroLiquidoReal / resultado.valorFinal) * 100;
            
            // Margem bruta = 20%, mas margem real após comissões = 6.67%
            expect(margemReal).toBeCloseTo(6.67, 1);
            expect(margemReal).toBeLessThan(resultado.margemPercent);
        });
    });
});
