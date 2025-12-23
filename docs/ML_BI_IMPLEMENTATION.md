# Implementação: Infraestrutura de Dados para ML/BI

## Resumo Executivo

Esta implementação adiciona a infraestrutura necessária para análise de **Regressão Logística** na Calculadora de Orçamento CDL/UTV, permitindo identificar quais variáveis (preditores) influenciam a decisão de compra dos clientes.

## Objetivo Estratégico

Coletar dados estruturados e limpos para alimentar modelos de Machine Learning externos (Python, Excel, PowerBI), identificando matematicamente os preditores de conversão de vendas.

## Hipótese de Negócio

Os principais preditores de venda são:
1. **Desconto (%)** - Impacto do desconto oferecido
2. **Lead Time** - Dias de antecedência entre cotação e evento
3. **Tipo de Sala** - Categoria da sala escolhida

## Implementação Técnica

### 1. Captura da Data do Evento (index.html)

**Campo Adicionado:**
```html
<label for="data-evento">Data Prevista do Evento: *</label>
<input type="date" id="data-evento" class="form-control" required>
```

**Localização:** Card "Configurar Orçamento", antes do campo "Duração do Contrato"

**Validação:** Data deve ser futura (implementada em app.js)

**Propósito:** Calcular o Lead Time - preditor crítico para análise de conversão

### 2. Feature Engineering (data-manager.js)

#### 2.1 Cálculo de Lead Time

```javascript
// Diferença em dias entre Data da Cotação e Data do Evento
leadTimeDays = Math.floor((dataEvento - dataCotacao) / (1000 * 60 * 60 * 24))
```

**Exemplo:**
- Cotação: 01/12/2024
- Evento: 15/12/2024
- Lead Time: 14 dias

#### 2.2 Inferência de Turno Predominante

```javascript
inferirTurnoPredominante(horarios)
```

**Classificação:**
- 1 = Manhã (06:00 - 11:59)
- 2 = Tarde (12:00 - 17:59)
- 3 = Noite (18:00 - 05:59)

**Algoritmo:** Calcula o ponto médio de cada horário e determina o turno predominante baseado na maior quantidade de horas.

#### 2.3 Exportação de Dataset ML

**Método:** `exportarDatasetML()`

**Formato:** CSV otimizado para algoritmos (sem formatação humana)

**Colunas do Dataset:**

| Coluna | Tipo | Descrição | Exemplo |
|--------|------|-----------|---------|
| TARGET_CONVERTIDO | binário (0/1) | Vendido = 1, Não vendido = 0 | 1 |
| FEATURE_DESCONTO_PERCENT | float | Percentual de desconto aplicado | 20.00 |
| FEATURE_MARGEM_LIQUIDA | float | Margem líquida em percentual | 15.50 |
| FEATURE_LEAD_TIME | int | Dias de antecedência | 30 |
| FEATURE_VALOR_TOTAL | float | Valor final em R$ | 10000.00 |
| FEATURE_DURACAO_HORAS | float | Duração total em horas | 240.00 |
| CAT_SALA_ID | int | ID categórico da sala | 1 |
| CAT_TURNO_PREDOMINANTE | int | 1=Manhã, 2=Tarde, 3=Noite | 2 |

**Exemplo de Dataset:**
```csv
TARGET_CONVERTIDO,FEATURE_DESCONTO_PERCENT,FEATURE_MARGEM_LIQUIDA,FEATURE_LEAD_TIME,FEATURE_VALOR_TOTAL,FEATURE_DURACAO_HORAS,CAT_SALA_ID,CAT_TURNO_PREDOMINANTE
1,20.00,15.50,30,10000.00,240.00,1,2
0,10.00,18.25,15,8500.00,180.00,3,1
1,25.00,12.80,45,12000.00,300.00,2,3
```

### 3. Validação e Interface (app.js)

#### 3.1 Validação de Data Futura

```javascript
const dataEventoObj = new Date(dataEvento + 'T00:00:00');
const hoje = new Date();
hoje.setHours(0, 0, 0, 0);

if (dataEventoObj < hoje) {
    alert('A data do evento deve ser futura!');
    return;
}
```

#### 3.2 Botão de Exportação ML

**Localização:** Aba "Histórico & Conversão"

**Texto:** "Baixar Dataset para IA/ML"

