import express from "express";
import type { Request, Response } from "express";
import { db } from "../db/index.ts";
import { users } from "../db/schema/users.ts";
import jwt from "jsonwebtoken";
import { eq, or } from "drizzle-orm";
import bcrypt from "bcrypt";

export const createNewUser = async (req: Request, res: Response) => {
  const { name, userName, email, password } = req.body;

  if (!name)
    return res
      .status(400)
      .json({ success: false, message: "name is required." });
  if (!userName)
    return res
      .status(400)
      .json({ success: false, message: "userName is required." });
  if (!email)
    return res
      .status(400)
      .json({ success: false, message: "email is required." });
  if (!password)
    return res
      .status(400)
      .json({ success: false, message: "password is required." });

  const [existing] = await db
    .select()
    .from(users)
    .where(or(eq(users.email, email), eq(users.userName, userName)));

  if (existing) {
    const message =
      existing.email === email
        ? "Email already taken."
        : "User name already taken.";
    return res.status(409).json({ success: false, message });
  }

  const userData = { name, userName, email, password };

  const passwordHash = await bcrypt.hash(password, 8);

  const [newUser] = await db
    .insert(users)
    .values({ ...userData, password: passwordHash })
    .returning();

  if (!newUser)
    return res
      .status(500)
      .json({ success: false, message: "Failed to create user." });

  const { password: storedPassword, ...data } = newUser;

  return res
    .status(201)
    .json({ success: true, message: "New user created.", data: data });
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email) return res.status(400).json({ success: false, message: "Email are required." });
  if (!password) return res.status(400).json({ success: false, message: "Password are requried." });

  const [user] = await db.select().from(users).where(eq(users.email, email))

  if (!user) return res.status(409).json({success: false, message: "Invalid credentials."})

  const isMatch = await bcrypt.compare(password, user.password)

  if (!isMatch) return res.status(409).json({success: false, message: "Incorrect password."})

    const token = jwt.sign({name: user.name, email: user.email}, process.env.JWT_SECRET as string, {
        expiresIn: "30d"
    })

    const {password: storedPass, ...data } = user

    const newData = {
       ...data,
       token
    }

   return  res.status(201).json({success: true, message:"login successfull.", data: newData})

};


export const editUser = async (req: Request, res:Response) => {

    const {id} = req.params
    const {name, userName, password} = req.body

}