# 🚀 Guia de Implementação - GitHub Agent Sênior

## 📋 Visão Geral

Este guia fornece instruções completas para implementar e manter o GitHub Agent Sênior de revisão do Chat IA de Cotação.

## 🎯 O que foi Implementado

### 1. Configuração do Agent
✅ **Arquivo:** `.github/agents/senior-ai-reviewer.yml`
- Definição de expertise e missão
- Verificações obrigatórias (arquitetura, prompts, voz, testes, auditoria)
- Classificação de achados (crítico, importante, oportunidade)
- Métricas de qualidade

### 2. Workflow Automático
✅ **Arquivo:** `.github/workflows/ai-review.yml`
- Review automático em PRs e pushes
- 6 jobs independentes:
  - Architecture Review
  - Prompt Quality
  - Voice Parity
  - Test Coverage
  - Documentation
  - Security Check

### 3. Documentação de Governança
✅ **Arquivo:** `docs/GOVERNANCE.md`
- Princípios de governança
- Separação de responsabilidades
- Regras de negócio críticas
- Processo de revisão
- Métricas e KPIs

### 4. Documentação de Prompts
✅ **Arquivo:** `docs/ai/system-prompts.md`
- System prompts principais
- Prompts de conversação
- Prompts de guardrails
- Prompts de tool calling
- Exemplos e padrões

### 5. Documentação de Fluxos
✅ **Arquivo:** `docs/ai/conversation-flows.md`
- Diagrama de estados
- Fluxos principais (4 cenários)
- Tratamento de exceções (5 casos)
- Transições de estado
- Métricas de fluxo

### 6. Cenários de Teste
✅ **Arquivo:** `tests/conversational/test-scenarios.md`
- 23+ cenários de teste documentados
- Testes de fluxo completo
- Testes de linguagem natural
- Testes de confirmação
- Testes de voz
- Testes de borda
- Testes de auditoria

---

## 🔧 Como Funciona

### Arquitetura do Sistema de Revisão

```
┌─────────────────────────────────────────────────┐
│              GITHUB REPOSITORY                   │
│                                                  │
│  Pull Request ou Push                            │
│  ↓                                               │
│  Trigger: .github/workflows/ai-review.yml        │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│           GITHUB ACTIONS WORKFLOW                │
│                                                  │
│  ┌─────────────────────────────────────────┐   │
│  │  1. Architecture Review                  │   │
│  │     - Verifica separação LLM/Motor       │   │
│  │     - Verifica confirmação obrigatória   │   │
│  │     - Verifica logs de auditoria         │   │
│  └─────────────────────────────────────────┘   │
│                                                  │
│  ┌─────────────────────────────────────────┐   │
│  │  2. Prompt Quality                       │   │
│  │     - Verifica padrões conversacionais   │   │
│  │     - Verifica manutenção de contexto    │   │
│  └─────────────────────────────────────────┘   │
│                                                  │
│  ┌─────────────────────────────────────────┐   │
│  │  3. Voice Parity                         │   │
│  │     - Verifica mesmo pipeline            │   │
│  │     - Verifica detecção de silêncio      │   │
│  └─────────────────────────────────────────┘   │
│                                                  │
│  ┌─────────────────────────────────────────┐   │
│  │  4. Test Coverage                        │   │
│  │     - Verifica cenários de teste         │   │
│  │     - Conta cenários                     │   │
│  └─────────────────────────────────────────┘   │
│                                                  │
│  ┌─────────────────────────────────────────┐   │
│  │  5. Documentation                        │   │
│  │     - Verifica governança                │   │
│  │     - Verifica prompts                   │   │
│  │     - Verifica fluxos                    │   │
│  └─────────────────────────────────────────┘   │
│                                                  │
│  ┌─────────────────────────────────────────┐   │
│  │  6. Security Check                       │   │
│  │     - Verifica credenciais hardcoded     │   │
│  │     - Verifica XSS                       │   │
│  └─────────────────────────────────────────┘   │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│              REVIEW SUMMARY                      │
│                                                  │
│  - Status de cada job                            │
│  - Conformidades encontradas                     │
│  - Problemas detectados                          │
│  - Recomendações                                 │
└─────────────────────────────────────────────────┘
```

---

## 📝 Guia de Uso

### Para Desenvolvedores

#### Antes de Fazer um PR

