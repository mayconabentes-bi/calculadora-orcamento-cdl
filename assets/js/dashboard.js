/* =================================================================
   DASHBOARD.JS - AXIOMA: INTELIGÊNCIA DE MARGEM v5.1.0
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
     * Inicializa o dashboard (Assíncrono)
     */
    async inicializar() {
        await this.renderizarKPIs();
        await this.renderizarGraficos();
    }
    
    /**
     * Atualiza todos os componentes do dashboard (Assíncrono)
     */
    async atualizar() {
        await this.renderizarKPIs();
        await this.atualizarGraficos();
    }
    
    /**
     * Renderiza os Scorecards (KPIs numéricos) - Assíncrono
     */
    async renderizarKPIs() {
        // Obter dados de forma assíncrona (Firebase com fallback para localStorage)
        const dados = await dataManager.obterDadosAnaliticosAsync();
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
            margemMediaEl.textContent = kpis.margemMedia.toFixed(1);
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
            taxaConversaoEl.textContent = taxaConversao.toFixed(1);
        }
    }
    
    /**
     * Renderiza todos os gráficos (Assíncrono)
     */
    async renderizarGraficos() {
        await this.renderizarBarChart();
        await this.renderizarDoughnutChart();
        await this.renderizarLineChart();
    }
    
    /**
     * Atualiza todos os gráficos (sem recriar) - Assíncrono
     */
    async atualizarGraficos() {
        const dados = await dataManager.obterDadosAnaliticosAsync();
        
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
     * Renderiza o Bar Chart (Receita vs. Custos Variáveis por Unidade) - Assíncrono
     */
    async renderizarBarChart() {
        const dados = await dataManager.obterDadosAnaliticosAsync();
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
     * Renderiza o Doughnut Chart (Participação na Receita por Espaço) - Assíncrono
     */
    async renderizarDoughnutChart() {
        const dados = await dataManager.obterDadosAnaliticosAsync();
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
                        text: 'Participação na Receita por Espaço',
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
     * Renderiza o Line Chart (Evolução da Margem Líquida) - Assíncrono
     */
    async renderizarLineChart() {
        const dados = await dataManager.obterDadosAnaliticosAsync();
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

// Senha da Superintendência (em produção, deve ser gerenciada de forma mais segura)
// NOTA: Esta é uma implementação de protótipo. Em produção, a autenticação deve ser
// feita no backend com hash bcrypt, JWT tokens, e sistema de sessão adequado.
// A senha atual é mantida no código para fins de demonstração conforme especificação.
const SENHA_SUPERINTENDENCIA = 'CDL2025';

/**
 * Bootstrap do Dashboard - ASYNC BOOTSTRAP v5.1.0
 * 
 * Aguarda a confirmação de conexão do DataManager/Firebase antes de
 * disparar a primeira renderização. Garante que os dados estejam
 * disponíveis antes de renderizar os KPIs.
 * 
 * Exibe um spinner de carregamento enquanto a conexão é estabelecida.
 */
async function bootstrapDashboard() {
    const spinnerContainer = document.getElementById('dashboard-loading-spinner');
    const dashboardContent = document.getElementById('dashboard-content');
    
    try {
        // Exibir spinner de carregamento
        if (spinnerContainer) {
            spinnerContainer.style.display = 'flex';
        }
        if (dashboardContent) {
            dashboardContent.style.display = 'none';
        }
        
        // Verificar conexão com Firebase/DataManager
        console.log('Aguardando conexão com DataManager/Firebase...');
        
        // Pequena pausa para garantir que o Firebase tenha tempo de inicializar
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Tentar obter dados para confirmar conexão
        await dataManager.obterDadosAnaliticosAsync();
        
        console.log('Conexão confirmada. Inicializando dashboard...');
        
        // Ocultar spinner e exibir conteúdo
        if (spinnerContainer) {
            spinnerContainer.style.display = 'none';
        }
        if (dashboardContent) {
            dashboardContent.style.display = 'block';
        }
        
        // Inicializar dashboard normalmente
        if (!dashboardController) {
            dashboardController = new DashboardController();
        }
        await dashboardController.inicializar();
        
        // Configurar event listeners para área restrita
        configurarAreaRestrita();
        
    } catch (error) {
        console.error('Erro ao inicializar dashboard:', error);
        
        // Ocultar spinner mesmo em caso de erro
        if (spinnerContainer) {
            spinnerContainer.style.display = 'none';
        }
        if (dashboardContent) {
            dashboardContent.style.display = 'block';
        }
        
        // Tentar inicializar mesmo assim (fallback para localStorage)
        if (!dashboardController) {
            dashboardController = new DashboardController();
        }
        await dashboardController.inicializar();
        configurarAreaRestrita();
    }
}

/**
 * Inicializa o dashboard quando a aba for aberta
 * Usa bootstrapDashboard() para garantir conexão antes de renderizar
 */
async function inicializarDashboard() {
    await bootstrapDashboard();
}


/**
 * Atualiza o dashboard (chamado quando há novos dados)
 */
function atualizarDashboard() {
    if (dashboardController) {
        dashboardController.atualizar();
    }
}

/**
 * Configura os event listeners para a área restrita da superintendência
 */
function configurarAreaRestrita() {
    // Botão de acessar área restrita
    const btnAcessar = document.getElementById('btn-acessar-superintendencia');
    if (btnAcessar) {
        btnAcessar.addEventListener('click', verificarAcessoSuperintendencia);
    }

    // Permitir Enter na senha
    const senhaInput = document.getElementById('senha-superintendencia');
    if (senhaInput) {
        senhaInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                verificarAcessoSuperintendencia();
            }
        });
    }

    // Botão de sair
    const btnSair = document.getElementById('btn-sair-superintendencia');
    if (btnSair) {
        btnSair.addEventListener('click', sairAreaSuperintendencia);
    }
}

/**
 * Verifica a senha e autoriza acesso à área restrita (Assíncrono)
 */
async function verificarAcessoSuperintendencia() {
    const senhaInput = document.getElementById('senha-superintendencia');
    const senha = senhaInput.value;

    if (senha === SENHA_SUPERINTENDENCIA) {
        // Acesso autorizado
        document.getElementById('superintendencia-login').style.display = 'none';
        document.getElementById('superintendencia-aprovacoes').style.display = 'block';
        
        // Carregar tabela de aprovações pendentes (aguardar dados)
        await carregarTabelaAprovacoes();
        
        // Limpar senha
        senhaInput.value = '';
        
        mostrarNotificacao('Acesso autorizado à Área Restrita');
    } else {
        // Acesso negado
        mostrarNotificacao('Senha incorreta! Acesso negado.', 3000);
        senhaInput.value = '';
        senhaInput.focus();
    }
}

/**
 * Sai da área restrita
 */
function sairAreaSuperintendencia() {
    document.getElementById('superintendencia-login').style.display = 'block';
    document.getElementById('superintendencia-aprovacoes').style.display = 'none';
    document.getElementById('senha-superintendencia').value = '';
    
    mostrarNotificacao('Sessão encerrada');
}

/**
 * Carrega a tabela de orçamentos pendentes de aprovação (Assíncrono)
 */
async function carregarTabelaAprovacoes() {
    const tbody = document.getElementById('aprovacoes-body');
    const semPendentes = document.getElementById('sem-pendentes');
    const contador = document.getElementById('contador-pendentes');
    
    if (!tbody) return;

    // Mostrar estado de carregamento
    tbody.innerHTML = `
        <tr>
            <td colspan="7" style="text-align: center; padding: 40px; color: #64748b;">
                <div style="display: flex; flex-direction: column; align-items: center; gap: 15px;">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="loading-spinner">
                        <line x1="12" y1="2" x2="12" y2="6"></line>
                        <line x1="12" y1="18" x2="12" y2="22"></line>
                        <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                        <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                        <line x1="2" y1="12" x2="6" y2="12"></line>
                        <line x1="18" y1="12" x2="22" y2="12"></line>
                        <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                        <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                    </svg>
                    <span style="font-size: 1.1em; font-weight: 500;">Carregando dados do Firebase...</span>
                </div>
            </td>
        </tr>
    `;
    semPendentes.style.display = 'none';

    // Obter orçamentos aguardando aprovação do Firebase
    const orcamentosPendentes = await dataManager.obterOrcamentosPendentes();
    
    // Atualizar contador
    if (contador) {
        const totalPendentes = orcamentosPendentes.length;
        contador.innerHTML = `
            <p style="margin: 0; font-size: 0.9em; color: #475569; text-align: center;">
                <strong style="color: #0284c7; font-size: 1.2em;">${totalPendentes}</strong>
                orçamento${totalPendentes !== 1 ? 's' : ''} aguardando aprovação
            </p>
        `;
    }

    if (orcamentosPendentes.length === 0) {
        tbody.innerHTML = '';
        semPendentes.style.display = 'block';
        return;
    }

    semPendentes.style.display = 'none';

    // Renderizar linhas da tabela
    tbody.innerHTML = '';
    
    orcamentosPendentes.forEach(orc => {
        const tr = document.createElement('tr');
        
        // Formatar data
        const data = new Date(orc.data).toLocaleDateString('pt-BR');
        
        // Formatar valores
        const valorFinal = CoreUtils.formatarMoeda(orc.valorFinal);
        const margem = orc.margemLiquida.toFixed(1) + '%';
        
        // Badge de risco
        let badgeRisco = '';
        const risco = orc.classificacaoRisco;
        if (risco === 'ALTO') {
            badgeRisco = `<span style="display: inline-block; padding: 4px 8px; background: #fee2e2; color: #dc2626; border-radius: 4px; font-size: 0.85em; font-weight: 600;">ALTO</span>`;
        } else if (risco === 'MÉDIO') {
            badgeRisco = `<span style="display: inline-block; padding: 4px 8px; background: #fef3c7; color: #d97706; border-radius: 4px; font-size: 0.85em; font-weight: 600;">MÉDIO</span>`;
        } else {
            badgeRisco = `<span style="display: inline-block; padding: 4px 8px; background: #dcfce7; color: #16a34a; border-radius: 4px; font-size: 0.85em; font-weight: 600;">BAIXO</span>`;
        }
        
        tr.innerHTML = `
            <td>${data}</td>
            <td>${orc.cliente || 'Não informado'}</td>
            <td>${orc.sala.unidade} - ${orc.sala.nome}</td>
            <td><strong>R$ ${valorFinal}</strong></td>
            <td>${margem}</td>
            <td>${badgeRisco}</td>
            <td style="white-space: nowrap;">
                <button class="btn-primary btn-success" onclick="aprovarOrcamento(${orc.id})" style="padding: 6px 12px; font-size: 0.85em; margin-right: 5px;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Aprovar
                </button>
                <button class="btn-primary btn-danger" onclick="reprovarOrcamento(${orc.id})" style="padding: 6px 12px; font-size: 0.85em;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                    Reprovar
                </button>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
}

/**
 * Aprova um orçamento (Assíncrono)
 * @param {string|number} id - ID do orçamento
 */
async function aprovarOrcamento(id) {
    if (confirm('Confirma a APROVAÇÃO deste orçamento?')) {
        const sucesso = await dataManager.atualizarStatusOrcamento(id, 'APROVADO', null);
        
        if (sucesso) {
            mostrarNotificacao('Orçamento APROVADO com sucesso!');
            await carregarTabelaAprovacoes();
            
            // Atualizar dashboard de KPIs
            if (dashboardController) {
                await dashboardController.atualizar();
            }
        } else {
            mostrarNotificacao('Erro ao aprovar orçamento');
        }
    }
}

/**
 * Reprova um orçamento (solicita justificativa) - Assíncrono
 * DATA INTEGRITY GATE: Exige justificativa com mínimo de 10 caracteres
 * @param {string|number} id - ID do orçamento
 */
async function reprovarOrcamento(id) {
    const justificativa = prompt('Para REPROVAR este orçamento, informe a justificativa (mínimo 10 caracteres):');
    
    if (justificativa === null) {
        // Usuário cancelou
        return;
    }
    
    const justificativaTrimmed = justificativa.trim();
    
    // Validação no frontend antes de enviar
    if (!justificativaTrimmed || justificativaTrimmed.length < 10) {
        mostrarNotificacao('Justificativa é obrigatória e deve ter no mínimo 10 caracteres!');
        return;
    }
    
    try {
        const sucesso = await dataManager.atualizarStatusOrcamento(id, 'REPROVADO', justificativaTrimmed);
        
        if (sucesso) {
            mostrarNotificacao('Orçamento REPROVADO. Justificativa registrada.');
            await carregarTabelaAprovacoes();
            
            // Atualizar dashboard de KPIs
            if (dashboardController) {
                await dashboardController.atualizar();
            }
        } else {
            mostrarNotificacao('Erro ao reprovar orçamento');
        }
    } catch (error) {
        // Capturar erro de validação do DATA INTEGRITY GATE
        console.error('Erro ao reprovar orçamento:', error);
        mostrarNotificacao(error.message || 'Erro ao reprovar orçamento');
    }
}
