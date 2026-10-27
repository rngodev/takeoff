import { relations, sql } from "drizzle-orm";
import {
  pgTable,
  pgEnum,
  text,
  timestamp,
  boolean,
  index,
  primaryKey,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const takeKind = pgEnum("take_kind", ["objective", "subjective"]);
export const resolutionOutcome = pgEnum("resolution_outcome", [
  "correct",
  "incorrect",
  "void",
]);
export const positionStance = pgEnum("position_stance", ["agree", "disagree"]);

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [index("sessions_userId_idx").on(table.userId)],
);

export const accounts = pgTable(
  "accounts",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("accounts_userId_idx").on(table.userId)],
);

export const verifications = pgTable(
  "verifications",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verifications_identifier_idx").on(table.identifier)],
);

export const pundits = pgTable(
  "pundits",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    url: text("url"),
    description: text("description"),
    image: text("image"),
    createdByUserId: text("created_by_user_id")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [index("pundits_createdByUserId_idx").on(table.createdByUserId)],
);

export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const takes = pgTable(
  "takes",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    punditId: text("pundit_id")
      .notNull()
      .references(() => pundits.id),
    headline: text("headline").notNull(),
    details: text("details"),
    kind: takeKind("kind").notNull(),
    source: text("source"),
    statedAt: timestamp("stated_at").notNull(),
    createdByUserId: text("created_by_user_id")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [
    index("takes_punditId_idx").on(table.punditId),
    index("takes_createdByUserId_idx").on(table.createdByUserId),
  ],
);

export const takeCategories = pgTable(
  "take_categories",
  {
    takeId: text("take_id")
      .notNull()
      .references(() => takes.id),
    categoryId: text("category_id")
      .notNull()
      .references(() => categories.id),
  },
  (table) => [primaryKey({ columns: [table.takeId, table.categoryId] })],
);

export const resolutions = pgTable(
  "resolutions",
  {
    id: text("id").primaryKey(),
    takeId: text("take_id")
      .notNull()
      .references(() => takes.id),
    outcome: resolutionOutcome("outcome").notNull(),
    notes: text("notes"),
    source: text("source"),
    createdByUserId: text("created_by_user_id")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [
    index("resolutions_takeId_idx").on(table.takeId),
    uniqueIndex("resolutions_takeId_active_idx")
      .on(table.takeId)
      .where(sql`deleted_at IS NULL`),
  ],
);

export const positions = pgTable(
  "positions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    takeId: text("take_id")
      .notNull()
      .references(() => takes.id),
    stance: positionStance("stance").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [
    index("positions_userId_takeId_idx").on(table.userId, table.takeId),
  ],
);

export const boosts = pgTable(
  "boosts",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    takeId: text("take_id")
      .notNull()
      .references(() => takes.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [index("boosts_userId_takeId_idx").on(table.userId, table.takeId)],
);

export const punditFollows = pgTable(
  "pundit_follows",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    punditId: text("pundit_id")
      .notNull()
      .references(() => pundits.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [
    index("pundit_follows_userId_punditId_idx").on(
      table.userId,
      table.punditId,
    ),
    index("pundit_follows_punditId_idx").on(table.punditId),
  ],
);

// Relations

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  pundits: many(pundits),
  takes: many(takes),
  resolutions: many(resolutions),
  positions: many(positions),
  boosts: many(boosts),
  punditFollows: many(punditFollows),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  users: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  users: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const punditsRelations = relations(pundits, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [pundits.createdByUserId],
    references: [users.id],
  }),
  takes: many(takes),
  punditFollows: many(punditFollows),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  takeCategories: many(takeCategories),
}));

export const takesRelations = relations(takes, ({ one, many }) => ({
  pundit: one(pundits, {
    fields: [takes.punditId],
    references: [pundits.id],
  }),
  createdBy: one(users, {
    fields: [takes.createdByUserId],
    references: [users.id],
  }),
  takeCategories: many(takeCategories),
  resolutions: many(resolutions),
  positions: many(positions),
  boosts: many(boosts),
}));

export const takeCategoriesRelations = relations(takeCategories, ({ one }) => ({
  take: one(takes, {
    fields: [takeCategories.takeId],
    references: [takes.id],
  }),
  category: one(categories, {
    fields: [takeCategories.categoryId],
    references: [categories.id],
  }),
}));

export const resolutionsRelations = relations(resolutions, ({ one }) => ({
  take: one(takes, {
    fields: [resolutions.takeId],
    references: [takes.id],
  }),
  createdBy: one(users, {
    fields: [resolutions.createdByUserId],
    references: [users.id],
  }),
}));

export const positionsRelations = relations(positions, ({ one }) => ({
  user: one(users, {
    fields: [positions.userId],
    references: [users.id],
  }),
  take: one(takes, {
    fields: [positions.takeId],
    references: [takes.id],
  }),
}));

export const boostsRelations = relations(boosts, ({ one }) => ({
  user: one(users, {
    fields: [boosts.userId],
    references: [users.id],
  }),
  take: one(takes, {
    fields: [boosts.takeId],
    references: [takes.id],
  }),
}));

export const punditFollowsRelations = relations(punditFollows, ({ one }) => ({
  user: one(users, {
    fields: [punditFollows.userId],
    references: [users.id],
  }),
  pundit: one(pundits, {
    fields: [punditFollows.punditId],
    references: [pundits.id],
  }),
}));
