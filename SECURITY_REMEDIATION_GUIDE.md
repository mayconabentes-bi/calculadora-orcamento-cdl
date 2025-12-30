# Guia de Remediação de Segurança - Axioma CDL Manaus

## ⚠️ Contexto Crítico de Segurança

Este documento fornece procedimentos emergenciais para remediação de incidentes envolvendo exposição de credenciais do Firebase (service account keys) no repositório Git.

## 🚨 Fase 1: Remediação Imediata

### 1.1 Revogar Credenciais Comprometidas

**AÇÃO CRÍTICA - EXECUTAR IMEDIATAMENTE:**

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Selecione o projeto: `axioma-cdl-manaus`
3. Navegue para **Project Settings** → **Service Accounts**
4. Identifique a service account comprometida (ex: `axioma-cdl-manaus-firebase-adminsdk-fbsvc-586ddd7211.json`)
5. **Delete a chave de serviço comprometida imediatamente**
6. Gere uma nova chave de serviço com nome diferente
7. **NUNCA commite a nova chave no Git**

### 1.2 Remover Arquivo do Working Directory

```bash
# Se o arquivo ainda existir no diretório de trabalho
cd /caminho/do/projeto/calculadora-orcamento-cdl

# Remover o arquivo específico
rm -f axioma-cdl-manaus-firebase-adminsdk-fbsvc-586ddd7211.json

# Verificar que não há outros arquivos de credenciais
find . -type f -name "*firebase-adminsdk*.json"
find . -type f -name "*serviceAccountKey*.json"
find . -type f -name "*-adminsdk-*.json"
```

## 🔥 Fase 2: Limpeza Profunda do Histórico Git

### 2.1 Preparação

```bash
# Fazer backup do repositório
cd /caminho/do/projeto
cd ..
cp -r calculadora-orcamento-cdl calculadora-orcamento-cdl-backup

# Voltar ao repositório
cd calculadora-orcamento-cdl

# Verificar histórico antes da limpeza
git log --all --full-history --name-only | grep -i "firebase-adminsdk"
```

### 2.2 Opção A: Usando git-filter-repo (RECOMENDADO)

**Instalação do git-filter-repo:**
```bash
# Ubuntu/Debian
sudo apt-get install git-filter-repo

# macOS
brew install git-filter-repo

# Python pip (universal)
pip3 install git-filter-repo
```

**Comandos de Limpeza:**
```bash
# Remover arquivo específico de TODO o histórico
git filter-repo --invert-paths --path axioma-cdl-manaus-firebase-adminsdk-fbsvc-586ddd7211.json --force

# Remover todos os arquivos de service account do Firebase
git filter-repo --invert-paths --path-glob '*-firebase-adminsdk-*.json' --force

# Remover todos os arquivos serviceAccountKey.json
git filter-repo --invert-paths --path serviceAccountKey.json --force

# Remover múltiplos padrões de uma vez
git filter-repo --invert-paths \
  --path-glob '*-firebase-adminsdk-*.json' \
  --path-glob '*-adminsdk-*.json' \
  --path serviceAccountKey.json \
  --path firebase-credentials.json \
  --force
```

### 2.3 Opção B: Usando BFG Repo-Cleaner (ALTERNATIVA)

**Instalação do BFG:**
```bash
# Baixar BFG (requer Java)
wget https://repo1.maven.org/maven2/com/madgag/bfg/1.14.0/bfg-1.14.0.jar
mv bfg-1.14.0.jar bfg.jar

# Verificar instalação
java -jar bfg.jar --version
```

**Comandos de Limpeza:**
```bash
# Remover arquivo específico
java -jar bfg.jar --delete-files axioma-cdl-manaus-firebase-adminsdk-fbsvc-586ddd7211.json

# Remover por padrão glob
java -jar bfg.jar --delete-files '*-firebase-adminsdk-*.json'
java -jar bfg.jar --delete-files 'serviceAccountKey.json'

# Limpar commits órfãos e garbage collection
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

### 2.4 Verificação Pós-Limpeza

```bash
# Verificar que o arquivo foi removido do histórico
git log --all --full-history --name-only | grep -i "firebase-adminsdk"
git log --all --full-history --name-only | grep -i "serviceAccountKey"

