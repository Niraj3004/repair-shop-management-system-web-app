import mongoose, { Document, Schema } from "mongoose";

export interface ITestimonial extends Document {
  name: string;
  message: string;
  rating: number;
  profileImage?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

const testimonialSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    rating: { type: Number, default: 5, min: 1, max: 5 },
    profileImage: { type: String },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const Testimonial = mongoose.model<ITestimonial>("Testimonial", testimonialSchema);
