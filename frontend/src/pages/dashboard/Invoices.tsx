import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { FileText, UploadCloud, Download, AlertCircle } from 'lucide-react';

interface Invoice {
  _id: string;
  booking: { _id: string; trackingId: string; deviceType: string; deviceModel: string } | string;
  amount: number;
  status: 'PENDING' | 'VERIFICATION_REQUIRED' | 'PAID' | 'CANCELLED';
  pdfUrl?: string;
  paymentProofUrl?: string;
  createdAt: string;
}

const statusConfig = {
  PENDING: { label: 'Pending Payment', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  VERIFICATION_REQUIRED: { label: 'Under Review', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  PAID: { label: 'Paid', className: 'bg-green-100 text-green-800 border-green-200' },
  CANCELLED: { label: 'Cancelled', className: 'bg-red-100 text-red-800 border-red-200' },
};

export default function Invoices() {
  const queryClient = useQueryClient();
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: invoices, isLoading, isError } = useQuery<Invoice[]>({
    queryKey: ['my-invoices'],
    queryFn: async () => {
      const res = await api.get('/invoices');
      return res.data.data;
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ invoiceId, file }: { invoiceId: string; file: File }) => {
      const formData = new FormData();
      formData.append('receipt', file);
      const res = await api.post(`/invoices/${invoiceId}/upload-payment`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Payment receipt submitted! Awaiting admin verification.');
      setUploadingId(null);
      setSelectedFile(null);
      queryClient.invalidateQueries({ queryKey: ['my-invoices'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to upload receipt');
    },
  });

  const getBookingInfo = (booking: Invoice['booking']) => {
    if (typeof booking === 'string') return { trackingId: 'N/A', device: 'N/A' };
    return {
      trackingId: booking.trackingId,
      device: `${booking.deviceType} - ${booking.deviceModel}`,
    };
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">My Invoices</h2>
        <p className="text-slate-500">View and pay your repair invoices.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <CardTitle>Invoices</CardTitle>
          </div>
          <CardDescription>All invoices associated with your repair bookings.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center py-8 text-slate-500">
              <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
              <p>Failed to load invoices. Please try again later.</p>
            </div>
          ) : !invoices || invoices.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No invoices yet. They will appear here once your repair is completed.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {invoices.map((inv) => {
                const { trackingId, device } = getBookingInfo(inv.booking);
                const config = statusConfig[inv.status];
                return (
                  <div key={inv._id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold text-slate-900">{device}</p>
                        <p className="text-sm text-slate-500">Tracking ID: <span className="font-mono">{trackingId}</span></p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xl font-bold text-blue-600">Rs. {inv.amount.toLocaleString()}</span>
                        <Badge className={`${config.className} hover:${config.className}`}>{config.label}</Badge>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {inv.pdfUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={inv.pdfUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="w-4 h-4 mr-2" />
                            Download PDF
                          </a>
                        </Button>
                      )}

                      {inv.status === 'PENDING' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setUploadingId(uploadingId === inv._id ? null : inv._id)}
                        >
                          <UploadCloud className="w-4 h-4 mr-2" />
                          Upload Receipt
                        </Button>
                      )}
                    </div>

                    {uploadingId === inv._id && (
                      <div className="bg-slate-50 border rounded-md p-4 space-y-3">
                        <p className="text-sm font-medium text-slate-700">Upload your QR payment screenshot:</p>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                          className="text-xs"
                        />
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                          disabled={!selectedFile || uploadMutation.isPending}
                          onClick={() => {
                            if (selectedFile) uploadMutation.mutate({ invoiceId: inv._id, file: selectedFile });
                          }}
                        >
                          {uploadMutation.isPending ? 'Uploading...' : 'Submit Receipt'}
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
