import { z } from "zod";

export const updateMeSchema = z.object({
  body: z.object({
    firstName: z.string().min(2, "First Name must be at least 2 characters").optional(),
    lastName: z.string().min(2, "Last Name must be at least 2 characters").optional(),
    phone: z.string().min(10, "Phone must be at least 10 characters").optional(),
    currentAddress: z.string().min(5, "Address must be at least 5 characters").optional(),
    profileImage: z.string().url("Invalid image URL").optional(),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(6, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmNewPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
  }).refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords do not match",
    path: ["confirmNewPassword"],
  }),
});
