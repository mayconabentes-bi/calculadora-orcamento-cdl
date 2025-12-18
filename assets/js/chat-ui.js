/* =================================================================
   CHAT UI CONTROLLER - CALCULADORA DE ORÇAMENTO CDL/UTV v5.0
   Controla a interface do chat IA
   ================================================================= */

/**
 * Inicializa o Chat UI quando o DOM estiver pronto
 */
document.addEventListener('DOMContentLoaded', function() {
    // Aguardar dataManager estar disponível
    if (typeof dataManager !== 'undefined') {
        initializeChatUI();
    } else {
        // Tentar novamente após um delay
        setTimeout(() => {
            if (typeof dataManager !== 'undefined') {
                initializeChatUI();
            }
        }, 500);
    }
});

/**
 * Inicializa a interface do chat
 */
function initializeChatUI() {
    // Inicializar Chat IA
    initializeChatAI();

    // Elementos do DOM
    const floatBtn = document.getElementById('chat-float-btn');
    const modal = document.getElementById('chat-modal');
    const closeBtn = document.getElementById('chat-close-btn');
    const minimizeBtn = document.getElementById('chat-minimize-btn');
    const clearBtn = document.getElementById('chat-clear-btn');
    const exportBtn = document.getElementById('chat-export-btn');
    const sendBtn = document.getElementById('chat-send-btn');
    const voiceBtn = document.getElementById('chat-voice-btn');
    const input = document.getElementById('chat-input');
    const suggestions = document.querySelectorAll('.chat-suggestion-btn');

    // Abrir/Fechar chat
    if (floatBtn) {
        floatBtn.addEventListener('click', () => {
            toggleChat();
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            // Check if there's an active quotation in progress
            if (chatAI && chatAI.currentContext && 
                (chatAI.currentContext.stage === 'gathering' || 
                 chatAI.currentContext.stage === 'refining' || 
                 chatAI.currentContext.stage === 'confirming')) {
                if (confirm('Você tem uma cotação em andamento. Deseja realmente fechar? Os dados serão mantidos.')) {
                    closeChat();
                }
            } else {
                closeChat();
            }
        });
    }

    // Minimizar chat
    if (minimizeBtn) {
        minimizeBtn.addEventListener('click', () => {
            minimizeChat();
        });
    }

    // Limpar chat
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (confirm('Deseja limpar todo o histórico do chat?')) {
                if (chatAI) {
                    chatAI.clearChat();
                }
            }
        });
    }

    // Exportar histórico
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            if (chatAI) {
                chatAI.exportHistory();
                mostrarNotificacao('Histórico exportado com sucesso!');
            }
        });
    }

    // Enviar mensagem
    if (sendBtn) {
        sendBtn.addEventListener('click', () => {
            sendMessage();
        });
    }

    // Enter para enviar
    if (input) {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }

    // Botão de voz
    if (voiceBtn) {
        voiceBtn.addEventListener('click', () => {
            if (chatAI) {
                if (chatAI.isListening) {
                    chatAI.stopListening();
                } else {
                    chatAI.startListening();
                }
            }
        });
    }

    // Sugestões rápidas
    suggestions.forEach(btn => {
        btn.addEventListener('click', () => {
            const suggestion = btn.dataset.suggestion;
            if (suggestion && chatAI) {
                input.value = suggestion;
                sendMessage();
            }
        });
    });

    // Clicar no cabeçalho quando minimizado para restaurar
    const chatHeader = document.querySelector('.chat-header-info');
    if (chatHeader) {
        chatHeader.addEventListener('click', () => {
            if (modal && modal.classList.contains('minimized')) {
                minimizeChat(); // Toggle para restaurar
            }
        });
    }

    // Fechar ao clicar fora (opcional)
    document.addEventListener('click', (e) => {
        if (modal && modal.classList.contains('active')) {
            if (!modal.contains(e.target) && !floatBtn.contains(e.target)) {
                // Comentado para não fechar automaticamente
                // closeChat();
            }
        }
    });
}

/**
 * Alterna visibilidade do chat
 */
