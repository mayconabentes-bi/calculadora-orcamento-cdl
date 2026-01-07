# 📊 RELATÓRIO DE AUDITORIA E2E - Sistema Axioma v5.2.0
## Calculadora de Orçamento CDL - Auditoria de Integridade de Dados e Precisão de Cálculos

**Data:** 2026-01-07  
**Auditor:** Senior Solutions Architect & QA Automation Lead  
**Versão do Sistema:** v5.2.0  
**Status Geral:** 🟡 **ATENÇÃO** (Sistema operacional com ressalvas)

---

## 📋 CHECKLIST DE INTEGRIDADE

| Item | Status | Observação |
|------|--------|------------|
| Pipeline CSV → Firestore | ✅ **OK** | Parser configurado corretamente com delimitador `;` |
| Função `limparMoeda` | ✅ **OK** | Trata corretamente formato "R$ 1.200,50" |
| Mapeamento `custoBase` | ✅ **OK** | Coluna "Custo Op. Base" → campo `custoBase` |
| Precisão Matemática | ⚠️ **ATENÇÃO** | Sem uso de biblioteca decimal.js para precisão |
| Multiplicadores de Turno | ✅ **OK** | 1.0, 1.15, 1.40 aplicados corretamente |
| Conectividade UI | ✅ **OK** | Event listeners vinculados às funções corretas |
| Fallback/Mock | ✅ **OK** | Sistema sobrevive com Firebase vazio |
| Error Handling CSV | ✅ **OK** | Falha graciosamente se arquivo não existir |

---

## 🧬 VETOR 1: DADOS (Source of Truth)

### Arquivos Analisados:
- `scripts/importar_planilha_cdl.js`
- `dados_csv/simulador.csv`
- `assets/js/data-manager.js`

### ✅ Verificação do Parser CSV

**Localização:** `scripts/importar_planilha_cdl.js` (linhas 112-119)

```javascript
const records = parse(csvContent, { 
    columns: true, 
    from_line: 2,  // Pula linha 1 (título), usa linha 2 como header
    skip_empty_lines: true, 
    trim: true,
    delimiter: ';',  // ✅ CORRETO: Delimitador ponto e vírgula
    relax_column_count: true
});
```

**Resultado:** O parser está configurado corretamente para o formato Excel brasileiro.

### ✅ Mapeamento "Custo Op. Base" → `custoBase`

**Localização:** `scripts/importar_planilha_cdl.js` (linha 129)

```javascript
const custoBase = limparMoeda(row['Custo Op. Base']);
```

**E no payload do Firestore (linha 147):**
```javascript
batch.set(docRef, {
    // ...
    custoBase: custoBase,  // ✅ MAPEAMENTO CORRETO
    // ...
});
```

**Resultado:** O campo "Custo Op. Base" do CSV é mapeado corretamente para `custoBase` no Firestore.

### ✅ Função `limparMoeda`

**Localização:** `scripts/importar_planilha_cdl.js` (linhas 62-67)

```javascript
const limparMoeda = (val) => {
    if (!val) return 0;
    if (typeof val === 'number') return val;
    // Remove R$, pontos e troca vírgula por ponto
    return parseFloat(val.toString()
        .replace('R$', '')
        .replace(/\./g, '')  // ✅ Remove pontos de milhar
        .replace(',', '.')   // ✅ Troca vírgula decimal por ponto
        .trim()) || 0;
};
```

**Teste Manual:**
- Input: `"R$ 1.200,50"`
- Após `replace('R$', '')`: `" 1.200,50"`
- Após `replace(/\./g, '')`: `" 1200,50"`
- Após `replace(',', '.')`: `" 1200.50"`
- Após `trim()` e `parseFloat()`: `1200.50`

**Resultado:** ✅ A função trata corretamente o formato de moeda brasileira.

### ✅ DataManager - Leitura sem Transformações Destrutivas

**Localização:** `assets/js/data-manager.js` (linhas 160-172)

```javascript
const fetchPromise = getDocs(collection(db, this.collections.ESPACOS));
// ...
if (snapshot.empty) {
    return this._getMockEspacos();
}
return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
```

**Resultado:** O DataManager lê os dados do Firestore usando spread operator (`...doc.data()`), preservando todos os campos sem transformações destrutivas. O valor de `custoBase` permanece intacto.

---

## 🧮 VETOR 2: CÁLCULO (The Engine)

### Arquivos Analisados:
- `assets/js/budget-engine.js`
- `assets/js/app.js`

### ⚠️ Rastreamento da Função de Cálculo de Custo Base

