# Checklist de Segurança - Conformidade SGQ (Sistemas de Gestão da Qualidade)

## 📋 Status da Remediação

Data de Início: **2025-12-30**  
Incidente: **Exposição de Chave Firebase Service Account**  
Arquivo Comprometido: `axioma-cdl-manaus-firebase-adminsdk-fbsvc-586ddd7211.json`  
Severidade: **CRÍTICA** 🔴

---

## 🚨 Fase 1: Resposta Imediata ao Incidente

### 1.1 Contenção
- [ ] **[URGENTE]** Revogar chave comprometida no Firebase Console
  - Ação: Project Settings → Service Accounts → Delete key
  - Prazo: Imediato (0-15 minutos)
  - Responsável: _______________
  - Data/Hora: _______________

- [ ] Gerar nova chave de serviço com nome diferente
  - Ação: Generate new private key
  - Armazenar de forma segura (NÃO commitar)
  - Data/Hora: _______________

- [ ] Verificar logs de auditoria do Firebase
  - Ação: Console → Authentication → Users (verificar criações suspeitas)
  - Ação: Firestore → Usage (verificar picos anormais)
  - Encontradas anomalias? [ ] Sim [ ] Não
  - Descrição: _______________________________
  - Data/Hora: _______________

### 1.2 Análise de Impacto
- [ ] Identificar período de exposição
  - Data do commit inicial: _______________
  - Data de descoberta: _______________
  - Tempo de exposição: _______________ (dias/horas)

- [ ] Analisar tráfego suspeito
  - [ ] Firebase Authentication logs
  - [ ] Firestore Database access logs
  - [ ] Cloud Functions invocations (se aplicável)
  - [ ] Billing/Usage spikes

- [ ] Documentar escopo do impacto
  - Dados acessados: [ ] Sim [ ] Não [ ] Desconhecido
  - Usuários afetados: _______________
  - Transações comprometidas: _______________

---

## 🧹 Fase 2: Limpeza e Remediação

### 2.1 Remoção do Working Directory
- [ ] Remover arquivo do diretório de trabalho
  ```bash
  rm -f axioma-cdl-manaus-firebase-adminsdk-fbsvc-586ddd7211.json
  ```
  - Executado por: _______________
  - Data/Hora: _______________

- [ ] Verificar ausência de outros arquivos de credenciais
  ```bash
  find . -name "*firebase-adminsdk*.json"
  find . -name "serviceAccountKey*.json"
  ```
  - Arquivos encontrados: _______________
  - Data/Hora: _______________

### 2.2 Limpeza do Histórico Git
- [ ] Fazer backup do repositório
  ```bash
  cp -r calculadora-orcamento-cdl calculadora-orcamento-cdl-backup
  ```
  - Localização do backup: _______________
  - Data/Hora: _______________

- [ ] Instalar git-filter-repo ou BFG Repo-Cleaner
  - [ ] git-filter-repo instalado
  - [ ] BFG Repo-Cleaner instalado (alternativa)
  - Data/Hora: _______________

- [ ] Executar limpeza com git-filter-repo
  ```bash
  git filter-repo --invert-paths \
    --path axioma-cdl-manaus-firebase-adminsdk-fbsvc-586ddd7211.json \
    --force
  ```
  - Executado por: _______________
  - Data/Hora: _______________

- [ ] Executar limpeza de padrões genéricos
  ```bash
  git filter-repo --invert-paths \
    --path-glob '*-firebase-adminsdk-*.json' \
    --path serviceAccountKey.json \
    --force
  ```
  - Executado por: _______________
  - Data/Hora: _______________

- [ ] Executar garbage collection
  ```bash
  git reflog expire --expire=now --all
  git gc --prune=now --aggressive
  ```
  - Executado por: _______________
  - Data/Hora: _______________

### 2.3 Verificação da Limpeza
- [ ] Verificar histórico limpo
  ```bash
  git log --all --full-history --name-only | grep -i "firebase-adminsdk"
  git log --all --full-history --name-only | grep -i "serviceAccountKey"
  ```
  - Resultado: [ ] Limpo [ ] Ainda há referências
  - Data/Hora: _______________

- [ ] Verificar objetos Git
  ```bash
  git rev-list --all --objects | grep -i "firebase"
  git count-objects -vH
  ```
  - Tamanho antes: _______________ MB
  - Tamanho depois: _______________ MB
  - Redução: _______________ MB
  - Data/Hora: _______________

### 2.4 Force Push e Sincronização
- [ ] Notificar TODA a equipe sobre reescrita de histórico
  - [ ] Email enviado
  - [ ] Slack/Teams notificado
  - [ ] Documentação atualizada
  - Data/Hora: _______________

