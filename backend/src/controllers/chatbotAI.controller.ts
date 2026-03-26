import { Request, Response, NextFunction } from "express";
import * as chatbotAIService from "../services/chatbotAI.service";
import { STATUS_CODES } from "../constants/statuscode";
import { catchAsyncError } from "../middlewares/asyncErrorHandle";
import ChatbotMessage from "../models/chatbot.model";
import { IExtendRequest } from "../middlewares/auth.middleware";

export const handleChatQuery = catchAsyncError(async (req: IExtendRequest, res: Response, next: NextFunction) => {
  const { message } = req.body;
  const userId = req.user?._id;

  if (!message) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({ success: false, message: "Message is required" });
  }

  // 1. Save user message
  if (userId) {
    await ChatbotMessage.create({
      userId,
      role: "user",
      content: message
    });
  }

  const response = await chatbotAIService.processQueryService(message);

  // 2. Save assistant response
  if (userId && response.reply) {
    await ChatbotMessage.create({
      userId,
      role: "assistant",
      content: response.reply
    });
  }

  res.status(STATUS_CODES.OK).json({ success: true, data: response });
});

export const getChatHistory = catchAsyncError(async (req: IExtendRequest, res: Response, next: NextFunction) => {
  const userId = req.user?._id;
  if (!userId) {
    return res.status(STATUS_CODES.UNAUTHORIZED).json({ success: false, message: "Unauthorized" });
  }

  const history = await ChatbotMessage.find({ userId }).sort({ createdAt: 1 });
  res.status(STATUS_CODES.OK).json({ success: true, data: history });
});
