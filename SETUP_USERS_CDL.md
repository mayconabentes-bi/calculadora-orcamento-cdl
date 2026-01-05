# Guia de Registo em Massa de Utilizadores CDL Manaus

**Versão:** 5.1.0  
**Arquitetura:** Zero Trust - Axioma CDL/Manaus  
**Data:** 2026-01-05  
**Conformidade:** SGQ-SECURITY v5.1.0

## 📋 Contexto

Este documento descreve o procedimento para registo em massa de utilizadores no sistema Axioma: Inteligência de Margem da CDL Manaus. O script `setup-users-cdl.js` permite criar múltiplos utilizadores de forma automatizada, seguindo rigorosamente os padrões de segurança Zero Trust e auditoria SGQ-SECURITY.

## 🎯 Objetivo

Facilitar o registo inicial de utilizadores da equipa CDL Manaus, garantindo:
- Criação automática no Firebase Authentication
- Sincronização de metadados no Firestore
- Auditoria completa de todas as operações
- Conformidade com padrões de segurança

## 👥 Utilizadores Incluídos

O script cria os seguintes utilizadores:

| Nome | Email | Role | Status |
|------|-------|------|--------|
| Manuel Joaquim | manuel.joaquim@cdlmanaus.org.br | admin | ativo |
| Josiane Oliveira | josiane.oliveira@cdlmanaus.org.br | user | ativo |
| Lidiane Cabral | lidiane.cabral@cdlmanaus.org.br | user | ativo |

### Credenciais Temporárias

**Senha padrão para todos os utilizadores:** `Cdl@Manaus2026`

⚠️ **ATENÇÃO DE SEGURANÇA:**
- Esta é uma **senha temporária** definida no código do script
- Todos os utilizadores **DEVEM** alterá-la no primeiro acesso ao sistema
- Execute o script apenas em ambiente seguro/controlado
- Os logs do script contêm a senha temporária - proteja a saída do console
- Não partilhe logs do script através de canais não seguros
- Considere alterar a senha no código se executar em ambiente de produção

## 🔒 Requisitos de Segurança

### Pré-requisitos

1. **Ambiente Node.js configurado**
   - Node.js versão 14 ou superior
   - npm instalado

2. **Dependências instaladas**
   ```bash
   npm install firebase-admin dotenv
   ```

3. **Arquivo .env configurado**
   - Copiar template: `cp .env.example .env`
   - Configurar credenciais Firebase Admin
   - Variáveis obrigatórias:
     - `FIREBASE_PROJECT_ID`
     - `FIREBASE_CLIENT_EMAIL`
     - `FIREBASE_PRIVATE_KEY_BASE64` (recomendado) ou `FIREBASE_PRIVATE_KEY`

### Arquitetura Zero Trust

O script segue os princípios de segurança Zero Trust:

✅ **Credenciais apenas via variáveis de ambiente** (nunca arquivos JSON)  
✅ **Auditoria completa SGQ-SECURITY** com timestamps ISO 8601  
✅ **Validação rigorosa de permissões** antes de qualquer operação  
✅ **Sincronização obrigatória** entre Authentication e Firestore  
✅ **Status 'ativo' por padrão** para utilizadores criados  

## 🚀 Instruções de Execução

### Passo 1: Verificar Configuração

Antes de executar o script, verifique se o ambiente está configurado corretamente:

```bash
npm run verify:auth
```

Este comando valida:
- Existência do arquivo .env
- Presença de variáveis obrigatórias
- Conexão com Firebase
- Permissões do service account

### Passo 2: Executar o Script de Registo

Execute o script de registo em massa:

```bash
npm run setup:users
```

Ou diretamente:

```bash
node setup-users-cdl.js
```

### Passo 3: Validar Criação

O script exibirá logs detalhados de cada operação. Exemplo de saída esperada:

