import Booking from "../models/booking.model";
import User from "../models/user.model";
import { REPAIR_STATUS } from "../constants/status";
import { generateInvoicePDF } from "../utils/pdfGenerator";
import { sendEmail, emailTemplates } from "../utils/emailTemplates";
import { Notification } from "../models/notification.model";
import Invoice from "../models/invoice.model";
import RepairStatus from "../models/repairStatus.model";
import fs from "fs";

import { hashPassword } from "../utils/hash";
import { createBookingService } from "./booking.service";

export const getDashboardStatsService = async () => {
  const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });
  const totalBookings = await Booking.countDocuments();

  const pendingBookings = await Booking.countDocuments({
    currentStatus: {
      $in: [REPAIR_STATUS.PENDING_DROP_OFF, REPAIR_STATUS.IN_PROGRESS],
    },
  });

  const completedBookings = await Booking.countDocuments({
    currentStatus: REPAIR_STATUS.COMPLETED,
  });

  // Calculate total revenue from completed repairs
  const revenueResult = await Booking.aggregate([
    { $match: { currentStatus: REPAIR_STATUS.COMPLETED } },
    { $group: { _id: null, totalRevenue: { $sum: "$price" } } },
  ]);

  const totalRevenue =
    revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

  const recentBookings = await Booking.find()
    .populate("user", "firstName lastName email")
    .sort({ createdAt: -1 })
    .limit(5);

  return {
    totalUsers,
    totalBookings,
    pendingBookings,
    completedBookings,
    totalRevenue,
    recentBookings,
  };
};

export const getAllUsersService = async () => {
  const users = await User.find({ role: { $ne: "admin" } })
    .select("-password")
    .sort({ createdAt: -1 });
  return users;
};

export const deleteUserService = async (userId: string) => {
  const result = await User.findByIdAndDelete(userId);
  return result;
};


export const generateInvoiceService = async (bookingId: string) => {
  const booking = await Booking.findById(bookingId).populate(
    "user",
    "firstName lastName email",
  );
  if (!booking) throw new Error("Booking not found");

  const user = booking.user as any;
  if (!user || !user.email)
    throw new Error("User email not found for this booking");

  // Check if invoice already exists
  let invoice = await Invoice.findOne({ booking: bookingId });

  const amount = booking.price || 0;

  const attachmentPath = await generateInvoicePDF({
    trackingId: booking.trackingId,
    customerName: user.firstName + " " + (user.lastName || ""),
    customerEmail: user.email,
    deviceType: booking.deviceType,
    deviceModel: booking.deviceModel,
    issueDescription: booking.issueDescription,
    price: amount,
    date: new Date(),
  });

  if (!invoice) {
    invoice = await Invoice.create({
      booking: bookingId,
      user: user._id,
      amount: amount,
      status: 'PENDING',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    });
  } else {
    invoice.amount = amount;
    await invoice.save();
  }

  const emailHtml = emailTemplates.statusUpdateEmail(
    user.firstName || "Client",
    booking.trackingId,
    booking.currentStatus,
    "Your repair invoice has been generated. You can view it in your dashboard or the attachment below.",
  );

  await sendEmail(
    user.email,
    "Your Repair Invoice - WeFixIt",
    emailHtml,
    attachmentPath,
  );

  if (attachmentPath && fs.existsSync(attachmentPath)) {
    // Optionally keep for a while or delete
    // fs.unlinkSync(attachmentPath);
  }

  return { message: "Invoice generated, saved, and sent to customer successfully" };
};

export const sendCustomNotificationService = async (
  userId: string,
  title: string,
  message: string,
  type: string = "ALERT"
) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const notification = await Notification.create({
    user: userId,
    title,
    message,
    type,
    isRead: false,
  });

  if (user.email) {
    const emailHtml = emailTemplates.customAnnouncementEmail(
      user.firstName || "Client",
      title,
      message
    );

    sendEmail(user.email, title, emailHtml).catch(err => {
      console.error("Failed to send custom notification email", err);
    });
  }

  return notification;
};

export const getBookingByIdService = async (bookingId: string) => {
  const booking = await Booking.findById(bookingId).populate(
    "user",
    "firstName lastName email phone",
  );
  if (!booking) throw new Error("Booking not found");

  // Fetch repair timeline
  const timeline = await RepairStatus.find({ bookingId: booking._id }).sort({
    createdAt: 1,
  });

  // Fetch invoice if any
  const invoice = await Invoice.findOne({ booking: booking._id });

  return { ...booking.toObject(), timeline, invoice };
};

export const getAllInvoicesService = async () => {
  const invoices = await Invoice.find()
    .populate("user", "firstName lastName email")
    .populate("booking", "trackingId deviceType deviceModel")
    .sort({ createdAt: -1 });
  return invoices;
};

export const approveGuestBookingService = async (id: string, adminId: string) => {
  const booking = await Booking.findById(id);
  
  if (!booking) throw new Error("Booking not found");
  if (!booking.isGuest) throw new Error("This booking is already associated with a registered user.");
  
  const email = booking.customerEmail;
  if (!email) throw new Error("Guest booking has no email address. Cannot auto-create account.");

  // Check if user already exists
  let user = await User.findOne({ email });
  let generatedPassword = "";

  if (!user) {
    // Generate secure password
    generatedPassword = Math.random().toString(36).slice(-8) + "A1!";
    const hashedPassword = await hashPassword(generatedPassword);

    user = await User.create({
      firstName: booking.customerFirstName || "Client",
      lastName: booking.customerLastName || "",
      email: email,
      phone: booking.customerPhone || "",
      currentAddress: booking.customerAddress || "",
      password: hashedPassword,
      role: "client",
      isVerified: true
    });
    console.log(`[Guest Booking] Auto-created user ${user.email} with password: ${generatedPassword}`);
  }

  // Update booking
  booking.user = user._id as any;
  booking.isGuest = false;
  booking.currentStatus = REPAIR_STATUS.PENDING_DROP_OFF;
  
  // Optionally clean up guest fields now that they are in the User model,
  // but it's fine to keep them for historical record.
  
  await booking.save();

  // Create timeline entry for approval
  await RepairStatus.create({
    bookingId: booking._id,
    status: REPAIR_STATUS.PENDING_DROP_OFF,
    notes: `Guest booking approved and account linked.`,
    updatedBy: adminId,
  });

  // Send approval email with login credentials
  const emailHtml = emailTemplates.customerBookingApproved(
    user.firstName,
    booking.trackingId,
    user.email,
    generatedPassword || "(Your existing password)"
  );

  sendEmail(user.email, "Your Repair Booking is Approved!", emailHtml).catch(err => {
    console.error("Failed to send approval email", err);
  });

  return booking;
};