function toggleChat() {
    const modal = document.getElementById('chat-modal');
    if (modal) {
        if (modal.classList.contains('active')) {
            // Se já está ativo, fecha
            closeChat();
        } else {
            // Se está fechado, abre e remove minimizado
            modal.classList.add('active');
            modal.classList.remove('minimized');
            
            // Check if there's a conversation in progress
            if (chatAI && chatAI.currentContext && chatAI.currentContext.stage !== 'initial') {
                // Offer to continue or start new
                setTimeout(() => {
                    if (chatAI.currentContext.lastQuotation) {
                        chatAI.addMessage(
                            '👋 Bem-vindo de volta!\n\n' +
                            'Você tem uma cotação salva. Quer:\n' +
                            '• "Continuar" de onde parou\n' +
                            '• "Nova cotação" para começar do zero\n\n' +
                            'O que prefere?',
                            'bot'
                        );
                    }
                }, 300);
            }
            
            // Focar no input quando abrir
            const input = document.getElementById('chat-input');
            if (input) {
                setTimeout(() => input.focus(), 100);
            }
        }
    }
}

/**
 * Abre o chat
 */
function openChat() {
    const modal = document.getElementById('chat-modal');
    if (modal) {
        modal.classList.add('active');
        const input = document.getElementById('chat-input');
        if (input) {
            setTimeout(() => input.focus(), 100);
        }
    }
}

/**
 * Fecha o chat
 */
function closeChat() {
    const modal = document.getElementById('chat-modal');
    if (modal) {
        modal.classList.remove('active');
        modal.classList.remove('minimized');
    }
}

/**
 * Minimiza o chat
 */
function minimizeChat() {
    const modal = document.getElementById('chat-modal');
    if (modal) {
        modal.classList.toggle('minimized');
        
        // Atualizar o ícone do botão
        const minimizeBtn = document.getElementById('chat-minimize-btn');
        if (minimizeBtn) {
            if (modal.classList.contains('minimized')) {
                minimizeBtn.innerHTML = '🔲';
                minimizeBtn.title = 'Restaurar';
            } else {
                minimizeBtn.innerHTML = '➖';
                minimizeBtn.title = 'Minimizar';
                
                // Focar no input quando restaurar
                const input = document.getElementById('chat-input');
                if (input) {
                    setTimeout(() => input.focus(), 100);
                }
            }
        }
    }
}

/**
 * Envia mensagem do usuário
 */
function sendMessage() {
    const input = document.getElementById('chat-input');
    if (!input || !chatAI) return;

    const message = input.value.trim();
    if (!message) return;

    // Adicionar mensagem do usuário
    chatAI.addMessage(message, 'user');

    // Limpar input
    input.value = '';

    // Mostrar indicador de digitação
    showTypingIndicator();

    // Processar mensagem com delay para simular processamento
    setTimeout(() => {
        hideTypingIndicator();
        chatAI.processUserInput(message);
    }, 500);
}

/**
 * Mostra indicador de digitação
 */
