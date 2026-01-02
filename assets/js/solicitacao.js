/* =================================================================
   SOLICITACAO.JS - Lead Acquisition Pipeline
   Sistema de captura e gerenciamento de leads para solicitação de orçamento
   SGQ-SECURITY Compliance: Technical neutrality and data integrity
   ================================================================= */

// Import dataManager and DataSanitizer
import dataManager from './data-manager.js';

console.log('[SGQ-SECURITY] Módulo solicitacao.js carregado');

// Make it globally available for inline scripts
window.dataManager = dataManager;

// Shadow Capture - Salva dados ao sair dos campos (blur event)
const STORAGE_KEY = 'cdl-leads-temp';
let currentLeadId = null;
let currentStep = 1;
let inactivityTimer = null;
let lastFocusedField = null;

// Constantes de timeout
const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutos

/**
 * Função para exibir notificação
 * @param {string} mensagem - Mensagem a ser exibida
 * @param {number} duracao - Duração em ms (padrão: 3000)
 */
function mostrarNotificacao(mensagem, duracao = 3000) {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notification-text');
    
    if (notification && notificationText) {
        notificationText.textContent = mensagem;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, duracao);
    }
}

/**
 * Reinicia o timer de inatividade
 * Monitora abandono em TODO o formulário (não apenas Step 1)
 */
function reiniciarTimerInatividade() {
    console.log('[SGQ-SECURITY] Timer de inatividade reiniciado');
    
    // Limpar timer existente
    if (inactivityTimer) {
        clearTimeout(inactivityTimer);
    }
    
    // Criar novo timer se houver dados incompletos ou em preenchimento
    const leadTemp = obterLeadTemporario();
    if (leadTemp && (leadTemp.status === 'LEAD_INCOMPLETO' || leadTemp.status === 'LEAD_EM_PREENCHIMENTO')) {
        inactivityTimer = setTimeout(() => {
            console.log('[SGQ-SECURITY] Timeout de inatividade atingido - marcando lead como abandonado');
            marcarLeadComoAbandonado();
        }, INACTIVITY_TIMEOUT_MS);
    }
}

/**
 * Marca o lead temporário como abandonado
 * Garante que todos os dados capturados (incluindo finalidade e associado) sejam salvos
 */
async function marcarLeadComoAbandonado() {
    const leadTemp = obterLeadTemporario();
    
    if (leadTemp && (leadTemp.status === 'LEAD_INCOMPLETO' || leadTemp.status === 'LEAD_EM_PREENCHIMENTO')) {
        leadTemp.status = 'LEAD_ABANDONADO';
        leadTemp.dataAbandono = new Date().toISOString();
        leadTemp.ultimo_campo_focado = lastFocusedField;
        
        // Capturar dados do formulário que podem ter sido preenchidos mas não salvos ainda
        // Incluir finalidade e associado se disponíveis
        const finalidadeEvento = document.getElementById('finalidadeEvento');
        const associadoCDL = document.getElementById('associadoCDL');
        const dataEvento = document.getElementById('dataEvento');
        const espaco = document.getElementById('espaco');
        
        if (finalidadeEvento && finalidadeEvento.value.trim()) {
            leadTemp.finalidadeEvento = finalidadeEvento.value.trim();
        }
        
        if (associadoCDL) {
            leadTemp.associadoCDL = associadoCDL.checked;
        }
        
        if (dataEvento && dataEvento.value) {
            leadTemp.dataEvento = dataEvento.value;
        }
        
        if (espaco && espaco.value) {
            leadTemp.espacoId = parseInt(espaco.value);
            leadTemp.espaco = espaco.options[espaco.selectedIndex].text;
        }
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(leadTemp));
        console.log('[SGQ-SECURITY] Lead marcado como LEAD_ABANDONADO:', leadTemp.id);
        console.log('[SGQ-SECURITY] Dados capturados no abandono:', {
            finalidadeEvento: leadTemp.finalidadeEvento || 'não informado',
            associadoCDL: leadTemp.associadoCDL || false,
            dataEvento: leadTemp.dataEvento || 'não informado',
            espaco: leadTemp.espaco || 'não informado',
            ultimo_campo_focado: leadTemp.ultimo_campo_focado
        });
        
        // Salvar no dataManager para persistência (assíncrono, não bloqueia)
        try {
            await dataManager.salvarLead(leadTemp);
        } catch (error) {
            console.error('[SGQ-SECURITY] Erro ao salvar lead abandonado:', error);
        }
    }
}

