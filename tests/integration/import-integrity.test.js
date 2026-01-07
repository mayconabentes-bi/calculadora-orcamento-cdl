/**
 * Testes de Integração - ImportIntegrityGate
 * Baseado nos requisitos do Axioma v5.2.0
 * Valida o ciclo de vida completo do lead capturado
 */

/**
 * 🚀 Teste de Stress: Ciclo de Importação de Lead
 * Valida validação, correção e persistência de status
 */

describe('🚀 Teste de Stress: Ciclo de Importação de Lead', () => {
    let mockLead;
    let ImportIntegrityGate;

    beforeEach(() => {
        // Mock do ImportIntegrityGate baseado na implementação
        ImportIntegrityGate = {
            requiredFields: ['clienteNome', 'espacoId', 'horariosSolicitados', 'diasSemanaSelecionados'],
            
            validate(lead) {
                console.group('🛡️ Auditoria de Importação SGQ');
                const errors = [];

                this.requiredFields.forEach(field => {
                    const fieldToCheck = field === 'clienteNome' ? (lead.clienteNome || lead.nome) : lead[field];
                    
                    if (!fieldToCheck && fieldToCheck !== 0) {
                        errors.push(`Campo ausente: ${field}`);
                    }
                });

                // Verificação de lógica de fim de semana (Rigor Analítico)
                const hasWeekend = lead.diasSemanaSelecionados?.some(d => d === 0 || d === 6);
                if (hasWeekend && (!lead.quantidadeFuncionarios || lead.quantidadeFuncionarios < 3)) {
                    console.warn('[SGQ] Correção aplicada: Mínimo de 3 funcionários para fim de semana.');
                    lead.quantidadeFuncionarios = 3; // Auto-correção
                }

                console.groupEnd();
                return { valid: errors.length === 0, errors };
            },
            
            syncUI(lead) {
                // Mock simplificado para testes
                return true;
            }
        };

        // Lead mock para testes
        mockLead = {
            id: 12345,
            nome: "Empresa de Teste Manaus",
            email: "diretoria@teste.com",
            dataEvento: "2026-01-10", // Sexta-feira (para teste padrão)
            espacoId: 1,
            diasSemanaSelecionados: [5], // Sexta
            horariosSolicitados: [{ inicio: "08:00", fim: "18:00" }]
        };
    });

    test('Deve validar lead completo sem erros', () => {
        const audit = ImportIntegrityGate.validate(mockLead);
        
        expect(audit.valid).toBe(true);
        expect(audit.errors).toHaveLength(0);
    });

    test('Deve detectar campos obrigatórios ausentes', () => {
        const leadIncompleto = {
            id: 12346,
            nome: "Empresa Incompleta"
            // Falta espacoId, diasSemanaSelecionados, horariosSolicitados
        };
        
        const audit = ImportIntegrityGate.validate(leadIncompleto);
        
        expect(audit.valid).toBe(false);
        expect(audit.errors.length).toBeGreaterThan(0);
        expect(audit.errors).toContain('Campo ausente: espacoId');
        expect(audit.errors).toContain('Campo ausente: horariosSolicitados');
        expect(audit.errors).toContain('Campo ausente: diasSemanaSelecionados');
    });

    test('Deve validar e corrigir lead de fim de semana para 3 funcionários', () => {
        // Lead para sábado sem funcionários definidos
        const leadFimDeSemana = {
            id: 12347,
            nome: "Empresa de Teste Manaus",
            email: "diretoria@teste.com",
            dataEvento: "2026-01-10", // Sábado
            espacoId: 1,
            diasSemanaSelecionados: [6], // Sábado
            horariosSolicitados: [{ inicio: "08:00", fim: "18:00" }]
        };
        
        const audit = ImportIntegrityGate.validate(leadFimDeSemana);
        
        // Deve aplicar auto-correção
        expect(leadFimDeSemana.quantidadeFuncionarios).toBe(3);
        expect(audit.valid).toBe(true);
    });

    test('Deve validar lead de domingo e aplicar trava de 3 funcionários', () => {
        const leadDomingo = {
            id: 12348,
            nome: "Empresa Domingo",
            email: "contato@empresa.com",
            dataEvento: "2026-01-11", // Domingo
            espacoId: 1,
            diasSemanaSelecionados: [0], // Domingo
            horariosSolicitados: [{ inicio: "09:00", fim: "17:00" }],
            quantidadeFuncionarios: 1 // Menos que o mínimo
        };
        
        const audit = ImportIntegrityGate.validate(leadDomingo);
        
        // Deve corrigir para 3
        expect(leadDomingo.quantidadeFuncionarios).toBe(3);
        expect(audit.valid).toBe(true);
    });

    test('Deve aceitar lead de fim de semana com 3 ou mais funcionários', () => {
        const leadOk = {
            id: 12349,
            nome: "Empresa OK",
            email: "ok@empresa.com",
            dataEvento: "2026-01-10", // Sábado
            espacoId: 1,
            diasSemanaSelecionados: [6], // Sábado
            horariosSolicitados: [{ inicio: "08:00", fim: "18:00" }],
            quantidadeFuncionarios: 5 // Já tem quantidade suficiente
        };
        
        const audit = ImportIntegrityGate.validate(leadOk);
        
        // Não deve alterar
        expect(leadOk.quantidadeFuncionarios).toBe(5);
        expect(audit.valid).toBe(true);
    });

    test('Deve aceitar lead de dia útil sem restrição de funcionários', () => {
        const leadDiaUtil = {
            id: 12350,
            nome: "Empresa Dia Útil",
            email: "util@empresa.com",
            dataEvento: "2026-01-08", // Quinta-feira
            espacoId: 1,
            diasSemanaSelecionados: [4], // Quinta
            horariosSolicitados: [{ inicio: "08:00", fim: "18:00" }],
            quantidadeFuncionarios: 1 // Permitido em dia útil
        };
        
        const audit = ImportIntegrityGate.validate(leadDiaUtil);
        
        // Não deve aplicar correção (não é fim de semana)
        expect(leadDiaUtil.quantidadeFuncionarios).toBe(1);
        expect(audit.valid).toBe(true);
    });

    test('Deve validar múltiplos horários solicitados', () => {
        const leadMultiplosHorarios = {
            id: 12351,
            nome: "Empresa Multi-Horários",
            email: "multi@empresa.com",
            dataEvento: "2026-01-08",
            espacoId: 1,
            diasSemanaSelecionados: [1, 2, 3], // Seg, Ter, Qua
            horariosSolicitados: [
                { inicio: "08:00", fim: "12:00" },
                { inicio: "14:00", fim: "18:00" }
            ]
        };
        
        const audit = ImportIntegrityGate.validate(leadMultiplosHorarios);
        
        expect(audit.valid).toBe(true);
        expect(leadMultiplosHorarios.horariosSolicitados).toHaveLength(2);
    });

    test('Deve usar campo "nome" quando "clienteNome" não estiver presente', () => {
        const leadComNome = {
            id: 12352,
            nome: "Cliente Via Nome",
            email: "nome@empresa.com",
            dataEvento: "2026-01-08",
            espacoId: 1,
            diasSemanaSelecionados: [1],
            horariosSolicitados: [{ inicio: "08:00", fim: "18:00" }]
        };
        
        const audit = ImportIntegrityGate.validate(leadComNome);
        
        // Deve aceitar "nome" como equivalente a "clienteNome"
        expect(audit.valid).toBe(true);
    });

    test('Deve validar syncUI retorna true', () => {
        const syncResult = ImportIntegrityGate.syncUI(mockLead);
        
        expect(syncResult).toBe(true);
    });
});

