# Firebase Private Key Base64 Migration Guide

## Contexto

**Sistema:** Axioma v5.1.0 - CDL/Manaus  
**Arquitetura:** Zero Trust  
**Diretriz:** SGQ-SECURITY  
**Data:** 05/01/2026  

## Problema Identificado

O sistema estava falhando ao autenticar novos usuários com o erro:

```
error:1E08010C:DECODER routines::unsupported
```

**Causa Raiz:** A variável `FIREBASE_PRIVATE_KEY` no arquivo `.env` com formatação RSA tradicional (com `\n` para quebras de linha) está causando problemas de decodificação em alguns ambientes de execução Node.js.

## Solução Implementada

Adoção de **FIREBASE_PRIVATE_KEY_BASE64** como formato padrão de produção, utilizando codificação Base64 para eliminar problemas com caracteres especiais e quebras de linha.

## Passo a Passo - Conversão e Configuração

### 1. Obter o Arquivo JSON de Credenciais

Se você ainda não possui o arquivo JSON de credenciais Firebase:

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto (axioma-cdl-manaus)
3. Vá em **Project Settings** (Configurações do projeto)
4. Aba **Service Accounts**
5. Clique em **Generate New Private Key**
6. Salve o arquivo na raiz do projeto (ex: `axioma-cdl-manaus-firebase-adminsdk-fbsvc-8e7483fceb.json`)

### 2. Executar o Script de Conversão

Execute o comando Node.js para gerar a string Base64:

```bash
node convert-private-key-to-base64.js axioma-cdl-manaus-firebase-adminsdk-fbsvc-8e7483fceb.json
```

**Saída esperada:**

```
╔══════════════════════════════════════════════════════════════════╗
║  Firebase Private Key Base64 Converter                          ║
║  SGQ-SECURITY - Arquitetura Zero Trust                          ║
╚══════════════════════════════════════════════════════════════════╝

[SGQ-SECURITY] 2026-01-05T14:30:00.000Z - Iniciando conversão
[SGQ-SECURITY] Arquivo: axioma-cdl-manaus-firebase-adminsdk-fbsvc-8e7483fceb.json

✅ Conversão concluída com sucesso!

═══════════════════════════════════════════════════════════════════
CONFIGURAÇÃO DO ARQUIVO .env
═══════════════════════════════════════════════════════════════════

Adicione as seguintes variáveis ao seu arquivo .env:

FIREBASE_PROJECT_ID=axioma-cdl-manaus
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@axioma-cdl-manaus.iam.gserviceaccount.com

# Nova variável Base64 (recomendado para produção)
FIREBASE_PRIVATE_KEY_BASE64="LS0tLS1CRUdJTiBQUklWQVRFIEtFWS0t..."
```

### 3. Atualizar o Arquivo .env

Edite seu arquivo `.env` e adicione/atualize as variáveis:

```bash
# Copie o template se ainda não tiver o .env
cp .env.example .env
```

**Configuração Recomendada (Base64):**

```env
FIREBASE_PROJECT_ID=axioma-cdl-manaus
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@axioma-cdl-manaus.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY_BASE64="SUA_STRING_BASE64_AQUI"
```

**IMPORTANTE:** 
- ✅ Use `FIREBASE_PRIVATE_KEY_BASE64` (novo formato)
- ❌ Remova `FIREBASE_PRIVATE_KEY` (formato antigo) se existir

### 4. Validar a Configuração

Execute o comando de verificação:

```bash
npm run verify:auth
```

**Resultado esperado no Passo 7:**

```
7️⃣  Verifying developer user...
[SGQ-SECURITY] 2026-01-05T14:30:00.000Z - ✅ Successfully connected to Firebase!
[SGQ-SECURITY] Project: axioma-cdl-manaus
[SGQ-SECURITY] Service Account: firebase-adminsdk-xxxxx@axioma-cdl-manaus.iam.gserviceaccount.com
```

### 5. Sincronizar Usuário Administrador

Execute o comando para criar/atualizar o usuário administrador:

```bash
npm run setup:user
```

**Resultado esperado:**

