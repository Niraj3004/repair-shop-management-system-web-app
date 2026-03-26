import express, { Router } from "express";
import * as bookingController from "../controllers/booking.controller";
import AuthMiddleware from "../middlewares/auth.middleware";
import { upload } from "../utils/multer";
import { ROLES } from "../constants/role";

import { validateZod } from "../middlewares/validationzod";
import { createBookingSchema } from "../validations/booking.validation";

const router: Router = express.Router();

// PROTECTED: Clients can create a repair booking (with images)
router.route("/").post(
  AuthMiddleware.isAuthenticated,
  upload.array("images", 5),
  validateZod(createBookingSchema),
  bookingController.createBooking
);

// PROTECTED: Clients can view their entire booking history
router.route("/").get(
  AuthMiddleware.isAuthenticated,
  bookingController.getMyBookings
);

// PROTECTED: Clients can view a single booking with its timeline and invoice
router.route("/:id").get(
  AuthMiddleware.isAuthenticated,
  bookingController.getBookingById
);

// PROTECTED: Clients can download the official PDF invoice for a completed repair
router.route("/:id/invoice").get(
  AuthMiddleware.isAuthenticated,
  bookingController.downloadInvoice
);

export default router;
