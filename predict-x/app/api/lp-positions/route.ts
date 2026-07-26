import { NextRequest, NextResponse } from 'next/server';
import { getLPPositions, saveLPPosition, removeLPPosition } from '@/src/backend/db';

export async function GET(req: NextRequest) {
  try {
    const userAddress = req.nextUrl.searchParams.get('userAddress') ?? undefined;
    const marketId = req.nextUrl.searchParams.get('marketId') ?? undefined;
    const positions = await getLPPositions(userAddress, marketId);
    return NextResponse.json(positions);
  } catch (err: any) {
    console.error('[GET /api/lp-positions]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const pos = await req.json();
    await saveLPPosition(pos);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[POST /api/lp-positions]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userAddress = req.nextUrl.searchParams.get('userAddress');
    const marketId = req.nextUrl.searchParams.get('marketId');
    if (!userAddress || !marketId) {
      return NextResponse.json({ error: 'userAddress and marketId are required' }, { status: 400 });
    }
    await removeLPPosition(userAddress, marketId);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[DELETE /api/lp-positions]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
