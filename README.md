# Calculadora de Orçamento Estratégico v1.0.0

![Versão](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Cobertura de Testes](https://img.shields.io/badge/test--coverage-%3E70%25-brightgreen.svg)
![Licença](https://img.shields.io/badge/license-MIT-green.svg)

Sistema avançado de **Business Intelligence (BI)** e suporte à decisão para precificação técnica de locação de espaços . A plataforma transforma dados operacionais em inteligência competitiva, garantindo margens sustentáveis e previsibilidade financeira.

## Visão Estratégica e BI
Diferente de ferramentas de cálculo convencionais, este ecossistema integra:
* **Dashboard Executivo**: Visualização em tempo real de KPIs como Receita Total (Pipeline), Taxa de Conversão e Margem Média Geral.
* **Infraestrutura para ML**: Coleta estruturada de dados para modelos de **Regressão Logística**, permitindo identificar preditores de venda como *Lead Time* e elasticidade de desconto.
* **Análise de Viabilidade**: Classificação dinâmica de risco operacional (Verde/Amarelo/Vermelho) baseada no ponto de equilíbrio e margem de contribuição.

## Funcionalidades de Alto Impacto
* **Engenharia de Custos Granular**: Detalhamento de mão de obra (HE 50%, HE 100%), vale-transporte, transporte por app e refeição.
* **Multiplicadores Dinâmicos**: Ajuste automático por turnos (Manhã: 1.00x, Tarde: 1.15x, Noite: 1.40x).
* **Gestão de CRM**: Captura de dados do cliente e monitorização do status de conversão para evitar o **Viés de Sobrevivência** nas análises.
* **Governança**: Geração de PDFs distintos para propostas comerciais (Cliente) e análises gerenciais detalhadas (Superintendência).

## Natureza dos Dados e Variáveis
Para garantir o rigor técnico, o sistema opera com as seguintes variáveis:
* **Quantitativas (Razão)**: Custos base, horas totais, margem líquida e valor final.
* **Qualitativas/Categóricas**: Unidade, espaços e turnos predominantes.
* **Modelagem Preditiva**: Foco em identificar a probabilidade de conversão com base em variáveis de confusão e preditores históricos.

## Qualidade e Validação (QA)
A precisão financeira é garantida por uma suite de mais de 235 testes automatizados (Jest e Playwright), cobrindo falhas de arredondamento e integridade de dados.

## Implicações Estratégicas e Recomendações
* **Vantagem Competitiva**: A utilização de modelos de gestão (como a análise de margem de contribuição) permite uma estratégia de **Liderança em Custo**.
* **Recomendação Acionável**: Monitorizar o desvio do Ticket Médio via Dashboard para identificar anomalias na política de descontos.
---
**Desenvolvido por Maycon A. Bentes** - Inteligência de Mercado, Planejamento e Estudos Estatísticos.
