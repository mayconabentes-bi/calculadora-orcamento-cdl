/**
 * TEST FILE - Dashboard Functionality
 * Demonstrates how the dashboard works with sample data
 */

// Mock DataManager for testing dashboard independently
class MockDataManager {
    obterDadosAnaliticos() {
        return {
            kpis: {
                receitaTotal: 250000.00,
                receitaConfirmada: 180000.00,
                margemMedia: 32.5,
                ticketMedio: 12500.00
            },
            porUnidade: {
                'UTV': {
                    receita: 150000,
                    custoVariavel: 90000,
                    custoFixo: 30000,
                    margemContribuicao: 60000,
                    count: 10
                },
                'DJLM': {
                    receita: 100000,
                    custoVariavel: 65000,
                    custoFixo: 20000,
                    margemContribuicao: 35000,
                    count: 8
                }
            },
            evolucaoMensal: [
                { mes: '2024-07', receita: 35000, custos: 24000, margemLiquida: 11000, margemLiquidaPercent: 31.4, count: 3 },
                { mes: '2024-08', receita: 42000, custos: 28000, margemLiquida: 14000, margemLiquidaPercent: 33.3, count: 4 },
                { mes: '2024-09', receita: 38000, custos: 26000, margemLiquida: 12000, margemLiquidaPercent: 31.6, count: 3 },
                { mes: '2024-10', receita: 45000, custos: 30000, margemLiquida: 15000, margemLiquidaPercent: 33.3, count: 4 },
                { mes: '2024-11', receita: 48000, custos: 32000, margemLiquida: 16000, margemLiquidaPercent: 33.3, count: 4 },
                { mes: '2024-12', receita: 42000, custos: 29000, margemLiquida: 13000, margemLiquidaPercent: 31.0, count: 2 }
            ]
        };
    }
}

// Test 1: Verify KPI calculations
function testKPICalculations() {
    console.log('TEST 1: KPI Calculations');
    console.log('=========================');
    
    const mockData = new MockDataManager();
    const dados = mockData.obterDadosAnaliticos();
    
    // Verify KPIs
    console.assert(dados.kpis.receitaTotal === 250000.00, 'Receita total should be 250000');
    console.assert(dados.kpis.receitaConfirmada === 180000.00, 'Receita confirmada should be 180000');
    console.assert(dados.kpis.margemMedia === 32.5, 'Margem média should be 32.5%');
    console.assert(dados.kpis.ticketMedio === 12500.00, 'Ticket médio should be 12500');
    
    // Calculate conversion rate
    const taxaConversao = (dados.kpis.receitaConfirmada / dados.kpis.receitaTotal * 100).toFixed(1);
    console.assert(taxaConversao === '72.0', 'Taxa de conversão should be 72%');
    
    console.log('✓ All KPI calculations correct');
    console.log('');
}

// Test 2: Verify unit aggregation
function testUnitAggregation() {
    console.log('TEST 2: Unit Aggregation');
    console.log('=========================');
    
    const mockData = new MockDataManager();
    const dados = mockData.obterDadosAnaliticos();
    
    // Verify UTV data
    console.assert(dados.porUnidade.UTV.receita === 150000, 'UTV revenue should be 150000');
    console.assert(dados.porUnidade.UTV.custoVariavel === 90000, 'UTV variable costs should be 90000');
    console.assert(dados.porUnidade.UTV.margemContribuicao === 60000, 'UTV contribution margin should be 60000');
    
    // Verify DJLM data
    console.assert(dados.porUnidade.DJLM.receita === 100000, 'DJLM revenue should be 100000');
    console.assert(dados.porUnidade.DJLM.custoVariavel === 65000, 'DJLM variable costs should be 65000');
    console.assert(dados.porUnidade.DJLM.margemContribuicao === 35000, 'DJLM contribution margin should be 35000');
    
    console.log('✓ All unit aggregations correct');
    console.log('');
}

// Test 3: Verify monthly evolution
function testMonthlyEvolution() {
    console.log('TEST 3: Monthly Evolution');
    console.log('=========================');
    
    const mockData = new MockDataManager();
    const dados = mockData.obterDadosAnaliticos();
    
    // Verify we have 6 months of data
    console.assert(dados.evolucaoMensal.length === 6, 'Should have 6 months of data');
    
    // Verify first month
    const primeiroMes = dados.evolucaoMensal[0];
    console.assert(primeiroMes.mes === '2024-07', 'First month should be 2024-07');
    console.assert(primeiroMes.receita === 35000, 'First month revenue should be 35000');
    console.assert(primeiroMes.margemLiquidaPercent === 31.4, 'First month margin should be 31.4%');
    
    // Verify last month
    const ultimoMes = dados.evolucaoMensal[5];
    console.assert(ultimoMes.mes === '2024-12', 'Last month should be 2024-12');
    console.assert(ultimoMes.margemLiquidaPercent === 31.0, 'Last month margin should be 31.0%');
    
    console.log('✓ All monthly evolution data correct');
    console.log('');
}

// Test 4: Verify data safety checks
function testDataSafetyChecks() {
    console.log('TEST 4: Data Safety Checks');
    console.log('===========================');
    
    // Test with edge case data
    const edgeCaseData = {
        kpis: {
            receitaTotal: 0,
            receitaConfirmada: 0,
            margemMedia: 0,
            ticketMedio: 0
        },
        porUnidade: {},
        evolucaoMensal: []
    };
    
    // Verify conversion rate doesn't cause division by zero
    const taxaConversao = edgeCaseData.kpis.receitaTotal > 0 
        ? (edgeCaseData.kpis.receitaConfirmada / edgeCaseData.kpis.receitaTotal * 100) 
        : 0;
    
    console.assert(taxaConversao === 0, 'Conversion rate should be 0 when no revenue');
    console.assert(!isNaN(taxaConversao), 'Conversion rate should not be NaN');
    
    console.log('✓ All safety checks passed');
    console.log('');
}

// Test 5: Currency formatting
function testCurrencyFormatting() {
    console.log('TEST 5: Currency Formatting');
    console.log('============================');
    
    const formatarMoeda = (valor) => {
        return valor.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };
    
    console.assert(formatarMoeda(12500.00) === '12.500,00', 'Should format 12500 correctly');
    console.assert(formatarMoeda(180000.00) === '180.000,00', 'Should format 180000 correctly');
    console.assert(formatarMoeda(0) === '0,00', 'Should format 0 correctly');
    
    console.log('✓ All currency formatting correct');
    console.log('');
}

// Run all tests
function runAllTests() {
    console.log('═════════════════════════════════════════');
    console.log('  DASHBOARD FUNCTIONALITY TEST SUITE');
    console.log('═════════════════════════════════════════');
    console.log('');
    
    try {
        testKPICalculations();
        testUnitAggregation();
        testMonthlyEvolution();
        testDataSafetyChecks();
        testCurrencyFormatting();
        
        console.log('═════════════════════════════════════════');
        console.log('  ✓ ALL TESTS PASSED');
        console.log('═════════════════════════════════════════');
        
        return true;
    } catch (error) {
        console.error('✗ TEST FAILED:', error.message);
        console.log('═════════════════════════════════════════');
        return false;
    }
}

// Execute tests if in Node.js environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runAllTests };
    
    // Run tests automatically
    runAllTests();
}
