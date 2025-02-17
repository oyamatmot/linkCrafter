import { User, InsertUser, Link, InsertLink, Click, InsertClick, users, links, clicks, recentSearches, teams, badges, userBadges, teamInvites, Team, InsertTeam, Badge, InsertBadge } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User Management
  getAllUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPreferences(userId: number, preferences: any): Promise<User>;
  updateUserRole(userId: number, role: string): Promise<User>;

  // Team Management
  createTeam(team: InsertTeam): Promise<Team>;
  getTeam(id: number): Promise<Team | undefined>;
  getTeamMembers(teamId: number): Promise<User[]>;
  addTeamMember(teamId: number, userId: number): Promise<void>;
  removeTeamMember(teamId: number, userId: number): Promise<void>;
  getTeamInvites(teamId: number): Promise<any[]>;
  createTeamInvite(teamId: number, email: string, invitedById: number): Promise<void>;
  updateTeamInviteStatus(inviteId: number, status: string): Promise<void>;

  // Badge Management
  createBadge(badge: InsertBadge): Promise<Badge>;
  getBadge(id: number): Promise<Badge | undefined>;
  getUserBadges(userId: number): Promise<Badge[]>;
  awardBadge(userId: number, badgeId: number): Promise<void>;

  // Link Management
  getAllLinks(): Promise<Link[]>;
  createLink(link: InsertLink & { userId: number }): Promise<Link>;
  getLink(id: number): Promise<Link | undefined>;
  getLinkByShortCode(shortCode: string): Promise<Link | undefined>;
  getLinkByCustomDomain(customDomain: string): Promise<Link | undefined>;
  getUserLinks(userId: number): Promise<Link[]>;
  getTeamLinks(teamId: number): Promise<Link[]>;
  updateLink(id: number, link: Partial<InsertLink>): Promise<Link>;
  deleteLink(id: number): Promise<void>;

  // Click/Analytics Management
  createClick(click: InsertClick): Promise<Click>;
  getLinkClicks(linkId: number): Promise<Click[]>;

  // Search Management
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

  // User Management
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

  async updateUserRole(userId: number, role: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ role })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Team Management
  async createTeam(team: InsertTeam): Promise<Team> {
    const [newTeam] = await db.insert(teams).values(team).returning();
    return newTeam;
  }

  async getTeam(id: number): Promise<Team | undefined> {
    const [team] = await db.select().from(teams).where(eq(teams.id, id));
    return team;
  }

  async getTeamMembers(teamId: number): Promise<User[]> {
    return await db.select().from(users).where(eq(users.teamId, teamId));
  }

  async addTeamMember(teamId: number, userId: number): Promise<void> {
    await db.update(users).set({ teamId }).where(eq(users.id, userId));
  }

  async removeTeamMember(teamId: number, userId: number): Promise<void> {
    await db.update(users).set({ teamId: null }).where(and(eq(users.id, userId), eq(users.teamId, teamId)));
  }

  async getTeamInvites(teamId: number): Promise<any[]> {
    return await db.select().from(teamInvites).where(eq(teamInvites.teamId, teamId));
  }

  async createTeamInvite(teamId: number, email: string, invitedById: number): Promise<void> {
    await db.insert(teamInvites).values({ teamId, invitedEmail: email, invitedById });
  }

  async updateTeamInviteStatus(inviteId: number, status: string): Promise<void> {
    await db.update(teamInvites).set({ status }).where(eq(teamInvites.id, inviteId));
  }

  // Badge Management
  async createBadge(badge: InsertBadge): Promise<Badge> {
    const [newBadge] = await db.insert(badges).values(badge).returning();
    return newBadge;
  }

  async getBadge(id: number): Promise<Badge | undefined> {
    const [badge] = await db.select().from(badges).where(eq(badges.id, id));
    return badge;
  }

  async getUserBadges(userId: number): Promise<Badge[]> {
    const userBadgeRecords = await db
      .select()
      .from(userBadges)
      .where(eq(userBadges.userId, userId))
      .leftJoin(badges, eq(badges.id, userBadges.badgeId));
    return userBadgeRecords.map(record => record.badges);
  }

  async awardBadge(userId: number, badgeId: number): Promise<void> {
    await db.insert(userBadges).values({ userId, badgeId });
  }

  // Link Management
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

  async getTeamLinks(teamId: number): Promise<Link[]> {
    return await db
      .select()
      .from(links)
      .where(eq(links.teamId, teamId))
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

  // Click Management
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

  // Search Management
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