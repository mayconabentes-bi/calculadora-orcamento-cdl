# 🤝 Guia de Contribuição - Chat IA

## 👋 Bem-vindo!

Obrigado por contribuir com o Chat IA de Cotação! Este guia ajudará você a fazer contribuições de qualidade.

---

## 📋 Antes de Começar

### Leia a Documentação

1. **Obrigatório:**
   - [ ] `docs/GOVERNANCE.md` - Entenda as regras de governança
   - [ ] `docs/ai/system-prompts.md` - Conheça os prompts
   - [ ] `docs/ai/conversation-flows.md` - Entenda os fluxos

2. **Recomendado:**
   - [ ] `.github/agents/senior-ai-reviewer.yml` - Configuração do agent
   - [ ] `tests/conversational/test-scenarios.md` - Cenários de teste

### Entenda a Arquitetura

```
LLM (chat-ai.js)
  ↓ interpreta
  ↓ infere
  ↓
ORQUESTRAÇÃO (chat-ai.js)
  ↓ valida
  ↓ coordena
  ↓
MOTOR DE REGRAS (calculateQuotation)
  ↓ calcula
  ↓ aplica regras
  ↓
DADOS (data-manager.js)
  ↓ fornece dados
  ↓ persiste
```

**Regra de Ouro:** LLM interpreta, Motor calcula!

---

## 🎯 Tipos de Contribuição

### 1. Melhorias de Prompt

**O que você pode fazer:**
- Melhorar compreensão de linguagem natural
- Adicionar novas variações de resposta
- Otimizar tom e estilo de conversa

**Como contribuir:**

1. **Identifique o problema:**
   ```
   Problema: Chat não entende "uns 3 meses"
   Esperado: Interpretar como "3 meses"
   ```

2. **Documente a mudança:**
   - Edite `docs/ai/system-prompts.md`
   - Adicione exemplo antes/depois

3. **Implemente:**
   ```javascript
   // Em extractParameters()
   
   // ANTES
   const durationMatch = input.match(/(\d+)\s*(?:mês|meses)/i);
   
   // DEPOIS
   const durationMatch = input.match(/(?:uns?\s*)?(\d+)\s*(?:mês|meses)/i);
   ```

4. **Teste:**
   - Adicione cenário em `tests/conversational/test-scenarios.md`
   - Teste manualmente várias variações

5. **Abra PR:**
   - Título: `prompt: melhorar compreensão de duração`
   - Descreva problema e solução
   - Inclua exemplos de antes/depois

### 2. Novos Fluxos Conversacionais

**O que você pode fazer:**
- Adicionar novo tipo de conversa
- Melhorar fluxo existente
- Otimizar transições de estado

**Como contribuir:**

1. **Planeje o fluxo:**
   ```mermaid
   graph TD
     A[Usuário solicita X] --> B[Chat coleta Y]
     B --> C[Chat confirma]
     C --> D[Ação executada]
   ```

2. **Documente:**
   - Adicione em `docs/ai/conversation-flows.md`
   - Descreva estados e transições

3. **Implemente:**
   ```javascript
   handleNewFlow(input) {
       // 1. Detectar intenção
       if (this.isNewIntent(input)) {
           // 2. Coletar parâmetros
           // 3. Validar
           // 4. Confirmar
           // 5. Executar
       }
   }
   ```

4. **Teste:**
   - Adicione cenários completos de teste
   - Teste casos de borda
   - Teste interrupções

5. **Abra PR:**
   - Título: `feat: adicionar fluxo de X`
   - Inclua diagrama do fluxo
   - Descreva casos de uso

### 3. Correções de Bugs

**O que você pode fazer:**
- Corrigir interpretação incorreta
- Corrigir estado inconsistente
- Corrigir vazamento de contexto

**Como contribuir:**

1. **Reproduza o bug:**
   ```
   Passos:
   1. Usuário diz "3 meses"
   2. Usuário diz "na verdade 6"
   3. Chat não atualiza duração
   
   Resultado esperado: duration = 6
   Resultado obtido: duration = 3
   ```

2. **Identifique a causa:**
   ```javascript
   // BUG: Não detecta correção
   if (this.isParameterUpdate(input)) {
       // ...
   }
   ```

3. **Corrija:**
   ```javascript
   // FIX: Melhorar detecção de correção
   isParameterUpdate(input) {
       const corrections = ['na verdade', 'melhor', 'esquece'];
       return corrections.some(c => input.includes(c));
   }
   ```

4. **Teste:**
   - Adicione teste de regressão
   - Verifique que não quebra outras funcionalidades

