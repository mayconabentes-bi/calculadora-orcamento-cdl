#!/usr/bin/env node

/**
 * Firebase Private Key Base64 Converter
 * Arquitetura Axioma v5.1.0 - SGQ-SECURITY Zero Trust
 * 
 * Este script extrai a chave privada de um arquivo JSON de credenciais Firebase
 * e gera a string Base64 para uso na variável FIREBASE_PRIVATE_KEY_BASE64
 * 
 * Uso:
 * node convert-private-key-to-base64.js [caminho-para-arquivo.json]
 * 
 * Exemplo:
 * node convert-private-key-to-base64.js axioma-cdl-manaus-firebase-adminsdk-fbsvc-8e7483fceb.json
 */

const fs = require('fs');
const path = require('path');

console.log('╔══════════════════════════════════════════════════════════════════╗');
console.log('║  Firebase Private Key Base64 Converter                          ║');
console.log('║  SGQ-SECURITY - Arquitetura Zero Trust                          ║');
console.log('╚══════════════════════════════════════════════════════════════════╝');
console.log('');

// Obter o caminho do arquivo JSON dos argumentos da linha de comando
const args = process.argv.slice(2);
let jsonFilePath;

if (args.length === 0) {
  // Procurar automaticamente por arquivo JSON de credenciais na raiz
  const rootDir = __dirname;
  const files = fs.readdirSync(rootDir);
  
  const credentialFiles = files.filter(file => 
    file.includes('firebase-adminsdk') && file.endsWith('.json')
  );
  
  if (credentialFiles.length === 0) {
    console.error('❌ ERRO: Nenhum arquivo de credenciais Firebase encontrado');
    console.error('');
    console.error('Uso:');
    console.error('  node convert-private-key-to-base64.js <arquivo-credenciais.json>');
    console.error('');
    console.error('Exemplo:');
    console.error('  node convert-private-key-to-base64.js axioma-cdl-manaus-firebase-adminsdk-fbsvc-8e7483fceb.json');
    console.error('');
    process.exit(1);
  }
  
  if (credentialFiles.length > 1) {
    console.log('⚠️  Múltiplos arquivos de credenciais encontrados:');
    credentialFiles.forEach((file, index) => {
      console.log(`   ${index + 1}. ${file}`);
    });
    console.log('');
    console.log('Por favor, especifique qual arquivo usar:');
    console.log('  node convert-private-key-to-base64.js <nome-do-arquivo>');
    console.log('');
    process.exit(1);
  }
  
  jsonFilePath = path.join(rootDir, credentialFiles[0]);
  console.log(`[SGQ-SECURITY] Arquivo encontrado automaticamente: ${credentialFiles[0]}`);
  console.log('');
} else {
  jsonFilePath = path.resolve(args[0]);
}

// Verificar se o arquivo existe
if (!fs.existsSync(jsonFilePath)) {
  console.error(`❌ ERRO: Arquivo não encontrado: ${jsonFilePath}`);
  console.error('');
  process.exit(1);
}

const timestamp = new Date().toISOString();
console.log(`[SGQ-SECURITY] ${timestamp} - Iniciando conversão`);
console.log(`[SGQ-SECURITY] Arquivo: ${path.basename(jsonFilePath)}`);
console.log('');

