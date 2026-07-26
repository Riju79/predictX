// Run schema.sql against Neon database
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const DATABASE_URL = 'postgresql://neondb_owner:npg_qLBYQM8uEF0O@ep-fragrant-block-az3v448u.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

async function runSchema() {
  const sql = neon(DATABASE_URL);
  const schemaPath = path.join(__dirname, '..', 'src', 'backend', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');

  // Remove comment-only lines, then split on semicolons
  const cleaned = schema
    .split('\n')
    .filter(line => !line.trim().startsWith('--'))
    .join('\n');

  const statements = cleaned
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  console.log(`Running ${statements.length} SQL statements...\n`);

  for (const stmt of statements) {
    try {
      await sql.query(stmt);
      const match = stmt.match(/(TABLE|INDEX)\s+(?:IF NOT EXISTS\s+)?(\S+)/i);
      const name = match ? `${match[1]} ${match[2]}` : 'OK';
      console.log(`✅ ${name}`);
    } catch (err) {
      console.error(`❌ Failed on: ${stmt.slice(0, 80).replace(/\s+/g, ' ')}...`);
      console.error(`   Error: ${err.message}\n`);
    }
  }

  console.log('\n🎉 Done!');
}

runSchema().catch(console.error);
