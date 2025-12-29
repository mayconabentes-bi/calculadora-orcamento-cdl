# Firebase Firestore Migration Guide

## Overview

The data persistence layer has been refactored to support **Firebase Firestore** while maintaining full backward compatibility with the existing localStorage implementation.

## Configuration

### Step 1: Configure Firebase

Edit `assets/js/firebase-config.js` and replace the placeholder values with your Firebase project credentials:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "axioma-cdl.firebaseapp.com",
  projectId: "axioma-cdl",
  storageBucket: "axioma-cdl.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### Step 2: Create Firestore Collections

In your Firebase Console, create the following collections:
- `leads` - For client/lead data
- `orcamentos` - For budget calculations
- `configuracoes` - For system configuration

## New Firebase Methods

The following async methods have been added to `DataManager`:

### 1. Save Lead (Client Data)

```javascript
// Save a client lead to Firestore
const lead = {
  nome: "Empresa XYZ",
  email: "contato@xyz.com",
  telefone: "(92) 99999-9999"
};

await dataManager.salvarLead(lead);
```

### 2. Add Budget to Firestore (with Workflow Status)

```javascript
// Saves budget with initial status: AGUARDANDO_APROVACAO
await dataManager.adicionarCalculoHistoricoFirestore(calculoData);
```

### 3. Get Pending Budgets (Awaiting Approval)

```javascript
// Returns all budgets with status AGUARDANDO_APROVACAO
const pendentes = await dataManager.obterOrcamentosPendentes();
console.log(`${pendentes.length} orçamentos aguardando aprovação`);
```

### 4. Update Budget Approval Status

```javascript
// Update budget status (workflow)
await dataManager.atualizarStatusOrcamento(
  orcamentoId, 
  'APROVADO',  // or 'REJEITADO'
  'Aprovado pela superintendência'
);
```

### 5. Get Analytics Data (Approved Budgets Only)

```javascript
// Returns KPIs calculated ONLY from approved budgets
const analytics = await dataManager.obterDadosAnaliticosFirestore();
console.log('Receita Total (aprovados):', analytics.kpis.receitaTotal);
```

## Firestore Collections Structure

### Collection: `leads`
```javascript
{
  nome: string,
  email: string,
  telefone: string,
  dataCadastro: timestamp
}
```

### Collection: `orcamentos`
```javascript
{
  data: timestamp,
  cliente: string,
  contato: string,
  sala: {
    id: number,
    nome: string,
    unidade: string
  },
  valorFinal: number,
  margemLiquida: number,
  statusAprovacao: string, // 'AGUARDANDO_APROVACAO', 'APROVADO', 'REJEITADO'
  convertido: boolean,
  dataEvento: string,
  leadTimeDays: number,
  turnoPredominante: number
  // ... other fields
}
```

## Workflow Status

The collaborative workflow supports the following statuses:

1. **AGUARDANDO_APROVACAO** - Initial status when budget is created
2. **APROVADO** - Approved by management
3. **REJEITADO** - Rejected with justification

## Backward Compatibility

✅ All existing code continues to work unchanged!
- Original localStorage methods remain functional
- New Firebase methods are opt-in
- Automatic fallback to localStorage if Firebase is not configured
- No breaking changes

## Migration Strategy

### Gradual Migration Approach:

1. **Phase 1** (Current): Firebase methods available, localStorage still default
2. **Phase 2**: Optionally update calling code to use async Firebase methods
3. **Phase 3**: Eventually deprecate localStorage methods if needed

### Example Migration:

**Before (localStorage):**
```javascript
dataManager.adicionarCalculoHistorico(calculo);
```

**After (Firebase):**
```javascript
await dataManager.adicionarCalculoHistoricoFirestore(calculo);
```

## Testing Firebase Integration

To verify Firebase is working:

```javascript
// Check Firebase availability
console.log('Firebase enabled:', dataManager.firebaseEnabled);

// Test saving a lead
await dataManager.salvarLead({
  nome: "Test Client",
  email: "test@example.com"
});

// Test getting pending budgets
const pendentes = await dataManager.obterOrcamentosPendentes();
console.log('Pending budgets:', pendentes);
```

## Error Handling

All Firebase methods include automatic fallback:

```javascript
try {
  await dataManager.salvarLead(leadData);
} catch (error) {
  console.error('Firebase error:', error);
  // Automatically falls back to localStorage
}
```

## Benefits of Firestore Migration

1. **Real-time Collaboration**: Multiple users can work simultaneously
2. **Workflow Management**: Approval process for Client → Commercial → Management
3. **Cloud Backup**: Data automatically backed up in the cloud
4. **Scalability**: No localStorage size limits
5. **Advanced Queries**: Filter and aggregate data efficiently
6. **Access Control**: Firebase security rules for data protection

## Support

For questions or issues:
- Check Firebase Console for errors
- Review browser console for detailed logs
- All Firebase operations include console.log/console.error output
- Original localStorage methods remain as stable fallback

---

**Note**: Firebase configuration keys should be kept secure. Consider using Firebase Security Rules to protect your data.
