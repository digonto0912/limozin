# Firebase Admin SDK Setup Guide

## Current Status
- ✅ Firebase Admin SDK package installed
- ✅ Admin configuration file created
- ✅ Environment variables template added to .env.local
- ❌ Service account credentials needed

## Step-by-Step Setup

### 1. Get Firebase Service Account Credentials

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **limozin-85645**
3. Go to **Project Settings** (⚙️ gear icon)
4. Click on the **Service Accounts** tab
5. Click **Generate new private key**
6. Download the JSON file (keep it secure!)

### 2. Update Your .env.local File

Your `.env.local` file already has the Firebase Admin SDK variables with placeholder values.
Replace the placeholder values with the actual values from the downloaded JSON file:

Update these variables in your `.env.local` file:

```env
FIREBASE_ADMIN_PRIVATE_KEY_ID=your-private-key-id-from-json
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key-from-json\n-----END PRIVATE KEY-----\n"  
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@limozin-85645.iam.gserviceaccount.com
FIREBASE_ADMIN_CLIENT_ID=your-client-id-from-json
FIREBASE_ADMIN_CLIENT_X509_CERT_URL=your-cert-url-from-json
```

The other variables are already correctly set.

### 3. Important Notes

- **Keep the JSON file secure** - don't commit it to version control
- **The private key must keep its newlines** - that's why it's wrapped in quotes
- **`.env.local` is already in `.gitignore`** - safe to use

### 4. Restart Application

After updating the environment variables:
```bash
npm run dev
```

### 5. Test the Configuration

Once configured, try deleting a user from the admin panel. You should see:
- User removed from Firestore ✅
- User removed from Firebase Authentication ✅

## Troubleshooting

### "Firebase Admin SDK not configured" error
- Check that all environment variables are set in `.env.local`
- Restart the development server after adding env vars
- Verify the private key format (should include `-----BEGIN PRIVATE KEY-----`)

### "User not found" error
- User might already be deleted from Firebase Auth
- Check Firebase Console > Authentication to verify

### Permission errors
- Ensure the service account has the right permissions
- The downloaded service account should have admin access by default

## Security Best Practices

1. **Never commit service account keys** to version control
2. **Use environment variables** for all sensitive data
3. **Rotate service account keys** periodically
4. **Limit service account permissions** to only what's needed

## What This Enables

Once configured, the master admin can:
- ✅ View all users and their roles
- ✅ Promote users to admin role
- ✅ Demote admin users back to regular users
- ✅ **Completely delete users** (from both Firestore and Firebase Auth)

The delete operation will:
1. Remove user data from Firestore database
2. Delete the user account from Firebase Authentication
3. Prevent the user from logging in again