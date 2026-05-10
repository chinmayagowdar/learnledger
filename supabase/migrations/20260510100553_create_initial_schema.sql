/*
  # Create initial database schema for LearnLedger

  1. New Tables
    - `profiles` - User profiles with role (user/admin)
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, unique)
      - `full_name` (text)
      - `avatar_url` (text, nullable)
      - `role` (text, default 'user')
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `skills` - Available assessment skills
      - `id` (text, primary key)
      - `name` (text)
      - `description` (text)
      - `category` (text)
      - `icon` (text, nullable)
      - `rounds` (integer, default 3)
      - `questions_per_round` (integer, default 5)
      - `pass_threshold` (integer, default 70)
      - `created_at` (timestamptz)

    - `attempts` - Quiz/assessment attempt records
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `skill_id` (text, references skills)
      - `round_number` (integer)
      - `round_type` (text - 'mcq', 'coding', 'proctored')
      - `score` (integer)
      - `max_score` (integer)
      - `percentage` (integer)
      - `passed` (boolean)
      - `answers` (jsonb, nullable)
      - `time_spent_seconds` (integer, nullable)
      - `camera_approved` (boolean, default false)
      - `created_at` (timestamptz)
      - `completed_at` (timestamptz)

    - `credentials` - Earned credentials
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `skill_id` (text, references skills)
      - `skill_title` (text)
      - `blockchain_hash` (text, unique)
      - `rounds` (jsonb)
      - `overall_score` (integer)
      - `issued_at` (timestamptz)
      - `expires_at` (timestamptz)
      - `is_verified` (boolean, default true)
      - `views` (integer, default 0)
      - `share_count` (integer, default 0)

  2. Security
    - Enable RLS on all tables
    - Profiles: users can read own, admins can read all
    - Skills: public read access
    - Attempts: users can read/write own, admins can read all
    - Credentials: public read, users can insert own, admins can read all
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text DEFAULT '',
  avatar_url text,
  role text DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Skills table
CREATE TABLE IF NOT EXISTS skills (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'engineering',
  icon text,
  rounds integer DEFAULT 3,
  questions_per_round integer DEFAULT 5,
  pass_threshold integer DEFAULT 70,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Skills are publicly readable"
  ON skills FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage skills"
  ON skills FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Attempts table
CREATE TABLE IF NOT EXISTS attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  skill_id text NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  round_number integer NOT NULL CHECK (round_number BETWEEN 1 AND 3),
  round_type text NOT NULL CHECK (round_type IN ('mcq', 'coding', 'proctored')),
  score integer NOT NULL DEFAULT 0,
  max_score integer NOT NULL DEFAULT 5,
  percentage integer NOT NULL DEFAULT 0,
  passed boolean NOT NULL DEFAULT false,
  answers jsonb,
  time_spent_seconds integer,
  camera_approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz DEFAULT now()
);

ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own attempts"
  ON attempts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own attempts"
  ON attempts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read all attempts"
  ON attempts FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Credentials table
CREATE TABLE IF NOT EXISTS credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  skill_id text NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  skill_title text NOT NULL,
  blockchain_hash text UNIQUE NOT NULL,
  rounds jsonb NOT NULL DEFAULT '[]',
  overall_score integer NOT NULL DEFAULT 0,
  issued_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '365 days'),
  is_verified boolean DEFAULT true,
  views integer DEFAULT 0,
  share_count integer DEFAULT 0
);

ALTER TABLE credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Credentials are publicly readable"
  ON credentials FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own credentials"
  ON credentials FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own credentials"
  ON credentials FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read all credentials"
  ON credentials FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Insert default skills
INSERT INTO skills (id, name, description, category, icon, rounds, questions_per_round, pass_threshold) VALUES
  ('python', 'Python', 'Core Python programming, data structures, and algorithms', 'programming', '🐍', 3, 5, 70),
  ('java', 'Java', 'Object-oriented programming, JVM, and enterprise development', 'programming', '☕', 3, 5, 70),
  ('javascript', 'JavaScript', 'Modern JS, async patterns, and web APIs', 'programming', '📜', 3, 5, 70),
  ('react', 'React', 'Component architecture, hooks, and state management', 'frontend', '⚛️', 3, 5, 70),
  ('sql', 'SQL', 'Database queries, optimization, and schema design', 'database', '🗃️', 3, 5, 70),
  ('docker', 'Docker', 'Containerization, orchestration, and DevOps practices', 'devops', '🐳', 3, 5, 70),
  ('dsa-arrays', 'DSA (Arrays)', 'Data structures and algorithms focused on arrays', 'algorithms', '🧮', 3, 5, 70),
  ('os', 'Operating Systems', 'Process management, memory, and file systems', 'systems', '💻', 3, 5, 70)
ON CONFLICT (id) DO NOTHING;

-- Create index for common queries
CREATE INDEX IF NOT EXISTS idx_attempts_user_skill ON attempts(user_id, skill_id);
CREATE INDEX IF NOT EXISTS idx_credentials_user ON credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_credentials_hash ON credentials(blockchain_hash);
