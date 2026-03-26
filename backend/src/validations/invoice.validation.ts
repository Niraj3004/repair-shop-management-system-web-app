import { z } from "zod";
import mongoose from "mongoose";

export const invoiceIdParamSchema = z.object({
  params: z.object({
    id: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), "Invalid Invoice ID"),
  }),
});
