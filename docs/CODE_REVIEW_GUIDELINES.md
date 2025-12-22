# Diretrizes de Code Review - Calculadora de Orçamento CDL

## Contexto e Propósito

Este documento estabelece as diretrizes de code review para o repositório `calculadora-orcamento-cdl`. O objetivo é garantir não apenas qualidade sintática, mas também eficiência algorítmica, precisão financeira e viabilidade estratégica.

## Papel do Revisor

Atue como um **Engenheiro de Software Sênior e Analista de Negócios**. Suas revisões devem focar em:
- ✅ Precisão numérica em operações monetárias
- ✅ Eficiência algorítmica (Big O)
- ✅ Qualidade dos testes (evitar viés de sobrevivência)
- ✅ Integridade de dados (prevenir corrupção)

---

## 1. Precisão Numérica em Cálculos Monetários

### ⚠️ Problema: Imprecisão de Ponto Flutuante

JavaScript utiliza IEEE 754 double precision (64 bits) para todos os números, o que pode causar erros de arredondamento em operações financeiras.

**Exemplo de problema:**
```javascript
0.1 + 0.2 === 0.3  // false! Resultado: 0.30000000000000004
```

### ✅ Diretrizes

#### 1.1. NUNCA use `float` ou `number` diretamente para subtotais críticos

**❌ INCORRETO:**
```javascript
let subtotal = 0;
funcionarios.forEach(func => {
    subtotal += func.horaNormal * horas;  // Acumula erros de precisão
});
```

**✅ CORRETO:**
```javascript
// Arredondar após cada operação crítica
let subtotal = 0;
funcionarios.forEach(func => {
    const custo = Math.round((func.horaNormal * horas) * 100) / 100;
    subtotal = Math.round((subtotal + custo) * 100) / 100;
});
```

**✅ MELHOR: Use funções de validação**
```javascript
const { arredondarMoeda, validarValorMonetario } = require('./validation');

let subtotal = 0;
funcionarios.forEach(func => {
    const custo = arredondarMoeda(func.horaNormal * horas);
    subtotal = arredondarMoeda(subtotal + custo);
});

const validacao = validarValorMonetario(subtotal);
if (!validacao.valido) {
    console.error('Erro de precisão detectado:', validacao.erro);
}
```

#### 1.2. Para aplicações críticas, recomende bibliotecas especializadas

Em revisões de código que envolvem:
- Cálculos com mais de 2 casas decimais
- Operações repetidas com acúmulo
- Valores monetários muito grandes

**Sugerir:**
- **decimal.js**: Para aritmética decimal de precisão arbitrária
- **big.js**: Para operações financeiras simples
- **bignumber.js**: Para cálculos científicos/financeiros complexos

**Exemplo com decimal.js:**
```javascript
const Decimal = require('decimal.js');

let subtotal = new Decimal(0);
funcionarios.forEach(func => {
    const custo = new Decimal(func.horaNormal).times(horas);
    subtotal = subtotal.plus(custo);
});

const subtotalFinal = subtotal.toNumber(); // Converter apenas no final
```

#### 1.3. Checklist de Revisão

- [ ] Operações monetárias usam arredondamento adequado?
- [ ] Valores críticos são validados antes de uso?
- [ ] Acúmulos utilizam arredondamento entre operações?
- [ ] Há comentários alertando sobre precisão quando necessário?
- [ ] Valores decimais têm no máximo 2-4 casas (dependendo do contexto)?

---

## 2. Análise de Complexidade Algorítmica (Big O)

### ✅ Diretrizes

#### 2.1. Manter eficiência O(n) em funções críticas

Funções que processam horários, funcionários ou dias devem manter complexidade **linear O(n)**.

**❌ EVITAR: Loops aninhados desnecessários**
```javascript
// O(n²) - RUIM em dispositivos móveis
function calcularCustos(funcionarios, horarios) {
    funcionarios.forEach(func => {
        horarios.forEach(horario => {
            // Processamento para cada combinação
        });
    });
}
```

**✅ PREFERIR: Processamento linear**
```javascript
// O(n) + O(m) = O(n+m) - BOM
function calcularCustos(funcionarios, horarios) {
    const totalHoras = horarios.reduce((sum, h) => sum + h.duracao, 0);
    
    return funcionarios.map(func => ({
        nome: func.nome,
        custo: func.horaNormal * totalHoras
    }));
}
```

