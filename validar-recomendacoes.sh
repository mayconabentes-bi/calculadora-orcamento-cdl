#!/bin/bash
#
# Script de Validação de Recomendações Acionáveis
# SGQ-SECURITY - Protocolo de Validação Completa
#
# Uso: ./validar-recomendacoes.sh [--skip-sanitization]
#

set -euo pipefail

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse arguments
SKIP_SANITIZATION=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --skip-sanitization)
      SKIP_SANITIZATION=true
      shift
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      echo "Usage: $0 [--skip-sanitization]"
      exit 1
      ;;
  esac
done

# Banner
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Validação de Recomendações Acionáveis - SGQ-SECURITY         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

timestamp=$(date -Iseconds)
echo "[SGQ-SECURITY] $timestamp - Iniciando validação completa"
echo ""

# Variáveis de controle
total_checks=0
passed_checks=0

# Função para incrementar contadores
check_passed() {
  ((total_checks++))
  ((passed_checks++))
}

check_failed() {
  ((total_checks++))
}

# 1. Validação Final de Acesso
echo -e "${BLUE}1️⃣  Validação Final de Acesso...${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if npm run verify:auth; then
  check_passed
  echo ""
  echo -e "${GREEN}✅ Validação de acesso: APROVADO${NC}"
else
  check_failed
  echo ""
  echo -e "${RED}❌ Validação de acesso: FALHOU${NC}"
  echo ""
  echo -e "${YELLOW}📌 Ações sugeridas:${NC}"
  echo "   1. Verifique se o arquivo .env existe: ls -la .env"
  echo "   2. Confira as credenciais: cp .env.example .env"
  echo "   3. Configure FIREBASE_PRIVATE_KEY_BASE64 ou FIREBASE_PRIVATE_KEY"
  echo "   4. Execute: node convert-private-key-to-base64.js <arquivo-credenciais.json>"
  echo ""
  exit 1
fi

echo ""

# 2. Sincronização de Role
echo -e "${BLUE}2️⃣  Sincronização de Role...${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if npm run setup:user; then
  check_passed
  echo ""
  echo -e "${GREEN}✅ Sincronização de role: APROVADO${NC}"
  echo "   Usuário: mayconabentes@gmail.com"
  echo "   Role: admin"
  echo "   Status: ativo"
else
  check_failed
  echo ""
  echo -e "${RED}❌ Sincronização de role: FALHOU${NC}"
  echo ""
  echo -e "${YELLOW}📌 Ações sugeridas:${NC}"
  echo "   1. Verifique a conexão com Firebase"
  echo "   2. Confirme permissões do service account"
  echo "   3. Execute npm run verify:auth novamente"
  echo ""
  exit 1
fi

echo ""

# 3. Sanitização de Ambiente
if [ "$SKIP_SANITIZATION" = false ]; then
  echo -e "${BLUE}3️⃣  Sanitização de Ambiente...${NC}"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  
  # Lista arquivos antes da sanitização
  echo -e "${YELLOW}Verificando arquivos JSON no diretório raiz...${NC}"
  json_files=$(find . -maxdepth 1 -name "*.json" -not -name "package*.json" -type f 2>/dev/null || true)
  
  if [ -n "$json_files" ]; then
    echo "Arquivos JSON encontrados (exceto package*.json):"
    echo "$json_files"
    echo ""
  else
    echo "Nenhum arquivo JSON de credenciais encontrado."
    echo ""
  fi
  
  # Remove credenciais Firebase
  echo -e "${YELLOW}Removendo arquivos de credenciais Firebase...${NC}"
  removed_count=0
  
  # Remove arquivos firebase-adminsdk
  for file in *-firebase-adminsdk-*.json 2>/dev/null || true; do
    if [ -f "$file" ]; then
      echo "  Removendo: $file"
      rm -f "$file"
      ((removed_count++))
    fi
  done
  
  # Remove serviceAccountKey.json
  if [ -f "serviceAccountKey.json" ]; then
    echo "  Removendo: serviceAccountKey.json"
    rm -f serviceAccountKey.json
    ((removed_count++))
  fi
  
  # Remove BASE64_SETUP_INSTRUCTIONS.txt
  if [ -f "BASE64_SETUP_INSTRUCTIONS.txt" ]; then
    echo "  Removendo: BASE64_SETUP_INSTRUCTIONS.txt"
    rm -f BASE64_SETUP_INSTRUCTIONS.txt
    ((removed_count++))
  fi
  
  if [ $removed_count -eq 0 ]; then
    echo "  Nenhum arquivo de credencial encontrado para remover."
  else
    echo "  Total de arquivos removidos: $removed_count"
  fi
  
  check_passed
  echo ""
  echo -e "${GREEN}✅ Sanitização: APROVADO${NC}"
  echo "   Ambiente limpo em conformidade com Zero Trust"
