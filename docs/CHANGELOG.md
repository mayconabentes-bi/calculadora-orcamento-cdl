# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adhere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [5.2.0] - 2025-12-22

### Adicionado
- **Módulo de Inteligência Preditiva**: Sistema de alertas de viabilidade em tempo real
  - Alerta de Ponto de Equilíbrio com classificação de risco operacional
  - Classificação visual (🔴 Alto, 🟡 Médio, 🟢 Baixo) baseada em percentual de custos variáveis
  - Detecção automática de propostas deficitárias (margem líquida negativa)
  - Alertas quando valor final está abaixo do ponto de equilíbrio
- **Visualização de Estrutura de Custos**: Gráfico de barras em CSS puro
  - Representação visual de Custos Fixos (Azul), Variáveis (Laranja) e Extras (Roxo)
  - Cálculo automático de percentuais
  - Animações suaves na atualização dos dados
- **Exportação CSV**: Sistema completo de exportação de dados
  - Exportação do cálculo atual com detalhamento completo
  - Exportação do histórico de cálculos (últimos 100)
  - Formato UTF-8 com BOM para compatibilidade com Excel
  - Análise de elasticidade de preço e tendências
- **Histórico de Cálculos**: Armazenamento automático no LocalStorage
  - Limite de 100 registros mais recentes
  - Dados incluem: ID, data, espaço, valores, margem líquida, classificação de risco
  - Schema validado para prevenir corrupção de dados
- **Loading Skeleton**: Estados de carregamento para geração de PDFs
  - Overlay semi-transparente com spinner animado
  - Mensagem de feedback para o usuário
  - Melhora percepção de performance em dispositivos móveis
- **Configurações de BI**: Sistema de configuração de visualizações
  - Controle de exibição de alerta de viabilidade
  - Controle de exibição de estrutura de custos
  - Controle de exibição de classificação de risco
  - Persistência no LocalStorage

### Melhorado
- **Validação de Schema**: Suporte para novas configurações de BI
  - Validação de configuracoes.visualizacaoBI
  - Validação de historicoCalculos
  - Proteção contra corrupção de dados
- **Complexidade Algorítmica**: Mantida linear O(n)
  - exibirAlertaViabilidade(): O(1) - operações constantes
  - exibirEstruturaCustos(): O(1) - operações constantes
  - exportarHistoricoCSV(): O(n) - linear sobre histórico (máx 100)
- **Performance**: Otimizações para dispositivos de lojistas
  - Cálculos eficientes sem loops aninhados
  - Atualização DOM otimizada
  - Histórico limitado a 100 registros

### Técnico
- **Novas Funções em data-manager.js**:
  - `adicionarCalculoHistorico(calculo)`: Adiciona cálculo ao histórico
  - `calcularClassificacaoRisco(resultado)`: Calcula classificação de risco
  - `obterHistoricoCalculos()`: Obtém histórico de cálculos
  - `limparHistoricoCalculos()`: Limpa histórico
  - `exportarHistoricoCSV()`: Exporta histórico em CSV
  - `exportarCalculoAtualCSV(calculoAtual)`: Exporta cálculo atual em CSV
  - `obterConfiguracoesBI()`: Obtém configurações de BI
  - `atualizarConfiguracoesBI(novasConfigs)`: Atualiza configurações de BI
- **Novas Funções em app.js**:
  - `exibirAlertaViabilidade(resultado)`: Exibe alertas de viabilidade
  - `exibirEstruturaCustos(resultado)`: Exibe gráfico de custos
  - `exportarCSV()`: Gerencia exportação CSV
  - `baixarCSV(conteudoCSV, nomeArquivo)`: Realiza download do CSV
  - `mostrarLoading()`: Mostra overlay de carregamento
  - `esconderLoading()`: Esconde overlay de carregamento
  - `exportarPDFClienteComLoading()`: Wrapper para PDF cliente com loading
  - `exportarPDFSuperintendenciaComLoading()`: Wrapper para PDF superintendência com loading

### Compatibilidade
- Mantém compatibilidade com dados existentes
- Migração automática de dados antigos
- Sem breaking changes

## [5.1.0] - 2025-12-19

### Adicionado
- **PDF Superintendência - Seção 3.1**: Breakdown detalhado de mão de obra com custos individuais por funcionário
  - Lista cada funcionário com horas normais, HE 50%, HE 100%, vale transporte, transporte app e refeições
  - Subtotal por funcionário para análise granular
  - Paginação automática quando há muitos funcionários
- **PDF Superintendência - Seção 5**: Análise de viabilidade financeira
  - Estrutura de custos (fixos vs variáveis com percentuais)
  - Margem de contribuição (valor e percentual)
  - Ponto de equilíbrio
  - Análise de risco operacional com classificação colorida (🔴 Alto >60%, 🟡 Médio 40-60%, 🟢 Baixo <40%)
- **PDF Superintendência**: Seção de aprovação gerencial com três caixas de assinatura
  - Analista Responsável
  - Coordenação
  - Superintendência
- Função auxiliar `verificarEAdicionarPagina()` para gerenciamento automático de paginação

### Melhorado
- PDF Superintendência agora possui 6 seções numeradas (adicionadas seções 3.1 e 5)
- Análise financeira mais completa com indicadores de viabilidade do negócio
- Documentação gerencial mais profissional com área para aprovações

### Corrigido
- Proteção contra divisão por zero no cálculo de ponto de equilíbrio
- Removida redundância no cálculo de dias de vale transporte

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
