import express from "express";
import {
  checkAuth,
  register,
  login,
  logout,
} from "../controllers/auth.controller";
import { protectRoute } from "../middleware/protectRoute";

const router = express.Router();

router.get("/check", protectRoute, checkAuth);
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

export default router;
