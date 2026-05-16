import { z } from "zod";
import mongoose from "mongoose";

export const createTestimonialSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    message: z.string().min(10, "Message must be at least 10 characters"),
    rating: z.coerce.number().min(1).max(5).optional(),
  }),
});

export const updateTestimonialSchema = z.object({
  body: z.object({
    status: z.enum(["pending", "approved", "rejected"]).optional(),
    name: z.string().min(2).optional(),
    message: z.string().min(10).optional(),
    rating: z.coerce.number().min(1).max(5).optional(),
  }),
});

export const testimonialIdParamSchema = z.object({
  params: z.object({
    id: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), "Invalid Testimonial ID"),
  }),
});
