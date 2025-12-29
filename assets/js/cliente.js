/* =================================================================
   CLIENTE.JS - AXIOMA: INTELIGÊNCIA DE MARGEM v5.1.0
   Gestão de Clientes - Cadastro e Manutenção
   ================================================================= */

// ========== VARIÁVEIS GLOBAIS ==========
let dataManager = null;
let clienteEditandoId = null;

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', function() {
    inicializarPaginaCliente();
});

/**
 * Inicializa a página de clientes
 */
function inicializarPaginaCliente() {
    // Inicializar DataManager
    dataManager = new DataManager();
    
    // Carregar select de espaços
    carregarSelectEspacos();
    
    // Carregar lista de clientes
    carregarListaClientes();
    
    // Configurar event listeners
    configurarEventListeners();
    
    mostrarNotificacao('Sistema de gestão de clientes carregado!');
}

/**
 * Configura os event listeners da página
 */
function configurarEventListeners() {
    // Formulário de cliente
    document.getElementById('form-cliente').addEventListener('submit', salvarCliente);
    
    // Filtros
    document.getElementById('filtro-busca').addEventListener('input', filtrarClientes);
    document.getElementById('filtro-status').addEventListener('change', filtrarClientes);
    
    // Máscara para CPF/CNPJ
    document.getElementById('cliente-cpf-cnpj').addEventListener('input', aplicarMascaraCpfCnpj);
    
    // Máscara para telefones
    document.getElementById('cliente-telefone').addEventListener('input', aplicarMascaraTelefone);
    document.getElementById('cliente-telefone-2').addEventListener('input', aplicarMascaraTelefone);
    document.getElementById('cliente-whatsapp').addEventListener('input', aplicarMascaraTelefone);
    
    // Máscara para CEP
    document.getElementById('cliente-cep').addEventListener('input', aplicarMascaraCep);
    
    // Busca de CEP (ViaCEP)
    document.getElementById('cliente-cep').addEventListener('blur', buscarCep);
}

/**
 * Carrega o select de espaços
 */
function carregarSelectEspacos() {
    const select = document.getElementById('cliente-espaco-preferido');
    const salas = dataManager.obterSalas();
    
    // Limpar opções existentes (exceto a primeira)
    select.innerHTML = '<option value="">Nenhuma preferência</option>';
    
    salas.forEach(sala => {
        const option = document.createElement('option');
        option.value = sala.id;
        option.textContent = `${sala.nome} - ${sala.unidade}`;
        select.appendChild(option);
    });
}

/**
 * Salva um cliente (novo ou editando)
 */
function salvarCliente(event) {
    event.preventDefault();
    
    const cliente = {
        tipo: document.getElementById('cliente-tipo').value,
        nome: document.getElementById('cliente-nome').value.trim(),
        cpfCnpj: document.getElementById('cliente-cpf-cnpj').value.trim(),
        telefone: document.getElementById('cliente-telefone').value.trim(),
        telefone2: document.getElementById('cliente-telefone-2').value.trim(),
        email: document.getElementById('cliente-email').value.trim(),
        whatsapp: document.getElementById('cliente-whatsapp').value.trim(),
        cep: document.getElementById('cliente-cep').value.trim(),
        endereco: document.getElementById('cliente-endereco').value.trim(),
        numero: document.getElementById('cliente-numero').value.trim(),
        complemento: document.getElementById('cliente-complemento').value.trim(),
        bairro: document.getElementById('cliente-bairro').value.trim(),
        cidade: document.getElementById('cliente-cidade').value.trim(),
        estado: document.getElementById('cliente-estado').value,
        espacoPreferido: document.getElementById('cliente-espaco-preferido').value,
        tipoEvento: document.getElementById('cliente-tipo-evento').value.trim(),
        observacoes: document.getElementById('cliente-observacoes').value.trim(),
        status: document.getElementById('cliente-status').value
    };
    
    // Validações básicas
    if (!cliente.nome || !cliente.telefone || !cliente.email) {
        mostrarNotificacao('Preencha todos os campos obrigatórios!', 'error');
        return;
    }
    
    // Validar e-mail
    if (!validarEmail(cliente.email)) {
        mostrarNotificacao('E-mail inválido!', 'error');
        return;
    }
    
    try {
        if (clienteEditandoId) {
            // Atualizar cliente existente
            cliente.id = clienteEditandoId;
            dataManager.atualizarCliente(cliente);
            mostrarNotificacao('Cliente atualizado com sucesso!');
            clienteEditandoId = null;
        } else {
            // Criar novo cliente
            dataManager.adicionarCliente(cliente);
            mostrarNotificacao('Cliente cadastrado com sucesso!');
        }
        
        // Limpar formulário
        document.getElementById('form-cliente').reset();
        
        // Recarregar lista
        carregarListaClientes();
    } catch (error) {
        console.error('Erro ao salvar cliente:', error);
        mostrarNotificacao('Erro ao salvar cliente!', 'error');
    }
}

