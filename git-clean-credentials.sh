#!/bin/bash
#
# Git History Cleaning Script - Firebase Credentials Removal
# ATENÇÃO: Este script REESCREVE o histórico Git. Use com EXTREMA cautela!
#
# Uso:
#   ./git-clean-credentials.sh [--dry-run] [--specific-file FILE] [--pattern GLOB]
#
# Exemplos:
#   ./git-clean-credentials.sh --dry-run
#   ./git-clean-credentials.sh --specific-file axioma-cdl-manaus-firebase-adminsdk-fbsvc-586ddd7211.json
#   ./git-clean-credentials.sh --pattern '*-firebase-adminsdk-*.json'
#

set -euo pipefail

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Banner
echo -e "${RED}╔══════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${RED}║  🔥 Git History Cleaning Script - DANGER ZONE 🔥                ║${NC}"
echo -e "${RED}║  This script PERMANENTLY rewrites Git history                   ║${NC}"
echo -e "${RED}╚══════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Parse arguments
DRY_RUN=false
SPECIFIC_FILE=""
PATTERN=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --specific-file)
      SPECIFIC_FILE="$2"
      shift 2
      ;;
    --pattern)
      PATTERN="$2"
      shift 2
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      exit 1
      ;;
  esac
done

# Verificar se estamos em um repositório Git
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}❌ Erro: Não estamos em um repositório Git!${NC}"
    exit 1
fi

echo -e "${BLUE}📍 Repositório: $(pwd)${NC}"
echo -e "${BLUE}📍 Branch atual: $(git branch --show-current)${NC}"
echo ""

# Verificar se git-filter-repo está instalado
if ! command -v git-filter-repo &> /dev/null; then
    echo -e "${YELLOW}⚠️  git-filter-repo não está instalado${NC}"
    echo ""
    echo "Para instalar:"
    echo "  - Ubuntu/Debian: sudo apt-get install git-filter-repo"
    echo "  - macOS: brew install git-filter-repo"
    echo "  - pip: pip3 install git-filter-repo"
    echo ""
    exit 1
fi

# Função para criar backup
create_backup() {
    local backup_dir="../$(basename $(pwd))-backup-$(date +%Y%m%d-%H%M%S)"
    echo -e "${YELLOW}📦 Criando backup em: ${backup_dir}${NC}"
    cp -r . "$backup_dir"
    echo -e "${GREEN}✅ Backup criado com sucesso${NC}"
    echo ""
}

# Função para verificar histórico
check_history() {
    local search_term="$1"
    echo -e "${BLUE}🔍 Verificando histórico para: ${search_term}${NC}"
    
    local count=$(git log --all --full-history --name-only --pretty=format:"" | grep -i "$search_term" | wc -l)
    
    if [ "$count" -gt 0 ]; then
        echo -e "${RED}❌ Encontradas $count ocorrências no histórico${NC}"
        echo ""
        echo "Arquivos encontrados:"
        git log --all --full-history --name-only --pretty=format:"" | grep -i "$search_term" | sort -u
        echo ""
        return 0
    else
        echo -e "${GREEN}✅ Nenhuma ocorrência encontrada no histórico${NC}"
        return 1
    fi
}

# Função para limpar arquivo específico
clean_specific_file() {
    local file="$1"
    
    echo -e "${YELLOW}🧹 Removendo arquivo: ${file}${NC}"
    
    if [ "$DRY_RUN" = true ]; then
        echo -e "${BLUE}[DRY RUN] Comando que seria executado:${NC}"
        echo "git filter-repo --invert-paths --path '$file' --force"
        return 0
    fi
    
    # Executar limpeza
    git filter-repo --invert-paths --path "$file" --force
    
    echo -e "${GREEN}✅ Arquivo removido do histórico${NC}"
}

# Função para limpar por padrão glob
clean_pattern() {
    local pattern="$1"
    
    echo -e "${YELLOW}🧹 Removendo arquivos que correspondem ao padrão: ${pattern}${NC}"
    
    if [ "$DRY_RUN" = true ]; then
        echo -e "${BLUE}[DRY RUN] Comando que seria executado:${NC}"
        echo "git filter-repo --invert-paths --path-glob '$pattern' --force"
        return 0
    fi
    
    # Executar limpeza
    git filter-repo --invert-paths --path-glob "$pattern" --force
    
    echo -e "${GREEN}✅ Padrão removido do histórico${NC}"
}

# Função para limpar credenciais Firebase padrão
clean_default_firebase_credentials() {
    echo -e "${YELLOW}🧹 Removendo padrões padrão de credenciais Firebase...${NC}"
    
    local patterns=(
        "*-firebase-adminsdk-*.json"
        "serviceAccountKey.json"
        "*-adminsdk-*.json"
        "firebase-credentials.json"
        "firebase-service-account.json"
    )
    
    if [ "$DRY_RUN" = true ]; then
        echo -e "${BLUE}[DRY RUN] Comandos que seriam executados:${NC}"
        for pattern in "${patterns[@]}"; do
            echo "git filter-repo --invert-paths --path-glob '$pattern' --force"
        done
        return 0
    fi
    
    # Executar limpeza para cada padrão
    for pattern in "${patterns[@]}"; do
        echo -e "${BLUE}  Processando: ${pattern}${NC}"
        git filter-repo --invert-paths --path-glob "$pattern" --force 2>/dev/null || true
    done
    
    echo -e "${GREEN}✅ Padrões padrão removidos${NC}"
}

