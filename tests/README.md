# 🧪 Suite de Testes - Calculadora de Orçamento CDL/UTV

## 📋 Visão Geral

Esta é a suite completa de testes automatizados para a Calculadora de Orçamento CDL/UTV v5.0. A suite inclui:

- **145+ Testes Unitários** - Testam funções e classes isoladamente
- **35+ Testes de Integração** - Testam fluxos completos e interações entre componentes
- **55+ Testes E2E** - Testam a aplicação completa no navegador

**Total: 235+ testes automatizados**

## 🗂️ Estrutura de Diretórios

```
tests/
├── unit/                          # Testes unitários
│   ├── data-manager.test.js       # Testes do DataManager (60+ testes)
│   ├── calculations.test.js       # Testes de cálculos (55+ testes)
│   └── utils.test.js              # Testes de utilitários (30+ testes)
│
├── integration/                   # Testes de integração
│   ├── calculator-flow.test.js    # Fluxo completo da calculadora (20+ testes)
│   └── crud-operations.test.js    # Operações CRUD (15+ testes)
│
├── e2e/                           # Testes End-to-End (Playwright)
│   ├── calculator.spec.js         # Interface da calculadora (30+ testes)
│   ├── pdf-export.spec.js         # Exportação de PDFs (10+ testes)
│   └── responsive.spec.js         # Responsividade (15+ testes)
│
├── setup.js                       # Configuração global dos testes
└── README.md                      # Esta documentação
```

## 🚀 Instalação

### 1. Instalar Dependências

```bash
npm install
```

### 2. Instalar Navegadores do Playwright

```bash
npm run playwright:install
```

## ▶️ Executando os Testes

### Todos os Testes

```bash
npm run test:all
```

### Apenas Testes Unitários e de Integração

```bash
npm test
```

### Testes com Cobertura

```bash
npm run test:coverage
```

### Testes em Modo Watch (desenvolvimento)

```bash
npm run test:watch
```

### Testes E2E

```bash
npm run test:e2e
```

### Testes E2E com Interface Visível

```bash
npm run test:e2e:headed
```

### Testes E2E em Modo Debug

```bash
npm run test:e2e:debug
```

## 📊 Cobertura de Código

A suite de testes visa uma cobertura mínima de **70%** em:

- Branches
- Functions
- Lines
- Statements

Para gerar o relatório de cobertura:

```bash
npm run test:coverage
```

O relatório será gerado em `coverage/lcov-report/index.html`.

## 🧪 Tipos de Testes

### Testes Unitários (Jest)

Testam componentes isolados do sistema:

#### `data-manager.test.js` (60+ testes)
- ✅ Inicialização do DataManager
- ✅ Persistência em LocalStorage
- ✅ CRUD de salas (criar, ler, atualizar, excluir)
- ✅ CRUD de itens extras
- ✅ CRUD de funcionários
- ✅ Migração de dados antigos
- ✅ Validação de estrutura de dados
- ✅ Multiplicadores de turno
- ✅ Exportar/importar dados

#### `calculations.test.js` (55+ testes)
- ✅ Conversão de meses para dias
- ✅ Cálculo de dias trabalhados (normais, sábado, domingo)
- ✅ Cálculo de horas por tipo (normais, HE 50%, HE 100%)
- ✅ Cálculo de custo operacional
- ✅ Cálculo de mão de obra
- ✅ Cálculo de vale transporte
- ✅ Cálculo de transporte por app
- ✅ Cálculo de refeição
- ✅ Cálculo de itens extras
- ✅ Aplicação de margem de lucro
- ✅ Aplicação de desconto
- ✅ Cálculo de valor por hora
- ✅ Validação de horários
- ✅ Cenários integrados

#### `utils.test.js` (30+ testes)
- ✅ Formatação de moeda
- ✅ Formatação de números
- ✅ Formatação de datas
- ✅ Validação de horário
- ✅ Sanitização de HTML
- ✅ Geração de IDs únicos
- ✅ Validações numéricas
- ✅ Conversões de tipo
- ✅ Manipulação de arrays
- ✅ Manipulação de strings

### Testes de Integração (Jest)

Testam fluxos completos e interações entre componentes:

#### `calculator-flow.test.js` (20+ testes)
- ✅ Fluxo completo de cálculo (1 mês, segunda a sexta, 8h/dia)
- ✅ Cálculo com finais de semana (HE)
- ✅ Cálculo com itens extras
- ✅ Cálculo com margem e desconto
- ✅ Duração em dias vs meses
- ✅ Persistência de dados após reload
- ✅ Consistência entre cálculos
- ✅ Múltiplos cenários de negócio

#### `crud-operations.test.js` (15+ testes)
- ✅ Ciclo completo CRUD de espaços
- ✅ Ciclo completo CRUD de extras
- ✅ Ciclo completo CRUD de funcionários
- ✅ Ativar/desativar funcionários
- ✅ Persistência após operações
- ✅ Consistência entre entidades
- ✅ Exportar/importar dados completos