```
[SGQ-SECURITY] 2026-01-05T17:30:00.000Z - Script de Registo Multi-Utilizador iniciado
[SGQ-SECURITY] 2026-01-05T17:30:00.100Z - ✅ Firebase Admin Inicializado
   Project: axioma-cdl-manaus
   Service Account: firebase-adminsdk@axioma-cdl-manaus.iam.gserviceaccount.com

[SGQ-SECURITY] 2026-01-05T17:30:00.200Z - Iniciar Processamento de 3 utilizadores...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[SGQ-SECURITY] 2026-01-05T17:30:00.300Z - Processando: Manuel Joaquim (manuel.joaquim@cdlmanaus.org.br)
[SGQ-SECURITY] Role: admin

[SGQ-SECURITY] 2026-01-05T17:30:01.000Z - ✅ manuel.joaquim@cdlmanaus.org.br criado no Auth.
[SGQ-SECURITY] UID gerado: abc123xyz789...
[SGQ-SECURITY] 2026-01-05T17:30:01.200Z - ✅ Metadados sincronizados no Firestore para: Manuel Joaquim
```

## 📊 Comportamento do Script

### Operação Idempotente

O script é **idempotente**, ou seja, pode ser executado múltiplas vezes sem causar duplicações:

- **Se o utilizador NÃO existe no Auth:**
  - Cria novo utilizador no Firebase Authentication
  - Define senha temporária padrão
  - Cria documento no Firestore

- **Se o utilizador JÁ existe no Auth:**
  - Não recria o utilizador
  - Atualiza/sincroniza metadados no Firestore
  - Mantém senha existente (não altera)

### Campos Criados no Firestore

Cada documento na coleção `usuarios` contém:

```javascript
{
  email: "usuario@cdlmanaus.org.br",
  nome: "Nome Completo",
  role: "admin" | "user",
  status: "ativo",
  updatedAt: "2026-01-05T17:30:00.000Z"
}
```

### Auditoria SGQ-SECURITY

Todas as operações são registadas com o prefixo `[SGQ-SECURITY]` e incluem:
- Timestamp ISO 8601
- UID do utilizador
- Email processado
- Role atribuída
- Status da operação (sucesso/falha)

## 🔧 Resolução de Problemas

### Erro: Variáveis de ambiente não configuradas

**Sintoma:**
```
[SGQ-SECURITY] ❌ ERRO CRÍTICO: Variáveis de ambiente obrigatórias não configuradas
```

**Solução:**
1. Verifique se o arquivo .env existe: `ls -la .env`
2. Se não existir: `cp .env.example .env`
3. Edite o .env com suas credenciais do Firebase Console
4. Para Base64: `node convert-private-key-to-base64.js`

### Erro: Falha na inicialização do Firebase

**Sintoma:**
```
[SGQ-SECURITY] ❌ Erro na inicialização: Error decoding Base64
```

**Solução:**
1. Verifique o formato da `FIREBASE_PRIVATE_KEY_BASE64`
2. Regenere a chave: `node convert-private-key-to-base64.js`
3. Confirme que não há espaços ou quebras de linha inválidas

### Erro: auth/email-already-exists

**Sintoma:**
```
[SGQ-SECURITY] ⚠️ manuel.joaquim@cdlmanaus.org.br já existe no Auth.
```

**Comportamento Esperado:**
Isto **não é um erro**. O script detecta utilizadores existentes e apenas atualiza os metadados no Firestore, mantendo a senha existente.

### Erro: auth/invalid-password

**Sintoma:**
```
[SGQ-SECURITY] Diagnóstico: Senha não atende requisitos mínimos
```

**Solução:**
A senha deve ter no mínimo 6 caracteres. A senha padrão `Cdl@Manaus2026` já atende este requisito.

### Erro: Permission denied (Firestore)

**Sintoma:**
```
Error: Missing or insufficient permissions
```

**Solução:**
1. Verifique as regras de segurança do Firestore
2. Confirme que o service account tem permissões adequadas
3. No Firebase Console → Firestore → Rules, valide as regras de acesso

## 🎯 Próximos Passos

Após executar o script com sucesso:

### 1. Validar Autenticação

Execute o script de verificação:

```bash
npm run verify:auth
```

### 2. Informar os Utilizadores

Envie as credenciais de forma segura aos utilizadores:

**Para: Manuel Joaquim**
```
Email: manuel.joaquim@cdlmanaus.org.br
Senha temporária: Cdl@Manaus2026
Role: Administrador
URL: https://seu-dominio.com/index.html

IMPORTANTE: Altere sua senha no primeiro acesso!
```

