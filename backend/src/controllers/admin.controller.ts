import { Request, Response, NextFunction } from "express";
import * as adminService from "../services/admin.service";
import * as bookingService from "../services/booking.service";
import * as trackingService from "../services/tracking.service";
import { STATUS_CODES } from "../constants/statuscode";
import { catchAsyncError } from "../middlewares/asyncErrorHandle";
import { IExtendRequest } from "../middlewares/auth.middleware";

export const getDashboardStats = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const stats = await adminService.getDashboardStatsService();

  res.status(STATUS_CODES.OK).json({
    success: true,
    data: stats,
  });
});

export const getAllUsers = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const users = await adminService.getAllUsersService();
  res.status(STATUS_CODES.OK).json({ success: true, count: users.length, data: users });
});

export const deleteUser = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id as string;
  await adminService.deleteUserService(id);
  res.status(STATUS_CODES.OK).json({ success: true, message: "User deleted successfully" });
});

export const getAllBookings = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  // Proxy to the booking service
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const status = req.query.status ? String(req.query.status) : undefined;

  const result = await bookingService.getAllBookingsService(page, limit, status);

  res.status(STATUS_CODES.OK).json({
    success: true,
    count: result.bookings.length,
    total: result.total,
    totalPages: Math.ceil(result.total / result.limit),
    currentPage: result.page,
    data: result.bookings,
  });
});

export const updateBookingStatus = catchAsyncError(async (req: IExtendRequest, res: Response, next: NextFunction) => {
  const id = req.params.id as string;
  const { status, price, notes } = req.body;
  const userId = req.user?._id?.toString() || "Admin";

  // Use trackingService to ensure both booking status and timeline are updated
  const updatedBooking = await trackingService.updateTrackingStatusService(
    id,
    status,
    notes || `Status updated to ${status} by admin`,
    userId,
    price ? Number(price) : undefined
  );

  res.status(STATUS_CODES.OK).json({ success: true, data: updatedBooking });
});

export const updateRepairStatus = catchAsyncError(async (req: IExtendRequest, res: Response, next: NextFunction) => {
  const bookingId = req.params.bookingId as string;
  const { status, notes, price, isInternal } = req.body;
  const userId = req.user?._id?.toString() || req.user?.email || "System";

  // Proxy to trackingService's timeline update
  const updatedStatus = await trackingService.updateTrackingStatusService(
    bookingId,
    status as string,
    notes as string,
    userId as string,
    price ? Number(price) : undefined,
    isInternal === true
  );

  res.status(STATUS_CODES.OK).json({ success: true, data: updatedStatus });
});

export const generateInvoice = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const bookingId = req.body.bookingId as string;
  const result = await adminService.generateInvoiceService(bookingId);
  res.status(STATUS_CODES.OK).json({ success: true, message: result.message });
});

export const sendCustomNotification = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const { userId, title, message, type } = req.body;
  const notification = await adminService.sendCustomNotificationService(userId, title, message, type);
  res.status(STATUS_CODES.CREATED).json({ success: true, data: notification });
});

export const getBookingById = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;
    console.log(`[AdminController] Fetching booking by ID: ${id}`);
    const booking = await adminService.getBookingByIdService(id);
    res.status(STATUS_CODES.OK).json({ success: true, data: booking });
  },
);

export const getAllInvoices = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const invoices = await adminService.getAllInvoicesService();
    res.status(STATUS_CODES.OK).json({ success: true, count: invoices.length, data: invoices });
  },
);

export const approveGuestBooking = catchAsyncError(async (req: IExtendRequest, res: Response, next: NextFunction) => {
  const id = req.params.id as string;
  const adminId = req.user?._id?.toString() as string;
  
  const booking = await adminService.approveGuestBookingService(id, adminId);
  res.status(STATUS_CODES.OK).json({ success: true, message: "Guest booking approved and account created successfully", data: booking });
});
