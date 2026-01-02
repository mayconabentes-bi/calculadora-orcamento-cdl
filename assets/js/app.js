/* =================================================================
   APP.JS - AXIOMA: INTELIGÊNCIA DE MARGEM v5.1.0
   Calculadora de Orçamento CDL/UTV
   Lógica principal da aplicação, cálculos e interface do usuário
   ================================================================= */

// ========== VARIÁVEIS GLOBAIS ==========
let ultimoCalculoRealizado = null;
let horariosCount = 0;
let horarios = [];
let modoVisualizacaoHistorico = 'convertidos'; // 'convertidos' ou 'pipeline'

// Instância do Motor de Cálculo de Orçamentos
let budgetEngine = null;

// ========== SVG ICONS ==========
const ICONS = {
    edit: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>',
    trash: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>',
    save: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>'
};

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', function() {
    inicializarAplicacao();
});

/**
 * Inicializa toda a aplicação
 */
function inicializarAplicacao() {
    // Inicializar o Motor de Cálculo de Orçamentos
    budgetEngine = new BudgetEngine(dataManager);
    
    configurarNavegacaoAbas();
    carregarSelectEspacos();
    carregarExtrasCheckboxes();
    carregarTabelaEspacos();
    carregarTabelaCustos();
    carregarExtrasConfig();
    carregarListaFuncionarios();
    inicializarHorarios();
    configurarEventListeners();
    aplicarTema();
    
    // Listener para mudanças na preferência de tema do sistema
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    prefersDark.addEventListener('change', () => {
        // Só reaplicar se o tema estiver em modo sistema
        if (dataManager.obterTema() === 'sistema') {
            aplicarTema();
        }
    });
    
    // Realizar auditoria de dados para verificar itens desatualizados
    const relatorioAuditoria = dataManager.realizarAuditoriaDados();
    if (relatorioAuditoria.status === 'ATENCAO') {
        exibirAlertaAuditoria(relatorioAuditoria);
    }
    
    // Dashboard de Oportunidades de Renovação (CRM Proativo)
    exibirOportunidadesRenovacao();
    
    // Carregar Centro de Operações Comerciais
    carregarCentroOperacoesComerciais();
    
    mostrarNotificacao('Sistema carregado com sucesso!');
}

// ========== CENTRO DE OPERAÇÕES COMERCIAIS (SGQ-SECURITY) ==========

/**
 * Carrega e atualiza o Centro de Operações Comerciais
 * Exibe leads novos e orçamentos com retorno executivo
 */
function carregarCentroOperacoesComerciais() {
    carregarSolicitacoesWeb();
    carregarRetornoExecutivo();
}

/**
 * Carrega solicitações web (LEAD_NOVO)
 */
function carregarSolicitacoesWeb() {
    const leadsNovos = dataManager.obterLeads('LEAD_NOVO');
    const badge = document.getElementById('badge-leads-novos');
    const lista = document.getElementById('lista-leads-novos');
    
    if (!badge || !lista) return;
    
    badge.textContent = leadsNovos.length;
    
    if (leadsNovos.length === 0) {
        lista.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 20px;">Nenhuma solicitação pendente</p>';
        return;
    }
    
    lista.innerHTML = '';
    
    leadsNovos.forEach(lead => {
        const div = document.createElement('div');
        div.style.cssText = 'padding: 12px; margin-bottom: 10px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px;';
        
        const dataCriacao = new Date(lead.dataCriacao).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        div.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                <div>
                    <strong style="color: #065f46; font-size: 0.95em;">${lead.nome}</strong>
                    <div style="font-size: 0.85em; color: #6b7280; margin-top: 2px;">${lead.telefone || lead.email || 'Sem contato'}</div>
                    <div style="font-size: 0.8em; color: #9ca3af; margin-top: 2px;">📅 ${dataCriacao}</div>
                </div>
                <button class="btn-primary btn-success" onclick="tratarLeadAgora(${lead.id})" style="padding: 6px 12px; font-size: 0.85em; white-space: nowrap;">
                    Tratar Agora
                </button>
            </div>
            ${lead.observacoes ? `<div style="font-size: 0.85em; color: #4b5563; margin-top: 8px; padding-top: 8px; border-top: 1px solid #d1d5db;">${lead.observacoes.substring(0, 100)}${lead.observacoes.length > 100 ? '...' : ''}</div>` : ''}
        `;
        
        lista.appendChild(div);
    });
}

/**
 * Carrega retorno executivo (APROVADO_PARA_ENVIO e REPROVADO_REVISAR)
 */
function carregarRetornoExecutivo() {
    const aprovadosParaEnvio = dataManager.obterOrcamentosPorStatus('APROVADO_PARA_ENVIO');
    const reprovadosRevisar = dataManager.obterOrcamentosPorStatus('REPROVADO_REVISAR');
    
    const badge = document.getElementById('badge-retorno-executivo');
    const lista = document.getElementById('lista-retorno-executivo');
    
    if (!badge || !lista) return;
    
    const total = aprovadosParaEnvio.length + reprovadosRevisar.length;
    badge.textContent = total;
    
    if (total === 0) {
        lista.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 20px;">Nenhum retorno pendente</p>';
        return;
    }
    
    lista.innerHTML = '';
    
    // Exibir aprovados para envio
    aprovadosParaEnvio.forEach(orc => {
        const div = document.createElement('div');
        div.style.cssText = 'padding: 12px; margin-bottom: 10px; background: #dcfce7; border: 1px solid #86efac; border-radius: 6px;';
        
        const dataAprovacao = new Date(orc.dataAprovacao || orc.data).toLocaleDateString('pt-BR');
        
        div.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                <div style="flex: 1;">
                    <span style="display: inline-block; padding: 2px 8px; background: #10b981; color: white; border-radius: 4px; font-size: 0.75em; font-weight: bold; margin-bottom: 6px;">APROVADO</span>
                    <div style="font-size: 0.9em; color: #065f46;"><strong>${orc.cliente || 'Cliente não informado'}</strong></div>
                    <div style="font-size: 0.85em; color: #6b7280; margin-top: 2px;">${orc.sala.unidade} - ${orc.sala.nome}</div>
                    <div style="font-size: 0.85em; color: #059669; margin-top: 2px; font-weight: 600;">R$ ${CoreUtils.formatarMoeda(orc.valorFinal)}</div>
                    <div style="font-size: 0.8em; color: #9ca3af; margin-top: 2px;">✅ Aprovado em ${dataAprovacao}</div>
                </div>
                <button class="btn-primary btn-success" onclick="gerarEEnviarPDF(${orc.id})" style="padding: 6px 12px; font-size: 0.85em; white-space: nowrap;">
                    Gerar e Enviar PDF
                </button>
            </div>
        `;
        
        lista.appendChild(div);
    });
    
    // Exibir reprovados para revisar
    reprovadosRevisar.forEach(orc => {
        const div = document.createElement('div');
        div.style.cssText = 'padding: 12px; margin-bottom: 10px; background: #fef3c7; border: 1px solid #fde68a; border-radius: 6px;';
        
        const dataRejeicao = new Date(orc.dataAprovacao || orc.data).toLocaleDateString('pt-BR');
        
        div.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                <div style="flex: 1;">
                    <span style="display: inline-block; padding: 2px 8px; background: #f59e0b; color: white; border-radius: 4px; font-size: 0.75em; font-weight: bold; margin-bottom: 6px;">REVISAR</span>
                    <div style="font-size: 0.9em; color: #92400e;"><strong>${orc.cliente || 'Cliente não informado'}</strong></div>
                    <div style="font-size: 0.85em; color: #6b7280; margin-top: 2px;">${orc.sala.unidade} - ${orc.sala.nome}</div>
                    <div style="font-size: 0.85em; color: #d97706; margin-top: 2px; font-weight: 600;">R$ ${CoreUtils.formatarMoeda(orc.valorFinal)}</div>
                    <div style="font-size: 0.8em; color: #9ca3af; margin-top: 2px;">⚠️ Reprovado em ${dataRejeicao}</div>
                    ${orc.justificativaRejeicao ? `<div style="font-size: 0.8em; color: #d97706; margin-top: 6px; padding: 6px; background: #fffbeb; border-radius: 4px;"><strong>Justificativa:</strong> ${orc.justificativaRejeicao}</div>` : ''}
                </div>
                <button class="btn-primary" onclick="ajustarOrcamento(${orc.id})" style="padding: 6px 12px; font-size: 0.85em; white-space: nowrap; background: #f59e0b; border-color: #f59e0b;">
                    Ajustar
                </button>
            </div>
        `;
        
        lista.appendChild(div);
    });
}

/**
 * Trata um lead - importa dados e muda status para EM_TRATAMENTO
 */
function tratarLeadAgora(leadId) {
    const lead = dataManager.obterLeadPorId(leadId);
    
    if (!lead) {
        mostrarNotificacao('Lead não encontrado!');
        return;
    }
    
    // Preencher campos do cliente
    document.getElementById('cliente-nome').value = lead.nome || '';
    document.getElementById('cliente-contato').value = lead.telefone || lead.email || '';
    
    if (lead.dataEvento) {
        document.getElementById('data-evento').value = lead.dataEvento;
    }
    
    // Atualizar status para EM_TRATAMENTO
    dataManager.atualizarStatusLead(leadId, 'EM_TRATAMENTO');
    
    // Scroll para o formulário
    document.getElementById('cliente-nome').scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Recarregar centro de operações
    carregarCentroOperacoesComerciais();
    
    mostrarNotificacao(`Lead "${lead.nome}" em tratamento!`);
}

/**
 * Gera e envia PDF para cliente (APROVADO_PARA_ENVIO -> ENVIADO_AO_CLIENTE)
 */
async function gerarEEnviarPDF(orcamentoId) {
    const historico = dataManager.obterHistoricoCalculos();
    const orcamento = historico.find(calc => calc.id === orcamentoId);
    
    if (!orcamento) {
        alert('Orçamento não encontrado!');
        return;
    }
    
    // Carregar dados do orçamento no ultimoCalculoRealizado
    ultimoCalculoRealizado = orcamento;
    
    // Gerar PDF
    await exportarPDFClienteComLoading();
    
    // Status já é atualizado automaticamente em exportarPDFClienteComLoading
    
    // Recarregar centro de operações
    setTimeout(() => {
        carregarCentroOperacoesComerciais();
    }, 500);
}

/**
 * Ajustar orçamento reprovado - carrega dados e exibe justificativa
 */
function ajustarOrcamento(orcamentoId) {
    const historico = dataManager.obterHistoricoCalculos();
    const orcamento = historico.find(calc => calc.id === orcamentoId);
    
    if (!orcamento) {
        alert('Orçamento não encontrado!');
        return;
    }
    
    // Exibir banner de erro com justificativa
    const bannerError = document.createElement('div');
    bannerError.id = 'banner-error';
    bannerError.style.cssText = 'position: fixed; top: 80px; left: 50%; transform: translateX(-50%); z-index: 9999; max-width: 800px; width: 90%; padding: 20px; background: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);';
    
    bannerError.innerHTML = `
        <div style="display: flex; align-items: start; gap: 15px;">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <div style="flex: 1;">
                <h3 style="margin: 0 0 10px 0; color: #92400e; font-size: 1.1em;">Orçamento Reprovado - Necessita Ajuste</h3>
                <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 0.95em;">Cliente: <strong>${orcamento.cliente || 'Não informado'}</strong></p>
                <div style="padding: 12px; background: #fffbeb; border-left: 3px solid #f59e0b; border-radius: 4px;">
                    <strong style="color: #92400e;">Justificativa da Superintendência:</strong>
                    <p style="margin: 8px 0 0 0; color: #6b7280;">${orcamento.justificativaRejeicao || 'Nenhuma justificativa fornecida'}</p>
                </div>
            </div>
            <button onclick="fecharBannerError()" style="background: none; border: none; cursor: pointer; padding: 4px; flex-shrink: 0;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        </div>
    `;
    
    // Remover banner anterior se existir
    const bannerAnterior = document.getElementById('banner-error');
    if (bannerAnterior) {
        bannerAnterior.remove();
    }
    
    document.body.appendChild(bannerError);
    
    // Carregar dados do orçamento nos campos
    // TODO: Implementar carregamento completo dos dados do orçamento
    
    // Scroll para o topo
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    mostrarNotificacao('Carregue os dados do orçamento e faça os ajustes necessários');
}

/**
 * Fecha o banner de erro
 */
function fecharBannerError() {
    const banner = document.getElementById('banner-error');
    if (banner) {
        banner.remove();
    }
}

// ========== FIM CENTRO DE OPERAÇÕES COMERCIAIS ==========


// ========== NAVEGAÇÃO POR ABAS ==========

/**
 * Configura o sistema de navegação por abas
 * SGQ-SECURITY: Gatekeeper RBAC para recursos administrativos
 * - Verifica isAdmin() antes de permitir acesso a 'config' e 'dashboard'
 * - Bloqueia visualização e emite log de tentativa não autorizada
 * - Mantém aba atual quando acesso negado
 */
function configurarNavegacaoAbas() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.dataset.tab;
            
            // SGQ-SECURITY: Gatekeeper RBAC para recursos administrativos
            if (targetTab === 'config' || targetTab === 'dashboard') {
                // Verificar se authManager está disponível e se usuário é admin
                if (typeof authManager !== 'undefined' && authManager) {
                    if (!authManager.isAdmin()) {
                        // Acesso negado - bloquear e logar tentativa
                        console.log('[SGQ-SECURITY] Tentativa de acesso não autorizado');
                        console.log('[SGQ-SECURITY] Aba solicitada:', targetTab);
                        console.log('[SGQ-SECURITY] Usuário:', authManager.currentUser?.email || 'não identificado');
                        console.log('[SGQ-SECURITY] Timestamp:', new Date().toISOString());
                        mostrarNotificacao('⚠️ Acesso negado: Recurso administrativo');
                        return; // Bloqueia a mudança de aba - mantém aba atual
                    }
                } else {
                    // authManager não disponível - bloquear por segurança
                    console.log('[SGQ-SECURITY] Tentativa de acesso não autorizado - authManager indisponível');
                    console.log('[SGQ-SECURITY] Aba solicitada:', targetTab);
                    console.log('[SGQ-SECURITY] Timestamp:', new Date().toISOString());
                    mostrarNotificacao('⚠️ Acesso negado: Sistema de autenticação não disponível');
                    return;
                }
            }
            
            // Remove active de todos os botões e conteúdos
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Adiciona active ao botão e conteúdo selecionado
            this.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
            
            // Atualiza tabelas se necessário
            if (targetTab === 'calculator') {
                carregarCentroOperacoesComerciais();
            } else if (targetTab === 'spaces') {
                carregarTabelaEspacos();
            } else if (targetTab === 'costs') {
                carregarTabelaCustos();
            } else if (targetTab === 'config') {
                carregarExtrasConfig();
                carregarListaFuncionarios();
            } else if (targetTab === 'history') {
                carregarTabelaHistorico();
            } else if (targetTab === 'dashboard') {
                inicializarDashboard();
            }
        });
    });
}

// ========== GERENCIAMENTO DE TEMA ==========

/**
 * Aplica o tema selecionado ao documento
 */
function aplicarTema() {
    const temaSelecionado = dataManager.obterTema();
    let aplicarEscuro = false;

    if (temaSelecionado === 'escuro') {
        aplicarEscuro = true;
    } else if (temaSelecionado === 'sistema') {
        // Detectar preferência do sistema operacional
        const prefereDark = window.matchMedia('(prefers-color-scheme: dark)');
        aplicarEscuro = prefereDark.matches;
    }
    // Se temaSelecionado === 'claro', aplicarEscuro permanece false

    // Aplicar ou remover a classe dark-theme
    if (aplicarEscuro) {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }

    // Atualizar o select de tema se existir
    const temaSelect = document.getElementById('tema-select');
    if (temaSelect) {
        temaSelect.value = temaSelecionado;
    }
}

/**
 * Altera o tema da aplicação
 * @param {string} novoTema - O tema a ser aplicado ('claro', 'escuro', 'sistema')
 */
function alterarTema(novoTema) {
    if (dataManager.definirTema(novoTema)) {
        aplicarTema();
        mostrarNotificacao(`Tema alterado para: ${novoTema}`);
    }
}

// ========== CARREGAMENTO DE DADOS NA INTERFACE ==========

/**
 * Carrega o select de espaços
 */
function carregarSelectEspacos() {
    const select = document.getElementById('espaco');
    const salas = dataManager.obterSalas();
    
    select.innerHTML = '<option value="">-- Selecione um espaço --</option>';
    
    salas.forEach(sala => {
        const option = document.createElement('option');
        option.value = sala.id;
        option.textContent = `${sala.unidade} - ${sala.nome}`;
        select.appendChild(option);
    });
    
    // Event listener para mostrar informações da sala
    select.addEventListener('change', mostrarInfoSala);
}

/**
 * Mostra informações da sala selecionada
 */
function mostrarInfoSala() {
    const salaId = document.getElementById('espaco').value;
    const infoDiv = document.getElementById('sala-info');
    
    if (!salaId) {
        infoDiv.innerHTML = '';
        return;
    }
    
    const sala = dataManager.obterSalaPorId(salaId);
    if (!sala) return;
    
    const multiplicadores = dataManager.obterMultiplicadoresTurno();
    
    infoDiv.innerHTML = `
        <strong style="display: block; margin-bottom: 8px;">${sala.unidade} - ${sala.nome}</strong>
        <div style="margin: 4px 0;">Capacidade: ${sala.capacidade} pessoas</div>
        <div style="margin: 4px 0;">Área: ${sala.area} m²</div>
        <div style="margin: 4px 0;">Custo Base: R$ ${CoreUtils.formatarMoeda(sala.custoBase)}/h</div>
        <br>
        <strong>Valores por Turno:</strong><br>
        <div style="margin: 4px 0;">Manhã: R$ ${CoreUtils.formatarMoeda(sala.custoBase * multiplicadores.manha)}/h (×${multiplicadores.manha})</div>
        <div style="margin: 4px 0;">Tarde: R$ ${CoreUtils.formatarMoeda(sala.custoBase * multiplicadores.tarde)}/h (×${multiplicadores.tarde})</div>
        <div style="margin: 4px 0;">Noite: R$ ${CoreUtils.formatarMoeda(sala.custoBase * multiplicadores.noite)}/h (×${multiplicadores.noite})</div>
    `;
}

/**
 * Carrega os checkboxes de itens extras
 */
function carregarExtrasCheckboxes() {
    const container = document.getElementById('extras-checkboxes');
    const extras = dataManager.obterExtras();
    
    container.innerHTML = '';
    
    extras.forEach(extra => {
        const div = document.createElement('div');
        div.className = 'checkbox-group';
        div.innerHTML = `
            <input type="checkbox" id="extra-${extra.id}" value="${extra.id}">
            <label for="extra-${extra.id}">${extra.nome} (+R$ ${CoreUtils.formatarMoeda(extra.custo)}/h)</label>
        `;
        container.appendChild(div);
    });
}

// ========== GERENCIAMENTO DE HORÁRIOS ==========

/**
 * Inicializa o gerenciamento de horários múltiplos
 */
function inicializarHorarios() {
    horarios = [];
    horariosCount = 0;
    adicionarNovoHorario('08:00', '17:00');
}

/**
 * Adiciona um novo horário
 */
function adicionarNovoHorario(inicio = '08:00', fim = '17:00') {
    const id = horariosCount++;
    horarios.push({ id, inicio, fim });
    renderizarHorarios();
}

/**
 * Remove um horário
 */
function removerHorario(id) {
    horarios = horarios.filter(h => h.id !== id);
    renderizarHorarios();
    if (horarios.length === 0) {
        adicionarNovoHorario();
    }
}

/**
 * Atualiza um horário
 */
function atualizarHorario(id, campo, valor) {
    const horario = horarios.find(h => h.id === id);
    if (horario) {
        horario[campo] = valor;
    }
}

/**
 * Renderiza a lista de horários
 */
function renderizarHorarios() {
    const container = document.getElementById('horarios-container');
    container.innerHTML = '';
    
    horarios.forEach((horario, index) => {
        const div = document.createElement('div');
        div.className = 'horario-item';
        div.style.cssText = 'display: flex; gap: 10px; margin-bottom: 10px; align-items: end;';
        
        div.innerHTML = `
            <div class="form-group" style="flex: 1;">
                <label for="horario-inicio-${horario.id}">Início ${index + 1}:</label>
                <input type="time" 
                       id="horario-inicio-${horario.id}" 
                       class="form-control" 
                       value="${horario.inicio}"
                       onchange="atualizarHorario(${horario.id}, 'inicio', this.value)">
            </div>
            <div class="form-group" style="flex: 1;">
                <label for="horario-fim-${horario.id}">Fim ${index + 1}:</label>
                <input type="time" 
                       id="horario-fim-${horario.id}" 
                       class="form-control" 
                       value="${horario.fim}"
                       onchange="atualizarHorario(${horario.id}, 'fim', this.value)">
            </div>
            ${horarios.length > 1 ? `
                <button type="button" 
                        class="btn-small btn-delete" 
                        onclick="removerHorario(${horario.id})"
                        style="margin-bottom: 0;">${ICONS.trash}</button>
            ` : ''}
        `;
        
        container.appendChild(div);
    });
}

/**
 * Calcula o total de horas de todos os horários
 * 
 * Complexidade: O(h) onde h = número de horários configurados
 * Espaço: O(1) - apenas variáveis escalares
 * 
 * Performance: Linear - eficiente mesmo com múltiplos horários
 * Nota: Número típico de horários é pequeno (1-5), então performance excelente
 */
function calcularTotalHorasPorDia() {
    let totalHoras = 0;
    
    // Loop O(h) - linear sobre horários
    for (const horario of horarios) {
        const minutosInicio = CoreUtils.parseTimeToMinutes(horario.inicio);
        const minutosFim = CoreUtils.parseTimeToMinutes(horario.fim);
        
        if (minutosInicio < minutosFim) {
            totalHoras += (minutosFim - minutosInicio) / 60;
        }
    }
    
    return totalHoras;
}

/**
 * Valida todos os horários
 */
function validarHorarios() {
    for (const horario of horarios) {
        const minutosInicio = CoreUtils.parseTimeToMinutes(horario.inicio);
        const minutosFim = CoreUtils.parseTimeToMinutes(horario.fim);
        
        if (minutosInicio >= minutosFim) {
            return false;
        }
    }
    return true;
}

// ========== FIM GERENCIAMENTO DE HORÁRIOS ==========

/**
 * Carrega a tabela de espaços
 */
function carregarTabelaEspacos() {
    const tbody = document.getElementById('espacos-body');
    const salas = dataManager.obterSalas();
    
    tbody.innerHTML = '';
    
    salas.forEach(sala => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${sala.nome}</strong></td>
            <td>${sala.unidade}</td>
            <td>${sala.capacidade} pessoas</td>
            <td>${sala.area} m²</td>
            <td>
                <button class="btn-small btn-edit" onclick="editarSala(${sala.id})">${ICONS.edit} Editar</button>
                <button class="btn-small btn-delete" onclick="removerSala(${sala.id})">${ICONS.trash} Remover</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

/**
 * Carrega a tabela de custos por espaço
 */
function carregarTabelaCustos() {
    const tbody = document.getElementById('costs-body');
    const salas = dataManager.obterSalas();
    const multiplicadores = dataManager.obterMultiplicadoresTurno();
    
    tbody.innerHTML = '';
    
    salas.forEach(sala => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${sala.unidade}</strong></td>
            <td>${sala.nome}</td>
            <td>${sala.capacidade}</td>
            <td>${sala.area}</td>
            <td>
                <input type="number" 
                       id="custo-${sala.id}" 
                       value="${sala.custoBase}" 
                       step="0.01" 
                       min="0"
                       data-sala-id="${sala.id}">
            </td>
            <td>R$ ${CoreUtils.formatarMoeda(sala.custoBase * multiplicadores.manha)}</td>
            <td>R$ ${CoreUtils.formatarMoeda(sala.custoBase * multiplicadores.tarde)}</td>
            <td>R$ ${CoreUtils.formatarMoeda(sala.custoBase * multiplicadores.noite)}</td>
            <td>
                <button class="btn-small btn-edit" onclick="salvarCustoSala(${sala.id})">${ICONS.save} Salvar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

/**
 * Carrega a lista de extras na configuração
 */
function carregarExtrasConfig() {
    const container = document.getElementById('extras-list');
    const extras = dataManager.obterExtras();
    
    container.innerHTML = '';
    
    extras.forEach(extra => {
        const div = document.createElement('div');
        div.className = 'checkbox-group';
        div.innerHTML = `
            <div style="flex: 1;">
                <strong>${extra.nome}</strong><br>
                <span style="color: #6b7280;">R$ ${CoreUtils.formatarMoeda(extra.custo)}/h</span>
            </div>
            <div>
                <button class="btn-small btn-edit" onclick="editarExtra(${extra.id})">${ICONS.edit}</button>
                <button class="btn-small btn-delete" onclick="removerExtra(${extra.id})">${ICONS.trash}</button>
            </div>
        `;
        container.appendChild(div);
    });
}

/**
 * Carrega a lista de funcionários
 */
function carregarListaFuncionarios() {
    const container = document.getElementById('funcionarios-list');
    const funcionarios = dataManager.obterFuncionarios();
    
    container.innerHTML = '';
    
    if (funcionarios.length === 0) {
        container.innerHTML = '<p style="color: #6b7280; text-align: center; padding: 20px;">Nenhum funcionário cadastrado.</p>';
        return;
    }
    
    // Contador de funcionários ativos
    const funcionariosAtivos = dataManager.obterFuncionariosAtivos().length;
    const infoHeader = document.createElement('div');
    infoHeader.style.cssText = 'padding: 10px; margin-bottom: 15px; background: #e0f2fe; border-left: 4px solid #0284c7; border-radius: 4px;';
    infoHeader.innerHTML = `
        <strong style="color: #0284c7; display: flex; align-items: center; gap: 8px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            Funcionários Selecionados: ${funcionariosAtivos}
        </strong>
        <p style="margin: 5px 0 0 0; font-size: 0.9em; color: #6b7280;">Selecione um ou mais funcionários para incluir nos cálculos</p>
    `;
    container.appendChild(infoHeader);
    
    funcionarios.forEach(func => {
        const div = document.createElement('div');
        div.className = 'funcionario-item';
        div.style.cssText = 'padding: 15px; margin-bottom: 15px; background: #f3f4f6; border-radius: 8px; border-left: 4px solid ' + (func.ativo ? '#10b981' : '#6b7280');
        
        const dataEscalaInfo = func.dataEscala ? 
            `<div style="grid-column: span 2; padding: 5px 0; border-top: 1px solid #d1d5db; margin-top: 5px; color: #0284c7;">📅 Data da Escala: <strong>${new Date(func.dataEscala + 'T00:00:00').toLocaleDateString('pt-BR')}</strong></div>` : '';
        
        div.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                        <input type="checkbox" 
                               id="func-ativo-${func.id}" 
                               ${func.ativo ? 'checked' : ''} 
                               onchange="alternarFuncionarioAtivo(${func.id})"
                               style="width: 18px; height: 18px; cursor: pointer;">
                        <label for="func-ativo-${func.id}" style="cursor: pointer; font-size: 1.1em; color: #1e3c72; font-weight: bold;">${func.nome}</label>
                        ${func.ativo ? '<span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.75em; font-weight: bold;">ATIVO</span>' : ''}
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; font-size: 0.9em; color: #6b7280;">
                        <div>Hora Normal: <strong>R$ ${CoreUtils.formatarMoeda(func.horaNormal)}</strong></div>
                        <div>HE 50%: <strong>R$ ${CoreUtils.formatarMoeda(func.he50)}</strong></div>
                        <div>HE 100%: <strong>R$ ${CoreUtils.formatarMoeda(func.he100)}</strong></div>
                        <div>Vale Transporte: <strong>R$ ${CoreUtils.formatarMoeda(func.valeTransporte)}</strong></div>
                        <div>Transporte App: <strong>R$ ${CoreUtils.formatarMoeda(func.transporteApp || 0)}</strong></div>
                        <div>Refeição: <strong>R$ ${CoreUtils.formatarMoeda(func.refeicao || 0)}</strong></div>
                        ${dataEscalaInfo}
                    </div>
                </div>
                <div style="display: flex; gap: 5px; margin-left: 15px;">
                    <button class="btn-small btn-edit" onclick="editarFuncionario(${func.id})" title="Editar">${ICONS.edit}</button>
                    ${funcionarios.length > 1 ? `<button class="btn-small btn-delete" onclick="removerFuncionario(${func.id})" title="Remover">${ICONS.trash}</button>` : ''}
                </div>
            </div>
        `;
        container.appendChild(div);
    });
}

