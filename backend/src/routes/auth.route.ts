import express, { Router } from "express";
import * as authController from "../controllers/auth.controller";

const router: Router = express.Router();

import { validateZod } from "../middlewares/validationzod";
import { registerSchema, loginSchema, verifyOtpSchema, forgotPasswordSchema, resetPasswordSchema } from "../validations/auth.validation";

router.route("/register").post(validateZod(registerSchema), authController.register);
router.route("/verify-otp").post(validateZod(verifyOtpSchema), authController.verifyOtp);
router.route("/login").post(validateZod(loginSchema), authController.login);
router.route("/forgot-password").post(validateZod(forgotPasswordSchema), authController.forgotPassword);
router.route("/resend-otp").post(authController.resendOtp);
router.route("/reset-password").post(validateZod(resetPasswordSchema), authController.resetPassword);


export default router;
