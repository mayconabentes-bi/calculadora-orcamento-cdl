# Resolving auth/invalid-credential Error

## Problem Description

When attempting to login to the system with email `maycon.bentes@cdlmanaus.org.br`, the following error occurs:

```
POST https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=... 400 (Bad Request)
Firebase: Error (auth/invalid-credential).
```

## Root Cause

The `auth/invalid-credential` error from Firebase Authentication indicates that:
1. The user doesn't exist in Firebase Authentication, OR
2. The password provided is incorrect, OR
3. The user account has been disabled

In this specific case, the user `maycon.bentes@cdlmanaus.org.br` didn't exist in the Firebase Authentication system.

## Solution

The user has been added to the CDL user setup script (`setup-users-cdl.js`). To create the user in Firebase, follow these steps:

### Prerequisites

1. **Node.js environment** (version 14 or higher)
2. **Firebase Admin SDK credentials** configured in `.env` file
3. **Required npm packages** installed

### Step 1: Configure Environment Variables

If you haven't already, create a `.env` file from the example:

```bash
cp .env.example .env
```

Edit the `.env` file and configure the following required variables:

```env
FIREBASE_PROJECT_ID=axioma-cdl-manaus
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@axioma-cdl-manaus.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY_BASE64="YOUR_BASE64_ENCODED_PRIVATE_KEY_HERE"
```

For detailed instructions on obtaining these credentials, see:
- **ENVIRONMENT_VARIABLES_GUIDE.md** - Complete guide to environment variables
- **SETUP_CREDENCIAL_DESENVOLVEDOR.md** - Developer credential setup

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Run the User Setup Script

Execute the CDL user setup script:

```bash
npm run setup:users
```

Or directly:

```bash
node setup-users-cdl.js
```

### Step 4: Verify User Creation

The script will output detailed logs showing the user creation process. Look for:

```
[SGQ-SECURITY] ✅ maycon.bentes@cdlmanaus.org.br criado no Auth.
[SGQ-SECURITY] UID gerado: [UID]
[SGQ-SECURITY] ✅ Metadados sincronizados no Firestore
```

### Step 5: Login with Temporary Credentials

Now you can login with:
- **Email:** `maycon.bentes@cdlmanaus.org.br`
- **Password:** `Cdl@Manaus2026` (temporary password)
- **Role:** admin

⚠️ **IMPORTANT:** You will be required to change your password on first login.

## Users Created by the Script

The `setup-users-cdl.js` script creates the following users:

| Name | Email | Role | Status |
|------|-------|------|--------|
| Maycon Bentes | maycon.bentes@cdlmanaus.org.br | admin | ativo |
| Manuel Joaquim | manuel.joaquim@cdlmanaus.org.br | admin | ativo |
| Josiane Oliveira | josiane.oliveira@cdlmanaus.org.br | user | ativo |
| Lidiane Cabral | lidiane.cabral@cdlmanaus.org.br | user | ativo |

All users use the same temporary password: `Cdl@Manaus2026`

## Troubleshooting

### Error: Missing Environment Variables

If you see this error:
```
[SGQ-SECURITY] ❌ ERRO CRÍTICO: Variáveis de ambiente obrigatórias não configuradas
```

**Solution:** 
1. Check that `.env` file exists
2. Verify all required variables are set
3. Follow the environment setup guide in ENVIRONMENT_VARIABLES_GUIDE.md

### Error: Firebase Initialization Failed

If you see this error:
```
[SGQ-SECURITY] ❌ Erro na inicialização: [error message]
```

**Solution:**
1. Verify your Firebase credentials are correct
2. Check that the service account has admin permissions
3. Try regenerating the private key from Firebase Console
4. Use Base64 encoding for the private key (recommended)

### Error: User Already Exists

If you see this warning:
```
[SGQ-SECURITY] ⚠️ maycon.bentes@cdlmanaus.org.br já existe no Auth.
```

**Solution:**
This is normal! The script will update the user's metadata in Firestore without recreating them. The user can login with their existing password.

## Alternative: Manual User Creation

If you cannot run the setup script, you can manually create the user through Firebase Console:

### 1. Create in Firebase Authentication

1. Go to https://console.firebase.google.com/
2. Select project: **axioma-cdl-manaus**
3. Navigate to **Authentication** > **Users**
4. Click **Add user**
5. Email: `maycon.bentes@cdlmanaus.org.br`
6. Password: Create a secure password
7. **Copy the UID** that is generated

### 2. Create in Firestore

1. Navigate to **Firestore Database**
2. Select collection `usuarios`
3. Click **Add document**
4. Document ID: **Paste the UID from step 1**
5. Add the following fields:
   ```
   email: "maycon.bentes@cdlmanaus.org.br"
   nome: "Maycon Bentes"
   role: "admin"
   status: "ativo"
   dataCriacao: "2026-01-05T18:00:00.000Z"
   requerTrocaSenha: false
   ```

## Security Considerations

⚠️ **Important Security Notes:**

1. **Temporary Password:** The default password `Cdl@Manaus2026` is temporary and should be changed immediately after first login
2. **Service Account Security:** Never commit your `.env` file or Firebase credentials to Git
3. **Access Control:** Only authorized administrators should run the user setup script
4. **Audit Trail:** All user creation operations are logged with SGQ-SECURITY timestamps
5. **Password Requirements:** New passwords must meet minimum security requirements

## Related Documentation

- **SETUP_USERS_CDL.md** - Complete guide to bulk user registration
- **AUTHENTICATION_GUIDE.md** - Technical guide to the authentication system
- **SECURITY_README.md** - Security best practices
- **ENVIRONMENT_VARIABLES_GUIDE.md** - Environment configuration guide

## Technical Details

### Firebase Authentication Flow

1. User submits login form with email and password
2. Frontend calls Firebase Authentication API
3. If credentials are valid, Firebase returns user token
4. System fetches user metadata from Firestore
5. Validates user status is "ativo" (active)
6. Redirects to dashboard if successful

### Error Code Reference

- `auth/invalid-credential` - Invalid email/password combination or user doesn't exist
- `auth/user-not-found` - User account doesn't exist (legacy error code)
- `auth/wrong-password` - Incorrect password (legacy error code)
- `auth/invalid-email` - Email format is invalid
- `auth/too-many-requests` - Too many failed login attempts

## Status

✅ **RESOLVED:** User `maycon.bentes@cdlmanaus.org.br` has been added to the setup script. Run `npm run setup:users` to create the user in Firebase.

---

**Last Updated:** 2026-01-05  
**Version:** 5.1.0  
**Architecture:** Zero Trust - Axioma CDL/Manaus
