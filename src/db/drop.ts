import { sql } from "drizzle-orm";
import { db } from "./index.ts";
import path from "path";
import fs from "fs";

export const dropAll = async () => {
  try {
    console.log("Wipping all PostgreSQL table and schemas...");
    await db.execute(sql`DROP SCHEMA public CASCADE`);
    await db.execute(sql`CREATE SCHEMA public`);
    console.log("Database dropped!!!");

    const migrationPath = path.join(process.cwd(), "drizzle");
    if (fs.existsSync(migrationPath)) {
      console.log("Removeing drizzle files...");
      fs.rmSync(migrationPath, { recursive: true, force: true });
      console.log("drizzle folder Deleted!");
    }

    process.exit(0);
  } catch (error) {
    console.error("Failed to drop database", error);
    process.exit(-1);
  }
};

dropAll();
