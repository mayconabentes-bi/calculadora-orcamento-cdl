# Manual Técnico - Calculadora de Orçamento CDL/UTV v5.0

## 📑 Sumário

1. [Visão Geral da Arquitetura](#visão-geral-da-arquitetura)
2. [Estrutura de Dados e Modelos](#estrutura-de-dados-e-modelos)
3. [Fluxo de Cálculos e Fórmulas](#fluxo-de-cálculos-e-fórmulas)
4. [Sistema de Persistência](#sistema-de-persistência)
5. [Geração de PDFs](#geração-de-pdfs)
6. [API Interna](#api-interna)
7. [Customização e Extensão](#customização-e-extensão)
8. [Deploy e Hospedagem](#deploy-e-hospedagem)
9. [Manutenção e Atualizações](#manutenção-e-atualizações)
10. [Troubleshooting Técnico](#troubleshooting-técnico)

---

## 🏗️ Visão Geral da Arquitetura

### Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────┐
│                   FRONTEND (SPA)                     │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │  index.html  │  │  styles.css  │  │   app.js  │ │
│  │              │  │              │  │           │ │
│  │  Estrutura   │  │   Estilos    │  │  Lógica   │ │
│  │  Semântica   │  │  Responsivos │  │    UI     │ │
│  └──────────────┘  └──────────────┘  └───────────┘ │
│                                           │          │
│                                  ┌────────▼────────┐ │
│                                  │ data-manager.js │ │
│                                  │                 │ │
│                                  │ Gerenciamento   │ │
│                                  │   de Estado     │ │
│                                  └────────┬────────┘ │
│                                           │          │
├───────────────────────────────────────────┼─────────┤
│                 PERSISTÊNCIA              │          │
│                                           ▼          │
│              ┌──────────────────────────────┐       │
│              │    LocalStorage API          │       │
│              │                              │       │
│              │  • Salas/Espaços             │       │
│              │  • Itens Extras              │       │
│              │  • Custos de Funcionário     │       │
│              │  • Multiplicadores           │       │
│              └──────────────────────────────┘       │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│              BIBLIOTECAS EXTERNAS                    │
├─────────────────────────────────────────────────────┤
│  • jsPDF 2.5.1      → Geração de PDFs               │
│  • html2canvas 1.4.1 → Captura de elementos HTML    │
└─────────────────────────────────────────────────────┘
```

### Padrão de Arquitetura

O sistema utiliza um padrão **MVC simplificado** adaptado para frontend:

- **Model (Modelo)**: `data-manager.js` - Gerenciamento de dados e estado
- **View (Visão)**: `index.html` + `styles.css` - Interface do usuário
- **Controller (Controlador)**: `app.js` - Lógica de negócio e interação

### Tecnologias Utilizadas

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| HTML5 | - | Estrutura semântica |
| CSS3 | - | Estilização e layout |
| JavaScript | ES6+ | Lógica da aplicação |
| jsPDF | 2.5.1 | Geração de PDFs |
| html2canvas | 1.4.1 | Captura de elementos |
| LocalStorage | - | Persistência de dados |

### Características Técnicas

- ✅ **SPA (Single Page Application)**: Aplicação de página única
- ✅ **Responsivo**: Mobile-first design
- ✅ **Offline-first**: Funciona sem conexão após carregamento
- ✅ **Zero dependências backend**: Totalmente frontend
- ✅ **Modular**: Código separado por responsabilidade
- ✅ **Performático**: Carregamento rápido e execução eficiente

---

## 📊 Estrutura de Dados e Modelos

### Modelo de Dados Completo

```javascript
{
  salas: [
    {
      id: Number,           // ID único (auto-incrementado)
      nome: String,         // Nome do espaço
      unidade: String,      // "DJLM" ou "UTV"
      capacidade: Number,   // Capacidade em pessoas
      area: Number,         // Área em m² (float)
      custoBase: Number     // Custo base por hora (float)
    }
  ],
  extras: [
    {
      id: Number,           // ID único (auto-incrementado)
      nome: String,         // Nome do item extra
      custo: Number         // Custo por hora (float)
    }
  ],
  custosFuncionario: {
    horaNormal: Number,     // Custo hora normal (R$/h)
    he50: Number,           // Custo HE 50% - Sábado (R$/h)
    he100: Number,          // Custo HE 100% - Domingo (R$/h)
    valeTransporte: Number  // Vale transporte por dia (R$/dia)
  },
  multiplicadoresTurno: {
    manha: Number,          // Multiplicador manhã (default: 1.00)
    tarde: Number,          // Multiplicador tarde (default: 1.15)
    noite: Number           // Multiplicador noite (default: 1.40)
  }
}
```

### Dados Padrão (Default)

```javascript
const dadosPadrao = {
  salas: [
    { id: 1, nome: "Auditório", unidade: "DJLM", 
      capacidade: 120, area: 108, custoBase: 132.72 },
    { id: 2, nome: "Auditório", unidade: "UTV", 
      capacidade: 70, area: 63, custoBase: 77.60 },
    { id: 3, nome: "Sala 2", unidade: "UTV", 
      capacidade: 30, area: 27, custoBase: 35.69 },
    { id: 4, nome: "Sala 3", unidade: "UTV", 
      capacidade: 50, area: 45, custoBase: 55.19 },
    { id: 5, nome: "Sala 4", unidade: "UTV", 
      capacidade: 40, area: 36, custoBase: 43.92 },
    { id: 6, nome: "Sala 7", unidade: "UTV", 
      capacidade: 26, area: 25, custoBase: 29.53 },
    { id: 7, nome: "Sala 8", unidade: "UTV", 
      capacidade: 16, area: 14.4, custoBase: 17.74 },
    { id: 8, nome: "Sala 9", unidade: "UTV", 
      capacidade: 28, area: 25, custoBase: 30.52 },
    { id: 9, nome: "Sala 12", unidade: "UTV", 
      capacidade: 9, area: 8.1, custoBase: 10.02 },
    { id: 10, nome: "Sala 13", unidade: "UTV", 
      capacidade: 8, area: 7.2, custoBase: 8.86 }
  ],
  extras: [
    { id: 1, nome: "Coffee Break Premium", custo: 50.00 },
    { id: 2, nome: "Serviço de Impressão", custo: 15.00 },
    { id: 3, nome: "Gravação Profissional", custo: 80.00 },
    { id: 4, nome: "Transmissão ao Vivo", custo: 120.00 },
    { id: 5, nome: "Flip Chart Extra", custo: 5.00 }
  ],
  custosFuncionario: {
    horaNormal: 13.04,
    he50: 19.56,
    he100: 26.08,
    valeTransporte: 12.00
  },
  multiplicadoresTurno: {
    manha: 1.00,
    tarde: 1.15,
    noite: 1.40
  }
};
```

### Modelo de Cálculo (Resultado)

```javascript
{
  // Métricas de tempo
  horasTotais: Number,        // Total de horas no período
  horasPorMes: Number,        // Horas por mês
  diasPorMes: Number,         // Dias por mês
  
  // Custos base
  custoOperacionalBase: Number,  // Custo base com multiplicadores
  
  // Custos de mão de obra
  custoMaoObraNormal: Number,    // Horas normais
  custoMaoObraHE50: Number,      // Horas extras 50%
  custoMaoObraHE100: Number,     // Horas extras 100%
  custoMaoObraTotal: Number,     // Total mão de obra
  
  // Outros custos
  custoValeTransporte: Number,   // Vale transporte total
  custoExtras: Number,           // Itens extras total
  
  // Subtotais e cálculos
  subtotalSemMargem: Number,     // Soma todos os custos
  valorMargem: Number,           // Valor da margem aplicada
  subtotalComMargem: Number,     // Subtotal + margem
  valorDesconto: Number,         // Valor do desconto
  valorFinal: Number,            // Valor final do orçamento
  
  // Métricas derivadas
  valorPorHora: Number,          // Valor final / horas totais
  economia: Number,              // Desconto concedido
  
  // Percentuais
  margemPercent: Number,         // Margem em %
  descontoPercent: Number        // Desconto em %
}
```

---

## 🧮 Fluxo de Cálculos e Fórmulas

### Fórmula Geral

```
VALOR FINAL = ((CUSTO_OPERACIONAL + MÃO_DE_OBRA + 
                VALE_TRANSPORTE + EXTRAS) × 
               (1 + MARGEM)) × (1 - DESCONTO)
```

### Detalhamento dos Cálculos

#### 1. Cálculo de Horas Totais

```javascript
horasPorTurno = 4; // Cada turno tem 4 horas
turnosSelecionados = (manha ? 1 : 0) + (tarde ? 1 : 0) + (noite ? 1 : 0);
horasPorDia = turnosSelecionados × horasPorTurno;
diasPorMes = diasSemana × 4; // Aproximadamente 4 semanas/mês
horasPorMes = horasPorDia × diasPorMes;
horasTotais = horasPorMes × duracao;
```

**Exemplo**:
- Turnos: Manhã + Tarde = 8 horas/dia
- Dias/semana: 5 dias
- Duração: 6 meses
- Resultado: 8 × 20 × 6 = 960 horas

#### 2. Custo Operacional Base

```javascript
custoOperacionalBase = 0;

if (manha) {
  custoOperacionalBase += custoBase × multiplicadorManha × 
                          4 × diasPorMes × duracao;
}

if (tarde) {
  custoOperacionalBase += custoBase × multiplicadorTarde × 
                          4 × diasPorMes × duracao;
}

if (noite) {
  custoOperacionalBase += custoBase × multiplicadorNoite × 
                          4 × diasPorMes × duracao;
}
```

**Multiplicadores**:
- Manhã: 1,00× (sem acréscimo)
- Tarde: 1,15× (+15%)
- Noite: 1,40× (+40%)

#### 3. Distribuição de Horas de Mão de Obra

A distribuição varia conforme os dias da semana:

**1 dia (Sábado)**:
```javascript
horasNormais = 0;
horasHE50 = horasTotais;      // 100% sábado
horasHE100 = 0;
```

**2 dias (Sábado e Domingo)**:
```javascript
horasNormais = 0;
horasHE50 = horasTotais / 2;   // 50% sábado
horasHE100 = horasTotais / 2;  // 50% domingo
```

**5 dias (Segunda a Sexta)**:
```javascript
horasNormais = horasTotais;    // 100% dias úteis
horasHE50 = 0;
horasHE100 = 0;
```

**7 dias (Todos os dias)**:
```javascript
horasNormais = horasTotais × (5/7);   // 71,4% dias úteis
horasHE50 = horasTotais × (1/7);      // 14,3% sábado
horasHE100 = horasTotais × (1/7);     // 14,3% domingo
```

#### 4. Cálculo de Mão de Obra

```javascript
custoMaoObraNormal = horasNormais × custoHoraNormal;
custoMaoObraHE50 = horasHE50 × custoHE50;
custoMaoObraHE100 = horasHE100 × custoHE100;
custoMaoObraTotal = custoMaoObraNormal + 
                    custoMaoObraHE50 + 
                    custoMaoObraHE100;
```

**Custos padrão**:
- Hora normal: R$ 13,04
- HE 50%: R$ 19,56 (13,04 × 1,5)
- HE 100%: R$ 26,08 (13,04 × 2,0)

#### 5. Vale Transporte

```javascript
diasTotais = diasPorMes × duracao;
custoValeTransporte = diasTotais × valorValeTransporte;
```

**Padrão**: R$ 12,00/dia

#### 6. Itens Extras

```javascript
custoExtras = 0;
extras.forEach(extra => {
  if (extraSelecionado) {
    custoExtras += extra.custo × horasTotais;
  }
});
```

#### 7. Subtotal sem Margem

```javascript
subtotalSemMargem = custoOperacionalBase + 
                    custoMaoObraTotal + 
                    custoValeTransporte + 
                    custoExtras;
```

#### 8. Aplicação de Margem

```javascript
margemDecimal = margemPercent / 100;
valorMargem = subtotalSemMargem × margemDecimal;
subtotalComMargem = subtotalSemMargem + valorMargem;
```

#### 9. Aplicação de Desconto

```javascript
descontoDecimal = descontoPercent / 100;
valorDesconto = subtotalComMargem × descontoDecimal;
valorFinal = subtotalComMargem - valorDesconto;
```

#### 10. Métricas Derivadas

```javascript
valorPorHora = valorFinal / horasTotais;
economia = valorDesconto;
margemLiquida = ((valorFinal - subtotalSemMargem) / valorFinal) × 100;
markup = ((subtotalComMargem / subtotalSemMargem) - 1) × 100;
```

### Exemplo Completo de Cálculo

**Parâmetros**:
- Espaço: UTV - Sala 3 (Custo base: R$ 55,19/h)
- Duração: 6 meses
- Dias/semana: 5 dias (segunda a sexta)
- Turnos: Manhã + Tarde
- Margem: 30%
- Desconto: 20%
- Sem extras

**Cálculos**:
1. Horas: 8h/dia × 20 dias/mês × 6 meses = 960h
2. Custo operacional:
   - Manhã: 55,19 × 1,00 × 4 × 20 × 6 = R$ 26.491,20
   - Tarde: 55,19 × 1,15 × 4 × 20 × 6 = R$ 30.464,88
   - **Total**: R$ 56.956,08
3. Mão de obra (100% normal): 960 × 13,04 = R$ 12.518,40
4. Vale transporte: 120 dias × 12,00 = R$ 1.440,00
5. Extras: R$ 0,00
6. **Subtotal sem margem**: R$ 70.914,48
7. Margem (30%): R$ 21.274,34
8. **Subtotal com margem**: R$ 92.188,82
9. Desconto (20%): R$ 18.437,76
10. **VALOR FINAL**: R$ 73.751,06

**Métricas**:
- Valor/hora: R$ 76,82
- Margem líquida: 3,84%
- Markup: 30%

---

## 💾 Sistema de Persistência

### LocalStorage API

O sistema utiliza a API LocalStorage do navegador para persistência de dados.

#### Estrutura no LocalStorage

```javascript
Key: "cdl-calculadora-v5-data"
Value: {
  salas: [...],
  extras: [...],
  custosFuncionario: {...},
  multiplicadoresTurno: {...}
}
```

#### Implementação no DataManager

**Salvar dados**:
```javascript
salvarDados() {
  try {
    const jsonString = JSON.stringify(this.dados);
    localStorage.setItem(this.storageKey, jsonString);
    return true;
  } catch (error) {
    console.error('Erro ao salvar:', error);
    return false;
  }
}
```

**Carregar dados**:
```javascript
carregarDados() {
  try {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      const dados = JSON.parse(stored);
      // Validação de estrutura
      if (dados.salas && dados.extras && dados.custosFuncionario) {
        return dados;
      }
    }
  } catch (error) {
    console.error('Erro ao carregar:', error);
  }
  return this.obterDadosPadrao();
}
```

#### Limitações do LocalStorage

- **Tamanho máximo**: ~5-10MB (varia por navegador)
- **Sincrono**: Operações bloqueiam a thread principal
- **Domínio específico**: Dados não compartilhados entre domínios
- **Limpeza**: Dados podem ser limpos pelo usuário

#### Boas Práticas

1. **Validação**: Sempre validar dados ao carregar
2. **Try-catch**: Envolver operações em try-catch
3. **Fallback**: Ter dados padrão como fallback
4. **Versionamento**: Incluir versão na chave (v5)
5. **Tamanho**: Monitorar tamanho dos dados

---

## 📄 Geração de PDFs

### Biblioteca jsPDF

**Versão**: 2.5.1  
**CDN**: `https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js`

### Estrutura de Geração

```javascript
const { jsPDF } = window.jspdf;
const doc = new jsPDF({
  orientation: 'portrait',  // Orientação
  unit: 'mm',              // Unidade de medida
  format: 'a4'             // Formato
});

// Adicionar conteúdo
doc.setFontSize(20);
doc.text('Título', x, y);

// Salvar
doc.save('arquivo.pdf');
```

### PDF Cliente - Proposta Comercial

**Conteúdo**:
1. **Header**: Logo CDL/UTV + Título
2. **Informações do Espaço**: Nome, capacidade, área
3. **Detalhes do Contrato**: Duração, dias, turnos
4. **Valores**: Valor/hora, desconto, economia
5. **Valor Final**: Destaque visual
6. **Footer**: Validade e informações institucionais

**Características**:
- ✅ Visual limpo e profissional
- ✅ Cores institucionais CDL
- ✅ Informações essenciais
- ✅ Formatação para apresentação

### PDF Superintendência - Análise Financeira

**Conteúdo adicional**:
1. Breakdown completo de custos
2. Detalhamento de mão de obra
3. Indicadores financeiros (margem líquida, markup)
4. Observações técnicas
5. Marcação de confidencialidade

**Características**:
- ✅ Detalhamento completo
- ✅ Análise financeira profunda
- ✅ Uso interno
- ✅ Formato de relatório gerencial

### Customização de PDFs

Para customizar os PDFs, edite as funções em `app.js`:

**Cores**:
```javascript
doc.setTextColor(30, 71, 138);  // Azul CDL (RGB)
doc.setFillColor(30, 71, 138);  // Fundo azul
```

**Fontes**:
```javascript
doc.setFontSize(14);
doc.setFont(undefined, 'bold');
doc.setFont(undefined, 'normal');
```

**Posicionamento**:
```javascript
doc.text('Texto', x, y, { align: 'center' });
doc.text('Texto', x, y, { align: 'right' });
```

**Linhas e retângulos**:
```javascript
doc.line(x1, y1, x2, y2);
doc.rect(x, y, width, height, 'F');  // 'F' = filled
```

---

## 🔌 API Interna

### Classe DataManager

#### Métodos de Salas

```javascript
// Obter todas as salas
dataManager.obterSalas(): Array<Sala>

// Obter sala por ID
dataManager.obterSalaPorId(id: Number): Sala | undefined

// Adicionar sala
dataManager.adicionarSala(sala: Object): Sala

// Atualizar sala
dataManager.atualizarSala(id: Number, dados: Object): Boolean

// Remover sala
dataManager.removerSala(id: Number): Boolean
```

#### Métodos de Extras

```javascript
// Obter todos os extras
dataManager.obterExtras(): Array<Extra>

// Obter extra por ID
dataManager.obterExtraPorId(id: Number): Extra | undefined

// Adicionar extra
dataManager.adicionarExtra(extra: Object): Extra

// Atualizar extra
dataManager.atualizarExtra(id: Number, dados: Object): Boolean

// Remover extra
dataManager.removerExtra(id: Number): Boolean
```

#### Métodos de Custos

```javascript
// Obter custos do funcionário
dataManager.obterCustosFuncionario(): Object

// Atualizar custos do funcionário
dataManager.atualizarCustosFuncionario(custos: Object): Boolean

// Obter multiplicadores de turno
dataManager.obterMultiplicadoresTurno(): Object
```

#### Métodos de Backup

```javascript
// Exportar dados como JSON
dataManager.exportarDados(): String

// Importar dados de JSON
dataManager.importarDados(jsonString: String): Boolean

// Restaurar dados padrão
dataManager.restaurarPadrao(): Boolean

// Limpar todos os dados
dataManager.limparDados(): Boolean
```

### Funções Utilitárias Globais

```javascript
// Exibir notificação
mostrarNotificacao(mensagem: String, duracao?: Number): void

// Formatar valor como moeda
formatarMoeda(valor: Number): String

// Formatar número com 2 decimais
formatarNumero(valor: Number): String
```

### Exemplo de Uso da API

```javascript
// Adicionar nova sala
const novaSala = dataManager.adicionarSala({
  nome: "Sala 15",
  unidade: "UTV",
  capacidade: 25,
  area: 22.5,
  custoBase: 28.50
});

// Atualizar custo
dataManager.atualizarSala(novaSala.id, {
  custoBase: 30.00
});

// Obter todas as salas
const salas = dataManager.obterSalas();

// Exportar backup
const backup = dataManager.exportarDados();
console.log(backup); // JSON string

// Notificar usuário
mostrarNotificacao('Sala adicionada com sucesso!', 3000);
```

---

## 🎨 Customização e Extensão

### Customizar Cores

Edite as variáveis CSS em `styles.css`:

```css
:root {
  --azul-cdl: #1e478a;        /* Azul principal */
  --azul-escuro: #1e3c72;     /* Azul escuro */
  --azul-claro: #2d5aa6;      /* Azul claro */
  --verde-cdl: #008444;       /* Verde institucional */
  --amarelo-cdl: #ffcc00;     /* Amarelo institucional */
}
```

### Adicionar Novos Campos ao Modelo

**1. Atualizar `data-manager.js`**:
```javascript
obterDadosPadrao() {
  return {
    salas: [
      {
        id: 1,
        nome: "Sala",
        // Adicionar novo campo
        codigoInterno: "S001",
        andar: 1
      }
    ]
  }
}
```

**2. Atualizar interface em `index.html`**:
```html
<input type="text" id="novo-espaco-codigo" placeholder="Código">
```

**3. Atualizar função de adição em `app.js`**:
```javascript
function adicionarNovoEspaco() {
  const codigo = document.getElementById('novo-espaco-codigo').value;
  // Incluir no objeto
  const novaSala = {
    // ...campos existentes
    codigoInterno: codigo
  };
}
```

### Adicionar Nova Aba

**1. HTML** - Adicionar botão e conteúdo:
```html
<!-- Botão na navegação -->
<button class="tab-btn" data-tab="nova-aba">📈 Nova Aba</button>

<!-- Conteúdo da aba -->
<div id="nova-aba" class="tab-content">
  <div class="card">
    <h2 class="card-title">📈 Título da Nova Aba</h2>
    <!-- Conteúdo aqui -->
  </div>
</div>
```

**2. JavaScript** - Sistema de tabs já funciona automaticamente

**3. CSS** - Usar classes existentes ou adicionar novas

### Estender Cálculos

Para adicionar novos fatores ao cálculo:

```javascript
function calcularValores(/* parâmetros */) {
  // ... cálculos existentes ...
  
  // Adicionar novo fator
  const impostos = subtotalSemMargem * 0.10; // 10% de impostos
  
  // Incluir no subtotal
  const novoSubtotal = subtotalSemMargem + impostos;
  
  // Retornar no resultado
  return {
    // ... campos existentes ...
    impostos: impostos
  };
}
```

E exibir na interface:

```javascript
function exibirResultados(resultado) {
  // ... código existente ...
  
  // Adicionar novo campo
  document.getElementById('impostos').textContent = 
    formatarMoeda(resultado.impostos);
}
```

---

## 🚀 Deploy e Hospedagem

### Opção 1: GitHub Pages (Recomendado)

**Vantagens**: Gratuito, SSL automático, fácil deploy

**Passos**:
1. Criar repositório no GitHub
2. Fazer push do código
3. Ir em Settings → Pages
4. Selecionar branch `main` e pasta `/` (root)
5. Salvar

**URL**: `https://[usuario].github.io/[repo]/`

### Opção 2: Netlify

**Vantagens**: Deploy automático, SSL, CDN global

**Passos**:
1. Criar conta no Netlify
2. Conectar repositório GitHub
3. Configurar:
   - Build command: (vazio)
   - Publish directory: `/`
4. Deploy

### Opção 3: Vercel

**Vantagens**: Performance, analytics, preview deployments

**Passos**:
1. Instalar Vercel CLI: `npm i -g vercel`
2. Na pasta do projeto: `vercel`
3. Seguir instruções

### Opção 4: Servidor Próprio

**Requisitos**:
- Servidor web (Apache, Nginx)
- SSL (Let's Encrypt)
- Domínio

**Configuração Apache**:
```apache
<VirtualHost *:80>
    ServerName calculadora.cdlmanaus.org.br
    DocumentRoot /var/www/calculadora
    
    <Directory /var/www/calculadora>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    ErrorLog ${APACHE_LOG_DIR}/calculadora-error.log
    CustomLog ${APACHE_LOG_DIR}/calculadora-access.log combined
</VirtualHost>
```

**Configuração Nginx**:
```nginx
server {
    listen 80;
    server_name calculadora.cdlmanaus.org.br;
    root /var/www/calculadora;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache para assets
    location ~* \.(css|js|jpg|png|gif|ico|woff|woff2|ttf|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Configurações Recomendadas

**1. HTTPS**: Sempre usar SSL

**2. Cache**: Configurar cache para assets estáticos

**3. Compressão**: Habilitar gzip/brotli

**4. Security Headers**:
```
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

---

## 🔧 Manutenção e Atualizações

### Versionamento Semântico

O projeto segue [Semantic Versioning](https://semver.org/):

- **MAJOR** (5.x.x): Mudanças incompatíveis
- **MINOR** (x.0.x): Novas funcionalidades compatíveis
- **PATCH** (x.x.0): Correções de bugs

### Procedimento de Atualização

**1. Backup**: Antes de qualquer atualização
```javascript
// Usuários devem exportar dados
dataManager.exportarDados();
```

**2. Testar**: Em ambiente de staging

**3. Deploy**: Após validação

**4. Comunicar**: Avisar usuários sobre mudanças

### Migração de Dados

Se a estrutura de dados mudar entre versões:

```javascript
// Função de migração
function migrarDados_v4_para_v5(dadosV4) {
  return {
    salas: dadosV4.espacos.map(espaco => ({
      id: espaco.id,
      nome: espaco.nome,
      // Adicionar novos campos com valores padrão
      unidade: espaco.local || "UTV",
      // Manter campos existentes
      capacidade: espaco.capacidade
    })),
    // ... resto da migração
  };
}
```

### Monitoramento

**Métricas a monitorar**:
- Taxa de erro (console)
- Tempo de carregamento
- Uso de LocalStorage
- Compatibilidade de navegadores

**Google Analytics** (opcional):
```html
<!-- Adicionar no <head> do index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=UA-XXXXX-Y"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'UA-XXXXX-Y');
</script>
```

### Log de Erros

Implementar sistema de log:

```javascript
// Adicionar no app.js
window.addEventListener('error', function(e) {
  console.error('Erro capturado:', {
    message: e.message,
    filename: e.filename,
    lineno: e.lineno,
    colno: e.colno
  });
  
  // Opcional: Enviar para serviço de log
  // logService.send(errorData);
});
```

---

## 🔍 Troubleshooting Técnico

### Problema: LocalStorage não funciona

**Diagnóstico**:
```javascript
if (typeof(Storage) !== "undefined") {
  console.log("LocalStorage suportado");
} else {
  console.log("LocalStorage NÃO suportado");
}
```

**Soluções**:
1. Verificar se não está em modo privado
2. Verificar permissões do navegador
3. Implementar fallback com cookies ou sessionStorage

### Problema: PDF não gera

**Diagnóstico**:
```javascript
console.log(typeof window.jspdf); // Deve retornar "object"
```

**Soluções**:
1. Verificar se biblioteca carregou (console)
2. Verificar conexão com CDN
3. Usar versão local da biblioteca
4. Verificar bloqueio de pop-ups

### Problema: Dados corrompidos

**Diagnóstico**:
```javascript
const stored = localStorage.getItem('cdl-calculadora-v5-data');
console.log(stored);
try {
  JSON.parse(stored);
  console.log("JSON válido");
} catch(e) {
  console.log("JSON inválido:", e);
}
```

**Solução**:
```javascript
// Limpar dados corrompidos
dataManager.restaurarPadrao();
```

### Problema: Cálculos incorretos

**Debug**:
```javascript
// Adicionar logs no calcularValores()
function calcularValores(/* params */) {
  console.log('=== INÍCIO CÁLCULO ===');
  console.log('Sala:', sala);
  console.log('Duração:', duracao);
  console.log('Horas totais:', horasTotais);
  // ... mais logs
  console.log('=== FIM CÁLCULO ===');
  return resultado;
}
```

### Problema: Interface não atualiza

**Soluções**:
1. Limpar cache do navegador (Ctrl+Shift+Del)
2. Hard reload (Ctrl+Shift+R)
3. Verificar console por erros JavaScript
4. Verificar se eventos estão sendo disparados

### Ferramentas de Debug

**1. Console do navegador** (F12):
```javascript
// Ver dados atuais
console.log(dataManager.dados);

// Ver último cálculo
console.log(ultimoCalculoRealizado);

// Testar funções
calcularOrcamento();
```

**2. LocalStorage Inspector** (DevTools → Application → Local Storage)

**3. Network tab**: Verificar carregamento de recursos

**4. Performance tab**: Analisar performance

---

## 📚 Referências e Recursos

### Documentação Oficial

- [MDN Web Docs](https://developer.mozilla.org/)
- [jsPDF Documentation](https://github.com/parallax/jsPDF)
- [LocalStorage API](https://developer.mozilla.org/pt-BR/docs/Web/API/Window/localStorage)

### Ferramentas de Desenvolvimento

- [VS Code](https://code.visualstudio.com/)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- [Git](https://git-scm.com/)

### Comunidade

- Stack Overflow
- GitHub Issues
- MDN Community

---

## 📞 Suporte Técnico

Para questões técnicas ou contribuições:

1. **Documentação**: Consulte este manual
2. **Issues**: Abra uma issue no GitHub
3. **Email**: contato-ti@cdlmanaus.org.br
4. **Código**: Analise o código comentado

---

**Versão do Manual**: 5.0.0  
**Última Atualização**: 17 de dezembro de 2025  
**Mantenedor**: Equipe de TI - CDL Manaus

---

© 2025 CDL Manaus. Todos os direitos reservados.
