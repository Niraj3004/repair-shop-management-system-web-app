import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import { api } from '@/lib/api';

interface PublicBooking {
  _id: string;
  trackingId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  deviceType: string;
  deviceModel: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export default function PublicBookings() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['adminPublicBookings', statusFilter],
    queryFn: async () => {
      const res = await api.get(`/admin/public-bookings${statusFilter !== 'all' ? `?status=${statusFilter}` : ''}`);
      return res.data.data as PublicBooking[];
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.put(`/admin/public-bookings/${id}/approve`);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['adminPublicBookings'] });
      toast.success(data.message || 'Booking approved successfully! Account credentials sent to user.');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to approve booking');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.put(`/admin/public-bookings/${id}/reject`);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['adminPublicBookings'] });
      toast.success(data.message || 'Booking rejected successfully.');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to reject booking');
    },
  });

  const filteredBookings = data?.filter((b) => 
    b.trackingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${b.firstName} ${b.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Public Booking Requests</h1>
          <p className="text-slate-500">Manage repair requests from unregistered guests.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
          <div className="flex items-center space-x-4 w-full">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search by ID, Name or Email..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : filteredBookings?.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              No public bookings found for the selected filter.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tracking ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings?.map((booking) => (
                    <TableRow key={booking._id}>
                      <TableCell className="font-medium text-blue-600">
                        {booking.trackingId}
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{booking.firstName} {booking.lastName}</p>
                        <p className="text-xs text-slate-500">{booking.email}</p>
                        <p className="text-xs text-slate-500">{booking.phone}</p>
                      </TableCell>
                      <TableCell>
                        {booking.deviceType} - {booking.deviceModel}
                      </TableCell>
                      <TableCell className="text-slate-500">
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            booking.status === 'approved' ? 'default' :
                            booking.status === 'rejected' ? 'destructive' : 'secondary'
                          }
                          className={booking.status === 'approved' ? 'bg-green-500' : ''}
                        >
                          {booking.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {booking.status === 'pending' && (
                          <div className="flex justify-end gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-green-600 border-green-200 hover:bg-green-50"
                              onClick={() => approveMutation.mutate(booking._id)}
                              disabled={approveMutation.isPending || rejectMutation.isPending}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => rejectMutation.mutate(booking._id)}
                              disabled={approveMutation.isPending || rejectMutation.isPending}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                        {booking.status !== 'pending' && (
                          <span className="text-xs text-slate-400">Resolved</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