**Localização:** `assets/js/budget-engine.js` (linhas 126-128)

```javascript
// Calcular custo operacional base (usa média dos multiplicadores de turno)
const multiplicadorMedio = ((multiplicadores.manha ?? 1.0) + (multiplicadores.tarde ?? 1.15) + (multiplicadores.noite ?? 1.40)) / 3;
const custoOperacionalBase = (sala.custoBase ?? 0) * multiplicadorMedio * horasTotais;
```

**Análise Crítica:**

1. **Fonte do `custoBase`:** Vem diretamente do objeto `sala` (parâmetro da função), que é obtido do Firestore via `dataManager.obterSalaPorId()`.

2. **Multiplicador Aplicado:** O código usa uma **MÉDIA** dos multiplicadores de turno (`multiplicadorMedio = (1.0 + 1.15 + 1.40) / 3 = 1.183`), não um multiplicador específico por turno.

3. **Fórmula Final:** `custoOperacionalBase = sala.custoBase * 1.183 * horasTotais`

### 🔍 SANITY CHECK: Dupla Incidência de Custos

**Verificação no CSV (`dados_csv/simulador.csv`):**

```csv
Custo Op. Base;Turno: Manhã (x1,00);Turno: Tarde (x1,15);Turno: Noite (x1,40)
R$ 166,76;R$ 166,76;R$ 191,77;R$ 233,46
```

**Observação:** O CSV já inclui os valores calculados por turno:
- `Turno: Manhã (x1,00) = R$ 166,76` (base × 1.0)
- `Turno: Tarde (x1,15) = R$ 191,77` (base × 1.15)
- `Turno: Noite (x1,40) = R$ 233,46` (base × 1.40)

**No código de importação (`importar_planilha_cdl.js` linhas 150-152):**
```javascript
custoManha: limparMoeda(row['Turno: Manhã (x1,00)']),
custoTarde: limparMoeda(row['Turno: Tarde (x1,15)']),
custoNoite: limparMoeda(row['Turno: Noite (x1,40)']),
```

**⚠️ PONTO DE ATENÇÃO:**  
O sistema importa AMBOS os valores (base E já multiplicados), mas o `budget-engine.js` usa apenas `custoBase` e aplica seu próprio cálculo de multiplicador médio. **NÃO há dupla incidência**, mas também não utiliza os valores pré-calculados do CSV por turno específico.

### ✅ Multiplicadores de Turno

**Localização:** `assets/js/data-manager.js` (linhas 369-375)

```javascript
obterMultiplicadoresTurno() {
    return {
        manha: 1,      // ✅ 1.0
        tarde: 1.15,   // ✅ 1.15
        noite: 1.40    // ✅ 1.40
    };
}
```

**Resultado:** Os multiplicadores estão configurados corretamente conforme especificação.

### 📊 Nota sobre Precisão Numérica

**Localização:** `assets/js/budget-engine.js` (linhas 36-40)

```javascript
/**
 * Nota sobre Precisão Numérica:
 * Esta função realiza múltiplas operações com valores monetários.
 * Para aplicações críticas ou valores muito grandes, considere usar
 * bibliotecas de precisão decimal como decimal.js
 */
```

**Recomendação:** O código reconhece a limitação de precisão de ponto flutuante do JavaScript. Para produção crítica, considere implementar `decimal.js`.

---

## 🖥️ VETOR 3: INTERFACE (UI/UX Flow)

### Arquivos Analisados:
- `dashboard-admin.html`
- `assets/js/app.js`
- `assets/js/solicitacao.js`

### ✅ Event Listeners Vinculados Corretamente

**Localização:** `assets/js/app.js` (linhas 832-956)

| Botão/Elemento | Função Vinculada | Existe? |
|----------------|------------------|---------|
| `#calcular` | `calcularOrcamento` | ✅ |
| `#exportar-pdf-super` | `exportarPDFSuperintendenciaComLoading` | ✅ |
| `#exportar-pdf-cliente` | `exportarPDFClienteComLoading` | ✅ |
| `#adicionar-horario` | `adicionarNovoHorario()` | ✅ |
| `#exportar-csv` | `exportarCSV` | ✅ |
| `#btn-importar-lead` | `abrirModalImportarLead` | ✅ |
| `#btn-enviar-aprovacao` | `enviarParaAprovacao` | ✅ |

### ✅ Dropdown de Salas - Popuplação Dinâmica

**Localização:** `assets/js/app.js` (linhas 467-492)

