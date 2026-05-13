# LearnLedger - Deployment Guide

This guide covers deploying the LearnLedger application to production.

## Architecture Overview

- **Frontend**: Vite + React (Static)
- **API**: Express.js (Serverless Functions)
- **Database**: Supabase PostgreSQL
- **Hosting**: Vercel

## Prerequisites

1. Vercel account and project linked to GitHub
2. Supabase project with tables created (run migration)
3. Environment variables configured in Vercel dashboard

## Environment Variables

### Required for Frontend
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Required for API
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NODE_ENV=production
PORT=3001
```

All variables are automatically provided by Vercel integrations if you've connected Supabase.

## Step 1: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Get your project URL and API keys
3. Run the database migration to create tables:

```bash
# Connect to your Supabase PostgreSQL database
psql $DATABASE_URL -f migrations/001_create_ledger_tables.sql
```

3. Add API keys to Vercel project settings under "Environment Variables"

## Step 2: Deploy to Vercel

### Option A: Automatic Deployment (Recommended)
1. Push changes to GitHub:
```bash
git push origin main
```

2. Vercel automatically deploys on push
3. Check deployment at https://your-project.vercel.app

### Option B: Manual Deployment
```bash
npm install -g vercel
vercel --prod
```

## Step 3: Run Database Migration

After initial deployment, create the database tables:

```bash
# Using Supabase SQL editor:
# 1. Go to Supabase dashboard → SQL Editor
# 2. Copy paste contents of migrations/001_create_ledger_tables.sql
# 3. Run the query

# Or via CLI:
psql "$SUPABASE_URL" -f migrations/001_create_ledger_tables.sql
```

## Verification

1. Frontend loads at your Vercel URL
2. API health check: `curl https://your-domain/api/healthz`
3. Navigate to `/verify` to test certificate verification
4. Go to `/resume/upload` to test resume upload
5. Visit `/blockchain/:txHash` to test block explorer

## Building Locally

```bash
# Install dependencies
pnpm install

# Build both frontend and API
pnpm run build

# Run dev servers
cd artifacts/api-server && NODE_ENV=development PORT=3001 pnpm run dev &
cd artifacts/learn-ledger && pnpm run dev
```

## Production Considerations

### Performance
- Frontend is statically cached by Vercel CDN
- API responses are cached where possible
- Database queries are optimized with indexes

### Security
- All environment variables are server-only (never exposed to client)
- API uses CORS headers to prevent cross-origin access
- File uploads are validated on both client and server

### Monitoring
- Check Vercel logs at vercel.com/dashboard
- Monitor Supabase usage at supabase.com/dashboard
- Set up error tracking (Sentry integration available)

## Troubleshooting

### "Cannot find module" errors
```bash
# Clean install
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Database connection errors
- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in Vercel env vars
- Check that Supabase project is running
- Verify VPC/network access if applicable

### Port conflicts during local dev
The API server now automatically tries alternative ports (3001-3010) if the initial port is in use.

### API not responding
- Check Vercel function logs
- Verify Supabase tables exist (run migration)
- Check API health endpoint

## Scaling

### As traffic increases:
1. Monitor Supabase database usage in dashboard
2. Add database indexes if queries are slow
3. Enable Supabase read replicas for geographic distribution
4. Consider Redis caching layer (Upstash integration)

### For large file uploads:
1. Implement streaming uploads to Vercel Blob storage
2. Process files asynchronously with background jobs
3. Implement retry logic for failed uploads

## Next Steps

1. Add authentication/login system
2. Implement real OpenAI/Gemini integration for AI scoring
3. Add PDF parsing for resume extraction
4. Set up email notifications for certificate issuance
5. Create admin dashboard for managing data

## Support

For issues or questions:
- Check Vercel docs: https://vercel.com/docs
- Check Supabase docs: https://supabase.com/docs
- Review ARCHITECTURE.md for detailed system design
