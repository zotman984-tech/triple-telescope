CREATE TABLE IF NOT EXISTS up_users (
  id SERIAL PRIMARY KEY,
  document_id VARCHAR(255),
  username VARCHAR(255) UNIQUE,
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  reset_password_token VARCHAR(255),
  confirmation_token VARCHAR(255),
  confirmed BOOLEAN DEFAULT false,
  blocked BOOLEAN DEFAULT false,
  provider VARCHAR(255) DEFAULT 'local',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP,
  created_by_id INTEGER,
  updated_by_id INTEGER,
  locale VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS up_users_document_id_idx ON up_users(document_id);
CREATE INDEX IF NOT EXISTS up_users_created_by_id_idx ON up_users(created_by_id);
CREATE INDEX IF NOT EXISTS up_users_updated_by_id_idx ON up_users(updated_by_id);
