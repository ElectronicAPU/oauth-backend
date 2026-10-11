import express from "express";
import { createNewUser, editUser, loginUser } from "../controllers/auth.controller.ts";

const router = express.Router();

router.post("/signup", createNewUser).post("/signin", loginUser).put("/edit/:id", editUser);

export default router;
