# LearnLedger Quick Start Guide

## Getting Started (5 minutes)

### 1. Install and Run Locally

```bash
# Clone the project
git clone https://github.com/yourusername/learnledger.git
cd learnledger

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Open http://localhost:3000 in your browser
```

### 2. Explore the Features

#### Dashboard (`/`)
- View learning statistics
- See progress chart
- Understand the assessment process
- Click "Start Assessing" CTA

#### Skills Selection (`/skills`)
- Browse available skills:
  - React Advanced
  - JavaScript Mastery
  - TypeScript Pro
- See 3 rounds per skill
- 5 questions per round
- Click skill card to start

#### Assessment Flow
1. Select skill → see progress
2. Complete Round 1 (Intermediate) - 5 questions
3. Complete Round 2 (Advanced) - 5 questions
4. Complete Round 3 (Expert) - 5 questions
5. Score 70%+ on each to pass
6. Earn blockchain-verified credential

#### View Credentials (`/credentials`)
- See all earned certificates
- View blockchain hash
- Share credential via link
- Copy verification URL
- Check credential status

#### Public Verification (`/verify/[hash]`)
- Anyone can verify credentials
- No login required
- Shows full credential details
- Displays round-by-round scores
- Share credential with others

---

## Key Features Overview

### Multi-Round Assessment
```
Round 1: Intermediate (5 questions)
    ↓ Pass (70%+)
Round 2: Advanced (5 questions)
    ↓ Pass (70%+)
Round 3: Expert (5 questions)
    ↓ Pass (70%+)
Earn Blockchain-Verified Credential
    ↓
Share and Verify Publicly
```

### Blockchain Verification
- Each credential gets a unique SHA-256 hash
- Hash is immutable and permanent
- Anyone can verify using the hash
- Shareable via public verification URL
- No authentication needed to verify

### Credential Details
```json
{
  "skillTitle": "React Advanced",
  "blockchainHash": "abc123...",
  "score": 92,
  "rounds": [
    { "round": 1, "percentage": 85 },
    { "round": 2, "percentage": 92 },
    { "round": 3, "percentage": 98 }
  ],
  "issuedAt": "2024-05-10",
  "expiresAt": "2025-05-10",
  "isVerified": true
}
```

---

## Available Skills

### 1. React Advanced
**Topics**: Hooks, optimization, custom patterns, concurrent rendering
- Round 1: useCallback, useEffect, component patterns
- Round 2: Custom hooks, performance, context API
- Round 3: Concurrent rendering, Suspense, Fiber

### 2. JavaScript Mastery
**Topics**: Advanced JS, async patterns, functional programming
- Round 1: Closures, scope, hoisting, this
- Round 2: Event loop, promises, async/await
- Round 3: Proxies, WeakMap, Symbol

### 3. TypeScript Pro
**Topics**: Advanced TS, generics, type utilities
- Round 1: Interfaces, generics, utility types
- Round 2: Conditional types, mapped types
- Round 3: Variance, recursive types

---

## API Reference (For Developers)

### Submit Quiz Answers
```bash
POST /api/quiz/submit

Body:
{
  "skill": "react-advanced",
  "round": 1,
  "answers": [0, 1, 2, 3, 4]
}

Response:
{
  "success": true,
  "score": 4,
  "maxScore": 5,
  "percentage": 80,
  "passed": true
}
```

### Generate Credential
```bash
POST /api/credentials/generate

Body:
{
  "skill": "react-advanced",
  "userId": "user123",
  "rounds": [
    { "round": 1, "score": 4, "percentage": 80 },
    { "round": 2, "score": 5, "percentage": 100 },
    { "round": 3, "score": 4, "percentage": 80 }
  ]
}

Response:
{
  "success": true,
  "credential": {
    "blockchainHash": "abc123...",
    "skill": "react-advanced",
    "issuedAt": "2024-05-10T...",
    "expiresAt": "2025-05-10T..."
  },
  "verificationUrl": "/verify/abc123..."
}
```

### Verify Credential
```bash
GET /api/verify/[hash]

Response:
{
  "success": true,
  "verified": true,
  "credential": {
    "skillTitle": "React Advanced",
    "score": 92,
    "rounds": [...]
  }
}
```

---

## State Management with Zustand

