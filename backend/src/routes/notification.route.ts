import express, { Router } from "express";
import * as notificationController from "../controllers/notification.controller";
import AuthMiddleware from "../middlewares/auth.middleware";

import { validateZod } from "../middlewares/validationzod";
import { notificationIdParamSchema } from "../validations/notification.validation";

const router: Router = express.Router();

router.route("/")
  .get(AuthMiddleware.isAuthenticated, notificationController.getUserNotifications);

router.route("/read-all")
  .put(AuthMiddleware.isAuthenticated, notificationController.markAllAsRead);

router.route("/:id/read")
  .put(AuthMiddleware.isAuthenticated, validateZod(notificationIdParamSchema), notificationController.markAsRead);

export default router;
