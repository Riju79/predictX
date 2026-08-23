import { NextRequest, NextResponse } from 'next/server';
import { getPortfolio, savePortfolioItem, removePortfolioItem } from '@/src/backend/db';

export async function GET(req: NextRequest) {
  try {
    const userAddress = req.nextUrl.searchParams.get('userAddress');
    if (!userAddress) {
      return NextResponse.json({ error: 'userAddress is required' }, { status: 400 });
    }
    const items = await getPortfolio(userAddress);
    return NextResponse.json(items);
  } catch (err: any) {
    console.error('[GET /api/portfolio]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const item = await req.json();
    await savePortfolioItem(item);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[POST /api/portfolio]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userAddress = req.nextUrl.searchParams.get('userAddress');
    const marketId = req.nextUrl.searchParams.get('marketId');
    const outcomeId = req.nextUrl.searchParams.get('outcomeId') ?? '';
    if (!userAddress || !marketId) {
      return NextResponse.json({ error: 'userAddress and marketId are required' }, { status: 400 });
    }
    await removePortfolioItem(userAddress, marketId, outcomeId);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[DELETE /api/portfolio]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