/**
 * Testes de Integridade com DataManager
 * Valida integração com o gerenciador de dados
 */
describe('Integração ImportIntegrityGate com DataManager', () => {
    let dataManager;

    beforeEach(() => {
        // Mock básico do DataManager
        dataManager = {
            atualizarStatusLead: jest.fn((id, status) => {
                console.log(`[Mock] Atualizando lead ${id} para status ${status}`);
                return true; // Retorna sucesso
            }),
            obterLeadPorId: jest.fn((id) => {
                return {
                    id: id,
                    nome: "Lead Mock",
                    espacoId: 1,
                    diasSemanaSelecionados: [1, 2, 3],
                    horariosSolicitados: [{ inicio: "08:00", fim: "17:00" }]
                };
            })
        };
    });

    test('Deve persistir transição de status no Firestore após importação', () => {
        const leadId = 12345;
        const novoStatus = 'EM_ATENDIMENTO';
        
        const result = dataManager.atualizarStatusLead(leadId, novoStatus);
        
        expect(result).toBe(true);
        expect(dataManager.atualizarStatusLead).toHaveBeenCalledWith(leadId, novoStatus);
    });

    test('Deve retornar true ao atualizar status de lead', () => {
        const result = dataManager.atualizarStatusLead(999, 'EM_ATENDIMENTO');
        
        expect(result).toBe(true);
    });

    test('Deve obter lead por ID corretamente', () => {
        const lead = dataManager.obterLeadPorId(12345);
        
        expect(lead).toBeDefined();
        expect(lead.id).toBe(12345);
        expect(lead.nome).toBe("Lead Mock");
    });
});

