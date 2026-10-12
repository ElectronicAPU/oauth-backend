import express from "express";
import { createNewUser, editUser, loginUser } from "../controllers/auth.controller.ts";
import { requireAuth } from "../middlewares/authMiddleware.ts";

const router = express.Router();

router.post("/signup", createNewUser).post("/signin", loginUser).put("/edit", requireAuth, editUser);

export default router;