- [ ] Executar force push
  ```bash
  git push origin --force --all
  git push origin --force --tags
  ```
  - Executado por: _______________
  - Data/Hora: _______________
  - ⚠️ Confirmado com líder técnico: [ ] Sim [ ] Não

- [ ] Verificar sincronização remota
  - Executado por: _______________
  - Data/Hora: _______________

---

## 🔒 Fase 3: Arquitetura Zero Trust

### 3.1 Configuração de Variáveis de Ambiente
- [ ] Atualizar `.gitignore` com padrões de segurança
  - Padrões adicionados: _______________
  - Data/Hora: _______________

- [ ] Criar arquivo `.env.example`
  - [ ] Template criado
  - [ ] Sem valores sensíveis
  - [ ] Commitado no repositório
  - Data/Hora: _______________

- [ ] Configurar arquivo `.env` local (não commitado)
  - [ ] Criado por cada desenvolvedor
  - [ ] Valores reais configurados
  - [ ] Testado com sucesso
  - Data/Hora: _______________

### 3.2 Migração de Scripts
- [ ] Instalar dependência `dotenv`
  ```bash
  npm install dotenv --save
  ```
  - Data/Hora: _______________

- [ ] Migrar `setup-developer-user.js`
  - [ ] Código atualizado para usar process.env
  - [ ] Testado com sucesso
  - [ ] Documentação atualizada
  - Data/Hora: _______________

- [ ] Migrar `verify-auth-setup.js`
  - [ ] Código atualizado para usar process.env
  - [ ] Testado com sucesso
  - [ ] Documentação atualizada
  - Data/Hora: _______________

### 3.3 Configuração de Ambientes
- [ ] Configurar secrets no GitHub Actions
  - [ ] FIREBASE_PROJECT_ID
  - [ ] FIREBASE_PRIVATE_KEY
  - [ ] FIREBASE_CLIENT_EMAIL
  - Data/Hora: _______________

- [ ] Configurar variáveis em ambiente de produção
  - [ ] Cloud Run / App Engine configurado
  - [ ] Secret Manager utilizado
  - [ ] Testado com sucesso
  - Data/Hora: _______________

---

## 🛡️ Fase 4: Prevenção e Monitoramento

### 4.1 Git Hooks
- [ ] Instalar pre-commit hook
  ```bash
  cp pre-commit-credential-check.sh .git/hooks/pre-commit
  chmod +x .git/hooks/pre-commit
  ```
  - Instalado por: _______________
  - Data/Hora: _______________

- [ ] Testar pre-commit hook
  - [ ] Testado com arquivo proibido (deve bloquear)
  - [ ] Testado com arquivo permitido (deve passar)
  - Data/Hora: _______________

### 4.2 Ferramentas de Segurança
- [ ] Configurar git-secrets
  ```bash
  git secrets --install
  git secrets --register-aws
  git secrets --register-gcp
  ```
  - Data/Hora: _______________

- [ ] Executar scan com gitleaks
  ```bash
  docker run -v $(pwd):/path ghcr.io/gitleaks/gitleaks:latest detect
  ```
  - Vulnerabilidades encontradas: _______________
  - Data/Hora: _______________

- [ ] Executar scan com truffleHog
  ```bash
  docker run trufflesecurity/trufflehog:latest git file:///path
  ```
  - Vulnerabilidades encontradas: _______________
  - Data/Hora: _______________

### 4.3 Monitoramento Contínuo
- [ ] Configurar alertas de custo no Firebase
  - Threshold: R$ _______________
  - Email de alerta: _______________
  - Data/Hora: _______________

- [ ] Configurar alertas de uso do Firestore
  - Reads/day threshold: _______________
  - Writes/day threshold: _______________
  - Data/Hora: _______________

- [ ] Habilitar auditoria de autenticação
  - [ ] Cloud Logging habilitado
  - [ ] Alertas configurados
  - Data/Hora: _______________

---

## 📚 Fase 5: Documentação e Treinamento

### 5.1 Documentação Criada
- [ ] `SECURITY_REMEDIATION_GUIDE.md`
  - Status: [ ] Criado [ ] Revisado [ ] Aprovado
  - Data: _______________

- [ ] `ENVIRONMENT_VARIABLES_GUIDE.md`
  - Status: [ ] Criado [ ] Revisado [ ] Aprovado
  - Data: _______________

- [ ] `.env.example`
  - Status: [ ] Criado [ ] Revisado [ ] Aprovado
  - Data: _______________

- [ ] `git-clean-credentials.sh`
  - Status: [ ] Criado [ ] Testado [ ] Documentado
  - Data: _______________

- [ ] `pre-commit-credential-check.sh`
  - Status: [ ] Criado [ ] Testado [ ] Documentado
  - Data: _______________

### 5.2 Treinamento da Equipe
- [ ] Sessão de treinamento sobre segurança de credenciais
  - Data: _______________
  - Participantes: _______________
  - Duração: _______________ minutos

