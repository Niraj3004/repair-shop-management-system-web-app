import { Testimonial, ITestimonial } from "../models/testimonial.model";

export const createTestimonialService = async (data: { name: string; message: string; rating?: number; profileImage?: string }): Promise<ITestimonial> => {
  const payload: any = {
    name: data.name,
    message: data.message,
    rating: data.rating || 5,
    status: "pending"
  };

  if (data.profileImage) {
    payload.profileImage = data.profileImage;
  }

  const testimonial = await Testimonial.create(payload);
  return testimonial;
};

export const getApprovedTestimonialsService = async (): Promise<ITestimonial[]> => {
  const testimonials = await Testimonial.find({ status: "approved" }).sort({ createdAt: -1 });
  return testimonials;
};

export const getAllTestimonialsService = async (page: number, limit: number, status?: string) => {
  const query: any = {};
  if (status && ["pending", "approved", "rejected"].includes(status)) {
    query.status = status;
  }

  const testimonials = await Testimonial.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await Testimonial.countDocuments(query);

  return {
    testimonials,
    total,
    page,
    limit
  };
};

export const updateTestimonialService = async (id: string, data: { status?: string; name?: string; message?: string; rating?: number }): Promise<ITestimonial | null> => {
  const testimonial = await Testimonial.findById(id);
  if (!testimonial) {
    return null;
  }

  if (data.status) testimonial.status = data.status as any;
  if (data.name) testimonial.name = data.name;
  if (data.message) testimonial.message = data.message;
  if (data.rating) testimonial.rating = data.rating;

  await testimonial.save();
  return testimonial;
};

export const deleteTestimonialService = async (id: string): Promise<ITestimonial | null> => {
  const testimonial = await Testimonial.findByIdAndDelete(id);
  return testimonial;
};
