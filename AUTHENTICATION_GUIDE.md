# Sistema de Autenticação - Axioma CDL/UTV

## Visão Geral

O sistema Axioma agora conta com uma camada de autenticação robusta utilizando Firebase Authentication, garantindo que apenas usuários autorizados possam acessar o painel administrativo e suas funcionalidades.

## Arquitetura

### 1. **Estrutura de Páginas**

- **`index.html`** - Landing Page / Gateway
  - Página pública de entrada do sistema
  - Duas seções principais:
    - **Área do Cliente**: Acesso direto para solicitação de orçamentos (público)
    - **Área de Gestão**: Formulário de login para colaboradores CDL/UTV
  - Verifica automaticamente se o usuário já está autenticado

- **`dashboard-admin.html`** - Painel Administrativo (Protegido)
  - Requer autenticação obrigatória
  - Verifica autenticação ao carregar a página
  - Redireciona para `index.html` se não autenticado
  - Contém todas as funcionalidades de gestão de orçamentos

- **`solicitacao.html`** - Formulário de Solicitação (Público)
  - Permanece acessível publicamente
  - Não requer autenticação
  - Permite que clientes enviem solicitações de orçamento

### 2. **Módulo de Autenticação** (`assets/js/auth.js`)

Gerencia todas as operações de autenticação através da classe `AuthManager`:

#### Principais Funcionalidades:

- **Login**: `login(email, password)`
  - Autentica usuário via Firebase Auth
  - Verifica status 'ativo' no Firestore
  - Retorna dados do usuário e metadata

- **Verificação de Acesso**: `verificarAcesso()`
  - Verifica se usuário está autenticado
  - Valida status 'ativo' no Firestore
  - Retorna true/false para acesso autorizado

- **Logout**: `logout()`
  - Desloga o usuário do Firebase Auth
  - Limpa dados de sessão local

- **Criação de Usuários**: `criarUsuario(email, password, nome, role)`
  - Disponível apenas para administradores
  - Cria usuário no Firebase Auth
  - Armazena metadata no Firestore

- **Gestão de Usuários**: 
  - `listarUsuarios()` - Lista todos os usuários (admin only)
  - `atualizarStatusUsuario(uid, status)` - Ativa/desativa usuários (admin only)

### 3. **Armazenamento de Dados (Firestore)**

#### Coleção `usuarios`:
```javascript
{
  uid: string,           // ID do Firebase Auth
  email: string,         // E-mail do usuário
  nome: string,          // Nome completo
  role: string,          // 'user' | 'admin' | 'superintendente'
  status: string,        // 'ativo' | 'inativo'
  dataCriacao: string,   // ISO timestamp
  criadoPor: string      // UID do criador
}
```

## Roles e Permissões

### 1. **user** (Usuário Padrão)
- Acesso ao dashboard administrativo
- Pode criar e gerenciar orçamentos
- Visualizar relatórios e histórico
- **NÃO** pode criar novos usuários

### 2. **admin** (Administrador)
- Todas as permissões de 'user'
- Criar novos usuários
- Gerenciar status de usuários (ativar/desativar)
- Acesso completo ao sistema

### 3. **superintendente** (Superintendente)
- Todas as permissões de 'admin'
- Aprovar orçamentos na área restrita
- Acesso a funcionalidades executivas

## Fluxo de Autenticação

### Login:
```
1. Usuário acessa index.html
2. Preenche e-mail e senha
3. Sistema valida credenciais no Firebase Auth
4. Verifica status 'ativo' no Firestore
5. Se válido: Redireciona para dashboard-admin.html
6. Se inválido: Mostra mensagem de erro
```

### Proteção do Dashboard:
```
1. Usuário tenta acessar dashboard-admin.html
2. Script de autenticação executa verificarAcesso()
3. Firebase Auth verifica se há sessão ativa
4. Sistema verifica status 'ativo' no Firestore
5. Se autorizado: Exibe dashboard
6. Se não autorizado: Redireciona para index.html
```

### Logout:
```
1. Usuário clica no botão "Sair"
2. Sistema confirma a ação
3. authManager.logout() executa signOut do Firebase
4. Redireciona para index.html
```

