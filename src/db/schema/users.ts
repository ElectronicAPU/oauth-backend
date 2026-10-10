import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
};

export const users = pgTable("users", {
  id: integer("id").primaryKey().unique().notNull().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 100 }).notNull(),
  userName: varchar("username", { length: 120 }).unique().notNull(),
  email: varchar("email").notNull().unique(),
  ...timestamps,
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
