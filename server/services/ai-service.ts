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

    // Start periodic tasks
    setInterval(() => this.generateAndCreateLink(), 300000); // Every 5 minutes
    setInterval(() => this.clickRandomPublicLinks(), 180000); // Every 3 minutes
  }

  async generateAndCreateLink(): Promise<void> {
    if (this.aiUsers.length === 0) {
      throw new Error("AI users not initialized");
    }

    // Pick a random AI user
    const aiUser = this.aiUsers[Math.floor(Math.random() * this.aiUsers.length)];

    try {
      const topics = ["technology", "science", "programming", "web development", "artificial intelligence"];
      const topic = topics[Math.floor(Math.random() * topics.length)];

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are an AI assistant specialized in ${aiUser.specialization}, finding high-quality content to share.`
          },
          {
            role: "user",
            content: `Find a high-quality web resource about ${topic} and provide the URL with a brief description.`
          }
        ]
      });

      const response = completion.choices[0].message.content;
      const url = response?.match(/https?:\/\/[^\s]+/)?.[0];

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