## Segurança

### Implementações de Segurança:

1. **Verificação em Múltiplas Camadas**:
   - Autenticação no Firebase Auth
   - Validação de status no Firestore
   - Verificação de role para operações sensíveis

2. **Proteção contra Acesso Não Autorizado**:
   - Redirecionamento automático para login
   - Verificação ao carregar cada página protegida
   - Timeout de sessão gerenciado pelo Firebase

3. **Separação de Contextos**:
   - Área pública (solicitacao.html) permanece acessível
   - Área administrativa totalmente protegida
   - Gestão de usuários restrita a administradores

4. **Auditoria**:
   - Registro de criação de usuários (criadoPor)
   - Timestamp de operações
   - Histórico de atualizações

## Setup Inicial

### 1. Criar Primeiro Administrador

Como ainda não há usuários no sistema, você precisará criar o primeiro administrador manualmente via Firebase Console:

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Selecione o projeto "axioma-cdl-manaus"
3. Vá em **Authentication** > **Users** > **Add user**
4. Crie um usuário com e-mail e senha
5. Copie o **UID** do usuário criado
6. Vá em **Firestore Database** > **usuarios** (crie a coleção se não existir)
7. Adicione um documento com ID = UID do usuário:
   ```json
   {
     "email": "admin@cdlmanaus.com.br",
     "nome": "Administrador",
     "role": "admin",
     "status": "ativo",
     "dataCriacao": "2024-12-30T00:00:00.000Z"
   }
   ```

### 2. Primeiro Login

1. Acesse a página principal do sistema (index.html)
2. Na seção "Acesso Colaborador CDL/UTV", faça login com:
   - E-mail do administrador
   - Senha cadastrada
3. Você será redirecionado para o dashboard
4. Acesse a aba **Configurações** > **Gestão de Usuários**
5. Crie os demais usuários do sistema

## Troubleshooting

### Erro: "Usuário não encontrado no sistema"
- O usuário existe no Firebase Auth mas não no Firestore
- Solução: Criar documento correspondente no Firestore

### Erro: "Usuário inativo"
- O status do usuário está como 'inativo'
- Solução: Admin deve alterar status para 'ativo'

### Não consegue ver "Gestão de Usuários"
- Usuário não tem role 'admin' ou 'superintendente'
- Solução: Admin deve alterar role do usuário no Firestore

### Redirecionamento infinito entre páginas
- Problema de cache ou sessão corrompida
- Solução: Limpar cache do navegador e fazer login novamente

## Manutenção

### Desativar Usuário
1. Login como admin
2. Configurações > Gestão de Usuários
3. Clicar em "Desativar" no usuário desejado
4. Usuário não poderá mais fazer login

### Reativar Usuário
1. Login como admin
2. Configurações > Gestão de Usuários
3. Clicar em "Ativar" no usuário desejado
4. Usuário poderá fazer login novamente

### Alterar Role de Usuário
- Não há interface para isso ainda
- Necessário alterar manualmente no Firestore Console
- Alterar campo `role` para: 'user', 'admin' ou 'superintendente'

## Considerações de Desenvolvimento

### Próximos Passos Sugeridos:

1. **Recuperação de Senha**:
   - Implementar "Esqueci minha senha" usando Firebase Auth
   - Adicionar na página de login

2. **Alteração de Role via Interface**:
   - Adicionar funcionalidade na gestão de usuários
   - Permitir admin alterar role de outros usuários

3. **Logs de Auditoria**:
   - Registrar todas as ações administrativas
   - Criar relatório de acessos e modificações

4. **Two-Factor Authentication**:
   - Adicionar autenticação de dois fatores
   - Aumentar segurança para roles admin

5. **Perfil de Usuário**:
   - Permitir usuário alterar próprio nome
   - Alterar própria senha
   - Configurações pessoais

## Contato e Suporte

Para questões relacionadas à autenticação ou acesso ao sistema, entre em contato com o administrador do sistema ou com o departamento de TI da CDL Manaus.

---

**Última atualização**: 30/12/2024  
**Versão do Sistema**: 5.1.0 + Auth Layer
