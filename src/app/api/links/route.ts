import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { links } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  const allLinks = await db.query.links.findMany({
    orderBy: (l, { asc }) => [asc(l.order)],
  });
  return NextResponse.json(allLinks);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const [newLink] = await db.insert(links).values({
      title: body.title,
      url: body.url,
      order: body.order ?? 0,
    }).returning();
    
    return NextResponse.json(newLink);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create link' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const [updatedLink] = await db.update(links)
      .set({ title: body.title, url: body.url, order: body.order })
      .where(eq(links.id, body.id))
      .returning();
      
    return NextResponse.json(updatedLink);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update link' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    
    await db.delete(links).where(eq(links.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete link' }, { status: 500 });
  }
}
