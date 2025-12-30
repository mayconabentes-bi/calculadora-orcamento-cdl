# Guia de Migração: Zero Trust com Variáveis de Ambiente

## 🎯 Objetivo

Migrar a arquitetura de autenticação Firebase de chaves de serviço estáticas (arquivos JSON) para uma abordagem **Zero Trust** baseada em variáveis de ambiente.

## 📊 Estado Atual vs. Estado Desejado

### ❌ Estado Atual (Inseguro)
```javascript
// setup-developer-user.js
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
```

**Problemas:**
- Chave privada armazenada em arquivo
- Risco de commit acidental no Git
- Difícil rotação de credenciais
- Sem segregação por ambiente

### ✅ Estado Desejado (Seguro)
```javascript
// setup-developer-user.js (com dotenv)
require('dotenv').config();
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL
  })
});
```

**Benefícios:**
- ✅ Credenciais nunca tocam o filesystem do repositório
- ✅ Impossível commit acidental (`.env` no `.gitignore`)
- ✅ Rotação simplificada (editar `.env`)
- ✅ Suporte multi-ambiente (dev, staging, prod)

## 🚀 Passo a Passo de Migração

### Etapa 1: Instalar Dependências

```bash
cd /caminho/do/projeto/calculadora-orcamento-cdl

# Instalar dotenv
npm install dotenv --save

# Verificar instalação
npm list dotenv
```

### Etapa 2: Extrair Credenciais do Arquivo JSON

Se você ainda tem acesso ao arquivo `serviceAccountKey.json`:

```bash
# Extrair valores (executar localmente, não commitar output!)
cat serviceAccountKey.json | jq -r '.project_id'
cat serviceAccountKey.json | jq -r '.private_key_id'
cat serviceAccountKey.json | jq -r '.private_key'
cat serviceAccountKey.json | jq -r '.client_email'
cat serviceAccountKey.json | jq -r '.client_id'
```

### Etapa 3: Criar Arquivo .env

```bash
# Copiar template
cp .env.example .env

# Editar com valores reais (use seu editor favorito)
nano .env  # ou vim .env, ou code .env
```

**Exemplo de `.env` preenchido:**
```env
FIREBASE_PROJECT_ID=axioma-cdl-manaus
FIREBASE_PRIVATE_KEY_ID=abc123def456
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhki...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@axioma-cdl-manaus.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=123456789012345678901
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40axioma-cdl-manaus.iam.gserviceaccount.com
```

### Etapa 4: Migrar setup-developer-user.js

**Criar versão segura do arquivo:**

```javascript
/**
 * Script para criar o usuário inicial do desenvolvedor
 * Versão 2.0 - Usando variáveis de ambiente (Zero Trust)
 * 
 * Uso:
 * 1. npm install firebase-admin dotenv
 * 2. Copie .env.example para .env e configure as credenciais
 * 3. Execute: node setup-developer-user.js
 * 
 * Credenciais criadas:
 * - Email: mayconabentes@gmail.com
 * - Role: admin
 */

require('dotenv').config();
const admin = require('firebase-admin');

// Validação de variáveis de ambiente obrigatórias
const requiredEnvVars = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_CLIENT_EMAIL'
];

console.log('🔐 Verificando configuração de segurança...\n');

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('❌ Erro: Variáveis de ambiente obrigatórias não configuradas:');
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('\n📝 Para configurar:');
  console.error('   1. Copie .env.example para .env: cp .env.example .env');
  console.error('   2. Edite .env com suas credenciais reais');
  console.error('   3. Execute este script novamente');
  console.error('\n📚 Consulte: SECURITY_REMEDIATION_GUIDE.md');
  process.exit(1);
}

// Inicializar Firebase Admin com credenciais de ambiente
try {
  const credential = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL
  };

  admin.initializeApp({
    credential: admin.credential.cert(credential)
  });

  console.log('✅ Firebase Admin inicializado com sucesso via variáveis de ambiente');
  console.log(`   Project: ${process.env.FIREBASE_PROJECT_ID}`);
  console.log(`   Service Account: ${process.env.FIREBASE_CLIENT_EMAIL}\n`);
} catch (error) {
  console.error('❌ Erro ao inicializar Firebase Admin:', error.message);
  console.error('\n💡 Verifique se as credenciais no arquivo .env estão corretas.');
  console.error('   Especialmente o formato da FIREBASE_PRIVATE_KEY (deve incluir \\n)');
  process.exit(1);
}

const auth = admin.auth();
const db = admin.firestore();

// Dados do desenvolvedor
const developerData = {
  email: 'mayconabentes@gmail.com',
  password: 'Aprendiz@33',
  nome: 'Maycon Abentes',
  role: 'admin',
  status: 'ativo'
};

async function createDeveloperUser() {
  try {
    console.log('👤 Criando usuário desenvolvedor...');
    
    // Verificar se usuário já existe
    try {
      const existingUser = await auth.getUserByEmail(developerData.email);
      console.log('⚠️  Usuário já existe no Authentication');
      console.log(`   UID: ${existingUser.uid}`);
      
      // Atualizar dados no Firestore
      const userRef = db.collection('usuarios').doc(existingUser.uid);
      await userRef.set({
        email: developerData.email,
        nome: developerData.nome,
        role: developerData.role,
        status: developerData.status,
        updatedAt: new Date()
      }, { merge: true });
      
      console.log('✅ Dados do usuário atualizados no Firestore');
      return;
    } catch (error) {
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
    }

    // Criar usuário no Authentication
    const userRecord = await auth.createUser({
      email: developerData.email,
      password: developerData.password,
      emailVerified: true,
      displayName: developerData.nome
    });

    console.log('✅ Usuário criado no Firebase Authentication');
    console.log(`   UID: ${userRecord.uid}`);
    console.log(`   Email: ${userRecord.email}`);

    // Criar documento no Firestore
    await db.collection('usuarios').doc(userRecord.uid).set({
      email: developerData.email,
      nome: developerData.nome,
      role: developerData.role,
      status: developerData.status,
      createdAt: new Date()
    });

    console.log('✅ Documento criado no Firestore');
    console.log('\n🎉 Setup concluído com sucesso!');
    console.log('\n📋 Credenciais:');
    console.log(`   Email: ${developerData.email}`);
    console.log(`   Senha: ${developerData.password}`);
    console.log(`   Role: ${developerData.role}`);
    
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error);
    process.exit(1);
  }
}

// Executar
createDeveloperUser()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
```

