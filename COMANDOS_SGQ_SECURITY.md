# Comandos SGQ-SECURITY - Referência Rápida
## Arquitetura Axioma v5.1.0 - Resolução DECODER Error

---

## 🎯 Comando Principal - Conversão do Arquivo JSON

### Conversão do arquivo específico do projeto
```bash
node convert-private-key-to-base64.js axioma-cdl-manaus-firebase-adminsdk-fbsvc-8e7483fceb.json
```

### Detecção automática (se o arquivo estiver na raiz)
```bash
node convert-private-key-to-base64.js
```

**Saída esperada**:
- String Base64 da chave privada
- Configuração completa para `.env`
- Instruções de segurança Zero Trust
- Arquivo `BASE64_SETUP_INSTRUCTIONS.txt` com detalhes

---

## 🔧 Comandos de Verificação

### 1. Verificar Setup de Autenticação
```bash
npm run verify:auth
```

**O que verifica**:
- ✅ Instalação do firebase-admin
- ✅ Instalação do dotenv
- ✅ Existência do arquivo .env
- ✅ Variáveis de ambiente configuradas
- ✅ Conexão com Firebase
- ✅ Usuário desenvolvedor existe
- ✅ Status do usuário no Firestore

**Log de sucesso esperado**:
```
[SGQ-SECURITY] 2026-01-05T16:00:00.000Z - ✅ Successfully connected to Firebase!
[SGQ-SECURITY] 2026-01-05T16:00:00.000Z - Using FIREBASE_PRIVATE_KEY_BASE64 (recommended)
[SGQ-SECURITY] 2026-01-05T16:00:00.000Z - ✅ ALL CHECKS PASSED!
```

### 2. Criar/Sincronizar Usuário Desenvolvedor
```bash
npm run setup:user
```

**O que faz**:
- ✅ Cria usuário no Firebase Authentication (se não existir)
- ✅ Cria/atualiza documento no Firestore
- ✅ Define role como 'admin'
- ✅ Define status como 'ativo'

**Log de sucesso esperado**:
```
[SGQ-SECURITY] 2026-01-05T16:00:00.000Z - Status: USUÁRIO CRIADO COM SUCESSO
Credenciais de acesso:
  E-mail: mayconabentes@gmail.com
  Senha: Aprendiz@33
  Role: admin
  Status: ativo
```

### 3. Verificar Conformidade de Segurança
```bash
npm run verify:security
```

**O que verifica**:
- ✅ Ausência de arquivos JSON de credenciais
- ✅ Configuração do .gitignore
- ✅ Variáveis sensíveis não commitadas

---

## 📋 Fluxo Completo de Setup

### Passo 1: Conversão
```bash
# Converter o arquivo JSON para Base64
node convert-private-key-to-base64.js axioma-cdl-manaus-firebase-adminsdk-fbsvc-8e7483fceb.json
```

### Passo 2: Configuração
```bash
# Copiar template do .env
cp .env.example .env

# Editar o .env e adicionar a string Base64 gerada
# FIREBASE_PRIVATE_KEY_BASE64="LS0tLS1CRUdJTi..."
```

### Passo 3: Validação
```bash
# Testar conexão
npm run verify:auth
```

### Passo 4: Setup do Usuário
```bash
# Criar/sincronizar usuário admin
npm run setup:user
```

### Passo 5: Limpeza (CRÍTICO!)
```bash
# Remover arquivo JSON original COM SEGURANÇA
# Linux/Mac (recomendado - sobrescreve antes de deletar)
shred -vfz -n 3 axioma-cdl-manaus-firebase-adminsdk-fbsvc-8e7483fceb.json 2>/dev/null || rm -f axioma-cdl-manaus-firebase-adminsdk-fbsvc-8e7483fceb.json

# Remover instruções temporárias
rm -f BASE64_SETUP_INSTRUCTIONS.txt
```

**Nota**: `shred` sobrescreve o arquivo 3 vezes antes de deletar para prevenir recuperação.

---

## 🔒 Protocolo de Segurança Zero Trust

