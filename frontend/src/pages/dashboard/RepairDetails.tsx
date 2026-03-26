import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, CheckCircle2, Clock, UploadCloud, Download, FileText, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface TrackingTimeline {
  _id: string;
  status: string;
  notes: string;
  createdAt: string;
}

interface BookingDetails {
  _id: string;
  trackingId: string;
  deviceType: string;
  deviceBrand: string;
  deviceModel: string;
  issueDescription: string;
  deviceImages: string[];
  currentStatus: string;
  price?: number;
  createdAt: string;
  timeline: TrackingTimeline[];
  invoice?: {
    _id: string;
    invoiceNumber: string;
    amount: number;
    pdfUrl: string;
    status: string;
  };
}

export default function RepairDetails() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const { data: booking, isLoading, isError } = useQuery<BookingDetails>({
    queryKey: ['booking', id],
    queryFn: async () => {
      const res = await api.get(`/booking/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });

  const uploadReceiptMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!booking?.invoice?._id) throw new Error('No invoice found');
      const formData = new FormData();
      formData.append('receipt', file);
      
      const res = await api.post(`/invoices/${booking.invoice._id}/upload-payment`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Payment receipt uploaded successfully. Awaiting verification.');
      queryClient.invalidateQueries({ queryKey: ['booking', id] });
      setReceiptFile(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to upload receipt');
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setReceiptFile(e.target.files[0]);
    }
  };

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadInvoice = async () => {
    if (!booking?._id) return;
    try {
      setIsDownloading(true);
      const res = await api.get(`/booking/${booking._id}/invoice`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice-${booking.trackingId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Invoice downloaded successfully');
    } catch (error: any) {
      toast.error('Failed to download invoice');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleUploadReceipt = () => {
    if (receiptFile) {
      uploadReceiptMutation.mutate(receiptFile);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('completed')) {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">Completed</Badge>;
    }
    if (s.includes('cancelled')) {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200">Cancelled</Badge>;
    }
    if (s.includes('pending')) {
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">Pending</Badge>;
    }
    if (s.includes('diagnosing') || s.includes('progress') || s.includes('repairing')) {
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">{status}</Badge>;
    }
    if (s.includes('pickup') || s.includes('ready')) {
      return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100 border-purple-200">{status}</Badge>;
    }
    return <Badge variant="outline">{status}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isError || !booking) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <h3 className="text-lg font-medium text-slate-900 mb-2">Error loading details</h3>
        <p>We couldn't find the repair details you're looking for.</p>
        <Link to="/dashboard" className="mt-4">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/dashboard">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3">
            Repair Details
            {getStatusBadge(booking.currentStatus)}
          </h2>
          <p className="text-slate-500">Tracking ID: {booking.trackingId}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Device Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                <div>
                  <p className="text-sm font-medium text-slate-500">Device Type</p>
                  <p className="text-base font-semibold capitalize">{booking.deviceType}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Brand</p>
                  <p className="text-base font-semibold">{booking.deviceBrand}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-slate-500">Model</p>
                  <p className="text-base font-semibold">{booking.deviceModel}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-slate-500">Issue Description</p>
                  <p className="text-base mt-1 text-slate-700 bg-slate-50 p-3 rounded-md border">{booking.issueDescription}</p>
                </div>
              </div>

              {booking.deviceImages && booking.deviceImages.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm font-medium text-slate-500 mb-2">Uploaded Images</p>
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {booking.deviceImages.map((img, idx) => (
                      <img key={idx} src={img} alt={`Device issue ${idx + 1}`} className="h-24 w-24 object-cover rounded-md border" />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Repair Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {booking.timeline && booking.timeline.length > 0 ? (
                <div className="relative border-l-2 border-slate-200 ml-4 space-y-8 pb-4">
                  {booking.timeline.map((item, index) => (
                    <div key={index} className="relative pl-8">
                      <div className="absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-white border-4 border-blue-600"></div>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-1">
                        <h4 className="text-base font-semibold text-slate-900 capitalize">{item.status}</h4>
                        <time className="text-xs text-slate-500">
                          {new Date(item.createdAt).toLocaleString()}
                        </time>
                      </div>
                      <p className="text-sm text-slate-600">{item.notes}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-center py-4">No timeline updates yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pricing & Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-700 font-semibold">Price</span>
                <span className="font-bold text-lg text-blue-600">
                  {booking.price ? `Rs. ${booking.price}` : 'TBD'}
                </span>
              </div>

              {booking.invoice && (
                <div className="mt-6 pt-6 border-t space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-900 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      Invoice Generated
                    </span>
                    <Badge variant={booking.invoice.status === 'PAID' ? 'default' : 'secondary'} className={booking.invoice.status === 'PAID' ? 'bg-green-600' : ''}>
                      {booking.invoice.status}
                    </Badge>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={handleDownloadInvoice}
                    disabled={isDownloading}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {isDownloading ? 'Downloading...' : 'Download Invoice PDF'}
                  </Button>

                  {(booking.invoice.status === 'PENDING' || booking.invoice.status === 'UNPAID') && (
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mt-4">
                      <div className="flex flex-col items-center justify-center p-3 bg-white rounded-lg border mb-4 shadow-sm">
                        <img 
                          src="/src/assets/esewa-qr.png" 
                          alt="eSewa QR Code" 
                          className="w-48 h-48 object-contain mb-2"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://placehold.co/200x200?text=Scan+QR+to+Pay";
                          }}
                        />
                        <p className="font-bold text-slate-800 text-sm">Shreekesh Devi</p>
                        <p className="text-xs text-slate-500">eSewa: 9821166498</p>
                      </div>
                      
                      <h4 className="font-medium text-sm mb-2">Upload Payment Receipt</h4>
                      <p className="text-xs text-slate-500 mb-3">Please scan the QR code above and upload the payment screenshot here.</p>
                      
                      <div className="space-y-3">
                        <Input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleFileChange}
                          className="text-xs"
                        />
                        <Button 
                          className="w-full bg-blue-600 hover:bg-blue-700" 
                          disabled={!receiptFile || uploadReceiptMutation.isPending}
                          onClick={handleUploadReceipt}
                        >
                          {uploadReceiptMutation.isPending ? 'Uploading...' : 'Submit Receipt'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Public Tracking</CardTitle>
              <CardDescription>Share this ID to track status publicly.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-100 p-3 rounded-md text-center font-mono text-lg font-bold tracking-widest text-slate-800">
                {booking.trackingId}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