/**
 * Shadow Capture: Salvar dados automaticamente ao perder o foco
 */
function setupShadowCapture() {
    const camposContato = ['nome', 'telefone', 'email'];
    
    camposContato.forEach(campo => {
        const input = document.getElementById(campo);
        if (input) {
            input.addEventListener('focus', function() {
                lastFocusedField = campo;
                console.log('[SGQ-SECURITY] Campo focado:', campo);
                reiniciarTimerInatividade();
            });

            input.addEventListener('blur', function() {
                const valor = this.value.trim();
                if (valor) {
                    salvarLeadShadow(campo, valor);
                    mostrarIndicadorCaptura(campo);
                    
                    // Se for o campo nome, validar com DataSanitizer
                    if (campo === 'nome') {
                        validarCampoNome(valor);
                    }
                }
                reiniciarTimerInatividade();
            });

            // Verificar preenchimento para habilitar botão "Próximo"
            input.addEventListener('input', verificarCamposObrigatoriosStep1);
        }
    });
    
    // Adicionar listeners para finalidadeEvento e associadoCDL (campos de enriquecimento)
    const finalidadeEvento = document.getElementById('finalidadeEvento');
    if (finalidadeEvento) {
        finalidadeEvento.addEventListener('change', async function() {
            const valor = this.value.trim();
            if (valor) {
                await salvarLeadShadow('finalidadeEvento', valor);
                console.log('[SGQ-SECURITY] Finalidade do evento capturada:', valor);
            }
            reiniciarTimerInatividade();
        });
    }
    
    const associadoCDL = document.getElementById('associadoCDL');
    if (associadoCDL) {
        associadoCDL.addEventListener('change', async function() {
            const valor = this.checked;
            await salvarLeadShadow('associadoCDL', valor);
            console.log('[SGQ-SECURITY] Associado CDL capturado:', valor);
            reiniciarTimerInatividade();
        });
    }
    
    // Adicionar listeners para dataEvento e espaco (Step 2)
    const dataEvento = document.getElementById('dataEvento');
    if (dataEvento) {
        dataEvento.addEventListener('change', async function() {
            const valor = this.value;
            if (valor) {
                await salvarLeadShadow('dataEvento', valor);
                console.log('[SGQ-SECURITY] Data do evento capturada:', valor);
            }
            reiniciarTimerInatividade();
        });
    }
    
    const espaco = document.getElementById('espaco');
    if (espaco) {
        espaco.addEventListener('change', async function() {
            const valor = this.value;
            if (valor) {
                await salvarLeadShadow('espacoId', parseInt(valor));
                // Também salvar o nome do espaço para referência
                const selectElement = this;
                const espacoNome = selectElement.options[selectElement.selectedIndex].text;
                await salvarLeadShadow('espaco', espacoNome);
                console.log('[SGQ-SECURITY] Espaço capturado:', espacoNome);
            }
            reiniciarTimerInatividade();
        });
    }
    
    // Iniciar timer de inatividade
    reiniciarTimerInatividade();
}

/**
 * Valida o campo nome usando DataSanitizer
 * Exibe feedback visual se houver viés detectado
 * @param {string} nome - Nome a ser validado
 */
