import { z } from "zod";
import mongoose from "mongoose";

export const userIdParamSchema = z.object({
  params: z.object({
    id: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), "Invalid User ID"),
  }),
});

export const bookingIdParamSchema = z.object({
  params: z.object({
    id: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), "Invalid Booking ID"),
  }),
});

export const updateBookingStatusSchema = z.object({
  params: z.object({
    id: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), "Invalid Booking ID"),
  }),
  body: z.object({
    status: z.string().min(1, "Status is required"),
    price: z.number().optional(),
    notes: z.string().optional()
  }),
});

export const sendNotificationSchema = z.object({
  body: z.object({
    userId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), "Invalid User ID"),
    title: z.string().min(3, "Title must be at least 3 characters"),
    message: z.string().min(5, "Message must be at least 5 characters"),
    type: z.enum(["SYSTEM", "BOOKING", "PROMO", "ALERT"]).optional(),
  }),
});
