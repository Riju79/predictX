import { NextRequest, NextResponse } from 'next/server';
import { getCustomMarkets, saveCustomMarket } from '@/src/backend/db';

export async function GET() {
  try {
    const markets = await getCustomMarkets();
    return NextResponse.json(markets);
  } catch (err: any) {
    console.error('[GET /api/markets]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const market = await req.json();
    await saveCustomMarket(market);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[POST /api/markets]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
