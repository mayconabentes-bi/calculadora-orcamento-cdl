# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [5.0.0] - 2025-12-17

### Adicionado
- Sistema completo de cálculo de orçamentos para locação de espaços
- Interface com 4 abas: Calculadora, Espaços, Custos Base e Configurações
- 10 espaços pré-configurados (DJLM e UTV)
- Sistema de cálculo por turnos (manhã, tarde, noite) com multiplicadores
- Cálculo automático de horas extras (50% e 100%)
- Sistema de margem de lucro configurável (10% a 60%)
- Sistema de descontos por fidelidade (0% a 50%)
- 5 itens extras personalizáveis
- Exportação de PDF versão cliente (proposta comercial)
- Exportação de PDF versão superintendência (análise de custos)
- Sistema de impressão
- Gerenciamento completo de espaços (CRUD)
- Gerenciamento de custos base por espaço
- Sistema de backup e importação de dados (JSON)
- Persistência de dados em LocalStorage
- Interface responsiva (mobile-first)
- Notificações de feedback ao usuário

### Funcionalidades Principais
- Cálculo detalhado incluindo custos operacionais, mão de obra e vale transporte
- Análise financeira com indicadores (valor por hora, margem líquida, economia)
- Proposta comercial formatada para apresentação ao cliente
- Relatório gerencial detalhado para superintendência
- Sistema de aprovações multinível

### Dados Padrão
- DJLM - Auditório: 120 pessoas, 108m², R$132.72/h
- UTV - Auditório: 70 pessoas, 63m², R$77.60/h
- UTV - Sala 2: 30 pessoas, 27m², R$35.69/h
- UTV - Sala 3: 50 pessoas, 45m², R$55.19/h
- UTV - Sala 4: 40 pessoas, 36m², R$43.92/h
- UTV - Sala 7: 26 pessoas, 25m², R$29.53/h
- UTV - Sala 8: 16 pessoas, 14.4m², R$17.74/h
- UTV - Sala 9: 28 pessoas, 25m², R$30.52/h
- UTV - Sala 12: 9 pessoas, 8.1m², R$10.02/h
- UTV - Sala 13: 8 pessoas, 7.2m², R$8.86/h

### Tecnologias
- HTML5, CSS3, JavaScript ES6+
- jsPDF 2.5.1
- html2canvas 1.4.1
- LocalStorage API
- CSS Grid e Flexbox
- CSS Custom Properties (variáveis)

### Arquitetura
- Separação completa de responsabilidades (HTML, CSS, JS)
- Padrão MVC simplificado
- DataManager para gerenciamento de estado
- Sistema de notificações centralizado
- Funções utilitárias reutilizáveis

### Compatibilidade
- Navegadores modernos (Chrome, Firefox, Safari, Edge)
- Responsivo para desktop, tablet e mobile
- Suporte a impressão e geração de PDF
- Funciona offline após primeiro carregamento

### Segurança
- Dados armazenados localmente (sem servidor)
- Validação de inputs
- Sanitização de dados importados
- Backup automático em LocalStorage

### Performance
- Carregamento rápido (sem dependências pesadas)
- Cálculos otimizados
- Renderização eficiente
- Lazy loading de recursos

## Versionamento Futuro

### [5.1.0] - Planejado
- Modo escuro
- Histórico de orçamentos
- Comparação de propostas
- Templates personalizados
- Exportação para Excel

### [5.2.0] - Planejado
- Multi-idioma (inglês, espanhol)
- Gráficos e visualizações
- Relatórios avançados
- Integração com API

### [6.0.0] - Planejado
- Backend com Node.js
- Banco de dados
- Sistema de usuários
- Dashboard administrativo
- API RESTful

## Suporte e Manutenção

Este projeto está em manutenção ativa. Para reportar bugs ou sugerir melhorias:
- Abra uma issue no repositório
- Entre em contato com a equipe de TI da CDL
- Consulte a documentação técnica em `docs/MANUAL_TECNICO.md`

---

**Nota**: Este projeto segue as melhores práticas de desenvolvimento web e está em constante evolução para atender às necessidades da CDL/UTV.
