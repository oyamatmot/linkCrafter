import { pgTable, text, serial, integer, timestamp, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  preferences: json("preferences").$type<{
    darkMode: boolean;
    notifications: boolean;
    smartSearch: boolean;
    selfMonitoring: boolean;
    defaultCustomDomain?: string;
  }>().default({
    darkMode: false,
    notifications: false,
    smartSearch: true,
    selfMonitoring: true,
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const links = pgTable("links", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  originalUrl: text("original_url").notNull(),
  shortCode: text("short_code").notNull().unique(),
  customDomain: text("custom_domain"),
  hasPassword: boolean("has_password").default(false),
  password: text("password"),
  isPublished: boolean("is_published").default(true).notNull(),
  category: text("category"),
  clicks: integer("clicks").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const clicks = pgTable("clicks", {
  id: serial("id").primaryKey(),
  linkId: integer("link_id").notNull().references(() => links.id),
  clickedAt: timestamp("clicked_at").defaultNow().notNull(),
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
});

export const recentSearches = pgTable("recent_searches", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  query: text("query").notNull(),
  searchType: text("search_type").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  links: many(links),
  searches: many(recentSearches),
}));

export const linksRelations = relations(links, ({ one, many }) => ({
  user: one(users, {
    fields: [links.userId],
    references: [users.id],
  }),
  clicks: many(clicks),
}));

// Schemas for insert operations
export const insertUserSchema = createInsertSchema(users)
  .pick({
    username: true,
    password: true,
    email: true,
    preferences: true,
  })
  .extend({
    email: z.string().email("Invalid email").optional(),
  });

export const insertLinkSchema = createInsertSchema(links)
  .pick({
    originalUrl: true,
    hasPassword: true,
    password: true,
    isPublished: true,
    customDomain: true,
    category: true,
  })
  .extend({
    originalUrl: z.string().url("Please enter a valid URL"),
    password: z.union([
      z.string().min(6, "Password must be at least 6 characters"),
      z.string().length(0),
      z.undefined()
    ]).optional(),
    customDomain: z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/, {
      message: "Please enter a valid domain name",
    }).optional(),
    category: z.string().optional(),
  });

export const insertClickSchema = createInsertSchema(clicks).pick({
  linkId: true,
  userAgent: true,
  ipAddress: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertLink = z.infer<typeof insertLinkSchema>;
export type InsertClick = z.infer<typeof insertClickSchema>;
export type User = typeof users.$inferSelect;
export type Link = typeof links.$inferSelect;
export type Click = typeof clicks.$inferSelect;
export type RecentSearch = typeof recentSearches.$inferSelect;