```
[SGQ-SECURITY] 2026-01-05T14:30:00.000Z - ✅ Firebase Admin inicializado via variáveis de ambiente
[SGQ-SECURITY] 2026-01-05T14:30:00.000Z - Status: USUÁRIO CRIADO COM SUCESSO

Credenciais de acesso:
  E-mail: mayconabentes@gmail.com
  Senha: Aprendiz@33
  Role: admin
  Status: ativo
```

### 6. Verificar no Firestore

Acesse o [Firebase Console](https://console.firebase.google.com/) e verifique:

1. Vá para **Firestore Database**
2. Navegue até a coleção `usuarios`
3. Encontre o documento do usuário administrador
4. Verifique se contém: `status: 'ativo'` (em **minúsculas**)

⚠️ **CRÍTICO:** O campo `status` deve estar em minúsculas (`'ativo'` e não `'Ativo'`) para evitar bloqueios automáticos do módulo `auth.js`.

### 7. Remover Arquivos de Credenciais (Segurança)

**Após confirmar que tudo funciona**, delete o arquivo JSON:

```bash
# Remover arquivo JSON de credenciais
rm axioma-cdl-manaus-firebase-adminsdk-fbsvc-8e7483fceb.json

# Remover arquivo de instruções (se foi gerado)
rm BASE64_SETUP_INSTRUCTIONS.txt
```

**Protocolo Zero Trust:** Nenhum arquivo de credenciais deve permanecer no workspace após a configuração.

### 8. Backup Seguro da String Base64

Guarde a string Base64 em um gerenciador de senhas corporativo:

- ✅ 1Password
- ✅ LastPass
- ✅ Bitwarden
- ✅ HashiCorp Vault
- ✅ AWS Secrets Manager
- ✅ Google Cloud Secret Manager

**NUNCA armazene em:**
- ❌ Código-fonte
- ❌ Documentos
- ❌ E-mails
- ❌ Mensagens
- ❌ Screenshots
- ❌ Anotações não criptografadas

## Arquitetura Técnica

### Módulo de Tratamento de Chave: `firebase-key-handler.js`

Função robusta que suporta ambos os formatos com fallback automático:

```javascript
function getPrivateKey() {
  // 1. Tenta FIREBASE_PRIVATE_KEY_BASE64 (recomendado)
  if (process.env.FIREBASE_PRIVATE_KEY_BASE64) {
    return Buffer.from(process.env.FIREBASE_PRIVATE_KEY_BASE64, 'base64')
                 .toString('utf-8');
  }
  
  // 2. Fallback para FIREBASE_PRIVATE_KEY (legacy)
  if (process.env.FIREBASE_PRIVATE_KEY) {
    return process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
  }
  
  throw new Error('No private key configured');
}
```

### Scripts Atualizados

Todos os scripts agora utilizam o módulo `firebase-key-handler.js`:

1. ✅ `verify-auth-setup.js` - Verificação de autenticação
2. ✅ `setup-developer-user.js` - Criação de usuário
3. ✅ `tests/verification/test-multi-role-access.js` - Testes multi-role

### Logs com Prefixo SGQ-SECURITY

Todos os logs seguem o padrão:

```
[SGQ-SECURITY] 2026-01-05T14:30:00.000Z - Mensagem
```

Formato ISO 8601 para timestamps garante rastreabilidade completa.

## Compatibilidade

### Backward Compatibility

O sistema mantém compatibilidade com o formato legacy:

| Variável | Status | Uso |
|----------|--------|-----|
| `FIREBASE_PRIVATE_KEY_BASE64` | ✅ Recomendado | Produção |
| `FIREBASE_PRIVATE_KEY` | ⚠️ Legacy | Compatibilidade |

**Prioridade:** Se ambas estiverem definidas, `FIREBASE_PRIVATE_KEY_BASE64` será usado.

### Migração Gradual

Você pode migrar gradualmente:

1. Adicionar `FIREBASE_PRIVATE_KEY_BASE64` ao `.env`
2. Testar a configuração
3. Remover `FIREBASE_PRIVATE_KEY` após validação

## Troubleshooting

### Erro: "error:1E08010C:DECODER routines::unsupported"

**Causa:** Formato da chave privada incorreto.

**Solução:**
```bash
# Gerar nova string Base64
node convert-private-key-to-base64.js <arquivo-json>

# Atualizar .env com FIREBASE_PRIVATE_KEY_BASE64
# Remover FIREBASE_PRIVATE_KEY
```

### Erro: "Neither FIREBASE_PRIVATE_KEY_BASE64 nor FIREBASE_PRIVATE_KEY is configured"

**Causa:** Nenhuma chave privada configurada no `.env`.

**Solução:**
```bash
# Verificar se .env existe
ls -la .env

# Se não existir, copiar template
cp .env.example .env

# Configurar variáveis
```

### Erro: "Failed to connect to Firebase"

**Causa:** Credenciais inválidas ou problemas de rede.

**Solução:**
```bash
# Verificar variáveis
npm run verify:auth

# Revalidar credenciais no Firebase Console
```

## Auditoria e Compliance

### Checklist de Segurança

- [x] ✅ Credenciais em variáveis de ambiente (não em código)
- [x] ✅ Arquivo `.env` no `.gitignore`
- [x] ✅ Arquivo JSON de credenciais removido do workspace
- [x] ✅ String Base64 em gerenciador de senhas seguro
- [x] ✅ Logs com timestamp ISO 8601
- [x] ✅ Logs com prefixo `[SGQ-SECURITY]`
- [x] ✅ Protocolo Zero Trust implementado

### Evidências de Validação

Execute e capture evidências:

```bash
# Teste de autenticação
npm run verify:auth > evidencias_auth.log 2>&1

# Teste de sincronização de usuário
npm run setup:user > evidencias_user.log 2>&1
```

## Recomendações para Produção

### 1. Padronização Base64

Adote `FIREBASE_PRIVATE_KEY_BASE64` como padrão único para todos os ambientes:

- ✅ Desenvolvimento
- ✅ Staging
- ✅ Produção
- ✅ CI/CD

### 2. Rotação de Chaves

Estabeleça cronograma de rotação:

- **Trimestral:** Ambientes de produção
- **Semestral:** Ambientes de desenvolvimento
- **Imediato:** Em caso de exposição

### 3. CI/CD (GitHub Actions)

Configure secrets no GitHub:

```yaml
# .github/workflows/deploy.yml
env:
  FIREBASE_PROJECT_ID: ${{ secrets.FIREBASE_PROJECT_ID }}
  FIREBASE_CLIENT_EMAIL: ${{ secrets.FIREBASE_CLIENT_EMAIL }}
  FIREBASE_PRIVATE_KEY_BASE64: ${{ secrets.FIREBASE_PRIVATE_KEY_BASE64 }}
```

### 4. Ambientes Cloud

Para Google Cloud Run, Cloud Functions, etc:

```bash
# Configurar secret no Secret Manager
gcloud secrets create firebase-private-key-base64 \
  --data-file=<(echo "$FIREBASE_PRIVATE_KEY_BASE64")
  
# Dar acesso ao service account
gcloud secrets add-iam-policy-binding firebase-private-key-base64 \
  --member="serviceAccount:PROJECT_ID@appspot.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

## Referências

- [Firebase Admin SDK Setup](https://firebase.google.com/docs/admin/setup)
- [Node.js Buffer Documentation](https://nodejs.org/api/buffer.html)
- [Base64 Encoding](https://en.wikipedia.org/wiki/Base64)
- [Zero Trust Architecture](https://www.nist.gov/publications/zero-trust-architecture)

## Contato e Suporte

Para questões relacionadas a esta implementação:

- **Documentação:** Este arquivo
- **Scripts:** `convert-private-key-to-base64.js`, `firebase-key-handler.js`
- **Testes:** `npm run verify:auth`, `npm run setup:user`

---

**[SGQ-SECURITY] 2026-01-05T14:30:00.000Z - Documentação Base64 Migration v1.0**  
**Axioma v5.1.0 - Arquitetura Zero Trust - CDL/Manaus**
