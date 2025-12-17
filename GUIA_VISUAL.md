# 📸 Guia Visual Passo a Passo - Como Acessar Online

Este guia mostra **exatamente** onde clicar para colocar o sistema online.

---

## 🔍 Passo 1: Localizar o Botão "Merge pull request"

### Onde está?

1. **Vá para a aba "Pull requests"** do repositório:
   ```
   https://github.com/mayconabentes-bi/calculadora-orcamento-cdl/pulls
   ```

2. **Clique no PR** (deve ter o título "Initial project setup - CDL/UTV Budget Calculator v5.0")

3. **Role a página até o final** (depois de todos os comentários)

4. **Procure por um botão verde** escrito **"Merge pull request"**

### Como é o botão?

```
┌─────────────────────────────────────────┐
│ 🟢 Merge pull request ▼                 │
└─────────────────────────────────────────┘
```

- **Cor**: Verde
- **Texto**: "Merge pull request"
- **Posição**: Final da página do PR, após todos os comentários
- **Próximo a**: Comentários da conversa

### Se NÃO encontrar o botão:

#### Situação A: Botão desabilitado ou cinza
- **Motivo**: Pode ter conflitos ou revisões pendentes
- **O que fazer**: 
  - Procure mensagens de erro em vermelho
  - Se houver conflitos, me avise

#### Situação B: Só aparece "Close pull request"
- **Motivo**: Pode não ter permissão de merge
- **O que fazer**: 
  - Verifique se você é admin/owner do repositório
  - Vá em Settings → Collaborators and teams
  - Você precisa ter permissão de "Write" ou superior

#### Situação C: Não vê nenhum PR
- **Motivo**: Pode estar na aba errada
- **O que fazer**: 
  - Clique em "Pull requests" no topo do repositório
  - Deve aparecer "1 Open" (1 aberto)

---

## 🔍 Passo 2: Confirmar o Merge

Depois de clicar em "Merge pull request":

1. **Aparecerá um campo de texto** para mensagem de commit (opcional)
2. **Clique no botão verde** "Confirm merge"
3. **Aguarde** alguns segundos
4. **Verá mensagem**: "Pull request successfully merged and closed"

---

## 🔍 Passo 3: Localizar GitHub Pages Settings

### Onde está?

1. **Clique em "Settings"** (aba no topo do repositório, ao lado de "Insights")
   ```
   Repositório > Settings (ícone de engrenagem ⚙️)
   ```

2. **No menu lateral esquerdo**, procure por **"Pages"**
   - Está na seção "Code and automation"
   - É um dos últimos itens do menu
   - Tem um ícone de página 📄

3. **Clique em "Pages"**

### Como é a página de Settings → Pages?

Você verá:

```
┌─────────────────────────────────────────┐
│ GitHub Pages                             │
│                                          │
│ Build and deployment                    │
│                                          │
│ Source                                   │
│ ┌─────────────────────┐                 │
│ │ Deploy from a branch ▼ │              │
│ └─────────────────────┘                 │
└─────────────────────────────────────────┘
```

### O que fazer:

1. **Clique no dropdown "Source"** (onde está escrito "Deploy from a branch")
2. **Selecione**: **"GitHub Actions"**
3. A página deve **salvar automaticamente** (sem botão de salvar)

### Depois de selecionar "GitHub Actions":

A página mostrará:
```
✅ Your site is ready to be published at 
   https://mayconabentes-bi.github.io/calculadora-orcamento-cdl/
```

---

## 🔍 Passo 4: Verificar o Deploy

### Onde verificar?

1. **Clique em "Actions"** (aba no topo, ao lado de "Pull requests")
   ```
   Repositório > Actions
   ```

2. **Você verá** um workflow chamado "Deploy to GitHub Pages"
   - Status: 🟡 Amarelo (rodando) ou 🟢 Verde (completo)

3. **Aguarde até ficar verde** ✅ (1-2 minutos)

### Como é a página de Actions?

```
┌─────────────────────────────────────────────┐
│ All workflows                                │
│                                              │
│ 🟢 Deploy to GitHub Pages                   │
│    main                                      │
│    #1: Merge pull request...                │
│    ✅ 2m 13s ago                            │
└─────────────────────────────────────────────┘
```

---

## ✅ Passo 5: Acessar o Site

Depois que o workflow ficar verde (✅):

**Acesse**: https://mayconabentes-bi.github.io/calculadora-orcamento-cdl/

O sistema deve carregar! 🎉

---

## ❓ Se Não Encontrar Algo

### "Não vejo a aba Settings"

**Motivo**: Você não tem permissão de admin no repositório.

**Solução**: 
- Se você é o dono: Verifique se está logado na conta certa
- Se não é o dono: Peça ao dono para:
  1. Adicionar você como colaborador com permissão de admin
  2. Ou fazer o merge e habilitar Pages

### "Não vejo Pages no menu Settings"

**Situações possíveis**:

1. **Repositório Privado + Conta Gratuita**
   - GitHub Pages não funciona em repos privados com conta free
   - **Solução**: Tornar o repo público (Settings → General → Danger Zone → Change visibility)

2. **Menu não carregou**
   - **Solução**: Recarregue a página (F5)

3. **Está no lugar errado**
   - **Solução**: Certifique-se de estar em Settings do REPOSITÓRIO (não do perfil)
   - URL correta: `https://github.com/mayconabentes-bi/calculadora-orcamento-cdl/settings`

### "Diz que preciso fazer upgrade"

**Motivo**: Repositório privado precisa de GitHub Pro/Enterprise para Pages.

**Soluções**:

**Opção A**: Tornar o repositório público
1. Settings → General
2. Role até "Danger Zone"
3. "Change repository visibility"
4. Selecione "Public"

**Opção B**: Fazer upgrade para GitHub Pro
- Não recomendado só para isso

**Opção C**: Usar localmente
- Baixe o ZIP e abra `index.html`

---

## 🚀 Atalhos Diretos

Use estes links diretos (substitua se necessário):

- **Pull Requests**: https://github.com/mayconabentes-bi/calculadora-orcamento-cdl/pulls
- **Settings → Pages**: https://github.com/mayconabentes-bi/calculadora-orcamento-cdl/settings/pages
- **Actions**: https://github.com/mayconabentes-bi/calculadora-orcamento-cdl/actions
- **Site Final**: https://mayconabentes-bi.github.io/calculadora-orcamento-cdl/

---

## 📱 Teste Rápido AGORA (Sem Deploy)

Se quiser testar **agora mesmo** sem fazer deploy:

### Método 1: GitHub.dev (Online)

1. Vá em: https://github.com/mayconabentes-bi/calculadora-orcamento-cdl
2. Pressione `.` (ponto) no teclado
3. Abrirá o VS Code online
4. No painel esquerdo, clique em `index.html`
5. Pressione `Alt+L Alt+O` ou clique com botão direito → "Open with Live Server"

### Método 2: Download e Abrir

1. Download: https://github.com/mayconabentes-bi/calculadora-orcamento-cdl/archive/refs/heads/copilot/create-project-structure.zip
2. Extraia o ZIP
3. Abra `index.html` (duplo clique)

✅ **Funciona 100% offline!**

---

## 📞 Precisa de Ajuda?

Se seguiu todos os passos e ainda tem problemas:

1. **Me diga ONDE você está travado**:
   - "Não vejo a aba Settings"
   - "Não vejo Pages no menu"
   - "Não vejo o botão Merge"
   - "O workflow falhou"

2. **Tire um print da tela** e compartilhe

3. **Copie a URL** da página onde está

Com essas informações, posso ajudar melhor! 🎯
