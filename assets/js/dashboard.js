/* =================================================================
   DASHBOARD.JS - CALCULADORA DE ORÇAMENTO CDL/UTV v5.0
   Dashboard de KPIs em Tempo Real com Chart.js
   ================================================================= */

/**
 * Classe DashboardController
 * Responsável por renderizar KPIs e gráficos do dashboard executivo
 */
class DashboardController {
    constructor() {
        this.charts = {
            barChart: null,
            doughnutChart: null,
            lineChart: null
        };
        
        // Cores profissionais (Azul Marinho, Cinza, Verde Floresta)
        this.colors = {
            primary: '#1e478a',      // Azul Marinho CDL
            primaryLight: '#3b82f6',
            secondary: '#64748b',     // Cinza
            success: '#10b981',       // Verde Floresta
            warning: '#f59e0b',
            danger: '#ef4444',
            info: '#0ea5e9',
            dark: '#1e293b',
            light: '#f1f5f9'
        };
        
        this.mesesNomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    }
    
    /**
     * Inicializa o dashboard
     */
    inicializar() {
        this.renderizarKPIs();
        this.renderizarGraficos();
    }
    
    /**
     * Atualiza todos os componentes do dashboard
     */
    atualizar() {
        this.renderizarKPIs();
        this.atualizarGraficos();
    }
    
    /**
     * Renderiza os Scorecards (KPIs numéricos)
     */
    renderizarKPIs() {
        const dados = dataManager.obterDadosAnaliticos();
        const kpis = dados.kpis;
        
        // Receita Total Potencial (Pipeline)
        const receitaTotalEl = document.getElementById('kpi-receita-total');
        if (receitaTotalEl) {
            receitaTotalEl.textContent = CoreUtils.formatarMoeda(kpis.receitaTotal);
        }
        
        // Receita Confirmada (Convertidos)
        const receitaConfirmadaEl = document.getElementById('kpi-receita-confirmada');
        if (receitaConfirmadaEl) {
            receitaConfirmadaEl.textContent = CoreUtils.formatarMoeda(kpis.receitaConfirmada);
        }
        
        // Margem Média Geral (%)
        const margemMediaEl = document.getElementById('kpi-margem-media');
        if (margemMediaEl) {
            margemMediaEl.textContent = `${kpis.margemMedia.toFixed(1)}%`;
        }
        
        // Ticket Médio
        const ticketMedioEl = document.getElementById('kpi-ticket-medio');
        if (ticketMedioEl) {
            ticketMedioEl.textContent = CoreUtils.formatarMoeda(kpis.ticketMedio);
        }
        
        // Calcular taxa de conversão
        const taxaConversao = kpis.receitaTotal > 0 ? (kpis.receitaConfirmada / kpis.receitaTotal * 100) : 0;
        const taxaConversaoEl = document.getElementById('kpi-taxa-conversao');
        if (taxaConversaoEl) {
            taxaConversaoEl.textContent = `${taxaConversao.toFixed(1)}%`;
        }
    }
    
    /**
     * Renderiza todos os gráficos
     */
    renderizarGraficos() {
        this.renderizarBarChart();
        this.renderizarDoughnutChart();
        this.renderizarLineChart();
    }
    
    /**
     * Atualiza todos os gráficos (sem recriar)
     */
    atualizarGraficos() {
        const dados = dataManager.obterDadosAnaliticos();
        
        // Atualizar Bar Chart
        if (this.charts.barChart) {
            const unidades = Object.keys(dados.porUnidade);
            const receitas = unidades.map(u => dados.porUnidade[u].receita);
            const custosVariaveis = unidades.map(u => dados.porUnidade[u].custoVariavel);
            
            this.charts.barChart.data.labels = unidades;
            this.charts.barChart.data.datasets[0].data = receitas;
            this.charts.barChart.data.datasets[1].data = custosVariaveis;
            this.charts.barChart.update();
        } else {
            this.renderizarBarChart();
        }
        
        // Atualizar Doughnut Chart
        if (this.charts.doughnutChart) {
            const unidades = Object.keys(dados.porUnidade);
            const receitas = unidades.map(u => dados.porUnidade[u].receita);
            
            this.charts.doughnutChart.data.labels = unidades;
            this.charts.doughnutChart.data.datasets[0].data = receitas;
            this.charts.doughnutChart.update();
        } else {
            this.renderizarDoughnutChart();
        }
        
        // Atualizar Line Chart
        if (this.charts.lineChart) {
            const labels = dados.evolucaoMensal.map(m => this.formatarMesAno(m.mes));
            const margens = dados.evolucaoMensal.map(m => m.margemLiquidaPercent);
            
            this.charts.lineChart.data.labels = labels;
            this.charts.lineChart.data.datasets[0].data = margens;
            this.charts.lineChart.update();
        } else {
            this.renderizarLineChart();
        }
    }
    
