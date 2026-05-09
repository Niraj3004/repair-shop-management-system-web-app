import { z } from "zod";
import mongoose from "mongoose";

export const createBookingSchema = z.object({
  body: z.object({
    deviceType: z.string().min(2, "Device type is required"),
    deviceBrand: z.string().min(2, "Device brand is required"),
    deviceModel: z.string().min(2, "Device model is required"),
    issueDescription: z.string().min(10, "Please provide a detailed issue description"),
    customerFirstName: z.string().optional(),
    customerLastName: z.string().optional(),
    customerEmail: z.string().email("Invalid email").or(z.literal("")).optional(),
    customerPhone: z.string().optional(),
  }),
});

export const bookingIdParamSchema = z.object({
  params: z.object({
    id: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), "Invalid Booking ID"),
  }),
});