5. **Abra PR:**
   - Título: `fix: corrigir detecção de correção`
   - Descreva bug e como reproduzir
   - Explique a correção

### 4. Testes

**O que você pode fazer:**
- Adicionar novos cenários de teste
- Melhorar cobertura de testes
- Adicionar testes de borda

**Como contribuir:**

1. **Identifique gap:**
   ```
   Gap: Não há teste para múltiplas correções seguidas
   ```

2. **Documente cenário:**
   ```markdown
   ### Teste X: Múltiplas Correções
   
   **Objetivo:** Validar que múltiplas correções funcionam
   
   **Diálogo:**
   👤: "3 meses"
   👤: "melhor 6"
   👤: "na verdade 4"
   
   **Asserção:**
   assert.equal(params.duration, 4);
   ```

3. **Adicione em:**
   - `tests/conversational/test-scenarios.md`

4. **Implemente (se tiver framework):**
   ```javascript
   test('múltiplas correções', () => {
       // ...
   });
   ```

5. **Abra PR:**
   - Título: `test: adicionar teste de múltiplas correções`
   - Explique por que o teste é importante

### 5. Documentação

**O que você pode fazer:**
- Melhorar clareza
- Adicionar exemplos
- Corrigir erros

**Como contribuir:**

1. **Identifique problema:**
   ```
   Problema: Exemplo de confirmação está desatualizado
   ```

2. **Corrija:**
   - Edite arquivo relevante
   - Adicione ou melhore exemplos

3. **Valide:**
   - Certifique-se de que código corresponde à doc
   - Peça review de outra pessoa

4. **Abra PR:**
   - Título: `docs: atualizar exemplo de confirmação`
   - Explique o que foi melhorado

---

## ✅ Checklist de PR

### Antes de Abrir PR

- [ ] Li e entendi `docs/GOVERNANCE.md`
- [ ] Código segue arquitetura (LLM não calcula)
- [ ] Adicionei/atualizei documentação
- [ ] Adicionei/atualizei testes
- [ ] Testei manualmente
- [ ] Commit messages são claros

### Descrição do PR

Use este template:

```markdown
## 📝 Descrição

[Descreva a mudança em 2-3 frases]

## 🎯 Motivação

[Por que essa mudança é necessária?]

## 🔧 Mudanças

- [ ] Prompt melhorado
- [ ] Novo fluxo adicionado
- [ ] Bug corrigido
- [ ] Testes adicionados
- [ ] Documentação atualizada

## 🧪 Como Testar

1. [Passo a passo para testar]
2. [Incluir exemplos de entrada]
3. [Resultado esperado]

## 📸 Screenshots/Exemplos

[Se aplicável, adicione screenshots ou exemplos de conversação]

## ✅ Checklist

- [ ] Código revisado
- [ ] Testes passam
- [ ] Documentação atualizada
- [ ] Workflow CI passou
```

### Durante Review

- Responda comentários construtivamente
- Faça mudanças solicitadas
- Peça esclarecimentos se necessário
- Seja paciente e respeitoso

### Após Aprovação

- Aguarde merge do mantenedor
- Acompanhe deploy (se aplicável)
- Monitore por issues relacionados

---

## 🚫 O que NÃO Fazer

### ❌ Não Faça

1. **Cálculos no LLM:**
   ```javascript
   // ❌ ERRADO
   const total = custoBase * dias * 1.3;
   
   // ✅ CORRETO
   const resultado = this.calculateQuotation(params);
   ```

2. **Criar Regras no LLM:**
   ```javascript
   // ❌ ERRADO
   if (userType === 'premium') discount = 50;
   
   // ✅ CORRETO
   const discount = this.dataManager.obterDesconto();
   ```

3. **Ignorar Confirmação:**
   ```javascript
   // ❌ ERRADO
   return this.generateQuotation(params); // Sem confirmar
   
   // ✅ CORRETO
   return this.showPartialSummaryAndAskConfirmation();
   // Aguardar "sim"
   ```

4. **Modificar Motor de Regras sem Documentar:**
   - Sempre documente mudanças em regras de negócio
   - Sempre adicione testes para novas regras

5. **Quebrar Voz-Texto Paridade:**
   ```javascript
   // ❌ ERRADO
   handleVoiceInput(text) {
       // Lógica diferente de processUserInput
   }
   
   // ✅ CORRETO
   handleVoiceInput(text) {
       this.processUserInput(text); // Mesmo pipeline
   }
   ```

### ⚠️ Evite