- [ ] Distribuição de guias de segurança
  - [ ] Email enviado
  - [ ] Documentos compartilhados
  - Data: _______________

- [ ] Quiz de verificação de conhecimento
  - [ ] Criado
  - [ ] Aplicado
  - Taxa de aprovação: ___________%
  - Data: _______________

---

## 🔍 Fase 6: Auditoria e Conformidade

### 6.1 Auditoria Técnica
- [ ] Revisar todos os commits recentes (últimos 30 dias)
  - Commits revisados: _______________
  - Problemas encontrados: _______________
  - Data/Hora: _______________

- [ ] Scan completo do repositório
  - [ ] git-secrets executado
  - [ ] gitleaks executado
  - [ ] truffleHog executado
  - [ ] Scan manual realizado
  - Data/Hora: _______________

- [ ] Revisão de permissões Firebase
  - [ ] Service accounts auditadas
  - [ ] IAM roles revisadas
  - [ ] Princípio do menor privilégio aplicado
  - Data/Hora: _______________

### 6.2 Conformidade SGQ
- [ ] Relatório de incidente criado
  - Número do incidente: _______________
  - Severidade: [ ] Baixa [ ] Média [ ] Alta [ ] Crítica
  - Data: _______________

- [ ] Análise de causa raiz (RCA)
  - Causa imediata: _______________
  - Causa raiz: _______________
  - Ações corretivas: _______________
  - Data: _______________

- [ ] Plano de ação preventiva
  - [ ] Documentado
  - [ ] Aprovado pela gestão
  - [ ] Cronograma definido
  - Data: _______________

### 6.3 Evidências de Conformidade
- [ ] Screenshots do Firebase Console (chave revogada)
  - Anexo: _______________
  - Data: _______________

- [ ] Logs de execução de comandos Git
  - Anexo: _______________
  - Data: _______________

- [ ] Confirmação de force push
  - Anexo: _______________
  - Data: _______________

- [ ] Resultados de scans de segurança
  - Anexo: _______________
  - Data: _______________

---

## ✅ Aprovações Finais

### Técnica
- [ ] Aprovado pelo Líder Técnico
  - Nome: _______________
  - Assinatura: _______________
  - Data: _______________

- [ ] Aprovado pelo DevOps Lead
  - Nome: _______________
  - Assinatura: _______________
  - Data: _______________

### Gestão
- [ ] Aprovado pelo Gestor de Segurança
  - Nome: _______________
  - Assinatura: _______________
  - Data: _______________

- [ ] Aprovado pelo Superintendente
  - Nome: _______________
  - Assinatura: _______________
  - Data: _______________

---

## 📊 Métricas de Remediação

| Métrica | Valor | Status |
|---------|-------|--------|
| Tempo de detecção (desde exposição) | ___ dias | [ ] Bom [ ] Aceitável [ ] Crítico |
| Tempo de contenção (desde detecção) | ___ horas | [ ] Bom [ ] Aceitável [ ] Crítico |
| Tempo total de remediação | ___ dias | [ ] Bom [ ] Aceitável [ ] Crítico |
| Commits afetados | ___ | N/A |
| Tamanho de repositório reduzido | ___ MB | [ ] Significativo [ ] Moderado [ ] Mínimo |
| Vulnerabilidades encontradas (scan) | ___ | [ ] Zero [ ] Baixo [ ] Alto |
| Taxa de conformidade pós-remediação | ___% | [ ] >95% [ ] >80% [ ] <80% |

---

## 🔄 Rotação Regular de Credenciais

### Política de Rotação
- [ ] Definir frequência de rotação
  - Recomendado: **Trimestral**
  - Definido: _______________ (dias)

- [ ] Criar processo de rotação
  - [ ] Documentado
  - [ ] Automatizado (se possível)
  - [ ] Testado

- [ ] Agendar próxima rotação
  - Data agendada: _______________
  - Responsável: _______________

---

## 📞 Contatos de Emergência

| Função | Nome | Email | Telefone |
|--------|------|-------|----------|
| Líder Técnico | ___ | ___ | ___ |
| DevOps Lead | ___ | ___ | ___ |
| Gestor de Segurança | ___ | ___ | ___ |
| Firebase Support | - | support@firebase.google.com | - |
| CERT.br | - | cert@cert.br | +55 11 5509-3500 |

---

## 📝 Notas Adicionais

```
_______________________________________________________________________________
_______________________________________________________________________________
_______________________________________________________________________________
_______________________________________________________________________________
_______________________________________________________________________________
```

---

**Última Atualização**: 2025-12-30  
**Versão do Documento**: 1.0  
**Classificação**: CONFIDENCIAL - USO INTERNO  
**Retenção**: 7 anos (conformidade SGQ)
