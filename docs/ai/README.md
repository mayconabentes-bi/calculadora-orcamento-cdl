# 🤖 Chat IA de Cotação - Documentação Completa

## 📋 Visão Geral

Este diretório contém toda a documentação relacionada ao Chat IA de Cotação, incluindo governança, prompts, fluxos, testes e guias de implementação.

---

## 📚 Documentos Principais

### 1. [GOVERNANCE.md](GOVERNANCE.md) - Governança e Regras
**Leia primeiro!** Este documento estabelece os princípios fundamentais:
- ✅ Separação de Responsabilidades (LLM vs Motor de Regras)
- ✅ Regras de Negócio Críticas
- ✅ Processo de Revisão
- ✅ Métricas e KPIs

**Público-alvo:** Todos os desenvolvedores e revisores

### 2. [system-prompts.md](system-prompts.md) - Prompts do Sistema
Documentação completa de todos os prompts:
- 🤖 System Prompts Principais
- 💬 Prompts de Conversação
- 🛡️ Prompts de Guardrails (Segurança)
- 🔧 Prompts de Tool Calling
- 📚 Exemplos e Padrões

**Público-alvo:** Desenvolvedores trabalhando com NLP e conversação

### 3. [conversation-flows.md](conversation-flows.md) - Fluxos Conversacionais
Documentação de estados e fluxos:
- 🔄 Estados da Conversa (5 estados)
- 🎯 Fluxos Principais (4 cenários)
- 🚨 Tratamento de Exceções (5 casos)
- 🔀 Transições de Estado
- 📊 Métricas de Fluxo

**Público-alvo:** Desenvolvedores e arquitetos

### 4. [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) - Guia de Implementação
Guia completo de uso do sistema:
- 🔧 Como Funciona
- 📝 Guia de Uso (Desenvolvedores, Revisores, Gestores)
- 🔄 Manutenção
- 🚨 Troubleshooting
- 🚀 Próximos Passos

**Público-alvo:** Todos

### 5. [CONTRIBUTING.md](CONTRIBUTING.md) - Como Contribuir
Guia para contribuir com o Chat IA:
- 🎯 Tipos de Contribuição
- ✅ Checklist de PR
- 🚫 O que NÃO Fazer
- 🎨 Estilo de Código
- 🧪 Como Testar

**Público-alvo:** Contribuidores e novos desenvolvedores

---

## 🗂️ Estrutura de Arquivos

```
docs/ai/
├── README.md                    # Este arquivo (índice)
├── GOVERNANCE.md                # Governança e regras ⭐
├── system-prompts.md            # Prompts do sistema
├── conversation-flows.md        # Fluxos conversacionais
├── IMPLEMENTATION_GUIDE.md      # Guia de implementação
└── CONTRIBUTING.md              # Guia de contribuição
```

---

## 🚀 Início Rápido

### Para Novos Desenvolvedores

1. **Leia primeiro:**
   - [ ] `GOVERNANCE.md` (15 min)
   - [ ] `system-prompts.md` (20 min)
   - [ ] `conversation-flows.md` (15 min)

2. **Explore o código:**
   - [ ] `assets/js/chat-ai.js` - Lógica principal
   - [ ] `assets/js/chat-ui.js` - Interface

3. **Entenda a arquitetura:**
   ```
   LLM → Orquestração → Motor de Regras → Dados
   ```

4. **Faça seu primeiro PR:**
   - [ ] Leia `CONTRIBUTING.md`
   - [ ] Escolha uma issue simples
   - [ ] Siga o checklist de PR

### Para Revisores

1. **Conheça as verificações:**
   - [ ] `.github/workflows/ai-review.yml` - Workflow automático
   - [ ] `.github/agents/senior-ai-reviewer.yml` - Configuração

2. **Use o checklist:**
   - [ ] Arquitetura (LLM não calcula?)
   - [ ] Confirmação (Sempre solicita?)
   - [ ] Logs (Auditável?)
   - [ ] Testes (Cobertos?)

3. **Revise com contexto:**
   - Workflow automático dá base
   - Checklist manual complementa
   - Código review é final

### Para Gestores

1. **Acompanhe métricas:**
   - Taxa de aprovação de PRs
   - Cobertura de testes
   - Issues críticos

2. **Revise semanalmente:**
   - PRs com falhas
   - Padrões de erro
   - Feedback da equipe

3. **Planeje melhorias:**
   - Baseado em métricas
   - Feedback de usuários
   - Tendências do mercado

---

## 📊 Princípios Fundamentais

### 1. Separação de Responsabilidades

**NUNCA:**
```javascript
// ❌ LLM calculando
const total = custoBase * dias;
```

