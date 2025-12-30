# Diferenças entre Credenciais Firebase

## 🔑 Tipos de Credenciais Firebase

### 1. Firebase Web SDK (Frontend) - ✅ PÚBLICO

**Localização**: `assets/js/firebase-config.js`

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD-V2GNT5koNgR4r95RGbhIyfKOJd1oUbc",
  authDomain: "axioma-cdl-manaus.firebaseapp.com",
  projectId: "axioma-cdl-manaus",
  storageBucket: "axioma-cdl-manaus.firebasestorage.app",
  messagingSenderId: "748023320826",
  appId: "1:748023320826:web:97cd9ab757f19567fe3943",
  measurementId: "G-0VF64LKRPG"
};
```

**✅ É SEGURO commitar estas credenciais porque:**
- São projetadas para uso público no frontend
- Acesso é controlado por Firebase Security Rules
- Não fornecem acesso administrativo
- Podem ser expostas em aplicações web/mobile
- Limitadas por domínios autorizados e rate limiting

**Controles de Segurança:**
1. **Security Rules**: Definem quem pode ler/escrever no Firestore
2. **Authentication**: Usuários devem estar autenticados
3. **Domain Restrictions**: API Key restrita a domínios autorizados
4. **App Check**: Proteção contra abuso (opcional)

### 2. Firebase Admin SDK (Backend) - ❌ PRIVADO

**Localização**: NÃO deve estar no repositório

**Exemplo de arquivo (serviceAccountKey.json):**
```json
{
  "type": "service_account",
  "project_id": "axioma-cdl-manaus",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@axioma-cdl-manaus.iam.gserviceaccount.com",
  "client_id": "123456789...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

**❌ NUNCA commitar porque:**
- Fornece acesso administrativo completo
- Ignora todas as Security Rules
- Pode criar/deletar usuários
- Pode ler/escrever qualquer dado
- Acesso irrestrito ao projeto Firebase

**Como proteger:**
1. **Adicionar ao .gitignore** (já configurado)
2. **Usar variáveis de ambiente** (.env)
3. **Rotacionar regularmente** (trimestral)
4. **Revogar se comprometida** (imediato)

## 📋 Comparação Rápida

| Característica | Web SDK (Frontend) | Admin SDK (Backend) |
|----------------|-------------------|---------------------|
| **Tipo** | Público | Privado |
| **Uso** | Navegador, Apps Mobile | Servidores, Scripts |
| **Commit no Git** | ✅ Permitido | ❌ Proibido |
| **Security Rules** | ✅ Aplicadas | ❌ Ignoradas |
| **Acesso Admin** | ❌ Não | ✅ Sim |
| **Criação de Usuários** | ❌ Não* | ✅ Sim |
| **Bypass de Rules** | ❌ Não | ✅ Sim |

\* Usuários podem criar contas próprias, mas não gerenciar outros usuários

## 🔍 Como Identificar

### Web SDK API Key (Público)
```
AIzaSy... (começa com AIzaSy)
```
- ✅ OK em código frontend
- ✅ OK commitar no Git
- ✅ Controlado por Security Rules

### Admin SDK Private Key (Privado)
```
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASC...
-----END PRIVATE KEY-----
```
- ❌ NUNCA no Git
- ❌ NUNCA em frontend
- ❌ Sempre em variáveis de ambiente

## 🛡️ Melhores Práticas

### Frontend (Web SDK)
```javascript
// ✅ OK - Firebase Config público
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "projeto.firebaseapp.com",
  // ... outras configs públicas
};

const app = initializeApp(firebaseConfig);
```

### Backend (Admin SDK)
```javascript
// ❌ ERRADO - Hardcoded
const serviceAccount = require('./serviceAccountKey.json');

// ✅ CORRETO - Variáveis de ambiente
require('dotenv').config();
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL
  })
});
```

## 🚨 Sinais de Alerta

### ⚠️ Possível Exposição de Admin SDK:
- Arquivo `.json` com campo `private_key`
- String `BEGIN PRIVATE KEY` em código
- Arquivo `serviceAccountKey.json` no repositório
- Arquivo `*-firebase-adminsdk-*.json`

### ✅ Uso Correto de Web SDK:
- Apenas `apiKey`, `authDomain`, `projectId`, etc.
- Sem campos `private_key` ou `private_key_id`
- Em arquivo JavaScript (não JSON de credentials)
- Usado com `initializeApp()` do Firebase SDK

## 📚 Referências

- [Firebase Web SDK Setup](https://firebase.google.com/docs/web/setup)
- [Firebase Admin SDK Setup](https://firebase.google.com/docs/admin/setup)
- [Security Rules Documentation](https://firebase.google.com/docs/rules)
- [Firebase API Key Restrictions](https://firebase.google.com/docs/projects/api-keys)

---

**Resumo**: O `apiKey` no `firebase-config.js` é público e seguro. O `private_key` no service account JSON é privado e deve ser protegido com variáveis de ambiente.
