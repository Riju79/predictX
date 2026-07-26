import { NextRequest, NextResponse } from 'next/server';
import { getTrades, saveTrade } from '@/src/backend/db';

export async function GET(req: NextRequest) {
  try {
    const userAddress = req.nextUrl.searchParams.get('userAddress') ?? undefined;
    const trades = await getTrades(userAddress);
    return NextResponse.json(trades);
  } catch (err: any) {
    console.error('[GET /api/trades]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const trade = await req.json();
    await saveTrade(trade);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[POST /api/trades]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
