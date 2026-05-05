import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { settings } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  const allSettings = await db.select().from(settings);
  const settingsMap = allSettings.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, string>);
  
  return NextResponse.json(settingsMap);
}

export async function PUT(request: Request) {
  try {
    const body = await request.json(); // Expected format: { key: string, value: string }
    
    // Upsert logic
    await db.insert(settings)
      .values({ key: body.key, value: body.value })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value: body.value, updatedAt: new Date() }
      });
      
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
