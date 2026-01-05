# Recomendações Acionáveis - Setup Firebase

## 📋 Guia de Configuração Rápida

Este documento fornece instruções passo-a-passo para configurar corretamente o Firebase Authentication e resolver problemas comuns de autenticação.

---

## 🔑 Passo 1: Converter para Base64

### Por que Base64?
O formato Base64 resolve problemas com quebras de linha e caracteres especiais na chave privada do Firebase, garantindo compatibilidade total em diferentes ambientes (desenvolvimento, produção, CI/CD).

### Como executar:

```bash
node convert-private-key-to-base64.js <arquivo-credenciais.json>
```

**Exemplo:**
```bash
node convert-private-key-to-base64.js axioma-cdl-manaus-firebase-adminsdk-fbsvc-8e7483fceb.json
```

### O que o script faz:
1. ✅ Lê o arquivo JSON de credenciais do Firebase
2. ✅ Extrai a chave privada (`private_key`)
3. ✅ Converte para Base64
4. ✅ Exibe as variáveis para configurar no `.env`
5. ✅ Cria arquivo de instruções (`BASE64_SETUP_INSTRUCTIONS.txt`)

### Resultado esperado:
```
✅ Conversão concluída com sucesso!

═══════════════════════════════════════════════════════════════════
CONFIGURAÇÃO DO ARQUIVO .env
═══════════════════════════════════════════════════════════════════

Adicione as seguintes variáveis ao seu arquivo .env:

FIREBASE_PROJECT_ID=axioma-cdl-manaus
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@axioma-cdl-manaus.iam.gserviceaccount.com

# Nova variável Base64 (recomendado para produção)
FIREBASE_PRIVATE_KEY_BASE64="<string-base64-aqui>"
```

### Próximos passos:
1. Copie a string `FIREBASE_PRIVATE_KEY_BASE64` gerada
2. Cole no arquivo `.env` (crie se não existir: `cp .env.example .env`)
3. Salve o arquivo
4. ⚠️ **IMPORTANTE**: Após confirmar que funciona, **DELETE** o arquivo JSON de credenciais
5. ⚠️ **IMPORTANTE**: DELETE também o arquivo `BASE64_SETUP_INSTRUCTIONS.txt`

---

## 🔧 Passo 2: Atualizar o .env

### Criar arquivo .env (se não existir):
```bash
cp .env.example .env
```

### Editar o arquivo .env:
```bash
nano .env
# ou use seu editor preferido: code .env, vim .env, etc.
```

### Configuração mínima necessária:
```env
# === Firebase Admin SDK Credentials (OBRIGATÓRIO) ===
FIREBASE_PROJECT_ID=axioma-cdl-manaus
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@axioma-cdl-manaus.iam.gserviceaccount.com

# === Private Key (ESCOLHA UMA OPÇÃO) ===
# OPÇÃO 1: Base64 (RECOMENDADO)
FIREBASE_PRIVATE_KEY_BASE64="<cole-a-string-base64-aqui>"

# OPÇÃO 2: Legacy (NÃO use se já definiu Base64)
# FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### ⚠️ Checklist de Segurança:
- [ ] Arquivo `.env` criado
- [ ] Variável `FIREBASE_PROJECT_ID` configurada
- [ ] Variável `FIREBASE_CLIENT_EMAIL` configurada
- [ ] Variável `FIREBASE_PRIVATE_KEY_BASE64` configurada
- [ ] Aspas duplas ao redor da string Base64
- [ ] Arquivo `.env` **NÃO** commitado no Git (verificar `.gitignore`)
- [ ] Arquivo JSON de credenciais **DELETADO** após confirmação

---

## ✅ Passo 3: Executar Verificação

Execute o comando de verificação para confirmar que a conexão ao Firebase está funcionando:

```bash
npm run verify:auth
```

### Resultado esperado (SUCESSO):
```
╔════════════════════════════════════════════════════════════════╗
║  Authentication Setup Verification Tool v2.1                  ║
║  Arquitetura Gemini (Zero Trust) - Base64 Support             ║
╚════════════════════════════════════════════════════════════════╝

1️⃣  Checking firebase-admin installation...
   ✅ firebase-admin is installed

2️⃣  Checking dotenv installation...
   ✅ dotenv is installed

3️⃣  Checking for .env configuration...
   ✅ .env file found

4️⃣  Checking environment variables...
   ✅ FIREBASE_PROJECT_ID is set
   ✅ FIREBASE_CLIENT_EMAIL is set
   ✅ FIREBASE_PRIVATE_KEY_BASE64 is set (recommended)

5️⃣  Checking for legacy credential files...
   ✅ No legacy credential files found (good!)

6️⃣  Testing Firebase connection...
   [SGQ-SECURITY] ✅ Successfully connected to Firebase!

7️⃣  Verifying developer user...
   [SGQ-SECURITY] ✅ ALL CHECKS PASSED!
