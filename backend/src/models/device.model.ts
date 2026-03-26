import mongoose, { Schema, Document } from "mongoose";

export interface IDevice extends Document {
  brand: string;
  modelName: string;
  category: string; // e.g., 'Smartphone', 'Laptop', 'Tablet'
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const deviceSchema = new Schema<IDevice>(
  {
    brand: { type: String, required: true },
    modelName: { type: String, required: true },
    category: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IDevice>("Device", deviceSchema);