#### 2.2. Documentar complexidade em funções críticas

Adicione comentários JSDoc com análise de complexidade:

```javascript
/**
 * Calcula custos totais de mão de obra
 * Complexidade: O(n) onde n = número de funcionários ativos
 * Espaço: O(n) para array de detalhamento
 * 
 * @param {Array} funcionariosAtivos - Lista de funcionários (n elementos)
 * @param {number} horasNormais - Total de horas normais
 * @param {number} horasHE50 - Total de horas extras 50%
 * @param {number} horasHE100 - Total de horas extras 100%
 * @returns {Object} Custos detalhados
 */
function calcularCustosMaoObra(funcionariosAtivos, horasNormais, horasHE50, horasHE100) {
    // Processamento O(n)
    return funcionariosAtivos.reduce((totais, func) => {
        // ... cálculos
    }, { total: 0, detalhamento: [] });
}
```

#### 2.3. Checklist de Revisão

- [ ] Função tem complexidade adequada ao tamanho esperado dos dados?
- [ ] Há loops aninhados que podem ser evitados?
- [ ] Operações de busca usam estruturas eficientes? (Map vs Array)
- [ ] Há cache de valores calculados repetidamente?
- [ ] Complexidade está documentada em funções críticas?

---

## 3. Qualidade dos Testes - Evitar Viés de Sobrevivência

### ⚠️ Problema: Testar apenas "happy path"

Testes que cobrem apenas casos ideais não detectam bugs reais.

### ✅ Diretrizes

#### 3.1. SEMPRE incluir casos extremos (edge cases)

**Testes obrigatórios para cada função:**

1. **Valores nulos/undefined**
```javascript
test('deve rejeitar valores nulos', () => {
    expect(calcularCusto(null, 10)).toThrow();
    expect(calcularCusto(undefined, 10)).toThrow();
});
```

2. **Valores negativos**
```javascript
test('deve rejeitar valores negativos', () => {
    expect(validarValorMonetario(-100).valido).toBe(false);
    expect(validarPercentual(-10).valido).toBe(false);
});
```

3. **Valores zero**
```javascript
test('deve lidar com zero corretamente', () => {
    expect(calcularCusto(0, 10)).toBe(0);
    expect(calcularValorPorHora(1000, 0)).toBe(0); // Evitar divisão por zero
});
```

4. **Limites de desconto (0-100%)**
```javascript
describe('Validação de desconto', () => {
    test('deve aceitar 0%', () => {
        expect(validarPercentual(0).valido).toBe(true);
    });
    
    test('deve aceitar 100%', () => {
        expect(validarPercentual(100).valido).toBe(true);
    });
    
    test('deve rejeitar > 100%', () => {
        expect(validarPercentual(101).valido).toBe(false);
    });
    
    test('deve rejeitar < 0%', () => {
        expect(validarPercentual(-1).valido).toBe(false);
    });
});
```

5. **Valores muito grandes/pequenos**
```javascript
test('deve lidar com valores extremos', () => {
    expect(validarValorMonetario(Number.MAX_SAFE_INTEGER).valido).toBe(false);
    expect(validarValorMonetario(0.001).valido).toBe(true);
});
```

#### 3.2. Testar erros de precisão flutuante

```javascript
test('deve detectar erros de precisão', () => {
    const resultado = 0.1 + 0.2; // 0.30000000000000004
    expect(arredondarMoeda(resultado)).toBe(0.30);
});
```

#### 3.3. Checklist de Revisão de Testes

- [ ] Há testes para valores nulos/undefined?
- [ ] Há testes para valores negativos?
- [ ] Há testes para valores zero?
- [ ] Há testes para limites (0%, 100%, min, max)?
- [ ] Há testes para valores extremamente grandes/pequenos?
- [ ] Há testes para erros de precisão flutuante?
- [ ] Há testes para entrada malformada (strings, objetos, arrays)?

---

## 4. Integridade de Dados no LocalStorage

### ✅ Diretrizes

#### 4.1. SEMPRE validar schema antes de salvar

