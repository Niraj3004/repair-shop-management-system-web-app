import express, { Router } from "express";
import * as testimonialController from "../controllers/testimonial.controller";
import AuthMiddleware from "../middlewares/auth.middleware";
import RoleMiddleware from "../middlewares/role.middleware";
import { upload } from "../utils/multer";
import { validateZod } from "../middlewares/validationzod";
import {
  createTestimonialSchema,
  updateTestimonialSchema,
  testimonialIdParamSchema,
} from "../validations/testimonial.validation";

const authMiddleware = AuthMiddleware.isAuthenticated;
const authorizeRole = (role: string) => RoleMiddleware.restrictTo(role as any);

const router: Router = express.Router();

// Public Routes
router.route("/").post(
  upload.single("profileImage"),
  validateZod(createTestimonialSchema),
  testimonialController.createTestimonial
);
router.route("/").get(testimonialController.getApprovedTestimonials);

// Admin Routes
router.route("/admin")
  .get(authMiddleware, authorizeRole("admin"), testimonialController.getAllTestimonials);

router.route("/admin/:id")
  .put(
    authMiddleware,
    authorizeRole("admin"),
    validateZod(testimonialIdParamSchema),
    validateZod(updateTestimonialSchema),
    testimonialController.updateTestimonial
  )
  .delete(
    authMiddleware,
    authorizeRole("admin"),
    validateZod(testimonialIdParamSchema),
    testimonialController.deleteTestimonial
  );

export default router;
