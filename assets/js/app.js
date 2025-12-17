/* =================================================================
   APP.JS - CALCULADORA DE ORÇAMENTO CDL/UTV v5.0
   Lógica principal da aplicação, cálculos e interface do usuário
   ================================================================= */

// ========== VARIÁVEIS GLOBAIS ==========
let ultimoCalculoRealizado = null;

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
    configurarEventListeners();
    
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
        <strong>📍 ${sala.unidade} - ${sala.nome}</strong><br>
        👥 Capacidade: ${sala.capacidade} pessoas<br>
        📐 Área: ${sala.area} m²<br>
        💰 Custo Base: R$ ${formatarMoeda(sala.custoBase)}/h<br>
        <br>
        <strong>Valores por Turno:</strong><br>
        ☀️ Manhã: R$ ${formatarMoeda(sala.custoBase * multiplicadores.manha)}/h (×${multiplicadores.manha})<br>
        🌤️ Tarde: R$ ${formatarMoeda(sala.custoBase * multiplicadores.tarde)}/h (×${multiplicadores.tarde})<br>
        🌙 Noite: R$ ${formatarMoeda(sala.custoBase * multiplicadores.noite)}/h (×${multiplicadores.noite})
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
                <button class="btn-small btn-edit" onclick="editarSala(${sala.id})">✏️ Editar</button>
                <button class="btn-small btn-delete" onclick="removerSala(${sala.id})">🗑️ Remover</button>
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
                <button class="btn-small btn-edit" onclick="salvarCustoSala(${sala.id})">💾 Salvar</button>
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
                <button class="btn-small btn-edit" onclick="editarExtra(${extra.id})">✏️</button>
                <button class="btn-small btn-delete" onclick="removerExtra(${extra.id})">🗑️</button>
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
    
    funcionarios.forEach(func => {
        const div = document.createElement('div');
        div.className = 'funcionario-item';
        div.style.cssText = 'padding: 15px; margin-bottom: 15px; background: #f3f4f6; border-radius: 8px; border-left: 4px solid ' + (func.ativo ? '#10b981' : '#6b7280');
        
        div.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                        <strong style="font-size: 1.1em; color: #1e3c72;">${func.nome}</strong>
                        ${func.ativo ? '<span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.75em; font-weight: bold;">ATIVO</span>' : ''}
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; font-size: 0.9em; color: #6b7280;">
                        <div>💵 Hora Normal: <strong>R$ ${formatarMoeda(func.horaNormal)}</strong></div>
                        <div>📈 HE 50%: <strong>R$ ${formatarMoeda(func.he50)}</strong></div>
                        <div>📊 HE 100%: <strong>R$ ${formatarMoeda(func.he100)}</strong></div>
                        <div>🎫 Vale Transporte: <strong>R$ ${formatarMoeda(func.valeTransporte)}</strong></div>
                    </div>
                </div>
                <div style="display: flex; gap: 5px; margin-left: 15px;">
                    ${!func.ativo ? `<button class="btn-small btn-success" onclick="ativarFuncionario(${func.id})" title="Usar nos cálculos">✓</button>` : ''}
                    <button class="btn-small btn-edit" onclick="editarFuncionario(${func.id})" title="Editar">✏️</button>
                    ${funcionarios.length > 1 ? `<button class="btn-small btn-delete" onclick="removerFuncionario(${func.id})" title="Remover">🗑️</button>` : ''}
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
    
    // Exportação e impressão
    document.getElementById('exportar-pdf-cliente').addEventListener('click', exportarPDFCliente);
    document.getElementById('exportar-pdf-super').addEventListener('click', exportarPDFSuperintendencia);
    document.getElementById('imprimir').addEventListener('click', imprimirOrcamento);
    
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
    const diasSemana = parseInt(document.getElementById('dias').value);
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
    
    // Verificar turnos selecionados
    const manha = document.getElementById('manha').checked;
    const tarde = document.getElementById('tarde').checked;
    const noite = document.getElementById('noite').checked;
    
    if (!manha && !tarde && !noite) {
        alert('Por favor, selecione pelo menos um turno!');
        return;
    }
    
    // Calcular horas e custos
    const resultado = calcularValores(sala, duracao, diasSemana, manha, tarde, noite, margem, desconto);
    
    // Armazenar para exportação
    ultimoCalculoRealizado = {
        sala,
        duracao,
        diasSemana,
        turnos: { manha, tarde, noite },
        margem,
        desconto,
        resultado,
        data: new Date().toLocaleDateString('pt-BR')
    };
    
    // Exibir resultados
    exibirResultados(resultado);
    
    mostrarNotificacao('Orçamento calculado com sucesso!');
}

/**
 * Realiza todos os cálculos do orçamento
 */
function calcularValores(sala, duracao, diasSemana, manha, tarde, noite, margem, desconto) {
    const custos = dataManager.obterCustosFuncionario();
    const multiplicadores = dataManager.obterMultiplicadoresTurno();
    
    // Calcular total de horas por mês
    const horasPorDia = (manha ? 4 : 0) + (tarde ? 4 : 0) + (noite ? 4 : 0);
    const diasPorMes = diasSemana * 4; // Aproximadamente 4 semanas por mês
    const horasPorMes = horasPorDia * diasPorMes;
    const horasTotais = horasPorMes * duracao;
    
    // Calcular custo operacional base (considerando multiplicadores de turno)
    let custoOperacionalBase = 0;
    if (manha) custoOperacionalBase += sala.custoBase * multiplicadores.manha * 4 * diasPorMes * duracao;
    if (tarde) custoOperacionalBase += sala.custoBase * multiplicadores.tarde * 4 * diasPorMes * duracao;
    if (noite) custoOperacionalBase += sala.custoBase * multiplicadores.noite * 4 * diasPorMes * duracao;
    
    // Calcular mão de obra
    // Distribuição de horas por tipo baseada nos dias da semana
    let horasNormais = 0;
    let horasHE50 = 0; // Sábado
    let horasHE100 = 0; // Domingo
    
    if (diasSemana === 1) {
        // 1 dia (sábado)
        horasHE50 = horasTotais;
    } else if (diasSemana === 2) {
        // 2 dias (sábado e domingo)
        horasHE50 = horasTotais / 2;
        horasHE100 = horasTotais / 2;
    } else if (diasSemana === 5) {
        // 5 dias (segunda a sexta)
        horasNormais = horasTotais;
    } else if (diasSemana === 7) {
        // 7 dias
        horasNormais = horasTotais * (5/7);
        horasHE50 = horasTotais * (1/7);
        horasHE100 = horasTotais * (1/7);
    }
    
    const custoMaoObraNormal = horasNormais * custos.horaNormal;
    const custoMaoObraHE50 = horasHE50 * custos.he50;
    const custoMaoObraHE100 = horasHE100 * custos.he100;
    const custoMaoObraTotal = custoMaoObraNormal + custoMaoObraHE50 + custoMaoObraHE100;
    
    // Calcular vale transporte (por dia trabalhado)
    const diasTotais = diasPorMes * duracao;
    const custoValeTransporte = diasTotais * custos.valeTransporte;
    
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
    const subtotalSemMargem = custoOperacionalBase + custoMaoObraTotal + custoValeTransporte + custoExtras;
    
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
    
    return {
        horasTotais,
        horasPorMes,
        diasPorMes,
        custoOperacionalBase,
        custoMaoObraNormal,
        custoMaoObraHE50,
        custoMaoObraHE100,
        custoMaoObraTotal,
        custoValeTransporte,
        custoExtras,
        subtotalSemMargem,
        valorMargem,
        subtotalComMargem,
        valorDesconto,
        valorFinal,
        valorPorHora,
        economia,
        margemPercent: margem * 100,
        descontoPercent: desconto * 100
    };
}

/**
 * Exibe os resultados na interface
 */
function exibirResultados(resultado) {
    // Valores principais
    document.getElementById('valor-total').textContent = formatarMoeda(resultado.valorFinal);
    document.getElementById('valor-hora').textContent = formatarMoeda(resultado.valorPorHora);
    document.getElementById('total-horas').textContent = resultado.horasTotais;
    
    const sala = dataManager.obterSalaPorId(document.getElementById('espaco').value);
    document.getElementById('custo-hora').textContent = formatarMoeda(sala.custoBase);
    document.getElementById('economia').textContent = formatarMoeda(resultado.economia);
    
    // Detalhamento
    document.getElementById('custo-base').textContent = formatarMoeda(resultado.custoOperacionalBase);
    document.getElementById('mao-obra-normal').textContent = formatarMoeda(resultado.custoMaoObraNormal);
    document.getElementById('mao-obra-he50').textContent = formatarMoeda(resultado.custoMaoObraHE50);
    document.getElementById('mao-obra-he100').textContent = formatarMoeda(resultado.custoMaoObraHE100);
    document.getElementById('vale-transporte').textContent = formatarMoeda(resultado.custoValeTransporte);
    
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
    
    if (!nome || !horaNormal || !he50 || !he100 || !valeTransporte) {
        alert('Por favor, preencha todos os campos!');
        return;
    }
    
    // Validar valores numéricos
    const horaNormalNum = parseFloat(horaNormal);
    const he50Num = parseFloat(he50);
    const he100Num = parseFloat(he100);
    const valeTransporteNum = parseFloat(valeTransporte);
    
    if (isNaN(horaNormalNum) || isNaN(he50Num) || isNaN(he100Num) || isNaN(valeTransporteNum)) {
        alert('Por favor, insira valores numéricos válidos!');
        return;
    }
    
    if (horaNormalNum < 0 || he50Num < 0 || he100Num < 0 || valeTransporteNum < 0) {
        alert('Os valores não podem ser negativos!');
        return;
    }
    
    const novoFuncionario = {
        nome,
        horaNormal: horaNormalNum,
        he50: he50Num,
        he100: he100Num,
        valeTransporte: valeTransporteNum
    };
    
    dataManager.adicionarFuncionario(novoFuncionario);
    
    // Limpar campos
    document.getElementById('novo-func-nome').value = '';
    document.getElementById('novo-func-normal').value = '';
    document.getElementById('novo-func-he50').value = '';
    document.getElementById('novo-func-he100').value = '';
    document.getElementById('novo-func-vt').value = '';
    
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
    
    // Validar valores numéricos
    const horaNormalNum = parseFloat(horaNormal);
    const he50Num = parseFloat(he50);
    const he100Num = parseFloat(he100);
    const valeTransporteNum = parseFloat(valeTransporte);
    
    if (isNaN(horaNormalNum) || isNaN(he50Num) || isNaN(he100Num) || isNaN(valeTransporteNum)) {
        alert('Por favor, insira valores numéricos válidos!');
        return;
    }
    
    if (horaNormalNum < 0 || he50Num < 0 || he100Num < 0 || valeTransporteNum < 0) {
        alert('Os valores não podem ser negativos!');
        return;
    }
    
    dataManager.atualizarFuncionario(id, {
        nome: nome.trim(),
        horaNormal: horaNormalNum,
        he50: he50Num,
        he100: he100Num,
        valeTransporte: valeTransporteNum
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
 * Ativa um funcionário (define como usado nos cálculos)
 */
function ativarFuncionario(id) {
    dataManager.definirFuncionarioAtivo(id);
    carregarListaFuncionarios();
    mostrarNotificacao('Funcionário ativado! Este será usado nos cálculos.');
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

// ========== EXPORTAÇÃO DE PDF ==========

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
    doc.text(`Duração: ${calculo.duracao} meses`, 20, y);
    y += 6;
    doc.text(`Dias por semana: ${calculo.diasSemana}`, 20, y);
    y += 6;
    
    const turnos = [];
    if (calculo.turnos.manha) turnos.push('Manhã');
    if (calculo.turnos.tarde) turnos.push('Tarde');
    if (calculo.turnos.noite) turnos.push('Noite');
    doc.text(`Turnos: ${turnos.join(', ')}`, 20, y);
    y += 6;
    doc.text(`Total de horas: ${resultado.horasTotais}h`, 20, y);
    
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
    doc.text(`Duração: ${calculo.duracao} meses | Dias/semana: ${calculo.diasSemana} | Total de horas: ${resultado.horasTotais}h`, 20, y);
    y += 5;
    const turnos = [];
    if (calculo.turnos.manha) turnos.push('Manhã');
    if (calculo.turnos.tarde) turnos.push('Tarde');
    if (calculo.turnos.noite) turnos.push('Noite');
    doc.text(`Turnos utilizados: ${turnos.join(', ')}`, 20, y);
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
        ['Vale Transporte', `R$ ${formatarMoeda(resultado.custoValeTransporte)}`],
        ['Itens Extras', `R$ ${formatarMoeda(resultado.custoExtras)}`],
    ];
    
    custos.forEach(([item, valor]) => {
        doc.text(item, 20, y);
        doc.text(valor, 190, y, { align: 'right' });
        y += 5;
    });
    
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
    
    // Observações
    y += 12;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('5. OBSERVAÇÕES', 15, y);
    
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
    
    const turnos = [];
    if (calculo.turnos.manha) turnos.push('Manhã');
    if (calculo.turnos.tarde) turnos.push('Tarde');
    if (calculo.turnos.noite) turnos.push('Noite');
    
    printSection.innerHTML = `
        <div class="pdf-content">
            <div class="pdf-header">
                <h1>🏢 PROPOSTA DE ORÇAMENTO</h1>
                <p>CDL/UTV - Locação de Espaços para Eventos</p>
            </div>
            
            <div class="pdf-section">
                <h2>📍 Informações do Espaço</h2>
                <table class="pdf-table">
                    <tr><td>Espaço:</td><td>${sala.unidade} - ${sala.nome}</td></tr>
                    <tr><td>Capacidade:</td><td>${sala.capacidade} pessoas</td></tr>
                    <tr><td>Área:</td><td>${sala.area} m²</td></tr>
                </table>
            </div>
            
            <div class="pdf-section">
                <h2>📋 Detalhes do Contrato</h2>
                <table class="pdf-table">
                    <tr><td>Duração:</td><td>${calculo.duracao} meses</td></tr>
                    <tr><td>Dias por semana:</td><td>${calculo.diasSemana}</td></tr>
                    <tr><td>Turnos:</td><td>${turnos.join(', ')}</td></tr>
                    <tr><td>Total de horas:</td><td>${resultado.horasTotais}h</td></tr>
                </table>
            </div>
            
            <div class="pdf-section">
                <h2>💰 Valores</h2>
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
