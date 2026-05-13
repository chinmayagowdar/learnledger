-- Create certificates table
CREATE TABLE IF NOT EXISTS public.certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id TEXT UNIQUE NOT NULL,
  recipient_name TEXT NOT NULL,
  skill_title TEXT NOT NULL,
  issued_by TEXT DEFAULT 'LearnLedger',
  issued_at DATE NOT NULL,
  expires_at DATE,
  blockchain_hash TEXT UNIQUE,
  is_verified BOOLEAN DEFAULT false,
  views INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create resumes table
CREATE TABLE IF NOT EXISTS public.resumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_hash TEXT UNIQUE NOT NULL,
  original_text TEXT,
  parsed_data JSONB,
  ai_score NUMERIC(5,2),
  ai_feedback TEXT,
  blockchain_hash TEXT UNIQUE,
  is_verified BOOLEAN DEFAULT false,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create blockchain_records table
CREATE TABLE IF NOT EXISTS public.blockchain_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tx_hash TEXT UNIQUE NOT NULL,
  entity_type TEXT NOT NULL, -- 'certificate' or 'resume'
  entity_id uuid NOT NULL,
  document_hash TEXT NOT NULL,
  block_number INTEGER NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  sender_address TEXT,
  status TEXT DEFAULT 'confirmed', -- 'pending' or 'confirmed'
  chain_id TEXT DEFAULT 'learnledger-mainnet',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_certificates_blockchain_hash ON public.certificates(blockchain_hash);
CREATE INDEX idx_certificates_certificate_id ON public.certificates(certificate_id);
CREATE INDEX idx_resumes_user_id ON public.resumes(user_id);
CREATE INDEX idx_resumes_file_hash ON public.resumes(file_hash);
CREATE INDEX idx_resumes_blockchain_hash ON public.resumes(blockchain_hash);
CREATE INDEX idx_blockchain_tx_hash ON public.blockchain_records(tx_hash);
CREATE INDEX idx_blockchain_entity ON public.blockchain_records(entity_type, entity_id);
