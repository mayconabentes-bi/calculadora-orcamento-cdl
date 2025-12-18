/* =================================================================
   CHAT IA - CALCULADORA DE ORÇAMENTO CDL/UTV v5.0
   Sistema de chat multimodal (texto e voz) com IA para cotações
   ================================================================= */

/**
 * Classe ChatAI
 * Responsável por gerenciar o chat IA com suporte a texto e voz
 */
class ChatAI {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.conversationHistory = [];
        this.currentContext = {};
        this.isListening = false;
        this.recognition = null;
        this.initializeSpeechRecognition();
    }

    /**
     * Inicializa o reconhecimento de voz
     */
    initializeSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.lang = 'pt-BR';
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.maxAlternatives = 1;

            this.recognition.onstart = () => {
                console.log('Reconhecimento de voz iniciado');
                this.addMessage('🎤 Estou te ouvindo... Pode falar!', 'bot');
            };

            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                console.log('Voz reconhecida:', transcript);
                this.handleVoiceInput(transcript);
            };

            this.recognition.onerror = (event) => {
                console.error('Erro no reconhecimento de voz:', event.error);
                this.isListening = false;
                this.updateVoiceButtonState();
                
                let errorMessage = '❌ Ops! Erro no reconhecimento de voz. ';
                
                switch(event.error) {
                    case 'no-speech':
                        errorMessage += 'Não consegui ouvir nada. Tente novamente!';
                        break;
                    case 'audio-capture':
                        errorMessage += 'Não consegui acessar o microfone. Verifique as permissões.';
                        break;
                    case 'not-allowed':
                        errorMessage += 'Permissão negada. Por favor, permita o acesso ao microfone.';
                        break;
                    case 'network':
                        errorMessage += 'Erro de rede. Verifique sua conexão.';
                        break;
                    default:
                        errorMessage += 'Tente novamente ou use o texto.';
                }
                
                this.addMessage(errorMessage, 'bot');
            };

            this.recognition.onend = () => {
                console.log('Reconhecimento de voz finalizado');
                this.isListening = false;
                this.updateVoiceButtonState();
            };
        } else {
            console.warn('Reconhecimento de voz não suportado neste navegador');
        }
    }

    /**
     * Inicia o reconhecimento de voz
     */
    startListening() {
        if (this.recognition) {
            try {
                this.isListening = true;
                this.updateVoiceButtonState();
                this.recognition.start();
            } catch (error) {
                console.error('Erro ao iniciar reconhecimento:', error);
                this.isListening = false;
                this.updateVoiceButtonState();
                this.addMessage('❌ Não foi possível iniciar o reconhecimento de voz. Tente novamente!', 'bot');
            }
        } else {
            this.addMessage('😕 Reconhecimento de voz não suportado neste navegador. Tente usar Chrome, Edge ou Safari.', 'bot');
        }
    }

    /**
     * Para o reconhecimento de voz
     */
    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            this.isListening = false;
            this.updateVoiceButtonState();
        }
    }

    /**
     * Atualiza o estado visual do botão de voz
     */
    updateVoiceButtonState() {
        const voiceBtn = document.getElementById('chat-voice-btn');
        if (voiceBtn) {
            if (this.isListening) {
                voiceBtn.classList.add('listening');
                voiceBtn.innerHTML = '🔴';
                voiceBtn.title = 'Parar gravação';
            } else {
                voiceBtn.classList.remove('listening');
                voiceBtn.innerHTML = '🎤';
                voiceBtn.title = 'Falar comando';
            }
        }
    }

    /**
     * Processa entrada de voz
     */
    handleVoiceInput(text) {
        this.addMessage(text, 'user');
        this.processUserInput(text);
    }

    /**
     * Processa entrada de texto ou voz do usuário
     */
    async processUserInput(input) {
        // Limpar e normalizar entrada
        const normalizedInput = input.toLowerCase().trim();

        // Adicionar ao histórico
        this.conversationHistory.push({
            role: 'user',
            content: input,
            timestamp: new Date()
        });

        // Processar comando
        const response = await this.interpretCommand(normalizedInput);
        
        // Adicionar resposta ao histórico
        this.conversationHistory.push({
            role: 'bot',
            content: response,
            timestamp: new Date()
        });

        // Exibir resposta
        this.addMessage(response, 'bot');
    }

    /**
     * Interpreta comandos em linguagem natural (NLP)
     */
    async interpretCommand(input) {
        // Detectar tipo de comando
        if (this.isGreeting(input)) {
            return this.handleGreeting();
        }

        if (this.isThankYou(input)) {
            return this.handleThankYou();
        }

        if (this.isGoodbye(input)) {
            return this.handleGoodbye();
        }

        if (this.isQuotationRequest(input)) {
            return await this.handleQuotationRequest(input);
        }

        if (this.isParameterUpdate(input)) {
            return await this.handleParameterUpdate(input);
        }

        if (this.isHelp(input)) {
            return this.handleHelp();
        }

        if (this.isListSpaces(input)) {
            return this.handleListSpaces();
        }

        if (this.isListEmployees(input)) {
            return this.handleListEmployees();
        }

        // Comando não reconhecido
        return this.handleUnknownCommand();
    }

    /**
     * Verifica se é uma saudação
     */
    isGreeting(input) {
        const greetings = ['oi', 'olá', 'ola', 'bom dia', 'boa tarde', 'boa noite', 'hey', 'alô', 'alo', 
                          'e aí', 'e ai', 'opa', 'salve', 'fala'];
        return greetings.some(g => input.includes(g)) && input.length < 30; // Saudação geralmente é curta
    }

    /**
     * Processa saudação
     */
    handleGreeting() {
        const responses = [
            `Olá! 👋 Fico feliz em ajudar você hoje!\n\nSou especialista em cotações da CDL/UTV. Posso criar orçamentos personalizados de forma rápida e fácil.\n\nPor exemplo, você pode me dizer:\n"Preciso de uma cotação para 3 meses, de segunda a sexta"\n\nOu simplesmente pergunte "como funciona?" para eu te explicar melhor. 😊`,
            `Oi! 🌟 É um prazer conversar com você!\n\nEstou aqui para facilitar a criação de orçamentos para locação de espaços.\n\nQue tal começarmos? Você pode me dizer:\n"Quero fazer uma proposta para 2 meses aos finais de semana"\n\nOu diga "ajuda" para conhecer todas as minhas funcionalidades! 💡`,
            `Olá! 👋 Bem-vindo ao assistente de cotações!\n\nVou te ajudar a criar orçamentos de forma simples e conversacional.\n\nExemplo: "Gerar cotação para 3 meses com 5 funcionários aos sábados e domingos"\n\nSe tiver dúvidas, é só perguntar! Estou aqui para isso. 😄`
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    /**
     * Verifica se é um agradecimento
     */
    isThankYou(input) {
        const thanks = ['obrigad', 'obrigad', 'valeu', 'vlw', 'agradeço', 'agradeco', 'thank'];
        return thanks.some(t => input.includes(t));
    }

    /**
     * Processa agradecimento
     */
    handleThankYou() {
        const responses = [
            `Por nada! 😊 Fico feliz em ajudar!\n\nPrecisa de mais alguma coisa?`,
            `Disponha! 🌟 Estou sempre aqui quando precisar!\n\nQuer fazer mais alguma cotação?`,
            `É um prazer! 💙 Se precisar de qualquer outra ajuda, é só chamar!`,
            `De nada! 😄 Espero ter sido útil!\n\nAlgo mais que posso fazer por você?`
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    /**
     * Verifica se é uma despedida
     */
    isGoodbye(input) {
        const goodbyes = ['tchau', 'até logo', 'ate logo', 'até mais', 'ate mais', 'falou', 
                         'abraço', 'abraco', 'bye', 'adeus'];
        return goodbyes.some(g => input.includes(g));
    }

    /**
     * Processa despedida
     */
    handleGoodbye() {
        const responses = [
            `Até logo! 👋 Foi um prazer te ajudar!\n\nVolte sempre que precisar! 😊`,
            `Tchau! 🌟 Sempre que precisar de orçamentos, estarei aqui!\n\nTenha um ótimo dia! ☀️`,
            `Até mais! 💙 Fico feliz em ter ajudado!\n\nQualquer coisa é só chamar! 👍`,
            `Falou! 😄 Sucesso com suas cotações!\n\nEstou aqui quando precisar! 🚀`
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    /**
     * Verifica se é um pedido de cotação
     */
    isQuotationRequest(input) {
        const keywords = ['gerar', 'criar', 'fazer', 'calcular', 'cotação', 'cotacao', 'orçamento', 'orcamento', 'proposta'];
        return keywords.some(k => input.includes(k));
    }

    /**
     * Processa pedido de cotação
     */
    async handleQuotationRequest(input) {
        // Extrair parâmetros do comando
        const params = this.extractParameters(input);
        
        // Validar parâmetros obrigatórios
        const validation = this.validateParameters(params);
        
        if (!validation.isValid) {
            return this.requestMissingParameters(validation.missing);
        }

        // Verificar se precisa confirmar HE
        if (this.needsHEConfirmation(params)) {
            return this.requestHEConfirmation(params);
        }

        // Gerar cotação
        try {
            const quotation = this.generateQuotation(params);
            return this.formatQuotationResponse(quotation, params);
        } catch (error) {
            console.error('Erro ao gerar cotação:', error);
            return `❌ Desculpe, ocorreu um erro ao gerar a cotação. Por favor, verifique os parâmetros e tente novamente.`;
        }
    }

    /**
     * Extrai parâmetros do comando em linguagem natural
     */
    extractParameters(input) {
        const params = {
            employees: null,
            duration: null,
            durationType: 'meses',
            days: [],
            startTime: '08:00',
            endTime: '18:00',
            space: null,
            margin: 30,
            discount: 20
        };

        // Extrair número de funcionários
        const employeeMatch = input.match(/(\d+)\s*(?:funcionário|funcionarios|funcionária|funcionarias|func)/i);
        if (employeeMatch) {
            params.employees = parseInt(employeeMatch[1]);
        }

        // Extrair duração
        const durationMatch = input.match(/(\d+)\s*(?:mês|meses|mes|dia|dias)/i);
        if (durationMatch) {
            params.duration = parseInt(durationMatch[1]);
            if (input.includes('dia')) {
                params.durationType = 'dias';
            }
        }

        // Extrair dias da semana
        if (input.includes('segunda') || input.includes('seg')) params.days.push(1);
        if (input.includes('terça') || input.includes('terca') || input.includes('ter')) params.days.push(2);
        if (input.includes('quarta') || input.includes('qua')) params.days.push(3);
        if (input.includes('quinta') || input.includes('qui')) params.days.push(4);
        if (input.includes('sexta') || input.includes('sex')) params.days.push(5);
        if (input.includes('sábado') || input.includes('sabado') || input.includes('sab')) params.days.push(6);
        if (input.includes('domingo') || input.includes('dom')) params.days.push(0);

        // Detectar padrões comuns
        if (input.includes('segunda a sexta') || input.includes('segunda à sexta')) {
            params.days = [1, 2, 3, 4, 5];
        }
        if (input.includes('fim de semana')) {
            params.days = [6, 0];
        }
        if (input.includes('todos os dias') || input.includes('toda semana')) {
            params.days = [1, 2, 3, 4, 5, 6, 0];
        }

        // Extrair horários
        const timeMatch = input.match(/(\d{1,2})h(?:\s*às|\s*as|\s*até|\s*-)?\s*(\d{1,2})h?/i);
        if (timeMatch) {
            params.startTime = `${timeMatch[1].padStart(2, '0')}:00`;
            params.endTime = `${timeMatch[2].padStart(2, '0')}:00`;
        }

        // Extrair espaço (tentar encontrar nome de sala)
        const spaces = this.dataManager.obterSalas();
        for (const space of spaces) {
            if (input.includes(space.nome.toLowerCase())) {
                params.space = space.id;
                break;
            }
        }

        // Se não encontrou espaço específico, usar o primeiro
        if (!params.space && spaces.length > 0) {
            params.space = spaces[0].id;
        }

        return params;
    }

    /**
     * Valida parâmetros obrigatórios
     */
    validateParameters(params) {
        const missing = [];

        if (!params.duration) missing.push('duração do contrato');
        if (!params.days || params.days.length === 0) missing.push('dias da semana');
        if (!params.space) missing.push('espaço');

        return {
            isValid: missing.length === 0,
            missing: missing
        };
    }

    /**
     * Solicita parâmetros faltantes
     */
    requestMissingParameters(missing) {
        const intro = [
            `🤔 Certo! Para criar a cotação completa, preciso saber mais algumas coisas:`,
            `👍 Entendi! Só preciso de mais alguns detalhes:`,
            `✨ Ótimo! Para finalizar, me conta:`
        ][Math.floor(Math.random() * 3)];
        
        const missingText = missing.map(m => {
            if (m === 'duração do contrato') return '• Por quanto tempo será o contrato? (ex: 3 meses ou 30 dias)';
            if (m === 'dias da semana') return '• Quais dias da semana? (ex: segunda a sexta, ou finais de semana)';
            if (m === 'espaço') return '• Qual espaço você prefere? (pode dizer "listar espaços" para ver as opções)';
            return `• ${m}`;
        }).join('\n');
        
        return `${intro}\n\n${missingText}\n\n💬 Pode me contar tudo de uma vez ou uma coisa de cada vez, como preferir!`;
    }

    /**
     * Verifica se precisa confirmar horas extras
     */
    needsHEConfirmation(params) {
        // Se tem sábado ou domingo e não foi explicitamente mencionado HE
        return (params.days.includes(6) || params.days.includes(0)) && !this.currentContext.heConfirmed;
    }

    /**
     * Solicita confirmação de HE
     */
    requestHEConfirmation(params) {
        let message = '⚠️ **Atenção para as Horas Extras!**\n\n';
        message += 'Notei que você incluiu finais de semana. Neste caso:\n\n';
        
        if (params.days.includes(6)) {
            message += '• 📅 **Sábados** = Hora Extra 50% (custo adicional de 50%)\n';
        }
        if (params.days.includes(0)) {
            message += '• 📅 **Domingos** = Hora Extra 100% (custo adicional de 100%)\n';
        }
        
        message += '\nIsso aumentará o valor da proposta, mas garante que tudo seja calculado corretamente.\n\n';
        message += '✅ Posso continuar com essas condições?\n\n';
        message += '💬 Responda "sim" ou "confirmar" para prosseguir!';
        
        this.currentContext.pendingParams = params;
        this.currentContext.waitingHEConfirmation = true;
        
        return message;
    }

    /**
     * Gera cotação baseada nos parâmetros
     */
    generateQuotation(params) {
        // Obter dados necessários
        const space = this.dataManager.obterSalaPorId(params.space);
        const activeEmployees = this.dataManager.obterFuncionariosAtivos();
        
        // Limitar número de funcionários se especificado
        const employees = params.employees ? activeEmployees.slice(0, params.employees) : activeEmployees;
        
        // Calcular horas por dia
        const startMinutes = this.parseTimeToMinutes(params.startTime);
        const endMinutes = this.parseTimeToMinutes(params.endTime);
        const hoursPerDay = (endMinutes - startMinutes) / 60;

        // Usar a função de cálculo existente
        // Simular o cálculo com os parâmetros do chat
        const resultado = this.calculateQuotation(space, params.duration, params.durationType, 
                                                  params.days, hoursPerDay, params.margin / 100, 
                                                  params.discount / 100, employees);

        return {
            space,
            params,
            resultado,
            employees: employees.length
        };
    }

    /**
     * Calcula cotação (similar à função calcularValores do app.js)
     */
    calculateQuotation(sala, duracao, duracaoTipo, diasSelecionados, horasPorDia, margem, desconto, funcionarios) {
        const multiplicadores = this.dataManager.obterMultiplicadoresTurno();
        
        // Converter duração para dias
        let duracaoEmDias = duracao;
        if (duracaoTipo === 'meses') {
            duracaoEmDias = duracao * 30;
        }
        
        // Calcular total de dias trabalhados
        const semanas = Math.floor(duracaoEmDias / 7);
        const diasRestantes = duracaoEmDias % 7;
        
        let diasTrabalhadosPorTipo = {
            normais: 0,
            sabado: 0,
            domingo: 0
        };
        
        // Contar dias por tipo
        diasSelecionados.forEach(dia => {
            if (dia === 6) {
                diasTrabalhadosPorTipo.sabado += semanas;
            } else if (dia === 0) {
                diasTrabalhadosPorTipo.domingo += semanas;
            } else {
                diasTrabalhadosPorTipo.normais += semanas;
            }
        });
        
        // Adicionar dias restantes
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
        
        // Calcular horas
        const horasNormais = diasTrabalhadosPorTipo.normais * horasPorDia;
        const horasHE50 = diasTrabalhadosPorTipo.sabado * horasPorDia;
        const horasHE100 = diasTrabalhadosPorTipo.domingo * horasPorDia;
        const horasTotais = horasNormais + horasHE50 + horasHE100;
        
        // Calcular custos
        const multiplicadorMedio = (multiplicadores.manha + multiplicadores.tarde + multiplicadores.noite) / 3;
        const custoOperacionalBase = sala.custoBase * multiplicadorMedio * horasTotais;
        
        // Custos de funcionários
        let custoMaoObraNormal = 0;
        let custoMaoObraHE50 = 0;
        let custoMaoObraHE100 = 0;
        let custoValeTransporte = 0;
        let custoTransporteApp = 0;
        let custoRefeicao = 0;
        
        funcionarios.forEach(func => {
            custoMaoObraNormal += horasNormais * func.horaNormal;
            custoMaoObraHE50 += horasHE50 * func.he50;
            custoMaoObraHE100 += horasHE100 * func.he100;
            custoValeTransporte += diasTotais * func.valeTransporte;
            custoTransporteApp += diasTotais * (func.transporteApp || 0);
            custoRefeicao += diasTotais * (func.refeicao || 0);
        });
        
        const custoMaoObraTotal = custoMaoObraNormal + custoMaoObraHE50 + custoMaoObraHE100;
        
        // Subtotal
        const subtotalSemMargem = custoOperacionalBase + custoMaoObraTotal + custoValeTransporte + 
                                  custoTransporteApp + custoRefeicao;
        
        // Margem
        const valorMargem = subtotalSemMargem * margem;
        const subtotalComMargem = subtotalSemMargem + valorMargem;
        
        // Desconto
        const valorDesconto = subtotalComMargem * desconto;
        const valorFinal = subtotalComMargem - valorDesconto;
        
        return {
            horasTotais,
            horasNormais,
            horasHE50,
            horasHE100,
            diasTotais,
            valorFinal,
            subtotalSemMargem,
            valorMargem,
            valorDesconto,
            custoMaoObraNormal,
            custoMaoObraHE50,
            custoMaoObraHE100,
            custoValeTransporte,
            custoTransporteApp,
            custoRefeicao
        };
    }

    /**
     * Formata resposta da cotação
     */
    formatQuotationResponse(quotation, params) {
        const { space, resultado, employees } = quotation;
        
        // Formatar dias selecionados
        const daysNames = {
            0: 'Domingo',
            1: 'Segunda-feira',
            2: 'Terça-feira',
            3: 'Quarta-feira',
            4: 'Quinta-feira',
            5: 'Sexta-feira',
            6: 'Sábado'
        };
        const selectedDays = params.days.map(d => daysNames[d]).join(', ');

        let response = `✨ **Prontinho! Sua cotação está pronta!** ✨\n\n`;
        response += `📋 **Resumo da Proposta:**\n\n`;
        response += `📍 **Espaço:** ${space.nome} (${space.unidade})\n`;
        response += `👥 **Equipe:** ${employees} ${employees === 1 ? 'funcionário' : 'funcionários'}\n`;
        response += `📅 **Duração:** ${params.duration} ${params.durationType}\n`;
        response += `📆 **Dias da semana:** ${selectedDays}\n`;
        response += `⏰ **Horário de trabalho:** ${params.startTime} às ${params.endTime}\n\n`;
        
        response += `⏱️ **Carga Horária:**\n`;
        response += `   • Total: ${resultado.horasTotais.toFixed(1)}h\n`;
        response += `   • Horas normais: ${resultado.horasNormais.toFixed(1)}h\n`;
        if (resultado.horasHE50 > 0) {
            response += `   • HE 50% (Sábados): ${resultado.horasHE50.toFixed(1)}h\n`;
        }
        if (resultado.horasHE100 > 0) {
            response += `   • HE 100% (Domingos): ${resultado.horasHE100.toFixed(1)}h\n`;
        }
        
        response += `\n💰 **Composição de Custos:**\n`;
        response += `   • Mão de obra (normal): R$ ${this.formatCurrency(resultado.custoMaoObraNormal)}\n`;
        if (resultado.custoMaoObraHE50 > 0) {
            response += `   • Mão de obra (HE 50%): R$ ${this.formatCurrency(resultado.custoMaoObraHE50)}\n`;
        }
        if (resultado.custoMaoObraHE100 > 0) {
            response += `   • Mão de obra (HE 100%): R$ ${this.formatCurrency(resultado.custoMaoObraHE100)}\n`;
        }
        response += `   • Vale transporte: R$ ${this.formatCurrency(resultado.custoValeTransporte)}\n`;
        if (resultado.custoTransporteApp > 0) {
            response += `   • Transporte por app: R$ ${this.formatCurrency(resultado.custoTransporteApp)}\n`;
        }
        if (resultado.custoRefeicao > 0) {
            response += `   • Refeições: R$ ${this.formatCurrency(resultado.custoRefeicao)}\n`;
        }
        
        response += `\n🎯 **VALOR TOTAL: R$ ${this.formatCurrency(resultado.valorFinal)}**\n\n`;
        response += `💡 **O que você quer fazer agora?**\n`;
        response += `• Diga "aplicar" para usar na calculadora\n`;
        response += `• Diga "salvar" para guardar esta cotação\n`;
        response += `• Ou peça para "alterar" algo que queira mudar\n\n`;
        response += `Estou à disposição! 😊`;

        // Armazenar cotação no contexto
        this.currentContext.lastQuotation = {
            params,
            resultado,
            space
        };

        return response;
    }

    /**
     * Verifica se é uma atualização de parâmetro
     */
    isParameterUpdate(input) {
        const keywords = ['alterar', 'mudar', 'trocar', 'ajustar', 'modificar', 'atualizar'];
        return keywords.some(k => input.includes(k));
    }

    /**
     * Processa atualização de parâmetro
     */
    handleParameterUpdate(input) {
        if (!this.currentContext.lastQuotation) {
            return '⚠️ Não há cotação ativa. Por favor, gere uma cotação primeiro.';
        }

        // Extrair novos parâmetros
        const newParams = this.extractParameters(input);
        
        // Mesclar com parâmetros anteriores
        const updatedParams = { ...this.currentContext.lastQuotation.params, ...newParams };
        
        // Gerar nova cotação
        const quotation = this.generateQuotation(updatedParams);
        return this.formatQuotationResponse(quotation, updatedParams);
    }

    /**
     * Verifica se é pedido de ajuda
     */
    isHelp(input) {
        return input.includes('ajuda') || input.includes('help') || input === '?' || 
               input.includes('como funciona') || input.includes('o que você faz') ||
               input.includes('o que voce faz') || input.includes('pode me ajudar');
    }

    /**
     * Processa pedido de ajuda
     */
    handleHelp() {
        return `📚 **COMO POSSO TE AJUDAR:**\n\n` +
               `Sou seu assistente virtual para criar orçamentos de locação de espaços. Funciono de forma bem natural, como numa conversa!\n\n` +
               `**💬 Exemplos de como conversar comigo:**\n\n` +
               `**Para criar cotações:**\n` +
               `• "Preciso de uma cotação para 3 meses"\n` +
               `• "Quero orçamento de 30 dias, segunda a sexta, das 8h às 18h"\n` +
               `• "Fazer proposta para finais de semana com 4 funcionários"\n\n` +
               `**Para consultar informações:**\n` +
               `• "Quais espaços estão disponíveis?"\n` +
               `• "Me mostre os funcionários"\n` +
               `• "Quanto custa o Auditório?"\n\n` +
               `**Para modificar cotações:**\n` +
               `• "Melhor fazer com 6 meses"\n` +
               `• "Aumenta para 10 funcionários"\n` +
               `• "Adiciona a quinta-feira também"\n\n` +
               `💡 **Dica:** Fale naturalmente! Não precisa decorar comandos específicos. Estou aqui para entender você! 😊\n\n` +
               `🎤 Você pode usar o botão do microfone para falar ao invés de digitar!`;
    }

    /**
     * Verifica se é pedido de listagem de espaços
     */
    isListSpaces(input) {
        return (input.includes('listar') || input.includes('mostrar') || input.includes('ver')) && 
               (input.includes('espaço') || input.includes('espaco') || input.includes('sala'));
    }

    /**
     * Lista espaços disponíveis
     */
    handleListSpaces() {
        const spaces = this.dataManager.obterSalas();
        let response = '🏛️ **ESPAÇOS DISPONÍVEIS:**\n\n';
        
        spaces.forEach(space => {
            response += `• **${space.nome}** (${space.unidade})\n`;
            response += `  Capacidade: ${space.capacidade} pessoas | Área: ${space.area}m²\n\n`;
        });
        
        return response;
    }

    /**
     * Verifica se é pedido de listagem de funcionários
     */
    isListEmployees(input) {
        return (input.includes('listar') || input.includes('mostrar') || input.includes('ver')) && 
               (input.includes('funcionário') || input.includes('funcionario') || input.includes('func'));
    }

    /**
     * Lista funcionários ativos
     */
    handleListEmployees() {
        const employees = this.dataManager.obterFuncionariosAtivos();
        let response = '👥 **FUNCIONÁRIOS ATIVOS:**\n\n';
        
        employees.forEach((emp, index) => {
            response += `${index + 1}. **${emp.nome}**\n`;
            response += `   Hora Normal: R$ ${this.formatCurrency(emp.horaNormal)}/h\n`;
            response += `   HE 50%: R$ ${this.formatCurrency(emp.he50)}/h\n`;
            response += `   HE 100%: R$ ${this.formatCurrency(emp.he100)}/h\n\n`;
        });
        
        return response;
    }

    /**
     * Processa comando desconhecido
     */
    handleUnknownCommand() {
        const responses = [
            `🤔 Hmm, não consegui entender completamente. Pode reformular?\n\n` +
            `Algumas coisas que posso fazer:\n` +
            `• Criar cotações (ex: "cotação para 3 meses")\n` +
            `• Mostrar espaços disponíveis\n` +
            `• Responder suas dúvidas\n\n` +
            `Digite "ajuda" para ver mais exemplos! 😊`,
            
            `😅 Ops! Não entendi direito. Vamos tentar de novo?\n\n` +
            `Você pode me pedir para:\n` +
            `• Gerar um orçamento\n` +
            `• Ver os espaços\n` +
            `• Listar funcionários\n\n` +
            `Ou diga "como funciona" para eu te explicar melhor!`,
            
            `❓ Desculpe, ainda estou aprendendo essa. Pode tentar de outra forma?\n\n` +
            `Experimente algo como:\n` +
            `• "Preciso de uma cotação para 2 meses"\n` +
            `• "Quais espaços você tem?"\n` +
            `• "Ajuda" para ver todas opções\n\n` +
            `Estou aqui para ajudar! 💪`
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    /**
     * Adiciona mensagem ao chat
     */
    addMessage(text, sender) {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}`;
        
        // Converter markdown básico
        const formattedText = this.formatMarkdown(text);
        messageDiv.innerHTML = formattedText;
        
        messagesContainer.appendChild(messageDiv);
        
        // Scroll para o fim
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    /**
     * Formata texto com markdown básico
     */
    formatMarkdown(text) {
        let formatted = text;
        
        // Negrito
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Quebras de linha
        formatted = formatted.replace(/\n/g, '<br>');
        
        return formatted;
    }

    /**
     * Converte horário em minutos
     */
    parseTimeToMinutes(timeString) {
        const [hora, minuto] = timeString.split(':').map(Number);
        return hora * 60 + minuto;
    }

    /**
     * Formata valor monetário
     */
    formatCurrency(value) {
        return value.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }

    /**
     * Limpa o chat
     */
    clearChat() {
        const messagesContainer = document.getElementById('chat-messages');
        if (messagesContainer) {
            messagesContainer.innerHTML = '';
        }
        this.conversationHistory = [];
        this.currentContext = {};
        this.addMessage('Chat limpo! Como posso ajudar?', 'bot');
    }

    /**
     * Exporta histórico do chat
     */
    exportHistory() {
        const data = {
            history: this.conversationHistory,
            context: this.currentContext,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat-history-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// Variável global para instância do chat
let chatAI = null;

/**
 * Inicializa o Chat IA
 */
function initializeChatAI() {
    if (typeof dataManager !== 'undefined') {
        chatAI = new ChatAI(dataManager);
        console.log('Chat IA inicializado com sucesso!');
    } else {
        console.error('DataManager não encontrado. Chat IA não pode ser inicializado.');
    }
}
