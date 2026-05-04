import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { presence, presenceSessions } from '@/lib/schema';
import { and, eq } from 'drizzle-orm';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const showAll = searchParams.get('all') === 'true';
  const sessionId = searchParams.get('sessionId');

  let whereClause = showAll ? undefined : and(eq(presence.isArchived, false));

  if (sessionId) {
    whereClause = and(whereClause, eq(presence.sessionId, sessionId));
  } else if (!showAll) {
    // Try to find the active session if no sessionId provided
    const activeSession = await db.query.presenceSessions.findFirst({
      where: eq(presenceSessions.isActive, true)
    });
    if (activeSession) {
      whereClause = and(whereClause, eq(presence.sessionId, activeSession.id));
    }
  }

  const allPresence = await db.query.presence.findMany({
    where: whereClause,
    orderBy: (p, { desc }) => [desc(p.checkInTime)],
  });
  return NextResponse.json(allPresence);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let sessionId = body.sessionId;

    if (!sessionId) {
      const activeSession = await db.query.presenceSessions.findFirst({
        where: eq(presenceSessions.isActive, true)
      });
      sessionId = activeSession?.id;
    }

    const [newEntry] = await db.insert(presence).values({
      sessionId: sessionId,
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

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const [updatedEntry] = await db.update(presence)
      .set({ 
        isVisible: body.isVisible,
        isArchived: body.isArchived
      })
      .where(eq(presence.id, body.id))
      .returning();
      
    return NextResponse.json(updatedEntry);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update presence' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    
    await db.delete(presence).where(eq(presence.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete presence' }, { status: 500 });
  }
}
