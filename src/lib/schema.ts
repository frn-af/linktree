import { pgTable, text, integer, timestamp, uuid, boolean } from 'drizzle-orm/pg-core';

export const links = pgTable('links', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  url: text('url').notNull(),
  order: integer('order').notNull().default(0),
  isVisible: boolean('is_visible').notNull().default(true),
  isArchived: boolean('is_archived').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const presenceSessions = pgTable('presence_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  isActive: boolean('is_active').notNull().default(false),
  isVisible: boolean('is_visible').notNull().default(true),
  isArchived: boolean('is_archived').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const presence = pgTable('presence', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').references(() => presenceSessions.id),
  name: text('name').notNull(),
  institution: text('institution').notNull(),
  position: text('position').notNull(),
  email: text('email').notNull(),
  rpjpnUnit: text('rpjpn_unit').notNull(),
  isVisible: boolean('is_visible').notNull().default(true),
  isArchived: boolean('is_archived').notNull().default(false),
  timestamp: timestamp('timestamp').defaultNow(),
  checkInTime: timestamp('check_in_time').defaultNow(),
});