# Verificar objetos do Git
git rev-list --all --objects | grep -i "firebase"
git rev-list --all --objects | grep -i "adminsdk"

# Verificar tamanho do repositório (deve ser menor)
git count-objects -vH
```

### 2.5 Force Push (CUIDADO!)

```bash
# ⚠️ ATENÇÃO: Esta operação reescreve o histórico remoto
# Avisar TODA a equipe antes de executar
# Todos os colaboradores precisarão re-clonar o repositório

# Force push de todas as branches
git push origin --force --all

# Force push de todas as tags
git push origin --force --tags

# Ou force push da branch atual
git push origin copilot/remediar-chave-privada-exposta --force
```

### 2.6 Notificação à Equipe

Após o force push, **TODOS os colaboradores** devem:

```bash
# NÃO fazer pull! O histórico foi reescrito.
# Fazer backup das mudanças locais (se houver)
git stash

# Re-clonar o repositório limpo
cd ..
mv calculadora-orcamento-cdl calculadora-orcamento-cdl-old
git clone https://github.com/mayconabentes-bi/calculadora-orcamento-cdl.git
cd calculadora-orcamento-cdl

# Aplicar mudanças locais (se necessário)
# git stash pop (do repositório antigo, se aplicável)
```

## 🔒 Fase 3: Arquitetura Zero Trust com Variáveis de Ambiente

### 3.1 Criar Arquivo de Template

```bash
# Criar template de exemplo (NUNCA commitar valores reais)
cat > .env.example << 'EOF'
# Firebase Service Account Configuration
# NUNCA commitar valores reais!
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=your-cert-url

# Firebase Web SDK Configuration (público - OK para commit)
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id
FIREBASE_MEASUREMENT_ID=your-measurement-id
EOF
```

### 3.2 Modificar Scripts para Usar Variáveis de Ambiente

**Exemplo de conversão para `setup-developer-user.js`:**

```javascript
/**
 * Script seguro usando variáveis de ambiente
 * Uso: 
 * 1. npm install firebase-admin dotenv
 * 2. Copie .env.example para .env e preencha com valores reais
 * 3. Execute: node setup-developer-user.js
 */

require('dotenv').config();
const admin = require('firebase-admin');

// Verificar variáveis de ambiente obrigatórias
const requiredEnvVars = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_CLIENT_EMAIL'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('❌ Erro: Variáveis de ambiente obrigatórias não configuradas:');
  missingVars.forEach(varName => console.error(`   - ${varName}`));
  console.error('\nConfigure o arquivo .env baseado em .env.example');
  process.exit(1);
}

// Inicializar Firebase Admin com credenciais de ambiente
try {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL
    })
  });
  
  console.log('✅ Firebase Admin inicializado com sucesso via variáveis de ambiente');
} catch (error) {
  console.error('❌ Erro ao inicializar Firebase Admin:', error.message);
  process.exit(1);
}

// ... resto do código
```

### 3.3 Dependências Necessárias

```bash
# Instalar dotenv para gerenciar variáveis de ambiente
npm install dotenv --save

