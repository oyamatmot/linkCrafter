import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const links = pgTable("links", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  originalUrl: text("original_url").notNull(),
  shortCode: text("short_code").notNull().unique(),
  title: text("title"),
  password: text("password"),
  isPublished: boolean("is_published").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const clicks = pgTable("clicks", {
  id: serial("id").primaryKey(),
  linkId: integer("link_id").notNull().references(() => links.id),
  clickedAt: timestamp("clicked_at").defaultNow().notNull(),
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertLinkSchema = createInsertSchema(links)
  .pick({
    originalUrl: true,
    title: true,
    password: true,
    isPublished: true,
  })
  .extend({
    originalUrl: z.string().url(),
    title: z.string().min(1).max(100).optional(),
    password: z.string().min(6).max(100).optional(),
  });

export const insertClickSchema = createInsertSchema(clicks).pick({
  linkId: true,
  userAgent: true,
  ipAddress: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertLink = z.infer<typeof insertLinkSchema>;
export type InsertClick = z.infer<typeof insertClickSchema>;
export type User = typeof users.$inferSelect;
export type Link = typeof links.$inferSelect;
export type Click = typeof clicks.$inferSelect;