function showTypingIndicator() {
    const messagesContainer = document.getElementById('chat-messages');
    if (!messagesContainer) return;

    // Remover indicador existente
    const existingIndicator = messagesContainer.querySelector('.chat-typing');
    if (existingIndicator) {
        existingIndicator.remove();
    }

    // Adicionar novo indicador
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-typing active';
    typingDiv.innerHTML = `
        <div class="typing-dots">
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
        </div>
    `;
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * Esconde indicador de digitação
 */
function hideTypingIndicator() {
    const typingIndicator = document.querySelector('.chat-typing');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

/**
 * Aplica cotação do chat na calculadora principal
 */
function applyChatQuotationToCalculator(params, space) {
    // Selecionar espaço
    const espacoSelect = document.getElementById('espaco');
    if (espacoSelect && space) {
        espacoSelect.value = space.id;
        mostrarInfoSala();
    }

    // Definir duração
    const duracaoInput = document.getElementById('duracao');
    const duracaoTipoSelect = document.getElementById('duracao-tipo');
    if (duracaoInput && params.duration) {
        duracaoInput.value = params.duration;
    }
    if (duracaoTipoSelect && params.durationType) {
        duracaoTipoSelect.value = params.durationType;
    }

    // Selecionar dias
    const diasIds = {
        1: 'dia-seg',
        2: 'dia-ter',
        3: 'dia-qua',
        4: 'dia-qui',
        5: 'dia-sex',
        6: 'dia-sab',
        0: 'dia-dom'
    };

    // Desmarcar todos primeiro
    Object.values(diasIds).forEach(id => {
        const checkbox = document.getElementById(id);
        if (checkbox) checkbox.checked = false;
    });

    // Marcar dias selecionados
    if (params.days && Array.isArray(params.days)) {
        params.days.forEach(dia => {
            const id = diasIds[dia];
            const checkbox = document.getElementById(id);
            if (checkbox) checkbox.checked = true;
        });
    }

    // Definir horários
    if (params.startTime && params.endTime) {
        // Limpar horários existentes
        horarios = [];
        // Adicionar novo horário
        adicionarNovoHorario(params.startTime, params.endTime);
    }

    // Fechar chat
    closeChat();

    // Mudar para aba da calculadora
    const calcTab = document.querySelector('[data-tab="calculator"]');
    if (calcTab) {
        calcTab.click();
    }

    // Scroll para o topo
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Mostrar notificação
    mostrarNotificacao('✅ Parâmetros aplicados! Clique em "Calcular Orçamento" para gerar.');
}

/**
 * Adiciona funcionalidade de salvar cotação do chat
 */
function saveChatQuotation() {
    if (!chatAI || !chatAI.currentContext.lastQuotation) {
        return;
    }

    const { params, space } = chatAI.currentContext.lastQuotation;
    
    // Aplicar na calculadora
    applyChatQuotationToCalculator(params, space);
    
    // Responder no chat
    chatAI.addMessage('✅ Cotação aplicada na calculadora! Você pode ajustar os parâmetros e calcular.', 'bot');
}

/**
 * Adds listener for special commands in chat
 */
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for chatAI to be initialized
    setTimeout(() => {
        if (typeof chatAI !== 'undefined' && chatAI) {
            // Intercept apply/save commands
            const originalProcessInput = chatAI.processUserInput;
            chatAI.processUserInput = async function(input) {
                const normalized = input.toLowerCase().trim();
                
                // Handle confirmation when waiting for final confirmation
                if (this.currentContext.waitingForFinalConfirmation && 
                    (normalized.includes('sim') || normalized.includes('confirmar') || 
                     normalized.includes('confirmo') || normalized.includes('pode') ||
                     normalized.includes('beleza') || normalized.includes('ok'))) {
                    
                    this.currentContext.waitingForFinalConfirmation = false;
                    
                    // Check if needs HE confirmation
                    const params = this.currentContext.params;
                    if (this.needsHEConfirmation(params)) {
                        const heResponse = this.requestHEConfirmation(params);
                        this.addMessage(heResponse, 'bot');
                        return;
                    }
                    
                    // Generate quotation
                    try {
                        const quotation = this.generateQuotation(params);
                        const response = this.formatQuotationResponse(quotation, params);
                        this.addMessage(response, 'bot');
                    } catch (error) {
                        console.error('Error generating quotation:', error);
                        this.addMessage('❌ Ops! Tive um problema ao gerar a cotação. Tenta de novo?', 'bot');
                    }
                    return;
                }
                
                // Handle apply/use commands
                if ((normalized.includes('aplicar') || normalized.includes('usar')) && 
                    !normalized.includes('cotação')) {
                    if (this.currentContext.lastQuotation) {
                        saveChatQuotation();
                        return;
                    }
                }
                
                if (normalized.includes('aplicar') || normalized.includes('usar') || 
                    (normalized.includes('salvar') && this.currentContext.lastQuotation)) {
                    saveChatQuotation();
                    return;
                }
                
                // Handle new quotation request
                if ((normalized.includes('nova') || normalized.includes('novo')) && 
                    normalized.includes('cotação')) {
                    this.currentContext = {
                        stage: 'initial',
                        params: {},
                        lastQuotation: null,
                        heConfirmed: false,
                        waitingHEConfirmation: false,
                        pendingParams: null,
                        inferredParams: [],
                        userConfirmations: []
                    };
                    this.addMessage('Beleza! Vamos começar uma nova cotação. 🚀\n\nO que você precisa?', 'bot');
                    return;
                }
                
                // Process normally
                await originalProcessInput.call(this, input);
            };
        }
    }, 1000);
});

// Exportar funções para uso global
window.chatUI = {
    toggleChat,
    openChat,
    closeChat,
    minimizeChat,
    sendMessage,
    applyChatQuotationToCalculator,
    saveChatQuotation
};
