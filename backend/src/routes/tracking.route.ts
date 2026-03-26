import express, { Router } from "express";
import * as trackingController from "../controllers/tracking.controller";
import AuthMiddleware from "../middlewares/auth.middleware";
import { validateZod } from "../middlewares/validationzod";
import {
  getTrackingSchema,
  updateStatusSchema,
} from "../validations/tracking.validation";
import { ROLES } from "../constants/role";

const router: Router = express.Router();

// PUBLIC: Clients can track their repair
// validate() ensures trackingId is the right length before hitting the DB
router.route("/:trackingId").get(
  validateZod(getTrackingSchema),
  trackingController.getTrackingStatus,
);

// PROTECTED: Only Admins/Technicians can update repair status
// (This route was moved to admin.route.ts -> PUT /api/admin/tracking/:bookingId)

export default router;
