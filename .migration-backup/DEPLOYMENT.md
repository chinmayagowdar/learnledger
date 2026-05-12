# LearnLedger Deployment Guide

## Overview
LearnLedger is a modern, enterprise-grade credential management platform built with Next.js 16, Zustand, Firebase, and blockchain integration. This guide covers deployment to Vercel and configuration.

## Prerequisites
- Node.js 18+ with pnpm package manager
- Vercel account
- Firebase project (optional for production)
- GitHub repository

## Quick Start

### Local Development
```bash
# Install dependencies
pnpm install

# Create environment file
cp .env.example .env.local

# Run development server
pnpm dev
```

Visit http://localhost:3000 to see the app.

## Deployment to Vercel

### Step 1: Push to GitHub
```bash
git add .
git commit -m "feat: complete learnledger implementation"
git push origin main
```

### Step 2: Import on Vercel
1. Go to https://vercel.com/new
2. Select your GitHub repository
3. Vercel will auto-detect Next.js configuration
4. Click "Deploy"

### Step 3: Configure Environment Variables
In Vercel Dashboard > Settings > Environment Variables, add:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

### Step 4: Redeploy
After adding env vars, go to Deployments > Redeploy with the latest commit.

## Features Deployed

### Pages
- **Dashboard** (`/`) - Overview with stats and learning activity chart
- **Assessments** (`/assessments`) - Assessment browser with tabs and quiz flow
- **Credentials** (`/credentials`) - 3D flip badge display with QR codes
- **Verify** (`/verify`) - Employer verification page for credentials
- **Quiz** (`/assessments/[id]/quiz`) - Interactive quiz with progress tracking

### API Routes
- `GET /api/assessments` - List all assessments
- `GET /api/assessments/[id]/questions` - Get quiz questions
- `GET /api/credentials` - List user credentials
- `POST /api/credentials` - Create new credential
- `GET /api/verify/[id]` - Verify credential

### Backend Services
- **Zustand Store** - Client-side state management
- **Firebase Config** - Ready for auth and database
- **Mock Data** - Demo data for testing
- **Blockchain Helpers** - Hash generation and verification

## Architecture

### Frontend
- Next.js 16 (App Router)
- React 19 with Framer Motion
- shadcn/ui components
- Tailwind CSS 4

### State Management
- Zustand with localStorage persistence
- Real-time credential and assessment sync

### Animations
- 11+ smooth animations
- Confetti celebrations on achievements
- 3D credential flips
- Typewriter text effects

## Performance

### Build Output
```
○  Static:    3 pages
ƒ  Dynamic:   4 API routes + 1 dynamic route
```

### Optimization
- Image optimization with Next.js
- CSS-in-JS with Tailwind
- Code splitting per route
- Lazy loading on scroll

## Security

### Authentication Ready
- Firebase Auth integration points
- Session management hooks
- Protected routes structure

### Data Protection
- Environment variables for sensitive data
- No credentials in client bundles
- Mock data uses realistic patterns

## Troubleshooting

### Build Failures
```bash
# Clear cache and rebuild
rm -rf .next
pnpm build
```

### Environment Variables Not Working
- Ensure vars are prefixed with `NEXT_PUBLIC_` for client-side
- Redeploy after adding new env vars
- Check Vercel dashboard for variable names

### Quiz Not Loading
- Check browser console for errors
- Verify mock data is accessible
- Test at `/assessments/react-advanced/quiz`

## Future Enhancements

1. **Firebase Integration**
   - Real authentication
   - Firestore for credentials
   - Cloud Storage for PDFs

2. **Blockchain Integration**
   - Real blockchain hash generation
   - Verification via ethers.js
   - Web3 wallet integration

3. **Advanced Features**
   - User profiles and settings
   - Social sharing integration
   - Email notifications
   - Admin dashboard

## Support

For issues or questions:
1. Check the implementation files
2. Review the IMPLEMENTATION_SUMMARY.md
3. Verify environment variables are set correctly
4. Check browser console for errors

## License

MIT License - Feel free to use and modify!
