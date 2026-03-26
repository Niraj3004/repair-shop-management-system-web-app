import mongoose, { Schema, Document } from "mongoose";
import { REPAIR_STATUS } from "../constants/status";

export interface IRepairStatus extends Document {
  bookingId: mongoose.Types.ObjectId;
  status: string;
  notes?: string;
  isInternal: boolean;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const repairStatusSchema = new Schema<IRepairStatus>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(REPAIR_STATUS),
      required: true,
    },
    notes: {
      type: String,
    },
    isInternal: {
      type: Boolean,
      default: false,
    },
    updatedBy: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IRepairStatus>("RepairStatus", repairStatusSchema);
