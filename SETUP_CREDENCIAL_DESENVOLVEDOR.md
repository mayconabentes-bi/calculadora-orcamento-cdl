# Criação de Credencial do Desenvolvedor - Guia Rápido

## ✅ Credenciais Solicitadas

- **E-mail:** mayconabentes@gmail.com
- **Senha:** Aprendiz@33
- **Função:** Administrador (admin)
- **Status:** Ativo

## 🚀 Opções de Criação

### Opção 1: Via Firebase Console (Mais Simples)

Siga as instruções detalhadas no arquivo: **[setup-initial-user.md](./setup-initial-user.md)**

**Resumo:**
1. Acesse o Firebase Console
2. Crie o usuário em Authentication
3. Copie o UID
4. Crie o documento em Firestore com o UID

### Opção 2: Via Script Automatizado (Recomendado)

**Pré-requisitos:**
- Node.js instalado
- Chave de serviço do Firebase (serviceAccountKey.json)

**Passos:**

1. **Instalar dependência:**
   ```bash
   npm install firebase-admin
   ```

2. **Obter chave de serviço:**
   - Acesse Firebase Console
   - Vá em Project Settings > Service Accounts
   - Clique em "Generate new private key"
   - Salve como `serviceAccountKey.json` na raiz do projeto

3. **Executar o script:**
   ```bash
   npm run setup:user
   ```
   
   ou diretamente:
   ```bash
   node setup-developer-user.js
   ```

4. **Resultado esperado:**
   ```
   ✅ Usuário desenvolvedor criado com sucesso!
   
   Credenciais de acesso:
     E-mail: mayconabentes@gmail.com
     Senha: Aprendiz@33
     Nome: Maycon Abentes
     Role: admin
     Status: ativo
   ```

## 🧪 Verificação

Após criar o usuário:

1. Abra `index.html` no navegador
2. Faça login com as credenciais:
   - E-mail: **mayconabentes@gmail.com**
   - Senha: **Aprendiz@33**
3. Você deve ser redirecionado para `dashboard-admin.html`
4. No header, deve aparecer "Maycon Abentes"
5. Deve ter acesso à aba "Configurações" > "Gestão de Usuários"

## ⚠️ Segurança

**IMPORTANTE:**
- ✅ O arquivo `serviceAccountKey.json` está no `.gitignore`
- ✅ Não commite a chave de serviço no repositório
- ✅ Esta senha é temporária - altere após o primeiro login (quando implementado)
- ✅ Em produção, use senhas mais fortes e autenticação de dois fatores

## 📚 Documentação Relacionada

- **[setup-initial-user.md](./setup-initial-user.md)** - Instruções detalhadas passo a passo
- **[setup-developer-user.js](./setup-developer-user.js)** - Script de automação
- **[AUTHENTICATION_GUIDE.md](./AUTHENTICATION_GUIDE.md)** - Guia completo do sistema de autenticação
- **[FIREBASE_AUTH_FIX_DOCUMENTATION.md](./FIREBASE_AUTH_FIX_DOCUMENTATION.md)** - Documentação da correção do Firebase

## 🐛 Troubleshooting

### "Usuário já existe"
O script detecta se o usuário já existe e informa. Nenhuma ação necessária.

### "serviceAccountKey.json não encontrado"
Baixe a chave de serviço do Firebase Console conforme instruções acima.

### "Erro ao fazer login"
Verifique:
1. Usuário foi criado no Authentication E no Firestore
2. O campo `status` está como `ativo`
3. Não há erros no console do navegador

---

**Criado em:** 30/12/2024  
**Solicitado por:** @mayconabentes-bi  
**Status:** ✅ Pronto para uso