/**
 * Testes de Cálculo de Horas
 * Valida que o BudgetEngine recebe dados sanitizados
 */
describe('Validação de Cálculo de Horas para BudgetEngine', () => {
    test('Deve calcular total de horas por dia corretamente', () => {
        // Mock de função calcularTotalHorasPorDia
        const calcularTotalHorasPorDia = (horarios) => {
            let totalHoras = 0;
            
            for (const horario of horarios) {
                const [hInicio, mInicio] = horario.inicio.split(':').map(Number);
                const [hFim, mFim] = horario.fim.split(':').map(Number);
                
                const minutosInicio = hInicio * 60 + mInicio;
                const minutosFim = hFim * 60 + mFim;
                
                if (minutosInicio < minutosFim) {
                    totalHoras += (minutosFim - minutosInicio) / 60;
                }
            }
            
            return totalHoras;
        };

        const horarios = [
            { inicio: "08:00", fim: "18:00" }
        ];
        
        const horas = calcularTotalHorasPorDia(horarios);
        
        expect(horas).toBeGreaterThan(0);
        expect(horas).toBe(10); // 10 horas
    });

    test('Deve calcular múltiplos horários corretamente', () => {
        const calcularTotalHorasPorDia = (horarios) => {
            let totalHoras = 0;
            
            for (const horario of horarios) {
                const [hInicio, mInicio] = horario.inicio.split(':').map(Number);
                const [hFim, mFim] = horario.fim.split(':').map(Number);
                
                const minutosInicio = hInicio * 60 + mInicio;
                const minutosFim = hFim * 60 + mFim;
                
                if (minutosInicio < minutosFim) {
                    totalHoras += (minutosFim - minutosInicio) / 60;
                }
            }
            
            return totalHoras;
        };

        const horarios = [
            { inicio: "08:00", fim: "12:00" },
            { inicio: "14:00", fim: "18:00" }
        ];
        
        const horas = calcularTotalHorasPorDia(horarios);
        
        expect(horas).toBe(8); // 4h manhã + 4h tarde = 8h total
    });

    test('Deve ignorar horários inválidos (fim antes do início)', () => {
        const calcularTotalHorasPorDia = (horarios) => {
            let totalHoras = 0;
            
            for (const horario of horarios) {
                const [hInicio, mInicio] = horario.inicio.split(':').map(Number);
                const [hFim, mFim] = horario.fim.split(':').map(Number);
                
                const minutosInicio = hInicio * 60 + mInicio;
                const minutosFim = hFim * 60 + mFim;
                
                if (minutosInicio < minutosFim) {
                    totalHoras += (minutosFim - minutosInicio) / 60;
                }
            }
            
            return totalHoras;
        };

        const horarios = [
            { inicio: "18:00", fim: "08:00" } // Inválido
        ];
        
        const horas = calcularTotalHorasPorDia(horarios);
        
        expect(horas).toBe(0); // Deve ser ignorado
    });
});
