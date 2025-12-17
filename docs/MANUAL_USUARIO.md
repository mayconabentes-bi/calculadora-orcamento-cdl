# Manual do Usuário - Calculadora de Orçamento CDL/UTV v5.0

## 📖 Sumário

1. [Introdução](#introdução)
2. [Como Calcular um Orçamento](#como-calcular-um-orçamento)
3. [Como Gerenciar Espaços](#como-gerenciar-espaços)
4. [Como Configurar Custos Base](#como-configurar-custos-base)
5. [Como Adicionar e Gerenciar Itens Extras](#como-adicionar-e-gerenciar-itens-extras)
6. [Como Exportar Relatórios](#como-exportar-relatórios)
7. [Como Fazer Backup dos Dados](#como-fazer-backup-dos-dados)
8. [Perguntas Frequentes (FAQ)](#perguntas-frequentes-faq)
9. [Solução de Problemas](#solução-de-problemas)

---

## 🎯 Introdução

A **Calculadora de Orçamento CDL/UTV v5.0** é um sistema web desenvolvido para facilitar o cálculo de orçamentos para locação de espaços da CDL (Câmara de Dirigentes Lojistas) e UTV (Universidade Técnica de Vendas) em Manaus.

### Principais Funcionalidades

- ✅ Cálculo automático de orçamentos considerando múltiplos fatores
- ✅ Gestão completa de espaços e custos
- ✅ Sistema de margem de lucro e descontos configuráveis
- ✅ Geração de PDFs profissionais (cliente e superintendência)
- ✅ Backup e restauração de dados
- ✅ Interface intuitiva e responsiva

### Requisitos

- Navegador web moderno (Chrome, Firefox, Safari ou Edge)
- Conexão com internet (apenas para carregar o sistema pela primeira vez)
- JavaScript habilitado

---

## 📊 Como Calcular um Orçamento

### Passo 1: Acesse a Aba Calculadora

Ao abrir o sistema, você já estará na aba **"📊 Calculadora"**. Se não estiver, clique nela no menu superior.

### Passo 2: Selecione o Espaço

1. No campo **"Selecione o Espaço"**, escolha o espaço desejado no menu suspenso
2. As opções incluem:
   - DJLM - Auditório (120 pessoas, 108m²)
   - UTV - Auditório (70 pessoas, 63m²)
   - UTV - Salas 2, 3, 4, 7, 8, 9, 12, 13 (diversos tamanhos)

3. Após selecionar, você verá informações detalhadas do espaço:
   - Capacidade
   - Área em m²
   - Custo base por hora
   - Valores por turno (manhã, tarde, noite)

### Passo 3: Configure a Duração do Contrato

1. No campo **"Duração do Contrato (meses)"**, insira o número de meses
2. Valores aceitos: 1 a 24 meses
3. Padrão: 6 meses

### Passo 4: Escolha os Dias por Semana

Selecione quantos dias por semana o espaço será utilizado:
- **1 dia** (Sábado)
- **2 dias** (Sábado e Domingo)
- **5 dias** (Segunda a Sexta)
- **7 dias** (Todos os dias)

### Passo 5: Defina os Horários de Uso

Marque os turnos que serão utilizados:
- ☀️ **Manhã** (8h às 12h - 4 horas) - Multiplicador 1.0×
- 🌤️ **Tarde** (13h às 17h - 4 horas) - Multiplicador 1.15×
- 🌙 **Noite** (18h às 22h - 4 horas) - Multiplicador 1.40×

**Nota**: É necessário selecionar pelo menos um turno.

### Passo 6: Selecione Itens Extras (Opcional)

Marque os itens extras que serão incluídos no orçamento:
- Coffee Break Premium (R$ 50,00/h)
- Serviço de Impressão (R$ 15,00/h)
- Gravação Profissional (R$ 80,00/h)
- Transmissão ao Vivo (R$ 120,00/h)
- Flip Chart Extra (R$ 5,00/h)

### Passo 7: Ajuste a Margem de Lucro

Use o controle deslizante para definir a margem de lucro:
- Mínimo: 10%
- Máximo: 60%
- Padrão: 30%

A margem é aplicada sobre o custo total antes do desconto.

### Passo 8: Defina o Desconto por Fidelidade

Use o controle deslizante para definir o desconto:
- Mínimo: 0%
- Máximo: 50%
- Padrão: 20%
- Incremento: 5%

### Passo 9: Calcule o Orçamento

Clique no botão **"🚀 Calcular Orçamento"**.

### Passo 10: Visualize os Resultados

No painel direito, você verá:

#### Valor Final em Destaque
O valor total do orçamento em destaque no topo.

#### Métricas Principais
- **Valor por Hora**: Custo médio por hora de uso
- **Total de Horas**: Horas totais no período contratado
- **Custo Base/h**: Custo base do espaço por hora
- **Economia**: Valor economizado com o desconto

#### Detalhamento do Cálculo
Breakdown completo mostrando:
- Custo Operacional Base
- Mão de Obra (horas normais e extras)
- Vale Transporte
- Itens Extras (se selecionados)
- Subtotal sem margem
- Margem de Lucro aplicada
- Subtotal com margem
- Desconto aplicado
- **VALOR FINAL**

---

## 🏛️ Como Gerenciar Espaços

### Visualizar Espaços Cadastrados

1. Clique na aba **"🏛️ Espaços"**
2. Você verá uma tabela com todos os espaços cadastrados
3. Informações exibidas:
   - Nome do espaço
   - Unidade (DJLM/UTV)
   - Capacidade (número de pessoas)
   - Área em m²
   - Ações disponíveis

### Adicionar Novo Espaço

1. Na aba **"🏛️ Espaços"**, role até o final da página
2. Preencha os campos:
   - **Nome do espaço**: Ex: "Sala 14", "Auditório 2"
   - **Unidade**: DJLM ou UTV
   - **Capacidade**: Número de pessoas
   - **Área (m²)**: Área em metros quadrados (aceita decimais)
3. Clique em **"➕ Adicionar Espaço"**
4. O espaço será criado com custo base inicial de R$ 0,00
5. Configure o custo na aba **"💰 Custos Base"**

### Editar Espaço

1. Na tabela de espaços, clique no botão **"✏️ Editar"** do espaço desejado
2. Uma série de prompts aparecerá para editar:
   - Nome do espaço
   - Unidade
   - Capacidade
   - Área
3. Confirme as alterações
4. O espaço será atualizado automaticamente

### Remover Espaço

1. Na tabela de espaços, clique no botão **"🗑️ Remover"** do espaço desejado
2. Confirme a remoção no diálogo que aparece
3. **Atenção**: Esta ação não pode ser desfeita (a menos que você tenha um backup)

---

## 💰 Como Configurar Custos Base

### Acessar a Aba de Custos

1. Clique na aba **"💰 Custos Base"**
2. Você verá uma tabela completa com todos os espaços

### Entender a Tabela de Custos

A tabela mostra:
- **Unidade**: DJLM ou UTV
- **Espaço**: Nome do espaço
- **Capacidade**: Número de pessoas
- **Área (m²)**: Área do espaço
- **Custo Base/h**: Campo editável para definir o custo
- **Manhã (×1,00)**: Custo no período da manhã
- **Tarde (×1,15)**: Custo no período da tarde (+15%)
- **Noite (×1,40)**: Custo no período da noite (+40%)
- **Ações**: Botão para salvar individualmente

### Atualizar Custo de um Espaço

1. Localize o espaço na tabela
2. Altere o valor no campo **"Custo Base/h"**
3. Clique no botão **"💾 Salvar"** na mesma linha
4. Os valores dos turnos serão recalculados automaticamente

### Salvar Todos os Custos de Uma Vez

1. Edite os custos base de múltiplos espaços
2. Clique no botão **"💾 Salvar Todos os Custos"** no final da página
3. Todos os custos serão salvos simultaneamente

### Multiplicadores de Turno

Os multiplicadores são aplicados automaticamente:
- **Manhã**: 1,00× (sem acréscimo)
- **Tarde**: 1,15× (+15% sobre o custo base)
- **Noite**: 1,40× (+40% sobre o custo base)

Estes multiplicadores são fixos no sistema e refletem a demanda e custos operacionais de cada período.

---

## 🎁 Como Adicionar e Gerenciar Itens Extras

### Acessar Configurações

1. Clique na aba **"⚙️ Configurações"**
2. Localize o card **"🎁 Itens Extras"** no canto esquerdo

### Visualizar Itens Extras

Você verá uma lista com todos os itens extras cadastrados, mostrando:
- Nome do item
- Custo por hora
- Botões de edição e remoção

### Adicionar Novo Item Extra

1. Role até a seção **"➕ Novo Item Extra"**
2. Preencha:
   - **Nome do item**: Descrição do serviço/item
   - **Custo por hora (R$)**: Valor cobrado por hora de uso
3. Clique em **"➕ Adicionar Item"**
4. O item estará disponível imediatamente na calculadora

**Exemplos de itens extras**:
- Material didático
- Equipamento audiovisual adicional
- Serviço de coffee break
- Suporte técnico especializado
- Decoração temática

### Editar Item Extra

1. Clique no botão **"✏️"** ao lado do item desejado
2. Edite o nome e/ou custo nos prompts que aparecem
3. Confirme as alterações

### Remover Item Extra

1. Clique no botão **"🗑️"** ao lado do item desejado
2. Confirme a remoção
3. O item será removido da calculadora

---

## 📄 Como Exportar Relatórios

Após calcular um orçamento, você pode exportá-lo em diferentes formatos:

### PDF Versão Cliente (Proposta Comercial)

**Quando usar**: Para apresentar a proposta ao cliente.

**Como gerar**:
1. Após calcular o orçamento, clique em **"📄 PDF Cliente"**
2. O arquivo PDF será gerado e baixado automaticamente
3. Nome do arquivo: `proposta-orcamento-[UNIDADE]-[SALA]-[TIMESTAMP].pdf`

**Conteúdo incluído**:
- ✅ Informações do espaço
- ✅ Detalhes do contrato
- ✅ Valores principais
- ✅ Valor final em destaque
- ✅ Informações de validade

**Não inclui**:
- ❌ Detalhamento de custos internos
- ❌ Cálculos de mão de obra
- ❌ Margem de lucro detalhada

### PDF Versão Superintendência (Análise Financeira)

**Quando usar**: Para análise interna e aprovação da superintendência.

**Como gerar**:
1. Após calcular o orçamento, clique em **"📊 PDF Superintendência"**
2. O arquivo PDF será gerado e baixado automaticamente
3. Nome do arquivo: `analise-financeira-[UNIDADE]-[SALA]-[TIMESTAMP].pdf`

**Conteúdo incluído**:
- ✅ Todos os dados do PDF cliente
- ✅ Detalhamento completo de custos
- ✅ Breakdown de mão de obra (normal, HE 50%, HE 100%)
- ✅ Análise de vale transporte
- ✅ Cálculo de margem e markup
- ✅ Indicadores financeiros
- ✅ Margem líquida percentual
- ✅ Observações técnicas

**Marcado como**: DOCUMENTO CONFIDENCIAL - USO INTERNO

### Impressão (Versão Cliente)

**Como imprimir**:
1. Após calcular o orçamento, clique em **"🖨️ Imprimir Cliente"**
2. A janela de impressão do navegador será aberta
3. Configure:
   - Impressora (ou salvar como PDF)
   - Orientação: Retrato
   - Margens: Padrão
   - Cor: Colorido (recomendado)
4. Confirme a impressão

**Dica**: Se preferir salvar como PDF pelo navegador, selecione "Salvar como PDF" na lista de impressoras.

---

## 💾 Como Fazer Backup dos Dados

### Por Que Fazer Backup?

O sistema armazena todos os dados localmente no seu navegador. Fazer backup é importante para:
- Prevenir perda de dados
- Transferir configurações para outro computador
- Manter histórico de configurações

### Exportar Dados (Backup)

1. Vá para a aba **"⚙️ Configurações"**
2. Localize o card **"💾 Backup e Dados"**
3. Clique em **"📥 Exportar Dados (JSON)"**
4. Um arquivo JSON será baixado com nome: `cdl-calculadora-backup-[TIMESTAMP].json`
5. Guarde este arquivo em local seguro (nuvem, HD externo, etc.)

**O que é exportado**:
- Todos os espaços cadastrados
- Todos os itens extras
- Custos de funcionário
- Multiplicadores de turno
- Todas as configurações personalizadas

### Importar Dados (Restaurar Backup)

1. Vá para a aba **"⚙️ Configurações"**
2. Clique em **"📤 Importar Dados (JSON)"**
3. Selecione o arquivo de backup (.json) no seu computador
4. O sistema validará e importará os dados
5. Todos os dados atuais serão substituídos
6. A interface será atualizada automaticamente

**Atenção**: A importação substitui TODOS os dados atuais. Faça backup antes de importar!

### Resetar para Dados Padrão

Se você quiser voltar às configurações originais do sistema:

1. Vá para a aba **"⚙️ Configurações"**
2. Clique em **"🔄 Resetar para Padrão"**
3. Confirme a ação no diálogo
4. O sistema restaurará:
   - 10 salas originais (DJLM e UTV)
   - 5 itens extras padrão
   - Custos de funcionário padrão
   - Multiplicadores de turno originais

**Atenção**: Esta ação não pode ser desfeita! Faça backup antes!

---

## ❓ Perguntas Frequentes (FAQ)

### 1. Os dados ficam salvos após fechar o navegador?

**Sim!** Todos os dados são salvos automaticamente no LocalStorage do navegador. Ao reabrir o sistema, suas configurações estarão lá.

### 2. Posso usar o sistema em diferentes computadores?

Sim, mas os dados são independentes em cada navegador/computador. Para sincronizar:
1. Exporte os dados do computador 1
2. Importe no computador 2

### 3. O sistema funciona offline?

Sim! Após o primeiro carregamento, o sistema funciona completamente offline. A internet é necessária apenas para:
- Carregar o sistema pela primeira vez
- Carregar as bibliotecas externas (jsPDF, html2canvas)

### 4. Posso adicionar mais de 10 espaços?

Sim! Você pode adicionar quantos espaços quiser. Os 10 espaços iniciais são apenas o padrão.

### 5. Como calcular um orçamento para meio período?

Para meio período:
1. Selecione apenas um turno (manhã OU tarde OU noite)
2. Ajuste a duração conforme necessário
3. O sistema calculará proporcionalmente

### 6. O que são os multiplicadores de turno?

São acréscimos aplicados ao custo base conforme o período:
- Manhã: sem acréscimo (1,0×)
- Tarde: +15% (1,15×)
- Noite: +40% (1,40×)

Eles refletem maior demanda e custos operacionais em determinados horários.

### 7. Como funciona o cálculo de horas extras?

O sistema distribui automaticamente as horas entre:
- **Horas normais**: Segunda a Sexta (custo base)
- **HE 50%**: Sábados (+50% sobre hora normal)
- **HE 100%**: Domingos e feriados (+100% sobre hora normal)

A distribuição depende dos dias por semana selecionados.

### 8. Posso alterar os custos de funcionário?

Sim! Na aba **"⚙️ Configurações"**, card **"👤 Custos do Funcionário"**:
1. Edite os valores
2. Clique em **"💾 Salvar Custos"**

Valores padrão:
- Hora Normal: R$ 13,04/h
- HE 50%: R$ 19,56/h
- HE 100%: R$ 26,08/h
- Vale Transporte: R$ 12,00/dia

### 9. O PDF não está gerando. O que fazer?

Verifique:
1. Se você calculou um orçamento antes de gerar o PDF
2. Se o navegador está bloqueando pop-ups
3. Se há espaço em disco para salvar o arquivo
4. Tente usar outro navegador (Chrome é recomendado)

### 10. Perdi meus dados. É possível recuperar?

Se você fez backup (exportação JSON), sim!
1. Vá em **"⚙️ Configurações"**
2. Clique em **"📤 Importar Dados"**
3. Selecione seu arquivo de backup

Se não tem backup, os dados padrão podem ser restaurados com **"🔄 Resetar para Padrão"**.

---

## 🔧 Solução de Problemas

### Problema: O sistema não carrega

**Soluções**:
1. Verifique sua conexão com internet (primeira vez)
2. Limpe o cache do navegador
3. Desabilite extensões do navegador que possam interferir
4. Tente usar modo anônimo/privado
5. Use outro navegador

### Problema: Cálculos parecem incorretos

**Verificações**:
1. Confira se todos os campos foram preenchidos corretamente
2. Verifique os custos base dos espaços na aba **"💰 Custos Base"**
3. Verifique os custos de funcionário em **"⚙️ Configurações"**
4. Confirme se os itens extras estão com valores corretos
5. Revise a duração e dias por semana selecionados

### Problema: Não consigo adicionar espaço

**Soluções**:
1. Verifique se todos os campos estão preenchidos
2. Use números válidos (sem letras) nos campos numéricos
3. Para área, use ponto (.) para decimais, não vírgula
4. Verifique se não há espaços extras nos textos

### Problema: PDF não abre ou está em branco

**Soluções**:
1. Certifique-se de calcular um orçamento antes
2. Aguarde alguns segundos após clicar em gerar
3. Verifique se o bloqueador de pop-ups não está ativo
4. Baixe novamente o arquivo
5. Abra com outro leitor de PDF (Adobe Reader, navegador)

### Problema: Dados não estão salvando

**Soluções**:
1. Verifique se o navegador permite o uso de LocalStorage
2. Verifique se não está em modo anônimo/privado
3. Limpe o cache (mas isso apagará os dados atuais - faça backup!)
4. Verifique se há espaço disponível (LocalStorage tem limite)
5. Tente outro navegador

### Problema: Não consigo imprimir

**Soluções**:
1. Verifique se calculou um orçamento antes
2. Verifique se o navegador permite impressão
3. Tente usar a função de impressão do navegador (Ctrl+P ou Cmd+P)
4. Como alternativa, gere o PDF e imprima o PDF

### Problema: Botões não funcionam

**Soluções**:
1. Recarregue a página (F5)
2. Verifique se JavaScript está habilitado
3. Desabilite extensões do navegador
4. Tente outro navegador
5. Verifique se não há erros no console (F12)

### Problema: Interface está desconfigurada

**Soluções**:
1. Recarregue a página forçando o cache (Ctrl+Shift+R)
2. Limpe o cache do navegador
3. Verifique o zoom do navegador (100% é ideal)
4. Ajuste o tamanho da janela
5. Tente em tela cheia (F11)

---

## 📞 Suporte

Se você não encontrou solução para seu problema neste manual:

1. **Consulte a documentação técnica**: `docs/MANUAL_TECNICO.md`
2. **Verifique o CHANGELOG**: `docs/CHANGELOG.md`
3. **Entre em contato**: Equipe de TI da CDL Manaus
4. **Reporte bugs**: Abra uma issue no repositório do projeto

---

## 🎓 Dicas e Boas Práticas

### Para Usar o Sistema com Eficiência

1. **Faça backup regularmente**: Exporte seus dados semanalmente
2. **Use nomes descritivos**: Ao adicionar espaços, use nomes claros
3. **Mantenha custos atualizados**: Revise os custos mensalmente
4. **Organize itens extras**: Mantenha apenas itens que usa frequentemente
5. **Teste antes de apresentar**: Sempre calcule e revise antes de exportar para cliente

### Para Apresentar Propostas

1. **Use o PDF Cliente**: Sempre para apresentações externas
2. **Personalize a proposta**: Ajuste margem e desconto conforme o caso
3. **Explique os benefícios**: Use as métricas para mostrar valor
4. **Mantenha profissionalismo**: Os PDFs são formatados para apresentação formal

### Para Análise Interna

1. **Use o PDF Superintendência**: Para aprovações e análises
2. **Revise indicadores**: Margem líquida, markup e custo/hora
3. **Compare opções**: Calcule diferentes cenários antes de decidir
4. **Documente decisões**: Salve os PDFs para referência futura

---

**Versão do Manual**: 5.0.0  
**Última Atualização**: 17 de dezembro de 2025  
**Sistema**: Calculadora de Orçamento CDL/UTV v5.0

---

© 2025 CDL Manaus - Câmara de Dirigentes Lojistas. Todos os direitos reservados.
