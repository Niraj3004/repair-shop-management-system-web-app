import { Request, Response, NextFunction } from "express";
import * as trackingService from "../services/tracking.service";
import { STATUS_CODES } from "../constants/statuscode";
import { IExtendRequest } from "../middlewares/auth.middleware";
import { catchAsyncError } from "../middlewares/asyncErrorHandle";

export const getTrackingStatus = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const { trackingId } = req.params;
  const trackingInfo = await trackingService.getTrackingTimelineService(trackingId as string);

  if (!trackingInfo) {
    return res.status(STATUS_CODES.NOT_FOUND).json({
      success: false,
      message: "Tracking information not found",
    });
  }

  res.status(STATUS_CODES.OK).json({
    success: true,
    data: trackingInfo,
  });
});

export const updateStatus = catchAsyncError(async (req: IExtendRequest, res: Response, next: NextFunction) => {
  const { bookingId } = req.params;
  const { status, notes, price, isInternal } = req.body;

  // AuthMiddleware ensures this is populated
  const userId = req.user?._id?.toString() || req.user?.email || "System";

  const updatedStatus = await trackingService.updateTrackingStatusService(
    bookingId as string,
    status as string,
    notes as string,
    userId as string,
    price ? Number(price) : undefined,
    isInternal === true
  );

  res.status(STATUS_CODES.CREATED).json({
    success: true,
    message: "Repair status updated successfully",
    data: updatedStatus,
  });
});