**SEMPRE:**
```javascript
// ✅ Motor calculando
const resultado = this.calculateQuotation(params);
```

### 2. Linguagem Natural Real

**ACEITAR:**
```
"preciso uma cotação pra uns 3 meses"
"de segunda até sex"
"na verdade, melhor 6 meses"
```

**NÃO EXIGIR:**
```
"Criar cotação com duração=3 meses"
```

### 3. Confirmação Explícita

**SEMPRE:**
```javascript
// Mostrar resumo
this.showPartialSummaryAndAskConfirmation();
// Aguardar "sim"
if (this.isConfirmation(input)) {
    // Só então gerar
}
```

### 4. Auditoria Completa

**SEMPRE LOGAR:**
```javascript
this.logInferredParameter('duration', 3);
this.logUserConfirmation('Confirmou 3 meses');
```

---

## 🎯 Métricas de Qualidade

| Métrica | Alvo | Status Atual |
|---------|------|--------------|
| Cobertura de Testes | >80% | 100% (doc) |
| Taxa de Inferência Correta | >95% | - |
| Taxa de Confirmação | 100% | ✅ |
| Tempo de Resposta | <2s | - |
| Taxa de Conclusão | >90% | - |

---

## 🔄 Workflow de Revisão

### Automático (6 Jobs)

1. **Architecture Review** ✅
   - Verifica separação LLM/Motor
   - Verifica confirmação obrigatória

2. **Prompt Quality** ✅
   - Verifica padrões conversacionais
   - Verifica contexto

3. **Voice Parity** ✅
   - Verifica mesmo pipeline
   - Verifica silêncio

4. **Test Coverage** ✅
   - Verifica testes existem
   - Conta cenários

5. **Documentation** ✅
   - Verifica docs atualizadas

6. **Security** ✅
   - Verifica credenciais
   - Verifica XSS

### Manual (Checklist)

- [ ] Código revisado
- [ ] Testes adicionados
- [ ] Documentação atualizada
- [ ] Aderente à governança

---

## 🧪 Testes

### Localização
- `../../tests/conversational/test-scenarios.md`

### Categorias (23+ testes)
- ✅ Fluxo Completo (3)
- ✅ Linguagem Natural (4)
- ✅ Confirmação (3)
- ✅ Voz (4)
- ✅ Borda (5)
- ✅ Auditoria (4)

### Coverage
- 100% (documentado)
- Framework automatizado: próximo passo

---

## 📞 Suporte

### Dúvidas sobre:

**Arquitetura:**
- Leia: `GOVERNANCE.md`
- Veja: `.github/agents/senior-ai-reviewer.yml`

**Prompts:**
- Leia: `system-prompts.md`
- Exemplos: Seção "Exemplos e Padrões"

**Fluxos:**
- Leia: `conversation-flows.md`
- Diagrama: Seção "Diagrama de Estados"

**Como contribuir:**
- Leia: `CONTRIBUTING.md`
- Checklist: Seção "Checklist de PR"

**Implementação:**
- Leia: `IMPLEMENTATION_GUIDE.md`
- Troubleshooting: Última seção

### Issues
- Abra issue com label apropriado:
  - `question` - Dúvidas
  - `bug` - Bugs
  - `enhancement` - Melhorias
  - `documentation` - Docs

---

## 🔮 Roadmap

### ✅ v1.0 (Atual)
- Configuração do Agent
- Workflow automático
- Documentação completa
- 23+ cenários de teste

### 🚧 v1.1 (Próximo)
- Testes automatizados em JS
- Métricas de produção
- Dashboard de qualidade

### 🎯 v2.0 (Futuro)
- Machine learning para detecção
- Auto-correção de problemas
- Feedback loop com usuários

---

## 🏆 Créditos

**Desenvolvido por:** Equipe de Desenvolvimento CDL/UTV

**Contribuidores:**
- Ver `CHANGELOG.md`
- Ver GitHub Contributors

**Licença:** MIT

---

## 📖 Glossário

**LLM:** Large Language Model - Interpreta linguagem natural

**Motor de Regras:** Sistema que executa cálculos e validações

**Orquestração:** Coordenação entre LLM e Motor

**Guardrails:** Regras de segurança do LLM

**NLP:** Natural Language Processing

**Paridade Voz-Texto:** Voz e texto usam mesmo código

**Confirmação Explícita:** Usuário deve dizer "sim"

**Auditoria:** Sistema de logs e rastreabilidade

---

**Última atualização:** Dezembro 2024  
**Versão da Documentação:** 1.0.0  
**Status:** ✅ Produção
