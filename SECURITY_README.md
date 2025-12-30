# Guia de Segurança - Axioma CDL Manaus

## 🔒 Visão Geral

Este documento fornece informações essenciais sobre segurança e gerenciamento de credenciais para o projeto Axioma CDL Manaus.

## ⚠️ IMPORTANTE: Proteção de Credenciais

### O que NUNCA fazer:
- ❌ **NUNCA** commite arquivos `.json` com credenciais Firebase no Git
- ❌ **NUNCA** compartilhe chaves privadas via email, Slack ou qualquer meio não seguro
- ❌ **NUNCA** inclua credenciais em código-fonte
- ❌ **NUNCA** use `--no-verify` para ignorar hooks de segurança sem revisão prévia

### O que SEMPRE fazer:
- ✅ **SEMPRE** use variáveis de ambiente para credenciais
- ✅ **SEMPRE** verifique se `.env` está no `.gitignore`
- ✅ **SEMPRE** use `.env.example` como template (sem valores reais)
- ✅ **SEMPRE** rotacione credenciais trimestralmente
- ✅ **SEMPRE** revogue credenciais antigas imediatamente

## 🛡️ Arquivos Protegidos pelo .gitignore

O `.gitignore` está configurado para prevenir commit acidental de:

### Firebase Credentials
```
serviceAccountKey.json
*-firebase-adminsdk-*.json
*-adminsdk-*.json
firebase-credentials.json
```

### Environment Variables
```
.env
.env.local
.env.production
.env.*
```

### API Keys e Secrets
```
*.pem
*.key
credentials.json
secret.txt
api-key.txt
```

## 📚 Documentação de Segurança

### Guias Principais

1. **[SECURITY_REMEDIATION_GUIDE.md](./SECURITY_REMEDIATION_GUIDE.md)**
   - Procedimentos de resposta a incidentes
   - Comandos para limpeza de histórico Git
   - Revogação de credenciais comprometidas

2. **[ENVIRONMENT_VARIABLES_GUIDE.md](./ENVIRONMENT_VARIABLES_GUIDE.md)**
   - Migração de chaves JSON para variáveis de ambiente
   - Configuração de ambientes (dev, staging, prod)
   - Exemplos de código seguro

3. **[SECURITY_COMPLIANCE_CHECKLIST.md](./SECURITY_COMPLIANCE_CHECKLIST.md)**
   - Checklist completo de conformidade SGQ
   - Métricas de segurança
   - Procedimentos de auditoria

### Scripts de Segurança

1. **`git-clean-credentials.sh`**
   - Remove credenciais do histórico Git
   - Suporta git-filter-repo e BFG Repo-Cleaner
   - Modo dry-run para testes seguros
   
   ```bash
   # Teste sem modificar o repositório
   ./git-clean-credentials.sh --dry-run
   
   # Remover arquivo específico
   ./git-clean-credentials.sh --specific-file serviceAccountKey.json
   
   # Remover por padrão
   ./git-clean-credentials.sh --pattern '*-adminsdk-*.json'
   ```

2. **`pre-commit-credential-check.sh`**
   - Hook de pre-commit para prevenir commits de credenciais
   - Detecta arquivos e padrões proibidos
   - Bloqueia commits suspeitos automaticamente
   
   ```bash
   # Instalar o hook
   cp pre-commit-credential-check.sh .git/hooks/pre-commit
   chmod +x .git/hooks/pre-commit
   ```

## 🚀 Quick Start: Configuração Segura

### 1. Configurar Variáveis de Ambiente

```bash
# Copiar template
cp .env.example .env

# Editar com suas credenciais reais (use editor seguro)
nano .env  # ou vim .env

# NUNCA commite .env!
git status  # .env não deve aparecer aqui
```

### 2. Instalar Hooks de Segurança

```bash
# Instalar pre-commit hook
cp pre-commit-credential-check.sh .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit

# Testar o hook
echo "test" > serviceAccountKey.json
git add serviceAccountKey.json
git commit -m "test"  # Deve ser BLOQUEADO
rm serviceAccountKey.json
```

### 3. Verificar Configuração

```bash
# Instalar dependências
npm install

# Verificar setup de autenticação
npm run verify:auth

# Se tudo estiver OK, criar usuário
npm run setup:user
```

## 🔍 Ferramentas de Segurança

### git-secrets
Previne commits de secrets conhecidos (AWS, GCP, etc.)

```bash
# Instalar
brew install git-secrets  # macOS
sudo apt-get install git-secrets  # Ubuntu

# Configurar
git secrets --install
git secrets --register-aws
git secrets --register-gcp

# Escanear histórico
git secrets --scan-history
```

