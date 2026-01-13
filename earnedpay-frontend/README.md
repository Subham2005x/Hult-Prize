# EarnedPay Frontend

Modern, mobile-first web application for the EarnedPay Earned Wage Access platform.

## Features

- 🔐 Firebase OTP Authentication
- 💰 Worker Dashboard with instant withdrawals
- 🏢 Employer Dashboard with worker management
- 📱 Mobile-first, responsive design
- ✨ Premium UI with smooth animations
- 🎨 Built with Next.js, TypeScript, and Tailwind CSS

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui + Radix UI
- **Authentication**: Firebase Auth
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase project with Authentication enabled

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.local.example .env.local
   ```

3. **Edit `.env.local`**
   Add your Firebase configuration:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
earnedpay-frontend/
├── app/
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home/redirect page
│   ├── login/               # Authentication
│   ├── worker/              # Worker pages
│   │   ├── dashboard/
│   │   ├── withdraw/
│   │   └── history/
│   └── employer/            # Employer pages
│       ├── dashboard/
│       ├── employees/
│       └── settlements/
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── auth/                # Auth components
│   ├── worker/              # Worker components
│   └── employer/            # Employer components
├── lib/
│   ├── firebase.ts          # Firebase config
│   ├── api.ts               # API client
│   └── utils.ts             # Utilities
├── hooks/
│   └── useAuth.ts           # Auth hook
└── store/
    └── authStore.ts         # Auth state
```

## Key Pages

### Worker Flow
1. **Login** (`/login`) - Phone number + OTP authentication
2. **Dashboard** (`/worker/dashboard`) - View balance, payday countdown
3. **Withdraw** (`/worker/withdraw`) - Request instant withdrawal
4. **History** (`/worker/history`) - Transaction history

### Employer Flow
1. **Dashboard** (`/employer/dashboard`) - Overview stats
2. **Employees** (`/employer/employees`) - Manage workers
3. **Settlements** (`/employer/settlements`) - Monthly settlements

## Design System

### Colors
- **Primary**: Blue (#3b82f6) - Trust, finance
- **Success**: Green (#22c55e) - Money in
- **Warning**: Amber (#f59e0b) - Limits

### Typography
- **Font**: Inter
- **Headings**: Bold, tight line-height
- **Currency**: Tabular numbers

### Components
- **Cards**: rounded-2xl, soft shadows
- **Buttons**: rounded-xl, active scale
- **Inputs**: rounded-lg, focus ring

## Deployment (Firebase Hosting)

1. **Build the app**
   ```bash
   npm run build
   ```

2. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

3. **Login to Firebase**
   ```bash
   firebase login
   ```

4. **Initialize hosting**
   ```bash
   firebase init hosting
   ```
   - Select your project
   - Set public directory to `out`
   - Configure as single-page app: No
   - Don't overwrite files

5. **Deploy**
   ```bash
   firebase deploy --only hosting
   ```

## Environment Variables

### Development
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Production
```env
NEXT_PUBLIC_API_URL=https://your-api.onrender.com
```

## License

Proprietary - EarnedPay
