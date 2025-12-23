# Funcionalidades de CRM e Fidelização de Clientes

## Visão Geral

Este documento descreve as novas funcionalidades de CRM (Customer Relationship Management) e fidelização implementadas na Calculadora de Orçamento CDL/UTV. O objetivo é transformar a ferramenta em um sistema de prospeção ativa que captura dados dos clientes e identifica oportunidades de renovação.

## Funcionalidades Implementadas

### 1. Captura de Dados do Cliente

**Localização**: Card "Configurar Orçamento" no `index.html`

Dois novos campos foram adicionados antes da seleção do espaço:

- **Nome do Cliente / Empresa** (obrigatório)
  - ID: `cliente-nome`
  - Validação: Campo obrigatório para calcular orçamento
  
- **Telefone / Email** (opcional)
  - ID: `cliente-contato`
  - Informação adicional para contacto

#### Privacidade

Todos os dados são armazenados **localmente** no navegador do utilizador através do LocalStorage. Nenhum dado é enviado para servidores externos.

### 2. Persistência de Dados

**Arquivo**: `assets/js/data-manager.js`

O método `adicionarCalculoHistorico()` foi atualizado para incluir:

```javascript
{
  cliente: string,    // Nome do cliente/empresa
  contato: string,    // Telefone ou email
  // ... demais campos do cálculo
}
```

Os dados são salvos automaticamente no histórico de cada orçamento calculado.

### 3. Exportação CSV Enriquecida

**Arquivo**: `assets/js/data-manager.js`

O método `exportarHistoricoCSV()` agora inclui duas novas colunas:

1. **Cliente** - Nome do cliente ou empresa
2. **Contato** - Telefone ou email

#### Formato de Exportação

- **Encoding**: UTF-8 com BOM (compatível com Excel)
- **Separador**: Vírgula (,)
- **Propósito**: Análise de Pareto externa para identificar os 20% de clientes que geram 80% da receita

#### Exemplo de CSV:

```csv
Data,ID,Cliente,Contato,Unidade,Espaço,Duração,...
23/12/2024,1234567890,"Empresa ABC Ltda","(92) 99999-9999",DJLM,"Auditório",6,...
```

### 4. Detecção de Oportunidades de Renovação

**Arquivo**: `assets/js/data-manager.js`

Novo método: `obterOportunidadesRenovacao()`

#### Lógica de Negócio

Identifica clientes que realizaram eventos há **11-12 meses** atrás, criando uma janela de oportunidade para renovação **antes** que procurem a concorrência.

#### Características:

- Filtra eventos entre 11 e 12 meses
- Evita duplicatas do mesmo cliente
- Ignora registros sem nome de cliente
- Retorna array de "Leads Quentes"

#### Estrutura do Retorno:

```javascript
[
  {
    id: number,
    cliente: string,
    contato: string,
    espaco: string,
    dataEvento: string,
    mesesAtras: number,
    valorAnterior: number,
    convertido: boolean
  }
]
```

### 5. Dashboard de Oportunidades (Radar de Vendas)

**Arquivo**: `assets/js/app.js`

Função: `exibirOportunidadesRenovacao()`

#### Comportamento:

1. Executada automaticamente na inicialização da aplicação
2. Cria um card visual no topo da página quando há oportunidades
3. Exibe até 5 oportunidades mais relevantes
4. Inclui ação sugerida para cada lead

#### Visual:

- **Card Verde**: Design atraente com gradiente
- **Ícone de Radar**: Símbolo de prospeção ativa
- **Informações Completas**: Cliente, contato, espaço anterior, data do evento, valor
- **Status**: "Lead Quente" ou "Já Vendido"
- **Botão Fechar**: Permite ocultar temporariamente

## Fluxo de Uso

### Para o Utilizador:

1. **Preencher Dados do Cliente** (obrigatório)
   - Nome do cliente/empresa
   - Telefone ou email (opcional)

2. **Configurar Orçamento**
   - Selecionar espaço, duração, horários, etc.

