import { GoogleGenerativeAI } from "@google/generative-ai";
import { storage } from "../storage";
import { InsertLink, User } from "@shared/schema";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

interface AIUser {
  id: number;
  username: string;
  specialization: string;
}

export class AIService {
  private static instance: AIService;
  private aiUsers: AIUser[] = [];
  private targetUsername = "Mot Oyamat";
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
    const aiUsernames = [
      { username: "AI_Assistant", specialization: "general" },
      { username: "AI_TechNews", specialization: "technology" },
      { username: "AI_ScienceHub", specialization: "science" },
      { username: "AI_DevTips", specialization: "programming" },
      { username: "AI_AINews", specialization: "artificial intelligence" },
      { username: "AI_Supporter1", specialization: "general" },
      { username: "AI_Supporter2", specialization: "technology" },
      { username: "AI_Supporter3", specialization: "science" },
      { username: "AI_Supporter4", specialization: "programming" },
      { username: "AI_Supporter5", specialization: "artificial intelligence" }
    ];

    for (const { username, specialization } of aiUsernames) {
      let user = await storage.getUserByUsername(username);
      if (!user) {
        user = await storage.createUser({
          username,
          password: Math.random().toString(36),
          isAI: true,
          role: "ai",
          preferences: {
            darkMode: true,
            notifications: true,
            smartSearch: true,
            selfMonitoring: true,
            useDefaultCustomDomain: false,
          }
        });

        // Create initial links for AI supporter bots
        if (username.startsWith('AI_Supporter')) {
          const supporterLinks = [
            { title: "Tech Blog", url: "https://techcrunch.com", category: "technology" },
            { title: "Dev Resources", url: "https://dev.to", category: "programming" },
            { title: "AI News", url: "https://ai.google.dev", category: "artificial intelligence" }
          ];

          for (const link of supporterLinks) {
            await storage.createLink({
              userId: user.id,
              originalUrl: link.url,
              hasPassword: false,
              isPublished: true,
              category: link.category,
            } as InsertLink & { userId: number });
          }
        }
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
    const topics = ["technology", "science", "programming", "web development", "artificial intelligence"];
    const topic = topics[Math.floor(Math.random() * topics.length)];

    try {
      const prompt = `Find a high-quality web resource about ${topic}. Respond with a URL to a reputable website in this format: "URL: [the url]". The URL should be from a well-known tech or educational website.`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();
      const url = response.match(/URL: (https?:\/\/[^\s]+)/)?.[1];

      if (url) {
        await storage.createLink({
          userId: aiUser.id,
          originalUrl: url,
          hasPassword: false,
          isPublished: true,
          category: topic,
        } as InsertLink & { userId: number });

        console.log(`AI user ${aiUser.username} created a new link about ${topic}`);
      }
    } catch (error) {
      console.error("Error generating AI link:", error);
      // Fallback to default links if API fails
      const randomLink = this.defaultLinks[Math.floor(Math.random() * this.defaultLinks.length)];
      await storage.createLink({
        userId: aiUser.id,
        originalUrl: randomLink.url,
        hasPassword: false,
        isPublished: true,
        category: randomLink.category,
      } as InsertLink & { userId: number });
    }
  }

  async boostLinkClicks(linkId: number, targetClicks: number): Promise<void> {
    const link = await storage.getLinkById(linkId);
    if (!link) return;

    const currentClicks = await storage.getLinkClicks(linkId);
    const remainingClicks = targetClicks - currentClicks.length;

    if (remainingClicks <= 0) return;

    for (let i = 0; i < remainingClicks; i++) {
      const aiUser = this.aiUsers[Math.floor(Math.random() * this.aiUsers.length)];
      await storage.createClick({
        linkId: link.id,
        userAgent: `${aiUser.username} Bot`,
        ipAddress: "127.0.0.1"
      });
      
      // Add small delay between clicks
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  async clickRandomPublicLinks(): Promise<void> {
    if (this.aiUsers.length === 0) {
      throw new Error("AI users not initialized");
    }

    try {
      const publicLinks = await storage.getAllLinks();
      const targetUser = await storage.getUserByUsername(this.targetUsername);
      const aiUser = this.aiUsers[Math.floor(Math.random() * this.aiUsers.length)];

      for (const link of publicLinks) {
        const isTargetUserLink = targetUser && link.userId === targetUser.id;
        const clickChance = isTargetUserLink ? 1.0 : 0.1; // 100% chance for target user, 10% for others

        if (Math.random() < clickChance) {
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