# EarnedPay Backend

Production-ready FastAPI backend for the EarnedPay Earned Wage Access platform.

## Features

- 🔐 Firebase Authentication integration
- 💾 Firestore database
- 💸 Mock UPI payout service
- 👷 Worker management
- 🏢 Employer dashboard
- 📊 Wage calculation & withdrawal limits
- 🔔 Notification service (WhatsApp/SMS ready)

## Setup

### Prerequisites

- Python 3.11+
- Firebase project with Firestore enabled
- Firebase service account credentials

### Installation

1. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   ```

3. **Edit `.env` file**
   - Add your Firebase service account JSON as `FIREBASE_CREDENTIALS`
   - Set `FIREBASE_PROJECT_ID`
   - Configure `ALLOWED_ORIGINS` for your frontend URL

4. **Run the server**
   ```bash
   uvicorn app.main:app --reload
   ```

   The API will be available at `http://localhost:8000`

## API Documentation

When running in development mode, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## API Endpoints

### Authentication
- `POST /api/auth/verify-token` - Verify Firebase ID token
- `GET /api/auth/me` - Get current user info

### Workers
- `GET /api/workers/me` - Get worker profile
- `GET /api/workers/me/balance` - Get available balance
- `GET /api/workers/me/withdrawals` - Get withdrawal history
- `POST /api/workers/me/withdraw` - Request withdrawal
- `PUT /api/workers/me/upi` - Update UPI ID

### Employers
- `GET /api/employers/me` - Get employer profile
- `GET /api/employers/me/workers` - List workers
- `POST /api/employers/me/workers` - Add worker
- `GET /api/employers/me/dashboard` - Dashboard stats
- `POST /api/employers/attendance` - Submit attendance

### Settlements
- `GET /api/settlements/` - Get settlement history
- `POST /api/settlements/process` - Process monthly settlement

## Deployment (Render)

1. **Create a new Web Service on Render**

2. **Connect your GitHub repository**

3. **Configure environment variables:**
   ```
   FIREBASE_CREDENTIALS=<your-service-account-json>
   FIREBASE_PROJECT_ID=<your-project-id>
   ENVIRONMENT=production
   DEBUG=False
   ALLOWED_ORIGINS=https://your-frontend-url.web.app
   ```

4. **Set build and start commands:**
   - Build: `pip install -r requirements.txt`
   - Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

5. **Deploy!**

## Project Structure

```
earnedpay-backend/
├── app/
│   ├── main.py              # FastAPI app
│   ├── config.py            # Configuration
│   ├── dependencies.py      # Auth dependencies
│   ├── models/              # Pydantic models
│   ├── routers/             # API endpoints
│   ├── services/            # Business logic
│   └── utils/               # Utilities
├── requirements.txt
└── .env
```

## Security

- All endpoints require Firebase ID token authentication
- Role-based access control (worker/employer)
- Firestore security rules enforce data access
- CORS configured for specific origins
- Request logging and monitoring

## License

Proprietary - EarnedPay
