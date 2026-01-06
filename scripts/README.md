# Scripts - Sistema de Verificação e Diagnóstico

Este diretório contém scripts de diagnóstico e manutenção para o sistema Axioma CDL.

## 📋 Scripts Disponíveis

### 1. `seed_database.js` - Seeding do Banco de Dados

Popula o Firestore com dados iniciais necessários para o sistema funcionar:

- **10 Espaços** (salas) com custos base
- **5 Itens Extras** (equipamentos)
- **Configurações do Sistema** (multiplicadores de turno)

#### Uso:

```bash
npm run seed:database
```

#### O que o script faz:

1. Conecta ao Firebase usando as credenciais do `.env`
2. Cria/atualiza 10 espaços na coleção `espacos`:
   - DJLM - Auditório (R$ 150/hora)
   - Salas VIP 1 e 2 (R$ 80/hora cada)
   - Salas de Conferência 1 e 2 (R$ 60/hora cada)
   - Salas de Reunião 1 e 2 (R$ 40/hora cada)
   - Sala de Treinamento (R$ 70/hora)
   - Espaço Coworking (R$ 35/hora)
   - Sala da Diretoria (R$ 100/hora)

3. Cria/atualiza 5 extras na coleção `extras`:
   - Projetor Multimídia (R$ 5/hora)
   - Sistema de Sonorização (R$ 8/hora)
   - Microfone sem Fio (R$ 3/hora)
   - Notebook (R$ 10/hora)
   - Flip Chart (R$ 2/hora)

4. Configura multiplicadores de turno em `configuracoes/sistema`:
   - Manhã: 1.0x
   - Tarde: 1.15x
   - Noite: 1.40x

#### Saída Esperada:

```
═══════════════════════════════════════════════════════════════════
DATABASE SEEDING - Axioma CDL
═══════════════════════════════════════════════════════════════════

[SEED] 📦 Seeding Spaces (Espaços)...
[SEED]    ✓ Created: DJLM - Auditório
[SEED]    ✓ Created: Sala VIP 1
...
[SEED] ✅ Spaces: 10 created, 0 updated

[SEED] 📦 Seeding Extras (Equipment)...
[SEED]    ✓ Created: Projetor Multimídia
...
[SEED] ✅ Extras: 5 created, 0 updated

[SEED] 📦 Seeding Configuration...
[SEED]    ✓ System configuration updated
[SEED] ✅ Configuration seeded successfully

═══════════════════════════════════════════════════════════════════
✅ DATABASE SEEDING COMPLETED SUCCESSFULLY
═══════════════════════════════════════════════════════════════════

Summary:
  - 10 spaces configured
  - 5 extras configured
  - System configuration updated

Next step: Run health check
  npm run health:check
```

---

### 2. `system_health_check.js` - Verificação End-to-End do Sistema

Script de diagnóstico que valida a cadeia completa:
**Conexão → Leitura de Dados → Motor de Cálculo**

#### Uso:

```bash
npm run health:check
```

#### Testes Executados:

##### **Teste 1: Integridade do Banco de Dados**

1. **[TEST 1.1]** Conexão com o banco de dados
2. **[TEST 1.2]** Verifica se existem espaços cadastrados
3. **[TEST 1.3]** Valida se "DJLM - Auditório" existe e tem `custoBase` válido (> 0)
4. **[TEST 1.4]** Verifica se existem extras cadastrados
5. **[TEST 1.5]** Valida se os multiplicadores de turno estão configurados

##### **Teste 2: Simulação de Cálculo (Core Business Logic)**

Simula um orçamento real:
- **Espaço:** DJLM - Auditório
- **Duração:** 8 horas
- **Turno:** Matutino (Multiplicador 1.0)
- **Cálculo:** `custoOperacionalBase = custoBase * multiplicador * horas`

Valida se todos os dados necessários para o cálculo existem e são válidos.

#### Saída Esperada (Sistema Operacional):

```
═══════════════════════════════════════════════════════════════════
SYSTEM HEALTH CHECK REPORT
═══════════════════════════════════════════════════════════════════

[OK] Database Connection
[OK] Data Integrity (10 Spaces, 5 Extras)
[OK] Business Logic Ready (Multipliers found)
[OK] Calculation Simulation Passed

Key Data Points:
  - DJLM Auditório custoBase: R$ 150.00
  - Sample calculation (8h morning): R$ 1200.00

🚀 SYSTEM STATUS: OPERATIONAL
✅ All tests passed - System is ready for production

═══════════════════════════════════════════════════════════════════
```

