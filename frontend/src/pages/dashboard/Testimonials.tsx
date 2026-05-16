import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { MessageSquare, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/store/authStore';
import { ImagePlus, X } from 'lucide-react';

const testimonialSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  rating: z.number().min(1).max(5),
  profileImage: z.any().optional(),
});

type TestimonialFormValues = z.infer<typeof testimonialSchema>;

export default function SubmitTestimonial() {
  const { user } = useAuthStore();
  const [rating, setRating] = useState<number>(5);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TestimonialFormValues>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      name: user ? `${user.firstName} ${user.lastName}` : '',
      message: '',
      rating: 5,
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: TestimonialFormValues) => {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('message', data.message);
      formData.append('rating', data.rating.toString());
      if (imageFile) {
        formData.append('profileImage', imageFile);
      }

      const res = await api.post('/testimonials', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Your testimonial is under review', {
        description: 'Thank you for your feedback!'
      });
      reset({ name: user ? `${user.firstName} ${user.lastName}` : '', message: '', rating: 5 });
      setRating(5);
      setImageFile(null);
      setImagePreview(null);
    },
    onError: (error: any) => {
      toast.error('Failed to submit testimonial', {
        description: error.response?.data?.message || 'Please try again later.',
      });
    },
  });

  const onSubmit = (data: TestimonialFormValues) => {
    submitMutation.mutate(data);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image is too large. Max size is 5MB.');
        return;
      }
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Leave a Review</h2>
              <p className="text-slate-500">Share your experience with our services.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Enter your full name"
                className="w-full"
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Profile Picture (Optional)</Label>
              <div className="flex items-center gap-4">
                {imagePreview ? (
                  <div className="relative w-20 h-20 rounded-full border border-slate-200 overflow-hidden">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity"
                    >
                      <X className="w-6 h-6 text-white" />
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50">
                    <ImagePlus className="w-6 h-6 text-slate-400" />
                  </div>
                )}
                <div>
                  <Label
                    htmlFor="profileImage"
                    className="cursor-pointer bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                  >
                    Upload Image
                  </Label>
                  <input
                    id="profileImage"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <p className="text-xs text-slate-500 mt-2">JPG, PNG or GIF. Max size of 5MB.</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => {
                      setRating(star);
                      setValue('rating', star);
                    }}
                    className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {errors.rating && <p className="text-sm text-red-500">{errors.rating.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Your Experience</Label>
              <Textarea
                id="message"
                {...register('message')}
                placeholder="Tell us what you loved about our service..."
                className="w-full min-h-[120px]"
              />
              {errors.message && <p className="text-sm text-red-500">{errors.message.message}</p>}
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg font-semibold"
              disabled={isSubmitting || submitMutation.isPending}
            >
              {isSubmitting || submitMutation.isPending ? 'Submitting...' : 'Submit Testimonial'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