```

### Possíveis erros e soluções:

#### ❌ Erro: "Cannot find module 'dotenv'"
**Solução:**
```bash
npm install
```

#### ❌ Erro: ".env file NOT found"
**Solução:**
```bash
cp .env.example .env
# Depois edite o .env com suas credenciais
```

#### ❌ Erro: "Failed to connect to Firebase"
**Causas possíveis:**
1. String Base64 malformada ou incompleta
2. Credenciais incorretas no `.env`
3. Service account sem permissões adequadas

**Solução:**
```bash
# Re-execute a conversão Base64
node convert-private-key-to-base64.js <arquivo-credenciais.json>

# Copie novamente a string gerada para o .env
# Certifique-se de incluir as aspas duplas
```

#### ❌ Erro: "Error decoding FIREBASE_PRIVATE_KEY_BASE64"
**Solução:**
- Verifique se copiou a string completa (sem espaços extras ou quebras de linha)
- Verifique se está entre aspas duplas
- Re-execute o script de conversão

---

## 👥 Passo 4: Sincronizar Admin

Após confirmar que a conexão ao Firebase está funcionando, execute o script para criar/sincronizar o usuário administrador:

```bash
npm run setup:user
```

### O que o script faz:
1. ✅ Verifica se o usuário já existe no Firebase Authentication
2. ✅ Cria o usuário se não existir
3. ✅ Cria/atualiza o documento no Firestore
4. ✅ Garante que o campo `status` está como `'ativo'` (minúsculas)
5. ✅ Garante que o campo `role` está como `'admin'`

### Resultado esperado (SUCESSO - Novo usuário):
```
[SGQ-SECURITY] Operação: Criação de novo usuário
[SGQ-SECURITY] ✅ Usuário criado no Authentication
[SGQ-SECURITY] ✅ Documento criado no Firestore

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Status: USUÁRIO CRIADO COM SUCESSO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Credenciais de acesso:
  E-mail: mayconabentes@gmail.com
  Senha: Aprendiz@33
  Nome: Maycon Abentes
  Role: admin
  Status: ativo

[SGQ-SECURITY] ATENÇÃO: Altere a senha após o primeiro login
```

### Resultado esperado (SUCESSO - Usuário existente):
```
[SGQ-SECURITY] ⚠️  Usuário já existe no Firebase Authentication
[SGQ-SECURITY] ✅ Dados atualizados no Firestore

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Status: OPERAÇÃO CONCLUÍDA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Credenciais de acesso:
  E-mail: mayconabentes@gmail.com
  Senha: Aprendiz@33
  Role: admin
  Status: ativo
