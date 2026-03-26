import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { FileText, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

interface Invoice {
  _id: string;
  booking: { _id: string; trackingId: string; deviceType: string; deviceModel: string } | string;
  user: { _id: string; firstName: string; lastName: string; email: string } | string;
  amount: number;
  status: 'PENDING' | 'VERIFICATION_REQUIRED' | 'PAID' | 'CANCELLED';
  pdfUrl?: string;
  paymentProofUrl?: string;
  createdAt: string;
}

const statusConfig = {
  PENDING: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
  VERIFICATION_REQUIRED: { label: 'Verify Payment', className: 'bg-blue-100 text-blue-800' },
  PAID: { label: 'Paid', className: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'Cancelled', className: 'bg-red-100 text-red-800' },
};

export default function AdminInvoices() {
  const queryClient = useQueryClient();

  const { data: invoices, isLoading, isError, refetch } = useQuery<Invoice[]>({
    queryKey: ['admin-invoices'],
    queryFn: async () => {
      const res = await api.get('/admin/invoices');
      return res.data.data;
    },
  });

  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  const handleDownload = async (invoiceId: string, bookingId: string, trackingId: string) => {
    try {
      setIsDownloading(invoiceId);
      const res = await api.get(`/booking/${bookingId}/invoice`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice-${trackingId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Invoice downloaded successfully');
    } catch (error: any) {
      toast.error('Failed to download invoice');
    } finally {
      setIsDownloading(null);
    }
  };

  const verifyMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: 'APPROVE' | 'REJECT' }) => {
      await api.put(`/admin/invoice/${id}/verify`, { action });
    },
    onSuccess: (_, variables) => {
      toast.success(`Payment ${variables.action.toLowerCase()}d successfully!`);
      queryClient.invalidateQueries({ queryKey: ['admin-invoices'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to verify payment');
    },
  });

  const getUser = (user: Invoice['user']) => {
    if (typeof user === 'string') return { name: 'N/A', email: '' };
    return { name: `${user.firstName} ${user.lastName}`, email: user.email };
  };

  const getBooking = (booking: Invoice['booking']) => {
    if (typeof booking === 'string') return { trackingId: 'N/A', device: 'N/A' };
    return { trackingId: booking.trackingId, device: `${booking.deviceType} - ${booking.deviceModel}` };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Invoices</h2>
          <p className="text-slate-500">Manage and verify client payments.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <CardTitle>All Invoices</CardTitle>
          </div>
          <CardDescription>Review uploaded payment proofs and mark as verified.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center py-8 text-slate-500">
              <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
              <p>Failed to load invoices.</p>
            </div>
          ) : !invoices || invoices.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No invoices found.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Tracking ID</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment Proof</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((inv) => {
                    const { name, email } = getUser(inv.user);
                    const { trackingId, device } = getBooking(inv.booking);
                    const config = statusConfig[inv.status];
                    return (
                      <TableRow key={inv._id}>
                        <TableCell>
                          <div className="font-medium">{name}</div>
                          <div className="text-xs text-slate-500">{email}</div>
                        </TableCell>
                        <TableCell className="text-sm">{device}</TableCell>
                        <TableCell className="font-mono text-xs">{trackingId}</TableCell>
                        <TableCell className="text-right font-semibold">Rs. {inv.amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge className={`${config.className} hover:${config.className}`}>{config.label}</Badge>
                        </TableCell>
                        <TableCell>
                          {inv.paymentProofUrl ? (
                            <a
                              href={inv.paymentProofUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-sm"
                            >
                              View Screenshot
                            </a>
                          ) : (
                            <span className="text-slate-400 text-sm">Not uploaded</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 justify-start text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              onClick={() => handleDownload(inv._id, typeof inv.booking === 'string' ? inv.booking : inv.booking._id, trackingId)}
                              disabled={isDownloading === inv._id}
                            >
                              <FileText className="w-4 h-4 mr-2" />
                              {isDownloading === inv._id ? '...' : 'PDF'}
                            </Button>

                            {(inv.status === 'PENDING' || inv.status === 'VERIFICATION_REQUIRED') && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  className="h-8 bg-green-600 hover:bg-green-700 text-white"
                                  disabled={verifyMutation.isPending}
                                  onClick={() => verifyMutation.mutate({ id: inv._id, action: 'APPROVE' })}
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Approve
                                </Button>
                                {inv.status === 'VERIFICATION_REQUIRED' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    disabled={verifyMutation.isPending}
                                    onClick={() => verifyMutation.mutate({ id: inv._id, action: 'REJECT' })}
                                  >
                                    Reject
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
