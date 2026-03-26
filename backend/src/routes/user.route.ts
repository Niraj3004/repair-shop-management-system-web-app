import express, { Router } from "express";
import * as userController from "../controllers/user.controller";
import AuthMiddleware from "../middlewares/auth.middleware";

const router: Router = express.Router();

import { validateZod } from "../middlewares/validationzod";
import { updateMeSchema, changePasswordSchema } from "../validations/user.validation";

// Retrieve currently logged-in user's profile
router.route("/me").get(AuthMiddleware.isAuthenticated, userController.getMe);

// Update basic user profile details (name, phone, address)
router.route("/me").put(AuthMiddleware.isAuthenticated, validateZod(updateMeSchema), userController.updateMe);

// Change user password explicitly when logged in
// Change user password explicitly when logged in
router.route("/change-password").put(AuthMiddleware.isAuthenticated, validateZod(changePasswordSchema), userController.changePassword);

// Get Admin User ID for Chat functionality
router.route("/admin").get(AuthMiddleware.isAuthenticated, userController.getAdmin);

export default router;
