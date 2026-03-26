import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Link } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Eye, Filter } from 'lucide-react';
import { format } from 'date-fns';

interface Booking {
  _id: string;
  trackingId: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  deviceType: string;
  deviceBrand: string;
  deviceModel: string;
  currentStatus: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  'Pending Drop-off': 'bg-yellow-100 text-yellow-800',
  'Diagnosing': 'bg-blue-100 text-blue-800',
  'Waiting for Parts': 'bg-orange-100 text-orange-800',
  'In Progress': 'bg-indigo-100 text-indigo-800',
  'Ready for Pickup': 'bg-purple-100 text-purple-800',
  'Completed': 'bg-green-100 text-green-800',
  'Cancelled': 'bg-red-100 text-red-800',
};

export default function AdminBookings() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const { data: bookings, isLoading } = useQuery<Booking[]>({
    queryKey: ['admin-bookings'],
    queryFn: async () => {
      const res = await api.get('/admin/bookings');
      return res.data.data;
    },
  });

  const filteredBookings = bookings?.filter(booking => {
    const matchesSearch = 
      booking.trackingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.deviceModel.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || booking.currentStatus === statusFilter;

    return matchesSearch && matchesStatus;
  }) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Repair Bookings</h2>
          <p className="text-slate-500">Manage all customer repair requests.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-4 rounded-lg border shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            type="search"
            placeholder="Search tracking ID, customer, or model..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-slate-500" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Statuses</SelectItem>
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
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Tracking ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Device</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredBookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                  No bookings found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              filteredBookings.map((booking) => (
                <TableRow key={booking._id} className="hover:bg-slate-50">
                  <TableCell className="font-medium font-mono text-sm">
                    {booking.trackingId}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{booking.user.firstName} {booking.user.lastName}</p>
                      <p className="text-xs text-slate-500">{booking.user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{booking.deviceType}</Badge>
                      <span className="text-sm">{booking.deviceBrand} {booking.deviceModel}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={statusColors[booking.currentStatus] || 'bg-slate-100'}>
                      {booking.currentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-500 text-sm">
                    {format(new Date(booking.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link 
                      to={`/admin/bookings/${booking._id}`}
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 ghost"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