1. **Verifique Arquitetura**
   ```bash
   # Certifique-se de que não está calculando no LLM
   grep -n "const.*=.*\*" assets/js/chat-ai.js | grep -v calculateQuotation
   
   # Deve retornar vazio
   ```

2. **Verifique Confirmações**
   ```bash
   # Certifique-se de que confirmação está implementada
   grep -n "waitingForFinalConfirmation" assets/js/chat-ai.js
   
   # Deve encontrar usos
   ```

3. **Verifique Logs**
   ```bash
   # Certifique-se de que logs estão presentes
   grep -n "logInferredParameter\|logUserConfirmation" assets/js/chat-ai.js
   
   # Deve encontrar usos
   ```

4. **Execute Testes Localmente**
   ```bash
   # Se tiver implementado testes automatizados
   npm test
   ```

5. **Documente Mudanças**
   - Atualize `docs/ai/system-prompts.md` se modificou prompts
   - Atualize `docs/ai/conversation-flows.md` se modificou fluxos
   - Adicione cenários em `tests/conversational/test-scenarios.md` se necessário

#### Ao Criar o PR

1. O workflow será executado automaticamente
2. Revise os resultados de cada job
3. Se houver falhas críticas (❌), corrija antes de pedir review
4. Se houver warnings (⚠️), considere corrigir
5. Adicione informações relevantes na descrição do PR

#### Interpretando Resultados

**✅ Sucesso (Green)**
- Todas as verificações passaram
- PR está pronto para review manual

**⚠️ Warning (Yellow)**
- Algumas verificações têm avisos
- Revise e considere melhorias
- Não bloqueia o merge

**❌ Falha (Red)**
- Verificações críticas falharam
- **BLOQUEIA** o merge
- Corrija antes de continuar

### Para Revisores

#### Checklist Manual

Use este checklist em conjunto com o workflow automático:

```markdown
## Arquitetura
- [ ] LLM não calcula valores diretamente?
- [ ] LLM não cria regras?
- [ ] Validações no motor de regras?
- [ ] Separação clara de responsabilidades?

## Conversação
- [ ] Aceita linguagem coloquial?
- [ ] Mantém contexto?
- [ ] Trata frases incompletas?
- [ ] Permite correções?

## Confirmação
- [ ] Sempre solicita confirmação?
- [ ] Mostra resumo antes?
- [ ] Aceita múltiplas formas de confirmar?

## Voz
- [ ] Voz usa mesmo pipeline que texto?
- [ ] Trata silêncio adequadamente?
- [ ] Trata pausas corretamente?

## Testes
- [ ] Testes para novas funcionalidades?
- [ ] Cenários de borda cobertos?
- [ ] Documentação de teste atualizada?

## Auditoria
- [ ] Logs de inferência implementados?
- [ ] Confirmações são logadas?
- [ ] Histórico é mantido?
```

#### Decisão de Merge

**Aprovar se:**
- ✅ Workflow passou ou tem apenas warnings
- ✅ Checklist manual aprovado
- ✅ Código revisado
- ✅ Documentação atualizada

**Solicitar mudanças se:**
- ❌ Workflow tem falhas críticas
- ❌ Checklist manual tem itens críticos não aprovados
- ❌ Código tem problemas de qualidade

**Comentar (sem bloquear) se:**
- ⚠️ Warnings que podem ser melhorados
- 💡 Sugestões de otimização
- 📝 Documentação pode ser melhorada

### Para Gestores

#### Dashboard de Métricas

As seguintes métricas são rastreadas:

| Métrica | Como Ver | Alvo |
|---------|----------|------|
| Taxa de Aprovação | GitHub Actions > Summary | >90% |
| Cobertura de Testes | test-scenarios.md | >80% |
| Tempo de Review | GitHub Insights | <24h |
| Issues Críticos | GitHub Actions > Failures | 0 |

#### Relatórios

1. **Semanalmente:**
   - Revise PRs que falharam
   - Identifique padrões de erro
   - Ajuste documentação se necessário

2. **Mensalmente:**
   - Revise métricas de qualidade
   - Compare com metas
   - Planeje melhorias

3. **Trimestralmente:**
   - Avalie eficácia do agent
   - Atualize configurações
   - Treine equipe em novos padrões

---

## 🔄 Manutenção

### Atualizar Regras do Agent

