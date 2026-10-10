import express from "express"
import type { Request, Response } from 'express';
import { db } from '../db/index.ts';
import { users } from '../db/schema/users.ts';
import jwt from 'jsonwebtoken';
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt"

export const createNewUser = async (req: Request, res: Response) => {
    const { name, userName, email, password } = req.body;

    if (!name) return res.status(400).json({ success: false, message: 'name is required.' });
    if (!userName) return res.status(400).json({ success: false, message: 'userName is required.' });
    if (!email) return res.status(400).json({ success: false, message: 'email is required.' });
    if (!password) return res.status(400).json({ success: false, message: 'password is required.' });

    const [sameEmail] = await db.select().from(users).where(eq(users.email, email))
    const [sameUserName] = await db.select().from(users).where(eq(users.userName, userName))

    if (sameEmail?.email === email) return res.status(409).json({success: false, message: "Email already taken."})
    if (sameUserName?.userName === userName) return res.status(409).json({success: false, message: "Username already taken."})
    

    const userData = { name, userName, email, password };
    const token = jwt.sign({ name, userName, email }, process.env.JWT_SECRET as string, {
        expiresIn: '30d'
    });

    const passwordHash = await bcrypt.hash(password, 8) 

    const [newUser] = await db.insert(users).values({ ...userData, password: passwordHash, token }).returning();

    if (!newUser) return res.status(500).json({ success: false, message: "Failed to create user." });

    const { password: storedPassword, ...data } = newUser;

    return res.status(201).json({ success: true, message: "New user created.", data: data });
};