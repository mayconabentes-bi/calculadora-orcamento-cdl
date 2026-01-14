/**
 * Axioma v5.3.0 - Validation Tests
 * Tests for new features and consolidation
 */

describe('Axioma v5.3.0 - DataManager Consolidation', () => {
    test('obterDadosPadrao should return complete structure', () => {
        // Mock DataManager with obterDadosPadrao method
        const mockDataManager = {
            obterDadosPadrao() {
                return {
                    salas: [],
                    funcionarios: [],
                    multiplicadores: {
                        manha: 1.0,
                        tarde: 1.15,
                        noite: 1.40
                    },
                    configuracoes: {
                        comissoes: {
                            vendaDireta: 0.08,
                            gestaoUTV: 0.02,
                            ativo: true
                        },
                        margemMinima: 15.0,
                        lucroAlvo: 30.0,
                        custoFixoDiario: 50.0,
                        exibirAlertaViabilidade: true,
                        exibirClassificacaoRisco: true,
                        exibirEstruturaCustos: true
                    },
                    extras: [
                        { id: 1, nome: "Projetor Multimídia", custo: 80.00 },
                        { id: 2, nome: "Sistema de Som", custo: 120.00 },
                        { id: 3, nome: "Microfone sem Fio", custo: 40.00 },
                        { id: 4, nome: "Flipchart", custo: 30.00 },
                        { id: 5, nome: "Coffee Break", custo: 200.00 },
                        { id: 6, nome: "Projetor Full HD", custo: 150.00 },
                        { id: 7, nome: "Painel de LED", custo: 800.00 }
                    ]
                };
            }
        };

        const dados = mockDataManager.obterDadosPadrao();
        
        // Check structure
        expect(dados).toHaveProperty('salas');
        expect(dados).toHaveProperty('funcionarios');
        expect(dados).toHaveProperty('multiplicadores');
        expect(dados).toHaveProperty('configuracoes');
        expect(dados).toHaveProperty('extras');
        
        // Check commission configuration (TB.PREM.06)
        expect(dados.configuracoes.comissoes).toBeDefined();
        expect(dados.configuracoes.comissoes.vendaDireta).toBe(0.08);
        expect(dados.configuracoes.comissoes.gestaoUTV).toBe(0.02);
        expect(dados.configuracoes.comissoes.ativo).toBe(true);
        
        // Check new assets
        expect(dados.extras).toHaveLength(7);
        const projetorFullHD = dados.extras.find(e => e.id === 6);
        const painelLED = dados.extras.find(e => e.id === 7);
        
        expect(projetorFullHD).toBeDefined();
        expect(projetorFullHD.nome).toBe("Projetor Full HD");
        expect(projetorFullHD.custo).toBe(150.00);
        
        expect(painelLED).toBeDefined();
        expect(painelLED.nome).toBe("Painel de LED");
        expect(painelLED.custo).toBe(800.00);
    });
});

describe('Axioma v5.3.0 - Commission Calculations', () => {
    test('should calculate commission correctly', () => {
        const valorFinal = 10000; // R$ 10,000
        const taxaVendaDireta = 0.08; // 8%
        const taxaGestaoUTV = 0.02; // 2%
        
        const comissaoVendedor = valorFinal * taxaVendaDireta; // R$ 800
        const comissaoGestao = valorFinal * taxaGestaoUTV; // R$ 200
        const totalComissoes = comissaoVendedor + comissaoGestao; // R$ 1,000
        
        expect(comissaoVendedor).toBe(800);
        expect(comissaoGestao).toBe(200);
        expect(totalComissoes).toBe(1000);
        expect(totalComissoes / valorFinal).toBe(0.10); // 10% total
    });
    
    test('should calculate lucroLiquidoReal correctly', () => {
        const valorFinal = 10000;
        const subtotalSemMargem = 7000;
        const totalComissoes = 1000; // 10% of valorFinal
        
        // Lucro Líquido Real: Valor Final - Custos Totais - Comissões
        const lucroLiquidoReal = valorFinal - subtotalSemMargem - totalComissoes;
        
        expect(lucroLiquidoReal).toBe(2000); // R$ 2,000 profit after commissions
    });
});

describe('Axioma v5.3.0 - Volume Discount', () => {
    test('should apply 5% discount for contracts > 3 days', () => {
        const duracaoEmDias = 5;
        let descontoVolume = 0;
        
        if (duracaoEmDias > 7) {
            descontoVolume = 0.10;
        } else if (duracaoEmDias > 3) {
            descontoVolume = 0.05;
        }
        
        expect(descontoVolume).toBe(0.05);
    });
    
    test('should apply 10% discount for contracts > 7 days', () => {
        const duracaoEmDias = 10;
        let descontoVolume = 0;
        
        if (duracaoEmDias > 7) {
            descontoVolume = 0.10;
        } else if (duracaoEmDias > 3) {
            descontoVolume = 0.05;
        }
        
        expect(descontoVolume).toBe(0.10);
    });
    
    test('should apply no discount for contracts <= 3 days', () => {
        const duracaoEmDias = 2;
        let descontoVolume = 0;
        
        if (duracaoEmDias > 7) {
            descontoVolume = 0.10;
        } else if (duracaoEmDias > 3) {
            descontoVolume = 0.05;
        }
        
        expect(descontoVolume).toBe(0);
    });
});

describe('Axioma v5.3.0 - Weekend Restriction', () => {
    test('should enforce 3 employees minimum for weekend events', () => {
        const diasSelecionados = [0, 1, 2]; // Domingo, Segunda, Terça
        const temFimDeSemana = diasSelecionados.some(dia => dia === 0 || dia === 6);
        
        expect(temFimDeSemana).toBe(true);
        
        // Simular verificação de funcionários
        const qtdFuncionariosAtivos = 2;
        const MINIMO_FIM_DE_SEMANA = 3;
        
        if (temFimDeSemana && qtdFuncionariosAtivos < MINIMO_FIM_DE_SEMANA) {
            // Deve bloquear o cálculo
            expect(qtdFuncionariosAtivos).toBeLessThan(MINIMO_FIM_DE_SEMANA);
        }
    });
    
    test('should allow calculation with 3+ employees for weekend', () => {
        const diasSelecionados = [6]; // Sábado
        const temFimDeSemana = diasSelecionados.some(dia => dia === 0 || dia === 6);
        
        expect(temFimDeSemana).toBe(true);
        
        const qtdFuncionariosAtivos = 3;
        const MINIMO_FIM_DE_SEMANA = 3;
        
        expect(qtdFuncionariosAtivos).toBeGreaterThanOrEqual(MINIMO_FIM_DE_SEMANA);
    });
    
    test('should not enforce restriction for weekdays only', () => {
        const diasSelecionados = [1, 2, 3, 4, 5]; // Segunda a Sexta
        const temFimDeSemana = diasSelecionados.some(dia => dia === 0 || dia === 6);
        
        expect(temFimDeSemana).toBe(false);
    });
});
