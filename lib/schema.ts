
import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";

export const profiles = pgTable(
  "profiles",
  {
    // Must match the Supabase Auth user ID
    id: uuid("id").primaryKey(),

    email: text("email").notNull(),

    role: text("role").notNull().default("user"),

    isActive: boolean("is_active")
      .notNull()
      .default(true),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("profiles_email_idx").on(table.email),
  ],
);

export const vaultItems = pgTable(
  "vault_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, {
        onDelete: "cascade",
      }),

    // The service name, e.g. GitHub
    title: text("title").notNull(),

    // These fields contain ciphertext, not plaintext
    usernameEncrypted: text("username_encrypted"),
    passwordEncrypted: text("password_encrypted").notNull(),
    notesEncrypted: text("notes_encrypted"),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("vault_items_user_id_idx").on(table.userId),
    index("vault_items_updated_at_idx").on(table.updatedAt),
  ],
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    userId: uuid("user_id").references(() => profiles.id, {
      onDelete: "set null",
    }),

    eventType: text("event_type").notNull(),

    status: text("status").notNull(),

    // Never put passwords, TOTP codes, tokens, or secret values here
    details: jsonb("details")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("audit_logs_user_id_idx").on(table.userId),
    index("audit_logs_created_at_idx").on(table.createdAt),
  ],
);
