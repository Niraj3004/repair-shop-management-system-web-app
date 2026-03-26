import mongoose, { Schema, Document } from "mongoose";
import { REPAIR_STATUS } from "../constants/status";

export interface IBooking extends Document {
  user: mongoose.Types.ObjectId;
  trackingId: string;
  deviceType: string;
  deviceBrand: string;
  deviceModel: string;
  issueDescription: string;
  deviceImages?: string[];
  currentStatus: string;
  price?: number;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    trackingId: { type: String, required: true, unique: true, index: true },
    deviceType: { type: String, required: true },
    deviceBrand: { type: String, required: true },
    deviceModel: { type: String, required: true },
    issueDescription: { type: String, required: true },
    deviceImages: { type: [String], default: [] },
    price: { type: Number, default: 0 },
    currentStatus: {
      type: String,
      enum: Object.values(REPAIR_STATUS),
      default: REPAIR_STATUS.PENDING_DROP_OFF,
    },
  },
  { timestamps: true },
);

export default mongoose.model<IBooking>("Booking", bookingSchema);