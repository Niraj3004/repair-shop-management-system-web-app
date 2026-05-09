import express, { Router } from "express";
import * as adminController from "../controllers/admin.controller";
import * as invoiceController from "../controllers/invoice.controller";
import AuthMiddleware from "../middlewares/auth.middleware";
import RoleMiddleware from "../middlewares/role.middleware";

// Provide aliases for middleware to exactly match requested syntax
const authMiddleware = AuthMiddleware.isAuthenticated;
const authorizeRole = (role: string) => RoleMiddleware.restrictTo(role as any);

import { validateZod } from "../middlewares/validationzod";
import { userIdParamSchema, updateBookingStatusSchema, sendNotificationSchema } from "../validations/admin.validation";

const router: Router = express.Router();

router.route("/dashboard").get(
  authMiddleware,
  authorizeRole("admin"),
  adminController.getDashboardStats
);

router.route("/users").get(
  authMiddleware,
  authorizeRole("admin"),
  adminController.getAllUsers
);

router.route("/users/:id").delete(
  authMiddleware,
  authorizeRole("admin"),
  validateZod(userIdParamSchema),
  adminController.deleteUser
);

router.route("/bookings").get(
  authMiddleware,
  authorizeRole("admin"),
  adminController.getAllBookings
);

router.route("/invoices").get(
  authMiddleware,
  authorizeRole("admin"),
  adminController.getAllInvoices
);

router.route("/booking/:id")
  .get(
    authMiddleware,
    authorizeRole("admin"),
    validateZod(userIdParamSchema),
    adminController.getBookingById
  )
  .put(
    authMiddleware,
    authorizeRole("admin"),
    validateZod(updateBookingStatusSchema),
    adminController.updateBookingStatus
  );

router.route("/tracking/:bookingId").put(
  authMiddleware,
  authorizeRole("admin"),
  adminController.updateRepairStatus
);

router.route("/invoice/generate").post(
  authMiddleware,
  authorizeRole("admin"),
  adminController.generateInvoice
);

router.route("/invoice/:id/verify").put(
  authMiddleware,
  authorizeRole("admin"),
  invoiceController.verifyPayment
);

router.route("/send-notification").post(
  authMiddleware,
  authorizeRole("admin"),
  validateZod(sendNotificationSchema),
  adminController.sendCustomNotification
);

// Public Bookings Management
router.route("/public-bookings").get(
  authMiddleware,
  authorizeRole("admin"),
  adminController.getAllPublicBookings
);

router.route("/public-bookings/:id/approve").put(
  authMiddleware,
  authorizeRole("admin"),
  adminController.approvePublicBooking
);

router.route("/public-bookings/:id/reject").put(
  authMiddleware,
  authorizeRole("admin"),
  adminController.rejectPublicBooking
);

export default router;