### Checklist de Segurança
```bash
# 1. Verificar se .env não está no Git
git ls-files .env
# Resultado esperado: nenhuma saída (arquivo não rastreado)

# 2. Verificar .gitignore
cat .gitignore | grep ".env"
# Resultado esperado: .env deve estar listado

# 3. Verificar ausência de JSON
ls -la *.json | grep firebase
# Resultado esperado: nenhum arquivo encontrado

# 4. Executar verificação de segurança
npm run verify:security
```

### Comandos de Emergência

#### Limpar credenciais do histórico do Git (SE NECESSÁRIO)
```bash
# Usar script específico
./git-clean-credentials.sh
```

#### Regenerar credenciais comprometidas
```bash
# 1. Ir ao Firebase Console
# 2. Project Settings > Service Accounts
# 3. Manage Service Account Permissions (link externo)
# 4. Gerar nova chave privada
# 5. Deletar chave antiga
# 6. Reconverter com: node convert-private-key-to-base64.js [novo-arquivo.json]
```

---

## 📊 Comandos de Diagnóstico

### Ver logs detalhados do Firebase Handler
```bash
# Criar script de teste
cat > test-handler.js << 'EOF'
require('dotenv').config();
const handler = require('./firebase-key-handler.js');
handler.displayConfigurationInfo();
EOF

node test-handler.js
rm test-handler.js
```

### Verificar formato da chave privada
```bash
# Ver primeiros caracteres da chave Base64 (seguro)
node -e "console.log('FIREBASE_PRIVATE_KEY_BASE64:', process.env.FIREBASE_PRIVATE_KEY_BASE64 ? 'Set (length: ' + process.env.FIREBASE_PRIVATE_KEY_BASE64.length + ')' : 'Not set')"
```

### Testar decodificação manual
```bash
# Decodificar e validar formato (em ambiente de desenvolvimento)
node -e "
require('dotenv').config();
if (process.env.FIREBASE_PRIVATE_KEY_BASE64) {
  const decoded = Buffer.from(process.env.FIREBASE_PRIVATE_KEY_BASE64, 'base64').toString('utf-8');
  console.log('✅ Decoded successfully');
  console.log('Contains BEGIN:', decoded.includes('BEGIN PRIVATE KEY'));
  console.log('Contains END:', decoded.includes('END PRIVATE KEY'));
  console.log('Lines:', decoded.split('\\n').length);
} else {
  console.log('❌ FIREBASE_PRIVATE_KEY_BASE64 not set');
}
"
```

---

## 🧪 Comandos de Teste

### Executar suite de testes
```bash
# Testes unitários
npm test

# Testes end-to-end
npm run test:e2e

# Todos os testes
npm run test:all
```

### Verificar refatoração SGQ
```bash
./verify-sgq-refactoring.js
```

---

## 📝 Formato de Logs SGQ-SECURITY

### Estrutura Padrão
```
[SGQ-SECURITY] 2026-01-05T16:00:00.000Z - Mensagem
```

**Componentes**:
- `[SGQ-SECURITY]` - Prefixo de rastreabilidade
- `2026-01-05T16:00:00.000Z` - ISO 8601 Timestamp (UTC)
- `Mensagem` - Descrição da operação

### Níveis de Log

| Símbolo | Nível | Exemplo |
|---------|-------|---------|
| ✅ | Sucesso | `✅ Successfully connected to Firebase!` |
| ⚠️ | Aviso | `⚠️ Using legacy format` |
| ❌ | Erro | `❌ Failed to connect` |
| ℹ️ | Info | `ℹ️ Both formats detected` |
| 🔐 | Segurança | `🔐 Verificando configuração` |
| 📧 | Operação | `📧 Checking user` |

---

## 🔗 Referências Rápidas

### Documentação
- `SGQ_SECURITY_DECODER_ERROR_RESOLUTION.md` - Resolução completa do erro DECODER
- `FIREBASE_BASE64_QUICK_REFERENCE.md` - Guia rápido
- `FIREBASE_BASE64_MIGRATION_GUIDE.md` - Guia de migração
- `ENVIRONMENT_VARIABLES_GUIDE.md` - Variáveis de ambiente

