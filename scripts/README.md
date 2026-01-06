# Database Seeding Script - Documentação

## 📋 Visão Geral

Este script popula o Firestore com os dados operacionais padrão da CDL Manaus, incluindo espaços, itens extras e configurações do sistema.

## 🎯 Objetivo

Criar e executar um script robusto de seeding que popule as coleções críticas do Firestore:
- **espacos**: 10 espaços da CDL Manaus (DJLM e UTV)
- **extras**: 5 itens extras para orçamentos
- **configuracoes**: Multiplicadores de turno

## ✨ Características

- ✅ **Idempotente**: Pode ser executado múltiplas vezes sem criar duplicatas
- ✅ **Zero Trust**: Usa credenciais via variáveis de ambiente (não arquivos JSON)
- ✅ **Logs Detalhados**: Feedback claro sobre cada operação
- ✅ **Resumo Final**: Estatísticas completas ao final da execução
- ✅ **Tratamento de Erros**: Continua mesmo se houver falhas individuais

## 📦 Dados Populados

### Espaços (Coleção `espacos`)

| Nome | Unidade | Capacidade | Área (m²) | Custo Base (R$/h) |
|------|---------|------------|-----------|-------------------|
| DJLM - Auditório | DJLM | 120 | 108 | 132.72 |
| UTV - Auditório | UTV | 70 | 63 | 77.60 |
| UTV - Sala 2 | UTV | 30 | 27 | 35.69 |
| UTV - Sala 3 | UTV | 50 | 45 | 55.19 |
| UTV - Sala 4 | UTV | 40 | 36 | 43.92 |
| UTV - Sala 7 | UTV | 26 | 25 | 29.53 |
| UTV - Sala 8 | UTV | 16 | 14.4 | 17.74 |
| UTV - Sala 9 | UTV | 28 | 25 | 30.52 |
| UTV - Sala 12 | UTV | 9 | 8.1 | 10.02 |
| UTV - Sala 13 | UTV | 8 | 7.2 | 8.86 |

### Extras (Coleção `extras`)

| Nome | Custo (R$) | Descrição |
|------|------------|-----------|
| Coffee Break Premium | 50.00 | Coffee break completo com variedade de bebidas e alimentos |
| Serviço de Limpeza | 150.00 | Serviço de limpeza completo do espaço |
| Projetor/Datashow | 80.00 | Projetor profissional para apresentações |
| Serviço de Impressão | 15.00 | Serviço de impressão de documentos |
| Gravação Profissional | 80.00 | Gravação profissional do evento |

### Configurações (Coleção `configuracoes`)

Documento: `multiplicadores`

```json
{
  "multiplicadores": {
    "manha": 1.0,
    "tarde": 1.15,
    "noite": 1.40
  }
}
```

## 🚀 Como Executar

### Pré-requisitos

1. **Instalar dependências** (se ainda não instaladas):
   ```bash
   npm install
   ```

2. **Configurar credenciais Firebase**:
   
   a) Copie o template de ambiente:
   ```bash
   cp .env.example .env
   ```
   
   b) Edite o arquivo `.env` e configure as credenciais do Firebase:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY_BASE64` (recomendado) ou `FIREBASE_PRIVATE_KEY` (legacy)
   
   c) Para gerar a chave em Base64 (recomendado):
   ```bash
   node convert-private-key-to-base64.js <arquivo-credenciais.json>
   ```

### Executar o Script

**Opção 1: Via npm script (recomendado)**
```bash
npm run seed:database
```

**Opção 2: Diretamente com Node.js**
```bash
node scripts/seed_database.js
```

## 📊 Saída Esperada

Quando executado com sucesso, você verá uma saída similar a:

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
   ...
[SEED-DB] 2026-01-06T14:00:05.000Z - ✅ Espaços processados: 10 criados, 0 atualizados, 0 com erro

[SEED-DB] 2026-01-06T14:00:05.000Z - 🎁 Iniciando seeding de extras...
   ✅ Extra 'Coffee Break Premium' criado (ID: ghi789...)
   ...
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

## 🔄 Idempotência

O script é **idempotente**, o que significa que pode ser executado múltiplas vezes com segurança:

- **Primeira execução**: Cria todos os documentos
- **Execuções subsequentes**: Atualiza os documentos existentes (mantendo os IDs)
- **Nunca cria duplicatas**: Verifica existência antes de inserir

Exemplo de saída na segunda execução:

```
[SEED-DB] 2026-01-06T14:05:00.000Z - 🏢 Iniciando seeding de espaços...
   ♻️  Espaço 'DJLM - Auditório' atualizado (ID: abc123...)
   ♻️  Espaço 'UTV - Auditório' atualizado (ID: def456...)
   ...
[SEED-DB] 2026-01-06T14:05:02.000Z - ✅ Espaços processados: 0 criados, 10 atualizados, 0 com erro
```

## 🔒 Segurança

O script segue as melhores práticas de segurança:

- ✅ **Zero Trust**: Não aceita arquivos JSON locais
- ✅ **Variáveis de Ambiente**: Credenciais via `.env`
- ✅ **Base64 Support**: Formato recomendado para chave privada
- ✅ **Validação Rigorosa**: Verifica credenciais antes de iniciar
- ✅ **Auditoria**: Logs detalhados de todas as operações

## ⚠️ Troubleshooting

### Erro: "Variáveis de ambiente obrigatórias não configuradas"

**Causa**: Credenciais Firebase não configuradas no `.env`

**Solução**:
1. Verifique se o arquivo `.env` existe
2. Confirme que as variáveis obrigatórias estão definidas:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY_BASE64` ou `FIREBASE_PRIVATE_KEY`

### Erro: "Module not found: dotenv"

**Causa**: Dependências não instaladas

**Solução**:
```bash
npm install
```

### Erro: "Permission denied" ou "PERMISSION_DENIED"

**Causa**: Service account não tem permissões de escrita no Firestore

**Solução**:
1. Vá para Firebase Console > Firestore > Rules
2. Verifique se as regras permitem escrita para o service account
3. Ou configure IAM Roles adequadas no Google Cloud Console

### Erro ao conectar com Firebase

**Causa**: Credenciais inválidas ou projeto não encontrado

**Solução**:
1. Verifique o `FIREBASE_PROJECT_ID`
2. Confirme que as credenciais são do projeto correto
3. Teste a conectividade com Firebase

## 📚 Documentação Adicional

- **MANUAL_TECNICO.md**: Estrutura técnica dos dados
- **MANUAL_USUARIO.md**: Manual do usuário do sistema
- **ENVIRONMENT_VARIABLES_GUIDE.md**: Guia de variáveis de ambiente
- **SECURITY_REMEDIATION_GUIDE.md**: Guia de segurança

## 🔗 Links Úteis

- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [dotenv Documentation](https://github.com/motdotla/dotenv)

## 📞 Suporte

Para problemas ou dúvidas:
1. Verifique a seção de Troubleshooting acima
2. Consulte os logs detalhados do script
3. Revise a documentação do Firebase
4. Entre em contato com o administrador do sistema

---

**Desenvolvido por**: Maycon A. Bentes  
**Versão**: 1.0  
**Data**: Janeiro 2026
