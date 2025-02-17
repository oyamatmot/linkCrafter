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
  { username: "LinkMaster_AI", password: "ai_secure_pass_1" },
  { username: "URLGenius_AI", password: "ai_secure_pass_2" },
  { username: "ShortLink_AI", password: "ai_secure_pass_3" },
  { username: "WebWizard_AI", password: "ai_secure_pass_4" },
  { username: "SharePro_AI", password: "ai_secure_pass_5" },
];

const CATEGORIES = ["Technology", "Social Media", "Education", "Entertainment", "Business"];

export async function setupAiUsers() {
  console.log("Setting up AI users...");

  for (const aiUser of AI_USERS) {
    const existingUser = await storage.getUserByUsername(aiUser.username);
    if (!existingUser) {
      const user = await storage.createUser({
        username: aiUser.username,
        password: await hashPassword(aiUser.password),
        email: `${aiUser.username.toLowerCase()}@ai.example.com`,
        preferences: {
          darkMode: Math.random() > 0.5,
          notifications: true,
          smartSearch: true,
          selfMonitoring: true,
        },
      });

      // Create 10-15 links for each AI user
      const numLinks = Math.floor(Math.random() * 6) + 10;
      for (let i = 0; i < numLinks; i++) {
        const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
        const hasPassword = Math.random() > 0.8;

        await storage.createLink({
          userId: user.id,
          originalUrl: faker.internet.url(),
          hasPassword,
          password: hasPassword ? "protected123" : undefined,
          isPublished: true,
          category,
          customDomain: Math.random() > 0.7 ? faker.internet.domainName() : undefined,
        });
      }

      console.log(`Created AI user ${aiUser.username} with ${numLinks} links`);
    }
  }
}

// Run the setup if this file is executed directly
setupAiUsers().catch(console.error);