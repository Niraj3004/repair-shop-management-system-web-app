import mongoose, { Document, Schema } from 'mongoose';

export interface IPricing extends Document {
  deviceName: string;
  category: string;
  serviceType: string;
  price: number;
  estimatedTime: string;
  image?: string;
  status: 'Active' | 'Inactive';
  createdAt: Date;
  updatedAt: Date;
}

const pricingSchema = new Schema<IPricing>(
  {
    deviceName: {
      type: String,
      required: [true, 'Device name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required (e.g., Mobile, Laptop)'],
      trim: true,
    },
    serviceType: {
      type: String,
      required: [true, 'Service type is required (e.g., Screen Repair)'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    estimatedTime: {
      type: String,
      required: [true, 'Estimated time is required (e.g., 2 Hours)'],
      trim: true,
    },
    image: {
      type: String,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster searching
pricingSchema.index({ deviceName: 'text', serviceType: 'text' });
pricingSchema.index({ category: 1 });
pricingSchema.index({ status: 1 });

export const Pricing = mongoose.model<IPricing>('Pricing', pricingSchema);
