# LearnLedger - Project Structure & Architecture

## Directory Overview

```
v0-project/
├── artifacts/
│   ├── api-server/                    # Express.js API server
│   │   ├── src/
│   │   │   ├── lib/
│   │   │   │   ├── blockchain.ts      # Blockchain utilities & AI scoring
│   │   │   │   ├── certificate-store.ts # Legacy (kept for reference)
│   │   │   │   ├── logger.ts          # Pino logger configuration
│   │   │   │   └── supabase.ts        # Supabase client & types
│   │   │   ├── routes/
│   │   │   │   ├── blockchain.ts      # Blockchain explorer endpoints
│   │   │   │   ├── certificates.ts    # Certificate management endpoints
│   │   │   │   ├── health.ts          # Health check endpoint
│   │   │   │   ├── index.ts           # Route registry
│   │   │   │   └── resumes.ts         # Resume upload & analysis endpoints
│   │   │   ├── app.ts                 # Express app setup
│   │   │   └── index.ts               # Server entry point
│   │   ├── build.mjs                  # esbuild configuration
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── learn-ledger/                  # Vite + React frontend
│       ├── src/
│       │   ├── components/            # Reusable React components
│       │   │   ├── ui/                # shadcn/ui components
│       │   │   ├── nav-bar.tsx        # Main navigation
│       │   │   ├── sidebar.tsx
│       │   │   └── ... (other components)
│       │   ├── lib/
│       │   │   ├── auth-context.tsx
│       │   │   ├── supabase.ts
│       │   │   └── ... (utilities)
│       │   ├── pages/
│       │   │   ├── blockchain-explorer.tsx    # NEW: Block explorer page
│       │   │   ├── admin-issue.tsx
│       │   │   ├── assessments.tsx
│       │   │   ├── resume-result.tsx          # NEW: Resume results page
│       │   │   ├── resume-upload.tsx          # NEW: Resume upload page
│       │   │   ├── verify.tsx
│       │   │   ├── verify-hash.tsx
│       │   │   ├── dashboard.tsx
│       │   │   └── ... (other pages)
│       │   ├── App.tsx                # Main router setup (updated)
│       │   ├── main.tsx
│       │   └── globals.css
│       ├── vite.config.ts
│       ├── package.json
│       └── tsconfig.json
│
├── lib/                               # Shared libraries
│   ├── api-spec/
│   │   └── openapi.yaml              # API specification
│   ├── api-zod/                      # Zod schemas
│   ├── db/                           # Database utilities
│   └── ... (other shared libs)
│
├── migrations/
│   └── 001_create_ledger_tables.sql  # NEW: Database schema migration
│
├── IMPLEMENTATION_SUMMARY.md          # NEW: Feature implementation summary
├── SETUP_GUIDE.md                     # NEW: Setup and deployment guide
├── package.json                       # Root workspace config
└── ...
```

## Data Flow Architecture

### Certificate Verification Flow
```
User Visit /verify
    ↓
[QR Code Scanner / Manual Entry]
    ↓
POST /api/verify-certificate
    ↓
Check database
    ↓
Return Certificate Details + Blockchain Hash
    ↓
Display Result
    ↓
Option: View on Block Explorer
```

### Resume Upload Flow
```
User Upload Resume
    ↓
POST /api/resumes/upload
    ↓
[API Server]
├─ Read file
├─ Calculate SHA-256 hash
├─ Extract text (mock PDF)
├─ Score with AI (mock + integration points)
├─ Store in Supabase
├─ Simulate blockchain registration
└─ Return resume ID + blockchain TX hash
    ↓
Redirect to /resume/result/:id
    ↓
GET /api/resumes/:resumeId
    ↓
Display AI score + blockchain verification
    ↓
Option: View on Block Explorer
```

### Blockchain Registration Flow
```
Certificate/Resume Created
    ↓
Calculate Document Hash (SHA-256)
    ↓
Generate Simulated TX Hash (0x-prefixed)
    ↓
Generate Block Number (18M+)
    ↓
Store in blockchain_records table
    ↓
Link to entity (certificate or resume)
    ↓
Available via:
├─ GET /api/blockchain/tx/:txHash
├─ GET /api/blockchain/verify/:documentHash
├─ GET /api/blockchain/blocks
└─ GET /api/blockchain/stats
```

## Database Schema