/**
 * Carrega a lista de clientes
 */
function carregarListaClientes() {
    const tbody = document.getElementById('clientes-body');
    const divVazio = document.getElementById('clientes-vazio');
    const contador = document.getElementById('contador-clientes');
    
    const clientes = dataManager.obterClientes();
    
    tbody.innerHTML = '';
    
    if (clientes.length === 0) {
        tbody.parentElement.parentElement.style.display = 'none';
        divVazio.style.display = 'block';
        contador.textContent = 'Nenhum cliente cadastrado';
        return;
    }
    
    tbody.parentElement.parentElement.style.display = 'table';
    divVazio.style.display = 'none';
    contador.textContent = `Total: ${clientes.length} cliente(s)`;
    
    clientes.forEach(cliente => {
        const tr = document.createElement('tr');
        
        // Status badge
        const statusColors = {
            'ativo': 'background: #10b981; color: white;',
            'prospecto': 'background: #f59e0b; color: white;',
            'inativo': 'background: #6b7280; color: white;'
        };
        
        const statusLabels = {
            'ativo': 'Ativo',
            'prospecto': 'Prospecto',
            'inativo': 'Inativo'
        };
        
        tr.innerHTML = `
            <td>
                <strong>${cliente.nome}</strong>
                ${cliente.cpfCnpj ? `<br><small style="color: #6b7280;">${cliente.cpfCnpj}</small>` : ''}
            </td>
            <td>${cliente.tipo === 'pessoa-fisica' ? 'Pessoa Física' : 'Pessoa Jurídica'}</td>
            <td>
                ${cliente.telefone}
                ${cliente.telefone2 ? `<br><small style="color: #6b7280;">${cliente.telefone2}</small>` : ''}
            </td>
            <td>${cliente.email}</td>
            <td>
                <span style="display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 0.85em; font-weight: 600; ${statusColors[cliente.status]}">
                    ${statusLabels[cliente.status]}
                </span>
            </td>
            <td>
                <div style="display: flex; gap: 8px;">
                    <button class="btn-icon" onclick="visualizarCliente(${cliente.id})" title="Visualizar">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                        </svg>
                    </button>
                    <button class="btn-icon" onclick="editarCliente(${cliente.id})" title="Editar">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                            <path d="m15 5 4 4"/>
                        </svg>
                    </button>
                    <button class="btn-icon btn-danger" onclick="excluirCliente(${cliente.id})" title="Excluir">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M3 6h18"/>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                        </svg>
                    </button>
                </div>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
}

/**
 * Filtra clientes com base nos filtros aplicados
 */
function filtrarClientes() {
    const busca = document.getElementById('filtro-busca').value.toLowerCase();
    const status = document.getElementById('filtro-status').value;
    
    const tbody = document.getElementById('clientes-body');
    const rows = tbody.getElementsByTagName('tr');
    
    let visibleCount = 0;
    
    for (let row of rows) {
        const texto = row.textContent.toLowerCase();
        const clienteStatus = row.querySelector('span').textContent.toLowerCase();
        
        const matchBusca = !busca || texto.includes(busca);
        const matchStatus = !status || clienteStatus.includes(status);
        
        if (matchBusca && matchStatus) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    }
    
    const contador = document.getElementById('contador-clientes');
    const total = rows.length;
    
    if (busca || status) {
        contador.textContent = `Mostrando ${visibleCount} de ${total} cliente(s)`;
    } else {
        contador.textContent = `Total: ${total} cliente(s)`;
    }
}

/**
 * Edita um cliente
 */
function editarCliente(id) {
    const cliente = dataManager.obterClientePorId(id);
    
    if (!cliente) {
        mostrarNotificacao('Cliente não encontrado!', 'error');
        return;
    }
    
    // Preencher formulário
    document.getElementById('cliente-tipo').value = cliente.tipo;
    document.getElementById('cliente-nome').value = cliente.nome;
    document.getElementById('cliente-cpf-cnpj').value = cliente.cpfCnpj || '';
    document.getElementById('cliente-telefone').value = cliente.telefone;
    document.getElementById('cliente-telefone-2').value = cliente.telefone2 || '';
    document.getElementById('cliente-email').value = cliente.email;
    document.getElementById('cliente-whatsapp').value = cliente.whatsapp || '';
    document.getElementById('cliente-cep').value = cliente.cep || '';
    document.getElementById('cliente-endereco').value = cliente.endereco || '';
    document.getElementById('cliente-numero').value = cliente.numero || '';
    document.getElementById('cliente-complemento').value = cliente.complemento || '';
    document.getElementById('cliente-bairro').value = cliente.bairro || '';
    document.getElementById('cliente-cidade').value = cliente.cidade || '';
    document.getElementById('cliente-estado').value = cliente.estado || '';
    document.getElementById('cliente-espaco-preferido').value = cliente.espacoPreferido || '';
    document.getElementById('cliente-tipo-evento').value = cliente.tipoEvento || '';
    document.getElementById('cliente-observacoes').value = cliente.observacoes || '';
    document.getElementById('cliente-status').value = cliente.status;
    
    clienteEditandoId = id;
    
    // Scroll para o formulário
    document.getElementById('form-cliente').scrollIntoView({ behavior: 'smooth' });
    
    mostrarNotificacao('Editando cliente. Altere os dados e clique em Salvar.');
}

/**
 * Visualiza detalhes de um cliente
 */
function visualizarCliente(id) {
    const cliente = dataManager.obterClientePorId(id);
    
    if (!cliente) {
        mostrarNotificacao('Cliente não encontrado!', 'error');
        return;
    }
    
    let espacoNome = 'Nenhuma preferência';
    if (cliente.espacoPreferido) {
        const sala = dataManager.obterSalaPorId(parseInt(cliente.espacoPreferido));
        if (sala) {
            espacoNome = `${sala.nome} - ${sala.unidade}`;
        }
    }
    
    const enderecoCompleto = [
        cliente.endereco,
        cliente.numero,
        cliente.complemento,
        cliente.bairro,
        cliente.cidade,
        cliente.estado
    ].filter(Boolean).join(', ') || 'Não informado';
    
    const detalhes = `
        <div style="max-width: 600px;">
            <h3 style="margin-top: 0;">${cliente.nome}</h3>
            <p><strong>Tipo:</strong> ${cliente.tipo === 'pessoa-fisica' ? 'Pessoa Física' : 'Pessoa Jurídica'}</p>
            ${cliente.cpfCnpj ? `<p><strong>CPF/CNPJ:</strong> ${cliente.cpfCnpj}</p>` : ''}
            
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
            
            <h4>Contato</h4>
            <p><strong>Telefone:</strong> ${cliente.telefone}</p>
            ${cliente.telefone2 ? `<p><strong>Telefone 2:</strong> ${cliente.telefone2}</p>` : ''}
            <p><strong>E-mail:</strong> ${cliente.email}</p>
            ${cliente.whatsapp ? `<p><strong>WhatsApp:</strong> ${cliente.whatsapp}</p>` : ''}
            
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
            
            <h4>Endereço</h4>
            <p>${enderecoCompleto}</p>
            ${cliente.cep ? `<p><strong>CEP:</strong> ${cliente.cep}</p>` : ''}
            
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
            
            <h4>Preferências</h4>
            <p><strong>Espaço Preferido:</strong> ${espacoNome}</p>
            ${cliente.tipoEvento ? `<p><strong>Tipo de Evento:</strong> ${cliente.tipoEvento}</p>` : ''}
            ${cliente.observacoes ? `<p><strong>Observações:</strong><br>${cliente.observacoes}</p>` : ''}
            <p><strong>Status:</strong> ${cliente.status === 'ativo' ? 'Ativo' : cliente.status === 'prospecto' ? 'Prospecto' : 'Inativo'}</p>
        </div>
    `;
    
    // Mostrar em um alert customizado (você pode implementar um modal mais bonito)
    const modal = document.createElement('div');
    modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000;';
    modal.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 12px; max-width: 600px; max-height: 80vh; overflow-y: auto;">
            ${detalhes}
            <button onclick="this.parentElement.parentElement.remove()" class="btn-primary" style="margin-top: 20px;">Fechar</button>
        </div>
    `;
    document.body.appendChild(modal);
}

/**
 * Exclui um cliente
 */
function excluirCliente(id) {
    const cliente = dataManager.obterClientePorId(id);
    
    if (!cliente) {
        mostrarNotificacao('Cliente não encontrado!', 'error');
        return;
    }
    
    if (confirm(`Tem certeza que deseja excluir o cliente "${cliente.nome}"?`)) {
        dataManager.removerCliente(id);
        carregarListaClientes();
        mostrarNotificacao('Cliente excluído com sucesso!');
    }
}

// ========== FUNÇÕES DE MÁSCARA ==========

/**
 * Aplica máscara de CPF ou CNPJ
 */
function aplicarMascaraCpfCnpj(event) {
    let value = event.target.value.replace(/\D/g, '');
    
    if (value.length <= 11) {
        // CPF: 000.000.000-00
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
        // CNPJ: 00.000.000/0000-00
        value = value.substring(0, 14);
        value = value.replace(/(\d{2})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d)/, '$1/$2');
        value = value.replace(/(\d{4})(\d{1,2})$/, '$1-$2');
    }
    
    event.target.value = value;
}

/**
 * Aplica máscara de telefone
 */
function aplicarMascaraTelefone(event) {
    let value = event.target.value.replace(/\D/g, '');
    
    if (value.length <= 10) {
        // Telefone fixo: (00) 0000-0000
        value = value.replace(/(\d{2})(\d)/, '($1) $2');
        value = value.replace(/(\d{4})(\d{1,4})$/, '$1-$2');
    } else {
        // Celular: (00) 00000-0000
        value = value.substring(0, 11);
        value = value.replace(/(\d{2})(\d)/, '($1) $2');
        value = value.replace(/(\d{5})(\d{1,4})$/, '$1-$2');
    }
    
    event.target.value = value;
}

/**
 * Aplica máscara de CEP
 */
function aplicarMascaraCep(event) {
    let value = event.target.value.replace(/\D/g, '');
    value = value.substring(0, 8);
    value = value.replace(/(\d{5})(\d{1,3})$/, '$1-$2');
    event.target.value = value;
}

/**
 * Busca CEP na API ViaCEP
 */
function buscarCep() {
    const cep = document.getElementById('cliente-cep').value.replace(/\D/g, '');
    
    if (cep.length !== 8) {
        return;
    }
    
    // Limpar campos
    document.getElementById('cliente-endereco').value = '';
    document.getElementById('cliente-bairro').value = '';
    document.getElementById('cliente-cidade').value = '';
    document.getElementById('cliente-estado').value = '';
    
    // Buscar CEP
    fetch(`https://viacep.com.br/ws/${cep}/json/`)
        .then(response => response.json())
        .then(data => {
            if (data.erro) {
                mostrarNotificacao('CEP não encontrado!', 'error');
                return;
            }
            
            document.getElementById('cliente-endereco').value = data.logradouro || '';
            document.getElementById('cliente-bairro').value = data.bairro || '';
            document.getElementById('cliente-cidade').value = data.localidade || '';
            document.getElementById('cliente-estado').value = data.uf || '';
            
            mostrarNotificacao('CEP encontrado!');
        })
        .catch(error => {
            console.error('Erro ao buscar CEP:', error);
            mostrarNotificacao('Erro ao buscar CEP!', 'error');
        });
}

// ========== FUNÇÕES AUXILIARES ==========

/**
 * Valida formato de e-mail
 */
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Mostra notificação
 */
function mostrarNotificacao(mensagem, tipo = 'success') {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notification-text');
    
    notificationText.textContent = mensagem;
    notification.className = 'notification show';
    
    if (tipo === 'error') {
        notification.style.background = 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
    } else {
        notification.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
    }
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}