// ========== EVENT LISTENERS ==========

/**
 * Configura todos os event listeners da aplicação
 */
function configurarEventListeners() {
    // Calculadora
    document.getElementById('calcular').addEventListener('click', calcularOrcamento);
    document.getElementById('margem').addEventListener('input', atualizarRangeValue);
    document.getElementById('desconto').addEventListener('input', atualizarRangeValue);
    
    // [SGQ-SECURITY] Listener para Trava de Fim de Semana
    const dataEventoInput = document.getElementById('data-evento');
    if (dataEventoInput) {
        dataEventoInput.addEventListener('change', verificarTravaFimDeSemana);
        dataEventoInput.addEventListener('input', verificarTravaFimDeSemana);
        // [SGQ-SECURITY] Esconder botão de aprovação quando dados mudam
        dataEventoInput.addEventListener('change', ocultarBotaoAprovacao);
    }
    
    // [SGQ-SECURITY] Listeners para ocultar botão de aprovação quando dados mudam
    const camposCalculadora = [
        'cliente-nome', 'cliente-contato', 'espaco', 'duracao', 'duracao-tipo',
        'margem', 'desconto'
    ];
    
    camposCalculadora.forEach(campoId => {
        const campo = document.getElementById(campoId);
        if (campo) {
            campo.addEventListener('change', ocultarBotaoAprovacao);
            campo.addEventListener('input', ocultarBotaoAprovacao);
        }
    });
    
    // Listeners para checkboxes de dias da semana e extras
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', ocultarBotaoAprovacao);
    });
    
    // [SGQ-SECURITY] Listeners específicos para checkboxes de dias da semana (fim de semana)
    const checkboxesDiasSemana = ['dia-seg', 'dia-ter', 'dia-qua', 'dia-qui', 'dia-sex', 'dia-sab', 'dia-dom'];
    checkboxesDiasSemana.forEach(checkboxId => {
        const checkbox = document.getElementById(checkboxId);
        if (checkbox) {
            checkbox.addEventListener('change', verificarTravaFimDeSemana);
        }
    });
    
    // Horários
    document.getElementById('adicionar-horario').addEventListener('click', () => adicionarNovoHorario());
    
    // Exportação e impressão
    document.getElementById('exportar-pdf-cliente').addEventListener('click', exportarPDFClienteComLoading);
    document.getElementById('exportar-pdf-super').addEventListener('click', exportarPDFSuperintendenciaComLoading);
    document.getElementById('imprimir').addEventListener('click', imprimirOrcamento);
    document.getElementById('exportar-csv').addEventListener('click', exportarCSV);
    
    // Espaços
    document.getElementById('adicionar-espaco').addEventListener('click', adicionarNovoEspaco);
    
    // Custos
    document.getElementById('salvar-custos').addEventListener('click', salvarTodosCustos);
    
    // Configurações - Extras
    document.getElementById('adicionar-item').addEventListener('click', adicionarNovoExtra);
    
    // Configurações - Funcionários
    document.getElementById('adicionar-funcionario').addEventListener('click', adicionarNovoFuncionario);
    
    // Configurações - Backup
    document.getElementById('exportar-dados').addEventListener('click', exportarDados);
    document.getElementById('importar-dados').addEventListener('click', () => {
        document.getElementById('import-file').click();
    });
    document.getElementById('import-file').addEventListener('change', importarDados);
    document.getElementById('resetar-dados').addEventListener('click', resetarDados);
    
    // Configurações - Tema
    const temaSelect = document.getElementById('tema-select');
    if (temaSelect) {
        temaSelect.addEventListener('change', (e) => {
            alterarTema(e.target.value);
        });
    }
    
    // Histórico & Conversão
    document.getElementById('exportar-dataset-ml').addEventListener('click', exportarDatasetML);
    document.getElementById('exportar-dataset-bi').addEventListener('click', exportarDatasetBI);
    document.getElementById('limpar-historico').addEventListener('click', limparHistoricoConfirmacao);
    
    // Importar Lead
    const btnImportarLead = document.getElementById('btn-importar-lead');
    if (btnImportarLead) {
        btnImportarLead.addEventListener('click', abrirModalImportarLead);
    }
    
    // Enviar para Aprovação
    const btnEnviarAprovacao = document.getElementById('btn-enviar-aprovacao');
    if (btnEnviarAprovacao) {
        btnEnviarAprovacao.addEventListener('click', enviarParaAprovacao);
    }
}

// ========== IMPORTAÇÃO DE LEADS ==========

/**
 * Abre o modal para importar leads (async para buscar leads do Firebase)
 * [SGQ-SECURITY] Sincronização com Firebase
 */
async function abrirModalImportarLead() {
    const modal = document.getElementById('modal-importar-lead');
    if (modal) {
        modal.style.display = 'flex';
        await carregarLeadsNoModal();
    }
}

/**
 * Fecha o modal de importar leads
 */
