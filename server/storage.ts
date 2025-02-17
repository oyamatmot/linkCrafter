import { User, InsertUser, Link, InsertLink, Click, InsertClick, users, links, clicks, recentSearches } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getAllUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPreferences(userId: number, preferences: any): Promise<User>;

  getAllLinks(): Promise<Link[]>;
  createLink(link: InsertLink & { userId: number }): Promise<Link>;
  getLink(id: number): Promise<Link | undefined>;
  getLinkByShortCode(shortCode: string): Promise<Link | undefined>;
  getLinkByCustomDomain(customDomain: string): Promise<Link | undefined>;
  getUserLinks(userId: number): Promise<Link[]>;
  updateLink(id: number, link: Partial<InsertLink>): Promise<Link>;
  deleteLink(id: number): Promise<void>;

  createClick(click: InsertClick): Promise<Click>;
  getLinkClicks(linkId: number): Promise<Click[]>;

  addRecentSearch(userId: number, query: string, searchType: string): Promise<void>;
  getRecentSearches(userId: number): Promise<string[]>;

  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  readonly sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserPreferences(userId: number, preferences: any): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ preferences })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async getAllLinks(): Promise<Link[]> {
    return await db.select().from(links).orderBy(desc(links.createdAt));
  }

  async createLink(link: InsertLink & { userId: number }): Promise<Link> {
    const shortCode = nanoid(8);
    const [newLink] = await db
      .insert(links)
      .values({ ...link, shortCode })
      .returning();
    return newLink;
  }

  async getLink(id: number): Promise<Link | undefined> {
    const [link] = await db.select().from(links).where(eq(links.id, id));
    return link;
  }

  async getLinkByShortCode(shortCode: string): Promise<Link | undefined> {
    const [link] = await db.select().from(links).where(eq(links.shortCode, shortCode));
    return link;
  }

  async getLinkByCustomDomain(customDomain: string): Promise<Link | undefined> {
    const [link] = await db.select().from(links).where(eq(links.customDomain, customDomain));
    return link;
  }

  async getUserLinks(userId: number): Promise<Link[]> {
    return await db
      .select()
      .from(links)
      .where(eq(links.userId, userId))
      .orderBy(desc(links.createdAt));
  }

  async updateLink(id: number, link: Partial<InsertLink>): Promise<Link> {
    const [updatedLink] = await db
      .update(links)
      .set(link)
      .where(eq(links.id, id))
      .returning();
    return updatedLink;
  }

  async deleteLink(id: number): Promise<void> {
    await db.delete(links).where(eq(links.id, id));
  }

  async createClick(click: InsertClick): Promise<Click> {
    const [newClick] = await db.insert(clicks).values(click).returning();
    return newClick;
  }

  async getLinkClicks(linkId: number): Promise<Click[]> {
    return await db
      .select()
      .from(clicks)
      .where(eq(clicks.linkId, linkId))
      .orderBy(desc(clicks.clickedAt));
  }

  async addRecentSearch(userId: number, query: string, searchType: string): Promise<void> {
    await db.insert(recentSearches).values({ userId, query, searchType });
  }

  async getRecentSearches(userId: number): Promise<string[]> {
    const searches = await db
      .select()
      .from(recentSearches)
      .where(eq(recentSearches.userId, userId))
      .orderBy(desc(recentSearches.createdAt))
      .limit(5);
    return searches.map(s => s.query);
  }
}

export const storage = new DatabaseStorage();