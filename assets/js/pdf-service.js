/* =================================================================
   PDF-SERVICE.JS - Serviço de Geração de PDF v5.2.0 - Refactored
   Serviço desacoplado para geração de PDFs de orçamentos
   Módulo ES6 puro - Padrão ES Modules
   ================================================================= */

// Import do CoreUtils para formatação de moeda
import { CoreUtils } from './validation.js';

/**
 * Classe PDFService
 * Responsável por toda a lógica de geração de PDFs
 * Aceita dados do orçamento como parâmetros (sem dependência de globals)
 */
class PDFService {
    /**
     * Verifica se há espaço suficiente na página e adiciona nova se necessário
     * @param {jsPDF} doc - Instância do jsPDF
     * @param {number} yAtual - Posição Y atual
     * @param {number} espacoNecessario - Espaço necessário em mm
     * @returns {number} Nova posição Y
     */
    static verificarEAdicionarPagina(doc, yAtual, espacoNecessario = 20) {
        if (yAtual + espacoNecessario > 280) {
            doc.addPage();
            return 20;
        }
        return yAtual;
    }

    /**
     * Exporta PDF versão cliente (proposta comercial)
     * @param {Object} calculoData - Dados do cálculo realizado
     * @returns {void}
     */
    static exportarPDFCliente(calculoData) {
        if (!calculoData) {
            alert('Dados do cálculo não fornecidos!');
            return;
        }
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        const sala = calculoData.sala;
        const resultado = calculoData.resultado;
        
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
        doc.text(`Duração: ${calculoData.duracao} ${calculoData.duracaoTipo || 'meses'}`, 20, y);
        y += 6;
        
        const diasNomes = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        const diasSelecionadosTexto = calculoData.diasSelecionados ? 
            calculoData.diasSelecionados.map(d => diasNomes[d]).join(', ') : 
            `${calculoData.diasSemana || 0} dias/semana`;
        doc.text(`Dias: ${diasSelecionadosTexto}`, 20, y);
        y += 6;
        
        if (calculoData.horarios && calculoData.horarios.length > 0) {
            if (calculoData.horarios.length === 1) {
                doc.text(`Horário: ${calculoData.horarios[0].inicio} às ${calculoData.horarios[0].fim} (${calculoData.horasPorDia.toFixed(1)}h/dia)`, 20, y);
            } else {
                doc.text(`Horários: ${calculoData.horarios.map(h => `${h.inicio}-${h.fim}`).join(', ')} (${calculoData.horasPorDia.toFixed(1)}h/dia)`, 20, y);
            }
        } else if (calculoData.horarioInicio && calculoData.horarioFim) {
            doc.text(`Horário: ${calculoData.horarioInicio} às ${calculoData.horarioFim} (${calculoData.horasPorDia.toFixed(1)}h/dia)`, 20, y);
        } else {
            const turnos = [];
            if (calculoData.turnos && calculoData.turnos.manha) turnos.push('Manhã');
            if (calculoData.turnos && calculoData.turnos.tarde) turnos.push('Tarde');
            if (calculoData.turnos && calculoData.turnos.noite) turnos.push('Noite');
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
        doc.text(`Proposta gerada em: ${calculoData.data}`, 105, y, { align: 'center' });
        y += 4;
        doc.text('Esta proposta tem validade de 30 dias', 105, y, { align: 'center' });
        
        // Salvar PDF
        doc.save(`proposta-orcamento-${sala.unidade}-${sala.nome}-${new Date().getTime()}.pdf`);
    }

    /**
     * Exporta PDF versão superintendência (análise detalhada)
     * @param {Object} calculoData - Dados do cálculo realizado
     * @returns {void}
     */
    static exportarPDFSuperintendencia(calculoData) {
        if (!calculoData) {
            alert('Dados do cálculo não fornecidos!');
            return;
        }
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        const sala = calculoData.sala;
        const resultado = calculoData.resultado;
        
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
        const diasTexto = calculoData.diasSelecionados ? 
            calculoData.diasSelecionados.map(d => diasNomes[d]).join(', ') : 
            `${calculoData.diasSemana || 0} dias/semana`;
        
        doc.text(`Duração: ${calculoData.duracao} ${calculoData.duracaoTipo || 'meses'} | Dias: ${diasTexto} | Total de horas: ${resultado.horasTotais.toFixed(1)}h`, 20, y);
        y += 5;
        
        if (calculoData.horarios && calculoData.horarios.length > 0) {
            if (calculoData.horarios.length === 1) {
                doc.text(`Horário: ${calculoData.horarios[0].inicio} às ${calculoData.horarios[0].fim} (${calculoData.horasPorDia.toFixed(1)}h/dia)`, 20, y);
            } else {
                doc.text(`Horários: ${calculoData.horarios.map(h => `${h.inicio}-${h.fim}`).join(', ')} (${calculoData.horasPorDia.toFixed(1)}h/dia)`, 20, y);
            }
        } else if (calculoData.horarioInicio && calculoData.horarioFim) {
            doc.text(`Horário: ${calculoData.horarioInicio} às ${calculoData.horarioFim} (${calculoData.horasPorDia.toFixed(1)}h/dia)`, 20, y);
        } else if (calculoData.turnos) {
            const turnos = [];
            if (calculoData.turnos.manha) turnos.push('Manhã');
            if (calculoData.turnos.tarde) turnos.push('Tarde');
            if (calculoData.turnos.noite) turnos.push('Noite');
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
            y = PDFService.verificarEAdicionarPagina(doc, y, 25);
            
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
                y = PDFService.verificarEAdicionarPagina(doc, y, 35);
                
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
        y = PDFService.verificarEAdicionarPagina(doc, y, 40);
        
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(30, 71, 138);
        doc.text('4. INDICADORES FINANCEIROS', 15, y);
        
        y += 7;
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(0, 0, 0);
        
        const margemLiquida = ((resultado.valorFinal - resultado.subtotalSemMargem) / resultado.valorFinal * 100);
        doc.text(`Margem Líquida: ${margemLiquida.toFixed(2)}%`, 20, y);
        y += 5;
        doc.text(`Valor por Hora: R$ ${CoreUtils.formatarMoeda(resultado.valorPorHora)}`, 20, y);
        y += 5;
        
        // Classificação de risco (se disponível)
        if (calculoData.classificacaoRisco) {
            y += 5;
            doc.setFont(undefined, 'bold');
            doc.text(`Classificação de Risco: ${calculoData.classificacaoRisco}`, 20, y);
            doc.setFont(undefined, 'normal');
        }
        
        // Footer em todas as páginas
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            y = 285;
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.text('CDL Manaus - Superintendência', 105, y, { align: 'center' });
            y += 3;
            doc.text(`Relatório gerado em: ${calculoData.data}`, 105, y, { align: 'center' });
            y += 3;
            doc.text('DOCUMENTO CONFIDENCIAL - USO INTERNO', 105, y, { align: 'center' });
        }
        
        // Salvar PDF
        doc.save(`analise-financeira-${sala.unidade}-${sala.nome}-${new Date().getTime()}.pdf`);
    }
}

// ========== ES6 MODULE EXPORT ==========
// Exportação ES Modules padrão v5.2.0
export default PDFService;
