import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  currentAddress: string;
  password?: string;
  role: string;
  otp?: string | undefined;
  otpExpiry?: Date | undefined;
  isVerified: boolean;
}

const userSchema = new Schema<IUser>(
  {
    firstName: String,
    lastName: String,
    phone: String,
    email: { type: String, unique: true },
    currentAddress: String,
    password: { type: String, required: false },
    role: { type: String, default: "client" },
    otp: String,
    otpExpiry: Date,
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.model<IUser>("User", userSchema);
