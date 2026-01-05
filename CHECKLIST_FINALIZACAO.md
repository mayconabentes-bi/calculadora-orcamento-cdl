# ✅ Checklist: Finalização do Ambiente Zero Trust

## 📝 Resumo Executivo

Este checklist garante a conformidade com o protocolo SGQ-SECURITY v5.1.0 e a conclusão da fase de desenvolvimento.

---

## 1️⃣ Sincronização de Ambiente

- [ ] **Executar conversão de chave privada**
  ```bash
  node convert-private-key-to-base64.js
  ```

- [ ] **Copiar variáveis para .env**
  - FIREBASE_PROJECT_ID
  - FIREBASE_CLIENT_EMAIL  
  - FIREBASE_PRIVATE_KEY_BASE64

- [ ] **Verificar que .env está configurado corretamente**
  ```bash
  cat .env | grep FIREBASE_
  ```

---

## 2️⃣ Validação de Conformidade (OBRIGATÓRIO)

- [ ] **Executar verificação SGQ-SECURITY**
  ```bash
  npm run verify:security
  ```

- [ ] **Confirmar 100% de sucesso**
  - Resultado esperado: `Verificações Passadas: 25/25 (100%)`
  - Status: `✓ PROTOCOLO SGQ-SECURITY IMPLEMENTADO COM SUCESSO!`

- [ ] **Se falhar**: Corrigir os problemas indicados e executar novamente

---

## 3️⃣ Auditoria de Campo no Firestore

- [ ] **Verificar usuário administrativo no Firestore**
  - Coleção: `usuarios`
  - Email: mayconabentes@gmail.com
  - Campo: `status: 'ativo'` (minúsculas)
  - Campo: `role: 'admin'`

- [ ] **Se incorreto ou ausente, executar**
  ```bash
  npm run setup:user
  ```

- [ ] **Validar autenticação**
  ```bash
  npm run verify:auth
  ```

- [ ] **Confirmar mensagem de sucesso**
  ```
  [SGQ-SECURITY] ✅ ALL CHECKS PASSED!
  ```

---

## 4️⃣ Sanitização de Segurança (CRÍTICO!)

### ⚠️ Executar APENAS após confirmar que:
- [ ] Firebase está conectado corretamente
- [ ] Usuário admin foi criado/sincronizado
- [ ] Login no sistema está funcionando
- [ ] String Base64 está no .env

### Remover arquivos:

- [ ] **Listar arquivos JSON de credenciais**
  ```bash
  ls -la *firebase-adminsdk*.json *-adminsdk-*.json serviceAccountKey.json 2>/dev/null
  ```

- [ ] **Remover TODOS os arquivos JSON de credenciais**
  ```bash
  rm <nome-do-arquivo-firebase-adminsdk>.json
  ```

- [ ] **Remover arquivo de instruções temporário**
  ```bash
  rm BASE64_SETUP_INSTRUCTIONS.txt
  ```

- [ ] **Verificar que não há arquivos remanescentes**
  ```bash
  find . -name "*firebase-adminsdk*.json" -o -name "serviceAccountKey.json"
  ```
  - Resultado esperado: nenhum arquivo encontrado

- [ ] **Confirmar que .env NÃO foi removido**
  ```bash
  ls -la .env
  ```

- [ ] **Confirmar que .env NÃO está no Git**
  ```bash
  git status | grep .env
  ```
  - Resultado esperado: nenhuma menção a .env

---

## 5️⃣ Backup Corporativo (OBRIGATÓRIO)

- [ ] **Abrir gerenciador de senhas corporativo**
  - Bitwarden (recomendado)
  - 1Password
  - LastPass
  - HashiCorp Vault
  - AWS/GCP Secrets Manager

- [ ] **Criar nova entrada segura**
  - Nome: "Axioma CDL Manaus - Firebase Admin SDK"
  - Categoria: Desenvolvimento / API Credentials

- [ ] **Copiar campos do .env para o gerenciador**
  - FIREBASE_PROJECT_ID
  - FIREBASE_CLIENT_EMAIL
  - FIREBASE_PRIVATE_KEY_BASE64

- [ ] **Adicionar notas com informações**
  - Data de criação
  - Responsável pela credencial
  - Próxima rotação (recomendado: trimestral)

- [ ] **Confirmar que a entrada foi salva**

---

## 6️⃣ Validação Final

- [ ] **Executar todos os testes**
  ```bash
  npm run verify:security  # Deve retornar 100%
  npm run verify:auth      # Deve confirmar conexão
  ```

- [ ] **Verificar que não há arquivos de credenciais**
  ```bash
  ls -la *.json BASE64_SETUP_INSTRUCTIONS.txt 2>/dev/null
  ```
  - Resultado esperado: apenas package.json

- [ ] **Testar login no sistema**
  - Abrir index.html no navegador
  - Login com: mayconabentes@gmail.com / Aprendiz@33
  - Confirmar acesso ao dashboard administrativo

---

## 🎯 Critérios de Conclusão

A fase de desenvolvimento está **ENCERRADA** quando:

✅ **Todos os itens acima estão marcados**  
✅ **verify-sgq-security.js reporta 100% de sucesso**  
✅ **Usuário admin possui status: 'ativo' no Firestore**  
✅ **Todos os arquivos .json de credenciais foram removidos**  
✅ **BASE64_SETUP_INSTRUCTIONS.txt foi removido**  
✅ **String Base64 está salva no gerenciador de senhas**  
✅ **Sistema de login está operacional**  

---

## 📋 Assinaturas e Aprovações

### Desenvolvimento
- [ ] **Verificado por**: _________________ Data: _________
- [ ] **Aprovado por**: _________________ Data: _________

### Segurança
- [ ] **Auditado por**: _________________ Data: _________
- [ ] **Aprovado por**: _________________ Data: _________

---

## 📚 Referências Rápidas

**Comandos Essenciais**:
```bash
# Conversão de chave
node convert-private-key-to-base64.js

# Validação de segurança (OBRIGATÓRIO)
npm run verify:security

# Setup de usuário
npm run setup:user

# Verificação de autenticação
npm run verify:auth
```

**Arquivos Críticos**:
- ✅ `.env` - MANTER (nunca commitar)
- ✅ `.env.example` - MANTER (template)
- ❌ `*.json` (credenciais) - REMOVER
- ❌ `BASE64_SETUP_INSTRUCTIONS.txt` - REMOVER

**Documentação Completa**:
- FINAL_SECURITY_SETUP.md
- ENVIRONMENT_VARIABLES_GUIDE.md
- SECURITY_ENHANCEMENTS_SGQ.md

---

## 🔒 Protocolo de Segurança

**Conformidade**: SGQ-SECURITY v5.1.0  
**Arquitetura**: Zero Trust  
**Status**: ✅ PRODUÇÃO READY  

---

**Data**: _______________  
**Responsável**: _______________  
**Revisão**: _______________  

---

✅ **IMPORTANTE**: Não prossiga para produção até que TODOS os itens deste checklist estejam marcados e validados.
