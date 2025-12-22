/* =================================================================
   APP.JS - CALCULADORA DE ORÇAMENTO CDL/UTV v5.0
   Lógica principal da aplicação, cálculos e interface do usuário
   ================================================================= */

// ========== VARIÁVEIS GLOBAIS ==========
let ultimoCalculoRealizado = null;
let horariosCount = 0;
let horarios = [];

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
    
    mostrarNotificacao('Sistema carregado com sucesso!');
}

// ========== NAVEGAÇÃO POR ABAS ==========

/**
 * Configura o sistema de navegação por abas
 */
function configurarNavegacaoAbas() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.dataset.tab;
            
            // Remove active de todos os botões e conteúdos
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Adiciona active ao botão e conteúdo selecionado
            this.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
            
            // Atualiza tabelas se necessário
            if (targetTab === 'spaces') {
                carregarTabelaEspacos();
            } else if (targetTab === 'costs') {
                carregarTabelaCustos();
            } else if (targetTab === 'config') {
                carregarExtrasConfig();
                carregarListaFuncionarios();
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
        <div style="margin: 4px 0;">Custo Base: R$ ${formatarMoeda(sala.custoBase)}/h</div>
        <br>
        <strong>Valores por Turno:</strong><br>
        <div style="margin: 4px 0;">Manhã: R$ ${formatarMoeda(sala.custoBase * multiplicadores.manha)}/h (×${multiplicadores.manha})</div>
        <div style="margin: 4px 0;">Tarde: R$ ${formatarMoeda(sala.custoBase * multiplicadores.tarde)}/h (×${multiplicadores.tarde})</div>
        <div style="margin: 4px 0;">Noite: R$ ${formatarMoeda(sala.custoBase * multiplicadores.noite)}/h (×${multiplicadores.noite})</div>
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
            <label for="extra-${extra.id}">${extra.nome} (+R$ ${formatarMoeda(extra.custo)}/h)</label>
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
 * Converte horário em formato HH:MM para minutos
 */
function parseTimeToMinutes(timeString) {
    const [hora, minuto] = timeString.split(':').map(Number);
    return hora * 60 + minuto;
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
        const minutosInicio = parseTimeToMinutes(horario.inicio);
        const minutosFim = parseTimeToMinutes(horario.fim);
        
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
        const minutosInicio = parseTimeToMinutes(horario.inicio);
        const minutosFim = parseTimeToMinutes(horario.fim);
        
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
            <td>R$ ${formatarMoeda(sala.custoBase * multiplicadores.manha)}</td>
            <td>R$ ${formatarMoeda(sala.custoBase * multiplicadores.tarde)}</td>
            <td>R$ ${formatarMoeda(sala.custoBase * multiplicadores.noite)}</td>
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
                <span style="color: #6b7280;">R$ ${formatarMoeda(extra.custo)}/h</span>
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
                        <div>Hora Normal: <strong>R$ ${formatarMoeda(func.horaNormal)}</strong></div>
                        <div>HE 50%: <strong>R$ ${formatarMoeda(func.he50)}</strong></div>
                        <div>HE 100%: <strong>R$ ${formatarMoeda(func.he100)}</strong></div>
                        <div>Vale Transporte: <strong>R$ ${formatarMoeda(func.valeTransporte)}</strong></div>
                        <div>Transporte App: <strong>R$ ${formatarMoeda(func.transporteApp || 0)}</strong></div>
                        <div>Refeição: <strong>R$ ${formatarMoeda(func.refeicao || 0)}</strong></div>
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
 * Calcula o orçamento completo
 */
function calcularOrcamento() {
    // Coletar dados do formulário
    const salaId = document.getElementById('espaco').value;
    const duracao = parseInt(document.getElementById('duracao').value);
    const duracaoTipo = document.getElementById('duracao-tipo').value;
    const margem = parseFloat(document.getElementById('margem').value) / 100;
    const desconto = parseFloat(document.getElementById('desconto').value) / 100;
    
    // Validações
    if (!salaId) {
        alert('Por favor, selecione um espaço!');
        return;
    }
    
    const sala = dataManager.obterSalaPorId(salaId);
    if (!sala) {
        alert('Espaço não encontrado!');
        return;
    }
    
    // Coletar dias da semana selecionados
    const diasSelecionados = [];
    const diasIds = ['dia-seg', 'dia-ter', 'dia-qua', 'dia-qui', 'dia-sex', 'dia-sab', 'dia-dom'];
    diasIds.forEach(id => {
        const checkbox = document.getElementById(id);
        if (checkbox && checkbox.checked) {
            diasSelecionados.push(parseInt(checkbox.value));
        }
    });
    
    if (diasSelecionados.length === 0) {
        alert('Por favor, selecione pelo menos um dia da semana!');
        return;
    }
    
    // Validar horários
    if (!validarHorarios()) {
        alert('Verifique os horários! Cada horário de início deve ser anterior ao horário de fim.');
        return;
    }
    
    // Calcular total de horas por dia
    const horasPorDia = calcularTotalHorasPorDia();
    
    // Calcular horas e custos
    const resultado = calcularValores(sala, duracao, duracaoTipo, diasSelecionados, horasPorDia, margem, desconto);
    
    // Armazenar para exportação
    ultimoCalculoRealizado = {
        sala,
        duracao,
        duracaoTipo,
        diasSelecionados,
        horarios: [...horarios],
        horasPorDia,
        margem,
        desconto,
        resultado,
        data: new Date().toLocaleDateString('pt-BR')
    };
    
    // Salvar no histórico
    dataManager.adicionarCalculoHistorico(ultimoCalculoRealizado);
    
    // Exibir resultados
    exibirResultados(resultado);
    
    mostrarNotificacao('Orçamento calculado com sucesso!');
}

/**
 * Realiza todos os cálculos do orçamento
 * 
 * Complexidade Algoritmica: O(d + f) onde:
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
 * @param {Object} sala - Dados da sala/espaço
 * @param {number} duracao - Duração do contrato
 * @param {string} duracaoTipo - Tipo: 'dias' ou 'meses'
 * @param {Array<number>} diasSelecionados - Array com dias da semana (0-6)
 * @param {number} horasPorDia - Horas por dia de trabalho
 * @param {number} margem - Margem de lucro (0-1, ex: 0.20 = 20%)
 * @param {number} desconto - Desconto (0-1, ex: 0.10 = 10%)
 * @returns {Object} Resultado dos cálculos
 */
function calcularValores(sala, duracao, duracaoTipo, diasSelecionados, horasPorDia, margem, desconto) {
    const funcionariosAtivos = dataManager.obterFuncionariosAtivos();
    const multiplicadores = dataManager.obterMultiplicadoresTurno();
    
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
    
    // Calcular itens extras
    let custoExtras = 0;
    const extras = dataManager.obterExtras();
    extras.forEach(extra => {
        const checkbox = document.getElementById(`extra-${extra.id}`);
        if (checkbox && checkbox.checked) {
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

/**
 * Exibe os resultados na interface
 */
function exibirResultados(resultado) {
    // Valores principais
    document.getElementById('valor-total').textContent = formatarMoeda(resultado.valorFinal);
    document.getElementById('valor-hora').textContent = formatarMoeda(resultado.valorPorHora);
    document.getElementById('total-horas').textContent = resultado.horasTotais.toFixed(1);
    
    const sala = dataManager.obterSalaPorId(document.getElementById('espaco').value);
    document.getElementById('custo-hora').textContent = formatarMoeda(sala.custoBase);
    document.getElementById('economia').textContent = formatarMoeda(resultado.economia);
    
    // Exibir alertas de viabilidade e classificação de risco
    exibirAlertaViabilidade(resultado);
    
    // Exibir estrutura de custos
    exibirEstruturaCustos(resultado);
    
    // Detalhamento
    document.getElementById('custo-base').textContent = formatarMoeda(resultado.custoOperacionalBase);
    
    // Informações dos funcionários - Detalhamento completo
    if (resultado.quantidadeFuncionarios > 0 && resultado.detalhamentoFuncionarios) {
        document.getElementById('funcionarios-detalhamento').style.display = 'block';
        document.getElementById('quantidade-funcionarios').textContent = resultado.quantidadeFuncionarios;
        document.getElementById('total-custos-funcionarios').textContent = formatarMoeda(resultado.totalCustosFuncionarios);
        
        const listaDetalhamento = document.getElementById('funcionarios-detalhamento-lista');
        listaDetalhamento.innerHTML = '';
        
        resultado.detalhamentoFuncionarios.forEach(func => {
            const divFunc = document.createElement('div');
            divFunc.style.cssText = 'padding: 10px; margin-bottom: 10px; background: white; border-radius: 6px; border-left: 3px solid #0ea5e9;';
            divFunc.innerHTML = `
                <div style="font-weight: bold; color: #0c4a6e; margin-bottom: 5px;">${func.nome}</div>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 5px; font-size: 0.85em; color: #6b7280;">
                    <div>⏰ Horas Normais: <strong>${func.horasNormais.toFixed(1)}h</strong></div>
                    <div>💵 Custo: <strong>R$ ${formatarMoeda(func.custoNormal)}</strong></div>
                    <div>📈 HE 50%: <strong>${func.horasHE50.toFixed(1)}h</strong></div>
                    <div>💵 Custo: <strong>R$ ${formatarMoeda(func.custoHE50)}</strong></div>
                    <div>📊 HE 100%: <strong>${func.horasHE100.toFixed(1)}h</strong></div>
                    <div>💵 Custo: <strong>R$ ${formatarMoeda(func.custoHE100)}</strong></div>
                    <div>🎫 Vale Transp.: <strong>R$ ${formatarMoeda(func.custoVT)}</strong></div>
                    ${func.custoTransApp > 0 ? `<div>🚗 Transp. App: <strong>R$ ${formatarMoeda(func.custoTransApp)}</strong></div>` : ''}
                    ${func.custoRefeicao > 0 ? `<div>🍽️ Refeição: <strong>R$ ${formatarMoeda(func.custoRefeicao)}</strong></div>` : ''}
                </div>
                <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb; font-weight: bold; color: #0284c7;">
                    Total do Funcionário: R$ ${formatarMoeda(func.custoTotal)}
                </div>
            `;
            listaDetalhamento.appendChild(divFunc);
        });
    } else {
        document.getElementById('funcionarios-detalhamento').style.display = 'none';
    }
    
    document.getElementById('mao-obra-normal').textContent = formatarMoeda(resultado.custoMaoObraNormal);
    document.getElementById('mao-obra-he50').textContent = formatarMoeda(resultado.custoMaoObraHE50);
    document.getElementById('mao-obra-he100').textContent = formatarMoeda(resultado.custoMaoObraHE100);
    document.getElementById('vale-transporte').textContent = formatarMoeda(resultado.custoValeTransporte);
    
    // Transporte por Aplicativo
    if (resultado.custoTransporteApp > 0) {
        document.getElementById('transporte-app-line').style.display = 'flex';
        document.getElementById('transporte-app').textContent = formatarMoeda(resultado.custoTransporteApp);
    } else {
        document.getElementById('transporte-app-line').style.display = 'none';
    }
    
    // Refeição
    if (resultado.custoRefeicao > 0) {
        document.getElementById('refeicao-line').style.display = 'flex';
        document.getElementById('refeicao').textContent = formatarMoeda(resultado.custoRefeicao);
    } else {
        document.getElementById('refeicao-line').style.display = 'none';
    }
    
    // Extras
    if (resultado.custoExtras > 0) {
        document.getElementById('extras-line').style.display = 'flex';
        document.getElementById('valor-extras').textContent = formatarMoeda(resultado.custoExtras);
    } else {
        document.getElementById('extras-line').style.display = 'none';
    }
    
    document.getElementById('subtotal-sem-margem').textContent = formatarMoeda(resultado.subtotalSemMargem);
    document.getElementById('margem-percent').textContent = resultado.margemPercent.toFixed(0);
    document.getElementById('valor-margem').textContent = formatarMoeda(resultado.valorMargem);
    document.getElementById('subtotal-com-margem').textContent = formatarMoeda(resultado.subtotalComMargem);
    document.getElementById('desconto-percent').textContent = resultado.descontoPercent.toFixed(0);
    document.getElementById('valor-desconto').textContent = formatarMoeda(resultado.valorDesconto);
    document.getElementById('valor-final').textContent = formatarMoeda(resultado.valorFinal);
}

/**
 * Exibe alerta de viabilidade e classificação de risco
 * Complexidade: O(1) - Operações constantes de cálculo e atualização DOM
 */
function exibirAlertaViabilidade(resultado) {
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
    
    // Classificação de risco operacional
    const riscoMaoObra = (custoVariavel / resultado.valorFinal * 100);
    let classificacaoRisco, corRisco, bgColor, borderColor, iconPath;
    
    if (riscoMaoObra > 60 || margemLiquida < 0) {
        classificacaoRisco = 'ALTO';
        corRisco = '#dc2626'; // Vermelho
        bgColor = '#fee2e2';
        borderColor = '#dc2626';
        iconPath = '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>';
    } else if (riscoMaoObra >= 40 || margemLiquida < 5) {
        classificacaoRisco = 'MÉDIO';
        corRisco = '#d97706'; // Amarelo/Laranja
        bgColor = '#fef3c7';
        borderColor = '#d97706';
        iconPath = '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>';
    } else {
        classificacaoRisco = 'BAIXO';
        corRisco = '#16a34a'; // Verde
        bgColor = '#dcfce7';
        borderColor = '#16a34a';
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
    if (margemLiquida < 0) {
        titleElement.textContent = '⚠️ ALERTA: Proposta Deficitária!';
        messageElement.innerHTML = `Margem líquida <strong>negativa de ${Math.abs(margemLiquida).toFixed(2)}%</strong>. Este projeto gerará prejuízo. Recomenda-se aumentar a margem ou reduzir o desconto.`;
    } else if (pontoEquilibrio > resultado.valorFinal) {
        titleElement.textContent = '⚠️ ATENÇÃO: Abaixo do Ponto de Equilíbrio';
        messageElement.innerHTML = `O valor final (R$ ${formatarMoeda(resultado.valorFinal)}) está <strong>abaixo do ponto de equilíbrio</strong> (R$ ${formatarMoeda(pontoEquilibrio)}). Margem líquida: ${margemLiquida.toFixed(2)}%.`;
    } else {
        titleElement.textContent = `Classificação de Risco: ${classificacaoRisco}`;
        messageElement.innerHTML = `Custos variáveis: <strong>${riscoMaoObra.toFixed(1)}%</strong> da receita | Margem líquida: <strong>${margemLiquida.toFixed(2)}%</strong> | Ponto de equilíbrio: R$ ${formatarMoeda(pontoEquilibrio)}`;
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
 * Wrapper para exportarPDFCliente com loading
 */
async function exportarPDFClienteComLoading() {
    mostrarLoading();
    // Pequeno delay para o overlay aparecer antes do processamento pesado
    await new Promise(resolve => setTimeout(resolve, 100));
    try {
        exportarPDFCliente();
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
    doc.text(`Valor por hora: R$ ${formatarMoeda(resultado.valorPorHora)}`, 20, y);
    y += 6;
    doc.text(`Desconto aplicado: ${resultado.descontoPercent.toFixed(0)}%`, 20, y);
    y += 6;
    doc.text(`Economia: R$ ${formatarMoeda(resultado.economia)}`, 20, y);
    
    // Valor final (destaque)
    y += 15;
    doc.setFillColor(30, 71, 138);
    doc.rect(20, y - 8, 170, 15, 'F');
    
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text(`VALOR TOTAL: R$ ${formatarMoeda(resultado.valorFinal)}`, 105, y, { align: 'center' });
    
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
    doc.text(`Capacidade: ${sala.capacidade} pessoas | Área: ${sala.area} m² | Custo base: R$ ${formatarMoeda(sala.custoBase)}/h`, 20, y);
    
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
        ['Custo Operacional Base', `R$ ${formatarMoeda(resultado.custoOperacionalBase)}`],
        ['Mão de Obra - Horas Normais', `R$ ${formatarMoeda(resultado.custoMaoObraNormal)}`],
        ['Mão de Obra - HE 50% (Sábado)', `R$ ${formatarMoeda(resultado.custoMaoObraHE50)}`],
        ['Mão de Obra - HE 100% (Domingo)', `R$ ${formatarMoeda(resultado.custoMaoObraHE100)}`],
        ['Vale Transporte', `R$ ${formatarMoeda(resultado.custoValeTransporte)}`]
    ];
    
    // Adicionar transporte por aplicativo se houver
    if (resultado.custoTransporteApp > 0) {
        custos.push(['Transporte por Aplicativo', `R$ ${formatarMoeda(resultado.custoTransporteApp)}`]);
    }
    
    // Adicionar refeição se houver
    if (resultado.custoRefeicao > 0) {
        custos.push(['Refeição', `R$ ${formatarMoeda(resultado.custoRefeicao)}`]);
    }
    
    custos.push(['Itens Extras', `R$ ${formatarMoeda(resultado.custoExtras)}`]);
    
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
                doc.text(`R$ ${formatarMoeda(func.custoNormal)}`, 190, y, { align: 'right' });
                y += 4;
            }
            
            // HE 50% (Sábado)
            if (func.horasHE50 > 0) {
                doc.text(`• HE 50% (Sábado): ${func.horasHE50.toFixed(1)}h`, 25, y);
                doc.text(`R$ ${formatarMoeda(func.custoHE50)}`, 190, y, { align: 'right' });
                y += 4;
            }
            
            // HE 100% (Domingo)
            if (func.horasHE100 > 0) {
                doc.text(`• HE 100% (Domingo): ${func.horasHE100.toFixed(1)}h`, 25, y);
                doc.text(`R$ ${formatarMoeda(func.custoHE100)}`, 190, y, { align: 'right' });
                y += 4;
            }
            
            // Vale Transporte
            if (func.custoVT > 0) {
                doc.text(`• Vale Transporte: ${Math.round(resultado.diasTotais)} dias`, 25, y);
                doc.text(`R$ ${formatarMoeda(func.custoVT)}`, 190, y, { align: 'right' });
                y += 4;
            }
            
            // Transporte por aplicativo
            if (func.custoTransApp > 0) {
                doc.text(`• Transporte por Aplicativo: ${Math.round(resultado.diasTotais)} dias`, 25, y);
                doc.text(`R$ ${formatarMoeda(func.custoTransApp)}`, 190, y, { align: 'right' });
                y += 4;
            }
            
            // Refeição
            if (func.custoRefeicao > 0) {
                doc.text(`• Refeição: ${Math.round(resultado.diasTotais)} dias`, 25, y);
                doc.text(`R$ ${formatarMoeda(func.custoRefeicao)}`, 190, y, { align: 'right' });
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
            doc.text(`R$ ${formatarMoeda(func.custoTotal)}`, 190, y, { align: 'right' });
            
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
    doc.text(`R$ ${formatarMoeda(resultado.subtotalSemMargem)}`, 190, y, { align: 'right' });
    
    y += 7;
    doc.setFont(undefined, 'normal');
    doc.text(`Margem de Lucro (${resultado.margemPercent.toFixed(0)}%)`, 20, y);
    doc.text(`R$ ${formatarMoeda(resultado.valorMargem)}`, 190, y, { align: 'right' });
    
    y += 5;
    doc.setFont(undefined, 'bold');
    doc.text('SUBTOTAL (com margem)', 20, y);
    doc.text(`R$ ${formatarMoeda(resultado.subtotalComMargem)}`, 190, y, { align: 'right' });
    
    y += 7;
    doc.setFont(undefined, 'normal');
    doc.text(`Desconto (${resultado.descontoPercent.toFixed(0)}%)`, 20, y);
    doc.text(`- R$ ${formatarMoeda(resultado.valorDesconto)}`, 190, y, { align: 'right' });
    
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
    doc.text(`R$ ${formatarMoeda(resultado.valorFinal)}`, 190, y, { align: 'right' });
    
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
    
    doc.text(`• Valor por hora: R$ ${formatarMoeda(custoHoraFinal)}`, 20, y);
    y += 5;
    doc.text(`• Margem líquida: ${margemLiquida}%`, 20, y);
    y += 5;
    doc.text(`• Markup aplicado: ${markup}%`, 20, y);
    y += 5;
    doc.text(`• Economia total para cliente: R$ ${formatarMoeda(resultado.economia)}`, 20, y);
    
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
    
    // Análise de risco operacional
    const riscoMaoObra = (custoVariavel / resultado.valorFinal * 100);
    let classificacaoRisco = '';
    let corRisco = [0, 0, 0];
    
    if (riscoMaoObra > 60) {
        classificacaoRisco = 'ALTO';
        corRisco = [220, 38, 38]; // Vermelho
    } else if (riscoMaoObra >= 40) {
        classificacaoRisco = 'MÉDIO';
        corRisco = [234, 179, 8]; // Amarelo
    } else {
        classificacaoRisco = 'BAIXO';
        corRisco = [34, 197, 94]; // Verde
    }
    
    // Exibir análise
    doc.setFont(undefined, 'bold');
    doc.text('Estrutura de Custos:', 20, y);
    y += 6;
    
    doc.setFont(undefined, 'normal');
    doc.text(`• Custos Fixos (Operacional): R$ ${formatarMoeda(custoFixo)} (${percentualFixo.toFixed(1)}%)`, 25, y);
    y += 5;
    doc.text(`• Custos Variáveis (Pessoal): R$ ${formatarMoeda(custoVariavel)} (${percentualVariavel.toFixed(1)}%)`, 25, y);
    y += 5;
    doc.text(`• Custos Extras: R$ ${formatarMoeda(resultado.custoExtras)} (${(resultado.custoExtras/custoTotal*100).toFixed(1)}%)`, 25, y);
    
    y += 8;
    doc.setFont(undefined, 'bold');
    doc.text('Indicadores de Viabilidade:', 20, y);
    y += 6;
    
    doc.setFont(undefined, 'normal');
    doc.text(`• Margem de Contribuição: R$ ${formatarMoeda(margemContribuicao)} (${percentualMargemContrib.toFixed(1)}%)`, 25, y);
    y += 5;
    doc.text(`• Ponto de Equilíbrio: R$ ${formatarMoeda(pontoEquilibrio)}`, 25, y);
    
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
                    <tr><td>Valor por hora:</td><td>R$ ${formatarMoeda(resultado.valorPorHora)}</td></tr>
                    <tr><td>Desconto aplicado:</td><td>${resultado.descontoPercent.toFixed(0)}%</td></tr>
                    <tr><td>Economia:</td><td>R$ ${formatarMoeda(resultado.economia)}</td></tr>
                    <tr style="font-size: 1.2em; font-weight: bold; background: #f3f4f6;">
                        <td>VALOR TOTAL:</td>
                        <td>R$ ${formatarMoeda(resultado.valorFinal)}</td>
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

// ========== FIM DO APP.JS ==========
