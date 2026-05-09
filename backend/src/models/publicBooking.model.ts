import mongoose, { Schema, Document } from "mongoose";

export interface IPublicBooking extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  notes?: string;
  deviceType?: string;
  deviceBrand?: string;
  deviceModel?: string;
  issueDescription?: string;
  deviceImages?: string[];
  status: "pending" | "approved" | "rejected";
  trackingId: string;
  createdAt: Date;
  updatedAt: Date;
}

const publicBookingSchema = new Schema<IPublicBooking>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    notes: { type: String },
    deviceType: { type: String },
    deviceBrand: { type: String },
    deviceModel: { type: String },
    issueDescription: { type: String },
    deviceImages: { type: [String], default: [] },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    trackingId: { type: String, required: true, unique: true },
  },
  { timestamps: true },
);

export default mongoose.model<IPublicBooking>("PublicBooking", publicBookingSchema);
