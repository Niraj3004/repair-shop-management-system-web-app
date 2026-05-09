import mongoose from "mongoose";
import Booking from "../models/booking.model";
import RepairStatus from "../models/repairStatus.model";
import Invoice from "../models/invoice.model";
import User from "../models/user.model";
import { REPAIR_STATUS } from "../constants/status";
import { generateTrackingId } from "../utils/generateTrackingId";
import { sendEmail, emailTemplates } from "../utils/emailTemplates";
import { generateInvoicePDF } from "../utils/pdfGenerator";

export const downloadInvoiceService = async (bookingId: string, userId: string) => {
  const userObj = await User.findById(userId);
  if (!userObj) throw new Error("User not found");

  const query = userObj.role === 'admin' ? { _id: bookingId } : { _id: bookingId, user: userId };
  const booking = await Booking.findOne(query).populate("user", "firstName lastName email");
  
  if (!booking) throw new Error("Booking not found or you do not have permission to access it");
  const invoice = await Invoice.findOne({ booking: bookingId });
  if (!invoice) throw new Error("Invoice not found. Please wait for the admin to generate it.");

  const user = booking.user as any;
  const filePath = await generateInvoicePDF({
    trackingId: booking.trackingId,
    customerName: user.firstName + " " + (user.lastName || ""),
    customerEmail: user.email,
    deviceType: booking.deviceType,
    deviceModel: booking.deviceModel,
    issueDescription: booking.issueDescription,
    price: invoice.amount || booking.price || 0,
    date: invoice.createdAt || new Date()
  });

  return filePath;
};

export const createBookingService = async (
  userId: string | undefined,
  deviceType: string,
  deviceBrand: string,
  deviceModel: string,
  issueDescription: string,
  deviceImages: string[] = [],
  customerDetails?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    address?: string;
  }
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let finalUserId = userId;
    let isWalkIn = false;
    let isGuest = false;

    if (!userId && customerDetails) {
      isGuest = true;
    } else if (userId && customerDetails) {
      isWalkIn = true;
      // Admin creating booking for a walk-in customer -> Create shadow account immediately
      const query: any = { 
        $or: [{ phone: customerDetails.phone }] 
      };
      if (customerDetails.email) {
        query.$or.push({ email: customerDetails.email });
      }

      let user = await User.findOne(query).session(session);

      if (!user) {
        const userArray = await User.create(
          [
            {
              firstName: customerDetails.firstName || "Walk-In",
              lastName: customerDetails.lastName || "",
              email: customerDetails.email || `${customerDetails.phone}@wefixit.com`,
              phone: customerDetails.phone || "",
              currentAddress: customerDetails.address || "",
              role: "client",
              isVerified: true,
            },
          ],
          { session }
        );
        user = userArray[0] || null;
      }
      
      if (!user) throw new Error("Failed to create or find customer account");
      finalUserId = user._id.toString();
    }

    const trackingId = generateTrackingId();

    const bookingPayload: any = {
      trackingId,
      deviceType,
      deviceBrand,
      deviceModel,
      issueDescription,
      deviceImages,
      currentStatus: isGuest ? REPAIR_STATUS.PENDING_APPROVAL : REPAIR_STATUS.PENDING_DROP_OFF,
      isGuest,
    };

    if (finalUserId) {
      bookingPayload.user = finalUserId;
    }

    if (isGuest && customerDetails) {
      bookingPayload.customerFirstName = customerDetails.firstName;
      bookingPayload.customerLastName = customerDetails.lastName;
      bookingPayload.customerEmail = customerDetails.email;
      bookingPayload.customerPhone = customerDetails.phone;
      bookingPayload.customerAddress = customerDetails.address;
    }

    const bookingArray = await Booking.create([bookingPayload], { session });

    const booking = bookingArray[0];

    if (!booking) {
      throw new Error("Failed to create booking.");
    }

    // Create initial timeline entry
    await RepairStatus.create(
      [
        {
          bookingId: booking._id,
          status: REPAIR_STATUS.PENDING_DROP_OFF,
          notes: isWalkIn ? `Booking created by Admin for walk-in customer.` : "Booking created by client.",
          updatedBy: userId || "Guest",
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    // Send emails asynchronously
    if (isGuest && customerDetails) {
      // 1. Send guest notification to Admin
      try {
        const adminEmail = process.env.ADMIN_EMAIL || "admin@repair.com";
        const emailHtml = emailTemplates.adminNewPublicBooking(
          "Admin", // Provide adminName
          customerDetails.firstName || "Guest",
          trackingId,
          customerDetails.email || "N/A",
          customerDetails.phone || "N/A"
        );
        sendEmail(adminEmail, "New Public Repair Request - WeFixIt", emailHtml).catch((err: any) =>
          console.error("Failed to send admin notification email:", err)
        );
      } catch (err) {
        console.error("Failed to fetch admin email: ", err);
      }
    } else if (finalUserId) {
      // 2. Send confirmation to registered user/walk-in
      try {
        const user = await User.findById(finalUserId);
        if (user && user.email && !user.email.endsWith("@wefixit.com")) {
          const emailHtml = emailTemplates.bookingCreatedEmail(
            user.firstName || "Client",
            trackingId,
            `${deviceType} - ${deviceModel}`
          );
          sendEmail(user.email, "Repair Booking Confirmed - WeFixIt", emailHtml).catch((err: any) =>
            console.error("Failed to send booking confirmation email:", err)
          );
        }
      } catch (err) {
        console.error("Failed to fetch user for email confirmation: ", err);
      }
    }

    return booking;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const getMyBookingsService = async (userId: string) => {
  const bookings = await Booking.find({ user: userId }).sort({ createdAt: -1 });
  return bookings;
};

export const getBookingByIdService = async (bookingId: string, userId: string) => {
  const booking = await Booking.findOne({ _id: bookingId, user: userId })
    .populate("user", "firstName lastName email phone");

  if (!booking) throw new Error("Booking not found or access denied");

  // Fetch repair timeline
  const timeline = await RepairStatus.find({ bookingId: booking._id }).sort({ createdAt: 1 });

  // Fetch invoice if any
  const invoice = await Invoice.findOne({ booking: booking._id });

  return { ...booking.toObject(), timeline, invoice };
};

export const getAllBookingsService = async (page: number = 1, limit: number = 10, status?: string) => {
  const query: any = {};
  if (status) {
    query.currentStatus = status;
  }

  const skip = (page - 1) * limit;

  const bookings = await Booking.find(query)
    .populate("user", "firstName lastName email phone")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Booking.countDocuments(query);

  return { bookings, total, page, limit };
};
