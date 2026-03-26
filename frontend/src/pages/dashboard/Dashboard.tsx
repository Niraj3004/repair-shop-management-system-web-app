import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Eye, AlertCircle, Wrench } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Booking {
  _id: string;
  trackingId: string;
  deviceType: string;
  deviceBrand: string;
  deviceModel: string;
  currentStatus: string;
  price?: number;
  createdAt: string;
}

export default function Dashboard() {
  const { data: bookingsData, isLoading, isError } = useQuery<Booking[]>({
    queryKey: ['my-bookings'],
    queryFn: async () => {
      const res = await api.get('/booking');
      return res.data.data;
    },
  });
  const bookings = bookingsData;

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200">Cancelled</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">Pending</Badge>;
      case 'repairing':
      case 'diagnosing':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My Repairs</h2>
          <p className="text-slate-500">Manage and track your device repair requests.</p>
        </div>
        <Link to="/dashboard/book-repair">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <PlusCircle className="w-4 h-4 mr-2" />
            Book Repair
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
          <CardDescription>A list of your recent repair requests and their current status.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-500">
              <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
              <p>Failed to load bookings. Please try again later.</p>
            </div>
          ) : !bookings || bookings.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wrench className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">No repairs yet</h3>
              <p className="text-slate-500 mb-6">You haven't booked any repairs with us yet.</p>
              <Link to="/dashboard/book-repair">
                <Button variant="outline">Book your first repair</Button>
              </Link>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking ID</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking._id}>
                      <TableCell className="font-medium">{booking.trackingId || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="font-medium">{booking.deviceBrand} {booking.deviceModel}</div>
                        <div className="text-xs text-slate-500 capitalize">{booking.deviceType}</div>
                      </TableCell>
                      <TableCell>{new Date(booking.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>{getStatusBadge(booking.currentStatus)}</TableCell>
                      <TableCell className="text-right">
                        {booking.price ? (
                          <span className="font-semibold">Rs. {booking.price}</span>
                        ) : (
                          <span className="text-slate-400">TBD</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link to={`/dashboard/repairs/${booking._id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                        </Link>
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
