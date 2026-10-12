import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { users } from "../db/schema/users.ts";
import { db } from "../db/index.ts";
import { eq } from "drizzle-orm";

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ success: false, message: "Not authenticated." });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number };
    res.locals.userId = payload.userId;
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired token." });
  }
};

type Role = (typeof users.$inferSelect)["role"]

export const requireRole = (...allowed: Role[]) => 
  async (req: Request, res: Response, next: NextFunction) => {

    const [user] = await db.select().from(users).where(eq(users.id, res.locals.userId)).limit(1)

    if (!user) return res.status(401).json({success: false, message: "Not authenticated."})

    if (!allowed.includes(user.role)) {
      return res.status(403).json({success: false, message: "Forbidden."})
    }

    res.locals.role = user.role
    next()

  }