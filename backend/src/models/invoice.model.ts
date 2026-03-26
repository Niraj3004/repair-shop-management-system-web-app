import mongoose, { Schema, Document } from "mongoose";

export interface IInvoice extends Document {
  booking: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  amount: number;
  status: 'PENDING' | 'VERIFICATION_REQUIRED' | 'PAID' | 'CANCELLED';
  dueDate?: Date;
  pdfUrl?: string; // Link to the uploaded PDF invoice (e.g. S3 or Cloudinary)
  paymentProofUrl?: string; // Uploaded manual payment QR screenshot
  createdAt: Date;
  updatedAt: Date;
}

const invoiceSchema = new Schema<IInvoice>(
  {
    booking: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ['PENDING', 'VERIFICATION_REQUIRED', 'PAID', 'CANCELLED'],
      default: 'PENDING',
    },
    dueDate: { type: Date },
    pdfUrl: { type: String },
    paymentProofUrl: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IInvoice>("Invoice", invoiceSchema);
