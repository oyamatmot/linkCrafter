import { OpenAI } from "openai";
import { storage } from "../storage";
import { InsertLink } from "@shared/schema";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export class AIService {
  private static instance: AIService;
  private aiUserId: number | null = null;

  private constructor() {}

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async initialize() {
    const aiUser = await storage.getUserByUsername("AI_Assistant");
    if (aiUser) {
      this.aiUserId = aiUser.id;
    }
  }

  async generateAndCreateLink(topic: string): Promise<void> {
    if (!this.aiUserId) {
      throw new Error("AI user not initialized");
    }

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that finds interesting content to share."
          },
          {
            role: "user",
            content: `Find a high-quality web resource about ${topic} and provide the URL.`
          }
        ]
      });

      const url = completion.choices[0].message.content?.match(/https?:\/\/[^\s]+/)?.[0];
      
      if (url) {
        await storage.createLink({
          userId: this.aiUserId,
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
    if (!this.aiUserId) {
      throw new Error("AI user not initialized");
    }

    const publicLinks = await storage.getAllLinks();
    
    // Randomly click some public links
    for (const link of publicLinks) {
      if (Math.random() < 0.3) { // 30% chance to click each link
        await storage.createClick({
          linkId: link.id,
          userAgent: "AI Assistant Bot",
          ipAddress: "127.0.0.1"
        });
      }
    }
  }
}

export const aiService = AIService.getInstance();
