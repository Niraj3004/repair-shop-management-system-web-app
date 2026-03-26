import { Request, Response, NextFunction } from "express";
import * as notificationService from "../services/notification.service";
import { STATUS_CODES } from "../constants/statuscode";
import { catchAsyncError } from "../middlewares/asyncErrorHandle";
import { IExtendRequest } from "../middlewares/auth.middleware";

export const getUserNotifications = catchAsyncError(async (req: IExtendRequest, res: Response, next: NextFunction) => {
  const userId = req.user?._id?.toString();
  if (!userId) throw new Error("Unauthorized access");

  const notifications = await notificationService.getUserNotificationsService(userId);
  res.status(STATUS_CODES.OK).json({ success: true, data: notifications });
});

export const markAsRead = catchAsyncError(async (req: IExtendRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const result = await notificationService.markAsReadService(id as string);
  res.status(STATUS_CODES.OK).json({ success: true, message: "Notification marked as read", data: result });
});

export const markAllAsRead = catchAsyncError(async (req: IExtendRequest, res: Response, next: NextFunction) => {
  const userId = req.user?._id?.toString();
  if (!userId) throw new Error("Unauthorized access");

  await notificationService.markAllAsReadService(userId);
  res.status(STATUS_CODES.OK).json({ success: true, message: "All notifications marked as read" });
});
