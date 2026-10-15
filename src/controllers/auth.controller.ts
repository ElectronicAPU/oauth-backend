import express from "express";
import type { Request, Response } from "express";
import { db } from "../db/index.ts";
import { users } from "../db/schema/users.ts";
import jwt from "jsonwebtoken";
import { eq, ne, or } from "drizzle-orm";
import bcrypt from "bcrypt";
import { sendError, sendSuccess } from "../utils/response.ts";
import type { SigninInput, SignupInput } from "../validators/auth.validator.ts";

export const createNewUser = async (req: Request, res: Response) => {
  const { name, userName, email, password } = req.body as SignupInput;

  const [existing] = await db
    .select()
    .from(users)
    .where(or(eq(users.email, email), eq(users.userName, userName)));

  if (existing) {
    const message =
      existing.email === email
        ? "Email already taken."
        : "User name already taken.";
    return sendError(res, message, 409);
  }

  const userData = { name, userName, email, password };

  const passwordHash = await bcrypt.hash(password, 10);

  const [newUser] = await db
    .insert(users)
    .values({ ...userData, password: passwordHash })
    .returning();

  if (!newUser) return sendError(res, "Failed to create user.", 500);

  const { password: storedPassword, ...data } = newUser;

  return sendSuccess(res, data, "New user created.", 201);
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body as SigninInput;

  const [user] = await db.select().from(users).where(eq(users.email, email))

  if (!user) return sendError(res, "Invalid credentials.", 401);

  const isMatch = await bcrypt.compare(password, user.password)

  if (!isMatch) return sendError(res, "Invalid credentials.", 401);

  const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: "30d" });

  const {password: storedPass, ...data } = user

  const newData = {
    ...data,
    token
  }

  return sendSuccess(res, newData, "login successfull.");
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
    return sendError(res, "No fields provided to udpate.", 400);
  }

  if (userName) {
    const [taken] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.userName, userName))
      .limit(1);

    if (taken && taken.id !== userId)
      return sendError(res, "User name already taken.", 409);
  }

  const udpateUsers = await db.update(users).set(updateData).where(eq(users.id, userId)).returning({name: users.name, userName: users.userName})

  if (udpateUsers.length === 0) {
    return sendError(res, "User not found.", 404);
  }

  return sendSuccess(res, udpateUsers[0], "User updated successfully.");
}


export const getAllUsers = async (req: Request, res: Response) => {

  const role = res.locals.role

  if (role !== "admin") return sendError(res, "Can't access this API.", 403);

  const allUsers = await db.select().from(users).where(ne(users.role, role))

  const clearUsers = allUsers.map(({password, ...rest}) => rest)

  return sendSuccess(res, clearUsers, "Users fetched.");
}

export const deleteUser = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) return sendError(res, "Invalid id.", 400);

  if (id === res.locals.userId)
    return sendError(res, "You can't delete your own account.", 400);

  const [deleted] = await db
    .delete(users)
    .where(eq(users.id, id))
    .returning({ id: users.id });

  if (!deleted) return sendError(res, "User not found.", 404);

  return sendSuccess(res, null, "User deleted");
};
