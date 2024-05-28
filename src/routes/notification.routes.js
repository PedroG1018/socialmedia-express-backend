import express from "express";
import {} from "../controllers/notification.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";
import { getNotifications } from "../controllers/notification.controller.js";
import { deleteAllNotifications } from "../controllers/notification.controller.js";
import { deleteNotifcation } from "../controllers/notification.controller.js";

const router = express.Router();

router.get("/", protectRoute, getNotifications);
router.delete("/", protectRoute, deleteAllNotifications);
router.delete("/:id", protectRoute, deleteNotifcation);

export default router;
