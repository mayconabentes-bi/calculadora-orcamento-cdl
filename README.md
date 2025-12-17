# 🏢 Calculadora de Orçamento CDL/UTV v5.0

Sistema profissional de cálculo de orçamentos para locação de espaços da CDL  e UTV em Manaus.

![Version](https://img.shields.io/badge/version-5.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## 🌐 Acesso Online

**🔗 Acesse o sistema:** [https://mayconabentes-bi.github.io/calculadora-orcamento-cdl/](https://mayconabentes-bi.github.io/calculadora-orcamento-cdl/)

O sistema está hospedado no GitHub Pages e pode ser acessado diretamente pelo navegador, sem necessidade de instalação.

## 📋 Sobre o Projeto

Sistema web completo para calcular orçamentos de locação de espaços, considerando múltiplos fatores como:
- ✅ Custos operacionais base por espaço
- ✅ Multiplicadores de turno (manhã, tarde, noite)
- ✅ Cálculo de mão de obra com horas extras
- ✅ Vale transporte
- ✅ Itens extras personalizáveis
- ✅ Margem de lucro configurável
- ✅ Descontos por fidelidade
- ✅ Geração de PDFs profissionais (cliente e superintendência)

## 🚀 Funcionalidades

### Para Usuários
- 📊 **Calculadora Intuitiva**: Interface amigável com cálculo automático
- 🏛️ **Gestão de Espaços**: CRUD completo de salas/espaços
- 💰 **Configuração de Custos**: Ajuste de custos base por espaço
- 🎁 **Itens Extras**: Adicione e gerencie itens adicionais
- 📄 **Exportação de PDFs**: Propostas comerciais e análises gerenciais
- 💾 **Backup/Restore**: Exportação e importação de dados
- 📱 **Responsivo**: Funciona em desktop, tablet e mobile

### Para Desenvolvedores
- 🏗️ **Arquitetura Modular**: Código separado por responsabilidade
- 📦 **Zero Dependências Backend**: 100% frontend
- 💾 **Persistência Local**: LocalStorage para dados
- 🎨 **CSS Customizável**: Variáveis CSS para fácil personalização
- 📚 **Bem Documentado**: Manuais técnico e do usuário completos
- 🔧 **Fácil Manutenção**: Código limpo e comentado

## 📁 Estrutura do Projeto

```
calculadora-orcamento-cdl/
├── index.html                  # Página principal
├── .gitignore                  # Arquivos ignorados pelo Git
├── README.md                   # Este arquivo
├── LICENSE                     # Licença do projeto
│
├── assets/
│   ├── css/
│   │   └── styles.css         # Estilos (21KB)
│   ├── js/
│   │   ├── app.js             # Lógica principal (40KB)
│   │   └── data-manager.js    # Gerenciamento de dados (12KB)
│   └── images/
│       └── .gitkeep           # Mantém diretório no Git
│
├── docs/
│   ├── MANUAL_USUARIO.md      # Manual do usuário (20KB)
│   ├── MANUAL_TECNICO.md      # Documentação técnica (32KB)
│   └── CHANGELOG.md           # Histórico de versões
│
└── examples/
    └── exemplo-orcamento.json # Exemplo de dados exportados
```

## 🛠️ Tecnologias Utilizadas

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| HTML5 | - | Estrutura |
| CSS3 | - | Estilos |
| JavaScript | ES6+ | Lógica |
| jsPDF | 2.5.1 | Geração de PDFs |
| html2canvas | 1.4.1 | Captura de elementos |
| LocalStorage | - | Persistência |

## 📦 Instalação e Uso

### 🌐 Opção 1: Acesso Online (Mais Rápido)

**Simplesmente acesse o link:**
👉 **[https://mayconabentes-bi.github.io/calculadora-orcamento-cdl/](https://mayconabentes-bi.github.io/calculadora-orcamento-cdl/)**

O sistema está hospedado no GitHub Pages e funciona diretamente no navegador!

## 🔮 Roadmap

### Versão 5.1 (Planejada)
- [ ] Modo escuro
- [ ] Histórico de orçamentos
- [ ] Comparação de propostas
- [ ] Templates personalizados

### Versão 5.2 (Planejada)
- [ ] Multi-idioma
- [ ] Gráficos e visualizações
- [ ] Relatórios avançados

### Versão 6.0 (Futura)
- [ ] Backend com Node.js
- [ ] Sistema de usuários
- [ ] Dashboard administrativo
- [ ] API RESTful

---

**Desenvolvido por Maycon A. Bentes
- Inteligência de Mercado, Planejamwento e Estudos Estatísticos**

**Última atualização**: Dezembro 2025
