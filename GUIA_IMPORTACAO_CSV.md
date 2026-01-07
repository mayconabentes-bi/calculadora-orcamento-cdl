# Guia de Importação de Planilhas CDL via Codespaces

Este guia documenta o sistema de importação de dados de precificação CDL através de arquivos CSV no GitHub Codespaces, implementado conforme especificação do problema.

## 📋 Visão Geral

O sistema permite atualizar os preços e dados de espaços no Firebase Firestore a partir de planilhas Excel exportadas como CSV, facilitando a manutenção periódica (a cada 90 dias) dos valores de locação.

## 🚀 Passo a Passo Completo

### Passo 1: Preparar o Ambiente no Codespaces

1. **Abra o terminal do Codespaces** (Ctrl+\`)

2. **Instale as dependências:**
   ```bash
   npm install
   ```
   > Nota: A biblioteca `csv-parse` já está incluída no package.json

3. **Verifique a pasta de dados:**
   ```bash
   ls -la dados_csv/
   ```
   > A pasta `dados_csv/` já existe e contém um README com instruções

### Passo 2: Carregar os Arquivos CSV (Upload Manual)

1. **No explorador de arquivos do Codespaces** (lado esquerdo):
   - Clique com o botão direito na pasta `dados_csv`
   - Selecione **"Upload..."**
   - Ou arraste os arquivos do seu computador

2. **Renomeie os arquivos** para os nomes padrão:
   - `Planilha de apoio_Locação de Espaços.xlsx - SIMULADOR 220H.csv` → **`simulador.csv`**
   - `Planilha de apoio_Locação de Espaços.xlsx - INFRA.csv` → **`infra.csv`** (opcional)

### Passo 3: Configurar a Chave de Segurança (Firebase)

⚠️ **Importante:** O sistema usa **variáveis de ambiente** para credenciais Firebase (arquitetura Zero Trust).

#### Opção 1: Usar Variáveis de Ambiente (Recomendado)

Configure no arquivo `.env` (já existe no projeto):

```bash
FIREBASE_PROJECT_ID=axioma-cdl-manaus
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@axioma-cdl-manaus.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY_BASE64="YOUR_BASE64_ENCODED_KEY"
```

Para gerar o Base64 da chave privada:
```bash
node convert-private-key-to-base64.js
```

#### Opção 2: Usar serviceAccountKey.json (Alternativo)

Se preferir usar arquivo JSON:
1. Arraste `serviceAccountKey.json` para a raiz do projeto
2. O sistema detectará automaticamente
3. ✅ Já está no `.gitignore` (não será commitado)

### Passo 4: Formato do CSV

O arquivo CSV deve ter o seguinte formato:

```csv
Título da Planilha - SIMULADOR 220H
"Unidade","Espaço","Cap.","Área (m²)","Custo Op. Base","Turno: Manhã (x1,00)","Turno: Tarde (x1,15)","Turno: Noite (x1,40)","Itens Considerados (Qtd)"
"CDL Centro","Auditório Principal","200","150","R$ 180,00","R$ 180,00","R$ 207,00","R$ 252,00","Cadeiras (200), Projetor (1)"
"CDL Centro","Sala VIP Premium","50","80","R$ 95,00","R$ 95,00","R$ 109,25","R$ 133,00","Cadeiras (50), TV (1)"
```

**Requisitos:**
- ✅ Usar aspas duplas (`"`) em todos os campos
- ✅ Primeira linha: Título da planilha
- ✅ Segunda linha: Cabeçalhos das colunas
- ✅ Terceira linha em diante: Dados
- ✅ Valores monetários no formato brasileiro: `"R$ 1.200,50"`
- ✅ Codificação UTF-8

### Passo 5: Executar a Importação

No terminal do Codespaces:

```bash
npm run import:csv
```

**Saída esperada:**
```
🚀 Iniciando importação CDL no Codespaces...

[CSV-IMPORT] 📂 Arquivo simulador.csv encontrado
[CSV-IMPORT] 📊 Processando dados...
[CSV-IMPORT] 📋 Total de registros encontrados: 5

[CSV-IMPORT] ✅ [cdl_centro_auditorio_principal] Auditório Principal - R$ 180.00
[CSV-IMPORT] ✅ [cdl_centro_sala_vip_premium] Sala VIP Premium - R$ 95.00
...

[CSV-IMPORT] 💾 Salvando dados no Firestore...
[CSV-IMPORT] ✅ Dados salvos com sucesso!

🎉 Sucesso! 5 espaços atualizados no Firestore.
```

### Passo 6: Validar a Importação

1. **Verificar integridade do sistema:**
   ```bash
   npm run health:check
   ```

2. **Abrir o sistema no navegador:**
   - Se estiver rodando com `npm start`, o Codespaces abrirá automaticamente
   - Ou clique na porta sugerida (ex: porta 3000, 8000, etc.)

3. **Testar na Calculadora:**
   - Vá na calculadora de orçamentos
   - Verifique se os espaços aparecem
   - Faça um cálculo e valide os valores

## 📊 Estrutura de Dados Importada

Cada registro no CSV gera um documento na coleção `espacos` do Firestore:

```javascript
{
  nome: "Auditório Principal",
  unidade: "CDL Centro",
  capacidade: 200,
  area: "150",
  custoBase: 180.00,
  custoManha: 180.00,
  custoTarde: 207.00,
  custoNoite: 252.00,
  itensInclusos: "Cadeiras (200), Projetor (1)",
  atualizadoEm: "2026-01-07T03:00:00.000Z",
  origem: "CSV Import - Codespaces",
  ativo: true
}
```

## 🔒 Segurança

### Arquivos Protegidos no .gitignore

✅ Os seguintes arquivos **NÃO são commitados** no Git:

- `serviceAccountKey.json` - Credenciais Firebase
- `dados_csv/*.csv` - Arquivos CSV com dados sensíveis
- `.env` - Variáveis de ambiente

### Arquivos Incluídos no Git

✅ Os seguintes arquivos **SÃO commitados**:

- `dados_csv/README.md` - Documentação de uso
- `scripts/importar_planilha_cdl.js` - Script de importação
- `package.json` - Configurações e dependências

## 🔧 Troubleshooting

### Erro: "serviceAccountKey.json não encontrado"

**Solução:** Configure as variáveis de ambiente no `.env`:
```bash
cp .env.example .env
# Edite .env com suas credenciais
```

### Erro: "CSV parse error - Invalid Record Length"

**Causa:** CSV sem aspas ou formato incorreto

**Solução:** 
1. Certifique-se de que todos os campos estão entre aspas duplas
2. Verifique se não há quebras de linha dentro dos campos
3. Use UTF-8 encoding ao exportar do Excel

### Aviso: "Custo zerado para [Espaço]"

**Causa:** Campo `Custo Op. Base` está vazio ou zerado

**Solução:** Verifique o CSV e corrija os valores antes de importar novamente

### Erro: "Firebase Admin initialization failed"

**Causa:** Credenciais inválidas ou projeto inacessível

**Solução:**
1. Verifique as credenciais no `.env`
2. Confirme permissões do service account
3. Teste conectividade com Firebase

## 📚 Comandos Disponíveis

```bash
# Importar dados dos CSVs
npm run import:csv

# Verificar saúde do sistema
npm run health:check

# Popular banco com dados padrão
npm run seed:database

# Validar configuração de segurança
npm run validate:all
```

## 🎯 Fluxo de Atualização Periódica (90 dias)

1. **Exportar planilhas** do Excel como CSV (formato descrito acima)
2. **Upload** dos arquivos para `dados_csv/` no Codespaces
3. **Executar** `npm run import:csv`
4. **Validar** com `npm run health:check`
5. **Testar** no sistema web
6. **Remover** arquivos CSV após importação (opcional, por segurança)

## 💡 Vantagens do Sistema

- ✅ **Centralizado**: Uma única fonte de verdade (CSV)
- ✅ **Auditável**: Logs detalhados de cada importação
- ✅ **Seguro**: Credenciais protegidas, arquivos não commitados
- ✅ **Batch**: Operações em lote para eficiência
- ✅ **Merge**: Não apaga dados existentes, apenas atualiza
- ✅ **Validação**: Avisos automáticos para dados inconsistentes

## 📖 Documentação Relacionada

- **[dados_csv/README.md](./dados_csv/README.md)** - Guia da pasta de upload
- **[scripts/README.md](./scripts/README.md)** - Documentação dos scripts
- **[ENVIRONMENT_VARIABLES_GUIDE.md](./ENVIRONMENT_VARIABLES_GUIDE.md)** - Guia de variáveis de ambiente
- **[FIREBASE_CREDENTIALS_EXPLAINED.md](./FIREBASE_CREDENTIALS_EXPLAINED.md)** - Explicação de credenciais

---

**Desenvolvido por**: Sistema Axioma CDL  
**Versão**: 5.2.0  
**Última Atualização**: Janeiro 2026