#### Saída com Problemas Detectados:

```
═══════════════════════════════════════════════════════════════════
SYSTEM HEALTH CHECK REPORT
═══════════════════════════════════════════════════════════════════

[FAIL] Database Connection
[FAIL] Data Integrity (0 Spaces, 0 Extras)
[FAIL] Business Logic Ready (Multipliers using defaults)
[FAIL] Calculation Simulation Passed

⚠️  SYSTEM STATUS: ISSUES DETECTED
❌ Some tests failed - Review errors above

Recommended actions:
  1. Run: npm run seed:database
  2. Run: npm run health:check (again)

═══════════════════════════════════════════════════════════════════
```

---

## 🔧 Pré-requisitos

### 1. Variáveis de Ambiente

Os scripts requerem credenciais Firebase Admin SDK configuradas no arquivo `.env`:

```bash
# Copiar template
cp .env.example .env

# Editar com suas credenciais
nano .env
```

#### Variáveis Obrigatórias:

```env
FIREBASE_PROJECT_ID=axioma-cdl-manaus
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@axioma-cdl-manaus.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY_BASE64="YOUR_BASE64_ENCODED_KEY"
```

Consulte os guias:
- [ENVIRONMENT_VARIABLES_GUIDE.md](../ENVIRONMENT_VARIABLES_GUIDE.md)
- [FIREBASE_CREDENTIALS_EXPLAINED.md](../FIREBASE_CREDENTIALS_EXPLAINED.md)

### 2. Dependências Node.js

```bash
npm install
```

Dependências necessárias (já no `package.json`):
- `firebase-admin` - SDK para operações administrativas
- `dotenv` - Gerenciamento de variáveis de ambiente

---

## 🚀 Fluxo de Uso Recomendado

### Primeira Configuração do Sistema:

```bash
# 1. Configurar credenciais
cp .env.example .env
# Edite .env com suas credenciais Firebase

# 2. Popular o banco de dados
npm run seed:database

# 3. Verificar integridade do sistema
npm run health:check
```

### Verificação de Rotina:

```bash
# Executar health check antes de deployments
npm run health:check
```

### Re-popular Dados (se necessário):

```bash
# Executar seed novamente (faz merge, não apaga dados existentes)
npm run seed:database
```

---

## 📊 Códigos de Saída

Os scripts usam códigos de saída padrão:

- **0** - Sucesso (todos os testes passaram)
- **1** - Falha (erros detectados ou testes falharam)

Isso permite integração com CI/CD pipelines:

```bash
# Exemplo em CI/CD
npm run health:check || exit 1
```

---

## 🔍 Troubleshooting

### Erro: "Missing environment variables"

**Causa:** Arquivo `.env` não configurado ou variáveis ausentes.

**Solução:**
```bash
cp .env.example .env
# Editar .env com credenciais válidas
```

### Erro: "Spaces collection is empty"

**Causa:** Banco de dados não foi populado.

**Solução:**
```bash
npm run seed:database
npm run health:check
```

### Erro: "Firebase Admin initialization failed"

**Causa:** Credenciais inválidas ou projeto Firebase inacessível.

**Solução:**
1. Verificar se as credenciais estão corretas no `.env`
2. Verificar se o service account tem permissões adequadas
3. Verificar conectividade com Firebase

### Warning: "Multipliers not found, using defaults"

**Causa:** Configuração de multiplicadores não foi criada.

**Solução:**
```bash
npm run seed:database
```

---

## 📚 Documentação Relacionada

- [README.md](../README.md) - Documentação principal do projeto
- [ENVIRONMENT_VARIABLES_GUIDE.md](../ENVIRONMENT_VARIABLES_GUIDE.md) - Guia de variáveis de ambiente
- [FIREBASE_CREDENTIALS_EXPLAINED.md](../FIREBASE_CREDENTIALS_EXPLAINED.md) - Explicação de credenciais Firebase
- [AUTHENTICATION_GUIDE.md](../AUTHENTICATION_GUIDE.md) - Sistema de autenticação

---

## 🎯 Objetivo dos Scripts

Estes scripts foram criados como parte da **tarefa de QA Automation Engineer & System Architect** para:

1. ✅ Validar a integração entre código e banco de dados
2. ✅ Garantir que o motor de cálculo está funcional
3. ✅ Fornecer um relatório visual de status do sistema
4. ✅ Automatizar a verificação de saúde do sistema antes de releases

**Status:** Sistema testado e aprovado para produção quando todos os testes passarem. 🚀
