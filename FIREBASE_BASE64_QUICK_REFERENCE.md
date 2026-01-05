# Firebase Base64 Setup - Quick Reference

## 🚀 Quick Start (3 Steps)

### Step 1: Convert JSON to Base64

```bash
node convert-private-key-to-base64.js axioma-cdl-manaus-firebase-adminsdk-fbsvc-8e7483fceb.json
```

### Step 2: Update .env

Add to your `.env` file:

```env
FIREBASE_PROJECT_ID=axioma-cdl-manaus
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@axioma-cdl-manaus.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY_BASE64="YOUR_BASE64_STRING_HERE"
```

### Step 3: Test & Verify

```bash
# Test connection
npm run verify:auth

# Setup admin user
npm run setup:user
```

## ✅ Expected Results

### npm run verify:auth

```
7️⃣  Verifying developer user...
[SGQ-SECURITY] 2026-01-05T14:30:00.000Z - ✅ Successfully connected to Firebase!
```

### npm run setup:user

```
[SGQ-SECURITY] 2026-01-05T14:30:00.000Z - Status: USUÁRIO CRIADO COM SUCESSO

Credenciais de acesso:
  E-mail: mayconabentes@gmail.com
  Senha: Aprendiz@33
  Status: ativo
```

## 🔒 Security Checklist

After successful setup:

- [ ] ✅ Firebase connection working
- [ ] ✅ Admin user synced to Firestore
- [ ] ✅ User status is 'ativo' (lowercase) in Firestore
- [ ] ✅ Delete JSON credentials file: `rm axioma-cdl-manaus-*.json`
- [ ] ✅ Save Base64 string in password manager
- [ ] ✅ Never commit .env to Git

## 🆘 Troubleshooting

### Error: "error:1E08010C:DECODER routines::unsupported"

**Solution:** This is exactly why we're using Base64! Follow steps above.

### Error: "Neither FIREBASE_PRIVATE_KEY_BASE64 nor FIREBASE_PRIVATE_KEY is configured"

**Solution:** Check your `.env` file. Make sure you added `FIREBASE_PRIVATE_KEY_BASE64`.

### Error: "Failed to connect to Firebase"

**Solution:** 
1. Verify credentials are correct
2. Check if service account has permissions
3. Re-run conversion script

## 📚 Full Documentation

See `FIREBASE_BASE64_MIGRATION_GUIDE.md` for complete documentation.

## 🎯 Key Points

1. **Use FIREBASE_PRIVATE_KEY_BASE64** (recommended)
2. **Legacy FIREBASE_PRIVATE_KEY** still supported (automatic fallback)
3. **All logs** include `[SGQ-SECURITY]` prefix and ISO 8601 timestamps
4. **Zero Trust**: No JSON files in workspace after setup
5. **Firestore status**: Must be lowercase `'ativo'`

---

**[SGQ-SECURITY] Axioma v5.1.0 - Arquitetura Zero Trust - CDL/Manaus**