```

---

## 🔍 Passo 5: Corrigir Status no Firestore (Manual)

Se por algum motivo o status do usuário não estiver correto, você pode corrigi-lo manualmente na consola do Firebase.

### Aceder à Consola Firebase:
1. Vá para: https://console.firebase.google.com/
2. Selecione o projeto: **axioma-cdl-manaus**
3. No menu lateral, clique em **Firestore Database**
4. Navegue até a coleção: **usuarios**
5. Encontre o documento do usuário (use o UID ou email para identificar)

### Verificar/Corrigir campos:
Certifique-se de que o documento contém exatamente:

```json
{
  "email": "mayconabentes@gmail.com",
  "nome": "Maycon Abentes",
  "role": "admin",
  "status": "ativo",
  "createdAt": "2026-01-05T16:00:00.000Z",
  "updatedAt": "2026-01-05T16:00:00.000Z"
}
```

### ⚠️ CRÍTICO: Campo `status`
- **DEVE** ser: `"ativo"` (minúsculas, entre aspas)
- **NÃO** pode ser: `"Ativo"`, `"ATIVO"`, `"active"`, etc.
- O código verifica exatamente: `userData.status !== 'ativo'`

### Como editar no Firestore:
1. Clique no documento do usuário
2. Encontre o campo `status`
3. Se estiver diferente de `"ativo"`:
   - Clique no ícone de edição (lápis)
   - Altere para: `ativo` (minúsculas)
   - Clique em **Update**

---

## 🧪 Passo 6: Testar Login

Após completar todos os passos anteriores, teste o login:

1. Abra o arquivo `index.html` no navegador
2. Use as credenciais:
   - **Email:** mayconabentes@gmail.com
   - **Senha:** Aprendiz@33
3. Clique em **Entrar**

### Resultado esperado:
- ✅ Login bem-sucedido
- ✅ Redirecionamento para `dashboard-admin.html`
- ✅ Console mostra: `[SGQ-SECURITY] Metadados encontrados | Role: admin | Status: ativo`

### Se o login falhar:
Verifique o console do navegador (F12 → Console) para mensagens de erro:

#### Erro: "Usuário inativo"
```
[SGQ-SECURITY] FALHA: Usuário inativo
[SGQ-SECURITY] Status atual: <valor-incorreto>
```
**Solução:** Volte ao Passo 5 e corrija o campo `status` no Firestore

#### Erro: "User metadata not found"
```
[SGQ-SECURITY] ERRO: User metadata not found
```
**Solução:** Execute novamente `npm run setup:user`

---

## 📊 Checklist Completo

Use esta checklist para garantir que todos os passos foram completados:

### Setup Inicial
- [ ] ✅ Dependências instaladas (`npm install`)
- [ ] ✅ Arquivo `.env` criado (`cp .env.example .env`)
- [ ] ✅ Arquivo JSON de credenciais Firebase baixado

### Conversão Base64
- [ ] ✅ Script executado: `node convert-private-key-to-base64.js <arquivo.json>`
- [ ] ✅ String Base64 copiada para o `.env`
- [ ] ✅ Variável `FIREBASE_PRIVATE_KEY_BASE64` configurada
- [ ] ✅ Variável `FIREBASE_PROJECT_ID` configurada
- [ ] ✅ Variável `FIREBASE_CLIENT_EMAIL` configurada

### Verificação
- [ ] ✅ Comando executado: `npm run verify:auth`
- [ ] ✅ Resultado: "Successfully connected to Firebase!"
- [ ] ✅ Sem erros de decodificação

### Sincronização Admin
- [ ] ✅ Comando executado: `npm run setup:user`
- [ ] ✅ Resultado: "USUÁRIO CRIADO COM SUCESSO" ou "OPERAÇÃO CONCLUÍDA"
- [ ] ✅ Credenciais exibidas no console

### Validação Firestore
- [ ] ✅ Documento do usuário existe na coleção `usuarios`
- [ ] ✅ Campo `status` = `"ativo"` (minúsculas)
- [ ] ✅ Campo `role` = `"admin"`
- [ ] ✅ Campo `email` correto

### Teste Final
- [ ] ✅ Login testado em `index.html`
- [ ] ✅ Redirecionamento para `dashboard-admin.html`
- [ ] ✅ Sem erros no console

### Segurança (CRÍTICO)
- [ ] ✅ Arquivo JSON de credenciais **DELETADO**
- [ ] ✅ Arquivo `BASE64_SETUP_INSTRUCTIONS.txt` **DELETADO**
- [ ] ✅ Arquivo `.env` **NÃO** commitado no Git
- [ ] ✅ String Base64 guardada em gerenciador de senhas

---

## 🆘 Troubleshooting Comum

### Problema: "Module not found"
```bash
npm install
```

### Problema: "Permission denied"
```bash
chmod +x convert-private-key-to-base64.js
chmod +x verify-auth-setup.js
chmod +x setup-developer-user.js
```

### Problema: ".env não carrega"
- Verifique se está na raiz do projeto
- Verifique se o nome do arquivo é exatamente `.env` (com ponto no início)
- Reinicie o Node.js após editar o `.env`

### Problema: "Invalid credentials"
- Confirme que copiou a string Base64 completa
- Confirme que está entre aspas duplas no `.env`
- Confirme que não há espaços ou quebras de linha extras
- Re-execute o script de conversão Base64

### Problema: "Status inativo" no login
- Aceda à consola do Firebase
- Navegue até Firestore → usuarios
- Encontre o usuário e edite o campo `status` para `"ativo"` (minúsculas)

---

## 📚 Documentação Adicional

Para informações mais detalhadas, consulte:

- **[ENVIRONMENT_VARIABLES_GUIDE.md](./ENVIRONMENT_VARIABLES_GUIDE.md)** - Guia completo de variáveis de ambiente
- **[FIREBASE_BASE64_MIGRATION_GUIDE.md](./FIREBASE_BASE64_MIGRATION_GUIDE.md)** - Guia de migração para Base64
- **[AUTHENTICATION_GUIDE.md](./AUTHENTICATION_GUIDE.md)** - Guia técnico do sistema de autenticação
- **[SECURITY_README.md](./SECURITY_README.md)** - Hub central de segurança
- **[GUIA_RAPIDO_LOGIN.md](./GUIA_RAPIDO_LOGIN.md)** - Guia rápido de configuração

---

## 🔒 Princípios de Segurança (SGQ-SECURITY)

Este projeto segue a **Arquitetura Zero Trust**:

1. ✅ **Nunca** commite arquivos `.env` ou `.json` de credenciais no Git
2. ✅ Use diferentes service accounts para dev/staging/prod
3. ✅ Rotacione chaves regularmente (recomendado: trimestral)
4. ✅ Para CI/CD, use secrets do GitHub Actions ou similar
5. ✅ Para produção, use Google Cloud Secret Manager ou HashiCorp Vault
6. ✅ Prefira `FIREBASE_PRIVATE_KEY_BASE64` sobre formato legacy
7. ✅ Delete arquivos de credenciais após configuração
8. ✅ Guarde credenciais em gerenciadores de senhas corporativos

---

## ✅ Resumo Executivo

Para setup completo em **5 minutos**:

```bash
# 1. Instalar dependências
npm install

# 2. Criar .env
cp .env.example .env

# 3. Converter credenciais para Base64
node convert-private-key-to-base64.js <seu-arquivo-firebase.json>

# 4. Copiar a string FIREBASE_PRIVATE_KEY_BASE64 para o .env

# 5. Verificar conexão
npm run verify:auth

# 6. Criar usuário admin
npm run setup:user

# 7. Testar login em index.html
```

**Pronto!** 🎉

---

**Última atualização:** 2026-01-05  
**Versão:** 1.0.0  
**Arquitetura:** Gemini (Zero Trust) - Base64 Support