### certificates table
```
id              UUID PRIMARY KEY
certificate_id  TEXT UNIQUE
recipient_name  TEXT
skill_title     TEXT
issued_by       TEXT
issued_at       DATE
expires_at      DATE (nullable)
blockchain_hash TEXT UNIQUE (nullable)
is_verified     BOOLEAN
views           INTEGER
share_count     INTEGER
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### resumes table
```
id              UUID PRIMARY KEY
user_id         TEXT
file_name       TEXT
file_size       INTEGER
file_hash       TEXT UNIQUE (SHA-256)
original_text   TEXT (nullable)
parsed_data     JSONB (metadata)
ai_score        NUMERIC(5,2) (0-100)
ai_feedback     TEXT
blockchain_hash TEXT UNIQUE (nullable)
is_verified     BOOLEAN
views           INTEGER
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### blockchain_records table
```
id              UUID PRIMARY KEY
tx_hash         TEXT UNIQUE (0x-prefixed)
entity_type     TEXT ('certificate' or 'resume')
entity_id       UUID
document_hash   TEXT (SHA-256)
block_number    INTEGER
timestamp       TIMESTAMP
sender_address  TEXT (0x-prefixed, nullable)
status          TEXT ('pending' or 'confirmed')
chain_id        TEXT ('learnledger-mainnet')
created_at      TIMESTAMP
```

## API Endpoints Summary

### Authentication
- None yet (Ready for Supabase Auth integration)

### Certificates
```
POST   /api/issue-certificate          Issue new certificate
POST   /api/verify-certificate         Verify certificate by ID & name
GET    /api/certificates               List all certificates (admin)
```

### Resumes
```
POST   /api/resumes/upload             Upload & analyze resume
GET    /api/resumes/:resumeId          Get resume details
GET    /api/resumes/user/:userId       List user's resumes
POST   /api/resumes/:resumeId/verify   Mark resume as verified
```

### Blockchain
```
GET    /api/blockchain/tx/:txHash           Get transaction details
GET    /api/blockchain/blocks               List recent blocks
GET    /api/blockchain/stats                Get network statistics
GET    /api/blockchain/verify/:documentHash Verify document hash
```

### Health
```
GET    /api/healthz                    Health check endpoint
```

## Frontend Routes

### Public Routes (No Auth Required)
```
/                          Landing/Dashboard (redirects to sign-in if not authed)
/sign-in                   Sign in page
/sign-up                   Sign up page
/verify                    Certificate verification page
/verify/:hash              Certificate verification by hash
/blockchain/:txHash        Block explorer page
/resume/upload             Resume upload page
/resume/result/:id         Resume analysis results page
```

### Protected Routes (Auth Required)
```
/assessments               List assessments
/assessments/:id/quiz      Take assessment quiz
/credentials               View credentials
/skills                    View skills
/admin/issue               Admin certificate issuance
```

## Component Hierarchy

### App (Main Router)
```
App (Router)
├─ AuthProvider
├─ ThemeProvider
├─ TooltipProvider
├─ QueryClientProvider
└─ Router (wouter)
   ├─ ProtectedRoute wrapper for private pages
   ├─ AppLayout (NavBar + Sidebar + main content)
   └─ AuthLayout (for auth pages)
```

### Layout Components
```
AppLayout
├─ ParticleBackground
├─ NavBar
├─ Sidebar
├─ PageWrapper
│  └─ Page Content
└─ MobileNav

NavBar
├─ Brand Logo
├─ Navigation Links (including "/resume/upload")
├─ Theme Toggle
└─ User Menu
```

### Page Components
```
ResizeUploadPage
├─ Header
├─ Upload Card
│  ├─ Drop Zone / File Input
│  ├─ File Preview
│  └─ Upload Button
├─ Info Section
└─ Processing States

ResumeResultPage
├─ Header
├─ AI Score Card
│  ├─ Score Display
│  ├─ File Info
│  ├─ AI Feedback
│  └─ Blockchain Details
├─ Block Explorer Card
├─ Action Buttons
└─ Tips Section

BlockExplorerPage
├─ Header
├─ Transaction Status Card
├─ Document Verification Card
├─ Entity Details Card (Certificate/Resume)
├─ Network Info Card
└─ Action Buttons
```

## Utility Modules

### `/artifacts/api-server/src/lib/blockchain.ts`
```
calculateHash(data: string | Buffer) → SHA-256 hash
generateTxHash() → 0x-prefixed transaction hash
generateEthereumAddress() → 0x-prefixed address
simulateBlockchainRegistration() → BlockchainRecord
extractTextFromPdf() → text (placeholder for production)
scoreResumeMock() → { score, feedback }
generateMockFeedback() → feedback text
```

