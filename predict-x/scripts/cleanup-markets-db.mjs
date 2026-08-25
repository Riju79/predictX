import { neon } from '@neondatabase/serverless';

const url = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_qLBYQM8uEF0O@ep-fragrant-block-az3v448u.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
const sql = neon(url);

async function main() {
  console.log('🧹 Cleaning up database: Keeping ONLY the latest created market...');

  // 1. Clean px_markets
  const markets = await sql`SELECT id, data FROM px_markets ORDER BY created_at DESC`;
  console.log(`Found ${markets.length} total markets in px_markets.`);

  if (markets.length > 1) {
    const latestMarket = markets[0];
    console.log('✨ Keeping Latest Market:', latestMarket.data?.title || latestMarket.id);

    // Delete all except latest
    await sql`DELETE FROM px_markets WHERE id != ${latestMarket.id}`;
    console.log(`✅ Deleted ${markets.length - 1} old markets from px_markets.`);
  }

  // 2. Clean px_created_markets
  const createdMarkets = await sql`SELECT id, title FROM px_created_markets ORDER BY created_at DESC`;
  console.log(`Found ${createdMarkets.length} total entries in px_created_markets.`);

  if (createdMarkets.length > 1) {
    const latestCreated = createdMarkets[0];
    console.log('✨ Keeping Latest Created Entry:', latestCreated.title || latestCreated.id);

    await sql`DELETE FROM px_created_markets WHERE id != ${latestCreated.id}`;
    console.log(`✅ Deleted ${createdMarkets.length - 1} old entries from px_created_markets.`);
  }

  console.log('\n🎉 DATABASE CLEANUP COMPLETE! Exactly 1 market remains active.');
}

main().catch(console.error);
