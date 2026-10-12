import express from "express";
import {
  createNewUser,
  deleteUser,
  editUser,
  getAllUsers,
  loginUser,
} from "../controllers/auth.controller.ts";
import { requireAuth, requireRole } from "../middlewares/authMiddleware.ts";

const router = express.Router();

router
  .post("/signup", createNewUser)
  .post("/signin", loginUser)
  .put("/edit", requireAuth, editUser)
  .get("/", requireAuth, requireRole("admin"), getAllUsers)
  .delete("/:id", requireAuth, requireRole("admin"), deleteUser);

export default router;
