import { pgTable, text, integer, timestamp, uuid } from 'drizzle-orm/pg-core';

export const links = pgTable('links', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  url: text('url').notNull(),
  order: integer('order').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

export const presence = pgTable('presence', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  institution: text('institution').notNull(),
  position: text('position').notNull(),
  email: text('email').notNull(),
  rpjpnUnit: text('rpjpn_unit').notNull(),
  timestamp: timestamp('timestamp').defaultNow(),
  checkInTime: timestamp('check_in_time').defaultNow(),
});
