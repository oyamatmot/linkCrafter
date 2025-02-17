
import { db } from "./db";
import { users, links, clicks, recentSearches } from "@shared/schema";

async function migrate() {
  console.log("Creating database tables...");
  
  try {
    await db.execute`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        email TEXT,
        preferences JSONB DEFAULT '{"darkMode": false, "notifications": false, "smartSearch": true, "selfMonitoring": true}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      );

      CREATE TABLE IF NOT EXISTS links (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        original_url TEXT NOT NULL,
        short_code TEXT NOT NULL UNIQUE,
        custom_domain TEXT,
        has_password BOOLEAN DEFAULT false,
        password TEXT,
        is_published BOOLEAN DEFAULT true NOT NULL,
        category TEXT,
        clicks INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      );

      CREATE TABLE IF NOT EXISTS clicks (
        id SERIAL PRIMARY KEY,
        link_id INTEGER NOT NULL REFERENCES links(id),
        clicked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
        user_agent TEXT,
        ip_address TEXT
      );

      CREATE TABLE IF NOT EXISTS recent_searches (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        query TEXT NOT NULL,
        search_type TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `;
    
    console.log("✅ Database tables created successfully");
  } catch (error) {
    console.error("❌ Error creating database tables:", error);
    process.exit(1);
  }
}

migrate().catch(console.error);