function fecharModalImportarLead() {
    const modal = document.getElementById('modal-importar-lead');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * Carrega os leads disponíveis no modal (async para buscar do Firebase)
 * [SGQ-SECURITY] Busca leads diretamente do Firebase usando dataManager.obterLeads(status: 'LEAD_NOVO')
 */
async function carregarLeadsNoModal() {
    const tbody = document.getElementById('modal-leads-body');
    const semLeads = document.getElementById('modal-sem-leads');
    const contador = document.getElementById('contador-leads');
    
    if (!tbody) return;

    // [SGQ-SECURITY] Obter leads com status LEAD_NOVO diretamente do Firebase
    const leads = dataManager.obterLeads('LEAD_NOVO');
    
    // Atualizar contador
    if (contador) {
        const totalLeads = leads.length;
        contador.innerHTML = `
            <p style="margin: 0; font-size: 0.9em; color: #475569; text-align: center;">
                <strong style="color: #0284c7; font-size: 1.2em;">${totalLeads}</strong>
                lead${totalLeads !== 1 ? 's' : ''} disponível${totalLeads !== 1 ? 'is' : ''} para importação
            </p>
        `;
    }

    if (leads.length === 0) {
        tbody.innerHTML = '';
        semLeads.style.display = 'block';
        return;
    }

    semLeads.style.display = 'none';

    // Renderizar linhas da tabela com campos: Data da Solicitação, Cliente e Espaço
    tbody.innerHTML = '';
    
    leads.forEach(lead => {
        const tr = document.createElement('tr');
        
        // Formatar data da solicitação
        const dataSolicitacao = new Date(lead.dataCriacao).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Nome do cliente
        const cliente = lead.nome || 'Não informado';
        
        // Espaço solicitado (pode vir como espaco ou espacoId)
        let espacoTexto = 'Não especificado';
        if (lead.espacoId) {
            const sala = dataManager.obterSalaPorId(lead.espacoId);
            if (sala) {
                espacoTexto = `${sala.unidade} - ${sala.nome}`;
            }
        } else if (lead.espaco) {
            espacoTexto = lead.espaco;
        }
        
        tr.innerHTML = `
            <td style="white-space: nowrap;">${dataSolicitacao}</td>
            <td><strong>${cliente}</strong></td>
            <td>${espacoTexto}</td>
            <td style="white-space: nowrap;">
                <button class="btn-primary btn-success" onclick="importarLeadSelecionado(${lead.id})" style="padding: 6px 12px; font-size: 0.85em;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Importar
                </button>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
}

/**
 * Importa um lead selecionado e preenche os dados do cliente
 * [SGQ-SECURITY] Autopreenchimento com mapeamento correto de campos + Cálculo Automatizado
 * @param {number} leadId - ID do lead a ser importado
 */
function importarLeadSelecionado(leadId) {
    const lead = dataManager.obterLeadPorId(leadId);
    
    if (!lead) {
        mostrarNotificacao('[SGQ-SECURITY] Lead não encontrado!');
        return;
    }

    console.log('[SGQ-SECURITY] Importando lead:', lead.id, '-', lead.nome);
    console.log('[SGQ-SECURITY] Dados do lead:', lead);

    // [SGQ-SECURITY] Preencher campos corretos: #cliente-nome, #cliente-contato, #data-evento, #espaco
    document.getElementById('cliente-nome').value = lead.nome || '';
    
    // Priorizar telefone, mas pode usar email se telefone não estiver disponível
    const contato = lead.telefone || lead.email || '';
    document.getElementById('cliente-contato').value = contato;
    
    // Preencher data do evento se disponível
    if (lead.dataEvento) {
        document.getElementById('data-evento').value = lead.dataEvento;
        
        // [SGQ-SECURITY] Verificar se é fim de semana e aplicar trava
        verificarTravaFimDeSemana();
    }
    
    // Preencher seletor de espaço se disponível
    if (lead.espacoId) {
        const espacoSelect = document.getElementById('espaco');
        if (espacoSelect) {
            espacoSelect.value = lead.espacoId;
            // Disparar evento change para atualizar informações da sala
            espacoSelect.dispatchEvent(new Event('change'));
        }
    }
    
    // [SGQ-SECURITY] NOVOS CAMPOS: Duração do Contrato
    if (lead.duracaoContrato) {
        const duracaoInput = document.getElementById('duracao');
        const duracaoTipoSelect = document.getElementById('duracao-tipo');
        if (duracaoInput) {
            duracaoInput.value = lead.duracaoContrato;
            console.log('[SGQ-SECURITY] Duração do contrato preenchida:', lead.duracaoContrato, 'dias');
        }
        if (duracaoTipoSelect) {
            duracaoTipoSelect.value = 'dias'; // Sempre em dias
        }
    }
    
    // [SGQ-SECURITY] NOVOS CAMPOS: Dias da Semana
    if (lead.diasSemanaSelecionados && Array.isArray(lead.diasSemanaSelecionados)) {
        // Primeiro, desmarcar todos os checkboxes
        const todosCheckboxes = ['dia-seg', 'dia-ter', 'dia-qua', 'dia-qui', 'dia-sex', 'dia-sab', 'dia-dom'];
        todosCheckboxes.forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox) {
                checkbox.checked = false;
            }
        });
        
        // Marcar apenas os dias selecionados
        const mapeamentoDias = {
            0: 'dia-dom',
            1: 'dia-seg',
            2: 'dia-ter',
            3: 'dia-qua',
            4: 'dia-qui',
            5: 'dia-sex',
            6: 'dia-sab'
        };
        
        lead.diasSemanaSelecionados.forEach(dia => {
            const checkboxId = mapeamentoDias[dia];
            if (checkboxId) {
                const checkbox = document.getElementById(checkboxId);
                if (checkbox) {
                    checkbox.checked = true;
                }
            }
        });
        
        console.log('[SGQ-SECURITY] Dias da semana marcados:', lead.diasSemanaSelecionados);
    }
    
    // [SGQ-SECURITY] NOVOS CAMPOS: Horários
    if (lead.horarioInicio) {
        const horarioInicioContainer = document.getElementById('horarios-container');
        if (horarioInicioContainer) {
            // Se houver múltiplos horários, pegar o primeiro input de horário-inicio
            const primeiroHorarioInicio = horarioInicioContainer.querySelector('input[id^="horario-inicio-"]');
            if (primeiroHorarioInicio) {
                primeiroHorarioInicio.value = lead.horarioInicio;
            }
        }
    }
    
    if (lead.horarioFim) {
        const horarioInicioContainer = document.getElementById('horarios-container');
        if (horarioInicioContainer) {
            // Se houver múltiplos horários, pegar o primeiro input de horário-fim
            const primeiroHorarioFim = horarioInicioContainer.querySelector('input[id^="horario-fim-"]');
            if (primeiroHorarioFim) {
                primeiroHorarioFim.value = lead.horarioFim;
            }
        }
    }
    
    if (lead.horarioInicio || lead.horarioFim) {
        console.log('[SGQ-SECURITY] Horários preenchidos:', lead.horarioInicio, '-', lead.horarioFim);
    }
    
    // [SGQ-SECURITY] Atualizar status do lead para "EM_ATENDIMENTO" com log de transição
    dataManager.atualizarStatusLead(leadId, 'EM_ATENDIMENTO');
    console.log('[SGQ-SECURITY] Lead', leadId, 'transicionado para EM_ATENDIMENTO');
    
    // Fechar modal
    fecharModalImportarLead();
    
    // Scroll para o topo da calculadora
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // [SGQ-SECURITY] DISPARO AUTOMÁTICO DO CÁLCULO
    // Aguardar um pequeno delay para garantir que todos os campos foram preenchidos
    setTimeout(() => {
        console.log('[SGQ-SECURITY] Cálculo automatizado aplicado via importação de lead - ID:', leadId);
        console.log('[SGQ-SECURITY] Timestamp:', new Date().toISOString());
        
        // Disparar função de cálculo
        calcularOrcamento();
        
        mostrarNotificacao(`[SGQ-SECURITY] Lead "${lead.nome}" importado e calculado automaticamente!`, 5000);
    }, 500);
}

// ========== TRAVA DE FIM DE SEMANA ==========

/**
 * [SGQ-SECURITY] Trava de Fim de Semana
 * Se o evento for sábado ou domingo, força quantidade mínima de 3 funcionários
 * TAMBÉM verifica os checkboxes dos dias da semana selecionados
 */
function verificarTravaFimDeSemana() {
    const dataEventoInput = document.getElementById('data-evento');
    
    // Verificar se a data do evento é fim de semana
    let ehFimDeSemanaData = false;
    if (dataEventoInput && dataEventoInput.value) {
        const dataEvento = new Date(dataEventoInput.value + 'T00:00:00');
        const diaSemana = dataEvento.getDay(); // 0 = Domingo, 6 = Sábado
        ehFimDeSemanaData = (diaSemana === 0 || diaSemana === 6);
    }
    
    // Verificar se algum checkbox de fim de semana está marcado
    const checkboxSabado = document.getElementById('dia-sab');
    const checkboxDomingo = document.getElementById('dia-dom');
    const ehFimDeSemanaCheckbox = (checkboxSabado && checkboxSabado.checked) || 
                                   (checkboxDomingo && checkboxDomingo.checked);
    
    // Aplicar trava se qualquer uma das condições for verdadeira
    const ehFimDeSemana = ehFimDeSemanaData || ehFimDeSemanaCheckbox;
    
    if (ehFimDeSemana) {
        console.log('[SGQ-SECURITY] TRAVA DE FIM DE SEMANA ATIVADA');
        if (ehFimDeSemanaData && dataEventoInput) {
            console.log('[SGQ-SECURITY] - Motivo: Data do evento:', dataEventoInput.value);
        }
        if (ehFimDeSemanaCheckbox) {
            console.log('[SGQ-SECURITY] - Motivo: Dias da semana selecionados incluem sábado/domingo');
        }
        
        // Força mínimo de 3 funcionários ativos
        const funcionarios = dataManager.obterFuncionarios();
        let funcionariosAtivos = funcionarios.filter(f => f.ativo).length;
        
        if (funcionariosAtivos < 3) {
            // Ativar funcionários até atingir 3
            let count = 0;
            for (let func of funcionarios) {
                if (count >= 3) break;
                if (!func.ativo) {
                    dataManager.definirFuncionarioAtivo(func.id, true);
                    console.log('[SGQ-SECURITY] Funcionário', func.nome, 'ativado automaticamente (fim de semana)');
                }
                count++;
            }
            
            // Recarregar lista de funcionários na interface
            if (typeof carregarListaFuncionarios === 'function') {
                carregarListaFuncionarios();
            }
            
            mostrarNotificacao('[SGQ-SECURITY] Evento de fim de semana: Mínimo de 3 funcionários obrigatório', 5000);
        }
        
        // Adicionar atributo data para indicar que é fim de semana
        if (dataEventoInput) {
            dataEventoInput.setAttribute('data-fim-de-semana', 'true');
        }
    } else {
        // Remover atributo se não for fim de semana
        if (dataEventoInput) {
            dataEventoInput.removeAttribute('data-fim-de-semana');
        }
    }
}

// ========== WORKFLOW DE APROVAÇÃO ==========

/**
 * [SGQ-SECURITY] Envia a proposta atual para aprovação executiva
 * Implementa workflow colaborativo com transições de estado rastreadas
 */
async function enviarPropostaParaAprovacao() {
    if (!ultimoCalculoRealizado) {
        alert('[SGQ-SECURITY] Por favor, calcule um orçamento primeiro!');
        return;
    }
    
    if (!confirm('[SGQ-SECURITY] Deseja enviar esta proposta para aprovação da Superintendência?')) {
        return;
    }
    
    console.log('[SGQ-SECURITY] Iniciando envio de proposta para aprovação');
    
    // Obter referência ao botão
    const btnEnviar = document.getElementById('btn-enviar-aprovacao');
    const originalButtonContent = btnEnviar.innerHTML;
    
    // Desabilitar botão e mostrar estado de "Enviando..."
    btnEnviar.disabled = true;
    btnEnviar.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="loading-spinner">
            <line x1="12" y1="2" x2="12" y2="6"></line>
            <line x1="12" y1="18" x2="12" y2="22"></line>
            <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
            <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
            <line x1="2" y1="12" x2="6" y2="12"></line>
            <line x1="18" y1="12" x2="22" y2="12"></line>
            <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
            <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
        </svg>
        Enviando...
    `;
    
    try {
        // [SGQ-SECURITY] Coletar estado atual do cálculo
        const estadoAtual = {
            ...ultimoCalculoRealizado,
            statusAprovacao: 'AGUARDANDO_APROVACAO',
            dataEnvio: new Date().toISOString()
        };
        
        console.log('[SGQ-SECURITY] Estado do cálculo coletado:', {
            cliente: estadoAtual.clienteNome,
            valor: estadoAtual.resultado.valorFinal,
            status: estadoAtual.statusAprovacao
        });
        
        // [SGQ-SECURITY] Chamar dataManager.adicionarCalculoHistoricoFirestore com status AGUARDANDO_APROVACAO
        const resultado = await dataManager.adicionarCalculoHistoricoFirestore(estadoAtual);
        
        if (resultado) {
            console.log('[SGQ-SECURITY] TRANSIÇÃO DE ESTADO: CALCULADO -> AGUARDANDO_APROVACAO');
            console.log('[SGQ-SECURITY] Proposta ID:', resultado.id);
            
            // [SGQ-SECURITY] Limpar calculadora após sucesso
            limparCalculadora();
            
            // [SGQ-SECURITY] Ocultar botão de aprovação
            document.getElementById('btn-aprovacao-container').style.display = 'none';
            
            // [SGQ-SECURITY] Mostrar notificação de sucesso
            mostrarNotificacao('[SGQ-SECURITY] Proposta enviada à Superintendência', 5000);
            
            // Atualizar histórico se disponível
            if (typeof carregarTabelaHistorico === 'function') {
                carregarTabelaHistorico();
            }
        } else {
            throw new Error('Falha ao enviar proposta para aprovação');
        }
    } catch (error) {
        console.error('[SGQ-SECURITY] Erro ao enviar para aprovação:', error);
        alert('[SGQ-SECURITY] Erro ao enviar proposta para aprovação. Por favor, tente novamente.');
    } finally {
        // Restaurar botão
        btnEnviar.disabled = false;
        btnEnviar.innerHTML = originalButtonContent;
    }
}

/**
 * [SGQ-SECURITY] Limpa os campos da calculadora
 */
function limparCalculadora() {
    // Limpar campos do cliente
    document.getElementById('cliente-nome').value = '';
    document.getElementById('cliente-contato').value = '';
    
    // Limpar data do evento
    const dataEventoInput = document.getElementById('data-evento');
    if (dataEventoInput) {
        dataEventoInput.value = '';
        dataEventoInput.removeAttribute('data-fim-de-semana');
    }
    
    // Resetar seletor de espaço
    const espacoSelect = document.getElementById('espaco');
    if (espacoSelect) {
        espacoSelect.value = '';
        espacoSelect.dispatchEvent(new Event('change'));
    }
    
    // Limpar último cálculo realizado
    ultimoCalculoRealizado = null;
    
    console.log('[SGQ-SECURITY] Calculadora limpa após envio de proposta');
}

// Manter referência da função antiga para compatibilidade
const enviarParaAprovacao = enviarPropostaParaAprovacao;

/**
 * [SGQ-SECURITY] Oculta o botão de aprovação quando dados da calculadora mudam
 * Exige novo cálculo antes de permitir envio para aprovação
 */
function ocultarBotaoAprovacao() {
    const btnAprovacaoContainer = document.getElementById('btn-aprovacao-container');
    if (btnAprovacaoContainer && btnAprovacaoContainer.style.display !== 'none') {
        btnAprovacaoContainer.style.display = 'none';
        console.log('[SGQ-SECURITY] Botão de aprovação ocultado - dados alterados, novo cálculo necessário');
    }
}

/**
 * Atualiza o valor exibido dos ranges
 */
function atualizarRangeValue(event) {
    const input = event.target;
    const valueSpan = document.getElementById(`${input.id}-value`);
    valueSpan.textContent = `${input.value}%`;
}

// ========== CÁLCULO DO ORÇAMENTO ==========

/**
 * Coleta IDs dos itens extras selecionados no DOM
 * @returns {Array<number>} Array com IDs dos extras selecionados
 */
function obterExtrasSelecionados() {
    const extrasIds = [];
    const extras = dataManager.obterExtras();
    extras.forEach(extra => {
        const checkbox = document.getElementById(`extra-${extra.id}`);
        if (checkbox && checkbox.checked) {
            extrasIds.push(extra.id);
        }
    });
    return extrasIds;
}

/**
 * Calcula o orçamento completo
 */
function calcularOrcamento() {
    // Coletar dados do formulário
    let clienteNome = document.getElementById('cliente-nome').value.trim();
    const clienteContato = document.getElementById('cliente-contato').value.trim();
    let salaId = document.getElementById('espaco').value;
    const duracao = parseInt(document.getElementById('duracao').value) || 1;
    const duracaoTipo = document.getElementById('duracao-tipo').value || 'meses';
    const margem = parseFloat(document.getElementById('margem').value) / 100 || 0;
    const desconto = parseFloat(document.getElementById('desconto').value) / 100 || 0;
    let dataEvento = document.getElementById('data-evento').value;
    
    // ==============================================================
    // MODO SIMULAÇÃO DE CENÁRIOS: Eliminar Gatekeepers de Validação
    // ==============================================================
    // Objetivo: Permitir cálculo com dados incompletos para:
    // - Testes avançados de sistema
    // - Integração de dados retroativos
    // - Simulação de cenários parciais
    // - Pipeline de oportunidades mais denso (ML/BI)
    
    // Rastrear se usamos fallbacks (para classificação de risco)
    let usouFallbacks = false;
    
    // 1. ELIMINAÇÃO DE BLOQUEIO DE IDENTIDADE
    // Se nome estiver vazio, gerar identificador de teste automático
    let clienteNomeSanitizado = clienteNome;
    let clienteContatoSanitizado = clienteContato;
    
    if (!clienteNome || clienteNome.length === 0) {
        // Fallback: nome automático para simulação do sistema
        clienteNomeSanitizado = "Simulação_Axioma_" + Date.now();
        console.warn('⚠️ Nome do cliente vazio - usando fallback:', clienteNomeSanitizado);
        mostrarNotificacao('⚠️ Cálculo sem nome do cliente - usando identificador de simulação', 4000);
        usouFallbacks = true;
    } else {
        // VALIDAÇÃO COM DATA SANITIZER - Gatekeeper de Qualidade de Dados
        // Sempre tentar sanitizar para manter qualidade dos dados
        const resultadoSanitizacao = DataSanitizer.sanitizarDadosCliente(clienteNome, clienteContato);
        
        if (!resultadoSanitizacao.valido) {
            // MODO NÃO-INTERRUPTIVO: Avisar mas continuar
            console.warn('⚠️ Avisos de qualidade de dados:', resultadoSanitizacao.erros);
            
            // Tentar usar dados normalizados se disponíveis
            if (resultadoSanitizacao.dados && resultadoSanitizacao.dados.clienteNome) {
                clienteNomeSanitizado = resultadoSanitizacao.dados.clienteNome;
            }
            if (resultadoSanitizacao.dados && resultadoSanitizacao.dados.clienteContato) {
                clienteContatoSanitizado = resultadoSanitizacao.dados.clienteContato;
            }
        } else {
            // Dados sanitizados e validados - usar valores normalizados
            clienteNomeSanitizado = resultadoSanitizacao.dados.clienteNome;
            clienteContatoSanitizado = resultadoSanitizacao.dados.clienteContato || clienteContato;
        }
    }
    
    // 2. FLEXIBILIZAÇÃO DE ESPAÇO
    // Se sala não selecionada, usar primeira sala disponível (padrão de simulação)
    if (!salaId) {
        const salasDisponiveis = dataManager.obterSalas();
        if (salasDisponiveis.length > 0) {
            salaId = salasDisponiveis[0].id;
            console.warn('⚠️ Sala não selecionada - usando primeira disponível:', salasDisponiveis[0].nome);
            mostrarNotificacao('⚠️ Sala não selecionada - usando padrão de simulação', 4000);
            usouFallbacks = true;
        } else {
            // Situação crítica: sem salas no sistema
            // Criar sala virtual mínima para permitir o cálculo
            console.error('⚠️ AVISO CRÍTICO: Nenhuma sala disponível - criando sala virtual para simulação');
            mostrarNotificacao('⚠️ Sistema sem salas configuradas - usando valores padrão de simulação', 5000);
            // Não podemos criar sala no sistema, mas podemos simular uma temporariamente
            // O cálculo continuará mas será marcado como ALTO RISCO
            usouFallbacks = true;
        }
    }
    
    let sala = dataManager.obterSalaPorId(salaId);
    if (!sala) {
        // Criar objeto de sala virtual para permitir o cálculo
        // Valores padrão médios baseados em salas típicas do sistema
        console.warn('⚠️ Criando sala virtual para simulação');
        const CAPACIDADE_PADRAO = 50;  // Capacidade média (pessoas)
        const AREA_PADRAO = 100;        // Área média (m²)
        const CUSTO_BASE_PADRAO = 100.00; // Custo/hora médio (R$)
        
        sala = {
            id: 1,
            nome: 'Sala Virtual (Simulação)',
            unidade: 'Sistema',
            capacidade: CAPACIDADE_PADRAO,
            area: AREA_PADRAO,
            custoBase: CUSTO_BASE_PADRAO
        };
        usouFallbacks = true;
    }
    
    // 3. FLEXIBILIZAÇÃO DE DATA
    // Se data não informada, usar data atual
    let dataEventoObj;
    if (!dataEvento) {
        dataEventoObj = new Date();
        dataEvento = dataEventoObj.toISOString().split('T')[0];
        console.warn('⚠️ Data não informada - usando data atual:', dataEvento);
        mostrarNotificacao('⚠️ Data não informada - usando data atual', 4000);
        usouFallbacks = true;
    } else {
        dataEventoObj = new Date(dataEvento + 'T00:00:00');
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        
        // Log informativo apenas (não bloqueia)
        if (dataEventoObj < hoje) {
            console.info('ℹ️ Data do evento está no passado:', dataEventoObj.toLocaleDateString('pt-BR'));
            console.info('Permitindo registro retroativo para testes/histórico');
        }
    }
    
    // 4. FLEXIBILIZAÇÃO DE DIAS DA SEMANA
    // Coletar dias da semana selecionados
    let diasSelecionados = [];
    const diasIds = ['dia-seg', 'dia-ter', 'dia-qua', 'dia-qui', 'dia-sex', 'dia-sab', 'dia-dom'];
    diasIds.forEach(id => {
        const checkbox = document.getElementById(id);
        if (checkbox && checkbox.checked) {
            diasSelecionados.push(parseInt(checkbox.value));
        }
    });
    
    // Se nenhum dia selecionado, assumir Segunda-feira (value: 1) como padrão
    if (diasSelecionados.length === 0) {
        diasSelecionados = [1]; // Segunda-feira
        console.warn('⚠️ Nenhum dia selecionado - usando Segunda-feira como padrão');
        mostrarNotificacao('⚠️ Nenhum dia selecionado - usando Segunda-feira', 4000);
        usouFallbacks = true;
    }
    
    // 5. VALIDAÇÃO DE HORÁRIOS (mantida mas não interruptiva)
    if (!validarHorarios()) {
        console.warn('⚠️ Horários inválidos - alguns horários podem ter problemas');
        mostrarNotificacao('⚠️ Aviso: Verifique os horários configurados', 4000);
        // Não retornar - continuar com o cálculo
    }
    
    // Calcular total de horas por dia
    const horasPorDia = calcularTotalHorasPorDia();
    
    // Obter IDs dos extras selecionados
    const extrasIds = obterExtrasSelecionados();
    
    // Calcular horas e custos usando o Motor de Cálculo (BudgetEngine)
    const resultado = budgetEngine.calcularValores({
        sala,
        duracao,
        duracaoTipo,
        diasSelecionados,
        horasPorDia,
        margem,
        desconto,
        extrasIds
    });
    
    // Armazenar para exportação (usando dados sanitizados)
    ultimoCalculoRealizado = {
        clienteNome: clienteNomeSanitizado,
        clienteContato: clienteContatoSanitizado,
        sala,
        duracao,
        duracaoTipo,
        diasSelecionados,
        horarios: [...horarios],
        horasPorDia,
        margem,
        desconto,
        resultado,
        dataEvento,
        data: new Date().toLocaleDateString('pt-BR'),
        calculoIncompleto: usouFallbacks  // Marcar se usou fallbacks
    };
    
    // Salvar no histórico
    dataManager.adicionarCalculoHistorico(ultimoCalculoRealizado);
    
    // Atualizar dashboard se estiver inicializado
    if (dashboardController) {
        atualizarDashboard();
    }
    
    // Exibir resultados
    exibirResultados(resultado, usouFallbacks);
    
    mostrarNotificacao('Orçamento calculado com sucesso!');
}

/**
 * Exibe os resultados na interface
 * @param {Object} resultado - Resultado do cálculo
 * @param {boolean} calculoIncompleto - Se true, cálculo usou fallbacks
 */
function exibirResultados(resultado, calculoIncompleto = false) {
    // Valores principais
    document.getElementById('valor-total').textContent = CoreUtils.formatarMoeda(resultado.valorFinal);
    document.getElementById('valor-hora').textContent = CoreUtils.formatarMoeda(resultado.valorPorHora);
    document.getElementById('total-horas').textContent = resultado.horasTotais.toFixed(1);
    
    const sala = dataManager.obterSalaPorId(document.getElementById('espaco').value);
    document.getElementById('custo-hora').textContent = CoreUtils.formatarMoeda(sala.custoBase);
    document.getElementById('economia').textContent = CoreUtils.formatarMoeda(resultado.economia);
    
    // Exibir alertas de viabilidade e classificação de risco
    exibirAlertaViabilidade(resultado, calculoIncompleto);
    
    // Exibir estrutura de custos
    exibirEstruturaCustos(resultado);
    
    // Detalhamento
    document.getElementById('custo-base').textContent = CoreUtils.formatarMoeda(resultado.custoOperacionalBase);
    
    // Informações dos funcionários - Detalhamento completo
    if (resultado.quantidadeFuncionarios > 0 && resultado.detalhamentoFuncionarios) {
        document.getElementById('funcionarios-detalhamento').style.display = 'block';
        document.getElementById('quantidade-funcionarios').textContent = resultado.quantidadeFuncionarios;
        document.getElementById('total-custos-funcionarios').textContent = CoreUtils.formatarMoeda(resultado.totalCustosFuncionarios);
        
        const listaDetalhamento = document.getElementById('funcionarios-detalhamento-lista');
        listaDetalhamento.innerHTML = '';
        
        resultado.detalhamentoFuncionarios.forEach(func => {
            const divFunc = document.createElement('div');
            divFunc.style.cssText = 'padding: 10px; margin-bottom: 10px; background: white; border-radius: 6px; border-left: 3px solid #0ea5e9;';
            divFunc.innerHTML = `
                <div style="font-weight: bold; color: #0c4a6e; margin-bottom: 5px;">${func.nome}</div>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 5px; font-size: 0.85em; color: #6b7280;">
                    <div>⏰ Horas Normais: <strong>${func.horasNormais.toFixed(1)}h</strong></div>
                    <div>💵 Custo: <strong>R$ ${CoreUtils.formatarMoeda(func.custoNormal)}</strong></div>
                    <div>📈 HE 50%: <strong>${func.horasHE50.toFixed(1)}h</strong></div>
                    <div>💵 Custo: <strong>R$ ${CoreUtils.formatarMoeda(func.custoHE50)}</strong></div>
                    <div>📊 HE 100%: <strong>${func.horasHE100.toFixed(1)}h</strong></div>
                    <div>💵 Custo: <strong>R$ ${CoreUtils.formatarMoeda(func.custoHE100)}</strong></div>
                    <div>🎫 Vale Transp.: <strong>R$ ${CoreUtils.formatarMoeda(func.custoVT)}</strong></div>
                    ${func.custoTransApp > 0 ? `<div>🚗 Transp. App: <strong>R$ ${CoreUtils.formatarMoeda(func.custoTransApp)}</strong></div>` : ''}
                    ${func.custoRefeicao > 0 ? `<div>🍽️ Refeição: <strong>R$ ${CoreUtils.formatarMoeda(func.custoRefeicao)}</strong></div>` : ''}
                </div>
                <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb; font-weight: bold; color: #0284c7;">
                    Total do Funcionário: R$ ${CoreUtils.formatarMoeda(func.custoTotal)}
                </div>
            `;
            listaDetalhamento.appendChild(divFunc);
        });
    } else {
        document.getElementById('funcionarios-detalhamento').style.display = 'none';
    }
    
    document.getElementById('mao-obra-normal').textContent = CoreUtils.formatarMoeda(resultado.custoMaoObraNormal);
    document.getElementById('mao-obra-he50').textContent = CoreUtils.formatarMoeda(resultado.custoMaoObraHE50);
    document.getElementById('mao-obra-he100').textContent = CoreUtils.formatarMoeda(resultado.custoMaoObraHE100);
    document.getElementById('vale-transporte').textContent = CoreUtils.formatarMoeda(resultado.custoValeTransporte);
    
    // Transporte por Aplicativo
    if (resultado.custoTransporteApp > 0) {
        document.getElementById('transporte-app-line').style.display = 'flex';
        document.getElementById('transporte-app').textContent = CoreUtils.formatarMoeda(resultado.custoTransporteApp);
    } else {
        document.getElementById('transporte-app-line').style.display = 'none';
    }
    
    // Refeição
    if (resultado.custoRefeicao > 0) {
        document.getElementById('refeicao-line').style.display = 'flex';
        document.getElementById('refeicao').textContent = CoreUtils.formatarMoeda(resultado.custoRefeicao);
    } else {
        document.getElementById('refeicao-line').style.display = 'none';
    }
    
    // Extras
    if (resultado.custoExtras > 0) {
        document.getElementById('extras-line').style.display = 'flex';
        document.getElementById('valor-extras').textContent = CoreUtils.formatarMoeda(resultado.custoExtras);
    } else {
        document.getElementById('extras-line').style.display = 'none';
    }
    
    document.getElementById('subtotal-sem-margem').textContent = CoreUtils.formatarMoeda(resultado.subtotalSemMargem);
    document.getElementById('margem-percent').textContent = resultado.margemPercent.toFixed(0);
    document.getElementById('valor-margem').textContent = CoreUtils.formatarMoeda(resultado.valorMargem);
    document.getElementById('subtotal-com-margem').textContent = CoreUtils.formatarMoeda(resultado.subtotalComMargem);
    document.getElementById('desconto-percent').textContent = resultado.descontoPercent.toFixed(0);
    document.getElementById('valor-desconto').textContent = CoreUtils.formatarMoeda(resultado.valorDesconto);
    document.getElementById('valor-final').textContent = CoreUtils.formatarMoeda(resultado.valorFinal);
    
    // Mostrar botão de enviar para aprovação
    const btnAprovacaoContainer = document.getElementById('btn-aprovacao-container');
    if (btnAprovacaoContainer) {
        btnAprovacaoContainer.style.display = 'block';
    }
}

/**
 * Exibe alerta de viabilidade e classificação de risco
 * Complexidade: O(1) - Operações constantes de cálculo e atualização DOM
 * @param {Object} resultado - Resultado do cálculo
 * @param {boolean} calculoIncompleto - Se true, cálculo usou fallbacks (força ALTO RISCO)
 */
function exibirAlertaViabilidade(resultado, calculoIncompleto = false) {
    const alertDiv = document.getElementById('viability-alert');
    const configBI = dataManager.obterConfiguracoesBI();
    
    if (!configBI.exibirAlertaViabilidade && !configBI.exibirClassificacaoRisco) {
        alertDiv.style.display = 'none';
        return;
    }
    
    // Calcular margem líquida e ponto de equilíbrio
    const margemLiquida = ((resultado.valorFinal - resultado.subtotalSemMargem) / resultado.valorFinal * 100);
    
    // Calcular custos fixos e variáveis
    const custoFixo = resultado.custoOperacionalBase;
    const custoVariavel = resultado.custoMaoObraTotal + resultado.custoValeTransporte + 
                         (resultado.custoTransporteApp || 0) + (resultado.custoRefeicao || 0);
    
    // Margem de contribuição e ponto de equilíbrio
    const margemContribuicao = resultado.valorFinal - custoVariavel;
    const percentualMargemContrib = (margemContribuicao / resultado.valorFinal * 100);
    const pontoEquilibrio = percentualMargemContrib > 0 ? custoFixo / (percentualMargemContrib / 100) : 0;
    
    // Obter classificação de risco centralizada do DataManager (fonte única da verdade)
    const riscoClassificacao = dataManager.calcularClassificacaoRisco(resultado, calculoIncompleto);
    const classificacaoRisco = riscoClassificacao.nivel;
    const corRisco = riscoClassificacao.cor;
    const bgColor = riscoClassificacao.bgColor;
    const borderColor = riscoClassificacao.borderColor;
    const riscoMaoObra = riscoClassificacao.percentual;
    
    // Determinar ícone SVG baseado no nível de risco
    let iconPath;
    if (classificacaoRisco === 'ALTO' || margemLiquida < 0) {
        iconPath = '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>';
    } else if (classificacaoRisco === 'MÉDIO' || margemLiquida < 5) {
        iconPath = '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>';
    } else {
        iconPath = '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>';
    }
    
    // Configurar visual do alerta
    alertDiv.style.display = 'block';
    alertDiv.style.background = bgColor;
    alertDiv.style.borderColor = borderColor;
    
    const iconElement = alertDiv.querySelector('#viability-icon');
    iconElement.innerHTML = iconPath;
    iconElement.style.color = corRisco;
    
    const titleElement = alertDiv.querySelector('#viability-title');
    const messageElement = alertDiv.querySelector('#viability-message');
    
    titleElement.style.color = corRisco;
    messageElement.style.color = corRisco;
    
    // Montar mensagem
    if (calculoIncompleto) {
        // Cálculo incompleto - ALTO RISCO por falta de dados
        titleElement.textContent = '⚠️ ATENÇÃO: Cálculo com Dados Incompletos';
        messageElement.innerHTML = `<strong>Classificação: ALTO RISCO</strong> (dados faltantes preenchidos com valores padrão). Custos variáveis: <strong>${riscoMaoObra.toFixed(1)}%</strong> | Margem líquida: <strong>${margemLiquida.toFixed(2)}%</strong> | Este é um cálculo de <strong>simulação</strong>.`;
    } else if (margemLiquida < 0) {
        titleElement.textContent = '⚠️ ALERTA: Proposta Deficitária!';
        messageElement.innerHTML = `Margem líquida <strong>negativa de ${Math.abs(margemLiquida).toFixed(2)}%</strong>. Este projeto gerará prejuízo. Recomenda-se aumentar a margem ou reduzir o desconto.`;
    } else if (pontoEquilibrio > resultado.valorFinal) {
        titleElement.textContent = '⚠️ ATENÇÃO: Abaixo do Ponto de Equilíbrio';
        messageElement.innerHTML = `O valor final (R$ ${CoreUtils.formatarMoeda(resultado.valorFinal)}) está <strong>abaixo do ponto de equilíbrio</strong> (R$ ${CoreUtils.formatarMoeda(pontoEquilibrio)}). Margem líquida: ${margemLiquida.toFixed(2)}%.`;
    } else {
        titleElement.textContent = `Classificação de Risco: ${classificacaoRisco}`;
        messageElement.innerHTML = `Custos variáveis: <strong>${riscoMaoObra.toFixed(1)}%</strong> da receita | Margem líquida: <strong>${margemLiquida.toFixed(2)}%</strong> | Ponto de equilíbrio: R$ ${CoreUtils.formatarMoeda(pontoEquilibrio)}`;
    }
}

/**
 * Exibe a estrutura de custos em formato visual
 * Complexidade: O(1) - Operações constantes de cálculo e atualização DOM
 */
function exibirEstruturaCustos(resultado) {
    const costDiv = document.getElementById('cost-structure');
    const configBI = dataManager.obterConfiguracoesBI();
    
    if (!configBI.exibirEstruturaCustos) {
        costDiv.style.display = 'none';
        return;
    }
    
    costDiv.style.display = 'block';
    
    // Calcular custos
    const custoFixo = resultado.custoOperacionalBase;
    const custoVariavel = resultado.custoMaoObraTotal + resultado.custoValeTransporte + 
                         (resultado.custoTransporteApp || 0) + (resultado.custoRefeicao || 0);
    const custoExtras = resultado.custoExtras || 0;
    const custoTotal = custoFixo + custoVariavel + custoExtras;
    
    // Calcular percentuais
    const percentualFixo = (custoFixo / custoTotal * 100);
    const percentualVariavel = (custoVariavel / custoTotal * 100);
    const percentualExtras = (custoExtras / custoTotal * 100);
    
    // Atualizar barras
    const barFixed = document.getElementById('cost-bar-fixed');
    const barVariable = document.getElementById('cost-bar-variable');
    const barExtras = document.getElementById('cost-bar-extras');
    
    barFixed.style.width = `${percentualFixo}%`;
    barVariable.style.width = `${percentualVariavel}%`;
    barExtras.style.width = `${percentualExtras}%`;
    
    // Adicionar texto nas barras se houver espaço (>10%)
    if (percentualFixo > 10) {
        barFixed.textContent = `${percentualFixo.toFixed(1)}%`;
    } else {
        barFixed.textContent = '';
    }
    
    if (percentualVariavel > 10) {
        barVariable.textContent = `${percentualVariavel.toFixed(1)}%`;
    } else {
        barVariable.textContent = '';
    }
    
    if (percentualExtras > 10) {
        barExtras.textContent = `${percentualExtras.toFixed(1)}%`;
    } else {
        barExtras.textContent = '';
    }
    
    // Atualizar labels
    document.getElementById('cost-fixed-percent').textContent = `${percentualFixo.toFixed(1)}%`;
    document.getElementById('cost-variable-percent').textContent = `${percentualVariavel.toFixed(1)}%`;
    document.getElementById('cost-extras-percent').textContent = `${percentualExtras.toFixed(1)}%`;
}

/**
 * Exibe alerta de auditoria de dados quando há itens desatualizados
 * @param {Object} relatorio - Relatório de auditoria com itens desatualizados
 */
function exibirAlertaAuditoria(relatorio) {
    const { itensComProblema, itensDesatualizados, limiteDias } = relatorio;
    
    // Construir mensagem detalhada
    const meses = (limiteDias / 30).toFixed(0); // Aproximação: ~3 meses para 90 dias
    let mensagem = `⚠️ ATENÇÃO: Existem ${itensComProblema} custos não atualizados há mais de ${meses} meses (${limiteDias} dias).\n\n`;
    mensagem += 'Para garantir a precisão da margem de lucro, por favor revise os seguintes valores:\n\n';
    
    // Agrupar por tipo
    const porTipo = {
        'Sala': [],
        'Extra': [],
        'Funcionário': []
    };
    
    itensDesatualizados.forEach(item => {
        porTipo[item.tipo].push(item);
    });
    
    // Adicionar detalhes por tipo
    Object.keys(porTipo).forEach(tipo => {
        if (porTipo[tipo].length > 0) {
            mensagem += `${tipo}${porTipo[tipo].length > 1 ? 's' : ''} (${porTipo[tipo].length}):\n`;
            porTipo[tipo].forEach(item => {
                const diasInfo = item.diasDesatualizado !== null 
                    ? `${item.diasDesatualizado} dias` 
                    : 'Nunca atualizado';
                mensagem += `  • ${item.nome} - ${diasInfo}\n`;
            });
            mensagem += '\n';
        }
    });
    
    mensagem += 'Num cenário inflacionário, custos estáticos podem reduzir significativamente a margem de lucro real.';
    
    // Exibir alert
    alert(mensagem);
    
    // Também exibir notificação visual persistente
    mostrarNotificacao(`⚠️ ${itensComProblema} custos desatualizados detectados! Verifique o alerta.`, 8000);
}

/**
 * Exibe oportunidades de renovação de eventos (Radar de Vendas)
 * Identifica clientes que tiveram eventos há 11-12 meses para prospecção ativa
 */
function exibirOportunidadesRenovacao() {
    const oportunidades = dataManager.obterOportunidadesRenovacao();
    
    if (oportunidades.length === 0) {
        return; // Nenhuma oportunidade no momento
    }
    
    // Criar ou atualizar card de oportunidades no topo da página
    let cardOportunidades = document.getElementById('radar-vendas-card');
    
    if (!cardOportunidades) {
        // Criar novo card se não existir
        cardOportunidades = document.createElement('div');
        cardOportunidades.id = 'radar-vendas-card';
        cardOportunidades.style.cssText = `
            margin: 20px 0;
            padding: 20px;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            border-radius: 12px;
            border-left: 6px solid #047857;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            color: white;
        `;
        
        // Inserir no início do container, após o header
        const container = document.querySelector('.container');
        const header = document.querySelector('.header');
        const tabs = document.querySelector('.tabs');
        container.insertBefore(cardOportunidades, tabs);
    }
    
    // Construir conteúdo do card
    let conteudoHTML = `
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 15px;">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                <circle cx="11" cy="11" r="1"/>
            </svg>
            <div style="flex: 1;">
                <h3 style="margin: 0; font-size: 1.3em; font-weight: bold;">🎯 Radar de Vendas</h3>
                <p style="margin: 5px 0 0 0; font-size: 0.95em; opacity: 0.95;">
                    ${oportunidades.length} oportunidade${oportunidades.length > 1 ? 's' : ''} de renovação detectada${oportunidades.length > 1 ? 's' : ''}!
                </p>
            </div>
            <button onclick="fecharRadarVendas()" 
                    style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-weight: bold; transition: all 0.2s;"
                    onmouseover="this.style.background='rgba(255,255,255,0.3)'"
                    onmouseout="this.style.background='rgba(255,255,255,0.2)'">
                Fechar
            </button>
        </div>
        <div style="background: rgba(255, 255, 255, 0.15); border-radius: 8px; padding: 15px; backdrop-filter: blur(10px);">
    `;
    
    // Adicionar cada oportunidade
    oportunidades.forEach((op, index) => {
        if (index < 5) { // Limitar a 5 oportunidades mais relevantes
            const statusBadge = op.convertido 
                ? '<span style="background: #3b82f6; padding: 3px 8px; border-radius: 4px; font-size: 0.8em; margin-left: 8px;">✅ JÁ VENDIDO</span>'
                : '<span style="background: #f59e0b; padding: 3px 8px; border-radius: 4px; font-size: 0.8em; margin-left: 8px;">🔥 LEAD QUENTE</span>';
            
            conteudoHTML += `
                <div style="background: rgba(255, 255, 255, 0.9); color: #1f2937; padding: 12px; margin-bottom: ${index < Math.min(oportunidades.length, 5) - 1 ? '10px' : '0'}; border-radius: 6px; border-left: 4px solid #047857;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                        <strong style="font-size: 1.1em; color: #047857;">👤 ${op.cliente}</strong>
                        ${statusBadge}
                    </div>
                    <div style="font-size: 0.9em; color: #4b5563; line-height: 1.6;">
                        📞 Contato: <strong>${op.contato}</strong><br>
                        🏢 Espaço anterior: <strong>${op.espaco}</strong><br>
                        📅 Data do evento: <strong>${op.dataEvento}</strong> (há ${op.mesesAtras} ${op.mesesAtras === 1 ? 'mês' : 'meses'})<br>
                        💰 Valor anterior: <strong>R$ ${CoreUtils.formatarMoeda(op.valorAnterior)}</strong>
                    </div>
                    ${!op.convertido ? `
                    <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #d1d5db; font-size: 0.85em; color: #047857; font-weight: bold;">
                        💡 Ação sugerida: Contactar para renovação antes que procurem a concorrência!
                    </div>
                    ` : ''}
                </div>
            `;
        }
    });
    
    if (oportunidades.length > 5) {
        conteudoHTML += `
            <div style="text-align: center; margin-top: 10px; color: white; font-size: 0.9em; opacity: 0.9;">
                +${oportunidades.length - 5} oportunidade${oportunidades.length - 5 > 1 ? 's' : ''} adicional${oportunidades.length - 5 > 1 ? 'is' : ''} no histórico
            </div>
        `;
    }
    
    conteudoHTML += '</div>';
    
    cardOportunidades.innerHTML = conteudoHTML;
}

/**
 * Fecha o card de radar de vendas
 */
function fecharRadarVendas() {
    const card = document.getElementById('radar-vendas-card');
    if (card) {
        card.style.display = 'none';
    }
}

/**
 * Alterna a exibição dos detalhes de custos
 * @param {string} type - Tipo de custo: 'fixed', 'variable', 'extras', ou null para fechar
 */
function toggleCostDetail(type) {
    const panel = document.getElementById('cost-detail-panel');
    const titleText = document.getElementById('cost-detail-title-text');
    const titleIcon = document.getElementById('cost-detail-icon');
    const content = document.getElementById('cost-detail-content');
    
    // Remove active class from all bars
    document.getElementById('cost-bar-fixed').classList.remove('cost-bar-active');
    document.getElementById('cost-bar-variable').classList.remove('cost-bar-active');
    document.getElementById('cost-bar-extras').classList.remove('cost-bar-active');
    
    // If clicking the same type or null, close the panel
    if (!type || (panel.style.display === 'block' && panel.dataset.currentType === type)) {
        panel.style.display = 'none';
        panel.dataset.currentType = '';
        return;
    }
    
    // Get the last calculation result
    if (!ultimoCalculoRealizado || !ultimoCalculoRealizado.resultado) {
        console.warn('Nenhum cálculo disponível para exibir detalhes');
        return;
    }
    
    const resultado = ultimoCalculoRealizado.resultado;
    
    // Set the current type
    panel.dataset.currentType = type;
    
    // Populate content based on type
    if (type === 'fixed') {
        document.getElementById('cost-bar-fixed').classList.add('cost-bar-active');
        titleIcon.innerHTML = '<div style="width: 16px; height: 16px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border-radius: 4px;"></div>';
        titleText.textContent = 'Custos Fixos - Operacionais';
        
        content.innerHTML = `
            <div style="padding: 10px 0;">
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                    <span style="color: #6b7280;">💼 Custo Operacional Base</span>
                    <strong style="color: #1f2937;">R$ ${CoreUtils.formatarMoeda(resultado.custoOperacionalBase)}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; margin-top: 8px; background: #f3f4f6; padding: 12px; border-radius: 6px;">
                    <span style="color: #374151; font-weight: 600;">Total de Custos Fixos</span>
                    <strong style="color: #1f2937; font-size: 1.1em;">R$ ${CoreUtils.formatarMoeda(resultado.custoOperacionalBase)}</strong>
                </div>
                <p style="margin-top: 12px; color: #6b7280; font-size: 0.85em; font-style: italic;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle;">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="16" x2="12" y2="12"/>
                        <line x1="12" y1="8" x2="12.01" y2="8"/>
                    </svg>
                    Custos fixos incluem aluguel do espaço, utilidades e despesas operacionais calculadas com base no custo/hora do espaço selecionado.
                </p>
            </div>
        `;
    } else if (type === 'variable') {
        document.getElementById('cost-bar-variable').classList.add('cost-bar-active');
        titleIcon.innerHTML = '<div style="width: 16px; height: 16px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 4px;"></div>';
        titleText.textContent = 'Custos Variáveis - Mão de Obra';
        
        const hasTransporteApp = resultado.custoTransporteApp && resultado.custoTransporteApp > 0;
        const hasRefeicao = resultado.custoRefeicao && resultado.custoRefeicao > 0;
        
        content.innerHTML = `
            <div style="padding: 10px 0;">
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                    <span style="color: #6b7280;">⏰ Mão de Obra - Horas Normais</span>
                    <strong style="color: #1f2937;">R$ ${CoreUtils.formatarMoeda(resultado.custoMaoObraNormal)}</strong>
                </div>
                ${resultado.custoMaoObraHE50 > 0 ? `
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                    <span style="color: #6b7280;">📈 Mão de Obra - HE 50% (Sábado)</span>
                    <strong style="color: #1f2937;">R$ ${CoreUtils.formatarMoeda(resultado.custoMaoObraHE50)}</strong>
                </div>
                ` : ''}
                ${resultado.custoMaoObraHE100 > 0 ? `
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                    <span style="color: #6b7280;">📊 Mão de Obra - HE 100% (Domingo)</span>
                    <strong style="color: #1f2937;">R$ ${CoreUtils.formatarMoeda(resultado.custoMaoObraHE100)}</strong>
                </div>
                ` : ''}
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                    <span style="color: #6b7280;">🎫 Vale Transporte</span>
                    <strong style="color: #1f2937;">R$ ${CoreUtils.formatarMoeda(resultado.custoValeTransporte)}</strong>
                </div>
                ${hasTransporteApp ? `
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                    <span style="color: #6b7280;">🚗 Transporte por Aplicativo</span>
                    <strong style="color: #1f2937;">R$ ${CoreUtils.formatarMoeda(resultado.custoTransporteApp)}</strong>
                </div>
                ` : ''}
                ${hasRefeicao ? `
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                    <span style="color: #6b7280;">🍽️ Refeição</span>
                    <strong style="color: #1f2937;">R$ ${CoreUtils.formatarMoeda(resultado.custoRefeicao)}</strong>
                </div>
                ` : ''}
                <div style="display: flex; justify-content: space-between; padding: 8px 0; margin-top: 8px; background: #fef3c7; padding: 12px; border-radius: 6px;">
                    <span style="color: #92400e; font-weight: 600;">Total de Custos Variáveis</span>
                    <strong style="color: #92400e; font-size: 1.1em;">R$ ${CoreUtils.formatarMoeda(resultado.custoMaoObraTotal + resultado.custoValeTransporte + (resultado.custoTransporteApp || 0) + (resultado.custoRefeicao || 0))}</strong>
                </div>
                <p style="margin-top: 12px; color: #6b7280; font-size: 0.85em; font-style: italic;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle;">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="16" x2="12" y2="12"/>
                        <line x1="12" y1="8" x2="12.01" y2="8"/>
                    </svg>
                    Custos variáveis incluem mão de obra de ${resultado.quantidadeFuncionarios} funcionário(s) com ${resultado.horasTotais.toFixed(1)} horas totais.
                </p>
            </div>
        `;
    } else if (type === 'extras') {
        document.getElementById('cost-bar-extras').classList.add('cost-bar-active');
        titleIcon.innerHTML = '<div style="width: 16px; height: 16px; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); border-radius: 4px;"></div>';
        titleText.textContent = 'Itens Extras Selecionados';
        
        // Get selected extras only when showing extras detail
        const extras = dataManager.obterExtras();
        const selectedExtras = [];
        
        extras.forEach(extra => {
            const checkbox = document.getElementById(`extra-${extra.id}`);
            if (checkbox && checkbox.checked) {
                selectedExtras.push({
                    nome: extra.nome,
                    custoPorHora: extra.custo,
                    custoTotal: extra.custo * resultado.horasTotais
                });
            }
        });
        
        if (selectedExtras.length === 0) {
            content.innerHTML = `
                <div style="padding: 20px; text-align: center; color: #6b7280;">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto 12px; opacity: 0.5;">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="16" x2="12" y2="12"/>
                        <line x1="12" y1="8" x2="12.01" y2="8"/>
                    </svg>
                    <p style="margin: 0;">Nenhum item extra selecionado</p>
                </div>
            `;
        } else {
            let extrasHTML = '<div style="padding: 10px 0;">';
            selectedExtras.forEach((extra, index) => {
                extrasHTML += `
                    <div style="display: flex; justify-content: space-between; align-items: start; padding: 10px 0; ${index < selectedExtras.length - 1 ? 'border-bottom: 1px solid #e5e7eb;' : ''}">
                        <div style="flex: 1;">
                            <div style="color: #374151; font-weight: 500; margin-bottom: 4px;">${extra.nome}</div>
                            <div style="color: #6b7280; font-size: 0.85em;">R$ ${CoreUtils.formatarMoeda(extra.custoPorHora)}/h × ${resultado.horasTotais.toFixed(1)}h</div>
                        </div>
                        <strong style="color: #1f2937;">R$ ${CoreUtils.formatarMoeda(extra.custoTotal)}</strong>
                    </div>
                `;
            });
            extrasHTML += `
                <div style="display: flex; justify-content: space-between; padding: 8px 0; margin-top: 8px; background: #f3e8ff; padding: 12px; border-radius: 6px;">
                    <span style="color: #6b21a8; font-weight: 600;">Total de Itens Extras</span>
                    <strong style="color: #6b21a8; font-size: 1.1em;">R$ ${CoreUtils.formatarMoeda(resultado.custoExtras)}</strong>
                </div>
                <p style="margin-top: 12px; color: #6b7280; font-size: 0.85em; font-style: italic;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle;">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="16" x2="12" y2="12"/>
                        <line x1="12" y1="8" x2="12.01" y2="8"/>
                    </svg>
                    ${selectedExtras.length} item(ns) extra(s) selecionado(s) para ${resultado.horasTotais.toFixed(1)} horas de evento.
                </p>
            </div>`;
            content.innerHTML = extrasHTML;
        }
    }
    
    // Show the panel
    panel.style.display = 'block';
}

// ========== GERENCIAMENTO DE ESPAÇOS ==========

/**
 * Adiciona um novo espaço
 */
function adicionarNovoEspaco() {
    const nome = document.getElementById('novo-espaco-nome').value.trim();
    const unidade = document.getElementById('novo-espaco-unidade').value.trim();
    const capacidade = document.getElementById('novo-espaco-capacidade').value;
    const area = document.getElementById('novo-espaco-area').value;
    
    if (!nome || !unidade || !capacidade || !area) {
        alert('Por favor, preencha todos os campos!');
        return;
    }
    
    const novaSala = {
        nome,
        unidade,
        capacidade: parseInt(capacidade),
        area: parseFloat(area),
        custoBase: 0
    };
    
    dataManager.adicionarSala(novaSala);
    
    // Limpar campos
    document.getElementById('novo-espaco-nome').value = '';
    document.getElementById('novo-espaco-unidade').value = '';
    document.getElementById('novo-espaco-capacidade').value = '';
    document.getElementById('novo-espaco-area').value = '';
    
    // Atualizar interface
    carregarTabelaEspacos();
    carregarSelectEspacos();
    
    mostrarNotificacao('Espaço adicionado com sucesso!');
}

/**
 * Edita um espaço existente
 */
function editarSala(id) {
    const sala = dataManager.obterSalaPorId(id);
    if (!sala) return;
    
    const nome = prompt('Nome do espaço:', sala.nome);
    if (nome === null) return;
    
    const unidade = prompt('Unidade:', sala.unidade);
    if (unidade === null) return;
    
    const capacidade = prompt('Capacidade:', sala.capacidade);
    if (capacidade === null) return;
    
    const area = prompt('Área (m²):', sala.area);
    if (area === null) return;
    
    dataManager.atualizarSala(id, {
        nome: nome.trim(),
        unidade: unidade.trim(),
        capacidade: parseInt(capacidade),
        area: parseFloat(area)
    });
    
    carregarTabelaEspacos();
    carregarSelectEspacos();
    
    mostrarNotificacao('Espaço atualizado com sucesso!');
}

/**
 * Remove um espaço
 */
function removerSala(id) {
    if (!confirm('Deseja realmente remover este espaço?')) {
        return;
    }
    
    dataManager.removerSala(id);
    carregarTabelaEspacos();
    carregarSelectEspacos();
    
    mostrarNotificacao('Espaço removido com sucesso!');
}

// ========== GERENCIAMENTO DE CUSTOS ==========

/**
 * Salva o custo de uma sala específica
 */
function salvarCustoSala(id) {
    const input = document.getElementById(`custo-${id}`);
    const novoCusto = parseFloat(input.value);
    
    if (isNaN(novoCusto) || novoCusto < 0) {
        alert('Por favor, insira um valor válido!');
        return;
    }
    
    dataManager.atualizarSala(id, { custoBase: novoCusto });
    carregarTabelaCustos();
    carregarSelectEspacos();
    
    mostrarNotificacao('Custo atualizado com sucesso!');
}

/**
 * Salva todos os custos de uma vez
 */
function salvarTodosCustos() {
    const salas = dataManager.obterSalas();
    let atualizado = false;
    
    salas.forEach(sala => {
        const input = document.getElementById(`custo-${sala.id}`);
        if (input) {
            const novoCusto = parseFloat(input.value);
            if (!isNaN(novoCusto) && novoCusto >= 0) {
                dataManager.atualizarSala(sala.id, { custoBase: novoCusto });
                atualizado = true;
            }
        }
    });
    
    if (atualizado) {
        carregarSelectEspacos();
        mostrarNotificacao('Todos os custos foram atualizados!');
    }
}

// ========== GERENCIAMENTO DE EXTRAS ==========

/**
 * Adiciona um novo item extra
 */
function adicionarNovoExtra() {
    const nome = document.getElementById('novo-item-nome').value.trim();
    const custo = document.getElementById('novo-item-custo').value;
    
    if (!nome || !custo) {
        alert('Por favor, preencha todos os campos!');
        return;
    }
    
    const novoExtra = {
        nome,
        custo: parseFloat(custo)
    };
    
    dataManager.adicionarExtra(novoExtra);
    
    // Limpar campos
    document.getElementById('novo-item-nome').value = '';
    document.getElementById('novo-item-custo').value = '';
    
    // Atualizar interface
    carregarExtrasConfig();
    carregarExtrasCheckboxes();
    
    mostrarNotificacao('Item extra adicionado com sucesso!');
}

/**
 * Edita um item extra
 */
function editarExtra(id) {
    const extra = dataManager.obterExtraPorId(id);
    if (!extra) return;
    
    const nome = prompt('Nome do item:', extra.nome);
    if (nome === null) return;
    
    const custo = prompt('Custo por hora (R$):', extra.custo);
    if (custo === null) return;
    
    dataManager.atualizarExtra(id, {
        nome: nome.trim(),
        custo: parseFloat(custo)
    });
    
    carregarExtrasConfig();
    carregarExtrasCheckboxes();
    
    mostrarNotificacao('Item extra atualizado com sucesso!');
}

/**
 * Remove um item extra
 */
function removerExtra(id) {
    if (!confirm('Deseja realmente remover este item?')) {
        return;
    }
    
    dataManager.removerExtra(id);
    carregarExtrasConfig();
    carregarExtrasCheckboxes();
    
    mostrarNotificacao('Item extra removido com sucesso!');
}

// ========== GERENCIAMENTO DE FUNCIONÁRIOS ==========

/**
 * Adiciona um novo funcionário
 */
function adicionarNovoFuncionario() {
    const nome = document.getElementById('novo-func-nome').value.trim();
    const horaNormal = document.getElementById('novo-func-normal').value;
    const he50 = document.getElementById('novo-func-he50').value;
    const he100 = document.getElementById('novo-func-he100').value;
    const valeTransporte = document.getElementById('novo-func-vt').value;
    const transporteApp = document.getElementById('novo-func-transporte-app').value || '0';
    const refeicao = document.getElementById('novo-func-refeicao').value || '0';
    const dataEscala = document.getElementById('novo-func-data-escala').value || null;
    
    if (!nome || !horaNormal || !he50 || !he100 || !valeTransporte) {
        alert('Por favor, preencha todos os campos obrigatórios!');
        return;
    }
    
    // Validar valores numéricos
    const horaNormalNum = parseFloat(horaNormal);
    const he50Num = parseFloat(he50);
    const he100Num = parseFloat(he100);
    const valeTransporteNum = parseFloat(valeTransporte);
    const transporteAppNum = parseFloat(transporteApp);
    const refeicaoNum = parseFloat(refeicao);
    
    if (isNaN(horaNormalNum) || isNaN(he50Num) || isNaN(he100Num) || isNaN(valeTransporteNum) || isNaN(transporteAppNum) || isNaN(refeicaoNum)) {
        alert('Por favor, insira valores numéricos válidos!');
        return;
    }
    
    if (horaNormalNum < 0 || he50Num < 0 || he100Num < 0 || valeTransporteNum < 0 || transporteAppNum < 0 || refeicaoNum < 0) {
        alert('Os valores não podem ser negativos!');
        return;
    }
    
    const novoFuncionario = {
        nome,
        horaNormal: horaNormalNum,
        he50: he50Num,
        he100: he100Num,
        valeTransporte: valeTransporteNum,
        transporteApp: transporteAppNum,
        refeicao: refeicaoNum,
        dataEscala: dataEscala
    };
    
    dataManager.adicionarFuncionario(novoFuncionario);
    
    // Limpar campos
    document.getElementById('novo-func-nome').value = '';
    document.getElementById('novo-func-normal').value = '';
    document.getElementById('novo-func-he50').value = '';
    document.getElementById('novo-func-he100').value = '';
    document.getElementById('novo-func-vt').value = '';
    document.getElementById('novo-func-transporte-app').value = '';
    document.getElementById('novo-func-refeicao').value = '';
    document.getElementById('novo-func-data-escala').value = '';
    
    // Atualizar interface
    carregarListaFuncionarios();
    
    mostrarNotificacao('Funcionário adicionado com sucesso!');
}

/**
 * Edita um funcionário existente
 */
function editarFuncionario(id) {
    const func = dataManager.obterFuncionarioPorId(id);
    if (!func) return;
    
    const nome = prompt('Nome do funcionário:', func.nome);
    if (nome === null) return;
    
    const horaNormal = prompt('Hora Normal (R$/h):', func.horaNormal);
    if (horaNormal === null) return;
    
    const he50 = prompt('HE 50% (R$/h):', func.he50);
    if (he50 === null) return;
    
    const he100 = prompt('HE 100% (R$/h):', func.he100);
    if (he100 === null) return;
    
    const valeTransporte = prompt('Vale Transporte (R$/dia):', func.valeTransporte);
    if (valeTransporte === null) return;
    
    const transporteApp = prompt('Transporte por Aplicativo (R$/dia):', func.transporteApp || 0);
    if (transporteApp === null) return;
    
    const refeicao = prompt('Refeição (R$/dia):', func.refeicao || 0);
    if (refeicao === null) return;
    
    // Validar valores numéricos
    const horaNormalNum = parseFloat(horaNormal);
    const he50Num = parseFloat(he50);
    const he100Num = parseFloat(he100);
    const valeTransporteNum = parseFloat(valeTransporte);
    const transporteAppNum = parseFloat(transporteApp);
    const refeicaoNum = parseFloat(refeicao);
    
    if (isNaN(horaNormalNum) || isNaN(he50Num) || isNaN(he100Num) || isNaN(valeTransporteNum) || isNaN(transporteAppNum) || isNaN(refeicaoNum)) {
        alert('Por favor, insira valores numéricos válidos!');
        return;
    }
    
    if (horaNormalNum < 0 || he50Num < 0 || he100Num < 0 || valeTransporteNum < 0 || transporteAppNum < 0 || refeicaoNum < 0) {
        alert('Os valores não podem ser negativos!');
        return;
    }
    
    dataManager.atualizarFuncionario(id, {
        nome: nome.trim(),
        horaNormal: horaNormalNum,
        he50: he50Num,
        he100: he100Num,
        valeTransporte: valeTransporteNum,
        transporteApp: transporteAppNum,
        refeicao: refeicaoNum
    });
    
    carregarListaFuncionarios();
    
    mostrarNotificacao('Funcionário atualizado com sucesso!');
}

/**
 * Remove um funcionário
 */
function removerFuncionario(id) {
    if (!confirm('Deseja realmente remover este funcionário?')) {
        return;
    }
    
    if (dataManager.removerFuncionario(id)) {
        carregarListaFuncionarios();
        mostrarNotificacao('Funcionário removido com sucesso!');
    } else {
        alert('Não é possível remover o único funcionário do sistema!');
    }
}

/**
 * Alterna o estado ativo de um funcionário
 */
function alternarFuncionarioAtivo(id) {
    dataManager.alternarFuncionarioAtivo(id);
    carregarListaFuncionarios();
    const funcionario = dataManager.obterFuncionarioPorId(id);
    if (funcionario && funcionario.ativo) {
        mostrarNotificacao('Funcionário adicionado aos cálculos!');
    } else {
        mostrarNotificacao('Funcionário removido dos cálculos!');
    }
}

// ========== BACKUP E DADOS ==========

/**
 * Exporta os dados como JSON
 */
function exportarDados() {
    const dados = dataManager.exportarDados();
    const blob = new Blob([dados], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cdl-calculadora-backup-${new Date().getTime()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    mostrarNotificacao('Dados exportados com sucesso!');
}

/**
 * Importa dados de um arquivo JSON
 */
function importarDados(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const conteudo = e.target.result;
        if (dataManager.importarDados(conteudo)) {
            // Recarregar toda a interface
            carregarSelectEspacos();
            carregarExtrasCheckboxes();
            carregarTabelaEspacos();
            carregarTabelaCustos();
            carregarExtrasConfig();
            carregarListaFuncionarios();
            
            mostrarNotificacao('Dados importados com sucesso!');
        } else {
            alert('Erro ao importar dados! Verifique o arquivo.');
        }
    };
    reader.readAsText(file);
    
    // Limpar o input para permitir reimportar o mesmo arquivo
    event.target.value = '';
}

/**
 * Reseta os dados para o padrão
 */
function resetarDados() {
    if (!confirm('Deseja realmente restaurar os dados padrão? Todas as alterações serão perdidas!')) {
        return;
    }
    
    dataManager.restaurarPadrao();
    
    // Recarregar toda a interface
    carregarSelectEspacos();
    carregarExtrasCheckboxes();
    carregarTabelaEspacos();
    carregarTabelaCustos();
    carregarExtrasConfig();
    carregarListaFuncionarios();
    
    mostrarNotificacao('Dados restaurados para o padrão!');
}

// ========== EXPORTAÇÃO CSV ==========

/**
 * Exporta o cálculo atual ou histórico em formato CSV
 */
function exportarCSV() {
    if (!ultimoCalculoRealizado) {
        // Tentar exportar histórico
        const csvHistorico = dataManager.exportarHistoricoCSV();
        if (csvHistorico) {
            baixarCSV(csvHistorico, `historico-calculos-${new Date().getTime()}.csv`);
            mostrarNotificacao('Histórico exportado em CSV!');
        } else {
            alert('Nenhum cálculo disponível para exportar!');
        }
        return;
    }
    
    // Perguntar ao usuário o que deseja exportar
    const opcao = confirm('Deseja exportar o cálculo atual?\n\nOK = Cálculo Atual\nCancelar = Histórico Completo');
    
    if (opcao) {
        // Exportar cálculo atual
        const csvAtual = dataManager.exportarCalculoAtualCSV(ultimoCalculoRealizado);
        if (csvAtual) {
            const sala = ultimoCalculoRealizado.sala;
            baixarCSV(csvAtual, `orcamento-${sala.unidade}-${sala.nome}-${new Date().getTime()}.csv`);
            mostrarNotificacao('Orçamento exportado em CSV!');
        }
    } else {
        // Exportar histórico
        const csvHistorico = dataManager.exportarHistoricoCSV();
        if (csvHistorico) {
            baixarCSV(csvHistorico, `historico-calculos-${new Date().getTime()}.csv`);
            mostrarNotificacao('Histórico exportado em CSV!');
        } else {
            alert('Nenhum histórico disponível para exportar!');
        }
    }
}

/**
 * Baixa um arquivo CSV
 * @param {string} conteudoCSV - Conteúdo do CSV
 * @param {string} nomeArquivo - Nome do arquivo
 */
function baixarCSV(conteudoCSV, nomeArquivo) {
    const blob = new Blob(['\ufeff' + conteudoCSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nomeArquivo;
    a.click();
    URL.revokeObjectURL(url);
}

// ========== LOADING OVERLAY ==========

/**
 * Mostra o overlay de carregamento
 */
function mostrarLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.style.display = 'flex';
    }
}

/**
 * Esconde o overlay de carregamento
 */
function esconderLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

/**
 * Wrapper para exportarPDFCliente com loading e atualização de status
 */
async function exportarPDFClienteComLoading() {
    mostrarLoading();
    // Pequeno delay para o overlay aparecer antes do processamento pesado
    await new Promise(resolve => setTimeout(resolve, 100));
    try {
        await exportarPDFCliente();
        
        // Após sucesso do download, atualizar status para ENVIADO_AO_CLIENTE
        if (ultimoCalculoRealizado) {
            const historico = dataManager.obterHistoricoCalculos();
            if (historico.length > 0) {
                // O último cálculo é sempre o primeiro do array (unshift)
                const ultimoId = historico[0].id;
                const statusAtual = historico[0].statusAprovacao || 'AGUARDANDO_APROVACAO';
                
                // Apenas atualizar se estiver em APROVADO_PARA_ENVIO
                if (statusAtual === 'APROVADO_PARA_ENVIO') {
                    try {
                        await dataManager.atualizarStatusOrcamento(ultimoId, 'ENVIADO_AO_CLIENTE');
                        console.log('[SGQ-SECURITY] Orçamento enviado ao cliente - Status atualizado para ENVIADO_AO_CLIENTE');
                        mostrarNotificacao('PDF enviado e status atualizado!');
                        
                        // Atualizar dashboard se estiver inicializado
                        if (dashboardController) {
                            atualizarDashboard();
                        }
                    } catch (error) {
                        console.error('[SGQ-SECURITY] Erro ao atualizar status após envio:', error);
                    }
                }
            }
        }
    } finally {
        esconderLoading();
    }
}

/**
 * Wrapper para exportarPDFSuperintendencia com loading
 */
async function exportarPDFSuperintendenciaComLoading() {
    mostrarLoading();
    // Pequeno delay para o overlay aparecer antes do processamento pesado
    await new Promise(resolve => setTimeout(resolve, 100));
    try {
        exportarPDFSuperintendencia();
    } finally {
        esconderLoading();
    }
}

// ========== EXPORTAÇÃO DE PDF ==========

/**
 * Verifica se há espaço suficiente na página e adiciona nova se necessário
 * @param {jsPDF} doc - Instância do jsPDF
 * @param {number} yAtual - Posição Y atual
 * @param {number} espacoNecessario - Espaço necessário em mm
 * @returns {number} Nova posição Y
 */
function verificarEAdicionarPagina(doc, yAtual, espacoNecessario = 20) {
    if (yAtual + espacoNecessario > 280) {
        doc.addPage();
        return 20;
    }
    return yAtual;
}

/**
 * Exporta PDF versão cliente (proposta comercial)
 */
function exportarPDFCliente() {
    if (!ultimoCalculoRealizado) {
        alert('Por favor, calcule um orçamento primeiro!');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const calculo = ultimoCalculoRealizado;
    const sala = calculo.sala;
    const resultado = calculo.resultado;
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(30, 71, 138);
    doc.text('PROPOSTA DE ORÇAMENTO', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('CDL/UTV - Locação de Espaços para Eventos', 105, 28, { align: 'center' });
    
    // Linha separadora
    doc.setDrawColor(30, 71, 138);
    doc.setLineWidth(0.5);
    doc.line(20, 32, 190, 32);
    
    // Informações do espaço
    let y = 45;
    doc.setFontSize(14);
    doc.setTextColor(30, 71, 138);
    doc.text('Informações do Espaço', 20, y);
    
    y += 8;
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Espaço: ${sala.unidade} - ${sala.nome}`, 20, y);
    y += 6;
    doc.text(`Capacidade: ${sala.capacidade} pessoas`, 20, y);
    y += 6;
    doc.text(`Área: ${sala.area} m²`, 20, y);
    
    // Detalhes do contrato
    y += 12;
    doc.setFontSize(14);
    doc.setTextColor(30, 71, 138);
    doc.text('Detalhes do Contrato', 20, y);
    
    y += 8;
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Duração: ${calculo.duracao} ${calculo.duracaoTipo || 'meses'}`, 20, y);
    y += 6;
    
    const diasNomes = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const diasSelecionadosTexto = calculo.diasSelecionados ? 
        calculo.diasSelecionados.map(d => diasNomes[d]).join(', ') : 
        `${calculo.diasSemana || 0} dias/semana`;
    doc.text(`Dias: ${diasSelecionadosTexto}`, 20, y);
    y += 6;
    
    if (calculo.horarios && calculo.horarios.length > 0) {
        if (calculo.horarios.length === 1) {
            doc.text(`Horário: ${calculo.horarios[0].inicio} às ${calculo.horarios[0].fim} (${calculo.horasPorDia.toFixed(1)}h/dia)`, 20, y);
        } else {
            doc.text(`Horários: ${calculo.horarios.map(h => `${h.inicio}-${h.fim}`).join(', ')} (${calculo.horasPorDia.toFixed(1)}h/dia)`, 20, y);
        }
    } else if (calculo.horarioInicio && calculo.horarioFim) {
        doc.text(`Horário: ${calculo.horarioInicio} às ${calculo.horarioFim} (${calculo.horasPorDia.toFixed(1)}h/dia)`, 20, y);
    } else {
        const turnos = [];
        if (calculo.turnos && calculo.turnos.manha) turnos.push('Manhã');
        if (calculo.turnos && calculo.turnos.tarde) turnos.push('Tarde');
        if (calculo.turnos && calculo.turnos.noite) turnos.push('Noite');
        doc.text(`Turnos: ${turnos.join(', ')}`, 20, y);
    }
    y += 6;
    doc.text(`Total de horas: ${resultado.horasTotais.toFixed(1)}h`, 20, y);
    
    // Valores
    y += 12;
    doc.setFontSize(14);
    doc.setTextColor(30, 71, 138);
    doc.text('Valores', 20, y);
    
    y += 8;
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Valor por hora: R$ ${CoreUtils.formatarMoeda(resultado.valorPorHora)}`, 20, y);
    y += 6;
    doc.text(`Desconto aplicado: ${resultado.descontoPercent.toFixed(0)}%`, 20, y);
    y += 6;
    doc.text(`Economia: R$ ${CoreUtils.formatarMoeda(resultado.economia)}`, 20, y);
    
    // Valor final (destaque)
    y += 15;
    doc.setFillColor(30, 71, 138);
    doc.rect(20, y - 8, 170, 15, 'F');
    
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text(`VALOR TOTAL: R$ ${CoreUtils.formatarMoeda(resultado.valorFinal)}`, 105, y, { align: 'center' });
    
    // Footer
    y = 270;
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('CDL Manaus - Câmara de Dirigentes Lojistas', 105, y, { align: 'center' });
    y += 4;
    doc.text(`Proposta gerada em: ${calculo.data}`, 105, y, { align: 'center' });
    y += 4;
    doc.text('Esta proposta tem validade de 30 dias', 105, y, { align: 'center' });
    
    // Salvar PDF
    doc.save(`proposta-orcamento-${sala.unidade}-${sala.nome}-${new Date().getTime()}.pdf`);
    
    mostrarNotificacao('PDF gerado com sucesso!');
}

/**
 * Exporta PDF versão superintendência (análise detalhada)
 */
function exportarPDFSuperintendencia() {
    if (!ultimoCalculoRealizado) {
        alert('Por favor, calcule um orçamento primeiro!');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const calculo = ultimoCalculoRealizado;
    const sala = calculo.sala;
    const resultado = calculo.resultado;
    
    // Header
    doc.setFontSize(18);
    doc.setTextColor(30, 71, 138);
    doc.text('ANÁLISE FINANCEIRA - SUPERINTENDÊNCIA', 105, 15, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('Relatório Gerencial Detalhado', 105, 22, { align: 'center' });
    
    // Linha separadora
    doc.setDrawColor(30, 71, 138);
    doc.setLineWidth(0.5);
    doc.line(15, 25, 195, 25);
    
    // Informações do espaço
    let y = 35;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('1. DADOS DO ESPAÇO', 15, y);
    
    y += 7;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Espaço: ${sala.unidade} - ${sala.nome}`, 20, y);
    y += 5;
    doc.text(`Capacidade: ${sala.capacidade} pessoas | Área: ${sala.area} m² | Custo base: R$ ${CoreUtils.formatarMoeda(sala.custoBase)}/h`, 20, y);
    
    // Parâmetros do contrato
    y += 10;
    doc.setFont(undefined, 'bold');
    doc.setFontSize(12);
    doc.text('2. PARÂMETROS DO CONTRATO', 15, y);
    
    y += 7;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    
    const diasNomes = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const diasTexto = calculo.diasSelecionados ? 
        calculo.diasSelecionados.map(d => diasNomes[d]).join(', ') : 
        `${calculo.diasSemana || 0} dias/semana`;
    
    doc.text(`Duração: ${calculo.duracao} ${calculo.duracaoTipo || 'meses'} | Dias: ${diasTexto} | Total de horas: ${resultado.horasTotais.toFixed(1)}h`, 20, y);
    y += 5;
    
    if (calculo.horarios && calculo.horarios.length > 0) {
        if (calculo.horarios.length === 1) {
            doc.text(`Horário: ${calculo.horarios[0].inicio} às ${calculo.horarios[0].fim} (${calculo.horasPorDia.toFixed(1)}h/dia)`, 20, y);
        } else {
            doc.text(`Horários: ${calculo.horarios.map(h => `${h.inicio}-${h.fim}`).join(', ')} (${calculo.horasPorDia.toFixed(1)}h/dia)`, 20, y);
        }
    } else if (calculo.horarioInicio && calculo.horarioFim) {
        doc.text(`Horário: ${calculo.horarioInicio} às ${calculo.horarioFim} (${calculo.horasPorDia.toFixed(1)}h/dia)`, 20, y);
    } else if (calculo.turnos) {
        const turnos = [];
        if (calculo.turnos.manha) turnos.push('Manhã');
        if (calculo.turnos.tarde) turnos.push('Tarde');
        if (calculo.turnos.noite) turnos.push('Noite');
        doc.text(`Turnos utilizados: ${turnos.join(', ')}`, 20, y);
    }
    y += 5;
    doc.text(`Margem de lucro: ${resultado.margemPercent.toFixed(0)}% | Desconto: ${resultado.descontoPercent.toFixed(0)}%`, 20, y);
    
    // Detalhamento de custos
    y += 10;
    doc.setFont(undefined, 'bold');
    doc.setFontSize(12);
    doc.text('3. DETALHAMENTO DE CUSTOS', 15, y);
    
    y += 7;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    
    // Tabela de custos
    const custos = [
        ['Custo Operacional Base', `R$ ${CoreUtils.formatarMoeda(resultado.custoOperacionalBase)}`],
        ['Mão de Obra - Horas Normais', `R$ ${CoreUtils.formatarMoeda(resultado.custoMaoObraNormal)}`],
        ['Mão de Obra - HE 50% (Sábado)', `R$ ${CoreUtils.formatarMoeda(resultado.custoMaoObraHE50)}`],
        ['Mão de Obra - HE 100% (Domingo)', `R$ ${CoreUtils.formatarMoeda(resultado.custoMaoObraHE100)}`],
        ['Vale Transporte', `R$ ${CoreUtils.formatarMoeda(resultado.custoValeTransporte)}`]
    ];
    
    // Adicionar transporte por aplicativo se houver
    if (resultado.custoTransporteApp > 0) {
        custos.push(['Transporte por Aplicativo', `R$ ${CoreUtils.formatarMoeda(resultado.custoTransporteApp)}`]);
    }
    
    // Adicionar refeição se houver
    if (resultado.custoRefeicao > 0) {
        custos.push(['Refeição', `R$ ${CoreUtils.formatarMoeda(resultado.custoRefeicao)}`]);
    }
    
    custos.push(['Itens Extras', `R$ ${CoreUtils.formatarMoeda(resultado.custoExtras)}`]);
    
    custos.forEach(([item, valor]) => {
        doc.text(item, 20, y);
        doc.text(valor, 190, y, { align: 'right' });
        y += 5;
    });
    
    // === 3.1. BREAKDOWN DETALHADO - MÃO DE OBRA ===
    if (resultado.detalhamentoFuncionarios && resultado.detalhamentoFuncionarios.length > 0) {
        y += 8;
        y = verificarEAdicionarPagina(doc, y, 25);
        
        doc.setFont(undefined, 'bold');
        doc.setFontSize(11);
        doc.setTextColor(30, 71, 138);
        doc.text('3.1. BREAKDOWN DETALHADO - MÃO DE OBRA', 15, y);
        
        y += 7;
        doc.setFont(undefined, 'normal');
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        
        resultado.detalhamentoFuncionarios.forEach((func, index) => {
            // Verificar espaço para o funcionário completo (precisa ~35mm)
            y = verificarEAdicionarPagina(doc, y, 35);
            
            // Nome do funcionário com fundo cinza claro
            doc.setFillColor(240, 240, 240);
            doc.rect(20, y - 3, 170, 6, 'F');
            doc.setFont(undefined, 'bold');
            doc.setFontSize(10);
            doc.text(`Funcionário ${index + 1}: ${func.nome}`, 22, y);
            
            y += 7;
            doc.setFont(undefined, 'normal');
            doc.setFontSize(9);
            
            // Horas normais
            if (func.horasNormais > 0) {
                doc.text(`• Horas Normais: ${func.horasNormais.toFixed(1)}h`, 25, y);
                doc.text(`R$ ${CoreUtils.formatarMoeda(func.custoNormal)}`, 190, y, { align: 'right' });
                y += 4;
            }
            
            // HE 50% (Sábado)
            if (func.horasHE50 > 0) {
                doc.text(`• HE 50% (Sábado): ${func.horasHE50.toFixed(1)}h`, 25, y);
                doc.text(`R$ ${CoreUtils.formatarMoeda(func.custoHE50)}`, 190, y, { align: 'right' });
                y += 4;
            }
            
            // HE 100% (Domingo)
            if (func.horasHE100 > 0) {
                doc.text(`• HE 100% (Domingo): ${func.horasHE100.toFixed(1)}h`, 25, y);
                doc.text(`R$ ${CoreUtils.formatarMoeda(func.custoHE100)}`, 190, y, { align: 'right' });
                y += 4;
            }
            
            // Vale Transporte
            if (func.custoVT > 0) {
                doc.text(`• Vale Transporte: ${Math.round(resultado.diasTotais)} dias`, 25, y);
                doc.text(`R$ ${CoreUtils.formatarMoeda(func.custoVT)}`, 190, y, { align: 'right' });
                y += 4;
            }
            
            // Transporte por aplicativo
            if (func.custoTransApp > 0) {
                doc.text(`• Transporte por Aplicativo: ${Math.round(resultado.diasTotais)} dias`, 25, y);
                doc.text(`R$ ${CoreUtils.formatarMoeda(func.custoTransApp)}`, 190, y, { align: 'right' });
                y += 4;
            }
            
            // Refeição
            if (func.custoRefeicao > 0) {
                doc.text(`• Refeição: ${Math.round(resultado.diasTotais)} dias`, 25, y);
                doc.text(`R$ ${CoreUtils.formatarMoeda(func.custoRefeicao)}`, 190, y, { align: 'right' });
                y += 4;
            }
            
            // Linha e subtotal do funcionário
            y += 1;
            doc.setDrawColor(200, 200, 200);
            doc.setLineWidth(0.3);
            doc.line(25, y, 190, y);
            y += 4;
            
            doc.setFont(undefined, 'bold');
            doc.text(`Subtotal ${func.nome}:`, 25, y);
            doc.text(`R$ ${CoreUtils.formatarMoeda(func.custoTotal)}`, 190, y, { align: 'right' });
            
            y += 7;
            doc.setFont(undefined, 'normal');
        });
    }
    
    y += 3;
    doc.setDrawColor(0, 0, 0);
    doc.line(20, y, 190, y);
    y += 5;
    
    doc.setFont(undefined, 'bold');
    doc.text('SUBTOTAL (sem margem)', 20, y);
    doc.text(`R$ ${CoreUtils.formatarMoeda(resultado.subtotalSemMargem)}`, 190, y, { align: 'right' });
    
    y += 7;
    doc.setFont(undefined, 'normal');
    doc.text(`Margem de Lucro (${resultado.margemPercent.toFixed(0)}%)`, 20, y);
    doc.text(`R$ ${CoreUtils.formatarMoeda(resultado.valorMargem)}`, 190, y, { align: 'right' });
    
    y += 5;
    doc.setFont(undefined, 'bold');
    doc.text('SUBTOTAL (com margem)', 20, y);
    doc.text(`R$ ${CoreUtils.formatarMoeda(resultado.subtotalComMargem)}`, 190, y, { align: 'right' });
    
    y += 7;
    doc.setFont(undefined, 'normal');
    doc.text(`Desconto (${resultado.descontoPercent.toFixed(0)}%)`, 20, y);
    doc.text(`- R$ ${CoreUtils.formatarMoeda(resultado.valorDesconto)}`, 190, y, { align: 'right' });
    
    y += 5;
    doc.setDrawColor(30, 71, 138);
    doc.setLineWidth(1);
    doc.line(20, y, 190, y);
    
    // Valor final destacado
    y += 7;
    doc.setFillColor(30, 71, 138);
    doc.rect(15, y - 5, 180, 10, 'F');
    
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('VALOR FINAL', 20, y);
    doc.text(`R$ ${CoreUtils.formatarMoeda(resultado.valorFinal)}`, 190, y, { align: 'right' });
    
    // Indicadores financeiros
    y += 15;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text('4. INDICADORES FINANCEIROS', 15, y);
    
    y += 7;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    
    const margemLiquida = ((resultado.valorFinal - resultado.subtotalSemMargem) / resultado.valorFinal * 100).toFixed(2);
    const custoHoraFinal = resultado.valorPorHora;
    const markup = ((resultado.subtotalComMargem / resultado.subtotalSemMargem - 1) * 100).toFixed(2);
    
    doc.text(`• Valor por hora: R$ ${CoreUtils.formatarMoeda(custoHoraFinal)}`, 20, y);
    y += 5;
    doc.text(`• Margem líquida: ${margemLiquida}%`, 20, y);
    y += 5;
    doc.text(`• Markup aplicado: ${markup}%`, 20, y);
    y += 5;
    doc.text(`• Economia total para cliente: R$ ${CoreUtils.formatarMoeda(resultado.economia)}`, 20, y);
    
    // === 5. ANÁLISE DE VIABILIDADE ===
    y += 12;
    y = verificarEAdicionarPagina(doc, y, 50);
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(30, 71, 138);
    doc.text('5. ANÁLISE DE VIABILIDADE', 15, y);
    
    y += 7;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(0, 0, 0);
    
    // Calcular custos fixos e variáveis
    const custoFixo = resultado.custoOperacionalBase;
    const custoVariavel = resultado.custoMaoObraTotal + resultado.custoValeTransporte + 
                          resultado.custoTransporteApp + resultado.custoRefeicao;
    const custoTotal = custoFixo + custoVariavel + resultado.custoExtras;
    const percentualFixo = (custoFixo / custoTotal * 100);
    const percentualVariavel = (custoVariavel / custoTotal * 100);
    
    // Margem de contribuição
    const margemContribuicao = resultado.valorFinal - custoVariavel;
    const percentualMargemContrib = (margemContribuicao / resultado.valorFinal * 100);
    
    // Ponto de equilíbrio (evitar divisão por zero)
    const pontoEquilibrio = percentualMargemContrib > 0 ? custoFixo / (percentualMargemContrib / 100) : 0;
    
    // Obter classificação de risco centralizada do DataManager
    const riscoClassificacao = dataManager.calcularClassificacaoRisco(resultado);
    const riscoMaoObra = riscoClassificacao.percentual;
    const classificacaoRisco = riscoClassificacao.nivel;
    
    // Converter cores hex para RGB para jsPDF
    let corRisco = [0, 0, 0];
    if (classificacaoRisco === 'ALTO') {
        corRisco = [220, 38, 38]; // Vermelho
    } else if (classificacaoRisco === 'MÉDIO') {
        corRisco = [234, 179, 8]; // Amarelo
    } else {
        corRisco = [34, 197, 94]; // Verde
    }
    
    // Exibir análise
    doc.setFont(undefined, 'bold');
    doc.text('Estrutura de Custos:', 20, y);
    y += 6;
    
    doc.setFont(undefined, 'normal');
    doc.text(`• Custos Fixos (Operacional): R$ ${CoreUtils.formatarMoeda(custoFixo)} (${percentualFixo.toFixed(1)}%)`, 25, y);
    y += 5;
    doc.text(`• Custos Variáveis (Pessoal): R$ ${CoreUtils.formatarMoeda(custoVariavel)} (${percentualVariavel.toFixed(1)}%)`, 25, y);
    y += 5;
    doc.text(`• Custos Extras: R$ ${CoreUtils.formatarMoeda(resultado.custoExtras)} (${(resultado.custoExtras/custoTotal*100).toFixed(1)}%)`, 25, y);
    
    y += 8;
    doc.setFont(undefined, 'bold');
    doc.text('Indicadores de Viabilidade:', 20, y);
    y += 6;
    
    doc.setFont(undefined, 'normal');
    doc.text(`• Margem de Contribuição: R$ ${CoreUtils.formatarMoeda(margemContribuicao)} (${percentualMargemContrib.toFixed(1)}%)`, 25, y);
    y += 5;
    doc.text(`• Ponto de Equilíbrio: R$ ${CoreUtils.formatarMoeda(pontoEquilibrio)}`, 25, y);
    
    y += 8;
    doc.setFont(undefined, 'bold');
    doc.text('Análise de Risco Operacional:', 20, y);
    y += 6;
    
    doc.setFont(undefined, 'normal');
    doc.text(`• Percentual de Custos Variáveis sobre Receita: ${riscoMaoObra.toFixed(1)}%`, 25, y);
    y += 5;
    
    // Classificação de risco com cor
    doc.setFont(undefined, 'bold');
    doc.setTextColor(corRisco[0], corRisco[1], corRisco[2]);
    doc.text(`• Classificação de Risco: ${classificacaoRisco}`, 25, y);
    
    y += 5;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('(Alto: >60% | Médio: 40-60% | Baixo: <40%)', 27, y);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    
    // Observações
    y += 12;
    y = verificarEAdicionarPagina(doc, y, 25);
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(30, 71, 138);
    doc.text('6. OBSERVAÇÕES', 15, y);
    
    y += 7;
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text('• Valores calculados considerando multiplicadores de turno (manhã 1.0x, tarde 1.15x, noite 1.40x)', 20, y);
    y += 4;
    doc.text('• Custos de mão de obra incluem horas normais e extras conforme dias da semana', 20, y);
    y += 4;
    doc.text('• Vale transporte calculado por dia trabalhado', 20, y);
    y += 4;
    doc.text('• Esta análise é de uso interno e confidencial', 20, y);
    
    // === APROVAÇÃO GERENCIAL ===
    y += 15;
    y = verificarEAdicionarPagina(doc, y, 40);
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(30, 71, 138);
    doc.text('APROVAÇÃO GERENCIAL', 15, y);
    
    y += 10;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    
    // Três caixas de assinatura lado a lado
    const boxWidth = 55;
    const boxHeight = 20;
    const boxSpacing = 5;
    const startX = 15;
    
    // Caixa 1: Analista Responsável
    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(0.3);
    doc.rect(startX, y, boxWidth, boxHeight);
    
    doc.setFont(undefined, 'bold');
    doc.setFontSize(9);
    doc.text('Analista Responsável', startX + 2, y + 5);
    
    doc.setFont(undefined, 'normal');
    doc.setFontSize(8);
    doc.setDrawColor(150, 150, 150);
    doc.line(startX + 2, y + 13, startX + boxWidth - 2, y + 13);
    doc.text('Assinatura', startX + 2, y + 16);
    doc.text('Data: ___/___/______', startX + 2, y + 19);
    
    // Caixa 2: Coordenação
    const box2X = startX + boxWidth + boxSpacing;
    doc.setDrawColor(100, 100, 100);
    doc.rect(box2X, y, boxWidth, boxHeight);
    
    doc.setFont(undefined, 'bold');
    doc.setFontSize(9);
    doc.text('Coordenação', box2X + 2, y + 5);
    
    doc.setFont(undefined, 'normal');
    doc.setFontSize(8);
    doc.setDrawColor(150, 150, 150);
    doc.line(box2X + 2, y + 13, box2X + boxWidth - 2, y + 13);
    doc.text('Assinatura', box2X + 2, y + 16);
    doc.text('Data: ___/___/______', box2X + 2, y + 19);
    
    // Caixa 3: Superintendência
    const box3X = box2X + boxWidth + boxSpacing;
    doc.setDrawColor(100, 100, 100);
    doc.rect(box3X, y, boxWidth, boxHeight);
    
    doc.setFont(undefined, 'bold');
    doc.setFontSize(9);
    doc.text('Superintendência', box3X + 2, y + 5);
    
    doc.setFont(undefined, 'normal');
    doc.setFontSize(8);
    doc.setDrawColor(150, 150, 150);
    doc.line(box3X + 2, y + 13, box3X + boxWidth - 2, y + 13);
    doc.text('Assinatura', box3X + 2, y + 16);
    doc.text('Data: ___/___/______', box3X + 2, y + 19);
    
    // Footer
    y = 280;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('CDL Manaus - Superintendência', 105, y, { align: 'center' });
    y += 3;
    doc.text(`Relatório gerado em: ${calculo.data}`, 105, y, { align: 'center' });
    y += 3;
    doc.text('DOCUMENTO CONFIDENCIAL - USO INTERNO', 105, y, { align: 'center' });
    
    // Salvar PDF
    doc.save(`analise-financeira-${sala.unidade}-${sala.nome}-${new Date().getTime()}.pdf`);
    
    mostrarNotificacao('PDF gerencial gerado com sucesso!');
}

/**
 * Imprime o orçamento (versão cliente)
 */
function imprimirOrcamento() {
    if (!ultimoCalculoRealizado) {
        alert('Por favor, calcule um orçamento primeiro!');
        return;
    }
    
    // Preparar conteúdo para impressão
    const printSection = document.getElementById('print-section');
    const calculo = ultimoCalculoRealizado;
    const sala = calculo.sala;
    const resultado = calculo.resultado;
    
    const diasNomes = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const diasSelecionadosTexto = calculo.diasSelecionados ? 
        calculo.diasSelecionados.map(d => diasNomes[d]).join(', ') : 
        `${calculo.diasSemana || 0} dias/semana`;
    
    let horarioTexto = '';
    if (calculo.horarios && calculo.horarios.length > 0) {
        if (calculo.horarios.length === 1) {
            horarioTexto = `<tr><td>Horário:</td><td>${calculo.horarios[0].inicio} às ${calculo.horarios[0].fim} (${calculo.horasPorDia.toFixed(1)}h/dia)</td></tr>`;
        } else {
            horarioTexto = `<tr><td>Horários:</td><td>${calculo.horarios.map(h => `${h.inicio}-${h.fim}`).join(', ')} (${calculo.horasPorDia.toFixed(1)}h/dia)</td></tr>`;
        }
    } else if (calculo.horarioInicio && calculo.horarioFim) {
        horarioTexto = `<tr><td>Horário:</td><td>${calculo.horarioInicio} às ${calculo.horarioFim} (${calculo.horasPorDia.toFixed(1)}h/dia)</td></tr>`;
    } else if (calculo.turnos) {
        const turnos = [];
        if (calculo.turnos.manha) turnos.push('Manhã');
        if (calculo.turnos.tarde) turnos.push('Tarde');
        if (calculo.turnos.noite) turnos.push('Noite');
        horarioTexto = `<tr><td>Turnos:</td><td>${turnos.join(', ')}</td></tr>`;
    }
    
    printSection.innerHTML = `
        <div class="pdf-content">
            <div class="pdf-header">
                <h1>🏢 PROPOSTA DE ORÇAMENTO</h1>
                <p>CDL/UTV - Locação de Espaços para Eventos</p>
            </div>
            
            <div class="pdf-section">
                <h2>Informações do Espaço</h2>
                <table class="pdf-table">
                    <tr><td>Espaço:</td><td>${sala.unidade} - ${sala.nome}</td></tr>
                    <tr><td>Capacidade:</td><td>${sala.capacidade} pessoas</td></tr>
                    <tr><td>Área:</td><td>${sala.area} m²</td></tr>
                </table>
            </div>
            
            <div class="pdf-section">
                <h2>Detalhes do Contrato</h2>
                <table class="pdf-table">
                    <tr><td>Duração:</td><td>${calculo.duracao} ${calculo.duracaoTipo || 'meses'}</td></tr>
                    <tr><td>Dias:</td><td>${diasSelecionadosTexto}</td></tr>
                    ${horarioTexto}
                    <tr><td>Total de horas:</td><td>${resultado.horasTotais.toFixed(1)}h</td></tr>
                </table>
            </div>
            
            <div class="pdf-section">
                <h2>Valores</h2>
                <table class="pdf-table">
                    <tr><td>Valor por hora:</td><td>R$ ${CoreUtils.formatarMoeda(resultado.valorPorHora)}</td></tr>
                    <tr><td>Desconto aplicado:</td><td>${resultado.descontoPercent.toFixed(0)}%</td></tr>
                    <tr><td>Economia:</td><td>R$ ${CoreUtils.formatarMoeda(resultado.economia)}</td></tr>
                    <tr style="font-size: 1.2em; font-weight: bold; background: #f3f4f6;">
                        <td>VALOR TOTAL:</td>
                        <td>R$ ${CoreUtils.formatarMoeda(resultado.valorFinal)}</td>
                    </tr>
                </table>
            </div>
            
            <div class="pdf-footer">
                <p><strong>CDL Manaus - Câmara de Dirigentes Lojistas</strong></p>
                <p>Proposta gerada em: ${calculo.data}</p>
                <p>Esta proposta tem validade de 30 dias</p>
            </div>
        </div>
    `;
    
    // Exibir e imprimir
    printSection.style.display = 'block';
    window.print();
    printSection.style.display = 'none';
}

// ========== HISTÓRICO & CONVERSÃO ==========

/**
 * Alterna o modo de visualização do histórico entre Convertidos e Pipeline Total
 */
function alternarModoVisualizacao() {
    const toggleCheckbox = document.getElementById('toggle-view-mode');
    const toggleLabel = document.getElementById('toggle-label');
    const viewDescription = document.getElementById('view-description');
    
    if (toggleCheckbox.checked) {
        // Modo Pipeline Total (todas as oportunidades)
        modoVisualizacaoHistorico = 'pipeline';
        toggleLabel.innerHTML = '📊 Pipeline Total (Oportunidades)';
        viewDescription.textContent = 'Mostrando todas as oportunidades (vendas efetivadas + em negociação). Desative para ver apenas Convertidos.';
    } else {
        // Modo Convertidos (apenas vendas reais)
        modoVisualizacaoHistorico = 'convertidos';
        toggleLabel.innerHTML = '💰 Convertidos (Vendas Reais)';
        viewDescription.textContent = 'Mostrando apenas vendas efetivadas (Caixa Real). Ative o toggle para ver Pipeline Total (Oportunidades).';
    }
    
    // Recarregar a tabela com o novo filtro
    carregarTabelaHistorico();
    
    // Notificar usuário
    const mensagem = modoVisualizacaoHistorico === 'convertidos' 
        ? '💰 Visualização: Convertidos (Vendas Reais)'
        : '📊 Visualização: Pipeline Total (Todas Oportunidades)';
    mostrarNotificacao(mensagem);
}

/**
 * Atualiza o contador de registros exibidos no histórico
 * @param {number} exibidos - Número de registros sendo exibidos
 * @param {number} total - Número total de registros
 */
function atualizarContadorHistorico(exibidos, total) {
    const contadorElement = document.getElementById('contador-historico');
    if (!contadorElement) return;
    
    if (modoVisualizacaoHistorico === 'convertidos') {
        const percentage = total > 0 ? ((exibidos / total) * 100).toFixed(1) : 0;
        contadorElement.innerHTML = `Exibindo <strong>${exibidos}</strong> de ${total} orçamentos (<strong>${percentage}%</strong> de conversão)`;
    } else {
        contadorElement.innerHTML = `Exibindo todos os <strong>${total}</strong> orçamentos (pipeline completo)`;
    }
}

/**
 * Carrega a tabela de histórico de orçamentos
 * Agora com filtro por modo de visualização (convertidos vs pipeline total)
 */
function carregarTabelaHistorico() {
    const tbody = document.getElementById('historico-body');
    const historico = dataManager.obterHistoricoCalculos();
    const divVazio = document.getElementById('historico-vazio');
    
    // Limpar tabela
    tbody.innerHTML = '';
    
    // Aplicar filtro baseado no modo de visualização
    let historicoFiltrado = historico;
    if (modoVisualizacaoHistorico === 'convertidos') {
        // Filtrar apenas os convertidos (vendidos)
        historicoFiltrado = historico.filter(calc => calc.convertido === true);
    }
    // Se modo é 'pipeline', mostra todos (não aplica filtro)
    
    // Atualizar contador de registros exibidos
    atualizarContadorHistorico(historicoFiltrado.length, historico.length);
    
    if (historicoFiltrado.length === 0) {
        divVazio.style.display = 'block';
        
        // Mensagem customizada baseada no modo
        const emptyMessage = divVazio.querySelector('p:last-child');
        if (modoVisualizacaoHistorico === 'convertidos') {
            emptyMessage.textContent = 'Nenhuma venda convertida ainda. Marque orçamentos como "Vendido" para aparecerem aqui.';
        } else {
            emptyMessage.textContent = 'Calcule orçamentos na aba "Calculadora" para começar a coletar dados';
        }
        
        return;
    }
    
    divVazio.style.display = 'none';
    
    historicoFiltrado.forEach(calc => {
        const tr = document.createElement('tr');
        
        // Data
        const dataFormatada = new Date(calc.data).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Espaço
        const espaco = `${calc.sala.unidade} - ${calc.sala.nome}`;
        
        // Valor Final
        const valorFinal = `R$ ${CoreUtils.formatarMoeda(calc.valorFinal)}`;
        
        // Margem Líquida
        const margemLiquida = `${calc.margemLiquida.toFixed(2)}%`;
        
        // Classificação de Risco com cor
        let corRisco = '';
        let bgRisco = '';
        if (calc.classificacaoRisco === 'ALTO') {
            corRisco = '#dc2626';
            bgRisco = '#fee2e2';
        } else if (calc.classificacaoRisco === 'MÉDIO') {
            corRisco = '#d97706';
            bgRisco = '#fef3c7';
        } else {
            corRisco = '#16a34a';
            bgRisco = '#dcfce7';
        }
        
        const risco = `<span style="background: ${bgRisco}; color: ${corRisco}; padding: 4px 8px; border-radius: 4px; font-size: 0.85em; font-weight: bold;">${calc.classificacaoRisco}</span>`;
        
        // Botão de conversão
        // Garantir compatibilidade com dados antigos que não possuem o campo convertido
        const convertido = calc.convertido === true;
        const btnClass = convertido ? 'btn-success' : 'btn-secondary';
        const btnText = convertido ? '✅ Vendido' : 'Marcar Venda';
        const btnStyle = convertido ? 'background: #10b981; color: white;' : 'background: #6b7280; color: white;';
        
        const btnAcao = `<button class="btn-small ${btnClass}" onclick="alternarStatusVenda(${calc.id})" style="${btnStyle}">${btnText}</button>`;
        
        tr.innerHTML = `
            <td>${dataFormatada}</td>
            <td><strong>${espaco}</strong></td>
            <td>${valorFinal}</td>
            <td>${margemLiquida}</td>
            <td>${risco}</td>
            <td>${btnAcao}</td>
        `;
        
        tbody.appendChild(tr);
    });
}

/**
 * Alterna o status de venda de um orçamento
 * @param {number} id - ID do registro no histórico
 */
function alternarStatusVenda(id) {
    const historico = dataManager.obterHistoricoCalculos();
    const registro = historico.find(calc => calc.id === id);
    
    if (!registro) {
        alert('Registro não encontrado!');
        return;
    }
    
    // Alternar status (garantir compatibilidade com dados antigos)
    const novoStatus = !(registro.convertido === true);
    
    if (dataManager.atualizarConversao(id, novoStatus)) {
        carregarTabelaHistorico();
        
        // Atualizar dashboard se estiver inicializado
        if (dashboardController) {
            atualizarDashboard();
        }
        
        if (novoStatus) {
            mostrarNotificacao('✅ Orçamento marcado como VENDIDO!');
        } else {
            mostrarNotificacao('Orçamento desmarcado como venda');
        }
    } else {
        alert('Erro ao atualizar status de conversão!');
    }
}

/**
 * Exporta o dataset otimizado para Machine Learning
 */
function exportarDatasetML() {
    const csvML = dataManager.exportarDatasetML();
    
    if (csvML) {
        baixarCSV(csvML, `dataset-ml-regressao-logistica-${new Date().getTime()}.csv`);
        mostrarNotificacao('Dataset ML exportado com sucesso! Pronto para análise de Regressão Logística.');
    } else {
        alert('Nenhum histórico disponível para exportar!\n\nPor favor, calcule alguns orçamentos primeiro para gerar o dataset.');
    }
}

/**
 * Exporta o dataset para análise de BI
 */
function exportarDatasetBI() {
    const csvHistorico = dataManager.exportarHistoricoCSV();
    
    if (csvHistorico) {
        baixarCSV(csvHistorico, `dataset-bi-orcamentos-${new Date().getTime()}.csv`);
        mostrarNotificacao('Dataset exportado para análise de BI!');
    } else {
        alert('Nenhum histórico disponível para exportar!');
    }
}

/**
 * Limpa o histórico com confirmação
 */
function limparHistoricoConfirmacao() {
    if (!confirm('⚠️ ATENÇÃO: Esta ação irá apagar todo o histórico de orçamentos!\n\nDeseja realmente continuar? Esta ação não pode ser desfeita.')) {
        return;
    }
    
    if (dataManager.limparHistoricoCalculos()) {
        carregarTabelaHistorico();
        mostrarNotificacao('Histórico limpo com sucesso!');
    } else {
        alert('Erro ao limpar histórico!');
    }
}

// ========== FIM DO APP.JS ==========
