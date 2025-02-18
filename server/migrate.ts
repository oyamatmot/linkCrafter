import { migrate } from "drizzle-orm/neon-serverless/migrator";
import { db } from "./db";

async function runMigration() {
  console.log("Creating database tables...");

  try {
    await migrate(db, {
      migrationsFolder: './migrations',
    });

    console.log("✅ Database tables created successfully");
  } catch (error) {
    console.error("❌ Error creating database tables:", error);
    process.exit(1);
  }
}

runMigration().catch(console.error);