```javascript
async function carregarSelectEspacos() {
    const select = document.getElementById('espaco');
    try {
        // ✅ Usa AWAIT e chama método assíncrono
        const salas = await dataManager.obterEspacos();
        
        select.innerHTML = '<option value="">-- Selecione um espaço --</option>';
        
        salas.forEach(sala => {
            const option = document.createElement('option');
            option.value = sala.id;
            option.textContent = `${sala.unidade} - ${sala.nome}`;
            select.appendChild(option);
        });
        // ...
    }
}
```

**Resultado:** O dropdown é populado dinamicamente com dados do Firestore (ou mock em caso de falha).

### ✅ Exportação Global para HTML Legado

**Localização:** `assets/js/app.js` (linhas 3004-3043)

```javascript
// Funções de Modal
window.abrirModalImportarLead = abrirModalImportarLead;
window.fecharModalImportarLead = fecharModalImportarLead;

// Funções de Interface da Calculadora
window.atualizarHorario = atualizarHorario;
window.removerHorario = removerHorario;

// Gestão de Salas (Admin)
window.editarSala = editarSala;
window.removerSala = removerSala;
```

**Resultado:** As funções são corretamente expostas no escopo `window` para uso em atributos `onclick` do HTML.

---

## 🛡️ VETOR 4: RESILIÊNCIA (Error Handling)

### Arquivos Analisados:
- `scripts/system_health_check.js`
- `assets/js/auth.js`

### ✅ Sistema Sobrevive com Firebase Vazio

**Localização:** `assets/js/data-manager.js` (linhas 134-178)

```javascript
async obterEspacos() {
    // Detectar modo de teste E2E
    const isE2ETest = /* ... */;
    
    if (isE2ETest) {
        return this._getMockEspacos();  // ✅ Fallback para testes
    }
    
    if (!db) {
        return this._getMockEspacos();  // ✅ Fallback se Firebase não inicializado
    }

    try {
        // Timeout de 5s para não travar a UI
        const timeoutPromise = new Promise((_, reject) => {
            timeoutId = setTimeout(() => reject(new Error('Timeout Firebase')), 5000);
        });
        
        const snapshot = await Promise.race([fetchPromise, timeoutPromise]);
        
        if (snapshot.empty) {
            return this._getMockEspacos();  // ✅ Fallback se banco vazio
        }
        
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        return this._getMockEspacos();  // ✅ Fallback em caso de erro
    }
}
```

**Mock de Segurança (`_getMockEspacos`):**
```javascript
_getMockEspacos() {
    return [
        { id: 'mock1', nome: 'Auditório Principal (Offline)', unidade: 'CDL', capacidade: 100, custoBase: 150 },
        { id: 'mock2', nome: 'Sala de Reunião (Offline)', unidade: 'CDL', capacidade: 10, custoBase: 50 }
    ];
}
```

**Resultado:** ✅ O sistema possui fallbacks robustos para todos os cenários de falha.

### ✅ Script de Importação - Falha Graciosa

**Localização:** `scripts/importar_planilha_cdl.js` (linhas 96-174)

```javascript
if (fs.existsSync(pathSimulador)) {
    // ... processa o arquivo
} else {
    console.error('[CSV-IMPORT] ❌ Arquivo dados_csv/simulador.csv não encontrado.');
    console.error('[CSV-IMPORT]    Certifique-se de que o arquivo foi enviado para a pasta dados_csv/');
}
```

**E no tratamento de erros:**
```javascript
} catch (error) {
    console.error(`[CSV-IMPORT] ❌ Erro ao processar simulador.csv:`, error.message);
    console.error(`[CSV-IMPORT]    Stack: ${error.stack}`);
}
```

**Resultado:** ✅ O script verifica existência do arquivo antes de processar e trata erros sem crash.

### ✅ Health Check Completo

**Localização:** `scripts/system_health_check.js`

