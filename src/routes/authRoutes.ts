import express from "express";
import { createNewUser } from "../controllers/auth.controller.ts";

const router = express.Router();

router.post("/", createNewUser);

export default router;
