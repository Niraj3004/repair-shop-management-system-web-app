import Booking from "../models/booking.model";
import RepairStatus from "../models/repairStatus.model";
import User from "../models/user.model";
import { sendEmail, emailTemplates } from "../utils/emailTemplates";
import { generateInvoicePDF } from "../utils/pdfGenerator";
import { REPAIR_STATUS } from "../constants/status";
import fs from "fs";

export const getTrackingTimelineService = async (
  trackingId: string,
  isAdmin: boolean = false,
) => {
  const booking = await Booking.findOne({ trackingId });

  if (!booking) {
    throw new Error("Tracking information not found");
  }

  const query: any = { bookingId: booking._id };
  if (!isAdmin) {
    query.isInternal = { $ne: true };
  }

  const timeline = await RepairStatus.find(query).sort({ createdAt: -1 });

  return {
    booking,
    timeline,
  };
};

export const updateTrackingStatusService = async (
  bookingId: string,
  status: string,
  notes: string,
  userId: string,
  price?: number,
  isInternal: boolean = false,
) => {
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new Error("Booking not found");
  }

  // Update main booking status
  booking.currentStatus = status;
  if (price !== undefined) {
    booking.price = price;
  }
  await booking.save();

  // Create timeline entry
  const newStatus = await RepairStatus.create({
    bookingId,
    status,
    notes,
    isInternal,
    updatedBy: userId,
  });

  // Only send an email if this is NOT an internal note
  if (!isInternal) {
    // Fetch the user to get their email
    const user = await User.findById(booking.user);

    if (user && user.email) {
      const emailHtml = emailTemplates.statusUpdateEmail(
        user.firstName || "Client",
        booking.trackingId,
        status,
        notes,
      );

      let attachmentPath: string | undefined;

      if (status === REPAIR_STATUS.COMPLETED) {
        try {
          attachmentPath = await generateInvoicePDF({
            trackingId: booking.trackingId,
            customerName: user.firstName + " " + (user.lastName || ""),
            customerEmail: user.email,
            deviceType: booking.deviceType,
            deviceModel: booking.deviceModel,
            issueDescription: booking.issueDescription,
            price: booking.price || 0,
            date: new Date(),
          });
        } catch (err) {
          console.error("Failed to generate PDF invoice:", err);
        }
      }

      // Send email asynchronously without blocking the response
      sendEmail(
        user.email,
        "Repair Status Update - WeFixIt",
        emailHtml,
        attachmentPath,
      )
        .then(() => {
          // Option to delete the PDF after sending to save space
          if (attachmentPath && fs.existsSync(attachmentPath)) {
            // fs.unlinkSync(attachmentPath);
          }
        })
        .catch((err: any) =>
          console.error("Failed to send status update email:", err),
        );
    }
  }

  return newStatus;
};
