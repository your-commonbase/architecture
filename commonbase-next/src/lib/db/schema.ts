import { pgTable, uuid, text, json, timestamp, customType, primaryKey, integer } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Custom vector type for pgvector
const vector = customType<{ data: number[]; notNull: false; default: false }>({
  dataType() {
    return 'vector(1536)';
  },
  toDriver(value: number[]): string {
    return `[${value.join(',')}]`;
  },
  fromDriver(value: string): number[] {
    return value
      .slice(1, -1) // Remove [ and ]
      .split(',')
      .map(Number);
  },
});

export const commonbase = pgTable('commonbase', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  data: text('data').notNull(),
  metadata: json('metadata').$type<{
    title?: string;
    source?: string;
    type?: string;
    links?: string[];
    backlinks?: string[];
    [key: string]: any;
  }>().default({}),
  created: timestamp('created').defaultNow().notNull(),
  updated: timestamp('updated').defaultNow().notNull(),
});

export const embeddings = pgTable('embeddings', {
  id: uuid('id').primaryKey().references(() => commonbase.id, { onDelete: 'cascade' }),
  embedding: vector('embedding').notNull(),
});

export type CommonbaseEntry = typeof commonbase.$inferSelect;
export type NewCommonbaseEntry = typeof commonbase.$inferInsert;
export type Embedding = typeof embeddings.$inferSelect;
export type NewEmbedding = typeof embeddings.$inferInsert;
export type User = typeof users.$inferSelect;
export type UserApiKey = typeof userApiKeys.$inferSelect;
export type NewUserApiKey = typeof userApiKeys.$inferInsert;

// NextAuth.js tables (only created when auth is enabled)
export const users = pgTable("user", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name"),
  email: text("email").notNull(),
  emailVerified: timestamp("emailVerified"),
  image: text("image"),
});

export const accounts = pgTable(
  "account",
  {
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").notNull().primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires").notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires").notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

// User API keys table for user-specific API access
export const userApiKeys = pgTable("userApiKey", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // User-friendly name for the key
  keyHash: text("keyHash").notNull().unique(), // Hashed version of the API key
  created: timestamp("created").defaultNow().notNull(),
  lastUsed: timestamp("lastUsed"),
});