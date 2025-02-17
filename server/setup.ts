
import { storage } from "./storage";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { faker } from "@faker-js/faker";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

const AI_USERS = [
  { 
    username: "TechGuru_AI",
    password: "ai_secure_pass_1",
    strategy: "technology",
    domains: ["github.com", "stackoverflow.com", "dev.to", "medium.com"]
  },
  { 
    username: "BusinessPro_AI",
    password: "ai_secure_pass_2",
    strategy: "business",
    domains: ["linkedin.com", "forbes.com", "harvard.edu", "wsj.com"]
  },
  { 
    username: "EduMaster_AI",
    password: "ai_secure_pass_3",
    strategy: "education",
    domains: ["coursera.org", "udemy.com", "edx.org", "khan-academy.org"]
  },
  { 
    username: "SocialInfluencer_AI",
    password: "ai_secure_pass_4",
    strategy: "social",
    domains: ["instagram.com", "tiktok.com", "youtube.com", "twitter.com"]
  },
  { 
    username: "ContentWizard_AI",
    password: "ai_secure_pass_5",
    strategy: "content",
    domains: ["wordpress.com", "medium.com", "substack.com", "ghost.org"]
  }
];

const CATEGORIES = ["Technology", "Business", "Education", "Social Media", "Content Creation"];

export async function setupAiUsers() {
  console.log("Setting up professional AI users...");

  for (const aiUser of AI_USERS) {
    const existingUser = await storage.getUserByUsername(aiUser.username);
    if (!existingUser) {
      const user = await storage.createUser({
        username: aiUser.username,
        password: await hashPassword(aiUser.password),
        email: `${aiUser.username.toLowerCase()}@ai.example.com`,
        preferences: {
          darkMode: true,
          notifications: true,
          smartSearch: true,
          selfMonitoring: true,
          defaultCustomDomain: aiUser.domains[0]
        },
      });

      // Create 15-20 strategic links for each AI user
      const numLinks = Math.floor(Math.random() * 6) + 15;
      for (let i = 0; i < numLinks; i++) {
        const domain = aiUser.domains[Math.floor(Math.random() * aiUser.domains.length)];
        const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
        const hasPassword = Math.random() > 0.7;
        const isPublished = Math.random() > 0.1; // 90% published rate

        await storage.createLink({
          userId: user.id,
          originalUrl: `https://${domain}/${faker.helpers.slugify(faker.lorem.words(3))}`,
          hasPassword,
          password: hasPassword ? `${aiUser.strategy}_protected_${Math.random().toString(36).slice(2)}` : undefined,
          isPublished,
          category,
          customDomain: Math.random() > 0.5 ? `${aiUser.strategy}-${Math.random().toString(36).slice(2)}.${domain}` : undefined,
        });

        // Simulate clicks (more for published links)
        if (isPublished) {
          const clickCount = Math.floor(Math.random() * 100) + 50;
          for (let j = 0; j < clickCount; j++) {
            await storage.createClick({
              linkId: (await storage.getUserLinks(user.id)).slice(-1)[0].id,
              userAgent: faker.internet.userAgent(),
              ipAddress: faker.internet.ip(),
            });
          }
        }
      }

      console.log(`Created professional AI user ${aiUser.username} with ${numLinks} strategic links`);
    }
  }
}

// Run the setup if this file is executed directly
setupAiUsers().catch(console.error);
