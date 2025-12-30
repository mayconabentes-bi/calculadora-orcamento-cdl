#!/bin/bash
#
# Git Pre-Commit Hook - Prevent Credential Commits
# Instalação: cp pre-commit-credential-check.sh .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit
#

# Cores para output
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Lista de padrões de arquivos proibidos
FORBIDDEN_FILE_PATTERNS=(
  '*-firebase-adminsdk-*.json'
  'serviceAccountKey.json'
  '*-adminsdk-*.json'
  'firebase-credentials.json'
  'firebase-service-account.json'
  'firebaseServiceAccountKey.json'
  '*.pem'
  'private-key*'
  'privatekey*'
  'id_rsa'
  'id_dsa'
  'credentials.json'
  'google-credentials.json'
  'gcp-key.json'
  'aws-credentials.txt'
  'azure-credentials.json'
  'secret.txt'
  'secrets.txt'
  'api-key.txt'
  '.env'
)

# Lista de padrões de conteúdo proibidos (regex)
FORBIDDEN_CONTENT_PATTERNS=(
  'BEGIN PRIVATE KEY'
  'BEGIN RSA PRIVATE KEY'
  'BEGIN ENCRYPTED PRIVATE KEY'
  'private_key_id.*:.*[0-9a-f]{40}'
  'AKIA[0-9A-Z]{16}'  # AWS Access Key
  'AIza[0-9A-Za-z_-]{35}'  # Google API Key (mais flexível)
)

echo "🔍 Verificando credenciais antes do commit..."

# Verificar arquivos staged
has_issues=false

# 1. Verificar nomes de arquivos
echo "   Verificando nomes de arquivos..."
for pattern in "${FORBIDDEN_FILE_PATTERNS[@]}"; do
  # Converter glob para regex para grep
  regex_pattern=$(echo "$pattern" | sed 's/\*/.\*/g')
  
  staged_files=$(git diff --cached --name-only --diff-filter=ACM)
  if echo "$staged_files" | grep -qiE "$regex_pattern"; then
    echo -e "${RED}❌ ERRO: Arquivo de credencial detectado: $pattern${NC}"
    echo "$staged_files" | grep -iE "$regex_pattern"
    has_issues=true
  fi
done

# 2. Verificar conteúdo dos arquivos
echo "   Verificando conteúdo dos arquivos..."
for pattern in "${FORBIDDEN_CONTENT_PATTERNS[@]}"; do
  if git diff --cached | grep -qE "$pattern"; then
    echo -e "${RED}❌ ERRO: Padrão de credencial detectado no conteúdo: $pattern${NC}"
    has_issues=true
  fi
done

# 3. Verificar arquivos .env
if git diff --cached --name-only | grep -qE '^\.env$'; then
  echo -e "${RED}❌ ERRO: Tentativa de commit do arquivo .env detectada!${NC}"
  echo -e "${YELLOW}   Dica: Use .env.example em vez disso${NC}"
  has_issues=true
fi

# 4. Verificar chaves grandes (possível private key)
staged_files=$(git diff --cached --name-only --diff-filter=ACM)
if [ -n "$staged_files" ]; then
  for file in $staged_files; do
    if [ -f "$file" ]; then
      # Verificar se o arquivo contém uma chave privada
      if grep -q "BEGIN.*PRIVATE KEY" "$file" 2>/dev/null; then
        echo -e "${RED}❌ ERRO: Chave privada detectada em: $file${NC}"
        has_issues=true
      fi
      
      # Verificar se o arquivo parece ser um service account JSON
      if [[ "$file" == *.json ]]; then
        if grep -q "private_key_id" "$file" 2>/dev/null && grep -q "private_key" "$file" 2>/dev/null; then
          echo -e "${RED}❌ ERRO: Service account key detectada em: $file${NC}"
          has_issues=true
        fi
      fi
    fi
  done
fi

# Resultado final
if [ "$has_issues" = true ]; then
  echo ""
  echo -e "${RED}╔══════════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${RED}║  ❌ COMMIT BLOQUEADO - Credenciais detectadas!                  ║${NC}"
  echo -e "${RED}╚══════════════════════════════════════════════════════════════════╝${NC}"
  echo ""
  echo -e "${YELLOW}📌 Ações recomendadas:${NC}"
  echo "   1. Remova os arquivos de credenciais do stage: git reset HEAD <arquivo>"
  echo "   2. Use variáveis de ambiente em vez de arquivos de credenciais"
  echo "   3. Consulte: SECURITY_REMEDIATION_GUIDE.md"
  echo "   4. Consulte: ENVIRONMENT_VARIABLES_GUIDE.md"
  echo ""
  echo -e "${YELLOW}⚠️  Para ignorar esta verificação (NÃO RECOMENDADO):${NC}"
  echo "   git commit --no-verify"
  echo ""
  exit 1
fi

echo "✅ Nenhuma credencial detectada - commit permitido"
exit 0