**✅ Implementado em data-manager.js:**
```javascript
salvarDados() {
    // Validar antes de salvar
    const validacao = this.validarSchema(this.dados);
    if (!validacao.valido) {
        console.error('Dados inválidos:', validacao.erros);
        return false;
    }
    
    localStorage.setItem(this.storageKey, JSON.stringify(this.dados));
    return true;
}
```

#### 4.2. Validar schema ao carregar

```javascript
carregarDados() {
    try {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            const dados = JSON.parse(stored);
            
            // Validar schema
            const validacao = this.validarSchema(dados);
            if (!validacao.valido) {
                console.error('Dados corrompidos:', validacao.erros);
                return this.obterDadosPadrao();
            }
            
            return dados;
        }
    } catch (error) {
        console.error('Erro ao carregar:', error);
        return this.obterDadosPadrao();
    }
}
```

#### 4.3. Schema obrigatório para validação

```javascript
validarSchema(dados) {
    const erros = [];
    
    // Validar estrutura
    if (!dados.salas || !Array.isArray(dados.salas)) {
        erros.push('salas deve ser um array');
    }
    
    // Validar tipos e valores
    dados.salas.forEach((sala, i) => {
        if (typeof sala.custoBase !== 'number' || sala.custoBase < 0) {
            erros.push(`sala[${i}].custoBase inválido`);
        }
    });
    
    return { valido: erros.length === 0, erros };
}
```

#### 4.4. Checklist de Revisão

- [ ] Alterações em data-manager.js incluem validação de schema?
- [ ] Novos campos têm validação de tipo?
- [ ] Há recuperação de erro em caso de corrupção?
- [ ] Dados padrão são restaurados em caso de falha?
- [ ] Logs de erro são informativos?

---

## 5. Fluxo de Code Review

### Processo Recomendado

1. **Análise Estática**
   - Verificar precisão numérica em operações monetárias
   - Identificar loops aninhados
   - Validar tipos de dados

2. **Análise de Testes**
   - Verificar cobertura de edge cases
   - Avaliar qualidade dos cenários de teste
   - Identificar viés de sobrevivência

3. **Análise de Performance**
   - Documentar complexidade Big O
   - Identificar gargalos potenciais
   - Avaliar escalabilidade em dispositivos móveis

4. **Análise de Integridade**
   - Validar schema de dados
   - Verificar tratamento de erros
   - Avaliar recuperação de falhas

### Template de Comentário de Review

```markdown
## Precisão Numérica
- [ ] ✅ Operações monetárias usam arredondamento
- [ ] ⚠️ Linha X: Acúmulo sem arredondamento pode causar imprecisão
- [ ] 💡 Sugestão: Considerar uso de decimal.js para cálculos críticos

## Complexidade Algorítmica
- [ ] ✅ Função mantém O(n)
- [ ] ⚠️ Loop aninhado em linhas X-Y pode degradar performance
- [ ] 💡 Sugestão: Pré-calcular valor fora do loop

## Qualidade dos Testes
- [ ] ✅ Testes incluem edge cases
- [ ] ⚠️ Faltam testes para valores nulos/negativos
- [ ] 💡 Sugestão: Adicionar testes para limites de desconto

## Integridade de Dados
- [ ] ✅ Validação de schema implementada
- [ ] ⚠️ Novos campos não têm validação
- [ ] 💡 Sugestão: Adicionar validação para campo X
```

---

## 6. Exemplos de Boas Práticas

### Exemplo Completo: Função de Cálculo Validada

```javascript
/**
 * Calcula subtotal com validação completa
 * Complexidade: O(n) onde n = número de funcionários
 * 
 * @param {Array<Object>} funcionarios - Funcionários ativos
 * @param {number} horas - Total de horas
 * @returns {Object} { subtotal: number, valido: boolean, erro: string|null }
 */
function calcularSubtotalValidado(funcionarios, horas) {
    // Validar entrada
    if (!Array.isArray(funcionarios) || funcionarios.length === 0) {
        return { subtotal: 0, valido: false, erro: 'Funcionários inválidos' };
    }
    
    if (typeof horas !== 'number' || horas < 0) {
        return { subtotal: 0, valido: false, erro: 'Horas inválidas' };
    }
    
    // Calcular com arredondamento
    let subtotal = 0;
    
    // O(n) - linear
    for (const func of funcionarios) {
        const custo = arredondarMoeda(func.horaNormal * horas);
        subtotal = arredondarMoeda(subtotal + custo);
    }
    
    // Validar resultado
    const validacao = validarValorMonetario(subtotal);
    if (!validacao.valido) {
        return { subtotal: 0, valido: false, erro: validacao.erro };
    }
    
    return { subtotal, valido: true, erro: null };
}
```

