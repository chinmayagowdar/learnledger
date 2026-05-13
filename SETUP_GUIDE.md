# LearnLedger - Setup & Deployment Guide

## Quick Start

### 1. Prerequisites
- Node.js 24+
- pnpm package manager
- Supabase account with a project created
- Git

### 2. Environment Setup

Copy the environment variables to your project. The project requires:

```bash
# Supabase Configuration (Get from Supabase Project Settings)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... # Copy from service role key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc... # Copy from anon key

# Database URLs (Automatically provided by Supabase)
POSTGRES_URL=postgresql://...
POSTGRES_PRISMA_URL=postgresql://...

# Server Configuration
PORT=3001  # API server port
NODE_ENV=development

# JWT Secret (For auth, if implementing)
SUPABASE_JWT_SECRET=your-jwt-secret
```

### 3. Database Setup

**IMPORTANT**: Run the database migration to create the required tables:

```bash
# Option 1: Using psql
psql $POSTGRES_URL -f migrations/001_create_ledger_tables.sql

# Option 2: Using Supabase SQL Editor (recommended)
# 1. Go to Supabase Dashboard → SQL Editor
# 2. Click "New Query"
# 3. Copy contents of migrations/001_create_ledger_tables.sql
# 4. Click "Run"
```

This creates:
- `certificates` table - Stores issued certificates
- `resumes` table - Stores uploaded resumes with AI scores
- `blockchain_records` table - Simulated blockchain ledger

### 4. Development Servers

#### Start API Server (Terminal 1)
```bash
cd artifacts/api-server
pnpm install  # if not done
PORT=3001 pnpm run start
# Server running on http://localhost:3001
```

#### Start Frontend Dev Server (Terminal 2)
```bash
cd artifacts/learn-ledger
pnpm install  # if not done
pnpm run dev
# Frontend running on http://localhost:5173
```

#### Verify Servers
```bash
# Check API health
curl http://localhost:3001/api/healthz
# Expected output: {"status":"ok"}

# Check Frontend
curl http://localhost:5173 | head -5
# Should return HTML
```

### 5. Access the Application

- **Main App**: http://localhost:5173
- **Certificate Verify**: http://localhost:5173/verify
- **Resume Upload**: http://localhost:5173/resume/upload
- **Admin Issue Certificate**: http://localhost:5173/admin/issue
- **API Base**: http://localhost:3001/api

## Feature Testing

### Test Certificate Verification

1. **Issue a Certificate** (via Admin page or API)
```bash
curl -X POST http://localhost:3001/api/issue-certificate \
  -H "Content-Type: application/json" \
  -d '{
    "certificate_id": "CERT-TEST-001",
    "recipient_name": "Alice Developer",
    "skill_title": "JavaScript Mastery"
  }'
```

Response includes:
- QR code image (qrCodeDataUrl)
- Certificate details
- Blockchain transaction hash

2. **Verify Certificate**
- Visit `/verify` page
- Use manual entry: ID = `CERT-TEST-001`, Name = `Alice Developer`
- Should see ✅ Valid Certificate

3. **Explore on Blockchain**
- Click "View on Block Explorer"
- See transaction details and verification

### Test Resume Upload

1. **Create Sample Resume Text File**
```
John Doe
Senior Software Engineer

Skills:
Python, JavaScript, React, Node.js, AWS, Docker, Kubernetes
PostgreSQL, MongoDB, Redis

Experience:
- 8 years as Senior Developer
- Led 15+ team projects
- AWS Architect Certification
- Master's in Computer Science

Achievements:
- Increased system performance by 40%
- Mentored 5+ junior developers
```

2. **Upload Resume**
- Navigate to `/resume/upload`
- Drag & drop or click to upload the file
- Click "Analyze with AI"
- Wait for processing

3. **View Results**
- See AI score calculation
- Read AI feedback
- Check blockchain verification
- Download report or share results

### Test Blockchain Explorer

1. **Get Transaction Hash**
From certificate issuance or resume upload response

2. **View in Explorer**
```bash
# Get blockchain stats
curl http://localhost:3001/api/blockchain/stats

# View specific transaction
curl http://localhost:3001/api/blockchain/tx/0x... # Replace with actual hash

# View recent blocks
curl 'http://localhost:3001/api/blockchain/blocks?limit=10'
```

## Production Deployment

### 1. Build Applications
```bash
# Build API Server
cd artifacts/api-server
pnpm run build

# Build Frontend
cd artifacts/learn-ledger
pnpm run build
```

