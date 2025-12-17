# 🌐 Como Acessar o Sistema Online

## ⚠️ IMPORTANTE: O Sistema Ainda NÃO Está Online

Para ficar online, você precisa fazer 2 passos simples (leva 2 minutos):

---

## ✅ Passo 1: Mergear o Pull Request

**Por que?** O código está na branch do PR, mas precisa estar em `main` para o GitHub Pages funcionar.

**📍 Onde está o botão?**
- Role até o **FINAL** da página do PR (depois dos comentários)
- Procure um **botão VERDE** escrito "Merge pull request"
- Fica abaixo de todos os comentários da conversa

**Como fazer:**
1. Vá para: https://github.com/mayconabentes-bi/calculadora-orcamento-cdl/pulls
2. Clique no PR "Initial project setup..."
3. **Role até o final da página** ⬇️
4. Clique em **"Merge pull request"** (botão verde 🟢)
5. Clique em **"Confirm merge"**

**❓ Não vê o botão?** Veja GUIA_VISUAL.md para troubleshooting

---

## ✅ Passo 2: Habilitar GitHub Pages

**Por que?** Precisa ativar o GitHub Pages no repositório.

**📍 Onde está?**
- Clique em **"Settings"** (aba no topo do repositório ⚙️)
- No menu lateral esquerdo, procure **"Pages"** (está perto do final)
- Clique em "Pages"

**Como fazer:**
1. **Link direto**: https://github.com/mayconabentes-bi/calculadora-orcamento-cdl/settings/pages
2. Ou: Repositório → Settings (topo) → Pages (menu esquerdo)
3. Em **"Source"**, clique no dropdown
4. Selecione: **"GitHub Actions"** (NÃO "Deploy from a branch")
5. Salva automaticamente ✅

**❓ Não vê Settings ou Pages?** Veja GUIA_VISUAL.md para troubleshooting

---

## ✅ Passo 3: Aguardar Deploy (1-2 minutos)

1. Vá em: https://github.com/mayconabentes-bi/calculadora-orcamento-cdl/actions
2. Verá um workflow "Deploy to GitHub Pages" rodando
3. Aguarde aparecer ✅ verde

---

## 🎉 Passo 4: Acessar!

**URL do sistema**: https://mayconabentes-bi.github.io/calculadora-orcamento-cdl/

---

## 📖 Documentação Detalhada

Veja **VERIFICACAO.md** para:
- Checklist completo de verificação
- Troubleshooting detalhado
- Alternativas para testar localmente
- Solução para erros comuns

---

## 🚀 Acesso Imediato (Sem Merge)

Se quiser testar **antes** de mergear:

### Opção A: Usar Localmente

1. Clone o repositório:
```bash
git clone https://github.com/mayconabentes-bi/calculadora-orcamento-cdl.git
cd calculadora-orcamento-cdl
git checkout copilot/create-project-structure
```

2. Abra o arquivo `index.html` no navegador
   - **Chrome/Edge**: Clique duas vezes no arquivo
   - **Firefox**: Arraste o arquivo para o navegador

### Opção B: Usar Servidor Local

```bash
# Com Python 3
python3 -m http.server 8000

# Acesse: http://localhost:8000
```

---

## ❓ Problemas?

### O site não carrega

- ✅ Verifique se GitHub Pages está habilitado (Settings → Pages)
- ✅ Verifique se o workflow foi executado (Actions tab)
- ✅ Aguarde 1-2 minutos após o deploy
- ✅ Limpe o cache do navegador (Ctrl+F5 ou Cmd+Shift+R)

### Erro 404

- ✅ Confirme que o PR foi mergeado para `main`
- ✅ Verifique a URL: https://mayconabentes-bi.github.io/calculadora-orcamento-cdl/
- ✅ Aguarde alguns minutos após o primeiro deploy

---

## 📞 Suporte

Se ainda tiver problemas, verifique:
1. **Actions tab** no GitHub para ver o status do deploy
2. **Settings → Pages** para confirmar a configuração
3. Console do navegador (F12) para ver erros

O sistema é 100% estático (HTML/CSS/JS) e não requer servidor backend!