1. **Edite:** `.github/agents/senior-ai-reviewer.yml`
2. **Adicione nova verificação:**
   ```yaml
   mandatory_checks:
     new_category:
       - name: "Nome da Verificação"
         description: "Descrição"
         severity: "critical|high|medium|low"
         pattern: "regex_pattern"
   ```
3. **Commit e push**
4. **Teste em um PR de exemplo**

### Atualizar Workflow

1. **Edite:** `.github/workflows/ai-review.yml`
2. **Adicione novo job:**
   ```yaml
   new-check:
     name: 📌 Novo Check
     runs-on: ubuntu-latest
     steps:
       - name: Checkout code
         uses: actions/checkout@v4
       
       - name: Run check
         run: |
           echo "🔍 Executando novo check..."
           # Seu código aqui
   ```
3. **Adicione ao summary job:**
   ```yaml
   needs: [..., new-check]
   ```

### Adicionar Novos Testes

1. **Edite:** `tests/conversational/test-scenarios.md`
2. **Adicione novo cenário:**
   ```markdown
   ### Teste X: Nome do Teste
   
   **Objetivo:** ...
   
   **Diálogo:**
   ...
   
   **Asserções:**
   ```javascript
   assert.equal(...);
   ```
   ```
3. **Atualize matriz de cobertura**
4. **Implemente teste (se tiver framework)**

### Atualizar Documentação

1. **Prompts:** Edite `docs/ai/system-prompts.md`
2. **Fluxos:** Edite `docs/ai/conversation-flows.md`
3. **Governança:** Edite `docs/GOVERNANCE.md`
4. **Commit com mensagem descritiva**

---

## 🚨 Troubleshooting

### Workflow Não Executa

**Problema:** Workflow não é disparado em PRs

**Solução:**
1. Verifique que arquivos modificados estão em `paths:`
2. Verifique permissões do Actions no repo
3. Verifique sintaxe YAML com yamllint

### Falsos Positivos

**Problema:** Workflow reporta erro mas código está correto

**Solução:**
1. Revise regex no workflow
2. Adicione exceções se necessário
3. Documente no código com comentário explicativo

### Testes Não Encontrados

**Problema:** Job de testes não encontra arquivos

**Solução:**
1. Verifique estrutura de diretórios
2. Verifique nomenclatura de arquivos
3. Verifique permissões de leitura

---

## 📚 Referências

### Documentos Principais

1. **Configuração do Agent:** `.github/agents/senior-ai-reviewer.yml`
2. **Workflow:** `.github/workflows/ai-review.yml`
3. **Governança:** `docs/GOVERNANCE.md`
4. **Prompts:** `docs/ai/system-prompts.md`
5. **Fluxos:** `docs/ai/conversation-flows.md`
6. **Testes:** `tests/conversational/test-scenarios.md`

### Links Úteis

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [YAML Syntax](https://yaml.org/spec/1.2/spec.html)
- [Grep Regex](https://www.gnu.org/software/grep/manual/grep.html)

---

## 🎓 Treinamento

### Para Novos Desenvolvedores

1. **Leia:** `docs/GOVERNANCE.md`
2. **Estude:** `docs/ai/system-prompts.md`
3. **Entenda:** `docs/ai/conversation-flows.md`
4. **Pratique:** Crie um PR de teste
5. **Observe:** Resultados do workflow
6. **Corrija:** Baseado no feedback

### Para Revisores

1. **Domine:** Checklist de revisão manual
2. **Entenda:** Configuração do agent
3. **Pratique:** Revisar PRs reais
4. **Feedback:** Melhore o processo

---

## 🔮 Próximos Passos

### Curto Prazo (1-3 meses)

- [ ] Implementar testes automatizados em JavaScript
- [ ] Adicionar métricas de produção ao workflow
- [ ] Criar dashboard de qualidade

### Médio Prazo (3-6 meses)

- [ ] Integrar com ferramentas de monitoramento
- [ ] Adicionar análise de sentimento nas respostas
- [ ] Implementar A/B testing de prompts

### Longo Prazo (6-12 meses)

- [ ] Machine learning para detectar padrões
- [ ] Auto-correção de problemas simples
- [ ] Feedback loop com usuários reais

---

**Última atualização:** Dezembro 2024
**Versão:** 1.0.0
**Autor:** Equipe de Desenvolvimento CDL/UTV
