# 🏢 Calculadora de Orçamento CDL/UTV v5.0

Sistema profissional de cálculo de orçamentos para locação de espaços da CDL (Câmara de Dirigentes Lojistas) e UTV (Universidade Técnica de Vendas) em Manaus.

![Version](https://img.shields.io/badge/version-5.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

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

### Opção 1: Usar Diretamente (Recomendado)

1. **Clone o repositório**:
```bash
git clone https://github.com/mayconabentes-bi/calculadora-orcamento-cdl.git
```

2. **Abra no navegador**:
```bash
cd calculadora-orcamento-cdl
# Abra o arquivo index.html no seu navegador
```

Ou use um servidor local:
```bash
# Python 3
python3 -m http.server 8000

# Node.js (com http-server)
npx http-server -p 8000
```

3. **Acesse**: http://localhost:8000

### Opção 2: Deploy em Produção

#### GitHub Pages
```bash
# Já está pronto! Apenas ative nas configurações
Settings → Pages → Source: main branch
```

#### Netlify
```bash
# Via CLI
npm install -g netlify-cli
netlify deploy --prod
```

#### Servidor Próprio
```bash
# Copie os arquivos para o diretório do servidor
scp -r * user@server:/var/www/calculadora/
```

## 💡 Como Usar

### 1. Calcular um Orçamento

1. Acesse a aba **"📊 Calculadora"**
2. Selecione o espaço desejado
3. Configure duração, dias e turnos
4. Ajuste margem e desconto
5. Clique em **"🚀 Calcular Orçamento"**
6. Exporte em PDF se desejar

### 2. Gerenciar Espaços

1. Vá para **"🏛️ Espaços"**
2. Visualize espaços existentes
3. Adicione novos espaços ou edite existentes
4. Configure custos na aba **"💰 Custos Base"**

### 3. Configurar Sistema

1. Acesse **"⚙️ Configurações"**
2. Gerencie itens extras
3. Ajuste custos de funcionário
4. Faça backup dos dados

## 📖 Documentação

- **[Manual do Usuário](docs/MANUAL_USUARIO.md)**: Guia completo para usuários finais
- **[Manual Técnico](docs/MANUAL_TECNICO.md)**: Documentação para desenvolvedores
- **[Changelog](docs/CHANGELOG.md)**: Histórico de versões e mudanças

## 🎨 Customização

### Alterar Cores

Edite as variáveis CSS em `assets/css/styles.css`:

```css
:root {
    --azul-cdl: #1e478a;
    --verde-cdl: #008444;
    --amarelo-cdl: #ffcc00;
}
```

### Adicionar Novos Campos

Consulte o [Manual Técnico](docs/MANUAL_TECNICO.md) seção "Customização e Extensão".

## 🔧 Desenvolvimento

### Pré-requisitos
- Navegador moderno (Chrome, Firefox, Safari, Edge)
- Editor de código (VS Code recomendado)
- Git

### Estrutura de Desenvolvimento

```javascript
// data-manager.js - Modelo de dados
class DataManager {
  // Gerenciamento de salas, extras, custos
}

// app.js - Controlador e View
function calcularOrcamento() {
  // Lógica de cálculo
}
```

### Executar Testes

```bash
# Validar JavaScript
node --check assets/js/data-manager.js
node --check assets/js/app.js

# Validar JSON
python3 -m json.tool examples/exemplo-orcamento.json
```

## 🐛 Solução de Problemas

### Sistema não carrega
- Limpe o cache do navegador (Ctrl+Shift+Del)
- Verifique a conexão com internet (primeira vez)
- Use modo anônimo para testar

### PDFs não geram
- Verifique se as bibliotecas externas carregaram
- Desabilite bloqueadores de pop-up
- Tente outro navegador

### Dados não salvam
- Verifique se não está em modo anônimo
- Verifique se LocalStorage está habilitado
- Faça backup e reimporte os dados

Consulte o [Manual do Usuário](docs/MANUAL_USUARIO.md) para mais soluções.

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit suas mudanças: `git commit -m 'Adiciona nova funcionalidade'`
4. Push para a branch: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Autores

- **CDL Manaus** - *Projeto inicial* - [CDL Manaus](https://cdlmanaus.org.br)

## 📞 Suporte

- 📧 Email: contato@cdlmanaus.org.br
- 🌐 Website: https://cdlmanaus.org.br
- 📱 Telefone: (92) 3000-0000

## 🙏 Agradecimentos

- Equipe CDL Manaus
- Colaboradores do projeto
- Comunidade de desenvolvedores

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

**Desenvolvido com ❤️ pela equipe CDL Manaus**

**Última atualização**: Dezembro 2025
