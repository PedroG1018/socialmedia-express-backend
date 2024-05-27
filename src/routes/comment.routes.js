import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  createComment,
  getPostsComments,
} from "../controllers/comment.controller.js";

const router = express.Router();

router.get("/:id", protectRoute, getPostsComments);
router.post("/:id", protectRoute, createComment);

export default router;