### Scripts
- `firebase-key-handler.js` - Handler centralizado de chaves
- `convert-private-key-to-base64.js` - Conversor JSON → Base64
- `verify-auth-setup.js` - Verificação de autenticação
- `setup-developer-user.js` - Setup de usuário admin

### Variáveis de Ambiente (.env)
```env
# Obrigatórias
FIREBASE_PROJECT_ID=axioma-cdl-manaus
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@axioma-cdl-manaus.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY_BASE64="LS0tLS1CRUdJTi..." # RECOMENDADO

# Opcional (legacy, não usar se tiver Base64)
# FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
```

---

## ⚡ Comandos One-Liner

### Setup completo (com limpeza garantida)
```bash
# Versão segura - deleta arquivo JSON mesmo se comandos anteriores falharem
(
  node convert-private-key-to-base64.js axioma-cdl-manaus-firebase-adminsdk-fbsvc-8e7483fceb.json && \
  npm run verify:auth && \
  npm run setup:user
) ; shred -vfz -n 3 axioma-cdl-manaus-firebase-adminsdk-fbsvc-8e7483fceb.json 2>/dev/null || rm -f axioma-cdl-manaus-firebase-adminsdk-fbsvc-8e7483fceb.json
```

**⚠️ IMPORTANTE**: Esta versão garante que o arquivo JSON seja deletado mesmo se algum comando anterior falhar.

### Verificação completa
```bash
npm run verify:auth && npm run setup:user && npm run verify:security
```

### Limpeza de segurança
```bash
# Listar arquivos antes de deletar (sempre verifique!)
ls -la *firebase-adminsdk*.json BASE64_SETUP_INSTRUCTIONS.txt 2>/dev/null

# Deletar arquivos individualmente com segurança
shred -vfz -n 3 axioma-cdl-manaus-firebase-adminsdk-fbsvc-8e7483fceb.json 2>/dev/null || rm -f axioma-cdl-manaus-firebase-adminsdk-fbsvc-8e7483fceb.json
rm -f BASE64_SETUP_INSTRUCTIONS.txt
```

---

## 🆘 Troubleshooting Rápido

### Erro: DECODER routines::unsupported
```bash
# Solução: Usar Base64
node convert-private-key-to-base64.js axioma-cdl-manaus-firebase-adminsdk-fbsvc-8e7483fceb.json
# Seguir instruções na tela
```

### Erro: Module not found 'firebase-admin'
```bash
npm install firebase-admin dotenv
```

### Erro: Neither FIREBASE_PRIVATE_KEY_BASE64 nor FIREBASE_PRIVATE_KEY
```bash
# Verificar .env
cat .env | grep FIREBASE_PRIVATE_KEY_BASE64
# Se vazio, reconverter credenciais
```

### Erro: Failed to connect to Firebase
```bash
# 1. Validar credenciais
npm run verify:auth

# 2. Testar decodificação
node -e "require('dotenv').config(); const handler = require('./firebase-key-handler.js'); handler.displayConfigurationInfo();"

# 3. Reconverter se necessário
node convert-private-key-to-base64.js [arquivo-json]
```

---

## ✅ Checklist de Implementação

Após executar todos os comandos, verificar:

- [ ] ✅ `npm run verify:auth` retorna sucesso
- [ ] ✅ `npm run setup:user` cria/sincroniza usuário
- [ ] ✅ Arquivo `.env` configurado com FIREBASE_PRIVATE_KEY_BASE64
- [ ] ✅ Arquivo JSON de credenciais DELETADO
- [ ] ✅ Status do usuário: 'ativo' (minúsculas)
- [ ] ✅ Logs exibem `[SGQ-SECURITY]` com timestamps ISO 8601
- [ ] ✅ Nenhum arquivo sensível commitado no Git
- [ ] ✅ String Base64 salva em gerenciador de senhas

---

**[SGQ-SECURITY] Axioma v5.1.0 - Comandos de Referência**

**Data**: 2026-01-05T16:02:40.226Z

**Status**: ✅ DOCUMENTAÇÃO COMPLETA
