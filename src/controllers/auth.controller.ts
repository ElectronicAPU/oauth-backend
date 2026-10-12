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

  const passwordHash = await bcrypt.hash(password, 10);

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

  if (!user) return res.status(401).json({success: false, message: "Invalid credentials."})

  const isMatch = await bcrypt.compare(password, user.password)

  if (!isMatch) return res.status(401).json({success: false, message: "Invalid credentials."})

const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, { expiresIn: "30d" });


    const {password: storedPass, ...data } = user

    const newData = {
       ...data,
       token
    }

   return  res.status(200).json({success: true, message:"login successfull.", data: newData})

};


export const editUser = async (req: Request, res:Response) => {

      const userId = res.locals.userId as number;
      const { name, userName, password } = req.body;

      const updateData: Record <string, any> = {}

      if(name) updateData.name = name
      if(userName) updateData.userName = userName

      if (password) {
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(password, salt);
      }

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          message: "No fields provided to udpate."
        })
      }

      if (userName) {
        const [taken] = await db
          .select({ id: users.id })
          .from(users)
          .where(eq(users.userName, userName))
          .limit(1);

      if (taken && taken.id !== userId)
        return res.status(409).json({ success: false, message: "User name already taken." });
      }


      const udpateUsers = await db.update(users).set(updateData).where(eq(users.id, userId)).returning({name: users.name, userName: users.userName})

      if (udpateUsers.length === 0) {
        return res.status(404).json({success: false, message: "User not found."})
      }

      return res.status(200).json({
        success: true,
        message: "User updated successfully.",
        data: udpateUsers[0]
      })


}