1. **PRs Muito Grandes:**
   - Prefira PRs menores e focados
   - Divida grandes mudanças em múltiplos PRs

2. **Falta de Testes:**
   - Sempre adicione testes para novas funcionalidades
   - Sempre adicione testes de regressão para bugs

3. **Documentação Desatualizada:**
   - Atualize documentação junto com código
   - Mantenha exemplos consistentes

4. **Commits Confusos:**
   - Use mensagens de commit descritivas
   - Siga padrão: `tipo: descrição curta`

---

## 🎨 Estilo de Código

### JavaScript

```javascript
/**
 * Descrição da função
 * @param {string} input - Descrição do parâmetro
 * @returns {object} Descrição do retorno
 */
functionName(input) {
    // Comentário explicativo quando necessário
    const result = this.process(input);
    return result;
}
```

### Comentários

```javascript
// ✅ BOM: Explica o "porquê"
// Aguardar 1.5s para garantir que usuário terminou de falar
this.silenceDelay = 1500;

// ❌ RUIM: Repete o "o quê"
// Define silenceDelay como 1500
this.silenceDelay = 1500;
```

### Nomes

```javascript
// ✅ BOM: Descritivo
const waitingForFinalConfirmation = true;

// ❌ RUIM: Genérico
const flag = true;
```

---

## 🧪 Como Testar

### Testes Manuais

1. **Abra o chat:**
   - Execute `index.html` localmente
   - Ou use ambiente de desenvolvimento

2. **Teste cenário completo:**
   ```
   👤: "cotação para 3 meses"
   [Verificar resposta]
   👤: "segunda a sexta"
   [Verificar resposta]
   👤: "sala multiuso"
   [Verificar resumo]
   👤: "sim"
   [Verificar cotação gerada]
   ```

3. **Teste casos de borda:**
   - Entrada vazia
   - Entrada muito longa
   - Múltiplas correções
   - Interrupções

4. **Teste voz (se modificou):**
   - Teste com microfone real
   - Teste silêncio
   - Teste pausas

### Testes Automatizados (quando disponíveis)

```bash
# Executar todos os testes
npm test

# Executar categoria específica
npm test -- --grep "Confirmação"

# Executar com cobertura
npm run test:coverage
```

---

## 📞 Ajuda e Suporte

### Tem Dúvidas?

1. **Leia primeiro:**
   - `docs/GOVERNANCE.md`
   - `docs/ai/IMPLEMENTATION_GUIDE.md`
   - Este arquivo

2. **Não encontrou resposta?**
   - Abra uma issue com label `question`
   - Descreva sua dúvida claramente
   - Forneça contexto

3. **Precisa de revisão?**
   - Mencione `@mantenedores` no PR
   - Seja específico sobre o que precisa

### Encontrou um Bug?

1. **Verifique se já existe:**
   - Busque nas issues abertas
   - Busque nas issues fechadas

2. **Abra nova issue:**
   - Use template de bug report
   - Inclua passos para reproduzir
   - Inclua resultado esperado vs obtido
   - Inclua ambiente (navegador, SO, etc)

---

## 🎓 Recursos de Aprendizado

### Documentação do Projeto

1. **Governança:** `docs/GOVERNANCE.md`
2. **Prompts:** `docs/ai/system-prompts.md`
3. **Fluxos:** `docs/ai/conversation-flows.md`
4. **Testes:** `tests/conversational/test-scenarios.md`
5. **Implementação:** `docs/ai/IMPLEMENTATION_GUIDE.md`

### Conceitos Importantes

- **Separação de Responsabilidades:** LLM vs Motor
- **Linguagem Natural:** NLP e inferência
- **Máquinas de Estado:** Estados e transições
- **Confirmação Explícita:** UX conversacional
- **Auditoria:** Logs e rastreabilidade

### Tutoriais Recomendados

- Conversational AI Design
- Natural Language Processing
- State Machines
- Test-Driven Development

---

## 🏆 Reconhecimento

Contribuidores são reconhecidos em:
- `CHANGELOG.md` - Crédito por mudanças
- GitHub Contributors - Perfil público
- Releases - Agradecimentos especiais

---

## 📜 Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a mesma licença do projeto (MIT).

---

## 🙏 Agradecimentos

Obrigado por dedicar seu tempo para melhorar o Chat IA de Cotação!

Suas contribuições ajudam a criar uma experiência melhor para todos os usuários.

---

**Última atualização:** Dezembro 2024
**Versão:** 1.0.0
**Mantenedores:** Equipe de Desenvolvimento CDL/UTV
