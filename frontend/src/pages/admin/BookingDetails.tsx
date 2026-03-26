import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, CheckCircle2, Clock, FileText, Upload, Check, AlertCircle, Wrench, Package, Truck, XCircle, FileCheck } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Booking {
  _id: string;
  trackingId: string;
  deviceType: string;
  deviceBrand: string;
  deviceModel: string;
  issueDescription: string;
  currentStatus: string;
  price?: number;
  deviceImages?: string[];
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  timeline?: {
    status: string;
    notes: string;
    createdAt: string;
    isInternal: boolean;
  }[];
}

export default function AdminBookingDetails() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  
  const [newStatus, setNewStatus] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [trackingMessage, setTrackingMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);

  // Fetch Booking
  const { data: booking, isLoading: isBookingLoading } = useQuery<Booking>({
    queryKey: ['admin-booking', id],
    queryFn: async () => {
      const res = await api.get(`/admin/booking/${id}`);
      return res.data.data;
    }
  });

  useEffect(() => {
    if (booking) {
      if (!newStatus) setNewStatus(booking.currentStatus);
      if (!newPrice && booking.price) setNewPrice(booking.price.toString());
    }
  }, [booking]);

  // Fetch Invoice
  const { data: invoice, isLoading: isInvoiceLoading } = useQuery({
    queryKey: ['admin-invoice', id],
    queryFn: async () => {
      try {
        const res = await api.get(`/invoice/booking/${id}`);
        return res.data;
      } catch (err: any) {
        if (err.response?.status === 404) return null;
        throw err;
      }
    },
    enabled: !!id,
  });

  // Mutations
  const updateBookingMutation = useMutation({
    mutationFn: async (data: { status: string; price?: number }) => {
      await api.put(`/admin/booking/${id}`, data);
    },
    onSuccess: () => {
      toast.success('Booking updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-booking', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update booking');
    }
  });

  const addTrackingMutation = useMutation({
    mutationFn: async (data: { status: string; message: string; isInternal: boolean }) => {
      await api.put(`/admin/tracking/${id}`, data);
    },
    onSuccess: () => {
      toast.success('Tracking update added');
      setTrackingMessage('');
      queryClient.invalidateQueries({ queryKey: ['admin-booking', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add tracking update');
    }
  });

  const generateInvoiceMutation = useMutation({
    mutationFn: async () => {
      await api.post('/admin/invoice/generate', { bookingId: id });
    },
    onSuccess: () => {
      toast.success('Invoice generated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-invoice', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to generate invoice');
    }
  });

  const verifyPaymentMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      await api.put(`/admin/invoice/${invoiceId}/verify`, { action: 'APPROVE' });
    },
    onSuccess: () => {
      toast.success('Payment approved successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-invoice', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-booking', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to approve payment');
    }
  });

  if (isBookingLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!booking) {
    return <div>Booking not found.</div>;
  }

  const handleUpdateBooking = () => {
    const data: any = { status: newStatus };
    if (newPrice) data.price = Number(newPrice);
    updateBookingMutation.mutate(data);
  };

  const handleAddTracking = () => {
    if (!trackingMessage) {
      toast.error('Please enter a message');
      return;
    }
    addTrackingMutation.mutate({
      status: newStatus,
      message: trackingMessage,
      isInternal
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link to="/admin/bookings">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3">
            Booking Details
            <Badge variant="outline" className="font-mono bg-white">{booking.trackingId}</Badge>
          </h2>
          <p className="text-slate-500">Manage repair status, tracking, and invoicing.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details & Updates */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Device & Issue Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Device Type</p>
                  <p className="font-medium">{booking.deviceType}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Brand</p>
                  <p className="font-medium">{booking.deviceBrand}</p>
                </div>
                 <div>
                  <p className="text-sm text-slate-500 mb-1">Model</p>
                  <p className="font-medium">{booking.deviceModel}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Created At</p>
                  <p className="font-medium">{format(new Date(booking.createdAt), 'MMM d, yyyy')}</p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-slate-500 mb-2">Issue Description</p>
                <p className="text-slate-800 bg-slate-50 p-4 rounded-md border">{booking.issueDescription}</p>
              </div>

              {booking.deviceImages && booking.deviceImages.length > 0 && (
                <div>
                  <p className="text-sm text-slate-500 mb-2">Uploaded Images</p>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {booking.deviceImages.map((img: string, i: number) => (
                      <a key={i} href={img} target="_blank" rel="noopener noreferrer" className="shrink-0">
                        <img src={img} alt={`Issue ${i+1}`} className="h-24 w-24 object-cover rounded-md border hover:opacity-80 transition-opacity" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tracking Timeline</CardTitle>
              <CardDescription>Add updates to the repair timeline.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-lg border space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Status Context</Label>
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending Drop-off">Pending Drop-off</SelectItem>
                        <SelectItem value="Diagnosing">Diagnosing</SelectItem>
                        <SelectItem value="Waiting for Parts">Waiting for Parts</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Ready for Pickup">Ready for Pickup</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Visibility</Label>
                    <Select value={isInternal ? 'internal' : 'public'} onValueChange={(v) => setIsInternal(v === 'internal')}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public (Visible to Customer)</SelectItem>
                        <SelectItem value="internal">Internal Note (Hidden)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Update Message</Label>
                  <Textarea 
                    placeholder="E.g., Diagnostics complete. Motherboard needs replacement."
                    value={trackingMessage}
                    onChange={(e) => setTrackingMessage(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleAddTracking} 
                  disabled={addTrackingMutation.isPending}
                  className="w-full"
                >
                  {addTrackingMutation.isPending ? 'Adding...' : 'Add Timeline Update'}
                </Button>
              </div>

              <div className="relative border-l-2 border-slate-200 ml-3 pl-6 space-y-6 mt-8">
                {booking.timeline?.map((item: any, index: number) => (
                  <div key={index} className="relative">
                    <div className={`absolute -left-[35px] h-6 w-6 rounded-full border-4 border-white flex items-center justify-center ${item.isInternal ? 'bg-slate-400' : 'bg-blue-500'}`}>
                      {item.isInternal ? <AlertCircle className="w-3 h-3 text-white" /> : <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-slate-800">{item.status}</h4>
                        {item.isInternal && <Badge variant="secondary" className="text-[10px] h-5">Internal</Badge>}
                      </div>
                      <span className="text-xs text-slate-500 font-medium">
                        {format(new Date(item.createdAt), 'MMM d, yyyy • h:mm a')}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 bg-white p-3 rounded-md border shadow-sm mt-2">{item.notes}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Actions & Invoice */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-slate-500">Name</p>
                <p className="font-medium">{booking.user.firstName} {booking.user.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Email</p>
                <p className="font-medium">{booking.user.email}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Phone</p>
                <p className="font-medium">{booking.user.phone}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 shadow-sm">
            <CardHeader className="bg-blue-50 border-b border-blue-100 pb-4">
              <CardTitle className="text-blue-800">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Current Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending Drop-off">Pending Drop-off</SelectItem>
                    <SelectItem value="Diagnosing">Diagnosing</SelectItem>
                    <SelectItem value="Waiting for Parts">Waiting for Parts</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Ready for Pickup">Ready for Pickup</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Estimated Price (Rs.)</Label>
                <Input 
                  type="number" 
                  placeholder="0.00" 
                  value={newPrice} 
                  onChange={(e) => setNewPrice(e.target.value)}
                />
              </div>

              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700" 
                onClick={handleUpdateBooking}
                disabled={updateBookingMutation.isPending}
              >
                {updateBookingMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-500" />
                Invoice & Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!invoice ? (
                <div className="text-center py-4 space-y-4">
                  <p className="text-sm text-slate-500">No invoice generated yet.</p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => generateInvoiceMutation.mutate()}
                    disabled={generateInvoiceMutation.isPending || !booking.price}
                  >
                    {generateInvoiceMutation.isPending ? 'Generating...' : 'Generate Invoice'}
                  </Button>
                  {!booking.price && (
                    <p className="text-xs text-red-500">Set an estimated price first.</p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-md border">
                    <div>
                      <CardTitle className="text-sm font-medium text-slate-800">Invoice {invoice.invoiceNumber || invoice._id.substring(0,8).toUpperCase()}</CardTitle>
                      <p className="text-xs text-slate-500">Rs. {invoice.amount}</p>
                    </div>
                    <Badge variant={invoice.status === 'PAID' ? 'default' : 'secondary'} className={invoice.status === 'PAID' ? 'bg-green-600 font-bold' : ''}>
                      {invoice.status}
                    </Badge>
                  </div>

                   {(invoice.status === 'VERIFICATION_REQUIRED' || invoice.status === 'PENDING') && (
                    <div className="space-y-3 border p-3 rounded-md border-blue-200 bg-blue-50 mt-4">
                      {invoice.paymentProofUrl ? (
                         <div className="space-y-2">
                           <p className="text-sm font-medium text-blue-800 flex items-center gap-2">
                             <AlertCircle className="w-4 h-4" />
                             Review Proof of Payment
                           </p>
                           <a 
                             href={invoice.paymentProofUrl} 
                             target="_blank" 
                             rel="noopener noreferrer"
                             className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                           >
                             <FileCheck className="w-4 h-4" />
                             View Receipt
                           </a>
                         </div>
                      ) : (
                         <p className="text-sm text-slate-600 mb-2">Manual Payment (No proof uploaded)</p>
                      )}
                      
                      <div className="flex gap-2">
                        <Button 
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={() => verifyPaymentMutation.mutate(invoice._id)}
                          disabled={verifyPaymentMutation.isPending}
                        >
                          {verifyPaymentMutation.isPending ? 'Processing...' : 'Approve Payment'}
                        </Button>
                      </div>
                    </div>
                  )}

                  {invoice.status === 'PAID' && (
                    <div className="flex items-center gap-2 text-green-600 text-sm font-medium p-3 bg-green-50 rounded-md border border-green-200 mt-4">
                      <CheckCircle2 className="w-5 h-5" />
                      Payment Verified & Approved
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