3. **Calcular**
   - Sistema valida se nome do cliente foi preenchido
   - Calcula orçamento normalmente
   - Salva dados do cliente automaticamente

4. **Ver Oportunidades**
   - Ao abrir o sistema, o "Radar de Vendas" aparece automaticamente
   - Mostra clientes que tiveram eventos há ~1 ano
   - Sugere contacto proativo para renovação

5. **Exportar Dados**
   - CSV inclui dados dos clientes
   - Permite análise de Pareto no Excel
   - Identifica clientes mais valiosos

## Análise de Pareto (80/20)

Com os dados de cliente exportados no CSV, é possível realizar análise de Pareto:

1. Exportar histórico em CSV
2. Abrir no Excel/Google Sheets
3. Ordenar por "Valor Final" (decrescente)
4. Calcular % acumulada da receita
5. Identificar os ~20% de clientes que geram ~80% da receita

### Insights Possíveis:

- Quais clientes são mais lucrativos?
- Quais espaços são preferidos pelos melhores clientes?
- Qual a recorrência dos top clientes?
- Oportunidades de upselling para clientes menores

## Testes

### Testes Unitários

Arquivo: `tests/unit/client-crm.test.js`

13 testes implementados cobrindo:

- ✓ Captura de dados do cliente
- ✓ Persistência no LocalStorage
- ✓ Exportação CSV com novas colunas
- ✓ Detecção de oportunidades de renovação
- ✓ Filtros de período (11-12 meses)
- ✓ Evitar duplicatas
- ✓ Compatibilidade com dados antigos

**Executar testes:**

```bash
npm test tests/unit/client-crm.test.js
```

### Teste Manual

Arquivo: `tests/manual/test-crm-features.js`

Script para executar no console do navegador que valida todas as funcionalidades.

## Compatibilidade

### Dados Antigos (Backwards Compatibility)

O sistema é totalmente compatível com dados existentes:

- Registros sem `cliente` são tratados com valores vazios (`''`)
- Exportação CSV funciona mesmo com registros antigos
- Oportunidades de renovação ignoram registros sem cliente
- Nenhuma migração manual necessária

### Navegadores

- Chrome/Edge: ✓ Testado
- Firefox: ✓ Compatível
- Safari: ✓ Compatível
- Requer suporte a LocalStorage (todos os navegadores modernos)

## Segurança e Privacidade

### Armazenamento Local

- **Localização**: LocalStorage do navegador
- **Acesso**: Apenas o utilizador no mesmo navegador
- **Persistência**: Dados permanecem até limpar histórico do navegador
- **Privacidade**: NENHUM dado é enviado para servidores externos

### Proteção de Dados

- Sem transmissão de dados pessoais
- Sem cookies de rastreamento
- Sem analytics de terceiros
- Total controlo do utilizador sobre os dados

## Melhorias Futuras (Roadmap)

Possíveis evoluções para o sistema:

1. **Alertas por Email** (requer backend)
   - Enviar lembretes automáticos para oportunidades

2. **Segmentação de Clientes**
   - Tags/categorias para clientes (VIP, Corporativo, etc.)

3. **Dashboard Analytics**
   - Gráficos de recorrência
   - Taxa de conversão
   - Lifetime Value (LTV)

4. **Integração com CRM Externo**
   - Export para Salesforce, HubSpot, etc.

5. **Histórico de Interações**
   - Registro de contactos realizados
   - Status de negociação

## Suporte

Para questões ou sugestões sobre as funcionalidades de CRM:

1. Consultar esta documentação
2. Verificar testes unitários para exemplos de uso
3. Executar script de teste manual no console

## Conclusão

As funcionalidades de CRM transformam a Calculadora de Orçamento em uma ferramenta de prospeção ativa, permitindo:

- **Capturar** informações dos clientes
- **Analisar** padrões de receita (Pareto)
- **Identificar** oportunidades de renovação
- **Agir** proativamente antes da concorrência

Tudo isso mantendo a **privacidade** dos dados localmente no navegador do utilizador.