### Etapa 5: Migrar verify-auth-setup.js

**Criar versão segura:**

```javascript
#!/usr/bin/env node

/**
 * Verify Authentication Setup Script
 * Versão 2.0 - Zero Trust (Environment Variables)
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║  Authentication Setup Verification Tool v2.0                  ║');
console.log('║  Zero Trust Architecture (Environment Variables)              ║');
console.log('╚════════════════════════════════════════════════════════════════╝');
console.log('');

// Check if firebase-admin is installed
console.log('1️⃣  Checking firebase-admin installation...');
try {
  require('firebase-admin');
  console.log('   ✅ firebase-admin is installed');
} catch (error) {
  console.log('   ❌ firebase-admin is NOT installed');
  console.log('   Run: npm install firebase-admin');
  console.log('');
}

// Check if dotenv is installed
console.log('');
console.log('2️⃣  Checking dotenv installation...');
try {
  require('dotenv');
  console.log('   ✅ dotenv is installed');
} catch (error) {
  console.log('   ❌ dotenv is NOT installed');
  console.log('   Run: npm install dotenv');
  console.log('');
}

// Check for .env file
console.log('');
console.log('3️⃣  Checking for .env configuration...');
const envPath = path.join(__dirname, '.env');
const hasEnvFile = fs.existsSync(envPath);

if (hasEnvFile) {
  console.log('   ✅ .env file found');
} else {
  console.log('   ❌ .env file NOT found');
  console.log('');
  console.log('   To create .env file:');
  console.log('   1. Copy the template: cp .env.example .env');
  console.log('   2. Edit .env with your Firebase credentials');
  console.log('   3. Get credentials from: https://console.firebase.google.com/');
  console.log('      → Project Settings → Service Accounts → Generate Private Key');
  console.log('');
}

// Check for required environment variables
console.log('');
console.log('4️⃣  Checking environment variables...');
const requiredVars = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_CLIENT_EMAIL'
];

let allVarsPresent = true;
requiredVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`   ✅ ${varName} is set`);
  } else {
    console.log(`   ❌ ${varName} is NOT set`);
    allVarsPresent = false;
  }
});

// Check for legacy serviceAccountKey.json (should NOT exist)
console.log('');
console.log('5️⃣  Checking for legacy credential files...');
const legacyFiles = [
  'serviceAccountKey.json',
  'axioma-cdl-manaus-firebase-adminsdk-fbsvc-586ddd7211.json'
];

let foundLegacyFiles = false;
legacyFiles.forEach(filename => {
  const filePath = path.join(__dirname, filename);
  if (fs.existsSync(filePath)) {
    console.log(`   ⚠️  LEGACY FILE FOUND: ${filename}`);
    console.log(`      DELETE THIS FILE IMMEDIATELY for security!`);
    foundLegacyFiles = true;
  }
});

if (!foundLegacyFiles) {
  console.log('   ✅ No legacy credential files found (good!)');
}

// Try to connect to Firebase (if all vars are set)
if (allVarsPresent && hasEnvFile) {
  console.log('');
  console.log('6️⃣  Testing Firebase connection...');
  
  try {
    const admin = require('firebase-admin');
    
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL
      })
    });
    
    console.log('   ✅ Successfully connected to Firebase!');
    console.log(`      Project: ${process.env.FIREBASE_PROJECT_ID}`);
    
  } catch (error) {
    console.log('   ❌ Failed to connect to Firebase');
    console.log(`      Error: ${error.message}`);
  }
}

// Summary
console.log('');
console.log('═══════════════════════════════════════════════════════════════');
console.log('SUMMARY');
console.log('═══════════════════════════════════════════════════════════════');

if (hasEnvFile && allVarsPresent && !foundLegacyFiles) {
  console.log('✅ Your authentication setup looks good!');
  console.log('   You can now run: npm run setup:user');
} else {
  console.log('⚠️  Action required:');
  if (!hasEnvFile) {
    console.log('   1. Create .env file: cp .env.example .env');
  }
  if (!allVarsPresent) {
    console.log('   2. Configure Firebase credentials in .env');
  }
  if (foundLegacyFiles) {
    console.log('   3. DELETE legacy credential JSON files!');
  }
  console.log('');
  console.log('📚 For detailed instructions, see: ENVIRONMENT_VARIABLES_GUIDE.md');
}

console.log('');
```

