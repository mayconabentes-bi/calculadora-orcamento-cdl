# 🔐 Recomendações Acionáveis - Quick Reference

## ⚡ Validação Rápida (1 Comando)

```bash
npm run validate:all
```

Este comando executa automaticamente todas as validações do protocolo SGQ-SECURITY.

## 📋 Checklist Manual

### ✅ 1. Validação de Acesso
```bash
npm run verify:auth
```
**Esperado**: Passo 7 mostra `✅ Successfully connected to Firebase!`

### ✅ 2. Sincronização de Role
```bash
npm run setup:user
```
**Esperado**: Usuario `mayconabentes@gmail.com` com `role: admin` e `status: ativo`

### ✅ 3. Sanitização de Ambiente
```bash
rm *.json 2>/dev/null || true
rm BASE64_SETUP_INSTRUCTIONS.txt 2>/dev/null || true
```
**Nota**: `package.json` e `package-lock.json` são preservados automaticamente

### ✅ 4. Auditoria SGQ
```bash
node verify-sgq-security.js
```
**Esperado**: `Verificações Passadas: 24/24 (100%)`

### ✅ 5. Backup de Credenciais
Armazene `FIREBASE_PRIVATE_KEY_BASE64` em:
- 1Password / LastPass / Bitwarden
- Azure Key Vault / AWS Secrets Manager / GCP Secret Manager
- GitHub Secrets (para CI/CD)

## 🚨 Troubleshooting

### Erro: `.env file NOT found`
```bash
cp .env.example .env
# Edite .env com suas credenciais do Firebase Console
```

### Erro: `Failed to connect to Firebase`
```bash
# Gere Base64 da private key
node convert-private-key-to-base64.js <arquivo-credenciais.json>

# Cole o resultado em .env como:
FIREBASE_PRIVATE_KEY_BASE64="<string-base64>"
```

### Erro: `User does NOT exist`
```bash
npm run setup:user
```

## 📚 Documentação Completa

Para detalhes completos, consulte:
- **[RECOMENDACOES_ACIONAVEIS.md](./RECOMENDACOES_ACIONAVEIS.md)** - Guia completo
- **[ENVIRONMENT_VARIABLES_GUIDE.md](./ENVIRONMENT_VARIABLES_GUIDE.md)** - Configuração
- **[SECURITY_README.md](./SECURITY_README.md)** - Hub de segurança

## 🔄 Rotação de Credenciais

**Frequência recomendada**: Trimestral

```bash
# 1. Gerar nova service account no Firebase Console
# 2. Gerar Base64
node convert-private-key-to-base64.js nova-credencial.json

# 3. Atualizar .env
# 4. Validar
npm run verify:auth

# 5. Sanitizar
rm nova-credencial.json

# 6. Revogar antiga no Firebase Console
```

## 🎯 Conformidade Zero Trust

✅ Credenciais em variáveis de ambiente  
✅ Nenhum arquivo JSON commitado  
✅ Auditoria com logs timestamped  
✅ RBAC operacional  
✅ Backup em gerenciador seguro  

---

**Versão**: SGQ-SECURITY v5.1.0  
**Última atualização**: 2026-01-05
