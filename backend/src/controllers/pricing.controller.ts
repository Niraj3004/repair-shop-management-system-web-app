import { Request, Response } from 'express';
import { Pricing } from '../models/pricing.model';
import { z } from 'zod';
import cloudinary from '../config/cloudinary.config';

const pricingSchema = z.object({
  deviceName: z.string().min(1, 'Device name is required'),
  category: z.string().min(1, 'Category is required'),
  serviceType: z.string().min(1, 'Service type is required'),
  price: z.number().min(0, 'Price cannot be negative'),
  estimatedTime: z.string().min(1, 'Estimated time is required'),
  status: z.enum(['Active', 'Inactive']).default('Active'),
  image: z.string().optional(),
});

export const getPublicPrices = async (req: Request, res: Response) => {
  try {
    const { search, category } = req.query;
    
    let query: any = { status: 'Active' };
    
    if (search) {
      query.$text = { $search: search as string };
    }
    
    if (category && category !== 'All') {
      query.category = category;
    }

    const prices = await Pricing.find(query).sort({ category: 1, deviceName: 1 });
    
    // Get unique categories for the filter
    const categories = await Pricing.distinct('category', { status: 'Active' });

    res.status(200).json({
      success: true,
      data: prices,
      categories: ['All', ...categories],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch prices',
    });
  }
};

export const getAllPrices = async (req: Request, res: Response) => {
  try {
    const prices = await Pricing.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: prices,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch prices',
    });
  }
};

export const createPrice = async (req: Request, res: Response) => {
  try {
    let imageUrl = undefined;
    if (req.file) {
      if (process.env.CLOUDINARY_API_KEY === "your_api_key" || !process.env.CLOUDINARY_API_KEY) {
        if (process.env.NODE_ENV === "development") {
          console.log("Cloudinary not configured, using placeholder image.");
          imageUrl = `https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg`;
        } else {
          return res.status(500).json({
            success: false,
            message: "Cloudinary configuration missing in production.",
          });
        }
      } else {
        const b64 = Buffer.from(req.file.buffer).toString("base64");
        let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
        const cldRes = await cloudinary.uploader.upload(dataURI, {
          folder: "wefixit/pricing",
        });
        imageUrl = cldRes.secure_url;
      }
    }

    // Convert price string to number from form-data if needed
    const bodyData = { ...req.body };
    if (bodyData.price) {
      bodyData.price = Number(bodyData.price);
    }
    if (imageUrl) {
      bodyData.image = imageUrl;
    }

    const validatedData = pricingSchema.parse(bodyData);
    // Strip undefined fields so Mongoose exactOptionalPropertyTypes is satisfied
    const cleanData = Object.fromEntries(Object.entries(validatedData).filter(([, v]) => v !== undefined));
    
    const price = await Pricing.create(cleanData);
    
    res.status(201).json({
      success: true,
      message: 'Price entry created successfully',
      data: price,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: (error as any).errors || (error as any).issues,
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to create price entry',
    });
  }
};

export const updatePrice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let imageUrl = undefined;
    
    if (req.file) {
      if (process.env.CLOUDINARY_API_KEY === "your_api_key" || !process.env.CLOUDINARY_API_KEY) {
        if (process.env.NODE_ENV === "development") {
          console.log("Cloudinary not configured, using placeholder image.");
          imageUrl = `https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg`;
        } else {
          return res.status(500).json({
            success: false,
            message: "Cloudinary configuration missing in production.",
          });
        }
      } else {
        const b64 = Buffer.from(req.file.buffer).toString("base64");
        let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
        const cldRes = await cloudinary.uploader.upload(dataURI, {
          folder: "wefixit/pricing",
        });
        imageUrl = cldRes.secure_url;
      }
    }

    const bodyData = { ...req.body };
    if (bodyData.price) {
      bodyData.price = Number(bodyData.price);
    }
    if (imageUrl) {
      bodyData.image = imageUrl;
    }

    const validatedData = pricingSchema.parse(bodyData);
    // Strip undefined fields so Mongoose exactOptionalPropertyTypes is satisfied
    const cleanData = Object.fromEntries(Object.entries(validatedData).filter(([, v]) => v !== undefined));
    
    const price = await Pricing.findByIdAndUpdate(
      id,
      cleanData,
      { new: true, runValidators: true }
    );
    
    if (!price) {
      return res.status(404).json({
        success: false,
        message: 'Price entry not found',
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Price entry updated successfully',
      data: price,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: (error as any).errors || (error as any).issues,
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to update price entry',
    });
  }
};

export const deletePrice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const price = await Pricing.findByIdAndDelete(id);
    
    if (!price) {
      return res.status(404).json({
        success: false,
        message: 'Price entry not found',
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Price entry deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete price entry',
    });
  }
};
