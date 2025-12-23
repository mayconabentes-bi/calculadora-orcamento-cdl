# Dashboard Executivo - Documentação Técnica

## Visão Geral

O Dashboard Executivo é uma funcionalidade de Business Intelligence que transforma dados brutos de orçamentos em visualizações financeiras interativas, permitindo análise estratégica da Margem de Contribuição por Segmento e saúde financeira do funil de vendas.

## Arquitetura

### Componentes Principais

1. **dashboard.js** - Controlador de visualização
   - Classe `DashboardController`
   - Renderização de KPIs e gráficos
   - Integração com Chart.js 4.4.0

2. **data-manager.js** - Camada analítica (OLAP)
   - Método `obterDadosAnaliticos()`
   - Agregação por unidade
   - Cálculo de métricas financeiras

3. **index.html** - Estrutura visual
   - 5 Scorecards de KPIs
   - 3 Gráficos interativos
   - Layout responsivo em grid

## Indicadores (KPIs)

### 1. Receita Total (Pipeline)
- **Descrição**: Soma de todos os orçamentos calculados (últimos 12 meses)
- **Cálculo**: `Σ valorFinal`
- **Cor**: Azul Marinho (#1e478a)

### 2. Receita Confirmada
- **Descrição**: Soma apenas dos orçamentos convertidos em vendas
- **Cálculo**: `Σ valorFinal WHERE convertido = true`
- **Cor**: Verde (#10b981)

### 3. Margem Média Geral (%)
- **Descrição**: Percentual médio de margem líquida
- **Cálculo**: `AVG(margemLiquida)`
- **Cor**: Laranja (#f59e0b)

### 4. Ticket Médio
- **Descrição**: Valor médio por orçamento
- **Cálculo**: `receitaTotal / COUNT(orçamentos)`
- **Cor**: Cinza (#64748b)

### 5. Taxa de Conversão (%)
- **Descrição**: Percentual de orçamentos convertidos em vendas
- **Cálculo**: `(receitaConfirmada / receitaTotal) × 100`
- **Cor**: Azul Claro (#0ea5e9)

## Gráficos

### 1. Bar Chart - Receita vs. Custos Variáveis por Unidade

**Objetivo**: Análise de Margem de Contribuição

**Dados Exibidos**:
- Receita por unidade (DJLM, UTV)
- Custos Variáveis por unidade

**Cores**:
- Receita: Azul Marinho (#1e478a)
- Custos Variáveis: Laranja (#f59e0b)

**Insights**:
- Identifica qual unidade tem melhor margem de contribuição
- Compara performance entre unidades

### 2. Doughnut Chart - Share of Revenue por Espaço

**Objetivo**: Visualizar distribuição de receita entre espaços

**Dados Exibidos**:
- Percentual de receita de cada unidade
- Valor absoluto de receita

**Cores Dinâmicas**:
- Primária: #1e478a
- Secundária: #10b981
- Terciária: #0ea5e9
- Quaternária: #f59e0b

**Insights**:
- Quais salas/unidades carregam o faturamento
- Concentração de receita

### 3. Line Chart - Evolução da Margem Líquida

**Objetivo**: Tendência temporal da lucratividade

**Dados Exibidos**:
- Margem Líquida (%) mês a mês
- Últimos 6 meses

**Cor**: Verde (#10b981) com área preenchida

**Insights**:
- Tendência de lucratividade
- Sazonalidade
- Variações mensais

## Estrutura de Dados

### obterDadosAnaliticos() - Retorno

```javascript
{
    kpis: {
        receitaTotal: number,        // R$ total
        receitaConfirmada: number,   // R$ convertido
        margemMedia: number,         // % média
        ticketMedio: number          // R$ por orçamento
    },
    porUnidade: {
        'UTV': {
            receita: number,
            custoVariavel: number,
            custoFixo: number,
            margemContribuicao: number,
            count: number
        },
        'DJLM': { ... }
    },
    evolucaoMensal: [
        {
            mes: 'YYYY-MM',
            receita: number,
            custos: number,
            margemLiquida: number,
            margemLiquidaPercent: number,
            count: number
        },
        ...
    ]
}
```

## Cálculos Financeiros

### Margem de Contribuição

```
Margem de Contribuição = Receita - Custos Variáveis
```

**Onde**:
- Receita = `valorFinal`
- Custos Variáveis = Mão de obra + Vale Transporte + Transporte App + Refeição
- Custos Fixos = Custo Operacional Base

### Margem Líquida (%)

```
Margem Líquida (%) = ((Receita - Custos Totais) / Receita) × 100
```

## Regras de Negócio

### Filtros Temporais

1. **KPIs e Agregações**: Últimos 12 meses
2. **Evolução Mensal**: Últimos 6 meses

### Validações

1. **Custos Fixos**: Limitados ao subtotal para evitar valores negativos
   ```javascript
   custoFixo = Math.min(custoFixo, subtotalSemMargem)
   ```

2. **Custos Variáveis**: Garantia de não negatividade
   ```javascript
   custoVariavel = Math.max(0, subtotalSemMargem - custoFixo)
   ```

3. **Taxa de Conversão**: Proteção contra divisão por zero
   ```javascript
   taxaConversao = receitaTotal > 0 ? (receitaConfirmada / receitaTotal * 100) : 0
   ```

## Atualização Automática

O dashboard atualiza automaticamente quando:

1. **Novo cálculo realizado**: Após `calcularOrcamento()`
2. **Status de conversão alterado**: Após `alternarStatusVenda()`
3. **Aba ativada**: Ao clicar na aba "Dashboard Executivo"

## Cores Profissionais (Palette)

| Cor | Hex | Uso |
|-----|-----|-----|
| Azul Marinho | #1e478a | Primária, Receita |
| Verde Floresta | #10b981 | Sucesso, Confirmado |
| Laranja | #f59e0b | Warning, Custos |
| Cinza | #64748b | Secundária, Neutro |
| Azul Claro | #0ea5e9 | Info, Complementar |
| Cinza Escuro | #1e293b | Texto |
| Cinza Claro | #f1f5f9 | Background |

## Performance

### Complexidade Algorítmica

- **obterDadosAnaliticos()**: O(n) onde n = número de orçamentos
- **renderizarKPIs()**: O(1) - operações constantes
- **renderizarGraficos()**: O(u) onde u = número de unidades (tipicamente 2-5)

### Otimizações

1. **Filtro de Data**: Reduz dataset antes de agregação
2. **Cache de Gráficos**: Gráficos são atualizados, não recriados
3. **Lazy Loading**: Dashboard só é inicializado quando aba é aberta

## Testes

### Manual Tests

Execute: `node tests/manual/test-dashboard.js`

**Cobertura**:
- ✅ Cálculos de KPIs
- ✅ Agregação por unidade
- ✅ Evolução mensal
- ✅ Validações de segurança
- ✅ Formatação de moeda

## Integração

### Adicionar ao Projeto

1. Incluir Chart.js CDN:
```html
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
```

2. Incluir dashboard.js:
```html
<script src="assets/js/dashboard.js"></script>
```

3. Inicializar quando aba for aberta:
```javascript
if (targetTab === 'dashboard') {
    inicializarDashboard();
}
```

## Troubleshooting

### Problema: Gráficos não aparecem
**Solução**: Verificar se Chart.js foi carregado antes de dashboard.js

### Problema: KPIs mostram 0
**Solução**: Calcular pelo menos um orçamento e marcar como convertido

### Problema: Evolução mensal vazia
**Solução**: Dados precisam ter pelo menos 1 mês de histórico

## Roadmap Futuro

### Melhorias Planejadas

1. **Filtros Interativos**: Filtrar por período, unidade, status
2. **Drill-down**: Clicar em gráfico para ver detalhes
3. **Export**: Exportar dashboard como PDF
4. **Comparativo**: Comparar períodos diferentes
5. **Metas**: Adicionar linhas de meta nos gráficos

## Suporte

Para dúvidas ou problemas:
- Verificar console do navegador (F12) para erros JavaScript
- Executar testes manuais: `node tests/manual/test-dashboard.js`
- Verificar se dados existem no localStorage: `dataManager.obterHistoricoCalculos()`

## Licença

Este componente faz parte do sistema Calculadora de Orçamento CDL/UTV v5.0
