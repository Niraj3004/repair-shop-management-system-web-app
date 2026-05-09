import { Request, Response, NextFunction } from "express";
import * as bookingService from "../services/booking.service";
import cloudinary from "../config/cloudinary.config";
import { STATUS_CODES } from "../constants/statuscode";
import { catchAsyncError } from "../middlewares/asyncErrorHandle";
import { IExtendRequest } from "../middlewares/auth.middleware";
import fs from "fs";

export const downloadInvoice = catchAsyncError(async (req: IExtendRequest, res: Response, next: NextFunction) => {
  const userId = req.user?._id?.toString();
  if (!userId) throw new Error("Unauthorized user access");

  const { id } = req.params;
  const filePath = await bookingService.downloadInvoiceService(id as string, userId);

  // Send the file to the browser as a download, then accurately clean it up from the hard drive
  res.download(filePath, `Invoice-${id}.pdf`, (err) => {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  });
});

export const createBooking = catchAsyncError(async (req: IExtendRequest, res: Response, next: NextFunction) => {
  const {
    deviceType,
    deviceBrand,
    deviceModel,
    issueDescription,
    customerFirstName,
    customerLastName,
    customerEmail,
    customerPhone,
    customerAddress
  } = req.body;

  // Optional Authentication
  const userId = req.user?._id?.toString();
  const userRole = req.user?.role;

  const files = req.files as Express.Multer.File[];
  const imageUrls: string[] = [];

  if (files && files.length > 0) {
    for (const file of files) {
      if (process.env.CLOUDINARY_API_KEY === "your_api_key" || !process.env.CLOUDINARY_API_KEY) {
        // Fallback for local development without Cloudinary
        console.log("Cloudinary not configured, using placeholder image.");
        imageUrls.push(`https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg`);
        continue;
      }
      const b64 = Buffer.from(file.buffer).toString("base64");
      let dataURI = "data:" + file.mimetype + ";base64," + b64;
      const cldRes = await cloudinary.uploader.upload(dataURI, {
        folder: "wefixit/devices",
      });
      imageUrls.push(cldRes.secure_url);
    }
  }

  let customerDetails = undefined;
  if (!userId || (userRole === 'admin' && customerPhone)) {
    customerDetails = {
      firstName: customerFirstName,
      lastName: customerLastName,
      email: customerEmail,
      phone: customerPhone,
      address: customerAddress
    };
  }

  const booking = await bookingService.createBookingService(
    userId,
    deviceType,
    deviceBrand,
    deviceModel,
    issueDescription,
    imageUrls,
    customerDetails
  );

  res.status(STATUS_CODES.CREATED).json({
    success: true,
    message: "Booking created successfully",
    data: booking,
  });
});

export const getBookingById = catchAsyncError(async (req: IExtendRequest, res: Response, next: NextFunction) => {
  const userId = req.user?._id.toString() as string;
  const id = req.params.id as string;
  const booking = await bookingService.getBookingByIdService(id, userId);
  res.status(STATUS_CODES.OK).json({ success: true, data: booking });
});

export const getMyBookings = catchAsyncError(async (req: IExtendRequest, res: Response, next: NextFunction) => {
  // AuthMiddleware ensures this is populated
  const userId = req.user?._id.toString() as string;

  const bookings = await bookingService.getMyBookingsService(userId);

  res.status(STATUS_CODES.OK).json({
    success: true,
    count: bookings.length,
    data: bookings,
  });
});

export const getAllBookings = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const status = req.query.status as string;

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
