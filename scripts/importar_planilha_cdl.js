/**
 * scripts/importar_planilha_cdl.js
 * Executar no Codespaces: node scripts/importar_planilha_cdl.js
 * 
 * Script de importação de planilhas CSV para o Firestore
 * Importa dados de locação de espaços da CDL a partir de arquivos CSV
 * 
 * Uso: npm run import:csv
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const admin = require('firebase-admin');
const { getFirebaseCredentials, displayConfigurationInfo } = require('../firebase-key-handler');

// ============================================================================
// FIREBASE INITIALIZATION
// ============================================================================

const timestamp = new Date().toISOString();
console.log(`[CSV-IMPORT] ${timestamp} - CSV Import Script Started`);
console.log('');

try {
    displayConfigurationInfo();
    
    const credential = getFirebaseCredentials();
    
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(credential)
        });
    }
    
    console.log(`[CSV-IMPORT] ✅ Firebase Admin initialized successfully`);
    console.log(`[CSV-IMPORT]    Project: ${credential.projectId}`);
    console.log('');
} catch (error) {
    console.error(`[CSV-IMPORT] ❌ FATAL ERROR: Could not initialize Firebase Admin`);
    console.error(`[CSV-IMPORT]    ${error.message}`);
    console.error('');
    console.error('🔧 To fix:');
    console.error('   1. Copy template: cp .env.example .env');
    console.error('   2. Configure Firebase credentials in .env');
    console.error('   3. Run: node convert-private-key-to-base64.js (if needed)');
    console.error('');
    process.exit(1);
}

const db = admin.firestore();

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Remove formatação de moeda brasileira e converte para número
 * @param {string|number} val - Valor a ser limpo (ex: "R$ 1.200,50")
 * @returns {number} Valor numérico (ex: 1200.50)
 */
const limparMoeda = (val) => {
    if (!val) return 0;
    if (typeof val === 'number') return val;
    // Remove R$, pontos e troca vírgula por ponto
    return parseFloat(val.toString().replace('R$', '').replace(/\./g, '').replace(',', '.').trim()) || 0;
};

/**
 * Gera ID único para o documento baseado em unidade e nome do espaço
 * @param {string} unidade - Unidade CDL (ex: "CDL Centro")
 * @param {string} nome - Nome do espaço (ex: "Sala VIP 1")
 * @returns {string} ID normalizado (ex: "cdl_centro_sala_vip_1")
 */
const gerarId = (unidade, nome) => {
    return `${unidade}_${nome}`.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
};

// ============================================================================
// MAIN IMPORT FUNCTION
// ============================================================================

