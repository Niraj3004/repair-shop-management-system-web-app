import Invoice from "../models/invoice.model";
import Booking from "../models/booking.model";
import { REPAIR_STATUS } from "../constants/status";

export const uploadPaymentProofService = async (invoiceId: string, userId: string, paymentProofUrl: string) => {
  const invoice = await Invoice.findOne({ _id: invoiceId, user: userId });
  if (!invoice) throw new Error("Invoice not found or unauthorized");
  
  invoice.paymentProofUrl = paymentProofUrl;
  invoice.status = 'VERIFICATION_REQUIRED';
  await invoice.save();
  return invoice;
};

export const verifyPaymentService = async (invoiceId: string, action: 'APPROVE' | 'REJECT') => {
  const invoice = await Invoice.findById(invoiceId);
  if (!invoice) throw new Error("Invoice not found");

  if (action === 'APPROVE') {
    invoice.status = 'PAID';
    // Optionally update booking status to reflect payment
    await Booking.findByIdAndUpdate(invoice.booking, { currentStatus: REPAIR_STATUS.COMPLETED });
  } else {
    invoice.status = 'PENDING';
    invoice.paymentProofUrl = "";
  }
  
  await invoice.save();
  return invoice;
};

export const getMyInvoicesService = async (userId: string) => {
  const invoices = await Invoice.find({ user: userId })
    .populate("booking", "deviceModel deviceType trackingId currentStatus")
    .sort({ createdAt: -1 });
  return invoices;
};
