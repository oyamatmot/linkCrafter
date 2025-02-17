import { User, InsertUser, Link, InsertLink, Click, InsertClick } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { nanoid } from "nanoid";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getAllUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  createLink(link: InsertLink & { userId: number }): Promise<Link>;
  getLink(id: number): Promise<Link | undefined>;
  getLinkByShortCode(shortCode: string): Promise<Link | undefined>;
  getLinkByCustomDomain(customDomain: string): Promise<Link | undefined>;
  getUserLinks(userId: number): Promise<Link[]>;
  updateLink(id: number, link: Partial<InsertLink>): Promise<Link>;
  deleteLink(id: number): Promise<void>;

  createClick(click: InsertClick): Promise<Click>;
  getLinkClicks(linkId: number): Promise<Click[]>;

  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private links: Map<number, Link>;
  private clicks: Map<number, Click>;
  private currentId: { users: number; links: number; clicks: number };
  readonly sessionStore: session.Store;

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  constructor() {
    this.users = new Map();
    this.links = new Map();
    this.clicks = new Map();
    this.currentId = { users: 1, links: 1, clicks: 1 };
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.users++;
    const user = { id, ...insertUser };
    this.users.set(id, user);
    return user;
  }

  async createLink(link: InsertLink & { userId: number }): Promise<Link> {
    const id = this.currentId.links++;
    const shortCode = nanoid(8);
    const newLink = {
      id,
      shortCode,
      createdAt: new Date(),
      ...link,
    };
    this.links.set(id, newLink);
    return newLink;
  }

  async getLink(id: number): Promise<Link | undefined> {
    return this.links.get(id);
  }

  async getLinkByShortCode(shortCode: string): Promise<Link | undefined> {
    return Array.from(this.links.values()).find(
      (link) => link.shortCode === shortCode,
    );
  }

  async getLinkByCustomDomain(customDomain: string): Promise<Link | undefined> {
    return Array.from(this.links.values()).find(
      (link) => link.customDomain === customDomain,
    );
  }

  async getUserLinks(userId: number): Promise<Link[]> {
    return Array.from(this.links.values()).filter(
      (link) => link.userId === userId,
    );
  }

  async updateLink(id: number, link: Partial<InsertLink>): Promise<Link> {
    const existingLink = await this.getLink(id);
    if (!existingLink) throw new Error("Link not found");

    const updatedLink = { ...existingLink, ...link };
    this.links.set(id, updatedLink);
    return updatedLink;
  }

  async deleteLink(id: number): Promise<void> {
    this.links.delete(id);
  }

  async createClick(click: InsertClick): Promise<Click> {
    const id = this.currentId.clicks++;
    const newClick = {
      id,
      clickedAt: new Date(),
      ...click,
    };
    this.clicks.set(id, newClick);
    return newClick;
  }

  async getLinkClicks(linkId: number): Promise<Click[]> {
    return Array.from(this.clicks.values()).filter(
      (click) => click.linkId === linkId,
    );
  }
}

export const storage = new MemStorage();