import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';

export default function PublicBooking() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successTrackingId, setSuccessTrackingId] = useState<string | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files) as File[];
      if (images.length + newFiles.length > 5) {
        toast.error('Maximum 5 images allowed');
        return;
      }
      setImages((prev) => [...prev, ...newFiles]);
      
      // Create preview URLs
      const newUrls = newFiles.map(file => URL.createObjectURL(file));
      setImageUrls((prev) => [...prev, ...newUrls]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    URL.revokeObjectURL(imageUrls[index]);
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      
      // Append images
      images.forEach((image) => {
        formData.append('images', image);
      });

      const response = await api.post('/booking', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccessTrackingId(response.data.data.trackingId);
      toast.success(response.data.message);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit booking request');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successTrackingId) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full mx-auto text-center space-y-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Request Submitted!</h2>
            <p className="text-slate-600 mb-6">
              Your repair request has been successfully sent to our technicians. We will review it shortly.
            </p>
            
            <div className="bg-slate-50 rounded-xl p-4 mb-8">
              <p className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-1">Your Tracking ID</p>
              <p className="text-3xl font-bold text-blue-600 tracking-widest">{successTrackingId}</p>
            </div>

            <p className="text-sm text-slate-500 mb-8">
              You will receive an email once your request is approved containing your login credentials to track your repair.
            </p>

            <Button onClick={() => navigate('/')} className="w-full" size="lg">
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Card className="border-0 shadow-lg shadow-slate-200/50">
          <CardHeader className="text-center pb-8 border-b border-slate-100">
            <CardTitle className="text-3xl font-bold text-slate-900">Book a Repair</CardTitle>
            <CardDescription className="text-base mt-2">
              Fill out the form below to submit a repair request. You do not need an account—we will create one for you upon approval.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm">1</span>
                  Personal Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name <span className="text-red-500">*</span></Label>
                    <Input id="firstName" name="customerFirstName" required placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name <span className="text-red-500">*</span></Label>
                    <Input id="lastName" name="customerLastName" required placeholder="Doe" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
                    <Input id="email" name="customerEmail" type="email" required placeholder="john@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
                    <Input id="phone" name="customerPhone" required placeholder="+977 98..." />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address <span className="text-red-500">*</span></Label>
                  <Input id="address" name="customerAddress" required placeholder="Kathmandu, Nepal" />
                </div>
              </div>

              <div className="border-t border-slate-100"></div>

              {/* Device Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm">2</span>
                  Device Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="deviceType">Device Type <span className="text-red-500">*</span></Label>
                    <Input id="deviceType" name="deviceType" required placeholder="Phone, Laptop..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deviceBrand">Brand <span className="text-red-500">*</span></Label>
                    <Input id="deviceBrand" name="deviceBrand" required placeholder="Apple, Samsung..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deviceModel">Model <span className="text-red-500">*</span></Label>
                    <Input id="deviceModel" name="deviceModel" required placeholder="iPhone 13 Pro" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="issueDescription">Issue Description <span className="text-red-500">*</span></Label>
                  <Textarea 
                    id="issueDescription" 
                    name="issueDescription" 
                    required 
                    placeholder="Describe the problem you are experiencing with your device..."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea 
                    id="notes" 
                    name="notes" 
                    placeholder="Any specific requests or information we should know?"
                    className="min-h-[80px]"
                  />
                </div>
              </div>

              <div className="border-t border-slate-100"></div>

              {/* Device Images */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm">3</span>
                  Device Images (Optional)
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('images')?.click()}
                      className="border-dashed border-2 border-slate-300 hover:border-blue-500 hover:text-blue-600 transition-colors"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Images (Max 5)
                    </Button>
                    <Input
                      id="images"
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageChange}
                    />
                    <span className="text-sm text-slate-500">
                      {images.length}/5 images selected
                    </span>
                  </div>

                  {imageUrls.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                      {imageUrls.map((url, index) => (
                        <div key={index} className="relative group rounded-lg overflow-hidden border border-slate-200 aspect-square">
                          <img src={url} alt="Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-6">
                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting Request...' : 'Submit Repair Request'}
                </Button>
                <p className="text-center text-sm text-slate-500 mt-4">
                  By submitting this form, you agree to our terms of service.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