### Etapa 6: Atualizar package.json

```json
{
  "dependencies": {
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "@jest/globals": "^29.7.0",
    "@playwright/test": "^1.40.0",
    "firebase-admin": "^13.6.0",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0"
  }
}
```

### Etapa 7: Testar a Configuração

```bash
# Verificar setup
npm run verify:auth

# Se tudo estiver OK, testar criação de usuário
npm run setup:user
```

### Etapa 8: Remover Arquivos Legados (CRÍTICO)

```bash
# Remover arquivo de chave de serviço (se existir)
rm -f serviceAccountKey.json
rm -f axioma-cdl-manaus-firebase-adminsdk-fbsvc-*.json
rm -f *-adminsdk-*.json

# Verificar que foram removidos
ls -la *.json | grep -i firebase
ls -la *.json | grep -i adminsdk
```

### Etapa 9: Verificar .gitignore

Certifique-se de que `.gitignore` inclui:
```gitignore
# Environment variables (Zero Trust Security)
.env
.env.*
!.env.example
!.env.template

# Firebase credentials
serviceAccountKey.json
*-firebase-adminsdk-*.json
*-adminsdk-*.json
```

## 🔒 Configuração para Ambientes

### Desenvolvimento Local

```bash
# .env (local, não commitado)
FIREBASE_PROJECT_ID=axioma-cdl-manaus
FIREBASE_PRIVATE_KEY="..."
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@..."
NODE_ENV=development
```

### CI/CD (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy
on: [push]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Run setup with secrets
        env:
          FIREBASE_PROJECT_ID: ${{ secrets.FIREBASE_PROJECT_ID }}
          FIREBASE_PRIVATE_KEY: ${{ secrets.FIREBASE_PRIVATE_KEY }}
          FIREBASE_CLIENT_EMAIL: ${{ secrets.FIREBASE_CLIENT_EMAIL }}
        run: npm run setup:user
```

**Configurar GitHub Secrets:**
1. Vá para repositório → Settings → Secrets and variables → Actions
2. Adicione cada variável como secret
3. Use `${{ secrets.VARIABLE_NAME }}` no workflow

### Produção (Cloud Run, App Engine, etc.)

```bash
# Usar Google Cloud Secret Manager
gcloud secrets create firebase-private-key --data-file=- < private-key.txt

# Configurar acesso no app
gcloud run services update axioma-cdl \
  --update-secrets=FIREBASE_PRIVATE_KEY=firebase-private-key:latest
```

## ✅ Checklist de Migração

- [ ] Instalado `dotenv` via npm
- [ ] Criado arquivo `.env` baseado em `.env.example`
- [ ] Configuradas todas as variáveis obrigatórias no `.env`
- [ ] Migrado `setup-developer-user.js` para usar `dotenv`
- [ ] Migrado `verify-auth-setup.js` para usar `dotenv`
- [ ] Testado `npm run verify:auth` com sucesso
- [ ] Testado `npm run setup:user` com sucesso
- [ ] Removidos arquivos JSON de credenciais legados
- [ ] Verificado que `.env` está no `.gitignore`
- [ ] Verificado que `.env.example` está commitado
- [ ] Configurados secrets no GitHub Actions (se aplicável)
- [ ] Documentação atualizada para nova abordagem

## 🆘 Troubleshooting

### Erro: "FIREBASE_PRIVATE_KEY is not set"

**Solução:**
```bash
# Verificar se .env existe
ls -la .env

# Verificar conteúdo (sem mostrar a chave!)
grep FIREBASE_PROJECT_ID .env
```

### Erro: "Invalid private key"

**Problema:** Formato incorreto da chave privada no `.env`

**Solução:**
```bash
# A chave deve estar entre aspas e usar \n para quebras de linha
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkq...\n-----END PRIVATE KEY-----\n"

# Ou em uma única linha com \n literais
```

### Erro: "Service account does not have permission"

**Solução:**
1. Vá para Firebase Console
2. IAM & Admin → Service Accounts
3. Verifique permissões da service account
4. Adicione role "Firebase Admin SDK Administrator Service Agent"

## 📚 Referências

- [dotenv Documentation](https://github.com/motdotla/dotenv)
- [Firebase Admin SDK Setup](https://firebase.google.com/docs/admin/setup)
- [Twelve-Factor App Methodology](https://12factor.net/config)
- [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)

---

**Última atualização**: 2025-12-30  
**Versão**: 2.0  
**Classificação**: INTERNO