# Atualizar package.json para incluir dotenv
# (se necessário para outros scripts)
```

## 📋 Fase 4: Checklist de Conformidade SGQ

- [ ] **Revogação**: Chave comprometida deletada no Firebase Console
- [ ] **Limpeza**: Histórico Git expurgado com git-filter-repo/BFG
- [ ] **Verificação**: `git log` não mostra mais o arquivo comprometido
- [ ] **Força Push**: Histórico remoto reescrito (equipe notificada)
- [ ] **Gitignore**: Padrões de segurança atualizados
- [ ] **Migração**: Scripts convertidos para usar variáveis de ambiente
- [ ] **Documentação**: Guias de segurança criados e commitados
- [ ] **Rotação**: Nova chave gerada e armazenada de forma segura
- [ ] **Auditoria**: Logs do Firebase revisados para atividade suspeita
- [ ] **Monitoramento**: Alertas configurados para futuras exposições

## 🛡️ Melhores Práticas de Segurança

### Armazenamento Seguro de Credenciais

1. **Ambiente Local (Desenvolvimento)**
   - Usar arquivo `.env` (NUNCA commitar)
   - Adicionar `.env` ao `.gitignore`
   - Compartilhar `.env.example` como template

2. **Ambiente CI/CD (GitHub Actions)**
   ```yaml
   # .github/workflows/example.yml
   env:
     FIREBASE_PROJECT_ID: ${{ secrets.FIREBASE_PROJECT_ID }}
     FIREBASE_PRIVATE_KEY: ${{ secrets.FIREBASE_PRIVATE_KEY }}
     FIREBASE_CLIENT_EMAIL: ${{ secrets.FIREBASE_CLIENT_EMAIL }}
   ```

3. **Ambiente Produção (Cloud Run, App Engine, etc.)**
   - Usar Secret Manager do Google Cloud
   - Configurar IAM roles apropriadas
   - Rotacionar chaves trimestralmente

### Monitoramento Contínuo

```bash
# Adicionar git hook para prevenir commits de credenciais
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
# Hook para prevenir commit de credenciais

FORBIDDEN_PATTERNS=(
  '*-firebase-adminsdk-*.json'
  'serviceAccountKey.json'
  '*-adminsdk-*.json'
  '*.pem'
  '*.key'
  'credentials.json'
)

for pattern in "${FORBIDDEN_PATTERNS[@]}"; do
  if git diff --cached --name-only | grep -qE "$pattern"; then
    echo "❌ ERRO: Tentativa de commit de arquivo de credenciais detectada!"
    echo "   Arquivo: $pattern"
    echo "   Use variáveis de ambiente em vez disso."
    exit 1
  fi
done

# Verificar conteúdo dos arquivos por padrões sensíveis
if git diff --cached | grep -qE "private_key.*BEGIN PRIVATE KEY"; then
  echo "❌ ERRO: Chave privada detectada no diff!"
  echo "   Use variáveis de ambiente para credenciais."
  exit 1
fi
EOF

chmod +x .git/hooks/pre-commit
```

## 🔍 Auditoria de Segurança

### Verificar Logs do Firebase

1. Acesse Firebase Console → **Authentication** → **Users**
2. Verifique atividades incomuns (criação/deleção de usuários)
3. Acesse **Firestore Database** → **Usage**
4. Monitore picos anormais de leitura/escrita
5. Configure alertas de custo para detectar uso não autorizado

### Ferramentas de Detecção

```bash
# Escanear repositório por segredos com git-secrets
git secrets --install
git secrets --register-aws
git secrets --register-gcp
git secrets --scan-history

# Usar gitleaks para detecção avançada
docker run -v $(pwd):/path ghcr.io/gitleaks/gitleaks:latest detect --source="/path" -v

# Usar truffleHog
docker run -v $(pwd):/proj trufflesecurity/trufflehog:latest git file:///proj
```

## 📞 Contatos de Emergência

- **Firebase Support**: https://firebase.google.com/support
- **GitHub Security Advisory**: https://github.com/security/advisories
- **CERT.br**: https://www.cert.br/ (para incidentes no Brasil)

## 📚 Referências

- [Firebase Security Best Practices](https://firebase.google.com/docs/rules/security)
- [Git Filter-Repo Documentation](https://github.com/newren/git-filter-repo)
- [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)
- [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)

---

**Última atualização**: 2025-12-30  
**Responsável**: Security & DevOps Team  
**Classificação**: CRÍTICO - USO INTERNO
