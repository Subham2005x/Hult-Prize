# Firebase Setup Guide for EarnedPay

Complete step-by-step guide to set up Firebase for the EarnedPay platform.

---

## Step 1: Create a Firebase Project

1. **Go to Firebase Console**
   - Visit [https://console.firebase.google.com](https://console.firebase.google.com)
   - Sign in with your Google account

2. **Create New Project**
   - Click **"Add project"** or **"Create a project"**
   - Enter project name: `earnedpay` (or your preferred name)
   - Click **"Continue"**

3. **Google Analytics (Optional)**
   - You can disable Google Analytics for now (toggle off)
   - Click **"Create project"**
   - Wait for project creation (takes ~30 seconds)
   - Click **"Continue"** when ready

---

## Step 2: Enable Phone Authentication

1. **Navigate to Authentication**
   - In the left sidebar, click **"Authentication"**
   - Click **"Get started"** (if first time)

2. **Enable Phone Provider**
   - Click on **"Sign-in method"** tab
   - Find **"Phone"** in the list of providers
   - Click on **"Phone"**
   - Toggle the switch to **"Enabled"**
   - Click **"Save"**

3. **Add Test Phone Numbers** (Important - Free!)
   - Scroll down to **"Phone numbers for testing"**
   - Click **"Add phone number"**
   - Add test numbers:
     ```
     Phone: +919876543210
     Code: 123456
     ```
   - Click **"Add"**
   - Add more test numbers as needed:
     ```
     Phone: +919876543211
     Code: 123456
     
     Phone: +919999999999
     Code: 654321
     ```

---

## Step 3: Enable Firestore Database

1. **Navigate to Firestore**
   - In the left sidebar, click **"Firestore Database"**
   - Click **"Create database"**

2. **Choose Mode**
   - Select **"Start in production mode"** (we'll add security rules later)
   - Click **"Next"**

3. **Choose Location**
   - Select a location close to India: **"asia-south1 (Mumbai)"**
   - Click **"Enable"**
   - Wait for database creation (~1 minute)

4. **Add Security Rules**
   - Go to **"Rules"** tab
   - Copy the rules from `earnedpay-backend/firestore.rules`
   - Paste into the editor
   - Click **"Publish"**

---

## Step 4: Register Web App

1. **Add Web App**
   - Go to **Project Overview** (home icon in sidebar)
   - Click the **Web icon** (`</>`) to add a web app
   - App nickname: `EarnedPay Web`
   - **Don't** check "Also set up Firebase Hosting" (we'll do this separately)
   - Click **"Register app"**

2. **Copy Firebase Config**
   - You'll see a configuration object like this:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "earnedpay-xxxxx.firebaseapp.com",
     projectId: "earnedpay-xxxxx",
     storageBucket: "earnedpay-xxxxx.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef"
   };
   ```
   - **Keep this tab open** - you'll need these values!
   - Click **"Continue to console"**

---

## Step 5: Download Service Account Credentials

1. **Go to Project Settings**
   - Click the **gear icon** (⚙️) next to "Project Overview"
   - Click **"Project settings"**

2. **Navigate to Service Accounts**
   - Click on **"Service accounts"** tab
   - You'll see "Firebase Admin SDK" section

3. **Generate Private Key**
   - Click **"Generate new private key"**
   - A popup will appear warning you to keep it secure
   - Click **"Generate key"**
   - A JSON file will download: `earnedpay-xxxxx-firebase-adminsdk-xxxxx.json`
   - **Save this file securely** - you'll need it for the backend

---

## Step 6: Update Backend .env File

1. **Navigate to backend folder**
   ```bash
   cd earnedpay-backend
   ```

2. **Create .env file**
   ```bash
   copy .env.example .env
   ```
   (On Mac/Linux: `cp .env.example .env`)

3. **Open the downloaded JSON file**
   - Open `earnedpay-xxxxx-firebase-adminsdk-xxxxx.json` in a text editor
   - Copy the **entire contents**

4. **Edit .env file**
   - Open `earnedpay-backend/.env` in a text editor
   - Update the following:

   ```env
   # Firebase Configuration
   FIREBASE_CREDENTIALS={"type":"service_account","project_id":"earnedpay-xxxxx","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-xxxxx@earnedpay-xxxxx.iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}
   FIREBASE_PROJECT_ID=earnedpay-xxxxx
   
   # Environment
   ENVIRONMENT=development
   DEBUG=True
   
   # CORS
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
   
   # UPI Mock Service
   UPI_MOCK_MODE=True
   
   # Server
   HOST=0.0.0.0
   PORT=8000
   ```

   **Important**: 
   - `FIREBASE_CREDENTIALS` should be the **entire JSON content on one line**
   - Replace `earnedpay-xxxxx` with your actual project ID
   - Keep the quotes around the JSON

---

## Step 7: Update Frontend .env.local File

1. **Navigate to frontend folder**
   ```bash
   cd earnedpay-frontend
   ```

2. **Create .env.local file**
   ```bash
   copy .env.local.example .env.local
   ```
   (On Mac/Linux: `cp .env.local.example .env.local`)

3. **Edit .env.local file**
   - Open `earnedpay-frontend/.env.local` in a text editor
   - Use the Firebase config from Step 4:

   ```env
   # Firebase Configuration (from Step 4)
   NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=earnedpay-xxxxx.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=earnedpay-xxxxx
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=earnedpay-xxxxx.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
   
   # API Configuration
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

   **Replace all the values** with your actual Firebase config from Step 4!

---

## Step 8: Verify Setup

### Test Backend

```bash
cd earnedpay-backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Starting EarnedPay API...
INFO:     Firebase Admin SDK initialized successfully
```

Visit: http://localhost:8000/health

### Test Frontend

```bash
cd earnedpay-frontend
npm install
npm run dev
```

You should see:
```
  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
```

Visit: http://localhost:3000

---

## Step 9: Test Login Flow

1. **Open app**: http://localhost:3000
2. **Click login** (you'll be redirected to `/login`)
3. **Enter test phone**: `+919876543210`
4. **Click "Send OTP"**
5. **Enter code**: `123456`
6. **You should be logged in!**

---

## Common Issues & Solutions

### Issue: "Firebase credentials invalid"
**Solution**: Make sure the JSON in `FIREBASE_CREDENTIALS` is on **one line** with no line breaks

### Issue: "Module not found: firebase"
**Solution**: Run `npm install` in the frontend folder

### Issue: "Cannot connect to backend"
**Solution**: 
- Make sure backend is running on port 8000
- Check `NEXT_PUBLIC_API_URL` in frontend `.env.local`

### Issue: "Phone authentication not working"
**Solution**: 
- Make sure you added test phone numbers in Firebase Console
- Use the exact code you configured (e.g., `123456`)

---

## Quick Reference

### Backend .env Location
```
earnedpay-backend/.env
```

### Frontend .env Location
```
earnedpay-frontend/.env.local
```

### Service Account JSON Location
```
Downloads/earnedpay-xxxxx-firebase-adminsdk-xxxxx.json
```

### Test Phone Numbers
```
+919876543210 → 123456
+919876543211 → 123456
+919999999999 → 654321
```

---

## Next Steps

Once everything is working:

1. ✅ Test worker login flow
2. ✅ Test withdrawal functionality
3. ✅ Test employer dashboard
4. 📱 Add more test users
5. 🚀 Deploy to production (when ready)

---

## Need Help?

If you get stuck:
1. Check the error messages in terminal
2. Verify all environment variables are set correctly
3. Make sure both backend and frontend are running
4. Check Firebase Console for any errors

Good luck! 🚀
