import express, { Router } from "express";
import * as chatbotAIController from "../controllers/chatbotAI.controller";
import AuthMiddleware from "../middlewares/auth.middleware";

import { validateZod } from "../middlewares/validationzod";
import { chatQuerySchema } from "../validations/chatbotAI.validation";

const router: Router = express.Router();

router.use(AuthMiddleware.isAuthenticated);

router.route("/query")
  .post(validateZod(chatQuerySchema), chatbotAIController.handleChatQuery);

router.route("/history")
  .get(chatbotAIController.getChatHistory);

export default router;
