# LearnLedger - Production Ready Application

A full-stack application for certificate verification, AI-powered resume analysis, and blockchain exploration.

## Quick Start

### Prerequisites
- Node.js 18+
- pnpm package manager
- Supabase account and project

### Installation

```bash
# Install dependencies
pnpm install

# Set environment variables
cp .env.example .env.local

# Run database migration (one-time setup)
psql $DATABASE_URL < migrations/001_create_ledger_tables.sql

# Start development servers
cd artifacts/learn-ledger && pnpm run dev

# In another terminal:
cd artifacts/api-server && PORT=3001 pnpm run dev
```

Visit http://localhost:5173 to see the application.

## Features

### 1. Certificate Verification
- QR code generation and scanning
- Blockchain hash registration
- Secure verification system

### 2. Resume AI Parsing & Scoring
- File upload with validation
- AI-powered content analysis
- Mock scoring engine with OpenAI/Gemini integration points
- Personalized feedback generation

### 3. Blockchain Explorer
- Simulated blockchain ledger
- Transaction history and verification
- Block explorer interface

## Project Structure

```
artifacts/
├── learn-ledger/              # Frontend (Vite + React)
│   ├── src/
│   │   ├── pages/             # Page components
│   │   ├── components/        # UI components
│   │   └── lib/               # Utilities
│   └── vite.config.ts
├── api-server/                # Backend (Express.js)
│   ├── src/
│   │   ├── routes/            # API endpoints
│   │   ├── lib/               # Core logic
│   │   └── index.ts
│   └── package.json
migrations/
└── 001_create_ledger_tables.sql   # Database schema
```

## Technology Stack

- **Frontend**: Vite, React 19, TypeScript, Tailwind CSS
- **Backend**: Express.js, TypeScript, Pino logging
- **Database**: Supabase PostgreSQL
- **Deployment**: Vercel

## Available Routes

### Frontend
- `/` - Dashboard
- `/verify` - Certificate verification
- `/resume/upload` - Resume upload
- `/resume/result/:id` - Resume analysis results
- `/blockchain/:txHash` - Block explorer
- `/admin/issue` - Certificate issuance

### API
- `POST /api/verify-certificate` - Verify certificate
- `POST /api/issue-certificate` - Issue new certificate
- `POST /api/resume/upload` - Upload and analyze resume
- `GET /api/blockchain/stats` - Blockchain statistics
- `GET /api/blockchain/:txHash` - Get transaction details
- `GET /api/healthz` - Health check

## Deployment

### To Vercel

1. Connect GitHub repository to Vercel
2. Add environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

3. Push to main branch - automatic deployment triggered
4. Run database migration on Supabase

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## Database Schema

### certificates
```sql
id                  UUID PRIMARY KEY
certificate_id      VARCHAR UNIQUE
recipient_name      VARCHAR
skill_title         VARCHAR
issued_by           VARCHAR
issued_at           DATE
expires_at          DATE
blockchain_hash     VARCHAR
created_at          TIMESTAMP
```

### resumes
```sql
id                  UUID PRIMARY KEY
file_name           VARCHAR
file_hash           VARCHAR (SHA-256)
extracted_text      TEXT
ai_score            DECIMAL (0-100)
feedback            TEXT
blockchain_hash     VARCHAR
created_at          TIMESTAMP
```

### blockchain_records
```sql
id                  UUID PRIMARY KEY
tx_hash             VARCHAR UNIQUE
block_number        BIGINT
entity_type         VARCHAR
entity_id           UUID
document_hash       VARCHAR
timestamp           TIMESTAMP
```

## Development

### Build
```bash
pnpm run build
```

### Type Check
```bash
pnpm run typecheck
```

### Format Code
```bash
pnpm run format
```

## Environment Variables

```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Server
NODE_ENV=development
PORT=3001

# Optional: AI Integration
OPENAI_API_KEY=your-openai-key
```

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design and data flows
- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Local development setup
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - What was built

## Git Workflow

```bash
# Main branch is automatically deployed to production
git checkout -b feature/your-feature
# Make changes
git commit -m "feat: your feature"
git push origin feature/your-feature
# Create PR on GitHub for review
```

## Future Enhancements

- [ ] Real OpenAI/Gemini integration
- [ ] PDF parsing for resume extraction
- [ ] Email notifications
- [ ] Admin dashboard
- [ ] User authentication and profiles
- [ ] Redis caching layer
- [ ] WebSocket real-time updates
- [ ] Multi-language support

## Troubleshooting

### Port already in use
The API server will automatically try alternative ports 3001-3010 if the initial port is occupied.

### Database connection failed
- Verify Supabase URL and API keys
- Check that your IP is whitelisted in Supabase
- Ensure network connectivity to Supabase

### Missing environment variables
- Check Vercel dashboard settings
- Redeploy after adding new variables
- Use `vercel env` CLI to verify

## Support

- GitHub Issues: [Report a bug](https://github.com/chinmayagowdar/learnledger/issues)
- Documentation: See files in project root
- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs

## License

MIT License - see LICENSE file for details
