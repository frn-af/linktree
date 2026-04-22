import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';
import { eq } from 'drizzle-orm';

export const db = drizzle(process.env.DATABASE_URL!, { schema });

export type Link = typeof schema.links.$inferSelect;
export type NewLink = typeof schema.links.$inferInsert;

export type Presence = typeof schema.presence.$inferSelect;
export type NewPresence = typeof schema.presence.$inferInsert;

// Links
export async function getLinks() {
  return await db.query.links.findMany({
    orderBy: (links, { asc }) => [asc(links.order)],
  });
}

// Presence
export async function getPresence() {
  return await db.query.presence.findMany({
    orderBy: (p, { desc }) => [desc(p.timestamp)],
  });
}