### gitleaks
Detecta secrets em repositórios

```bash
# Executar com Docker
docker run -v $(pwd):/path ghcr.io/gitleaks/gitleaks:latest detect --source="/path" -v

# Escanear apenas arquivos staged
gitleaks protect --staged
```

### truffleHog
Encontra secrets em histórico Git

```bash
# Executar com Docker
docker run -v $(pwd):/proj trufflesecurity/trufflehog:latest git file:///proj

# Escanear desde commit específico
trufflehog git file://. --since-commit HEAD~10
```

## 🔄 Rotação de Credenciais

### Frequência Recomendada
- **Desenvolvimento**: Trimestral (3 meses)
- **Produção**: Mensal ou Trimestral
- **Pós-Incidente**: Imediato

### Procedimento de Rotação

1. **Gerar nova credencial**
   - Firebase Console → Service Accounts → Generate New Private Key
   
2. **Atualizar .env local**
   ```bash
   # Backup da credencial antiga
   cp .env .env.backup
   
   # Atualizar com nova credencial
   nano .env
   ```

3. **Testar nova credencial**
   ```bash
   npm run verify:auth
   ```

4. **Atualizar ambientes**
   - GitHub Actions: Repository Settings → Secrets
   - Produção: Cloud Secret Manager
   
5. **Revogar credencial antiga**
   - Firebase Console → Service Accounts → Delete Old Key
   
6. **Documentar rotação**
   - Atualizar SECURITY_COMPLIANCE_CHECKLIST.md
   - Registrar data no log de auditoria

## 🚨 Resposta a Incidentes

### Se você acidentalmente commitou uma credencial:

1. **NÃO PANIC** - Mas aja rapidamente!

2. **Revogue imediatamente** a credencial no Firebase Console

3. **Execute limpeza do histórico**
   ```bash
   # Usar o script fornecido
   ./git-clean-credentials.sh --specific-file nome-do-arquivo.json
   ```

4. **Force push** (após aprovação do líder técnico)
   ```bash
   git push origin --force --all
   ```

5. **Notifique a equipe** para re-clonar o repositório

6. **Preencha relatório** de incidente (SECURITY_COMPLIANCE_CHECKLIST.md)

7. **Consulte documentação completa**: SECURITY_REMEDIATION_GUIDE.md

## 📊 Conformidade e Auditoria

### Checklist Mensal
- [ ] Verificar logs de autenticação Firebase
- [ ] Revisar custos e uso do Firestore
- [ ] Executar scan de segurança (gitleaks)
- [ ] Verificar .gitignore atualizado
- [ ] Revisar permissões de service accounts

### Checklist Trimestral
- [ ] Rotacionar credenciais de desenvolvimento
- [ ] Auditoria completa de segurança
- [ ] Treinamento da equipe sobre segurança
- [ ] Revisar e atualizar documentação
- [ ] Teste de recuperação de incidente (drill)

### Checklist Anual
- [ ] Revisão completa de políticas de segurança
- [ ] Atualização de dependências (npm audit)
- [ ] Revisão de conformidade SGQ
- [ ] Plano de continuidade de negócios
- [ ] Certificação de treinamento da equipe

## 📞 Contatos de Segurança

### Interno
- **Líder Técnico**: [adicionar contato]
- **DevOps Lead**: [adicionar contato]
- **Gestor de Segurança**: [adicionar contato]

### Externo
- **Firebase Support**: https://firebase.google.com/support
- **GitHub Security**: https://github.com/security
- **CERT.br**: cert@cert.br | +55 11 5509-3500

## 📖 Recursos Adicionais

### Firebase Security
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Authentication Best Practices](https://firebase.google.com/docs/auth/admin/best-practices)
- [Firestore Security](https://firebase.google.com/docs/firestore/security/overview)

### Geral
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [12 Factor App - Config](https://12factor.net/config)
- [Git Security Best Practices](https://git-scm.com/book/en/v2/Git-Tools-Credential-Storage)

## 🎯 Princípios de Segurança

1. **Zero Trust**: Nunca confie, sempre verifique
2. **Least Privilege**: Mínimo privilégio necessário
3. **Defense in Depth**: Múltiplas camadas de segurança
4. **Fail Secure**: Falhar de forma segura
5. **Keep it Simple**: Simplicidade é segurança

---

**Última Atualização**: 2025-12-30  
**Versão**: 1.0  
**Classificação**: INTERNO

Para dúvidas ou suporte, consulte os guias detalhados listados acima ou contate o time de segurança.
