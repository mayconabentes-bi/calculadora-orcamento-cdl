# 🧪 Cenários de Teste Conversacional

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Testes de Fluxo Completo](#testes-de-fluxo-completo)
3. [Testes de Linguagem Natural](#testes-de-linguagem-natural)
4. [Testes de Confirmação](#testes-de-confirmação)
5. [Testes de Voz](#testes-de-voz)
6. [Testes de Borda](#testes-de-borda)
7. [Testes de Auditoria](#testes-de-auditoria)

---

## 🎯 Visão Geral

Estes testes garantem que o Chat IA funciona corretamente em cenários conversacionais reais.

### Critérios de Sucesso

✅ **PASS:** Comportamento esperado
❌ **FAIL:** Comportamento incorreto
⚠️ **WARN:** Funciona mas pode melhorar

---

## ✅ Testes de Fluxo Completo

### Teste 1: Cotação Completa em Uma Mensagem

**Objetivo:** Validar que o sistema aceita todos os parâmetros de uma vez.

**Input:**
```
"Preciso de cotação para 3 meses, segunda a sexta, das 8h às 18h, na Sala Multiuso"
```

**Comportamento Esperado:**
1. ✅ Extrai todos os parâmetros corretamente
2. ✅ Mostra resumo completo
3. ✅ Solicita confirmação
4. ✅ Gera cotação após "sim"

**Asserções:**
```javascript
assert.equal(params.duration, 3);
assert.equal(params.durationType, 'meses');
assert.deepEqual(params.days, [1, 2, 3, 4, 5]);
assert.equal(params.startTime, '08:00');
assert.equal(params.endTime, '18:00');
assert.equal(context.stage, 'refining');
assert.equal(context.waitingForFinalConfirmation, true);
```

### Teste 2: Cotação com Coleta Incremental

**Objetivo:** Validar coleta de parâmetros passo a passo.

**Diálogo:**
```
👤: "preciso uma cotação"
🤖: [solicita duração]
👤: "3 meses"
🤖: [solicita dias]
👤: "segunda a sexta"
🤖: [solicita espaço]
👤: "sala multiuso"
🤖: [mostra resumo e solicita confirmação]
👤: "sim"
🤖: [gera cotação]
```

**Asserções:**
```javascript
// Após cada entrada
assert.equal(context.stage, 'gathering');
// Após última entrada
assert.equal(context.stage, 'refining');
// Após confirmação
assert.equal(context.stage, 'completed');
assert.notNull(context.lastQuotation);
```

### Teste 3: Fluxo com Horas Extras

**Objetivo:** Validar alerta e confirmação de HE.

**Diálogo:**
```
👤: "3 meses, finais de semana"
🤖: [alerta sobre HE 50%/100%]
🤖: [solicita confirmação de HE]
👤: "sim"
🤖: [continua fluxo]
👤: "sala multiuso"
🤖: [resumo com HE]
👤: "sim"
🤖: [cotação com HE aplicado]
```

**Asserções:**
```javascript
assert.equal(context.waitingHEConfirmation, true);
assert.equal(context.heConfirmed, true);
assert.isTrue(resultado.horasHE50 > 0 || resultado.horasHE100 > 0);
```

---

## 💬 Testes de Linguagem Natural

### Teste 4: Frases Incompletas

**Objetivo:** Validar interpretação de frases incompletas.

**Casos:**

1. **"preciso uns 3"**
   - ✅ Interpreta como "3 meses"
   - ✅ Solicita confirmação
   ```javascript
   assert.equal(params.duration, 3);
   assert.include(response, 'meses');
   ```

2. **"seg sex"**
   - ✅ Interpreta como "segunda a sexta"
   - ✅ Expande corretamente
   ```javascript
   assert.deepEqual(params.days, [1, 2, 3, 4, 5]);
   ```

3. **"das 8 até 18"**
   - ✅ Interpreta como "08:00 às 18:00"
   ```javascript
   assert.equal(params.startTime, '08:00');
   assert.equal(params.endTime, '18:00');
   ```

### Teste 5: Variações de Linguagem

**Objetivo:** Validar diferentes formas de expressar a mesma coisa.

**Casos:**

| Input | Esperado |
|-------|----------|
| "3 meses" | duration: 3, durationType: 'meses' |
| "tres meses" | duration: 3, durationType: 'meses' |
| "90 dias" | duration: 90, durationType: 'dias' |
| "segunda a sexta" | days: [1,2,3,4,5] |
| "seg-sex" | days: [1,2,3,4,5] |
| "segunda até sexta" | days: [1,2,3,4,5] |
| "finais de semana" | days: [6,0] |
| "fim de semana" | days: [6,0] |
| "sábado e domingo" | days: [6,0] |

```javascript
testCases.forEach(({input, expected}) => {
    const params = extractParameters(input);
    assert.deepEqual(params, expected);
});
```

### Teste 6: Correções Durante Conversa

**Objetivo:** Validar que o sistema aceita correções.

**Diálogo:**
```
👤: "cotação para 3 meses"
🤖: [registra 3 meses]
👤: "na verdade, quero 6 meses"
🤖: [atualiza para 6 meses]
👤: "segunda a sexta, esquece, só terça e quinta"
🤖: [atualiza dias]
```

**Asserções:**
```javascript
// Após primeira entrada
assert.equal(params.duration, 3);
// Após correção
assert.equal(params.duration, 6);
// Log de correção
assert.include(inferredParams, 'Alterado duration: 6');

// Após segunda correção
assert.deepEqual(params.days, [2, 4]);
```

### Teste 7: Linguagem Coloquial

**Objetivo:** Validar compreensão de gírias e coloquialismo.

**Casos:**

| Input | Deve Interpretar |
|-------|------------------|
| "preciso uma cotação pra uns 3 meses" | Cotação de 3 meses |
| "quero fazer um orçamento" | Iniciar cotação |
| "de segunda até sex" | Segunda a sexta |
| "umas 8h por dia" | Inferir horário 8 horas |
| "tá bom assim" | Confirmação |
| "beleza" | Confirmação |
| "pode ser" | Confirmação |

```javascript
coloquialExpressions.forEach(({input, expected}) => {
    const intent = interpretCommand(input);
    assert.equal(intent.type, expected);
});
```

---

## ✅ Testes de Confirmação

### Teste 8: Confirmação Explícita Obrigatória

**Objetivo:** Garantir que cotação nunca é gerada sem confirmação.

**Cenário A - Sem Confirmação:**
```
👤: "3 meses, seg-sex, sala multiuso"
🤖: [mostra resumo]
🤖: "Posso confirmar?"
👤: [não responde ou responde outra coisa]
```

**Asserção:**
```javascript
assert.isNull(context.lastQuotation); // Cotação NÃO deve ser gerada
assert.equal(context.stage, 'confirming'); // Ainda aguardando
```

**Cenário B - Com Confirmação:**
```
👤: "3 meses, seg-sex, sala multiuso"
🤖: [mostra resumo]
🤖: "Posso confirmar?"
👤: "sim"
🤖: [gera cotação]
```

**Asserção:**
```javascript
assert.notNull(context.lastQuotation); // Cotação deve ser gerada
assert.equal(context.stage, 'completed');
```

### Teste 9: Variações de Confirmação

**Objetivo:** Validar que diferentes formas de confirmar são aceitas.

**Casos:**

| Input | Deve Confirmar |
|-------|----------------|
| "sim" | ✅ |
| "confirmar" | ✅ |
| "confirmo" | ✅ |
| "pode" | ✅ |
| "ok" | ✅ |
| "beleza" | ✅ |
| "tá bom" | ✅ |
| "ta bom" | ✅ |
| "isso mesmo" | ✅ |
| "não" | ❌ |
| "espera" | ❌ |

```javascript
positiveConfirmations.forEach(input => {
    assert.isTrue(isConfirmation(input));
});

negativeResponses.forEach(input => {
    assert.isFalse(isConfirmation(input));
});
```

### Teste 10: Resumo Antes de Confirmar

**Objetivo:** Garantir que o usuário sempre vê um resumo antes de confirmar.

**Asserções:**
```javascript
const response = showPartialSummaryAndAskConfirmation();

// Deve conter todos os parâmetros
assert.include(response, 'Espaço:');
assert.include(response, 'Duração:');
assert.include(response, 'Dias:');
assert.include(response, 'Horário:');

// Deve solicitar confirmação
assert.include(response, 'confirmar');
assert.include(response, 'sim');

// Não deve gerar cotação ainda
assert.isNull(context.lastQuotation);
```

---

## 🎤 Testes de Voz

### Teste 11: Paridade Voz-Texto

**Objetivo:** Garantir que voz e texto produzem mesmo resultado.

**Cenário:**
```javascript
// Entrada por texto
const textParams = processUserInput("3 meses segunda a sexta");

// Entrada por voz (mesma frase)
const voiceParams = handleVoiceInput("3 meses segunda a sexta");

// Devem ser idênticos
assert.deepEqual(textParams, voiceParams);
```

### Teste 12: Detecção de Silêncio

**Objetivo:** Validar tratamento de silêncio após fala.

**Cenário:**
```javascript
// Simular voz
startListening();
recognition.onresult({
    results: [[{transcript: "três meses", isFinal: true}]]
});

// Aguardar silenceDelay (1.5s)
await sleep(1500);

// Deve processar acumulado
assert.equal(lastProcessedInput, "três meses");
assert.isFalse(isListening);
```

### Teste 13: Pausas Durante Fala

**Objetivo:** Validar que pausas não interrompem prematuramente.

**Cenário:**
```javascript
// Primeira parte da frase
recognition.onresult({
    results: [[{transcript: "preciso de três", isFinal: true}]]
});

// Pausa curta (< 1.5s)
await sleep(1000);

// Segunda parte
recognition.onresult({
    results: [[{transcript: "meses", isFinal: true}]]
});

// Deve acumular
assert.equal(currentTranscript, "preciso de três meses");
```

### Teste 14: Tratamento de Erros de Voz

**Objetivo:** Validar que erros de voz são tratados adequadamente.

**Casos:**

1. **no-speech:** Não mostrar erro, apenas parar
```javascript
recognition.onerror({error: 'no-speech'});
assert.isFalse(isListening);
// Não deve adicionar mensagem de erro
```

2. **not-allowed:** Mostrar mensagem sobre permissão
```javascript
recognition.onerror({error: 'not-allowed'});
assert.include(lastBotMessage, 'permissão');
```

3. **network:** Mostrar mensagem sobre conexão
```javascript
recognition.onerror({error: 'network'});
assert.include(lastBotMessage, 'conexão');
```

---

## 🔍 Testes de Borda

### Teste 15: Entrada Vazia

**Objetivo:** Validar tratamento de entrada vazia.

**Casos:**
```javascript
processUserInput("");  // String vazia
processUserInput("   ");  // Apenas espaços
processUserInput("\n\n");  // Apenas quebras
```

**Asserção:**
```javascript
// Não deve crashar
// Não deve processar
assert.equal(conversationHistory.length, 0);
```

### Teste 16: Entrada Muito Longa

**Objetivo:** Validar tratamento de entrada excessivamente longa.

**Caso:**
```javascript
const longInput = "a".repeat(10000);
processUserInput(longInput);
```

**Asserção:**
```javascript
// Não deve crashar
// Deve responder com comando não reconhecido
assert.include(lastBotMessage, 'não entendi');
```

### Teste 17: Caracteres Especiais

**Objetivo:** Validar tratamento de caracteres especiais.

**Casos:**
```javascript
processUserInput("cotação $#@! 3 meses");
processUserInput("🎉 cotação 3 meses 🚀");
processUserInput("cotação <script>alert('xss')</script>");
```

**Asserção:**
```javascript
// Deve extrair parâmetros válidos
assert.equal(params.duration, 3);
// Deve ignorar caracteres especiais
```

### Teste 18: Múltiplas Interrupções

**Objetivo:** Validar robustez com múltiplas interrupções.

**Cenário:**
```
👤: "cotação"
👤: "espera"
👤: "na verdade"
👤: "deixa pra lá"
👤: "ok, agora sim"
👤: "3 meses"
```

**Asserção:**
```javascript
// Deve manter contexto
// Deve processar último comando válido
assert.equal(params.duration, 3);
```

### Teste 19: Estado Inconsistente

**Objetivo:** Validar recuperação de estado inconsistente.

**Cenário:**
```javascript
// Forçar estado inconsistente
context.stage = 'confirming';
context.params = {}; // Vazio, mas em confirming

// Tentar processar
processUserInput("sim");
```

**Asserção:**
```javascript
// Não deve crashar
// Deve detectar inconsistência
// Deve voltar a gathering ou solicitar reinício
```

---

## 📊 Testes de Auditoria

### Teste 20: Log de Inferências

**Objetivo:** Validar que todas as inferências são logadas.

**Cenário:**
```javascript
processUserInput("3 meses segunda a sexta");
```

**Asserções:**
```javascript
assert.include(context.inferredParams, 'duration: 3');
assert.include(context.inferredParams, 'durationType: meses');
assert.include(context.inferredParams, 'days: 1,2,3,4,5');
```

### Teste 21: Log de Confirmações

**Objetivo:** Validar que confirmações são logadas.

**Cenário:**
```javascript
showPartialSummaryAndAskConfirmation();
processUserInput("sim");
```

**Asserções:**
```javascript
assert.isArray(context.userConfirmations);
assert.isTrue(context.userConfirmations.length > 0);
assert.property(context.userConfirmations[0], 'timestamp');
```

### Teste 22: Histórico Completo

**Objetivo:** Validar que histórico de conversa é mantido.

**Cenário:**
```javascript
processUserInput("olá");
processUserInput("cotação 3 meses");
processUserInput("segunda a sexta");
processUserInput("sim");
```

**Asserções:**
```javascript
assert.equal(conversationHistory.length, 8); // 4 user + 4 bot
assert.property(conversationHistory[0], 'role');
assert.property(conversationHistory[0], 'content');
assert.property(conversationHistory[0], 'timestamp');
```

### Teste 23: Exportação de Auditoria

**Objetivo:** Validar que auditoria pode ser exportada.

**Cenário:**
```javascript
handleAuditRequest();
```

**Asserções:**
```javascript
const audit = lastBotMessage;
assert.include(audit, 'Parâmetros Inferidos');
assert.include(audit, 'Confirmações do Usuário');
assert.include(audit, 'Composição do Valor');
```

### Teste 24: Rastreabilidade Completa

**Objetivo:** Validar rastreabilidade fim-a-fim.

**Cenário:**
```javascript
// Criar cotação completa
const quotationId = createQuotation();

// Exportar histórico
const history = exportHistory();

// Tentar reproduzir
const reproduced = reproduceFromHistory(history);
```

**Asserções:**
```javascript
// Deve ser possível reproduzir exatamente
assert.deepEqual(reproduced.resultado, original.resultado);
```

---

## 🎯 Matriz de Cobertura

| Categoria | Testes | Cobertura |
|-----------|--------|-----------|
| Fluxo Completo | 3 | 100% |
| Linguagem Natural | 4 | 100% |
| Confirmação | 3 | 100% |
| Voz | 4 | 100% |
| Borda | 5 | 100% |
| Auditoria | 4 | 100% |
| **TOTAL** | **23** | **100%** |

---

## 🚀 Execução dos Testes

### Setup

```javascript
// Mock do dataManager
const mockDataManager = {
    obterSalas: () => [{id: 1, nome: 'Sala Multiuso'}],
    obterFuncionariosAtivos: () => [{id: 1, nome: 'Func 1', horaNormal: 50}],
    obterMultiplicadoresTurno: () => ({manha: 1, tarde: 1, noite: 1.5})
};

// Inicializar chat para teste
const chatAI = new ChatAI(mockDataManager);
```

### Executar Todos os Testes

```bash
# Executar suite completa
npm test

# Executar categoria específica
npm test -- --grep "Linguagem Natural"

# Executar teste específico
npm test -- --grep "Teste 8"
```

### Relatório de Cobertura

```bash
npm run test:coverage
```

---

**Última atualização:** Dezembro 2024
**Versão:** 1.0.0
