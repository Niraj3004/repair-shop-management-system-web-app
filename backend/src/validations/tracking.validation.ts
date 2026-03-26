import { z } from "zod";
import mongoose from "mongoose";
import { REPAIR_STATUS } from "../constants/status";

export const getTrackingSchema = z.object({
  params: z.object({
    trackingId: z.string({
      message: "Tracking ID is required",
    }),
  }),
});

export const updateStatusSchema = z.object({
  params: z.object({
    bookingId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
      message: "Invalid Booking ID format",
    }),
  }),
  body: z.object({
    status: z.enum(
      Object.values(REPAIR_STATUS) as [string, ...string[]],
      {
        message: "Invalid status provided",
      }
    ),
    notes: z.string().optional(),
  }),
});