### 3. Testar Primeiro Acesso

1. Aceder ao `index.html` no navegador
2. Fazer login com as credenciais fornecidas
3. O sistema deve redirecionar para o dashboard apropriado:
   - Admin → `dashboard-admin.html`
   - User → área de utilizador

### 4. Alterar Senha Temporária

Cada utilizador deve:
1. Fazer login com a senha temporária
2. Aceder às configurações de perfil
3. Alterar a senha para uma pessoal e segura

## 📚 Documentação Relacionada

- **ENVIRONMENT_VARIABLES_GUIDE.md** - Configuração de variáveis de ambiente
- **AUTHENTICATION_GUIDE.md** - Sistema de autenticação completo
- **SETUP_CREDENCIAL_DESENVOLVEDOR.md** - Configuração de credenciais
- **SECURITY_REMEDIATION_GUIDE.md** - Práticas de segurança
- **FALLBACK_MANUAL_USER_CREATION.md** - Criação manual de utilizadores

## 🔐 Boas Práticas de Segurança

### Gestão de Senhas

✅ **Faça:**
- Use senhas temporárias fortes e únicas
- Instrua os utilizadores a alterarem a senha no primeiro acesso
- Implemente política de rotação de senhas (recomendado: trimestral)

❌ **Não Faça:**
- Compartilhar senhas via canais não seguros (WhatsApp, email não criptografado)
- Reutilizar senhas entre ambientes (dev/staging/prod)
- Manter senhas temporárias por tempo indefinido

### Gestão de Roles

- **admin**: Acesso total ao sistema, incluindo dashboard administrativo
- **user**: Acesso a funcionalidades de utilizador padrão
- **superintendente**: (Futuro) Acesso a relatórios executivos

### Auditoria

Todos os acessos são registados com:
- Timestamp de login
- Email do utilizador
- UID único
- Role atribuída
- Status da autenticação

Verifique os logs regularmente para identificar:
- Tentativas de acesso não autorizadas
- Padrões de uso anómalos
- Necessidades de suporte

## ✅ Checklist de Validação

Use esta checklist para confirmar que o registo foi bem-sucedido:

- [ ] Script executado sem erros críticos
- [ ] 3 utilizadores processados (Manuel, Josiane, Lidiane)
- [ ] Logs SGQ-SECURITY exibidos para cada utilizador
- [ ] UID gerado para cada utilizador novo
- [ ] Metadados sincronizados no Firestore
- [ ] Status 'ativo' confirmado para todos
- [ ] `npm run verify:auth` executado com sucesso
- [ ] Credenciais enviadas de forma segura aos utilizadores
- [ ] Primeiro acesso testado para pelo menos um utilizador
- [ ] Utilizadores instruídos a alterar senha temporária

## 🎓 Implicações Estratégicas

### Eficiência Operacional

A transição de um setup individual para um sistema de registo em massa aumenta significativamente a **Eficiência Operacional** da CDL Manaus:

- **Redução de tempo**: De ~15 minutos por utilizador para ~2 minutos totais
- **Redução de erros**: Automatização elimina erros de digitação manual
- **Escalabilidade**: Fácil adicionar novos utilizadores editando o array

### Análise Porter (5 Forças)

- **Poder de Barganha dos Fornecedores**: Redução da dependência de suporte técnico manual
- **Ameaça de Novos Entrantes**: Sistema facilita onboarding rápido de novos talentos

### Matriz BCG

A gestão de utilizadores deixa de ser uma "Interrogação" e passa a ser uma **"Estrela"** da infraestrutura, garantindo que novos talentos entrem no ecossistema com zero fricção técnica.

## 📞 Suporte

Para dúvidas ou problemas:

1. Consulte a documentação relacionada (links acima)
2. Verifique os logs SGQ-SECURITY detalhados
3. Execute `npm run verify:auth` para diagnóstico
4. Revise o arquivo .env e credenciais Firebase

---

**Última Atualização:** 2026-01-05  
**Versão do Documento:** 1.0  
**Responsável:** Equipa Técnica CDL Manaus