### Testes E2E (Playwright)

Testam a aplicação completa no navegador real:

#### `calculator.spec.js` (30+ testes)
- ✅ Navegação entre abas
- ✅ Seleção de espaço e exibição de informações
- ✅ Configuração de duração (meses/dias)
- ✅ Seleção de dias da semana
- ✅ Adicionar/remover horários
- ✅ Selecionar itens extras
- ✅ Configurar margem e desconto
- ✅ Cálculo completo
- ✅ Validações de campos
- ✅ Mensagens de erro
- ✅ Responsividade básica

#### `pdf-export.spec.js` (10+ testes)
- ✅ Estado inicial dos botões (desabilitados)
- ✅ Habilitação após cálculo
- ✅ Gerar PDF proposta
- ✅ Gerar PDF gerencial
- ✅ Múltiplas gerações de PDF
- ✅ Validação de conteúdo

#### `responsive.spec.js` (15+ testes)
- ✅ Layout desktop (1920x1080)
- ✅ Layout tablet (768x1024)
- ✅ Layout mobile (375x667)
- ✅ Interações touch
- ✅ Orientação paisagem/retrato
- ✅ Múltiplas resoluções

## 🔧 Configuração

### Jest Configuration (`jest.config.js`)

```javascript
{
  testEnvironment: 'jsdom',
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
}
```

### Playwright Configuration (`playwright.config.js`)

```javascript
{
  testDir: './tests/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  projects: [
    'chromium',
    'firefox',
    'webkit',
    'Mobile Chrome',
    'Mobile Safari'
  ]
}
```

## 🐛 Debugging

### Testes Unitários

Para debugar um teste específico:

```bash
# Executar apenas um arquivo
npx jest tests/unit/data-manager.test.js

# Executar apenas um teste
npx jest -t "deve criar instância do DataManager"
```

### Testes E2E

Para debugar testes E2E:

```bash
# Modo debug (abre inspetor)
npm run test:e2e:debug

# Executar apenas um arquivo
npx playwright test tests/e2e/calculator.spec.js

# Executar com interface visível
npm run test:e2e:headed
```

## 📝 Escrevendo Novos Testes

### Template de Teste Unitário

```javascript
describe('Nome do Componente', () => {
  beforeEach(() => {
    // Setup
    localStorage.clear();
  });

  test('deve fazer algo específico', () => {
    // Arrange
    const input = 10;
    
    // Act
    const result = funcao(input);
    
    // Assert
    expect(result).toBe(20);
  });
});
```

### Template de Teste E2E

```javascript
test('deve realizar ação na interface', async ({ page }) => {
  await page.goto('/');
  
  await page.click('#botao');
  
  await expect(page.locator('#resultado')).toBeVisible();
});
```

## 🎯 Boas Práticas

1. **Isolamento**: Cada teste deve ser independente
2. **Cleanup**: Limpar LocalStorage e estado entre testes
3. **Descritivo**: Nomes de testes devem ser claros e específicos
4. **AAA Pattern**: Arrange, Act, Assert
5. **DRY**: Usar `beforeEach` para setup comum
6. **Espera Adequada**: Usar `waitFor` em vez de timeouts fixos
7. **Seletores Estáveis**: Preferir IDs e data-attributes

## 🚨 Troubleshooting

### Testes Falhando Localmente

1. Limpar cache do Jest:
```bash
npx jest --clearCache
```

2. Reinstalar dependências:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Testes E2E Falhando

1. Reinstalar navegadores:
```bash
npm run playwright:install
```

2. Verificar se o servidor está rodando:
```bash
npx http-server . -p 8080
```

3. Aumentar timeout nos testes (se necessário):
```javascript
test('teste lento', async ({ page }) => {
  test.setTimeout(60000); // 60 segundos
  // ...
});
```

### Cobertura Baixa

1. Verificar quais arquivos não estão cobertos:
```bash
npm run test:coverage
# Abrir coverage/lcov-report/index.html
```

2. Adicionar testes para áreas não cobertas

## 🔗 CI/CD

Os testes rodam automaticamente no GitHub Actions em:

- Push para `main` ou `develop`
- Pull Requests para `main` ou `develop`

Workflow: `.github/workflows/test.yml`

### Badges

Adicione ao README principal:

```markdown
![Tests](https://github.com/mayconabentes-bi/calculadora-orcamento-cdl/workflows/Automated%20Tests/badge.svg)
![Coverage](https://codecov.io/gh/mayconabentes-bi/calculadora-orcamento-cdl/branch/main/graph/badge.svg)
```

## 📚 Recursos

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

## 🤝 Contribuindo

Ao adicionar novos recursos:

1. Escreva testes primeiro (TDD)
2. Mantenha cobertura >70%
3. Execute todos os testes antes de commit
4. Atualize esta documentação se necessário

## 📞 Suporte

Para dúvidas ou problemas com os testes:

1. Verificar esta documentação
2. Verificar logs do CI/CD
3. Abrir issue no GitHub
