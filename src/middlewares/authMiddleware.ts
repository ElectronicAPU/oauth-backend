import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { users } from "../db/schema/users.ts";
import { db } from "../db/index.ts";
import { eq } from "drizzle-orm";

type Role = (typeof users.$inferSelect)["role"]

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ success: false, message: "Not authenticated." });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number, role: Role };
    res.locals.userId = payload.userId;
    res.locals.role = payload.role;
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired token." });
  }
};


export const requireRole = (...allowed: Role[]) => 
   (req: Request, res: Response, next: NextFunction) => {

    const userRole = res.locals.role

    if (!userRole) return res.status(401).json({success: false, message: "Not authenticated."})

    if (!allowed.includes(userRole)) {
      return res.status(403).json({success: false, message: "Forbidden."})
    }

    next()

  }