### Access User State
```typescript
import { useLearnLedgerStore } from '@/lib/store';

const { user, setUser } = useLearnLedgerStore();
```

### Track Multi-Round Progress
```typescript
const { 
  currentSkill,
  currentRound,
  roundResults,
  setCurrentSkill,
  setCurrentRound,
  addRoundResult 
} = useLearnLedgerStore();

// Start new assessment
setCurrentSkill('react-advanced');
setCurrentRound(1);

// Add result after round completion
addRoundResult({
  round: 1,
  score: 4,
  maxScore: 5,
  percentage: 80,
  passed: true,
  timestamp: new Date().toISOString()
});
```

### Reset Assessment
```typescript
const { resetMultiRound } = useLearnLedgerStore();
resetMultiRound(); // Clear all multi-round state
```

---

## Firebase Setup (For Production)

### Create Collections

**`attempts`** - Quiz attempt records
```
Collection: attempts
Documents:
  - userId, skillId, round, score, percentage, passed, answers
```

**`credentials`** - Earned credentials
```
Collection: credentials
Documents:
  - userId, skillId, skillTitle, blockchainHash
  - rounds (array), issuedAt, expiresAt
  - isVerified, views, shareCount
```

### Security Rules

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /credentials/{document=**} {
      allow read: if true;  // Public verification
      allow write: if request.auth.uid != null;
    }
    match /attempts/{document=**} {
      allow read, write: if request.auth.uid == resource.data.userId;
      allow create: if request.auth.uid == request.resource.data.userId;
    }
  }
}
```

---

## Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "feat: comprehensive multi-round assessment system"
git push origin main
```

### 2. Deploy to Vercel
1. Visit [vercel.com/new](https://vercel.com/new)
2. Select your GitHub repository
3. Add Firebase environment variables:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
4. Click "Deploy"

### 3. Monitor
- View analytics at vercel.com/dashboard
- Check logs for any errors
- Monitor API endpoints

---

## Customization Guide

### Add New Skill

**1. Update `lib/questions.json`**
```json
{
  "skills": {
    "new-skill": {
      "title": "New Skill",
      "description": "Description",
      "rounds": {
        "round1": { "questions": [...] },
        "round2": { "questions": [...] },
        "round3": { "questions": [...] }
      }
    }
  }
}
```

**2. Update `/app/skills/page.tsx`**
```typescript
const skills = [
  // ... existing skills
  {
    id: 'new-skill',
    name: 'New Skill',
    description: 'Description here',
    level: 'Advanced',
    rounds: 3,
    questionsPerRound: 5,
  },
];
```

### Change Pass Threshold
**File**: `lib/store.ts` and API endpoints
```typescript
// Change from 70 to your desired percentage
const passed = percentage >= 70;
```

### Customize Colors
**File**: `app/globals.css` (design tokens)
```css
:root {
  --primary: 84 153 255; /* Purple */
  --accent: 96 245 255;  /* Cyan */
  /* ... */
}
```

---

## Troubleshooting

### Build Fails
```bash
# Clear cache
rm -rf .next node_modules pnpm-lock.yaml

# Reinstall
pnpm install

# Try building again
pnpm build
```

### Firebase Connection Issues
- Check environment variables in `.env.local`
- Verify Firebase project is active
- Check Firestore security rules
- Ensure Firestore is initialized

### API Returns 500 Error
- Check server logs: `pnpm dev`
- Verify request body format
- Check Firebase Firestore rules
- Review database schema

---

## Performance Tips

- Use `revalidateTag()` for cache management
- Implement pagination for large datasets
- Lazy load credential cards
- Monitor Core Web Vitals in Vercel Analytics

---

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Set up Firebase Firestore
3. ⏭️ Add email authentication
4. ⏭️ Create admin dashboard
5. ⏭️ Add leaderboard system
6. ⏭️ Implement credential NFT minting

---

## Support & Resources

- **GitHub Issues**: Report bugs or feature requests
- **Documentation**: See README_LEARNLEDGER.md
- **Deployment**: See DEPLOYMENT_GUIDE.md
- **Next.js Docs**: https://nextjs.org/docs
- **Firebase Docs**: https://firebase.google.com/docs

---

**Ready to launch? Deploy to Vercel now!** 🚀
