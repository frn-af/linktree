import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { presenceSessions } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const showArchived = searchParams.get('all') === 'true';

  const sessions = await db.query.presenceSessions.findMany({
    where: showArchived ? undefined : eq(presenceSessions.isArchived, false),
    orderBy: (s, { desc }) => [desc(s.createdAt)],
  });
  return NextResponse.json(sessions);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // If setting as active, deactivate others
    if (body.isActive) {
      await db.update(presenceSessions).set({ isActive: false });
    }

    const [newSession] = await db.insert(presenceSessions).values({
      name: body.name,
      description: body.description,
      isActive: body.isActive ?? false,
      isVisible: body.isVisible ?? true,
    }).returning();
    
    return NextResponse.json(newSession);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    
    // If setting as active, deactivate others
    if (body.isActive) {
      await db.update(presenceSessions).set({ isActive: false });
    }

    const [updatedSession] = await db.update(presenceSessions)
      .set({ 
        name: body.name, 
        description: body.description,
        isActive: body.isActive,
        isVisible: body.isVisible,
        isArchived: body.isArchived
      })
      .where(eq(presenceSessions.id, body.id))
      .returning();
      
    return NextResponse.json(updatedSession);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    
    await db.delete(presenceSessions).where(eq(presenceSessions.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 });
  }
}
