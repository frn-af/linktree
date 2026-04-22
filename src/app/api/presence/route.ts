import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { presence } from '@/lib/schema';

export async function GET() {
  const allPresence = await db.query.presence.findMany({
    orderBy: (p, { desc }) => [desc(p.checkInTime)],
  });
  return NextResponse.json(allPresence);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const [newEntry] = await db.insert(presence).values({
      name: body.name,
      institution: body.institution,
      position: body.position,
      email: body.email,
      rpjpnUnit: body.rpjpnUnit,
    }).returning();
    
    return NextResponse.json(newEntry);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit presence' }, { status: 500 });
  }
}
