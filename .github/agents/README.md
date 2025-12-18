# 🤖 GitHub Senior Agent - Chat IA Review

## 📋 Visão Geral

Este diretório contém a configuração do **GitHub Senior Agent**, um agente automatizado especializado em revisar e garantir a qualidade do Chat IA de Cotação.

## 🎯 Objetivo

Elevar o Chat IA de Cotação ao nível de:
- ✅ Assistente confiável de produção
- ✅ Canal principal de geração de receita
- ✅ Experiência conversacional fluida e natural

## 📁 Estrutura

```
.github/agents/
├── README.md                    # Este arquivo
└── senior-ai-reviewer.yml       # Configuração do agent
```

## 🔍 O que o Agent Revisa

### 1. Arquitetura
- ✅ Separação entre LLM, Orquestração e Motor de Regras
- ✅ LLM não calcula valores diretamente
- ✅ LLM não cria ou modifica regras de negócio
- ✅ Validações feitas pelo motor, não pelo LLM

### 2. Prompts e Conversação
- ✅ Aceita linguagem coloquial brasileira
- ✅ Mantém contexto conversacional
- ✅ Reconhece encerramentos naturais
- ✅ Solicita confirmação explícita

### 3. NLP e Inferência
- ✅ Infere parâmetros de linguagem natural
- ✅ Trata frases incompletas
- ✅ Permite correções durante conversa
- ✅ Mantém histórico completo

### 4. Voz
- ✅ Voz e texto usam mesmo pipeline lógico
- ✅ Tratamento adequado de silêncio e pausas
- ✅ Detecção de encerramento por voz

### 5. UI/UX
- ✅ Abrir, minimizar e fechar chat funciona
- ✅ Persistência de contexto entre sessões
- ✅ Retomada de conversa interrompida

### 6. Testes
- ✅ Testes conversacionais implementados
- ✅ Cenários de fechamento de cotação
- ✅ Testes de confirmação explícita
- ✅ Testes de cálculo consistente
- ✅ Cenários de borda cobertos

### 7. Auditoria
- ✅ Logs de decisões inferidas
- ✅ Rastreabilidade completa de cotações
- ✅ Histórico exportável
- ✅ Explicabilidade para usuário

## 🚦 Classificação de Achados

### 🔴 Crítico (Bloqueia Merge)
- LLM calculando valores diretamente
- LLM criando ou modificando regras
- LLM ignorando validações
- Sem confirmação explícita
- Sem testes de fluxo crítico

### 🟡 Importante (Ajuste Recomendado)
- Prompts não conversacionais
- Falta de logs de auditoria
- Divergência entre voz e texto
- Contexto não persistente

### 🟢 Oportunidade de Melhoria
- UX pode ser melhorada
- Falta tratamento de borda
- Documentação incompleta

## 📊 Formato de Resposta

O agent sempre responde no formato:

```
✅ Conformidades
- Lista de verificações aprovadas

❌ Problemas Críticos (bloqueia merge)
- Problemas que devem ser corrigidos

⚠️ Melhorias Recomendadas
- Ajustes importantes mas não bloqueantes

💡 Sugestões Estratégicas
- Oportunidades de melhoria de longo prazo

🧪 Testes Sugeridos
- Testes que devem ser adicionados
```

## 🔄 Workflow Automático

O agent é executado automaticamente via GitHub Actions:

**Arquivo:** `.github/workflows/ai-review.yml`

**Triggers:**
- Pull requests que modificam chat-ai.js ou chat-ui.js
- Push para branches main/develop

**Jobs:**
1. Architecture Review - Verifica arquitetura
2. Prompt Quality - Verifica qualidade dos prompts
3. Voice Parity - Verifica paridade voz-texto
4. Test Coverage - Verifica cobertura de testes
5. Documentation - Verifica documentação
6. Security Check - Verifica segurança

## 📚 Documentação Relacionada

### Governança
- **docs/GOVERNANCE.md** - Diretrizes de governança completas
- Princípios de separação de responsabilidades
- Regras de negócio críticas
- Processo de revisão

### Prompts
- **docs/ai/system-prompts.md** - Todos os prompts do sistema
- System prompts principais
- Prompts de conversação
- Prompts de guardrails
- Exemplos e padrões

### Fluxos
- **docs/ai/conversation-flows.md** - Fluxos conversacionais
- Estados da conversa
- Transições de estado
- Tratamento de exceções
- Métricas de fluxo

### Testes
- **tests/conversational/test-scenarios.md** - Cenários de teste
- 23+ cenários de teste documentados
- Testes de linguagem natural
- Testes de confirmação
- Testes de voz
- Testes de borda

## 🎯 Métricas de Qualidade

| Métrica | Alvo | Crítico |
|---------|------|---------|
| Cobertura de Testes | >80% | <60% |
| Taxa de Inferência Correta | >95% | <90% |
| Taxa de Confirmação Explícita | 100% | <100% |
| Tempo de Resposta | <2s | >5s |
| Taxa de Conclusão | >90% | <70% |

## 🚀 Como Usar

### 1. Para Desenvolvedores

Antes de criar um PR:

```bash
# Verificar manualmente as conformidades
grep -n "const.*=.*\*\|const.*=.*+" assets/js/chat-ai.js

# Garantir que testes existem
ls tests/conversational/

# Validar documentação
ls docs/ai/
```

### 2. Para Revisores

O workflow automático fornecerá:
- ✅ Lista de conformidades
- ❌ Problemas encontrados
- 💡 Sugestões de melhoria

Use isso como base para revisão manual.

### 3. Para Gestores

Métricas e KPIs são atualizados automaticamente:
- Cobertura de testes
- Taxa de conformidade
- Problemas críticos pendentes

## 🔧 Configuração

### Habilitar Workflow

O workflow já está configurado e será executado automaticamente.

### Personalizar Regras

Edite `.github/agents/senior-ai-reviewer.yml` para:
- Adicionar novas verificações
- Ajustar severidade de regras
- Modificar métricas alvo

### Adicionar Novos Testes

1. Documente em `tests/conversational/test-scenarios.md`
2. Implemente o teste
3. Atualize a matriz de cobertura

## 📞 Suporte

Para dúvidas sobre:

**Agent Configuration:**
- `.github/agents/senior-ai-reviewer.yml`

**Workflow:**
- `.github/workflows/ai-review.yml`

**Governança:**
- `docs/GOVERNANCE.md`

**Testes:**
- `tests/conversational/test-scenarios.md`

## 🔄 Evolução Contínua

O agent aprende de:
- ✅ Feedback de revisões anteriores
- ✅ Métricas de produção
- ✅ Padrões de erro detectados
- ✅ Sugestões da equipe

E sugere:
- 📝 Novos testes baseados em falhas
- 💬 Melhorias de prompt
- 🔄 Otimizações de fluxo

## 📈 Histórico de Versões

**v1.0.0** (Dezembro 2024)
- ✅ Implementação inicial do agent
- ✅ Configuração de workflow automático
- ✅ Documentação completa
- ✅ 23+ cenários de teste
- ✅ Métricas e KPIs definidos

---

**Última atualização:** Dezembro 2024
**Versão:** 1.0.0
**Mantenedor:** Equipe de Desenvolvimento CDL/UTV