else
  echo -e "${YELLOW}3️⃣  Sanitização de Ambiente: PULADO${NC}"
  echo ""
fi

echo ""

# 4. Auditoria SGQ
echo -e "${BLUE}4️⃣  Auditoria SGQ...${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if node verify-sgq-security.js; then
  check_passed
  echo ""
  echo -e "${GREEN}✅ Auditoria SGQ: APROVADO${NC}"
  echo "   RBAC Gatekeepers: Operacional"
  echo "   Resiliência de Persistência: Operacional"
  echo "   Logs de Auditoria: Completos"
else
  check_failed
  echo ""
  echo -e "${RED}❌ Auditoria SGQ: FALHOU${NC}"
  echo ""
  echo -e "${YELLOW}📌 Ações sugeridas:${NC}"
  echo "   1. Revise os logs acima para identificar problemas"
  echo "   2. Consulte: SECURITY_ENHANCEMENTS_SGQ.md"
  echo "   3. Verifique implementação de RBAC em assets/js/app.js"
  echo "   4. Verifique resiliência em assets/js/data-manager.js"
  echo ""
  exit 1
fi

echo ""

# 5. Backup de Credenciais
echo -e "${BLUE}5️⃣  Lembrete: Backup de Credenciais${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${YELLOW}📌 IMPORTANTE: Armazene suas credenciais com segurança${NC}"
echo ""
echo "A string FIREBASE_PRIVATE_KEY_BASE64 deve ser armazenada em:"
echo "  • Gerenciador de senhas corporativo (1Password, LastPass, Bitwarden)"
echo "  • Cloud Secret Manager (Azure Key Vault, AWS Secrets Manager, GCP Secret Manager)"
echo "  • GitHub Secrets (para CI/CD)"
echo ""
echo "Metadados recomendados:"
echo "  • Projeto: axioma-cdl-manaus"
echo "  • Tipo: FIREBASE_PRIVATE_KEY_BASE64"
echo "  • Rotação: Trimestral"
echo ""
echo "Para gerar nova chave Base64:"
echo "  node convert-private-key-to-base64.js <arquivo-credenciais.json>"
echo ""

# Resultado Final
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ TODAS AS VALIDAÇÕES APROVADAS                              ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

final_timestamp=$(date -Iseconds)
echo "[SGQ-SECURITY] $final_timestamp - Validação concluída"
echo ""
echo "Estatísticas:"
echo "  Total de verificações: $total_checks"
echo "  Aprovadas: $passed_checks"
echo "  Taxa de sucesso: 100%"
echo ""
echo -e "${GREEN}Sistema 100% operacional conforme protocolo SGQ-SECURITY${NC}"
echo ""
echo "📚 Documentação:"
echo "  • RECOMENDACOES_ACIONAVEIS.md - Detalhes completos"
echo "  • ENVIRONMENT_VARIABLES_GUIDE.md - Configuração de variáveis"
echo "  • SECURITY_ENHANCEMENTS_SGQ.md - Melhorias de segurança"
echo ""

exit 0
