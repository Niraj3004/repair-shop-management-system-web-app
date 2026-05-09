import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { UploadCloud, X, User, Smartphone } from 'lucide-react';

const walkInBookingSchema = z.object({
  customerFirstName: z.string().min(1, 'First name is required'),
  customerLastName: z.string().optional(),
  customerEmail: z.string().email('Invalid email').or(z.literal('')).optional(),
  customerPhone: z.string().min(10, 'Phone number must be at least 10 digits'),
  deviceType: z.string().min(1, 'Device type is required'),
  deviceBrand: z.string().min(1, 'Brand is required'),
  deviceModel: z.string().min(1, 'Model is required'),
  issueDescription: z.string().min(10, 'Please describe the issue in detail (min 10 chars)'),
});

type WalkInBookingFormValues = z.infer<typeof walkInBookingSchema>;

export default function WalkInBooking() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<WalkInBookingFormValues>({
    resolver: zodResolver(walkInBookingSchema),
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setImages((prev) => [...prev, ...newFiles].slice(0, 5));
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const bookMutation = useMutation({
    mutationFn: async (data: WalkInBookingFormValues) => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });
      
      images.forEach((img) => {
        formData.append('images', img);
      });

      const response = await api.post('/booking', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Walk-in repair booked successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      navigate(`/admin/bookings/${data.data._id}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to book repair');
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: WalkInBookingFormValues) => {
    setIsSubmitting(true);
    bookMutation.mutate(data);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Walk-in Booking</h2>
        <p className="text-slate-500">Create a repair request for a physical walk-in customer.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-500" />
              Customer Information
            </CardTitle>
            <CardDescription>Enter details of the customer for tracking and contact.</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="customerFirstName">First Name</Label>
              <Input
                id="customerFirstName"
                placeholder="John"
                {...register('customerFirstName')}
                className={errors.customerFirstName ? 'border-red-500' : ''}
              />
              {errors.customerFirstName && <p className="text-sm text-red-500">{errors.customerFirstName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerLastName">Last Name</Label>
              <Input
                id="customerLastName"
                placeholder="Doe"
                {...register('customerLastName')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerPhone">Phone Number</Label>
              <Input
                id="customerPhone"
                placeholder="98XXXXXXXX"
                {...register('customerPhone')}
                className={errors.customerPhone ? 'border-red-500' : ''}
              />
              {errors.customerPhone && <p className="text-sm text-red-500">{errors.customerPhone.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerEmail">Email Address (Optional)</Label>
              <Input
                id="customerEmail"
                type="email"
                placeholder="john@example.com"
                {...register('customerEmail')}
                className={errors.customerEmail ? 'border-red-500' : ''}
              />
              {errors.customerEmail && <p className="text-sm text-red-500">{errors.customerEmail.message}</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-blue-500" />
              Device Details
            </CardTitle>
            <CardDescription>Specify the device and the problem description.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="deviceType">Device Type</Label>
                <Select onValueChange={(val: string) => setValue('deviceType', val)}>
                  <SelectTrigger className={errors.deviceType ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select device type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="smartphone">Smartphone</SelectItem>
                    <SelectItem value="laptop">Laptop</SelectItem>
                    <SelectItem value="tablet">Tablet</SelectItem>
                    <SelectItem value="smartwatch">Smartwatch</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.deviceType && <p className="text-sm text-red-500">{errors.deviceType.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="deviceBrand">Brand</Label>
                <Input
                  id="deviceBrand"
                  placeholder="e.g., Apple, Samsung, Dell"
                  {...register('deviceBrand')}
                  className={errors.deviceBrand ? 'border-red-500' : ''}
                />
                {errors.deviceBrand && <p className="text-sm text-red-500">{errors.deviceBrand.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deviceModel">Model</Label>
              <Input
                id="deviceModel"
                placeholder="e.g., iPhone 13 Pro, Galaxy S22, XPS 15"
                {...register('deviceModel')}
                className={errors.deviceModel ? 'border-red-500' : ''}
              />
              {errors.deviceModel && <p className="text-sm text-red-500">{errors.deviceModel.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="issueDescription">Issue Description</Label>
              <Textarea
                id="issueDescription"
                placeholder="Please describe what's wrong with the device in detail..."
                className={`min-h-[120px] ${errors.issueDescription ? 'border-red-500' : ''}`}
                {...register('issueDescription')}
              />
              {errors.issueDescription && <p className="text-sm text-red-500">{errors.issueDescription.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Device Photos (Optional, max 5)</Label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={images.length >= 5}
                />
                <div className="flex flex-col items-center justify-center space-y-2 text-slate-500">
                  <UploadCloud className="w-8 h-8 text-slate-400" />
                  <p className="text-sm font-medium">Click or drag images here</p>
                  <p className="text-xs">PNG, JPG up to 5MB</p>
                </div>
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative group rounded-md overflow-hidden border">
                      <img
                        src={URL.createObjectURL(img)}
                        alt={`Preview ${idx}`}
                        className="w-full h-24 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="pt-4 flex justify-end">
          <Button
            type="button"
            variant="outline"
            className="mr-4"
            onClick={() => navigate('/admin/bookings')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 h-11 px-8" disabled={isSubmitting}>
            {isSubmitting ? 'Creating Booking...' : 'Complete Walk-in Booking'}
          </Button>
        </div>
      </form>
    </div>
  );
}