**Função:** `exportarDatasetML()`

**Nome do Arquivo:** `dataset-ml-regressao-logistica-{timestamp}.csv`

## Fluxo de Uso

1. **Usuário preenche orçamento** → Inclui data do evento
2. **Sistema calcula** → Lead time e turno predominante automaticamente
3. **Salva no histórico** → Com todas as features calculadas
4. **Marca conversões** → Define TARGET_CONVERTIDO (vendido ou não)
5. **Exporta dataset ML** → CSV otimizado para análise externa

## Análise Posterior (Fora do Escopo)

O dataset gerado pode ser usado em:

### Python (Scikit-learn)
```python
import pandas as pd
from sklearn.linear_model import LogisticRegression

# Carregar dataset
df = pd.read_csv('dataset-ml-regressao-logistica.csv')

# Separar features e target
X = df.drop('TARGET_CONVERTIDO', axis=1)
y = df['TARGET_CONVERTIDO']

# Treinar modelo
model = LogisticRegression()
model.fit(X, y)

# Coeficientes indicam importância de cada preditor
print(model.coef_)
```

### Excel / PowerBI
- Importar CSV
- Criar tabela dinâmica
- Analisar correlações
- Visualizar padrões

## Compatibilidade

✅ **Backward Compatible:** Registros antigos sem data do evento ainda funcionam
✅ **Dados Limpos:** CSV sem aspas, apenas valores numéricos
✅ **Valores Vazios:** Lead Time vazio para registros antigos (não quebra análise)

## Testes Implementados

### Cobertura de Testes (17 testes - 100% passing)

**ML - Captura de Data do Evento e Lead Time:**
- ✅ Captura data do evento
- ✅ Calcula lead time corretamente
- ✅ Compatibilidade com dados antigos
- ✅ Lead time negativo para datas passadas

**ML - Inferência de Turno Predominante:**
- ✅ Infere Manhã (1)
- ✅ Infere Tarde (2)
- ✅ Infere Noite (3)
- ✅ Múltiplos horários
- ✅ Casos nulos

**ML - Exportação de Dataset:**
- ✅ Cabeçalhos corretos
- ✅ TARGET_CONVERTIDO (0/1)
- ✅ Features numéricas válidas
- ✅ Turno predominante
- ✅ Múltiplos registros
- ✅ CSV limpo e válido

## Arquivos Modificados

1. **index.html**
   - Linha 148-158: Campo "Data Prevista do Evento"
   - Linha 628-648: Botão "Baixar Dataset para IA/ML"

2. **assets/js/data-manager.js**
   - Linha 807-864: Método `adicionarCalculoHistorico()` modificado
   - Linha 919-973: Novo método `inferirTurnoPredominante()`
   - Linha 1088-1149: Novo método `exportarDatasetML()`

3. **assets/js/app.js**
   - Linha 577: Captura da data do evento
   - Linha 586-600: Validação de data futura
   - Linha 656: Inclusão da data no registro
   - Linha 550: Event listener do botão ML
   - Linha 2764-2776: Função `exportarDatasetML()`

4. **tests/unit/ml-dataset.test.js** (NOVO)
   - 478 linhas de testes automatizados

## Recomendações

### ✅ Implementado
- Captura de dados limpos e estruturados
- Lead Time calculado automaticamente
- Turno predominante inferido
- Dataset otimizado para ML

### ⚠️ Não Implementado (Conforme Recomendação)
- **Gradiente Descendente em JavaScript** - Deixado para ferramentas externas
- **Cálculo de Regressão no Browser** - Tornaria manutenção pesada
- **Visualizações de IA** - Foco em coleta de dados

## Conclusão

A infraestrutura implementada foca no que é crítico: **coletar dados limpos e estruturados**. A análise matemática (Regressão Logística) deve ser feita em ferramentas especializadas (Python, Excel, PowerBI) que são mais adequadas para esse tipo de processamento.

**Valor Entregue:**
- Dataset estruturado e pronto para ML
- Lead Time como preditor de conversão
- Turno como variável categórica
- Desconto já capturado nos dados
- Compatibilidade total com sistema existente

---

**Documentação Técnica - Versão 1.0**  
Data: Dezembro 2024  
Projeto: Calculadora de Orçamento CDL/UTV - ML/BI Infrastructure