### `/artifacts/api-server/src/lib/supabase.ts`
```
supabase client instance (configured with service role)
Database type definitions for all tables
Ready for RLS policies
```

## State Management

### Frontend State Patterns
```
Component Local State (useState)
├─ Form inputs
├─ UI state (loading, errors)
└─ Modal/drawer visibility

React Query (TanStack)
├─ API data fetching
├─ Caching
└─ Mutations

Zustand Stores (if needed)
├─ Global app state
├─ User preferences
└─ Notifications

Context API (useAuth, useTheme)
├─ Authentication
└─ Theme

Wouter Router State
└─ Navigation & routing
```

## Performance Considerations

### Frontend Optimizations
- Code splitting with dynamic imports
- Image lazy loading
- Tailwind CSS purging
- Vite bundling optimization

### Backend Optimizations
- Database indexes on all lookup keys
- Connection pooling for Supabase
- Proper error handling
- Logging with Pino

### Database Optimizations
```
Indexes:
- certificates(blockchain_hash)
- certificates(certificate_id)
- resumes(user_id)
- resumes(file_hash)
- resumes(blockchain_hash)
- blockchain_records(tx_hash)
- blockchain_records(entity_type, entity_id)
```

## Security Architecture

### Frontend Security
- XSS protection via React's built-in escaping
- CSRF tokens for form submissions
- Secure session storage

### Backend Security
- Input validation & sanitization
- Supabase RLS for row-level access control
- Service role key restricted to backend only
- CORS properly configured

### Database Security
- Supabase encryption at rest
- SSL/TLS for connections
- Separate anon vs service role keys
- RLS policies (ready to implement)

## Testing Architecture (Ready for Implementation)

```
/tests
├─ unit/
│  ├─ blockchain.test.ts
│  ├─ auth-context.test.ts
│  └─ utils.test.ts
├─ integration/
│  ├─ api.test.ts
│  └─ database.test.ts
└─ e2e/
   ├─ certificate-flow.test.ts
   ├─ resume-upload-flow.test.ts
   └─ blockchain-explorer.test.ts
```

## Deployment Architecture

### Development
```
Frontend: Vite dev server (localhost:5173)
Backend: Express dev server (localhost:3001)
Database: Supabase (remote)
```

### Production
```
Frontend: Vercel (CDN + SSR/SSG)
Backend: Vercel Serverless Functions or Vercel Hobby
Database: Supabase (managed PostgreSQL)
Storage: Vercel Blob (for PDFs/files)
```

## Integration Points

### Ready for OpenAI/Gemini Integration
```typescript
// In scoreResumeMock() function
// Replace mock with actual LLM call
import { openai } from '@ai-sdk/openai';
const result = await generateObject({
  model: openai('gpt-4'),
  // ... schema and prompt
});
```

### Ready for PDF Processing
```typescript
// In extractTextFromPdf() function
// Use pdf-parse or pdfjs-dist
import pdf from 'pdf-parse';
const data = await pdf(buffer);
return data.text;
```

### Ready for File Storage
```typescript
// In resume upload route
// Use Vercel Blob or S3
import { put, list } from '@vercel/blob';
const blob = await put(file.name, file, { access: 'private' });
```

## CI/CD Pipeline Ready

Deploy to Vercel:
```yaml
Trigger: Push to main branch
├─ Install dependencies
├─ Run type checking
├─ Build frontend
├─ Build API server
├─ Run tests (when added)
└─ Deploy to production
```

## Monitoring & Observability

### Available Now
- Pino structured logging (API)
- Browser console logging (Frontend)
- Supabase dashboard metrics

### Ready to Add
- Error tracking (Sentry)
- Performance monitoring (Vercel Analytics)
- User analytics (PostHog)
- APM (Datadog, New Relic)

## Version Control

### Git Strategy
- Main branch: Production-ready code
- dev branch: Development
- Feature branches: `feat/feature-name`

### Commit Convention
```
feat: implement new feature
fix: fix bug
docs: update documentation
refactor: code refactoring
test: add tests
chore: dependency updates
```

## Documentation Structure

- `IMPLEMENTATION_SUMMARY.md` - What was built
- `SETUP_GUIDE.md` - How to set up locally
- `ARCHITECTURE.md` - This file - Technical architecture
- `README.md` - Project overview (create if needed)
- Inline code comments for complex logic
- TypeScript types for type safety
