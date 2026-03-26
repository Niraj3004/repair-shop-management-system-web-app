import { Router } from "express";
import authRoutes from "./auth.route";
import bookingRoutes from "./booking.route";
import trackingRoutes from "./tracking.route";
import adminRoutes from "./admin.route";
import userRoutes from "./user.route";
import notificationRoutes from "./notification.route";
import chatbotAIRoutes from "./chatbotAI.route";
import invoiceRoutes from "./invoice.route";
import chatRoutes from "./chat.route";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/booking", bookingRoutes);
router.use("/tracking", trackingRoutes);
router.use("/admin", adminRoutes);
router.use("/notifications", notificationRoutes);
router.use("/chatbot", chatbotAIRoutes);
router.use("/invoices", invoiceRoutes);
router.use("/chat", chatRoutes);

export default router;
