CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- Uploaded transcripts (raw session text)
CREATE TABLE transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id),
  title TEXT,
  full_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- Transcript chunks with embeddings
CREATE TABLE chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transcript_id UUID REFERENCES transcripts(id),
  content TEXT NOT NULL,
  speaker TEXT NOT NULL,
  embedding VECTOR(1536),
  token_count INT,
  position INT,
  strategy TEXT NOT NULL DEFAULT 'unknown',
  created_at TIMESTAMP DEFAULT now()
);

-- Semantic question/answer pairs
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transcript_id UUID REFERENCES transcripts(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES questions(id),
  content TEXT NOT NULL,
  related_chunk_ids UUID [],
  created_at TIMESTAMP DEFAULT now()
);

-- Chat conversation threads
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id),
  transcript_id UUID REFERENCES transcripts(id),
  started_at TIMESTAMP DEFAULT now()
);

-- Individual messages exchanged in the chat
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id),
  sender TEXT NOT NULL CHECK (sender IN ('user', 'agent', 'system')),
  message_type TEXT NOT NULL DEFAULT 'prompt' CHECK (
    message_type IN (
      'prompt',
      'response',
      'clarification',
      'summary',
      'system_notice'
    )
  ),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX ON messages (conversation_id, created_at);
