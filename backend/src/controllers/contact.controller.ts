import { Request, Response } from "express";
import { sendEmail, emailTemplates } from "../utils/emailTemplates";
import { ENV } from "../config/env.config";
import { z } from "zod";

const contactSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters long"),
});

export const submitContactForm = async (req: Request, res: Response) => {
  try {
    const validatedData = contactSchema.parse(req.body);
    const { firstName, lastName, email, subject, message } = validatedData;
    const fullName = `${firstName} ${lastName}`;

    // Send email to Admin
    await sendEmail(
      ENV.ADMIN.EMAIL || "",
      `New Contact Us Message: ${subject}`,
      emailTemplates.contactUsMessage(fullName, email, subject, message),
      undefined,
      email // Reply-To email
    );

    res.status(200).json({
      success: true,
      message: "Your message has been sent successfully. We will get back to you shortly.",
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: (error as any).errors || error.issues,
      });
    }

    console.error("Error submitting contact form:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while sending your message. Please try again later.",
    });
  }
};
