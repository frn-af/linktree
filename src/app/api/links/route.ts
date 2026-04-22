import { NextResponse } from 'next/server';
import { getLinks, saveLinks, Link } from '@/lib/db';

export async function GET() {
  const links = await getLinks();
  // Sort by order
  links.sort((a, b) => a.order - b.order);
  return NextResponse.json(links);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const links = await getLinks();
    
    const newLink: Link = {
      id: crypto.randomUUID(),
      title: body.title,
      url: body.url,
      order: body.order ?? links.length,
    };
    
    links.push(newLink);
    await saveLinks(links);
    
    return NextResponse.json(newLink);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create link' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const links = await getLinks();
    
    const index = links.findIndex(l => l.id === body.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }
    
    links[index] = { ...links[index], ...body };
    await saveLinks(links);
    
    return NextResponse.json(links[index]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update link' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }
    
    let links = await getLinks();
    links = links.filter(l => l.id !== id);
    await saveLinks(links);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete link' }, { status: 500 });
  }
}