async function importar() {
    console.log('🚀 Iniciando importação CDL no Codespaces...');
    console.log('');
    
    const batch = db.batch();
    let contador = 0;
    let avisos = [];

    // --- IMPORTAR SALAS (SIMULADOR) ---
    const pathSimulador = path.join(__dirname, '../dados_csv/simulador.csv');
    
    if (fs.existsSync(pathSimulador)) {
        console.log('[CSV-IMPORT] 📂 Arquivo simulador.csv encontrado');
        console.log('[CSV-IMPORT] 📊 Processando dados...');
        console.log('');
        
        try {
            const csvContent = fs.readFileSync(pathSimulador, 'utf-8');
            
            // Configuração do parser CSV:
            // - from_line: 2 - Pula linha 1 (título da planilha) e usa linha 2 como header
            // - delimiter: ';' - Usa ponto e vírgula (padrão Excel português)
            // - relax_column_count: true - Permite variação no número de colunas
            // Este formato corresponde ao padrão da planilha CDL onde:
            //   Linha 1: "Título da Planilha - SIMULADOR 220H"
            //   Linha 2: Cabeçalhos das colunas
            //   Linha 3+: Dados
            const records = parse(csvContent, { 
                columns: true, 
                from_line: 2, 
                skip_empty_lines: true, 
                trim: true,
                delimiter: ';',
                relax_column_count: true
            });

            console.log(`[CSV-IMPORT] 📋 Total de registros encontrados: ${records.length}`);
            console.log('');

            for (const row of records) {
                // Validar linhas essenciais
                if (!row['Unidade'] || !row['Espaço'] || row['Unidade'] === 'Unidade') continue;

                const id = gerarId(row['Unidade'], row['Espaço']);
                const custoBase = limparMoeda(row['Custo Op. Base']);

                // Verifica integridade
                if (!custoBase || custoBase === 0) {
                    const aviso = `⚠️  Aviso: Custo zerado para ${row['Espaço']} (Unidade: ${row['Unidade']})`;
                    avisos.push(aviso);
                    console.warn(`[CSV-IMPORT] ${aviso}`);
                }

                const docRef = db.collection('espacos').doc(id);
                
                batch.set(docRef, {
                    nome: row['Espaço'],
                    unidade: row['Unidade'],
                    capacidade: parseInt(row['Cap.']) || 0,
                    area: row['Área (m²)'] || '',
                    
                    // DADOS FINANCEIROS CRÍTICOS
                    custoBase: custoBase,
                    
                    // Multiplicadores da Planilha
                    custoManha: limparMoeda(row['Turno: Manhã (x1,00)']),
                    custoTarde: limparMoeda(row['Turno: Tarde (x1,15)']),
                    custoNoite: limparMoeda(row['Turno: Noite (x1,40)']),
                    
                    itensInclusos: row['Itens Considerados (Qtd)'] || '',
                    atualizadoEm: new Date().toISOString(),
                    origem: 'CSV Import - Codespaces',
                    ativo: true
                }, { merge: true });

                console.log(`[CSV-IMPORT] ✅ [${id}] ${row['Espaço']} - R$ ${custoBase.toFixed(2)}`);
                contador++;
            }
            
            console.log('');
        } catch (error) {
            console.error(`[CSV-IMPORT] ❌ Erro ao processar simulador.csv:`, error.message);
            console.error(`[CSV-IMPORT]    Stack: ${error.stack}`);
            console.error('');
        }
    } else {
        console.error('[CSV-IMPORT] ❌ Arquivo dados_csv/simulador.csv não encontrado.');
        console.error('[CSV-IMPORT]    Certifique-se de que o arquivo foi enviado para a pasta dados_csv/');
        console.error('');
    }

    // --- IMPORTAR INFRAESTRUTURA (INFRA) - Futuro ---
    // O arquivo infra.csv pode ser usado para importar dados adicionais
    // de infraestrutura quando houver necessidade. Por enquanto, apenas
    // detectamos sua presença para referência futura.
    const pathInfra = path.join(__dirname, '../dados_csv/infra.csv');
    
    if (fs.existsSync(pathInfra)) {
        console.log('[CSV-IMPORT] 📂 Arquivo infra.csv encontrado');
        console.log('[CSV-IMPORT] ℹ️  Processamento de infra.csv será implementado conforme necessidade');
        console.log('');
    }

    // --- COMMIT ---
    if (contador > 0) {
        try {
            console.log('[CSV-IMPORT] 💾 Salvando dados no Firestore...');
            await batch.commit();
            console.log('[CSV-IMPORT] ✅ Dados salvos com sucesso!');
            console.log('');
        } catch (error) {
            console.error('[CSV-IMPORT] ❌ Erro ao salvar no Firestore:', error.message);
            console.error('');
            process.exit(1);
        }
    }

    // --- SUMMARY ---
    console.log('═══════════════════════════════════════════════════════════════════');
    console.log('📊 RESUMO DA IMPORTAÇÃO');
    console.log('═══════════════════════════════════════════════════════════════════');
    console.log('');
    
    if (contador > 0) {
        console.log(`🎉 Sucesso! ${contador} espaços atualizados no Firestore.`);
        console.log('');
        
        if (avisos.length > 0) {
            console.log('⚠️  Avisos encontrados:');
            avisos.forEach(aviso => console.log(`   ${aviso}`));
            console.log('');
        }
        
        console.log('📋 Próximos passos:');
        console.log('   1. Abra o sistema no navegador');
        console.log('   2. Vá na Calculadora e verifique se os espaços aparecem');
        console.log('   3. Faça um cálculo para validar os preços');
        console.log('');
        console.log('💡 Dica: Execute npm run health:check para verificar a integridade do sistema');
        console.log('');
    } else {
        console.log('⚠️  Nada foi importado. Verifique:');
        console.log('   1. Se o arquivo simulador.csv existe em dados_csv/');
        console.log('   2. Se o arquivo tem o formato correto (colunas esperadas)');
        console.log('   3. Se há dados válidos no arquivo');
        console.log('');
    }
    
    console.log('═══════════════════════════════════════════════════════════════════');
}

// ============================================================================
// EXECUTION
// ============================================================================

importar()
    .then(() => {
        console.log('[CSV-IMPORT] 🏁 Script finalizado com sucesso');
        process.exit(0);
    })
    .catch(error => {
        console.error('[CSV-IMPORT] ❌ Erro fatal durante a importação:', error.message);
        console.error('[CSV-IMPORT]    Stack:', error.stack);
        process.exit(1);
    });
