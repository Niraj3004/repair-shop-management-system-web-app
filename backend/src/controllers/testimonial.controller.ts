import { Request, Response, NextFunction } from "express";
import * as testimonialService from "../services/testimonial.service";
import { STATUS_CODES } from "../constants/statuscode";
import { catchAsyncError } from "../middlewares/asyncErrorHandle";
import { IExtendRequest } from "../middlewares/auth.middleware";

import cloudinary from "../config/cloudinary.config";

// Public: Submit a new testimonial
export const createTestimonial = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    let profileImage = undefined;

    if (req.file) {
      if (process.env.CLOUDINARY_API_KEY === "your_api_key" || !process.env.CLOUDINARY_API_KEY) {
        if (process.env.NODE_ENV === "development") {
          console.log("Cloudinary not configured, using placeholder image.");
          profileImage = `https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg`;
        } else {
          res.status(STATUS_CODES.INTERNAL_SERVER_ERROR);
          throw new Error("Cloudinary configuration missing in production.");
        }
      } else {
        const b64 = Buffer.from(req.file.buffer).toString("base64");
        let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
        const cldRes = await cloudinary.uploader.upload(dataURI, {
          folder: "wefixit/testimonials",
        });
        profileImage = cldRes.secure_url;
      }
    }

    const payload = {
      ...req.body,
      profileImage,
    };

    const testimonial = await testimonialService.createTestimonialService(payload);

    res.status(STATUS_CODES.CREATED).json({
      success: true,
      message: "Testimonial submitted successfully and is pending review",
      data: testimonial,
    });
  },
);

// Public: Get all approved testimonials for landing page
export const getApprovedTestimonials = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const testimonials =
      await testimonialService.getApprovedTestimonialsService();

    res.status(STATUS_CODES.OK).json({
      success: true,
      data: testimonials,
    });
  },
);

// Admin: Get all testimonials with optional filtering
export const getAllTestimonials = catchAsyncError(
  async (req: IExtendRequest, res: Response, next: NextFunction) => {
    const status = req.query.status as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await testimonialService.getAllTestimonialsService(
      page,
      limit,
      status,
    );

    res.status(STATUS_CODES.OK).json({
      success: true,
      count: result.testimonials.length,
      total: result.total,
      totalPages: Math.ceil(result.total / result.limit),
      currentPage: result.page,
      data: result.testimonials,
    });
  },
);

// Admin: Update testimonial status or content
export const updateTestimonial = catchAsyncError(
  async (req: IExtendRequest, res: Response, next: NextFunction) => {
    const id = req.params.id as string;

    const testimonial = await testimonialService.updateTestimonialService(
      id,
      req.body,
    );

    if (!testimonial) {
      res.status(STATUS_CODES.NOT_FOUND);
      throw new Error("Testimonial not found");
    }

    res.status(STATUS_CODES.OK).json({
      success: true,
      message: "Testimonial updated successfully",
      data: testimonial,
    });
  },
);

// Admin: Delete a testimonial
export const deleteTestimonial = catchAsyncError(
  async (req: IExtendRequest, res: Response, next: NextFunction) => {
    const id = req.params.id as string;

    const testimonial = await testimonialService.deleteTestimonialService(id);

    if (!testimonial) {
      res.status(STATUS_CODES.NOT_FOUND);
      throw new Error("Testimonial not found");
    }

    res.status(STATUS_CODES.OK).json({
      success: true,
      message: "Testimonial deleted successfully",
    });
  },
);
