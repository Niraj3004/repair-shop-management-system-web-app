import { z } from "zod";

export const chatQuerySchema = z.object({
  body: z.object({
    message: z.string().min(1, "Message cannot be empty"),
  }),
});
