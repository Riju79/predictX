import { NextRequest, NextResponse } from 'next/server';
import { getCreatedMarkets, saveCreatedMarket } from '@/src/backend/db';

export async function GET(req: NextRequest) {
  try {
    const userAddress = req.nextUrl.searchParams.get('userAddress') ?? undefined;
    const markets = await getCreatedMarkets(userAddress);
    return NextResponse.json(markets);
  } catch (err: any) {
    console.error('[GET /api/created-markets]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const entry = await req.json();
    await saveCreatedMarket(entry);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[POST /api/created-markets]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
