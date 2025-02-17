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
    const aiUsernames = [
      { username: "AI_Assistant", specialization: "general" },
      { username: "AI_TechNews", specialization: "technology" },
      { username: "AI_ScienceHub", specialization: "science" },
      { username: "AI_DevTips", specialization: "programming" },
      { username: "AI_AINews", specialization: "artificial intelligence" }
    ];

    for (const { username, specialization } of aiUsernames) {
      const user = await storage.getUserByUsername(username);
      if (user) {
        this.aiUsers.push({ id: user.id, username, specialization });
      }
    }

    if (this.aiUsers.length === 0) {
      throw new Error("No AI users found");
    }
  }

  async generateAndCreateLink(topic: string): Promise<void> {
    if (this.aiUsers.length === 0) {
      throw new Error("AI users not initialized");
    }

    // Pick a relevant AI user based on topic
    const relevantUser = this.aiUsers.find(user => 
      topic.toLowerCase().includes(user.specialization) || 
      user.specialization === "general"
    ) || this.aiUsers[0];

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are an AI assistant specialized in ${relevantUser.specialization}, finding high-quality content to share.`
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
          userId: relevantUser.id,
          originalUrl: url,
          hasPassword: false,
          isPublished: true,
          category: topic,
        } as InsertLink & { userId: number });
      }
    } catch (error) {
      console.error("Error generating AI link:", error);
    }
  }

  async clickRandomPublicLinks(): Promise<void> {
    if (this.aiUsers.length === 0) {
      throw new Error("AI users not initialized");
    }

    const publicLinks = await storage.getAllLinks();

    // Each AI user has a chance to click links
    for (const aiUser of this.aiUsers) {
      for (const link of publicLinks) {
        if (Math.random() < 0.2) { // 20% chance per AI user to click each link
          await storage.createClick({
            linkId: link.id,
            userAgent: `${aiUser.username} Bot`,
            ipAddress: "127.0.0.1"
          });
        }
      }
    }
  }
}

export const aiService = AIService.getInstance();