import { OpenAI } from "openai";
import { storage } from "../storage";
import { InsertLink, User } from "@shared/schema";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface AIUser {
  id: number;
  username: string;
  specialization: string;
}

export class AIService {
  private static instance: AIService;
  private aiUsers: AIUser[] = [];
  private defaultLinks = [
    { title: "Introduction to Web Development", url: "https://developer.mozilla.org/en-US/docs/Learn", category: "programming" },
    { title: "Latest in AI Technology", url: "https://arxiv.org/list/cs.AI/recent", category: "artificial intelligence" },
    { title: "Science Daily News", url: "https://www.sciencedaily.com/", category: "science" },
    { title: "Tech News and Analysis", url: "https://techcrunch.com/", category: "technology" },
    { title: "Web Development Best Practices", url: "https://web.dev/", category: "web development" }
  ];

  private constructor() {}

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async initialize() {
    // Create AI users if they don't exist
    const aiUsernames = [
      { username: "AI_Assistant", specialization: "general" },
      { username: "AI_TechNews", specialization: "technology" },
      { username: "AI_ScienceHub", specialization: "science" },
      { username: "AI_DevTips", specialization: "programming" },
      { username: "AI_AINews", specialization: "artificial intelligence" }
    ];

    for (const { username, specialization } of aiUsernames) {
      let user = await storage.getUserByUsername(username);
      if (!user) {
        // Create AI user if it doesn't exist
        user = await storage.createUser({
          username,
          password: Math.random().toString(36),
          isAI: true,
          role: "ai",
          preferences: {
            darkMode: false,
            notifications: false,
            smartSearch: true,
            selfMonitoring: false,
            useDefaultCustomDomain: false,
          }
        });
      }
      this.aiUsers.push({ id: user.id, username, specialization });
    }

    if (this.aiUsers.length === 0) {
      throw new Error("Failed to initialize AI users");
    }

    // Create initial set of links
    await this.generateInitialLinks();

    // Start periodic tasks
    setInterval(() => this.generateAndCreateLink(), 300000); // Every 5 minutes
    setInterval(() => this.clickRandomPublicLinks(), 180000); // Every 3 minutes
  }

  private async generateInitialLinks() {
    for (const link of this.defaultLinks) {
      const aiUser = this.aiUsers.find(user => 
        user.specialization === link.category || 
        user.specialization === "general"
      ) || this.aiUsers[0];

      try {
        await storage.createLink({
          userId: aiUser.id,
          originalUrl: link.url,
          hasPassword: false,
          isPublished: true,
          category: link.category,
        } as InsertLink & { userId: number });

        console.log(`AI user ${aiUser.username} created initial link: ${link.title}`);
      } catch (error) {
        console.error("Error creating initial link:", error);
      }
    }
  }

  async generateAndCreateLink(): Promise<void> {
    if (this.aiUsers.length === 0) {
      throw new Error("AI users not initialized");
    }

    const aiUser = this.aiUsers[Math.floor(Math.random() * this.aiUsers.length)];
    const randomLink = this.defaultLinks[Math.floor(Math.random() * this.defaultLinks.length)];

    try {
      await storage.createLink({
        userId: aiUser.id,
        originalUrl: randomLink.url,
        hasPassword: false,
        isPublished: true,
        category: randomLink.category,
      } as InsertLink & { userId: number });

      console.log(`AI user ${aiUser.username} created a new link about ${randomLink.category}`);
    } catch (error) {
      console.error("Error generating AI link:", error);
    }
  }

  async clickRandomPublicLinks(): Promise<void> {
    if (this.aiUsers.length === 0) {
      throw new Error("AI users not initialized");
    }

    try {
      const publicLinks = await storage.getAllLinks();
      const aiUser = this.aiUsers[Math.floor(Math.random() * this.aiUsers.length)];

      for (const link of publicLinks) {
        if (Math.random() < 0.3) { // 30% chance to click each link
          await storage.createClick({
            linkId: link.id,
            userAgent: `${aiUser.username} Bot`,
            ipAddress: "127.0.0.1"
          });
          console.log(`AI user ${aiUser.username} clicked link ${link.id}`);
        }
      }
    } catch (error) {
      console.error("Error in AI link interaction:", error);
    }
  }
}

export const aiService = AIService.getInstance();