# Guia Rápido: Registo de Utilizadores CDL Manaus

## 🎯 Objetivo
Criar contas para os 3 utilizadores da equipa CDL Manaus que apresentavam erros de autenticação.

## ⚡ Execução Rápida (2 minutos)

### Passo 1: Verificar Ambiente
```bash
npm run verify:auth
```

Se houver erros, configure o `.env`:
```bash
cp .env.example .env
# Edite o .env com suas credenciais Firebase
```

### Passo 2: Criar Utilizadores
```bash
npm run setup:users
```

### Passo 3: Validar
Procure no console por:
```
[SGQ-SECURITY] Status: OPERAÇÃO CONCLUÍDA
✅ Processo de registo concluído com sucesso!
```

## 👥 Utilizadores Criados

| Email | Nome | Role | Senha Temporária |
|-------|------|------|------------------|
| manuel.joaquim@cdlmanaus.org.br | Manuel Joaquim | admin | Cdl@Manaus2026 |
| josiane.oliveira@cdlmanaus.org.br | Josiane Oliveira | user | Cdl@Manaus2026 |
| lidiane.cabral@cdlmanaus.org.br | Lidiane Cabral | user | Cdl@Manaus2026 |

## ⚠️ Atenção Importante

1. **Senha Temporária:** Todos devem alterar a senha `Cdl@Manaus2026` no primeiro acesso
2. **Status:** Todos criados com status 'ativo'
3. **Idempotente:** Pode executar várias vezes sem duplicar utilizadores

## 🔧 Resolução de Problemas

### Erro: "Variáveis de ambiente não configuradas"
**Solução:** Configure o `.env` conforme Passo 1

### Erro: "Firebase Admin initialization failed"
**Solução:** Verifique as credenciais no `.env`

### Mensagem: "⚠️ já existe no Auth"
**Comportamento Normal:** O script detectou utilizador existente e apenas atualizou metadados

## 📚 Documentação Completa
Para detalhes completos, consulte: **[SETUP_USERS_CDL.md](./SETUP_USERS_CDL.md)**

## 🎉 Próximos Passos

Após execução bem-sucedida:

1. ✅ Testar login de um dos utilizadores em `index.html`
2. ✅ Confirmar redirecionamento para dashboard apropriado
3. ✅ Informar utilizadores para alterarem a senha
4. ✅ Verificar logs SGQ-SECURITY para auditoria

---

**Script:** `setup-users-cdl.js`  
**Comando:** `npm run setup:users`  
**Versão:** 5.1.0 - SGQ-SECURITY
