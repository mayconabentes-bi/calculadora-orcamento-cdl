# 🌐 Como Acessar o Sistema Online

## ✅ Opção 1: Acesso Direto (Após Merge)

Após mergear este PR para a branch `main`, o sistema estará disponível em:

**🔗 https://mayconabentes-bi.github.io/calculadora-orcamento-cdl/**

## 📋 Passos para Habilitar o Acesso:

### 1️⃣ Habilitar GitHub Pages

1. Vá em: **Settings** → **Pages** no repositório GitHub
2. Em **Source**, selecione: **GitHub Actions**
3. Salve as configurações

### 2️⃣ Mergear o Pull Request

1. Aprove e merge este Pull Request
2. O GitHub Actions irá automaticamente fazer o deploy
3. Aguarde 1-2 minutos para o site ficar disponível

### 3️⃣ Acessar o Sistema

Após o deploy, acesse: https://mayconabentes-bi.github.io/calculadora-orcamento-cdl/

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
