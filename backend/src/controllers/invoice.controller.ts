import { Request, Response, NextFunction } from "express";
import * as invoiceService from "../services/invoice.service";
import cloudinary from "../config/cloudinary.config";
import { STATUS_CODES } from "../constants/statuscode";
import { catchAsyncError } from "../middlewares/asyncErrorHandle";
import { IExtendRequest } from "../middlewares/auth.middleware";

export const uploadPaymentProof = catchAsyncError(async (req: IExtendRequest, res: Response, next: NextFunction) => {
  const invoiceId = req.params.id as string;
  const userId = req.user?._id.toString() as string;
  const file = req.file as Express.Multer.File;

  if (!file) throw new Error("Please upload a screenshot of your payment receipt");

  const b64 = Buffer.from(file.buffer).toString("base64");
  let dataURI = "data:" + file.mimetype + ";base64," + b64;
  const cldRes = await cloudinary.uploader.upload(dataURI, {
    folder: "wefixit/payments",
  });

  const invoice = await invoiceService.uploadPaymentProofService(invoiceId, userId, cldRes.secure_url);
  res.status(STATUS_CODES.OK).json({ success: true, message: "Payment proof submitted for verification", data: invoice });
});

export const verifyPayment = catchAsyncError(async (req: IExtendRequest, res: Response, next: NextFunction) => {
  const invoiceId = req.params.id as string;
  const { action } = req.body; // 'APPROVE' | 'REJECT'

  const invoice = await invoiceService.verifyPaymentService(invoiceId, action);
  res.status(STATUS_CODES.OK).json({ success: true, message: `Payment ${action.toLowerCase()}d successfully`, data: invoice });
});

export const getMyInvoices = catchAsyncError(async (req: IExtendRequest, res: Response, next: NextFunction) => {
  const userId = req.user?._id.toString() as string;
  const invoices = await invoiceService.getMyInvoicesService(userId);
  res.status(STATUS_CODES.OK).json({ success: true, count: invoices.length, data: invoices });
});