try {
  // Ler o arquivo JSON
  const fileContent = fs.readFileSync(jsonFilePath, 'utf8');
  const credentials = JSON.parse(fileContent);
  
  // Validar campos obrigatórios
  const requiredFields = ['private_key', 'project_id', 'client_email'];
  const missingFields = requiredFields.filter(field => !credentials[field]);
  
  if (missingFields.length > 0) {
    console.error('❌ ERRO: Campos obrigatórios ausentes no JSON:');
    missingFields.forEach(field => console.error(`   - ${field}`));
    console.error('');
    process.exit(1);
  }
  
  // Extrair a chave privada
  const privateKey = credentials.private_key;
  
  if (typeof privateKey !== 'string' || privateKey.trim() === '') {
    console.error('❌ ERRO: Campo private_key está vazio ou inválido');
    console.error('');
    process.exit(1);
  }
  
  // Converter para Base64
  const privateKeyBase64 = Buffer.from(privateKey, 'utf-8').toString('base64');
  
  console.log('✅ Conversão concluída com sucesso!');
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('CONFIGURAÇÃO DO ARQUIVO .env');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('');
  console.log('Adicione as seguintes variáveis ao seu arquivo .env:');
  console.log('');
  console.log(`FIREBASE_PROJECT_ID=${credentials.project_id}`);
  console.log(`FIREBASE_CLIENT_EMAIL=${credentials.client_email}`);
  console.log('');
  console.log('# Nova variável Base64 (recomendado para produção)');
  console.log(`FIREBASE_PRIVATE_KEY_BASE64="${privateKeyBase64}"`);
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('AÇÕES DE SEGURANÇA (SGQ-SECURITY)');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('');
  console.log('⚠️  IMPORTANTE - Protocolo Zero Trust:');
  console.log('');
  console.log('1. ✅ Copie a variável FIREBASE_PRIVATE_KEY_BASE64 acima para o .env');
  console.log('2. ✅ Remova a variável FIREBASE_PRIVATE_KEY antiga (se existir)');
  console.log('3. ✅ Teste a configuração: npm run verify:auth');
  console.log('4. ✅ Após confirmação de sucesso, DELETE o arquivo JSON:');
  console.log(`      rm "${path.basename(jsonFilePath)}"`);
  console.log('5. ✅ Guarde a string Base64 em um gerenciador de senhas corporativo');
  console.log('6. ✅ NUNCA commite o arquivo .env ou JSON no Git');
  console.log('');
  console.log(`[SGQ-SECURITY] ${new Date().toISOString()} - Conversão finalizada`);
  console.log('');
  
  // Criar arquivo temporário com instruções (opcional)
  const instructionsPath = path.join(__dirname, 'BASE64_SETUP_INSTRUCTIONS.txt');
  const instructions = `
╔══════════════════════════════════════════════════════════════════╗
║  Firebase Private Key Base64 - Instruções de Configuração       ║
║  SGQ-SECURITY - Arquitetura Zero Trust                          ║
╚══════════════════════════════════════════════════════════════════╝

Data de geração: ${timestamp}
Arquivo processado: ${path.basename(jsonFilePath)}

═══════════════════════════════════════════════════════════════════
PASSO 1: CONFIGURAR O ARQUIVO .env
═══════════════════════════════════════════════════════════════════

Adicione as seguintes variáveis ao arquivo .env:

FIREBASE_PROJECT_ID=${credentials.project_id}
FIREBASE_CLIENT_EMAIL=${credentials.client_email}

# Nova variável Base64 (recomendado para produção)
FIREBASE_PRIVATE_KEY_BASE64="${privateKeyBase64}"

═══════════════════════════════════════════════════════════════════
PASSO 2: REMOVER CONFIGURAÇÃO ANTIGA
═══════════════════════════════════════════════════════════════════

Se você tiver a variável FIREBASE_PRIVATE_KEY antiga no .env, REMOVA-A:
# FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n..."  <-- DELETAR

═══════════════════════════════════════════════════════════════════
PASSO 3: TESTAR A CONFIGURAÇÃO
═══════════════════════════════════════════════════════════════════

Execute o comando de verificação:

  npm run verify:auth

Verifique se o Passo 7 exibe:
  ✅ Successfully connected to Firebase!

═══════════════════════════════════════════════════════════════════
PASSO 4: SINCRONIZAR USUÁRIO ADMINISTRADOR
═══════════════════════════════════════════════════════════════════

Execute o comando para criar/sincronizar o usuário:

  npm run setup:user

Verifique no Firestore se o documento do usuário contém:
  status: 'ativo' (em minúsculas)

═══════════════════════════════════════════════════════════════════
PASSO 5: REMOVER ARQUIVOS DE CREDENCIAIS (CRÍTICO!)
═══════════════════════════════════════════════════════════════════

Após confirmar que tudo funciona, DELETE o arquivo JSON:

  rm "${path.basename(jsonFilePath)}"

E também DELETE este arquivo de instruções:

  rm BASE64_SETUP_INSTRUCTIONS.txt

═══════════════════════════════════════════════════════════════════
BACKUP DE SEGURANÇA
═══════════════════════════════════════════════════════════════════

GUARDE a string Base64 em um gerenciador de senhas corporativo:
- 1Password
- LastPass
- Bitwarden
- HashiCorp Vault

NUNCA armazene credenciais em:
- Código-fonte
- Documentos
- E-mails
- Mensagens
- Screenshots

═══════════════════════════════════════════════════════════════════
[SGQ-SECURITY] ${new Date().toISOString()}
Protocolo Zero Trust - Axioma v5.1.0
═══════════════════════════════════════════════════════════════════
`;
  
  fs.writeFileSync(instructionsPath, instructions, 'utf8');
  console.log(`📄 Instruções salvas em: ${instructionsPath}`);
  console.log('   (DELETE este arquivo após completar a configuração)');
  console.log('');
  
  process.exit(0);
  
} catch (error) {
  console.error(`[SGQ-SECURITY] ${new Date().toISOString()} - ❌ ERRO FATAL`);
  console.error(`Mensagem: ${error.message}`);
  console.error('');
  
  if (error instanceof SyntaxError) {
    console.error('💡 O arquivo JSON está malformado ou corrompido.');
    console.error('   Verifique se é um arquivo JSON válido.');
  }
  
  console.error('');
  process.exit(1);
}
