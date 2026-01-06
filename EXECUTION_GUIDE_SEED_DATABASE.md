# Guia de Execução - Database Seeding Script

## 🎯 Propósito

Este documento fornece instruções detalhadas para executar o script de população do banco de dados (`seed_database.js`) no seu ambiente local.

## ⚠️ IMPORTANTE - Credenciais Necessárias

O script **requer** credenciais Firebase configuradas no arquivo `.env`. Estas credenciais não estão disponíveis no repositório por motivos de segurança.

## 📋 Pré-requisitos

### 1. Dependências Instaladas

Certifique-se de que todas as dependências Node.js estão instaladas:

```bash
cd /home/runner/work/calculadora-orcamento-cdl/calculadora-orcamento-cdl
npm install
```

Isso instalará:
- `firebase-admin` (para acesso ao Firestore)
- `dotenv` (para carregar variáveis de ambiente)

### 2. Credenciais Firebase

Você precisa ter acesso ao Firebase Console do projeto `axioma-cdl-manaus` e:

1. **Obter a Service Account Key**:
   - Acesse: [Firebase Console](https://console.firebase.google.com)
   - Selecione o projeto `axioma-cdl-manaus`
   - Vá para: **Project Settings** > **Service Accounts**
   - Clique em **Generate New Private Key**
   - Salve o arquivo JSON gerado

2. **Configurar arquivo .env**:
   ```bash
   # Na raiz do projeto
   cp .env.example .env
   ```

3. **Converter chave para Base64** (recomendado):
   ```bash
   node convert-private-key-to-base64.js <caminho-para-arquivo-json>
   ```
   
   Isso gerará o valor Base64 que você deve copiar para `FIREBASE_PRIVATE_KEY_BASE64` no `.env`.

4. **Editar o .env** com as credenciais:
   ```bash
   # Abra o arquivo .env em um editor de texto
   nano .env
   # ou
   vim .env
   ```
   
   Configure pelo menos estas variáveis:
   ```env
   FIREBASE_PROJECT_ID=axioma-cdl-manaus
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@axioma-cdl-manaus.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY_BASE64="<valor-base64-gerado>"
   ```

### 3. Permissões do Service Account

Verifique se o service account tem permissões de **escrita** no Firestore:

- No Firebase Console, vá para **Firestore Database** > **Rules**
- Certifique-se de que o service account pode escrever nas coleções necessárias
- Ou configure as permissões IAM adequadas no Google Cloud Console

## 🚀 Execução do Script

### Método 1: Via npm script (Recomendado)

```bash
npm run seed:database
```

### Método 2: Diretamente com Node.js

```bash
node scripts/seed_database.js
```

## ✅ Verificação de Sucesso

### 1. Saída Esperada no Terminal

Você deve ver uma saída similar a:

```
[SEED-DB] 2026-01-06T14:00:00.000Z - Script de seeding iniciado
[SEED-DB] 2026-01-06T14:00:00.000Z - 🔐 Verificando configuração de segurança (Arquitetura Gemini)...

[SEED-DB] 2026-01-06T14:00:01.000Z - ✅ Firebase Admin inicializado via variáveis de ambiente
   Project: axioma-cdl-manaus
   Service Account: firebase-adminsdk-xxxxx@axioma-cdl-manaus.iam.gserviceaccount.com

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[SEED-DB] 2026-01-06T14:00:01.000Z - 🚀 INICIANDO DATABASE SEEDING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[SEED-DB] 2026-01-06T14:00:02.000Z - 🏢 Iniciando seeding de espaços...
   ✅ Espaço 'DJLM - Auditório' criado (ID: abc123...)
   ✅ Espaço 'UTV - Auditório' criado (ID: def456...)
   ✅ Espaço 'UTV - Sala 2' criado (ID: ghi789...)
   ... (7 mais espaços)
[SEED-DB] 2026-01-06T14:00:05.000Z - ✅ Espaços processados: 10 criados, 0 atualizados, 0 com erro

[SEED-DB] 2026-01-06T14:00:05.000Z - 🎁 Iniciando seeding de extras...
   ✅ Extra 'Coffee Break Premium' criado (ID: jkl012...)
   ✅ Extra 'Serviço de Limpeza' criado (ID: mno345...)
   ... (3 mais extras)
[SEED-DB] 2026-01-06T14:00:07.000Z - ✅ Extras processados: 5 criados, 0 atualizados, 0 com erro

[SEED-DB] 2026-01-06T14:00:07.000Z - ⚙️  Iniciando seeding de configurações...
   ✅ Configuração 'multiplicadores' criada
[SEED-DB] 2026-01-06T14:00:08.000Z - ✅ Configurações processadas: 1 criadas, 0 atualizadas

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[SEED-DB] 2026-01-06T14:00:08.000Z - 🎉 DATABASE SEEDING CONCLUÍDO COM SUCESSO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 RESUMO FINAL:

   🏢 Espaços:
      ✅ Criados: 10
      ♻️  Atualizados: 0
      ❌ Erros: 0

   🎁 Extras:
      ✅ Criados: 5
      ♻️  Atualizados: 0
      ❌ Erros: 0

   ⚙️  Configurações:
      ✅ Criadas: 1
      ♻️  Atualizadas: 0

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 Database Seeded: 10 espaços, 5 extras, 1 configs
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ O banco de dados está pronto para uso!
```

### 2. Verificação no Firebase Console

1. Acesse o [Firebase Console](https://console.firebase.google.com)
2. Selecione o projeto `axioma-cdl-manaus`
3. Vá para **Firestore Database**
4. Verifique se as seguintes coleções foram criadas:
   - **espacos**: Deve conter 10 documentos
   - **extras**: Deve conter 5 documentos
   - **configuracoes**: Deve conter 1 documento (ID: `multiplicadores`)

### 3. Verificação dos Dados

#### Coleção `espacos`
Verifique se cada documento tem:
- `nome`: Nome do espaço (ex: "DJLM - Auditório")
- `unidade`: "DJLM" ou "UTV"
- `capacidade`: Número de pessoas
- `area`: Área em m²
- `custoBase`: Custo por hora em R$
- `ativo`: true
- `criadoEm`: Timestamp ISO
- `atualizadoEm`: Timestamp ISO

#### Coleção `extras`
Verifique se cada documento tem:
- `nome`: Nome do item (ex: "Coffee Break Premium")
- `custo`: Valor em R$
- `descricao`: Descrição do serviço
- `ativo`: true
- `criadoEm`: Timestamp ISO
- `atualizadoEm`: Timestamp ISO

#### Coleção `configuracoes`
Verifique o documento `multiplicadores`:
- `multiplicadores.manha`: 1.0
- `multiplicadores.tarde`: 1.15
- `multiplicadores.noite`: 1.40
- `criadoEm`: Timestamp ISO
- `atualizadoEm`: Timestamp ISO

## 🔄 Executando Novamente

O script é **idempotente**, então pode ser executado múltiplas vezes:

- **Se os dados já existem**: Eles serão atualizados (não duplicados)
- **Se novos dados são adicionados ao script**: Apenas os novos serão criados

Exemplo de saída na segunda execução:

```
[SEED-DB] 2026-01-06T14:05:00.000Z - 🏢 Iniciando seeding de espaços...
   ♻️  Espaço 'DJLM - Auditório' atualizado (ID: abc123...)
   ♻️  Espaço 'UTV - Auditório' atualizado (ID: def456...)
   ...
[SEED-DB] 2026-01-06T14:05:02.000Z - ✅ Espaços processados: 0 criados, 10 atualizados, 0 com erro
```

## 🐛 Troubleshooting

### Erro: "Variáveis de ambiente obrigatórias não configuradas"

**Problema**: Arquivo `.env` não configurado ou incompleto.

**Solução**:
```bash
# 1. Verifique se o arquivo existe
ls -la .env

# 2. Verifique o conteúdo (sem expor as credenciais)
grep "FIREBASE_PROJECT_ID" .env
grep "FIREBASE_CLIENT_EMAIL" .env
grep "FIREBASE_PRIVATE_KEY_BASE64" .env

# 3. Se algum estiver faltando, edite o arquivo
nano .env
```

### Erro: "Cannot find module 'dotenv'" ou "Cannot find module 'firebase-admin'"

**Problema**: Dependências não instaladas.

**Solução**:
```bash
npm install
```

### Erro: "PERMISSION_DENIED"

**Problema**: Service account não tem permissões de escrita.

**Solução**:
1. Verifique as regras do Firestore no Firebase Console
2. Confirme que o service account tem as permissões corretas
3. Verifique se o email do service account está correto no `.env`

### Erro: "auth/invalid-credential" ou "Error initializing Firebase Admin"

**Problema**: Credenciais inválidas ou malformadas.

**Solução**:
```bash
# 1. Regenere a chave no Firebase Console
# 2. Converta para Base64 novamente
node convert-private-key-to-base64.js <novo-arquivo.json>

# 3. Atualize o .env com o novo valor
```

### Script não encontra o arquivo firebase-key-handler.js

**Problema**: Caminho incorreto no require.

**Solução**: O script está em `scripts/seed_database.js` e o handler está na raiz. O require usa `../firebase-key-handler` que deve funcionar. Se não funcionar, verifique:

```bash
# Verificar se o arquivo existe
ls -la firebase-key-handler.js

# Executar o script da raiz do projeto
node scripts/seed_database.js
```

## 📊 Dados Populados

O script popula o banco com os seguintes dados:

### ✅ 10 Espaços:
- DJLM - Auditório (120 pessoas, 108m², R$ 132.72/h)
- UTV - Auditório (70 pessoas, 63m², R$ 77.60/h)
- UTV - Sala 2 (30 pessoas, 27m², R$ 35.69/h)
- UTV - Sala 3 (50 pessoas, 45m², R$ 55.19/h)
- UTV - Sala 4 (40 pessoas, 36m², R$ 43.92/h)
- UTV - Sala 7 (26 pessoas, 25m², R$ 29.53/h)
- UTV - Sala 8 (16 pessoas, 14.4m², R$ 17.74/h)
- UTV - Sala 9 (28 pessoas, 25m², R$ 30.52/h)
- UTV - Sala 12 (9 pessoas, 8.1m², R$ 10.02/h)
- UTV - Sala 13 (8 pessoas, 7.2m², R$ 8.86/h)

### ✅ 5 Itens Extras:
- Coffee Break Premium (R$ 50.00)
- Serviço de Limpeza (R$ 150.00)
- Projetor/Datashow (R$ 80.00)
- Serviço de Impressão (R$ 15.00)
- Gravação Profissional (R$ 80.00)

### ✅ 1 Configuração:
- Multiplicadores de turno (manhã: 1.0, tarde: 1.15, noite: 1.40)

## 📚 Documentação Adicional

- **scripts/README.md**: Documentação técnica completa do script
- **ENVIRONMENT_VARIABLES_GUIDE.md**: Guia de configuração de variáveis de ambiente
- **MANUAL_TECNICO.md**: Estrutura técnica dos dados
- **SECURITY_REMEDIATION_GUIDE.md**: Guia de segurança

## 🎯 Próximos Passos

Após executar o script com sucesso:

1. ✅ Verificar os dados no Firebase Console
2. ✅ Testar a calculadora de orçamentos (dashboard-admin.html)
3. ✅ Verificar se os espaços aparecem corretamente
4. ✅ Verificar se os extras estão disponíveis
5. ✅ Confirmar que os multiplicadores estão sendo aplicados

## 📞 Suporte

Se encontrar problemas:
1. Consulte a seção de Troubleshooting acima
2. Revise os logs do script para mais detalhes
3. Verifique a documentação do Firebase
4. Contacte o administrador do sistema

---

**Nota**: Este script foi desenvolvido seguindo as melhores práticas de segurança Zero Trust e idempotência. Pode ser executado em ambientes de desenvolvimento, staging e produção com segurança.

**Desenvolvido por**: Maycon A. Bentes  
**Versão**: 1.0  
**Data**: Janeiro 2026
