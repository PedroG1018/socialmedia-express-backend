import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  followUnfollowUser,
  getAllUsers,
  getUser,
  updateUser,
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/user/:username", protectRoute, getUser);
router.get("/all/:query", protectRoute, getAllUsers);
router.post("/follow/:id", protectRoute, followUnfollowUser);
router.post("/update", protectRoute, updateUser);

export default router;
