# AisleBe

Smart Stadium Companion - Your intelligent guide to stadium navigation and crowd management.

## Features

- Live venue map with crowd levels
- Real-time location tracking
- AI-powered assistant
- Order management
- Wallet integration

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deployment

### Frontend (Firebase Hosting)

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Deploy: `firebase deploy --only hosting`

### Backend (Google Cloud Run)

1. Install Google Cloud SDK
2. Authenticate: `gcloud auth login`
3. Set project: `gcloud config set project aislebe`
4. Enable Cloud Run: `gcloud services enable run.googleapis.com`
5. Deploy: `gcloud run deploy simulation-backend --source . --region asia-southeast1 --allow-unauthenticated --memory 512Mi --cpu 1 --max-instances 1`

## Environment Variables

Copy `.env.example` to `.env` and fill in your Firebase configuration.