    /**
     * Renderiza o Bar Chart (Receita vs. Custos Variáveis por Unidade)
     */
    renderizarBarChart() {
        const dados = dataManager.obterDadosAnaliticos();
        const canvas = document.getElementById('chart-bar');
        
        if (!canvas) {
            console.error('Canvas chart-bar não encontrado');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        
        // Destruir gráfico anterior se existir
        if (this.charts.barChart) {
            this.charts.barChart.destroy();
        }
        
        // Preparar dados
        const unidades = Object.keys(dados.porUnidade);
        const receitas = unidades.map(u => dados.porUnidade[u].receita);
        const custosVariaveis = unidades.map(u => dados.porUnidade[u].custoVariavel);
        
        this.charts.barChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: unidades,
                datasets: [
                    {
                        label: 'Receita',
                        data: receitas,
                        backgroundColor: this.colors.primary,
                        borderColor: this.colors.primary,
                        borderWidth: 1
                    },
                    {
                        label: 'Custos Variáveis',
                        data: custosVariaveis,
                        backgroundColor: this.colors.warning,
                        borderColor: this.colors.warning,
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Receita vs. Custos Variáveis por Unidade',
                        font: {
                            size: 16,
                            weight: 'bold'
                        },
                        color: this.colors.dark
                    },
                    legend: {
                        display: true,
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                label += 'R$ ' + CoreUtils.formatarMoeda(context.parsed.y);
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => 'R$ ' + CoreUtils.formatarMoedaCompacta(value)
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Renderiza o Doughnut Chart (Share of Revenue por Espaço)
     */
    renderizarDoughnutChart() {
        const dados = dataManager.obterDadosAnaliticos();
        const canvas = document.getElementById('chart-doughnut');
        
        if (!canvas) {
            console.error('Canvas chart-doughnut não encontrado');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        
        // Destruir gráfico anterior se existir
        if (this.charts.doughnutChart) {
            this.charts.doughnutChart.destroy();
        }
        
        // Preparar dados
        const unidades = Object.keys(dados.porUnidade);
        const receitas = unidades.map(u => dados.porUnidade[u].receita);
        
        // Cores dinâmicas para cada unidade
        const backgroundColors = [
            this.colors.primary,
            this.colors.success,
            this.colors.info,
            this.colors.warning,
            this.colors.secondary
        ];
        
        this.charts.doughnutChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: unidades,
                datasets: [{
                    data: receitas,
                    backgroundColor: backgroundColors.slice(0, unidades.length),
                    borderColor: '#ffffff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Share of Revenue por Espaço',
                        font: {
                            size: 16,
                            weight: 'bold'
                        },
                        color: this.colors.dark
                    },
                    legend: {
                        display: true,
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                return `${label}: R$ ${CoreUtils.formatarMoeda(value)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Renderiza o Line Chart (Evolução da Margem Líquida)
     */
    renderizarLineChart() {
        const dados = dataManager.obterDadosAnaliticos();
        const canvas = document.getElementById('chart-line');
        
        if (!canvas) {
            console.error('Canvas chart-line não encontrado');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        
        // Destruir gráfico anterior se existir
        if (this.charts.lineChart) {
            this.charts.lineChart.destroy();
        }
        
        // Preparar dados
        const labels = dados.evolucaoMensal.map(m => this.formatarMesAno(m.mes));
        const margens = dados.evolucaoMensal.map(m => m.margemLiquidaPercent);
        
        this.charts.lineChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Margem Líquida (%)',
                    data: margens,
                    borderColor: this.colors.success,
                    backgroundColor: this.colors.success + '20',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: this.colors.success,
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Evolução da Margem Líquida (Últimos 6 Meses)',
                        font: {
                            size: 16,
                            weight: 'bold'
                        },
                        color: this.colors.dark
                    },
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                return `Margem: ${context.parsed.y.toFixed(2)}%`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => value.toFixed(0) + '%'
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Formata string de mês-ano para exibição
     * @param {string} mesAno - String no formato "YYYY-MM"
     * @returns {string} Mês formatado (ex: "Jan/2024")
     */
    formatarMesAno(mesAno) {
        const [ano, mes] = mesAno.split('-');
        const mesIndex = parseInt(mes) - 1;
        const mesNome = this.mesesNomes[mesIndex] || mes;
        return `${mesNome}/${ano}`;
    }
    
    /**
     * Destroi todos os gráficos
     */
    destruirGraficos() {
        Object.keys(this.charts).forEach(key => {
            if (this.charts[key]) {
                this.charts[key].destroy();
                this.charts[key] = null;
            }
        });
    }
}

// Instância global do dashboard
let dashboardController = null;

/**
 * Inicializa o dashboard quando a aba for aberta
 */
function inicializarDashboard() {
    if (!dashboardController) {
        dashboardController = new DashboardController();
    }
    dashboardController.inicializar();
}

/**
 * Atualiza o dashboard (chamado quando há novos dados)
 */
function atualizarDashboard() {
    if (dashboardController) {
        dashboardController.atualizar();
    }
}
