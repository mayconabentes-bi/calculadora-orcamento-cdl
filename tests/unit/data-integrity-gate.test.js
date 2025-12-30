/**
 * TESTES DO DATA INTEGRITY GATE - SGQ v5.1.0
 * Valida as regras de integridade de dados para governança financeira
 */

describe('Data Integrity Gate - atualizarStatusOrcamento', () => {
    let mockDataManager;
    
    beforeEach(() => {
        // Mock do DataManager
        mockDataManager = {
            firebaseEnabled: false,
            dados: {
                historicoCalculos: [
                    {
                        id: 1,
                        statusAprovacao: 'AGUARDANDO_APROVACAO',
                        convertido: false
                    }
                ]
            },
            salvarDados: jest.fn(),
            atualizarStatusOrcamento: async function(id, status, justificativa = '') {
                // Validar status
                const statusValidos = ['AGUARDANDO_APROVACAO', 'APROVADO', 'REPROVADO'];
                if (!statusValidos.includes(status)) {
                    const erro = `Status inválido: ${status}. Deve ser um de: ${statusValidos.join(', ')}`;
                    console.error(erro);
                    throw new Error(erro);
                }

                // DATA INTEGRITY GATE: Validação estrita para REPROVADO
                if (status === 'REPROVADO') {
                    const justificativaTrimmed = justificativa ? justificativa.trim() : '';
                    
                    if (!justificativaTrimmed || justificativaTrimmed.length < 10) {
                        const erro = 'DATA INTEGRITY VIOLATION: Status REPROVADO requer justificativa com mínimo de 10 caracteres. ' +
                                    'Esta validação garante rastreabilidade e governança de decisões executivas.';
                        console.error(erro);
                        throw new Error(erro);
                    }
                }

                // Atualizar no localStorage
                const numericId = typeof id === 'string' ? parseInt(id) : id;
                const registro = this.dados.historicoCalculos.find(calc => calc.id === numericId);
                
                if (registro) {
                    registro.statusAprovacao = status;
                    registro.dataAprovacao = new Date().toISOString();
                    
                    // DATA INTEGRITY GATE: Flag 'convertido' setada EXCLUSIVAMENTE para APROVADO
                    if (status === 'APROVADO') {
                        registro.convertido = true;
                    } else {
                        registro.convertido = false;
                    }
                    
                    if (status === 'REPROVADO') {
                        registro.justificativaRejeicao = justificativa;
                    } else {
                        registro.justificativaRejeicao = null;
                    }

                    this.salvarDados();
                    return true;
                }

                return false;
            }
        };
    });
    
    describe('Validação de Status REPROVADO', () => {
        test('deve lançar erro se justificativa estiver vazia', async () => {
            await expect(
                mockDataManager.atualizarStatusOrcamento(1, 'REPROVADO', '')
            ).rejects.toThrow('DATA INTEGRITY VIOLATION');
        });
        
        test('deve lançar erro se justificativa for null', async () => {
            await expect(
                mockDataManager.atualizarStatusOrcamento(1, 'REPROVADO', null)
            ).rejects.toThrow('DATA INTEGRITY VIOLATION');
        });
        
        test('deve lançar erro se justificativa tiver menos de 10 caracteres', async () => {
            await expect(
                mockDataManager.atualizarStatusOrcamento(1, 'REPROVADO', 'muito cur')
            ).rejects.toThrow('DATA INTEGRITY VIOLATION');
        });
        
        test('deve aceitar justificativa com exatamente 10 caracteres', async () => {
            const result = await mockDataManager.atualizarStatusOrcamento(1, 'REPROVADO', '1234567890');
            expect(result).toBe(true);
            expect(mockDataManager.dados.historicoCalculos[0].statusAprovacao).toBe('REPROVADO');
            expect(mockDataManager.dados.historicoCalculos[0].convertido).toBe(false);
        });
        
        test('deve aceitar justificativa com mais de 10 caracteres', async () => {
            const justificativa = 'Esta é uma justificativa válida com mais de 10 caracteres';
            const result = await mockDataManager.atualizarStatusOrcamento(1, 'REPROVADO', justificativa);
            expect(result).toBe(true);
            expect(mockDataManager.dados.historicoCalculos[0].justificativaRejeicao).toBe(justificativa);
            expect(mockDataManager.dados.historicoCalculos[0].convertido).toBe(false);
        });
    });
    
    describe('Flag convertido', () => {
        test('deve setar convertido como true APENAS para APROVADO', async () => {
            const result = await mockDataManager.atualizarStatusOrcamento(1, 'APROVADO');
            expect(result).toBe(true);
            expect(mockDataManager.dados.historicoCalculos[0].convertido).toBe(true);
            expect(mockDataManager.dados.historicoCalculos[0].statusAprovacao).toBe('APROVADO');
        });
        
        test('deve setar convertido como false para REPROVADO', async () => {
            const result = await mockDataManager.atualizarStatusOrcamento(1, 'REPROVADO', 'Justificativa válida aqui');
            expect(result).toBe(true);
            expect(mockDataManager.dados.historicoCalculos[0].convertido).toBe(false);
            expect(mockDataManager.dados.historicoCalculos[0].statusAprovacao).toBe('REPROVADO');
        });
        
        test('deve setar convertido como false para AGUARDANDO_APROVACAO', async () => {
            const result = await mockDataManager.atualizarStatusOrcamento(1, 'AGUARDANDO_APROVACAO');
            expect(result).toBe(true);
            expect(mockDataManager.dados.historicoCalculos[0].convertido).toBe(false);
            expect(mockDataManager.dados.historicoCalculos[0].statusAprovacao).toBe('AGUARDANDO_APROVACAO');
        });
        
        test('não deve permitir convertido=true para status REPROVADO', async () => {
            // Primeiro aprovar
            await mockDataManager.atualizarStatusOrcamento(1, 'APROVADO');
            expect(mockDataManager.dados.historicoCalculos[0].convertido).toBe(true);
            
            // Depois reprovar - deve forçar convertido=false
            await mockDataManager.atualizarStatusOrcamento(1, 'REPROVADO', 'Motivo da reprovação suficiente');
            expect(mockDataManager.dados.historicoCalculos[0].convertido).toBe(false);
        });
    });
    
    describe('Validação de Status', () => {
        test('deve lançar erro para status inválido', async () => {
            await expect(
                mockDataManager.atualizarStatusOrcamento(1, 'INVALIDO')
            ).rejects.toThrow('Status inválido');
        });
        
        test('deve aceitar AGUARDANDO_APROVACAO', async () => {
            const result = await mockDataManager.atualizarStatusOrcamento(1, 'AGUARDANDO_APROVACAO');
            expect(result).toBe(true);
            expect(mockDataManager.dados.historicoCalculos[0].statusAprovacao).toBe('AGUARDANDO_APROVACAO');
        });
        
        test('deve aceitar APROVADO', async () => {
            const result = await mockDataManager.atualizarStatusOrcamento(1, 'APROVADO');
            expect(result).toBe(true);
            expect(mockDataManager.dados.historicoCalculos[0].statusAprovacao).toBe('APROVADO');
        });
    });
});
