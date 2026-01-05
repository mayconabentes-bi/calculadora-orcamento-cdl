# Procedimento de Contingência - Criação Manual de Usuários

**Versão:** 5.1.0  
**Arquitetura:** Zero Trust - Axioma CDL/Manaus  
**Data:** 2026-01-05  
**Conformidade:** SGQ-SECURITY

## Contexto

Este documento descreve o **procedimento de fallback imediato** para criação de usuários quando o método `authManager.criarUsuario()` falhar ou não estiver disponível.

## ⚠️ Quando Utilizar Este Procedimento

- Falha na criação via API do Firebase Admin
- Problemas de permissão com service account
- Necessidade de criar usuário rapidamente sem acesso ao sistema
- Ambiente de desenvolvimento/teste sem credenciais de admin

## 🔒 Princípios de Segurança

1. **Zero Trust**: Todas as operações devem ser auditadas
2. **Sincronização Obrigatória**: Auth e Firestore devem estar 100% sincronizados
3. **Status Ativo**: Campo `status: 'ativo'` é OBRIGATÓRIO
4. **UID Exato**: O ID do documento Firestore DEVE ser o mesmo UID do Auth

## 📋 Procedimento Passo a Passo

### Passo A: Criação no Firebase Authentication Console

1. **Acesse o Firebase Console**
   - URL: https://console.firebase.google.com/
   - Projeto: `axioma-cdl-manaus`

2. **Navegue até Authentication**
   - Menu lateral → Authentication
   - Aba "Users"

3. **Adicione um novo usuário**
   - Clique em "Add user"
   - Preencha os campos:
     - **Email**: endereço de email do usuário
     - **Password**: senha forte (mínimo 6 caracteres)
     - **User UID**: deixe em branco (será gerado automaticamente)

4. **Copie o UID gerado**
   - ⚠️ **CRÍTICO**: Após criar, copie o UID exato
   - Exemplo: `kL9mN2pQ4rS6tU8vW0xY1zA3B5C7D9E`

### Passo B: Criação do Documento no Firestore

1. **Acesse o Firestore Console**
   - Menu lateral → Firestore Database
   - Aba "Data"

2. **Navegue até a coleção `usuarios`**
   - Se não existir, crie a coleção clicando em "Start collection"
   - Nome da coleção: `usuarios`

3. **Adicione um novo documento**
   - Clique em "Add document"
   - **Document ID**: Cole o UID EXATO copiado do Passo A
     - ⚠️ **CRÍTICO**: O ID do documento DEVE ser igual ao UID do Auth
     - ❌ ERRADO: `user_123` (diferente do UID)
     - ✅ CORRETO: `kL9mN2pQ4rS6tU8vW0xY1zA3B5C7D9E` (mesmo UID)

4. **Adicione os campos obrigatórios**
   ```
   Campo: email
   Tipo: string
   Valor: mesmo email usado no Auth
   
   Campo: nome
   Tipo: string
   Valor: nome completo do usuário
   
   Campo: role
   Tipo: string
   Valor: user | admin | superintendente
   
   Campo: status
   Tipo: string
   Valor: ativo
   
   Campo: createdAt
   Tipo: string
   Valor: timestamp ISO 8601 (ex: 2026-01-05T12:42:45.078Z)
   
   Campo: updatedAt
   Tipo: string
   Valor: timestamp ISO 8601 (ex: 2026-01-05T12:42:45.078Z)
   ```

5. **Salve o documento**
   - Clique em "Save"
   - Verifique que todos os campos foram salvos corretamente

### Passo C: Validação do Campo `status: 'ativo'`

1. **Verifique no Firestore**
   - Abra o documento criado
   - Confirme que o campo `status` tem o valor `ativo` (minúsculas)
   - ❌ INCORRETO: `Ativo`, `ATIVO`, `active`
   - ✅ CORRETO: `ativo`

2. **Teste de Login**
   - Abra `index.html` no navegador
   - Abra o Console (F12)
   - Faça login com as credenciais criadas
   - Verifique o log no console:
     ```
     [SGQ-SECURITY] ✅ Acesso validado para role: [ROLE] | Timestamp: [ISO 8601]
     ```

3. **Em caso de erro**
   - Se aparecer "Usuário não encontrado no sistema":
     - ❌ O documento Firestore não existe ou UID está errado
     - Ação: Verifique que o Document ID = UID do Auth
   
   - Se aparecer "Usuário inativo":
     - ❌ Campo status não está como 'ativo'
     - Ação: Edite o documento e corrija o campo status

## 🎯 Checklist de Verificação

Use este checklist para garantir que o processo foi executado corretamente:

