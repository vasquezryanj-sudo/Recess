import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load .env.local manually
const env = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8');
env.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val.length) process.env[key.trim()] = val.join('=').trim();
});

const sql = neon(process.env.DATABASE_URL);

async function setup() {
  console.log('Creating tables...');
  
  await sql`
    CREATE TABLE IF NOT EXISTS games (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      played_at TIMESTAMPTZ DEFAULT NOW(),
      players JSONB NOT NULL,
      scores JSONB NOT NULL
    )
  `;

  console.log('✅ Tables created successfully');
  process.exit(0);
}

setup().catch(e => { console.error(e); process.exit(1); });
