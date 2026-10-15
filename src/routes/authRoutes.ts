import express from "express";
import {
  createNewUser,
  deleteUser,
  editUser,
  getAllUsers,
  loginUser,
} from "../controllers/auth.controller.ts";
import { requireAuth, requireRole } from "../middlewares/authMiddleware.ts";
import { validate } from "../middlewares/validateMiddleware.ts";
import { signinSchema, signupSchema } from "../validators/auth.validator.ts";

const router = express.Router();

router
  .post("/signup", validate(signupSchema), createNewUser)
  .post("/signin", validate(signinSchema), loginUser)
  .put("/edit", requireAuth, editUser)
  .get("/", requireAuth, requireRole("admin"), getAllUsers)
  .delete("/:id", requireAuth, requireRole("admin"), deleteUser);

export default router;