- [ ] Usuário criado no Firebase Authentication
- [ ] UID do usuário copiado corretamente
- [ ] Documento criado no Firestore na coleção `usuarios`
- [ ] Document ID = UID do Authentication (exatamente igual)
- [ ] Campo `email` preenchido e igual ao Auth
- [ ] Campo `nome` preenchido
- [ ] Campo `role` preenchido com valor válido (user/admin/superintendente)
- [ ] Campo `status` = `ativo` (minúsculas)
- [ ] Campos `createdAt` e `updatedAt` com timestamps ISO 8601
- [ ] Teste de login realizado com sucesso
- [ ] Log de SGQ-SECURITY confirmado no console

## 📊 Exemplo Completo

### Authentication (Firebase Auth)
```
UID: kL9mN2pQ4rS6tU8vW0xY1zA3B5C7D9E
Email: joao.silva@axioma.cdl
Password: JoaoSilva@2026
```

### Firestore (Collection: usuarios, Document ID: kL9mN2pQ4rS6tU8vW0xY1zA3B5C7D9E)
```json
{
  "email": "joao.silva@axioma.cdl",
  "nome": "João Silva",
  "role": "user",
  "status": "ativo",
  "createdAt": "2026-01-05T12:42:45.078Z",
  "updatedAt": "2026-01-05T12:42:45.078Z"
}
```

### Log de Sucesso Esperado
```
[SGQ-SECURITY] Iniciando autenticação | Timestamp: 2026-01-05T12:43:10.123Z
[SGQ-SECURITY] Autenticação Firebase Auth bem-sucedida | UID: kL9mN2pQ4rS6tU8vW0xY1zA3B5C7D9E
[SGQ-SECURITY] Verificando metadados no Firestore | UID: kL9mN2pQ4rS6tU8vW0xY1zA3B5C7D9E
[SGQ-SECURITY] Metadados encontrados | Role: user | Status: ativo
[SGQ-SECURITY] ✅ Acesso validado para role: user | Timestamp: 2026-01-05T12:43:10.456Z
[SGQ-SECURITY] Login bem-sucedido
[SGQ-SECURITY] Email: joao.silva@axioma.cdl
[SGQ-SECURITY] UID: kL9mN2pQ4rS6tU8vW0xY1zA3B5C7D9E
[SGQ-SECURITY] Role: user
[SGQ-SECURITY] Status: ativo
```

## 🚨 Erros Comuns e Soluções

### Erro: "Usuário não encontrado no sistema"

**Causa**: Documento Firestore não existe ou UID não corresponde

**Solução**:
1. Verifique se o documento existe em `usuarios` collection
2. Confirme que Document ID = UID do Auth (exatamente igual)
3. Verifique se não há espaços extras no UID

**Log Esperado**:
```
[SGQ-SECURITY] FALHA: Usuário autenticado mas ausente no Firestore
[SGQ-SECURITY] Tipo de erro: Metadados ausentes (Firestore)
```

### Erro: "Usuário inativo"

**Causa**: Campo `status` não está como `ativo` ou está ausente

**Solução**:
1. Abra o documento no Firestore
2. Edite o campo `status` para `ativo` (minúsculas)
3. Salve e tente fazer login novamente

**Log Esperado**:
```
[SGQ-SECURITY] FALHA: Usuário inativo
[SGQ-SECURITY] Status atual: inativo
[SGQ-SECURITY] Tipo de erro: Status inativo (Firestore)
```

### Erro: "Credenciais inválidas"

**Causa**: Email ou senha incorretos no Firebase Auth

**Solução**:
1. Verifique o email no Firebase Auth Console
2. Redefina a senha se necessário
3. Tente novamente com as credenciais corretas

**Log Esperado**:
```
[SGQ-SECURITY] ❌ FALHA NO LOGIN
[SGQ-SECURITY] Tipo de erro: Credencial (Auth)
[SGQ-SECURITY] Código do erro: auth/invalid-credential
```

## 🔐 Considerações de Segurança

1. **Senhas Temporárias**: Sempre use senhas fortes inicialmente e instrua o usuário a alterá-la no primeiro acesso
2. **Auditoria**: Mantenha registro de todos os usuários criados manualmente
3. **Revisão Periódica**: Periodicamente, revise os usuários e remova contas não utilizadas
4. **Status**: Use `status: 'inativo'` para desativar usuários sem deletá-los

## 📞 Suporte

Em caso de problemas persistentes:

1. Verifique os logs do console do navegador
2. Execute o script de verificação: `npm run verify:auth`
3. Execute o teste multi-role: `node tests/verification/test-multi-role-access.js`
4. Consulte a documentação: `AUTHENTICATION_GUIDE.md`

---

**Versão do Documento**: 1.0  
**Última Atualização**: 2026-01-05  
**Autor**: Equipe SGQ-SECURITY  
**Conformidade**: ISO 27001, Arquitetura Zero Trust
