# 🛡️ Governança do Chat IA de Cotação

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Princípios de Governança](#princípios-de-governança)
3. [Arquitetura e Separação de Responsabilidades](#arquitetura-e-separação-de-responsabilidades)
4. [Regras de Negócio](#regras-de-negócio)
5. [Auditoria e Rastreabilidade](#auditoria-e-rastreabilidade)
6. [Qualidade e Testes](#qualidade-e-testes)
7. [Processo de Revisão](#processo-de-revisão)
8. [Métricas e KPIs](#métricas-e-kpis)

---

## 🎯 Visão Geral

Este documento estabelece as diretrizes de governança para o **Chat IA de Cotação**, garantindo que o sistema seja confiável, auditável e escalável.

### Objetivo

Elevar o Chat IA ao nível de:
- ✅ **Assistente confiável de produção**
- ✅ **Canal principal de geração de receita**
- ✅ **Experiência conversacional fluida e natural**

---

## 🏛️ Princípios de Governança

### 1. Separação de Responsabilidades

**PRINCÍPIO FUNDAMENTAL:** O LLM não deve calcular, criar regras ou validar dados.

```
┌─────────────────────────────────────────────────┐
│              CAMADA DE CONVERSAÇÃO              │
│  (chat-ai.js - Interpretação de Linguagem)     │
│                                                  │
│  • Interpretar linguagem natural                │
│  • Inferir intenções do usuário                 │
│  • Manter contexto conversacional               │
│  • Gerenciar fluxo de diálogo                   │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│           CAMADA DE ORQUESTRAÇÃO                │
│  (chat-ai.js - Coordenação)                     │
│                                                  │
│  • Validar parâmetros obrigatórios              │
│  • Solicitar confirmações                       │
│  • Coordenar fluxo de trabalho                  │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│            MOTOR DE REGRAS DE NEGÓCIO           │
│  (calculateQuotation - Cálculos)                │
│                                                  │
│  • Aplicar regras de cálculo                    │
│  • Calcular custos operacionais                 │
│  • Aplicar multiplicadores                      │
│  • Calcular margens e descontos                 │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│          APIs DA PLATAFORMA                     │
│  (data-manager.js - Fonte de Verdade)           │
│                                                  │
│  • Fornecer dados de espaços                    │
│  • Fornecer dados de funcionários               │
│  • Fornecer multiplicadores                     │
│  • Persistir histórico                          │
└─────────────────────────────────────────────────┘
```

### 2. Fonte Única de Verdade

**REGRA:** A plataforma (data-manager.js) é a fonte única de verdade.

- ✅ **Permitido:** LLM consultar dados via data-manager
- ❌ **Proibido:** LLM inventar ou modificar dados
- ✅ **Permitido:** LLM inferir intenções do usuário
- ❌ **Proibido:** LLM calcular valores diretamente

### 3. Linguagem Natural Real

**OBJETIVO:** O chat deve entender linguagem coloquial brasileira.

✅ **Exemplos Aceitos:**
```
"preciso uma cotação pra 3 meses"
"quero fazer um orçamento"
"de segunda a sexta, umas 8h por dia"
"na verdade, queria 6 meses, não 3"
```

❌ **Não aceitar apenas:**
```
"Criar cotação com duração=3 meses, dias=[1,2,3,4,5]"
```

---

## 🏗️ Arquitetura e Separação de Responsabilidades

### Responsabilidades do LLM (chat-ai.js)

#### ✅ Pode fazer:

1. **Interpretação de Linguagem Natural**
   - Extrair parâmetros de frases coloquiais
   - Inferir intenções do usuário
   - Reconhecer correções e ajustes

2. **Gestão de Conversação**
   - Manter contexto da conversa
   - Solicitar informações faltantes
   - Confirmar entendimento

3. **Orquestração de Fluxo**
   - Coordenar etapas do processo
   - Gerenciar estados da conversa
   - Solicitar confirmações

#### ❌ Não pode fazer:

1. **Cálculos Diretos**
   ```javascript
   // ❌ ERRADO
   const total = custoBase * multiplicador + maoDeObra;
   
   // ✅ CORRETO
   const resultado = this.calculateQuotation(params);
   ```

2. **Criar ou Modificar Regras**
   ```javascript
   // ❌ ERRADO
   if (userIsPremium) discount = 50;
   
   // ✅ CORRETO
   const discount = this.dataManager.obterDescontoFidelidade();
   ```

3. **Validação de Negócio**
   ```javascript
   // ❌ ERRADO
   if (price < 100) return "Preço muito baixo";
   
   // ✅ CORRETO
   const validation = this.dataManager.validarOrcamento(params);
   ```

### Responsabilidades do Motor de Regras

#### ✅ Deve fazer:

1. **Todos os Cálculos**
   - Calcular custos operacionais
   - Aplicar multiplicadores de turno
   - Calcular horas extras
   - Aplicar margens e descontos

2. **Todas as Validações**
   - Validar parâmetros de entrada
   - Verificar limites e restrições
   - Garantir consistência

3. **Aplicar Regras de Negócio**
   - Aplicar políticas de desconto
   - Calcular horas extras corretamente
   - Respeitar limites operacionais

---

## 📜 Regras de Negócio

### Regras Críticas (Não Violáveis)

#### 1. Confirmação Explícita

**REGRA:** Toda cotação deve ser confirmada explicitamente pelo usuário.

```javascript
// ✅ IMPLEMENTAÇÃO CORRETA
if (this.currentContext.waitingForFinalConfirmation && this.isConfirmation(input)) {
    // Gerar cotação apenas após confirmação
    const quotation = this.generateQuotation(params);
}
```

**Justificativa:** Evita cotações incorretas por má interpretação.

#### 2. Horas Extras

**REGRA:** Sábados e domingos devem alertar sobre horas extras.

- Sábado = HE 50% (custo adicional de 50%)
- Domingo = HE 100% (custo adicional de 100%)

```javascript
// ✅ IMPLEMENTAÇÃO CORRETA
if (params.days.includes(6) || params.days.includes(0)) {
    const heResponse = this.requestHEConfirmation(params);
    // Aguardar confirmação antes de prosseguir
}
```

#### 3. Auditoria de Decisões

**REGRA:** Todas as inferências devem ser logadas.

```javascript
// ✅ IMPLEMENTAÇÃO CORRETA
this.logInferredParameter('duração', params.duration);
this.logUserConfirmation('Confirmou 3 meses');
```

---

## 🔍 Auditoria e Rastreabilidade

### Sistema de Logs

#### Logs Obrigatórios

1. **Comandos do Usuário**
   ```javascript
   this.logCommandInterpretation(input);
   ```

2. **Parâmetros Inferidos**
   ```javascript
   this.logInferredParameter(param, value);
   ```

3. **Confirmações**
   ```javascript
   this.logUserConfirmation(confirmation);
   ```

### Histórico de Conversação

```javascript
this.conversationHistory = [
    {
        role: 'user',
        content: 'Preciso de cotação para 3 meses',
        timestamp: new Date()
    },
    {
        role: 'bot',
        content: 'Certo! E quais dias da semana?',
        timestamp: new Date()
    }
];
```

### Contexto de Cotação

```javascript
this.currentContext = {
    stage: 'gathering',  // initial, gathering, refining, confirming, completed
    params: {},          // Parâmetros inferidos
    lastQuotation: null, // Última cotação gerada
    inferredParams: [],  // Log de inferências
    userConfirmations: [] // Log de confirmações
};
```

---

## 🧪 Qualidade e Testes

### Testes Obrigatórios

#### 1. Testes Conversacionais

Localização: `tests/conversational/`

**Cenários Obrigatórios:**

1. **Fluxo Completo**
   - Usuário solicita cotação
   - Chat coleta parâmetros
   - Chat solicita confirmação
   - Cotação é gerada

2. **Entrada Parcial**
   - Usuário fornece alguns parâmetros
   - Chat solicita faltantes
   - Fluxo é completado

3. **Correções**
   - Usuário corrige informação
   - Chat atualiza parâmetros
   - Cálculo reflete correção

4. **Confirmação Explícita**
   - Chat sempre solicita confirmação
   - Cotação só é gerada após "sim"

5. **Paridade Voz-Texto**
   - Voz e texto geram mesmo resultado
   - Mesmo pipeline lógico

#### 2. Testes de Cálculo

**Validações Obrigatórias:**

1. Horas normais calculadas corretamente
2. Horas extras (50% e 100%) aplicadas corretamente
3. Margem de lucro aplicada corretamente
4. Desconto aplicado corretamente
5. Valor final consistente

#### 3. Testes de Borda

1. Entrada vazia
2. Entrada ambígua
3. Múltiplas correções
4. Interrupção de fluxo
5. Retomada de conversa

---

## 🔄 Processo de Revisão

### Checklist de Revisão de PR

#### Arquitetura
- [ ] LLM não calcula valores diretamente?
- [ ] LLM não cria ou modifica regras?
- [ ] Separação de responsabilidades clara?
- [ ] Motor de regras é a fonte de cálculos?

#### Prompts
- [ ] Aceita linguagem coloquial?
- [ ] Mantém contexto conversacional?
- [ ] Reconhece encerramentos naturais?
- [ ] Solicita confirmação explícita?

#### Conversação
- [ ] Infere parâmetros corretamente?
- [ ] Trata frases incompletas?
- [ ] Permite correções?
- [ ] Mantém histórico?

#### Voz
- [ ] Voz e texto usam mesmo pipeline?
- [ ] Trata silêncio adequadamente?
- [ ] Pausas são gerenciadas?

#### Testes
- [ ] Testes conversacionais presentes?
- [ ] Testes de cálculo validados?
- [ ] Cenários de borda cobertos?
- [ ] Paridade voz-texto testada?

#### Auditoria
- [ ] Logs de decisões implementados?
- [ ] Rastreabilidade completa?
- [ ] Histórico exportável?
- [ ] Explicabilidade disponível?

### Classificação de Achados

#### 🔴 Crítico (Bloqueia Merge)
- LLM calculando valores
- LLM criando regras
- Sem confirmação explícita
- Sem testes de fluxo crítico

#### 🟡 Importante (Ajuste Recomendado)
- Prompts não conversacionais
- Falta logs de auditoria
- Divergência voz-texto
- Contexto não persistente

#### 🟢 Oportunidade de Melhoria
- UX pode ser melhorada
- Falta tratamento de borda
- Documentação incompleta

---

## 📊 Métricas e KPIs

### Métricas de Qualidade

| Métrica | Alvo | Crítico |
|---------|------|---------|
| Cobertura de Testes | >80% | <60% |
| Taxa de Inferência Correta | >95% | <90% |
| Taxa de Confirmação Explícita | 100% | <100% |
| Tempo de Resposta | <2s | >5s |
| Taxa de Conclusão de Cotação | >90% | <70% |

### Métricas de Conversação

| Métrica | Descrição |
|---------|-----------|
| Turnos Médios | Número médio de mensagens até conclusão |
| Taxa de Abandono | % de conversas não concluídas |
| Taxa de Correção | % de parâmetros que usuário corrige |
| Satisfação | NPS do usuário com o chat |

### Métricas de Auditoria

| Métrica | Descrição |
|---------|-----------|
| Rastreabilidade | % de cotações completamente rastreáveis |
| Logs Completos | % de conversas com logs completos |
| Reprodutibilidade | % de cotações reproduzíveis a partir de logs |

---

## 🚀 Evolução Contínua

### Aprendizado

O sistema deve aprender de:
- Feedback de usuários
- Padrões de erro
- Métricas de produção
- Revisões de código

### Melhorias Sugeridas

1. **Prompts:** Ajustar baseado em incompreensões
2. **Testes:** Adicionar baseado em falhas de produção
3. **Fluxos:** Otimizar baseado em métricas de abandono
4. **UX:** Melhorar baseado em feedback

---

## 📞 Contato e Suporte

Para dúvidas sobre governança:
- **Documentação:** Este arquivo
- **Agent Config:** `.github/agents/senior-ai-reviewer.yml`
- **Testes:** `tests/conversational/`

---

**Última atualização:** Dezembro 2024
**Versão:** 1.0.0