### Testes Correspondentes

```javascript
describe('calcularSubtotalValidado', () => {
    const funcionarios = [
        { horaNormal: 15.00 },
        { horaNormal: 18.00 }
    ];
    
    test('deve calcular subtotal corretamente', () => {
        const resultado = calcularSubtotalValidado(funcionarios, 40);
        expect(resultado.valido).toBe(true);
        expect(resultado.subtotal).toBe(1320.00);
    });
    
    test('deve rejeitar array vazio', () => {
        const resultado = calcularSubtotalValidado([], 40);
        expect(resultado.valido).toBe(false);
        expect(resultado.erro).toContain('Funcionários inválidos');
    });
    
    test('deve rejeitar horas negativas', () => {
        const resultado = calcularSubtotalValidado(funcionarios, -10);
        expect(resultado.valido).toBe(false);
        expect(resultado.erro).toContain('Horas inválidas');
    });
    
    test('deve rejeitar horas null', () => {
        const resultado = calcularSubtotalValidado(funcionarios, null);
        expect(resultado.valido).toBe(false);
    });
    
    test('deve lidar com zero horas', () => {
        const resultado = calcularSubtotalValidado(funcionarios, 0);
        expect(resultado.valido).toBe(true);
        expect(resultado.subtotal).toBe(0);
    });
    
    test('deve arredondar corretamente', () => {
        const funcs = [{ horaNormal: 13.04 }];
        const resultado = calcularSubtotalValidado(funcs, 160.5);
        expect(resultado.valido).toBe(true);
        // 13.04 * 160.5 = 2092.92
        expect(resultado.subtotal).toBe(2092.92);
    });
});
```

---

## 7. Recursos Adicionais

### Bibliotecas Recomendadas

1. **decimal.js** - Aritmética decimal de precisão arbitrária
   - https://github.com/MikeMcl/decimal.js/
   - Use quando: Operações financeiras críticas, valores com muitas casas decimais

2. **big.js** - Aritmética de ponto flutuante de precisão arbitrária
   - https://github.com/MikeMcl/big.js/
   - Use quando: Operações monetárias simples, performance é importante

3. **bignumber.js** - Biblioteca para números grandes
   - https://github.com/MikeMcl/bignumber.js/
   - Use quando: Cálculos científicos, valores extremamente grandes

### Ferramentas de Análise

1. **ESLint** com plugins de complexidade
   - eslint-plugin-complexity
   - eslint-plugin-sonarjs

2. **Jest** para testes
   - Cobertura de código
   - Snapshots para validação de estruturas

### Leitura Complementar

1. "What Every Computer Scientist Should Know About Floating-Point Arithmetic"
   - https://docs.oracle.com/cd/E19957-01/806-3568/ncg_goldberg.html

2. "JavaScript Number Precision Problems"
   - https://javascript.info/number#imprecise-calculations

---

## Checklist Final de Code Review

### Para o Autor do PR
- [ ] Adicionei validação de entrada para valores monetários
- [ ] Usei arredondamento em operações críticas
- [ ] Documentei complexidade de funções críticas
- [ ] Adicionei testes para edge cases (null, negativos, zero, limites)
- [ ] Validei schema de dados em alterações no data-manager.js
- [ ] Logs de erro são informativos

### Para o Revisor
- [ ] Verifiquei precisão numérica em operações monetárias
- [ ] Avaliei complexidade algorítmica (Big O)
- [ ] Validei qualidade dos testes (edge cases)
- [ ] Verifiquei integridade de dados (schema validation)
- [ ] Identifiquei possíveis gargalos de performance
- [ ] Sugeri melhorias quando aplicável

---

**Última atualização:** 2025-12-22
**Versão:** 1.0
