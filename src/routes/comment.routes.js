import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  createComment,
  getPostsComments,
  getLikedComments,
  likeUnlikeComment,
  deleteComment,
} from "../controllers/comment.controller.js";

const router = express.Router();

router.get("/:id", protectRoute, getPostsComments);
router.get("/user/liked", protectRoute, getLikedComments);
router.post("/:id", protectRoute, createComment);
router.post("/like/:id", protectRoute, likeUnlikeComment);
router.delete("/:id", protectRoute, deleteComment);

export default router;