# Função para garbage collection
run_garbage_collection() {
    echo -e "${YELLOW}🗑️  Executando garbage collection...${NC}"
    
    if [ "$DRY_RUN" = true ]; then
        echo -e "${BLUE}[DRY RUN] Comandos que seriam executados:${NC}"
        echo "git reflog expire --expire=now --all"
        echo "git gc --prune=now --aggressive"
        return 0
    fi
    
    git reflog expire --expire=now --all
    git gc --prune=now --aggressive
    
    echo -e "${GREEN}✅ Garbage collection concluído${NC}"
}

# Função para verificar pós-limpeza
verify_cleanup() {
    echo -e "${BLUE}🔍 Verificando limpeza...${NC}"
    
    # Verificar por padrões conhecidos
    local found_issues=false
    
    if git log --all --full-history --name-only | grep -qi "firebase-adminsdk"; then
        echo -e "${RED}❌ Ainda existem referências a firebase-adminsdk no histórico${NC}"
        found_issues=true
    fi
    
    if git log --all --full-history --name-only | grep -qi "serviceAccountKey"; then
        echo -e "${RED}❌ Ainda existem referências a serviceAccountKey no histórico${NC}"
        found_issues=true
    fi
    
    if [ "$found_issues" = false ]; then
        echo -e "${GREEN}✅ Nenhum problema encontrado no histórico${NC}"
    fi
    
    # Mostrar estatísticas do repositório
    echo ""
    echo -e "${BLUE}📊 Estatísticas do repositório:${NC}"
    git count-objects -vH
}

# Main execution
main() {
    echo -e "${YELLOW}⚠️  ATENÇÃO: Este script vai reescrever o histórico Git!${NC}"
    echo -e "${YELLOW}⚠️  Todos os colaboradores precisarão re-clonar o repositório!${NC}"
    echo ""
    
    if [ "$DRY_RUN" = true ]; then
        echo -e "${BLUE}🔵 Modo DRY RUN ativado - nenhuma mudança será feita${NC}"
        echo ""
    else
        # Criar backup antes de prosseguir
        create_backup
        
        # Confirmação final
        echo -e "${RED}⚠️  Você está prestes a REESCREVER o histórico Git!${NC}"
        read -p "Digite 'SIM' para continuar (qualquer outra coisa cancela): " confirm
        
        if [ "$confirm" != "SIM" ]; then
            echo -e "${YELLOW}❌ Operação cancelada pelo usuário${NC}"
            exit 0
        fi
        echo ""
    fi
    
    # Executar limpeza baseada nos argumentos
    if [ -n "$SPECIFIC_FILE" ]; then
        # Limpar arquivo específico
        check_history "$SPECIFIC_FILE"
        clean_specific_file "$SPECIFIC_FILE"
        
    elif [ -n "$PATTERN" ]; then
        # Limpar por padrão
        check_history "$PATTERN"
        clean_pattern "$PATTERN"
        
    else
        # Limpar padrões padrão de Firebase
        echo -e "${BLUE}🔍 Verificando padrões de credenciais Firebase...${NC}"
        echo ""
        
        check_history "firebase-adminsdk" || true
        check_history "serviceAccountKey" || true
        
        echo ""
        clean_default_firebase_credentials
    fi
    
    # Garbage collection
    if [ "$DRY_RUN" = false ]; then
        echo ""
        run_garbage_collection
        
        # Verificação pós-limpeza
        echo ""
        verify_cleanup
        
        echo ""
        echo -e "${GREEN}╔══════════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║  ✅ Limpeza concluída com sucesso!                              ║${NC}"
        echo -e "${GREEN}╚══════════════════════════════════════════════════════════════════╝${NC}"
        echo ""
        echo -e "${YELLOW}📌 Próximos passos:${NC}"
        echo "   1. Verifique o histórico: git log --all --oneline"
        echo "   2. Force push: git push origin --force --all"
        echo "   3. Notifique a equipe para re-clonar o repositório"
        echo "   4. Revogue as credenciais comprometidas no Firebase Console"
        echo ""
    else
        echo ""
        echo -e "${BLUE}[DRY RUN] Nenhuma mudança foi feita${NC}"
        echo -e "${BLUE}Execute sem --dry-run para aplicar as mudanças${NC}"
    fi
}

# Trap para cleanup em caso de erro
trap 'echo -e "${RED}❌ Script interrompido!${NC}"; exit 1' INT TERM

# Executar
main

exit 0
