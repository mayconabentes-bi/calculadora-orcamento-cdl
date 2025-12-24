# Calculadora de Orçamento Estratégico CDL/UTV v1.0

![Versão](https://img.shields.io/badge/version-5.0.0-blue.svg)
![Cobertura](https://img.shields.io/badge/test--coverage-%3E70%25-brightgreen.svg)
![Licença](https://img.shields.io/badge/license-MIT-green.svg)

Sistema avançado de Business Intelligence (BI) para precificação técnica e gestão de orçamentos de locação de espaços (CDL e UTV) em Manaus. 

## 🚀 Visão Estratégica
Diferente de calculadoras convencionais, este sistema integra **análise de custos operacionais** e **margens de rentabilidade**, permitindo que a tomada de decisão seja baseada em evidências sólidas e dados financeiros precisos.

**Acesso Online:** [Link para Produção](https://mayconabentes-bi.github.io/calculadora-orcamento-cdl/)

## 🛠 Funcionalidades de Alto Impacto
* **Engenharia de Custos**: Cálculo automatizado que considera custos base, multiplicadores de turno e encargos de mão de obra (horas extras e vale transporte).
* **Inteligência Financeira**: Configuração dinâmica de margem de lucro e aplicação de gatilhos de desconto por fidelidade.
* **Governança e Compliance**: Geração de PDFs distintos para clientes (proposta comercial) e superintendência (análise gerencial de custos).
* **Arquitetura Robusta**: Sistema 100% frontend com persistência em LocalStorage, garantindo privacidade e agilidade sem dependência de servidores externos.

## 📊 Estrutura do Ecossistema
O projeto é organizado para garantir escalabilidade e fácil manutenção:
* `/assets/js/app.js`: Core engine de lógica de negócio (40KB).
* `/assets/js/data-manager.js`: Gestão de persistência e integridade de dados.
* `/docs/`: Manuais técnico e de usuário focados em transferência de conhecimento.
* `/tests/`: Suite rigorosa com mais de 235 testes (Unitários, Integração e E2E).

## 🧪 Qualidade e Validação (QA)
Para garantir a precisão dos cálculos financeiros, o sistema utiliza um pipeline de testes automatizados:
```bash
# Executar suite completa de validação
npm run test:all
