# Criação de Credencial do Desenvolvedor - Guia Zero Trust

## 🔒 Conformidade SGQ-SECURITY

Este guia implementa a **Arquitetura Zero Trust** utilizando variáveis de ambiente, eliminando completamente a necessidade de arquivos de credenciais físicos (serviceAccountKey.json).

## ✅ Credenciais do Usuário

- **E-mail:** mayconabentes@gmail.com
- **Senha:** Aprendiz@33 (Temporária - Alterar após primeiro login)
- **Função:** Administrador (admin)
- **Status:** Ativo

## 🚀 Método Recomendado: Script Automatizado com Variáveis de Ambiente

### Pré-requisitos

- Node.js instalado (versão 14+)
- Acesso ao Firebase Console do projeto
- Terminal/Command line

### Passo 1: Instalar Dependências

```bash
npm install
```

Dependências instaladas:
- `firebase-admin` - SDK Admin do Firebase
- `dotenv` - Gerenciador de variáveis de ambiente

### Passo 2: Configurar Variáveis de Ambiente

1. **Obter credenciais do Firebase:**
   - Acesse [Firebase Console](https://console.firebase.google.com/)
   - Selecione o projeto "axioma-cdl-manaus"
   - Vá em **Project Settings** > **Service Accounts**
   - Clique em **"Generate new private key"**
   - O arquivo JSON será baixado (NÃO salvar no repositório)

2. **Criar arquivo .env:**
   ```bash
   cp .env.example .env
   ```

3. **Editar o arquivo .env com suas credenciais reais:**
   ```env
   FIREBASE_PROJECT_ID=axioma-cdl-manaus
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n[SUA_CHAVE_AQUI]\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@axioma-cdl-manaus.iam.gserviceaccount.com
   ```

   **⚠️ ATENÇÃO:**
   - Mantenha o formato exato da `FIREBASE_PRIVATE_KEY` com `\n` para quebras de linha
   - Use aspas duplas para envolver a chave privada
   - NUNCA commite o arquivo `.env` no Git (já está no .gitignore)

### Passo 3: Executar o Script

```bash
npm run setup:user
```

ou diretamente:

```bash
node setup-developer-user.js
```

### Passo 4: Resultado Esperado

```
[SGQ-SECURITY] Iniciando setup de usuário desenvolvedor
[SGQ-SECURITY] Validando credenciais de ambiente...

[SGQ-SECURITY] ✅ Validação concluída: Todas as variáveis presentes
[SGQ-SECURITY] ✅ Firebase Admin SDK inicializado
[SGQ-SECURITY] Project ID: axioma-cdl-manaus
[SGQ-SECURITY] Service Account: firebase-adminsdk-xxxxx@axioma-cdl-manaus.iam.gserviceaccount.com
[SGQ-SECURITY] Método: Environment Variables (Zero Trust)

[SGQ-SECURITY] Iniciando criação de usuário desenvolvedor
[SGQ-SECURITY] Email: mayconabentes@gmail.com
[SGQ-SECURITY] Role: admin

[SGQ-SECURITY] ✅ Usuário criado no Authentication
[SGQ-SECURITY] ✅ Documento criado no Firestore

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[SGQ-SECURITY] Status: USUÁRIO CRIADO COM SUCESSO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Credenciais de acesso:
  E-mail: mayconabentes@gmail.com
  Senha: Aprendiz@33
  Nome: Maycon Abentes
  Role: admin
  Status: ativo

[SGQ-SECURITY] ATENÇÃO: Altere a senha após o primeiro login
[SGQ-SECURITY] Credenciais carregadas com sucesso
```

## 🧪 Verificação

Após criar o usuário:

1. Abra `index.html` no navegador
2. Faça login com as credenciais:
   - E-mail: **mayconabentes@gmail.com**
   - Senha: **Aprendiz@33**
3. Você deve ser redirecionado para `dashboard-admin.html`
4. No header, deve aparecer "Maycon Abentes"
5. Deve ter acesso à aba "Configurações" > "Gestão de Usuários"

## 🔒 Segurança Zero Trust

### Conformidade SGQ-SECURITY

**Implementações de Segurança:**

✅ **Nenhuma credencial em arquivo físico**
- Todas as credenciais carregadas via variáveis de ambiente (.env)
- Arquivo `.env` bloqueado permanentemente no `.gitignore`
- Zero exposição de credenciais no histórico Git

✅ **Validação rigorosa**
- Script valida presença de todas as variáveis obrigatórias
- Falha explicativa (não silenciosa) em caso de configuração incompleta
- Logs auditáveis com padrão [SGQ-SECURITY]

✅ **Arquitetura Zero Trust**
- Credenciais nunca persistidas em disco (exceto .env local)
- Service Account Key carregado dinamicamente da memória
- Conformidade com padrões de segurança empresarial

### Variáveis de Ambiente Obrigatórias

```env
FIREBASE_PROJECT_ID         # ID do projeto Firebase
FIREBASE_PRIVATE_KEY        # Chave privada do Service Account
FIREBASE_CLIENT_EMAIL       # Email do Service Account
```

### Proteções Implementadas

1. **`.gitignore` atualizado:**
   - Bloqueia `*.json` de credenciais
   - Bloqueia `.env` e variações
   - Bloqueia `serviceAccountKey.json`

2. **Validação pré-execução:**
   - Verifica todas as variáveis obrigatórias
   - Aborta execução se configuração incompleta
   - Mensagens de erro detalhadas e acionáveis

3. **Logs auditáveis:**
   - Padrão executivo [SGQ-SECURITY]
   - Rastreamento completo de operações
   - Diagnóstico facilitado de falhas

## ⚠️ IMPORTANTE

- ❌ **NUNCA** commite o arquivo `.env` no repositório
- ❌ **NUNCA** commite arquivos `serviceAccountKey.json`
- ✅ Use diferentes service accounts para dev/staging/prod
- ✅ Rotacione chaves regularmente (recomendado: trimestral)
- ✅ Para CI/CD, use secrets do GitHub Actions
- ✅ Para produção, use Google Cloud Secret Manager
- ✅ Altere a senha padrão após o primeiro login

## 📚 Documentação Relacionada

- **[ENVIRONMENT_VARIABLES_GUIDE.md](./ENVIRONMENT_VARIABLES_GUIDE.md)** - Guia completo de variáveis de ambiente
- **[setup-developer-user.js](./setup-developer-user.js)** - Script de automação Zero Trust
- **[AUTHENTICATION_GUIDE.md](./AUTHENTICATION_GUIDE.md)** - Guia completo do sistema de autenticação
- **[.env.example](./.env.example)** - Template de configuração de ambiente

## 🐛 Troubleshooting

### Erro: "Variáveis de ambiente obrigatórias ausentes"

**Diagnóstico:** Arquivo `.env` não configurado ou incompleto

**Solução:**
1. Verifique se o arquivo `.env` existe na raiz do projeto
2. Compare com `.env.example` para garantir que todas as variáveis estão presentes
3. Confirme que não há espaços extras ou erros de sintaxe

### Erro: "Erro na inicialização do Firebase Admin"

**Diagnóstico:** Formato incorreto da chave privada ou credenciais inválidas

**Solução:**
1. Verifique o formato da `FIREBASE_PRIVATE_KEY`
2. Certifique-se de incluir `\n` para quebras de linha
3. Use aspas duplas ao redor da chave
4. Confirme que a chave foi copiada completamente

### Erro: "Usuário já existe"

**Diagnóstico:** Usuário já cadastrado no sistema

**Solução:**
- O script detecta automaticamente e atualiza os dados
- Nenhuma ação necessária
- Use as credenciais existentes para login

### Erro: "serviceAccountKey.json não encontrado"

**Diagnóstico:** Tentativa de usar método legado (obsoleto)

**Solução:**
- Este sistema agora usa **apenas variáveis de ambiente**
- Não é mais necessário o arquivo `serviceAccountKey.json`
- Siga o processo de configuração do `.env` descrito acima

### Erro ao fazer login no sistema

**Diagnóstico:** Possível inconsistência entre Authentication e Firestore

**Solução:**
1. Verifique se o usuário existe no Firebase Authentication
2. Verifique se o documento existe no Firestore (coleção `usuarios`)
3. Confirme que o campo `status` está como `ativo`
4. Execute novamente o script para sincronizar os dados

---

**Criado em:** 30/12/2024  
**Solicitado por:** @mayconabentes-bi  
**Status:** ✅ Pronto para uso
