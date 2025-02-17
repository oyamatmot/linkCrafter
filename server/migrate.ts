import { db } from "./db";
import { users, links, clicks, recentSearches } from "@shared/schema";

async function migrate() {
  console.log("Creating database tables...");

  try {
    await db.schema
      .createTable(users)
      .execute();

    await db.schema
      .createTable(links)
      .execute();

    await db.schema
      .createTable(clicks)
      .execute();

    await db.schema
      .createTable(recentSearches)
      .execute();

    console.log("✅ Database tables created successfully");
  } catch (error) {
    console.error("❌ Error creating database tables:", error);
    process.exit(1);
  }
}

migrate().catch(console.error);