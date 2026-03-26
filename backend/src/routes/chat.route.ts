import { Router } from "express";
import { getConversation, getUnreadCount, markAsRead, getUnreadCountsGrouped } from "../controllers/chat.controller";
import AuthMiddleware from "../middlewares/auth.middleware";

const router = Router();

// Get unread message count
router.get("/unread/count", AuthMiddleware.isAuthenticated, getUnreadCount);
router.get("/unread/grouped", AuthMiddleware.isAuthenticated, getUnreadCountsGrouped);

// Get the entire chat history with a specific user
router.get("/:partnerId", AuthMiddleware.isAuthenticated, getConversation);

// Mark conversation with a specific user as read
router.put("/:partnerId/read", AuthMiddleware.isAuthenticated, markAsRead);

export default router;
