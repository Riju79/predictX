const { neon } = require('@neondatabase/serverless');
const sql = neon('postgresql://neondb_owner:npg_qLBYQM8uEF0O@ep-fragrant-block-az3v448u.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require');
sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`
  .then(rows => {
    console.log('Tables in your Neon DB:');
    rows.forEach(r => console.log(' ✅', r.table_name));
  })
  .catch(console.error);