function validarCampoNome(nome) {
    console.log('[SGQ-SECURITY] Validando campo nome com DataSanitizer');
    
    const inputNome = document.getElementById('nome');
    
    // Remover erro anterior se existir
    let erroDiv = document.getElementById('nome-erro-vies');
    if (erroDiv) {
        erroDiv.remove();
    }
    
    // Remover classe de erro
    inputNome.classList.remove('input-erro-vies');
    
    // Validar com DataSanitizer
    const resultadoVies = DataSanitizer.detectarVies(nome);
    
    if (resultadoVies.temVies) {
        console.log('[SGQ-SECURITY] Viés detectado no nome:', resultadoVies.motivos);
        
        // Adicionar classe de erro
        inputNome.classList.add('input-erro-vies');
        
        // Criar mensagem de erro
        erroDiv = document.createElement('div');
        erroDiv.id = 'nome-erro-vies';
        erroDiv.className = 'erro-validacao';
        erroDiv.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>Por favor, use linguagem neutra e profissional: ${resultadoVies.motivos.join('; ')}</span>
        `;
        
        // Inserir após o input
        inputNome.parentNode.insertBefore(erroDiv, inputNome.nextSibling);
        
        // Desabilitar botão próximo
        const btnProximo = document.getElementById('btn-proximo');
        btnProximo.disabled = true;
        btnProximo.style.opacity = '0.6';
        
        return false;
    }
    
    return true;
}

/**
 * Verifica se todos os campos obrigatórios do Step 1 estão preenchidos
 * E se não há erros de validação
 */
function verificarCamposObrigatoriosStep1() {
    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    const btnProximo = document.getElementById('btn-proximo');
    
    // Verificar se há erro de viés no nome
    const temErroVies = document.getElementById('nome-erro-vies') !== null;

    if (nome && email && telefone && !temErroVies) {
        btnProximo.disabled = false;
        btnProximo.style.opacity = '1';
    } else {
        btnProximo.disabled = true;
        btnProximo.style.opacity = '0.6';
    }
}

/**
 * Salva o lead temporário (Shadow Capture)
 * Após salvar no localStorage, tenta sincronizar com Firebase via dataManager.salvarLead
 * se o email estiver presente (garantindo visibilidade imediata para o comercial)
 * UPSERT: Se firebaseId existir, atualiza o registro existente ao invés de criar novo
 * @param {string} campo - Nome do campo
 * @param {string} valor - Valor do campo
 */
async function salvarLeadShadow(campo, valor) {
    // Obter lead temporário existente ou criar novo
    let leadTemp = obterLeadTemporario();
    
    if (!leadTemp) {
        leadTemp = {
            id: Date.now(),
            status: 'LEAD_INCOMPLETO',
            dataCriacao: new Date().toISOString()
        };
        currentLeadId = leadTemp.id;
    }
    
    // Atualizar campo
    leadTemp[campo] = valor;
    leadTemp.dataUltimaAtualizacao = new Date().toISOString();
    leadTemp.ultimo_campo_focado = campo;
    
    // Salvar no localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leadTemp));
    
    console.log('[SGQ-SECURITY] Shadow Capture: Campo salvo -', campo);
    
    // Se o email estiver presente ou já existir firebaseId, tentar sincronizar com Firebase
    // Isso garante visibilidade imediata para o comercial e mantém UPSERT funcionando
    if ((leadTemp.email && leadTemp.email.trim() !== '') || leadTemp.firebaseId) {
        try {
            console.log('[SGQ-SECURITY] Sincronizando lead com Firebase (UPSERT)');
            const resultado = await dataManager.salvarLead(leadTemp);
            if (resultado && resultado.firebaseId) {
                // Atualizar firebaseId no lead temporário para próximas atualizações (UPSERT)
                leadTemp.firebaseId = resultado.firebaseId;
                localStorage.setItem(STORAGE_KEY, JSON.stringify(leadTemp));
                console.log('[SGQ-SECURITY] Lead sincronizado com Firebase ID:', resultado.firebaseId);
            }
        } catch (error) {
            console.warn('[SGQ-SECURITY] Erro ao sincronizar lead com Firebase:', error);
            // Não bloqueia - lead já está salvo no localStorage
        }
    }
}

/**
 * Obtém o lead temporário do localStorage
 * @returns {Object|null} Lead temporário ou null
 */
function obterLeadTemporario() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : null;
    } catch (error) {
        console.error('[SGQ-SECURITY] Erro ao obter lead temporário:', error);
        return null;
    }
}

/**
 * Mostra indicador visual de que o campo foi capturado
 * @param {string} campo - Nome do campo
 */
function mostrarIndicadorCaptura(campo) {
    const indicador = document.getElementById(`${campo}-captured`);
    if (indicador) {
        indicador.classList.add('show');
        setTimeout(() => {
            indicador.classList.remove('show');
        }, 2000);
    }
}

/**
 * Navegação entre steps
 * @param {number} step - Número do step (1 ou 2)
 */
function irParaStep(step) {
    // Ocultar todos os steps
    document.getElementById('step-1').classList.remove('active');
    document.getElementById('step-2').classList.remove('active');
    
    // Atualizar indicadores
    const step1Indicator = document.getElementById('step-1-indicator');
    const step2Indicator = document.getElementById('step-2-indicator');
    const line1 = document.getElementById('line-1');
    
    if (step === 1) {
        document.getElementById('step-1').classList.add('active');
        step1Indicator.classList.add('active');
        step1Indicator.classList.remove('completed');
        step2Indicator.classList.remove('active');
        line1.classList.remove('completed');
        
        // Reiniciar timer ao voltar para Step 1
        reiniciarTimerInatividade();
    } else if (step === 2) {
        document.getElementById('step-2').classList.add('active');
        step1Indicator.classList.add('completed');
        step1Indicator.classList.remove('active');
        step2Indicator.classList.add('active');
        line1.classList.add('completed');
        
        // Manter monitoramento de inatividade ativo durante todo o formulário
        // Timer continua rodando para detectar abandono em qualquer step
        reiniciarTimerInatividade();
    }
    
    currentStep = step;
    
    // Scroll para o topo
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Carregar espaços do DataManager
 */
async function carregarEspacos() {
    try {
        const salas = dataManager.obterSalas();
        const selectEspaco = document.getElementById('espaco');
        
        selectEspaco.innerHTML = '<option value="">Selecione um espaço...</option>';
        
        salas.forEach(sala => {
            const option = document.createElement('option');
            option.value = sala.id;
            option.textContent = `${sala.unidade} - ${sala.nome} (Cap: ${sala.capacidade} pessoas)`;
            selectEspaco.appendChild(option);
        });
        
        console.log('[SGQ-SECURITY] Espaços carregados com sucesso');
    } catch (error) {
        console.error('[SGQ-SECURITY] Erro ao carregar espaços:', error);
        mostrarNotificacao('Erro ao carregar espaços disponíveis');
    }
}

/**
 * Carregar extras do DataManager (SEM PREÇOS)
 */
async function carregarExtras() {
    try {
        const extras = dataManager.obterExtras();
        const extrasContainer = document.getElementById('extras-checkboxes');
        
        extrasContainer.innerHTML = '';
        
        extras.forEach(extra => {
            const div = document.createElement('div');
            div.className = 'checkbox-group';
            div.innerHTML = `
                <input type="checkbox" id="extra-${extra.id}" value="${extra.id}">
                <label for="extra-${extra.id}">${extra.nome}</label>
            `;
            extrasContainer.appendChild(div);
        });
        
        console.log('[SGQ-SECURITY] Extras carregados com sucesso');
    } catch (error) {
        console.error('[SGQ-SECURITY] Erro ao carregar extras:', error);
    }
}

/**
 * Verificar se a data é final de semana e aplicar restrições
 */
function verificarFinalDeSemana() {
    const dataInput = document.getElementById('dataEvento');
    const quantidadeFuncionarios = document.getElementById('quantidadeFuncionarios');
    const weekendWarning = document.getElementById('weekend-warning');
    
    dataInput.addEventListener('change', function() {
        const data = new Date(this.value + 'T00:00:00');
        const diaSemana = data.getDay(); // 0 = Domingo, 6 = Sábado
        
        console.log('[SGQ-SECURITY] Data selecionada:', this.value, 'Dia da semana:', diaSemana);
        
        if (diaSemana === 0 || diaSemana === 6) {
            // É final de semana - aplicar restrição
            console.log('[SGQ-SECURITY] Final de semana detectado - aplicando restrição mínima de 3 funcionários');
            quantidadeFuncionarios.value = Math.max(3, parseInt(quantidadeFuncionarios.value) || 3);
            quantidadeFuncionarios.min = 3;
            quantidadeFuncionarios.classList.add('weekend-restriction');
            weekendWarning.classList.add('show');
        } else {
            // É dia de semana - remover restrição
            console.log('[SGQ-SECURITY] Dia de semana - removendo restrição');
            quantidadeFuncionarios.min = 1;
            quantidadeFuncionarios.classList.remove('weekend-restriction');
            weekendWarning.classList.remove('show');
        }
    });
    
    // Também verificar alterações diretas no campo de funcionários em finais de semana
    quantidadeFuncionarios.addEventListener('input', function() {
        const dataEvento = document.getElementById('dataEvento').value;
        if (dataEvento) {
            const data = new Date(dataEvento + 'T00:00:00');
            const diaSemana = data.getDay();
            
            if ((diaSemana === 0 || diaSemana === 6) && parseInt(this.value) < 3) {
                console.log('[SGQ-SECURITY] Tentativa de reduzir funcionários abaixo do mínimo em final de semana - corrigindo');
                this.value = 3;
            }
        }
    });
}

/**
 * Inicializar ao carregar a página
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('[SGQ-SECURITY] Inicializando módulo de solicitação de orçamento');
    
    setupShadowCapture();
    carregarEspacos();
    carregarExtras();
    verificarFinalDeSemana();
    verificarCamposObrigatoriosStep1();
    
    // Verificar se há lead temporário e restaurar
    const leadTemp = obterLeadTemporario();
    if (leadTemp) {
        console.log('[SGQ-SECURITY] Lead temporário recuperado:', leadTemp.id);
        if (leadTemp.nome) document.getElementById('nome').value = leadTemp.nome;
        if (leadTemp.telefone) document.getElementById('telefone').value = leadTemp.telefone;
        if (leadTemp.email) document.getElementById('email').value = leadTemp.email;
        currentLeadId = leadTemp.id;
        
        // Verificar se deve habilitar o botão "Próximo"
        verificarCamposObrigatoriosStep1();
        
        mostrarNotificacao('Dados recuperados da sessão anterior');
    }
    
    // Botão "Próximo" - Ir para Step 2
    document.getElementById('btn-proximo').addEventListener('click', async function() {
        console.log('[SGQ-SECURITY] Navegando para Step 2');
        
        // Validar campos do Step 1
        const nome = document.getElementById('nome').value.trim();
        const email = document.getElementById('email').value.trim();
        const telefone = document.getElementById('telefone').value.trim();
        
        if (!nome || !email || !telefone) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        
        // Validar nome com DataSanitizer
        if (!validarCampoNome(nome)) {
            alert('Por favor, corrija o campo Nome antes de continuar.');
            return;
        }
        
        // Sincronização imediata com Firebase ao clicar no botão
        // Obter lead temporário ou criar novo
        let leadTemp = obterLeadTemporario();
        if (!leadTemp) {
            leadTemp = {
                id: Date.now(),
                status: 'LEAD_EM_PREENCHIMENTO',
                dataCriacao: new Date().toISOString()
            };
            currentLeadId = leadTemp.id;
        } else {
            leadTemp.status = 'LEAD_EM_PREENCHIMENTO';
        }
        
        // Atualizar dados do Step 1
        leadTemp.nome = nome;
        leadTemp.email = email;
        leadTemp.telefone = telefone;
        leadTemp.dataUltimaAtualizacao = new Date().toISOString();
        
        // Salvar no localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(leadTemp));
        
        // Sincronizar com Firebase de forma assíncrona
        try {
            console.log('[SGQ-SECURITY] Sincronizando lead com Firebase - Status: LEAD_EM_PREENCHIMENTO');
            const resultado = await dataManager.salvarLead(leadTemp);
            if (resultado && resultado.firebaseId) {
                // Armazenar firebaseId para próximas atualizações (UPSERT)
                currentLeadId = resultado.id;
                leadTemp.firebaseId = resultado.firebaseId;
                localStorage.setItem(STORAGE_KEY, JSON.stringify(leadTemp));
                console.log('[SGQ-SECURITY] Lead sincronizado com Firebase ID:', resultado.firebaseId);
            }
        } catch (error) {
            console.warn('[SGQ-SECURITY] Erro ao sincronizar lead com Firebase:', error);
            // Não bloqueia - lead já está salvo no localStorage
        }
        
        // Ir para Step 2
        irParaStep(2);
    });

    // Botão "Voltar" - Voltar para Step 1
    document.getElementById('btn-voltar').addEventListener('click', function() {
        console.log('[SGQ-SECURITY] Voltando para Step 1');
        irParaStep(1);
    });

    // Envio do formulário (Assíncrono)
    document.getElementById('form-solicitacao').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        console.log('[SGQ-SECURITY] Iniciando submissão do formulário');
        
        // Verificar se dataManager está disponível
        if (typeof dataManager === 'undefined') {
            alert('Erro: Sistema não carregado corretamente. Por favor, recarregue a página.');
            console.error('[SGQ-SECURITY] dataManager não está disponível');
            return;
        }
        
        // Obter referência ao botão de submit
        const submitButton = this.querySelector('button[type="submit"]');
        const originalButtonContent = submitButton.innerHTML;
        
        // Desabilitar botão e mostrar estado de "Enviando..."
        submitButton.disabled = true;
        submitButton.innerHTML = `
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
            // Coletar extras selecionados
            const extrasCheckboxes = document.querySelectorAll('#extras-checkboxes input[type="checkbox"]:checked');
            const extrasSelecionados = Array.from(extrasCheckboxes).map(cb => {
                const extraId = parseInt(cb.value);
                const extra = dataManager.obterExtraPorId(extraId);
                return extra ? extra.nome : null;
            }).filter(nome => nome !== null);

            // Coletar dados do espaço selecionado
            const espacoId = document.getElementById('espaco').value;
            let espacoNome = '';
            if (espacoId) {
                const sala = dataManager.obterSalaPorId(parseInt(espacoId));
                espacoNome = sala ? `${sala.unidade} - ${sala.nome}` : '';
            }

            // Coletar novos campos: Finalidade do Evento e Associado CDL
            const finalidadeEvento = document.getElementById('finalidadeEvento')?.value || '';
            const associadoCDL = document.getElementById('associadoCDL')?.checked || false;

            // Coletar todos os dados do formulário
            const lead = {
                id: currentLeadId || Date.now(),
                status: 'LEAD_NOVO',
                dataCriacao: new Date().toISOString(),
                nome: document.getElementById('nome').value.trim(),
                telefone: document.getElementById('telefone').value.trim(),
                email: document.getElementById('email').value.trim(),
                dataEvento: document.getElementById('dataEvento').value,
                espaco: espacoNome,
                espacoId: espacoId ? parseInt(espacoId) : null,
                horarioInicio: document.getElementById('horario-inicio').value,
                horarioFim: document.getElementById('horario-fim').value,
                quantidadePessoas: document.getElementById('quantidadePessoas').value,
                quantidadeFuncionarios: document.getElementById('quantidadeFuncionarios').value,
                extrasDesejados: extrasSelecionados,
                observacoes: document.getElementById('observacoes').value.trim(),
                // Novos campos
                finalidadeEvento: finalidadeEvento,
                associadoCDL: associadoCDL
            };
            
            console.log('[SGQ-SECURITY] Dados do lead preparados para envio:', lead);
            
            // AGUARDAR salvamento completo (localStorage + Firebase)
            const resultado = await dataManager.salvarLead(lead);
            
            if (!resultado) {
                throw new Error('Falha ao salvar lead - validação falhou');
            }
            
            console.log('[SGQ-SECURITY] Lead salvo com sucesso:', resultado.id);
            
            // Limpar lead temporário
            localStorage.removeItem(STORAGE_KEY);
            currentLeadId = null;
            
            // Limpar timer de inatividade
            if (inactivityTimer) {
                clearTimeout(inactivityTimer);
                inactivityTimer = null;
            }
            
            // Mostrar mensagem de sucesso
            document.getElementById('success-message').classList.add('show');
            
            // Limpar formulário e voltar para Step 1
            this.reset();
            irParaStep(1);
            
            // Scroll para o topo
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            // Ocultar mensagem após 5 segundos
            setTimeout(() => {
                document.getElementById('success-message').classList.remove('show');
            }, 5000);
            
            mostrarNotificacao('Solicitação enviada com sucesso!');
            
        } catch (error) {
            // Tratar erro
            console.error('[SGQ-SECURITY] Erro ao enviar solicitação:', error);
            alert('Erro ao enviar solicitação. Por favor, tente novamente. Se o problema persistir, entre em contato conosco.');
        } finally {
            // Restaurar botão (sempre executado, mesmo em caso de erro)
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonContent;
        }
    });
    
    // Detectar fechamento da página para marcar lead como abandonado
    window.addEventListener('beforeunload', function() {
        const leadTemp = obterLeadTemporario();
        if (leadTemp && (leadTemp.status === 'LEAD_INCOMPLETO' || leadTemp.status === 'LEAD_EM_PREENCHIMENTO')) {
            console.log('[SGQ-SECURITY] Página sendo fechada - marcando lead como abandonado');
            // Salvar de forma síncrona no localStorage apenas
            const finalidadeEvento = document.getElementById('finalidadeEvento');
            const associadoCDL = document.getElementById('associadoCDL');
            const dataEvento = document.getElementById('dataEvento');
            const espaco = document.getElementById('espaco');
            
            leadTemp.status = 'LEAD_ABANDONADO';
            leadTemp.dataAbandono = new Date().toISOString();
            leadTemp.ultimo_campo_focado = lastFocusedField;
            
            if (finalidadeEvento && finalidadeEvento.value.trim()) {
                leadTemp.finalidadeEvento = finalidadeEvento.value.trim();
            }
            
            if (associadoCDL) {
                leadTemp.associadoCDL = associadoCDL.checked;
            }
            
            if (dataEvento && dataEvento.value) {
                leadTemp.dataEvento = dataEvento.value;
            }
            
            if (espaco && espaco.value) {
                leadTemp.espacoId = parseInt(espaco.value);
                leadTemp.espaco = espaco.options[espaco.selectedIndex].text;
            }
            
            localStorage.setItem(STORAGE_KEY, JSON.stringify(leadTemp));
            console.log('[SGQ-SECURITY] Lead salvo localmente como abandonado');
            console.log('[SGQ-SECURITY] Lead salvo localmente como abandonado');
            // Nota: Sincronização com Firebase será feita quando o lead for recarregado ou via timer de inatividade
        }
    });
});
