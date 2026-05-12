# LearnLedger Deployment Guide

## Overview

LearnLedger is a modern, enterprise-grade credential verification platform built with Next.js 16, React 19, Zustand, and Firebase. This guide covers deployment to Vercel and configuring Firebase for production.

## Prerequisites

- GitHub account with repository access
- Vercel account
- Firebase project with Firestore and Authentication enabled
- Node.js 18+ locally

## Environment Variables

Create a `.env.local` file locally and add these variables to Vercel:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Optional: Base URL for sharable credentials
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

## Deployment Steps

### 1. Push to GitHub

```bash
git add .
git commit -m "feat: comprehensive LearnLedger multi-round assessment system"
git push origin main
```

### 2. Deploy to Vercel

1. Visit [vercel.com/new](https://vercel.com/new)
2. Select your GitHub repository
3. Configure project:
   - **Framework**: Next.js
   - **Build Command**: `pnpm build`
   - **Install Command**: `pnpm install`
4. Add Environment Variables:
   - Copy all `NEXT_PUBLIC_FIREBASE_*` variables
   - Set `NEXT_PUBLIC_BASE_URL` to your Vercel domain
5. Click "Deploy"

### 3. Configure Firebase

#### Create Firestore Collections

In Firebase Console, create these collections:

**`attempts`** - Quiz attempt records
```json
{
  "userId": "string",
  "skillId": "string",
  "round": 1,
  "score": 92,
  "maxScore": 5,
  "percentage": 92,
  "passed": true,
  "answers": [0, 1, 2, 3, 4],
  "createdAt": "timestamp",
  "completedAt": "timestamp"
}
```

**`credentials`** - Earned credentials
```json
{
  "userId": "string",
  "skillId": "string",
  "skillTitle": "React Advanced",
  "blockchainHash": "abc123...",
  "rounds": [
    { "round": 1, "score": 85, "percentage": 85 },
    { "round": 2, "score": 92, "percentage": 92 },
    { "round": 3, "score": 98, "percentage": 98 }
  ],
  "issuedAt": "timestamp",
  "expiresAt": "timestamp",
  "isVerified": true,
  "views": 0,
  "shareCount": 0,
  "publicShareUrl": "optional"
}
```

#### Enable Security Rules

Add these Firestore Security Rules:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public access to verification
    match /credentials/{document=**} {
      allow read: if true;
      allow write: if request.auth.uid != null;
    }
    
    // User-specific attempts
    match /attempts/{document=**} {
      allow read, write: if request.auth.uid == resource.data.userId;
      allow create: if request.auth.uid == request.resource.data.userId;
    }
  }
}
```

### 4. Enable Authentication

In Firebase Console:
1. Go to Authentication
2. Enable Email/Password provider
3. (Optional) Enable Google Sign-In

## Project Structure

```
app/
├── api/
│   ├── assessments/          # Assessment endpoints
│   ├── credentials/          # Credential generation
│   ├── quiz/                 # Quiz submission
│   └── verify/[hash]         # Public verification
├── assessments/              # Assessment listing
├── credentials/              # Credentials showcase
├── skills/                   # Skill selection
├── verify/[hash]             # Public verification page
└── page.tsx                  # Dashboard

components/
├── hero-section.tsx          # Landing hero with CTA
├── modern-chart.tsx          # Learning progress chart
├── modern-badge.tsx          # Credential display card
├── round-progress.tsx        # Multi-round progress indicator
├── stats-card.tsx            # Dashboard statistics
└── [other components]

lib/
├── store.ts                  # Zustand state management
├── firebase.ts               # Firebase configuration
├── firebase-helpers.ts       # Firestore operations
├── blockchain-utils.ts       # Hash and verification utilities
├── questions.json            # Assessment questions database
└── mock-data.ts              # Mock data for development
```

## Features

### Multi-Round Assessment System
- 3 difficulty levels per skill (Intermediate, Advanced, Expert)
- 5 questions per round
- 70% pass threshold
- Automatic credential generation on full completion

### Blockchain Verification
- SHA-256 style hashing for credentials
- Public verification via shareable links
- Immutable credential records
- Web3-ready architecture

### User Experience
- Real-time progress tracking
- Animated transitions and feedback
- Dark/light mode support
- Fully responsive design
- 44px+ touch targets for accessibility

### API Endpoints

**`POST /api/quiz/submit`**
- Submit quiz answers and get score
- Body: `{ skill, round, answers }`

**`POST /api/credentials/generate`**
- Generate credential after completing all rounds
- Body: `{ skill, rounds, userId }`

**`GET /api/verify/[hash]`**
- Verify credential by blockchain hash

## Testing

### Local Testing

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Run tests (if configured)
pnpm test

# Build for production
pnpm build

# Start production server
pnpm start
```

### Test Flows

1. **Dashboard** → Visit `/` to see hero, stats, and chart
2. **Skill Selection** → Navigate to `/skills` to choose skill
3. **Assessment** → Click "Start Assessment" to begin quiz
4. **Verification** → Use blockchain hash from credential to verify

## Monitoring & Analytics

### Vercel Analytics
- Automatic deployment tracking
- Real User Monitoring (RUM)
- Web Vitals monitoring

### Firebase Analytics (Optional)
- Enable in Firebase Console
- Track user engagement
- Monitor assessment completion rates

## Troubleshooting

### Build Failures
- Check Node version: `node --version` (should be 18+)
- Clear cache: `rm -rf .next node_modules pnpm-lock.yaml`
- Reinstall: `pnpm install`

### Firebase Connection Issues
- Verify environment variables in Vercel
- Check Firebase Console rules are correct
- Ensure Firebase project is active

### Performance Issues
- Check Vercel Analytics for slow endpoints
- Verify image optimization in next.config.js
- Review bundle size with `pnpm build --analyze`

## Security Checklist

- [ ] Firebase Security Rules configured
- [ ] Environment variables protected in Vercel
- [ ] CORS configured if needed
- [ ] Rate limiting on API endpoints
- [ ] Input validation on all forms
- [ ] XSS protection enabled
- [ ] HTTPS enforced (default on Vercel)

## Scaling Considerations

For production at scale:

1. **Database**: Migrate to Cloud Firestore sharded collections if > 100K credentials
2. **Storage**: Use Cloud Storage for credential certificates
3. **Caching**: Enable Edge caching on Vercel
4. **CDN**: Content delivery through Vercel Edge Network
5. **Load Testing**: Use k6 or Apache JMeter

## Support & Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [React Documentation](https://react.dev)

## License

MIT License - See LICENSE file for details
