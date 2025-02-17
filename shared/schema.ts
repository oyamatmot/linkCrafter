import { pgTable, text, serial, integer, timestamp, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Existing tables
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  isAI: boolean("is_ai").default(false),
  role: text("role").default("member").notNull(), // New: user role
  teamId: integer("team_id"), // New: team association
  preferences: json("preferences").$type<{
    darkMode: boolean;
    notifications: boolean;
    smartSearch: boolean;
    selfMonitoring: boolean;
    defaultCustomDomain?: string;
    useDefaultCustomDomain: boolean;
  }>().default({
    darkMode: false,
    notifications: false,
    smartSearch: true,
    selfMonitoring: true,
    useDefaultCustomDomain: false,
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// New: Teams table
export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  ownerId: integer("owner_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// New: Team invites
export const teamInvites = pgTable("team_invites", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").notNull().references(() => teams.id),
  invitedEmail: text("invited_email").notNull(),
  invitedById: integer("invited_by_id").notNull().references(() => users.id),
  status: text("status").default("pending").notNull(), // pending, accepted, rejected
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// New: Badges table
export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  criteria: json("criteria").$type<{
    type: "clicks" | "links" | "streak";
    threshold: number;
  }>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// New: User badges
export const userBadges = pgTable("user_badges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  badgeId: integer("badge_id").notNull().references(() => badges.id),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
});

// Existing tables
export const links = pgTable("links", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  teamId: integer("team_id").references(() => teams.id), // New: team association
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

// Existing tables
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
export const usersRelations = relations(users, ({ many, one }) => ({
  links: many(links),
  searches: many(recentSearches),
  team: one(teams, {
    fields: [users.teamId],
    references: [teams.id],
  }),
  badges: many(userBadges),
}));

export const teamsRelations = relations(teams, ({ many, one }) => ({
  members: many(users),
  links: many(links),
  invites: many(teamInvites),
  owner: one(users, {
    fields: [teams.ownerId],
    references: [users.id],
  }),
}));

export const linksRelations = relations(links, ({ one, many }) => ({
  user: one(users, {
    fields: [links.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [links.teamId],
    references: [teams.id],
  }),
  clicks: many(clicks),
}));

export const badgesRelations = relations(badges, ({ many }) => ({
  users: many(userBadges),
}));

// Schemas for insert operations
export const insertUserSchema = createInsertSchema(users)
  .pick({
    username: true,
    password: true,
    email: true,
    preferences: true,
    isAI: true,
    role: true,
    teamId: true,
  })
  .extend({
    email: z.string().email("Invalid email").optional(),
  });

export const insertTeamSchema = createInsertSchema(teams).pick({
  name: true,
  ownerId: true,
});

export const insertBadgeSchema = createInsertSchema(badges);

export const insertLinkSchema = createInsertSchema(links)
  .pick({
    originalUrl: true,
    hasPassword: true,
    password: true,
    isPublished: true,
    customDomain: true,
    category: true,
    teamId: true,
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
    teamId: z.number().optional(),
  });

export const insertClickSchema = createInsertSchema(clicks).pick({
  linkId: true,
  userAgent: true,
  ipAddress: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type InsertBadge = z.infer<typeof insertBadgeSchema>;
export type InsertLink = z.infer<typeof insertLinkSchema>;
export type InsertClick = z.infer<typeof insertClickSchema>;
export type User = typeof users.$inferSelect;
export type Team = typeof teams.$inferSelect;
export type Badge = typeof badges.$inferSelect;
export type Link = typeof links.$inferSelect;
export type Click = typeof clicks.$inferSelect;
export type RecentSearch = typeof recentSearches.$inferSelect;