O script executa verificações de:
1. Variáveis de ambiente (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY_BASE64`)
2. Conectividade com Firebase
3. Existência de coleções críticas (`espacos`, `extras`, `configuracoes`)
4. Contagem de documentos em cada coleção

**Resultado:** ✅ Sistema de diagnóstico completo implementado.

---

## 📐 SIMULAÇÃO DE CÁLCULO

### Cenário de Teste

**Parâmetros:**
- **Sala:** Auditório DJLM
- **Custo Base:** R$ 166,76/h (conforme CSV)
- **Horas:** 5 horas
- **Turno:** Tarde (×1,15)
- **Dias:** 1 dia (dias úteis apenas)

### Lógica do Código Atual (Passo a Passo)

**1. Obtenção do `custoBase`:**
```javascript
const sala = { custoBase: 166.76, /* ... */ };
```

**2. Obtenção dos multiplicadores:**
```javascript
const multiplicadores = { manha: 1.0, tarde: 1.15, noite: 1.40 };
```

**3. Cálculo do multiplicador médio (budget-engine.js linha 127):**
```javascript
const multiplicadorMedio = ((multiplicadores.manha ?? 1.0) + (multiplicadores.tarde ?? 1.15) + (multiplicadores.noite ?? 1.40)) / 3;
// Com valores padrão: (1.0 + 1.15 + 1.40) / 3 = 1.18333...
```

**4. Cálculo das horas totais:**
```javascript
const horasTotais = 5; // 5 horas por dia × 1 dia
```

**5. Cálculo do custo operacional base (linha 128):**
```javascript
const custoOperacionalBase = 166.76 * 1.18333 * 5;
// custoOperacionalBase = R$ 987,08
```

### ⚠️ Discrepância com Planilha Contábil

**Cálculo Esperado (Planilha - Turno Tarde Específico):**
- Turno Tarde específico: R$ 166,76 × 1,15 = R$ 191,77/h
- 5 horas: R$ 191,77 × 5 = **R$ 958,85**

**Cálculo Atual (Sistema - Multiplicador Médio):**
- Multiplicador médio: R$ 166,76 × 1,18333 = R$ 197,42/h
- 5 horas: R$ 197,42 × 5 = **R$ 987,08**

**Diferença:** R$ 28,23 (2,94% a mais)

### 🔴 ALERTA: Simplificação do Multiplicador

O sistema atual usa uma **média aritmética** dos multiplicadores de turno ao invés de permitir seleção de turno específico. Isso pode causar:
- **Sobreprecificação** em turnos da manhã
- **Subprecificação** em turnos da noite
- **Ligeira variação** no turno da tarde (multiplicador médio 1,1833 vs real 1,15)

---

## 🎯 VEREDITO FINAL

### O sistema está pronto para calcular orçamentos reais com a mesma precisão da planilha da contabilidade?

**Resposta:** 🟡 **COM RESSALVAS**

### ✅ Pontos Fortes:
1. Pipeline CSV → Firestore funciona corretamente
2. Função `limparMoeda` trata formato brasileiro adequadamente
3. Dados são preservados sem transformações destrutivas
4. Sistema possui fallbacks robustos
5. Event listeners corretamente vinculados
6. Multiplicadores de turno configurados corretamente

### ⚠️ Pontos de Atenção:
1. **Simplificação do multiplicador de turno**: O sistema usa média ao invés de turno específico
2. **Precisão de ponto flutuante**: JavaScript nativo sem biblioteca decimal.js
3. **Valores pré-calculados não utilizados**: O CSV importa `custoManha`, `custoTarde`, `custoNoite` mas o engine não os utiliza

### 📋 Recomendações para Go-Live:

1. **Crítica:** Implementar seleção de turno específico na calculadora para usar o multiplicador correto
2. **Média:** Considerar uso de `decimal.js` para operações monetárias críticas
3. **Baixa:** Utilizar os valores pré-calculados do CSV (`custoManha`, `custoTarde`, `custoNoite`) ao invés de recalcular

---

## 📎 ANEXO: Estrutura do CSV

```csv
TABELA 220/H - SEM CONSIDERAR EXTRA - CARGA HORÁRIA PADRÃO
Unidade;Espaço;Cap.;Consumo (Peso 3);Área (m²);Hora/Monitor;Hora/m²;Depreciação Itens/h;Itens Considerados (Qtd);Energia/h;Custo Op. Base;Turno: Manhã (x1,00);Turno: Tarde (x1,15);Turno: Noite (x1,40)
DJLM;Auditório;120;R$ 72,00;108;R$ 34,04;R$ 58,86;R$ 1,64;"...";R$ 0,22;R$ 166,76;R$ 166,76;R$ 191,77;R$ 233,46
```

**Observação:** A coluna "Custo Op. Base" (R$ 166,76) já é o custo consolidado que inclui:
- Consumo (Peso 3)
- Hora/Monitor
- Hora/m²
- Depreciação Itens/h
- Energia/h

**NÃO há dupla incidência** pois esses componentes já estão somados no custo base.

---

*Relatório gerado automaticamente pelo sistema de auditoria E2E*  
*Calculadora de Orçamento CDL - Axioma v5.2.0*
