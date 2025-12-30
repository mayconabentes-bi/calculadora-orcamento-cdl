# Setup - Criar Usuário Inicial do Desenvolvedor

## Credenciais do Desenvolvedor

**E-mail:** mayconabentes@gmail.com  
**Senha:** Aprendiz@33  
**Role:** admin  
**Status:** ativo

## Opção 1: Criar via Firebase Console (Recomendado)

### Passo a Passo:

1. **Acesse o Firebase Console:**
   - Vá para: https://console.firebase.google.com/
   - Selecione o projeto: **axioma-cdl-manaus**

2. **Criar o usuário no Firebase Authentication:**
   - No menu lateral, clique em **Authentication**
   - Clique na aba **Users**
   - Clique no botão **Add user**
   - Preencha:
     - **Email:** `mayconabentes@gmail.com`
     - **Password:** `Aprendiz@33`
   - Clique em **Add user**
   - **IMPORTANTE:** Copie o **UID** do usuário criado (você precisará dele no próximo passo)

3. **Criar o documento no Firestore:**
   - No menu lateral, clique em **Firestore Database**
   - Se a coleção `usuarios` não existir, crie-a
   - Clique em **Add document**
   - **Document ID:** Cole o UID que você copiou no passo anterior
   - Adicione os seguintes campos:
     
     | Campo | Tipo | Valor |
     |-------|------|-------|
     | email | string | mayconabentes@gmail.com |
     | nome | string | Maycon Abentes |
     | role | string | admin |
     | status | string | ativo |
     | dataCriacao | string | 2024-12-30T12:36:00.000Z |

   - Clique em **Save**

4. **Verificar a criação:**
   - Acesse a aplicação em `index.html`
   - Tente fazer login com:
     - **E-mail:** mayconabentes@gmail.com
     - **Senha:** Aprendiz@33
   - Você deve ser redirecionado para o dashboard-admin.html

## Opção 2: Criar via Script Node.js (Avançado)

Se você tiver o Firebase Admin SDK configurado, pode usar este script:

```javascript
// setup-user.js
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const auth = admin.auth();
const db = admin.firestore();

async function createInitialUser() {
  try {
    // Criar usuário no Authentication
    const userRecord = await auth.createUser({
      email: 'mayconabentes@gmail.com',
      password: 'Aprendiz@33',
      emailVerified: false,
      disabled: false
    });

    console.log('✅ Usuário criado no Authentication:', userRecord.uid);

    // Criar documento no Firestore
    await db.collection('usuarios').doc(userRecord.uid).set({
      email: 'mayconabentes@gmail.com',
      nome: 'Maycon Abentes',
      role: 'admin',
      status: 'ativo',
      dataCriacao: new Date().toISOString()
    });

    console.log('✅ Documento criado no Firestore');
    console.log('');
    console.log('Credenciais de acesso:');
    console.log('  E-mail: mayconabentes@gmail.com');
    console.log('  Senha: Aprendiz@33');
    console.log('  Role: admin');
    
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error);
  }
}

createInitialUser();
```

**Para executar o script:**

1. Instale o Firebase Admin SDK:
   ```bash
   npm install firebase-admin
   ```

2. Baixe a chave de serviço do Firebase Console:
   - Vá em **Project Settings** > **Service Accounts**
   - Clique em **Generate new private key**
   - Salve o arquivo como `serviceAccountKey.json` na raiz do projeto

3. Execute o script:
   ```bash
   node setup-user.js
   ```

## Verificação Final

Após criar o usuário, verifique:

1. **No Firebase Console:**
   - Authentication > Users: Deve aparecer mayconabentes@gmail.com
   - Firestore > usuarios: Deve existir um documento com o UID do usuário

2. **Na Aplicação:**
   - Acesse `index.html`
   - Faça login com as credenciais
   - Você deve ser redirecionado para o dashboard
   - No dashboard, deve aparecer "Maycon Abentes" no header
   - Deve ter acesso à aba "Configurações" > "Gestão de Usuários" (permissão de admin)

## Troubleshooting

### Erro: "Usuário não encontrado no sistema"
- O usuário foi criado no Authentication mas não no Firestore
- Solução: Crie o documento no Firestore com o UID correto

### Erro: "Usuário inativo"
- O campo `status` está diferente de 'ativo'
- Solução: Edite o documento no Firestore e altere `status` para 'ativo'

### Não consigo fazer login
- Verifique se o e-mail e senha estão corretos
- Verifique se não há erros no console do navegador
- Verifique se o Firebase está configurado corretamente em `firebase-config.js`

---

**Data de Criação:** 30/12/2024  
**Usuário:** Maycon Abentes (Desenvolvedor/Admin)  
**Propósito:** Credencial inicial para desenvolvimento e administração do sistema
