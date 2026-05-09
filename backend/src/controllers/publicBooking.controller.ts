import { Request, Response, NextFunction } from "express";
import PublicBooking from "../models/publicBooking.model";
import User from "../models/user.model";
import cloudinary from "../config/cloudinary.config";
import { STATUS_CODES } from "../constants/statuscode";
import { catchAsyncError } from "../middlewares/asyncErrorHandle";
import { generateTrackingId } from "../utils/generateTrackingId";
import { sendEmail, emailTemplates } from "../utils/emailTemplates";

export const createPublicBooking = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    address,
    notes,
    deviceType,
    deviceBrand,
    deviceModel,
    issueDescription
  } = req.body;

  const files = req.files as Express.Multer.File[];
  const imageUrls: string[] = [];

  if (files && files.length > 0) {
    for (const file of files) {
      if (process.env.CLOUDINARY_API_KEY === "your_api_key" || !process.env.CLOUDINARY_API_KEY) {
        // Fallback for local development without Cloudinary
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

  const trackingId = generateTrackingId();

  const publicBooking = await PublicBooking.create({
    firstName,
    lastName,
    email,
    phone,
    address,
    notes,
    deviceType,
    deviceBrand,
    deviceModel,
    issueDescription,
    deviceImages: imageUrls,
    trackingId,
    status: "pending"
  });

  // Find an admin to notify
  const admin = await User.findOne({ role: "admin" });
  if (admin && admin.email) {
    const emailHtml = emailTemplates.adminNewPublicBooking(
      admin.firstName,
      `${firstName} ${lastName}`,
      trackingId,
      email,
      phone
    );
    sendEmail(admin.email, "New Public Booking Request - WeFixIt", emailHtml).catch(err => 
      console.error("Failed to send admin notification:", err)
    );
  }

  res.status(STATUS_CODES.CREATED).json({
    success: true,
    message: "Booking request submitted successfully! Pending admin approval.",
    data: {
      trackingId: publicBooking.trackingId
    }
  });
});
