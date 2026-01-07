# Pasta de Upload de Arquivos CSV

Esta pasta é destinada ao upload manual de arquivos CSV no GitHub Codespaces para importação de dados de locação de espaços CDL.

## 📋 Arquivos Esperados

### 1. `simulador.csv`
Planilha principal com dados de espaços e custos operacionais.

**Origem:** `Planilha de apoio_Locação de Espaços.xlsx - SIMULADOR 220H.csv`

**Colunas esperadas:**
- `Unidade` - Nome da unidade CDL (ex: "CDL Centro")
- `Espaço` - Nome do espaço/sala (ex: "Auditório", "Sala VIP 1")
- `Cap.` - Capacidade de pessoas
- `Área (m²)` - Área do espaço em metros quadrados
- `Custo Op. Base` - Custo operacional base (ex: "R$ 150,00")
- `Turno: Manhã (x1,00)` - Custo no turno da manhã
- `Turno: Tarde (x1,15)` - Custo no turno da tarde
- `Turno: Noite (x1,40)` - Custo no turno da noite
- `Itens Considerados (Qtd)` - Itens inclusos no espaço

### 2. `infra.csv` (Opcional)
Planilha com dados de infraestrutura.

**Origem:** `Planilha de apoio_Locação de Espaços.xlsx - INFRA.csv`

## 🚀 Como Fazer Upload

### No GitHub Codespaces:

1. **Abra o explorador de arquivos** (lado esquerdo do VS Code)
2. **Navegue até a pasta** `dados_csv`
3. **Clique com botão direito** na pasta
4. **Selecione "Upload..."** ou arraste os arquivos
5. **Renomeie os arquivos** para os nomes esperados:
   - `simulador.csv`
   - `infra.csv` (se aplicável)

### Formato do Arquivo

⚠️ **Importante:** O arquivo CSV deve:
- Usar vírgula (`,`) como separador
- **Usar aspas duplas (`"`) ao redor de todos os campos** para evitar problemas com vírgulas e caracteres especiais
- Ter codificação UTF-8
- Pular a primeira linha (título) - a segunda linha deve ser o cabeçalho
- Valores monetários no formato brasileiro (ex: "R$ 1.200,50")

**Exemplo de formato correto:**
```csv
Título da Planilha - SIMULADOR 220H
"Unidade","Espaço","Cap.","Área (m²)","Custo Op. Base","Turno: Manhã (x1,00)","Turno: Tarde (x1,15)","Turno: Noite (x1,40)","Itens Considerados (Qtd)"
"CDL Centro","Auditório Principal","200","150","R$ 180,00","R$ 180,00","R$ 207,00","R$ 252,00","Cadeiras e Projetor"
```

## 📊 Executar Importação

Após fazer upload dos arquivos:

```bash
npm run import:csv
```

ou

```bash
node scripts/importar_planilha_cdl.js
```

## ✅ Validação

Após a importação, valide os dados:

```bash
npm run health:check
```

## 🔒 Segurança

- Esta pasta está no `.gitignore` - arquivos CSV **não serão** commitados no Git
- Mantenha os arquivos CSV apenas localmente no Codespaces
- Remova arquivos sensíveis após a importação se necessário

## 📝 Notas

- O script faz **merge** dos dados - não apaga informações existentes
- IDs dos documentos são gerados automaticamente a partir de `Unidade + Espaço`
- Custos zerados geram avisos mas não impedem a importação
- A importação atualiza o campo `atualizadoEm` com timestamp atual