### 2. Deploy to Vercel

**Option A: Monorepo (Recommended)**
```bash
# From project root
vercel deploy --prod
```

**Option B: Separate Deployments**

API Server:
```bash
cd artifacts/api-server
vercel deploy --prod --name learnledger-api
```

Frontend:
```bash
cd artifacts/learn-ledger
# Update API_URL in vite.config.ts to point to deployed API
vercel deploy --prod --name learnledger-web
```

### 3. Environment Variables on Vercel

Set the following in Vercel Project Settings → Environment Variables:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `POSTGRES_URL`
- `PORT=3001`
- `NODE_ENV=production`

### 4. Custom Domain & SSL

1. In Vercel Dashboard → Project Settings → Domains
2. Add your custom domain
3. SSL certificate is auto-generated

## Troubleshooting

### Issue: "PORT environment variable required"
**Solution**: Set PORT before running
```bash
PORT=3001 pnpm run start
```

### Issue: "Supabase credentials missing"
**Solution**: Check environment variables are set
```bash
# Verify variables are loaded
echo $SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY
```

### Issue: "Database connection failed"
**Solution**: Verify database migration was run
```bash
# Check if tables exist
psql $POSTGRES_URL -c "\dt"
# Should list: certificates, resumes, blockchain_records
```

### Issue: "CORS errors when uploading resume"
**Solution**: CORS is enabled in API server, but verify:
1. API server is running on correct port
2. Frontend can reach API at http://localhost:3001
3. Check browser console for exact error

### Issue: "Frontend shows blank page"
**Solution**:
1. Check browser console for JS errors
2. Verify Vite is running: `curl http://localhost:5173`
3. Clear cache: Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)

### Issue: "Can't verify certificates - database error"
**Solution**: 
1. Run database migration (see step 3 above)
2. Verify Supabase connection: `curl http://localhost:3001/api/healthz`
3. Check API logs for detailed error

## Advanced Configuration

### Enable PDF Upload
The code is ready for PDF processing. To enable:

1. Install pdf-parse:
```bash
cd artifacts/api-server
pnpm add pdf-parse
```

2. Update `src/lib/blockchain.ts`:
```typescript
// Replace extractTextFromPdf function:
import pdf from 'pdf-parse';

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const data = await pdf(buffer);
  return data.text;
}
```

### Enable Real AI Scoring
Replace mock scoring with OpenAI/Gemini:

1. Install AI SDK:
```bash
cd artifacts/api-server
pnpm add @ai-sdk/openai
```

2. Update `src/lib/blockchain.ts`:
```typescript
import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';

export async function scoreResumeAI(resumeText: string) {
  const result = await generateObject({
    model: openai('gpt-4'),
    schema: z.object({
      score: z.number().min(0).max(100),
      feedback: z.string(),
    }),
    prompt: `Analyze this resume and provide a score 0-100 and feedback:\n\n${resumeText}`,
  });
  
  return { score: result.score, feedback: result.feedback };
}
```

### Enable File Storage
Add Vercel Blob for persistent file storage:

```bash
cd artifacts/api-server
pnpm add @vercel/blob
```

## Monitoring & Analytics

### API Logs
API server uses Pino for logging. Logs appear in:
- Development: Console output
- Production: Vercel Logs

### Database Queries
Monitor in Supabase Dashboard:
1. SQL Editor → Database
2. View slow queries in Performance tab

### Frontend Analytics
Add PostHog or similar analytics service:
```bash
pnpm add posthog-js
```

## Performance Optimization

### Frontend
- Enable Vite code splitting
- Use dynamic imports for heavy components
- Compress images

### API Server
- Add caching for blockchain stats
- Implement database query optimization
- Use connection pooling

### Database
- Indexes created on all primary lookups
- Consider partitioning blockchain_records if > 1M records

## Security Checklist

- [ ] Supabase RLS policies configured
- [ ] API rate limiting enabled
- [ ] HTTPS enforced
- [ ] Environment variables secured
- [ ] Service role key never exposed to frontend
- [ ] Input validation on all endpoints
- [ ] CORS properly configured

## Support & Resources

- Supabase Docs: https://supabase.com/docs
- Express Docs: https://expressjs.com
- React Docs: https://react.dev
- Vite Docs: https://vitejs.dev
- Vercel Docs: https://vercel.com/docs

## Next Steps

1. Run the database migration
2. Start development servers
3. Test features as outlined above
4. Customize branding and styling
5. Add authentication if needed
6. Deploy to production
